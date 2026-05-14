"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, DAYS, formatTime } from "@/lib/utils";
import { CalendarDays, Clock, AlertCircle, CheckCircle } from "lucide-react";

interface BookingFormProps {
  tutorId: string;
  tutorName: string;
  hourlyRate: number;
  creditsBalance: number;
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];
}

const DURATION_OPTIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "60 minutes" },
];

export function BookingForm({
  tutorId,
  tutorName,
  hourlyRate,
  creditsBalance,
  availability,
}: BookingFormProps) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Calculate price based on duration
  const price = useMemo(() => {
    return (hourlyRate / 60) * duration;
  }, [hourlyRate, duration]);

  const hasEnoughCredits = creditsBalance >= price;

  // Get available time slots for the selected date
  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];
    const date = new Date(selectedDate + "T00:00:00");
    const dayOfWeek = date.getDay();
    return availability.filter((a) => a.dayOfWeek === dayOfWeek);
  }, [selectedDate, availability]);

  // Generate time options based on available slots and duration
  const timeOptions = useMemo(() => {
    const options: string[] = [];
    for (const slot of availableSlots) {
      const [startH, startM] = slot.startTime.split(":").map(Number);
      const [endH, endM] = slot.endTime.split(":").map(Number);
      const startMinutes = startH * 60 + startM;
      const endMinutes = endH * 60 + endM;

      for (let m = startMinutes; m + duration <= endMinutes; m += 15) {
        const h = Math.floor(m / 60);
        const min = m % 60;
        const time = `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`;
        if (!options.includes(time)) {
          options.push(time);
        }
      }
    }
    return options.sort();
  }, [availableSlots, duration]);

  // Get minimum date (today)
  const minDate = new Date().toISOString().split("T")[0];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!selectedDate || !selectedTime) {
      setError("Please select a date and time.");
      return;
    }

    if (!hasEnoughCredits) {
      setError("Insufficient credits. Please top up your wallet first.");
      return;
    }

    setLoading(true);

    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00`);

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tutorId,
          scheduledAt: scheduledAt.toISOString(),
          durationMinutes: duration,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create booking.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/bookings");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">Booking Confirmed!</h2>
          <p className="mt-2 text-gray-500">
            Your lesson with {tutorName} has been booked successfully.
          </p>
          <p className="mt-1 text-sm text-gray-400">Redirecting to your bookings...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Book Your Lesson
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Date
            </label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                setSelectedTime("");
              }}
              min={minDate}
            />
            {selectedDate && availableSlots.length === 0 && (
              <p className="mt-1.5 text-sm text-amber-600">
                No availability on {DAYS[new Date(selectedDate + "T00:00:00").getDay()]}. Please choose another date.
              </p>
            )}
          </div>

          {/* Duration Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Lesson Duration
            </label>
            <Select
              value={String(duration)}
              onChange={(e) => {
                setDuration(Number(e.target.value));
                setSelectedTime("");
              }}
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Time Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Select Time
            </label>
            {!selectedDate ? (
              <p className="text-sm text-gray-400">Please select a date first.</p>
            ) : timeOptions.length === 0 ? (
              <p className="text-sm text-gray-400">
                No available time slots for this date and duration.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {timeOptions.map((time) => (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                      selectedTime === time
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : "border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50"
                    }`}
                  >
                    {formatTime(time)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Notes for the tutor (optional)
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What would you like to focus on? Any specific topics or goals?"
              rows={3}
            />
          </div>

          {/* Price Summary */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h3 className="font-medium text-gray-900">Booking Summary</h3>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Rate</span>
                <span className="text-gray-700">{formatCurrency(hourlyRate)} /hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Duration</span>
                <span className="text-gray-700">{duration} minutes</span>
              </div>
              {selectedDate && selectedTime && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Schedule</span>
                  <span className="text-gray-700">
                    {selectedDate} at {formatTime(selectedTime)}
                  </span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex justify-between font-medium">
                  <span className="text-gray-900">Total</span>
                  <span className="text-indigo-600">{formatCurrency(price)}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Your balance</span>
                <span className={hasEnoughCredits ? "text-green-600" : "text-red-600"}>
                  {formatCurrency(creditsBalance)}
                </span>
              </div>
            </div>
          </div>

          {/* Insufficient Credits Warning */}
          {!hasEnoughCredits && (
            <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="text-sm font-medium text-amber-800">Insufficient Credits</p>
                <p className="mt-1 text-sm text-amber-600">
                  You need {formatCurrency(price - creditsBalance)} more credits. Please{" "}
                  <a href="/wallet" className="font-medium underline">
                    top up your wallet
                  </a>{" "}
                  first.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={loading || !selectedDate || !selectedTime || !hasEnoughCredits}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4 animate-spin" />
                Booking...
              </span>
            ) : (
              `Confirm Booking - ${formatCurrency(price)}`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
