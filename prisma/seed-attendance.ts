/**
 * Seed attendance records from WhatsApp chat data
 * Adds ABSENT records for student-cancelled lessons + fixes missing records
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const CLASS_ID = "cmpbaresd00077upooncepjl7";
const TEACHER_ID = "cmpbarerv00017uporab49ieg"; // Brishna

const studentIds = {
  esra: "cmpbazdd30068w413twfp7ngi",
  ayse: "cmpbazday002ow413rxvu7ggf",
  fatmagul: "cmpbazd9x000zw413b0gaezkp",
  bilal: "cmpbazde3007rw413z30i9n73",
  mustafa: "cmpbaydam00007wpgjl83k0d4",
};

// ABSENT records: dates where student cancelled (not teacher cancellations or holidays)
const absentRecords: Array<{
  studentKey: keyof typeof studentIds;
  date: string;
  title: string;
  reason: string;
}> = [
  // === ESRA ===
  // Schedule: Mon/Wed/Fri 8-9:30pm
  { studentKey: "esra", date: "2026-04-08", title: "Lesson cancelled", reason: "Student unwell" },
  { studentKey: "esra", date: "2026-04-17", title: "Lesson cancelled", reason: "Student flu" },
  { studentKey: "esra", date: "2026-05-04", title: "Lesson cancelled", reason: "Student overtime at work" },
  { studentKey: "esra", date: "2026-05-05", title: "Lesson cancelled", reason: "Student at gym" },
  { studentKey: "esra", date: "2026-05-13", title: "Lesson cancelled", reason: "Colleague funeral" },

  // === AYSE ===
  // Schedule: Mon/Fri 12:30-2pm
  { studentKey: "ayse", date: "2026-05-04", title: "Lesson cancelled", reason: "Student toothache, no sleep" },
  { studentKey: "ayse", date: "2026-05-11", title: "Lesson cancelled", reason: "Student dentist appointment" },

  // === FATMAGUL ===
  // Schedule: Mon/Fri 11-12:30am
  { studentKey: "fatmagul", date: "2026-04-22", title: "Lesson cancelled", reason: "Student job interviews" },
  { studentKey: "fatmagul", date: "2026-04-29", title: "Lesson cancelled", reason: "Student overslept" },
  { studentKey: "fatmagul", date: "2026-05-04", title: "Lesson cancelled", reason: "Student sick (cold)" },
  { studentKey: "fatmagul", date: "2026-05-05", title: "Lesson cancelled", reason: "Student still unwell" },
  { studentKey: "fatmagul", date: "2026-05-13", title: "Lesson cancelled", reason: "Student traveling from Balikesir" },
  { studentKey: "fatmagul", date: "2026-05-18", title: "Lesson cancelled", reason: "Student stuck in traffic" },

  // === BILAL ===
  // Schedule: Tue/Thu 9-10:30pm
  { studentKey: "bilal", date: "2026-04-21", title: "Lesson cancelled", reason: "Friend birthday party" },
  { studentKey: "bilal", date: "2026-05-05", title: "Lesson cancelled", reason: "Student in Bursa" },
  { studentKey: "bilal", date: "2026-05-12", title: "Lesson cancelled", reason: "Hospital - ear pressure/hearing issues" },
  { studentKey: "bilal", date: "2026-05-14", title: "Lesson cancelled", reason: "Student still ill from ear problems" },

  // === MUSTAFA ===
  // Schedule: Mon/Wed/Fri 9-10:30am
  { studentKey: "mustafa", date: "2026-04-08", title: "Lesson cancelled", reason: "School cake presentation" },
  { studentKey: "mustafa", date: "2026-04-13", title: "Lesson cancelled", reason: "Student sick - sore throat" },
  { studentKey: "mustafa", date: "2026-04-15", title: "Lesson cancelled", reason: "School food presentation" },
  { studentKey: "mustafa", date: "2026-04-20", title: "Lesson cancelled", reason: "Doctor appointment" },
  { studentKey: "mustafa", date: "2026-04-22", title: "Lesson cancelled", reason: "Late commute, laptop issues" },
  { studentKey: "mustafa", date: "2026-05-04", title: "Lesson cancelled", reason: "Very sick - fever, throat, nose" },
  { studentKey: "mustafa", date: "2026-05-05", title: "Lesson cancelled", reason: "Still sick with fever" },
  { studentKey: "mustafa", date: "2026-05-08", title: "Lesson cancelled", reason: "Late commute from work" },
  { studentKey: "mustafa", date: "2026-05-13", title: "Lesson cancelled", reason: "Brother passed away" },
];

// Missing PRESENT records
const missingPresent: Array<{
  studentKey: keyof typeof studentIds;
  date: string;
  title: string;
}> = [
  // Bilal Apr 30 - lesson happened (Teams link sent, Bilal said "Im comingg")
  { studentKey: "bilal", date: "2026-04-30", title: "Continuous tenses" },
];

async function main() {
  console.log("Seeding attendance from WhatsApp chat data...\n");

  let createdAbsent = 0;
  let createdPresent = 0;
  let skipped = 0;

  // First: add missing PRESENT records
  for (const rec of missingPresent) {
    const studentId = studentIds[rec.studentKey];

    // Create lesson record
    const lesson = await db.lesson.create({
      data: {
        classId: CLASS_ID,
        title: rec.title,
        date: new Date(rec.date),
        order: 0,
      },
    });

    // Create attendance
    await db.attendance.create({
      data: {
        studentId,
        lessonId: lesson.id,
        status: "PRESENT",
        markedById: TEACHER_ID,
        createdAt: new Date(rec.date),
      },
    });

    console.log(`+ PRESENT: ${rec.studentKey} - ${rec.date} - ${rec.title}`);
    createdPresent++;
  }

  // Then: add ABSENT records
  for (const rec of absentRecords) {
    const studentId = studentIds[rec.studentKey];

    // Check if attendance already exists for this student on this date
    const existingLesson = await db.lesson.findFirst({
      where: {
        date: new Date(rec.date),
        attendances: { some: { studentId } },
      },
    });

    if (existingLesson) {
      console.log(`  skip: ${rec.studentKey} - ${rec.date} (already has attendance)`);
      skipped++;
      continue;
    }

    // Create lesson record for the cancelled session
    const lesson = await db.lesson.create({
      data: {
        classId: CLASS_ID,
        title: rec.title,
        content: rec.reason,
        date: new Date(rec.date),
        order: 0,
      },
    });

    // Create ABSENT attendance
    await db.attendance.create({
      data: {
        studentId,
        lessonId: lesson.id,
        status: "ABSENT",
        markedById: TEACHER_ID,
        createdAt: new Date(rec.date),
      },
    });

    console.log(`- ABSENT:  ${rec.studentKey} - ${rec.date} - ${rec.reason}`);
    createdAbsent++;
  }

  // Print summary per student
  console.log("\n--- ATTENDANCE SUMMARY ---\n");

  for (const [name, id] of Object.entries(studentIds)) {
    const present = await db.attendance.count({
      where: { studentId: id, status: "PRESENT" },
    });
    const absent = await db.attendance.count({
      where: { studentId: id, status: "ABSENT" },
    });
    const total = present + absent;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    console.log(
      `${name.padEnd(10)} | Present: ${String(present).padStart(2)} | Absent: ${String(absent).padStart(2)} | Total: ${String(total).padStart(2)} | Rate: ${rate}%`
    );
  }

  console.log(`\nCreated ${createdPresent} PRESENT + ${createdAbsent} ABSENT records (${skipped} skipped)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
