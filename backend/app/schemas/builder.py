from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class BuilderSuitabilityRequest(BaseModel):
    location_id: Optional[str] = None
    latitude: float
    longitude: float
    display_name: str = "Proposed Project Site"
    project_type: str = Field("residential", description="residential, commercial, mixed_use, industrial")
    budget_bracket: Optional[str] = Field("mid_market", description="budget, mid_market, premium, luxury")
    target_audience: Optional[str] = Field("families", description="families, young_professionals, retail_footfall, retirees")
    required_amenities: Optional[List[str]] = Field(default_factory=list)
    plot_size_sqft: Optional[float] = 20000.0

class BuilderMetric(BaseModel):
    name: str
    score: float # 0 - 100
    weight: float
    category: str # "Accessibility", "Catchment & Demand", "Infrastructure & Utilities", "Environmental Hazards"
    status: str # "Positive", "Neutral", "Constraint", "Missing Data"
    details: str
    verified_data_point: str

class BuilderSuitabilityResponse(BaseModel):
    location_id: str
    display_name: str
    project_type: str
    budget_bracket: str
    target_audience: str
    suitability_score: float # 0 to 100
    feasibility_verdict: str
    risk_level: str # Low, Moderate, Elevated, High
    data_completeness_pct: float
    metrics: List[BuilderMetric]
    key_drivers: List[str]
    identified_constraints: List[str]
    due_diligence_checklist: List[str]
    statutory_clearances_required: List[str]
    disclaimer: str = (
        "Preliminary decision-support metric only. Does not substitute for certified geotechnical surveys, "
        "municipal master plan verification, structural engineering, or title clearance due diligence."
    )
