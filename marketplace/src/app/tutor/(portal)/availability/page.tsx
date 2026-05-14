"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { DAYS, formatTime } from "@/lib/utils";
import { Plus, Trash2, Save, Clock, Loader2 } from "lucide-react";

interface TimeSlot {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

const TIME_OPTIONS: string[] = [];
for (let h = 0; h < 24; h++) {
  for (let m = 0; m < 60; m += 30) {
    TIME_OPTIONS.push(
      `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`
    );
  }
}

export default function TutorAvailabilityPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated" && session?.user?.id) {
      fetchAvailability();
    }
  }, [status, session]);

  async function fetchAvailability() {
    try {
      setLoading(true);
      const res = await fetch(`/api/tutors/${session!.user.id}/availability`);
      if (!res.ok) throw new Error("Failed to fetch availability");
      const data = await res.json();
      setSlots(
        (data.availability || []).map((a: TimeSlot & { id?: string }) => ({
          id: a.id,
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
        }))
      );
    } catch {
      setMessage({ type: "error", text: "Failed to load availability. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  function addSlot(dayOfWeek: number) {
    setSlots((prev) => [
      ...prev,
      { dayOfWeek, startTime: "09:00", endTime: "10:00" },
    ]);
    setMessage(null);
  }

  function removeSlot(index: number) {
    setSlots((prev) => prev.filter((_, i) => i !== index));
    setMessage(null);
  }

  function updateSlot(index: number, field: "startTime" | "endTime", value: string) {
    setSlots((prev) =>
      prev.map((slot, i) => (i === index ? { ...slot, [field]: value } : slot))
    );
    setMessage(null);
  }

  async function handleSave() {
    try {
      setSaving(true);
      setMessage(null);

      const hasInvalid = slots.some((slot) => slot.startTime >= slot.endTime);
      if (hasInvalid) {
        setMessage({ type: "error", text: "End time must be after start time for all slots." });
        setSaving(false);
        return;
      }

      const res = await fetch(`/api/tutors/${session!.user.id}/availability`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: slots }),
      });

      if (!res.ok) throw new Error("Failed to save");

      const data = await res.json();
      setSlots(
        (data.availability || []).map((a: TimeSlot & { id?: string }) => ({
          id: a.id,
          dayOfWeek: a.dayOfWeek,
          startTime: a.startTime,
          endTime: a.endTime,
        }))
      );
      setMessage({ type: "success", text: "Availability saved successfully!" });
    } catch {
      setMessage({ type: "error", text: "Failed to save availability. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Availability</h1>
          <p className="text-gray-500 mt-1">Set your weekly recurring schedule for lessons.</p>
        </div>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Schedule
            </>
          )}
        </Button>
      </div>

      {message && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {DAYS.map((dayName, dayIndex) => {
          const daySlots = slots
            .map((slot, i) => ({ ...slot, originalIndex: i }))
            .filter((slot) => slot.dayOfWeek === dayIndex);

          return (
            <Card key={dayIndex}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{dayName}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => addSlot(dayIndex)}
                    className="text-indigo-600"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Slot
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {daySlots.length === 0 ? (
                  <div className="flex items-center justify-center py-4 text-sm text-gray-400">
                    <Clock className="mr-2 h-4 w-4" />
                    No availability set
                  </div>
                ) : (
                  <div className="space-y-2">
                    {daySlots.map((slot) => (
                      <div
                        key={slot.originalIndex}
                        className="flex items-center gap-2 rounded-lg border bg-gray-50 p-2"
                      >
                        <Select
                          value={slot.startTime}
                          onChange={(e) =>
                            updateSlot(slot.originalIndex, "startTime", e.target.value)
                          }
                          className="flex-1 text-xs"
                        >
                          {TIME_OPTIONS.map((t) => (
                            <option key={`start-${t}`} value={t}>
                              {formatTime(t)}
                            </option>
                          ))}
                        </Select>
                        <span className="text-xs text-gray-400">to</span>
                        <Select
                          value={slot.endTime}
                          onChange={(e) =>
                            updateSlot(slot.originalIndex, "endTime", e.target.value)
                          }
                          className="flex-1 text-xs"
                        >
                          {TIME_OPTIONS.map((t) => (
                            <option key={`end-${t}`} value={t}>
                              {formatTime(t)}
                            </option>
                          ))}
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSlot(slot.originalIndex)}
                          className="h-8 w-8 text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
