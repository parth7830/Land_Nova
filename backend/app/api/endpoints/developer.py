"""
API Endpoints for LandNova Real Estate Developer Command Center:
- POST /api/developer/site-dossier (D1)
- POST /api/developer/feasibility (D7)
- POST /api/developer/deal-verdict (D10)
- POST /api/developer/command-center (Composite D1 + D7 + D10)
"""

from fastapi import APIRouter, HTTPException
from typing import Dict, Any, Optional
from pydantic import BaseModel, Field

from app.schemas.developer import FeasibilityInputs, DeveloperCommandCenterRequest
from app.services.developer_engine import (
    build_extended_site_dossier,
    run_feasibility_model,
    compute_deal_score_and_verdict,
    get_price_history_and_zones,
    get_future_price_forecast,
    get_government_pipeline_and_subsidies,
    get_job_boom_index,
    get_demand_and_elasticity,
    get_top_land_opportunities,
    submit_ground_truth_survey,
    get_site_surveys,
    get_survey_checklist_template
)
from app.services.developer_zones_service import (
    compute_developer_zone_scores,
    load_developer_demo_zones,
    normalize_weights
)

router = APIRouter(prefix="/developer", tags=["Developer Command Center Engine"])

class SiteDossierRequest(BaseModel):
    latitude: float = Field(default=28.6280, ge=-90.0, le=90.0)
    longitude: float = Field(default=77.3649, ge=-180.0, le=180.0)
    display_name: Optional[str] = "Selected Development Site"
    city: Optional[str] = "Noida"
    scale_acres: Optional[float] = 3.5

@router.post("/site-dossier")
async def get_site_dossier(request: SiteDossierRequest):
    """
    D1: Multi-Source Extended Site Analysis Dossier
    Includes ISRIC SoilGrids, CGWB Groundwater & CGWA NOC, MoEFCC ESZ buffers,
    CPCB air station metrics, BIS IS 1893 seismic risk, NCRB crime stats, and Site Risk Score.
    """
    return build_extended_site_dossier(
        lat=request.latitude,
        lon=request.longitude,
        display_name=request.display_name or "Selected Site",
        city=request.city or "Noida",
        scale_acres=request.scale_acres or 3.5
    )

@router.post("/feasibility")
async def simulate_feasibility(inputs: FeasibilityInputs):
    """
    D7: Development Feasibility Simulator
    Computes BUA, salable sqft, costs, revenue, profit, IRR, payback period,
    monthly cash flows, sensitivity tornado data, 1,000-run NumPy Monte Carlo,
    and best-fit typology rankings.
    """
    return run_feasibility_model(inputs=inputs)

class DealVerdictRequest(BaseModel):
    latitude: float = 28.6280
    longitude: float = 77.3649
    display_name: Optional[str] = "Sector 62, Noida Development Site"
    city: Optional[str] = "Noida"
    feasibility_inputs: Optional[FeasibilityInputs] = None

@router.post("/deal-verdict")
async def evaluate_deal_verdict(request: DealVerdictRequest):
    """
    D10: Deal Score and Investment Verdict
    Combines Site Readiness (D1), Feasibility IRR/Margin (D7), Catchment Demand,
    and Infrastructure Pipeline Uplift into an explainable 0-100 Deal Score,
    Buy/Watch/Avoid verdict, waterfall decomposition, and zero-hallucination AI explanation.
    """
    inputs = request.feasibility_inputs or FeasibilityInputs()
    site_dossier = build_extended_site_dossier(
        lat=request.latitude,
        lon=request.longitude,
        display_name=request.display_name or "Selected Site",
        city=request.city or "Noida",
        scale_acres=inputs.plot_acres
    )
    feasibility = run_feasibility_model(inputs=inputs)
    verdict = await compute_deal_score_and_verdict(
        site_dossier=site_dossier,
        feasibility=feasibility,
        city=request.city or "Noida",
        lat=request.latitude,
        lon=request.longitude
    )
    return verdict

@router.post("/command-center")
async def get_developer_command_center(request: DeveloperCommandCenterRequest):
    """
    Composite endpoint powering the real-time 3-column Developer Command Center:
    D1 Site Dossier + D7 Feasibility Simulator + D10 Deal Score & Verdict.
    """
    inputs = request.feasibility_inputs or FeasibilityInputs()
    site_dossier = build_extended_site_dossier(
        lat=request.latitude,
        lon=request.longitude,
        display_name=request.display_name or "Selected Site",
        city=request.city or "Noida",
        scale_acres=inputs.plot_acres
    )
    feasibility = run_feasibility_model(inputs=inputs)
    verdict = await compute_deal_score_and_verdict(
        site_dossier=site_dossier,
        feasibility=feasibility,
        city=request.city or "Noida",
        lat=request.latitude,
        lon=request.longitude
    )
    return {
        "site_dossier": site_dossier,
        "feasibility": feasibility,
        "deal_verdict": verdict
    }

@router.get("/price-history")
async def get_price_history(
    locality_id: str = "sector-62-noida",
    city: str = "Noida"
):
    """
    D2: Historical price indices (NHB RESIDEX / RBI HPI), CAGR, volatility,
    and Golden/Watch/Danger zone classification.
    """
    return get_price_history_and_zones(locality_id=locality_id, city=city)

