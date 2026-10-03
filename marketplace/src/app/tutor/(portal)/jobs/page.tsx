import Link from "next/link";
import { redirect } from "next/navigation";
import { Briefcase, MapPin, Phone, ShieldAlert } from "lucide-react";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requireRole, formatDateTimeTR, formatTRY, MODES, REQUEST_KINDS, REQUEST_STATUS_VARIANT } from "@/lib/cover";
import { applyToRequest, withdrawApplication, rateInstitution } from "../../actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export const metadata = { title: "Cover jobs - AHK Cover Network" };

export default async function CoverJobsPage({
  searchParams,
}: {
  searchParams: Promise<{ all?: string; error?: string }>;
}) {
  const user = await requireRole("TUTOR");
  const { all, error } = await searchParams;
  const profile = await db.tutorProfile.findUnique({ where: { userId: user.id } });
  if (!profile) redirect("/tutor/apply");

  const showAll = all === "1";
  const modeOptions: Prisma.CoverRequestWhereInput[] = [];
  if (profile.teachesOnline) modeOptions.push({ mode: { in: ["ONLINE", "HYBRID"] } });
  if (profile.teachesInPerson) {
    modeOptions.push({ mode: { in: ["IN_PERSON", "HYBRID"] }, ...(profile.city ? { city: profile.city } : {}) });
  }

  const [openJobs, myApplications, myJobs] = await Promise.all([
    db.coverRequest.findMany({
      where: {
        status: "OPEN",
        startsAt: { gt: new Date() },
        ...(!showAll && modeOptions.length > 0 ? { OR: modeOptions } : {}),
      },
      include: {
        institution: { select: { name: true, type: true } },
        applications: { where: { teacherId: user.id }, select: { id: true, status: true } },
      },
      orderBy: { startsAt: "asc" },
      take: 50,
    }),
    db.coverApplication.count({ where: { teacherId: user.id, status: "APPLIED" } }),
    db.coverRequest.findMany({
      where: { assignedTeacherId: user.id, status: { in: ["FILLED", "COMPLETED"] } },
      include: {
        institution: { select: { name: true, phone: true, address: true, district: true, city: true } },
        ratings: { where: { raterId: user.id } },
      },
      orderBy: { startsAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cover jobs</h1>
          <p className="mt-1 text-gray-500">
            Substitute lessons, backup slots and new groups from courses near you. {myApplications} pending application
            {myApplications === 1 ? "" : "s"}.
          </p>
        </div>
        <Link href={showAll ? "/tutor/jobs" : "/tutor/jobs?all=1"} className="text-sm font-medium text-indigo-600">
          {showAll ? "Show jobs that match me" : "Show all open jobs"}
        </Link>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {!profile.verifiedAt && (
        <div className="flex flex-wrap items-center gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-800">
          <ShieldAlert className="h-5 w-5" />
          <span className="flex-1">You need to finish verification before you can apply.</span>
          <Link href="/tutor/verification">
            <Button size="sm">Get verified</Button>
          </Link>
        </div>
      )}

      {myJobs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your confirmed jobs</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {myJobs.map((job) => {
              const myRating = job.ratings[0];
              return (
                <div key={job.id} className="space-y-2 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-gray-900">
                      {job.institution.name} · {job.subject} {job.level}
                    </p>
                    <Badge variant={REQUEST_STATUS_VARIANT[job.status]}>{job.status.toLowerCase()}</Badge>
                  </div>
                  <p className="text-sm text-gray-500">
                    {formatDateTimeTR(job.startsAt)} · {job.sessionsCount} × {job.durationMinutes} min ·{" "}
                    {formatTRY(job.payPerSession)}/session
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {job.institution.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {job.institution.phone}
                      </span>
                    )}
                    {job.mode !== "ONLINE" && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {[job.institution.address, job.institution.district, job.institution.city].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                  {job.notes && <p className="whitespace-pre-line text-sm text-gray-700">{job.notes}</p>}
                  {job.status === "COMPLETED" && (
                    <form action={rateInstitution.bind(null, job.id)} className="flex flex-wrap items-end gap-2 pt-2">
                      <Select name="rating" defaultValue={String(myRating?.rating ?? 5)} className="w-24">
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>{n} ★</option>
                        ))}
                      </Select>
                      <Input name="comment" defaultValue={myRating?.comment ?? ""} placeholder="How was this institution?" className="min-w-48 flex-1" />
                      <Button type="submit" size="sm">{myRating ? "Update rating" : "Rate institution"}</Button>
                    </form>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {openJobs.length === 0 ? (
          <Card>
            <CardContent className="py-10 text-center">
              <Briefcase className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No open jobs right now. We&apos;ll notify you when one comes in.</p>
            </CardContent>
          </Card>
        ) : (
          openJobs.map((job) => {
            const application = job.applications[0];
            const applied = application?.status === "APPLIED";
            return (
              <Card key={job.id}>
                <CardContent className="space-y-3 p-6">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">
                        {job.subject} {job.level && `· ${job.level}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {job.institution.name} · {REQUEST_KINDS[job.kind] ?? job.kind}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{formatTRY(job.payPerSession)}<span className="text-sm font-normal text-gray-500">/session</span></p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant="outline">{formatDateTimeTR(job.startsAt)}</Badge>
                    <Badge variant="outline">{job.sessionsCount} × {job.durationMinutes} min</Badge>
                    <Badge variant="outline">
                      {MODES[job.mode]}
                      {job.mode !== "ONLINE" && job.city && ` · ${[job.district, job.city].filter(Boolean).join(", ")}`}
                    </Badge>
                    {job.ageGroup && <Badge variant="outline">{job.ageGroup}</Badge>}
                  </div>
                  {job.notes && <p className="whitespace-pre-line text-sm text-gray-700">{job.notes}</p>}

                  {applied ? (
                    <div className="flex items-center gap-3">
                      <Badge variant="warning">Applied</Badge>
                      <form action={withdrawApplication.bind(null, application.id)}>
                        <Button type="submit" variant="ghost" size="sm">Withdraw</Button>
                      </form>
                    </div>
                  ) : profile.verifiedAt ? (
                    <form action={applyToRequest.bind(null, job.id)} className="flex flex-wrap gap-2">
                      <Input name="message" placeholder="Short note to the head teacher (optional)" className="min-w-48 flex-1" />
                      <Button type="submit">Apply</Button>
                    </form>
                  ) : null}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
