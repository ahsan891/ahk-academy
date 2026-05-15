import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await req.json();
    const { content } = body;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { error: "Transcript content is required" },
        { status: 400 }
      );
    }

    // Check if session exists
    const speakingSession = await db.speakingSession.findUnique({
      where: { id },
      select: { id: true, transcript: { select: { id: true } } },
    });

    if (!speakingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    // If transcript already exists, update it
    if (speakingSession.transcript) {
      const transcript = await db.sessionTranscript.update({
        where: { sessionId: id },
        data: { content, analyzedAt: null },
      });
      return NextResponse.json(transcript);
    }

    // Create new transcript
    const transcript = await db.sessionTranscript.create({
      data: {
        sessionId: id,
        content,
        uploadedById: session.user.id,
      },
    });

    return NextResponse.json(transcript, { status: 201 });
  } catch (error) {
    console.error("Failed to upload transcript:", error);
    return NextResponse.json(
      { error: "Failed to upload transcript" },
      { status: 500 }
    );
  }
}
