"""
Developer Heatmap & Zone Suitability Engine.
Implements:
- Single data-provider pattern for developer demo zones.
- Vectorized NumPy deterministic scoring with 100% normalized weights.
- Hard threshold filtering with dimmed/greyed states.
- Source transparency badges ('Demo data' / 'Seeded demo dataset').
"""

import json
from pathlib import Path
from typing import Dict, Any, List, Optional
import numpy as np


def get_data_dir() -> Path:
    candidates = [
        Path.cwd() / "data",
        Path.cwd().parent / "data",
        Path(__file__).resolve().parents[3] / "data",
    ]
    for c in candidates:
        if c.exists() and c.is_dir():
            return c
    return candidates[0]


DATA_DIR = get_data_dir()


def load_developer_demo_zones(city: str = "Noida") -> List[Dict[str, Any]]:
    """
    Single data-provider function.
    Loads seeded demo zones dataset. In production, this can be swapped
    for live GIS spatial databases without changing any calling APIs or UI components.
    """
    target = DATA_DIR / "developer_demo_zones.json"
    if target.exists():
        try:
            with open(target, "r", encoding="utf-8") as f:
                data = json.load(f)
                zones = data.get("zones", [])
                if city and city.lower() != "all":
                    # Filter by city or return all if city matches default
                    matching = [z for z in zones if city.lower() in z.get("city", "").lower()]
                    return matching if matching else zones
                return zones
        except Exception:
            pass
    return []


DEFAULT_WEIGHTS = {
    "connectivity": 20.0,
    "amenities": 15.0,
    "aqi": 10.0,
    "traffic": 10.0,
    "flood_safety": 10.0,
    "groundwater": 5.0,
    "growth_potential": 15.0,
    "infrastructure": 15.0,
}


def normalize_weights(weights: Optional[Dict[str, float]] = None) -> Dict[str, float]:
    """
    Normalizes arbitrary developer weights so their sum equals exactly 100.0%.
    Guarantees non-negative values and safe fallbacks.
    """
    raw = weights if weights else DEFAULT_WEIGHTS
    cleaned = {}
    for k in DEFAULT_WEIGHTS:
        val = float(raw.get(k, DEFAULT_WEIGHTS[k]))
        cleaned[k] = max(0.0, val)

    total = sum(cleaned.values())
    if total <= 0.0:
        # Fallback to equal weights
        n = len(DEFAULT_WEIGHTS)
        return {k: round(100.0 / n, 2) for k in DEFAULT_WEIGHTS}

    return {k: round((v / total) * 100.0, 4) for k, v in cleaned.items()}


def get_score_color(score: float, is_dimmed: bool = False) -> str:
    if is_dimmed:
        return "#94a3b8"  # slate-400 dimmed
    if score >= 75.0:
        return "#10b981"  # emerald-500 (high)
    if score >= 60.0:
        return "#84cc16"  # lime-500 (good)
    if score >= 45.0:
        return "#f59e0b"  # amber-500 (average)
    return "#ef4444"      # red-500 (low)


