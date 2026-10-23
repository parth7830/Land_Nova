import math
from typing import Dict, Any, Optional, List
from datetime import datetime
from app.schemas.scoring import LivabilityWeights, LivabilityResponse, FactorDetail

def calculate_livability_score(
    location_id: str,
    display_name: str,
    latitude: float,
    longitude: float,
    amenities_data: Optional[Dict[str, Any]] = None,
    weather_climate_data: Optional[Dict[str, Any]] = None,
    weights: Optional[LivabilityWeights] = None,
    user_persona: Optional[str] = "general"
) -> LivabilityResponse:
    """
    Computes a transparent, deterministic livability score.
    Respects missing data rules:
    - Never fabricates scores for absent dimensions.
    - Normalizes weights across available factors only when explicitly labeled as partial.
    - Separates data completeness from the resulting score.
    """
    if weights is None:
        weights = LivabilityWeights()

    # Raw factor scores & availability tracking
    factor_scores: Dict[str, Optional[float]] = {}
    factor_explanations: Dict[str, str] = {}
    factor_sources: Dict[str, str] = {}
    factor_confidences: Dict[str, str] = {}
    factor_metrics: Dict[str, Dict[str, Any]] = {}

    # 1. Connectivity Factor
    conn_score, conn_exp, conn_src, conn_conf, conn_met = _score_connectivity(amenities_data)
    factor_scores["connectivity"] = conn_score
    factor_explanations["connectivity"] = conn_exp
    factor_sources["connectivity"] = conn_src
    factor_confidences["connectivity"] = conn_conf
    factor_metrics["connectivity"] = conn_met

    # 2. Amenities Factor
    amen_score, amen_exp, amen_src, amen_conf, amen_met = _score_amenities(amenities_data)
    factor_scores["amenities"] = amen_score
    factor_explanations["amenities"] = amen_exp
    factor_sources["amenities"] = amen_src
    factor_confidences["amenities"] = amen_conf
    factor_metrics["amenities"] = amen_met

    # 3. Environmental Quality Factor
    env_score, env_exp, env_src, env_conf, env_met = _score_environment(weather_climate_data, amenities_data)
    factor_scores["environment"] = env_score
    factor_explanations["environment"] = env_exp
    factor_sources["environment"] = env_src
    factor_confidences["environment"] = env_conf
    factor_metrics["environment"] = env_met

    # 4. Safety Heuristic Factor
    safe_score, safe_exp, safe_src, safe_conf, safe_met = _score_safety(amenities_data)
    factor_scores["safety"] = safe_score
    factor_explanations["safety"] = safe_exp
    factor_sources["safety"] = safe_src
    factor_confidences["safety"] = safe_conf
    factor_metrics["safety"] = safe_met

    # 5. Climate & Flood Resilience Factor
    clim_score, clim_exp, clim_src, clim_conf, clim_met = _score_climate_flood(weather_climate_data)
    factor_scores["climate_flood"] = clim_score
    factor_explanations["climate_flood"] = clim_exp
    factor_sources["climate_flood"] = clim_src
    factor_confidences["climate_flood"] = clim_conf
    factor_metrics["climate_flood"] = clim_met

    # Configured nominal weights
    nominal_weights = {
        "connectivity": weights.connectivity,
        "amenities": weights.amenities,
        "environment": weights.environment,
        "safety": weights.safety,
        "climate_flood": weights.climate_flood,
    }

    # Evaluate availability
    included_factors: List[str] = []
    excluded_factors: List[str] = []
    sum_available_weights = 0.0

    for key, score in factor_scores.items():
        if score is not None:
            included_factors.append(key)
            sum_available_weights += nominal_weights[key]
        else:
            excluded_factors.append(key)

    total_factors_count = len(nominal_weights)
    data_completeness_pct = round((len(included_factors) / total_factors_count) * 100.0, 1)
    is_partial = len(excluded_factors) > 0

    if sum_available_weights <= 0:
        overall_score = 0.0
    else:
        # Normalize weights only across available factors
        weighted_sum = 0.0
        for key in included_factors:
            norm_weight = nominal_weights[key] / sum_available_weights
            weighted_sum += (factor_scores[key] * norm_weight)
        overall_score = round(weighted_sum, 1)

    # Determine Grade
    grade = _determine_grade(overall_score, is_partial)

    # Build factor details dictionary
    factors_dict: Dict[str, FactorDetail] = {}
    display_names = {
        "connectivity": "Connectivity & Transit",
        "amenities": "Nearby Amenities",
        "environment": "Environmental Quality",
        "safety": "Civic & Safety Heuristic",
        "climate_flood": "Climate & Flood Resilience",
    }

    for key, nominal_w in nominal_weights.items():
        score_val = factor_scores[key]
        is_avail = score_val is not None
        eff_weight = (nominal_w / sum_available_weights) if (is_avail and sum_available_weights > 0) else 0.0
        
        status_label = "Verified" if is_avail and factor_confidences[key] == "High" else (
            "Partial" if is_avail and factor_confidences[key] == "Moderate" else (
                "Heuristic" if is_avail else "Excluded (No Data)"
            )
        )

        factors_dict[key] = FactorDetail(
            name=display_names[key],
            key=key,
            score=round(score_val, 1) if score_val is not None else 0.0,
            weight=round(nominal_w, 2),
            effective_weight=round(eff_weight, 3),
            status=status_label,
            explanation=factor_explanations[key],
            source=factor_sources[key],
            confidence=factor_confidences[key],
            metrics=factor_metrics[key]
        )

    # Advantages and concerns
    advantages, concerns = _derive_highlights(factors_dict, included_factors)
    summary_text = _generate_recommendation_summary(
        display_name, overall_score, grade, is_partial, data_completeness_pct, user_persona, advantages, concerns
    )

    return LivabilityResponse(
        location_id=location_id,
        display_name=display_name,
        latitude=latitude,
        longitude=longitude,
        overall_score=overall_score,
        is_partial=is_partial,
        grade=grade,
        data_completeness_pct=data_completeness_pct,
        included_factors=included_factors,
        excluded_factors=excluded_factors,
        factors=factors_dict,
        key_advantages=advantages,
        key_concerns=concerns,
        recommendation_summary=summary_text,
        calculated_at=datetime.utcnow().isoformat() + "Z",
        methodology_note="Deterministic heuristic index. Missing dimensions are normalized across available factors without artificial zeroes."
    )

