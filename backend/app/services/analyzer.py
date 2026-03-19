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
