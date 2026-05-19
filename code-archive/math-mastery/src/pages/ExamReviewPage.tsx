import { useParams, Link } from 'react-router-dom';
import { examPapers } from '../data/examPapers';

interface ExamResult {
  paperId: string;
  score: number;
  totalMarks: number;
  date: string;
  timeUsed: number;
  answers: { [qId: string]: { [part: string]: string } | string };
  questionScores: { [qId: string]: { [part: string]: { score: number; max: number } } };
}

function getLatestResult(paperId: string): ExamResult | null {
  try {
    const results: ExamResult[] = JSON.parse(localStorage.getItem('math-mastery-exam-results') || '[]');
    const paperResults = results.filter(r => r.paperId === paperId);
    return paperResults.length > 0 ? paperResults[paperResults.length - 1] : null;
  } catch { return null; }
}

export default function ExamReviewPage() {
  const { paperId } = useParams();
  const paper = examPapers.find(p => p.id === paperId);
  const result = paperId ? getLatestResult(paperId) : null;

  if (!paper) {
    return <div className="text-center py-12"><p className="text-[var(--color-text-muted)]">Paper not found</p></div>;
  }

  if (!result) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <p className="text-[var(--color-text-muted)] mb-4">No attempt found for this paper.</p>
        <Link to={`/exam/${paper.id}`} className="px-5 py-2 rounded-lg bg-[var(--color-primary)] text-white">
          Take This Exam
        </Link>
      </div>
    );
  }

  const pct = Math.round((result.score / result.totalMarks) * 100);
  const grade = pct >= 80 ? '7' : pct >= 70 ? '6' : pct >= 60 ? '5' : pct >= 50 ? '4' : pct >= 40 ? '3' : pct >= 30 ? '2' : '1';
  const gradeColor = pct >= 70 ? 'var(--color-success)' : pct >= 50 ? 'var(--color-accent)' : 'var(--color-danger)';
  const timeMin = Math.floor(result.timeUsed / 60);
  const timeSec = result.timeUsed % 60;

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/exams" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)] transition mb-4 inline-block">
        &larr; Back to Exam Papers
      </Link>

      {/* Score Summary */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-8 mb-8">
        <h1 className="text-2xl font-bold mb-6 text-center">{paper.title} — Review</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: gradeColor }}>{result.score}/{result.totalMarks}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Score</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: gradeColor }}>{pct}%</p>
            <p className="text-xs text-[var(--color-text-muted)]">Percentage</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold" style={{ color: gradeColor }}>Grade {grade}</p>
            <p className="text-xs text-[var(--color-text-muted)]">IB Grade</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-[var(--color-text)]">{timeMin}:{String(timeSec).padStart(2, '0')}</p>
            <p className="text-xs text-[var(--color-text-muted)]">Time Used</p>
          </div>
        </div>

        {/* Score bar */}
        <div className="h-3 bg-[var(--color-bg)] rounded-full overflow-hidden mb-2">
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: gradeColor }} />
        </div>
        <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
          <span>0</span>
          <span>Grade 4 (50%)</span>
          <span>Grade 7 (80%)</span>
          <span>{result.totalMarks}</span>
        </div>
      </div>

      {/* Per-Topic Breakdown */}
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4">Performance by Topic</h2>
        <div className="space-y-2">
          {getTopicBreakdown(paper, result).map(topic => (
            <div key={topic.name} className="flex items-center gap-3">
              <span className="text-sm w-40 truncate">{topic.name}</span>
              <div className="flex-1 h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{
                  width: `${topic.pct}%`,
                  backgroundColor: topic.pct >= 70 ? 'var(--color-success)' : topic.pct >= 50 ? 'var(--color-accent)' : 'var(--color-danger)'
                }} />
              </div>
              <span className="text-xs text-[var(--color-text-muted)] w-16 text-right">{topic.score}/{topic.max}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Question-by-Question Review */}
      <h2 className="text-xl font-semibold mb-4">Detailed Review</h2>
      <div className="space-y-6">
        {paper.questions.map(q => {
          const qScores = result.questionScores?.[q.id] || {};
          const qTotal = q.parts ? q.parts.reduce((s, p) => s + (qScores[p.label]?.score || 0), 0) : (qScores['main']?.score || 0);

          return (
            <div key={q.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6">
              {/* Question Header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-lg font-bold text-[var(--color-primary-light)]">Q{q.number}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-bg)] text-[var(--color-text-muted)]">{q.topic}</span>
                <span className={`text-sm font-bold ml-auto ${
                  qTotal === q.marks ? 'text-[var(--color-success)]' :
                  qTotal > 0 ? 'text-[var(--color-accent)]' : 'text-[var(--color-danger)]'
                }`}>
                  {qTotal}/{q.marks} marks
                </span>
              </div>

              {/* Parts */}
              {q.parts ? (
                <div className="space-y-5">
                  {q.parts.map(part => {
                    const userAns = getUserAnswer(result.answers, q.id, part.label);
                    const partScore = qScores[part.label];
                    const isCorrect = partScore && partScore.score === partScore.max;
                    const isWrong = partScore && partScore.score === 0;
                    const isPartial = partScore && partScore.score > 0 && partScore.score < partScore.max;

                    return (
                      <div key={part.label} className={`rounded-lg p-4 border-l-4 ${
                        isCorrect ? 'border-l-[var(--color-success)] bg-[var(--color-success)]/5' :
                        isPartial ? 'border-l-[var(--color-accent)] bg-[var(--color-accent)]/5' :
                        isWrong ? 'border-l-[var(--color-danger)] bg-[var(--color-danger)]/5' :
                        'border-l-[var(--color-border)]'
                      }`}>
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="font-semibold text-sm text-[var(--color-secondary)]">{part.label}</span>
                          <p className="text-sm">{part.question}</p>
                          <span className={`text-xs font-bold ml-auto ${
                            isCorrect ? 'text-[var(--color-success)]' : isPartial ? 'text-[var(--color-accent)]' : 'text-[var(--color-danger)]'
                          }`}>
                            {partScore?.score || 0}/{part.marks}
                          </span>
                        </div>

                        {/* Your answer */}
                        <div className="mb-2">
                          <p className="text-xs text-[var(--color-text-muted)] mb-1">Your answer:</p>
                          <p className={`text-sm bg-[var(--color-bg)] rounded px-3 py-2 ${
                            userAns ? '' : 'italic text-[var(--color-text-muted)]'
                          }`}>
                            {userAns || '(no answer)'}
                          </p>
                        </div>

                        {/* Correct answer */}
                        {!isCorrect && (
                          <div className="mb-2">
                            <p className="text-xs text-[var(--color-success)] mb-1">Correct answer:</p>
                            <p className="text-sm bg-[var(--color-success)]/10 rounded px-3 py-2 text-[var(--color-success)]">
                              {part.answer}
                            </p>
                          </div>
                        )}

                        {/* Explanation — always show for wrong, show condensed for correct */}
                        {!isCorrect && (
                          <div className="mt-2">
                            <p className="text-xs text-[var(--color-text-muted)] mb-1">Explanation:</p>
                            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{part.explanation}</p>
                          </div>
                        )}
                        {isCorrect && (
                          <details className="mt-2">
                            <summary className="text-xs text-[var(--color-success)] cursor-pointer">View explanation</summary>
                            <p className="text-sm text-[var(--color-text-muted)] leading-relaxed mt-1">{part.explanation}</p>
                          </details>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div>
                  <p className="text-sm mb-3">{q.question}</p>
                  <div className="mb-2">
                    <p className="text-xs text-[var(--color-text-muted)] mb-1">Your answer:</p>
                    <p className="text-sm bg-[var(--color-bg)] rounded px-3 py-2">
                      {getUserAnswer(result.answers, q.id) || '(no answer)'}
                    </p>
                  </div>
                  {q.answer && qScores['main']?.score !== qScores['main']?.max && (
                    <>
                      <div className="mb-2">
                        <p className="text-xs text-[var(--color-success)] mb-1">Correct answer:</p>
                        <p className="text-sm bg-[var(--color-success)]/10 rounded px-3 py-2 text-[var(--color-success)]">{q.answer}</p>
                      </div>
                      {q.explanation && (
                        <div className="mt-2">
                          <p className="text-xs text-[var(--color-text-muted)] mb-1">Explanation:</p>
                          <p className="text-sm text-[var(--color-text-muted)]">{q.explanation}</p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center mt-8 mb-12">
        <Link
          to={`/exam/${paper.id}`}
          className="px-6 py-2.5 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition"
        >
          Retake This Paper
        </Link>
        <Link
          to="/exams"
          className="px-6 py-2.5 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] transition"
        >
          All Papers
        </Link>
      </div>
    </div>
  );
}

function getUserAnswer(answers: ExamResult['answers'], qId: string, partLabel?: string): string {
  if (!answers) return '';
  if (partLabel) {
    const qAns = answers[qId];
    if (typeof qAns === 'object' && qAns !== null) return qAns[partLabel] || '';
    return '';
  }
  return typeof answers[qId] === 'string' ? (answers[qId] as string) : '';
}

function getTopicBreakdown(paper: typeof examPapers[0], result: ExamResult) {
  const topicMap: { [topic: string]: { score: number; max: number } } = {};
  paper.questions.forEach(q => {
    if (!topicMap[q.topic]) topicMap[q.topic] = { score: 0, max: 0 };
    topicMap[q.topic].max += q.marks;
    const qScores = result.questionScores?.[q.id] || {};
    if (q.parts) {
      q.parts.forEach(p => { topicMap[q.topic].score += qScores[p.label]?.score || 0; });
    } else {
      topicMap[q.topic].score += qScores['main']?.score || 0;
    }
  });
  return Object.entries(topicMap).map(([name, data]) => ({
    name,
    score: data.score,
    max: data.max,
    pct: data.max > 0 ? Math.round((data.score / data.max) * 100) : 0
  })).sort((a, b) => a.pct - b.pct);
}
