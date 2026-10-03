"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole, syncVerification, notify, checkLabel } from "@/lib/cover";

export async function reviewCheck(checkId: string, formData: FormData) {
  const admin = await requireRole("ADMIN");
  const decision = formData.get("decision");
  if (decision !== "APPROVED" && decision !== "REJECTED") return;
  const note = String(formData.get("reviewerNote") ?? "").trim() || null;
  if (decision === "REJECTED" && !note) return;

  const check = await db.verificationCheck.update({
    where: { id: checkId },
    data: { status: decision, reviewerNote: note, reviewedById: admin.id, reviewedAt: new Date() },
    include: { tutorProfile: { select: { userId: true } } },
  });

  if (decision === "REJECTED") {
    await notify(
      check.tutorProfile.userId,
      `${checkLabel(check.type)} needs changes`,
      note ?? "Please check your submission and send it again."
    );
  }
  await syncVerification(check.tutorProfileId);
  revalidatePath("/admin/verification");
}
