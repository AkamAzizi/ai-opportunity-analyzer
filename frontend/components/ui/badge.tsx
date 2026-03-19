import { clsx } from "clsx";

type BadgeTone =
  | "slate"
  | "emerald"
  | "amber"
  | "rose"
  | "brand"
  | "industry"
  | "business"
  | "customer";

const toneClasses: Record<BadgeTone, string> = {
  slate: "border-border bg-white text-secondary",
  emerald: "border-success/30 bg-success/10 text-primary",
  amber: "border-warning/30 bg-warning/10 text-primary",
  rose: "border-warning/30 bg-warning/10 text-primary",
  brand: "border-accent/30 bg-accent/10 text-primary",
  industry: "border-blue-200 bg-blue-50 text-blue-700",
  business: "border-violet-200 bg-violet-50 text-violet-700",
  customer: "border-slate-200 bg-slate-100 text-slate-700"
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

