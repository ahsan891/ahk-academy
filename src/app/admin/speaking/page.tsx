import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Mic2,
  Calendar,
  CheckCircle,
  Users,
  Plus,
  Clock,
  Eye,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

function getStatusVariant(status: string) {
  switch (status) {
    case "scheduled":
      return "info";
    case "confirmed":
      return "info";
    case "in_progress":
      return "warning";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "default";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "in_progress":
      return "In Progress";
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

export default async function SpeakingSessionsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const params = await searchParams;
  const filter = params.filter || "all";

  const now = new Date();

  const [totalSessions, upcomingSessions, completedSessions, activeStudents] =
    await Promise.all([
      db.speakingSession.count(),
      db.speakingSession.count({
        where: {
          status: { in: ["scheduled", "confirmed"] },
          date: { gte: now },
        },
      }),
      db.speakingSession.count({ where: { status: "completed" } }),
      db.sessionParticipant
        .groupBy({
          by: ["studentId"],
        })
        .then((r) => r.length),
    ]);

  const where: Record<string, unknown> = {};
  if (filter === "upcoming") {
    where.status = { in: ["scheduled", "confirmed"] };
    where.date = { gte: now };
  } else if (filter === "completed") {
    where.status = "completed";
  } else if (filter === "cancelled") {
    where.status = "cancelled";
  }

  const sessions = await db.speakingSession.findMany({
    where,
    orderBy: { date: "desc" },
    include: {
      createdBy: { select: { id: true, name: true } },
      _count: { select: { participants: true, analyses: true } },
      transcript: { select: { id: true, analyzedAt: true } },
    },
  });

  const filters = [
    { label: "All", value: "all" },
    { label: "Upcoming", value: "upcoming" },
    { label: "Completed", value: "completed" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Speaking Sessions
          </h1>
          <p className="mt-1 text-gray-500">
            Manage speaking practice sessions for students
          </p>
        </div>
        <Link href="/admin/speaking/create">
          <Button>
            <Plus size={18} className="mr-2" />
            Create Session
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Sessions"
          value={totalSessions}
          icon={<Mic2 size={24} />}
          description="All time"
        />
        <StatsCard
          title="Upcoming"
          value={upcomingSessions}
          icon={<Calendar size={24} />}
          description="Scheduled sessions"
        />
        <StatsCard
          title="Completed"
          value={completedSessions}
          icon={<CheckCircle size={24} />}
          description="Finished sessions"
        />
        <StatsCard
          title="Active Students"
          value={activeStudents}
          icon={<Users size={24} />}
          description="Unique participants"
        />
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        {filters.map((f) => (
          <Link key={f.value} href={`/admin/speaking?filter=${f.value}`}>
            <Button
              variant={filter === f.value ? "default" : "outline"}
              size="sm"
            >
              {f.label}
            </Button>
          </Link>
        ))}
      </div>

      {/* Sessions List */}
      {sessions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <Mic2 size={48} className="text-gray-300" />
            <p className="mt-4 text-gray-500">No sessions found</p>
            <Link href="/admin/speaking/create" className="mt-4">
              <Button variant="outline">Create Your First Session</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="transition-shadow hover:shadow-md"
            >
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {session.topic}
                      </h3>
                      <Badge variant={getStatusVariant(session.status)}>
                        {getStatusLabel(session.status)}
                      </Badge>
                      <Badge variant="default">
                        {session.sourceType === "teacher"
                          ? "Teacher"
                          : "System"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(session.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {session.duration} min
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {session._count.participants}/{session.maxStudents}{" "}
                        students
                      </span>
                      {session.transcript && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle size={14} />
                          {session.transcript.analyzedAt
                            ? "Analyzed"
                            : "Transcript uploaded"}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link href={`/admin/speaking/${session.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye size={16} className="mr-1" />
                      View
                      <ArrowRight size={14} className="ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
