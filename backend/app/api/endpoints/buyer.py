"""
Buyer Endpoints
Handles all buyer & renter endpoints with deterministic scoring,
data honesty mapping, commute calculation, comparison, affordability,
and site visit checklists.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, Query
from app.services.buyer_intelligence_service import buyer_service, BENCHMARK_SECTORS, haversine_distance_km
from app.core.http_client import get_shared_client
from app.services.gemini_service import generate_chat_reply
from app.schemas.ai import AIChatRequest

router = APIRouter(prefix="/buyer", tags=["Buyer & Renter Location Intelligence"])


class WeightsModel(BaseModel):
    connectivity: float = 0.25
    amenities: float = 0.25
    environment: float = 0.20
    safety: float = 0.15
    climate_flood: float = 0.15


class PreferencesRequest(BaseModel):
    city: Optional[str] = "Noida"
    property_types: Optional[List[str]] = ["Apartment"]
    min_budget: Optional[int] = 5000000
    max_budget: Optional[int] = 20000000
    preferred_amenities: Optional[List[str]] = ["Metro Connectivity", "Schools", "Hospitals", "Parks"]
    good_aqi: Optional[bool] = True
    good_water: Optional[bool] = False
    low_noise: Optional[bool] = False
    low_crime: Optional[bool] = True
    local_language: Optional[str] = "Hindi"
    max_commute_minutes: Optional[int] = 45
    workplace_address: Optional[str] = "Sector 62, Noida"
    workplace_coords: Optional[List[float]] = [28.6280, 77.3649]
    custom_weights: Optional[Dict[str, float]] = None


def compute_weights_from_preferences(prefs: PreferencesRequest) -> Dict[str, float]:
    """
    Deterministically translates user toggle preferences into normalized weights.
    Selected preferences boost the respective pillar.
    """
    if prefs.custom_weights:
        return prefs.custom_weights

    w_conn = 0.25
    w_amen = 0.25
    w_env = 0.20
    w_safe = 0.15
    w_clim = 0.15

    if prefs.preferred_amenities:
        if "Metro Connectivity" in prefs.preferred_amenities or "Workplaces" in prefs.preferred_amenities:
            w_conn += 0.10
        if any(a in prefs.preferred_amenities for a in ["Schools", "Hospitals", "Parks", "Malls", "Markets", "Sports Facilities"]):
            w_amen += 0.10

    if prefs.good_aqi:
        w_env += 0.08
    if prefs.low_noise:
        w_env += 0.05
    if prefs.low_crime:
        w_safe += 0.10
    if prefs.max_commute_minutes and prefs.max_commute_minutes < 40:
        w_conn += 0.10

    total = w_conn + w_amen + w_env + w_safe + w_clim
    return {
        "connectivity": round(w_conn / total, 3),
        "amenities": round(w_amen / total, 3),
        "environment": round(w_env / total, 3),
        "safety": round(w_safe / total, 3),
        "climate_flood": round(w_clim / total, 3),
    }


@router.get("/sectors")
async def get_sectors(city: Optional[str] = "Noida"):
    """Returns all benchmark sectors for a city with standard weights."""
    return {
        "sectors": buyer_service.get_all_sectors(city=city),
        "city": city,
        "is_demo": True
    }


@router.post("/evaluate")
async def evaluate_sectors_with_preferences(prefs: PreferencesRequest):
    """
    Evaluates all sectors against the user's specific preferences, budget,
    and commute limits. Normalizes weights and returns scored sectors.
    """
    normalized_weights = compute_weights_from_preferences(prefs)
    workplace = prefs.workplace_coords if prefs.workplace_coords and len(prefs.workplace_coords) == 2 else [28.6280, 77.3649]

    all_sectors = buyer_service.get_all_sectors(
        city=prefs.city,
        weights=normalized_weights,
        commute_origin=workplace
    )

    # Apply commute and budget filters
    for s in all_sectors:
        # Check commute limit
        car_commute = s["commute"]["car_minutes"]
        s["is_within_commute"] = car_commute <= (prefs.max_commute_minutes or 120)
        
        # Check budget fit (rough estimate: price per sqft * 1200 sqft apartment)
        est_price = s["avg_price_sqft"] * 1200
        s["estimated_unit_price"] = est_price
        s["is_within_budget"] = (prefs.min_budget or 0) <= est_price <= (prefs.max_budget or 100000000)

    top_recommended = sorted(all_sectors, key=lambda x: x["overall_score"], reverse=True)[:5]

    return {
        "city": prefs.city,
        "weights_applied": normalized_weights,
        "sectors": all_sectors,
        "top_recommended": top_recommended,
        "total": len(all_sectors)
    }


@router.get("/top-recommended")
async def get_top_recommended(city: Optional[str] = "Noida", limit: int = 5):
    """Returns top recommended sectors."""
    return buyer_service.get_top_recommended(city=city, limit=limit)


# --- B1: Commute Calculator Endpoint ---
class CommuteRequest(BaseModel):
    origin: List[float] = Field(..., description="[lat, lon] of origin (e.g. workplace)")
    destination: List[float] = Field(..., description="[lat, lon] of sector centroid")
    mode: str = Field("car", description="car, metro, bus, bike, walk")


@router.post("/commute")
async def calculate_commute(req: CommuteRequest):
    """
    Calculates commute time and distance using OSRM public routing with
    transparent fallback to Haversine distance labeled 'Estimated'.
    """
    dist_km = haversine_distance_km(req.origin[0], req.origin[1], req.destination[0], req.destination[1])
    
    # Try public OSRM for car/bike
    is_estimated = True
    source = "Haversine Kinematic Model (Estimated)"
    duration_min = 0

    if req.mode in ("car", "bike", "walk"):
        try:
            client = get_shared_client()
            osrm_mode = "driving" if req.mode == "car" else ("bike" if req.mode == "bike" else "foot")
            url = f"https://router.project-osrm.org/route/v1/{osrm_mode}/{req.origin[1]},{req.origin[0]};{req.destination[1]},{req.destination[0]}?overview=false"
            resp = await client.get(url, timeout=3.5)
            if resp.status_code == 200:
                data = resp.json()
                if data.get("routes"):
                    route = data["routes"][0]
                    duration_min = int(route["duration"] / 60.0)
                    dist_km = round(route["distance"] / 1000.0, 1)
                    is_estimated = False
                    source = "OSRM Open Source Routing Machine"
        except Exception:
            pass

    if is_estimated:
        # Transparent deterministic kinematic model
        speeds = {"car": 25.0, "metro": 32.0, "bus": 18.0, "bike": 22.0, "walk": 4.5}
        avg_speed = speeds.get(req.mode, 25.0)
        # Factor in city congestion / wait times
        congestion_overhead = 6.0 if req.mode in ("car", "bus") else (10.0 if req.mode == "metro" else 2.0)
        duration_min = max(2, int((dist_km / avg_speed) * 60.0 + congestion_overhead))

    return {
        "mode": req.mode,
        "distance_km": round(dist_km, 1),
        "duration_minutes": duration_min,
        "source": source,
        "confidence": "High" if not is_estimated else "Estimated",
        "is_estimated": is_estimated,
        "formula": "Real-time OSRM graph routing with congestion buffer, or Great-Circle distance over average modal speeds."
    }


# --- B2: Sector Comparison Endpoint ---
class CompareRequest(BaseModel):
    sector_ids: List[str]
    weights: Optional[Dict[str, float]] = None


@router.post("/compare")
async def compare_sectors(req: CompareRequest):
    """
    Compares 2-3 sectors side-by-side with radar chart metrics,
    and a strictly grounded Gemini summary explaining which suits the user.
    """
    if len(req.sector_ids) < 2:
        raise HTTPException(status_code=400, detail="Please provide at least 2 sectors to compare")

    all_sec = buyer_service.get_all_sectors(weights=req.weights)
    matched = [s for s in all_sec if s["id"] in req.sector_ids]

    if not matched:
        raise HTTPException(status_code=404, detail="Sectors not found")

    # Generate grounded Gemini AI summary
    grounded_summary = ""
    try:
        comparison_prompt = f"Compare these locations for a home buyer based STRICTLY on these verified numbers (never invent metrics):\n"
        for s in matched:
            comparison_prompt += (
                f"- {s['name']}: Overall Score {s['overall_score']}/100, "
                f"AQI {s['metrics']['aqi']['value']}, "
                f"Safety {s['metrics']['crime_rate']['score']}/100, "
                f"Connectivity {s['metrics']['connectivity']['score']}/100, "
                f"Schools {s['metrics']['schools']['value']}, "
                f"Hospitals {s['metrics']['hospitals']['value']}, "
                f"Avg Price ₹{s['avg_price_sqft']}/sqft.\n"
            )
        comparison_prompt += "\nIn 3 concise bullet points, explain which area suits which type of buyer."
        
        chat_req = AIChatRequest(
            message=comparison_prompt,
            location_name=matched[0]["name"],
            location_context={"overall_score": matched[0]["overall_score"]}
        )
        reply_res = await generate_chat_reply(chat_req)
        grounded_summary = reply_res.reply if hasattr(reply_res, "reply") else str(reply_res)
    except Exception:
        grounded_summary = (
            f"• {matched[0]['name']} leads with an overall score of {matched[0]['overall_score']}/100.\n"
            f"• Consider trade-offs between transport access and ambient noise across candidate sectors."
        )

    return {
        "sectors": matched,
        "grounded_ai_summary": grounded_summary,
        "radar_keys": ["Connectivity", "Amenities", "Environment", "Safety", "Climate/Flood"],
        "radar_data": [
            {
                "id": s["id"],
                "name": s["name"],
                "scores": [
                    s["metrics"]["connectivity"]["score"],
                    s["metrics"]["schools"]["score"],
                    s["metrics"]["aqi"]["score"],
                    s["metrics"]["crime_rate"]["score"],
                    85.0  # Flood resilience baseline
                ]
            }
            for s in matched
        ]
    }


# --- B3: Budget & EMI Calculator ---
@router.get("/affordability")
async def calculate_affordability(
    price: int = Query(7500000, description="Property price in INR"),
    down_payment_pct: float = Query(20.0, description="Down payment %"),
    loan_interest_pct: float = Query(8.5, description="Annual home loan interest rate %"),
    tenure_years: int = Query(20, description="Loan tenure in years"),
    monthly_household_income: int = Query(150000, description="Monthly income in INR")
):
    """
    Computes exact loan EMI, total interest, and rent-to-income / debt-to-income health ratios.
    """
    down_payment = (price * down_payment_pct) / 100.0
    principal = price - down_payment
    r = (loan_interest_pct / 12.0) / 100.0
    n = tenure_years * 12

    if r > 0 and n > 0:
        emi = (principal * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1)
    else:
        emi = principal / max(n, 1)

    total_payment = emi * n
    total_interest = total_payment - principal

    dti_ratio = round((emi / max(monthly_household_income, 1)) * 100.0, 1)
    
    if dti_ratio <= 35.0:
        health_badge = "Comfortably Affordable"
        health_color = "emerald"
    elif dti_ratio <= 50.0:
        health_badge = "Moderate Stretch"
        health_color = "amber"
    else:
        health_badge = "High Risk / Overburdened"
        health_color = "red"

    return {
        "property_price": price,
        "down_payment": round(down_payment),
        "loan_principal": round(principal),
        "monthly_emi": round(emi),
        "total_interest": round(total_interest),
        "total_payable": round(total_payment),
        "debt_to_income_pct": dti_ratio,
        "health_badge": health_badge,
        "health_color": health_color,
        "formula": "Standard Equated Monthly Installment: P * r * (1+r)^n / ((1+r)^n - 1)"
    }


# --- B9: Dynamic Site Visit Checklist ---
@router.get("/checklist/{sector_id}")
async def get_site_visit_checklist(sector_id: str):
    """
    Auto-generates a practical, printable site inspection checklist tailored
    to the specific environmental, geotechnical, and civic indicators of that sector.
    """
    all_sec = buyer_service.get_all_sectors()
    sector = next((s for s in all_sec if s["id"] == sector_id), None)
    if not sector:
        raise HTTPException(status_code=404, detail="Sector not found")

    items = [
        {
            "category": "Water & Plumbing",
            "title": "Check Water TDS and Supply Source",
            "reason": f"Sector groundwater proxy shows TDS ~{sector['metrics']['water_quality']['value']}. Ask society management if supply is Ganga water or municipal groundwater borewells.",
            "severity": "High"
        },
        {
            "category": "Flood & Drainage",
            "title": "Inspect Basement Drainage & Monsoon Sump Pumps",
            "reason": f"Terrain elevation is {sector['base_metrics']['elevation_m'] if 'base_metrics' in sector else 200}m. Check society basement parking for past waterlogging marks.",
            "severity": "Medium"
        },
        {
            "category": "Ventilation & Air Quality",
            "title": "Evaluate Cross-Ventilation & Balcony Dust Exposure",
            "reason": f"Ambient AQI averages {sector['metrics']['aqi']['value']}. Check if apartment faces heavy arterial roads or a protected inner park.",
            "severity": "High"
        },
        {
            "category": "Commute & Transit",
            "title": "Test Peak-Hour Rush on Local Approach Road",
            "reason": f"Transit access is strong, but verify bottleneck intersections during 8:30-10:00 AM weekday peaks.",
            "severity": "Medium"
        },
        {
            "category": "Acoustic / Noise",
            "title": "Listen for Ambient Traffic Decibels during Evening",
            "reason": f"Acoustic proxy shows ~{sector['metrics']['noise_level']['value']}. Ensure bedroom windows have double-glazed acoustic panes.",
            "severity": "Low"
        }
    ]

    return {
        "sector_id": sector["id"],
        "sector_name": sector["name"],
        "city": sector["city"],
        "checklist": items
    }
