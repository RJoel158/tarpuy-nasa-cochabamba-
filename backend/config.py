"""Application runtime configuration with immutable settings dataclass."""

from dataclasses import dataclass, field
import os
from pathlib import Path


def _load_dotenv(path: Path) -> None:
    """Load KEY=VALUE pairs from .env without overriding existing process env."""
    if not path.is_file():
        return
    for raw in path.read_text(encoding="utf-8-sig").splitlines():
        line = raw.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip("'").strip('"')
        if key and key not in os.environ:
            os.environ[key] = value


_load_dotenv(Path(__file__).resolve().parent / ".env")
_load_dotenv(Path(__file__).resolve().parent.parent / ".env")
_load_dotenv(Path(__file__).resolve().parent / ".env")


@dataclass(frozen=True)
class Settings:
    """Immutable application settings for Tarpuy NASA API (OWASP & 12-Factor)."""

    APP_TITLE: str = "Tarpuy NASA Cochabamba API"
    DEBUG: bool = False
    BASE_DIR: Path = field(
        default_factory=lambda: Path(__file__).resolve().parent.parent
    )
    DATA_DIR: Path = field(
        default_factory=lambda: Path(__file__).resolve().parent.parent / "data"
    )
    ALLOWED_ORIGINS: tuple[str, ...] = (
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    )
    RATE_LIMIT_PER_MINUTE: int = 120
    MAX_BODY_BYTES: int = 32768  # 32 KB
    GAMC_WMS_BASE_URL: str = field(
        default_factory=lambda: os.getenv(
            "GAMC_WMS_BASE_URL", "https://serviciosgamc.cochabamba.bo/api/gs/wms"
        )
    )
    WEATHERAPI_KEY: str = field(default_factory=lambda: os.getenv("WEATHERAPI_KEY", ""))
    GAMC_API_KEY: str = field(default_factory=lambda: os.getenv("GAMC_API_KEY", ""))

    @property
    def app_title(self) -> str:
        return self.APP_TITLE

    @property
    def debug(self) -> bool:
        return self.DEBUG

    @property
    def base_dir(self) -> Path:
        return self.BASE_DIR

    @property
    def data_dir(self) -> Path:
        return self.DATA_DIR

    @property
    def allowed_origins(self) -> tuple[str, ...]:
        return self.ALLOWED_ORIGINS

    @property
    def rate_limit_per_minute(self) -> int:
        return self.RATE_LIMIT_PER_MINUTE

    @property
    def max_body_bytes(self) -> int:
        return self.MAX_BODY_BYTES
