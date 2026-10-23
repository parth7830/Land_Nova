import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "version" in data
    assert "supported_data_sources" in data

def test_demo_locations_endpoint():
    response = client.get("/api/locations/demo")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 4
    noida = next((d for d in data if "sector-62" in d["id"]), None)
    assert noida is not None
    assert noida["latitude"] == pytest.approx(28.628, 0.01)

def test_geocode_search():
    response = client.get("/api/geocode?q=Sector 62 Noida")
    assert response.status_code == 200
    results = response.json()
    assert len(results) > 0
    assert "Noida" in results[0]["display_name"]

def test_livability_assessment_api():
    payload = {
        "location_id": "sector-62-noida",
        "latitude": 28.6280,
        "longitude": 77.3649,
        "display_name": "Sector 62, Noida",
        "user_persona": "family"
    }
    response = client.post("/api/analysis/livability", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "overall_score" in data
    assert data["overall_score"] > 60.0
    assert "grade" in data
    assert "factors" in data
    assert data["data_completeness_pct"] == 100.0

def test_builder_suitability_api():
    payload = {
        "location_id": "connaught-place-delhi",
        "latitude": 28.6315,
        "longitude": 77.2167,
        "display_name": "Connaught Place",
        "project_type": "commercial",
        "budget_bracket": "premium"
    }
    response = client.post("/api/analysis/development", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "suitability_score" in data
    assert "feasibility_verdict" in data
    assert len(data["metrics"]) > 0

def test_location_comparison_api():
    payload = {
        "location_a_id": "sector-62-noida",
        "location_a_lat": 28.6280,
        "location_a_lon": 77.3649,
        "location_a_name": "Sector 62 Noida",
        "location_b_id": "connaught-place-delhi",
        "location_b_lat": 28.6315,
        "location_b_lon": 77.2167,
        "location_b_name": "Connaught Place Delhi"
    }
    response = client.post("/api/analysis/compare", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "location_a" in data
    assert "location_b" in data
    assert "score_delta" in data
    assert "category_winners" in data

def test_ai_chat_advisor_demo_fallback():
    payload = {
        "message": "Is this area suitable for a family?",
        "location_id": "sector-62-noida",
        "location_name": "Sector 62 Noida",
        "location_context": {
            "overall_score": 78.4,
            "transit_nodes": 6,
            "schools": 8,
            "hospitals": 5,
            "us_aqi": 168,
            "flood_risk_level": "Moderate",
            "elevation_m": 204
        }
    }
    response = client.post("/api/ai/chat", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert "verified_facts_cited" in data
    assert len(data["verified_facts_cited"]) > 0
