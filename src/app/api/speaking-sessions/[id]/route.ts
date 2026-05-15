import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const speakingSession = await db.speakingSession.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      transcript: true,
      analyses: {
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      createdBy: {
        select: { id: true, name: true, email: true },
      },
      sourceLesson: true,
    },
  });

  if (!speakingSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json(speakingSession);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const existing = await db.speakingSession.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.user.role !== "ADMIN" && existing.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { topic, topicDetails, date, duration, status: newStatus, meetingLink, maxStudents, topicId } = body;

  const updated = await db.speakingSession.update({
    where: { id },
    data: {
      ...(topic !== undefined && { topic }),
      ...(topicDetails !== undefined && { topicDetails }),
      ...(date !== undefined && { date: new Date(date) }),
      ...(duration !== undefined && { duration }),
      ...(newStatus !== undefined && { status: newStatus }),
      ...(meetingLink !== undefined && { meetingLink }),
      ...(maxStudents !== undefined && { maxStudents }),
      ...(topicId !== undefined && { topicId }),
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

  const { id } = await params;

  const existing = await db.speakingSession.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  if (session.user.role !== "ADMIN" && existing.createdById !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await db.speakingSession.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
