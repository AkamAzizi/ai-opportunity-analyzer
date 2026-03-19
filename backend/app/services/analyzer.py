from typing import Any, List

from urllib.parse import urlparse

from app.models.schemas import (
    AnalysisResponse,
    CompanyProfile,
    AIOpportunity,
    RecommendedArchitecture,
    ImpactAssessment,
    ImpactArea,
)
from app.models.agents import (
    CompanyAnalyzerOutput,
    OpportunityGeneratorOutput,
    PrioritizationOutput,
    PrioritizedOpportunity,
    ArchitectureOutput,
)
from app.services.company_agent import run_company_analyzer_agent
from app.services.opportunity_agent import run_opportunity_generator_agent
from app.services.prioritization_agent import run_prioritization_agent
from app.services.architecture_agent import run_architecture_agent


def _domain_brand_fallback(input_url: str) -> str:
    host = urlparse(input_url).hostname or input_url
    host = host.lower().strip().lstrip("www.")
    base = host.split(":")[0]
    core = base.split(".")[0] if base else "Unknown"
    core = core.replace("-", " ").replace("_", " ").strip()
    return core.title() if core else "Unknown"


def _normalize_company_name(name: Any, input_url: str) -> str:
    if not isinstance(name, str):
        return _domain_brand_fallback(input_url)
    cleaned = " ".join(name.split()).strip()
    weak = {
        "",
        "null",
        "none",
        "unknown",
        "not specified",
        "not provided",
        "name not explicitly stated",
        "not explicitly stated",
    }
    if cleaned.lower() in weak:
        return _domain_brand_fallback(input_url)
    return cleaned


async def run_full_analysis(website_text: str, input_url: str) -> AnalysisResponse:
    """
    Orchestrate the multi-agent pipeline:

    Scraper (external) -> CompanyAnalyzerAgent -> OpportunityGeneratorAgent
    -> PrioritizationAgent -> ArchitectureAgent -> AnalysisResponse
    """

    # 1) Company analysis (CompanyAnalyzerAgent)
    company: CompanyAnalyzerOutput = await run_company_analyzer_agent(website_text)

    # 2) Opportunity generation (OpportunityGeneratorAgent)
    opportunities: OpportunityGeneratorOutput = await run_opportunity_generator_agent(
        company
    )

    # 3) Prioritization (PrioritizationAgent)
    portfolio: PrioritizationOutput = await run_prioritization_agent(opportunities)

    # 4) Architecture & impact (ArchitectureAgent)
    architecture: ArchitectureOutput = await run_architecture_agent(company, portfolio)

    # ---- Merge into existing AnalysisResponse shape ----

    # Company profile
    company_name = _normalize_company_name(company.name, input_url)
    company_profile = CompanyProfile(
        name=company_name,
        summary=company.summary,
        industry=company.industry,
        business_model=company.business_model,
        customer_type=company.customer_type,
    )

    # Flatten prioritized opportunities into a single list.
    def _flatten_bucket(items: List[PrioritizedOpportunity]) -> List[AIOpportunity]:
        return [
            AIOpportunity(
                title=item.title,
                description=item.description,
                why_it_fits=item.why_it_fits,
                complexity=item.complexity,
                business_value=item.business_value,
            )
            for item in items
        ]

    ai_opportunities: List[AIOpportunity] = []
    ai_opportunities.extend(_flatten_bucket(portfolio.quick_wins))
    ai_opportunities.extend(_flatten_bucket(portfolio.mid_term))
    ai_opportunities.extend(_flatten_bucket(portfolio.strategic_bets))

    # Recommended architecture
    recommended_architecture = RecommendedArchitecture(
        overview=architecture.overview,
        components=architecture.components,
        reasoning=architecture.reasoning,
    )

    # Impact assessment
    impact_areas: List[ImpactArea] = [
        ImpactArea(
            area=str(area.get("area", "")),
            description=str(area.get("description", "")),
            expected_impact=str(area.get("expected_impact", "")),
        )
        for area in architecture.impact_areas
    ]
    impact_assessment = ImpactAssessment(
        summary=architecture.impact_summary,
        impact_areas=impact_areas,
    )

    return AnalysisResponse(
        company_profile=company_profile,
        ai_opportunities=ai_opportunities,
        recommended_architecture=recommended_architecture,
        impact_assessment=impact_assessment,
        assumptions=architecture.assumptions,
        confidence_notes=architecture.confidence_notes,
    )

import json
from typing import Any, Dict

from app.models.schemas import AnalysisResponse
from app.services.llm_client import LLMClient
from urllib.parse import urlparse


