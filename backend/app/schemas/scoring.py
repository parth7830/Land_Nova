from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class FactorDetail(BaseModel):
    name: str
    key: str
    score: float # 0 to 100
    weight: float
    effective_weight: float
    status: str # "Verified", "Partial", "Estimated", "Excluded"
    explanation: str
    source: str
    confidence: str # "High", "Moderate", "Heuristic / Low"
    metrics: Dict[str, Any] = {}

class LivabilityWeights(BaseModel):
    connectivity: float = Field(0.25, ge=0.0, le=1.0)
    amenities: float = Field(0.25, ge=0.0, le=1.0)
    environment: float = Field(0.20, ge=0.0, le=1.0)
    safety: float = Field(0.15, ge=0.0, le=1.0)
    climate_flood: float = Field(0.15, ge=0.0, le=1.0)

class LivabilityRequest(BaseModel):
    location_id: Optional[str] = None
    latitude: float
    longitude: float
    display_name: Optional[str] = "Selected Location"
    weights: Optional[LivabilityWeights] = None
    user_persona: Optional[str] = "general" # "family", "young_professional", "retiree", "investor"

class LivabilityResponse(BaseModel):
    location_id: str
    display_name: str
    latitude: float
    longitude: float
    overall_score: float
    is_partial: bool
    grade: str # A+, A, B+, B, C, Needs Review
    data_completeness_pct: float
    included_factors: List[str]
    excluded_factors: List[str]
    factors: Dict[str, FactorDetail]
    key_advantages: List[str]
    key_concerns: List[str]
    recommendation_summary: str
    calculated_at: str
    methodology_note: str

class LocationComparisonRequest(BaseModel):
    location_a_id: Optional[str] = None
    location_a_lat: float
    location_a_lon: float
    location_a_name: str
    location_b_id: Optional[str] = None
    location_b_lat: float
    location_b_lon: float
    location_b_name: str
    weights: Optional[LivabilityWeights] = None

class LocationComparisonResponse(BaseModel):
    location_a: LivabilityResponse
    location_b: LivabilityResponse
    score_delta: float # A - B
    category_winners: Dict[str, str] # e.g. "connectivity": "Location A"
    head_to_head_summary: str
    buyer_verdict: str
    builder_verdict: str
