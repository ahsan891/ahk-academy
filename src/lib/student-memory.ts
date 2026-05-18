/**
 * Student Memory Service
 *
 * Maintains a cumulative AI-generated knowledge document per student.
 * After each lesson: transcript → AI summary → merge into memory.
 * Every AI call reads this memory for full context.
 *
 * Flow:
 *   1. Teacher uploads transcript (or lesson completes)
 *   2. processLesson() → AI summarizes the lesson
 *   3. AI reads existing memory + new summary → updates cumulative memory
 *   4. Structured fields (level, strengths, weaknesses) are extracted
 *   5. Any future AI call reads getMemory() for full student context
 */

import { db } from "@/lib/db";
import { AIService } from "@/lib/ai-service";

export interface StudentContext {
  cumulativeSummary: string;
  currentLevel: string | null;
  topicsCovered: string[];
  strengths: string[];
  weaknesses: string[];
  totalLessons: number;
  lastLessonDate: string | null;
  lastLessonTopic: string | null;
}

/**
 * Get the full AI memory for a student. Returns null if no memory exists yet.
 */
export async function getMemory(studentId: string): Promise<StudentContext | null> {
  const memory = await db.studentMemory.findUnique({
    where: { studentId },
  });

  if (!memory) return null;

  return {
    cumulativeSummary: memory.cumulativeSummary,
    currentLevel: memory.currentLevel,
    topicsCovered: safeParseArray(memory.topicsCovered),
    strengths: safeParseArray(memory.strengths),
    weaknesses: safeParseArray(memory.weaknesses),
    totalLessons: memory.totalLessonsProcessed,
    lastLessonDate: memory.lastLessonDate?.toISOString().split("T")[0] || null,
    lastLessonTopic: memory.lastLessonTopic,
  };
}

/**
 * Build a prompt-ready context string for any AI call about this student.
 */
export async function getMemoryForPrompt(studentId: string): Promise<string> {
  const memory = await getMemory(studentId);
  if (!memory) return "No prior lesson data available for this student.";

  return `=== STUDENT MEMORY (${memory.totalLessons} lessons processed) ===
Level: ${memory.currentLevel || "Unknown"}
Topics covered: ${memory.topicsCovered.join(", ") || "None yet"}
Strengths: ${memory.strengths.join(", ") || "Not assessed yet"}
Weaknesses: ${memory.weaknesses.join(", ") || "Not assessed yet"}
Last lesson: ${memory.lastLessonDate || "N/A"} — ${memory.lastLessonTopic || "N/A"}

${memory.cumulativeSummary}
=== END MEMORY ===`;
}

/**
 * Process a new lesson and update the student's memory.
 * This is the core function — call after transcript upload or lesson analysis.
 */
