import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "TEACHER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  if (!classId) {
    return NextResponse.json({ error: "classId required" }, { status: 400 });
  }

  // If teacher, verify they own the class
  if (session.user.role === "TEACHER") {
    const classRecord = await db.class.findUnique({
      where: { id: classId },
      select: { teacherId: true },
    });
    if (!classRecord || classRecord.teacherId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
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
