import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  if (!classId) {
    return NextResponse.json({ error: "classId required" }, { status: 400 });
  }

  const enrollments = await db.enrollment.findMany({
    where: { classId, status: "ACTIVE" },
    include: { student: true },
  });

  const students = enrollments.map((e) => ({
    id: e.student.id,
    name: e.student.name,
    email: e.student.email,
    phone: e.student.phone,
  }));

  return NextResponse.json(students);
}
