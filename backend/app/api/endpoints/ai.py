from fastapi import APIRouter
from app.schemas.ai import (
    AIChatRequest, AIChatResponse, AILocationReportRequest, AILocationReportResponse
)
from app.services.gemini_service import generate_chat_reply, generate_location_report

router = APIRouter(tags=["AI Location Advisor & Reporting"])

@router.post("/chat", response_model=AIChatResponse)
async def ai_chat_advisor(request: AIChatRequest):
    """
    Conversational AI Location Advisor powered by Google Gemini (with deterministic demo fallback).
    Answers questions grounded in real geospatial metrics, amenities, air quality, and risk factors.
    """
    return await generate_chat_reply(request)

@router.post("/location-report", response_model=AILocationReportResponse)
async def ai_location_report(request: AILocationReportRequest):
    """
    Generates an executive-level location due-diligence report highlighting key pros, cons,
    lifestyle fit, and statutory due-diligence questions.
    """
    return await generate_location_report(request)
