"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { SPECIALTIES, ACCENTS } from "@/lib/utils";
import { Save, Loader2, User } from "lucide-react";

interface TutorFormData {
  bio: string;
  hourlyRate: number;
  specialties: string[];
  accent: string;
  education: string;
  certifications: string;
  yearsExperience: number;
  country: string;
  teachingLanguages: string;
  isAvailableInstantly: boolean;
}

const DEFAULT_FORM: TutorFormData = {
  bio: "",
  hourlyRate: 15,
  specialties: [],
  accent: "",
  education: "",
  certifications: "",
  yearsExperience: 0,
  country: "",
  teachingLanguages: "English",
  isAvailableInstantly: false,
};

export default function EditTutorProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form, setForm] = useState<TutorFormData>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    if (status === "authenticated") {
      fetchProfile();
    }
  }, [status]);

  async function fetchProfile() {
    try {
      setLoading(true);
      const res = await fetch("/api/tutor/profile");
      if (res.ok) {
        const data = await res.json();
        setForm({
          bio: data.bio || "",
          hourlyRate: data.hourlyRate || 15,
          specialties: data.specialties
            ? data.specialties.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [],
          accent: data.accent || "",
          education: data.education || "",
          certifications: data.certifications || "",
          yearsExperience: data.yearsExperience || 0,
          country: data.country || "",
          teachingLanguages: data.teachingLanguages || "English",
          isAvailableInstantly: data.isAvailableInstantly || false,
        });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load profile." });
    } finally {
      setLoading(false);
    }
  }

  function toggleSpecialty(specialty: string) {
    setForm((prev) => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter((s) => s !== specialty)
        : [...prev.specialties, specialty],
    }));
    setMessage(null);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);

      const res = await fetch("/api/tutor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          specialties: form.specialties.join(", "),
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to save profile");
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Failed to save profile.",
      });
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
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
        <p className="text-gray-500 mt-1">
          Update your tutor profile to attract more students.
        </p>
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

      <form onSubmit={handleSave} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              About You
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <Textarea
                value={form.bio}
                onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
                placeholder="Tell students about yourself, your teaching style, and what makes your lessons special..."
                rows={5}
              />
              <p className="mt-1 text-xs text-gray-400">{form.bio.length}/500 characters</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <Input
                  value={form.country}
                  onChange={(e) => setForm((p) => ({ ...p, country: e.target.value }))}
                  placeholder="e.g., United States"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Accent</label>
                <Select
                  value={form.accent}
                  onChange={(e) => setForm((p) => ({ ...p, accent: e.target.value }))}
                >
                  <option value="">Select accent</option>
                  {ACCENTS.map((accent) => (
                    <option key={accent} value={accent}>
                      {accent}
                    </option>
                  ))}
                </Select>
              </div>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Teaching Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialties
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

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                <Input
                  value={form.education}
                  onChange={(e) => setForm((p) => ({ ...p, education: e.target.value }))}
                  placeholder="e.g., B.A. in English Literature"
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
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="instant"
                checked={form.isAvailableInstantly}
                onChange={(e) =>
                  setForm((p) => ({ ...p, isAvailableInstantly: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <label htmlFor="instant" className="text-sm text-gray-700">
                Available for instant lessons (students can book immediately without waiting)
              </label>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} size="lg">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Profile
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
