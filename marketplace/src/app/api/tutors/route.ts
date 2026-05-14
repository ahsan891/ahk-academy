import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = searchParams.get("query");
    const specialty = searchParams.get("specialty");
    const accent = searchParams.get("accent");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const instant = searchParams.get("instant");

    const where: any = { isApproved: true };

    if (specialty) {
      where.specialties = { contains: specialty };
    }

    if (accent) {
      where.accent = accent;
    }

    if (instant === "true") {
      where.isAvailableInstantly = true;
    }

    if (minPrice || maxPrice) {
      where.hourlyRate = {};
      if (minPrice) where.hourlyRate.gte = parseFloat(minPrice);
      if (maxPrice) where.hourlyRate.lte = parseFloat(maxPrice);
    }

    const tutors = await db.tutorProfile.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        availability: true,
      },
      orderBy: [{ averageRating: "desc" }, { totalLessons: "desc" }],
    });

    const filtered = query
      ? tutors.filter((t) =>
          t.user.name?.toLowerCase().includes(query.toLowerCase())
        )
      : tutors;

    return NextResponse.json(filtered);
  } catch (error) {
    console.error("Error fetching tutors:", error);
    return NextResponse.json(
      { error: "Failed to fetch tutors" },
      { status: 500 }
    );
  }
}
