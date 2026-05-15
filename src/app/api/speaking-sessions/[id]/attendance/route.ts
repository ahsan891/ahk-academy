import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "STUDENT") {
    return NextResponse.json(
      { error: "Students cannot mark attendance" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await req.json();
  const { attendance } = body;

  if (!attendance || !Array.isArray(attendance)) {
    return NextResponse.json(
      { error: "attendance array is required" },
      { status: 400 }
    );
  }

  const speakingSession = await db.speakingSession.findUnique({
    where: { id },
  });

  if (!speakingSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const updates = attendance.map(
    (entry: { studentId: string; attended: boolean }) =>
      db.sessionParticipant.update({
        where: {
          sessionId_studentId: {
            sessionId: id,
            studentId: entry.studentId,
          },
        },
        data: {
          attended: entry.attended,
        },
      })
  );

  await Promise.all(updates);

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
