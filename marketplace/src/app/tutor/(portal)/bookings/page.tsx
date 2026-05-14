import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { formatCurrency, formatDate, formatTime, getInitials } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { BookOpen, Clock } from "lucide-react";

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "success" | "warning" | "error" | "outline" }> = {
  pending: { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "default" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "error" },
  "no-show": { label: "No Show", variant: "error" },
};

export default async function TutorBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const tutorProfile = await db.tutorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!tutorProfile) redirect("/tutor/dashboard");

  const { status: filterStatus } = await searchParams;

  const where: Record<string, unknown> = { tutorId: session.user.id };

  if (filterStatus && filterStatus !== "all") {
    if (filterStatus === "upcoming") {
      where.status = "confirmed";
      where.scheduledAt = { gt: new Date() };
    } else {
      where.status = filterStatus;
    }
  }

  const bookings = await db.mktBooking.findMany({
    where,
    include: {
      student: { select: { id: true, name: true, email: true } },
      review: { select: { rating: true } },
    },
    orderBy: { scheduledAt: "desc" },
  });

  const tabs = [
    { key: "all", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
  ];

  const activeTab = filterStatus || "all";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bookings</h1>
        <p className="text-gray-500 mt-1">Manage your lesson bookings and schedule.</p>
      </div>

      <div className="flex gap-2 border-b pb-0">
        {tabs.map((tab) => (
          <Link
            key={tab.key}
            href={`/tutor/bookings?status=${tab.key}`}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-indigo-600 text-indigo-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <BookOpen className="h-12 w-12 text-gray-300 mb-4" />
              <p className="text-gray-500 font-medium">No bookings found</p>
              <p className="text-sm text-gray-400 mt-1">
                {activeTab === "upcoming"
                  ? "You have no upcoming bookings."
                  : "No bookings match the selected filter."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                      Earnings
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {bookings.map((booking) => {
                    const badge = STATUS_BADGE[booking.status] || {
                      label: booking.status,
                      variant: "outline" as const,
                    };
                    return (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                              {getInitials(booking.student.name || "S")}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {booking.student.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {booking.student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {booking.scheduledAt ? (
                            <div>
                              <p className="text-sm text-gray-900">
                                {formatDate(booking.scheduledAt)}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatTime(
                                  booking.scheduledAt
                                    .toISOString()
                                    .slice(11, 16)
                                )}
                              </p>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">Not scheduled</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-sm text-gray-700">
                            <Clock className="h-4 w-4 text-gray-400" />
                            {booking.durationMinutes} min
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(booking.tutorEarnings)}
                          </p>
                          {booking.review && (
                            <p className="text-xs text-yellow-600 mt-0.5">
                              Rated {booking.review.rating}/5
                            </p>
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
