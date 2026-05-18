/**
 * Seed Ayse's homework files + lesson recording metadata from exported data
 */

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const AYSE_ID = "cmpbazday002ow413rxvu7ggf";
const BASE_PATH = "data/students/ayse";

// Mapping: lesson date -> recording file + lesson ID
const recordings = [
  {
    lessonId: "cmpbba76w003cbtv3gthr0thz", // Parts of speech - Apr 13
    date: "2026-04-13",
    file: "ayse 13-04-26-20260413_123329-Meeting Recording.mp4",
    sizeMB: 495,
    teamsTimestamp: "20260413_123329",
  },
  {
    lessonId: "cmpbba76y003gbtv3jimwj9h2", // Noun and types - Apr 20
    date: "2026-04-20",
    file: "Ayse20426-20260420_123440-Meeting Recording.mp4",
    sizeMB: 283,
    teamsTimestamp: "20260420_123440",
  },
  {
    lessonId: "cmpbba770003kbtv3hzjgy7jc", // Verb and types - Apr 25
    date: "2026-04-25",
    file: "Ayse 25.4.26-20260425_221210-Meeting Recording.mp4",
    sizeMB: 297,
    teamsTimestamp: "20260425_221210",
  },
  {
    lessonId: "cmpbba772003obtv3t3ilw6la", // Simple tenses - Apr 28
    date: "2026-04-28",
    file: "ayse 28.4.26-20260428_223923-Meeting Recording.mp4",
    sizeMB: 317,
    teamsTimestamp: "20260428_223923",
  },
  {
    lessonId: "cmpbba774003sbtv3fmkgvhqi", // Continuous tenses - May 5
    date: "2026-05-05",
    file: "ayse 5.5.26-20260505_204203-Meeting Recording.mp4",
    sizeMB: 334,
    teamsTimestamp: "20260505_204203",
  },
  {
    lessonId: "cmpbba776003wbtv3gbrwj9p7", // Quiz and speaking - May 7
    date: "2026-05-07",
    file: "ayse 7526-20260507_191450-Meeting Recording.mp4",
    sizeMB: 101,
    teamsTimestamp: "20260507_191450",
  },
  {
    lessonId: "cmpbba7790040btv3qxbuw7nk", // Gerunds - May 12 (joint with Fatmagul)
    date: "2026-05-12",
    file: "meeting ayse and fatima gul-20260512_222330-Meeting Recording.mp4",
    sizeMB: 672,
    teamsTimestamp: "20260512_222330",
  },
  {
    lessonId: "cmpbba77b0044btv3mj75ttrn", // Gerunds - May 18
    date: "2026-05-18",
    file: "ayse 18.5.26-20260518_142625-Meeting Recording.mp4",
    sizeMB: 207,
    teamsTimestamp: "20260518_142625",
  },
];

// Homework files mapped to lessons
const homeworks = [
  {
    title: "Parts of Speech Homework",
    fileName: "parts_of_speech_homework.pdf",
    lessonDate: "2026-04-13",
    assignedDate: "2026-04-13",
    dueDate: "2026-04-20",
    topic: "Parts of Speech: Nouns, Verbs, Adjectives, Adverbs, Pronouns, Prepositions, Conjunctions",
  },
  {
    title: "Ayse Homework - Nouns & Parts of Speech",
    fileName: "ayse_homework.docx",
    lessonDate: "2026-04-20",
    assignedDate: "2026-04-20",
    dueDate: "2026-04-25",
    topic: "Nouns, types of nouns, sentence construction",
  },
  {
    title: "Present Simple Homework",
    fileName: "Present_Simple_Homework.docx",
    lessonDate: "2026-04-25",
    assignedDate: "2026-04-25",
    dueDate: "2026-04-28",
    topic: "Present Simple tense: affirmative, negative, questions, daily routines",
  },
  {
    title: "Continuous Tenses Homework",
    fileName: "homework.docx",
    lessonDate: "2026-05-05",
    assignedDate: "2026-05-05",
    dueDate: "2026-05-07",
    topic: "Present Continuous, Past Continuous, Future Continuous tenses",
  },
  {
    title: "Grammar MCQ Quiz",
    fileName: "ayse_homework_mcq.pdf",
    lessonDate: "2026-05-18",
    assignedDate: "2026-05-18",
    dueDate: "2026-05-21",
    topic: "Multiple choice quiz covering all grammar topics studied so far",
  },
];

async function main() {
  console.log("Seeding Ayse's files into database...\n");

  // 1. Update lesson records with video URLs
  console.log("=== LESSON RECORDINGS ===\n");
  for (const rec of recordings) {
    const videoUrl = `${BASE_PATH}/recordings/${rec.file}`;

    await db.lesson.update({
      where: { id: rec.lessonId },
      data: {
        videoUrl,
        content: [
          `Teams Recording: ${rec.file}`,
          `Size: ${rec.sizeMB} MB`,
          `Recorded: ${rec.teamsTimestamp}`,
          rec.file.includes("fatima gul") ? "Joint session with Fatima Gul" : "",
        ].filter(Boolean).join("\n"),
      },
    });

    console.log(`  ${rec.date} | ${rec.file} (${rec.sizeMB}MB)`);
  }

  // 2. Create Homework records
  console.log("\n=== HOMEWORK FILES ===\n");

  // Clear existing homework for Ayse to avoid duplicates
  await db.homework.deleteMany({ where: { studentId: AYSE_ID } });

  for (const hw of homeworks) {
    const filePath = `${BASE_PATH}/assignments/${hw.fileName}`;

    await db.homework.create({
      data: {
        studentId: AYSE_ID,
        title: hw.title,
        content: [
          `Topic: ${hw.topic}`,
          `File: ${filePath}`,
          `Assigned after lesson on ${hw.lessonDate}`,
        ].join("\n"),
        dueDate: new Date(hw.dueDate),
        status: new Date(hw.dueDate) < new Date() ? "COMPLETED" : "PENDING",
        createdAt: new Date(hw.assignedDate),
      },
    });

    console.log(`  ${hw.assignedDate} | ${hw.title} (${hw.fileName})`);
  }

  // 3. Verify
  console.log("\n=== VERIFICATION ===\n");

  const lessonCount = await db.lesson.count({
    where: {
      videoUrl: { not: null },
      attendances: { some: { studentId: AYSE_ID } },
    },
  });

  const hwCount = await db.homework.count({
    where: { studentId: AYSE_ID },
  });

  console.log(`Lessons with recordings: ${lessonCount}`);
  console.log(`Homework records: ${hwCount}`);
  console.log(`\nFiles stored at: d:/AHK ACADEMY/${BASE_PATH}/`);
  console.log("Done!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
