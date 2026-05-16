import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { WhatsAppService } from "@/lib/whatsapp";
import { generateUniqueReferenceCode } from "@/lib/payment-utils";

/**
 * POST /api/webhooks/papara
 * Papara payment webhook handler.
 * Receives payment notifications with amount and sender reference.
 * Tries to match by referenceCode in the payment description.
 * If matched: creates/updates PaymentTransaction with status CONFIRMED.
 * Sends WhatsApp receipt to the student.
 */
export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const {
    amount,
    description,
    senderName,
    transactionId: paparaTransactionId,
    createdAt,
  } = body;

  if (!amount) {
    return NextResponse.json({ error: "amount is required" }, { status: 400 });
  }

  console.log(
    `[Papara Webhook] Received payment: ${amount} from ${senderName || "unknown"}, description: "${description || "none"}"`
  );

  // Try to extract AHK reference code from the description
  // Format: "AHK-XXXX" anywhere in the description
  const refMatch = description?.match(/AHK-[A-Z0-9]{4}/i);
  const referenceCode = refMatch ? refMatch[0].toUpperCase() : null;

  let matchedStudent = null;
  let matchedTransaction = null;

  if (referenceCode) {
    // Try to find a pending transaction with this reference code
    matchedTransaction = await db.paymentTransaction.findFirst({
      where: {
        referenceCode,
        status: "PENDING",
      },
      include: {
        student: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    // If no pending transaction, try to find user by their personal reference code
    if (!matchedTransaction) {
      matchedStudent = await db.user.findFirst({
        where: { referenceCode },
        select: { id: true, name: true, email: true, phone: true },
      });
    }
  }

  // Case 1: Matched an existing pending transaction
  if (matchedTransaction) {
    const updated = await db.paymentTransaction.update({
      where: { id: matchedTransaction.id },
      data: {
        status: "CONFIRMED",
        confirmedAt: new Date(),
        paparaTransactionId: paparaTransactionId || null,
        amount: parseFloat(amount),
      },
      include: {
        student: { select: { id: true, name: true, email: true, phone: true } },
      },
    });

    // Send WhatsApp receipt
    if (updated.student.phone) {
      try {
        await WhatsAppService.sendText(
          updated.student.phone,
          `Hi ${updated.student.name}! Your payment of ${amount} TRY has been confirmed via Papara. Reference: ${referenceCode}. Thank you!`
        );
      } catch (error) {
        console.error("[Papara Webhook] Failed to send WhatsApp receipt:", error);
      }
    }

    return NextResponse.json({
      received: true,
      matched: true,
      transactionId: updated.id,
      studentName: updated.student.name,
    });
  }

  // Case 2: Matched a student by their personal reference code - create new transaction
  if (matchedStudent) {
    const newRefCode = await generateUniqueReferenceCode(async (code) => {
      const existing = await db.paymentTransaction.findUnique({
        where: { referenceCode: code },
      });
      return !!existing;
    });

    // Find active payment plan
    const activePlan = await db.paymentPlan.findFirst({
      where: { studentId: matchedStudent.id, isActive: true },
    });

    const transaction = await db.paymentTransaction.create({
      data: {
        studentId: matchedStudent.id,
        paymentPlanId: activePlan?.id || null,
        amount: parseFloat(amount),
        currency: "TRY",
        method: "PAPARA",
        status: "CONFIRMED",
        referenceCode: newRefCode,
        confirmedAt: new Date(),
        paparaTransactionId: paparaTransactionId || null,
        description: `Papara payment from ${senderName || "unknown"} - ${description || "no description"}`,
      },
    });

    // Send WhatsApp receipt
    if (matchedStudent.phone) {
      try {
        await WhatsAppService.sendText(
          matchedStudent.phone,
          `Hi ${matchedStudent.name}! Your Papara payment of ${amount} TRY has been received and confirmed. Thank you!`
        );
      } catch (error) {
        console.error("[Papara Webhook] Failed to send WhatsApp receipt:", error);
      }
    }

    return NextResponse.json({
      received: true,
      matched: true,
      transactionId: transaction.id,
      studentName: matchedStudent.name,
      autoCreated: true,
    });
  }

  // Case 3: Could not match the payment to any student
  console.warn(
    `[Papara Webhook] Unmatched payment: ${amount} TRY, description: "${description}", sender: ${senderName}`
  );

  return NextResponse.json({
    received: true,
    matched: false,
    message: "Payment received but could not be matched to a student. Manual review needed.",
    paymentDetails: {
      amount,
      description,
      senderName,
      paparaTransactionId,
      receivedAt: createdAt || new Date().toISOString(),
    },
  });
}
