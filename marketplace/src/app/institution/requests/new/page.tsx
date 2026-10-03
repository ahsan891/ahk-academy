import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireRole, CITIES, COVER_LEVELS, AGE_GROUPS, MODES, REQUEST_KINDS } from "@/lib/cover";
import { createCoverRequest } from "../../actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Request a teacher - AHK Cover Network" };

export default async function NewCoverRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireRole("HEAD_TEACHER");
  const { error } = await searchParams;
  const institution = await db.institution.findFirst({ where: { ownerId: user.id } });
  if (!institution) redirect("/institution/settings");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Request a teacher</h1>
        <p className="mt-1 text-gray-500">
          Verified teachers who match the mode and city are notified straight away.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form action={createCoverRequest} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>What do you need?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Type</label>
                <Select name="kind" defaultValue="SUBSTITUTE">
                  {Object.entries(REQUEST_KINDS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Subject</label>
                <Input name="subject" defaultValue="English" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Level</label>
                <Select name="level" defaultValue="">
                  <option value="">Any</option>
                  {COVER_LEVELS.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Students</label>
                <Select name="ageGroup" defaultValue="">
                  <option value="">Any</option>
                  {AGE_GROUPS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>When and where</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">First lesson (Turkey time)</label>
                <Input name="startsAt" type="datetime-local" required />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Lesson length (minutes)</label>
                <Input name="durationMinutes" type="number" min={15} step={5} defaultValue={90} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Number of sessions</label>
                <Input name="sessionsCount" type="number" min={1} defaultValue={1} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Mode</label>
                <Select name="mode" defaultValue="IN_PERSON">
                  {Object.entries(MODES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">City</label>
                <Select name="city" defaultValue={institution.city}>
                  {CITIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">District</label>
                <Input name="district" defaultValue={institution.district ?? ""} />
              </div>
            </div>
            <p className="text-xs text-gray-400">City and district are ignored for online lessons.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pay and notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Pay per session (TRY)</label>
              <Input name="payPerSession" type="number" min={1} required placeholder="e.g. 1500" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Notes for the teacher</label>
              <Textarea
                name="notes"
                rows={4}
                placeholder="Coursebook, unit to cover, group size, anything they should know."
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" size="lg">Post request</Button>
      </form>
    </div>
  );
}
