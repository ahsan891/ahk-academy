import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const where: Record<string, unknown> = {};

  if (status) {
    where.status = status;
  }

  if (session.user.role === "TEACHER") {
    where.createdById = session.user.id;
  } else if (session.user.role === "STUDENT") {
    where.participants = {
      some: { studentId: session.user.id },
    };
  }
  // ADMIN gets all sessions (no additional filter)

  const sessions = await db.speakingSession.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      participants: {
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      transcript: true,
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return NextResponse.json(sessions);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "STUDENT") {
    return NextResponse.json({ error: "Students cannot create sessions" }, { status: 403 });
  }

  const body = await req.json();
  const {
    topic,
    topicDetails,
    date,
    duration,
    meetingLink,
    maxStudents,
    sourceType,
    sourceLessonId,
    topicId,
    participantIds,
  } = body;

  if (!topic || !date) {
    return NextResponse.json(
      { error: "topic and date are required" },
      { status: 400 }
    );
  }

  const speakingSession = await db.speakingSession.create({
    data: {
      topic,
      topicDetails: topicDetails || null,
      date: new Date(date),
      duration: duration || 90,
      status: "scheduled",
      meetingLink: meetingLink || null,
      maxStudents: maxStudents || 5,
      sourceType: sourceType || "system",
      sourceLessonId: sourceLessonId || null,
      topicId: topicId || null,
      createdById: session.user.id,
      ...(participantIds && participantIds.length > 0
        ? {
            participants: {
              create: participantIds.map((studentId: string) => ({
                studentId,
                attended: false,
              })),
            },
          }
        : {}),
    },
    include: {
      participants: {
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return NextResponse.json(speakingSession, { status: 201 });
}
