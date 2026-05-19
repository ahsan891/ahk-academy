import { Link } from 'react-router-dom';
import { examPapers } from '../data/examPapers';

interface ExamResult {
  paperId: string;
  score: number;
  totalMarks: number;
  date: string;
  timeUsed: number;
}

function getExamResults(): ExamResult[] {
  try {
    return JSON.parse(localStorage.getItem('math-mastery-exam-results') || '[]');
  } catch { return []; }
}

export default function ExamListPage() {
  const results = getExamResults();

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)] transition mb-4 inline-block">
        &larr; Back to Dashboard
      </Link>

      <h1 className="text-3xl font-bold mb-2">Exam Papers</h1>
      <p className="text-[var(--color-text-muted)] mb-8">
        Full IB-style practice papers with timed conditions. After submission, review every answer with detailed explanations.
      </p>

      {/* Paper Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
          <h3 className="font-semibold text-[var(--color-primary-light)] mb-2">Paper 1 — No Calculator</h3>
          <p className="text-sm text-[var(--color-text-muted)]">2 hours, 110 marks. Tests analytical skills, algebraic manipulation, and proof techniques.</p>
        </div>
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5">
          <h3 className="font-semibold text-[var(--color-secondary)] mb-2">Paper 2 — Calculator Allowed</h3>
          <p className="text-sm text-[var(--color-text-muted)]">2 hours, 110 marks. Focuses on applications, modeling, statistics, and numerical problems.</p>
        </div>
      </div>

      {/* Paper Cards */}
      <div className="space-y-4">
        {examPapers.map(paper => {
          const paperResults = results.filter(r => r.paperId === paper.id);
          const bestResult = paperResults.length > 0
            ? paperResults.reduce((best, r) => r.score > best.score ? r : best, paperResults[0])
            : null;

          return (
            <div key={paper.id} className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6 hover:border-[var(--color-primary)] transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                      paper.calculator
                        ? 'bg-[var(--color-secondary)]/20 text-[var(--color-secondary)]'
                        : 'bg-[var(--color-primary)]/20 text-[var(--color-primary-light)]'
                    }`}>
                      Paper {paper.paperNumber}
                    </span>
                    <span className="text-xs text-[var(--color-text-muted)]">
                      {paper.duration} min | {paper.totalMarks} marks | {paper.questions.length} questions
                    </span>
                    {!paper.calculator && (
                      <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-danger)]/20 text-[var(--color-danger)]">
                        No Calculator
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{paper.title}</h3>
                  <p className="text-sm text-[var(--color-text-muted)]">{paper.description}</p>

                  {/* Topics covered */}
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {[...new Set(paper.questions.map(q => q.topic))].map(topic => (
                      <span key={topic} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg)] text-[var(--color-text-muted)]">
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 ml-4">
                  {bestResult && (
                    <div className="text-right mb-2">
                      <p className="text-xs text-[var(--color-text-muted)]">Best Score</p>
                      <p className="text-xl font-bold" style={{
                        color: bestResult.score / bestResult.totalMarks >= 0.7 ? 'var(--color-success)' :
                               bestResult.score / bestResult.totalMarks >= 0.5 ? 'var(--color-accent)' : 'var(--color-danger)'
                      }}>
                        {bestResult.score}/{bestResult.totalMarks}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-muted)]">
                        {Math.round(bestResult.score / bestResult.totalMarks * 100)}% | {paperResults.length} attempt{paperResults.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  )}
                  <Link
                    to={`/exam/${paper.id}`}
                    className="px-5 py-2.5 rounded-lg bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition text-sm"
                  >
                    {bestResult ? 'Retake' : 'Start Exam'}
                  </Link>
                  {bestResult && (
                    <Link
                      to={`/exam/${paper.id}/review`}
                      className="px-5 py-2 rounded-lg border border-[var(--color-border)] text-sm hover:bg-[var(--color-bg-hover)] transition"
                    >
                      Review Last Attempt
                    </Link>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
