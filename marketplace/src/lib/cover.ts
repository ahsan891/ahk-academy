import { redirect } from "next/navigation";
import { auth } from "./auth";
import { db } from "./db";

// ==========================================
// Vetting
// ==========================================

export interface CheckDefinition {
  type: string;
  label: string;
  description: string;
  referenceLabel?: string;
}

export const CHECKS: CheckDefinition[] = [
  {
    type: "IDENTITY",
    label: "Identity",
    description: "Photo of your Turkish ID card (kimlik) or passport.",
  },
  {
    type: "DEGREE",
    label: "University degree",
    description: "Diploma or e-Devlet graduation certificate (mezun belgesi).",
    referenceLabel: "e-Devlet barcode (optional)",
  },
  {
    type: "CRIMINAL_RECORD",
    label: "Criminal record certificate",
    description: "Adli sicil kaydı downloaded from e-Devlet in the last 3 months.",
    referenceLabel: "e-Devlet barcode",
  },
  {
    type: "TEACHING_CERT",
    label: "Teaching certificate",
    description: "CELTA, DELTA, TESOL, TEFL, pedagogical formation or similar.",
  },
  {
    type: "REFERENCE",
    label: "Professional reference",
    description: "A head teacher or manager we can call about your teaching.",
    referenceLabel: "Referee name and phone",
  },
  {
    type: "DEMO_LESSON",
    label: "Demo lesson",
    description: "A 10–15 minute recording of you teaching, or book a live demo with us.",
  },
  {
    type: "WORK_PERMIT",
    label: "Work permit",
    description: "Required for non-Turkish citizens: a valid Turkish work permit.",
    referenceLabel: "Permit number",
  },
];

const ALWAYS_REQUIRED = ["IDENTITY", "DEGREE", "CRIMINAL_RECORD", "REFERENCE", "DEMO_LESSON"];

export function isTurkish(country: string | null | undefined) {
  if (!country) return true;
  return ["turkey", "türkiye", "turkiye", "tr"].includes(country.trim().toLowerCase());
}

export function requiredChecks(country: string | null | undefined) {
  return isTurkish(country) ? ALWAYS_REQUIRED : [...ALWAYS_REQUIRED, "WORK_PERMIT"];
}

export function checkLabel(type: string) {
  return CHECKS.find((c) => c.type === type)?.label ?? type;
}

/**
 * Recompute whether a teacher is fully verified. A teacher is verified only
 * while every required check is approved; full verification also lists them
 * on the student marketplace.
 */
export async function syncVerification(tutorProfileId: string) {
  const profile = await db.tutorProfile.findUnique({
    where: { id: tutorProfileId },
    include: { verificationChecks: true },
  });
  if (!profile) return;

  const approved = new Set(
    profile.verificationChecks.filter((c) => c.status === "APPROVED").map((c) => c.type)
  );
  const fullyVerified = requiredChecks(profile.country).every((t) => approved.has(t));
  const anyRejected = profile.verificationChecks.some((c) => c.status === "REJECTED");

  await db.tutorProfile.update({
    where: { id: tutorProfileId },
    data: fullyVerified
      ? {
          verifiedAt: profile.verifiedAt ?? new Date(),
          isApproved: true,
          approvalStatus: "approved",
        }
      : {
          verifiedAt: null,
          approvalStatus: anyRejected ? "changes_requested" : "pending",
        },
  });

  if (fullyVerified && !profile.verifiedAt) {
    await notify(
      profile.userId,
      "You are verified",
      "Your profile is now visible to head teachers and you can apply for cover jobs."
    );
  }
}

// ==========================================
// Cover requests
// ==========================================

export const REQUEST_KINDS: Record<string, string> = {
  SUBSTITUTE: "Substitute (one-off cover)",
  BACKUP: "Backup teacher (on call)",
  NEW_GROUP: "New group (ongoing)",
};

export const MODES: Record<string, string> = {
  IN_PERSON: "Face to face",
  ONLINE: "Online",
  HYBRID: "Either",
};

export const COVER_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "Mixed"];
export const AGE_GROUPS = ["Kids (6–11)", "Teens (12–17)", "Adults", "Exam prep (YDS/IELTS/TOEFL)"];
export const CITIES = [
  "İstanbul",
  "Ankara",
  "İzmir",
  "Bursa",
  "Antalya",
  "Kocaeli",
  "Konya",
  "Adana",
  "Gaziantep",
  "Eskişehir",
];
export const INSTITUTION_TYPES: Record<string, string> = {
  LANGUAGE_COURSE: "Language course",
  DERSHANE: "Dershane / study centre",
  PRIVATE_SCHOOL: "Private school",
  OTHER: "Other",
};

export const REQUEST_STATUS_VARIANT: Record<string, "default" | "success" | "warning" | "error" | "outline"> = {
  OPEN: "warning",
  FILLED: "success",
  COMPLETED: "default",
  CANCELLED: "outline",
};

/** Turkey has been on UTC+3 all year since 2016. */
export const TURKEY_TZ = "Europe/Istanbul";

/** Parse a `datetime-local` value as Istanbul time. */
export function parseTurkeyDateTime(value: string) {
  const date = new Date(`${value}:00+03:00`);
  return isNaN(date.getTime()) ? null : date;
}

export function formatTRY(amount: number) {
  return new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 }).format(amount);
}

export function formatDateTimeTR(date: Date | string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: TURKEY_TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

/** Verified teachers who could take this request. */
export async function matchingTeachers(request: { mode: string; city: string | null }) {
  const city = request.city ?? undefined;
  const modeFilter =
    request.mode === "ONLINE"
      ? { teachesOnline: true }
      : request.mode === "IN_PERSON"
      ? { teachesInPerson: true, city }
      : { OR: [{ teachesOnline: true }, { teachesInPerson: true, city }] };

  return db.tutorProfile.findMany({
    where: { verifiedAt: { not: null }, openToCover: true, ...modeFilter },
    select: { userId: true },
    take: 200,
  });
}

/** Average cover rating each user received, keyed by user id. */
export async function coverRatings(userIds: string[]) {
  if (userIds.length === 0) return new Map<string, { avg: number; count: number }>();
  const rows = await db.coverRating.groupBy({
    by: ["rateeId"],
    where: { rateeId: { in: userIds } },
    _avg: { rating: true },
    _count: { rating: true },
  });
  return new Map(rows.map((r) => [r.rateeId, { avg: r._avg.rating ?? 0, count: r._count.rating }]));
}

// ==========================================
// Session + notifications
// ==========================================

export async function requireRole(...roles: string[]) {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (!roles.includes(session.user.role)) redirect(homeForRole(session.user.role));
  return session.user;
}

export function homeForRole(role: string | undefined) {
  switch (role) {
    case "TUTOR":
      return "/tutor/dashboard";
    case "HEAD_TEACHER":
      return "/institution";
    case "ADMIN":
      return "/admin/verification";
    default:
      return "/dashboard";
  }
}

export async function notify(userId: string, title: string, message: string, type = "cover") {
  await db.notification.create({ data: { userId, title, message, type } });
}

export async function notifyMany(userIds: string[], title: string, message: string, type = "cover") {
  if (userIds.length === 0) return;
  await db.notification.createMany({
    data: userIds.map((userId) => ({ userId, title, message, type })),
  });
}
