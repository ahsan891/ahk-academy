import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const payments = await db.payment.findMany({
    orderBy: { createdAt: "desc" },
    include: { student: true },
  });
  return NextResponse.json(payments);
}

export async function POST(req: NextRequest) {
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
