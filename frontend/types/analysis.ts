export interface CompanyProfile {
  name: string | null;
  summary: string;
  industry: string | null;
  business_model: string | null;
  customer_type: string | null;
}

export interface AIOpportunity {
  title: string;
  description: string;
  why_it_fits: string;
  complexity: string;
  business_value: string;
}

export interface RecommendedArchitecture {
  overview: string;
  components: string[];
  reasoning: string;
}

export interface ImpactArea {
  area: string;
  description: string;
  expected_impact: string;
}

export interface ImpactAssessment {
  summary: string;
  impact_areas: ImpactArea[];
}

export interface AnalysisResponse {
  company_profile: CompanyProfile;
  ai_opportunities: AIOpportunity[];
  recommended_architecture: RecommendedArchitecture;
  impact_assessment: ImpactAssessment;
  assumptions: string[];
  confidence_notes: string;
}

