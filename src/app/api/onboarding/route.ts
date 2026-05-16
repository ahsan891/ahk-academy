import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { type } = body;

  if (!type || (type !== "student" && type !== "teacher")) {
    return NextResponse.json(
      { error: "type must be 'student' or 'teacher'" },
      { status: 400 }
    );
  }

  try {
    if (type === "student") {
      const {
        timezone,
        country,
        language,
        trackType,
        level,
        availableSlots,
        preferredTopics,
        internationalPreference,
      } = body;

      if (!timezone || !country || !language || !trackType || !level) {
        return NextResponse.json(
          { error: "Missing required fields: timezone, country, language, trackType, level" },
          { status: 400 }
        );
      }

      // Check if profile already exists
      const existing = await db.studentProfile.findUnique({
        where: { userId: session.user.id },
      });

      if (existing) {
        // Update existing profile
        await db.studentProfile.update({
          where: { userId: session.user.id },
          data: {
            trackType,
            level,
            availableSlots: availableSlots || null,
            preferredTopics: preferredTopics || null,
            internationalPreference: internationalPreference ?? true,
          },
        });
      } else {
        // Create new profile
        await db.studentProfile.create({
          data: {
            userId: session.user.id,
            trackType,
            level,
            availableSlots: availableSlots || null,
            preferredTopics: preferredTopics || null,
            internationalPreference: internationalPreference ?? true,
            isActive: true,
          },
        });
      }

      // Update User fields
      await db.user.update({
        where: { id: session.user.id },
        data: {
          timezone,
          country,
          language,
        },
      });

      return NextResponse.json({ success: true, type: "student" });
    }

    if (type === "teacher") {
      const { timezone, country, specializations, bio } = body;

      if (!timezone || !country) {
        return NextResponse.json(
          { error: "Missing required fields: timezone, country" },
          { status: 400 }
        );
      }

      // Check if profile already exists
      const existing = await db.teacherProfile2.findUnique({
        where: { userId: session.user.id },
      });

      if (existing) {
        // Update existing profile
        await db.teacherProfile2.update({
          where: { userId: session.user.id },
          data: {
            specializations: specializations || null,
            bio: bio || null,
          },
        });
      } else {
        // Create new profile
        await db.teacherProfile2.create({
          data: {
            userId: session.user.id,
            specializations: specializations || null,
            bio: bio || null,
            isActive: true,
          },
        });
      }

      // Update User fields
      await db.user.update({
        where: { id: session.user.id },
        data: {
          timezone,
          country,
        },
      });

      return NextResponse.json({ success: true, type: "teacher" });
    }
  } catch (error) {
    console.error("[Onboarding] Error:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding data" },
      { status: 500 }
    );
  }
}
