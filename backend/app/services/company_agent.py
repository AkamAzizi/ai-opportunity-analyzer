from app.models.agents import CompanyAnalyzerOutput
from app.services.llm_client import LLMClient

COMPANY_ANALYZER_PROMPT = """
You are CompanyAnalyzerAgent.

Task:
- Read the provided website text.
- Extract a grounded, text-based company profile.

Constraints:
- Stay strictly within what the text supports or what is a minimal, reasonable inference.
- Do not hallucinate detailed strategies or roadmaps.
- Keep all prose concise and non-repetitive.

Output JSON with this exact shape:
{
  "name": string or null,
  "industry": string or null,
  "services": [string, ...],
  "business_model": string or null,
  "customer_type": string or null,
  "summary": string
}

Notes:
- "services" should list 3–8 short bullet-style items describing concrete offerings.
- "summary" should be 2–4 short sentences, specific to this company.
""".strip()


async def run_company_analyzer_agent(website_text: str) -> CompanyAnalyzerOutput:
    client = LLMClient()

    messages = [
        {
            "role": "system",
            "content": COMPANY_ANALYZER_PROMPT,
        },
        {
            "role": "user",
            "content": (
                "Use only the following website text:\n\n"
                "--- WEBSITE TEXT START ---\n"
                f"{website_text}\n"
                "--- WEBSITE TEXT END ---\n"
            ),
        },
    ]

    raw = await client.chat(messages, response_format="json")
    return CompanyAnalyzerOutput.model_validate_json(raw)

