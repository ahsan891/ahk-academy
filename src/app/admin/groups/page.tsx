"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Check,
  Search,
  Shuffle,
  ArrowRight,
  Mic2,
  Star,
} from "lucide-react";

interface SpeakingProfile {
  track: string;
  level: string;
  totalSessions: number;
  averageRating: number;
}

interface Student {
  id: string;
  name: string;
  email: string;
  speakingProfile: SpeakingProfile | null;
  sessionParticipations: { id: string; attended: boolean; sessionId: string }[];
}

interface ChemistryScore {
  id: string;
  student1Id: string;
  student2Id: string;
  score: number;
  sessionCount: number;
  student1: { id: string; name: string };
  student2: { id: string; name: string };
}

function getLevelColor(level: string) {
  switch (level) {
    case "beginner":
    case "elementary":
      return "success" as const;
    case "intermediate":
      return "info" as const;
    case "upper_intermediate":
    case "advanced":
      return "warning" as const;
    default:
      return "default" as const;
  }
}

function formatLevel(level: string) {
  return level
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function GroupsPage() {
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [chemistryScores, setChemistryScores] = useState<ChemistryScore[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState("all");
  const [suggestedGroups, setSuggestedGroups] = useState<string[][]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [studentsRes] = await Promise.all([fetch("/api/students")]);
      const studentsData = await studentsRes.json();

      // Fetch speaking profiles and participation data for students
      const enriched = await Promise.all(
        studentsData.map(async (student: Student) => {
          // Fetch speaking profile and participation count from sessions API
          // For now, we just use the basic student data
          return {
            ...student,
            speakingProfile: student.speakingProfile || null,
            sessionParticipations: student.sessionParticipations || [],
          };
        })
      );

      setStudents(enriched);

      // Chemistry scores would come from a dedicated API
      // For now, we generate suggested groups based on available data
      generateSuggestedGroups(enriched);
    } catch (err) {
      console.error("Failed to fetch data:", err);
    }
    setLoading(false);
  }

  function generateSuggestedGroups(studentList: Student[]) {
    // Simple level-based grouping algorithm
    // Groups students by mixing levels while keeping groups of 5
    const withProfiles = studentList.filter((s) => s.speakingProfile);
    const withoutProfiles = studentList.filter((s) => !s.speakingProfile);

    const levelGroups: Record<string, Student[]> = {};
    withProfiles.forEach((s) => {
      const level = s.speakingProfile!.level;
      if (!levelGroups[level]) levelGroups[level] = [];
      levelGroups[level].push(s);
    });

    // Create mixed groups of up to 5 students
    const allStudents = [...withProfiles, ...withoutProfiles];
    const groups: string[][] = [];
    const used = new Set<string>();

    // Strategy: pick one from each level to create diverse groups
    const levels = Object.keys(levelGroups);
    while (used.size < allStudents.length) {
      const group: string[] = [];
      // First, pick from different levels
      for (const level of levels) {
        if (group.length >= 5) break;
        const available = levelGroups[level].filter((s) => !used.has(s.id));
        if (available.length > 0) {
          group.push(available[0].id);
          used.add(available[0].id);
        }
      }
      // Fill remaining with any available student
      for (const student of allStudents) {
        if (group.length >= 5) break;
        if (!used.has(student.id)) {
          group.push(student.id);
          used.add(student.id);
        }
      }
      if (group.length >= 2) {
        groups.push(group);
      } else {
        // Not enough for a group, just break
        break;
      }
    }

    setSuggestedGroups(groups);
  }

  function toggleStudent(studentId: string) {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : prev.length < 10
          ? [...prev, studentId]
          : prev
    );
  }

  async function createGroupSession() {
    if (selectedStudents.length < 2) {
      alert("Select at least 2 students to create a group session.");
      return;
    }
    // Redirect to create session page with pre-selected students
    // We'll pass student IDs via sessionStorage since URL params have limits
    sessionStorage.setItem(
      "groupStudentIds",
      JSON.stringify(selectedStudents)
    );
    router.push("/admin/speaking/create");
  }

  function selectSuggestedGroup(group: string[]) {
    setSelectedStudents(group);
  }

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase());
    const matchesLevel =
      filterLevel === "all" ||
      (s.speakingProfile && s.speakingProfile.level === filterLevel);
    return matchesSearch && matchesLevel;
  });

  const LEVELS = [
    "beginner",
    "elementary",
    "intermediate",
    "upper_intermediate",
    "advanced",
  ];

  if (loading) return <p className="text-gray-500">Loading students...</p>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Group Management</h1>
          <p className="mt-1 text-gray-500">
            Create speaking groups and view student chemistry
          </p>
        </div>
        <Button
          onClick={createGroupSession}
          disabled={selectedStudents.length < 2}
        >
          <Plus size={18} className="mr-2" />
          Create Group Session ({selectedStudents.length} selected)
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Student List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Students ({students.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px]">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    placeholder="Search students..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="flex h-10 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Levels</option>
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {formatLevel(l)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected count */}
              {selectedStudents.length > 0 && (
                <div className="mb-4 flex items-center justify-between rounded-lg bg-blue-50 px-4 py-2.5">
                  <span className="text-sm font-medium text-blue-700">
                    {selectedStudents.length} student
                    {selectedStudents.length !== 1 ? "s" : ""} selected
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSelectedStudents([])}
                    className="text-blue-700 hover:bg-blue-100"
                  >
                    Clear Selection
                  </Button>
                </div>
              )}

              {/* Student list */}
              {filteredStudents.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-500">
                  No students found
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredStudents.map((student) => {
                    const isSelected = selectedStudents.includes(student.id);
                    const profile = student.speakingProfile;
                    return (
                      <button
                        key={student.id}
                        onClick={() => toggleStudent(student.id)}
                        className={`flex w-full items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors ${
                          isSelected
                            ? "border-blue-300 bg-blue-50 ring-1 ring-blue-200"
                            : "border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded border ${
                            isSelected
                              ? "border-blue-500 bg-blue-500 text-white"
                              : "border-gray-300"
                          }`}
                        >
                          {isSelected && <Check size={12} />}
                        </div>
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-700">
                          {student.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {student.email}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {profile ? (
                            <>
                              <Badge variant={getLevelColor(profile.level)}>
                                {formatLevel(profile.level)}
                              </Badge>
                              <Badge variant="default">
                                {profile.track === "full"
                                  ? "Full Track"
                                  : "Speaking"}
                              </Badge>
                              <span className="flex items-center gap-1 text-xs text-gray-500">
                                <Mic2 size={12} />
                                {profile.totalSessions}
                              </span>
                              {profile.averageRating > 0 && (
                                <span className="flex items-center gap-0.5 text-xs text-yellow-600">
                                  <Star size={12} />
                                  {profile.averageRating.toFixed(1)}
                                </span>
                              )}
                            </>
                          ) : (
                            <Badge variant="default">No Profile</Badge>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Suggested Groups & Chemistry */}
        <div className="space-y-6">
          {/* Suggested Groups */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shuffle size={18} />
                Suggested Groups
              </CardTitle>
            </CardHeader>
            <CardContent>
              {suggestedGroups.length === 0 ? (
                <p className="text-sm text-gray-500 py-4 text-center">
                  Not enough students to create group suggestions.
                </p>
              ) : (
                <div className="space-y-3">
                  {suggestedGroups.map((group, idx) => {
                    const groupStudents = group
                      .map((id) => students.find((s) => s.id === id))
                      .filter(Boolean);
                    return (
                      <div
                        key={idx}
                        className="rounded-lg border border-gray-200 p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Group {idx + 1}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => selectSuggestedGroup(group)}
                            className="h-7 text-xs"
                          >
                            Select
                            <ArrowRight size={12} className="ml-1" />
                          </Button>
                        </div>
                        <div className="space-y-1.5">
                          {groupStudents.map((student) =>
                            student ? (
                              <div
                                key={student.id}
                                className="flex items-center gap-2"
                              >
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[10px] font-medium text-blue-700">
                                  {student.name.charAt(0)}
                                </div>
                                <span className="text-xs text-gray-700 truncate flex-1">
                                  {student.name}
                                </span>
                                {student.speakingProfile && (
                                  <Badge
                                    variant={getLevelColor(
                                      student.speakingProfile.level
                                    )}
                                    className="text-[10px]"
                                  >
                                    {formatLevel(
                                      student.speakingProfile.level
                                    )}
                                  </Badge>
                                )}
                              </div>
                            ) : null
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chemistry Scores */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Star size={18} />
                Chemistry Scores
              </CardTitle>
            </CardHeader>
            <CardContent>
              {chemistryScores.length === 0 ? (
                <div className="text-center py-6">
                  <Star size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="text-sm text-gray-500">
                    Chemistry scores will appear after students have had multiple
                    sessions together.
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    The system tracks how well student pairs work together based
                    on participation and engagement patterns.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {chemistryScores
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 10)
                    .map((cs) => (
                      <div
                        key={cs.id}
                        className="flex items-center justify-between rounded-md border p-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">
                            {cs.student1.name}
                          </span>
                          <span className="text-xs text-gray-400">&</span>
                          <span className="text-xs font-medium">
                            {cs.student2.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {cs.sessionCount} sessions
                          </span>
                          <div className="h-2 w-16 rounded-full bg-gray-200">
                            <div
                              className={`h-2 rounded-full ${
                                cs.score >= 80
                                  ? "bg-green-500"
                                  : cs.score >= 50
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                              }`}
                              style={{
                                width: `${Math.min(cs.score, 100)}%`,
                              }}
                            />
                          </div>
                          <span className="text-xs font-bold w-8 text-right">
                            {cs.score}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
