const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// Per-lesson analysis data from comprehensive transcript review
const lessonAnalyses = [
  {
    date: '2026-04-13',
    topic: 'Parts of Speech',
    aiSummary: `First lesson with Brishna. Introduced 7 parts of speech: nouns, verbs, adjectives, adverbs, pronouns, prepositions, conjunctions. Ayse started with near-zero grammar knowledge — couldn't identify basic parts of speech. By end of session she could categorize simple words correctly. Teacher used Turkish-English bilingual explanations throughout. Session was 1h24m. Ayse was engaged and responsive, asked clarifying questions. Strong start to structured grammar curriculum.`,
    newVocabulary: JSON.stringify(['noun', 'verb', 'adjective', 'adverb', 'pronoun', 'preposition', 'conjunction', 'parts of speech']),
    grammarFocus: 'Parts of Speech — 7 categories with definitions and examples',
    homeworkGiven: 'Parts of Speech identification worksheet',
    studentMood: 'Engaged, eager to learn, slightly nervous (first lesson with new teacher)',
    teacherNotes: 'Near-zero grammar foundation. Needs bilingual (Turkish-English) explanations. Quick conceptual learner.',
  },
  {
    date: '2026-04-20',
    topic: 'Nouns and Pronouns — Deep Dive',
    aiSummary: `Deep dive into 10 noun types: common, proper, abstract, material, concrete, countable, uncountable, possessive, compound, collective. Also covered pronoun types (personal, possessive, demonstrative, reflexive). Ayse showed excellent classification ability. Homework from this session scored ~95% accuracy on noun classification — her best performance. Session was 1h22m. Teacher used many real-world Turkish examples to explain abstract vs concrete nouns.`,
    newVocabulary: JSON.stringify(['abstract noun', 'material noun', 'concrete noun', 'countable', 'uncountable', 'possessive noun', 'compound noun', 'collective noun', 'reflexive pronoun', 'demonstrative pronoun']),
    grammarFocus: '10 noun types + pronoun types (personal, possessive, demonstrative, reflexive)',
    homeworkGiven: 'Noun Types classification worksheet (submitted — 95% accuracy)',
    studentMood: 'Confident, very engaged, enjoyed classification exercises',
    teacherNotes: 'Excellent at categorization tasks. This is her strongest skill area. Scored near-perfect on noun types.',
  },
  {
    date: '2026-04-25',
    topic: 'Verbs and Simple Tenses Introduction',
    aiSummary: `Introduced verbs and simple tenses: present simple, past simple, future simple. Covered verb conjugation basics and subject-verb agreement ("he goes" not "he go"). Ayse grasped the concept quickly but made errors with third-person -s ("she like" → "she likes"). First exposure to tense system. Session was 1h05m. Teacher gave present simple homework template.`,
    newVocabulary: JSON.stringify(['conjugation', 'subject-verb agreement', 'tense', 'present simple', 'past simple', 'future simple', 'auxiliary verb']),
    grammarFocus: 'Verb forms + Present/Past/Future Simple introduction',
    homeworkGiven: 'Present Simple Homework template (not submitted)',
    studentMood: 'Focused, slightly overwhelmed by tense system but persevered',
    teacherNotes: 'Grasps tense concepts fast but needs drilling on subject-verb agreement (-s for third person).',
  },
  {
    date: '2026-04-28',
    topic: 'Simple Tenses — All 4 Forms',
    aiSummary: `Practiced all 4 sentence forms for simple tenses: positive, negative, question, negative question. Covered do/does/did auxiliaries. Ayse can now produce basic sentences in all forms: "I go / I don't go / Do I go? / Don't I go?" for present, "I went / I didn't go / Did I go?" for past, "I will go / I won't go / Will I go?" for future. Session was 1h12m. Noticeable improvement in sentence construction from Apr 25.`,
    newVocabulary: JSON.stringify(['auxiliary', 'negative', 'question form', 'negative question', 'do/does/did']),
    grammarFocus: 'Simple Tenses: positive, negative, question, negative question forms for all 3 tenses',
    homeworkGiven: 'Practice sentence forms (completed in class)',
    studentMood: 'Confident, producing sentences independently',
    teacherNotes: 'Good progress. Can construct all 4 forms. Still occasional do/does confusion but self-corrects.',
  },
  {
    date: '2026-05-05',
    topic: 'Continuous Tenses',
    aiSummary: `Learned past continuous (was/were + V-ing), present continuous (am/is/are + V-ing), and future continuous (will be + V-ing). Ayse specifically struggled with future continuous — kept forgetting "be" ("I will going" instead of "I will be going"). She said "I forgot use be" during class. Got 8/10 on in-class exercises. Session was 1h10m. Teacher drilled the "be" component repeatedly.`,
    newVocabulary: JSON.stringify(['continuous', 'progressive', '-ing form', 'was/were', 'will be']),
    grammarFocus: 'Past/Present/Future Continuous tenses — formation and usage',
    homeworkGiven: 'Write about 5 phobias using continuous and simple tenses',
    studentMood: 'Slightly frustrated with future continuous but determined',
    teacherNotes: 'Key error pattern: forgets "be" in future continuous. Needs reinforcement. 8/10 on exercises is good.',
  },
  {
    date: '2026-05-07',
    topic: 'Speaking Practice — Personal Topics',
    aiSummary: `Short 13-minute speaking practice session. Discussed phobias, guilty pleasures, and peaceful places. Ayse shared: deep water phobia (can swim but afraid in open sea), guilty pleasure is shopping, peaceful place is her room ("I just sleep"). Produced fragmented but communicative speech. Heavy code-switching to Turkish for abstract concepts. Good for building confidence in free conversation.`,
    newVocabulary: JSON.stringify(['phobia', 'guilty pleasure', 'overcome', 'peaceful', 'deep water']),
    grammarFocus: 'Free conversation practice — applying learned tenses in speech',
    homeworkGiven: 'Write about 5 phobias using continuous/simple tenses',
    studentMood: 'Relaxed, talkative, enjoyed personal topics',
    teacherNotes: 'Speaking is fragmented but communicative. Needs more free conversation to bridge comprehension-production gap.',
  },
  {
    date: '2026-05-12',
    topic: 'Gerunds, Infinitives, and Bare Infinitives',
    aiSummary: `Joint session with Fatima Gul (1h27m). Introduced gerunds (V-ing as noun), infinitives (to + V), and bare infinitives (V after modals). Heavy code-switching to Turkish throughout — both students more comfortable in Turkish for grammar explanations. Ayse was less engaged in grammar portion but very active in social conversation with Fatima Gul. Teacher introduced vocabulary memorization plan: 10 words per lesson. Key confusion: when to use gerund vs infinitive after specific verbs (enjoy + -ing vs want + to).`,
    newVocabulary: JSON.stringify(['gerund', 'infinitive', 'bare infinitive', 'modal verb', 'perception verb', 'enjoy + -ing', 'want + to']),
    grammarFocus: 'Gerunds (V-ing as noun), Infinitives (to + V), Bare Infinitives (V after modals/perception verbs)',
    homeworkGiven: 'Gerunds/Infinitives MCQ worksheet (30 questions) — assigned, PENDING',
    studentMood: 'Social, less focused on grammar, more engaged in conversation with Fatima Gul',
    teacherNotes: 'Group dynamics affect focus — Ayse socializes more than studies in joint sessions. Needs individual practice for grammar drilling.',
  },
  {
    date: '2026-05-18',
    topic: 'Gerunds and Infinitives — Practice and Exercises',
    aiSummary: `Continued gerunds/infinitives from May 12 (1h03m). Exercises and worksheet practice. Noticeable improvement from previous session. Produced correct sentences like "You must clean your room" (bare infinitive) and "I can't speak English" (bare infinitive with modal). Still confuses gerund vs infinitive after certain verbs — said "He decided studying" instead of "He decided to study." Teacher reviewed verb lists: verbs that take gerund only (enjoy, avoid, finish), infinitive only (decide, want, hope), and both (start, begin, like).`,
    newVocabulary: JSON.stringify(['decide + to', 'avoid + -ing', 'finish + -ing', 'hope + to', 'must + bare infinitive', 'can/cannot + bare infinitive']),
    grammarFocus: 'Gerund/Infinitive verb patterns — which verbs take which form',
    homeworkGiven: 'Gerunds/Infinitives MCQ (30 questions) — reminder to complete',
    studentMood: 'Focused, improved, producing correct sentences more often',
    teacherNotes: 'Clear improvement from May 12. Verb pattern memorization is the next challenge. Needs consistent practice with verb + gerund/infinitive lists.',
  },
];

