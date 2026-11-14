"""Pydantic validation schemas with strict extra='forbid' (OWASP A03/A04)."""

from typing import Literal
from pydantic import BaseModel, ConfigDict, Field

IrrigationType = Literal["none_secano", "deficit_auxiliary", "full_canal_well"]
EquipmentType = Literal["manual_yunta", "mixed_tractor_service", "mechanized"]
LanguageType = Literal["es", "qu", "bilingual"]
FarmerPriority = Literal[
    "water_conservation",
    "nitrogen_fixation",
    "erosion_control",
    "forage_value",
    "organic_matter",
    "market_income",
]


class BaseStrictModel(BaseModel):
    """Base schema enforcing extra='forbid' and string stripping."""

    model_config = ConfigDict(extra="forbid", str_strip_whitespace=True)


class ConstraintsInput(BaseStrictModel):
    """Agronomic and socio-technical constraints for smallholders."""

    irrigation_access: IrrigationType
    equipment_level: EquipmentType
    language_preference: LanguageType = "bilingual"


class MunicipalContextInput(BaseStrictModel):
    """Optional GAMC municipal signals (district, periurban, drainage)."""

    district_code: str | None = Field(default=None, max_length=8)
    comuna: str | None = Field(default=None, max_length=80)
    periurban_class: str | None = Field(default=None, max_length=64)
    periurban_pressure: str | None = Field(default=None, max_length=32)
    periurban_detail: str | None = Field(default=None, max_length=160)
    near_drainage: bool = False
    drainage_tipo: str | None = Field(default=None, max_length=32)
    drainage_clasificacion: str | None = Field(default=None, max_length=80)
    wet_bulletin: bool = False


class RecommendationRequest(BaseStrictModel):
    """Request payload for multi-criteria rotation recommendation."""

    zone_id: str = Field(..., pattern=r"^[a-z0-9_]{3,40}$")
    current_crop_id: str = Field(..., pattern=r"^[a-z0-9_]{3,40}$")
    farmer_priorities: list[FarmerPriority] = Field(..., min_length=1, max_length=6)
    constraints: ConstraintsInput
    municipal_context: MunicipalContextInput | None = None


class HealthResponse(BaseStrictModel):
    """Health check response schema."""

    status: str = "healthy"
    version: str = "1.0.0"
    zones_loaded: int
    telemetry_source: str


class QuechuaTtsRequest(BaseStrictModel):
    """Request schema for live Bolivian Quechua speech synthesis (OWASP strict bounds)."""

    text: str = Field(..., min_length=2, max_length=480)
