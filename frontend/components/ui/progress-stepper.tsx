import { Check, CircleDashed, Loader2 } from "lucide-react";
import { clsx } from "clsx";

export type PipelineStage = "scraping" | "analyzing" | "generating" | "architecting";

const orderedStages: PipelineStage[] = [
  "scraping",
  "analyzing",
  "generating",
  "architecting"
];

const labels: Record<PipelineStage, string> = {
  scraping: "Scraping website",
  analyzing: "Analyzing business model",
  generating: "Generating opportunities",
  architecting: "Architecting MVP"
};

export function ProgressStepper({
  activeStage
}: {
  activeStage: PipelineStage | null;
}) {
  if (!activeStage) return null;

  const activeIndex = orderedStages.indexOf(activeStage);

  return (
    <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
      <ol className="grid gap-3 sm:grid-cols-4">
        {orderedStages.map((stage, index) => {
          const isDone = index < activeIndex;
          const isActive = index === activeIndex;

          return (
            <li
              key={stage}
              className={clsx(
                "flex items-center gap-2 rounded-lg border px-3 py-2 text-xs",
                isActive
                  ? "border-accent/40 bg-accent/5"
                  : isDone
                    ? "border-success/30 bg-success/5"
                    : "border-border bg-canvas"
              )}
            >
              {isDone ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : isActive ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-accent" />
              ) : (
                <CircleDashed className="h-3.5 w-3.5 text-secondary" />
              )}
              <span className={clsx("font-medium", isActive ? "text-primary" : "text-secondary")}>
                {labels[stage]}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

