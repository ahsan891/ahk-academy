import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  FileText,
  ListChecks,
  Users,
  Trophy,
  BarChart3,
} from "lucide-react";

export default async function AdminGrammarPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  // Fetch all categories with topic and exercise counts
  const categories = await db.grammarCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      topics: {
        select: {
          id: true,
          title: true,
          _count: { select: { exercises: true } },
          exercises: {
            select: { difficulty: true },
          },
          progress: {
            select: {
              status: true,
              quizScore: true,
            },
          },
        },
      },
    },
  });

  // Count totals
  const totalCategories = categories.length;
  const totalTopics = categories.reduce(
    (sum, cat) => sum + cat.topics.length,
    0
  );
  const totalExercises = categories.reduce(
    (sum, cat) =>
      sum + cat.topics.reduce((s, t) => s + t._count.exercises, 0),
    0
  );

  // Active learners (students with at least 1 progress record)
  const activeLearners = await db.studentGrammarProgress
    .groupBy({ by: ["studentId"] })
    .then((r) => r.length);

  // Build category table data
  const categoryTableData = categories.map((cat) => {
    const topicCount = cat.topics.length;
    const exerciseCount = cat.topics.reduce(
      (s, t) => s + t._count.exercises,
      0
    );

    // Aggregate scores and completion across all topics in this category
    const allProgressInCat = cat.topics.flatMap((t) => t.progress);
    const completedInCat = allProgressInCat.filter(
      (p) => p.status === "completed" || p.status === "mastered"
    ).length;
    const totalProgressInCat = allProgressInCat.length;

    const scoresInCat = allProgressInCat
      .filter((p) => p.quizScore > 0)
      .map((p) => p.quizScore);
    const avgScoreInCat =
      scoresInCat.length > 0
        ? Math.round(
            scoresInCat.reduce((a, b) => a + b, 0) / scoresInCat.length
          )
        : 0;

    // Completion rate = completed progress records / (active learners * topics in category)
    const possibleCompletions = activeLearners * topicCount;
    const completionRate =
      possibleCompletions > 0
        ? Math.round((completedInCat / possibleCompletions) * 100)
        : 0;

    return {
      id: cat.id,
      order: cat.order,
      name: cat.name,
      topicCount,
      exerciseCount,
      avgScore: avgScoreInCat,
      completionRate,
      totalProgress: totalProgressInCat,
    };
  });

  // Top 10 students by mastered topics
  const allProgress = await db.studentGrammarProgress.findMany({
    include: {
      student: { select: { id: true, name: true, email: true } },
    },
  });

  const studentAggregates: Record<
    string,
    {
      id: string;
      name: string;
      email: string;
      mastered: number;
      completed: number;
      scores: number[];
    }
  > = {};

  for (const p of allProgress) {
    if (!studentAggregates[p.studentId]) {
      studentAggregates[p.studentId] = {
        id: p.student.id,
        name: p.student.name,
        email: p.student.email,
        mastered: 0,
        completed: 0,
        scores: [],
      };
    }
    if (p.status === "mastered") {
      studentAggregates[p.studentId].mastered++;
      studentAggregates[p.studentId].completed++;
    } else if (p.status === "completed") {
      studentAggregates[p.studentId].completed++;
    }
    if (p.quizScore > 0) {
      studentAggregates[p.studentId].scores.push(p.quizScore);
    }
  }

  const topStudents = Object.values(studentAggregates)
    .sort((a, b) => b.mastered - a.mastered || b.completed - a.completed)
    .slice(0, 10)
    .map((s) => ({
      ...s,
      avgScore:
        s.scores.length > 0
          ? Math.round(s.scores.reduce((a, b) => a + b, 0) / s.scores.length)
          : 0,
    }));

  // Difficulty distribution
  const allExercises = categories.flatMap((cat) =>
    cat.topics.flatMap((t) => t.exercises)
  );
  const beginnerCount = allExercises.filter(
    (e) => e.difficulty === "beginner"
  ).length;
  const intermediateCount = allExercises.filter(
    (e) => e.difficulty === "intermediate"
  ).length;
  const advancedCount = allExercises.filter(
    (e) => e.difficulty === "advanced"
  ).length;
  const maxDifficulty = Math.max(beginnerCount, intermediateCount, advancedCount, 1);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Grammar System</h1>
        <p className="mt-1 text-gray-500">
          Overview of the grammar teaching platform
        </p>
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Categories"
          value={totalCategories}
          icon={<BookOpen size={24} />}
          description="Grammar categories"
        />
        <StatsCard
          title="Topics"
          value={totalTopics}
          icon={<FileText size={24} />}
          description="Grammar topics"
        />
        <StatsCard
          title="Exercises"
          value={totalExercises}
          icon={<ListChecks size={24} />}
          description="Practice exercises"
        />
        <StatsCard
          title="Active Learners"
          value={activeLearners}
          icon={<Users size={24} />}
          description="Students with progress"
        />
      </div>

      {/* Category Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen size={20} />
            Categories
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left">
                  <th className="pb-3 pr-4 font-medium text-gray-500">
                    Order
                  </th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">
                    Category Name
                  </th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">
                    Topics
                  </th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">
                    Exercises
                  </th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">
                    Avg Score
                  </th>
                  <th className="pb-3 pr-4 font-medium text-gray-500">
                    Completion Rate
                  </th>
                </tr>
              </thead>
              <tbody>
                {categoryTableData.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-3 pr-4 text-gray-400 font-mono">
                      {cat.order}
                    </td>
                    <td className="py-3 pr-4 font-medium text-gray-900">
                      {cat.name}
                    </td>
                    <td className="py-3 pr-4 text-gray-700">
                      {cat.topicCount}
                    </td>
                    <td className="py-3 pr-4 text-gray-700">
                      {cat.exerciseCount}
                    </td>
                    <td className="py-3 pr-4">
                      {cat.avgScore > 0 ? (
                        <span
                          className={
                            cat.avgScore >= 80
                              ? "font-medium text-green-600"
                              : cat.avgScore >= 60
                                ? "font-medium text-yellow-600"
                                : "font-medium text-red-600"
                          }
                        >
                          {cat.avgScore}%
                        </span>
                      ) : (
                        <span className="text-gray-400">N/A</span>
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-24 rounded-full bg-gray-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{
                              width: `${Math.min(cat.completionRate, 100)}%`,
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-500">
                          {cat.completionRate}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Students */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy size={20} />
              Top Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topStudents.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                No student progress yet
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="pb-3 pr-4 font-medium text-gray-500">
                        #
                      </th>
                      <th className="pb-3 pr-4 font-medium text-gray-500">
                        Name
                      </th>
                      <th className="pb-3 pr-4 font-medium text-gray-500">
                        Mastered
                      </th>
                      <th className="pb-3 pr-4 font-medium text-gray-500">
                        Completed
                      </th>
                      <th className="pb-3 pr-4 font-medium text-gray-500">
                        Avg Score
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {topStudents.map((student, idx) => (
                      <tr
                        key={student.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-3 pr-4">
                          {idx < 3 ? (
                            <span
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                idx === 0
                                  ? "bg-yellow-100 text-yellow-700"
                                  : idx === 1
                                    ? "bg-gray-100 text-gray-600"
                                    : "bg-orange-100 text-orange-700"
                              }`}
                            >
                              {idx + 1}
                            </span>
                          ) : (
                            <span className="ml-1 text-gray-400">
                              {idx + 1}
                            </span>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                              {student.name.charAt(0).toUpperCase()}
                            </div>
                            <span className="font-medium text-gray-900">
                              {student.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant="success">{student.mastered}</Badge>
                        </td>
                        <td className="py-3 pr-4 text-gray-700">
                          {student.completed}
                        </td>
                        <td className="py-3 pr-4">
                          {student.avgScore > 0 ? (
                            <span
                              className={
                                student.avgScore >= 80
                                  ? "font-medium text-green-600"
                                  : student.avgScore >= 60
                                    ? "font-medium text-yellow-600"
                                    : "font-medium text-red-600"
                              }
                            >
                              {student.avgScore}%
                            </span>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Difficulty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 size={20} />
              Difficulty Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              {/* Beginner */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Beginner
                  </span>
                  <span className="text-sm text-gray-500">
                    {beginnerCount} exercises
                  </span>
                </div>
                <div className="h-4 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-green-500 transition-all"
                    style={{
                      width: `${(beginnerCount / maxDifficulty) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Intermediate */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Intermediate
                  </span>
                  <span className="text-sm text-gray-500">
                    {intermediateCount} exercises
                  </span>
                </div>
                <div className="h-4 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-yellow-500 transition-all"
                    style={{
                      width: `${(intermediateCount / maxDifficulty) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Advanced */}
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Advanced
                  </span>
                  <span className="text-sm text-gray-500">
                    {advancedCount} exercises
                  </span>
                </div>
                <div className="h-4 w-full rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-red-500 transition-all"
                    style={{
                      width: `${(advancedCount / maxDifficulty) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="mt-6 flex items-center justify-center gap-6 rounded-lg bg-gray-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-xs text-gray-600">
                  Beginner ({beginnerCount})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-xs text-gray-600">
                  Intermediate ({intermediateCount})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-xs text-gray-600">
                  Advanced ({advancedCount})
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
