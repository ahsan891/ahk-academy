import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusCircle, ClipboardList, Users, CheckCircle2 } from "lucide-react";
import { db } from "@/lib/db";
import {
  requireRole,
  formatDateTimeTR,
  formatTRY,
  MODES,
  REQUEST_KINDS,
  REQUEST_STATUS_VARIANT,
} from "@/lib/cover";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Cover requests - AHK Cover Network" };

export default async function InstitutionPage() {
  const user = await requireRole("HEAD_TEACHER");
  const institution = await db.institution.findFirst({ where: { ownerId: user.id } });
  if (!institution) redirect("/institution/settings");

  const [requests, verifiedTeachers] = await Promise.all([
    db.coverRequest.findMany({
      where: { institutionId: institution.id },
      include: {
        assignedTeacher: { select: { name: true } },
        _count: { select: { applications: { where: { status: "APPLIED" } } } },
      },
      orderBy: { startsAt: "desc" },
      take: 50,
    }),
    db.tutorProfile.count({ where: { verifiedAt: { not: null }, openToCover: true } }),
  ]);

  const open = requests.filter((r) => r.status === "OPEN").length;
  const filled = requests.filter((r) => r.status === "FILLED" || r.status === "COMPLETED").length;

  const stats = [
    { label: "Open requests", value: open, icon: ClipboardList, color: "bg-yellow-100 text-yellow-700" },
    { label: "Filled", value: filled, icon: CheckCircle2, color: "bg-green-100 text-green-700" },
    { label: "Verified teachers", value: verifiedTeachers, icon: Users, color: "bg-indigo-100 text-indigo-700" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{institution.name}</h1>
          <p className="mt-1 text-gray-500">Find a vetted teacher for a cover lesson or a new group.</p>
        </div>
        <Link href="/institution/requests/new">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Request a teacher
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your requests</CardTitle>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="py-10 text-center">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-3 text-sm text-gray-500">No requests yet. Post one and verified teachers nearby get notified.</p>
            </div>
          ) : (
            <div className="divide-y">
              {requests.map((r) => (
                <Link
                  key={r.id}
                  href={`/institution/requests/${r.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 py-4 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {r.subject} {r.level && `· ${r.level}`} · {REQUEST_KINDS[r.kind] ?? r.kind}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateTimeTR(r.startsAt)} · {MODES[r.mode]} · {formatTRY(r.payPerSession)}/session
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {r.status === "OPEN" && (
                      <span className="text-sm text-gray-600">
                        {r._count.applications} applicant{r._count.applications === 1 ? "" : "s"}
                      </span>
                    )}
                    {r.assignedTeacher && <span className="text-sm text-gray-600">{r.assignedTeacher.name}</span>}
                    <Badge variant={REQUEST_STATUS_VARIANT[r.status]}>{r.status.toLowerCase()}</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
