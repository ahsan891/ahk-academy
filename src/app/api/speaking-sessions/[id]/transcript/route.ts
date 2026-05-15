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
    return NextResponse.json(
      { error: "Students cannot upload transcripts" },
      { status: 403 }
    );
  }

  const { id } = await params;
  const body = await req.json();
  const { content, fileUrl } = body;

  if (!content) {
    return NextResponse.json(
      { error: "content is required" },
      { status: 400 }
    );
  }

  const speakingSession = await db.speakingSession.findUnique({
    where: { id },
  });

  if (!speakingSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  // Check if transcript already exists
  const existing = await db.sessionTranscript.findUnique({
    where: { sessionId: id },
  });

  if (existing) {
    // Update existing transcript
    const updated = await db.sessionTranscript.update({
      where: { sessionId: id },
      data: {
        content,
        fileUrl: fileUrl || null,
        uploadedById: session.user.id,
        analyzedAt: null, // Reset analysis status when transcript is updated
      },
    });
    return NextResponse.json(updated);
  }

  const transcript = await db.sessionTranscript.create({
    data: {
      sessionId: id,
      content,
      fileUrl: fileUrl || null,
      uploadedById: session.user.id,
    },
  });

  return NextResponse.json(transcript, { status: 201 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const transcript = await db.sessionTranscript.findUnique({
    where: { sessionId: id },
    include: {
      uploadedBy: {
        select: { id: true, name: true, email: true },
      },
      analyses: {
        include: {
          student: {
            select: { id: true, name: true, email: true },
          },
        },
      },
    },
  });

  if (!transcript) {
    return NextResponse.json(
      { error: "Transcript not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(transcript);
}
