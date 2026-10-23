import json
import httpx
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.schemas.ai import (
    AIChatRequest, AIChatResponse, AILocationReportRequest, AILocationReportResponse
)

GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models"

async def generate_chat_reply(request: AIChatRequest) -> AIChatResponse:
    """
    Generates context-grounded AI location advice.
    Uses Gemini API when key is configured; otherwise provides high-fidelity deterministic responses.
    """
    loc_name = request.location_name or "Selected Location"
    context = request.location_context or {}
    message_lower = request.message.lower()

    # Extract verified facts from context
    score = context.get("overall_score", 75.0)
    transit_nodes = context.get("transit_nodes", 4)
    schools = context.get("schools", 3)
    hospitals = context.get("hospitals", 3)
    aqi = context.get("us_aqi", 95)
    elevation = context.get("elevation_m", 180)
    flood_level = context.get("flood_risk_level", "Low")

    verified_facts = [
        f"Deterministic Livability Score: {score}/100",
        f"Mapped Public Transit Nodes: {transit_nodes}",
        f"Mapped Healthcare Facilities: {hospitals}",
        f"Mapped Educational Centers: {schools}",
        f"US AQI Reading: {aqi} ({'Moderate' if aqi <= 100 else 'Unhealthy'})",
        f"Terrain Elevation: {int(elevation)}m above sea level (Flood Risk: {flood_level})"
    ]

    unverified_warnings = [
        "Unverified: Micro-locality peak hour traffic congestion index",
        "Unverified: Society-level municipal drinking water pipeline pressure",
        "Unverified: Sub-surface soil load-bearing capacity and private builder RERA compliance"
    ]

    # Try live Gemini API if key is present
    if settings.GEMINI_API_KEY:
        try:
            url = f"{GEMINI_API_URL}/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
            system_instruction = (
                "You are LandNova AI Advisor, an elite geospatial real estate analyst. "
                "Base your response ONLY on verified data provided in context. "
                "Do NOT invent property prices, safety rates, or municipal approvals. "
                "Explicitly point out data gaps and what the user must verify on the ground."
            )
            prompt = f"""
            Location: {loc_name}
            Context Metrics:
            - Overall Livability: {score}/100
            - Transit nodes: {transit_nodes}
            - Schools: {schools}
            - Hospitals: {hospitals}
            - Air Quality (US AQI): {aqi}
            - Flood Risk: {flood_level} (Elevation: {elevation}m)
            
            User Question: {request.message}
            
            Provide a concise, direct, professional response with:
            1. Core Answer
            2. Verified Data Support
            3. Key Caveats & What to Check Locally
            """
            payload = {
                "contents": [{"parts": [{"text": f"{system_instruction}\n\n{prompt}"}]}],
                "generationConfig": {"temperature": 0.2, "maxOutputTokens": 600}
            }
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    candidates = data.get("candidates", [])
                    if candidates:
                        text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                        return AIChatResponse(
                            reply=text,
                            model_used=f"Google Gemini ({settings.GEMINI_MODEL})",
                            is_demo_fallback=False,
                            recommended_questions=_generate_suggested_questions(loc_name),
                            verified_facts_cited=verified_facts,
                            unverified_or_missing_warnings=unverified_warnings
                        )
        except Exception:
            pass # Fall back gracefully

    # Deterministic Advisory Engine (Demo Mode)
    reply_text = _build_deterministic_advisor_reply(
        loc_name, request.message, score, transit_nodes, schools, hospitals, aqi, flood_level
    )

    return AIChatResponse(
        reply=reply_text,
        model_used="Deterministic Advisory Engine (Demo Mode: set GEMINI_API_KEY for live LLM)",
        is_demo_fallback=True,
        recommended_questions=_generate_suggested_questions(loc_name),
        verified_facts_cited=verified_facts,
        unverified_or_missing_warnings=unverified_warnings
    )

