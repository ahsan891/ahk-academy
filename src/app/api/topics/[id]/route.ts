import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "STUDENT") {
    return NextResponse.json(
      { error: "Students cannot update topics" },
      { status: 403 }
    );
  }

  const { id } = await params;

  const existing = await db.topic.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  const body = await req.json();
  const { title, description, category, level, preparationTips, isSystemGenerated } = body;

  const updated = await db.topic.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(level !== undefined && { level }),
      ...(preparationTips !== undefined && { preparationTips }),
      ...(isSystemGenerated !== undefined && { isSystemGenerated }),
    },
    include: {
      createdBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "STUDENT") {
    return NextResponse.json(
      { error: "Students cannot delete topics" },
      { status: 403 }
    );
  }

  const { id } = await params;

  const existing = await db.topic.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Topic not found" }, { status: 404 });
  }

  await db.topic.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
