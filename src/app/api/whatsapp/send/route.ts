import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { WhatsAppService } from "@/lib/whatsapp";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !["ADMIN", "TEACHER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { phone, message, templateName, variables } = body;

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 });
    }

    if (!message && !templateName) {
      return NextResponse.json({ error: "Message or template name is required" }, { status: 400 });
    }

    let success = false;

    if (templateName) {
      success = await WhatsAppService.sendTemplate(phone, templateName, variables || []);
    } else {
      success = await WhatsAppService.sendText(phone, message);
    }

    if (!success) {
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    // Find or create conversation
    let conversation = await db.whatsappConversation.findUnique({
      where: { phoneNumber: phone },
    });

    if (!conversation) {
      conversation = await db.whatsappConversation.create({
        data: {
          phoneNumber: phone,
          conversationType: "LEAD",
          lastMessageAt: new Date(),
          context: JSON.stringify({ messages: [] }),
        },
      });
    }

    // Save outbound message
    await db.whatsappMessage.create({
      data: {
        conversationId: conversation.id,
        direction: "OUTBOUND",
        content: message || `[Template: ${templateName}]`,
        messageType: templateName ? "TEMPLATE" : "TEXT",
        templateName: templateName || null,
        sentAt: new Date(),
      },
    });

    // Update conversation timestamp
    await db.whatsappConversation.update({
      where: { id: conversation.id },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json({ success: true, conversationId: conversation.id });
  } catch (error) {
    console.error("[WhatsApp Send] Error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
