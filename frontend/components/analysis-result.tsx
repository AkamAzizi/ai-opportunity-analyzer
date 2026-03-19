import type { AnalysisResponse } from "@/types/analysis";
import { motion } from "framer-motion";
import { AlertTriangle, Database, Sparkles, Workflow } from "lucide-react";
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
      <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center text-sm text-secondary">
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
  const confidenceScore = (() => {
    const notes = confidence_notes.toLowerCase();
    if (notes.includes("high")) return 5;
    if (notes.includes("medium")) return 3;
    if (notes.includes("low")) return 2;
    return 4;
  })();

  const container = {
    hidden: { opacity: 0, y: 12 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        duration: 0.35
      }
    }
  };
  const item = {
    hidden: { opacity: 0, y: 14 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <SectionCard title="Executive Summary" subtitle="Decision-ready snapshot for leadership">
          <div className="rounded-xl bg-slate-50 p-4 sm:p-6 lg:p-10">
            <p className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
              {company_profile.name || "Company"}
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-secondary">
              {company_profile.summary}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {company_profile.industry ? <Badge tone="industry">{company_profile.industry}</Badge> : null}
              {company_profile.business_model ? <Badge tone="business">{company_profile.business_model}</Badge> : null}
              {company_profile.customer_type ? <Badge tone="customer">{company_profile.customer_type}</Badge> : null}
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
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
              <div className="sticky top-3 rounded-xl border border-border bg-white p-5">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
                  Recommended first pilot
                </p>
                {firstPilot ? (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm font-semibold text-primary">{firstPilot.title}</p>
                    <p className="line-clamp-2 text-xs leading-relaxed text-secondary">
                      {firstPilot.description}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Badge tone="brand">Pilot-ready</Badge>
                      <Badge tone="slate">4–6 weeks MVP</Badge>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </SectionCard>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <motion.div variants={item}>
            <SectionCard title="AI opportunities" subtitle="Segmented portfolio of initiatives">
              <div className="space-y-6">
                {(["Quick Wins", "Mid-term Opportunities", "Strategic Bets"] as const).map(
                  (group) => (
                    <div key={group} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-primary">{group}</h3>
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
                        <div className="grid gap-5 sm:grid-cols-2">
                          {grouped[group].map((opp, idx) => (
                            <OpportunityCard
                              key={`${group}-${opp.title}-${idx}`}
                              opportunity={opp}
                              highlighted={idx === 0}
                              bucket={group}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-secondary">No items landed in this bucket.</p>
                      )}
                    </div>
                  )
                )}
              </div>
            </SectionCard>
          </motion.div>

          <motion.div variants={item}>
            <SectionCard title="Impact assessment" subtitle="Where AI is likely to move the needle">
              <ShowMoreText text={impact_assessment.summary} collapsedLines={2} />
              <div className="mt-4 space-y-4">
                {impact_assessment.impact_areas.map((area, idx) => (
                  <div
                    key={`${area.area}-${idx}`}
                    className="rounded-xl border border-border bg-white p-4 text-xs"
                  >
                    <p className="font-semibold text-primary">{area.area}</p>
                    <div className="mt-2 grid gap-2">
                      <ShowMoreText text={area.description} collapsedLines={2} />
                      <div className="text-xs leading-relaxed text-secondary">
                        <span className="font-medium text-secondary">Expected impact:</span>{" "}
                        <span className="line-clamp-2 text-primary">{area.expected_impact}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div variants={item}>
            <SectionCard title="Architecture" subtitle="Implementation-ready flow">
              <ShowMoreText text={recommended_architecture.overview} collapsedLines={2} />
              <div className="mt-4 grid gap-3">
                <div className="rounded-xl border border-border bg-white p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
                    <Database className="h-3.5 w-3.5 text-accent" />
                    Data source
                  </div>
                  <p className="text-xs text-secondary">
                    {recommended_architecture.components[0] || "Website and operational sources"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-white p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
                    <Workflow className="h-3.5 w-3.5 text-accent" />
                    Agent processing
                  </div>
                  <p className="text-xs text-secondary">
                    {recommended_architecture.components[1] || "Classification, extraction, and prioritization pipeline"}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-white p-4">
                  <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-primary">
                    <Sparkles className="h-3.5 w-3.5 text-accent" />
                    Output layer
                  </div>
                  <p className="text-xs text-secondary">
                    {recommended_architecture.components[2] || "APIs and report delivery surfaces"}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-secondary">
                  Why this shape
                </p>
                <ShowMoreText text={recommended_architecture.reasoning} collapsedLines={3} />
              </div>
            </SectionCard>
          </motion.div>

          <motion.div variants={item}>
            <SectionCard title="Confidence gauge" subtitle="Signal quality of current assessment">
              <div className="flex items-center gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    className={`h-2.5 w-2.5 rounded-full ${i < confidenceScore ? "bg-accent" : "bg-slate-200"}`}
                  />
                ))}
                <span className="text-xs text-secondary">{confidenceScore}/5 confidence</span>
              </div>
              <div className="mt-3 text-xs text-secondary">
                <AlertTriangle className="mr-1 inline h-3.5 w-3.5" />
                Confidence reflects website signal depth and extractable public content.
              </div>
            </SectionCard>
          </motion.div>
        </div>
      </div>

      <motion.div variants={item}>
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
      </motion.div>
    </motion.div>
  );
}

