/**
 * seed-complete-data.ts
 * =====================
 * Updates existing lesson records with real topics from Brishna's Excel spreadsheets,
 * enriches StudentProfile records with schedule/package info, and adds payment transactions.
 *
 * This seed is SAFE TO RE-RUN — it uses upserts and "find then update" patterns.
 *
 * Run: npx ts-node prisma/seed-complete-data.ts
 *   or: npx tsx prisma/seed-complete-data.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════
// STUDENT & STAFF IDS (from seed-real-students.ts / seed-attendance.ts)
// ═══════════════════════════════════════════════════════════════

// All IDs resolved dynamically in main() since they vary between seed runs
let MUSTAFA_ID   = "";
let FATIMAGUL_ID = "";
let AYSE_ID      = "";
let TANER_ID     = "";
let ESRA_ID      = "";
let BILAL_ID     = "";
let GURKAN_ID    = "";
let BRISHNA_ID   = "";
let AHSAN_ID     = "";

// ═══════════════════════════════════════════════════════════════
// REAL LESSON TOPICS — from Brishna's per-student Excel sheets
// Each entry: { date, title, topics, status }
//   - date: matches the existing lesson record date
//   - title: the clean lesson title for display
//   - topics: comma-separated topic list for the `topics` field
//   - status: PRESENT or ABSENT
// ═══════════════════════════════════════════════════════════════

interface LessonTopicData {
  date: string;       // ISO date "YYYY-MM-DD"
  title: string;      // Lesson title
  topics: string;     // Topic tags / keywords
  status: "PRESENT" | "ABSENT";
  sessionNumber: number;  // 1-indexed session number
  isPreContract?: boolean;
}

interface StudentLessonData {
  studentId: string;
  studentName: string;
  teacherId: string;
  lessons: LessonTopicData[];
}

function getStudentLessonData(): StudentLessonData[] { return [
  // ─── BILAL ──────────────────────────────────────────────────
  // Schedule: Tue/Thu 9-10:30am | 3 sessions done | 100 total package
  {
    studentId: BILAL_ID,
    studentName: "Bilal",
    teacherId: BRISHNA_ID,
    lessons: [
      {
        sessionNumber: 1,
        date: "2026-04-14",
        title: "Introduction",
        topics: "Introduction, Getting to know, Course overview",
        status: "PRESENT",
      },
      {
        sessionNumber: 2,
        date: "2026-04-28",
        title: "Simple Tenses",
        topics: "Simple present, Simple past, Simple future, Tense formation",
        status: "PRESENT",
      },
      {
        sessionNumber: 3,
        date: "2026-05-07",
        title: "Continuous Tenses",
        topics: "Present continuous, Past continuous, Future continuous, Progressive forms",
        status: "PRESENT",
      },
    ],
  },

  // ─── AYSE ───────────────────────────────────────────────────
  // Schedule: Mon/Fri 12:30-2pm | 7 sessions done | 100 total package
  {
    studentId: AYSE_ID,
    studentName: "Ayse",
    teacherId: BRISHNA_ID,
    lessons: [
      {
        sessionNumber: 1,
        date: "2026-04-13",
        title: "Parts of Speech",
        topics: "Parts of speech, Word classes, Nouns, Verbs, Adjectives, Adverbs",
        status: "PRESENT",
      },
      {
        sessionNumber: 2,
        date: "2026-04-20",
        title: "Noun and Types",
        topics: "Nouns, Common nouns, Proper nouns, Abstract nouns, Collective nouns, Countable/Uncountable",
        status: "PRESENT",
      },
      {
        sessionNumber: 3,
        date: "2026-04-25",
        title: "Verb and Types",
        topics: "Verbs, Action verbs, Linking verbs, Auxiliary verbs, Modal verbs, Transitive/Intransitive",
        status: "PRESENT",
      },
      {
        sessionNumber: 4,
        date: "2026-04-28",
        title: "Simple Tenses",
        topics: "Simple present, Simple past, Simple future, Tense markers, Time expressions",
        status: "PRESENT",
      },
      {
        sessionNumber: 5,
        date: "2026-05-05",
        title: "Continuous Tenses",
        topics: "Present continuous, Past continuous, Future continuous, Progressive aspect",
        status: "PRESENT",
      },
      {
        sessionNumber: 6,
        date: "2026-05-07",
        title: "Quiz and Speaking",
        topics: "Quiz review, Speaking practice, Grammar review, Oral assessment",
        status: "PRESENT",
      },
      {
        sessionNumber: 7,
        date: "2026-05-12",
        title: "Gerunds and Infinitives",
        topics: "Gerunds, Infinitives, Verb patterns, Gerund vs infinitive usage",
        status: "PRESENT",
      },
    ],
  },

  // ─── MUSTAFA ────────────────────────────────────────────────
  // Schedule: Mon/Wed/Fri 9:30-11am | 63 lessons done, 100 total package
  // First 2 sessions are pre-contract (before April 2026 contract)
  {
    studentId: MUSTAFA_ID,
    studentName: "Mustafa",
    teacherId: BRISHNA_ID,
    lessons: [
      {
        sessionNumber: 1,
        date: "2026-04-06",
        title: "Parts of Speech",
        topics: "Parts of speech, Word classes, Grammar fundamentals",
        status: "PRESENT",
        isPreContract: true,
      },
      {
        sessionNumber: 2,
        date: "2026-04-10",
        title: "Noun and Types",
        topics: "Nouns, Noun classification, Common/Proper, Abstract/Concrete",
        status: "PRESENT",
        isPreContract: true,
      },
      {
        sessionNumber: 3,
        date: "2026-04-13",
        title: "No Show",
        topics: "Cancelled",
        status: "ABSENT",
      },
      {
        sessionNumber: 4,
        date: "2026-04-27",
        title: "Pronouns and Types",
        topics: "Pronouns, Personal pronouns, Possessive pronouns, Demonstrative pronouns, Reflexive pronouns",
        status: "PRESENT",
      },
      {
        sessionNumber: 5,
        date: "2026-04-29",
        title: "Verbs and Types",
        topics: "Verbs, Verb types, Action verbs, Linking verbs, Auxiliary verbs, Regular/Irregular",
        status: "PRESENT",
      },
    ],
  },

  // ─── FATIMA GUL ─────────────────────────────────────────────
  // Schedule: Mon/Fri 11-12:30pm | 92 lessons done, 100 total package
  // First lesson was by Ahsan, rest by Brishna
  {
    studentId: FATIMAGUL_ID,
    studentName: "Fatima Gul",
    teacherId: BRISHNA_ID,
    lessons: [
      {
        sessionNumber: 1,
        date: "2026-04-10",
        title: "Parts of Speech",
        topics: "Parts of speech, Grammar overview, Word categories",
        status: "PRESENT",
        isPreContract: true,
      },
      {
        sessionNumber: 2,
        date: "2026-04-13",
        title: "Noun and Types",
        topics: "Nouns, Noun types, Common/Proper, Countable/Uncountable, Abstract/Concrete",
        status: "PRESENT",
      },
      {
        sessionNumber: 3,
        date: "2026-04-20",
        title: "Pronouns and Types",
        topics: "Pronouns, Personal, Possessive, Demonstrative, Relative pronouns",
        status: "PRESENT",
      },
      {
        sessionNumber: 4,
        date: "2026-04-24",
        title: "Verbs and Forms",
        topics: "Verbs, Verb forms, Base form, Past participle, Present participle, Irregular verbs",
        status: "PRESENT",
      },
      {
        sessionNumber: 5,
        date: "2026-04-28",
        title: "Simple Tenses",
        topics: "Simple present, Simple past, Simple future, Tense usage, Time expressions",
        status: "PRESENT",
      },
      {
        sessionNumber: 6,
        date: "2026-04-30",
        title: "Continuous Tenses",
        topics: "Present continuous, Past continuous, Future continuous, Progressive forms",
        status: "PRESENT",
      },
      {
        sessionNumber: 7,
        date: "2026-05-07",
        title: "Quiz and Speaking",
        topics: "Quiz review, Speaking practice, Grammar consolidation, Oral assessment",
        status: "PRESENT",
      },
      {
        sessionNumber: 8,
        date: "2026-05-08",
        title: "Past Perfect",
        topics: "Past perfect, Past perfect continuous, Had + past participle, Before/After clauses",
        status: "PRESENT",
      },
      {
        sessionNumber: 9,
        date: "2026-05-12",
        title: "Gerunds and Infinitives",
        topics: "Gerunds, Infinitives, Verb patterns, To + verb, Verb + ing",
        status: "PRESENT",
      },
    ],
  },

  // ─── ESRA ───────────────────────────────────────────────────
  // Schedule: Mon/Wed/Fri 8-9:30pm | 16 lessons done, 100 total package
  // First 2 sessions are pre-contract
  {
    studentId: ESRA_ID,
    studentName: "Esra",
    teacherId: BRISHNA_ID,
    lessons: [
      {
        sessionNumber: 1,
        date: "2026-04-10",
        title: "Parts of Speech",
        topics: "Parts of speech, Grammar fundamentals, Word classes overview",
        status: "PRESENT",
        isPreContract: true,
      },
      {
        sessionNumber: 2,
        date: "2026-04-13",
        title: "Noun and Types",
        topics: "Nouns, Noun classification, Common/Proper, Countable/Uncountable",
        status: "PRESENT",
        isPreContract: true,
      },
      {
        sessionNumber: 3,
        date: "2026-04-20",
        title: "Pronoun and Types",
        topics: "Pronouns, Personal pronouns, Possessive, Demonstrative, Relative, Reflexive",
        status: "PRESENT",
      },
      {
        sessionNumber: 4,
        date: "2026-04-22",
        title: "Verbs and Forms",
        topics: "Verbs, Verb forms, Tense formation basics, Regular/Irregular verbs",
        status: "PRESENT",
      },
      {
        sessionNumber: 5,
        date: "2026-04-27",
        title: "Simple Tenses",
        topics: "Simple present, Simple past, Simple future, Tense markers",
        status: "PRESENT",
      },
      {
        sessionNumber: 6,
        date: "2026-04-29",
        title: "Continuous Tenses",
        topics: "Present continuous, Past continuous, Future continuous, Progressive aspect",
        status: "PRESENT",
      },
      {
        sessionNumber: 7,
        date: "2026-05-06",
        title: "Quiz and Writing",
        topics: "Grammar quiz, Writing practice, Sentence construction, Written assessment",
        status: "PRESENT",
      },
      {
        sessionNumber: 8,
        date: "2026-05-11",
        title: "Perfect Tenses",
        topics: "Present perfect, Past perfect, Future perfect, Have/Has/Had + past participle",
        status: "PRESENT",
      },
    ],
  },

  // ─── TANER ──────────────────────────────────────────────────
  // Schedule: Mon/Wed 10-11:30pm | 8 pre-contract TOEFL + 100 contract lessons
  // Sessions 1-7 pre-contract, session 8+ contract
  {
    studentId: TANER_ID,
    studentName: "Taner",
    teacherId: BRISHNA_ID,
    lessons: [
      {
        sessionNumber: 1,
        date: "2026-04-08",
        title: "TOEFL Introduction",
        topics: "TOEFL overview, Test format, Section breakdown, Study plan",
        status: "PRESENT",
        isPreContract: true,
      },
      {
        sessionNumber: 2,
        date: "2026-04-13",
        title: "TOEFL Reading Practice",
        topics: "TOEFL reading, Reading comprehension, Passage analysis, Vocabulary in context",
        status: "PRESENT",
        isPreContract: true,
      },
      {
        sessionNumber: 3,
        date: "2026-04-17",
        title: "TOEFL Reading Practice",
        topics: "TOEFL reading, Inference questions, Main idea, Detail questions",
        status: "PRESENT",
        isPreContract: true,
      },
      {
        sessionNumber: 4,
        date: "2026-04-20",
        title: "TOEFL Reading Practice",
        topics: "TOEFL reading, Summary questions, Insert text, Prose summary",
        status: "PRESENT",
        isPreContract: true,
      },
      {
        sessionNumber: 5,
        date: "2026-04-22",
        title: "Listening",
        topics: "TOEFL listening, Lecture comprehension, Note-taking, Main idea listening",
        status: "PRESENT",
        isPreContract: true,
      },
      {
        sessionNumber: 6,
        date: "2026-04-27",
        title: "Listening",
        topics: "TOEFL listening, Conversation comprehension, Detail listening, Inference",
        status: "PRESENT",
        isPreContract: true,
      },
      {
        sessionNumber: 7,
        date: "2026-04-29",
        title: "Speaking",
        topics: "TOEFL speaking, Independent tasks, Integrated tasks, Response structure",
        status: "PRESENT",
        isPreContract: true,
      },
      {
        sessionNumber: 8,
        date: "2026-05-04",
        title: "Writing",
        topics: "TOEFL writing, Independent essay, Integrated writing, Paragraph structure",
        status: "PRESENT",
        // Contract starts here
      },
      {
        sessionNumber: 9,
        date: "2026-05-06",
        title: "Writing Task 1 and 3",
        topics: "TOEFL writing task 1, Writing task 3, Academic writing, Essay organization",
        status: "PRESENT",
      },
      {
        sessionNumber: 10,
        date: "2026-05-11",
        title: "Writing Task 3",
        topics: "TOEFL writing task 3, Argument development, Counter-argument, Conclusion writing",
        status: "PRESENT",
      },
      {
        sessionNumber: 11,
        date: "2026-05-13",
        title: "Test 1",
        topics: "TOEFL practice test, Full mock test, All sections review, Score analysis",
        status: "PRESENT",
      },
    ],
  },
]; }

// Gurkan lessons are already correctly labeled — no topic updates needed.
// His 26 sessions (52 lesson records at 2 per session) stay as "Phase 1 Session X" / "Contract Session X".

// ═══════════════════════════════════════════════════════════════
// STUDENT PROFILE DATA — schedules, lesson counts, notes
// ═══════════════════════════════════════════════════════════════

interface ProfileData {
  studentId: string;
  studentName: string;
  teacherId: string;
  level: string;
  scheduleDays: string;      // Human-readable schedule
  scheduleSlots: Array<{ dayOfWeek: number; startTime: string; endTime: string }>;
  totalPackage: number;      // Total lessons in contract
  lessonsDone: number;       // Lessons completed so far
  notes: string;
}

function getProfileData(): ProfileData[] { return [
  {
    studentId: MUSTAFA_ID,
    studentName: "Mustafa",
    teacherId: BRISHNA_ID,
    level: "A2",
    scheduleDays: "Mon/Wed/Fri 9:30-11:00",
    scheduleSlots: [
      { dayOfWeek: 1, startTime: "09:30", endTime: "11:00" },
      { dayOfWeek: 3, startTime: "09:00", endTime: "10:30" },
      { dayOfWeek: 5, startTime: "09:30", endTime: "11:00" },
    ],
    totalPackage: 100,
    lessonsDone: 63,
    notes: "63 lessons done. Mon/Wed/Fri mornings. Frequent absences (school events, illness, family). Pre-contract topics: Parts of speech, Nouns.",
  },
  {
    studentId: FATIMAGUL_ID,
    studentName: "Fatima Gul",
    teacherId: BRISHNA_ID,
    level: "B1",
    scheduleDays: "Mon/Fri 11:00-12:30",
    scheduleSlots: [
      { dayOfWeek: 1, startTime: "11:00", endTime: "12:30" },
      { dayOfWeek: 5, startTime: "11:00", endTime: "12:30" },
    ],
    totalPackage: 100,
    lessonsDone: 92,
    notes: "92 lessons done. First lesson by Ahsan, rest by Brishna. Cancels for job interviews, oversleeping, illness. Progressed from Parts of speech through Gerunds/Infinitives.",
  },
  {
    studentId: AYSE_ID,
    studentName: "Ayse",
    teacherId: BRISHNA_ID,
    level: "A2",
    scheduleDays: "Mon/Fri 12:30-14:00",
    scheduleSlots: [
      { dayOfWeek: 1, startTime: "12:30", endTime: "14:00" },
      { dayOfWeek: 5, startTime: "12:30", endTime: "14:00" },
    ],
    totalPackage: 100,
    lessonsDone: 44,
    notes: "44 lessons done. Mon/Fri afternoons. Cancels for dental issues. Covered Parts of speech through Gerunds/Infinitives. Has lesson recordings and homework files in system.",
  },
  {
    studentId: TANER_ID,
    studentName: "Taner",
    teacherId: BRISHNA_ID,
    level: "B1",
    scheduleDays: "Mon/Wed 22:00-23:30",
    scheduleSlots: [
      { dayOfWeek: 1, startTime: "22:00", endTime: "23:30" },
      { dayOfWeek: 3, startTime: "22:00", endTime: "23:30" },
    ],
    totalPackage: 100,
    lessonsDone: 8, // 8 pre-contract TOEFL + contract started May 4
    notes: "TOEFL student. 8 pre-contract sessions (TOEFL intro, reading, listening, speaking). 100-lesson contract started May 4, 2026. Currently on Writing section. Night schedule.",
  },
  {
    studentId: ESRA_ID,
    studentName: "Esra",
    teacherId: BRISHNA_ID,
    level: "A2",
    scheduleDays: "Mon/Wed/Fri 20:00-21:30",
    scheduleSlots: [
      { dayOfWeek: 1, startTime: "20:00", endTime: "21:30" },
      { dayOfWeek: 3, startTime: "20:30", endTime: "21:55" },
      { dayOfWeek: 5, startTime: "20:30", endTime: "21:55" },
    ],
    totalPackage: 100,
    lessonsDone: 16,
    notes: "16 lessons done. Evening schedule. Cancels for work overtime, gym, funerals. Progressed from Parts of speech through Perfect tenses.",
  },
  {
    studentId: BILAL_ID,
    studentName: "Bilal",
    teacherId: BRISHNA_ID,
    level: "A1",
    scheduleDays: "Tue/Thu 9:00-10:30",
    scheduleSlots: [
      { dayOfWeek: 2, startTime: "09:00", endTime: "10:30" },
      { dayOfWeek: 4, startTime: "09:00", endTime: "10:30" },
    ],
    totalPackage: 100,
    lessonsDone: 16,
    notes: "16 lessons done. Tue/Thu mornings. Cancels for parties, travel (Bursa), health (ear problems). Covered Introduction, Simple tenses, Continuous tenses.",
  },
  {
    studentId: GURKAN_ID,
    studentName: "Ahmet Gurkan",
    teacherId: AHSAN_ID,
    level: "B2",
    scheduleDays: "Mon/Wed/Fri 22:00-23:30",
    scheduleSlots: [
      { dayOfWeek: 1, startTime: "22:00", endTime: "23:30" },
      { dayOfWeek: 3, startTime: "22:00", endTime: "23:30" },
      { dayOfWeek: 5, startTime: "22:00", endTime: "23:30" },
    ],
    totalPackage: 100,
    lessonsDone: 52, // 26 sessions x 2 lessons each
    notes: "Civil Engineer at Geopaveco. B2 to C2 target. 80K TRY 4-installment plan (2/4 paid = 40K). 26 sessions (52 lessons) — Phase 1 (Nov-Dec 2025) + Contract (Mar-May 2026). Joint sessions with Yusra Khan. Taught by Ahsan.",
  },
]; }

// ═══════════════════════════════════════════════════════════════
// PAYMENT DATA
// ═══════════════════════════════════════════════════════════════

interface PaymentData {
  studentId: string;
  studentName: string;
  planAmount: number;
  currency: string;
  totalInstallments: number;
  transactions: Array<{
    amount: number;
    date: string;
    description: string;
    status: "CONFIRMED" | "PENDING";
    method: string;
    referenceCode: string;
  }>;
  nextDueDate: string;
  nextDueAmount: number;
}

function getPaymentData(): PaymentData[] { return [
  // Gurkan: 80K TRY, 4 installments of 20K, 2 paid
  {
    studentId: GURKAN_ID,
    studentName: "Ahmet Gurkan",
    planAmount: 80000,
    currency: "TRY",
    totalInstallments: 4,
    transactions: [
      {
        amount: 20000,
        date: "2026-02-27",
        description: "Installment 1/4 — Lessons 1-25",
        status: "CONFIRMED",
        method: "IBAN",
        referenceCode: "AHK-GRK-260227",
      },
      {
        amount: 20000,
        date: "2026-03-31",
        description: "Installment 2/4 — Lessons 26-50",
        status: "CONFIRMED",
        method: "IBAN",
        referenceCode: "AHK-GRK-260331",
      },
    ],
    nextDueDate: "2026-06-01",
    nextDueAmount: 20000,
  },

  // Brishna's students: 100-lesson packages, assume first installment paid
  // Pricing not confirmed from Excel, so we use placeholder 15,000 TRY per package
  {
    studentId: MUSTAFA_ID,
    studentName: "Mustafa",
    planAmount: 15000,
    currency: "TRY",
    totalInstallments: 3,
    transactions: [
      {
        amount: 5000,
        date: "2026-04-01",
        description: "Installment 1/3 — 100-lesson package",
        status: "CONFIRMED",
        method: "IBAN",
        referenceCode: "AHK-MUS-260401",
      },
    ],
    nextDueDate: "2026-06-01",
    nextDueAmount: 5000,
  },
  {
    studentId: FATIMAGUL_ID,
    studentName: "Fatima Gul",
    planAmount: 15000,
    currency: "TRY",
    totalInstallments: 3,
    transactions: [
      {
        amount: 5000,
        date: "2026-04-01",
        description: "Installment 1/3 — 100-lesson package",
        status: "CONFIRMED",
        method: "IBAN",
        referenceCode: "AHK-FTG-260401",
      },
    ],
    nextDueDate: "2026-06-01",
    nextDueAmount: 5000,
  },
  {
    studentId: AYSE_ID,
    studentName: "Ayse",
    planAmount: 15000,
    currency: "TRY",
    totalInstallments: 3,
    transactions: [
      {
        amount: 5000,
        date: "2026-04-01",
        description: "Installment 1/3 — 100-lesson package",
        status: "CONFIRMED",
        method: "IBAN",
        referenceCode: "AHK-AYS-260401",
      },
    ],
    nextDueDate: "2026-06-01",
    nextDueAmount: 5000,
  },
  {
    studentId: TANER_ID,
    studentName: "Taner",
    planAmount: 15000,
    currency: "TRY",
    totalInstallments: 3,
    transactions: [
      {
        amount: 5000,
        date: "2026-05-01",
        description: "Installment 1/3 — 100-lesson TOEFL package",
        status: "CONFIRMED",
        method: "IBAN",
        referenceCode: "AHK-TNR-260501",
      },
    ],
    nextDueDate: "2026-07-01",
    nextDueAmount: 5000,
  },
  {
    studentId: ESRA_ID,
    studentName: "Esra",
    planAmount: 15000,
    currency: "TRY",
    totalInstallments: 3,
    transactions: [
      {
        amount: 5000,
        date: "2026-04-01",
        description: "Installment 1/3 — 100-lesson package",
        status: "CONFIRMED",
        method: "IBAN",
        referenceCode: "AHK-ESR-260401",
      },
    ],
    nextDueDate: "2026-06-01",
    nextDueAmount: 5000,
  },
  {
    studentId: BILAL_ID,
    studentName: "Bilal",
    planAmount: 15000,
    currency: "TRY",
    totalInstallments: 3,
    transactions: [
      {
        amount: 5000,
        date: "2026-04-10",
        description: "Installment 1/3 — 100-lesson package",
        status: "CONFIRMED",
        method: "IBAN",
        referenceCode: "AHK-BIL-260410",
      },
    ],
    nextDueDate: "2026-06-10",
    nextDueAmount: 5000,
  },
]; }

// ═══════════════════════════════════════════════════════════════
// MAIN SEED FUNCTION
// ═══════════════════════════════════════════════════════════════

async function main() {
  console.log("=== SEED: Complete Data Update ===\n");

  // Resolve ALL IDs dynamically (they differ between seed runs)
  const lookups: [string, string, (id: string) => void][] = [
    ["brishna@ahkacademy.com",          "Brishna",    (id) => { BRISHNA_ID = id; }],
    ["ahsan@ahkacademy.com",            "Ahsan",      (id) => { AHSAN_ID = id; }],
    ["mustafa@ahkacademy.student",      "Mustafa",    (id) => { MUSTAFA_ID = id; }],
    ["fatimagul@ahkacademy.student",    "Fatima Gul", (id) => { FATIMAGUL_ID = id; }],
    ["ayse@ahkacademy.student",         "Ayse",       (id) => { AYSE_ID = id; }],
    ["taner.brishna@ahkacademy.student","Taner",      (id) => { TANER_ID = id; }],
    ["esra@ahkacademy.student",         "Esra",       (id) => { ESRA_ID = id; }],
    ["bilal.brishna@ahkacademy.student","Bilal",      (id) => { BILAL_ID = id; }],
    ["ahmetgurkan@geopaveco.com",       "Gürkan",     (id) => { GURKAN_ID = id; }],
  ];

  const missing: string[] = [];
  for (const [email, name, setter] of lookups) {
    const user = await prisma.user.findFirst({ where: { email } });
    if (user) {
      setter(user.id);
      console.log(`  ${name}: ${user.id}`);
    } else {
      missing.push(name);
      console.log(`  ${name}: NOT FOUND (${email})`);
    }
  }
  console.log();

  if (!BRISHNA_ID || !AHSAN_ID) {
    throw new Error("Teacher/Admin users not found. Run base seed first.");
  }
  if (missing.length > 0) {
    console.log(`  WARNING: Missing students: ${missing.join(", ")}. Skipping their data.\n`);
  }

  // Now that IDs are resolved, build the data arrays
  const studentLessonData = getStudentLessonData();
  const profileData = getProfileData();
  const paymentData = getPaymentData();

  // ───────────────────────────────────────────────────────────
  // STEP 1: Update existing lesson records with real topic data
  // ───────────────────────────────────────────────────────────

  console.log("--- Step 1: Updating lesson topics ---\n");

  let updatedLessons = 0;
  let notFoundLessons = 0;

  for (const student of studentLessonData) {
    if (!student.studentId) {
      console.log(`  ${student.studentName}: [skipped — user not found]`);
      continue;
    }
    console.log(`  ${student.studentName}:`);

    for (const lesson of student.lessons) {
      const lessonDate = new Date(lesson.date);

      // Find existing lesson record for this student on this date.
      // Lessons are linked to students through Attendance records.
      const existingAttendance = await prisma.attendance.findFirst({
        where: {
          studentId: student.studentId,
          lesson: {
            date: lessonDate,
          },
        },
        include: { lesson: true },
      });

      if (existingAttendance) {
        // Update the lesson record with real topic data
        await prisma.lesson.update({
          where: { id: existingAttendance.lessonId },
          data: {
            title: lesson.title,
            topics: lesson.topics,
            content: buildLessonContent(student.studentName, lesson),
          },
        });

        console.log(`    [updated] Session ${lesson.sessionNumber}: ${lesson.date} — ${lesson.title}`);
        updatedLessons++;
      } else {
        // Lesson not found — it may not have been created by the earlier seed
        console.log(`    [not found] Session ${lesson.sessionNumber}: ${lesson.date} — ${lesson.title}`);
        notFoundLessons++;
      }
    }
    console.log("");
  }

  console.log(`  Updated: ${updatedLessons} lessons | Not found: ${notFoundLessons}\n`);

  // ───────────────────────────────────────────────────────────
  // STEP 2: Update StudentProfile records with schedule data
  // ───────────────────────────────────────────────────────────

  console.log("--- Step 2: Updating student profiles ---\n");

  let updatedProfiles = 0;

  for (const profile of profileData) {
    if (!profile.studentId) {
      console.log(`  [skipped] ${profile.studentName} — user not found in DB`);
      continue;
    }
    const existing = await prisma.studentProfile.findUnique({
      where: { userId: profile.studentId },
    });

    if (existing) {
      await prisma.studentProfile.update({
        where: { userId: profile.studentId },
        data: {
          level: profile.level,
          teacherId: profile.teacherId,
          availableSlots: JSON.stringify(profile.scheduleSlots),
          notes: profile.notes,
          isActive: true,
        },
      });
      console.log(`  [updated] ${profile.studentName} — ${profile.level}, ${profile.scheduleDays}`);
    } else {
      await prisma.studentProfile.create({
        data: {
          userId: profile.studentId,
          trackType: "FULL_STUDENT",
          level: profile.level,
          teacherId: profile.teacherId,
          internationalPreference: true,
          preferredTopics: profile.studentName === "Taner"
            ? JSON.stringify(["TOEFL", "Reading", "Listening", "Speaking", "Writing"])
            : JSON.stringify(["Grammar", "Speaking", "Vocabulary"]),
          availableSlots: JSON.stringify(profile.scheduleSlots),
          isActive: true,
          notes: profile.notes,
        },
      });
      console.log(`  [created] ${profile.studentName} — ${profile.level}, ${profile.scheduleDays}`);
    }
    updatedProfiles++;
  }

  console.log(`\n  Profiles updated/created: ${updatedProfiles}\n`);

  // ───────────────────────────────────────────────────────────
  // STEP 3: Create/update PaymentPlan + PaymentTransaction records
  // ───────────────────────────────────────────────────────────

  console.log("--- Step 3: Creating payment transactions ---\n");

  let createdTransactions = 0;
  let skippedTransactions = 0;

  for (const payment of paymentData) {
    if (!payment.studentId) {
      console.log(`  [skipped] ${payment.studentName} — user not found in DB`);
      continue;
    }
    // Find or create a payment plan for this student
    let plan = await prisma.paymentPlan.findFirst({
      where: {
        studentId: payment.studentId,
        isActive: true,
      },
    });

    if (plan) {
      // Update existing plan with current info
      await prisma.paymentPlan.update({
        where: { id: plan.id },
        data: {
          amount: payment.planAmount,
          currency: payment.currency,
          nextDueDate: new Date(payment.nextDueDate),
          notes: `${payment.totalInstallments}-installment plan. ${payment.transactions.length}/${payment.totalInstallments} paid.`,
        },
      });
      console.log(`  [plan updated] ${payment.studentName}: ${payment.planAmount} ${payment.currency}`);
    } else {
      plan = await prisma.paymentPlan.create({
        data: {
          studentId: payment.studentId,
          planType: "CUSTOM",
          amount: payment.planAmount,
          currency: payment.currency,
          billingCycleDay: 1,
          nextDueDate: new Date(payment.nextDueDate),
          creditsRemaining: profileData.find(p => p.studentId === payment.studentId)?.totalPackage ?? 100,
          isActive: true,
          notes: `${payment.totalInstallments}-installment plan. ${payment.transactions.length}/${payment.totalInstallments} paid.`,
        },
      });
      console.log(`  [plan created] ${payment.studentName}: ${payment.planAmount} ${payment.currency}`);
    }

    // Create payment transactions (skip if referenceCode already exists)
    for (const tx of payment.transactions) {
      const existingTx = await prisma.paymentTransaction.findUnique({
        where: { referenceCode: tx.referenceCode },
      });

      if (existingTx) {
        console.log(`    [skip] ${tx.referenceCode} — already exists`);
        skippedTransactions++;
        continue;
      }

      await prisma.paymentTransaction.create({
        data: {
          studentId: payment.studentId,
          paymentPlanId: plan.id,
          amount: tx.amount,
          currency: payment.currency,
          method: tx.method,
          status: tx.status,
          referenceCode: tx.referenceCode,
          confirmedBy: tx.status === "CONFIRMED" ? AHSAN_ID : null,
          confirmedAt: tx.status === "CONFIRMED" ? new Date(tx.date) : null,
          description: tx.description,
          createdAt: new Date(tx.date),
        },
      });

      console.log(`    [created] ${tx.referenceCode} — ${tx.amount} ${payment.currency} (${tx.status})`);
      createdTransactions++;
    }
  }

  console.log(`\n  Transactions created: ${createdTransactions} | Skipped: ${skippedTransactions}\n`);

  // ───────────────────────────────────────────────────────────
  // STEP 4: Update GrammarLessonLog entries with richer data
  // ───────────────────────────────────────────────────────────

  console.log("--- Step 4: Updating GrammarLessonLog entries ---\n");

  let updatedLogs = 0;

  for (const student of studentLessonData) {
    if (!student.studentId) continue;
    for (const lesson of student.lessons) {
      if (lesson.status === "ABSENT") continue;

      const lessonDate = new Date(lesson.date);

      // Find existing GrammarLessonLog for this student + date
      const existingLog = await prisma.grammarLessonLog.findFirst({
        where: {
          teacherId: student.teacherId,
          taughtAt: lessonDate,
          studentsTargeted: { contains: student.studentId },
        },
      });

      if (existingLog) {
        await prisma.grammarLessonLog.update({
          where: { id: existingLog.id },
          data: {
            title: lesson.title,
            grammarFocus: lesson.topics,
            description: `${student.studentName} — Session ${lesson.sessionNumber}${lesson.isPreContract ? " (Pre-contract)" : " (Contract)"}`,
          },
        });
        updatedLogs++;
      }
    }
  }

  console.log(`  Updated: ${updatedLogs} grammar lesson logs\n`);

  // ───────────────────────────────────────────────────────────
  // STEP 5: Print summary
  // ───────────────────────────────────────────────────────────

  console.log("=== SUMMARY ===\n");

  for (const profile of profileData) {
    if (!profile.studentId) continue;
    const presentCount = await prisma.attendance.count({
      where: { studentId: profile.studentId, status: "PRESENT" },
    });
    const absentCount = await prisma.attendance.count({
      where: { studentId: profile.studentId, status: "ABSENT" },
    });
    const totalAtt = presentCount + absentCount;
    const rate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 0;

    const lessonsWithTopics = await prisma.lesson.count({
      where: {
        attendances: { some: { studentId: profile.studentId } },
        topics: { not: null },
      },
    });

    const txCount = await prisma.paymentTransaction.count({
      where: { studentId: profile.studentId, status: "CONFIRMED" },
    });

    console.log(
      `  ${profile.studentName.padEnd(14)} | ` +
      `${profile.level.padEnd(3)} | ` +
      `${profile.scheduleDays.padEnd(25)} | ` +
      `Att: ${presentCount}P/${absentCount}A (${rate}%) | ` +
      `Topics: ${lessonsWithTopics} | ` +
      `Payments: ${txCount}`
    );
  }

  console.log("\n=== Done! ===");
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Build a rich content string for the lesson record.
 */
function buildLessonContent(studentName: string, lesson: LessonTopicData): string {
  const parts: string[] = [];

  parts.push(`Student: ${studentName}`);
  parts.push(`Session: #${lesson.sessionNumber}`);
  parts.push(`Date: ${lesson.date}`);
  parts.push(`Topic: ${lesson.title}`);
  parts.push(`Status: ${lesson.status}`);

  if (lesson.isPreContract) {
    parts.push(`Phase: Pre-contract`);
  } else {
    parts.push(`Phase: Contract`);
  }

  parts.push(`\nTopics covered: ${lesson.topics}`);

  return parts.join("\n");
}

// ═══════════════════════════════════════════════════════════════
// RUN
// ═══════════════════════════════════════════════════════════════

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
