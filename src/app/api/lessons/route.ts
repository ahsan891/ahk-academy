import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  if (!classId) {
    return NextResponse.json({ error: "classId required" }, { status: 400 });
  }

  const lessons = await db.lesson.findMany({
    where: { classId },
    orderBy: { order: "asc" },
    include: {
      _count: { select: { attendances: true } },
    },
  });

  return NextResponse.json(lessons);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { classId, title, content, topics, videoUrl, date } = body;

  const lastLesson = await db.lesson.findFirst({
    where: { classId },
    orderBy: { order: "desc" },
  });

  const lesson = await db.lesson.create({
    data: {
      classId,
      title,
      content: content || null,
      topics: topics || null,
      videoUrl: videoUrl || null,
      order: (lastLesson?.order || 0) + 1,
      date: date ? new Date(date) : null,
    },
  });

  return NextResponse.json(lesson, { status: 201 });
}
