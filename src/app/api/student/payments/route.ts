import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payments = await db.payment.findMany({
    where: { studentId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(payments);
}
