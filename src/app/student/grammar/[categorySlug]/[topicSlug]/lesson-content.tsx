"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, BookOpen, Loader2 } from "lucide-react";

interface LessonContentProps {
  content: string;
  topicId: string;
  lessonRead: boolean;
}

function renderMarkdown(text: string) {
  // Split content by lines and render with basic formatting
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (!trimmed) {
      elements.push(<div key={i} className="h-3" />);
      return;
    }

    // ## Headers
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="mt-6 mb-3 text-xl font-bold text-gray-900 first:mt-0"
        >
          {renderInline(trimmed.slice(3))}
        </h2>
      );
      return;
    }

    // ### Sub-headers
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="mt-5 mb-2 text-lg font-semibold text-gray-800"
        >
          {renderInline(trimmed.slice(4))}
        </h3>
      );
      return;
    }

    // # Large headers
    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1
          key={i}
          className="mt-6 mb-3 text-2xl font-bold text-gray-900 first:mt-0"
        >
          {renderInline(trimmed.slice(2))}
        </h1>
      );
      return;
    }

    // Bullet points
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      elements.push(
        <li key={i} className="ml-4 list-disc text-sm text-gray-700 leading-relaxed">
          {renderInline(trimmed.slice(2))}
        </li>
      );
      return;
    }

    // Numbered lists
    const numberedMatch = trimmed.match(/^(\d+)\.\s(.+)/);
    if (numberedMatch) {
      elements.push(
        <li
          key={i}
          className="ml-4 list-decimal text-sm text-gray-700 leading-relaxed"
        >
          {renderInline(numberedMatch[2])}
        </li>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-sm text-gray-700 leading-relaxed">
        {renderInline(trimmed)}
      </p>
    );
  });

  return elements;
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold** and *italic* patterns
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let keyCounter = 0;

  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    if (boldMatch && boldMatch.index !== undefined) {
      if (boldMatch.index > 0) {
        parts.push(
          <span key={keyCounter++}>
            {remaining.slice(0, boldMatch.index)}
          </span>
        );
      }
      parts.push(
        <strong key={keyCounter++} className="font-semibold text-gray-900">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch.index + boldMatch[0].length);
      continue;
    }

    // Italic: *text*
    const italicMatch = remaining.match(/\*(.+?)\*/);
    if (italicMatch && italicMatch.index !== undefined) {
      if (italicMatch.index > 0) {
        parts.push(
          <span key={keyCounter++}>
            {remaining.slice(0, italicMatch.index)}
          </span>
        );
      }
      parts.push(
        <em key={keyCounter++} className="italic text-gray-600">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.slice(italicMatch.index + italicMatch[0].length);
      continue;
    }

    // Inline code: `text`
    const codeMatch = remaining.match(/`(.+?)`/);
    if (codeMatch && codeMatch.index !== undefined) {
      if (codeMatch.index > 0) {
        parts.push(
          <span key={keyCounter++}>
            {remaining.slice(0, codeMatch.index)}
          </span>
        );
      }
      parts.push(
        <code
          key={keyCounter++}
          className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono text-indigo-700"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch.index + codeMatch[0].length);
      continue;
    }

    // No more patterns, push the rest
    parts.push(<span key={keyCounter++}>{remaining}</span>);
    break;
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

export function LessonContent({
  content,
  topicId,
  lessonRead: initialLessonRead,
}: LessonContentProps) {
  const [lessonRead, setLessonRead] = useState(initialLessonRead);
  const [marking, setMarking] = useState(false);

  const handleMarkAsRead = async () => {
    setMarking(true);
    try {
      const res = await fetch("/api/grammar/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topicId, lessonRead: true }),
      });
      if (res.ok) {
        setLessonRead(true);
      }
    } catch {
      // Silently fail
    } finally {
      setMarking(false);
    }
  };

  return (
    <div>
      {/* Rendered content */}
      <div className="prose-like space-y-1">{renderMarkdown(content)}</div>

      {/* Mark as Read button */}
      <div className="mt-8 border-t pt-6">
        {lessonRead ? (
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle2 size={20} />
            <span className="font-medium">Lesson Complete</span>
          </div>
        ) : (
          <Button onClick={handleMarkAsRead} disabled={marking}>
            {marking ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Marking...
              </>
            ) : (
              <>
                <BookOpen size={16} className="mr-2" />
                Mark as Read
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
