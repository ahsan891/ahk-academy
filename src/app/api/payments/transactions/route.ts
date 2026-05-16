import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateUniqueReferenceCode } from "@/lib/payment-utils";

/**
 * GET /api/payments/transactions
 * List payment transactions with optional filters.
 * Query params: ?studentId=xxx&status=PENDING|CONFIRMED
 * Role-based access:
 * - ADMIN: sees all transactions
 * - STUDENT: sees only their own
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, role } = session.user;
  const { searchParams } = new URL(req.url);
  const studentIdFilter = searchParams.get("studentId");
  const statusFilter = searchParams.get("status");

  // Build where clause
  const where: Record<string, unknown> = {};

  if (role === "STUDENT") {
    where.studentId = id;
  } else if (role === "ADMIN" && studentIdFilter) {
    where.studentId = studentIdFilter;
  }

  if (statusFilter) {
    where.status = statusFilter;
  }

  const transactions = await db.paymentTransaction.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      student: { select: { id: true, name: true, email: true, referenceCode: true } },
      paymentPlan: { select: { id: true, planType: true, amount: true } },
    },
  });

  return NextResponse.json(transactions);
}

/**
 * POST /api/payments/transactions
 * Create a new payment transaction (ADMIN only).
 * Body: { studentId, amount, method, description?, sessionId? }
 * Auto-generates a unique referenceCode for the transaction.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const { studentId, amount, method, description, sessionId } = body;

  if (!studentId || !amount || !method) {
    return NextResponse.json(
      { error: "studentId, amount, and method are required" },
      { status: 400 }
    );
  }

  // Verify student exists
  const student = await db.user.findUnique({ where: { id: studentId } });
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Generate unique reference code
  const referenceCode = await generateUniqueReferenceCode(async (code) => {
    const existing = await db.paymentTransaction.findUnique({
      where: { referenceCode: code },
    });
    return !!existing;
  });

  // Find active payment plan for this student (if any)
  const activePlan = await db.paymentPlan.findFirst({
    where: { studentId, isActive: true },
  });

  const transaction = await db.paymentTransaction.create({
    data: {
      studentId,
      paymentPlanId: activePlan?.id || null,
      amount: parseFloat(amount),
      currency: activePlan?.currency || "USD",
      method: method.toUpperCase(),
      status: "PENDING",
      referenceCode,
      sessionId: sessionId || null,
      description: description || null,
    },
    include: {
      student: { select: { id: true, name: true, email: true, referenceCode: true } },
    },
  });

  return NextResponse.json(transaction, { status: 201 });
}
