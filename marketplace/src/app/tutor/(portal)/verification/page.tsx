import { redirect } from "next/navigation";
import { ShieldCheck, CheckCircle2, Clock, XCircle, Circle } from "lucide-react";
import { db } from "@/lib/db";
import {
  requireRole,
  requiredChecks,
  CHECKS,
  CITIES,
  COVER_LEVELS,
  AGE_GROUPS,
} from "@/lib/cover";
import { saveCoverPreferences, submitCheck } from "../../actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

export const metadata = { title: "Verification - AHK Cover Network" };

const STATUS = {
  NOT_SUBMITTED: { label: "Not submitted", variant: "outline", icon: Circle },
  SUBMITTED: { label: "In review", variant: "warning", icon: Clock },
  APPROVED: { label: "Approved", variant: "success", icon: CheckCircle2 },
  REJECTED: { label: "Changes needed", variant: "error", icon: XCircle },
} as const;

export default async function VerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireRole("TUTOR");
  const { error } = await searchParams;
  const profile = await db.tutorProfile.findUnique({
    where: { userId: user.id },
    include: { verificationChecks: true, user: { select: { phone: true } } },
  });
  if (!profile) redirect("/tutor/apply");

  const required = requiredChecks(profile.country);
  const byType = new Map(profile.verificationChecks.map((c) => [c.type, c]));
  const approvedRequired = required.filter((t) => byType.get(t)?.status === "APPROVED").length;
  const visibleChecks = CHECKS.filter((c) => c.type !== "WORK_PERMIT" || required.includes("WORK_PERMIT"));
  const levels = new Set(profile.levels?.split(", ") ?? []);
  const ageGroups = new Set(profile.ageGroups?.split(", ") ?? []);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Get verified</h1>
        <p className="mt-1 text-gray-500">
          Verified teachers are shown to head teachers and can apply for cover jobs and new groups.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <Card>
        <CardContent className="flex flex-wrap items-center gap-4 p-6">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-lg ${
              profile.verifiedAt ? "bg-green-100 text-green-700" : "bg-indigo-100 text-indigo-700"
            }`}
          >
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">
              {profile.verifiedAt ? "You are verified" : `${approvedRequired} of ${required.length} required checks approved`}
            </p>
            <div className="mt-2 h-2 w-full rounded-full bg-gray-100">
              <div
                className="h-2 rounded-full bg-green-500"
                style={{ width: `${(approvedRequired / required.length) * 100}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Where and how you can teach</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveCoverPreferences} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Phone (shared only with confirmed jobs)</label>
                <Input name="phone" type="tel" defaultValue={profile.user.phone ?? ""} placeholder="+90 5xx xxx xx xx" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Citizenship</label>
                <Input name="country" defaultValue={profile.country ?? "Türkiye"} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
                <Select name="city" defaultValue={profile.city ?? ""}>
                  <option value="">Choose a city</option>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
                <Input name="district" defaultValue={profile.district ?? ""} placeholder="e.g. Beşiktaş" />
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-700">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="teachesInPerson" defaultChecked={profile.teachesInPerson} />
                Face to face
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="teachesOnline" defaultChecked={profile.teachesOnline} />
                Online
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" name="openToCover" defaultChecked={profile.openToCover} />
                Notify me about cover jobs
              </label>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Levels</p>
              <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                {COVER_LEVELS.map((l) => (
                  <label key={l} className="flex items-center gap-1.5">
                    <input type="checkbox" name="levels" value={l} defaultChecked={levels.has(l)} />
                    {l}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Students</p>
              <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                {AGE_GROUPS.map((a) => (
                  <label key={a} className="flex items-center gap-1.5">
                    <input type="checkbox" name="ageGroups" value={a} defaultChecked={ageGroups.has(a)} />
                    {a}
                  </label>
                ))}
              </div>
            </div>

            <Button type="submit">Save preferences</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {visibleChecks.map((check) => {
          const existing = byType.get(check.type);
          const status = STATUS[(existing?.status ?? "NOT_SUBMITTED") as keyof typeof STATUS];
          const isRequired = required.includes(check.type);
          return (
            <Card key={check.type}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <status.icon className="h-5 w-5 text-gray-400" />
                    {check.label}
                    {!isRequired && <span className="text-xs font-normal text-gray-400">(optional)</span>}
                  </CardTitle>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <p className="text-sm text-gray-500">{check.description}</p>
              </CardHeader>
              <CardContent>
                {existing?.status === "REJECTED" && existing.reviewerNote && (
                  <p className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{existing.reviewerNote}</p>
                )}
                {existing?.status === "APPROVED" ? (
                  <p className="text-sm text-green-700">Approved — nothing more to do.</p>
                ) : (
                  <form action={submitCheck.bind(null, check.type)} className="space-y-3">
                    <Input
                      name="documentUrl"
                      type="url"
                      defaultValue={existing?.documentUrl ?? ""}
                      placeholder="Link to the document or video (Google Drive, Dropbox…)"
                    />
                    {check.referenceLabel && (
                      <Input name="reference" defaultValue={existing?.reference ?? ""} placeholder={check.referenceLabel} />
                    )}
                    <Input name="teacherNote" defaultValue={existing?.teacherNote ?? ""} placeholder="Note for the reviewer (optional)" />
                    <label className="flex items-start gap-2 text-xs text-gray-500">
                      <input type="checkbox" name="consent" required className="mt-0.5" />
                      I give explicit consent for AHK Academy to process this document to vet me as a teacher, as
                      described in the KVKK privacy notice.
                    </label>
                    <Button type="submit" size="sm">
                      {existing?.status === "SUBMITTED" ? "Update submission" : "Submit for review"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
