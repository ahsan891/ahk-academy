import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/grammar/progress-ring";
import Link from "next/link";
import {
  BookOpen,
  Trophy,
  CheckCircle2,
  Target,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default async function GrammarHubPage() {
  const session = await auth();
  if (!session) return null;

  const studentId = session.user.id;

  // Fetch all categories with topic counts and student progress
  const categories = await db.grammarCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      topics: {
        select: {
          id: true,
          level: true,
          progress: {
            where: { studentId },
            select: { status: true, exerciseScore: true, attempts: true },
          },
        },
      },
    },
  });

  // Overall stats
  let totalTopics = 0;
  let totalCompleted = 0;
  let totalMastered = 0;
  let totalAttempts = 0;
  let scoreSum = 0;
  let scoreCount = 0;

  const categoryData = categories.map((cat) => {
    const topicCount = cat.topics.length;
    let completedCount = 0;
    let masteredCount = 0;
    const levels = new Set<string>();

    cat.topics.forEach((topic) => {
      levels.add(topic.level);
      const prog = topic.progress[0];
      if (prog) {
        if (prog.status === "completed" || prog.status === "mastered") {
          completedCount++;
        }
        if (prog.status === "mastered") {
          masteredCount++;
        }
        totalAttempts += prog.attempts;
        if (prog.attempts > 0) {
          scoreSum += prog.exerciseScore;
          scoreCount++;
        }
      }
    });

    totalTopics += topicCount;
    totalCompleted += completedCount;
    totalMastered += masteredCount;

    const percentage =
      topicCount > 0 ? Math.round((completedCount / topicCount) * 100) : 0;
    const allDone = topicCount > 0 && completedCount === topicCount;
    const hasProgress = completedCount > 0;

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description,
      icon: cat.icon,
      topicCount,
      completedCount,
      masteredCount,
      percentage,
      allDone,
      hasProgress,
      levels: Array.from(levels),
    };
  });

  const averageScore =
    scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">English Grammar</h1>
        <p className="mt-1 text-gray-500">
          Master every grammar rule in English
        </p>
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Topics Mastered"
          value={totalMastered}
          icon={<Trophy size={24} />}
          description={`of ${totalTopics} total topics`}
        />
        <StatsCard
          title="Topics Completed"
          value={totalCompleted}
          icon={<CheckCircle2 size={24} />}
          description={`${totalTopics > 0 ? Math.round((totalCompleted / totalTopics) * 100) : 0}% complete`}
        />
        <StatsCard
          title="Exercises Done"
          value={totalAttempts}
          icon={<Target size={24} />}
        />
        <StatsCard
          title="Average Score"
          value={scoreCount > 0 ? `${averageScore}%` : "N/A"}
          icon={<Sparkles size={24} />}
          description={scoreCount > 0 ? `across ${scoreCount} topics` : "No exercises attempted yet"}
        />
      </div>

      {/* Category Grid */}
      {categoryData.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-lg font-medium text-gray-500">
              No grammar categories available yet
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Grammar lessons will be added soon. Check back later!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categoryData.map((cat) => (
            <Link
              key={cat.id}
              href={`/student/grammar/${cat.slug}`}
              className="group block"
            >
              <Card className="h-full transition-all duration-200 hover:border-indigo-300 hover:shadow-md group-hover:ring-1 group-hover:ring-indigo-100">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    {/* Progress Ring */}
                    <div className="shrink-0">
                      <ProgressRing
                        percentage={cat.percentage}
                        size={56}
                        strokeWidth={5}
                        showLabel={cat.topicCount > 0}
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom row */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant="default">{cat.topicCount} topics</Badge>
                      {cat.levels.map((level) => (
                        <Badge
                          key={level}
                          variant={
                            level === "beginner"
                              ? "info"
                              : level === "intermediate"
                                ? "warning"
                                : "danger"
                          }
                          className="text-[10px] px-1.5 py-0"
                        >
                          {level}
                        </Badge>
                      ))}
                    </div>

                    {cat.allDone ? (
                      <CheckCircle2 size={20} className="shrink-0 text-green-500" />
                    ) : cat.hasProgress ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600">
                        Continue
                        <ArrowRight size={12} />
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 group-hover:text-indigo-600 transition-colors">
                        Start
                        <ArrowRight size={12} />
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
