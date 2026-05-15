import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queryStudentId = searchParams.get("studentId");

    // Teachers/admins can view specific student progress
    let targetStudentId = session.user.id;
    if (queryStudentId) {
      if (session.user.role !== "TEACHER" && session.user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Only teachers and admins can view other students' progress" },
          { status: 403 }
        );
      }
      targetStudentId = queryStudentId;
    } else if (session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Provide a studentId parameter to view student progress" },
        { status: 400 }
      );
    }

    // Get total topic count
    const totalTopics = await db.grammarTopic.count();

    // Get all progress records for this student
    const progressRecords = await db.studentGrammarProgress.findMany({
      where: { studentId: targetStudentId },
      include: {
        topic: {
          select: {
            id: true,
            title: true,
            categoryId: true,
            category: {
              select: { id: true, name: true, slug: true },
            },
          },
        },
      },
    });

    const completedTopics = progressRecords.filter(
      (p) => p.status === "completed" || p.status === "mastered"
    ).length;
    const masteredTopics = progressRecords.filter(
      (p) => p.status === "mastered"
    ).length;

    // Get total exercise attempts
    const totalExerciseAttempts = await db.exerciseAttempt.count({
      where: { studentId: targetStudentId },
    });

    // Calculate average score from quiz scores
    const quizScores = progressRecords
      .filter((p) => p.quizScore > 0)
      .map((p) => p.quizScore);
    const averageScore =
      quizScores.length > 0
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
        : 0;

    // Per-category breakdown
    const categories = await db.grammarCategory.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: { select: { topics: true } },
      },
    });

    const categoryBreakdown = categories.map((category) => {
      const categoryProgress = progressRecords.filter(
        (p) => p.topic.categoryId === category.id
      );
      const categoryCompleted = categoryProgress.filter(
        (p) => p.status === "completed" || p.status === "mastered"
      ).length;
      const categoryMastered = categoryProgress.filter(
        (p) => p.status === "mastered"
      ).length;

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        totalTopics: category._count.topics,
        completedTopics: categoryCompleted,
        masteredTopics: categoryMastered,
      };
    });

    return NextResponse.json({
      totalTopics,
      completedTopics,
      masteredTopics,
      totalExerciseAttempts,
      averageScore,
      categoryBreakdown,
    });
  } catch (error) {
    console.error("Error fetching grammar progress:", error);
    return NextResponse.json(
      { error: "Failed to fetch grammar progress" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "STUDENT") {
      return NextResponse.json(
        { error: "Only students can mark lessons as read" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { topicId } = body;

    if (!topicId) {
      return NextResponse.json(
        { error: "topicId is required" },
        { status: 400 }
      );
    }

    // Verify topic exists
    const topic = await db.grammarTopic.findUnique({
      where: { id: topicId },
    });

    if (!topic) {
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    // Check if progress record already exists
    const existing = await db.studentGrammarProgress.findUnique({
      where: {
        studentId_topicId: {
          studentId: session.user.id,
          topicId,
        },
      },
    });

    const progress = await db.studentGrammarProgress.upsert({
      where: {
        studentId_topicId: {
          studentId: session.user.id,
          topicId,
        },
      },
      create: {
        studentId: session.user.id,
        topicId,
        lessonRead: true,
        status: "in_progress",
        lastPracticedAt: new Date(),
      },
      update: {
        lessonRead: true,
        lastPracticedAt: new Date(),
        // Only update status to "in_progress" if currently "not_started"
        ...((!existing || existing.status === "not_started")
          ? { status: "in_progress" }
          : {}),
      },
    });

    return NextResponse.json(progress);
  } catch (error) {
    console.error("Error marking lesson as read:", error);
    return NextResponse.json(
      { error: "Failed to mark lesson as read" },
      { status: 500 }
    );
  }
}
