"""Phase 2 periurban profile mapping (Option A)."""

from engine.periurban import build_municipal_context, normalize_district_code, resolve_district_profile


def test_normalize_and_d9_profile():
    assert normalize_district_code("9") == "D9"
    assert normalize_district_code("d13") == "D13"
    d9 = resolve_district_profile("D9")
    assert d9["alias"] == "La Maica"
    assert d9["zone_id"] == "punata_valle_alto"
    assert d9["flood_sensitive"] is True


def test_d13_ladera_profile():
    d13 = resolve_district_profile(13)
    assert d13["code"] == "D13" or resolve_district_profile("D13")["slope_bias"] == "ladera"
    assert resolve_district_profile("D13")["zone_id"] == "tapacari_zona_andina"


def test_build_municipal_context_near_drainage_tip():
    ctx = build_municipal_context(
        district_code="D9",
        comuna="Itocta",
        periurban_class="growth",
        near_drainage=True,
        wet_bulletin=True,
    )
    assert ctx["district_code"] == "D9"
    assert "La Maica" in ctx["label_es"]
    assert ctx["near_drainage"] is True
    assert "quebrada" in ctx["tip_es"].lower() or "drenaje" in ctx["tip_es"].lower()
