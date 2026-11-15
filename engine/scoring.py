"""Multi-criteria crop rotation scoring engine using NASA agro-climatic indicators."""

import copy
from typing import Any

from engine.interfaces import RotationScorer

LEVEL_SCORES = {"high": 1.0, "medium": 0.6, "low": 0.25, "none": 0.0}
WATER_SAVINGS = {"low": 1.0, "medium": 0.55, "high": 0.15, "none": 0.5}


class MultiCriteriaRotationScorer(RotationScorer):
    """Evaluates rotation strategies against smallholder priorities and NASA data."""

    def score_strategy(
        self,
        strategy: dict[str, Any],
        zone: dict[str, Any],
        crops_map: dict[str, dict[str, Any]],
        priorities: list[str],
        constraints: dict[str, Any],
        current_crop_id: str,
        municipal_context: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Score strategy and enrich telemetry evidence without mutating input."""
        scored = copy.deepcopy(strategy)
        crops = [crops_map.get(c.get("crop_id", "")) for c in scored.get("crop_sequence", [])]
        crops = [c for c in crops if c is not None]
        muni = municipal_context or {}

        w_save = sum(WATER_SAVINGS.get(c.get("water_demand", "medium"), 0.5) for c in crops) / max(len(crops), 1)
        d_tol = sum(LEVEL_SCORES.get(c.get("drought_tolerance", "medium"), 0.5) for c in crops) / max(len(crops), 1)
        n_fix = 0.95 if any(c.get("nitrogen_fixing", {}).get("is_fixing") for c in crops) else 0.2
        eros = sum(LEVEL_SCORES.get(c.get("erosion_protection", "medium"), 0.5) for c in crops) / max(len(crops), 1)
        forage = sum(LEVEL_SCORES.get(c.get("forage_value", "none"), 0.0) for c in crops) / max(len(crops), 1)
        om = 0.85 if any(c.get("botanical_family") in {"Poaceae", "Fabaceae"} for c in crops) else 0.3
        mkt = sum(0.9 if "alta" in c.get("market_suitability", "").lower() else 0.5 for c in crops) / max(len(crops), 1)

        has_fallow = any(c.get("crop_id") == "bare_soil_fallow" for c in scored.get("crop_sequence", []))
        if has_fallow:
            eros = max(0.1, eros - 0.25)
            om = max(0.1, om - 0.3)
            w_save = max(0.1, w_save - 0.15)

        priority_metric_map = {
            "water_conservation": (w_save + d_tol) / 2.0,
            "nitrogen_fixation": n_fix,
            "erosion_control": eros,
            "forage_value": forage,
            "organic_matter": om,
            "market_income": mkt,
        }

        active_priorities = priorities or list(priority_metric_map.keys())
        p_scores = [priority_metric_map.get(p, 0.5) for p in active_priorities]
        base_score = sum(p_scores) / max(len(p_scores), 1)

        # Pest cycle break: reward rotating away from current crop botanical family
        curr_crop = crops_map.get(current_crop_id, {})
        curr_fam = curr_crop.get("botanical_family", "")
        seq_fams = {c.get("botanical_family") for c in crops if c.get("botanical_family")}
        if curr_fam and seq_fams:
            pest_bonus = 0.12 if any(f != curr_fam for f in seq_fams) else -0.12
        else:
            pest_bonus = 0.0

        # Climate & telemetry adjustments
        inds = zone.get("monthly_harmonized_indicators", [])
        ann_precip = sum(float(m.get("precip_mm", 0.0)) for m in inds)
        min_moist = min((float(m.get("soil_moisture_index", 1.0)) for m in inds), default=0.5)
        frost_days = sum(int(m.get("frost_risk_days", 0)) for m in inds)
        bare_months = sum(1 for m in inds if m.get("bare_soil_flag", False))

        climate_adj = 0.0
        irrigation = constraints.get("irrigation_access", "deficit_auxiliary")
        if irrigation == "none_secano":
            high_water = any(c.get("water_demand") == "high" for c in crops)
            if high_water and min_moist < 0.40:
                climate_adj -= 0.15
            if any(c.get("drought_tolerance") == "high" for c in crops):
                climate_adj += 0.08

        if bare_months >= 3 and has_fallow:
            climate_adj -= 0.10

        # GAMC periurban / drainage adjustments (Field Shift Cochabamba)
        muni_adj = 0.0
        pressure = str(muni.get("periurban_pressure") or "none")
        seq_len = len(scored.get("crop_sequence") or [])
        cover_ok = eros >= 0.55 or any(
            c.get("botanical_family") in {"Poaceae", "Fabaceae"} for c in crops
        )
        if pressure == "consolidated":
            if seq_len >= 4:
                muni_adj -= 0.10
            if cover_ok and not has_fallow:
                muni_adj += 0.08
            if has_fallow:
                muni_adj -= 0.06
        elif pressure == "growth":
            if cover_ok and not has_fallow:
                muni_adj += 0.04

        near_drain = bool(muni.get("near_drainage"))
        flood_sensitive = bool(muni.get("flood_sensitive"))
        wet = bool(muni.get("wet_bulletin"))
        high_water = any(c.get("water_demand") == "high" for c in crops)
        if near_drain and wet and high_water:
            muni_adj -= 0.12
        elif flood_sensitive and wet and high_water:
            muni_adj -= 0.05
        if near_drain and wet and any(c.get("water_demand") == "low" for c in crops):
            muni_adj += 0.05

        if muni.get("slope_bias") == "ladera" and eros >= 0.55:
            muni_adj += 0.04

        final_score = round(max(0.0, min(1.0, base_score + pest_bonus + climate_adj + muni_adj)), 2)
        scored["priority_alignment_score"] = float(final_score)

        tl = dict(scored.get("visual_traffic_light") or {})
        if near_drain and wet:
            tl["water"] = "red" if high_water else "yellow"
            scored["visual_traffic_light"] = tl

        # Append live telemetry summary to nasa_evidence
        tag = "Telemetría NASA POWER:"
        evidence = scored.get("nasa_evidence", "")
        if tag not in evidence and inds:
            telemetry_line = (
                f"{tag} Precipitación anual {ann_precip:.1f}mm, "
                f"Humedad de suelo mínima {min_moist:.2f}, "
                f"Días con riesgo de helada {frost_days}."
            )
            scored["nasa_evidence"] = f"{evidence} {telemetry_line}".strip()

        if muni.get("label_es") or muni.get("tip_es"):
            gamc_line = (
                f"Contexto GAMC: {muni.get('label_es') or 'distrito municipal'}. "
                f"{muni.get('tip_es') or ''}"
            ).strip()
            if "Contexto GAMC:" not in scored.get("nasa_evidence", ""):
                scored["nasa_evidence"] = f"{scored.get('nasa_evidence', '')} {gamc_line}".strip()

        return scored
