"use client";

import { useState } from "react";
import { ExercisePlayer } from "@/components/grammar/exercise-player";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dumbbell, Trophy } from "lucide-react";

interface Exercise {
  id: string;
  type: string;
  difficulty: string;
  question: string;
  options?: string | null;
  explanation: string;
  order: number;
}

interface PracticeTabProps {
  exercises: Exercise[];
  topicId: string;
  previousScore: number | null;
}

export function PracticeTab({
  exercises,
  topicId,
  previousScore,
}: PracticeTabProps) {
  const [latestScore, setLatestScore] = useState<{
    score: number;
    total: number;
  } | null>(null);

  const displayScore = latestScore
    ? Math.round((latestScore.score / latestScore.total) * 100)
    : previousScore;

  return (
    <div className="space-y-4">
      {/* Score display */}
      {displayScore !== null && (
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardContent className="flex items-center gap-4 p-4">
            <Trophy
              size={24}
              className={
                displayScore >= 80
                  ? "text-green-600"
                  : displayScore >= 50
                    ? "text-yellow-600"
                    : "text-red-600"
              }
            />
            <div>
              <p className="text-sm font-medium text-gray-700">
                {latestScore ? "Latest Score" : "Your Best Score"}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {displayScore}%
              </p>
            </div>
            <Badge
              variant={
                displayScore >= 80
                  ? "success"
                  : displayScore >= 50
                    ? "warning"
                    : "danger"
              }
              className="ml-auto"
            >
              {displayScore >= 80
                ? "Excellent"
                : displayScore >= 50
                  ? "Good"
                  : "Keep Practicing"}
            </Badge>
          </CardContent>
        </Card>
      )}

      {/* Exercise Player */}
      {exercises.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Dumbbell className="mx-auto h-12 w-12 text-gray-300" />
            <p className="mt-4 text-lg font-medium text-gray-500">
              No exercises available yet
            </p>
            <p className="mt-1 text-sm text-gray-400">
              Practice exercises for this topic will be added soon.
            </p>
          </CardContent>
        </Card>
      ) : (
        <ExercisePlayer
          exercises={exercises.map(e => ({ ...e, options: e.options ?? undefined }))}
          topicId={topicId}
          onComplete={(score, total) => setLatestScore({ score, total })}
        />
      )}
    </div>
  );
}
