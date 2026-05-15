import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let profile = await db.studentSpeakingProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Auto-create profile if it doesn't exist
  if (!profile) {
    profile = await db.studentSpeakingProfile.create({
      data: {
        userId: session.user.id,
        track: "speaking_only",
        level: "intermediate",
        totalSessions: 0,
        averageRating: 0,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  }

  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { track, level, preferredTopics, availability } = body;

  // Upsert the profile
  const profile = await db.studentSpeakingProfile.upsert({
    where: { userId: session.user.id },
    update: {
      ...(track !== undefined && { track }),
      ...(level !== undefined && { level }),
      ...(preferredTopics !== undefined && { preferredTopics }),
      ...(availability !== undefined && { availability }),
    },
    create: {
      userId: session.user.id,
      track: track || "speaking_only",
      level: level || "intermediate",
      preferredTopics: preferredTopics || null,
      availability: availability || null,
      totalSessions: 0,
      averageRating: 0,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return NextResponse.json(profile);
}
