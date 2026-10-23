import pytest
from app.scoring.livability import calculate_livability_score
from app.scoring.builder import calculate_builder_suitability
from app.schemas.scoring import LivabilityWeights
from app.schemas.builder import BuilderSuitabilityRequest
from app.services.demo_data_service import DEMO_LOCATIONS

def test_livability_score_deterministic_full_data():
    demo = DEMO_LOCATIONS["sector-62-noida"]
    score_res = calculate_livability_score(
        location_id=demo["id"],
        display_name=demo["display_name"],
        latitude=demo["latitude"],
        longitude=demo["longitude"],
        amenities_data=demo["amenities"],
        weather_climate_data=demo["weather_climate"]
    )

    assert score_res.overall_score > 60.0
    assert score_res.is_partial is False
    assert score_res.data_completeness_pct == 100.0
    assert len(score_res.included_factors) == 5
    assert len(score_res.excluded_factors) == 0
    assert "connectivity" in score_res.factors
    assert "amenities" in score_res.factors
    assert "environment" in score_res.factors
    assert "safety" in score_res.factors
    assert "climate_flood" in score_res.factors
    assert score_res.grade in ["A+", "A", "B+", "B", "C"]

def test_missing_data_normalization_no_zero_fabrication():
    """
    Ensure that when weather/environmental data is absent:
    1. Score is flagged as partial
    2. Missing factors are excluded from the denominator
    3. Missing factors do NOT get artificially set to 0.0 dragging the score down unfairly
    4. Weights are normalized across remaining factors
    """
    demo = DEMO_LOCATIONS["sector-62-noida"]
    
    # Intentionally omit weather and climate data
    score_res = calculate_livability_score(
        location_id="partial_site",
        display_name="Partial Site",
        latitude=demo["latitude"],
        longitude=demo["longitude"],
        amenities_data=demo["amenities"],
        weather_climate_data=None # Missing!
    )

    assert score_res.is_partial is True
    assert score_res.data_completeness_pct < 100.0
    assert "environment" in score_res.excluded_factors
    assert "climate_flood" in score_res.excluded_factors
    assert score_res.factors["environment"].status == "Excluded (No Data)"
    
    # The overall score should be non-zero and reasonably reflective of the available connectivity and amenities
    assert score_res.overall_score > 50.0

def test_builder_suitability_residential_vs_commercial():
    demo = DEMO_LOCATIONS["connaught-place-delhi"]
    
    # Commercial Project
    req_comm = BuilderSuitabilityRequest(
        location_id=demo["id"],
        latitude=demo["latitude"],
        longitude=demo["longitude"],
        display_name=demo["display_name"],
        project_type="commercial",
        budget_bracket="premium",
        target_audience="retail_footfall"
    )
    comm_res = calculate_builder_suitability(
        req_comm,
        amenities_data=demo["amenities"],
        weather_climate_data=demo["weather_climate"]
    )

    # Residential Project
    req_res = BuilderSuitabilityRequest(
        location_id=demo["id"],
        latitude=demo["latitude"],
        longitude=demo["longitude"],
        display_name=demo["display_name"],
        project_type="residential",
        budget_bracket="luxury",
        target_audience="families"
    )
    res_res = calculate_builder_suitability(
        req_res,
        amenities_data=demo["amenities"],
        weather_climate_data=demo["weather_climate"]
    )

    assert comm_res.suitability_score > 0
    assert res_res.suitability_score > 0
    # In Connaught Place (CBD), commercial suitability should be very high
    assert comm_res.suitability_score >= 75.0
    assert len(comm_res.due_diligence_checklist) > 0
    assert len(comm_res.statutory_clearances_required) > 0
    assert "disclaimer" in comm_res.model_dump()

def test_custom_configurable_weights():
    demo = DEMO_LOCATIONS["indiranagar-bengaluru"]
    
    # Custom weights prioritizing environment (40%) and amenities (40%)
    custom_w = LivabilityWeights(
        connectivity=0.10,
        amenities=0.40,
        environment=0.40,
        safety=0.05,
        climate_flood=0.05
    )
    res = calculate_livability_score(
        location_id=demo["id"],
        display_name=demo["display_name"],
        latitude=demo["latitude"],
        longitude=demo["longitude"],
        amenities_data=demo["amenities"],
        weather_climate_data=demo["weather_climate"],
        weights=custom_w
    )

    assert res.overall_score > 0
    assert res.factors["environment"].weight == 0.40
    assert res.factors["amenities"].weight == 0.40
