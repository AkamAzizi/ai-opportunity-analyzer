from typing import List, Optional

from pydantic import AnyHttpUrl, BaseModel, Field


class AnalyzeRequest(BaseModel):
    url: AnyHttpUrl = Field(..., description="Public website URL of the company to analyze")


class CompanyProfile(BaseModel):
    name: Optional[str] = Field(None, description="Company name if identifiable")
    summary: str = Field(..., description="High-level summary of what the company does")
    industry: Optional[str] = Field(None, description="Likely industry or sector")
    business_model: Optional[str] = Field(
        None, description="How the company seems to create and capture value"
    )
    customer_type: Optional[str] = Field(
        None, description="Primary customer types (e.g., B2B SaaS, B2C marketplace)"
    )


class AIOpportunity(BaseModel):
    title: str
    description: str
    why_it_fits: str
    complexity: str
    business_value: str


class RecommendedArchitecture(BaseModel):
    overview: str
    components: List[str]
    reasoning: str


class ImpactArea(BaseModel):
    area: str
    description: str
    expected_impact: str


class ImpactAssessment(BaseModel):
    summary: str
    impact_areas: List[ImpactArea]


class AnalysisResponse(BaseModel):
    company_profile: CompanyProfile
    ai_opportunities: List[AIOpportunity]
    recommended_architecture: RecommendedArchitecture
    impact_assessment: ImpactAssessment
    assumptions: List[str]
    confidence_notes: str

