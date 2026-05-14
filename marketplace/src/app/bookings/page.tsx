import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate, formatTime, getInitials } from "@/lib/utils";
import { BookOpen, Calendar, Clock, Star, Video, MessageSquare } from "lucide-react";
import { BookingsFilter } from "./bookings-filter";

interface BookingsPageProps {
  searchParams: Promise<{ filter?: string }>;
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "confirmed":
      return "success" as const;
    case "pending":
      return "warning" as const;
    case "completed":
      return "default" as const;
    case "cancelled":
      return "error" as const;
    default:
      return "outline" as const;
  }
}

export default async function BookingsPage({ searchParams }: BookingsPageProps) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { filter } = await searchParams;
  const activeFilter = filter || "all";

  // Build where clause based on filter
  const whereClause: Record<string, unknown> = {
    studentId: session.user.id,
  };

  if (activeFilter === "upcoming") {
    whereClause.status = "confirmed";
    whereClause.scheduledAt = { gt: new Date() };
  } else if (activeFilter === "completed") {
    whereClause.status = "completed";
  } else if (activeFilter === "cancelled") {
    whereClause.status = "cancelled";
  }

  const bookings = await db.mktBooking.findMany({
    where: whereClause,
    include: {
      tutor: { select: { id: true, name: true, avatar: true } },
      review: { select: { id: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });

  // Get counts for filter badges
  const [allCount, upcomingCount, completedCount, cancelledCount] = await Promise.all([
    db.mktBooking.count({ where: { studentId: session.user.id } }),
    db.mktBooking.count({
      where: {
        studentId: session.user.id,
        status: "confirmed",
        scheduledAt: { gt: new Date() },
      },
    }),
    db.mktBooking.count({
      where: { studentId: session.user.id, status: "completed" },
    }),
    db.mktBooking.count({
      where: { studentId: session.user.id, status: "cancelled" },
    }),
  ]);

  const filterCounts = {
    all: allCount,
    upcoming: upcomingCount,
    completed: completedCount,
    cancelled: cancelledCount,
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
          <p className="mt-1 text-gray-500">Manage your lessons and past sessions.</p>
        </div>
        <Link href="/tutors">
          <Button>
            <BookOpen className="mr-2 h-4 w-4" />
            Book New Lesson
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <BookingsFilter activeFilter={activeFilter} counts={filterCounts} />

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Calendar className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm font-medium text-gray-900">No bookings found</p>
            <p className="mt-1 text-sm text-gray-500">
              {activeFilter === "all"
                ? "You haven't booked any lessons yet."
                : `No ${activeFilter} bookings.`}
            </p>
            <Link href="/tutors">
              <Button size="sm" className="mt-4">Find a Tutor</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => {
            const isCompleted = booking.status === "completed";
            const hasReview = !!booking.review;
            const canReview = isCompleted && !hasReview;

            return (
              <Card key={booking.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                        {booking.tutor.avatar ? (
                          <img
                            src={booking.tutor.avatar}
                            alt={booking.tutor.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          getInitials(booking.tutor.name)
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {booking.tutor.name}
                        </h3>
                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {booking.scheduledAt
                              ? formatDate(booking.scheduledAt)
                              : "Not scheduled"}
                          </span>
                          {booking.scheduledAt && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatTime(
                                new Date(booking.scheduledAt)
                                  .toTimeString()
                                  .slice(0, 5)
                              )}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {booking.durationMinutes} min
                          </span>
                        </div>
                        {booking.notes && (
                          <p className="mt-2 text-sm text-gray-400 line-clamp-1">
                            {booking.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Badge variant={getStatusBadgeVariant(booking.status)}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                      <span className="text-sm font-medium text-gray-700">
                        {formatCurrency(booking.priceCharged)}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-4 flex items-center gap-2 border-t pt-3">
                    {booking.status === "confirmed" && booking.videoRoomUrl && (
                      <a href={booking.videoRoomUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" variant="success">
                          <Video className="mr-1.5 h-3.5 w-3.5" />
                          Join Lesson
                        </Button>
                      </a>
                    )}
                    {canReview && (
                      <Link href={`/bookings/${booking.id}/review`}>
                        <Button size="sm" variant="outline">
                          <Star className="mr-1.5 h-3.5 w-3.5" />
                          Leave Review
                        </Button>
                      </Link>
                    )}
                    {isCompleted && hasReview && (
                      <Badge variant="outline">
                        <Star className="mr-1 h-3 w-3" />
                        Reviewed
                      </Badge>
                    )}
                    <Link href={`/messages?with=${booking.tutorId}`}>
                      <Button size="sm" variant="ghost">
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
                        Message
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
