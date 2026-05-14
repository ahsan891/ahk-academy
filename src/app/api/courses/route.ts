import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const courses = await db.course.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { classes: true } } },
  });
  return NextResponse.json(courses);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, level, price } = body;

  const course = await db.course.create({
    data: {
      title,
      description: description || null,
      level: level || "Beginner",
      price: price || 0,
    },
  });

  return NextResponse.json(course, { status: 201 });
}
