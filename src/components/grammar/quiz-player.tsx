"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProgressRing } from "@/components/grammar/progress-ring";
import {
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  ArrowLeft,
  Clock,
  Loader2,
  Trophy,
  AlertCircle,
} from "lucide-react";

interface QuizQuestion {
  id: string;
  type: string;
  difficulty: string;
  question: string;
  options?: string;
  order: number;
}

interface QuizPlayerProps {
  topicId: string;
  topicTitle: string;
  onComplete?: (score: number, total: number, percentage: number) => void;
}

interface QuizResultQuestion {
  id: string;
  question: string;
  studentAnswer: string;
  correctAnswer: string;
  correct: boolean;
  explanation: string;
}

interface QuizResult {
  score: number;
  total: number;
  percentage: number;
  questions: QuizResultQuestion[];
}

function formatElapsed(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function QuizPlayer({
  topicId,
  topicTitle,
  onComplete,
}: QuizPlayerProps) {
  // --- State ---
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [fadeKey, setFadeKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- Fetch quiz ---
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/grammar/quiz/${topicId}`);
        if (!res.ok) throw new Error("Failed to load quiz");
        const data = await res.json();
        const sorted = (data.questions ?? data ?? []) as QuizQuestion[];
        sorted.sort((a, b) => a.order - b.order);
        if (!cancelled) setQuestions(sorted);
      } catch {
        if (!cancelled) setError("Could not load the quiz. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [topicId]);

  // --- Timer ---
  useEffect(() => {
    if (!loading && questions.length > 0 && !result) {
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, questions.length, result]);

  // --- Helpers ---
  const total = questions.length;
  const question = questions[currentIndex] as QuizQuestion | undefined;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === total && total > 0;

  const setAnswer = useCallback(
    (qId: string, value: string) => {
      setAnswers((prev) => ({ ...prev, [qId]: value }));
    },
    []
  );

  const goTo = useCallback(
    (idx: number) => {
      if (idx >= 0 && idx < total) {
        setCurrentIndex(idx);
        setFadeKey((k) => k + 1);
      }
    },
    [total]
  );

  // --- Submit ---
  const handleSubmit = useCallback(async () => {
    if (!allAnswered) return;
    setSubmitting(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      const payload = questions.map((q) => ({
        questionId: q.id,
        answer: answers[q.id] ?? "",
      }));

      const res = await fetch(`/api/grammar/quiz/${topicId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: payload }),
      });

      if (!res.ok) throw new Error("Failed to submit quiz");

      const data: QuizResult = await res.json();
      setResult(data);
      onComplete?.(data.score, data.total, data.percentage);
    } catch {
      setError("Failed to submit quiz. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [allAnswered, questions, answers, topicId, onComplete]);

  // --- Retry ---
  const handleRetry = useCallback(() => {
    setResult(null);
    setAnswers({});
    setCurrentIndex(0);
    setElapsed(0);
    setError(null);
    setFadeKey((k) => k + 1);
    // Re-fetch will happen via dependency on topicId (already loaded) so just restart timer
    timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
  }, []);

  // =================== LOADING ===================
  if (loading) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <p className="text-sm text-gray-500">Loading quiz...</p>
        </CardContent>
      </Card>
    );
  }

  // =================== ERROR ===================
  if (error && !result) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="flex flex-col items-center justify-center gap-4 py-16">
          <AlertCircle className="h-8 w-8 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload Page
          </Button>
        </CardContent>
      </Card>
    );
  }

  // =================== RESULTS ===================
  if (result) {
    const pct = result.percentage;
    const mastered = pct >= 90;
    const completed = pct >= 70;

    return (
      <div className="mx-auto max-w-2xl space-y-6 animate-in fade-in duration-500">
        {/* Score header */}
        <Card>
          <CardHeader className="text-center">
            <Trophy
              className={`mx-auto mb-2 h-10 w-10 ${mastered ? "text-yellow-500" : completed ? "text-green-500" : "text-orange-500"}`}
            />
            <CardTitle className="text-2xl">Quiz Results</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-5">
            <ProgressRing percentage={pct} size={130} strokeWidth={10} />

            <div className="text-center">
              <p className="text-4xl font-bold text-gray-900">
                {result.score}/{result.total}
              </p>
              <p className="mt-1 text-lg text-gray-500">({pct}%)</p>
            </div>

            {mastered ? (
              <Badge
                variant="warning"
                className="border-2 border-yellow-400 bg-yellow-50 px-4 py-1.5 text-base font-bold text-yellow-800 shadow-sm shadow-yellow-200"
              >
                MASTERED
              </Badge>
            ) : completed ? (
              <Badge
                variant="success"
                className="px-4 py-1.5 text-base font-bold"
              >
                COMPLETED
              </Badge>
            ) : (
              <Badge
                variant="warning"
                className="px-4 py-1.5 text-base font-bold"
              >
                Keep Practicing
              </Badge>
            )}

            <p className="text-sm text-gray-500">
              Time: {formatElapsed(elapsed)}
            </p>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleRetry}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Retry Quiz
              </Button>
              <Button
                variant="outline"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Topic
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Question-by-question review */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">
            Review Answers
          </h3>
          {result.questions.map((rq, idx) => (
            <Card
              key={rq.id}
              className={`border-l-4 ${rq.correct ? "border-l-green-500" : "border-l-red-500"}`}
            >
              <CardContent className="space-y-2 p-4">
                <div className="flex items-start gap-2">
                  {rq.correct ? (
                    <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
                  )}
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium text-gray-900">
                      <span className="mr-2 text-gray-400">Q{idx + 1}.</span>
                      {rq.question}
                    </p>
                    <p className="text-sm">
                      <span className="font-medium text-gray-600">
                        Your answer:
                      </span>{" "}
                      <span
                        className={
                          rq.correct ? "text-green-700" : "text-red-700"
                        }
                      >
                        {rq.studentAnswer || "(no answer)"}
                      </span>
                    </p>
                    {!rq.correct && (
                      <p className="text-sm">
                        <span className="font-medium text-gray-600">
                          Correct answer:
                        </span>{" "}
                        <span className="text-green-700">
                          {rq.correctAnswer}
                        </span>
                      </p>
                    )}
                    {rq.explanation && (
                      <p className="text-xs text-gray-500">
                        {rq.explanation}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // =================== QUIZ TAKING ===================
  if (!question) return null;

  let options: string[] = [];
  if (question.type === "multiple_choice" && question.options) {
    try {
      options = JSON.parse(question.options);
    } catch {
      options = [];
    }
  }

  const currentAnswer = answers[question.id] ?? "";

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      {/* Top bar: title + timer */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{topicTitle}</h2>
        <div className="flex items-center gap-1.5 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          {formatElapsed(elapsed)}
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{
                width: `${((answeredCount) / total) * 100}%`,
              }}
            />
          </div>
        </div>
        <span className="shrink-0 text-sm font-medium text-gray-600">
          {answeredCount} / {total} answered
        </span>
      </div>

      {/* Question card */}
      <Card
        key={fadeKey}
        className="animate-in fade-in slide-in-from-right-4 duration-300"
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              Question {currentIndex + 1} of {total}
            </span>
            <div className="flex gap-2">
              <Badge variant="info">
                {question.type.replace(/_/g, " ")}
              </Badge>
              <Badge
                variant={
                  question.difficulty === "hard"
                    ? "danger"
                    : question.difficulty === "medium"
                      ? "warning"
                      : "success"
                }
              >
                {question.difficulty}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-5">
          {/* Multiple choice */}
          {question.type === "multiple_choice" && (
            <>
              <p className="text-base font-medium text-gray-900">
                {question.question}
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {options.map((opt, i) => {
                  const letter = String.fromCharCode(65 + i);
                  const isSelected = currentAnswer === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => setAnswer(question.id, opt)}
                      className={`flex items-center gap-3 rounded-lg border-2 p-3 text-left text-sm font-medium transition-colors ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-800"
                          : "border-gray-200 bg-white text-gray-700 hover:border-indigo-300 hover:bg-indigo-50/50"
                      }`}
                    >
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          isSelected
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

          {/* Fill in blank */}
          {question.type === "fill_in_blank" && (
            <>
              <p className="text-base font-medium text-gray-900">
                {question.question.split("___").map((part, i, arr) => (
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
              <Input
                value={currentAnswer}
                onChange={(e) => setAnswer(question.id, e.target.value)}
                placeholder="Type your answer..."
              />
            </>
          )}

          {/* Error correction */}
          {question.type === "error_correction" && (
            <>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-600">
                  Find and correct the error:
                </p>
                <p className="mt-2 text-base text-red-900">
                  {question.question}
                </p>
              </div>
              <textarea
                value={currentAnswer}
                onChange={(e) => setAnswer(question.id, e.target.value)}
                placeholder="Write the corrected sentence..."
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}

          {/* Sentence rewrite */}
          {question.type === "sentence_rewrite" && (
            <>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm font-medium text-blue-600">
                  Rewrite the following:
                </p>
                <p className="mt-2 text-base text-blue-900">
                  {question.question}
                </p>
              </div>
              <textarea
                value={currentAnswer}
                onChange={(e) => setAnswer(question.id, e.target.value)}
                placeholder="Write your rewritten sentence..."
                rows={3}
                className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Navigation: Prev / Next / Submit */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          size="sm"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Previous
        </Button>

        {currentIndex + 1 < total ? (
          <Button
            variant="outline"
            onClick={() => goTo(currentIndex + 1)}
            size="sm"
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            size="sm"
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Submit Quiz
          </Button>
        )}
      </div>

      {/* Navigation dots */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {questions.map((q, idx) => {
          const hasAnswer = answers[q.id] !== undefined && answers[q.id] !== "";
          const isCurrent = idx === currentIndex;
          return (
            <button
              key={q.id}
              onClick={() => goTo(idx)}
              aria-label={`Go to question ${idx + 1}`}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                isCurrent
                  ? "bg-indigo-600 text-white ring-2 ring-indigo-300 ring-offset-1"
                  : hasAnswer
                    ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                    : "border border-gray-300 bg-white text-gray-400 hover:border-gray-400"
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>

      {/* Submit button (also shown below dots when not on last question) */}
      {currentIndex + 1 < total && (
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || submitting}
            size="sm"
            variant={allAnswered ? "default" : "outline"}
          >
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Submit Quiz ({answeredCount}/{total} answered)
          </Button>
        </div>
      )}
    </div>
  );
}