export async function processLesson(params: {
  studentId: string;
  lessonDate: Date;
  lessonTopic: string;
  transcript?: string;
  analysisData?: string;
  homeworkGiven?: string;
  teacherNotes?: string;
}): Promise<void> {
  const { studentId, lessonDate, lessonTopic, transcript, analysisData, homeworkGiven, teacherNotes } = params;

  // Get student info
  const student = await db.user.findUnique({
    where: { id: studentId },
    select: { name: true },
  });
  const studentName = student?.name || "Student";

  // Get existing memory
  const existing = await db.studentMemory.findUnique({
    where: { studentId },
  });

  // Step 1: AI summarizes this specific lesson
  const lessonSummaryPrompt = `Summarize this English lesson for student "${studentName}".

Topic: ${lessonTopic}
Date: ${lessonDate.toISOString().split("T")[0]}
${transcript ? `\nTranscript:\n${transcript.slice(0, 8000)}` : ""}
${analysisData ? `\nAnalysis:\n${analysisData}` : ""}
${homeworkGiven ? `\nHomework assigned: ${homeworkGiven}` : ""}
${teacherNotes ? `\nTeacher notes: ${teacherNotes}` : ""}

Write a concise summary (3-5 sentences) covering:
1. What was taught
2. How the student performed
3. Key vocabulary or grammar covered
4. Any issues or notable moments

Return ONLY the summary text.`;

  let lessonSummary: string;
  let modelUsed: string;

  try {
    const result = await AIService.generate(lessonSummaryPrompt,
      "You are an ESL teacher's assistant. Write concise, factual lesson summaries."
    );
    lessonSummary = result.text;
    modelUsed = result.model;
  } catch {
    // Fallback: create a basic summary from available data
    lessonSummary = `${studentName} attended a lesson on "${lessonTopic}" on ${lessonDate.toISOString().split("T")[0]}.${analysisData ? " " + analysisData.slice(0, 200) : ""}`;
    modelUsed = "fallback";
  }

  // Step 2: AI merges new summary into cumulative memory
  const existingSummary = existing?.cumulativeSummary || "No prior data.";

  const mergePrompt = `You are maintaining a cumulative knowledge file about ESL student "${studentName}".

EXISTING MEMORY:
${existingSummary}

NEW LESSON (${lessonDate.toISOString().split("T")[0]} — ${lessonTopic}):
${lessonSummary}

Update the cumulative memory document. The document should:
1. Be a comprehensive running record of everything known about this student
2. Track their progression through topics (what they've mastered vs struggling with)
3. Note patterns in attendance, homework, engagement
4. Record vocabulary they've learned and grammar points covered
5. Note personality traits, learning style, common mistakes
6. Keep it organized chronologically but grouped by theme
7. Be concise but complete — this will be read by AI before every future interaction

Also extract structured data. Return a JSON object:
{
  "updatedSummary": "The full updated cumulative document...",
  "currentLevel": "A1/A2/B1/B2/C1/C2 estimate",
  "topicsCovered": ["topic1", "topic2", ...],
  "topicsStruggling": ["topic1", ...],
  "strengths": ["strength1", "strength2", ...],
  "weaknesses": ["weakness1", "weakness2", ...],
  "vocabularyNotes": "Key vocabulary observations",
  "grammarNotes": "Key grammar observations",
  "personalityNotes": "Learning style, motivation, patterns",
  "homeworkPatterns": "Completion rate, quality notes",
  "attendancePatterns": "Punctuality, cancellation patterns"
}

Return ONLY valid JSON.`;

  let updatedData: Record<string, unknown>;

  try {
    const result = await AIService.generate(mergePrompt,
      "You are an expert ESL teaching assistant maintaining detailed student records. Always return valid JSON."
    );

    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    updatedData = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
  } catch {
    // Fallback: just append the new summary
    updatedData = {
      updatedSummary: `${existingSummary}\n\n[${lessonDate.toISOString().split("T")[0]}] ${lessonTopic}: ${lessonSummary}`,
    };
  }

  // Step 3: Save to database
  const totalLessons = (existing?.totalLessonsProcessed || 0) + 1;

  await db.studentMemory.upsert({
    where: { studentId },
    create: {
      studentId,
      cumulativeSummary: (updatedData.updatedSummary as string) || lessonSummary,
      currentLevel: (updatedData.currentLevel as string) || null,
      topicsCovered: JSON.stringify(updatedData.topicsCovered || [lessonTopic]),
      topicsStruggling: JSON.stringify(updatedData.topicsStruggling || []),
      strengths: JSON.stringify(updatedData.strengths || []),
      weaknesses: JSON.stringify(updatedData.weaknesses || []),
      vocabularyNotes: (updatedData.vocabularyNotes as string) || null,
      grammarNotes: (updatedData.grammarNotes as string) || null,
      personalityNotes: (updatedData.personalityNotes as string) || null,
      homeworkPatterns: (updatedData.homeworkPatterns as string) || null,
      attendancePatterns: (updatedData.attendancePatterns as string) || null,
      totalLessonsProcessed: totalLessons,
      lastLessonDate: lessonDate,
      lastLessonTopic: lessonTopic,
    },
    update: {
      cumulativeSummary: (updatedData.updatedSummary as string) || `${existingSummary}\n\n[${lessonDate.toISOString().split("T")[0]}] ${lessonTopic}: ${lessonSummary}`,
      currentLevel: (updatedData.currentLevel as string) || existing?.currentLevel,
      topicsCovered: JSON.stringify(updatedData.topicsCovered || safeParseArray(existing?.topicsCovered)),
      topicsStruggling: JSON.stringify(updatedData.topicsStruggling || safeParseArray(existing?.topicsStruggling)),
      strengths: JSON.stringify(updatedData.strengths || safeParseArray(existing?.strengths)),
      weaknesses: JSON.stringify(updatedData.weaknesses || safeParseArray(existing?.weaknesses)),
      vocabularyNotes: (updatedData.vocabularyNotes as string) || existing?.vocabularyNotes,
      grammarNotes: (updatedData.grammarNotes as string) || existing?.grammarNotes,
      personalityNotes: (updatedData.personalityNotes as string) || existing?.personalityNotes,
      homeworkPatterns: (updatedData.homeworkPatterns as string) || existing?.homeworkPatterns,
      attendancePatterns: (updatedData.attendancePatterns as string) || existing?.attendancePatterns,
      totalLessonsProcessed: totalLessons,
      lastLessonDate: lessonDate,
      lastLessonTopic: lessonTopic,
    },
  });

  // Step 4: Save individual entry for history
  const memory = await db.studentMemory.findUnique({ where: { studentId } });
  if (memory) {
    await db.studentMemoryEntry.create({
      data: {
        memoryId: memory.id,
        lessonDate,
        lessonTopic,
        transcript: transcript?.slice(0, 50000) || null, // Store up to 50k chars
        aiSummary: lessonSummary,
        newVocabulary: JSON.stringify(updatedData.topicsCovered || []),
        grammarFocus: (updatedData.grammarNotes as string) || null,
        homeworkGiven: homeworkGiven || null,
        teacherNotes: teacherNotes || null,
        modelUsed,
      },
    });
  }
}

