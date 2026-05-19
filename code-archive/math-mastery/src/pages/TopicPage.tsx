import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { curriculum } from '../data/curriculum';
import type { Lesson } from '../data/curriculum';
import type { Progress } from '../store/useStore';
import ExerciseCard from '../components/ExerciseCard';
import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface Props {
  progress: Progress;
  completeLesson: (id: string) => void;
  completeExercise: (id: string, correct: boolean) => void;
  masterTopic: (id: string) => void;
}

export default function TopicPage({ progress, completeLesson, completeExercise, masterTopic }: Props) {
  const { topicId } = useParams();
  const [activeLesson, setActiveLesson] = useState<string | null>(null);
  const [showExercises, setShowExercises] = useState(false);

  let topic = null;
  let chapter = null;
  for (const ch of curriculum) {
    const t = ch.topics.find(t => t.id === topicId);
    if (t) { topic = t; chapter = ch; break; }
  }

  if (!topic || !chapter) {
    return <div className="text-center py-12"><p className="text-[var(--color-text-muted)]">Topic not found</p></div>;
  }

  const currentLesson = topic.lessons.find(l => l.id === activeLesson) || null;
  const allLessonsDone = topic.lessons.every(l => progress.completedLessons.has(l.id));
  const allExercisesCorrect = topic.lessons.flatMap(l => l.exercises).every(e => progress.correctExercises.has(e.id));
  const isMastered = progress.masteredTopics.has(topic.id);

  if (allLessonsDone && allExercisesCorrect && !isMastered) {
    masterTopic(topic.id);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to={`/chapter/${chapter.id}`} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)] transition mb-4 inline-block">
        &larr; Back to {chapter.title}
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <span className="text-sm font-mono px-2 py-1 rounded" style={{ backgroundColor: chapter.color + '22', color: chapter.color }}>
          {topic.number}
        </span>
        <h1 className="text-2xl font-bold">{topic.title}</h1>
        {isMastered && <span className="text-xs px-3 py-1 rounded-full bg-[var(--color-success)] text-white font-semibold">MASTERED</span>}
      </div>

      {/* Difficulty Tabs */}
      <div className="flex gap-2 mb-6">
        {topic.lessons.map(l => {
          const done = progress.completedLessons.has(l.id);
          const isActive = activeLesson === l.id;
          const colors: Record<string, string> = {
            beginner: 'var(--color-success)',
            intermediate: 'var(--color-accent)',
            advanced: 'var(--color-danger)',
            exam: 'var(--color-primary)'
          };
          const color = colors[l.difficulty];

          return (
            <button
              key={l.id}
              onClick={() => { setActiveLesson(l.id); setShowExercises(false); }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border-2 ${
                isActive ? 'text-white' : 'hover:opacity-80'
              }`}
              style={{
                borderColor: color,
                backgroundColor: isActive ? color : 'transparent',
                color: isActive ? 'white' : color
              }}
            >
              {done && <span className="mr-1">&#10003;</span>}
              {l.difficulty.charAt(0).toUpperCase() + l.difficulty.slice(1)}
            </button>
          );
        })}
      </div>

      {/* No lesson selected */}
      {!currentLesson && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-8 text-center">
          <p className="text-[var(--color-text-muted)] mb-4">Choose a difficulty level above to start learning!</p>
          <p className="text-sm text-[var(--color-text-muted)]">Start with <strong>Beginner</strong> if you're new to this topic, then work your way up.</p>
        </div>
      )}

      {/* Lesson Content */}
      {currentLesson && !showExercises && (
        <LessonView
          lesson={currentLesson}
          done={progress.completedLessons.has(currentLesson.id)}
          onComplete={() => completeLesson(currentLesson.id)}
          onStartExercises={() => setShowExercises(true)}
          chapterColor={chapter.color}
        />
      )}

      {/* Exercises */}
      {currentLesson && showExercises && (
        <ExercisesView
          lesson={currentLesson}
          progress={progress}
          completeExercise={completeExercise}
          onBack={() => setShowExercises(false)}
          chapterColor={chapter.color}
        />
      )}
    </div>
  );
}

function LessonView({ lesson, done, onComplete, onStartExercises, chapterColor }: {
  lesson: Lesson; done: boolean; onComplete: () => void; onStartExercises: () => void; chapterColor: string;
}) {
  return (
    <div className="space-y-6">
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: chapterColor }}>{lesson.title}</h2>
        <div className="space-y-3">
          {lesson.content.map((para, i) => (
            <p key={i} className="text-[var(--color-text)] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: para.replace(/\*\*(.*?)\*\*/g, '<strong class="text-white">$1</strong>') }}
            />
          ))}
        </div>
      </div>

      {/* Key Formulas */}
      {lesson.keyFormulas && lesson.keyFormulas.length > 0 && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Key Formulas</h3>
          <div className="space-y-2">
            {lesson.keyFormulas.map((f, i) => (
              <div key={i} className="bg-[var(--color-bg)] rounded-lg p-3 text-center">
                <InlineMath math={f} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Examples */}
      {lesson.examples && lesson.examples.length > 0 && (
        <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-6">
          <h3 className="text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider mb-3">Worked Examples</h3>
          {lesson.examples.map((ex, i) => (
            <div key={i} className="mb-4 last:mb-0">
              <p className="font-medium mb-2" style={{ color: chapterColor }}>{ex.problem}</p>
              <p className="text-[var(--color-text)] bg-[var(--color-bg)] rounded-lg p-3">{ex.solution}</p>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!done && (
          <button
            onClick={onComplete}
            className="px-6 py-2.5 rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--color-success)' }}
          >
            Mark as Completed (+25 XP)
          </button>
        )}
        <button
          onClick={onStartExercises}
          className="px-6 py-2.5 rounded-lg font-medium text-white transition-colors"
          style={{ backgroundColor: chapterColor }}
        >
          Practice Exercises ({lesson.exercises.length})
        </button>
      </div>
    </div>
  );
}

function ExercisesView({ lesson, progress, completeExercise, onBack, chapterColor }: {
  lesson: Lesson; progress: Progress; completeExercise: (id: string, correct: boolean) => void;
  onBack: () => void; chapterColor: string;
}) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const exercises = lesson.exercises;
  const correct = exercises.filter(e => progress.correctExercises.has(e.id)).length;

  if (currentIdx >= exercises.length) {
    return (
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border)] rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Exercise Set Complete!</h2>
        <p className="text-4xl font-bold mb-2" style={{ color: chapterColor }}>{correct}/{exercises.length}</p>
        <p className="text-[var(--color-text-muted)] mb-6">correct answers</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => setCurrentIdx(0)} className="px-5 py-2 rounded-lg border border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] transition">
            Retry
          </button>
          <button onClick={onBack} className="px-5 py-2 rounded-lg text-white transition" style={{ backgroundColor: chapterColor }}>
            Back to Lesson
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button onClick={onBack} className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary-light)] transition">
          &larr; Back to lesson
        </button>
        <span className="text-sm text-[var(--color-text-muted)]">
          Question {currentIdx + 1} of {exercises.length}
        </span>
      </div>
      <div className="mb-4 h-1 bg-[var(--color-bg-card)] rounded-full overflow-hidden">
        <div className="h-full transition-all rounded-full" style={{ width: `${((currentIdx + 1) / exercises.length) * 100}%`, backgroundColor: chapterColor }} />
      </div>
      <ExerciseCard
        exercise={exercises[currentIdx]}
        onAnswer={(correct) => {
          completeExercise(exercises[currentIdx].id, correct);
          setTimeout(() => setCurrentIdx(i => i + 1), 1500);
        }}
        alreadyCorrect={progress.correctExercises.has(exercises[currentIdx].id)}
      />
    </div>
  );
}
