"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/grammar/progress-ring";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  RotateCcw,
  Trophy,
  Loader2,
} from "lucide-react";

interface Exercise {
  id: string;
  type: string;
  difficulty: string;
  question: string;
  options?: string;
  order: number;
}

interface ExercisePlayerProps {
  exercises: Exercise[];
  topicId: string;
  onComplete?: (score: number, total: number) => void;
}

interface CheckResult {
  correct: boolean;
  correctAnswer: string;
  explanation: string;
}

type AnswerRecord = {
  exerciseId: string;
  answer: string;
  result: CheckResult | null;
};

export function ExercisePlayer({
  exercises,
  topicId,
  onComplete,
}: ExercisePlayerProps) {
  const sorted = [...exercises].sort((a, b) => a.order - b.order);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerRecord[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [currentResult, setCurrentResult] = useState<CheckResult | null>(null);
  const [finished, setFinished] = useState(false);
  const [fadeKey, setFadeKey] = useState(0);

  const exercise = sorted[currentIndex] as Exercise | undefined;
  const total = sorted.length;
  const score = answers.filter((a) => a.result?.correct).length;

  const resetInput = useCallback(() => {
    setInputValue("");
    setSelectedOption(null);
    setCurrentResult(null);
  }, []);

  const checkAnswer = useCallback(async () => {
    if (!exercise) return;

    const answer =
      exercise.type === "multiple_choice"
        ? selectedOption ?? ""
        : inputValue.trim();

    if (!answer) return;

    setChecking(true);
    try {
      const res = await fetch("/api/grammar/exercises/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: exercise.id, answer }),
      });

      if (!res.ok) throw new Error("Failed to check answer");

      const data: CheckResult = await res.json();
      setCurrentResult(data);
      setAnswers((prev) => [
        ...prev,
        { exerciseId: exercise.id, answer, result: data },
      ]);
    } catch {
      setCurrentResult({
        correct: false,
        correctAnswer: "",
        explanation: "Something went wrong while checking your answer. Please try again.",
      });
    } finally {
      setChecking(false);
    }
  }, [exercise, selectedOption, inputValue]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= total) {
      setFinished(true);
      const finalScore = answers.filter((a) => a.result?.correct).length;
      onComplete?.(finalScore, total);
    } else {
      setCurrentIndex((i) => i + 1);
      resetInput();
      setFadeKey((k) => k + 1);
    }
  }, [currentIndex, total, answers, onComplete, resetInput]);

  const handleRetry = useCallback(() => {
    setCurrentIndex(0);
    setAnswers([]);
    setFinished(false);
    resetInput();
    setFadeKey((k) => k + 1);
  }, [resetInput]);

  // --- Summary screen ---
  if (finished) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const encouragement =
      pct >= 90
        ? "Outstanding! You've mastered this topic!"
        : pct >= 70
          ? "Great job! You're making solid progress."
          : pct >= 50
            ? "Good effort! A bit more practice and you'll nail it."
            : "Keep going! Practice makes perfect.";

    return (
      <Card className="mx-auto max-w-2xl animate-in fade-in duration-500">
        <CardHeader className="text-center">
          <Trophy className="mx-auto mb-2 h-10 w-10 text-yellow-500" />
          <CardTitle className="text-2xl">Exercise Complete!</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <ProgressRing percentage={pct} size={120} strokeWidth={8} />

          <div className="text-center">
            <p className="text-3xl font-bold text-gray-900">
              {score} / {total}
            </p>
            <p className="mt-1 text-sm text-gray-500">{pct}% correct</p>
          </div>

          <p className="text-center text-gray-700">{encouragement}</p>

          <div className="flex gap-3">
            <Button variant="outline" onClick={handleRetry}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Retry Exercises
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!exercise) return null;

  // Parse MCQ options
  let options: string[] = [];
  if (exercise.type === "multiple_choice" && exercise.options) {
    try {
      options = JSON.parse(exercise.options);
    } catch {
      options = [];
    }
  }

  const answered = currentResult !== null;
  const canSubmit =
    !answered &&
    !checking &&
    (exercise.type === "multiple_choice"
      ? selectedOption !== null
      : inputValue.trim().length > 0);

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
        </div>
        <span className="shrink-0 text-sm font-medium text-gray-600">
          {currentIndex + 1} / {total}
        </span>
      </div>

      {/* Exercise card */}
      <Card
        key={fadeKey}
        className="animate-in fade-in slide-in-from-right-4 duration-300"
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="info">{exercise.type.replace(/_/g, " ")}</Badge>
            <Badge
              variant={
                exercise.difficulty === "hard"
                  ? "danger"
                  : exercise.difficulty === "medium"
                    ? "warning"
                    : "success"
              }
            >
              {exercise.difficulty}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* --- Question rendering per type --- */}

          {exercise.type === "multiple_choice" && (
            <>
              <p className="text-base font-medium text-gray-900">
                {exercise.question}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {options.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isSelected = selectedOption === opt;
                  const isCorrect =
                    answered && currentResult?.correctAnswer === opt;
                  const isWrong =
                    answered && isSelected && !currentResult?.correct;

                  return (
                    <button
                      key={i}
                      disabled={answered}
                      onClick={() => setSelectedOption(opt)}
                      className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left text-sm font-medium transition-colors ${
                        isCorrect
                          ? "border-green-500 bg-green-50 text-green-800"
                          : isWrong
                            ? "border-red-500 bg-red-50 text-red-800"
                            : isSelected
                              ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                              : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50"
                      } disabled:cursor-default`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isCorrect
                            ? "bg-green-600 text-white"
                            : isWrong
                              ? "bg-red-600 text-white"
                              : isSelected
                                ? "bg-indigo-600 text-white"
                                : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {letter}
                      </span>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {exercise.type === "fill_in_blank" && (
            <>
              <p className="text-base font-medium text-gray-900">
                {exercise.question.split("___").map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="mx-1 inline-block rounded bg-indigo-100 px-3 py-0.5 text-indigo-600">
                        ___
                      </span>
                    )}
                  </span>
                ))}
              </p>
              <div className="flex gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your answer..."
                  disabled={answered}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && canSubmit) checkAnswer();
                  }}
                />
                {!answered && (
                  <Button
                    onClick={checkAnswer}
                    disabled={!canSubmit}
                    className="shrink-0"
                  >
                    {checking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Submit"
                    )}
                  </Button>
                )}
              </div>
            </>
          )}

          {exercise.type === "error_correction" && (
            <>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-600">
                  Find and correct the error:
                </p>
                <p className="mt-2 text-base text-red-900">
                  {exercise.question}
                </p>
              </div>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Write the corrected sentence..."
                disabled={answered}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {!answered && (
                <Button onClick={checkAnswer} disabled={!canSubmit}>
                  {checking ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Submit Answer
                </Button>
              )}
            </>
          )}

          {exercise.type === "sentence_rewrite" && (
            <>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-600">
                  Rewrite the following:
                </p>
                <p className="mt-2 text-base text-blue-900">
                  {exercise.question}
                </p>
              </div>
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Write your rewritten sentence..."
                disabled={answered}
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              />
              {!answered && (
                <Button onClick={checkAnswer} disabled={!canSubmit}>
                  {checking ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  Submit Answer
                </Button>
              )}
            </>
          )}

          {/* --- Feedback --- */}
          {answered && currentResult && (
            <div
              className={`flex items-start gap-3 rounded-lg border p-4 animate-in fade-in duration-300 ${
                currentResult.correct
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              {currentResult.correct ? (
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              )}
              <div className="space-y-1">
                <p
                  className={`font-semibold ${
                    currentResult.correct ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {currentResult.correct ? "Correct!" : "Incorrect"}
                </p>
                {!currentResult.correct && currentResult.correctAnswer && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Correct answer:</span>{" "}
                    {currentResult.correctAnswer}
                  </p>
                )}
                {currentResult.explanation && (
                  <p className="text-sm text-gray-600">
                    {currentResult.explanation}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Next button */}
          {answered && (
            <div className="flex justify-end">
              <Button onClick={handleNext}>
                {currentIndex + 1 >= total ? "See Results" : "Next"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
