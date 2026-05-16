import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { EmailService } from "@/lib/email";

/**
 * POST /api/webhooks/stripe
 * Stripe webhook handler.
 * Verifies webhook signature (if STRIPE_WEBHOOK_SECRET is set).
 * On `payment_intent.succeeded`: finds transaction by stripePaymentId,
 * marks CONFIRMED, and sends receipt email.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // Verify webhook signature if secret is configured
  if (webhookSecret && signature) {
    const isValid = await verifyStripeSignature(body, signature, webhookSecret);
    if (!isValid) {
      console.error("[Stripe Webhook] Invalid signature");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Handle payment_intent.succeeded
  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const stripePaymentId = paymentIntent.id;
    const amountReceived = paymentIntent.amount_received / 100; // Stripe amounts are in cents

    // Find the matching transaction
    const transaction = await db.paymentTransaction.findFirst({
      where: { stripePaymentId },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
    });

    if (!transaction) {
      console.warn(
        `[Stripe Webhook] No transaction found for payment intent: ${stripePaymentId}`
      );
      // Still return 200 to prevent Stripe retries
      return NextResponse.json({ received: true, matched: false });
    }

    // Mark as confirmed
    const updated = await db.paymentTransaction.update({
      where: { id: transaction.id },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
        amount: amountReceived || transaction.amount,
      },
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
    });

    // Send receipt email
    try {
      await EmailService.sendPaymentReceipt(
        updated.student.email,
        updated.student.name,
        updated.amount,
        "Stripe"
      );
    } catch (error) {
      console.error("[Stripe Webhook] Failed to send receipt:", error);
    }

    return NextResponse.json({ received: true, matched: true, transactionId: updated.id });
  }

  // Handle payment_intent.payment_failed (optional logging)
  if (event.type === "payment_intent.payment_failed") {
    const paymentIntent = event.data.object;
    const stripePaymentId = paymentIntent.id;

    const transaction = await db.paymentTransaction.findFirst({
      where: { stripePaymentId },
    });

    if (transaction) {
      await db.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: "FAILED" },
      });
    }

    console.warn(`[Stripe Webhook] Payment failed: ${stripePaymentId}`);
    return NextResponse.json({ received: true, status: "failed" });
  }

  // Acknowledge other event types
  return NextResponse.json({ received: true });
}

/**
 * Verify Stripe webhook signature using HMAC-SHA256.
 * This is a simplified implementation; in production, use the Stripe SDK.
 */
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  try {
    // Parse the signature header
    const elements = signature.split(",");
    const timestampElement = elements.find((e) => e.startsWith("t="));
    const signatureElement = elements.find((e) => e.startsWith("v1="));

    if (!timestampElement || !signatureElement) return false;

    const timestamp = timestampElement.split("=")[1];
    const expectedSig = signatureElement.split("=")[1];

    // Create the signed payload
    const signedPayload = `${timestamp}.${payload}`;

    // Compute HMAC
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(signedPayload)
    );

    // Convert to hex
    const computedSig = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Constant-time comparison
    if (computedSig.length !== expectedSig.length) return false;
    let result = 0;
    for (let i = 0; i < computedSig.length; i++) {
      result |= computedSig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
    }
    return result === 0;
  } catch (error) {
    console.error("[Stripe] Signature verification error:", error);
    return false;
  }
}
