import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ChevronRight,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { TopicTabs } from "./topic-tabs";
import { LessonContent } from "./lesson-content";
import { PracticeTab } from "./practice-tab";
import { QuizTab } from "./quiz-tab";

export default async function TopicPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string; topicSlug: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session) return null;

  const { categorySlug, topicSlug } = await params;
  const { tab } = await searchParams;
  const activeTab = tab || "learn";
  const studentId = session.user.id;

  // Fetch topic with lesson, exercises, and progress
  const topic = await db.grammarTopic.findUnique({
    where: { slug: topicSlug },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      lesson: true,
      exercises: {
        orderBy: { order: "asc" },
        select: {
          id: true,
          type: true,
          difficulty: true,
          question: true,
          options: true,
          explanation: true,
          order: true,
        },
      },
      progress: {
        where: { studentId },
        select: {
          id: true,
          status: true,
          lessonRead: true,
          exerciseScore: true,
          quizScore: true,
          attempts: true,
          lastPracticedAt: true,
        },
      },
    },
  });

  if (!topic) {
    redirect(`/student/grammar/${categorySlug}`);
  }

  if (topic.category.slug !== categorySlug) {
    redirect(`/student/grammar/${topic.category.slug}/${topicSlug}`);
  }

  const progress = topic.progress[0] || null;
  const lessonRead = progress?.lessonRead || false;
  const exerciseScore = progress?.exerciseScore || 0;
  const quizScore = progress?.quizScore || 0;
  const hasAttempted = progress ? progress.attempts > 0 : false;

  // Parse lesson content
  let lessonExamples: string[] = [];
  if (topic.lesson?.examples) {
    try {
      lessonExamples = JSON.parse(topic.lesson.examples);
    } catch {
      lessonExamples = topic.lesson.examples
        .split("\n")
        .map((e) => e.trim())
        .filter(Boolean);
    }
  }

  const lessonTips = topic.lesson?.tips || null;

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
        <Link
          href={`/student/grammar/${categorySlug}`}
          className="hover:text-indigo-600 transition-colors"
        >
          {topic.category.name}
        </Link>
        <ChevronRight size={14} className="text-gray-400" />
        <span className="font-medium text-gray-900">{topic.title}</span>
      </nav>

      {/* Back link */}
      <Link
        href={`/student/grammar/${categorySlug}`}
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft size={16} />
        Back to {topic.category.name}
      </Link>

      {/* Topic Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-900">{topic.title}</h1>
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
          {progress && (
            <Badge
              variant={
                progress.status === "mastered"
                  ? "warning"
                  : progress.status === "completed"
                    ? "success"
                    : progress.status === "in_progress"
                      ? "info"
                      : "default"
              }
            >
              {progress.status === "mastered"
                ? "Mastered"
                : progress.status === "completed"
                  ? "Completed"
                  : progress.status === "in_progress"
                    ? "In Progress"
                    : "Not Started"}
            </Badge>
          )}
        </div>
        <p className="mt-2 text-gray-500">{topic.description}</p>
      </div>

      {/* Tab Navigation */}
      <TopicTabs
        activeTab={activeTab}
        basePath={`/student/grammar/${categorySlug}/${topicSlug}`}
        lessonRead={lessonRead}
        exerciseCount={topic.exercises.length}
        hasAttempted={hasAttempted}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "learn" && (
          <div className="space-y-6">
            {topic.lesson ? (
              <>
                {/* Lesson Content */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen size={20} />
                      Lesson
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <LessonContent
                      content={topic.lesson.content}
                      topicId={topic.id}
                      lessonRead={lessonRead}
                    />
                  </CardContent>
                </Card>

                {/* Examples */}
                {lessonExamples.length > 0 && (
                  <Card className="border-indigo-200 bg-indigo-50/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-indigo-800">
                        <Lightbulb size={20} />
                        Example Sentences
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {lessonExamples.map((example, i) => (
                          <div
                            key={i}
                            className="rounded-lg bg-white border border-indigo-100 p-4"
                          >
                            <p className="text-sm text-gray-800">{example}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tips */}
                {lessonTips && (
                  <Card className="border-yellow-200 bg-yellow-50/30">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-800">
                        <Lightbulb size={20} />
                        Tips
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {lessonTips}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Lesson Read Status */}
                {lessonRead && (
                  <div className="flex items-center gap-2 rounded-lg bg-green-50 border border-green-200 p-4">
                    <CheckCircle2 size={20} className="text-green-600" />
                    <span className="font-medium text-green-800">
                      Lesson Complete
                    </span>
                  </div>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <BookOpen className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-4 text-lg font-medium text-gray-500">
                    Lesson content coming soon
                  </p>
                  <p className="mt-1 text-sm text-gray-400">
                    The lesson for this topic is being prepared.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "practice" && (
          <PracticeTab
            exercises={topic.exercises}
            topicId={topic.id}
            previousScore={hasAttempted ? exerciseScore : null}
          />
        )}

        {activeTab === "quiz" && (
          <QuizTab
            topicId={topic.id}
            topicTitle={topic.title}
            previousScore={quizScore > 0 ? quizScore : null}
          />
        )}
      </div>
    </div>
  );
}
