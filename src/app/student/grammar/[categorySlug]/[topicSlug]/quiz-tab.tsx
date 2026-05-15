"use client";

import { useState } from "react";
import { QuizPlayer } from "@/components/grammar/quiz-player";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, ClipboardList } from "lucide-react";

interface QuizTabProps {
  topicId: string;
  topicTitle: string;
  previousScore: number | null;
}

export function QuizTab({
  topicId,
  topicTitle,
  previousScore,
}: QuizTabProps) {
  const [latestScore, setLatestScore] = useState<{
    score: number;
    total: number;
    percentage: number;
  } | null>(null);

  const displayScore = latestScore ? latestScore.percentage : previousScore;

  return (
    <div className="space-y-4">
      {/* Previous/Latest score display */}
      {displayScore !== null && (
        <Card className="border-indigo-200 bg-indigo-50/30">
          <CardContent className="flex items-center gap-4 p-4">
            <Trophy
              size={24}
              className={
                displayScore >= 90
                  ? "text-yellow-500"
                  : displayScore >= 70
                    ? "text-green-600"
                    : displayScore >= 50
                      ? "text-yellow-600"
                      : "text-red-600"
              }
            />
            <div>
              <p className="text-sm font-medium text-gray-700">
                {latestScore
                  ? "Latest Quiz Score"
                  : "Your Best Quiz Score"}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {displayScore}%
                {latestScore && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({latestScore.score}/{latestScore.total})
                  </span>
                )}
              </p>
            </div>
            <Badge
              variant={
                displayScore >= 90
                  ? "warning"
                  : displayScore >= 70
                    ? "success"
                    : "danger"
              }
              className="ml-auto"
            >
              {displayScore >= 90
                ? "Mastered"
                : displayScore >= 70
                  ? "Completed"
                  : "Keep Practicing"}
            </Badge>
          </CardContent>
        </Card>
      )}

      {previousScore === null && !latestScore && (
        <Card className="border-gray-200">
          <CardContent className="flex items-center gap-3 p-4">
            <ClipboardList size={20} className="text-gray-400" />
            <p className="text-sm text-gray-500">
              You haven&apos;t attempted this quiz yet. Test your knowledge
              of <span className="font-medium">{topicTitle}</span> below.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Quiz Player */}
      <QuizPlayer
        topicId={topicId}
        topicTitle={topicTitle}
        onComplete={(score, total, percentage) =>
          setLatestScore({ score, total, percentage })
        }
      />
    </div>
  );
}
