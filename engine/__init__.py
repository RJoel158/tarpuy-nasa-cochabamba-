"""Engine package for agronomic crop rotation scoring and recommendations."""

from engine.alerts import AgroclimaticAlertEvaluator
from engine.categories import (
    CROP_CATEGORIES,
    get_category_botanical_families,
    get_crop_categories_list,
)
from engine.interfaces import CropRepository, RotationScorer, ZoneRepository
from engine.recommender import (
    JsonCropRepository,
    JsonZoneRepository,
    RotationRecommendationService,
)
from engine.scoring import MultiCriteriaRotationScorer

__all__ = [
    "AgroclimaticAlertEvaluator",
    "CROP_CATEGORIES",
    "CropRepository",
    "JsonCropRepository",
    "JsonZoneRepository",
    "MultiCriteriaRotationScorer",
    "RotationRecommendationService",
    "RotationScorer",
    "ZoneRepository",
    "get_category_botanical_families",
    "get_crop_categories_list",
]
