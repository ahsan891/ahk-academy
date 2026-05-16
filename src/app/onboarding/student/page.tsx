"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TIMEZONES = [
  "UTC", "Europe/Istanbul", "Europe/London", "Europe/Berlin", "Europe/Moscow",
  "Asia/Dubai", "Asia/Karachi", "Asia/Kolkata", "Asia/Tokyo", "America/New_York",
  "America/Los_Angeles", "Asia/Almaty", "Asia/Tashkent", "Asia/Kabul",
];

const COUNTRIES = [
  "Turkey", "Pakistan", "Afghanistan", "Saudi Arabia", "UAE", "Qatar",
  "Kuwait", "Oman", "Iran", "Iraq", "Kazakhstan", "Uzbekistan", "Kyrgyzstan",
  "Tajikistan", "Turkmenistan", "Azerbaijan", "Germany", "France", "UK",
  "USA", "Canada", "Other",
];

const LANGUAGES = [
  "Turkish", "Pashto", "Dari", "Urdu", "Arabic", "Farsi",
  "Russian", "Kazakh", "Uzbek", "German", "French", "English", "Other",
];

const LEVELS = [
  { value: "A1", label: "A1 - Beginner", description: "I can understand and use basic phrases and simple sentences." },
  { value: "A2", label: "A2 - Elementary", description: "I can communicate in simple routine tasks and describe my background." },
  { value: "B1", label: "B1 - Intermediate", description: "I can deal with most situations while traveling and describe experiences." },
  { value: "B2", label: "B2 - Upper Intermediate", description: "I can interact fluently and produce detailed text on various subjects." },
  { value: "C1", label: "C1 - Advanced", description: "I can express ideas fluently and use language flexibly for social and professional purposes." },
  { value: "C2", label: "C2 - Proficient", description: "I can understand virtually everything and express myself spontaneously and precisely." },
];

const TOPIC_CATEGORIES = [
  "Current Events", "Culture & Society", "Business & Finance", "Travel & Adventure",
  "Technology & Science", "Health & Wellness", "Education", "Environment",
  "Sports", "Entertainment & Media", "Food & Cooking", "History & Politics",
];

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const TIME_SLOTS = ["Morning (8-12)", "Afternoon (12-17)", "Evening (17-21)"];

