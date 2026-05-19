import { useState } from 'react';
import type { Exercise } from '../data/curriculum';

interface Props {
  exercise: Exercise;
  onAnswer: (correct: boolean) => void;
  alreadyCorrect: boolean;
}

export default function ExerciseCard({ exercise, onAnswer, alreadyCorrect }: Props) {
  const [userAnswer, setUserAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSubmit = () => {
    if (submitted) return;
    const correct = checkAnswer(userAnswer, exercise.answer, exercise.type);
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(correct);
  };

  const handleOptionSelect = (option: string) => {
    if (submitted) return;
    setUserAnswer(option);
    const correct = checkAnswer(option, exercise.answer, exercise.type);
    setIsCorrect(correct);
    setSubmitted(true);
    onAnswer(correct);
  };

  return (
    <div className={`bg-[var(--color-bg-card)] border-2 rounded-xl p-6 transition-colors ${
      submitted
        ? isCorrect ? 'border-[var(--color-success)]' : 'border-[var(--color-danger)]'
        : 'border-[var(--color-border)]'
    }`}>
      {/* Difficulty badge */}
      <div className="flex items-center gap-2 mb-3">
        <DifficultyBadge difficulty={exercise.difficulty} />
        <span className="text-xs text-[var(--color-text-muted)] uppercase">{exercise.type.replace('-', ' ')}</span>
        {alreadyCorrect && <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-success)] text-white ml-auto">Previously Correct</span>}
      </div>

      {/* Question */}
      <p className="text-lg font-medium mb-4">{exercise.question}</p>

      {/* Answer Input */}
      {exercise.type === 'multiple-choice' && exercise.options && (
        <div className="space-y-2 mb-4">
          {exercise.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleOptionSelect(opt)}
              disabled={submitted}
              className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                submitted
                  ? opt === exercise.answer
                    ? 'border-[var(--color-success)] bg-[var(--color-success)]/10'
                    : opt === userAnswer && !isCorrect
                      ? 'border-[var(--color-danger)] bg-[var(--color-danger)]/10'
                      : 'border-[var(--color-border)] opacity-50'
                  : 'border-[var(--color-border)] hover:border-[var(--color-primary)] cursor-pointer'
              }`}
            >
              <span className="mr-2 font-mono text-sm text-[var(--color-text-muted)]">{String.fromCharCode(65 + i)}</span>
              {opt}
            </button>
          ))}
        </div>
      )}

      {exercise.type === 'true-false' && (
        <div className="flex gap-3 mb-4">
          {['true', 'false'].map(val => (
            <button
              key={val}
              onClick={() => handleOptionSelect(val)}
              disabled={submitted}
              className={`flex-1 py-3 rounded-lg border-2 font-medium transition-all ${
                submitted
                  ? val === exercise.answer
                    ? 'border-[var(--color-success)] bg-[var(--color-success)]/10'
                    : val === userAnswer && !isCorrect
                      ? 'border-[var(--color-danger)] bg-[var(--color-danger)]/10'
                      : 'border-[var(--color-border)] opacity-50'
                  : 'border-[var(--color-border)] hover:border-[var(--color-primary)] cursor-pointer'
              }`}
            >
              {val.charAt(0).toUpperCase() + val.slice(1)}
            </button>
          ))}
        </div>
      )}

      {exercise.type === 'short-answer' && (
        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              disabled={submitted}
              placeholder="Type your answer..."
              className="flex-1 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)]"
            />
            {!submitted && (
              <button
                onClick={handleSubmit}
                className="px-5 py-2.5 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition"
              >
                Check
              </button>
            )}
          </div>
          {submitted && (
            <p className="text-sm mt-2">
              <span className="text-[var(--color-text-muted)]">Correct answer: </span>
              <span className="font-medium text-[var(--color-success)]">{exercise.answer}</span>
            </p>
          )}
        </div>
      )}

      {/* Feedback */}
      {submitted && (
        <div className={`rounded-lg p-4 ${isCorrect ? 'bg-[var(--color-success)]/10' : 'bg-[var(--color-danger)]/10'}`}>
          <p className="font-semibold mb-1" style={{ color: isCorrect ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {isCorrect ? 'Correct! +10 XP' : 'Not quite right'}
          </p>
          <p className="text-sm text-[var(--color-text-muted)]">{exercise.explanation}</p>
        </div>
      )}
    </div>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    beginner: { bg: 'var(--color-success)', text: 'white' },
    intermediate: { bg: 'var(--color-accent)', text: 'black' },
    advanced: { bg: 'var(--color-danger)', text: 'white' },
    exam: { bg: 'var(--color-primary)', text: 'white' },
  };
  const c = colors[difficulty] || colors.beginner;
  return (
    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: c.bg, color: c.text }}>
      {difficulty}
    </span>
  );
}

function checkAnswer(userAnswer: string, correctAnswer: string, type: string): boolean {
  const normalize = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ');
  if (type === 'true-false') {
    return normalize(userAnswer) === normalize(correctAnswer);
  }
  if (type === 'multiple-choice') {
    return normalize(userAnswer) === normalize(correctAnswer);
  }
  // Short answer: be lenient
  const user = normalize(userAnswer);
  const correct = normalize(correctAnswer);
  if (user === correct) return true;
  // Remove spaces around operators
  const clean = (s: string) => s.replace(/\s*([+\-*/=,])\s*/g, '$1').replace(/\s+/g, '');
  return clean(user) === clean(correct);
}
