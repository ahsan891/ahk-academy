import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { lessonId, transcript, classId } = body;

  // Get lesson info
  const lesson = lessonId
    ? await db.lesson.findUnique({
        where: { id: lessonId },
        include: { class: { include: { course: true } } },
      })
    : null;

  const courseName = lesson?.class.course.title || "English";
  const lessonTitle = lesson?.title || "Lesson";
  const lessonTopics = lesson?.topics || "";

  // Build prompt for Claude
  const prompt = `You are an English teacher at AHK Academy. Based on the following lesson information, create a personalized homework assignment.

Course: ${courseName}
Lesson: ${lessonTitle}
Topics Covered: ${lessonTopics}
${transcript ? `\nLesson Transcript:\n${transcript}` : ""}

Create a homework assignment that:
1. Reinforces what was taught in this lesson
2. Includes a mix of exercises (fill in the blanks, short answers, writing practice)
3. Is appropriate for the student's level
4. Takes about 30-45 minutes to complete

Format the homework clearly with numbered questions. Include an answer key at the end marked with "--- ANSWER KEY ---".

Return ONLY the homework content, no extra commentary.`;

  // Check if API key is available
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // Return a template homework if no API key
    const templateHomework = generateTemplateHomework(lessonTitle, lessonTopics);

    if (classId) {
      const assignment = await db.assignment.create({
        data: {
          classId,
          title: `Homework: ${lessonTitle}`,
          description: templateHomework,
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 1 week
        },
      });
      return NextResponse.json({ assignment, homework: templateHomework });
    }

    return NextResponse.json({ homework: templateHomework });
  }

  // Call Claude API
  const client = new Anthropic({ apiKey });
  const message = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const homework =
    message.content[0].type === "text" ? message.content[0].text : "";

  // Create assignment in database if classId provided
  if (classId) {
    const assignment = await db.assignment.create({
      data: {
        classId,
        title: `Homework: ${lessonTitle}`,
        description: homework,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });
    return NextResponse.json({ assignment, homework });
  }

  return NextResponse.json({ homework });
}

function generateTemplateHomework(title: string, topics: string): string {
  return `HOMEWORK: ${title}

Based on today's lesson covering: ${topics || "General English"}

Part 1: Vocabulary (10 points)
Write the meaning of the following words from today's lesson and use each in a sentence.
1. _______________
2. _______________
3. _______________
4. _______________
5. _______________

Part 2: Grammar Practice (10 points)
Complete the following sentences using the correct form:
1. She ___ (go) to school every day.
2. They ___ (be) very happy yesterday.
3. I ___ (study) English for two months now.
4. He ___ (not/like) coffee.
5. We ___ (meet) at the park tomorrow.

Part 3: Writing (10 points)
Write a short paragraph (5-7 sentences) about the topic discussed in today's lesson. Use at least 3 new vocabulary words.

Part 4: Listening & Speaking Practice
Record yourself reading the paragraph you wrote in Part 3. Pay attention to pronunciation.

---
Note: This is a template homework. Connect your Anthropic API key for AI-generated personalized homework.`;
}
