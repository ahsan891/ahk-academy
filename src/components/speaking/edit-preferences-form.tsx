"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { Settings, Save, X } from "lucide-react";

interface EditPreferencesFormProps {
  profile: {
    track: string;
    level: string;
    preferredTopics: string | null;
    availability: string | null;
  };
}

export function EditPreferencesForm({ profile }: EditPreferencesFormProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [track, setTrack] = useState(profile.track);
  const [level, setLevel] = useState(profile.level);
  const [preferredTopics, setPreferredTopics] = useState(
    profile.preferredTopics || ""
  );
  const [availability, setAvailability] = useState(
    profile.availability || ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/student-speaking-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          track,
          level,
          preferredTopics: preferredTopics || null,
          availability: availability || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update profile");
      }

      setIsEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isEditing) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsEditing(true)}
      >
        <Settings size={14} className="mr-1" />
        Edit Preferences
      </Button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4 p-4 rounded-lg border bg-gray-50">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-700">
          Edit Speaking Preferences
        </h4>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={18} />
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Track
          </label>
          <select
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="speaking_only">Speaking Only</option>
            <option value="full_student">Full Student</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-1">
            Level
          </label>
          <select
            value={level}
            onChange={(e) => setLevel(e.target.value)}
            className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="beginner">Beginner</option>
            <option value="elementary">Elementary</option>
            <option value="intermediate">Intermediate</option>
            <option value="upper_intermediate">Upper Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Preferred Topics
        </label>
        <Input
          value={preferredTopics}
          onChange={(e) => setPreferredTopics(e.target.value)}
          placeholder="e.g., Travel, Technology, Business, Culture"
        />
        <p className="mt-1 text-xs text-gray-400">
          Comma-separated list of topics you enjoy discussing
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-600 mb-1">
          Availability
        </label>
        <Input
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          placeholder="e.g., Weekday evenings, Saturday mornings"
        />
        <p className="mt-1 text-xs text-gray-400">
          When are you available for speaking sessions?
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isSubmitting}>
          <Save size={14} className="mr-1" />
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(false)}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
