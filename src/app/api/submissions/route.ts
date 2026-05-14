import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const assignmentId = searchParams.get("assignmentId");
  const studentId = searchParams.get("studentId");

  const where: Record<string, string> = {};
  if (assignmentId) where.assignmentId = assignmentId;
  if (studentId) where.studentId = studentId;

  const submissions = await db.submission.findMany({
    where,
    include: { student: true, assignment: { include: { class: true } } },
    orderBy: { submittedAt: "desc" },
  });

  return NextResponse.json(submissions);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { assignmentId, studentId, content } = body;

  const submission = await db.submission.upsert({
    where: { assignmentId_studentId: { assignmentId, studentId } },
    update: { content, submittedAt: new Date() },
    create: {
      assignmentId,
      studentId,
      content: content || null,
    },
  });

  return NextResponse.json(submission, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, grade, feedback } = body;

  const submission = await db.submission.update({
    where: { id },
    data: {
      grade,
      feedback: feedback || null,
      gradedAt: new Date(),
    },
  });

  return NextResponse.json(submission);
}
