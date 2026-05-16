import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Fireflies webhook payload
    const {
      transcript_id,
      title,
      transcript_text,
      date,
      duration,
      participants,
    } = body;

    if (!transcript_text) {
      return NextResponse.json(
        { error: "No transcript text provided" },
        { status: 400 }
      );
    }

    // Try to find a matching session by title or date
    // Fireflies titles typically include the meeting name and date
    let session = null;

    if (title) {
      // Try to match by topic in the title
      session = await db.speakingSession.findFirst({
        where: {
          OR: [
            { topic: { contains: title.split(" - ")[0] } },
            {
              date: date
                ? {
                    gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
                    lte: new Date(new Date(date).setHours(23, 59, 59, 999)),
                  }
                : undefined,
            },
          ],
        },
        orderBy: { date: "desc" },
      });
    }

    if (!session) {
      // If no matching session, try to find the most recent session without a transcript
      session = await db.speakingSession.findFirst({
        where: {
          transcript: null,
          status: "completed",
        },
        orderBy: { date: "desc" },
      });
    }

    if (!session) {
      // Still no match - store as orphaned transcript for manual matching
      // Use the first admin user as uploader
      const admin = await db.user.findFirst({ where: { role: "ADMIN" } });
      if (!admin) {
        return NextResponse.json(
          { error: "No admin user found to assign transcript" },
          { status: 500 }
        );
      }

      // Create a session placeholder
      session = await db.speakingSession.create({
        data: {
          topic: title || "Fireflies Import - Unmatched",
          date: date ? new Date(date) : new Date(),
          duration: duration || 90,
          status: "completed",
          createdById: admin.id,
          sourceType: "fireflies",
        },
      });
    }

    // Check if transcript already exists for this session
    const existingTranscript = await db.sessionTranscript.findUnique({
      where: { sessionId: session.id },
    });

    if (existingTranscript) {
      // Update existing transcript
      await db.sessionTranscript.update({
        where: { id: existingTranscript.id },
        data: {
          content: transcript_text,
          fileUrl: transcript_id ? `fireflies://${transcript_id}` : null,
        },
      });

      return NextResponse.json({
        status: "updated",
        sessionId: session.id,
        transcriptId: existingTranscript.id,
      });
    }

    // Find uploader (admin or session creator)
    const uploaderId = session.createdById;

    // Create new transcript
    const transcript = await db.sessionTranscript.create({
      data: {
        sessionId: session.id,
        content: transcript_text,
        fileUrl: transcript_id ? `fireflies://${transcript_id}` : null,
        uploadedById: uploaderId,
      },
    });

    return NextResponse.json({
      status: "created",
      sessionId: session.id,
      transcriptId: transcript.id,
      matchedByTitle: !!title,
    });
  } catch (error) {
    console.error("[Fireflies Webhook] Error:", error);
    // Return 200 to prevent webhook retries
    return NextResponse.json({ status: "error", message: "Internal error" }, { status: 200 });
  }
}