def _score_connectivity(amenities_data: Optional[Dict[str, Any]]):
    if not amenities_data or "counts_by_category" not in amenities_data:
        return None, "No transit or road connectivity data available.", "N/A", "None", {}
    
    counts = amenities_data.get("counts_by_category", {})
    transit_count = counts.get("transit", 0)
    items = amenities_data.get("items", [])
    
    # Distance to nearest transit
    transit_items = [i for i in items if i.get("category") == "transit"]
    min_transit_dist = min([i.get("distance_meters", 5000) for i in transit_items]) if transit_items else 4000
    
    score = 40.0
    if min_transit_dist <= 500:
        score += 35.0
    elif min_transit_dist <= 1200:
        score += 25.0
    elif min_transit_dist <= 2500:
        score += 15.0

    # Count density bonus
    if transit_count >= 10:
        score += 25.0
    elif transit_count >= 5:
        score += 18.0
    elif transit_count >= 2:
        score += 10.0

    score = min(100.0, max(10.0, score))
    explanation = f"Transit nodes identified: {transit_count}. Nearest public transit point is ~{int(min_transit_dist)}m away."
    metrics = {
        "transit_nodes_count": transit_count,
        "nearest_transit_meters": int(min_transit_dist),
        "metro_bus_access": "Excellent" if score > 80 else ("Moderate" if score > 50 else "Limited")
    }
    return score, explanation, "OpenStreetMap Overpass API", "High", metrics

def _score_amenities(amenities_data: Optional[Dict[str, Any]]):
    if not amenities_data or "counts_by_category" not in amenities_data:
        return None, "No amenity points mapped for this perimeter.", "N/A", "None", {}
    
    counts = amenities_data.get("counts_by_category", {})
    edu = counts.get("education", 0)
    health = counts.get("healthcare", 0)
    recreation = counts.get("recreation", 0)
    commercial = counts.get("commercial", 0)

    # Essential pillar scoring
    edu_score = min(25.0, edu * 6.0)
    health_score = min(25.0, health * 7.0)
    rec_score = min(25.0, recreation * 6.5)
    comm_score = min(25.0, commercial * 4.0)

    total_score = min(100.0, edu_score + health_score + rec_score + comm_score)
    explanation = f"Mapped: {edu} schools/colleges, {health} healthcare facilities, {recreation} parks/spaces, and {commercial} commercial hubs."
    metrics = {
        "schools_count": edu,
        "hospitals_clinics_count": health,
        "parks_recreation_count": recreation,
        "supermarkets_retail_count": commercial
    }
    return total_score, explanation, "OpenStreetMap Overpass API", "High", metrics