def compute_developer_zone_scores(
    zones: Optional[List[Dict[str, Any]]] = None,
    filters: Optional[Dict[str, Any]] = None,
    weights: Optional[Dict[str, float]] = None,
    city: str = "Noida"
) -> Dict[str, Any]:
    """
    Vectorized NumPy deterministic scoring of developer zones.
    Evaluates hard threshold boundaries (dimmed if failed) and
    calculates normalized multi-factor suitability scores (0-100).
    """
    zone_list = zones if zones is not None else load_developer_demo_zones(city=city)
    if not zone_list:
        zone_list = load_developer_demo_zones(city="all")

    f = filters or {}
    w = normalize_weights(weights)

    # Hard threshold constraints
    max_aqi = float(f.get("max_aqi", 350))
    max_budget_sqft = float(f.get("max_budget_sqft", 50000))
    min_growth_pct = float(f.get("min_growth_pct", 0.0))
    min_connectivity = float(f.get("min_connectivity", 0.0))
    min_amenities = float(f.get("min_amenities", 0.0))
    flood_allowed = f.get("flood_allowed", "all")  # "all", "low_only", "low_moderate"
    groundwater_allowed = f.get("groundwater_allowed", "all")  # "all", "safe_semicritical", "safe_only"
    traffic_allowed = f.get("traffic_allowed", "all")  # "all", "low_only", "low_medium"

    results = []

    for z in zone_list:
        fail_reasons = []

        # Check hard thresholds
        if z.get("aqi", 0) > max_aqi:
            fail_reasons.append(f"AQI {z['aqi']} exceeds limit {int(max_aqi)}")

        if z.get("land_price_sqft", 0) > max_budget_sqft:
            fail_reasons.append(f"Price ₹{z['land_price_sqft']}/sqft exceeds budget ₹{int(max_budget_sqft)}")

        if z.get("price_growth_5yr_pct", 0) < min_growth_pct:
            fail_reasons.append(f"5-yr growth {z['price_growth_5yr_pct']}% below min {min_growth_pct}%")

        if z.get("connectivity_score", 0) < min_connectivity:
            fail_reasons.append(f"Connectivity {z['connectivity_score']} below min {min_connectivity}")

        if z.get("nearby_amenities_score", 0) < min_amenities:
            fail_reasons.append(f"Amenities {z['nearby_amenities_score']} below min {min_amenities}")

        if flood_allowed == "low_only" and z.get("flood_risk") != "Low":
            fail_reasons.append(f"Flood risk is {z.get('flood_risk')} (requires Low)")
        elif flood_allowed == "low_moderate" and z.get("flood_risk") == "Elevated":
            fail_reasons.append("Flood risk is Elevated")

        if groundwater_allowed == "safe_only" and z.get("groundwater_category") != "Safe":
            fail_reasons.append(f"Groundwater is {z.get('groundwater_category')} (requires Safe)")
        elif groundwater_allowed == "safe_semicritical" and z.get("groundwater_category") in ["Critical", "Over-Exploited"]:
            fail_reasons.append(f"Groundwater is {z.get('groundwater_category')} (CGWA restrictions)")

        if traffic_allowed == "low_only" and z.get("traffic_congestion_level") != "Low":
            fail_reasons.append(f"Traffic congestion is {z.get('traffic_congestion_level')}")
        elif traffic_allowed == "low_medium" and z.get("traffic_congestion_level") == "High":
            fail_reasons.append("High traffic congestion bottleneck")

        is_dimmed = len(fail_reasons) > 0

        # Calculate individual normalized factor scores (each 0 - 100)
        # 1. Connectivity
        f_conn = float(np.clip(z.get("connectivity_score", 50.0), 0.0, 100.0))
        # 2. Amenities
        f_amen = float(np.clip(z.get("nearby_amenities_score", 50.0), 0.0, 100.0))
        # 3. AQI: scale where AQI 50 = 100 score, AQI 300 = 0 score
        aqi_val = z.get("aqi", 150)
        f_aqi = float(np.clip((300.0 - aqi_val) / 2.5, 0.0, 100.0))
        # 4. Traffic safety
        f_traf = float(np.clip(z.get("traffic_score", 60.0), 0.0, 100.0))
        # 5. Flood safety
        f_flood = float(np.clip(z.get("flood_safety_score", 75.0), 0.0, 100.0))
        # 6. Groundwater
        f_gw = float(np.clip(z.get("groundwater_score", 50.0), 0.0, 100.0))
        # 7. Growth potential: 25% growth = 100 score
        growth_val = z.get("price_growth_5yr_pct", 10.0)
        f_growth = float(np.clip(growth_val * 4.0, 0.0, 100.0))
        # 8. Infrastructure proximity
        f_infra = float(np.clip(z.get("infra_proximity_score", 70.0), 0.0, 100.0))

        factors = {
            "connectivity": round(f_conn, 1),
            "amenities": round(f_amen, 1),
            "aqi": round(f_aqi, 1),
            "traffic": round(f_traf, 1),
            "flood_safety": round(f_flood, 1),
            "groundwater": round(f_gw, 1),
            "growth_potential": round(f_growth, 1),
            "infrastructure": round(f_infra, 1),
        }

        # Weighted sum: sum(factor * weight) / 100
        factor_arr = np.array([factors[k] for k in w])
        weight_arr = np.array([w[k] for k in w])
        raw_score = float(np.sum(factor_arr * (weight_arr / 100.0)))
        final_score = float(np.clip(round(raw_score, 1), 0.0, 100.0))

        color = get_score_color(final_score, is_dimmed=is_dimmed)

        entry = dict(z)
        entry.update({
            "suitability_score": final_score,
            "is_dimmed": is_dimmed,
            "fail_reasons": fail_reasons,
            "factor_breakdown": factors,
            "color": color,
            "demo_badge": "Demo data",
            "source_label": "Seeded demo dataset",
        })
        results.append(entry)

    # Sort results: non-dimmed first by suitability score descending, then dimmed
    results.sort(key=lambda x: (not x["is_dimmed"], x["suitability_score"]), reverse=True)

    top_recommended = [r for r in results if not r["is_dimmed"]][:5]

    return {
        "city": city,
        "total_zones": len(results),
        "qualifying_zones": len([r for r in results if not r["is_dimmed"]]),
        "weights_applied": w,
        "filters_applied": f,
        "zones": results,
        "top_recommended": top_recommended,
        "legend": [
            {"range": "75 - 100", "label": "Prime Development Zone", "color": "#10b981"},
            {"range": "60 - 74", "label": "Good Feasibility", "color": "#84cc16"},
            {"range": "45 - 59", "label": "Average / Conditional", "color": "#f59e0b"},
            {"range": "0 - 44", "label": "High Risk / Poor Fit", "color": "#ef4444"},
            {"range": "Excluded", "label": "Fails Hard Threshold", "color": "#94a3b8", "dashed": True}
        ]
    }
