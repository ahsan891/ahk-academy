import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const lessonId = searchParams.get("lessonId");
  const studentId = searchParams.get("studentId");

  const where: Record<string, string> = {};
  if (lessonId) where.lessonId = lessonId;
  if (studentId) where.studentId = studentId;

  const attendance = await db.attendance.findMany({
    where,
    include: { student: true, lesson: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(attendance);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { records, markedById } = body;

  // records: [{ studentId, lessonId, status }]
  const results = await Promise.all(
    records.map((record: { studentId: string; lessonId: string; status: string }) =>
      db.attendance.upsert({
        where: {
          studentId_lessonId: {
            studentId: record.studentId,
            lessonId: record.lessonId,
          },
        },
        update: { status: record.status as "PRESENT" | "ABSENT" | "LATE", markedById },
        create: {
          studentId: record.studentId,
          lessonId: record.lessonId,
          status: record.status as "PRESENT" | "ABSENT" | "LATE",
          markedById,
        },
      })
    )
  );

  return NextResponse.json(results, { status: 201 });
}
