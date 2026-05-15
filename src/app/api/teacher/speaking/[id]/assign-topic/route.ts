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
    const { topic } = body;

    if (!topic || !topic.trim()) {
      return NextResponse.json(
        { error: "Topic is required" },
        { status: 400 }
      );
    }

    // Verify session exists and belongs to teacher
    const speakingSession = await db.speakingSession.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!speakingSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (speakingSession.createdById !== session.user.id) {
      return NextResponse.json(
        { error: "You can only update your own sessions" },
        { status: 403 }
      );
    }

    const updated = await db.speakingSession.update({
      where: { id },
      data: { topic },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to assign topic:", error);
    return NextResponse.json(
      { error: "Failed to assign topic" },
      { status: 500 }
    );
  }
}
