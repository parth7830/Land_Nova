from fastapi.testclient import TestClient
from app.main import app
from app.services.reviews_service import init_reviews_db

init_reviews_db()
client = TestClient(app)

def test_get_reviews_returns_seeded_data_and_aggregates():
    response = client.get("/api/reviews?area_id=sector-62-noida")
    assert response.status_code == 200
    data = response.json()
    assert "stats" in data
    assert "reviews" in data
    assert data["stats"]["total_reviews"] >= 2
    assert data["stats"]["average_rating"] > 0
    assert "category_averages" in data["stats"]
    assert "safety" in data["stats"]["category_averages"]
    assert "connectivity" in data["stats"]["category_averages"]
    assert "rating_distribution" in data["stats"]
    assert len(data["reviews"]) >= 2
    # Verify demo label
    assert data["reviews"][0]["is_demo"] is True

def test_create_review_success():
    payload = {
        "area_id": "sector-62-noida",
        "property_id": "prop-101",
        "overall_rating": 4.5,
        "rating_safety": 5.0,
        "rating_connectivity": 4.5,
        "rating_cleanliness": 4.0,
        "rating_noise": 4.0,
        "rating_water_power": 4.5,
        "rating_community": 5.0,
        "review_text": "Living here has been a peaceful and highly convenient experience for our family.",
        "resident_type": "Owner",
        "duration_of_stay": "1-3 years"
    }
    response = client.post("/api/reviews", json=payload)
    assert response.status_code == 200
    created = response.json()
    assert created["id"].startswith("rev-")
    assert created["is_demo"] is False
    assert created["helpful_count"] == 0
    assert created["overall_rating"] == 4.5

def test_create_review_validation_min_length():
    payload = {
        "area_id": "sector-62-noida",
        "overall_rating": 4.0,
        "review_text": "Too short",
        "resident_type": "Tenant",
        "duration_of_stay": "6-12 months"
    }
    response = client.post("/api/reviews", json=payload)
    assert response.status_code == 422 or response.status_code == 400

def test_create_review_validation_max_length():
    payload = {
        "area_id": "sector-62-noida",
        "overall_rating": 4.0,
        "review_text": "A" * 501,
        "resident_type": "Tenant",
        "duration_of_stay": "6-12 months"
    }
    response = client.post("/api/reviews", json=payload)
    assert response.status_code == 422 or response.status_code == 400

def test_create_review_spam_keyword_rejected():
    payload = {
        "area_id": "sector-62-noida",
        "overall_rating": 4.0,
        "review_text": "Great place but please visit https://freemoney.com to claim cash prize now!",
        "resident_type": "Tenant",
        "duration_of_stay": "6-12 months"
    }
    response = client.post("/api/reviews", json=payload)
    assert response.status_code == 400
    assert "spam" in response.json()["detail"].lower()

def test_helpful_vote_increments():
    # Fetch existing reviews
    res = client.get("/api/reviews?area_id=sector-62-noida")
    reviews = res.json()["reviews"]
    target_review = reviews[0]
    initial_count = target_review["helpful_count"]

    vote_res = client.post(f"/api/reviews/{target_review['id']}/helpful")
    assert vote_res.status_code == 200
    updated = vote_res.json()
    assert updated["helpful_count"] == initial_count + 1

def test_reviews_filter_by_resident_type():
    res_owner = client.get("/api/reviews?area_id=sector-62-noida&resident_type=Owner")
    assert res_owner.status_code == 200
    data = res_owner.json()
    for r in data["reviews"]:
        assert r["resident_type"] == "Owner"
