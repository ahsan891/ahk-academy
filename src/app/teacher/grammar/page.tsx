import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  BookOpen,
  Trophy,
  BarChart3,
  ClipboardList,
} from "lucide-react";
import { AssignGrammarTopic } from "./assign-topic";

export default async function TeacherGrammarPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "TEACHER") {
    redirect("/login");
  }

  const teacherId = session.user.id;

  // Fetch all students
  const students = await db.user.findMany({
    where: { role: "STUDENT" },
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });

  // Fetch all categories with topics
  const categories = await db.grammarCategory.findMany({
    orderBy: { order: "asc" },
    include: {
      topics: {
        orderBy: { order: "asc" },
        select: { id: true, title: true, categoryId: true },
      },
    },
  });

  // Fetch all grammar progress for all students
  const allProgress = await db.studentGrammarProgress.findMany({
    include: {
      topic: {
        select: {
          id: true,
          title: true,
          categoryId: true,
          category: { select: { id: true, name: true } },
        },
      },
    },
  });

  // Fetch assignments created by this teacher
  const assignments = await db.grammarAssignment.findMany({
    where: { teacherId },
    orderBy: { createdAt: "desc" },
    include: {
      student: { select: { id: true, name: true, email: true } },
      topic: {
        select: {
          id: true,
          title: true,
          category: { select: { id: true, name: true } },
        },
      },
    },
  });

  // Build per-student stats
  const studentStats = students.map((student) => {
    const progressRecords = allProgress.filter(
      (p) => p.studentId === student.id
    );

    const topicsStarted = progressRecords.filter(
      (p) => p.status !== "not_started"
    ).length;
    const topicsCompleted = progressRecords.filter(
      (p) => p.status === "completed" || p.status === "mastered"
    ).length;
    const topicsMastered = progressRecords.filter(
      (p) => p.status === "mastered"
    ).length;

    const scores = progressRecords
      .filter((p) => p.quizScore > 0)
      .map((p) => p.quizScore);
    const avgScore =
      scores.length > 0
        ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
        : 0;

    // Calculate per-category scores to find weakest area
    const categoryScores: Record<string, { name: string; scores: number[] }> =
      {};
    for (const p of progressRecords) {
      const catId = p.topic.categoryId;
      const catName = p.topic.category.name;
      if (!categoryScores[catId]) {
        categoryScores[catId] = { name: catName, scores: [] };
      }
      if (p.quizScore > 0) {
        categoryScores[catId].scores.push(p.quizScore);
      }
    }

    let weakestArea = "N/A";
    let lowestAvg = Infinity;
    for (const cat of Object.values(categoryScores)) {
      if (cat.scores.length > 0) {
        const catAvg = cat.scores.reduce((a, b) => a + b, 0) / cat.scores.length;
        if (catAvg < lowestAvg) {
          lowestAvg = catAvg;
          weakestArea = cat.name;
        }
      }
    }

    // Per-category breakdown
    const categoryBreakdown = categories.map((cat) => {
      const catProgress = progressRecords.filter(
        (p) => p.topic.categoryId === cat.id
      );
      const catCompleted = catProgress.filter(
        (p) => p.status === "completed" || p.status === "mastered"
      ).length;
      const catScores = catProgress
        .filter((p) => p.quizScore > 0)
        .map((p) => p.quizScore);
      const catAvg =
        catScores.length > 0
          ? Math.round(catScores.reduce((a, b) => a + b, 0) / catScores.length)
          : 0;
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        totalTopics: cat.topics.length,
        completed: catCompleted,
        avgScore: catAvg,
      };
    });

    return {
      ...student,
      topicsStarted,
      topicsCompleted,
      topicsMastered,
      avgScore,
      weakestArea,
      categoryBreakdown,
      hasProgress: progressRecords.length > 0,
    };
  });

  // Calculate aggregate stats
  const studentsWithProgress = studentStats.filter((s) => s.hasProgress);
  const totalStudents = students.length;
  const avgTopicsCompleted =
    studentsWithProgress.length > 0
      ? Math.round(
          studentsWithProgress.reduce((a, s) => a + s.topicsCompleted, 0) /
            studentsWithProgress.length
        )
      : 0;
  const avgScore =
    studentsWithProgress.length > 0
      ? Math.round(
          studentsWithProgress.reduce((a, s) => a + s.avgScore, 0) /
            studentsWithProgress.length
        )
      : 0;
  const totalAssignments = assignments.length;

  // Prepare data for client component
  const categoriesForForm = categories.map((c) => ({
    id: c.id,
    name: c.name,
    topics: c.topics.map((t) => ({ id: t.id, title: t.title })),
  }));

  const studentsForForm = students.map((s) => ({ id: s.id, name: s.name }));

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Grammar Progress</h1>
        <p className="mt-1 text-gray-500">
          Monitor your students&apos; grammar learning
        </p>
      </div>

      {/* Stats Row */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Students"
          value={totalStudents}
          icon={<Users size={24} />}
          description="Enrolled students"
        />
        <StatsCard
          title="Avg Topics Completed"
          value={avgTopicsCompleted}
          icon={<BookOpen size={24} />}
          description="Per active student"
        />
        <StatsCard
          title="Avg Score"
          value={avgScore > 0 ? `${avgScore}%` : "N/A"}
          icon={<Trophy size={24} />}
          description="Across all students"
        />
        <StatsCard
          title="Assignments Given"
          value={totalAssignments}
          icon={<ClipboardList size={24} />}
          description="By you"
        />
      </div>

      {/* Assign Grammar Topic (Client Component) */}
      <AssignGrammarTopic
        students={studentsForForm}
        categories={categoriesForForm}
      />

      {/* Student Progress Table */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 size={20} />
            Student Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          {studentStats.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              No students found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 pr-4 font-medium text-gray-500">
                      Student Name
                    </th>
                    <th className="pb-3 pr-4 font-medium text-gray-500">
                      Started
                    </th>
                    <th className="pb-3 pr-4 font-medium text-gray-500">
                      Completed
                    </th>
                    <th className="pb-3 pr-4 font-medium text-gray-500">
                      Mastered
                    </th>
                    <th className="pb-3 pr-4 font-medium text-gray-500">
                      Avg Score
                    </th>
                    <th className="pb-3 pr-4 font-medium text-gray-500">
                      Weakest Area
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {studentStats.map((student) => (
                    <StudentRow
                      key={student.id}
                      student={student}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Assignments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList size={20} />
            Your Assignments
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <p className="py-8 text-center text-gray-500">
              No assignments created yet. Use the form above to assign grammar
              topics.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 text-left">
                    <th className="pb-3 pr-4 font-medium text-gray-500">
                      Student
                    </th>
                    <th className="pb-3 pr-4 font-medium text-gray-500">
                      Topic
                    </th>
                    <th className="pb-3 pr-4 font-medium text-gray-500">
                      Assigned
                    </th>
                    <th className="pb-3 pr-4 font-medium text-gray-500">
                      Due Date
                    </th>
                    <th className="pb-3 pr-4 font-medium text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assignments.map((a) => {
                    const isOverdue =
                      !a.isCompleted &&
                      a.dueDate &&
                      new Date(a.dueDate) < new Date();

                    return (
                      <tr
                        key={a.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="py-3 pr-4 font-medium text-gray-900">
                          {a.student.name}
                        </td>
                        <td className="py-3 pr-4 text-gray-700">
                          <div>
                            <span>{a.topic.title}</span>
                            <span className="ml-2 text-xs text-gray-400">
                              {a.topic.category.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-gray-500">
                          {formatDate(a.createdAt)}
                        </td>
                        <td className="py-3 pr-4 text-gray-500">
                          {a.dueDate ? formatDate(a.dueDate) : "No due date"}
                        </td>
                        <td className="py-3 pr-4">
                          {a.isCompleted ? (
                            <Badge variant="success">Completed</Badge>
                          ) : isOverdue ? (
                            <Badge variant="danger">Overdue</Badge>
                          ) : (
                            <Badge variant="warning">Pending</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Server-rendered student row with expandable category breakdown
function StudentRow({
  student,
}: {
  student: {
    id: string;
    name: string;
    email: string;
    topicsStarted: number;
    topicsCompleted: number;
    topicsMastered: number;
    avgScore: number;
    weakestArea: string;
    categoryBreakdown: {
      categoryId: string;
      categoryName: string;
      totalTopics: number;
      completed: number;
      avgScore: number;
    }[];
  };
}) {
  return (
    <>
      <tr className="border-b border-gray-100 last:border-0 group">
        <td className="py-3 pr-4">
          <details className="cursor-pointer">
            <summary className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                {student.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="font-medium text-gray-900">
                  {student.name}
                </span>
                <p className="text-xs text-gray-400">{student.email}</p>
              </div>
            </summary>

            {/* Expanded per-category breakdown */}
            <div className="mt-3 ml-10 mb-2 rounded-lg bg-gray-50 p-3">
              <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Per-Category Breakdown
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {student.categoryBreakdown
                  .filter((c) => c.totalTopics > 0)
                  .map((cat) => (
                    <div
                      key={cat.categoryId}
                      className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2 text-xs"
                    >
                      <span className="font-medium text-gray-700 truncate mr-2">
                        {cat.categoryName}
                      </span>
                      <span className="text-gray-500 whitespace-nowrap">
                        {cat.completed}/{cat.totalTopics}{" "}
                        {cat.avgScore > 0 && (
                          <span className="text-blue-600 ml-1">
                            {cat.avgScore}%
                          </span>
                        )}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </details>
        </td>
        <td className="py-3 pr-4 text-gray-700">{student.topicsStarted}</td>
        <td className="py-3 pr-4 text-gray-700">{student.topicsCompleted}</td>
        <td className="py-3 pr-4 text-gray-700">{student.topicsMastered}</td>
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
        <td className="py-3 pr-4">
          {student.weakestArea !== "N/A" ? (
            <Badge variant="danger">{student.weakestArea}</Badge>
          ) : (
            <span className="text-gray-400">N/A</span>
          )}
        </td>
      </tr>
    </>
  );
}
