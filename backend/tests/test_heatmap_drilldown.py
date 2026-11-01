import pytest
from starlette.testclient import TestClient
from app.main import app
from app.services.layer_scoring_service import (
    score_schools,
    score_hospitals,
    score_transport,
    score_parks,
    score_amenities,
    score_aqi,
    score_crime,
    score_noise,
    combine_layer_scores,
    generate_area_drilldown_grid,
    AREA_HEATMAP_CACHE
)

client = TestClient(app)


def test_layer_scoring_functions_range():
    """All layer scoring functions must return values between 0 and 100."""
    assert 0.0 <= score_schools(8, 200.0) <= 100.0
    assert 0.0 <= score_schools(0, 3000.0) <= 100.0

    assert 0.0 <= score_hospitals(5, 400.0) <= 100.0
    assert 0.0 <= score_hospitals(0, 4000.0) <= 100.0

    assert 0.0 <= score_transport(8, 300.0) <= 100.0
    assert 0.0 <= score_transport(0, 3000.0) <= 100.0

    assert 0.0 <= score_parks(8, 200.0) <= 100.0
    assert 0.0 <= score_parks(0, 2000.0) <= 100.0

    assert 0.0 <= score_amenities(12, 200.0) <= 100.0
    assert 0.0 <= score_amenities(0, 2500.0) <= 100.0


def test_inverted_layers_consistency():
    """
    Inverted layers must ensure green/higher score is always 'good for user':
    - Lower AQI = Higher score (cleaner air)
    - Lower crime distance/higher safety = Higher score
    - Farther from highway = Higher quietness score
    """
    # Clean air (AQI 50) must score significantly higher than severe smog (AQI 300)
    clean_air_score = score_aqi(50)
    smog_score = score_aqi(300)
    assert clean_air_score > smog_score
    assert clean_air_score >= 80.0
    assert smog_score <= 40.0

    # Closer police post (0.5 km) must score higher safety than isolated (2.8 km)
    safe_score = score_crime(0.5, lighting_coverage_pct=90.0)
    unsafe_score = score_crime(2.8, lighting_coverage_pct=40.0)
    assert safe_score > unsafe_score

    # Quiet residential (500m from highway) must score higher than next to highway (50m)
    quiet_score = score_noise(major_road_distance_m=500, commercial_density=0.1)
    noisy_score = score_noise(major_road_distance_m=50, commercial_density=0.6)
    assert quiet_score > noisy_score


def test_combine_layer_scores_weight_normalization():
    """Combined scores must normalize weights to 100% and stay between 0 and 100."""
    scores = {
        "schools": 90.0,
        "hospitals": 80.0,
        "transport": 85.0,
        "parks": 70.0,
        "amenities": 88.0,
        "aqi": 75.0,
        "crime": 80.0,
        "noise": 65.0
    }
    # Unnormalized weights (sum = 200)
    weights = {"schools": 50.0, "transport": 100.0, "parks": 50.0}
    combined = combine_layer_scores(scores, weights)
    assert 0.0 <= combined <= 100.0
    # Expected: (90*0.25) + (85*0.5) + (70*0.25) = 22.5 + 42.5 + 17.5 = 82.5
    assert abs(combined - 82.5) < 0.5


def test_api_heatmap_layers_metadata():
    """GET /api/heatmap/layers returns all 9 supported layers."""
    res = client.get("/api/heatmap/layers")
    assert res.status_code == 200
    data = res.json()
    assert "layers" in data
    layer_ids = [l["id"] for l in data["layers"]]
    for required in ["all", "schools", "hospitals", "crime", "aqi", "transport", "amenities", "parks", "noise"]:
        assert required in layer_ids


def test_api_area_heatmap_drilldown():
    """GET /api/heatmap/area returns a 25x25 clipped grid, summary, and POIs."""
    res = client.get("/api/heatmap/area?area_id=sector-62-noida&layer=schools")
    assert res.status_code == 200
    data = res.json()
    assert data["area_id"] == "sector-62-noida"
    assert data["layer"] == "schools"
    assert "cells" in data
    assert len(data["cells"]) > 50  # Must contain clipped cells inside polygon
    assert "summary" in data
    assert "best_block" in data["summary"]
    assert "worst_block" in data["summary"]
    assert "nearest_school" in data["summary"]
    assert "pois" in data
    assert len(data["pois"]) > 0

    # Ensure every cell score is 0-100 and has a valid hex color
    for c in data["cells"][:10]:
        assert 0.0 <= c["score"] <= 100.0
        assert c["color"].startswith("#")


def test_area_heatmap_cache():
    """Repeat requests with same area and layer return cached responses instantly."""
    AREA_HEATMAP_CACHE.clear()
    res1 = client.get("/api/heatmap/area?area_id=sector-50-noida&layer=transport")
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["is_cached"] is False

    res2 = client.get("/api/heatmap/area?area_id=sector-50-noida&layer=transport")
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["is_cached"] is True
    assert data2["total_cells"] == data1["total_cells"]
