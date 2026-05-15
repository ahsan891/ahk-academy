import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get("categorySlug");

    if (!categorySlug) {
      return NextResponse.json(
        { error: "categorySlug query parameter is required" },
        { status: 400 }
      );
    }

    const category = await db.grammarCategory.findUnique({
      where: { slug: categorySlug },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    const session = await auth();
    const studentId = session?.user?.role === "STUDENT" ? session.user.id : null;

    const topics = await db.grammarTopic.findMany({
      where: { categoryId: category.id },
      orderBy: { order: "asc" },
      include: {
        _count: { select: { exercises: true } },
        ...(studentId
          ? {
              progress: {
                where: { studentId },
                select: {
                  status: true,
                  exerciseScore: true,
                  quizScore: true,
                  lessonRead: true,
                },
              },
            }
          : {}),
      },
    });

    const result = topics.map((topic) => {
      const progress = studentId
        ? (topic as typeof topic & { progress?: { status: string; exerciseScore: number; quizScore: number; lessonRead: boolean }[] }).progress
        : undefined;

      return {
        id: topic.id,
        title: topic.title,
        slug: topic.slug,
        description: topic.description,
        level: topic.level,
        order: topic.order,
        exerciseCount: topic._count.exercises,
        ...(studentId && progress && progress.length > 0
          ? {
              progress: {
                status: progress[0].status,
                exerciseScore: progress[0].exerciseScore,
                quizScore: progress[0].quizScore,
                lessonRead: progress[0].lessonRead,
              },
            }
          : studentId
          ? {
              progress: {
                status: "not_started",
                exerciseScore: 0,
                quizScore: 0,
                lessonRead: false,
              },
            }
          : {}),
      };
    });

    return NextResponse.json({ topics: result });
  } catch (error) {
    console.error("Error fetching grammar topics:", error);
    return NextResponse.json(
      { error: "Failed to fetch grammar topics" },
      { status: 500 }
    );
  }
}
