import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get("type");
    const search = searchParams.get("search");

    const where: Record<string, unknown> = {};

    if (type) {
      where.conversationType = type;
    }

    if (search) {
      where.OR = [
        { phoneNumber: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } },
      ];
    }

    const conversations = await db.whatsappConversation.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        messages: {
          orderBy: { sentAt: "desc" },
          take: 1,
        },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    const formatted = conversations.map((conv) => ({
      id: conv.id,
      phoneNumber: conv.phoneNumber,
      conversationType: conv.conversationType,
      lastMessageAt: conv.lastMessageAt,
      isActive: conv.isActive,
      user: conv.user,
      lastMessage: conv.messages[0] || null,
    }));

    return NextResponse.json({ conversations: formatted });
  } catch (error) {
    console.error("[WhatsApp Conversations] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}
