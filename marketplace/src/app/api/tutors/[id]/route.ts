import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const tutorProfile = await db.tutorProfile.findFirst({
      where: { userId: id, isApproved: true },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        availability: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });

    if (!tutorProfile) {
      return NextResponse.json(
        { error: "Tutor not found" },
        { status: 404 }
      );
    }

    const reviews = await db.review.findMany({
      where: { tutorId: tutorProfile.id, isPublic: true },
      include: {
        student: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({
      ...tutorProfile,
      reviews,
    });
  } catch (error) {
    console.error("Error fetching tutor:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutor" },
      { status: 500 }
    );
  }
}
