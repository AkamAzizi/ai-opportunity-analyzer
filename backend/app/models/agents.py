from typing import List, Optional, Literal

from pydantic import BaseModel, Field


class CompanyAnalyzerOutput(BaseModel):
    name: Optional[str] = Field(
        None, description="Best-effort company name, grounded in the website text"
    )
    industry: Optional[str] = Field(
        None, description="Likely industry or sector, grounded in the website text"
    )
    services: List[str] = Field(
        default_factory=list,
        description="Key services or offerings mentioned on the website, 3–8 short items",
    )
    business_model: Optional[str] = Field(
        None, description="How the company seems to create and capture value"
    )
    customer_type: Optional[str] = Field(
        None, description="Primary customer types (e.g., mid-market B2B SaaS, enterprise, consumers)"
    )
    summary: str = Field(
        ..., description="Concise summary of what the company does, 2–4 short sentences"
    )


class Opportunity(BaseModel):
    title: str
    description: str
    why_it_fits: str
    complexity: str
    business_value: str


class OpportunityGeneratorOutput(BaseModel):
    opportunities: List[Opportunity]


Bucket = Literal["quick_win", "mid_term", "strategic_bet"]


class PrioritizedOpportunity(Opportunity):
    bucket: Bucket
    recommended_first_pilot: bool = Field(
        False,
        description="True exactly for the single opportunity recommended as the first pilot",
    )


class PrioritizationOutput(BaseModel):
    quick_wins: List[PrioritizedOpportunity]
    mid_term: List[PrioritizedOpportunity]
    strategic_bets: List[PrioritizedOpportunity]


class ArchitectureOutput(BaseModel):
    overview: str
    components: List[str]
    reasoning: str
    impact_summary: str
    impact_areas: List[dict]
    risks: List[str]
    assumptions: List[str]
    confidence_notes: str

