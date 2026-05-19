import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { examPapers } from '../data/examPapers';
import type { ExamQuestion } from '../data/examPapers';

interface AnswerMap {
  [questionId: string]: { [partLabel: string]: string } | string;
}

function saveExamState(paperId: string, answers: AnswerMap, elapsed: number) {
  localStorage.setItem(`math-mastery-exam-state-${paperId}`, JSON.stringify({ answers, elapsed }));
}

function loadExamState(paperId: string): { answers: AnswerMap; elapsed: number } | null {
  try {
    const data = localStorage.getItem(`math-mastery-exam-state-${paperId}`);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

function clearExamState(paperId: string) {
  localStorage.removeItem(`math-mastery-exam-state-${paperId}`);
}

export default function ExamTakePage() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const paper = examPapers.find(p => p.id === paperId);

  const [started, setStarted] = useState(false);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [elapsed, setElapsed] = useState(0); // seconds
  const [currentQ, setCurrentQ] = useState(0);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load saved state
  useEffect(() => {
    if (!paper) return;
    const saved = loadExamState(paper.id);
    if (saved) {
      setAnswers(saved.answers);
      setElapsed(saved.elapsed);
      setStarted(true);
    }
  }, [paper]);

  // Timer
  useEffect(() => {
    if (started && paper) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => {
          const next = prev + 1;
          if (next % 10 === 0) saveExamState(paper.id, answers, next);
          return next;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [started, paper, answers]);

  const handleSubmit = useCallback(() => {
    if (!paper) return;
    if (timerRef.current) clearInterval(timerRef.current);

    // Score the exam
    let totalScore = 0;
    const questionScores: { [qId: string]: { [part: string]: { score: number; max: number } } } = {};

    paper.questions.forEach(q => {
      questionScores[q.id] = {};
      if (q.parts) {
        q.parts.forEach(part => {
          const userAns = (answers[q.id] as { [k: string]: string })?.[part.label] || '';
          const isCorrect = fuzzyMatch(userAns, part.answer);
          const score = isCorrect ? part.marks : partialScore(userAns, part.answer, part.marks);
          questionScores[q.id][part.label] = { score, max: part.marks };
          totalScore += score;
        });
      } else if (q.answer) {
        const userAns = typeof answers[q.id] === 'string' ? answers[q.id] as string : '';
        const isCorrect = fuzzyMatch(userAns, q.answer);
        const score = isCorrect ? q.marks : 0;
        questionScores[q.id]['main'] = { score, max: q.marks };
        totalScore += score;
      }
    });

    // Save result
    const results = JSON.parse(localStorage.getItem('math-mastery-exam-results') || '[]');
    results.push({
      paperId: paper.id,
      score: totalScore,
      totalMarks: paper.totalMarks,
      date: new Date().toISOString(),
      timeUsed: elapsed,
      answers: answers,
      questionScores
    });
    localStorage.setItem('math-mastery-exam-results', JSON.stringify(results));
    clearExamState(paper.id);

    navigate(`/exam/${paper.id}/review`);
  }, [paper, answers, elapsed, navigate]);

  if (!paper) {
    return <div className="text-center py-12"><p className="text-[var(--color-text-muted)]">Paper not found</p></div>;
  }

  // Pre-exam screen
  if (!started) {
    return (
      <div className="max-w-2xl mx-auto">
        <Link to="/exams" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)] transition mb-6 inline-block">
          &larr; Back to Exam Papers
        </Link>
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">{paper.title}</h1>
          <p className="text-[var(--color-text-muted)] mb-6">{paper.description}</p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-[var(--color-bg)] rounded-lg p-4">
              <p className="text-2xl font-bold text-[var(--color-primary-light)]">{paper.duration}</p>
              <p className="text-xs text-[var(--color-text-muted)]">minutes</p>
            </div>
            <div className="bg-[var(--color-bg)] rounded-lg p-4">
              <p className="text-2xl font-bold text-[var(--color-accent)]">{paper.totalMarks}</p>
              <p className="text-xs text-[var(--color-text-muted)]">total marks</p>
            </div>
            <div className="bg-[var(--color-bg)] rounded-lg p-4">
              <p className="text-2xl font-bold text-[var(--color-secondary)]">{paper.questions.length}</p>
              <p className="text-xs text-[var(--color-text-muted)]">questions</p>
            </div>
          </div>

          <div className="bg-[var(--color-bg)] rounded-lg p-4 mb-6 text-left text-sm">
            <h3 className="font-semibold mb-2">Instructions:</h3>
            <ul className="space-y-1 text-[var(--color-text-muted)]">
              <li>- You have {paper.duration} minutes. A timer will count up and warn you when time is running low.</li>
              <li>- {paper.calculator ? 'Calculator IS allowed for this paper.' : 'No calculator is allowed for this paper.'}</li>
              <li>- Answer all questions. Write your answers in the text fields provided.</li>
              <li>- You can navigate between questions using the question bar at the top.</li>
              <li>- Your progress is auto-saved every 10 seconds.</li>
              <li>- After submission, you will see a full review with explanations for every question.</li>
            </ul>
          </div>

          <button
            onClick={() => setStarted(true)}
            className="px-8 py-3 rounded-lg bg-[var(--color-primary)] text-white font-semibold text-lg hover:bg-[var(--color-primary-dark)] transition"
          >
            Begin Exam
          </button>
        </div>
      </div>
    );
  }

  // Active exam
  const timeLeft = paper.duration * 60 - elapsed;
  const minutes = Math.max(0, Math.floor(timeLeft / 60));
  const seconds = Math.max(0, timeLeft % 60);
  const isOvertime = timeLeft <= 0;
  const isWarning = timeLeft > 0 && timeLeft <= 600; // 10 min warning
  const question = paper.questions[currentQ];

  const getAnswer = (qId: string, partLabel?: string): string => {
    if (partLabel) {
      return (answers[qId] as { [k: string]: string })?.[partLabel] || '';
    }
    return typeof answers[qId] === 'string' ? (answers[qId] as string) : '';
  };

  const setAnswer = (qId: string, value: string, partLabel?: string) => {
    setAnswers(prev => {
      if (partLabel) {
        const existing = (prev[qId] as { [k: string]: string }) || {};
        return { ...prev, [qId]: { ...existing, [partLabel]: value } };
      }
      return { ...prev, [qId]: value };
    });
  };

  const answeredCount = paper.questions.filter(q => {
    if (q.parts) return q.parts.some(p => getAnswer(q.id, p.label).trim() !== '');
    return getAnswer(q.id).trim() !== '';
  }).length;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Timer Bar */}
      <div className={`sticky top-0 z-10 -mx-6 -mt-6 px-6 py-3 mb-6 flex items-center justify-between ${
        isOvertime ? 'bg-[var(--color-danger)]/20' : isWarning ? 'bg-[var(--color-accent)]/20' : 'bg-[var(--color-bg-card)]'
      } border-b border-[var(--color-border)]`}>
        <div className="flex items-center gap-4">
          <h2 className="font-semibold text-sm">{paper.title}</h2>
          <span className="text-xs text-[var(--color-text-muted)]">{answeredCount}/{paper.questions.length} answered</span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`font-mono text-lg font-bold ${
            isOvertime ? 'text-[var(--color-danger)]' : isWarning ? 'text-[var(--color-accent)]' : 'text-[var(--color-text)]'
          }`}>
            {isOvertime ? '-' : ''}{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            {isOvertime && <span className="text-xs ml-2">OVERTIME</span>}
          </div>
          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="px-4 py-1.5 rounded-lg bg-[var(--color-success)] text-white text-sm font-medium hover:opacity-90 transition"
          >
            Submit
          </button>
        </div>
      </div>

      {/* Question Navigator */}
      <div className="flex flex-wrap gap-1.5 mb-6">
        {paper.questions.map((q, i) => {
          const hasAnswer = q.parts
            ? q.parts.some(p => getAnswer(q.id, p.label).trim() !== '')
            : getAnswer(q.id).trim() !== '';
          return (
            <button
              key={q.id}
              onClick={() => setCurrentQ(i)}
              className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                i === currentQ
                  ? 'bg-[var(--color-primary)] text-white'
                  : hasAnswer
                    ? 'bg-[var(--color-success)]/20 text-[var(--color-success)] border border-[var(--color-success)]/40'
                    : 'bg-[var(--color-bg-card)] text-[var(--color-text-muted)] border border-[var(--color-border)]'
              }`}
            >
              {q.number}
            </button>
          );
        })}
      </div>

      {/* Current Question */}
      <QuestionCard
        question={question}
        getAnswer={(partLabel) => getAnswer(question.id, partLabel)}
        setAnswer={(value, partLabel) => setAnswer(question.id, value, partLabel)}
      />

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <button
          onClick={() => setCurrentQ(i => Math.max(0, i - 1))}
          disabled={currentQ === 0}
          className="px-5 py-2 rounded-lg border border-[var(--color-border)] text-sm hover:bg-[var(--color-bg-hover)] transition disabled:opacity-30"
        >
          Previous
        </button>
        {currentQ < paper.questions.length - 1 ? (
          <button
            onClick={() => setCurrentQ(i => i + 1)}
            className="px-5 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm font-medium hover:bg-[var(--color-primary-dark)] transition"
          >
            Next Question
          </button>
        ) : (
          <button
            onClick={() => setShowConfirmSubmit(true)}
            className="px-5 py-2 rounded-lg bg-[var(--color-success)] text-white text-sm font-medium hover:opacity-90 transition"
          >
            Finish & Submit
          </button>
        )}
      </div>

      {/* Submit Confirmation Modal */}
      {showConfirmSubmit && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-8 max-w-md mx-4">
            <h3 className="text-xl font-bold mb-3">Submit Exam?</h3>
            <p className="text-[var(--color-text-muted)] mb-2">
              You have answered <strong>{answeredCount}</strong> of <strong>{paper.questions.length}</strong> questions.
            </p>
            {answeredCount < paper.questions.length && (
              <p className="text-[var(--color-accent)] text-sm mb-4">
                Warning: {paper.questions.length - answeredCount} question(s) are unanswered!
              </p>
            )}
            <p className="text-sm text-[var(--color-text-muted)] mb-6">
              Time used: {Math.floor(elapsed / 60)}m {elapsed % 60}s
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirmSubmit(false)}
                className="px-5 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] transition"
              >
                Continue Exam
              </button>
              <button
                onClick={handleSubmit}
                className="px-5 py-2 rounded-lg bg-[var(--color-success)] text-white font-medium hover:opacity-90 transition"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function QuestionCard({ question, getAnswer, setAnswer }: {
  question: ExamQuestion;
  getAnswer: (partLabel?: string) => string;
  setAnswer: (value: string, partLabel?: string) => void;
}) {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-lg font-bold text-[var(--color-primary-light)]">Q{question.number}</span>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg)] text-[var(--color-text-muted)]">{question.topic}</span>
        <span className="text-xs text-[var(--color-text-muted)] ml-auto">[{question.marks} marks]</span>
        <DiffBadge difficulty={question.difficulty} />
      </div>

      {question.parts ? (
        <div className="space-y-6">
          {question.parts.map(part => (
            <div key={part.label}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="font-semibold text-sm text-[var(--color-secondary)]">{part.label}</span>
                <p className="text-[var(--color-text)]">{part.question}</p>
                <span className="text-xs text-[var(--color-text-muted)] ml-auto whitespace-nowrap">[{part.marks}]</span>
              </div>
              <textarea
                value={getAnswer(part.label)}
                onChange={e => setAnswer(e.target.value, part.label)}
                placeholder="Write your answer here..."
                rows={3}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] resize-y text-sm"
              />
            </div>
          ))}
        </div>
      ) : (
        <div>
          <p className="text-[var(--color-text)] mb-3">{question.question}</p>
          <textarea
            value={getAnswer()}
            onChange={e => setAnswer(e.target.value)}
            placeholder="Write your answer here..."
            rows={4}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg px-4 py-2.5 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] resize-y text-sm"
          />
        </div>
      )}
    </div>
  );
}

function DiffBadge({ difficulty }: { difficulty: string }) {
  const colors: Record<string, string> = { easy: 'var(--color-success)', medium: 'var(--color-accent)', hard: 'var(--color-danger)' };
  return (
    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: colors[difficulty] + '22', color: colors[difficulty] }}>
      {difficulty}
    </span>
  );
}

function fuzzyMatch(userAnswer: string, correctAnswer: string): boolean {
  const clean = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.,;:!?]+$/, '');
  const u = clean(userAnswer);
  const c = clean(correctAnswer);
  if (!u) return false;
  if (u === c) return true;
  // Check if the key numerical answer is in the user's response
  const numbers = c.match(/-?\d+\.?\d*/g);
  if (numbers && numbers.length > 0) {
    return numbers.every(n => u.includes(n));
  }
  return u.includes(c) || c.includes(u);
}

function partialScore(_userAnswer: string, _correctAnswer: string, _maxMarks: number): number {
  // Simple: if they wrote something, give 1 mark for attempt (method marks concept)
  if (_userAnswer.trim().length > 5) return Math.min(1, _maxMarks);
  return 0;
}
