import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

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

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can submit exercise answers" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { exerciseId, answer } = body;

    if (!exerciseId || answer === undefined || answer === null) {
      return NextResponse.json(
        { error: "exerciseId and answer are required" },
        { status: 400 }
      );
    }

    const exercise = await db.grammarExercise.findUnique({
      where: { id: exerciseId },
      select: {
        id: true,
        type: true,
        correctAnswer: true,
        explanation: true,
        topicId: true,
      },
    });

    if (!exercise) {
      return NextResponse.json(
        { error: "Exercise not found" },
        { status: 404 }
      );
    }

    const isCorrect = checkAnswer(exercise.type, String(answer), exercise.correctAnswer);

    // Record the attempt
    await db.exerciseAttempt.create({
      data: {
        studentId: session.user.id,
        exerciseId: exercise.id,
        answer: String(answer),
        isCorrect,
      },
    });

    // Upsert student grammar progress
    await db.studentGrammarProgress.upsert({
      where: {
        studentId_topicId: {
          studentId: session.user.id,
          topicId: exercise.topicId,
        },
      },
      create: {
        studentId: session.user.id,
        topicId: exercise.topicId,
        status: "in_progress",
        attempts: 1,
        lastPracticedAt: new Date(),
      },
      update: {
        attempts: { increment: 1 },
        lastPracticedAt: new Date(),
        status: "in_progress",
      },
    });

    return NextResponse.json({
      isCorrect,
      correctAnswer: exercise.correctAnswer,
      explanation: exercise.explanation,
    });
  } catch (error) {
    console.error("Error checking exercise answer:", error);
    return NextResponse.json(
      { error: "Failed to check exercise answer" },
      { status: 500 }
    );
  }
}