@router.get("/price-forecast")
async def get_price_forecast(
    locality_id: str = "sector-62-noida",
    city: str = "Noida",
    pipeline_uplift_pct: float = 0.0
):
    """
    D3: 3/5/10-year transparent price range projections with base, optimistic,
    and pessimistic confidence bands, documented assumptions, and backtest validation panel.
    """
    return get_future_price_forecast(
        locality_id=locality_id,
        city=city,
        pipeline_uplift_pct=pipeline_uplift_pct
    )

@router.get("/pipeline-subsidies")
async def get_pipeline_and_subsidies(
    latitude: float = 28.6280,
    longitude: float = 77.3649,
    max_dist_km: float = 50.0
):
    """
    D4: Curated Government Mega Infrastructure Pipeline Tracker and Subsidies/Incentives Catalog.
    """
    return get_government_pipeline_and_subsidies(
        lat=latitude,
        lon=longitude,
        max_dist_km=max_dist_km
    )

@router.get("/job-boom-index")
async def get_job_boom(
    locality_id: str = "sector-62-noida",
    city: str = "Noida"
):
    """
    D5: Job-Sector Boom Index synthesized from IT park/SEZ POI growth and corporate registrations.
    """
    return get_job_boom_index(locality_id=locality_id, city=city)

@router.get("/demand-elasticity")
async def get_demand_analysis(
    locality_id: str = "sector-62-noida",
    city: str = "Noida"
):
    """
    D6: Demand and Elasticity Analysis with absorption velocity and supply-demand verdict.
    """
    return get_demand_and_elasticity(locality_id=locality_id, city=city)

class TopOpportunitiesRequest(BaseModel):
    max_budget_cr: Optional[float] = 200.0
    min_acres: Optional[float] = 0.0
    max_aqi: Optional[int] = 300
    verdict: Optional[str] = "ALL"
    zone: Optional[str] = "ALL"

@router.post("/top-opportunities")
async def get_land_opportunities(request: TopOpportunitiesRequest):
    """
    D8: Multi-layer developer filtered opportunities across benchmark regions.
    """
    return get_top_land_opportunities(filters=request.model_dump())

class GroundTruthSurveyRequest(BaseModel):
    site_id: str
    surveyor_name: Optional[str] = "Licensed Geotechnical Surveyor"
    measured_sbc_kn_m2: Optional[float] = 195.0
    access_road_width_m: Optional[float] = 18.0
    water_pipeline_active: Optional[bool] = True
    power_substation_distance_km: Optional[float] = 1.2
    title_encumbrances_found: Optional[bool] = False
    notes: Optional[str] = "Standard borehole SPT and legal search verified."
    photos_count: Optional[int] = 3

@router.post("/survey")
async def create_ground_truth_survey(request: GroundTruthSurveyRequest):
    """
    D9: Ground-Truth Survey submission. Overrides estimates with field-verified data.
    """
    return submit_ground_truth_survey(request.model_dump())

@router.get("/surveys/{site_id}")
async def list_site_surveys(site_id: str):
    """
    D9: Retrieve all field surveys submitted for a development parcel.
    """
    return get_site_surveys(site_id=site_id)

@router.get("/survey-checklist")
async def get_survey_checklist():
    """
    D9: Exportable field due diligence survey checklist.
    """
    return get_survey_checklist_template()


# =========================================================================
# DEVELOPER DEMO HEATMAP ZONES ENDPOINTS (TASK 1)
# =========================================================================

@router.get("/zones")
async def get_developer_zones(
    city: str = "Noida",
    max_aqi: Optional[float] = None,
    max_budget_sqft: Optional[float] = None,
    min_growth_pct: Optional[float] = None,
    min_connectivity: Optional[float] = None,
    min_amenities: Optional[float] = None,
    flood_allowed: Optional[str] = "all",
    groundwater_allowed: Optional[str] = "all",
    traffic_allowed: Optional[str] = "all"
):
    """
    TASK 1: Retrieve seeded demo zones for Developer Heatmap.
    Computes deterministic suitability scores (0-100) and marks dimmed zones
    that breach hard developer thresholds.
    """
    filters = {}
    if max_aqi is not None:
        filters["max_aqi"] = max_aqi
    if max_budget_sqft is not None:
        filters["max_budget_sqft"] = max_budget_sqft
    if min_growth_pct is not None:
        filters["min_growth_pct"] = min_growth_pct
    if min_connectivity is not None:
        filters["min_connectivity"] = min_connectivity
    if min_amenities is not None:
        filters["min_amenities"] = min_amenities
    if flood_allowed:
        filters["flood_allowed"] = flood_allowed
    if groundwater_allowed:
        filters["groundwater_allowed"] = groundwater_allowed
    if traffic_allowed:
        filters["traffic_allowed"] = traffic_allowed

    return compute_developer_zone_scores(city=city, filters=filters)


class DeveloperZonesScoreRequest(BaseModel):
    city: Optional[str] = "Noida"
    filters: Optional[Dict[str, Any]] = None
    weights: Optional[Dict[str, float]] = None


@router.post("/zones/score")
async def score_developer_zones(request: DeveloperZonesScoreRequest):
    """
    TASK 1: Score developer zones with customized user filters & normalized weights.
    Returns ranked zones, factor breakdowns, hard-threshold exclusion reasons,
    and a visual legend.
    """
    return compute_developer_zone_scores(
        city=request.city or "Noida",
        filters=request.filters,
        weights=request.weights
    )
