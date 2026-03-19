from app.models.agents import (
    OpportunityGeneratorOutput,
    PrioritizationOutput,
)
from app.services.llm_client import LLMClient

PRIORITIZATION_PROMPT = """
You are PrioritizationAgent.

Task:
- Take a list of AI opportunities for one company.
- Categorize them into:
  - quick wins
  - mid-term opportunities
  - strategic bets
- Select exactly ONE "recommended first pilot".

Constraints:
- Always include at least 1 quick win.
- Always include at least 1 strategic bet.
- "Recommended first pilot" must be realistic for a 4–6 week MVP.
- Keep text concise and avoid repeating full descriptions unnecessarily.

Output JSON with this exact structure:
{
  "quick_wins": [
    {
      "title": string,
      "description": string,
      "why_it_fits": string,
      "complexity": string,
      "business_value": string,
      "bucket": "quick_win",
      "recommended_first_pilot": boolean
    }
  ],
  "mid_term": [
    {
      "title": string,
      "description": string,
      "why_it_fits": string,
      "complexity": string,
      "business_value": string,
      "bucket": "mid_term",
      "recommended_first_pilot": boolean
    }
  ],
  "strategic_bets": [
    {
      "title": string,
      "description": string,
      "why_it_fits": string,
      "complexity": string,
      "business_value": string,
      "bucket": "strategic_bet",
      "recommended_first_pilot": boolean
    }
  ]
}

Rules:
- Exactly one item across all buckets must have "recommended_first_pilot": true.
- Buckets must be consistent with the label:
  - quick wins: low complexity, fast to test.
  - mid-term: moderate complexity or dependencies.
  - strategic bets: higher complexity or longer horizon, but meaningful upside.
""".strip()


async def run_prioritization_agent(
    opportunities: OpportunityGeneratorOutput,
) -> PrioritizationOutput:
    client = LLMClient()

    messages = [
        {
            "role": "system",
            "content": PRIORITIZATION_PROMPT,
        },
        {
            "role": "user",
            "content": (
                "Here is the list of AI opportunities in JSON format:\n"
                f"{opportunities.model_dump_json(indent=2, exclude_none=True)}\n"
            ),
        },
    ]

    raw = await client.chat(messages, response_format="json")
    return PrioritizationOutput.model_validate_json(raw)

