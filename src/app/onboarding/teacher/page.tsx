"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

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

const SPECIALIZATIONS = [
  { value: "TOEFL", label: "TOEFL Preparation" },
  { value: "IELTS", label: "IELTS Preparation" },
  { value: "BUSINESS_ENGLISH", label: "Business English" },
  { value: "GRAMMAR", label: "Grammar" },
  { value: "CONVERSATION", label: "Conversation" },
  { value: "PRONUNCIATION", label: "Pronunciation" },
  { value: "ACADEMIC_WRITING", label: "Academic Writing" },
  { value: "VOCABULARY", label: "Vocabulary Building" },
];

export default function TeacherOnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Personal Info
  const [timezone, setTimezone] = useState("");
  const [country, setCountry] = useState("");

  // Step 2: Specializations
  const [specializations, setSpecializations] = useState<string[]>([]);

  // Step 3: Bio
  const [bio, setBio] = useState("");

  const totalSteps = 3;

  const toggleSpecialization = (spec: string) => {
    setSpecializations((prev) =>
      prev.includes(spec) ? prev.filter((s) => s !== spec) : [...prev, spec]
    );
  };

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return !!timezone && !!country;
      case 2: return specializations.length > 0;
      case 3: return bio.trim().length >= 20;
      default: return false;
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "teacher",
          timezone,
          country,
          specializations: JSON.stringify(specializations),
          bio,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save onboarding data");
      }

      router.push("/teacher");
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
              <CardTitle>Welcome, Teacher! Let&apos;s set up your profile</CardTitle>
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
            </CardContent>
          </Card>
        )}

        {/* Step 2: Specializations */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>What do you specialize in?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Select all areas you teach. This helps us match you with the right students.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {SPECIALIZATIONS.map((spec) => (
                  <button
                    key={spec.value}
                    type="button"
                    onClick={() => toggleSpecialization(spec.value)}
                    className={`p-4 rounded-lg border-2 text-left transition-all ${
                      specializations.includes(spec.value)
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <span className="text-sm font-medium">{spec.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Bio */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>Tell students about yourself</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Write a short bio that students will see on your profile.
                Include your teaching experience, methods, and what makes your lessons special.
              </p>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="I have been teaching English for 5 years, specializing in..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm min-h-[150px] resize-y"
                maxLength={1000}
              />
              <p className="text-xs text-gray-500">
                {bio.length}/1000 characters (minimum 20)
              </p>
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
              disabled={loading || !canProceed()}
            >
              {loading ? "Saving..." : "Complete Setup"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
