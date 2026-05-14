"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { SPECIALTIES, ACCENTS } from "@/lib/utils";
import {
  User,
  GraduationCap,
  BookOpen,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface FormData {
  name: string;
  email: string;
  password: string;
  country: string;
  specialties: string[];
  accent: string;
  education: string;
  yearsExperience: number;
  certifications: string;
  hourlyRate: number;
  bio: string;
  teachingLanguages: string;
}

const INITIAL_FORM: FormData = {
  name: "",
  email: "",
  password: "",
  country: "",
  specialties: [],
  accent: "",
  education: "",
  yearsExperience: 0,
  certifications: "",
  hourlyRate: 15,
  bio: "",
  teachingLanguages: "English",
};

const STEPS = [
  { label: "Personal Info", icon: User },
  { label: "Teaching", icon: GraduationCap },
  { label: "Lesson Details", icon: BookOpen },
];

export default function TutorApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function toggleSpecialty(specialty: string) {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
  }

  function validateStep(): boolean {
    setError(null);
    if (step === 0) {
      if (!form.name.trim()) { setError("Full name is required."); return false; }
      if (!form.email.trim()) { setError("Email is required."); return false; }
      if (!form.password || form.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return false;
      }
      if (!form.country.trim()) { setError("Country is required."); return false; }
    }
    if (step === 1) {
      if (form.specialties.length === 0) { setError("Select at least one specialty."); return false; }
      if (!form.accent) { setError("Please select your accent."); return false; }
    }
    if (step === 2) {
      if (form.hourlyRate < 1) { setError("Hourly rate must be at least $1."); return false; }
      if (!form.bio.trim() || form.bio.trim().length < 30) {
        setError("Bio must be at least 30 characters.");
        return false;
      }
    }
    return true;
  }

  function handleNext() {
    if (validateStep()) setStep((s) => s + 1);
  }

  function handleBack() {
    setError(null);
    setStep((s) => s - 1);
  }

  async function handleSubmit() {
    if (!validateStep()) return;
    try {
      setSubmitting(true);
      setError(null);

      // Step 1: Register user account
      const registerRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          role: "TUTOR",
        }),
      });

      if (!registerRes.ok) {
        const data = await registerRes.json().catch(() => ({}));
        throw new Error(data.error || "Registration failed. This email may already be in use.");
      }

      // Step 2: Sign in to get session
      const { signIn } = await import("next-auth/react");
      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error("Account created but sign-in failed. Please try logging in.");
      }

      // Step 3: Create / update tutor profile
      const profileRes = await fetch("/api/tutor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bio: form.bio,
          hourlyRate: form.hourlyRate,
          specialties: form.specialties.join(", "),
          accent: form.accent,
          education: form.education,
          certifications: form.certifications,
          yearsExperience: form.yearsExperience,
          country: form.country,
          teachingLanguages: form.teachingLanguages,
        }),
      });

      if (!profileRes.ok) {
        const data = await profileRes.json().catch(() => ({}));
        throw new Error(data.error || "Profile creation failed. Please try again.");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <>
        <Navbar />
        <div className="mx-auto max-w-lg py-24 px-4 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Application Submitted!</h1>
          <p className="text-gray-500 mb-8">
            Thank you for applying to become a tutor at AHK Marketplace. Our team will review your
            application and get back to you shortly. You can check your dashboard for updates.
          </p>
          <Button size="lg" onClick={() => router.push("/tutor/dashboard")}>
            Go to Dashboard
          </Button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-2xl px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">Become a Tutor</h1>
          <p className="mt-2 text-gray-500">
            Share your expertise and earn money teaching students around the world.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => (
              <div key={i} className="flex flex-1 items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                      i < step
                        ? "border-indigo-600 bg-indigo-600 text-white"
                        : i === step
                        ? "border-indigo-600 bg-white text-indigo-600"
                        : "border-gray-300 bg-white text-gray-400"
                    }`}
                  >
                    {i < step ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <s.icon className="h-5 w-5" />
                    )}
                  </div>
                  <span
                    className={`mt-2 text-xs font-medium ${
                      i <= step ? "text-indigo-600" : "text-gray-400"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="mx-4 mb-6 h-0.5 flex-1">
                    <div
                      className={`h-full rounded transition-colors ${
                        i < step ? "bg-indigo-600" : "bg-gray-200"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Step 1: Personal Info */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-indigo-600" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="John Smith"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  placeholder="Min. 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <Input
                  value={form.country}
                  onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                  placeholder="e.g., United States"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Teaching */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-indigo-600" />
                Teaching Background
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Specialties (select all that apply)
                </label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map((specialty) => (
                    <button
                      key={specialty}
                      type="button"
                      onClick={() => toggleSpecialty(specialty)}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                        form.specialties.includes(specialty)
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accent</label>
                <Select
                  value={form.accent}
                  onChange={(e) => setForm((p) => ({ ...p, accent: e.target.value }))}
                >
                  <option value="">Select your accent</option>
                  {ACCENTS.map((accent) => (
                    <option key={accent} value={accent}>
                      {accent}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <Input
                  value={form.education}
                  onChange={(e) => setForm((p) => ({ ...p, education: e.target.value }))}
                  placeholder="e.g., B.A. in English Literature"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience
                  </label>
                  <Input
                    type="number"
                    min={0}
                    max={50}
                    value={form.yearsExperience}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        yearsExperience: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Certifications
                  </label>
                  <Input
                    value={form.certifications}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, certifications: e.target.value }))
                    }
                    placeholder="e.g., TEFL, CELTA"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Lesson Details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-indigo-600" />
                Lesson Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hourly Rate (USD)
                </label>
                <Input
                  type="number"
                  min={1}
                  step={0.5}
                  value={form.hourlyRate}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      hourlyRate: parseFloat(e.target.value) || 0,
                    }))
                  }
                />
                <p className="mt-1 text-xs text-gray-400">
                  Recommended range: $10 - $50 per hour. You can change this later.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teaching Languages
                </label>
                <Input
                  value={form.teachingLanguages}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, teachingLanguages: e.target.value }))
                  }
                  placeholder="e.g., English, Spanish"
                />
                <p className="mt-1 text-xs text-gray-400">
                  Separate multiple languages with commas.
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <Textarea
                  value={form.bio}
                  onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                  placeholder="Tell potential students about yourself, your teaching philosophy, and what they can expect from your lessons. Be detailed and engaging!"
                  rows={6}
                />
                <p className="mt-1 text-xs text-gray-400">
                  {form.bio.length}/500 characters (minimum 30)
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          {step > 0 ? (
            <Button variant="outline" onClick={handleBack}>
              <ChevronLeft className="mr-1 h-4 w-4" />
              Back
            </Button>
          ) : (
            <div />
          )}
          {step < STEPS.length - 1 ? (
            <Button onClick={handleNext}>
              Next
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
