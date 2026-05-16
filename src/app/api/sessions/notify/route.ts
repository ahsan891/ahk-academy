import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { WhatsAppService } from "@/lib/whatsapp";
import { EmailService } from "@/lib/email";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { sessionId, type } = body;

  if (!sessionId || !type) {
    return NextResponse.json(
      { error: "sessionId and type (48h | 2h) are required" },
      { status: 400 }
    );
  }

  if (type !== "48h" && type !== "2h") {
    return NextResponse.json(
      { error: "type must be '48h' or '2h'" },
      { status: 400 }
    );
  }

  const speakingSession = await db.speakingSession.findUnique({
    where: { id: sessionId },
    include: {
      participants: {
        include: {
          student: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      },
    },
  });

  if (!speakingSession) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  const sessionDate = new Date(speakingSession.date);
  const formattedDate = sessionDate.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  let notificationsSent = 0;

  for (const participant of speakingSession.participants) {
    const student = participant.student;
    const meetingLink = speakingSession.meetingLink || "Link will be shared soon";

    if (type === "48h") {
      // Full notification with topic, prep guide, and discussion questions
      const whatsappMessage = [
        `Hello ${student.name}!`,
        ``,
        `Your speaking session is coming up:`,
        `Topic: ${speakingSession.topic}`,
        `Date: ${formattedDate}`,
        `Duration: ${speakingSession.duration} minutes`,
        ``,
        `Preparation Tips:`,
        `- Research the topic beforehand`,
        `- Prepare 3-5 talking points`,
        `- Look up relevant vocabulary`,
        ``,
        `Discussion Questions:`,
        `- What is your opinion on this topic?`,
        `- Can you share a personal experience related to this?`,
        `- What are the pros and cons?`,
        ``,
        `Meeting Link: ${meetingLink}`,
        ``,
        `See you there!`,
      ].join("\n");

      // Send WhatsApp
      if (student.phone) {
        await WhatsAppService.sendText(student.phone, whatsappMessage);
      }

      // Send email
      if (student.email) {
        const emailHtml = `
          <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">Upcoming Speaking Session</h2>
          <p style="margin:0 0 12px;color:#374151;font-size:14px;">Hi ${student.name},</p>
          <p style="margin:0 0 20px;color:#374151;font-size:14px;">Your speaking session is coming up in 48 hours!</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#eff6ff;border-radius:8px;padding:16px;margin-bottom:20px;">
            <tr><td style="padding:8px 16px;">
              <p style="margin:0 0 8px;color:#1e40af;font-size:14px;font-weight:600;">Topic: ${speakingSession.topic}</p>
              <p style="margin:0 0 8px;color:#374151;font-size:14px;">Date: ${formattedDate}</p>
              <p style="margin:0;color:#374151;font-size:14px;">Duration: ${speakingSession.duration} minutes</p>
            </td></tr>
          </table>
          <h3 style="margin:0 0 12px;color:#111827;font-size:16px;">Preparation Guide</h3>
          <ul style="margin:0 0 20px;padding-left:20px;color:#374151;font-size:14px;">
            <li>Research the topic beforehand</li>
            <li>Prepare 3-5 talking points</li>
            <li>Look up relevant vocabulary</li>
            <li>Think about personal experiences to share</li>
          </ul>
          <h3 style="margin:0 0 12px;color:#111827;font-size:16px;">Discussion Questions</h3>
          <ul style="margin:0 0 20px;padding-left:20px;color:#374151;font-size:14px;">
            <li>What is your opinion on this topic?</li>
            <li>Can you share a personal experience related to this?</li>
            <li>What are the pros and cons?</li>
          </ul>
          <a href="${meetingLink}" style="display:inline-block;background-color:#1e40af;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">Join Meeting</a>
        `;
        await EmailService.send(student.email, `Speaking Session in 48h: ${speakingSession.topic}`, emailHtml);
      }
    } else {
      // 2h reminder - just meeting link
      const whatsappMessage = [
        `Hi ${student.name}!`,
        ``,
        `Your speaking session starts in 2 hours!`,
        `Topic: ${speakingSession.topic}`,
        ``,
        `Join here: ${meetingLink}`,
        ``,
        `See you soon!`,
      ].join("\n");

      if (student.phone) {
        await WhatsAppService.sendText(student.phone, whatsappMessage);
      }

      if (student.email) {
        const emailHtml = `
          <h2 style="margin:0 0 16px;color:#111827;font-size:18px;">Session Starting Soon!</h2>
          <p style="margin:0 0 12px;color:#374151;font-size:14px;">Hi ${student.name},</p>
          <p style="margin:0 0 20px;color:#374151;font-size:14px;">Your speaking session on <strong>${speakingSession.topic}</strong> starts in 2 hours!</p>
          <a href="${meetingLink}" style="display:inline-block;background-color:#1e40af;color:#ffffff;padding:12px 24px;border-radius:6px;text-decoration:none;font-size:14px;font-weight:600;">Join Meeting Now</a>
        `;
        await EmailService.send(student.email, `Starting in 2h: ${speakingSession.topic}`, emailHtml);
      }
    }

    // Create notification record
    await db.notification.create({
      data: {
        userId: student.id,
        title: type === "48h" ? "Session in 48 hours" : "Session starting soon",
        message: type === "48h"
          ? `Your speaking session on "${speakingSession.topic}" is in 48 hours. Check your email for preparation materials.`
          : `Your speaking session on "${speakingSession.topic}" starts in 2 hours! Join: ${meetingLink}`,
        type: "session_reminder",
      },
    });

    notificationsSent++;
  }

  return NextResponse.json({
    success: true,
    notificationsSent,
    type,
    sessionId,
  });
}
