from app.models.agents import ArchitectureOutput, CompanyAnalyzerOutput, PrioritizationOutput
from app.services.llm_client import LLMClient

ARCHITECTURE_PROMPT = """
You are ArchitectureAgent.

Task:
- Read the company profile and prioritized AI opportunities.
- Propose an implementation-ready AI architecture.
- Summarize impact and key risks.

The architecture should:
- Reflect the prioritized opportunity portfolio (especially the recommended first pilot).
- Include data flows, models, and serving patterns.
- Use RAG, pipelines, or APIs when relevant (but only when they make sense for this use case).

Output JSON with this exact structure:
{
  "overview": string,
  "components": [string, ...],
  "reasoning": string,
  "impact_summary": string,
  "impact_areas": [
    {
      "area": string,
      "description": string,
      "expected_impact": string
    }
  ],
  "risks": [string, ...],
  "assumptions": [string, ...],
  "confidence_notes": string
}

Guidance:
- "components" should be a list of concrete building blocks (e.g., "event ingestion service", "vector store for support articles", "LLM inference API", "batch retraining pipeline").
- "impact_areas" should be short and specific (e.g., "Sales pipeline quality", "Support resolution time").
- "risks" should cover technical, data, and organizational risks.
- Keep prose concise and avoid generic claims like "improve efficiency" without specifying where.
""".strip()


async def run_architecture_agent(
    company: CompanyAnalyzerOutput,
    portfolio: PrioritizationOutput,
) -> ArchitectureOutput:
    client = LLMClient()

    messages = [
        {
            "role": "system",
            "content": ARCHITECTURE_PROMPT,
        },
        {
            "role": "user",
            "content": (
                "Company profile JSON:\n"
                f"{company.model_dump_json(indent=2, exclude_none=True)}\n\n"
                "Prioritized opportunities JSON:\n"
                f"{portfolio.model_dump_json(indent=2, exclude_none=True)}\n"
            ),
        },
    ]

    raw = await client.chat(messages, response_format="json")
    return ArchitectureOutput.model_validate_json(raw)

