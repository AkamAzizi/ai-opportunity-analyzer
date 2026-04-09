# AI Opportunity Analyzer

AI Opportunity Analyzer converts a public company URL into a structured AI strategy brief.
It is built as an engineering-first consulting workflow, delivering a premium, consultant-grade experience.

**Pipeline**: URL -> scrape -> company analysis -> opportunity generation -> prioritization -> architecture/impact -> structured report

---

## Why this project is useful

Most AI demos optimize for novelty. This project optimizes for decision quality and professional presentation.

- **Consultant-Grade UI**: A high-end, "Midnight Executive" aesthetic designed for strategy presentations.
- **Grounded Analysis**: Produces a company profile from real-time public website signals.
- **Actionable Opportunities**: Generates specific AI initiatives tied to actual company offerings.
- **Prioritized Portfolio**: Categorizes opportunities into **Quick Wins, Mid-term, and Strategic Bets**.
- **Implementation-Ready**: Returns architecture guidance with clear assumptions and confidence scores.
- **Production-Ready Security**: Built-in SSRF protection, rate limiting, and prompt injection guardrails.

---

## System design at a glance

### Frontend (`frontend/`)
- **Next.js 15**, **TypeScript**, **Tailwind CSS**.
- **Framer Motion** for smooth, staggered animations and transitions.
- **Lucide Icons** for consistent data visualization.
- **Progress Stepper & Skeletons**: Real-time feedback during the multi-agent analysis.
- **Content Security Policy (CSP)**: Robust protection against XSS and unauthorized connections.

### Backend (`backend/`)
- **FastAPI** with integrated **SlowAPI** for rate limiting (5 req/min).
- **Multi-Agent Pipeline**:
  - `CompanyAnalyzerAgent`: Website text extraction and profiling.
  - `OpportunityGeneratorAgent`: Generates service-aligned AI opportunities.
  - `PrioritizationAgent`: Portfolio categorization and pilot selection.
  - `ArchitectureAgent`: Technical implementation and impact assessment.
- **Security Core**:
  - `scraper.py`: SSRF protection with IP/protocol validation.
  - `limiter.py`: Centralized rate limiting state.
  - **Prompt Injection Guardrails**: Delimited data blocks and strict model instructions.

---

## Tech stack

- **Frontend**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, Framer Motion, Lucide.
- **Backend**: Python 3.13+, FastAPI, Pydantic v2, SlowAPI.
- **HTTP/LLM**: `httpx` for model calls, provider-compatible Chat Completions API.
- **Scraping**: `requests` + `beautifulsoup4` + `certifi` for secure SSL.
- **Validation**: Strict Pydantic models for all inter-agent communication.

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

---

## Local development

### 1) Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env`:
```env
OPENAI_API_KEY=your_key
# ... see app/core/config.py for all settings
```

Run backend:
```bash
python -m uvicorn app.main:app --reload --port 8000
```

If you prefer running from the repo root (without `cd backend`), use:
```bash
PYTHONPATH=backend python -m uvicorn app.main:app --reload --port 8000
```

### 2) Frontend

Create `frontend/.env.local`:
```env
BACKEND_URL=http://localhost:8000
```

```bash
cd frontend
npm install
npm run dev
```

For Cloud Run frontend deployment, set `BACKEND_URL` to your backend service URL (for example `https://ai-opportunity-analyzer-2-167158120787.europe-west1.run.app`).

---

## Security Features

- **SSRF Protection**: Validates that target URLs resolve to public IPs; blocks internal and metadata IP ranges.
- **Rate Limiting**: Protects LLM costs and prevents DoS by limiting analysis requests.
- **Prompt Injection Delimiters**: Uses `[[[DATA START]]]` / `[[[DATA END]]]` patterns to separate untrusted website content from system instructions.
- **XSS Protection**: Strict CSP headers and React-native escaping for all LLM-generated content.

---

## Documentation

- Architecture notes: `docs/ARCHITECTURE.md`
- Security Audit: `SECURITY_VULNERABILITIES.md`
