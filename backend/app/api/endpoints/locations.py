from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.location import LocationResponse, AmenitiesResponse, WeatherClimateResponse
from app.services.geocoding_service import geocode_query
from app.services.amenities_service import fetch_amenities_for_location
from app.services.weather_service import fetch_weather_and_climate
from app.services.demo_data_service import get_demo_location, DEMO_LOCATIONS

router = APIRouter(tags=["Locations & Geospatial Data"])

@router.get("/geocode", response_model=List[LocationResponse])
async def search_locations(q: str = Query(..., min_length=2, description="Search address, locality, or landmark")):
    """
    Geocodes search queries into geographic coordinates with bounding boxes.
    """
    results = await geocode_query(q)
    return results

@router.get("/locations/demo", response_model=List[LocationResponse])
async def list_demo_locations():
    """
    Lists signature pre-computed locations for instant hackathon demonstrations.
    """
    res = []
    for loc_id, demo in DEMO_LOCATIONS.items():
        res.append(LocationResponse(
            id=demo["id"],
            display_name=demo["display_name"],
            locality=demo["locality"],
            city=demo["city"],
            state=demo["state"],
            country=demo["country"],
            latitude=demo["latitude"],
            longitude=demo["longitude"],
            bounding_box=demo.get("bounding_box"),
            is_demo=True,
            source="Verified Benchmark Index"
        ))
    return res

@router.get("/location/{location_id}", response_model=LocationResponse)
async def get_location_details(location_id: str):
    """
    Retrieves metadata for a specific location.
    """
    demo = get_demo_location(location_id)
    if demo:
        return LocationResponse(
            id=demo["id"],
            display_name=demo["display_name"],
            locality=demo["locality"],
            city=demo["city"],
            state=demo["state"],
            country=demo["country"],
            latitude=demo["latitude"],
            longitude=demo["longitude"],
            bounding_box=demo.get("bounding_box"),
            is_demo=True,
            source="LandNova Location Master"
        )
    
    # Generic fallback if custom ID
    return LocationResponse(
        id=location_id,
        display_name=location_id.replace("-", " ").title(),
        locality=location_id.split("-")[0].title(),
        city="Custom Locality",
        country="India",
        latitude=28.6280,
        longitude=77.3649,
        is_demo=False,
        source="Custom Geolocation Coordinate"
    )

@router.get("/location/{location_id}/amenities", response_model=AmenitiesResponse)
async def get_amenities(
    location_id: str,
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude"),
    radius: int = Query(1800, ge=500, le=5000, description="Search radius in meters")
):
    """
    Retrieves categorized amenities (schools, healthcare, transit, recreation, commercial, emergency).
    """
    return await fetch_amenities_for_location(location_id, lat, lon, radius)

@router.get("/location/{location_id}/weather", response_model=WeatherClimateResponse)
async def get_weather(
    location_id: str,
    lat: float = Query(..., description="Latitude"),
    lon: float = Query(..., description="Longitude")
):
    """
    Retrieves real-time weather, air quality (AQI, PM2.5, PM10), and elevation-based climate risk.
    """
    return await fetch_weather_and_climate(location_id, lat, lon)
