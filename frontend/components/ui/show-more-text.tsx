"use client";

import { useMemo, useState } from "react";
import { clsx } from "clsx";

function splitToBullets(text: string): string[] {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  if (!normalized) return [];

  const lines = normalized
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  // If it already looks like bullet lines, keep each line.
  const looksBulleted = lines.some((l) => /^[-*•]\s+/.test(l));
  if (looksBulleted) return lines.map((l) => l.replace(/^[-*•]\s+/, ""));

  // Otherwise split into sentences (lightweight heuristic).
  const sentences = normalized
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return sentences.length >= 2 ? sentences : lines;
}

export function ShowMoreText({
  text,
  collapsedLines = 3,
  asBullets = true,
  className
}: {
  text: string;
  collapsedLines?: number;
  asBullets?: boolean;
  className?: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const bullets = useMemo(() => splitToBullets(text), [text]);

  if (!text?.trim()) return null;

  const hasOverflow = bullets.length > collapsedLines;
  const visible = expanded ? bullets : bullets.slice(0, collapsedLines);

  return (
    <div className={clsx("space-y-2", className)}>
      {asBullets ? (
        <ul className="space-y-1 text-xs leading-relaxed text-primary">
          {visible.map((b, idx) => (
            <li key={`${b}-${idx}`} className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-secondary" />
              <span className="min-w-0">{b}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs leading-relaxed text-primary">
          {expanded ? text : visible.join(" ")}
        </p>
      )}

      {hasOverflow ? (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="text-xs font-medium text-secondary underline decoration-border underline-offset-4 hover:text-primary"
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      ) : null}
    </div>
  );
}

