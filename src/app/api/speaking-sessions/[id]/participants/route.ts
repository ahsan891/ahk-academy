import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "STUDENT") {
    return NextResponse.json({ error: "Students cannot add participants" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { studentIds } = body;

  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
    return NextResponse.json(
      { error: "studentIds array is required" },
      { status: 400 }
    );
  }

  const speakingSession = await db.speakingSession.findUnique({
    where: { id },
    include: { participants: true },
  });

  if (!speakingSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const currentCount = speakingSession.participants.length;
  const existingStudentIds = new Set(
    speakingSession.participants.map((p) => p.studentId)
  );
  const newStudentIds = studentIds.filter(
    (sid: string) => !existingStudentIds.has(sid)
  );

  if (currentCount + newStudentIds.length > speakingSession.maxStudents) {
    return NextResponse.json(
      {
        error: `Cannot exceed max students (${speakingSession.maxStudents}). Current: ${currentCount}, Attempting to add: ${newStudentIds.length}`,
      },
      { status: 400 }
    );
  }

  if (newStudentIds.length > 0) {
    await db.sessionParticipant.createMany({
      data: newStudentIds.map((studentId: string) => ({
        sessionId: id,
        studentId,
        attended: false,
      })),
    });
  }

  const updated = await db.speakingSession.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "STUDENT") {
    return NextResponse.json({ error: "Students cannot remove participants" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { studentId } = body;

  if (!studentId) {
    return NextResponse.json(
      { error: "studentId is required" },
      { status: 400 }
    );
  }

  const participant = await db.sessionParticipant.findUnique({
    where: {
      sessionId_studentId: {
        sessionId: id,
        studentId,
      },
    },
  });

  if (!participant) {
    return NextResponse.json(
      { error: "Participant not found in this session" },
      { status: 404 }
    );
  }

  await db.sessionParticipant.delete({
    where: {
      sessionId_studentId: {
        sessionId: id,
        studentId,
      },
    },
  });

  return NextResponse.json({ success: true });
}
