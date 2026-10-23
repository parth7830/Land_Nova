import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_buyer_sectors():
    res = client.get("/api/buyer/sectors?city=Noida")
    assert res.status_code == 200
    data = res.json()
    assert "sectors" in data
    assert len(data["sectors"]) >= 5
    first = data["sectors"][0]
    assert "overall_score" in first
    assert "polygon" in first
    assert "metrics" in first
    assert "aqi" in first["metrics"]
    assert "crime_rate" in first["metrics"]
    assert "water_quality" in first["metrics"]
    # Check data honesty compliance
    assert first["metrics"]["crime_rate"]["confidence"] == "Estimated"
    assert first["metrics"]["water_quality"]["confidence"] == "Estimated"
    assert first["metrics"]["aqi"]["confidence"] == "High"

def test_buyer_evaluate_preferences():
    payload = {
        "city": "Noida",
        "property_types": ["Apartment"],
        "min_budget": 5000000,
        "max_budget": 15000000,
        "preferred_amenities": ["Metro Connectivity", "Schools"],
        "good_aqi": True,
        "low_crime": True,
        "max_commute_minutes": 35
    }
    res = client.post("/api/buyer/evaluate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "weights_applied" in data
    # Check weights sum ~ 1.0
    w_sum = sum(data["weights_applied"].values())
    assert abs(w_sum - 1.0) < 0.02
    assert "top_recommended" in data
    assert len(data["top_recommended"]) > 0

def test_buyer_commute_calculator():
    payload = {
        "origin": [28.6280, 77.3649],      # Sector 62
        "destination": [28.5708, 77.3218], # Sector 18
        "mode": "car"
    }
    res = client.post("/api/buyer/commute", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "distance_km" in data
    assert data["distance_km"] > 0
    assert "duration_minutes" in data
    assert data["duration_minutes"] > 0
    assert "source" in data

def test_buyer_affordability_calculator():
    res = client.get("/api/buyer/affordability?price=8000000&down_payment_pct=20&monthly_household_income=180000")
    assert res.status_code == 200
    data = res.json()
    assert "monthly_emi" in data
    assert data["monthly_emi"] > 0
    assert "debt_to_income_pct" in data
    assert "health_badge" in data

def test_buyer_site_checklist():
    res = client.get("/api/buyer/checklist/sector-62-noida")
    assert res.status_code == 200
    data = res.json()
    assert "checklist" in data
    assert len(data["checklist"]) >= 3
    for item in data["checklist"]:
        assert "category" in item
        assert "title" in item
        assert "reason" in item

def test_buyer_walkability():
    res = client.get("/api/buyer/walkability/sector-62-noida")
    assert res.status_code == 200
    data = res.json()
    assert "walkability_score" in data
    assert data["walkability_score"] > 0
    assert "essentials" in data
    assert len(data["essentials"]) == 7

def test_buyer_flood_and_climate():
    res = client.get("/api/buyer/flood-climate/sector-62-noida")
    assert res.status_code == 200
    data = res.json()
    assert "elevation_m" in data
    assert "elevation_source" in data
    assert "historical_extremes" in data
    assert len(data["historical_extremes"]) == 10
    assert "seasonal_aqi_trend" in data
    assert len(data["seasonal_aqi_trend"]) == 12

def test_buyer_ai_natural_language_query():
    res = client.post("/api/buyer/ai-query", json={"query": "areas under 1Cr with good metro access", "city": "Noida"})
    assert res.status_code == 200
    data = res.json()
    assert "tool_call_trace" in data
    assert "top_matches" in data
    assert "ai_summary" in data

def test_buyer_waterfall_explainability():
    res = client.get("/api/buyer/waterfall/sector-62-noida")
    assert res.status_code == 200
    data = res.json()
    assert "waterfall_bars" in data
    assert len(data["waterfall_bars"]) == 5
    for bar in data["waterfall_bars"]:
        assert "pillar" in bar
        assert "raw_score" in bar
        assert "contribution" in bar

