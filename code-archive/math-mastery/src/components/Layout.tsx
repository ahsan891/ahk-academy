import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { curriculum } from '../data/curriculum';
import type { Progress } from '../store/useStore';

interface LayoutProps {
  children: React.ReactNode;
  progress: Progress;
}

export default function Layout({ children, progress }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const xpInLevel = progress.xp % 100;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 overflow-hidden flex-shrink-0`}>
        <div className="w-72 h-full bg-[var(--color-bg-card)] border-r border-[var(--color-border)] flex flex-col">
          {/* Header */}
          <Link to="/" className="p-4 border-b border-[var(--color-border)] hover:bg-[var(--color-bg-hover)] transition">
            <h1 className="text-lg font-bold text-[var(--color-primary-light)]">Math Mastery</h1>
            <p className="text-xs text-[var(--color-text-muted)]">IB HL Analysis & Approaches</p>
          </Link>

          {/* XP Bar */}
          <div className="px-4 py-3 border-b border-[var(--color-border)]">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[var(--color-gold)] font-semibold">Level {progress.level}</span>
              <span className="text-[var(--color-text-muted)]">{xpInLevel}/100 XP</span>
            </div>
            <div className="h-2 bg-[var(--color-bg)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-xp-bar)] rounded-full transition-all duration-500" style={{ width: `${xpInLevel}%` }} />
            </div>
            <div className="flex justify-between mt-2 text-xs text-[var(--color-text-muted)]">
              <span>{progress.xp} XP total</span>
              <span>{progress.streak} day streak</span>
            </div>
          </div>

          {/* Exam Papers Link */}
          <Link
            to="/exams"
            className={`block px-4 py-3 border-b border-[var(--color-border)] transition-colors ${
              location.pathname.startsWith('/exam')
                ? 'bg-[var(--color-bg-hover)] text-[var(--color-accent)]'
                : 'hover:bg-[var(--color-bg-hover)] text-[var(--color-text-muted)]'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              <span className="text-sm font-semibold">Exam Papers</span>
            </div>
          </Link>

          {/* Chapter List */}
          <nav className="flex-1 overflow-y-auto py-2">
            {curriculum.map(ch => {
              const isActive = location.pathname.includes(`/chapter/${ch.id}`);
              const completedTopics = ch.topics.filter(t =>
                t.lessons.every(l => progress.completedLessons.has(l.id))
              ).length;
              const totalTopics = ch.topics.length;
              const pct = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

              return (
                <Link
                  key={ch.id}
                  to={`/chapter/${ch.id}`}
                  className={`block px-4 py-2.5 border-l-3 transition-colors ${
                    isActive
                      ? 'border-l-[var(--color-primary)] bg-[var(--color-bg-hover)]'
                      : 'border-l-transparent hover:bg-[var(--color-bg-hover)]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: ch.color + '22', color: ch.color }}>
                      {ch.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{ch.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1 bg-[var(--color-bg)] rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: ch.color }} />
                        </div>
                        <span className="text-[10px] text-[var(--color-text-muted)]">{pct}%</span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-12 bg-[var(--color-bg-card)] border-b border-[var(--color-border)] flex items-center px-4 gap-4 flex-shrink-0">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-3 text-sm">
            <span className="text-[var(--color-gold)]" title="Streak">{progress.streak} days</span>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
              Lvl {progress.level}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
