import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payments = await db.payment.findMany({
    where: session.user.role === "STUDENT" ? { studentId: session.user.id } : undefined,
    orderBy: { createdAt: "desc" },
    include: { student: true },
  });
  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const { studentId, amount, paidAmount, dueDate, method, description } = body;

  const payment = await db.payment.create({
    data: {
      studentId,
      amount,
      paidAmount: paidAmount || 0,
      dueDate: dueDate ? new Date(dueDate) : null,
      status: paidAmount >= amount ? "PAID" : paidAmount > 0 ? "PARTIAL" : "UNPAID",
      method: method || null,
      description: description || null,
    },
  });

  return NextResponse.json(payment, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  const body = await req.json();
  const { id, paidAmount, method } = body;

  const payment = await db.payment.findUnique({ where: { id } });
  if (!payment) {
    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  }

  const newPaidAmount = payment.paidAmount + paidAmount;
  const status = newPaidAmount >= payment.amount ? "PAID" : "PARTIAL";

  const updated = await db.payment.update({
    where: { id },
    data: {
      paidAmount: newPaidAmount,
      status,
      method: method || payment.method,
    },
  });

  return NextResponse.json(updated);
}
