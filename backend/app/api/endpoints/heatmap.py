"""
Heatmap API Endpoints
Provides two-level heatmap intelligence:
1. City level: Evaluated sector polygons with per-factor layer scores
2. Area drill-down: Fine 25x25 grid smoothly interpolated with IDW, clipped to polygon,
   with active POI markers, summary metrics, and caching.
"""

from fastapi import APIRouter, Query, HTTPException
from typing import Optional, Dict, Any, List
import json

from app.services.buyer_intelligence_service import buyer_service, BENCHMARK_SECTORS
from app.services.layer_scoring_service import (
    generate_area_drilldown_grid,
    LAYER_METADATA,
    AREA_HEATMAP_CACHE
)

router = APIRouter(tags=["Heatmap & Layer Drill-Down"])


@router.get("/layers")
async def get_available_layers():
    """
    Returns available heatmap layers, display labels, units, and source metadata.
    """
    return {
        "layers": [
            {"id": k, **v} for k, v in LAYER_METADATA.items()
        ]
    }


@router.get("/area")
async def get_area_heatmap_drilldown(
    area_id: str = Query(..., description="ID of the area/sector, e.g. sector-62-noida"),
    layer: str = Query("all", description="Layer: all, schools, hospitals, crime, aqi, transport, amenities, parks, noise"),
    weights: Optional[str] = Query(None, description="Optional JSON-encoded weights dict"),
    resolution: int = Query(25, ge=10, le=40, description="Grid resolution (default 25 for 25x25 grid)"),
    center_lat: Optional[float] = Query(None, description="Center latitude for dynamic sectors"),
    center_lon: Optional[float] = Query(None, description="Center longitude for dynamic sectors"),
    polygon_json: Optional[str] = Query(None, description="JSON-encoded polygon [[lat,lon],...] for dynamic sectors")
):
    """
    Returns fine 25x25 smoothly interpolated grid clipped to sector polygon,
    with POI markers, layer score, summary statistics (best/worst block),
    and layer-specific legend.
    """
    layer_clean = layer.lower().strip()
    if layer_clean not in LAYER_METADATA:
        layer_clean = "all"

    parsed_weights = None
    if weights:
        try:
            parsed_weights = json.loads(weights)
        except Exception:
            parsed_weights = None

    # Find sector in benchmark sectors
    target_sector = None
    for s in BENCHMARK_SECTORS:
        if s["id"] == area_id or s["id"].replace("-noida", "") == area_id.replace("-noida", ""):
            target_sector = s
            break

    if not target_sector:
        # Fallback: check if matches name or id in buyer_service sectors
        for s in buyer_service.sectors:
            if area_id.lower() in s["name"].lower() or s["id"] == area_id:
                target_sector = s
                break

    if not target_sector:
        # For dynamically generated sectors (non-Noida cities), build sector from query params
        if center_lat is not None and center_lon is not None:
            # Parse polygon from query param or generate a default bounding box
            parsed_polygon = []
            if polygon_json:
                try:
                    parsed_polygon = json.loads(polygon_json)
                except Exception:
                    pass

            if not parsed_polygon:
                # Generate a default square polygon (~0.008 degree offset ≈ ~900m)
                d = 0.008
                parsed_polygon = [
                    [center_lat + d, center_lon - d],
                    [center_lat + d, center_lon + d],
                    [center_lat - d, center_lon + d],
                    [center_lat - d, center_lon - d],
                ]

            target_sector = {
                "id": area_id,
                "name": area_id.replace("-", " ").title(),
                "city": "Dynamic",
                "center": [center_lat, center_lon],
                "polygon": parsed_polygon,
                "base_metrics": {
                    "aqi": 120,
                    "pm25": 40.0,
                    "elevation_m": 200.0,
                    "flood_risk_score": 83.0,
                    "transit_nodes": 6,
                    "schools_count": 7,
                    "hospitals_count": 4,
                    "parks_count": 6,
                    "markets_count": 8,
                    "police_distance_km": 1.3,
                    "major_road_distance_m": 250,
                    "commercial_density": 0.30
                }
            }
        else:
            # Last resort fallback: sector-62-noida
            target_sector = BENCHMARK_SECTORS[0]

    area_name = target_sector.get("name", "Target Sector")
    polygon = target_sector.get("polygon", [])
    center = tuple(target_sector.get("center", [28.628, 77.3649]))
    base_metrics = target_sector.get("base_metrics", {
        "aqi": 125,
        "pm25": 42.0,
        "elevation_m": 202.0,
        "flood_risk_score": 85.0,
        "transit_nodes": 6,
        "schools_count": 8,
        "hospitals_count": 4,
        "parks_count": 5,
        "markets_count": 8,
        "police_distance_km": 1.2,
        "major_road_distance_m": 300,
        "commercial_density": 0.3
    })

    drilldown_data = generate_area_drilldown_grid(
        area_id=target_sector["id"],
        area_name=area_name,
        polygon=polygon,
        center=center,
        base_metrics=base_metrics,
        layer=layer_clean,
        weights=parsed_weights,
        grid_resolution=resolution
    )

    return drilldown_data
