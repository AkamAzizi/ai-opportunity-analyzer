import { ReactNode } from "react";
import { clsx } from "clsx";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function SectionCard({
  title,
  subtitle,
  children,
  className
}: SectionCardProps) {
  return (
    <section
      className={clsx(
        "rounded-xl border border-border bg-card p-4 transition-transform duration-200 hover:-translate-y-1 sm:p-6 lg:p-8",
        className
      )}
    >
      <header className="mb-3 space-y-1">
        <h2 className="text-base font-semibold tracking-tight text-primary">
          {title}
        </h2>
        {subtitle ? (
          <p className="text-xs leading-relaxed text-secondary">{subtitle}</p>
        ) : null}
      </header>
      <div className="text-sm leading-relaxed text-primary">{children}</div>
    </section>
  );
}

