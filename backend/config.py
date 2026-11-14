"""Application runtime configuration with immutable settings dataclass."""

from dataclasses import dataclass, field
from pathlib import Path


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
