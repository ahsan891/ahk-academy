import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressRing } from "@/components/grammar/progress-ring";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Star,
  ChevronRight,
} from "lucide-react";

function getLevelColor(level: string) {
  switch (level) {
    case "beginner":
      return {
        bg: "bg-blue-100",
        text: "text-blue-700",
        border: "border-blue-300",
        ring: "ring-blue-200",
      };
    case "intermediate":
      return {
        bg: "bg-purple-100",
        text: "text-purple-700",
        border: "border-purple-300",
        ring: "ring-purple-200",
      };
    case "advanced":
      return {
        bg: "bg-orange-100",
        text: "text-orange-700",
        border: "border-orange-300",
        ring: "ring-orange-200",
      };
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-700",
        border: "border-gray-300",
        ring: "ring-gray-200",
      };
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "in_progress":
      return { label: "In Progress", variant: "info" as const };
    case "completed":
      return { label: "Completed", variant: "success" as const };
    case "mastered":
      return { label: "Mastered", variant: "warning" as const };
    default:
      return { label: "Not Started", variant: "default" as const };
  }
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const session = await auth();
  if (!session) return null;

  const { categorySlug } = await params;
  const studentId = session.user.id;

  // Fetch category with topics and student progress
  const category = await db.grammarCategory.findUnique({
    where: { slug: categorySlug },
    include: {
      topics: {
        orderBy: { order: "asc" },
        include: {
          exercises: { select: { id: true } },
          progress: {
            where: { studentId },
            select: {
              status: true,
              exerciseScore: true,
              quizScore: true,
              lessonRead: true,
              attempts: true,
            },
          },
        },
      },
    },
  });

  if (!category) {
    redirect("/student/grammar");
  }

  // Calculate overall category progress
  const totalTopics = category.topics.length;
  const completedTopics = category.topics.filter((t) => {
    const prog = t.progress[0];
    return prog && (prog.status === "completed" || prog.status === "mastered");
  }).length;
  const categoryPercentage =
    totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div>
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link
          href="/student/grammar"
          className="hover:text-indigo-600 transition-colors"
        >
          Grammar
        </Link>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="font-medium text-gray-900">{category.name}</span>
      </nav>

      {/* Back link */}
      <Link
        href="/student/grammar"
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Back to Grammar
      </Link>

      {/* Category Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {category.name}
            </h1>
            <p className="mt-1 text-gray-500">{category.description}</p>
          </div>
        </div>

        {/* Category progress bar */}
        <div className="mt-4 flex items-center gap-4">
          <div className="flex-1">
            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                style={{ width: `${categoryPercentage}%` }}
              />
            </div>
          </div>
          <span className="shrink-0 text-sm font-medium text-gray-600">
            {completedTopics}/{totalTopics} completed ({categoryPercentage}%)
          </span>
        </div>
      </div>

      {/* Topic List */}
      {category.topics.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-lg font-medium text-gray-500">
              No topics available yet
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Topics for this category will be added soon.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {category.topics.map((topic) => {
            const prog = topic.progress[0];
            const status = prog?.status || "not_started";
            const exerciseCount = topic.exercises.length;
            const exerciseScore = prog?.exerciseScore || 0;
            const quizScore = prog?.quizScore || 0;
            const hasAttempted = prog && prog.attempts > 0;
            const hasQuiz = prog && prog.quizScore > 0;
            const statusInfo = getStatusBadge(status);
            const levelColors = getLevelColor(topic.level);

            return (
              <Link
                key={topic.id}
                href={`/student/grammar/${categorySlug}/${topic.slug}`}
                className="group block"
              >
                <Card className="transition-all duration-200 hover:border-indigo-300 hover:shadow-md group-hover:ring-1 group-hover:ring-indigo-100">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-4 p-4 sm:p-5">
                      {/* Order number circle */}
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold text-sm ${levelColors.bg} ${levelColors.text}`}
                      >
                        {topic.order}
                      </div>

                      {/* Topic info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                            {topic.title}
                          </h3>
                          <Badge
                            variant={
                              topic.level === "beginner"
                                ? "info"
                                : topic.level === "intermediate"
                                  ? "warning"
                                  : "danger"
                            }
                          >
                            {topic.level}
                          </Badge>
                          <Badge variant={statusInfo.variant}>
                            {status === "completed" && (
                              <CheckCircle2 size={12} className="mr-1" />
                            )}
                            {status === "mastered" && (
                              <Star size={12} className="mr-1 fill-current" />
                            )}
                            {statusInfo.label}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-1">
                          {topic.description}
                        </p>

                        {/* Scores row */}
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                          <span>{exerciseCount} exercises</span>
                          {hasAttempted && (
                            <span className="flex items-center gap-1">
                              <span
                                className={`font-medium ${
                                  exerciseScore >= 80
                                    ? "text-green-600"
                                    : exerciseScore >= 50
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                }`}
                              >
                                Score: {exerciseScore}%
                              </span>
                            </span>
                          )}
                          {hasQuiz && (
                            <span className="flex items-center gap-1">
                              <span
                                className={`font-medium ${
                                  quizScore >= 80
                                    ? "text-green-600"
                                    : quizScore >= 50
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                }`}
                              >
                                Quiz: {quizScore}%
                              </span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action area */}
                      <div className="shrink-0">
                        <Button
                          size="sm"
                          variant={
                            status === "not_started"
                              ? "default"
                              : status === "completed" || status === "mastered"
                                ? "outline"
                                : "default"
                          }
                          className="pointer-events-none"
                          tabIndex={-1}
                        >
                          {status === "not_started"
                            ? "Start"
                            : status === "in_progress"
                              ? "Continue"
                              : "Review"}
                          <ChevronRight size={14} className="ml-1" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
