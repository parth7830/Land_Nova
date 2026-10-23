from fastapi import APIRouter
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter(tags=["Search & Assessment History"])

# In-memory history cache with pre-populated demo searches
RECENT_SEARCH_HISTORY: List[Dict[str, Any]] = [
    {
        "id": "hist_1",
        "location_id": "sector-62-noida",
        "display_name": "Sector 62, Noida, Uttar Pradesh",
        "locality": "Sector 62",
        "city": "Noida",
        "latitude": 28.6280,
        "longitude": 77.3649,
        "livability_score": 78.4,
        "searched_at": "10 minutes ago"
    },
    {
        "id": "hist_2",
        "location_id": "connaught-place-delhi",
        "display_name": "Connaught Place, New Delhi",
        "locality": "Connaught Place",
        "city": "New Delhi",
        "latitude": 28.6315,
        "longitude": 77.2167,
        "livability_score": 85.2,
        "searched_at": "45 minutes ago"
    },
    {
        "id": "hist_3",
        "location_id": "indiranagar-bengaluru",
        "display_name": "Indiranagar, Bengaluru, Karnataka",
        "locality": "Indiranagar",
        "city": "Bengaluru",
        "latitude": 12.9784,
        "longitude": 77.6408,
        "livability_score": 86.8,
        "searched_at": "2 hours ago"
    },
    {
        "id": "hist_4",
        "location_id": "bkc-mumbai",
        "display_name": "Bandra Kurla Complex (BKC), Mumbai",
        "locality": "BKC",
        "city": "Mumbai",
        "latitude": 19.0657,
        "longitude": 77.8681,
        "livability_score": 79.5,
        "searched_at": "Yesterday"
    }
]

@router.get("/history")
async def get_search_history():
    """
    Returns recent location evaluations and searches for rapid dashboard switching.
    """
    return RECENT_SEARCH_HISTORY
