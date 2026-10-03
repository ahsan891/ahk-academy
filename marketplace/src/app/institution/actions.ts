"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import {
  requireRole,
  parseTurkeyDateTime,
  matchingTeachers,
  notify,
  notifyMany,
  formatDateTimeTR,
  REQUEST_KINDS,
  MODES,
  INSTITUTION_TYPES,
} from "@/lib/cover";

function text(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function ownedRequest(requestId: string, userId: string) {
  const request = await db.coverRequest.findUnique({
    where: { id: requestId },
    include: { institution: true },
  });
  if (!request || request.institution.ownerId !== userId) redirect("/institution");
  return request;
}

export async function saveInstitution(formData: FormData) {
  const user = await requireRole("HEAD_TEACHER");
  const name = text(formData, "name");
  const city = text(formData, "city");
  if (!name || !city) redirect("/institution/settings?error=Name and city are required");

  const typeValue = text(formData, "type") ?? "LANGUAGE_COURSE";
  const data = {
    name,
    city,
    type: typeValue in INSTITUTION_TYPES ? typeValue : "OTHER",
    district: text(formData, "district"),
    address: text(formData, "address"),
    phone: text(formData, "phone"),
    website: text(formData, "website"),
  };

  const existing = await db.institution.findFirst({ where: { ownerId: user.id } });
  if (existing) {
    await db.institution.update({ where: { id: existing.id }, data });
  } else {
    await db.institution.create({ data: { ...data, ownerId: user.id } });
  }

  revalidatePath("/institution");
  redirect("/institution");
}

export async function createCoverRequest(formData: FormData) {
  const user = await requireRole("HEAD_TEACHER");
  const institution = await db.institution.findFirst({ where: { ownerId: user.id } });
  if (!institution) redirect("/institution/settings");

  const startsAtRaw = text(formData, "startsAt");
  const startsAt = startsAtRaw ? parseTurkeyDateTime(startsAtRaw) : null;
  const pay = Number(formData.get("payPerSession"));
  const kind = text(formData, "kind") ?? "SUBSTITUTE";
  const mode = text(formData, "mode") ?? "IN_PERSON";

  const fail = (msg: string) => redirect(`/institution/requests/new?error=${encodeURIComponent(msg)}`);
  if (!startsAt) fail("Please choose a start date and time");
  if (startsAt! < new Date()) fail("The start time must be in the future");
  if (!Number.isFinite(pay) || pay <= 0) fail("Please enter the pay per session");
  if (!(kind in REQUEST_KINDS) || !(mode in MODES)) fail("Invalid request type");

  const request = await db.coverRequest.create({
    data: {
      institutionId: institution.id,
      createdById: user.id,
      kind,
      mode,
      subject: text(formData, "subject") ?? "English",
      level: text(formData, "level"),
      ageGroup: text(formData, "ageGroup"),
      city: mode === "ONLINE" ? null : text(formData, "city") ?? institution.city,
      district: mode === "ONLINE" ? null : text(formData, "district") ?? institution.district,
      startsAt: startsAt!,
      durationMinutes: Math.max(15, Number(formData.get("durationMinutes")) || 90),
      sessionsCount: Math.max(1, Number(formData.get("sessionsCount")) || 1),
      payPerSession: pay,
      notes: text(formData, "notes"),
    },
  });

  const teachers = await matchingTeachers(request);
  await notifyMany(
    teachers.map((t) => t.userId),
    `New cover job: ${request.subject} ${request.level ?? ""}`.trim(),
    `${institution.name} needs a teacher on ${formatDateTimeTR(request.startsAt)} (${MODES[mode]}).`
  );

  redirect(`/institution/requests/${request.id}`);
}

export async function acceptApplication(applicationId: string) {
  const user = await requireRole("HEAD_TEACHER");
  const application = await db.coverApplication.findUnique({ where: { id: applicationId } });
  if (!application) redirect("/institution");
  const request = await ownedRequest(application.coverRequestId, user.id);
  if (request.status !== "OPEN" || application.status !== "APPLIED") {
    redirect(`/institution/requests/${request.id}`);
  }

  const others = await db.coverApplication.findMany({
    where: { coverRequestId: request.id, id: { not: application.id }, status: "APPLIED" },
    select: { teacherId: true },
  });

  await db.$transaction([
    db.coverApplication.update({ where: { id: application.id }, data: { status: "ACCEPTED" } }),
    db.coverApplication.updateMany({
      where: { coverRequestId: request.id, id: { not: application.id }, status: "APPLIED" },
      data: { status: "DECLINED" },
    }),
    db.coverRequest.update({
      where: { id: request.id },
      data: { status: "FILLED", assignedTeacherId: application.teacherId, filledAt: new Date() },
    }),
  ]);

  await notify(
    application.teacherId,
    "You got the cover job",
    `${request.institution.name} confirmed you for ${formatDateTimeTR(request.startsAt)}. Their contact details are on the job page.`
  );
  await notifyMany(
    others.map((o) => o.teacherId),
    "Cover job filled",
    `The ${request.institution.name} job on ${formatDateTimeTR(request.startsAt)} has been filled.`
  );

  revalidatePath(`/institution/requests/${request.id}`);
}

export async function cancelRequest(requestId: string) {
  const user = await requireRole("HEAD_TEACHER");
  const request = await ownedRequest(requestId, user.id);
  if (request.status !== "OPEN" && request.status !== "FILLED") return;

  const applicants = await db.coverApplication.findMany({
    where: { coverRequestId: request.id, status: { in: ["APPLIED", "ACCEPTED"] } },
    select: { teacherId: true },
  });
  await db.coverRequest.update({ where: { id: request.id }, data: { status: "CANCELLED" } });
  await notifyMany(
    applicants.map((a) => a.teacherId),
    "Cover job cancelled",
    `${request.institution.name} cancelled the job on ${formatDateTimeTR(request.startsAt)}.`
  );

  revalidatePath(`/institution/requests/${request.id}`);
}

export async function completeRequest(requestId: string) {
  const user = await requireRole("HEAD_TEACHER");
  const request = await ownedRequest(requestId, user.id);
  if (request.status !== "FILLED") return;

  await db.coverRequest.update({
    where: { id: request.id },
    data: { status: "COMPLETED", completedAt: new Date() },
  });
  if (request.assignedTeacherId) {
    await notify(
      request.assignedTeacherId,
      "Job marked as completed",
      `${request.institution.name} marked your cover job as completed. You can now rate them.`
    );
  }

  revalidatePath(`/institution/requests/${request.id}`);
}

export async function rateTeacher(requestId: string, formData: FormData) {
  const user = await requireRole("HEAD_TEACHER");
  const request = await ownedRequest(requestId, user.id);
  const rating = Number(formData.get("rating"));
  if (request.status !== "COMPLETED" || !request.assignedTeacherId) return;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return;

  await db.coverRating.upsert({
    where: { coverRequestId_raterId: { coverRequestId: request.id, raterId: user.id } },
    update: { rating, comment: text(formData, "comment") },
    create: {
      coverRequestId: request.id,
      raterId: user.id,
      rateeId: request.assignedTeacherId,
      rating,
      comment: text(formData, "comment"),
    },
  });

  revalidatePath(`/institution/requests/${request.id}`);
}
