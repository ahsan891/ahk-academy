import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import {
  Brain,
  Users,
  AlertTriangle,
  TrendingUp,
  Eye,
} from "lucide-react";
import { InsightFilters } from "./insight-filters";

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "high":
      return <Badge variant="danger">High</Badge>;
    case "medium":
      return <Badge variant="warning">Medium</Badge>;
    case "low":
      return <Badge variant="success">Low</Badge>;
    default:
      return <Badge>{priority}</Badge>;
  }
}

function getTypeBadge(type: string) {
  switch (type) {
    case "grammar_weakness":
      return <Badge variant="danger">Grammar</Badge>;
    case "vocabulary_gap":
      return <Badge variant="warning">Vocabulary</Badge>;
    case "strength":
      return <Badge variant="success">Strength</Badge>;
    case "recommendation":
      return <Badge variant="info">Recommendation</Badge>;
    default:
      return <Badge>{type.replace(/_/g, " ")}</Badge>;
  }
}

export default async function TeacherInsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; student?: string }>;
}) {
  const session = await auth();
  if (!session) return null;

  const teacherId = session.user.id;
  const resolvedSearchParams = await searchParams;
  const filter = resolvedSearchParams.filter || "all";
  const studentFilter = resolvedSearchParams.student || "";

  // Build where clause based on filters
  const whereClause: Record<string, unknown> = { teacherId };
  if (filter === "unread") {
    whereClause.isRead = false;
  }
  if (studentFilter) {
    whereClause.studentId = studentFilter;
  }

  const [insights, allInsights, students] = await Promise.all([
    db.teacherInsight.findMany({
      where: whereClause,
      include: {
        student: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    // Get all insights for stats
    db.teacherInsight.findMany({
      where: { teacherId },
      select: { id: true, isRead: true, priority: true, type: true, studentId: true },
    }),
    // Get unique students with insights
    db.teacherInsight.findMany({
      where: { teacherId },
      select: { student: { select: { id: true, name: true } } },
      distinct: ["studentId"],
    }),
  ]);

  const unreadCount = allInsights.filter((i) => !i.isRead).length;
  const highPriorityCount = allInsights.filter(
    (i) => i.priority === "high"
  ).length;
  const uniqueStudentCount = new Set(allInsights.map((i) => i.studentId)).size;

  // Group insights by student for the grouped view
  const insightsByStudent = new Map<
    string,
    { student: { id: string; name: string; email: string }; insights: typeof insights }
  >();
  for (const insight of insights) {
    const existing = insightsByStudent.get(insight.studentId);
    if (existing) {
      existing.insights.push(insight);
    } else {
      insightsByStudent.set(insight.studentId, {
        student: insight.student,
        insights: [insight],
      });
    }
  }

  // Generate summary sentences
  const summaries: string[] = [];
  const grammarWeakStudents = allInsights.filter(
    (i) => i.type === "grammar_weakness" && i.priority === "high"
  );
  if (grammarWeakStudents.length > 0) {
    const uniqueGrammar = new Set(grammarWeakStudents.map((i) => i.studentId));
    summaries.push(
      `${uniqueGrammar.size} student${uniqueGrammar.size > 1 ? "s" : ""} struggling with grammar`
    );
  }
  const strengthStudents = allInsights.filter((i) => i.type === "strength");
  if (strengthStudents.length > 0) {
    const uniqueStrength = new Set(strengthStudents.map((i) => i.studentId));
    summaries.push(
      `${uniqueStrength.size} student${uniqueStrength.size > 1 ? "s" : ""} showing strong progress`
    );
  }
  const vocabGapStudents = allInsights.filter(
    (i) => i.type === "vocabulary_gap"
  );
  if (vocabGapStudents.length > 0) {
    const uniqueVocab = new Set(vocabGapStudents.map((i) => i.studentId));
    summaries.push(
      `${uniqueVocab.size} student${uniqueVocab.size > 1 ? "s" : ""} need vocabulary support`
    );
  }

  const uniqueStudents = students.map((s) => s.student);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Insights</h1>
        <p className="mt-1 text-gray-500">
          AI-generated observations about your students from speaking sessions
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Insights"
          value={allInsights.length}
          icon={<Brain size={24} />}
        />
        <StatsCard
          title="Unread"
          value={unreadCount}
          icon={<Eye size={24} />}
          description="New insights to review"
        />
        <StatsCard
          title="High Priority"
          value={highPriorityCount}
          icon={<AlertTriangle size={24} />}
          description="Need attention"
        />
        <StatsCard
          title="Students Tracked"
          value={uniqueStudentCount}
          icon={<Users size={24} />}
        />
      </div>

      {/* Summary */}
      {summaries.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-blue-600" />
              <h3 className="font-medium text-gray-900">Quick Summary</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {summaries.map((summary, i) => (
                <span
                  key={i}
                  className="inline-block rounded-lg bg-blue-50 px-3 py-1.5 text-sm text-blue-700"
                >
                  {summary}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <InsightFilters
        currentFilter={filter}
        currentStudent={studentFilter}
        students={uniqueStudents}
      />

      {/* Insights grouped by student */}
      {insights.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Brain size={48} className="text-gray-300" />
            <p className="mt-4 text-gray-500">No insights yet</p>
            <p className="mt-1 text-sm text-gray-400">
              Insights are generated when you analyze speaking session
              transcripts
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Array.from(insightsByStudent.values()).map(
            ({ student, insights: studentInsights }) => (
              <Card key={student.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          {student.name}
                        </CardTitle>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <Badge variant="info">
                      {studentInsights.length} insight
                      {studentInsights.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {studentInsights.map((insight) => (
                      <div
                        key={insight.id}
                        className={`rounded-lg border p-3 ${
                          insight.isRead
                            ? "border-gray-200 bg-white"
                            : "border-blue-200 bg-blue-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {getTypeBadge(insight.type)}
                            {getPriorityBadge(insight.priority)}
                            {!insight.isRead && (
                              <span className="h-2 w-2 rounded-full bg-blue-600" />
                            )}
                          </div>
                          <span className="text-xs text-gray-400">
                            {formatDate(insight.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-700">
                          {insight.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      )}
    </div>
  );
}
