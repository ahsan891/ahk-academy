const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const ayse = await prisma.user.findFirst({ where: { email: 'ayse@ahkacademy.student' } });
  if (!ayse) { console.log('Ayse not found!'); return; }

  const cumulativeSummary = `# Ayse — Student Profile

## Personal
- 21 years old, Turkish
- Career goal: car designer at Mercedes
- Lives with family (close with cousins and sister)
- Peaceful place: her room (she just sleeps)
- Phobia: deep water (can swim but afraid in open sea from a boat)
- Guilty pleasure: shopping

## Learning Journey

### Phase 1: Ahsan (Nov 2025 – Mar 2026) — 30 sessions
- First teacher. Built foundational basics.
- 30 sessions, all attended (100% attendance in this phase)
- Topics unknown in detail (pre-recording era)

### Phase 2: Brishna (Apr 2026 – ongoing) — 8+ recorded sessions
Brishna took over in April 2026. Progression:

**Apr 13 (1h24m):** Parts of Speech — first lesson with Brishna. Learned 7 parts of speech (nouns, verbs, adjectives, adverbs, pronouns, prepositions, conjunctions). Near-zero grammar knowledge at start.

**Apr 20 (1h22m):** Nouns & Pronouns — deep dive into 10 noun types (common, proper, abstract, material, concrete, countable, uncountable, possessive, compound, collective). Also covered pronoun types. Homework submitted: scored ~95% on noun classification.

**Apr 25 (1h05m):** Verbs & Simple Tenses — present/past/future simple tense introduction. Learned verb conjugation, subject-verb agreement.

**Apr 28 (1h12m):** Simple Tenses all 4 forms — positive, negative, question, negative question for all 3 simple tenses. Can produce basic sentences in all forms.

**May 5 (1h10m):** Continuous Tenses — past/present/future continuous. Learned was/were + V-ing, am/is/are + V-ing, will be + V-ing. Struggled with "be" in future continuous ("I forgot use be"). Got 8/10 on exercises.

**May 7 (13m):** Speaking Practice — discussed phobias, guilty pleasures, peaceful places. Short session. Homework: write about 5 phobias using continuous/simple tenses.

**May 12 (1h27m):** Gerunds, Infinitives, Bare Infinitives — joint session with Fatima Gul. Heavy code-switching to Turkish. Less engaged in grammar portion but very active in social conversation. Teacher introduced vocabulary memorization plan (10 words per lesson).

**May 18 (1h03m):** Gerunds/Infinitives continued — exercises and worksheet. Noticeable improvement. Produced correct sentences like "You must clean your room" and "I can't speak English." Still confuses gerund vs infinitive after certain verbs (decide, want).

## Current Level: A2 moving toward B1
- Comprehension: B1 (follows teacher explanations, does well on exercises)
- Production/Speaking: A2 (fragmented speech, pauses, Turkish code-switching)
- Writing: A2 (apostrophe issues, capitalization errors, but good classification accuracy)

## Strengths
- Fast conceptual learner — grasps grammar rules quickly
- High accuracy on structured exercises (~80-90%)
- Self-corrects when prompted
- Very engaged and motivated
- Strong social skills in group settings
- Visibly improving session to session
- Excellent noun/vocabulary classification (near-perfect scores)

## Weaknesses
- Missing or incorrect auxiliary verbs ("it's make me relax" → "it makes")
- Gerund/infinitive confusion ("He decided studying" → "to study")
- Article errors ("the Istanbul", "the spiders")
- Word order collapses in free speech
- Heavy Turkish code-switching for abstract concepts
- Apostrophe issues in possessives ("aishas bag" → "Aisha's bag")
- Capitalization ("i" → "I", "istanbul" → "Istanbul")
- Cannot express abstract ideas fluently yet
- Fragmented speech with many false starts

## Homework Status
- Noun Types worksheet: COMPLETED (95%+ accuracy)
- Present Simple Homework: Template given, not submitted yet
- Gerunds/Infinitives MCQ (30 questions): Assigned May 18, PENDING
- Continuous Tenses: Completed in class exercises

## Teaching Notes
- Turkish-English bilingual explanations are essential at this stage
- Best approach: Explain concept → Examples → Practice → Break → Exercises/worksheet
- Needs more free conversation practice to bridge comprehension-production gap
- Responds well to real-life examples and personal topics
- Cancels occasionally for dental issues
- Schedule: afternoons (Mon/Fri with Brishna)
`;

  const topicsCovered = JSON.stringify([
    "Parts of Speech (7 types)",
    "Nouns (10 types: common, proper, abstract, material, concrete, countable, uncountable, possessive, compound, collective)",
    "Pronouns and Types",
    "Verbs and Forms",
    "Simple Tenses (Present, Past, Future) - all 4 forms",
    "Continuous Tenses (Present, Past, Future) - all 4 forms",
    "Gerunds",
    "Infinitives",
    "Bare Infinitives",
    "TOEFL Reading Practice",
    "Listening Skills",
    "Speaking Practice (phobias, personal topics)",
    "Writing Tasks"
  ]);

  const topicsStruggling = JSON.stringify([
    "Gerund vs Infinitive usage after specific verbs",
    "Future Continuous (forgetting 'be')",
    "Articles (the/a/an usage)",
    "Apostrophes in possessives",
    "Capitalization rules",
    "Free speech fluency (word order collapses)"
  ]);

  const strengths = JSON.stringify([
    "Fast conceptual learner",
    "High accuracy on structured exercises (80-90%)",
    "Self-corrects when prompted",
    "Excellent noun classification (95%+)",
    "Engaged and motivated",
    "Strong social skills in group settings",
    "Improving noticeably session to session"
  ]);

  const weaknesses = JSON.stringify([
    "Missing/incorrect auxiliary verbs",
    "Gerund/infinitive confusion",
    "Article errors (the Istanbul, the spiders)",
    "Word order collapses in free speech",
    "Heavy Turkish code-switching",
    "Apostrophe and capitalization errors",
    "Cannot express abstract ideas fluently",
    "Fragmented speech with false starts"
  ]);

  // Get last lesson date
  const lastLesson = await prisma.lesson.findFirst({
    where: { attendances: { some: { studentId: ayse.id, status: 'PRESENT' } } },
    orderBy: { date: 'desc' },
  });

  await prisma.studentMemory.upsert({
    where: { studentId: ayse.id },
    create: {
      studentId: ayse.id,
      cumulativeSummary,
      currentLevel: 'A2',
      topicsCovered,
      topicsStruggling,
      strengths,
      weaknesses,
      vocabularyNotes: 'Limited active vocabulary. Understands more than she produces. Key words learned: phobia, guilty pleasure, overcome, perception verbs, gerund, infinitive, bare infinitive, compound noun, collective noun. Needs 10-word-per-lesson vocabulary building plan.',
      grammarNotes: 'Covered Parts of Speech through Gerunds/Infinitives. Solid on noun types and simple tenses. Continuous tenses understood but struggles with future continuous (forgets "be"). Gerund/infinitive rules partially learned — confuses which verbs take which form.',
      personalityNotes: 'Very motivated — wants to be a car designer at Mercedes. Social and friendly in group settings. Prefers bilingual (Turkish-English) explanations. Cancels occasionally for dental issues. Responds well to personal topics and real-life examples.',
      homeworkPatterns: 'Submitted 1 of 3 assigned homeworks (noun types — 95% accuracy). Present Simple and Gerunds MCQ still pending. In-class exercise accuracy is higher than homework submission rate.',
      attendancePatterns: '40 total sessions (30 with Ahsan at 100%, 10 with Brishna at 80%). Overall 95% attendance. Occasional dental-related absences.',
      totalLessonsProcessed: 38, // 30 Ahsan + 8 Brishna recorded
      lastLessonDate: lastLesson?.date || new Date('2026-05-18'),
      lastLessonTopic: 'Gerunds and Infinitives',
    },
    update: {
      cumulativeSummary,
      currentLevel: 'A2',
      topicsCovered,
      topicsStruggling,
      strengths,
      weaknesses,
      vocabularyNotes: 'Limited active vocabulary. Understands more than she produces. Key words learned: phobia, guilty pleasure, overcome, perception verbs, gerund, infinitive, bare infinitive, compound noun, collective noun. Needs 10-word-per-lesson vocabulary building plan.',
      grammarNotes: 'Covered Parts of Speech through Gerunds/Infinitives. Solid on noun types and simple tenses. Continuous tenses understood but struggles with future continuous (forgets "be"). Gerund/infinitive rules partially learned — confuses which verbs take which form.',
      personalityNotes: 'Very motivated — wants to be a car designer at Mercedes. Social and friendly in group settings. Prefers bilingual (Turkish-English) explanations. Cancels occasionally for dental issues. Responds well to personal topics and real-life examples.',
      homeworkPatterns: 'Submitted 1 of 3 assigned homeworks (noun types — 95% accuracy). Present Simple and Gerunds MCQ still pending. In-class exercise accuracy is higher than homework submission rate.',
      attendancePatterns: '40 total sessions (30 with Ahsan at 100%, 10 with Brishna at 80%). Overall 95% attendance. Occasional dental-related absences.',
      totalLessonsProcessed: 38,
      lastLessonDate: lastLesson?.date || new Date('2026-05-18'),
      lastLessonTopic: 'Gerunds and Infinitives',
    },
  });

  console.log('Ayse student memory initialized!');

  // Verify
  const memory = await prisma.studentMemory.findUnique({ where: { studentId: ayse.id } });
  console.log('Level:', memory.currentLevel);
  console.log('Lessons processed:', memory.totalLessonsProcessed);
  console.log('Last lesson:', memory.lastLessonDate, '—', memory.lastLessonTopic);
  console.log('Summary length:', memory.cumulativeSummary.length, 'chars');

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
