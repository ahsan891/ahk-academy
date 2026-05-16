import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateReferenceCode } from "@/lib/payment-utils";

/**
 * GET /api/payments/plans
 * List payment plans. Role-based access:
 * - ADMIN: sees all plans
 * - TEACHER: sees plans for their assigned students
 * - STUDENT: sees only their own plan(s)
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, role } = session.user;

  let plans;

  if (role === "ADMIN") {
    plans = await db.paymentPlan.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, name: true, email: true, referenceCode: true } },
        transactions: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
  } else if (role === "TEACHER") {
    // Get students assigned to this teacher
    const assignedStudents = await db.studentProfile.findMany({
      where: { teacherId: id },
      select: { userId: true },
    });
    const studentIds = assignedStudents.map((s) => s.userId);

    plans = await db.paymentPlan.findMany({
      where: { studentId: { in: studentIds } },
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, name: true, email: true, referenceCode: true } },
        transactions: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
  } else {
    // STUDENT: own plans only
    plans = await db.paymentPlan.findMany({
      where: { studentId: id },
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { id: true, name: true, email: true, referenceCode: true } },
        transactions: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    });
  }

  return NextResponse.json(plans);
}

/**
 * POST /api/payments/plans
 * Create a new payment plan (ADMIN only).
 * Body: { studentId, planType, amount, currency?, billingCycleDay?, notes? }
 * Auto-generates a referenceCode for the student if they don't have one.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const { studentId, planType, amount, currency, billingCycleDay, notes } = body;

  if (!studentId || !planType || !amount) {
    return NextResponse.json(
      { error: "studentId, planType, and amount are required" },
      { status: 400 }
    );
  }

  // Verify student exists
  const student = await db.user.findUnique({ where: { id: studentId } });
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  // Auto-generate referenceCode for student if they don't have one
  if (!student.referenceCode) {
    let refCode = generateReferenceCode();
    // Ensure uniqueness
    let existing = await db.user.findUnique({ where: { referenceCode: refCode } });
    while (existing) {
      refCode = generateReferenceCode();
      existing = await db.user.findUnique({ where: { referenceCode: refCode } });
    }
    await db.user.update({
      where: { id: studentId },
      data: { referenceCode: refCode },
    });
  }

  // Calculate next due date based on billing cycle day
  let nextDueDate: Date | null = null;
  if (billingCycleDay) {
    const now = new Date();
    const currentDay = now.getDate();
    const year = now.getFullYear();
    const month = now.getMonth();
    nextDueDate =
      currentDay < billingCycleDay
        ? new Date(year, month, billingCycleDay)
        : new Date(year, month + 1, billingCycleDay);
  }

  const plan = await db.paymentPlan.create({
    data: {
      studentId,
      planType,
      amount: parseFloat(amount),
      currency: currency || "USD",
      billingCycleDay: billingCycleDay ? parseInt(billingCycleDay) : null,
      nextDueDate,
      notes: notes || null,
      isActive: true,
    },
    include: {
      student: { select: { id: true, name: true, email: true, referenceCode: true } },
    },
  });

  return NextResponse.json(plan, { status: 201 });
}
