from app.models.agents import CompanyAnalyzerOutput, OpportunityGeneratorOutput
from app.services.llm_client import LLMClient

OPPORTUNITY_GENERATOR_PROMPT = """
You are OpportunityGeneratorAgent.

Task:
- Read a structured company profile.
- Generate 5–8 concrete AI opportunities for this specific company.

Constraints:
- Be specific and aligned with the company's services, customers, and business model.
- Avoid generic ideas that could apply to any company (e.g., "AI chatbot", "predictive analytics") unless they are clearly tailored to this context.
- Keep descriptions short and concrete. Avoid vague phrases like "improve efficiency".
- Each opportunity should be realistically scoping to a 4–6 week MVP.

Output JSON with this exact structure:
{
  "opportunities": [
    {
      "title": string,
      "description": string,
      "why_it_fits": string,
      "complexity": string,
      "business_value": string
    }
  ]
}

Guidance:
- "complexity" should be one of: "low", "medium", "high" (you may add short qualifiers).
- "business_value" should describe the expected impact in business terms (e.g., more qualified leads, faster onboarding), not just "efficiency".
""".strip()


async def run_opportunity_generator_agent(
    company: CompanyAnalyzerOutput,
) -> OpportunityGeneratorOutput:
    client = LLMClient()

    messages = [
        {
            "role": "system",
            "content": OPPORTUNITY_GENERATOR_PROMPT,
        },
        {
            "role": "user",
            "content": (
                "Company profile JSON:\n"
                f"{company.model_dump_json(indent=2, exclude_none=True)}\n"
            ),
        },
    ]

    raw = await client.chat(messages, response_format="json")
    return OpportunityGeneratorOutput.model_validate_json(raw)

