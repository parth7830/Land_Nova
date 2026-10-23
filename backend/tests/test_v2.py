import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_personas():
    response = client.get("/api/personas")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 3
    persona_ids = [p["id"] for p in data]
    assert "family" in persona_ids
    assert "working_professional" in persona_ids
    assert "bachelor" in persona_ids
    
    # Check weights sum to ~1.0
    for p in data:
        w_sum = sum(p["weights"].values())
        assert abs(w_sum - 1.0) < 0.01

def test_listings_search():
    response = client.get("/api/listings")
    assert response.status_code == 200
    data = response.json()
    assert data["is_demo"] is True
    assert "listings" in data
    assert len(data["listings"]) > 0

    # Test filtering by city
    noida_res = client.get("/api/listings?city=Noida")
    assert noida_res.status_code == 200
    noida_data = noida_res.json()
    for item in noida_data["listings"]:
        assert item["city"].lower() == "noida"

def test_heatmap_generation():
    payload = {
        "min_lat": 28.60,
        "max_lat": 28.65,
        "min_lon": 77.34,
        "max_lon": 77.38,
        "persona": "family",
        "grid_size": 3
    }
    response = client.post("/api/heatmap", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["persona"] == "family"
    assert data["grid_size"] == 3
    assert len(data["cells"]) == 9
    for cell in data["cells"]:
        assert "score" in cell
        assert "grade" in cell
        assert "data_completeness_pct" in cell

def test_developer_site_report():
    payload = {
        "latitude": 28.6280,
        "longitude": 77.3649,
        "display_name": "Sector 62 Site",
        "city": "Noida",
        "project_type": "residential_colony",
        "budget_bracket": "mid_market",
        "target_audience": "families",
        "scale_acres": 3.0
    }
    response = client.post("/api/analysis/site", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "suitability_score" in data
    assert "sections" in data
    sections = data["sections"]
    assert "soil_properties" in sections
    assert "seismic_risk" in sections
    assert "climate_normals" in sections
    assert "groundwater_status" in sections
    assert "connectivity_transport" in sections
    assert "demographics_census" in sections
    assert "market_indicators" in sections
    assert "ai_engineering_recommendations" in data
    assert "data_gaps" in data
