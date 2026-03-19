from fastapi import APIRouter, HTTPException, Request
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_500_INTERNAL_SERVER_ERROR

from app.models.schemas import AnalysisResponse, AnalyzeRequest
from app.services.analyzer import run_full_analysis
from app.services.scraper import extract_visible_text
from app.core.limiter import limiter

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResponse)
@limiter.limit("5/minute")
async def analyze_company(payload: AnalyzeRequest, request: Request) -> AnalysisResponse:
    url = str(payload.url)

    try:
        website_text = extract_visible_text(url)
    except RuntimeError as exc:
        raise HTTPException(status_code=HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    if not website_text or len(website_text) < 100:
        raise HTTPException(
            status_code=HTTP_400_BAD_REQUEST,
            detail="Unable to extract sufficient content from the provided URL.",
        )

    try:
        analysis = await run_full_analysis(website_text, input_url=url)
    except ValueError as exc:
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Analysis failed: {exc}",
        ) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unexpected error during analysis.",
        ) from exc

    return analysis

