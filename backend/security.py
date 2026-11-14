"""Security middleware and validation utilities (OWASP Top 10 defenses)."""

import collections
from pathlib import Path
import re
import time
from typing import Any, Callable

from fastapi import HTTPException, Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

SAFE_ID_REGEX = re.compile(r"^[a-z0-9_]{3,40}$")


def validate_safe_id(value: str, label: str = "id") -> str:
    """Validate identifier strictly against regex to prevent injection and traversal."""
    if not isinstance(value, str) or not SAFE_ID_REGEX.match(value):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid {label}: '{value}'. Must match ^[a-z0-9_]{{3,40}}$",
        )
    return value


def resolve_safe_data_path(base_dir: Path, *parts: str) -> Path:
    """Resolve data path strictly within base_dir to defend against path traversal (A01)."""
    base_resolved = base_dir.resolve()
    target_path = base_resolved.joinpath(*parts).resolve()
    if not target_path.is_relative_to(base_resolved):
        raise ValueError(f"Path traversal detected: {target_path} is outside {base_resolved}")
    return target_path


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Enforces defensive HTTP response headers (OWASP A05 Security Misconfiguration)."""

    async def dispatch(self, request: Request, call_next: Callable[[Request], Any]) -> Response:
        response: Response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; img-src 'self' data: https://*.tile.openstreetmap.org; "
            "style-src 'self' 'unsafe-inline'; frame-ancestors 'none'"
        )
        return response


class RequestGuardMiddleware(BaseHTTPMiddleware):
    """Enforces body size limits (A04) and sliding-window rate limiting per client IP."""

    def __init__(
        self,
        app: Any,
        max_body_bytes: int = 32768,
        rate_limit_per_minute: int = 120,
        enabled: bool = True,
    ):
        super().__init__(app)
        self.max_body_bytes = max_body_bytes
        self.rate_limit_per_minute = rate_limit_per_minute
        self.enabled = enabled
        self._requests: dict[str, collections.deque[float]] = collections.defaultdict(collections.deque)

    def reset(self) -> None:
        """Reset rate limiter state (useful for test isolation)."""
        self._requests.clear()

    async def dispatch(self, request: Request, call_next: Callable[[Request], Any]) -> Response:
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > self.max_body_bytes:
            return JSONResponse(
                status_code=413,
                content={"detail": f"Payload too large: exceeds {self.max_body_bytes} bytes"},
            )
        body = await request.body()
        if len(body) > self.max_body_bytes:
            return JSONResponse(
                status_code=413,
                content={"detail": f"Payload too large: exceeds {self.max_body_bytes} bytes"},
            )

        if self.enabled and self.rate_limit_per_minute > 0:
            client_ip = request.client.host if request.client else "127.0.0.1"
            now = time.monotonic()
            window_start = now - 60.0
            history = self._requests[client_ip]
            while history and history[0] < window_start:
                history.popleft()
            if len(history) >= self.rate_limit_per_minute:
                return JSONResponse(
                    status_code=429,
                    content={"detail": f"Rate limit exceeded: {self.rate_limit_per_minute} req/min"},
                )
            history.append(now)

        return await call_next(request)