/**
 * Build initial memory from existing data (WhatsApp chats, attendance, homework).
 * Call this once per student to bootstrap their memory from historical data.
 */
export async function buildInitialMemory(studentId: string): Promise<void> {
  const student = await db.user.findUnique({
    where: { id: studentId },
    select: { name: true, createdAt: true },
  });
  if (!student) throw new Error("Student not found");

  // Gather all existing data
  const [attendance, homework, whatsappMsgs, lessons] = await Promise.all([
    db.attendance.findMany({
      where: { studentId },
      include: { lesson: { select: { title: true, date: true, content: true, topics: true, videoUrl: true } } },
      orderBy: { createdAt: "asc" },
    }),
    db.homework.findMany({
      where: { studentId },
      orderBy: { createdAt: "asc" },
    }),
    db.whatsappMessage.findMany({
      where: { conversation: { userId: studentId } },
      orderBy: { sentAt: "asc" },
      take: 500, // Last 500 messages
    }),
    db.lesson.findMany({
      where: { attendances: { some: { studentId, status: "PRESENT" } } },
      orderBy: { date: "asc" },
      select: { title: true, date: true, content: true, topics: true, videoUrl: true },
    }),
  ]);

  const presentLessons = attendance.filter(a => a.status === "PRESENT");
  const absentLessons = attendance.filter(a => a.status === "ABSENT");

  // Build WhatsApp summary (key messages only, not all)
  const chatSummary = whatsappMsgs
    .filter(m => m.messageType === "TEXT" && m.content.length > 10 && m.content.length < 500)
    .slice(-100) // Last 100 text messages
    .map(m => `[${m.direction === "INBOUND" ? student.name : "Teacher"}] ${m.content}`)
    .join("\n");

  const prompt = `Build a comprehensive student profile from all available data.

Student: ${student.name}
Enrolled since: ${student.createdAt.toISOString().split("T")[0]}

LESSONS ATTENDED (${presentLessons.length}):
${presentLessons.map(a => `- ${a.lesson.date?.toISOString().split("T")[0] || "?"}: ${a.lesson.title}${a.lesson.videoUrl ? " [recorded]" : ""}`).join("\n")}

LESSONS MISSED (${absentLessons.length}):
${absentLessons.map(a => `- ${a.lesson.date?.toISOString().split("T")[0] || "?"}: ${a.lesson.title} — Reason: ${a.lesson.content || "unknown"}`).join("\n")}

HOMEWORK (${homework.length}):
${homework.map(h => `- ${h.title} (${h.status}) due ${h.dueDate?.toISOString().split("T")[0] || "?"}`).join("\n")}

WHATSAPP CONVERSATION (recent messages):
${chatSummary.slice(-4000)}

Create a comprehensive student profile document covering:
1. Learning journey: what topics they've studied, in what order
2. Attendance patterns: how often they miss, common reasons
3. Personality: how they communicate, their attitude, life circumstances
4. Strengths and weaknesses observed
5. Current estimated level
6. Recommendations for next steps

Also return structured data. Return JSON:
{
  "updatedSummary": "The full comprehensive profile document...",
  "currentLevel": "A1/A2/B1/B2 estimate",
  "topicsCovered": ["topic1", ...],
  "topicsStruggling": [],
  "strengths": ["strength1", ...],
  "weaknesses": ["weakness1", ...],
  "vocabularyNotes": "...",
  "grammarNotes": "...",
  "personalityNotes": "...",
  "homeworkPatterns": "...",
  "attendancePatterns": "..."
}

Return ONLY valid JSON.`;

  try {
    const result = await AIService.generate(prompt,
      "You are an expert ESL teaching assistant building detailed student profiles from historical data. Be thorough and specific. Always return valid JSON."
    );

    const jsonMatch = result.text.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (data) {
      await db.studentMemory.upsert({
        where: { studentId },
        create: {
          studentId,
          cumulativeSummary: data.updatedSummary || "Profile initialization in progress.",
          currentLevel: data.currentLevel || null,
          topicsCovered: JSON.stringify(data.topicsCovered || []),
          topicsStruggling: JSON.stringify(data.topicsStruggling || []),
          strengths: JSON.stringify(data.strengths || []),
          weaknesses: JSON.stringify(data.weaknesses || []),
          vocabularyNotes: data.vocabularyNotes || null,
          grammarNotes: data.grammarNotes || null,
          personalityNotes: data.personalityNotes || null,
          homeworkPatterns: data.homeworkPatterns || null,
          attendancePatterns: data.attendancePatterns || null,
          totalLessonsProcessed: presentLessons.length,
          lastLessonDate: lessons[lessons.length - 1]?.date || null,
          lastLessonTopic: lessons[lessons.length - 1]?.title || null,
        },
        update: {
          cumulativeSummary: data.updatedSummary,
          currentLevel: data.currentLevel,
          topicsCovered: JSON.stringify(data.topicsCovered || []),
          topicsStruggling: JSON.stringify(data.topicsStruggling || []),
          strengths: JSON.stringify(data.strengths || []),
          weaknesses: JSON.stringify(data.weaknesses || []),
          vocabularyNotes: data.vocabularyNotes,
          grammarNotes: data.grammarNotes,
          personalityNotes: data.personalityNotes,
          homeworkPatterns: data.homeworkPatterns,
          attendancePatterns: data.attendancePatterns,
          totalLessonsProcessed: presentLessons.length,
          lastLessonDate: lessons[lessons.length - 1]?.date || null,
          lastLessonTopic: lessons[lessons.length - 1]?.title || null,
        },
      });
    }
  } catch (error) {
    console.error(`Failed to build memory for ${student.name}:`, error);

    // Fallback: save raw data summary
    const fallback = `Student: ${student.name}\nLessons attended: ${presentLessons.length}\nLessons missed: ${absentLessons.length}\nTopics: ${lessons.map(l => l.title).join(", ")}\nHomework: ${homework.length} assigned`;

    await db.studentMemory.upsert({
      where: { studentId },
      create: {
        studentId,
        cumulativeSummary: fallback,
        totalLessonsProcessed: presentLessons.length,
        lastLessonDate: lessons[lessons.length - 1]?.date || null,
        lastLessonTopic: lessons[lessons.length - 1]?.title || null,
      },
      update: {
        cumulativeSummary: fallback,
        totalLessonsProcessed: presentLessons.length,
      },
    });
  }
}

function safeParseArray(val: string | null | undefined): string[] {
  if (!val) return [];
  try { return JSON.parse(val); } catch { return []; }
}
