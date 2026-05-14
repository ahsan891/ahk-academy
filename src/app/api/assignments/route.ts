import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");
  const studentId = searchParams.get("studentId");

  if (classId) {
    const assignments = await db.assignment.findMany({
      where: { classId },
      include: { _count: { select: { submissions: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(assignments);
  }

  if (studentId) {
    const enrollments = await db.enrollment.findMany({
      where: { studentId, status: "ACTIVE" },
      select: { classId: true },
    });
    const classIds = enrollments.map((e) => e.classId);

    const assignments = await db.assignment.findMany({
      where: { classId: { in: classIds } },
      include: {
        class: { include: { course: true } },
        submissions: { where: { studentId } },
      },
      orderBy: { dueDate: "asc" },
    });
    return NextResponse.json(assignments);
  }

  const assignments = await db.assignment.findMany({
    include: { class: true, _count: { select: { submissions: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(assignments);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { classId, title, description, dueDate } = body;

  const assignment = await db.assignment.create({
    data: {
      classId,
      title,
      description: description || null,
      dueDate: dueDate ? new Date(dueDate) : null,
    },
  });

  return NextResponse.json(assignment, { status: 201 });
}
