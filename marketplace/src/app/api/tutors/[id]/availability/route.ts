import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tutorProfile = await db.tutorProfile.findFirst({
      where: { userId: id },
    });

    if (!tutorProfile) {
      return NextResponse.json(
        { error: "Tutor not found" },
        { status: 404 }
      );
    }

    const availability = await db.tutorAvailability.findMany({
      where: { tutorProfileId: tutorProfile.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(availability);
  } catch (error) {
    console.error("Error fetching availability:", error);
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    if (session.user.id !== id) {
      return NextResponse.json(
        { error: "Forbidden: You can only update your own availability" },
        { status: 403 }
      );
    }

    const tutorProfile = await db.tutorProfile.findFirst({
      where: { userId: id },
    });

    if (!tutorProfile) {
      return NextResponse.json(
        { error: "Tutor profile not found" },
        { status: 404 }
      );
    }

    const { availability } = await req.json();

    if (!Array.isArray(availability)) {
      return NextResponse.json(
        { error: "availability must be an array" },
        { status: 400 }
      );
    }

    for (const slot of availability) {
      if (
        typeof slot.dayOfWeek !== "number" ||
        slot.dayOfWeek < 0 ||
        slot.dayOfWeek > 6
      ) {
        return NextResponse.json(
          { error: "dayOfWeek must be an integer between 0 and 6" },
          { status: 400 }
        );
      }
      if (!slot.startTime || !slot.endTime) {
        return NextResponse.json(
          { error: "Each slot must have startTime and endTime" },
          { status: 400 }
        );
      }
    }

    await db.$transaction(async (tx) => {
      await tx.tutorAvailability.deleteMany({
        where: { tutorProfileId: tutorProfile.id },
      });

      await tx.tutorAvailability.createMany({
        data: availability.map(
          (slot: { dayOfWeek: number; startTime: string; endTime: string }) => ({
            tutorProfileId: tutorProfile.id,
            dayOfWeek: slot.dayOfWeek,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isRecurring: true,
          })
        ),
      });
    });

    const updated = await db.tutorAvailability.findMany({
      where: { tutorProfileId: tutorProfile.id },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating availability:", error);
    return NextResponse.json(
      { error: "Failed to update availability" },
      { status: 500 }
    );
  }
}
