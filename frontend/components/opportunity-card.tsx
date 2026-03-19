"use client";

import { useMemo, useState } from "react";
import type { AIOpportunity } from "@/types/analysis";
import { Badge } from "@/components/ui/badge";
import { ShowMoreText } from "@/components/ui/show-more-text";

function toneForComplexity(value: string): "emerald" | "amber" | "rose" | "slate" {
  const v = value.toLowerCase();
  if (v.includes("low") || v.includes("easy")) return "emerald";
  if (v.includes("med")) return "amber";
  if (v.includes("high") || v.includes("hard")) return "rose";
  return "slate";
}

function toneForBusinessValue(value: string): "emerald" | "amber" | "brand" | "slate" {
  const v = value.toLowerCase();
  if (v.includes("incremental") || v.includes("low")) return "slate";
  if (v.includes("moderate") || v.includes("medium")) return "amber";
  if (v.includes("transform") || v.includes("high")) return "brand";
  return "slate";
}

function oneLine(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

export function OpportunityCard({
  opportunity,
  highlighted = false
}: {
  opportunity: AIOpportunity;
  highlighted?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const description = useMemo(() => oneLine(opportunity.description), [opportunity.description]);

  const containerClasses = [
    "rounded-xl border bg-card",
    highlighted ? "border-accent/40 p-6" : "border-border p-5"
  ].join(" ");

  return (
    <div className={containerClasses}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {highlighted ? (
            <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-accent">
              Recommended
            </p>
          ) : null}
          <h4
            className={[
              "font-semibold text-primary",
              highlighted ? "text-sm" : "text-[13px]"
            ].join(" ")}
          >
            {opportunity.title}
          </h4>
          <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-secondary">
            {description}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone={toneForComplexity(opportunity.complexity)}>
          Complexity: {opportunity.complexity}
        </Badge>
        <Badge tone={toneForBusinessValue(opportunity.business_value)}>
          Value: {opportunity.business_value}
        </Badge>
      </div>

      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-4 text-xs font-medium text-secondary hover:text-primary"
      >
        {expanded ? "Hide details" : "View details \u2192"}
      </button>

      {expanded ? (
        <div className="mt-3 space-y-3">
          <ShowMoreText text={opportunity.why_it_fits} collapsedLines={3} />
          <ShowMoreText text={opportunity.description} collapsedLines={3} />
        </div>
      ) : null}
    </div>
  );
}

