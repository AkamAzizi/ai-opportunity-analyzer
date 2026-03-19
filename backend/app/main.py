from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router as api_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title=settings.PROJECT_NAME)

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

