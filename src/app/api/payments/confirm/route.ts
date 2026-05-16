import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { EmailService } from "@/lib/email";

/**
 * POST /api/payments/confirm
 * Admin confirms a pending IBAN/manual payment.
 * Body: { transactionId }
 * Sets status=CONFIRMED, confirmedBy=adminId, confirmedAt=now().
 * Sends email receipt to the student.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const { transactionId } = body;

  if (!transactionId) {
    return NextResponse.json({ error: "transactionId is required" }, { status: 400 });
  }

  // Find the transaction
  const transaction = await db.paymentTransaction.findUnique({
    where: { id: transactionId },
    include: {
      student: { select: { id: true, name: true, email: true } },
    },
  });

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  if (transaction.status === "CONFIRMED") {
    return NextResponse.json(
      { error: "Transaction is already confirmed" },
      { status: 400 }
    );
  }

  // Update transaction status
  const updated = await db.paymentTransaction.update({
    where: { id: transactionId },
    data: {
      status: "CONFIRMED",
      confirmedBy: session.user.id,
      confirmedAt: new Date(),
    },
    include: {
      student: { select: { id: true, name: true, email: true } },
    },
  });

  // Update payment plan credits if applicable
  if (updated.paymentPlanId) {
    const plan = await db.paymentPlan.findUnique({
      where: { id: updated.paymentPlanId },
    });
    if (plan && plan.creditsRemaining !== null) {
      // Add credits based on payment (1 credit per unit amount or custom logic)
      await db.paymentPlan.update({
        where: { id: plan.id },
        data: {
          creditsRemaining: plan.creditsRemaining + Math.floor(updated.amount),
        },
      });
    }
  }

  // Send email receipt to student
  try {
    await EmailService.sendPaymentReceipt(
      updated.student.email,
      updated.student.name,
      updated.amount,
      updated.method
    );
  } catch (error) {
    console.error("[PaymentConfirm] Failed to send receipt email:", error);
    // Don't fail the request if email fails
  }

  return NextResponse.json(updated);
}
