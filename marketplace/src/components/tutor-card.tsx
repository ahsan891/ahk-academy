import Link from "next/link";
import { Star, Clock, Globe, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, getInitials } from "@/lib/utils";

interface TutorCardProps {
  tutor: {
    id: string;
    user: { id: string; name: string; avatar: string | null };
    hourlyRate: number;
    specialties: string | null;
    accent: string | null;
    country: string | null;
    bio: string | null;
    averageRating: number;
    totalLessons: number;
    isAvailableInstantly: boolean;
    teachingLanguages: string;
  };
}

export function TutorCard({ tutor }: TutorCardProps) {
  const specialties = tutor.specialties?.split(",").map(s => s.trim()).filter(Boolean) || [];

  return (
    <Link href={`/tutors/${tutor.user.id}`}>
      <Card className="group h-full transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer">
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-600">
              {tutor.user.avatar ? (
                <img src={tutor.user.avatar} alt={tutor.user.name} className="h-14 w-14 rounded-full object-cover" />
              ) : (
                getInitials(tutor.user.name)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                  {tutor.user.name}
                </h3>
                {tutor.isAvailableInstantly && (
                  <Zap className="h-4 w-4 text-green-500 shrink-0" />
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                {tutor.averageRating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    {tutor.averageRating.toFixed(1)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {tutor.totalLessons} lessons
                </span>
                {tutor.country && (
                  <span className="flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" />
                    {tutor.country}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-bold text-indigo-600">{formatCurrency(tutor.hourlyRate)}</p>
              <p className="text-xs text-gray-400">/hour</p>
            </div>
          </div>

          {tutor.bio && (
            <p className="mt-3 text-sm text-gray-600 line-clamp-2">{tutor.bio}</p>
          )}

          {specialties.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {specialties.slice(0, 3).map((s) => (
                <Badge key={s} variant="outline">{s}</Badge>
              ))}
              {specialties.length > 3 && (
                <Badge variant="outline">+{specialties.length - 3}</Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
