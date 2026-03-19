import type { AnalysisResponse } from "@/types/analysis";
import { SectionCard } from "./section-card";
import { OpportunityCard } from "@/components/opportunity-card";
import { Badge } from "@/components/ui/badge";
import { ShowMoreText } from "@/components/ui/show-more-text";
import { Collapsible } from "@/components/ui/collapsible";

interface AnalysisResultProps {
  data: AnalysisResponse | null;
}

function bucketForOpportunity(opp: {
  complexity: string;
  business_value: string;
}): "Quick Wins" | "Mid-term Opportunities" | "Strategic Bets" {
  const c = opp.complexity.toLowerCase();
  const v = opp.business_value.toLowerCase();

  const low = c.includes("low") || c.includes("easy");
  const high = c.includes("high") || c.includes("hard");
  const transformative = v.includes("transform") || v.includes("high");

  if (low && !transformative) return "Quick Wins";
  if (high || transformative) return "Strategic Bets";
  return "Mid-term Opportunities";
}

export function AnalysisResult({ data }: AnalysisResultProps) {
  if (!data) {
    return (
      <div className="rounded-xl border border-dashed border-slate-800 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
        Paste a company website and run an analysis to see a structured AI
        opportunity report here.
      </div>
    );
  }

  const {
    company_profile,
    ai_opportunities,
    recommended_architecture,
    impact_assessment,
    assumptions,
    confidence_notes
  } = data;

  const grouped = ai_opportunities.reduce(
    (acc, opp) => {
      const key = bucketForOpportunity(opp);
      acc[key].push(opp);
      return acc;
    },
    {
      "Quick Wins": [] as typeof ai_opportunities,
      "Mid-term Opportunities": [] as typeof ai_opportunities,
      "Strategic Bets": [] as typeof ai_opportunities
    }
  );

  const keyTakeaways = [
    company_profile.summary,
    impact_assessment.summary,
    grouped["Quick Wins"][0]?.title
      ? `Fastest win: ${grouped["Quick Wins"][0].title}`
      : ai_opportunities[0]?.title
        ? `Top opportunity: ${ai_opportunities[0].title}`
        : "Focus on one pilot that can ship within 4–6 weeks."
  ].filter(Boolean);

  const firstPilot =
    grouped["Quick Wins"][0] ||
    ai_opportunities[0] ||
    null;

  return (
    <div className="space-y-6">
      <SectionCard
        title="Executive Summary"
        subtitle="A crisp, decision-ready view"
      >
        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
              Key takeaways
            </p>
            <ul className="mt-2 space-y-2 text-sm leading-relaxed text-primary">
              {keyTakeaways.slice(0, 3).map((t, idx) => (
                <li key={`${t}-${idx}`} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="min-w-0">
                    <span className="line-clamp-2">{t}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-canvas p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
              Recommended first pilot
            </p>
            {firstPilot ? (
              <div className="mt-2 space-y-2">
                <p className="text-sm font-semibold text-primary">
                  {firstPilot.title}
                </p>
                <p className="line-clamp-2 text-xs leading-relaxed text-secondary">
                  {firstPilot.description}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Badge tone="brand">Pilot-ready</Badge>
                  <Badge tone="slate">4–6 weeks MVP</Badge>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-xs text-secondary">
                Run an analysis to get a pilot recommendation.
              </p>
            )}

            <div className="mt-4 border-t border-border pt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
                Expected impact
              </p>
              <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-secondary">
                {impact_assessment.summary}
              </p>
            </div>
          </div>
        </div>
      </SectionCard>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
        <SectionCard
          title="Company profile"
          subtitle="Grounded in public website content"
        >
          <div className="space-y-2 text-sm">
            <p className="font-medium text-primary">
              {company_profile.name || "—"}
            </p>
            <ShowMoreText text={company_profile.summary} collapsedLines={2} />
            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs text-secondary">
              <div>
                <dt className="text-secondary">Industry</dt>
                <dd className="mt-0.5 text-primary">
                  {company_profile.industry || "Not clear"}
                </dd>
              </div>
              <div>
                <dt className="text-secondary">Business model</dt>
                <dd className="mt-0.5 text-primary">
                  {company_profile.business_model || "Not clear"}
                </dd>
              </div>
              <div>
                <dt className="text-secondary">Customer type</dt>
                <dd className="mt-0.5 text-primary">
                  {company_profile.customer_type || "Not clear"}
                </dd>
              </div>
            </dl>
          </div>
        </SectionCard>

        <SectionCard
          title="AI opportunities"
          subtitle="Segmented portfolio of initiatives"
        >
          <div className="space-y-6">
            {(
              [
                "Quick Wins",
                "Mid-term Opportunities",
                "Strategic Bets"
              ] as const
            ).map((group) => (
              <div key={group} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-primary">
                      {group}
                    </h3>
                    <p className="text-xs leading-relaxed text-secondary">
                      {group === "Quick Wins"
                        ? "Fast pilots with clear ROI"
                        : group === "Mid-term Opportunities"
                          ? "Requires moderate effort"
                          : "High impact, longer horizon"}
                    </p>
                  </div>
                  <Badge tone="slate">{grouped[group].length}</Badge>
                </div>

                {grouped[group].length ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {grouped[group].map((opp, idx) => (
                      <OpportunityCard
                        key={`${group}-${opp.title}-${idx}`}
                        opportunity={opp}
                        highlighted={idx === 0}
                      />
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-secondary">
                    No items landed in this bucket.
                  </p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Impact assessment"
          subtitle="Where AI is likely to move the needle"
        >
          <ShowMoreText text={impact_assessment.summary} collapsedLines={2} />
          <div className="mt-3 space-y-3">
            {impact_assessment.impact_areas.map((area, idx) => (
              <div
                key={`${area.area}-${idx}`}
                className="rounded-xl border border-border bg-canvas p-5 text-xs"
              >
                <p className="font-semibold text-primary">{area.area}</p>
                <div className="mt-2 grid gap-2">
                  <ShowMoreText text={area.description} collapsedLines={2} />
                  <div className="text-xs leading-relaxed text-secondary">
                    <span className="font-medium text-secondary">
                      Expected impact:
                    </span>{" "}
                    <span className="line-clamp-2 text-primary">
                      {area.expected_impact}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="space-y-4">
        <SectionCard
          title="Recommended AI architecture"
          subtitle="High-level, implementation-ready view"
        >
          <ShowMoreText text={recommended_architecture.overview} collapsedLines={2} />
          <ul className="mt-3 list-disc space-y-1 pl-4 text-xs text-slate-200">
            {recommended_architecture.components.map((c, idx) => (
              <li key={`${c}-${idx}`}>{c}</li>
            ))}
          </ul>
          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Why this shape
            </p>
            <ShowMoreText text={recommended_architecture.reasoning} collapsedLines={3} />
          </div>
        </SectionCard>

      </div>
      </div>

      <Collapsible
        title="Assumptions & confidence"
        subtitle="What the model had to guess (collapsed by default)"
        defaultOpen={false}
      >
        <div className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
              Assumptions
            </p>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-primary">
              {assumptions.map((a, idx) => (
                <li key={`${a}-${idx}`} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-secondary" />
                  <span className="min-w-0">{a}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="border-t border-border pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
              Confidence notes
            </p>
            <ShowMoreText text={confidence_notes} collapsedLines={3} />
          </div>
        </div>
      </Collapsible>
    </div>
  );
}

