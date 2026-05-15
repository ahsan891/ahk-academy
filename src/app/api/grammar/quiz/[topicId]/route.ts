import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function checkAnswer(
  type: string,
  userAnswer: string,
  correctAnswer: string
): boolean {
  const trimmedUser = userAnswer.trim();
  const trimmedCorrect = correctAnswer.trim();

  if (type === "multiple_choice") {
    return trimmedUser === trimmedCorrect;
  }

  // For fill_in_blank, error_correction, sentence_rewrite:
  // case-insensitive, support | alternatives
  const alternatives = trimmedCorrect
    .split("|")
    .map((alt) => alt.trim().toLowerCase());
  return alternatives.includes(trimmedUser.toLowerCase());
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { topicId } = await params;

    const topic = await db.grammarTopic.findUnique({
      where: { id: topicId },
      select: { id: true, title: true },
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    const allExercises = await db.grammarExercise.findMany({
      where: { topicId },
      select: {
        id: true,
        type: true,
        difficulty: true,
        question: true,
        options: true,
        order: true,
      },
    });

    // Shuffle and take up to 10
    const shuffled = shuffleArray(allExercises);
    const quizExercises = shuffled.slice(0, 10);

    return NextResponse.json({
      topicId: topic.id,
      topicTitle: topic.title,
      totalQuestions: quizExercises.length,
      exercises: quizExercises,
    });
  } catch (error) {
    console.error("Error generating quiz:", error);
    return NextResponse.json(
      { error: "Failed to generate quiz" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ topicId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can submit quizzes" },
        { status: 403 }
      );
    }

    const { topicId } = await params;

    const topic = await db.grammarTopic.findUnique({
      where: { id: topicId },
      select: { id: true },
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(
        { error: "answers array is required" },
        { status: 400 }
      );
    }

    // Fetch all exercises referenced in answers
    const exerciseIds = answers.map(
      (a: { exerciseId: string }) => a.exerciseId
    );
    const exercises = await db.grammarExercise.findMany({
      where: {
        id: { in: exerciseIds },
        topicId,
      },
    });

    const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

    let correctCount = 0;
    const results: {
      exerciseId: string;
      isCorrect: boolean;
      correctAnswer: string;
      explanation: string;
    }[] = [];

    // Process each answer
    for (const submission of answers as {
      exerciseId: string;
      answer: string;
    }[]) {
      const exercise = exerciseMap.get(submission.exerciseId);
      if (!exercise) continue;

      const isCorrect = checkAnswer(
        exercise.type,
        String(submission.answer),
        exercise.correctAnswer
      );

      if (isCorrect) correctCount++;

      // Record attempt
      await db.exerciseAttempt.create({
        data: {
          studentId: session.user.id,
          exerciseId: exercise.id,
          answer: String(submission.answer),
          isCorrect,
        },
      });

      results.push({
        exerciseId: exercise.id,
        isCorrect,
        correctAnswer: exercise.correctAnswer,
        explanation: exercise.explanation,
      });
    }

    const total = results.length;
    const percentage = total > 0 ? Math.round((correctCount / total) * 100) : 0;

    // Get current progress to check existing quiz score
    const existingProgress = await db.studentGrammarProgress.findUnique({
      where: {
        studentId_topicId: {
          studentId: session.user.id,
          topicId,
        },
      },
    });

    // Determine new status based on score
    let newStatus = "in_progress";
    if (percentage >= 90) {
      newStatus = "mastered";
    } else if (percentage >= 70) {
      newStatus = "completed";
    }

    // Only update quiz score if it's better than the current one
    const shouldUpdateScore =
      !existingProgress || percentage > existingProgress.quizScore;

    // Determine if newly completed
    const isNewlyCompleted =
      (newStatus === "completed" || newStatus === "mastered") &&
      (!existingProgress ||
        (existingProgress.status !== "completed" &&
          existingProgress.status !== "mastered"));

    await db.studentGrammarProgress.upsert({
      where: {
        studentId_topicId: {
          studentId: session.user.id,
          topicId,
        },
      },
      create: {
        studentId: session.user.id,
        topicId,
        status: newStatus,
        quizScore: percentage,
        attempts: total,
        lastPracticedAt: new Date(),
        completedAt:
          newStatus === "completed" || newStatus === "mastered"
            ? new Date()
            : null,
      },
      update: {
        ...(shouldUpdateScore ? { quizScore: percentage } : {}),
        ...(newStatus === "mastered" ||
        (newStatus === "completed" &&
          existingProgress?.status !== "mastered")
          ? { status: newStatus }
          : {}),
        attempts: { increment: total },
        lastPracticedAt: new Date(),
        ...(isNewlyCompleted ? { completedAt: new Date() } : {}),
      },
    });

    // Mark assignment as completed if score >= 70
    if (percentage >= 70) {
      await db.grammarAssignment
        .updateMany({
          where: {
            studentId: session.user.id,
            topicId,
            isCompleted: false,
          },
          data: { isCompleted: true },
        })
        .catch(() => {
          // Assignment may not exist, that's fine
        });
    }

    return NextResponse.json({
      score: correctCount,
      total,
      percentage,
      results,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      { error: "Failed to submit quiz" },
      { status: 500 }
    );
  }
}