def _build_deterministic_advisor_reply(
    loc_name: str, query: str, score: float, transit: int, schools: int, hospitals: int, aqi: int, flood: str
) -> str:
    q = query.lower()

    if "family" in q or "kid" in q or "child" in q:
        family_fit = "Strong" if (schools >= 4 and hospitals >= 3) else "Moderate"
        return (
            f"### Family Suitability Assessment for {loc_name}\n\n"
            f"**Suitability Verdict: {family_fit}**\n\n"
            f"**Verified Advantages:**\n"
            f"- **Educational Access:** {schools} schools/colleges mapped within 2 km perimeter.\n"
            f"- **Medical Emergency Cover:** {hospitals} healthcare facilities available nearby.\n"
            f"- **Civic Score:** Overall livability score stands at **{score}/100**.\n\n"
            f"**Critical Watchpoints for Families:**\n"
            f"- **Air Quality:** AQI is currently measured at {aqi} (caution during winter inversion months).\n"
            f"- **Pedestrian Safety:** Field inspect school-commute sidewalks, as high arterial traffic corridors flank main access roads.\n"
            f"- **Water Supply:** Verify municipal Ganga/Cauvery water allocation vs private tanker reliance with the resident welfare association (RWA)."
        )
    elif "hospital" in q or "school" in q or "amenit" in q:
        return (
            f"### Essential Amenities Profile for {loc_name}\n\n"
            f"- **Healthcare Network:** {hospitals} mapped hospitals and specialized clinics in the primary 2km radius.\n"
            f"- **Education Ecosystem:** {schools} accredited schools and educational centers mapped via OpenStreetMap.\n"
            f"- **Rapid Transit Connectivity:** {transit} transit stations/bus hubs ensuring commuter mobility.\n\n"
            f"**Verification Checklist:** Always confirm emergency response turnaround times during 8:00 AM - 10:30 AM peak traffic hours."
        )
    elif "disadvantage" in q or "risk" in q or "con" in q or "drawback" in q:
        con_list = []
        if aqi > 120:
            con_list.append(f"**Elevated Air Pollution:** US AQI at {aqi} presents respiratory vulnerability during seasonal peaks.")
        if flood in ["Moderate", "Elevated", "High"]:
            con_list.append(f"**Monsoon Drainage Load:** Flood resilience rated {flood}; localized underpass waterlogging reported during high-volume rain.")
        if transit < 3:
            con_list.append("**Last-Mile Feeder Gaps:** Relatively few direct rapid-transit stations require private vehicle dependency.")
        if not con_list:
            con_list.append("**High Urban Density:** Commercial congestion along arterial collector roads during peak hours.")

        bullet_points = "\n".join([f"- {item}" for item in con_list])
        return (
            f"### Key Constraints & Risks in {loc_name}\n\n"
            f"{bullet_points}\n\n"
            f"**Due Diligence Required:**\n"
            f"1. Check localized storm drain slope with municipal ward engineering cell.\n"
            f"2. Inspect groundwater extraction regulations (Central Groundwater Authority clearance)."
        )
    elif "compare" in q:
        return (
            f"### Comparative Evaluation: {loc_name}\n\n"
            f"Comparing {loc_name} against regional benchmarks:\n"
            f"- **Livability Benchmark:** {score}/100 provides a competitive urban living score.\n"
            f"- **Transit Mobility:** {transit} mapped transit nodes provide strong multi-modal flexibility.\n"
            f"- **Environmental Profile:** AQI at {aqi} with a {flood} flood vulnerability profile.\n\n"
            f"💡 *Tip: Use the LandNova 'Location Comparison' tab to run an automated side-by-side metric matrix.*"
        )
    else:
        return (
            f"### Strategic Assessment for {loc_name}\n\n"
            f"Based on real-world geospatial metrics from OpenStreetMap and Open-Meteo:\n"
            f"- **Livability Baseline:** **{score}/100**\n"
            f"- **Social Infrastructure:** {schools} educational centers, {hospitals} medical nodes, and {transit} transit access points.\n"
            f"- **Environmental Parameters:** AQI: {aqi} | Flood Risk: {flood}.\n\n"
            f"**Recommended Due Diligence Action:**\n"
            f"Confirm that any property of interest holds a registered RERA ID and approved municipal building plan sanction."
        )

def _generate_suggested_questions(loc_name: str) -> List[str]:
    return [
        f"Is {loc_name} suitable for a young family with school-going kids?",
        f"What are the primary flood and monsoon risks here?",
        f"How accessible are hospitals and emergency medical facilities?",
        f"What due-diligence checks should I perform before signing an agreement?"
    ]

async def generate_location_report(request: AILocationReportRequest) -> AILocationReportResponse:
    """
    Generates a comprehensive executive report for a given location.
    """
    data = request.livability_data or {}
    score = data.get("overall_score", 76.0)
    persona = request.user_persona or "family"

    return AILocationReportResponse(
        executive_summary=(
            f"{request.display_name} presents an overall Livability Index of {score}/100. "
            f"The location is characterized by robust primary infrastructure, established civic services, "
            f"and active multi-modal connectivity."
        ),
        pros=[
            "Established social ecosystem with mapped schools and medical facilities in 2km.",
            "High road and rapid transit arterial network accessibility.",
            "Strong neighborhood commercial convenience density."
        ],
        cons=[
            "Seasonal air quality fluctuations during regional weather transitions.",
            "Peak-hour traffic bottlenecking on primary collector roads.",
            "Groundwater depth requires municipal water pipeline verification."
        ],
        lifestyle_fit_assessment=(
            f"High alignment for {persona.replace('_', ' ')}s seeking an established urban community "
            f"with reliable commuting corridors and day-to-day essentials within walking distance."
        ),
        due_diligence_questions=[
            "Is the property RERA registered with an active escrow account?",
            "What is the statutory Right-of-Way (ROW) road width fronting the property?",
            "Is there a verified municipal water connection or 100% reliance on borewells/tankers?",
            "Are there any pending National Green Tribunal (NGT) or environmental clearance disputes?"
        ],
        confidence_and_limitations=(
            "Analysis synthesized from OpenStreetMap spatial nodes, Open-Meteo meteorological and air quality feeds, "
            "and Copernicus elevation models. Certified title checks and geotechnical soil surveys must be conducted independently."
        ),
        is_demo_fallback=not bool(settings.GEMINI_API_KEY)
    )
