import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await db.teacherInsight.updateMany({
      where: { teacherId: session.user.id, isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ message: "All insights marked as read" });
  } catch (error) {
    console.error("Failed to mark insights as read:", error);
    return NextResponse.json(
      { error: "Failed to mark insights as read" },
      { status: 500 }
    );
  }
}
