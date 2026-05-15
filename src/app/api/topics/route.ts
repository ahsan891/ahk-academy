import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const level = searchParams.get("level");

  const where: Record<string, unknown> = {};

  if (category && category !== "all") {
    where.category = category;
  }

  if (level && level !== "all") {
    where.level = level;
  }

  const topics = await db.topic.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return NextResponse.json(topics);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "STUDENT") {
    return NextResponse.json(
      { error: "Students cannot create topics" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const { title, description, category, level, preparationTips, isSystemGenerated } = body;

  if (!title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 });
  }

  const topic = await db.topic.create({
    data: {
      title,
      description: description || null,
      category: category || null,
      level: level || "intermediate",
      preparationTips: preparationTips || null,
      isSystemGenerated: isSystemGenerated || false,
      createdById: session.user.id,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return NextResponse.json(topic, { status: 201 });
}
