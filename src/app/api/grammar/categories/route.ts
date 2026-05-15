import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    const studentId = session?.user?.role === "STUDENT" ? session.user.id : null;

    const categories = await db.grammarCategory.findMany({
      orderBy: { order: "asc" },
      include: {
        topics: {
          select: {
            id: true,
            ...(studentId
              ? {
                  progress: {
                    where: { studentId },
                    select: { status: true },
                  },
                }
              : {}),
          },
        },
      },
    });

    const result = categories.map((category) => {
      const topicCount = category.topics.length;
      let completedCount = 0;
      let masteredCount = 0;

      if (studentId) {
        for (const topic of category.topics) {
          const progress = (topic as typeof topic & { progress?: { status: string }[] }).progress;
          if (progress && progress.length > 0) {
            const status = progress[0].status;
            if (status === "completed" || status === "mastered") {
              completedCount++;
            }
            if (status === "mastered") {
              masteredCount++;
            }
          }
        }
      }

      return {
        id: category.id,
        name: category.name,
        slug: category.slug,
        description: category.description,
        icon: category.icon,
        order: category.order,
        topicCount,
        completedCount,
        masteredCount,
      };
    });

    return NextResponse.json({ categories: result });
  } catch (error) {
    console.error("Error fetching grammar categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch grammar categories" },
      { status: 500 }
    );
  }
}
