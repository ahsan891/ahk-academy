import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Mic2,
  Calendar,
  Clock,
  Star,
  Users,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  Lightbulb,
} from "lucide-react";

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "scheduled":
      return "info" as const;
    case "confirmed":
      return "info" as const;
    case "in_progress":
      return "warning" as const;
    case "completed":
      return "success" as const;
    case "cancelled":
      return "danger" as const;
    default:
      return "default" as const;
  }
}

function formatStatusLabel(status: string) {
  return status
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export default async function StudentSpeakingPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session) return null;

  const { tab } = await searchParams;
  const activeTab = tab || "upcoming";
  const studentId = session.user.id;
  const now = new Date();

  // Fetch all sessions where student is a participant
  const allParticipations = await db.sessionParticipant.findMany({
    where: { studentId },
    include: {
      session: {
        include: {
          participants: {
            include: {
              student: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
          analyses: {
            where: { studentId },
          },
          transcript: true,
        },
      },
    },
    orderBy: { session: { date: "desc" } },
  });

  // Compute stats
  const totalSessions = allParticipations.length;
  const upcomingSessions = allParticipations.filter(
    (p) =>
      new Date(p.session.date) > now &&
      p.session.status !== "completed" &&
      p.session.status !== "cancelled"
  );
  const completedSessions = allParticipations.filter(
    (p) => p.session.status === "completed"
  );
  const ratingsGiven = allParticipations.filter((p) => p.rating !== null);
  const avgRating =
    ratingsGiven.length > 0
      ? (
          ratingsGiven.reduce((sum, p) => sum + (p.rating || 0), 0) /
          ratingsGiven.length
        ).toFixed(1)
      : "N/A";

  // Filter sessions by tab
  const filteredParticipations =
    activeTab === "upcoming"
      ? upcomingSessions
      : activeTab === "completed"
        ? completedSessions
        : allParticipations;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Speaking Sessions</h1>
        <p className="mt-1 text-gray-500">
          View your speaking sessions, prepare for upcoming ones, and review
          past performance.
        </p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Sessions"
          value={totalSessions}
          icon={<Mic2 size={24} />}
        />
        <StatsCard
          title="Upcoming"
          value={upcomingSessions.length}
          icon={<Calendar size={24} />}
        />
        <StatsCard
          title="Completed"
          value={completedSessions.length}
          icon={<Star size={24} />}
        />
        <StatsCard
          title="Average Rating"
          value={avgRating}
          icon={<Star size={24} />}
          description="Your average session rating"
        />
      </div>

      {/* Tab filter */}
      <div className="mb-6 flex gap-2">
        {[
          { key: "upcoming", label: "Upcoming" },
          { key: "completed", label: "Completed" },
          { key: "all", label: "All" },
        ].map((t) => (
          <Link
            key={t.key}
            href={`/student/speaking?tab=${t.key}`}
            className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t.key
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {/* Session Cards */}
      {filteredParticipations.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Mic2 className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-lg font-medium text-gray-500">
              No {activeTab === "all" ? "" : activeTab} sessions found
            </p>
            <p className="mt-1 text-sm text-gray-400">
              {activeTab === "upcoming"
                ? "You have no upcoming speaking sessions scheduled."
                : activeTab === "completed"
                  ? "You haven't completed any speaking sessions yet."
                  : "You haven't been assigned to any speaking sessions yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredParticipations.map((participation) => {
            const s = participation.session;
            const isUpcoming =
              new Date(s.date) > now && s.status !== "completed" && s.status !== "cancelled";
            const hasAnalysis = s.analyses.length > 0;
            const hasRated = participation.rating !== null;
            const otherParticipants = s.participants.filter(
              (p) => p.studentId !== studentId
            );
            const showMeetingLink =
              isUpcoming &&
              s.meetingLink &&
              (s.status === "confirmed" || s.status === "scheduled" || s.status === "in_progress");

            return (
              <Card key={participation.id} className="overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Main Content */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {s.topic}
                          </h3>
                          <Badge variant={getStatusBadgeVariant(s.status)}>
                            {formatStatusLabel(s.status)}
                          </Badge>
                        </div>
                        {s.topicDetails && (
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                            {s.topicDetails}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Date, time, duration */}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {formatDate(s.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatTime(s.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {s.duration} min
                      </span>
                    </div>

                    {/* Other participants */}
                    {otherParticipants.length > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <Users size={14} className="text-gray-400" />
                        <div className="flex -space-x-2">
                          {otherParticipants.slice(0, 4).map((p) => (
                            <div
                              key={p.id}
                              className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-100 text-xs font-medium text-blue-700"
                              title={p.student.name}
                            >
                              {p.student.name.charAt(0).toUpperCase()}
                            </div>
                          ))}
                          {otherParticipants.length > 4 && (
                            <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-gray-100 text-xs font-medium text-gray-600">
                              +{otherParticipants.length - 4}
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {otherParticipants.length} other{otherParticipants.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {showMeetingLink && (
                        <a
                          href={s.meetingLink!}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button size="sm">
                            <ExternalLink size={14} className="mr-1" />
                            Join Meeting
                          </Button>
                        </a>
                      )}
                      {s.status === "completed" && !hasRated && (
                        <Link href={`/student/speaking/${s.id}`}>
                          <Button size="sm" variant="outline">
                            <Star size={14} className="mr-1" />
                            Rate Session
                          </Button>
                        </Link>
                      )}
                      {s.status === "completed" && hasAnalysis && (
                        <Link href={`/student/speaking/${s.id}`}>
                          <Button size="sm" variant="outline">
                            <MessageSquare size={14} className="mr-1" />
                            View Feedback
                          </Button>
                        </Link>
                      )}
                      <Link href={`/student/speaking/${s.id}`}>
                        <Button size="sm" variant="ghost">
                          Details
                          <ChevronRight size={14} className="ml-1" />
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Preparation sidebar for upcoming */}
                  {isUpcoming && s.topicDetails && (
                    <div className="border-t lg:border-l lg:border-t-0 border-gray-100 bg-blue-50/50 p-6 lg:w-72">
                      <div className="flex items-center gap-2 text-sm font-medium text-blue-700">
                        <Lightbulb size={16} />
                        Preparation
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-4">
                        {s.topicDetails}
                      </p>
                      <Link
                        href={`/student/speaking/${s.id}`}
                        className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700"
                      >
                        View full details
                      </Link>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
