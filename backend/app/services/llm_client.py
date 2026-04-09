from typing import Any, Dict, List, Optional

import httpx

from app.core.config import get_settings

settings = get_settings()


class LLMClient:
    """
    Minimal Chat Completions client for OpenAI.
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        base_url: Optional[str] = None,
        model: Optional[str] = None,
    ) -> None:
        self.provider = "openai"
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.base_url = base_url or settings.OPENAI_BASE_URL
        self.model = model or settings.OPENAI_MODEL
        missing_key_name = "OPENAI_API_KEY"

        if not self.api_key:
            raise ValueError(f"{missing_key_name} is not set")

    async def chat(self, messages: List[Dict[str, str]], response_format: str = "json") -> str:
        if self.api_key.strip().lower() in {"sk-your-openai-key-here"}:
            raise ValueError(
                "LLM API key is still set to a placeholder. Update your .env with a real key."
            )

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
        }

        if response_format == "json":
            payload["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(base_url=self.base_url, timeout=60.0) as client:
            try:
                resp = await client.post("/chat/completions", json=payload, headers=headers)
                resp.raise_for_status()
            except httpx.HTTPStatusError as exc:
                status = exc.response.status_code
                body = (exc.response.text or "").strip()
                snippet = body[:500] + ("..." if len(body) > 500 else "")
                raise ValueError(
                    f"LLM request failed with HTTP {status} from {self.provider}. "
                    f"Check your API key/model and provider settings. "
                    f"Response: {snippet or '<empty body>'}"
                ) from exc
            except httpx.RequestError as exc:
                raise ValueError(
                    f"LLM request failed due to a network error contacting {self.provider}: {exc}"
                ) from exc

            data = resp.json()
            return data["choices"][0]["message"]["content"]

