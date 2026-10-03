import Link from "next/link";
import { notFound } from "next/navigation";
import { ShieldCheck, Star, Phone, Mail, ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import {
  requireRole,
  coverRatings,
  formatDateTimeTR,
  formatTRY,
  MODES,
  REQUEST_KINDS,
  REQUEST_STATUS_VARIANT,
} from "@/lib/cover";
import { acceptApplication, cancelRequest, completeRequest, rateTeacher } from "../../actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default async function CoverRequestPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireRole("HEAD_TEACHER");
  const { id } = await params;

  const request = await db.coverRequest.findUnique({
    where: { id },
    include: {
      institution: true,
      assignedTeacher: { select: { id: true, name: true, email: true, phone: true } },
      applications: {
        include: {
          teacher: {
            select: {
              id: true,
              name: true,
              tutorProfile: {
                select: {
                  verifiedAt: true,
                  yearsExperience: true,
                  certifications: true,
                  specialties: true,
                  city: true,
                  district: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      ratings: { where: { raterId: user.id } },
    },
  });
  if (!request || request.institution.ownerId !== user.id) notFound();

  const ratings = await coverRatings(request.applications.map((a) => a.teacherId));
  const myRating = request.ratings[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/institution" className="inline-flex items-center text-sm text-gray-500 hover:text-indigo-600">
        <ArrowLeft className="mr-1 h-4 w-4" />
        All requests
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>
                {request.subject} {request.level && `· ${request.level}`}
              </CardTitle>
              <p className="mt-2 text-sm text-gray-500">{REQUEST_KINDS[request.kind] ?? request.kind}</p>
            </div>
            <Badge variant={REQUEST_STATUS_VARIANT[request.status]}>{request.status.toLowerCase()}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-gray-500">First lesson</dt>
              <dd className="font-medium text-gray-900">{formatDateTimeTR(request.startsAt)}</dd>
            </div>
            <div>
              <dt className="text-gray-500">Sessions</dt>
              <dd className="font-medium text-gray-900">
                {request.sessionsCount} × {request.durationMinutes} min
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Mode</dt>
              <dd className="font-medium text-gray-900">
                {MODES[request.mode]}
                {request.mode !== "ONLINE" && request.city && ` · ${[request.district, request.city].filter(Boolean).join(", ")}`}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">Pay</dt>
              <dd className="font-medium text-gray-900">{formatTRY(request.payPerSession)} per session</dd>
            </div>
            {request.ageGroup && (
              <div>
                <dt className="text-gray-500">Students</dt>
                <dd className="font-medium text-gray-900">{request.ageGroup}</dd>
              </div>
            )}
          </dl>
          {request.notes && <p className="whitespace-pre-line rounded-lg bg-gray-50 p-3 text-sm text-gray-700">{request.notes}</p>}

          <div className="flex flex-wrap gap-2">
            {request.status === "FILLED" && (
              <form action={completeRequest.bind(null, request.id)}>
                <Button type="submit" variant="success">Mark as completed</Button>
              </form>
            )}
            {(request.status === "OPEN" || request.status === "FILLED") && (
              <form action={cancelRequest.bind(null, request.id)}>
                <Button type="submit" variant="outline">Cancel request</Button>
              </form>
            )}
          </div>
        </CardContent>
      </Card>

      {request.assignedTeacher && (
        <Card>
          <CardHeader>
            <CardTitle>Confirmed teacher</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <p className="text-base font-medium text-gray-900">{request.assignedTeacher.name}</p>
            <p className="flex items-center gap-2 text-gray-600">
              <Mail className="h-4 w-4" />
              {request.assignedTeacher.email}
            </p>
            {request.assignedTeacher.phone && (
              <p className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4" />
                {request.assignedTeacher.phone}
              </p>
            )}

            {request.status === "COMPLETED" && (
              <form action={rateTeacher.bind(null, request.id)} className="flex flex-wrap items-end gap-2 border-t pt-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-700">Rating</label>
                  <Select name="rating" defaultValue={String(myRating?.rating ?? 5)} className="w-24">
                    {[5, 4, 3, 2, 1].map((n) => (
                      <option key={n} value={n}>{n} ★</option>
                    ))}
                  </Select>
                </div>
                <div className="min-w-48 flex-1">
                  <label className="mb-1 block text-xs font-medium text-gray-700">Comment</label>
                  <Input name="comment" defaultValue={myRating?.comment ?? ""} placeholder="How did the lesson go?" />
                </div>
                <Button type="submit">{myRating ? "Update rating" : "Rate teacher"}</Button>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Applicants ({request.applications.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {request.applications.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-500">
              No applicants yet. Matching verified teachers have been notified.
            </p>
          ) : (
            <div className="divide-y">
              {request.applications.map((a) => {
                const profile = a.teacher.tutorProfile;
                const rating = ratings.get(a.teacherId);
                return (
                  <div key={a.id} className="flex flex-wrap items-start justify-between gap-4 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Link href={`/tutors/${a.teacher.id}`} className="font-medium text-gray-900 hover:text-indigo-600">
                          {a.teacher.name}
                        </Link>
                        {profile?.verifiedAt && (
                          <Badge variant="success">
                            <ShieldCheck className="mr-1 h-3 w-3" />
                            Verified
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {profile?.yearsExperience ?? 0} yrs experience
                        {profile?.certifications && ` · ${profile.certifications}`}
                        {profile?.city && ` · ${[profile.district, profile.city].filter(Boolean).join(", ")}`}
                      </p>
                      {rating && (
                        <p className="flex items-center gap-1 text-sm text-gray-600">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          {rating.avg.toFixed(1)} from {rating.count} cover job{rating.count === 1 ? "" : "s"}
                        </p>
                      )}
                      {a.message && <p className="text-sm text-gray-700">“{a.message}”</p>}
                    </div>
                    <div>
                      {a.status === "APPLIED" && request.status === "OPEN" ? (
                        <form action={acceptApplication.bind(null, a.id)}>
                          <Button type="submit" size="sm">Confirm teacher</Button>
                        </form>
                      ) : (
                        <Badge variant={a.status === "ACCEPTED" ? "success" : "outline"}>{a.status.toLowerCase()}</Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
