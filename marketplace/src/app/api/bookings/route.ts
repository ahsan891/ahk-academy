import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id, role } = session.user;

    const where =
      role === "TUTOR"
        ? { tutorId: id }
        : { studentId: id };

    const bookings = await db.mktBooking.findMany({
      where,
      include: {
        tutor: {
          select: { id: true, name: true, email: true },
        },
        student: {
          select: { id: true, name: true, email: true },
        },
        review: true,
      },
      orderBy: { scheduledAt: "desc" },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { tutorId, scheduledAt, durationMinutes, lessonType } =
      await req.json();

    if (!tutorId || !scheduledAt || !durationMinutes || !lessonType) {
      return NextResponse.json(
        { error: "Missing required fields: tutorId, scheduledAt, durationMinutes, lessonType" },
        { status: 400 }
      );
    }

    const tutorProfile = await db.tutorProfile.findFirst({
      where: { userId: tutorId, isApproved: true },
    });

    if (!tutorProfile) {
      return NextResponse.json(
        { error: "Tutor not found or not approved" },
        { status: 404 }
      );
    }

    const studentProfile = await db.studentMarketProfile.findFirst({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    const hourlyRate = tutorProfile.hourlyRate ?? 0;
    const priceCharged = (hourlyRate / 60) * durationMinutes;
    const platformFee = priceCharged * 0.2;
    const tutorEarnings = priceCharged - platformFee;

    if (studentProfile.creditsBalance < priceCharged) {
      return NextResponse.json(
        {
          error: "Insufficient credits",
          required: priceCharged,
          available: studentProfile.creditsBalance,
        },
        { status: 400 }
      );
    }

    const booking = await db.$transaction(async (tx) => {
      await tx.studentMarketProfile.update({
        where: { id: studentProfile.id },
        data: {
          creditsBalance: { decrement: priceCharged },
        },
      });

      const newBooking = await tx.mktBooking.create({
        data: {
          studentId: session.user.id,
          tutorId,
          lessonType,
          status: "SCHEDULED",
          scheduledAt: new Date(scheduledAt),
          durationMinutes,
          priceCharged,
          tutorEarnings,
          platformFee,
        },
        include: {
          tutor: { select: { id: true, name: true, email: true } },
          student: { select: { id: true, name: true, email: true } },
        },
      });

      return newBooking;
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Error creating booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
