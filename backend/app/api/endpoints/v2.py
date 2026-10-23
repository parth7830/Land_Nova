"""
New API endpoints for the v2 flow:
- GET /api/personas — list persona profiles
- GET /api/listings — search sample listings
- GET /api/listings/{id} — single listing detail
- POST /api/heatmap — generate heatmap grid scores
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from app.core.personas import list_personas, get_persona_weights, PERSONA_PROFILES
from app.services.listings_service import listings_service
from app.scoring.livability import calculate_livability_score
from app.schemas.scoring import LivabilityWeights
from app.services.amenities_service import fetch_amenities_for_location
from app.services.weather_service import fetch_weather_and_climate

router = APIRouter(tags=["V2 — Personas, Listings & Heatmap"])


# --- Personas ---
@router.get("/personas")
async def get_personas():
    """Returns all available persona profiles with preset weights and defaults."""
    return list_personas()


# --- Listings ---
@router.get("/listings")
async def search_listings(
    q: Optional[str] = Query(None, description="Search query"),
    listing_type: Optional[str] = Query(None, description="buy, rent, or new_project"),
    city: Optional[str] = Query(None, description="Filter by city"),
    min_price: Optional[int] = Query(None, description="Minimum price"),
    max_price: Optional[int] = Query(None, description="Maximum price"),
    bedrooms: Optional[int] = Query(None, description="Number of bedrooms"),
    property_type: Optional[str] = Query(None, description="apartment, villa, plot, house"),
):
    """
    Returns sample property listings (illustrative demo data).
    Structured behind a service interface for future real provider integration.
    """
    results = listings_service.search(
        query=q,
        listing_type=listing_type,
        city=city,
        min_price=min_price,
        max_price=max_price,
        bedrooms=bedrooms,
        property_type=property_type,
    )
    return {
        "listings": results,
        "total": len(results),
        "is_demo": True,
        "note": "Sample listings (illustrative). Data structured for future real provider integration.",
    }


@router.get("/listings/{listing_id}")
async def get_listing_detail(listing_id: str):
    """Returns a single listing by ID."""
    listing = listings_service.get_by_id(listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {**listing, "is_demo": True}


# --- Heatmap ---
class HeatmapRequest(BaseModel):
    """Request body for heatmap grid generation."""
    min_lat: float = Field(..., description="Bounding box south")
    max_lat: float = Field(..., description="Bounding box north")
    min_lon: float = Field(..., description="Bounding box west")
    max_lon: float = Field(..., description="Bounding box east")
    persona: str = Field("general", description="Persona key")
    grid_size: int = Field(5, ge=3, le=10, description="Grid dimension (NxN). Capped at 10x10=100 cells.")
    filters: Optional[Dict[str, Any]] = None


class HeatmapCell(BaseModel):
    latitude: float
    longitude: float
    score: float
    grade: str
    data_completeness_pct: float
    factors_summary: Dict[str, float] = {}


class HeatmapResponse(BaseModel):
    cells: List[HeatmapCell]
    persona: str
    persona_label: str
    grid_size: int
    bbox: Dict[str, float]
    note: str


@router.post("/heatmap", response_model=HeatmapResponse)
async def generate_heatmap(request: HeatmapRequest):
    """
    Generates a grid of persona-weighted livability scores across a bounding box.
    Grid size is capped at 10x10 = 100 cells to respect rate limits.
    Uses caching in underlying services.
    """
    persona_key = request.persona if request.persona in PERSONA_PROFILES else "general"
    weights_dict = get_persona_weights(persona_key)
    weights = LivabilityWeights(**weights_dict)
    persona_label = PERSONA_PROFILES[persona_key]["label"]

    grid_size = min(request.grid_size, 10)  # Cap at 10x10

    lat_step = (request.max_lat - request.min_lat) / max(grid_size - 1, 1)
    lon_step = (request.max_lon - request.min_lon) / max(grid_size - 1, 1)

    cells: List[HeatmapCell] = []

    for i in range(grid_size):
        for j in range(grid_size):
            lat = request.min_lat + (i * lat_step)
            lon = request.min_lon + (j * lon_step)
            cell_id = f"heatmap_{round(lat, 4)}_{round(lon, 4)}"

            try:
                amenities = await fetch_amenities_for_location(cell_id, lat, lon, radius_meters=1500)
                weather = await fetch_weather_and_climate(cell_id, lat, lon)

                result = calculate_livability_score(
                    location_id=cell_id,
                    display_name=f"Grid Cell ({round(lat, 4)}, {round(lon, 4)})",
                    latitude=lat,
                    longitude=lon,
                    amenities_data=amenities.model_dump(),
                    weather_climate_data=weather.model_dump(),
                    weights=weights,
                    user_persona=persona_key,
                )

                factors_summary = {}
                for fk, fv in result.factors.items():
                    factors_summary[fk] = fv.score

                cells.append(HeatmapCell(
                    latitude=lat,
                    longitude=lon,
                    score=result.overall_score,
                    grade=result.grade,
                    data_completeness_pct=result.data_completeness_pct,
                    factors_summary=factors_summary,
                ))
            except Exception as e:
                # On error, mark cell as insufficient data
                cells.append(HeatmapCell(
                    latitude=lat,
                    longitude=lon,
                    score=-1,  # -1 = insufficient data
                    grade="N/A",
                    data_completeness_pct=0,
                    factors_summary={},
                ))

    return HeatmapResponse(
        cells=cells,
        persona=persona_key,
        persona_label=persona_label,
        grid_size=grid_size,
        bbox={
            "min_lat": request.min_lat,
            "max_lat": request.max_lat,
            "min_lon": request.min_lon,
            "max_lon": request.max_lon,
        },
        note="Scores computed using the persona-weighted livability engine. Grid capped at 10x10 cells.",
    )
