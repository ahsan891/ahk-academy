import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const unreadOnly = searchParams.get("unread") === "true";

  const where: Record<string, unknown> = {
    userId: session.user.id,
  };

  if (unreadOnly) {
    where.read = false;
  }

  const notifications = await db.notification.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(notifications);
}

export async function PUT(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { notificationId, markAllRead } = body;

  if (markAllRead) {
    await db.notification.updateMany({
      where: {
        userId: session.user.id,
        read: false,
      },
      data: { read: true },
    });

    return NextResponse.json({ success: true, message: "All notifications marked as read" });
  }

  if (notificationId) {
    // Verify notification belongs to user
    const notification = await db.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    });

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    await db.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  }

  return NextResponse.json(
    { error: "Provide notificationId or markAllRead: true" },
    { status: 400 }
  );
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Only admin can create notifications for other users
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Only admins can create notifications" }, { status: 403 });
  }

  const body = await req.json();
  const { userId, title, message, type } = body;

  if (!userId || !title || !message) {
    return NextResponse.json(
      { error: "userId, title, and message are required" },
      { status: 400 }
    );
  }

  // Verify target user exists
  const targetUser = await db.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const notification = await db.notification.create({
    data: {
      userId,
      title,
      message,
      type: type || "info",
    },
  });

  return NextResponse.json(notification, { status: 201 });
}