SYSTEM_PROMPT = """
You are a senior AI solutions consultant.

You analyze companies based ONLY on their public website text and produce structured, realistic AI recommendations.

GENERAL RULES:
- Stay grounded in the provided text
- Do NOT assume access to internal systems or data unless clearly implied
- Clearly separate facts from assumptions
- Avoid overclaiming (no guarantees, no speculative metrics unless explicitly framed as typical ranges)
- Write concisely (around 30% shorter than a typical consultant report)
- Avoid vague phrases like "improve efficiency" or "optimize processes"
- Instead, name concrete workflows, users, or outcomes (e.g. "reduce time spent drafting proposals", "detect drop-off points in checkout")

CONSULTING THINKING:
- Always prioritize practical, implementable solutions over theoretical ideas
- Prefer solutions that can be built in 4–6 weeks as MVPs
- Avoid generic AI ideas (e.g. "use AI for personalization") unless made highly specific

PRIORITIZATION RULES:
- Always include at least ONE "Quick Win"
- A Quick Win must:
  - be feasible within ~4–6 weeks
  - have clear business value
  - not require deep infrastructure changes
- The "Recommended First Pilot" MUST:
  - be the most practical starting point
  - be clearly feasible
  - be tied directly to the company’s current services or workflows
  - NOT be a generic AI idea

COMPANY-TYPE ADAPTATION:
- If the company is a CONSULTING / AGENCY business:
  - prioritize:
    - internal workflow tools
    - delivery acceleration
    - standardizing outputs (reports, proposals, audits)
    - productized services
  - deprioritize generic end-user features unless clearly relevant

- If the company is E-COMMERCE / CONSUMER:
  - prioritize:
    - recommendations
    - conversion optimization
    - customer support automation

- If the company is B2B / SOFTWARE:
  - prioritize:
    - internal tools
    - analytics
    - workflow automation
    - product features

OUTPUT RULES:
- Return ONLY valid JSON matching the schema
- No extra commentary
- No markdown
- No explanations outside schema

UNCERTAINTY:
- Explicitly list assumptions
- Add confidence notes explaining where the analysis may be weak

GOAL:
Produce output that feels like a real consulting deliverable that could be shown to a client in a workshop.
""".strip()


PIPELINE_INSTRUCTIONS = """
You will perform a multi-step analysis based on the provided website text:

1) COMPANY ANALYSIS
- Company name: ALWAYS try to extract the company name.
  - First: look for an explicit name in the website text (brand, legal entity, page title patterns).
  - If not explicit: infer the most likely brand name from recurring header/footer branding.
  - If still uncertain: use the provided input domain as the name (convert domain to a readable brand, e.g. "acme-ai.com" -> "Acme AI").
  - NEVER output weak placeholders like "Name not explicitly stated" or "Unknown". Provide your best guess.
- Extract a concise description of what the company does.
- Infer its likely industry, business model, and customer types.
- Be explicit about what is directly stated vs what is inferred.
- Keep all text tight: avoid repeating the same point in multiple places.

2) AI OPPORTUNITY GENERATION
- Propose 3–6 concrete AI opportunities.
- For each, explain in compact, specific language:
  - what it is (1–2 short sentences),
  - why it fits this company (1–2 short sentences, avoid generic phrasing),
  - expected implementation complexity (e.g., low / medium / high),
  - potential business value (e.g., incremental / moderate / transformative) with a few concrete outcomes (e.g., "reduce support handle time", "increase qualified leads"), not just abstract "efficiency".

3) ARCHITECTURE RECOMMENDATION
- Propose a high-level AI solution architecture suitable for a first MVP.
- Focus on practical components: data sources, ingestion, processing, models, serving, monitoring, security, etc.
- Keep it cloud-agnostic where possible.

4) IMPACT & ASSUMPTIONS
- Summarize expected impact areas using short, concrete statements.
- Clearly list assumptions you had to make due to limited public information.
- Describe your confidence level and where it is weaker, without repeating earlier content.

Return JSON with this exact structure:

{
  "company_profile": {
    "name": string or null,
    "summary": string,
    "industry": string or null,
    "business_model": string or null,
    "customer_type": string or null
  },
  "ai_opportunities": [
    {
      "title": string,
      "description": string,
      "why_it_fits": string,
      "complexity": string,
      "business_value": string
    }
  ],
  "recommended_architecture": {
    "overview": string,
    "components": [string, ...],
    "reasoning": string
  },
  "impact_assessment": {
    "summary": string,
    "impact_areas": [
      {
        "area": string,
        "description": string,
        "expected_impact": string
      }
    ]
  },
  "assumptions": [string, ...],
  "confidence_notes": string
}

Remember:
- Only output valid JSON.
- Do not include markdown.
- Do not include explanations outside the JSON.
- Avoid repetition across fields; each field should add new information rather than restating previous text.
""".strip()


def _domain_brand_fallback(input_url: str) -> str:
    host = urlparse(input_url).hostname or input_url
    host = host.lower().strip().lstrip("www.")
    base = host.split(":")[0]
    core = base.split(".")[0] if base else "Unknown"
    core = core.replace("-", " ").replace("_", " ").strip()
    return core.title() if core else "Unknown"


def _normalize_company_name(name: Any, input_url: str) -> str:
    if not isinstance(name, str):
        return _domain_brand_fallback(input_url)
    cleaned = " ".join(name.split()).strip()
    weak = {
        "",
        "null",
        "none",
        "unknown",
        "not specified",
        "not provided",
        "name not explicitly stated",
        "not explicitly stated",
    }
    if cleaned.lower() in weak:
        return _domain_brand_fallback(input_url)
    return cleaned


async def run_full_analysis(website_text: str, input_url: str) -> AnalysisResponse:
    client = LLMClient()

    user_prompt = (
        PIPELINE_INSTRUCTIONS
        + f"\n\nInput URL (for name fallback): {input_url}\n"
        + "\n\n--- WEBSITE TEXT START ---\n"
        + website_text
        + "\n--- WEBSITE TEXT END ---\n"
    )

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_prompt},
    ]

    raw = await client.chat(messages, response_format="json")

    try:
        data: Dict[str, Any] = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ValueError(f"LLM returned invalid JSON: {exc}") from exc

    # Ensure company name is always present & not a weak placeholder
    company_profile = data.get("company_profile") if isinstance(data, dict) else None
    if isinstance(company_profile, dict):
        company_profile["name"] = _normalize_company_name(company_profile.get("name"), input_url)
        data["company_profile"] = company_profile

    return AnalysisResponse(**data)

