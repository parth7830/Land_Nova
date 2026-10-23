import math
import httpx
from typing import List, Optional, Dict, Any
from app.core.config import settings
from app.schemas.location import LocationResponse
from app.services.demo_data_service import DEMO_LOCATIONS

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Computes great-circle distance between two coordinates in meters.
    """
    R = 6371000.0 # Earth radius in meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2 +
        math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0) ** 2
    )
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return R * c

async def geocode_query(query: str) -> List[LocationResponse]:
    """
    Geocodes an address or locality using OpenStreetMap Nominatim.
    Falls back gracefully to curated demo hubs if network is offline or throttled.
    """
    cleaned_query = query.strip()
    if not cleaned_query:
        return []

    # First check if query matches any signature demo location directly
    demo_matches: List[LocationResponse] = []
    q_lower = cleaned_query.lower()
    for loc_id, demo in DEMO_LOCATIONS.items():
        if (
            q_lower in demo["display_name"].lower() or 
            demo["locality"].lower() in q_lower or
            demo["city"].lower() in q_lower
        ):
            demo_matches.append(LocationResponse(
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
                source="Verified Index / Demo Cache"
            ))

    # Try live OpenStreetMap Nominatim
    try:
        headers = {
            "User-Agent": settings.NOMINATIM_USER_AGENT,
            "Accept-Language": "en"
        }
        params = {
            "q": cleaned_query,
            "format": "jsonv2",
            "addressdetails": 1,
            "limit": 5
        }
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.get("https://nominatim.openstreetmap.org/search", params=params, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                results = []
                for item in data:
                    addr = item.get("address", {})
                    loc_id = f"osm_{item.get('osm_type', 'node')}_{item.get('osm_id', item.get('place_id'))}"
                    loc_name = item.get("display_name", cleaned_query)
                    locality = addr.get("suburb") or addr.get("neighbourhood") or addr.get("residential") or addr.get("quarter")
                    city = addr.get("city") or addr.get("town") or addr.get("state_district") or addr.get("county")
                    state = addr.get("state")
                    country = addr.get("country", "India")
                    
                    bbox = None
                    if "boundingbox" in item:
                        # Nominatim returns [lat_min, lat_max, lon_min, lon_max] as strings
                        raw_bbox = item["boundingbox"]
                        bbox = [float(raw_bbox[0]), float(raw_bbox[1]), float(raw_bbox[2]), float(raw_bbox[3])]

                    results.append(LocationResponse(
                        id=loc_id,
                        display_name=loc_name,
                        locality=locality,
                        city=city,
                        state=state,
                        country=country,
                        latitude=float(item["lat"]),
                        longitude=float(item["lon"]),
                        bounding_box=bbox,
                        is_demo=False,
                        source="OpenStreetMap Nominatim (Live)"
                    ))
                if results:
                    return results
    except Exception as e:
        # Nominatim error or timeout; fallback to demo matches or default
        pass

    if demo_matches:
        return demo_matches

    # If nothing matched, provide default Sector 62 as demonstrator
    default_demo = DEMO_LOCATIONS["sector-62-noida"]
    return [
        LocationResponse(
            id=default_demo["id"],
            display_name=f"{cleaned_query} (Sampled Profile: {default_demo['display_name']})",
            locality=default_demo["locality"],
            city=default_demo["city"],
            state=default_demo["state"],
            country=default_demo["country"],
            latitude=default_demo["latitude"],
            longitude=default_demo["longitude"],
            bounding_box=default_demo["bounding_box"],
            is_demo=True,
            source="Demo Fallback Profile"
        )
    ]
