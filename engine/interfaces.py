"""Protocol interfaces for repositories and agronomic rotation scorers (SOLID DIP/ISP)."""

from typing import Any, Protocol, runtime_checkable


@runtime_checkable
class ZoneRepository(Protocol):
    """Protocol for accessing agro-ecological pilot zone profiles."""

    def list_zones(self) -> list[dict[str, Any]]:
        """Return all supported pilot zones."""
        ...

    def get_zone(self, zone_id: str) -> dict[str, Any] | None:
        """Return zone profile by zone_id, or None if not found."""
        ...


@runtime_checkable
class CropRepository(Protocol):
    """Protocol for accessing Andean and valley crop agronomic traits."""

    def list_crops(self) -> list[dict[str, Any]]:
        """Return catalog of available crop profiles."""
        ...

    def get_crops_map(self) -> dict[str, dict[str, Any]]:
        """Return mapping of crop_id to crop traits dictionary."""
        ...


@runtime_checkable
class RotationScorer(Protocol):
    """Protocol for scoring crop rotation strategies against farmer priorities."""

    def score_strategy(
        self,
        strategy: dict[str, Any],
        zone: dict[str, Any],
        crops_map: dict[str, dict[str, Any]],
        priorities: list[str],
        constraints: dict[str, Any],
        current_crop_id: str,
    ) -> dict[str, Any]:
        """Score strategy and return a new enriched strategy dictionary."""
        ...
