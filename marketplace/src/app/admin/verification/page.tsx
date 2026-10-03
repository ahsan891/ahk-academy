import Link from "next/link";
import { ExternalLink, ShieldCheck } from "lucide-react";
import { db } from "@/lib/db";
import { requireRole, requiredChecks, checkLabel, formatDateTimeTR } from "@/lib/cover";
import { reviewCheck } from "../actions";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const metadata = { title: "Vetting queue - AHK Cover Network" };

export default async function VettingQueuePage() {
  await requireRole("ADMIN");

  const [pending, verifiedCount] = await Promise.all([
    db.verificationCheck.findMany({
      where: { status: "SUBMITTED" },
      include: {
        tutorProfile: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            verificationChecks: { select: { type: true, status: true } },
          },
        },
      },
      orderBy: { submittedAt: "asc" },
      take: 100,
    }),
    db.tutorProfile.count({ where: { verifiedAt: { not: null } } }),
  ]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Vetting queue</h1>
        <p className="mt-1 text-gray-500">
          {pending.length} submission{pending.length === 1 ? "" : "s"} waiting · {verifiedCount} verified teachers.
          Verify e-Devlet barcodes at turkiye.gov.tr/belge-dogrulama before approving.
        </p>
      </div>

      {pending.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <ShieldCheck className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">Nothing to review.</p>
          </CardContent>
        </Card>
      ) : (
        pending.map((check) => {
          const teacher = check.tutorProfile.user;
          const required = requiredChecks(check.tutorProfile.country);
          const approved = check.tutorProfile.verificationChecks.filter(
            (c) => c.status === "APPROVED" && required.includes(c.type)
          ).length;
          return (
            <Card key={check.id}>
              <CardHeader>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base">{checkLabel(check.type)}</CardTitle>
                    <p className="mt-1 text-sm text-gray-500">
                      <Link href={`/tutors/${teacher.id}`} className="font-medium text-gray-700 hover:text-indigo-600">
                        {teacher.name}
                      </Link>{" "}
                      · {teacher.email}
                      {teacher.phone && ` · ${teacher.phone}`}
                    </p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <Badge variant="warning">{approved}/{required.length} approved</Badge>
                    {check.submittedAt && <p className="mt-1">Submitted {formatDateTimeTR(check.submittedAt)}</p>}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {check.documentUrl && (
                  <a
                    href={check.documentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-indigo-600 hover:underline"
                  >
                    Open document <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {check.reference && (
                  <p className="text-gray-700">
                    <span className="text-gray-500">Reference:</span> {check.reference}
                  </p>
                )}
                {check.teacherNote && (
                  <p className="text-gray-700">
                    <span className="text-gray-500">Note:</span> {check.teacherNote}
                  </p>
                )}
                <form action={reviewCheck.bind(null, check.id)} className="flex flex-wrap items-center gap-2 border-t pt-3">
                  <Input name="reviewerNote" placeholder="Note to the teacher (required when rejecting)" className="min-w-48 flex-1" />
                  <Button type="submit" name="decision" value="APPROVED" variant="success" size="sm">
                    Approve
                  </Button>
                  <Button type="submit" name="decision" value="REJECTED" variant="destructive" size="sm">
                    Request changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
