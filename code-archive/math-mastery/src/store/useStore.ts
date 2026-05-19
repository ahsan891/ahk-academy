import { useState, useEffect, useCallback } from 'react';

export interface Progress {
  completedLessons: Set<string>;
  completedExercises: Set<string>;
  correctExercises: Set<string>;
  xp: number;
  level: number;
  streak: number;
  lastActiveDate: string;
  masteredTopics: Set<string>;
}

const XP_PER_LEVEL = 100;
const XP_CORRECT = 10;
const XP_LESSON = 25;
const XP_MASTERY = 50;

function loadProgress(): Progress {
  try {
    const saved = localStorage.getItem('math-mastery-progress');
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        completedLessons: new Set(parsed.completedLessons || []),
        completedExercises: new Set(parsed.completedExercises || []),
        correctExercises: new Set(parsed.correctExercises || []),
        xp: parsed.xp || 0,
        level: parsed.level || 1,
        streak: parsed.streak || 0,
        lastActiveDate: parsed.lastActiveDate || '',
        masteredTopics: new Set(parsed.masteredTopics || []),
      };
    }
  } catch { /* ignore */ }
  return {
    completedLessons: new Set(),
    completedExercises: new Set(),
    correctExercises: new Set(),
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: '',
    masteredTopics: new Set(),
  };
}

function saveProgress(p: Progress) {
  localStorage.setItem('math-mastery-progress', JSON.stringify({
    completedLessons: [...p.completedLessons],
    completedExercises: [...p.completedExercises],
    correctExercises: [...p.correctExercises],
    xp: p.xp,
    level: p.level,
    streak: p.streak,
    lastActiveDate: p.lastActiveDate,
    masteredTopics: [...p.masteredTopics],
  }));
}

export function useStore() {
  const [progress, setProgress] = useState<Progress>(loadProgress);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (progress.lastActiveDate !== today) {
      setProgress(p => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        const newStreak = p.lastActiveDate === yesterdayStr ? p.streak + 1 : (p.lastActiveDate === today ? p.streak : 1);
        return { ...p, streak: newStreak, lastActiveDate: today };
      });
    }
  }, []);

  const addXP = useCallback((amount: number) => {
    setProgress(p => {
      const newXP = p.xp + amount;
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      return { ...p, xp: newXP, level: newLevel };
    });
  }, []);

  const completeLesson = useCallback((lessonId: string) => {
    setProgress(p => {
      if (p.completedLessons.has(lessonId)) return p;
      const newCompleted = new Set(p.completedLessons);
      newCompleted.add(lessonId);
      const newXP = p.xp + XP_LESSON;
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      return { ...p, completedLessons: newCompleted, xp: newXP, level: newLevel };
    });
  }, []);

  const completeExercise = useCallback((exerciseId: string, correct: boolean) => {
    setProgress(p => {
      const newCompleted = new Set(p.completedExercises);
      newCompleted.add(exerciseId);
      const newCorrect = new Set(p.correctExercises);
      if (correct) newCorrect.add(exerciseId);
      const xpGain = correct && !p.correctExercises.has(exerciseId) ? XP_CORRECT : 0;
      const newXP = p.xp + xpGain;
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      return { ...p, completedExercises: newCompleted, correctExercises: newCorrect, xp: newXP, level: newLevel };
    });
  }, []);

  const masterTopic = useCallback((topicId: string) => {
    setProgress(p => {
      if (p.masteredTopics.has(topicId)) return p;
      const newMastered = new Set(p.masteredTopics);
      newMastered.add(topicId);
      const newXP = p.xp + XP_MASTERY;
      const newLevel = Math.floor(newXP / XP_PER_LEVEL) + 1;
      return { ...p, masteredTopics: newMastered, xp: newXP, level: newLevel };
    });
  }, []);

  const resetProgress = useCallback(() => {
    const fresh: Progress = {
      completedLessons: new Set(),
      completedExercises: new Set(),
      correctExercises: new Set(),
      xp: 0,
      level: 1,
      streak: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      masteredTopics: new Set(),
    };
    setProgress(fresh);
  }, []);

  return { progress, addXP, completeLesson, completeExercise, masterTopic, resetProgress };
}
