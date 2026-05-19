import { useParams, Link } from 'react-router-dom';
import { curriculum } from '../data/curriculum';
import type { Progress } from '../store/useStore';

interface Props {
  progress: Progress;
}

export default function ChapterPage({ progress }: Props) {
  const { chapterId } = useParams();
  const chapter = curriculum.find(c => c.id === chapterId);

  if (!chapter) {
    return <div className="text-center py-12"><p className="text-[var(--color-text-muted)]">Chapter not found</p></div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)] transition mb-4 inline-block">
        &larr; Back to Dashboard
      </Link>

      <div className="flex items-center gap-4 mb-6">
        <div className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold" style={{ backgroundColor: chapter.color + '22', color: chapter.color }}>
          {chapter.number}
        </div>
        <div>
          <h1 className="text-2xl font-bold">{chapter.title}</h1>
          <p className="text-[var(--color-text-muted)]">{chapter.subtitle}</p>
        </div>
      </div>

      <div className="space-y-4">
        {chapter.topics.map(topic => {
          const totalExercises = topic.lessons.flatMap(l => l.exercises).length;
          const correctExercises = topic.lessons.flatMap(l => l.exercises).filter(e => progress.correctExercises.has(e.id)).length;
          const allLessonsDone = topic.lessons.every(l => progress.completedLessons.has(l.id));
          const isMastered = progress.masteredTopics.has(topic.id);

          return (
            <Link
              key={topic.id}
              to={`/topic/${topic.id}`}
              className="block bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-primary)] transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono px-2 py-0.5 rounded" style={{ backgroundColor: chapter.color + '22', color: chapter.color }}>
                      {topic.number}
                    </span>
                    {isMastered && <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-success)] text-white">Mastered</span>}
                    {allLessonsDone && !isMastered && <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-accent)] text-black">Completed</span>}
                  </div>
                  <h3 className="text-lg font-semibold group-hover:text-[var(--color-primary-light)] transition">{topic.title}</h3>
                  <div className="flex gap-4 mt-2 text-xs text-[var(--color-text-muted)]">
                    <span>{topic.lessons.length} lessons</span>
                    <span>{correctExercises}/{totalExercises} exercises correct</span>
                  </div>
                </div>
                <div className="flex flex-col items-center gap-1">
                  {topic.lessons.map(l => {
                    const done = progress.completedLessons.has(l.id);
                    const color = l.difficulty === 'beginner' ? 'var(--color-success)' : l.difficulty === 'intermediate' ? 'var(--color-accent)' : l.difficulty === 'advanced' ? 'var(--color-danger)' : 'var(--color-primary)';
                    return (
                      <div
                        key={l.id}
                        className="w-3 h-3 rounded-full border-2"
                        style={{
                          borderColor: color,
                          backgroundColor: done ? color : 'transparent'
                        }}
                        title={`${l.difficulty}: ${done ? 'done' : 'not done'}`}
                      />
                    );
                  })}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
