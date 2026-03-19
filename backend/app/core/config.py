from functools import lru_cache
from typing import List

from pydantic import AnyHttpUrl, Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Opportunity Analyzer"

    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = Field(
        default_factory=lambda: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
        ]
    )

    # LLM provider selection
    # - "openrouter": use OpenRouter-compatible API (default)
    # - "openai": use OpenAI API directly
    LLM_PROVIDER: str = Field(default="openrouter", description="LLM provider: openrouter|openai")

    OPENROUTER_API_KEY: str = Field(default="", description="OpenRouter API key")
    OPENROUTER_BASE_URL: str = Field(
        default="https://openrouter.ai/api/v1",
        description="Base URL for OpenRouter-compatible API",
    )
    OPENROUTER_MODEL: str = Field(
        default="openai/gpt-4.1-mini",
        description="Model identifier to use with OpenRouter",
    )

    OPENAI_API_KEY: str = Field(default="", description="OpenAI API key")
    OPENAI_BASE_URL: str = Field(
        default="https://api.openai.com/v1",
        description="Base URL for OpenAI API",
    )
    OPENAI_MODEL: str = Field(
        default="gpt-4.1-mini",
        description="OpenAI model identifier",
    )

    SCRAPER_USER_AGENT: str = Field(
        default="AI-Opportunity-Analyzer/1.0 (+https://example.com)",
        description="User agent string for HTTP requests",
    )
    SCRAPER_TIMEOUT_SECONDS: int = 15
    SCRAPER_MAX_CHARS: int = 12000
    SCRAPER_VERIFY_SSL: bool = Field(
        default=True,
        description="Verify SSL certificates when scraping (set false if your network uses TLS interception)",
    )

    model_config = {
        "env_file": ".env",
        "case_sensitive": False,
    }


@lru_cache()
def get_settings() -> Settings:
    return Settings()

