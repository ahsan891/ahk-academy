"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireRole, syncVerification, notify, formatDateTimeTR, CHECKS } from "@/lib/cover";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function myProfile(userId: string) {
  const profile = await db.tutorProfile.findUnique({ where: { userId } });
  if (!profile) redirect("/tutor/apply");
  return profile;
}

export async function saveCoverPreferences(formData: FormData) {
  const user = await requireRole("TUTOR");
  const profile = await myProfile(user.id);

  await db.$transaction([
    db.tutorProfile.update({
      where: { id: profile.id },
      data: {
        country: text(formData, "country") ?? profile.country,
        city: text(formData, "city"),
        district: text(formData, "district"),
        teachesOnline: formData.get("teachesOnline") === "on",
        teachesInPerson: formData.get("teachesInPerson") === "on",
        openToCover: formData.get("openToCover") === "on",
        levels: formData.getAll("levels").join(", ") || null,
        ageGroups: formData.getAll("ageGroups").join(", ") || null,
      },
    }),
    db.user.update({ where: { id: user.id }, data: { phone: text(formData, "phone") } }),
  ]);

  // Country decides whether a work permit is required.
  await syncVerification(profile.id);
  revalidatePath("/tutor/verification");
}

export async function submitCheck(type: string, formData: FormData) {
  const user = await requireRole("TUTOR");
  const profile = await myProfile(user.id);
  if (!CHECKS.some((c) => c.type === type)) return;

  const documentUrl = text(formData, "documentUrl");
  const reference = text(formData, "reference");
  // Criminal records and ID documents are sensitive data under KVKK and need explicit consent.
  if (formData.get("consent") !== "on") {
    redirect(`/tutor/verification?error=${encodeURIComponent("Please give consent to process your documents")}`);
  }
  if (documentUrl && !/^https?:\/\//i.test(documentUrl)) {
    redirect(`/tutor/verification?error=${encodeURIComponent("The document link must start with https://")}`);
  }
  if (!documentUrl && !reference) {
    redirect(`/tutor/verification?error=${encodeURIComponent("Add a document link or reference before submitting")}`);
  }

  const existing = await db.verificationCheck.findUnique({
    where: { tutorProfileId_type: { tutorProfileId: profile.id, type } },
  });
  // Approved checks stay locked so a teacher can't swap the document afterwards.
  if (existing?.status === "APPROVED") return;

  const data = {
    documentUrl,
    reference,
    teacherNote: text(formData, "teacherNote"),
    status: "SUBMITTED",
    submittedAt: new Date(),
    reviewerNote: null,
    reviewedAt: null,
    reviewedById: null,
  };
  await db.verificationCheck.upsert({
    where: { tutorProfileId_type: { tutorProfileId: profile.id, type } },
    update: data,
    create: { ...data, tutorProfileId: profile.id, type },
  });

  await syncVerification(profile.id);
  revalidatePath("/tutor/verification");
  redirect("/tutor/verification");
}

export async function applyToRequest(requestId: string, formData: FormData) {
  const user = await requireRole("TUTOR");
  const profile = await myProfile(user.id);
  if (!profile.verifiedAt) redirect("/tutor/verification");

  const request = await db.coverRequest.findUnique({
    where: { id: requestId },
    include: { institution: true },
  });
  if (!request || request.status !== "OPEN" || request.startsAt < new Date()) {
    redirect("/tutor/jobs?error=This job is no longer open");
  }

  await db.coverApplication.upsert({
    where: { coverRequestId_teacherId: { coverRequestId: request.id, teacherId: user.id } },
    update: { status: "APPLIED", message: text(formData, "message") },
    create: { coverRequestId: request.id, teacherId: user.id, message: text(formData, "message") },
  });
  await notify(
    request.createdById,
    "New applicant",
    `${user.name} applied for your ${request.subject} cover on ${formatDateTimeTR(request.startsAt)}.`
  );

  revalidatePath("/tutor/jobs");
}

export async function withdrawApplication(applicationId: string) {
  const user = await requireRole("TUTOR");
  await db.coverApplication.updateMany({
    where: { id: applicationId, teacherId: user.id, status: "APPLIED" },
    data: { status: "WITHDRAWN" },
  });
  revalidatePath("/tutor/jobs");
}

export async function rateInstitution(requestId: string, formData: FormData) {
  const user = await requireRole("TUTOR");
  const rating = Number(formData.get("rating"));
  const request = await db.coverRequest.findUnique({ where: { id: requestId } });
  if (!request || request.assignedTeacherId !== user.id || request.status !== "COMPLETED") return;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;

  await db.coverRating.upsert({
    where: { coverRequestId_raterId: { coverRequestId: request.id, raterId: user.id } },
    update: { rating, comment: text(formData, "comment") },
    create: {
      coverRequestId: request.id,
      raterId: user.id,
      rateeId: request.createdById,
      rating,
      comment: text(formData, "comment"),
    },
  });
  revalidatePath("/tutor/jobs");
}
