import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth();
    const studentId = session?.user?.role === "STUDENT" ? session.user.id : null;

    const topic = await db.grammarTopic.findUnique({
      where: { id },
      include: {
        category: {
          select: { id: true, name: true, slug: true },
        },
        lesson: {
          select: { id: true, content: true, examples: true, tips: true },
        },
        exercises: {
          orderBy: { order: "asc" },
          select: {
            id: true,
            type: true,
            difficulty: true,
            question: true,
            options: true,
            correctAnswer: true,
            explanation: true,
            order: true,
          },
        },
        ...(studentId
          ? {
              progress: {
                where: { studentId },
                select: {
                  status: true,
                  lessonRead: true,
                  exerciseScore: true,
                  quizScore: true,
                  attempts: true,
                  lastPracticedAt: true,
                  completedAt: true,
                },
              },
            }
          : {}),
      },
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    // If student, get attempt counts per exercise separately for accuracy
    let exerciseAttemptCounts: Record<string, number> = {};
    if (studentId) {
      const attempts = await db.exerciseAttempt.groupBy({
        by: ["exerciseId"],
        where: {
          studentId,
          exerciseId: { in: topic.exercises.map((e) => e.id) },
        },
        _count: { id: true },
      });
      exerciseAttemptCounts = Object.fromEntries(
        attempts.map((a) => [a.exerciseId, a._count.id])
      );
    }

    const progress = studentId
      ? (topic as typeof topic & { progress?: Record<string, unknown>[] }).progress
      : undefined;

    const result = {
      id: topic.id,
      title: topic.title,
      slug: topic.slug,
      description: topic.description,
      level: topic.level,
      order: topic.order,
      category: topic.category,
      lesson: topic.lesson,
      exercises: topic.exercises.map((exercise) => ({
        id: exercise.id,
        type: exercise.type,
        difficulty: exercise.difficulty,
        question: exercise.question,
        options: exercise.options,
        correctAnswer: exercise.correctAnswer,
        explanation: exercise.explanation,
        order: exercise.order,
        ...(studentId
          ? { attemptCount: exerciseAttemptCounts[exercise.id] || 0 }
          : {}),
      })),
      ...(studentId && progress && progress.length > 0
        ? { progress: progress[0] }
        : studentId
        ? {
            progress: {
              status: "not_started",
              lessonRead: false,
              exerciseScore: 0,
              quizScore: 0,
              attempts: 0,
              lastPracticedAt: null,
              completedAt: null,
            },
          }
        : {}),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching grammar topic:", error);
    return NextResponse.json(
      { error: "Failed to fetch grammar topic" },
      { status: 500 }
    );
  }
}
