"""Protocol interfaces for climate data ingestion providers in Tarpuy."""

from typing import Any, Protocol, runtime_checkable


@runtime_checkable
class ClimateDataProvider(Protocol):
    """Protocol defining climate data ingestion provider contracts (SOLID DIP)."""

    def fetch_monthly_climatology(self, lat: float, lon: float) -> dict[str, Any]:
        """Fetch 12-month normalized climatology indicators for given coordinates.

        Args:
            lat: Latitude in decimal degrees (within Bolivia boundary).
            lon: Longitude in decimal degrees (within Bolivia boundary).

        Returns:
            Dictionary containing 12 normalized monthly climatology indicators.
        """
        ...
