# AI Opportunity Analyzer - Project Context

This project is a consultant-grade tool that converts a public company URL into a structured AI strategy brief. It uses a multi-agent LLM pipeline to analyze company data and generate specific, actionable AI opportunities.

## Project Overview

### Architecture
The application is split into two main parts:
- **Backend (`backend/`)**: A FastAPI service that handles web scraping and orchestrates a multi-step LLM analysis pipeline.
- **Frontend (`frontend/`)**: A Next.js dashboard for user interaction and report visualization.

### Tech Stack
- **Backend**: Python 3.13+, FastAPI, Pydantic v2 (validation & settings), BeautifulSoup4 (scraping), HTTPX (LLM client).
- **Frontend**: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS.
- **LLM Integration**: Supports OpenAI and OpenRouter-compatible providers.

## Building and Running

### Backend Setup
1. **Environment**:
   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```
2. **Configuration**: Create a `.env` file in the `backend/` directory (see `app/core/config.py` for available settings).
3. **Run**:
   ```bash
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
4. **Health Check**: `GET http://localhost:8000/health`

### Frontend Setup
1. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```
2. **Configuration**: Create a `.env.local` file (copy from `.env.local.example`).
3. **Run Development Server**:
   ```bash
   npm run dev
   ```
4. **Access**: `http://localhost:3000`

## Development Conventions

### Backend
- **Modular Pipeline**: Each analysis step (Company Analysis, Opportunity Generation, etc.) is encapsulated in a dedicated service agent.
- **Validation**: Strict JSON contracts are enforced using Pydantic models in `app/models/schemas.py`.
- **Error Handling**: Custom exceptions and FastAPI HTTPException are used to provide clear feedback for scraping or analysis failures.
- **Scraping**: Uses a custom `scraper.py` with configurable user agents and timeouts.

### Frontend
- **Typed Contracts**: API responses are typed in `frontend/types/analysis.ts` to match backend Pydantic models.
- **Component Structure**: UI is divided into focused components (e.g., `UrlForm`, `AnalysisResult`, `OpportunityCard`).
- **Styling**: Uses Tailwind CSS for a modern, clean "consultant" aesthetic.

### LLM Pipeline Flow
1. **Scrape**: Extract visible text from URL.
2. **Analyze**: `CompanyAnalyzerAgent` identifies industry and business model.
3. **Generate**: `OpportunityGeneratorAgent` proposes specific AI initiatives.
4. **Prioritize**: `PrioritizationAgent` categorizes opportunities (Quick Wins, Strategic Bets).
5. **Architect**: `ArchitectureAgent` provides implementation-ready guidance and impact assessment.
