from fastapi import APIRouter, HTTPException, Request, Query
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from app.services.reviews_service import (
    create_review,
    get_reviews_for_entity,
    vote_helpful,
    init_reviews_db
)

router = APIRouter()

# Initialize DB on import/startup
init_reviews_db()

class ReviewCreateRequest(BaseModel):
    area_id: str = Field(..., description="Target locality or sector ID (e.g. sector-62-noida)")
    property_id: Optional[str] = Field(None, description="Optional target property listing ID")
    overall_rating: float = Field(..., ge=1.0, le=5.0, description="Overall rating from 1 to 5")
    rating_safety: Optional[float] = Field(None, ge=1.0, le=5.0)
    rating_connectivity: Optional[float] = Field(None, ge=1.0, le=5.0)
    rating_cleanliness: Optional[float] = Field(None, ge=1.0, le=5.0)
    rating_noise: Optional[float] = Field(None, ge=1.0, le=5.0)
    rating_water_power: Optional[float] = Field(None, ge=1.0, le=5.0)
    rating_community: Optional[float] = Field(None, ge=1.0, le=5.0)
    review_text: str = Field(..., min_length=20, max_length=500, description="Review content (20-500 chars)")
    resident_type: str = Field(..., description="Resident type: Owner, Tenant, or Visitor")
    duration_of_stay: str = Field(..., description="Duration: < 6 months, 6-12 months, 1-3 years, or 3+ years")

@router.get("", summary="Get reviews and aggregated rating stats for an area or property")
def get_reviews(
    area_id: Optional[str] = Query(None, description="Locality or sector identifier"),
    property_id: Optional[str] = Query(None, description="Property listing identifier"),
    resident_type: Optional[str] = Query(None, description="Filter by resident type: All, Owner, Tenant, Visitor"),
    sort_by: str = Query("helpful", description="Sort order: helpful, newest, highest, lowest")
):
    try:
        return get_reviews_for_entity(
            area_id=area_id,
            property_id=property_id,
            resident_type=resident_type,
            sort_by=sort_by
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", summary="Submit a new community review with rate-limiting and validation")
def submit_review(payload: ReviewCreateRequest, request: Request):
    client_ip = request.client.host if request.client else "127.0.0.1"
    try:
        new_review = create_review(payload.model_dump(), client_ip=client_ip)
        return new_review
    except ValueError as val_err:
        raise HTTPException(status_code=400, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{review_id}/helpful", summary="Increment helpful vote counter for a review")
def mark_helpful(review_id: str):
    try:
        return vote_helpful(review_id)
    except ValueError as val_err:
        raise HTTPException(status_code=404, detail=str(val_err))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
