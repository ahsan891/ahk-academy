import { Link } from 'react-router-dom';
import { curriculum, getTotalExercises, getTotalLessons, getTotalTopics } from '../data/curriculum';
import type { Progress } from '../store/useStore';

interface Props {
  progress: Progress;
}

export default function Dashboard({ progress }: Props) {
  const totalTopics = getTotalTopics();
  const totalLessons = getTotalLessons();
  const totalExercises = getTotalExercises();
  const completedLessons = progress.completedLessons.size;
  const completedExercises = progress.completedExercises.size;
  const correctExercises = progress.correctExercises.size;
  const accuracy = completedExercises > 0 ? Math.round((correctExercises / completedExercises) * 100) : 0;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Welcome to Math Mastery</h1>
      <p className="text-[var(--color-text-muted)] mb-8">IB Mathematics HL — Analysis and Approaches</p>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard label="Level" value={progress.level.toString()} color="var(--color-gold)" />
        <StatCard label="Total XP" value={progress.xp.toString()} color="var(--color-primary)" />
        <StatCard label="Accuracy" value={`${accuracy}%`} color="var(--color-success)" />
        <StatCard label="Day Streak" value={progress.streak.toString()} color="var(--color-accent)" />
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <ProgressCard label="Topics" current={progress.masteredTopics.size} total={totalTopics} color="var(--color-secondary)" />
        <ProgressCard label="Lessons" current={completedLessons} total={totalLessons} color="var(--color-primary)" />
        <ProgressCard label="Exercises" current={correctExercises} total={totalExercises} color="var(--color-success)" />
      </div>

      {/* Exam Papers Banner */}
      <Link
        to="/exams"
        className="block bg-gradient-to-r from-[var(--color-primary)]/20 to-[var(--color-accent)]/20 border border-[var(--color-primary)]/30 rounded-xl p-5 mb-8 hover:border-[var(--color-primary)] transition-colors group"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold group-hover:text-[var(--color-primary-light)] transition">Exam Papers</h2>
            <p className="text-sm text-[var(--color-text-muted)]">Full timed practice papers — Paper 1 (no calc) & Paper 2 (calc). Get detailed feedback and explanations after each attempt.</p>
          </div>
          <span className="text-2xl text-[var(--color-primary-light)]">&rarr;</span>
        </div>
      </Link>

      {/* Chapter Cards */}
      <h2 className="text-xl font-semibold mb-4">Chapters</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {curriculum.map(ch => {
          const chLessons = ch.topics.flatMap(t => t.lessons);
          const chExercises = ch.topics.flatMap(t => t.lessons.flatMap(l => l.exercises));
          const done = chLessons.filter(l => progress.completedLessons.has(l.id)).length;
          const total = chLessons.length;
          const pct = total > 0 ? Math.round((done / total) * 100) : 0;
          const correct = chExercises.filter(e => progress.correctExercises.has(e.id)).length;

          return (
            <Link
              key={ch.id}
              to={`/chapter/${ch.id}`}
              className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-primary)] transition-colors group"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: ch.color + '22', color: ch.color }}>
                  {ch.number}
                </div>
                <div>
                  <h3 className="font-semibold group-hover:text-[var(--color-primary-light)] transition-colors">{ch.title}</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">{ch.subtitle}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: ch.color }} />
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">{pct}%</span>
              </div>
              <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
                <span>{ch.topics.length} topics</span>
                <span>{correct}/{chExercises.length} exercises</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4 text-center">
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      <p className="text-xs text-[var(--color-text-muted)] mt-1">{label}</p>
    </div>
  );
}

function ProgressCard({ label, current, total, color }: { label: string; current: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-4">
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-[var(--color-text-muted)]">{current}/{total}</span>
      </div>
      <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}
