import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { studentId, classId } = body;

  const enrollment = await db.enrollment.upsert({
    where: { studentId_classId: { studentId, classId } },
    update: { status: "ACTIVE" },
    create: { studentId, classId, status: "ACTIVE" },
  });

  return NextResponse.json(enrollment, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const classId = searchParams.get("classId");

  if (!studentId || !classId) {
    return NextResponse.json({ error: "studentId and classId required" }, { status: 400 });
  }

  await db.enrollment.delete({
    where: { studentId_classId: { studentId, classId } },
  });

  return NextResponse.json({ success: true });
}
