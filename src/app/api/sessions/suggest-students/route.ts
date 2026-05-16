import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

interface StudentSuggestion {
  studentId: string;
  name: string;
  level: string;
  country: string | null;
  score: number;
  reasons: string[];
}

const LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2"];

function isAdjacentLevel(sessionLevel: string, studentLevel: string): boolean {
  const sessionIdx = LEVELS.indexOf(sessionLevel);
  const studentIdx = LEVELS.indexOf(studentLevel);
  if (sessionIdx === -1 || studentIdx === -1) return false;
  return Math.abs(sessionIdx - studentIdx) === 1;
}

function parseAvailableSlots(slotsJson: string | null): { dayOfWeek: number; startTime: string; endTime: string }[] {
  if (!slotsJson) return [];
  try {
    return JSON.parse(slotsJson);
  } catch {
    return [];
  }
}

function matchesSessionTime(
  slots: { dayOfWeek: number; startTime: string; endTime: string }[],
  sessionDate: Date
): boolean {
  const dayOfWeek = sessionDate.getUTCDay();
  const sessionHour = sessionDate.getUTCHours();
  const sessionTimeStr = `${String(sessionHour).padStart(2, "0")}:00`;

  return slots.some((slot) => {
    if (slot.dayOfWeek !== dayOfWeek) return false;
    return slot.startTime <= sessionTimeStr && slot.endTime >= sessionTimeStr;
  });
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
  const { sessionId, date, level, maxStudents } = body;

  let sessionLevel: string;
  let sessionDate: Date;
  let sessionMaxStudents: number;

  if (sessionId) {
    const speakingSession = await db.speakingSession.findUnique({
      where: { id: sessionId },
      include: {
        participants: { select: { studentId: true } },
      },
    });

    if (!speakingSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Infer level from topic or default to B1
    sessionLevel = level || "B1";
    sessionDate = speakingSession.date;
    sessionMaxStudents = speakingSession.maxStudents;
  } else {
    if (!date || !level) {
      return NextResponse.json(
        { error: "Either sessionId or (date, level) required" },
        { status: 400 }
      );
    }
    sessionLevel = level;
    sessionDate = new Date(date);
    sessionMaxStudents = maxStudents || 5;
  }

  // Fetch all active students with profiles
  const students = await db.studentProfile.findMany({
    where: { isActive: true },
    include: {
      user: {
        select: { id: true, name: true, country: true },
      },
    },
  });

  // Get start and end of current week for over-scheduling check
  const weekStart = new Date(sessionDate);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 7);

  // Count sessions attended this week per student
  const weekParticipations = await db.sessionParticipant.findMany({
    where: {
      session: {
        date: { gte: weekStart, lt: weekEnd },
      },
    },
    select: { studentId: true },
  });

  const weeklySessionCount: Record<string, number> = {};
  for (const p of weekParticipations) {
    weeklySessionCount[p.studentId] = (weeklySessionCount[p.studentId] || 0) + 1;
  }

  // Get all chemistry scores
  const chemistryScores = await db.chemistryScore.findMany({
    select: { student1Id: true, student2Id: true, score: true },
  });

  const chemistryMap: Record<string, Record<string, number>> = {};
  for (const cs of chemistryScores) {
    if (!chemistryMap[cs.student1Id]) chemistryMap[cs.student1Id] = {};
    if (!chemistryMap[cs.student2Id]) chemistryMap[cs.student2Id] = {};
    chemistryMap[cs.student1Id][cs.student2Id] = cs.score;
    chemistryMap[cs.student2Id][cs.student1Id] = cs.score;
  }

  // Score each student
  const suggestions: StudentSuggestion[] = [];
  const selectedCountries: Set<string> = new Set();

  for (const sp of students) {
    let score = 0;
    const reasons: string[] = [];

    // Level matching
    if (sp.level === sessionLevel) {
      score += 3;
      reasons.push(`Exact level match (${sp.level})`);
    } else if (isAdjacentLevel(sessionLevel, sp.level)) {
      score += 2;
      reasons.push(`Adjacent level (${sp.level})`);
    }

    // Availability matching
    const slots = parseAvailableSlots(sp.availableSlots);
    if (matchesSessionTime(slots, sessionDate)) {
      score += 2;
      reasons.push("Available at session time");
    }

    // International diversity
    const studentCountry = sp.user.country;
    if (sp.internationalPreference && studentCountry && !selectedCountries.has(studentCountry)) {
      score += 2;
      reasons.push(`International diversity (${studentCountry})`);
    }

    // Chemistry bonus with already-suggested top students
    const studentChemistry = chemistryMap[sp.user.id];
    if (studentChemistry) {
      let chemBonus = 0;
      for (const suggestion of suggestions.slice(0, sessionMaxStudents)) {
        const chemScore = studentChemistry[suggestion.studentId] || 0;
        chemBonus += chemScore;
      }
      if (chemBonus > 0) {
        score += Math.min(chemBonus, 5); // Cap chemistry bonus at 5
        reasons.push(`Good chemistry with group (+${Math.min(chemBonus, 5)})`);
      }
    }

    // Over-scheduling penalty
    const sessionsThisWeek = weeklySessionCount[sp.user.id] || 0;
    if (sessionsThisWeek > 0) {
      score -= sessionsThisWeek;
      reasons.push(`Already has ${sessionsThisWeek} session(s) this week (-${sessionsThisWeek})`);
    }

    suggestions.push({
      studentId: sp.user.id,
      name: sp.user.name,
      level: sp.level,
      country: studentCountry,
      score,
      reasons,
    });

    if (studentCountry) {
      selectedCountries.add(studentCountry);
    }
  }

  // Sort by score descending, return top maxStudents * 2
  suggestions.sort((a, b) => b.score - a.score);
  const topSuggestions = suggestions.slice(0, sessionMaxStudents * 2);

  return NextResponse.json({ suggestions: topSuggestions });
}
