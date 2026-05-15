"use client";

import Link from "next/link";
import { BookOpen, Dumbbell, ClipboardList, CheckCircle2 } from "lucide-react";

interface TopicTabsProps {
  activeTab: string;
  basePath: string;
  lessonRead: boolean;
  exerciseCount: number;
  hasAttempted: boolean;
}

export function TopicTabs({
  activeTab,
  basePath,
  lessonRead,
  exerciseCount,
  hasAttempted,
}: TopicTabsProps) {
  const tabs = [
    {
      key: "learn",
      label: "Learn",
      icon: <BookOpen size={16} />,
      indicator: lessonRead ? (
        <CheckCircle2 size={14} className="text-green-500" />
      ) : null,
    },
    {
      key: "practice",
      label: "Practice",
      icon: <Dumbbell size={16} />,
      indicator:
        exerciseCount === 0 ? (
          <span className="text-[10px] text-gray-400">(0)</span>
        ) : hasAttempted ? (
          <CheckCircle2 size={14} className="text-green-500" />
        ) : null,
    },
    {
      key: "quiz",
      label: "Quiz",
      icon: <ClipboardList size={16} />,
      indicator: null,
    },
  ];

  return (
    <div className="flex gap-1 border-b border-gray-200">
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={`${basePath}?tab=${tab.key}`}
          className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === tab.key
              ? "border-indigo-600 text-indigo-700"
              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
          }`}
        >
          {tab.icon}
          {tab.label}
          {tab.indicator}
        </Link>
      ))}
    </div>
  );
}
