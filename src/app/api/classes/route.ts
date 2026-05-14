import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const classes = await db.class.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      course: true,
      teacher: true,
      _count: { select: { enrollments: true } },
    },
  });
  return NextResponse.json(classes);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, courseId, teacherId, schedule, maxStudents, meetingLink } = body;

  const newClass = await db.class.create({
    data: {
      name,
      courseId,
      teacherId,
      schedule: schedule || null,
      maxStudents: maxStudents || 30,
      meetingLink: meetingLink || null,
    },
  });

  return NextResponse.json(newClass, { status: 201 });
}
