from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware

try:
    # When running from `backend/` (e.g. `uvicorn app.main:app`)
    from app.api.routes import router as api_router
    from app.core.config import get_settings
    from app.core.limiter import limiter
except ModuleNotFoundError:  # pragma: no cover
    # When running from the repo root (e.g. `uvicorn backend.app.main:app`)
    from backend.app.api.routes import router as api_router
    from backend.app.core.config import get_settings
    from backend.app.core.limiter import limiter

settings = get_settings()

app = FastAPI(title=settings.PROJECT_NAME)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

app.add_middleware(
    CORSMiddleware,
    # Pydantic's AnyHttpUrl stringifies with a trailing slash (e.g. "http://localhost:3000/"),
    # but browsers send Origin without it (e.g. "http://localhost:3000"). Normalize to match.
    allow_origins=[str(origin).rstrip("/") for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "service": settings.PROJECT_NAME}

