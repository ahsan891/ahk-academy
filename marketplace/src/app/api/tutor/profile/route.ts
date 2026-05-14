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

    const tutorProfile = await db.tutorProfile.findFirst({
      where: { userId: session.user.id },
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
        { error: "Tutor profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(tutorProfile);
  } catch (error) {
    console.error("Error fetching tutor profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutor profile" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const tutorProfile = await db.tutorProfile.findFirst({
      where: { userId: session.user.id },
    });

    if (!tutorProfile) {
      return NextResponse.json(
        { error: "Tutor profile not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const allowedFields = [
      "bio",
      "hourlyRate",
      "specialties",
      "accent",
      "education",
      "certifications",
      "yearsExperience",
      "country",
      "introVideoUrl",
      "isAvailableInstantly",
      "teachingLanguages",
    ];

    const updateData: Record<string, any> = {};

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    const updated = await db.tutorProfile.update({
      where: { id: tutorProfile.id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        availability: {
          orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating tutor profile:", error);
    return NextResponse.json(
      { error: "Failed to update tutor profile" },
      { status: 500 }
    );
  }
}
