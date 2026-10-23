from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from app.schemas.scoring import (
    LivabilityRequest, LivabilityResponse, LocationComparisonRequest, LocationComparisonResponse
)
from app.schemas.builder import BuilderSuitabilityRequest, BuilderSuitabilityResponse
from app.scoring.livability import calculate_livability_score
from app.scoring.builder import calculate_builder_suitability
from app.services.amenities_service import fetch_amenities_for_location
from app.services.weather_service import fetch_weather_and_climate
from app.services.site_intelligence_service import generate_site_intelligence_report
from pydantic import BaseModel, Field
from typing import Optional

class DeveloperSiteReportRequest(BaseModel):
    latitude: float
    longitude: float
    display_name: Optional[str] = "Selected Development Site"
    city: Optional[str] = "Noida"
    project_type: Optional[str] = "residential_colony"
    budget_bracket: Optional[str] = "mid_market"
    target_audience: Optional[str] = "families"
    scale_acres: Optional[float] = 2.5

router = APIRouter(tags=["Location Analysis & Scoring Engine"])

@router.post("/livability", response_model=LivabilityResponse)
async def assess_livability(request: LivabilityRequest):
    """
    Computes deterministic Livability Score (0-100) across 5 core dimensions:
    - Connectivity (25%)
    - Nearby Amenities (25%)
    - Environmental Quality (20%)
    - Safety Heuristic (15%)
    - Climate & Flood Resilience (15%)
    Handles missing data transparently without fabricating false zeroes.
    """
    loc_id = request.location_id or f"loc_{round(request.latitude, 4)}_{round(request.longitude, 4)}"
    
    # Fetch amenities and weather
    amenities = await fetch_amenities_for_location(loc_id, request.latitude, request.longitude)
    weather = await fetch_weather_and_climate(loc_id, request.latitude, request.longitude)

    response = calculate_livability_score(
        location_id=loc_id,
        display_name=request.display_name or "Target Location",
        latitude=request.latitude,
        longitude=request.longitude,
        amenities_data=amenities.model_dump(),
        weather_climate_data=weather.model_dump(),
        weights=request.weights,
        user_persona=request.user_persona
    )
    return response

@router.post("/development", response_model=BuilderSuitabilityResponse)
async def assess_builder_suitability(request: BuilderSuitabilityRequest):
    """
    Generates preliminary development suitability report for builders and developers.
    Evaluates road accessibility, catchment profiles, utility readiness, and flood/terrain risks.
    """
    loc_id = request.location_id or f"site_{round(request.latitude, 4)}_{round(request.longitude, 4)}"
    
    amenities = await fetch_amenities_for_location(loc_id, request.latitude, request.longitude)
    weather = await fetch_weather_and_climate(loc_id, request.latitude, request.longitude)

    response = calculate_builder_suitability(
        request=request,
        amenities_data=amenities.model_dump(),
        weather_climate_data=weather.model_dump()
    )
    return response

@router.post("/compare", response_model=LocationComparisonResponse)
async def compare_locations(request: LocationComparisonRequest):
    """
    Side-by-side head-to-head comparison of two locations using the exact same deterministic scoring engine.
    """
    # Score Location A
    amenities_a = await fetch_amenities_for_location(
        request.location_a_id or "loc_a", request.location_a_lat, request.location_a_lon
    )
    weather_a = await fetch_weather_and_climate(
        request.location_a_id or "loc_a", request.location_a_lat, request.location_a_lon
    )
    score_a = calculate_livability_score(
        location_id=request.location_a_id or "loc_a",
        display_name=request.location_a_name,
        latitude=request.location_a_lat,
        longitude=request.location_a_lon,
        amenities_data=amenities_a.model_dump(),
        weather_climate_data=weather_a.model_dump(),
        weights=request.weights
    )

    # Score Location B
    amenities_b = await fetch_amenities_for_location(
        request.location_b_id or "loc_b", request.location_b_lat, request.location_b_lon
    )
    weather_b = await fetch_weather_and_climate(
        request.location_b_id or "loc_b", request.location_b_lat, request.location_b_lon
    )
    score_b = calculate_livability_score(
        location_id=request.location_b_id or "loc_b",
        display_name=request.location_b_name,
        latitude=request.location_b_lat,
        longitude=request.location_b_lon,
        amenities_data=amenities_b.model_dump(),
        weather_climate_data=weather_b.model_dump(),
        weights=request.weights
    )

    # Category Winners
    category_winners = {}
    for cat_key in ["connectivity", "amenities", "environment", "safety", "climate_flood"]:
        s_a = score_a.factors[cat_key].score
        s_b = score_b.factors[cat_key].score
        if s_a > s_b + 2:
            category_winners[cat_key] = request.location_a_name
        elif s_b > s_a + 2:
            category_winners[cat_key] = request.location_b_name
        else:
            category_winners[cat_key] = "Tied / Comparable"

    delta = round(score_a.overall_score - score_b.overall_score, 1)
    
    if delta > 3.0:
        head_summary = f"{request.location_a_name} holds a {abs(delta)} point lead over {request.location_b_name}, driven by higher performance in {', '.join([k for k, v in category_winners.items() if v == request.location_a_name])}."
        buyer_verdict = f"{request.location_a_name} is recommended for buyers prioritizing higher baseline livability and established civic infrastructure."
        builder_verdict = f"{request.location_a_name} offers a more mature commercial/residential catchment, while {request.location_b_name} may offer lower land acquisition basis."
    elif delta < -3.0:
        head_summary = f"{request.location_b_name} outperforms {request.location_a_name} by {abs(delta)} points across verified municipal indicators."
        buyer_verdict = f"{request.location_b_name} provides superior day-to-day livability and environmental scores."
        builder_verdict = f"{request.location_b_name} demonstrates stronger infrastructure and catchment resilience."
    else:
        head_summary = f"Both locations are closely matched (delta: {delta} points). Choice depends primarily on individual trade-offs between transit proximity and environmental air quality."
        buyer_verdict = "Choice depends on lifestyle preference: compare individual commute times and school proximity."
        builder_verdict = "Both sites present viable development profiles; evaluate floor area ratio (FAR) and project land pricing."

    return LocationComparisonResponse(
        location_a=score_a,
        location_b=score_b,
        score_delta=delta,
        category_winners=category_winners,
        head_to_head_summary=head_summary,
        buyer_verdict=buyer_verdict,
        builder_verdict=builder_verdict
    )

@router.post("/site")
async def generate_developer_site_report(request: DeveloperSiteReportRequest):
    """
    Generates comprehensive 12-section site intelligence report for developers:
    Soil (SoilGrids), Seismic (USGS & BIS), Climate, Groundwater, Protected Areas,
    Connectivity, Demographics (Census), Market Indicators, and AI Engineering Recommendations.
    """
    report = await generate_site_intelligence_report(
        lat=request.latitude,
        lon=request.longitude,
        display_name=request.display_name or "Selected Site",
        city=request.city or "Noida",
        project_type=request.project_type or "residential_colony",
        budget_bracket=request.budget_bracket or "mid_market",
        target_audience=request.target_audience or "families",
        scale_acres=request.scale_acres or 2.5
    )
    return report
