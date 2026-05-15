import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const topics = await db.topic.findMany({
    where: { createdById: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(topics);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, category, level, preparationTips } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const topic = await db.topic.create({
      data: {
        title,
        description: description || null,
        category: category || null,
        level: level || "intermediate",
        preparationTips: preparationTips || null,
        isSystemGenerated: false,
        createdById: session.user.id,
      },
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.error("Failed to create topic:", error);
    return NextResponse.json(
      { error: "Failed to create topic" },
      { status: 500 }
    );
  }
}
