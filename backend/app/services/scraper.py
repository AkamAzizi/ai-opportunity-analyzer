from typing import List

import bs4
import certifi
import requests
import socket
import ipaddress
from urllib.parse import urlparse
from typing import List

from app.core.config import get_settings

settings = get_settings()


def is_safe_url(url: str) -> bool:
    """
    Validate that the URL is using a safe protocol and resolves to a public IP.
    Prevents SSRF attacks.
    """
    try:
        parsed = urlparse(url)
        if parsed.scheme not in ("http", "https"):
            return False

        hostname = parsed.hostname
        if not hostname:
            return False

        # Resolve hostname to IP
        ip_addr = socket.gethostbyname(hostname)
        ip = ipaddress.ip_address(ip_addr)

        # Check for private/reserved ranges
        if (
            ip.is_private or
            ip.is_loopback or
            ip.is_link_local or
            ip.is_multicast or
            ip.is_reserved or
            ip.is_unspecified or
            # Explicitly block cloud metadata IP
            str(ip) == "169.254.169.254"
        ):
            return False

        return True
    except (socket.gaierror, ValueError):
        return False


def _clean_lines(lines: List[str]) -> List[str]:
    cleaned: List[str] = []
    for line in lines:
        l = " ".join(line.split())
        if l:
            cleaned.append(l)

    seen = set()
    unique: List[str] = []
    for l in cleaned:
        if l not in seen:
            seen.add(l)
            unique.append(l)
    return unique


def extract_visible_text(url: str) -> str:
    """
    Fetch a webpage and return cleaned, truncated visible text
    from headings, paragraphs and list items.
    """
    if not is_safe_url(url):
        raise RuntimeError("The provided URL is not safe to fetch.")

    headers = {"User-Agent": settings.SCRAPER_USER_AGENT}
    try:
        response = requests.get(
            url,
            headers=headers,
            timeout=settings.SCRAPER_TIMEOUT_SECONDS,
            verify=(certifi.where() if settings.SCRAPER_VERIFY_SSL else False),
        )
        response.raise_for_status()
    except requests.RequestException as exc:
        raise RuntimeError(f"Failed to fetch URL: {exc}") from exc

    soup = bs4.BeautifulSoup(response.text, "html.parser")

    # Remove clearly non-content elements early
    for tag in soup(["script", "style", "noscript"]):
        tag.decompose()

    # Collect text from relevant tags
    tags = soup.find_all(["h1", "h2", "h3", "h4", "p", "li"])
    raw_lines: List[str] = []
    for tag in tags:
        # Skip structural sections where possible
        for ancestor in tag.parents:
            if getattr(ancestor, "name", None) in ["nav", "footer", "header", "aside"]:
                break
        else:
            text = tag.get_text(separator=" ", strip=True)
            if text and len(text) >= 3:
                raw_lines.append(text)

    cleaned_lines = _clean_lines(raw_lines)
    combined = "\n".join(cleaned_lines)

    if len(combined) > settings.SCRAPER_MAX_CHARS:
        combined = combined[: settings.SCRAPER_MAX_CHARS]

    return combined

