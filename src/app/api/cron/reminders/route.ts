import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { WhatsAppService } from "@/lib/whatsapp";
import { EmailService } from "@/lib/email";

/**
 * Cron endpoint for automated reminders.
 * Called by Vercel Cron or manual trigger.
 * Checks for upcoming sessions, payments due, overdue payments, and homework deadlines.
 */
export async function POST(req: NextRequest) {
  // Verify cron secret or admin auth
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // If no cron secret set, allow without auth (development mode)
    if (cronSecret) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const now = new Date();
  const results = {
    sessionReminders: 0,
    paymentReminders: 0,
    overduePayments: 0,
    homeworkReminders: 0,
  };

  // 1. Sessions in next 48 hours
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);
  const upcomingSessions = await db.speakingSession.findMany({
    where: {
      date: {
        gte: now,
        lte: in48h,
      },
      status: "scheduled",
    },
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

  for (const session of upcomingSessions) {
    for (const participant of session.participants) {
      const student = participant.student;

      // Check if we already sent a reminder for this session
      const existingReminder = await db.notification.findFirst({
        where: {
          userId: student.id,
          type: "session_reminder",
          message: { contains: session.id },
          createdAt: { gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
        },
      });

      if (existingReminder) continue;

      // Create notification
      await db.notification.create({
        data: {
          userId: student.id,
          title: "Upcoming Speaking Session",
          message: `Your session on "${session.topic}" is coming up on ${session.date.toLocaleDateString()}. Session ID: ${session.id}`,
          type: "session_reminder",
        },
      });

      // Send WhatsApp reminder
      if (student.phone) {
        await WhatsAppService.sendText(
          student.phone,
          `Hi ${student.name}! Reminder: Your speaking session on "${session.topic}" is coming up on ${session.date.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}. ${session.meetingLink ? `Join: ${session.meetingLink}` : ""}`
        );
      }

      // Send email reminder
      if (student.email) {
        await EmailService.sendSessionReminder(
          student.email,
          student.name,
          session.topic,
          session.date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }),
          session.meetingLink || "Link will be shared soon"
        );
      }

      results.sessionReminders++;
    }
  }

  // 2. Payments due in next 3 days
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const paymentsDue = await db.paymentPlan.findMany({
    where: {
      isActive: true,
      nextDueDate: {
        gte: now,
        lte: in3Days,
      },
    },
    include: {
      student: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
  });

  for (const plan of paymentsDue) {
    const student = plan.student;

    // Check for existing reminder
    const existingReminder = await db.notification.findFirst({
      where: {
        userId: student.id,
        type: "payment_reminder",
        createdAt: { gte: new Date(now.getTime() - 48 * 60 * 60 * 1000) },
      },
    });

    if (existingReminder) continue;

    await db.notification.create({
      data: {
        userId: student.id,
        title: "Payment Due Soon",
        message: `Your payment of $${plan.amount} is due on ${plan.nextDueDate?.toLocaleDateString()}. Please make sure to pay on time.`,
        type: "payment_reminder",
      },
    });

    // Send email reminder
    if (student.email && plan.nextDueDate) {
      await EmailService.sendPaymentReminder(
        student.email,
        student.name,
        plan.amount,
        plan.nextDueDate.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
      );
    }

    // Send WhatsApp reminder
    if (student.phone) {
      await WhatsAppService.sendText(
        student.phone,
        `Hi ${student.name}! Friendly reminder: Your payment of $${plan.amount} is due on ${plan.nextDueDate?.toLocaleDateString()}. Payment methods: IBAN, Papara, or Stripe. Contact us if you have questions!`
      );
    }

    results.paymentReminders++;
  }

  // 3. Overdue payments (7+ days past due)
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const overduePayments = await db.paymentPlan.findMany({
    where: {
      isActive: true,
      nextDueDate: {
        lt: sevenDaysAgo,
      },
    },
    include: {
      student: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Find admin users to notify
  const admins = await db.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  for (const plan of overduePayments) {
    // Notify admins about overdue payment
    for (const admin of admins) {
      const existingAlert = await db.notification.findFirst({
        where: {
          userId: admin.id,
          type: "overdue_payment",
          message: { contains: plan.student.id },
          createdAt: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
        },
      });

      if (existingAlert) continue;

      await db.notification.create({
        data: {
          userId: admin.id,
          title: "Overdue Payment Alert",
          message: `${plan.student.name} (${plan.student.email}) has an overdue payment of $${plan.amount}. Due date was ${plan.nextDueDate?.toLocaleDateString()}. Student ID: ${plan.student.id}`,
          type: "overdue_payment",
        },
      });
    }

    results.overduePayments++;
  }

  // 4. Homework due in next 24 hours
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const upcomingHomework = await db.homework.findMany({
    where: {
      dueDate: {
        gte: now,
        lte: in24h,
      },
      status: "PENDING",
    },
    include: {
      student: {
        select: { id: true, name: true, email: true, phone: true },
      },
    },
  });

  for (const hw of upcomingHomework) {
    const student = hw.student;

    // Check for existing reminder
    const existingReminder = await db.notification.findFirst({
      where: {
        userId: student.id,
        type: "homework_reminder",
        message: { contains: hw.id },
        createdAt: { gte: new Date(now.getTime() - 12 * 60 * 60 * 1000) },
      },
    });

    if (existingReminder) continue;

    await db.notification.create({
      data: {
        userId: student.id,
        title: "Homework Due Soon",
        message: `Your homework "${hw.title}" is due in less than 24 hours. Make sure to submit it on time! Homework ID: ${hw.id}`,
        type: "homework_reminder",
      },
    });

    // Send WhatsApp
    if (student.phone) {
      await WhatsAppService.sendText(
        student.phone,
        `Hi ${student.name}! Your homework "${hw.title}" is due tomorrow. Don't forget to submit it!`
      );
    }

    results.homeworkReminders++;
  }

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    results,
    total: results.sessionReminders + results.paymentReminders + results.overduePayments + results.homeworkReminders,
  });
}
