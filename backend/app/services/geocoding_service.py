import math
import asyncio
from typing import List, Optional, Dict, Any
from cachetools import TTLCache
from app.core.config import settings
from app.core.http_client import get_shared_client
from app.schemas.location import LocationResponse
from app.services.demo_data_service import DEMO_LOCATIONS

# 24-hour TTL in-memory geocoding cache (1000 items)
GEOCODE_CACHE = TTLCache(maxsize=1000, ttl=86400)

MAJOR_INDIAN_CITIES = [
    {
        "id": "delhi-ncr",
        "display_name": "New Delhi, National Capital Territory of Delhi, India",
        "locality": "Connaught Place",
        "city": "New Delhi",
        "state": "Delhi",
        "country": "India",
        "latitude": 28.6139,
        "longitude": 77.2090,
        "bounding_box": [28.40, 28.88, 76.84, 77.35]
    },
    {
        "id": "sector-62-noida",
        "display_name": "Sector 62, Noida, Uttar Pradesh, India",
        "locality": "Sector 62",
        "city": "Noida",
        "state": "Uttar Pradesh",
        "country": "India",
        "latitude": 28.6280,
        "longitude": 77.3649,
        "bounding_box": [28.618, 28.638, 77.354, 77.375]
    },
    {
        "id": "gurugram-haryana",
        "display_name": "Cyber City, Gurugram, Haryana, India",
        "locality": "DLF Cyber City",
        "city": "Gurugram",
        "state": "Haryana",
        "country": "India",
        "latitude": 28.4595,
        "longitude": 77.0266,
        "bounding_box": [28.38, 28.53, 76.95, 77.12]
    },
    {
        "id": "bkc-mumbai",
        "display_name": "Bandra Kurla Complex, Mumbai, Maharashtra, India",
        "locality": "BKC",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "latitude": 19.0657,
        "longitude": 72.8687,
        "bounding_box": [19.055, 19.075, 72.858, 72.879]
    },
    {
        "id": "indiranagar-bengaluru",
        "display_name": "Indiranagar, Bengaluru, Karnataka, India",
        "locality": "Indiranagar",
        "city": "Bengaluru",
        "state": "Karnataka",
        "country": "India",
        "latitude": 12.9784,
        "longitude": 77.6408,
        "bounding_box": [12.968, 12.988, 77.630, 77.651]
    },
    {
        "id": "hitec-city-hyderabad",
        "display_name": "HITEC City, Hyderabad, Telangana, India",
        "locality": "HITEC City",
        "city": "Hyderabad",
        "state": "Telangana",
        "country": "India",
        "latitude": 17.4435,
        "longitude": 78.3772,
        "bounding_box": [17.433, 17.453, 78.367, 78.387]
    },
    {
        "id": "pune-maharashtra",
        "display_name": "Kalyani Nagar, Pune, Maharashtra, India",
        "locality": "Kalyani Nagar",
        "city": "Pune",
        "state": "Maharashtra",
        "country": "India",
        "latitude": 18.5463,
        "longitude": 73.9034,
        "bounding_box": [18.53, 18.56, 73.89, 73.92]
    }
]

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000.0
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
    High-performance geocoding with:
    1. In-memory TTL Cache (0ms)
    2. Curated Major Indian Cities match (0ms)
    3. Fast Photon OSM Geocoder with Nominatim fallback (<300ms)
    """
    cleaned_query = query.strip()
    if not cleaned_query:
        return []

    cache_key = cleaned_query.lower()
    if cache_key in GEOCODE_CACHE:
        return GEOCODE_CACHE[cache_key]

    # Quick local match for instant response
    local_matches: List[LocationResponse] = []
    for city in MAJOR_INDIAN_CITIES:
        if (
            cache_key in city["city"].lower() or
            cache_key in city["locality"].lower() or
            cache_key in city["display_name"].lower()
        ):
            local_matches.append(LocationResponse(
                id=city["id"],
                display_name=city["display_name"],
                locality=city["locality"],
                city=city["city"],
                state=city["state"],
                country=city["country"],
                latitude=city["latitude"],
                longitude=city["longitude"],
                bounding_box=city.get("bounding_box"),
                is_demo=True,
                source="Instant Local Index"
            ))

    # If exact local match, cache and return immediately
    if local_matches and any(m.city.lower() == cache_key or m.locality.lower() == cache_key for m in local_matches):
        GEOCODE_CACHE[cache_key] = local_matches
        return local_matches

    client = get_shared_client()

    # Step 1: Try Photon API (Fast OSM Elasticsearch backend)
    try:
        photon_url = "https://photon.komoot.io/api/"
        photon_params = {"q": cleaned_query, "limit": 5}
        resp = await client.get(photon_url, params=photon_params, headers={"User-Agent": settings.NOMINATIM_USER_AGENT})
        if resp.status_code == 200:
            data = resp.json()
            features = data.get("features", [])
            if features:
                results: List[LocationResponse] = []
                for f in features:
                    props = f.get("properties", {})
                    coords = f.get("geometry", {}).get("coordinates", [0, 0])
                    lon, lat = coords[0], coords[1]
                    name = props.get("name") or cleaned_query
                    city = props.get("city") or props.get("district") or props.get("county") or name
                    locality = props.get("locality") or props.get("street") or name
                    state = props.get("state")
                    country = props.get("country", "India")

                    display_parts = [p for p in [name, locality if locality != name else None, city, state, country] if p]
                    display_name = ", ".join(display_parts)

                    bbox = None
                    if "extent" in props:
                        # Photon returns [min_lon, max_lat, max_lon, min_lat]
                        e = props["extent"]
                        bbox = [float(e[3]), float(e[1]), float(e[0]), float(e[2])]

                    results.append(LocationResponse(
                        id=f"photon_{props.get('osm_id', int(lat * 1000))}",
                        display_name=display_name,
                        locality=locality,
                        city=city,
                        state=state,
                        country=country,
                        latitude=lat,
                        longitude=lon,
                        bounding_box=bbox,
                        is_demo=False,
                        source="Photon Geospatial Index"
                    ))
                if results:
                    GEOCODE_CACHE[cache_key] = results
                    return results
    except Exception as e:
        # Fall back to Nominatim
        pass

    # Step 2: Fallback to Nominatim
    try:
        headers = {"User-Agent": settings.NOMINATIM_USER_AGENT, "Accept-Language": "en"}
        params = {"q": cleaned_query, "format": "jsonv2", "addressdetails": 1, "limit": 5}
        resp = await client.get("https://nominatim.openstreetmap.org/search", params=params, headers=headers)
        if resp.status_code == 200:
            data = resp.json()
            results = []
            for item in data:
                addr = item.get("address", {})
                loc_id = f"osm_{item.get('osm_type', 'node')}_{item.get('osm_id', item.get('place_id'))}"
                loc_name = item.get("display_name", cleaned_query)
                locality = addr.get("suburb") or addr.get("neighbourhood") or addr.get("residential")
                city = addr.get("city") or addr.get("town") or addr.get("state_district")
                state = addr.get("state")
                country = addr.get("country", "India")
                bbox = None
                if "boundingbox" in item:
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
                    source="OpenStreetMap Nominatim"
                ))
            if results:
                GEOCODE_CACHE[cache_key] = results
                return results
    except Exception:
        pass

    # Step 3: Local matches if live failed
    if local_matches:
        GEOCODE_CACHE[cache_key] = local_matches
        return local_matches

    # Default fallback
    default_demo = DEMO_LOCATIONS["sector-62-noida"]
    fallback_res = [
        LocationResponse(
            id=default_demo["id"],
            display_name=f"{cleaned_query} (Sampled: {default_demo['display_name']})",
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
    GEOCODE_CACHE[cache_key] = fallback_res
    return fallback_res
