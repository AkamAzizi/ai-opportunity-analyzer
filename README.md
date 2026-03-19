## AI Opportunity Analyzer

AI Opportunity Analyzer is a focused portfolio project that turns a company website URL into a structured, consultant-grade AI opportunity report.

It is designed to look and feel like a serious AI consulting tool that a CTO, product leader, or client could use in an early discovery conversation.

---

### Why this project matters

Most AI demos are chatbots with vague outputs. This project:

- **Frames AI as a consulting workflow**: website → structured diagnosis → opportunity portfolio → architecture recommendation.
- **Produces structured JSON** that can plug into other tools, CRMs, or internal playbooks.
- **Demonstrates end-to-end engineering**: scraping, prompt design, FastAPI services, and a clean Next.js UI.
- **Keeps expectations realistic**: it separates facts from assumptions and surfaces confidence explicitly.

---

### Tech stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Python, FastAPI
- **LLM access**: OpenRouter-compatible chat API
- **Scraping**: `requests` + `BeautifulSoup`
- **Validation**: Pydantic
- **Architecture**: Clean, modular monorepo (`frontend/`, `backend/`, `docs/`)

---

### High-level architecture

- **Frontend (`frontend/`)**
  - Single-page app (`app/page.tsx`) with:
    - URL input and analyze button
    - Loading and error states
    - Result sections for company profile, AI opportunities, architecture, impact, and assumptions
  - Typed client models in `types/analysis.ts`
  - API helper in `lib/api.ts` calling the FastAPI backend

- **Backend (`backend/`)**
  - `app/main.py`: FastAPI app, CORS, `/health`, and `/api` router wiring
  - `app/api/routes.py`: `/api/analyze` endpoint
  - `app/models/schemas.py`: Request/response Pydantic models
  - `app/services/scraper.py`: Website fetch and HTML → cleaned text
  - `app/services/llm_client.py`: Thin OpenRouter chat client
  - `app/services/analyzer.py`: Multi-step analysis pipeline via an LLM call returning structured JSON

See `docs/ARCHITECTURE.md` for the pipeline and diagram.

---

### Local setup

#### Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
cp .env.example .env
```

Edit `.env` and set:

- `OPENROUTER_API_KEY` – your OpenRouter API key
- Optionally adjust `OPENROUTER_MODEL`, `SCRAPER_USER_AGENT`, etc.

Run the API:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend

```bash
cd ../frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Visit `http://localhost:3000`.

---

### Example workflow

1. Open `http://localhost:3000`
2. Paste a company URL
3. Click **Analyze**
4. Review the structured report sections:
   - Company profile
   - AI opportunity portfolio
   - Recommended AI architecture
   - Impact assessment
   - Assumptions & confidence

