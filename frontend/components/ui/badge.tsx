import { clsx } from "clsx";

type BadgeTone = "slate" | "emerald" | "amber" | "rose" | "brand";

const toneClasses: Record<BadgeTone, string> = {
  slate: "border-border bg-canvas text-secondary",
  emerald: "border-border bg-canvas text-secondary",
  amber: "border-border bg-canvas text-secondary",
  rose: "border-border bg-canvas text-secondary",
  brand: "border-accent/30 bg-accent/10 text-primary"
};

export function Badge({
  children,
  tone = "slate",
  className
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium leading-none",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

