import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

interface TimeSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

interface AvailableSlot {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

function parseAvailableSlots(slotsJson: string | null): AvailableSlot[] {
  if (!slotsJson) return [];
  try {
    return JSON.parse(slotsJson);
  } catch {
    return [];
  }
}

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + (minutes || 0);
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function findOverlappingSlots(
  allStudentSlots: AvailableSlot[][],
  durationMinutes: number,
  preferredDays?: number[]
): TimeSlot[] {
  const results: TimeSlot[] = [];
  const daysToCheck = preferredDays && preferredDays.length > 0
    ? preferredDays
    : [0, 1, 2, 3, 4, 5, 6]; // All days

  for (const day of daysToCheck) {
    // Get each student's availability for this day
    const daySlots = allStudentSlots.map((studentSlots) =>
      studentSlots.filter((slot) => slot.dayOfWeek === day)
    );

    // If any student has no availability on this day, skip
    if (daySlots.some((slots) => slots.length === 0)) continue;

    // Find the intersection of all students' time ranges for this day
    // Start with the first student's slots and progressively intersect
    let possibleRanges: { start: number; end: number }[] = daySlots[0].map((slot) => ({
      start: timeToMinutes(slot.startTime),
      end: timeToMinutes(slot.endTime),
    }));

    for (let i = 1; i < daySlots.length; i++) {
      const studentRanges = daySlots[i].map((slot) => ({
        start: timeToMinutes(slot.startTime),
        end: timeToMinutes(slot.endTime),
      }));

      const newRanges: { start: number; end: number }[] = [];
      for (const pr of possibleRanges) {
        for (const sr of studentRanges) {
          const overlapStart = Math.max(pr.start, sr.start);
          const overlapEnd = Math.min(pr.end, sr.end);
          if (overlapEnd - overlapStart >= durationMinutes) {
            newRanges.push({ start: overlapStart, end: overlapEnd });
          }
        }
      }
      possibleRanges = newRanges;
    }

    // Convert overlapping ranges to time slots
    for (const range of possibleRanges) {
      results.push({
        dayOfWeek: day,
        startTime: minutesToTime(range.start),
        endTime: minutesToTime(range.end),
      });
    }
  }

  return results;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role === "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const { studentIds, durationMinutes, preferredDays } = body;

  if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
    return NextResponse.json(
      { error: "studentIds array is required" },
      { status: 400 }
    );
  }

  if (!durationMinutes || durationMinutes < 15) {
    return NextResponse.json(
      { error: "durationMinutes must be at least 15" },
      { status: 400 }
    );
  }

  // Fetch student profiles with availability
  const profiles = await db.studentProfile.findMany({
    where: {
      userId: { in: studentIds },
      isActive: true,
    },
    select: {
      userId: true,
      availableSlots: true,
      user: { select: { name: true, timezone: true } },
    },
  });

  if (profiles.length === 0) {
    return NextResponse.json(
      { error: "No active student profiles found for given IDs" },
      { status: 404 }
    );
  }

  // Parse all students' slots
  const allStudentSlots = profiles.map((p) => parseAvailableSlots(p.availableSlots));

  // Find overlapping time slots
  const slots = findOverlappingSlots(allStudentSlots, durationMinutes, preferredDays);

  // Include student info for context
  const studentsInfo = profiles.map((p) => ({
    id: p.userId,
    name: p.user.name,
    timezone: p.user.timezone || "UTC",
    hasAvailability: parseAvailableSlots(p.availableSlots).length > 0,
  }));

  return NextResponse.json({
    slots,
    students: studentsInfo,
    durationMinutes,
    totalStudents: studentIds.length,
    matchedStudents: profiles.length,
  });
}
