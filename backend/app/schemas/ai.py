from typing import List, Dict, Optional, Any
from pydantic import BaseModel, Field

class AIChatRequest(BaseModel):
    message: str
    location_id: Optional[str] = None
    location_name: Optional[str] = None
    location_context: Optional[Dict[str, Any]] = None
    conversation_history: Optional[List[Dict[str, str]]] = Field(default_factory=list)
    user_persona: Optional[str] = "home_buyer" # "home_buyer", "renter", "builder_developer", "investor"

class AIChatResponse(BaseModel):
    reply: str
    model_used: str
    is_demo_fallback: bool
    recommended_questions: List[str]
    verified_facts_cited: List[str]
    unverified_or_missing_warnings: List[str]

class AILocationReportRequest(BaseModel):
    location_id: str
    display_name: str
    livability_data: Optional[Dict[str, Any]] = None
    user_persona: Optional[str] = "family"

class AILocationReportResponse(BaseModel):
    executive_summary: str
    pros: List[str]
    cons: List[str]
    lifestyle_fit_assessment: str
    due_diligence_questions: List[str]
    confidence_and_limitations: str
    is_demo_fallback: bool
