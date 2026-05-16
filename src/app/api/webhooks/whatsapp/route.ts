import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { AIService } from "@/lib/ai-service";
import { WhatsAppService } from "@/lib/whatsapp";

const LEAD_SYSTEM_PROMPT = `You are an AI assistant for AHK Academy, an English language school targeting Turkish and international students. You handle lead qualification via WhatsApp.

Your role:
- Greet warmly in Turkish first, then switch to the user's preferred language
- Ask about their English level (beginner/intermediate/advanced)
- Ask about their goals (speaking practice, TOEFL prep, general English)
- Mention our programs: Speaking Sessions ($40-80/mo) and Full Track with teacher lessons ($120-200/mo)
- Offer a free trial speaking session
- Collect their name and email if interested
- Be friendly, concise, and helpful

Keep responses short (2-3 sentences max) since this is WhatsApp.
Always respond in the same language the user writes in.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Parse incoming message from 360dialog webhook format
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (!message) {
      // This might be a status update, acknowledge it
      return NextResponse.json({ status: "ok" });
    }

    const phone = message.from;
    const content = message.text?.body || message.caption || "[media]";
    const messageType = message.type?.toUpperCase() || "TEXT";

    // Find or create conversation
    let conversation = await db.whatsappConversation.findUnique({
      where: { phoneNumber: phone },
      include: { user: true },
    });

    if (!conversation) {
      conversation = await db.whatsappConversation.create({
        data: {
          phoneNumber: phone,
          conversationType: "LEAD",
          lastMessageAt: new Date(),
          context: JSON.stringify({ messages: [] }),
        },
        include: { user: true },
      });
    }

    // Save inbound message
    await db.whatsappMessage.create({
      data: {
        conversationId: conversation.id,
        direction: "INBOUND",
        content,
        messageType,
        sentAt: new Date(),
      },
    });

    // Update conversation timestamp
    const existingContext = conversation.context
      ? JSON.parse(conversation.context)
      : { messages: [] };
    existingContext.messages.push({ role: "user", content, timestamp: new Date().toISOString() });

    // If known user (linked), just save and return
    if (conversation.userId) {
      await db.whatsappConversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageAt: new Date(),
          context: JSON.stringify(existingContext),
        },
      });
      return NextResponse.json({ status: "ok" });
    }

    // Unknown user (LEAD) - trigger AI chatbot
    const conversationHistory = existingContext.messages
      .slice(-10) // Last 10 messages for context
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join("\n");

    const prompt = `Conversation history:\n${conversationHistory}\n\nRespond to the latest message from the lead.`;

    const aiResponse = await AIService.generate(prompt, LEAD_SYSTEM_PROMPT);
    const replyText = aiResponse.text;

    // Send AI response via WhatsApp
    await WhatsAppService.sendText(phone, replyText);

    // Save outbound AI message
    await db.whatsappMessage.create({
      data: {
        conversationId: conversation.id,
        direction: "OUTBOUND",
        content: replyText,
        messageType: "TEXT",
        sentAt: new Date(),
      },
    });

    // Update context with AI response
    existingContext.messages.push({
      role: "assistant",
      content: replyText,
      timestamp: new Date().toISOString(),
    });

    await db.whatsappConversation.update({
      where: { id: conversation.id },
      data: {
        lastMessageAt: new Date(),
        context: JSON.stringify(existingContext),
      },
    });

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("[WhatsApp Webhook] Error:", error);
    // Always return 200 to prevent webhook retries
    return NextResponse.json({ status: "ok" });
  }
}

// GET for webhook verification (360dialog/Meta)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
