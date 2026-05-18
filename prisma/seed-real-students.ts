import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🎓 Seeding REAL student data...\n");

  const hashedPassword = await hash("student123", 10);
  const teacher = await prisma.user.findFirst({ where: { email: "brishna@ahkacademy.com" } });
  const admin = await prisma.user.findFirst({ where: { email: "ahsan@ahkacademy.com" } });

  if (!teacher || !admin) {
    console.log("❌ Run base seed first");
    return;
  }

  // ═══════════════════════════════════════════════════════════════
  // REAL STUDENTS — Brishna's students (6) + Ahsan's student (1)
  // ═══════════════════════════════════════════════════════════════

  const studentsData = [
    {
      name: "Mustafa",
      email: "mustafa@ahkacademy.student",
      country: "Turkey",
      timezone: "Europe/Istanbul",
      level: "A2",
      trackType: "FULL_STUDENT",
      teacherId: teacher.id,
      contractLessons: 100,
      preLessons: 63,
      notes: "63 lessons done before April 2026 records",
      schedule: [
        { dayOfWeek: 1, startTime: "09:30", endTime: "11:00" },
        { dayOfWeek: 3, startTime: "09:00", endTime: "10:30" },
        { dayOfWeek: 5, startTime: "09:30", endTime: "11:00" },
      ],
      lessons: [
        { date: "2026-04-06", topic: "Parts of speech", status: "COMPLETED" },
        { date: "2026-04-10", topic: "Noun and types", status: "COMPLETED" },
        { date: "2026-04-13", topic: null, status: "CANCELLED" },
        { date: "2026-04-27", topic: "Pronouns and types", status: "COMPLETED" },
        { date: "2026-04-29", topic: "Verbs and types", status: "COMPLETED" },
      ],
    },
    {
      name: "Fatima Gul",
      email: "fatimagul@ahkacademy.student",
      country: "Turkey",
      timezone: "Europe/Istanbul",
      level: "B1",
      trackType: "FULL_STUDENT",
      teacherId: teacher.id,
      contractLessons: 100,
      preLessons: 92,
      notes: "92 lessons done total. First lesson by Ahsan, rest by Brishna",
      schedule: [
        { dayOfWeek: 1, startTime: "11:00", endTime: "12:30" },
        { dayOfWeek: 3, startTime: "11:00", endTime: "12:30" },
        { dayOfWeek: 5, startTime: "11:00", endTime: "12:30" },
      ],
      lessons: [
        { date: "2026-04-10", topic: "Parts of speech", status: "COMPLETED" },
        { date: "2026-04-13", topic: "Noun and types", status: "COMPLETED" },
        { date: "2026-04-20", topic: "Pronouns and types", status: "COMPLETED" },
        { date: "2026-04-24", topic: "Verbs and forms", status: "COMPLETED" },
        { date: "2026-04-28", topic: "Simple tenses", status: "COMPLETED" },
        { date: "2026-04-30", topic: "Continuous tenses", status: "COMPLETED" },
        { date: "2026-05-07", topic: "Quiz and speaking", status: "COMPLETED" },
        { date: "2026-05-08", topic: "Past perfect", status: "COMPLETED" },
        { date: "2026-05-12", topic: "Gerunds and infinitives", status: "COMPLETED" },
      ],
    },
    {
      name: "Ayse",
      email: "ayse@ahkacademy.student",
      country: "Turkey",
      timezone: "Europe/Istanbul",
      level: "A2",
      trackType: "FULL_STUDENT",
      teacherId: teacher.id,
      contractLessons: 100,
      preLessons: 46,
      notes: "46 lessons done total",
      schedule: [
        { dayOfWeek: 1, startTime: "12:30", endTime: "14:00" },
        { dayOfWeek: 5, startTime: "12:30", endTime: "14:00" },
      ],
      lessons: [
        { date: "2026-04-13", topic: "Parts of speech", status: "COMPLETED" },
        { date: "2026-04-20", topic: "Noun and types", status: "COMPLETED" },
        { date: "2026-04-25", topic: "Verb and types", status: "COMPLETED" },
        { date: "2026-04-28", topic: "Simple tenses", status: "COMPLETED" },
        { date: "2026-05-05", topic: "Continuous tenses", status: "COMPLETED" },
        { date: "2026-05-07", topic: "Quiz and speaking", status: "COMPLETED" },
        { date: "2026-05-12", topic: "Gerunds and infinitives", status: "COMPLETED" },
        { date: "2026-05-18", topic: "Gerunds and infinitives", status: "COMPLETED" },
      ],
    },
    {
      name: "Taner",
      email: "taner.brishna@ahkacademy.student",
      country: "Turkey",
      timezone: "Europe/Istanbul",
      level: "B1",
      trackType: "FULL_STUDENT",
      teacherId: teacher.id,
      contractLessons: 100,
      preLessons: 0,
      notes: "TOEFL student. 100-lesson contract started May 4 2026. Pre-contract: Apr 8-29",
      schedule: [
        { dayOfWeek: 1, startTime: "22:00", endTime: "23:30" },
        { dayOfWeek: 3, startTime: "22:00", endTime: "23:30" },
      ],
      lessons: [
        { date: "2026-04-08", topic: "TOEFL Introduction", status: "COMPLETED", phase: "PRE" },
        { date: "2026-04-13", topic: "TOEFL reading practice", status: "COMPLETED", phase: "PRE" },
        { date: "2026-04-17", topic: "TOEFL reading practice", status: "COMPLETED", phase: "PRE" },
        { date: "2026-04-20", topic: "TOEFL reading practice", status: "COMPLETED", phase: "PRE" },
        { date: "2026-04-22", topic: "Listening", status: "COMPLETED", phase: "PRE" },
        { date: "2026-04-27", topic: "Listening", status: "COMPLETED", phase: "PRE" },
        { date: "2026-04-29", topic: "Speaking", status: "COMPLETED", phase: "PRE" },
        { date: "2026-05-04", topic: "Writing", status: "COMPLETED" },
        { date: "2026-05-06", topic: "Writing task 1 and 3", status: "COMPLETED" },
        { date: "2026-05-11", topic: "Writing task 3", status: "COMPLETED" },
        { date: "2026-05-13", topic: "Test 1", status: "COMPLETED" },
      ],
    },
    {
      name: "Esra",
      email: "esra@ahkacademy.student",
      country: "Turkey",
      timezone: "Europe/Istanbul",
      level: "A2",
      trackType: "FULL_STUDENT",
      teacherId: teacher.id,
      contractLessons: 100,
      preLessons: 16,
      notes: "16 lessons done total",
      schedule: [
        { dayOfWeek: 1, startTime: "20:00", endTime: "21:30" },
        { dayOfWeek: 3, startTime: "20:30", endTime: "21:55" },
        { dayOfWeek: 5, startTime: "20:30", endTime: "21:55" },
      ],
      lessons: [
        { date: "2026-04-10", topic: "Parts of speech", status: "COMPLETED" },
        { date: "2026-04-13", topic: "Noun and types", status: "COMPLETED" },
        { date: "2026-04-20", topic: "Pronoun and types", status: "COMPLETED" },
        { date: "2026-04-22", topic: "Verbs and forms", status: "COMPLETED" },
        { date: "2026-04-27", topic: "Simple tenses", status: "COMPLETED" },
        { date: "2026-04-29", topic: "Continuous tenses", status: "COMPLETED" },
        { date: "2026-05-06", topic: "Quiz and writing", status: "COMPLETED" },
        { date: "2026-05-11", topic: "Perfect tenses", status: "COMPLETED" },
      ],
    },
    {
      name: "Bilal",
      email: "bilal.brishna@ahkacademy.student",
      country: "Turkey",
      timezone: "Europe/Istanbul",
      level: "A1",
      trackType: "FULL_STUDENT",
      teacherId: teacher.id,
      contractLessons: 100,
      preLessons: 16,
      notes: "16 lessons done total",
      schedule: [
        { dayOfWeek: 2, startTime: "09:00", endTime: "10:30" },
        { dayOfWeek: 4, startTime: "09:00", endTime: "10:30" },
      ],
      lessons: [
        { date: "2026-04-14", topic: "Introduction", status: "COMPLETED" },
        { date: "2026-04-28", topic: "Simple tenses", status: "COMPLETED" },
        { date: "2026-05-07", topic: "Continuous", status: "COMPLETED" },
      ],
    },
    {
      name: "Ahmet Gürkan",
      email: "ahmetgurkan@geopaveco.com",
      country: "Turkey",
      timezone: "Europe/Istanbul",
      level: "B2",
      trackType: "FULL_STUDENT",
      teacherId: null, // Taught by Ahsan directly
      contractLessons: 100,
      preLessons: 0,
      notes: "Civil Engineer at Geopaveco. B2→C2 target. 80,000 TRY 4-installment plan. 2/4 paid (40K). Joint sessions with Yusra Khan.",
      schedule: [
        { dayOfWeek: 1, startTime: "22:00", endTime: "23:30" },
        { dayOfWeek: 3, startTime: "22:00", endTime: "23:30" },
        { dayOfWeek: 5, startTime: "22:00", endTime: "23:30" },
      ],
      lessons: [
        // Phase 1 (Nov-Dec 2025)
        { date: "2025-11-21", topic: "Phase 1 Session 1", status: "COMPLETED", phase: "PRE" },
        { date: "2025-11-24", topic: "Phase 1 Session 2", status: "COMPLETED", phase: "PRE" },
        { date: "2025-11-28", topic: "Phase 1 Session 3", status: "COMPLETED", phase: "PRE" },
        { date: "2025-12-05", topic: "Phase 1 Session 4", status: "COMPLETED", phase: "PRE" },
        { date: "2025-12-08", topic: "Phase 1 Session 5", status: "COMPLETED", phase: "PRE" },
        { date: "2025-12-12", topic: null, status: "CANCELLED", phase: "PRE" },
        { date: "2025-12-15", topic: "Phase 1 Session 6", status: "COMPLETED", phase: "PRE" },
        { date: "2025-12-29", topic: "Phase 1 Session 7", status: "COMPLETED", phase: "PRE" },
        // Phase 2 (Mar-May 2026 — Contract)
        { date: "2026-03-01", topic: "Contract Session 1", status: "COMPLETED" },
        { date: "2026-03-03", topic: "Contract Session 2", status: "COMPLETED" },
        { date: "2026-03-05", topic: "Contract Session 3", status: "COMPLETED" },
        { date: "2026-03-08", topic: "Contract Session 4", status: "COMPLETED" },
        { date: "2026-03-10", topic: "Contract Session 5", status: "COMPLETED" },
        { date: "2026-03-13", topic: "Contract Session 6", status: "COMPLETED" },
        { date: "2026-03-15", topic: "Contract Session 7", status: "COMPLETED" },
        { date: "2026-03-18", topic: "Contract Session 8", status: "COMPLETED" },
        { date: "2026-03-25", topic: "Contract Session 9", status: "COMPLETED" },
        { date: "2026-03-30", topic: "Contract Session 10", status: "COMPLETED" },
        { date: "2026-04-04", topic: "Contract Session 11", status: "COMPLETED" },
        { date: "2026-04-06", topic: "Contract Session 12", status: "COMPLETED" },
        { date: "2026-04-26", topic: "Contract Session 13", status: "COMPLETED" },
        { date: "2026-04-28", topic: "Contract Session 14 — Joint with Yusra Khan", status: "COMPLETED" },
        { date: "2026-04-30", topic: "Contract Session 15 — Joint with Yusra Khan", status: "COMPLETED" },
        { date: "2026-05-03", topic: "Contract Session 16", status: "COMPLETED" },
        { date: "2026-05-05", topic: "Contract Session 17", status: "COMPLETED" },
        { date: "2026-05-08", topic: "Contract Session 18", status: "COMPLETED" },
      ],
      payments: [
        { amount: 20000, currency: "TRY", date: "2026-02-27", desc: "Installment 1/4 — lessons 1-25", status: "CONFIRMED", method: "IBAN" },
        { amount: 20000, currency: "TRY", date: "2026-03-31", desc: "Installment 2/4 — lessons 26-50", status: "CONFIRMED", method: "IBAN" },
      ],
    },
  ];

  // Create each student
  for (const s of studentsData) {
    console.log(`👤 Creating ${s.name}...`);

    // Create User
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {
        name: s.name,
        country: s.country,
        timezone: s.timezone,
        language: "tr",
      },
      create: {
        name: s.name,
        email: s.email,
        password: hashedPassword,
        role: "STUDENT",
        country: s.country,
        timezone: s.timezone,
        language: "tr",
      },
    });

    // Create StudentProfile
    await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        trackType: s.trackType,
        level: s.level,
        teacherId: s.teacherId,
        internationalPreference: true,
        preferredTopics: JSON.stringify(["Grammar", "Speaking", "TOEFL"]),
        availableSlots: JSON.stringify(s.schedule),
        isActive: true,
        notes: s.notes,
      },
    });

    // Create Payment Plan (100-lesson contract)
    const plan = await prisma.paymentPlan.create({
      data: {
        studentId: user.id,
        planType: "CUSTOM",
        amount: s.name === "Ahmet Gürkan" ? 80000 : 0, // Gürkan has 80K TRY plan, others TBD
        currency: s.name === "Ahmet Gürkan" ? "TRY" : "USD",
        billingCycleDay: 1,
        creditsRemaining: s.contractLessons - s.lessons.filter((l) => l.status === "COMPLETED" && (!("phase" in l) || l.phase !== "PRE")).length,
        isActive: true,
        notes: `${s.contractLessons}-lesson contract. ${s.preLessons} pre-contract lessons. ${s.notes}`,
      },
    });

    // Create payment transactions for Gürkan
    if (s.payments) {
      for (const p of s.payments) {
        await prisma.paymentTransaction.create({
          data: {
            studentId: user.id,
            paymentPlanId: plan.id,
            amount: p.amount,
            currency: p.currency,
            method: p.method,
            status: p.status,
            referenceCode: `AHK-GRK-${p.date.replace(/-/g, "").slice(2)}`,
            confirmedBy: admin.id,
            confirmedAt: new Date(p.date),
            description: p.desc,
          },
        });
      }
    }

    // Create lesson records as GrammarLessonLog entries (teacher's lesson history)
    const teacherForLessons = s.teacherId || admin.id;
    for (const lesson of s.lessons) {
      if (lesson.status === "COMPLETED" && lesson.topic) {
        await prisma.grammarLessonLog.create({
          data: {
            teacherId: teacherForLessons,
            title: lesson.topic,
            grammarFocus: lesson.topic,
            description: `${s.name} — ${lesson.status}${("phase" in lesson && lesson.phase === "PRE") ? " (Pre-contract)" : " (Contract)"}`,
            taughtAt: new Date(lesson.date),
            studentsTargeted: JSON.stringify([user.id]),
          },
        });
      }
    }

    // Create lesson records in the Lesson model (for the class/lesson tracking system)
    const studentClass = await prisma.class.findFirst();
    if (studentClass) {
      // Enroll student
      await prisma.enrollment.upsert({
        where: {
          studentId_classId: { studentId: user.id, classId: studentClass.id },
        },
        update: {},
        create: {
          studentId: user.id,
          classId: studentClass.id,
        },
      });

      // Create lesson + attendance for each session
      for (const lesson of s.lessons) {
        const lessonRecord = await prisma.lesson.create({
          data: {
            title: lesson.topic || `Session on ${lesson.date}`,
            content: `${s.name}'s lesson — ${lesson.topic || "Cancelled"}`,
            date: new Date(lesson.date),
            classId: studentClass.id,
          },
        });

        // Mark attendance
        await prisma.attendance.create({
          data: {
            studentId: user.id,
            lessonId: lessonRecord.id,
            status: lesson.status === "COMPLETED" ? "PRESENT" : "ABSENT",
            markedById: teacherForLessons,
          },
        });
      }
    }

    const completedContract = s.lessons.filter((l) => l.status === "COMPLETED" && (!("phase" in l) || l.phase !== "PRE")).length;
    const completedPre = s.lessons.filter((l) => l.status === "COMPLETED" && "phase" in l && l.phase === "PRE").length;
    console.log(`   ✅ ${s.name}: ${completedContract} contract + ${completedPre} pre-contract lessons, level ${s.level}`);
  }

  console.log("\n🎉 Real student data seeded!");
  console.log("   7 students with full lesson histories");
  console.log("   Payment plans + Gürkan's 40K TRY confirmed");
  console.log("   All attendance records created");
  console.log("\n   Login with: [email]@... / student123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
