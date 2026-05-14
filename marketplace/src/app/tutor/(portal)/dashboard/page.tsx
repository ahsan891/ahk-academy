import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/star-rating";
import Link from "next/link";
import { DollarSign, BookOpen, Star, CalendarClock, AlertCircle } from "lucide-react";

export default async function TutorDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tutorProfile = await db.tutorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!tutorProfile) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="rounded-full bg-yellow-100 p-4 mb-6">
          <AlertCircle className="h-12 w-12 text-yellow-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Tutor Profile</h1>
        <p className="text-gray-500 mb-6 max-w-md text-center">
          You need to set up your tutor profile before you can start accepting bookings and
          receiving students.
        </p>
        <Link href="/tutor/profile/edit">
          <Button size="lg">Set Up Profile</Button>
        </Link>
      </div>
    );
  }

  const now = new Date();

  const [upcomingBookings, completedCount, recentReviews, totalEarningsResult] =
    await Promise.all([
      db.mktBooking.findMany({
        where: {
          tutorId: session.user.id,
          status: "confirmed",
          scheduledAt: { gt: now },
        },
        include: {
          student: { select: { name: true, email: true } },
        },
        orderBy: { scheduledAt: "asc" },
        take: 5,
      }),
      db.mktBooking.count({
        where: {
          tutorId: session.user.id,
          status: "completed",
        },
      }),
      db.review.findMany({
        where: { tutorId: session.user.id, isPublic: true },
        include: {
          student: { select: { name: true } },
          booking: { select: { scheduledAt: true, durationMinutes: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      db.mktBooking.aggregate({
        where: {
          tutorId: session.user.id,
          status: "completed",
        },
        _sum: { tutorEarnings: true },
      }),
    ]);

  const totalEarnings = totalEarningsResult._sum.tutorEarnings || 0;

  const stats = [
    {
      label: "Total Earnings",
      value: formatCurrency(totalEarnings),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
    },
    {
      label: "Total Lessons",
      value: tutorProfile.totalLessons.toString(),
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-100",
    },
    {
      label: "Average Rating",
      value: tutorProfile.averageRating.toFixed(1),
      icon: Star,
      color: "text-yellow-600",
      bg: "bg-yellow-100",
    },
    {
      label: "Upcoming Bookings",
      value: upcomingBookings.length.toString(),
      icon: CalendarClock,
      color: "text-indigo-600",
      bg: "bg-indigo-100",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session.user.name}!
        </h1>
        <p className="text-gray-500 mt-1">
          Here is an overview of your tutoring activity.
        </p>
      </div>

      {!tutorProfile.isApproved && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-medium text-yellow-800">Profile Pending Approval</p>
              <p className="text-sm text-yellow-600">
                Your tutor profile is currently under review. You will be able to accept bookings
                once your profile is approved.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`rounded-full p-3 ${stat.bg}`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Bookings</CardTitle>
              <Link href="/tutor/bookings">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingBookings.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No upcoming bookings scheduled.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingBookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                        {booking.student.name?.[0] || "S"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {booking.student.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {booking.scheduledAt
                            ? formatDate(booking.scheduledAt)
                            : "Not scheduled"}{" "}
                          &middot; {booking.durationMinutes} min
                        </p>
                      </div>
                    </div>
                    <Badge variant="success">Confirmed</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            {recentReviews.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No reviews yet. Complete lessons to start receiving feedback.
              </p>
            ) : (
              <div className="space-y-4">
                {recentReviews.map((review) => (
                  <div key={review.id} className="border-b pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900">
                        {review.student.name}
                      </p>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    {review.comment && (
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {review.comment}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDate(review.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
