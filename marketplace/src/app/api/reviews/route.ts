import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { bookingId, rating, comment } = await req.json();

    if (!bookingId || !rating) {
      return NextResponse.json(
        { error: "Missing required fields: bookingId, rating" },
        { status: 400 }
      );
    }

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    const booking = await db.mktBooking.findUnique({
      where: { id: bookingId },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    if (booking.studentId !== session.user.id) {
      return NextResponse.json(
        { error: "Only the student of this booking can leave a review" },
        { status: 403 }
      );
    }

    if (booking.status !== "COMPLETED") {
      return NextResponse.json(
        { error: "Can only review completed bookings" },
        { status: 400 }
      );
    }

    const existingReview = await db.review.findFirst({
      where: { bookingId },
    });

    if (existingReview) {
      return NextResponse.json(
        { error: "A review already exists for this booking" },
        { status: 400 }
      );
    }

    const tutorProfile = await db.tutorProfile.findFirst({
      where: { userId: booking.tutorId },
    });

    if (!tutorProfile) {
      return NextResponse.json(
        { error: "Tutor profile not found" },
        { status: 404 }
      );
    }

    const review = await db.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          bookingId,
          studentId: session.user.id,
          tutorId: booking.tutorId,
          rating: Math.round(rating),
          comment: comment || null,
          isPublic: true,
        },
      });

      const allReviews = await tx.review.findMany({
        where: { tutorId: booking.tutorId },
        select: { rating: true },
      });

      const avgRating =
        allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

      await tx.tutorProfile.update({
        where: { id: tutorProfile.id },
        data: { averageRating: Math.round(avgRating * 100) / 100 },
      });

      return newReview;
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
