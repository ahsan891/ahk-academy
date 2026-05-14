import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get all classes the student is enrolled in
  const enrollments = await db.enrollment.findMany({
    where: { studentId: session.user.id, status: "ACTIVE" },
    select: { classId: true },
  });

  const classIds = enrollments.map((e) => e.classId);

  // Get all lessons for those classes
  const lessons = await db.lesson.findMany({
    where: { classId: { in: classIds } },
    orderBy: { order: "asc" },
    include: {
      attendances: {
        where: { studentId: session.user.id },
      },
    },
  });

  const result = lessons.map((lesson) => ({
    id: lesson.id,
    title: lesson.title,
    content: lesson.content,
    topics: lesson.topics,
    order: lesson.order,
    date: lesson.date,
    attended: lesson.attendances.length > 0 && lesson.attendances[0].status === "PRESENT",
  }));

  return NextResponse.json(result);
}