export default function StudentOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Personal Info
  const [timezone, setTimezone] = useState("");
  const [country, setCountry] = useState("");
  const [language, setLanguage] = useState("");

  // Step 2: Track
  const [trackType, setTrackType] = useState("");

  // Step 3: Level
  const [level, setLevel] = useState("");

  // Step 4: Availability
  const [availability, setAvailability] = useState<Record<string, boolean>>({});

  // Step 5: Topics
  const [topics, setTopics] = useState<string[]>([]);

  // Step 6: International preference
  const [internationalPreference, setInternationalPreference] = useState(true);

  const totalSteps = 6;

  const toggleAvailability = (day: string, slot: string) => {
    const key = `${day}-${slot}`;
    setAvailability((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleTopic = (topic: string) => {
    setTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return !!timezone && !!country && !!language;
      case 2: return !!trackType;
      case 3: return !!level;
      case 4: return Object.values(availability).some(Boolean);
      case 5: return topics.length > 0;
      case 6: return true;
      default: return false;
    }
  };

  const buildAvailableSlots = (): { dayOfWeek: number; startTime: string; endTime: string }[] => {
    const slots: { dayOfWeek: number; startTime: string; endTime: string }[] = [];
    const timeMap: Record<string, { start: string; end: string }> = {
      "Morning (8-12)": { start: "08:00", end: "12:00" },
      "Afternoon (12-17)": { start: "12:00", end: "17:00" },
      "Evening (17-21)": { start: "17:00", end: "21:00" },
    };

    for (const [key, selected] of Object.entries(availability)) {
      if (!selected) continue;
      const [day, ...slotParts] = key.split("-");
      const slot = slotParts.join("-");
      const dayIndex = DAYS.indexOf(day);
      const time = timeMap[slot];
      if (dayIndex !== -1 && time) {
        slots.push({ dayOfWeek: dayIndex + 1, startTime: time.start, endTime: time.end });
      }
    }
    return slots;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "student",
          timezone,
          country,
          language,
          trackType,
          level,
          availableSlots: JSON.stringify(buildAvailableSlots()),
          preferredTopics: JSON.stringify(topics),
          internationalPreference,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save onboarding data");
      }

      router.push("/student");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round((step / totalSteps) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Welcome! Let&apos;s get to know you</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select your timezone</option>
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>{tz}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select your country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Native Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select your native language</option>
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Track Selection */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Choose your learning track</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                onClick={() => setTrackType("SPEAKING_ONLY")}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  trackType === "SPEAKING_ONLY"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <h3 className="text-lg font-semibold mb-2">Speaking Only</h3>
                <p className="text-gray-600 text-sm">
                  Join group speaking sessions with 5 students. Practice conversation,
                  get AI-powered feedback, and improve your fluency through regular practice.
                </p>
                <p className="text-blue-600 font-medium text-sm mt-2">$40-80/month</p>
              </div>
              <div
                onClick={() => setTrackType("FULL_STUDENT")}
                className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                  trackType === "FULL_STUDENT"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <h3 className="text-lg font-semibold mb-2">Full Student (with Teacher)</h3>
                <p className="text-gray-600 text-sm">
                  Get personal lessons from a dedicated teacher PLUS speaking sessions.
                  Your teacher assigns topics based on your curriculum, creating a
                  complete learning loop.
                </p>
                <p className="text-blue-600 font-medium text-sm mt-2">$120-200/month</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Level Assessment */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>What&apos;s your English level?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {LEVELS.map((l) => (
                <div
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    level === l.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <h4 className="font-semibold text-sm">{l.label}</h4>
                  <p className="text-gray-600 text-xs mt-1">{l.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Availability */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>When are you available for sessions?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Select all time slots when you can join speaking sessions.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-sm font-medium text-gray-700"></th>
                      {TIME_SLOTS.map((slot) => (
                        <th key={slot} className="p-2 text-center text-xs font-medium text-gray-700">
                          {slot}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {DAYS.map((day) => (
                      <tr key={day} className="border-t">
                        <td className="p-2 text-sm font-medium text-gray-700">{day}</td>
                        {TIME_SLOTS.map((slot) => {
                          const key = `${day}-${slot}`;
                          return (
                            <td key={key} className="p-2 text-center">
                              <button
                                type="button"
                                onClick={() => toggleAvailability(day, slot)}
                                className={`w-8 h-8 rounded-md transition-all ${
                                  availability[key]
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 hover:bg-gray-200"
                                }`}
                              >
                                {availability[key] ? "✓" : ""}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 5: Topic Preferences */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>What topics interest you?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Select topics you&apos;d like to discuss in speaking sessions. You can choose multiple.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {TOPIC_CATEGORIES.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`p-3 rounded-lg border-2 text-sm text-left transition-all ${
                      topics.includes(topic)
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 6: International Preference */}
        {step === 6 && (
          <Card>
            <CardHeader>
              <CardTitle>Group preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Would you like to be placed in groups with students from different countries?
                This can help you practice with various accents and cultural perspectives.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setInternationalPreference(true)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    internationalPreference
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <h4 className="font-semibold text-sm">Yes, mix it up!</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    I want to practice with students from different countries.
                  </p>
                </button>
                <button
                  type="button"
                  onClick={() => setInternationalPreference(false)}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                    !internationalPreference
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <h4 className="font-semibold text-sm">Same country is fine</h4>
                  <p className="text-xs text-gray-600 mt-1">
                    I don&apos;t mind being grouped with students from my country.
                  </p>
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 1}
          >
            Back
          </Button>
          {step < totalSteps ? (
            <Button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
            >
              Continue
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "Saving..." : "Complete Setup"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
