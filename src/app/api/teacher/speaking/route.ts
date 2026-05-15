import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      topic,
      topicDetails,
      date,
      duration,
      meetingLink,
      maxStudents,
      sourceLessonId,
      studentIds,
    } = body;

    if (!topic || !date) {
      return NextResponse.json(
        { error: "Topic and date are required" },
        { status: 400 }
      );
    }

    const speakingSession = await db.speakingSession.create({
      data: {
        topic,
        topicDetails: topicDetails || null,
        date: new Date(date),
        duration: duration || 90,
        meetingLink: meetingLink || null,
        maxStudents: maxStudents || 5,
        status: "scheduled",
        sourceType: sourceLessonId ? "teacher" : "system",
        sourceLessonId: sourceLessonId || null,
        createdById: session.user.id,
        participants: {
          create: (studentIds || []).map((studentId: string) => ({
            studentId,
          })),
        },
      },
    });

    return NextResponse.json(speakingSession, { status: 201 });
  } catch (error) {
    console.error("Failed to create speaking session:", error);
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