async function main() {
  const ayse = await prisma.user.findFirst({ where: { email: 'ayse@ahkacademy.student' } });
  if (!ayse) { console.log('Ayse not found'); return; }

  const memory = await prisma.studentMemory.findUnique({ where: { studentId: ayse.id } });
  if (!memory) { console.log('Ayse memory not found — run seed-ayse-memory.js first'); return; }

  // Load transcript texts
  const transcriptsPath = path.join(__dirname, '..', 'tmp-transcripts.json');
  const transcripts = JSON.parse(fs.readFileSync(transcriptsPath, 'utf-8'));
  const transcriptMap = {};
  for (const t of transcripts) {
    transcriptMap[t.date] = t.text;
  }

  // Check existing entries
  const existing = await prisma.studentMemoryEntry.count({ where: { memoryId: memory.id } });
  if (existing > 0) {
    console.log(`Already have ${existing} entries. Deleting and re-creating...`);
    await prisma.studentMemoryEntry.deleteMany({ where: { memoryId: memory.id } });
  }

  let created = 0;
  for (const lesson of lessonAnalyses) {
    const transcript = transcriptMap[lesson.date] || null;

    await prisma.studentMemoryEntry.create({
      data: {
        memoryId: memory.id,
        lessonDate: new Date(lesson.date + 'T14:00:00.000Z'),
        lessonTopic: lesson.topic,
        transcript: transcript,
        aiSummary: lesson.aiSummary,
        newVocabulary: lesson.newVocabulary,
        grammarFocus: lesson.grammarFocus,
        homeworkGiven: lesson.homeworkGiven,
        studentMood: lesson.studentMood,
        teacherNotes: lesson.teacherNotes,
        modelUsed: 'manual-transcript-analysis',
      },
    });
    created++;
    const transcriptLen = transcript ? transcript.length : 0;
    console.log(`${lesson.date}: ${lesson.topic} (transcript: ${transcriptLen} chars)`);
  }

  console.log(`\nCreated ${created} memory entries for Ayse.`);

  // Verify
  const total = await prisma.studentMemoryEntry.count({ where: { memoryId: memory.id } });
  console.log('Total entries in DB:', total);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
