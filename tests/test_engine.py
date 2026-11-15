"""Tests for agronomy engine: protocols, multi-criteria scoring, and recommendations."""

import pytest

from engine import (
    CropRepository,
    JsonCropRepository,
    JsonZoneRepository,
    MultiCriteriaRotationScorer,
    RotationRecommendationService,
    RotationScorer,
    ZoneRepository,
)


class TestProtocols:
    """Validate runtime protocol conformance for DIP compliance."""

    def test_protocol_adherence(self):
        scorer = MultiCriteriaRotationScorer()
        zone_repo = JsonZoneRepository()
        crop_repo = JsonCropRepository()

        assert isinstance(scorer, RotationScorer)
        assert isinstance(zone_repo, ZoneRepository)
        assert isinstance(crop_repo, CropRepository)


class TestScoring:
    """Validate dynamic multi-criteria rotation scoring and pest cycle rules."""

    @pytest.fixture
    def setup_data(self):
        zone_repo = JsonZoneRepository()
        crop_repo = JsonCropRepository()
        zone = zone_repo.get_zone("punata_valle_alto")
        crops_map = crop_repo.get_crops_map()
        scorer = MultiCriteriaRotationScorer()
        return zone, crops_map, scorer

    def test_scoring_changes_with_priorities_and_bounds(self, setup_data):
        zone, crops_map, scorer = setup_data
        strat = zone["strategies"][1]
        constraints = {"irrigation_access": "deficit_auxiliary"}

        score_water = scorer.score_strategy(strat, zone, crops_map, ["water_conservation"], constraints, "maiz_valle")
        score_forage = scorer.score_strategy(strat, zone, crops_map, ["forage_value"], constraints, "maiz_valle")
        score_nitrogen = scorer.score_strategy(strat, zone, crops_map, ["nitrogen_fixation"], constraints, "maiz_valle")

        for res in (score_water, score_forage, score_nitrogen):
            val = res["priority_alignment_score"]
            assert 0.0 <= val <= 1.0
            assert isinstance(val, float)
            assert val == round(val, 2)

        assert score_nitrogen["priority_alignment_score"] >= 0.80
        assert score_water["priority_alignment_score"] != score_forage["priority_alignment_score"]

    def test_breaking_botanical_family_rewards_rotation(self, setup_data):
        zone, crops_map, scorer = setup_data
        constraints = {"irrigation_access": "deficit_auxiliary"}

        solanaceae_monoculture = {
            "strategy_id": "test_monoculture",
            "strategy_type": "adaptive_alternative",
            "crop_sequence": [{"crop_id": "papa_huaycha"}],
            "nasa_evidence": "Test evidence",
        }
        legume_rotation = {
            "strategy_id": "test_rotation",
            "strategy_type": "adaptive_alternative",
            "crop_sequence": [{"crop_id": "tarwi"}],
            "nasa_evidence": "Test evidence",
        }

        s_mono = scorer.score_strategy(solanaceae_monoculture, zone, crops_map, ["nitrogen_fixation"], constraints, "papa_huaycha")
        s_rot = scorer.score_strategy(legume_rotation, zone, crops_map, ["nitrogen_fixation"], constraints, "papa_huaycha")

        assert s_rot["priority_alignment_score"] > s_mono["priority_alignment_score"]

    def test_immutability_and_nasa_evidence_telemetry(self, setup_data):
        zone, crops_map, scorer = setup_data
        strat = zone["strategies"][0]
        original_evidence = strat.get("nasa_evidence", "")

        scored = scorer.score_strategy(strat, zone, crops_map, ["water_conservation"], {}, "maiz_valle")

        assert strat.get("nasa_evidence") == original_evidence
        assert "priority_alignment_score" not in strat or strat["priority_alignment_score"] != scored["priority_alignment_score"]
        assert "Telemetría NASA POWER:" in scored["nasa_evidence"]
        assert "Precipitación anual" in scored["nasa_evidence"]

    def test_near_drainage_wet_bulletin_changes_score_or_water_light(self, setup_data):
        zone, crops_map, scorer = setup_data
        strat = zone["strategies"][1]
        constraints = {"irrigation_access": "deficit_auxiliary"}
        base = scorer.score_strategy(strat, zone, crops_map, ["water_conservation"], constraints, "maiz_valle")
        wet_drain = scorer.score_strategy(
            strat,
            zone,
            crops_map,
            ["water_conservation"],
            constraints,
            "maiz_valle",
            {
                "periurban_pressure": "growth",
                "near_drainage": True,
                "wet_bulletin": True,
                "flood_sensitive": True,
                "label_es": "Distrito 9 · La Maica",
                "tip_es": "Valle periurbano",
            },
        )
        assert wet_drain["priority_alignment_score"] <= base["priority_alignment_score"]
        assert wet_drain.get("visual_traffic_light", {}).get("water") in {"red", "yellow"}
        assert "Contexto GAMC" in wet_drain.get("nasa_evidence", "")

    def test_consolidated_periurban_penalizes_long_sequences(self, setup_data):
        zone, crops_map, scorer = setup_data
        long_strat = {
            "strategy_id": "test_long",
            "strategy_type": "adaptive_alternative",
            "crop_sequence": [
                {"crop_id": "maiz_valle"},
                {"crop_id": "haba"},
                {"crop_id": "quinua"},
                {"crop_id": "cebada"},
            ],
            "nasa_evidence": "Test",
            "visual_traffic_light": {"water": "green", "soil": "green", "frost": "green", "erosion": "green"},
        }
        constraints = {"irrigation_access": "deficit_auxiliary"}
        plain = scorer.score_strategy(long_strat, zone, crops_map, ["erosion_control"], constraints, "maiz_valle")
        consolid = scorer.score_strategy(
            long_strat,
            zone,
            crops_map,
            ["erosion_control"],
            constraints,
            "maiz_valle",
            {"periurban_pressure": "consolidated", "near_drainage": False, "wet_bulletin": False},
        )
        assert consolid["priority_alignment_score"] < plain["priority_alignment_score"]


