# AI Opportunity Analyzer

AI Opportunity Analyzer converts a public company URL into a structured AI strategy brief.
It is built as an engineering-first consulting workflow, not a chatbot demo.

**Pipeline**: URL -> scrape -> company analysis -> opportunity generation -> prioritization -> architecture/impact -> structured report

---

## Why this project is useful

Most AI demos optimize for novelty. This project optimizes for decision quality.

- Produces a **grounded company profile** from public website signals.
- Generates **specific AI opportunities** tied to the company's offerings.
- Prioritizes opportunities into **quick wins, mid-term, and strategic bets**.
- Returns **implementation-ready architecture guidance** with assumptions and confidence.
- Outputs strict JSON contracts suitable for downstream systems.

---

## System design at a glance

### Frontend (`frontend/`)
- Next.js 15, TypeScript, Tailwind CSS.
- Single dashboard flow:
  - submit URL
  - review executive summary
  - inspect grouped opportunities
  - inspect architecture and confidence sections
- Typed client contracts in `frontend/types/analysis.ts`.

### Backend (`backend/`)
- FastAPI API with:
  - `GET /health`
  - `POST /api/analyze`
- Core modules:
  - `app/services/scraper.py` -> website text extraction
  - `app/services/llm_client.py` -> provider abstraction (OpenAI/OpenRouter-compatible)
  - `app/services/analyzer.py` -> multi-agent orchestration and final response assembly

### Multi-agent pipeline
Each step has a single responsibility and typed JSON output:

1. **CompanyAnalyzerAgent**
   - Input: scraped website text
   - Output: company profile (name, industry, services, business model, customer type, summary)

2. **OpportunityGeneratorAgent**
   - Input: structured company profile
   - Output: 5-8 specific, service-aligned AI opportunities

3. **PrioritizationAgent**
   - Input: opportunities
   - Output: categorized portfolio (`quick_wins`, `mid_term`, `strategic_bets`) + one recommended first pilot

4. **ArchitectureAgent**
   - Input: prioritized portfolio
   - Output: architecture, impact areas, risks, assumptions, confidence notes

The orchestrator maps agent outputs to the stable API schema used by the current UI.

---

## Tech stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS
- **Backend**: Python 3.13+, FastAPI, Pydantic v2
- **HTTP/LLM**: `httpx` for model calls, provider-compatible Chat Completions API
- **Scraping**: `requests` + `beautifulsoup4`
- **Validation/contracts**: Pydantic models between all backend stages

---

## API contract

### `POST /api/analyze`
Request:

```json
{
  "url": "https://example.com"
}
```

Response shape:

```json
{
  "company_profile": {},
  "ai_opportunities": [],
  "recommended_architecture": {},
  "impact_assessment": {},
  "assumptions": [],
  "confidence_notes": ""
}
```

Primary schema is defined in `backend/app/models/schemas.py`.

---

## Local development

### 1) Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt
```

Create `backend/.env` with your provider settings:

```env
# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000","http://127.0.0.1:3000","http://localhost:5173","http://127.0.0.1:5173"]

# LLM provider: openai | openrouter
LLM_PROVIDER=openai

# OpenAI
OPENAI_API_KEY=your_openai_key
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4.1-mini

# OpenRouter (optional if provider=openai)
OPENROUTER_API_KEY=
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-4.1-mini

# Scraper
SCRAPER_USER_AGENT=AI-Opportunity-Analyzer/1.0 (+https://your-site.com)
SCRAPER_TIMEOUT_SECONDS=15
SCRAPER_MAX_CHARS=12000
SCRAPER_VERIFY_SSL=true
```

Run backend:

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2) Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open `http://localhost:3000`.

---

## Operational notes

- CORS is configurable via `BACKEND_CORS_ORIGINS`.
- Scraping can fail on JS-heavy or bot-protected sites; this is expected for `requests`-based extraction.
- `SCRAPER_VERIFY_SSL=false` can help in constrained corporate networks with TLS interception (trade-off: weaker TLS validation).
- API keys must stay in local env/secrets and should never be committed.

---

## Known limitations

- Extraction quality depends on public HTML content quality.
- Sites that require client-side rendering or authentication may yield insufficient text.
- LLM output quality is model-dependent and may vary by industry/domain complexity.
- This tool is advisory and should not be used as an autonomous decision system.

---

## Suggested next steps

- Add persistence for analysis runs and auditability.
- Add async job processing for larger/longer analyses.
- Add evaluation harness for prompt/version regression checks.
- Add deployment IaC (ECS/Fargate or equivalent) for repeatable environments.

---

## Documentation

- Architecture notes: `docs/ARCHITECTURE.md`