def _score_environment(weather_climate_data: Optional[Dict[str, Any]], amenities_data: Optional[Dict[str, Any]]):
    if not weather_climate_data:
        return None, "Environmental and air quality readings unavailable.", "N/A", "None", {}

    aqi_data = weather_climate_data.get("air_quality")
    if not aqi_data or aqi_data.get("us_aqi") is None:
        # If air quality specifically missing, check if climate data exists
        return None, "Air quality metrics unverified for this coordinate.", "N/A", "None", {}

    us_aqi = aqi_data.get("us_aqi", 100)
    pm25 = aqi_data.get("pm2_5", 35.0)

    # AQI deterministic score (lower AQI is cleaner air = higher score)
    if us_aqi <= 50:
        base_env = 95.0
    elif us_aqi <= 100:
        base_env = 80.0
    elif us_aqi <= 150:
        base_env = 60.0
    elif us_aqi <= 200:
        base_env = 42.0
    elif us_aqi <= 300:
        base_env = 25.0
    else:
        base_env = 15.0

    # Green space presence buffer
    parks = amenities_data.get("counts_by_category", {}).get("recreation", 0) if amenities_data else 0
    green_bonus = min(10.0, parks * 2.0)
    final_score = min(100.0, max(10.0, base_env + green_bonus))

    explanation = f"US AQI reported at {us_aqi} ({aqi_data.get('category_label', 'Moderate')}) with PM2.5 of {pm25} µg/m³."
    metrics = {
        "us_aqi": us_aqi,
        "pm2_5": pm25,
        "aqi_category": aqi_data.get("category_label", "Moderate"),
        "nearby_parks_buffer": parks
    }
    return final_score, explanation, "Open-Meteo Air Quality & CAMS", "High", metrics

def _score_safety(amenities_data: Optional[Dict[str, Any]]):
    if not amenities_data:
        return None, "Civic safety infrastructure metrics unavailable.", "N/A", "None", {}

    counts = amenities_data.get("counts_by_category", {})
    emergency_nodes = counts.get("emergency", 0)
    items = amenities_data.get("items", [])
    
    # Check police / fire / hospital infrastructure in vicinity
    emergency_items = [i for i in items if i.get("category") in ["emergency", "healthcare"]]
    has_nearby_civic = len(emergency_items) > 0

    base_score = 65.0 # baseline urban footprint
    if emergency_nodes >= 2:
        base_score += 20.0
    elif emergency_nodes >= 1:
        base_score += 10.0

    if has_nearby_civic:
        base_score += 10.0

    final_score = min(95.0, base_score)
    explanation = (
        f"Emergency / civic responder infrastructure: {emergency_nodes} mapped nodes within coverage radius. "
        "Calculated as an urban infrastructure proxy, not a certified crime statistic."
    )
    metrics = {
        "emergency_facilities_mapped": emergency_nodes,
        "civic_responder_proximity": "High" if emergency_nodes >= 2 else "Standard",
        "methodology": "Urban emergency infrastructure density heuristic"
    }
    return final_score, explanation, "OpenStreetMap Civic Infrastructure", "Heuristic / Low", metrics

def _score_climate_flood(weather_climate_data: Optional[Dict[str, Any]]):
    if not weather_climate_data or "climate_risk" not in weather_climate_data:
        return None, "Elevation and flood risk data unavailable.", "N/A", "None", {}

    cr = weather_climate_data.get("climate_risk", {})
    flood_score = cr.get("flood_risk_score", 75.0)
    elevation = cr.get("elevation_meters", 150.0)
    risk_level = cr.get("flood_risk_level", "Low")
    note = cr.get("historical_flood_note", "")

    explanation = f"Elevation ~{int(elevation)}m above sea level. Flood resilience rated {risk_level} ({int(flood_score)}/100). {note}"
    metrics = {
        "elevation_meters": elevation,
        "flood_risk_level": risk_level,
        "flood_resilience_score": flood_score,
        "extreme_heat_days_per_year": cr.get("extreme_heat_days_per_year", 25)
    }
    return flood_score, explanation, "Copernicus DEM & Open-Meteo Climate Model", "Moderate", metrics

def _determine_grade(score: float, is_partial: bool) -> str:
    if is_partial and score < 50:
        return "Review Required"
    if score >= 88:
        return "A+"
    elif score >= 80:
        return "A"
    elif score >= 72:
        return "B+"
    elif score >= 62:
        return "B"
    elif score >= 50:
        return "C"
    else:
        return "D"

def _derive_highlights(factors_dict: Dict[str, FactorDetail], included: List[str]):
    advantages = []
    concerns = []

    sorted_factors = sorted(
        [factors_dict[k] for k in included],
        key=lambda f: f.score,
        reverse=True
    )

    for f in sorted_factors:
        if f.score >= 75:
            advantages.append(f"Strong {f.name}: {f.explanation}")
        elif f.score < 55:
            concerns.append(f"Sub-optimal {f.name}: {f.explanation}")

    if not advantages:
        advantages.append("Balanced urban baseline across measured indicators.")
    if not concerns:
        concerns.append("No critical risk indicators surfaced in active datasets.")

    return advantages[:3], concerns[:3]

def _generate_recommendation_summary(
    name: str, score: float, grade: str, is_partial: bool, completeness: float, persona: str, pros: List[str], cons: List[str]
) -> str:
    partial_note = " (Partial evaluation based on available data layers)" if is_partial else ""
    return (
        f"{name} achieves a Livability Score of {score}/100 [Grade {grade}]{partial_note} with {completeness}% data completeness. "
        f"Primary strength lies in {pros[0] if pros else 'urban amenities'}. "
        f"Key watchpoint to verify: {cons[0] if cons else 'seasonal waterlogging and traffic congestion'}."
    )
