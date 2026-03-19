"use client";

import { useId, useState } from "react";
import { clsx } from "clsx";

export function Collapsible({
  title,
  subtitle,
  defaultOpen = false,
  right,
  children,
  className
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  right?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <section
      className={clsx(
        "rounded-xl border border-border bg-card",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={contentId}
        className="flex w-full items-start justify-between gap-4 px-6 py-5 text-left"
      >
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-primary">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 text-xs leading-relaxed text-secondary">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-3">
          {right}
          <span className="mt-0.5 text-xs text-secondary">
            {open ? "Hide" : "Show"}
          </span>
        </div>
      </button>

      <div id={contentId} className={clsx(open ? "block" : "hidden")}>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </section>
  );
}