class TestRecommenderService:
    """Validate recommendation ordering, input checks, and offline bundle integrity."""

    def test_recommend_returns_minimum_strategies_and_baseline_first(self):
        service = RotationRecommendationService()
        res = service.recommend(
            zone_id="punata_valle_alto",
            current_crop_id="maiz_valle",
            farmer_priorities=["water_conservation", "forage_value"],
            constraints={"irrigation_access": "deficit_auxiliary"},
        )

        assert res["zone_id"] == "punata_valle_alto"
        assert res["current_crop_id"] == "maiz_valle"
        assert len(res["strategies"]) >= 3

        assert res["strategies"][0]["strategy_type"] == "current_baseline"

        alts = [s for s in res["strategies"] if s["strategy_type"] == "adaptive_alternative"]
        alt_scores = [s["priority_alignment_score"] for s in alts]
        assert alt_scores == sorted(alt_scores, reverse=True)

        prov = res["data_provenance"]
        assert "nasa_datasets" in prov and len(prov["nasa_datasets"]) > 0
        assert "soil_dataset" in prov
        assert "etl_status" in prov
        assert len(prov["integrity_sha256"]) == 64

    def test_recommend_with_d9_municipal_context(self):
        service = RotationRecommendationService()
        res = service.recommend(
            zone_id="punata_valle_alto",
            current_crop_id="maiz_valle",
            farmer_priorities=["water_conservation", "erosion_control"],
            constraints={"irrigation_access": "deficit_auxiliary"},
            municipal_context={
                "district_code": "D9",
                "comuna": "Itocta",
                "periurban_class": "growth",
                "near_drainage": True,
                "wet_bulletin": True,
            },
        )
        assert res["municipal_context"]["district_code"] == "D9"
        assert "La Maica" in (res["municipal_context"].get("label_es") or "")
        assert res["municipal_context"]["flood_sensitive"] is True
        assert len(res["strategies"]) >= 3

    def test_recommend_validation_raises_on_unknown(self):
        service = RotationRecommendationService()
        with pytest.raises(ValueError, match="Unknown zone"):
            service.recommend("unknown_zone", "maiz_valle", ["water_conservation"], {})

        with pytest.raises(ValueError, match="Unknown crop"):
            service.recommend("punata_valle_alto", "unknown_crop", ["water_conservation"], {})

    def test_build_offline_bundle(self):
        service = RotationRecommendationService()
        bundle = service.build_offline_bundle("tapacari_zona_andina")

        assert bundle["bundle_id"] == "bundle_tapacari_zona_andina"
        assert bundle["zone_id"] == "tapacari_zona_andina"
        assert "zone_profile" in bundle
        assert "crops_catalog" in bundle and len(bundle["crops_catalog"]) >= 8
        assert "precomputed_recommendations" in bundle and len(bundle["precomputed_recommendations"]) >= 3
        assert len(bundle["integrity_sha256"]) == 64
