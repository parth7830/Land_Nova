"""
Persona weight profiles for the livability scoring engine.
Each persona maps to a LivabilityWeights preset and a list of priority amenity categories.
These presets are applied as defaults when a persona is selected; users can override any weight.
"""

from typing import Dict, Any, List

PERSONA_PROFILES: Dict[str, Dict[str, Any]] = {
    "family": {
        "label": "Family",
        "description": "Prioritizes safety, schools, hospitals, parks, clean air, and water quality.",
        "icon": "Users",
        "weights": {
            "connectivity": 0.15,
            "amenities": 0.30,
            "environment": 0.25,
            "safety": 0.20,
            "climate_flood": 0.10,
        },
        "priority_amenities": [
            "education", "healthcare", "recreation", "commercial", "emergency"
        ],
        "filters_defaults": {
            "connectivity_importance": "medium",
            "preferred_amenities": [
                "hospital", "school", "park", "market", "sports"
            ],
        },
    },
    "working_professional": {
        "label": "Working Professional",
        "description": "Prioritizes connectivity, proximity to business districts, restaurants, gyms.",
        "icon": "Briefcase",
        "weights": {
            "connectivity": 0.35,
            "amenities": 0.20,
            "environment": 0.20,
            "safety": 0.10,
            "climate_flood": 0.15,
        },
        "priority_amenities": [
            "transit", "commercial", "recreation"
        ],
        "filters_defaults": {
            "connectivity_importance": "high",
            "preferred_amenities": [
                "metro", "restaurant", "gym", "cafe", "coworking"
            ],
        },
    },
    "bachelor": {
        "label": "Bachelor(s)",
        "description": "Prioritizes affordability, nightlife, cafes, transit, co-living density.",
        "icon": "Smile",
        "weights": {
            "connectivity": 0.30,
            "amenities": 0.25,
            "environment": 0.15,
            "safety": 0.15,
            "climate_flood": 0.15,
        },
        "priority_amenities": [
            "transit", "commercial", "recreation"
        ],
        "filters_defaults": {
            "connectivity_importance": "high",
            "preferred_amenities": [
                "cafe", "market", "metro", "entertainment", "restaurant"
            ],
        },
    },
    "general": {
        "label": "General",
        "description": "Balanced weights across all factors.",
        "icon": "User",
        "weights": {
            "connectivity": 0.25,
            "amenities": 0.25,
            "environment": 0.20,
            "safety": 0.15,
            "climate_flood": 0.15,
        },
        "priority_amenities": [
            "education", "healthcare", "transit", "recreation", "commercial"
        ],
        "filters_defaults": {
            "connectivity_importance": "medium",
            "preferred_amenities": [],
        },
    },
}

# Developer project type profiles
DEVELOPER_PROFILES: Dict[str, Dict[str, Any]] = {
    "residential_colony": {
        "label": "Residential Colony",
        "weights": {
            "accessibility": 0.20,
            "catchment": 0.35,
            "infrastructure": 0.25,
            "environmental": 0.20,
        },
    },
    "commercial_office": {
        "label": "Commercial / Office",
        "weights": {
            "accessibility": 0.35,
            "catchment": 0.30,
            "infrastructure": 0.20,
            "environmental": 0.15,
        },
    },
    "mixed_use": {
        "label": "Mixed-Use",
        "weights": {
            "accessibility": 0.30,
            "catchment": 0.25,
            "infrastructure": 0.25,
            "environmental": 0.20,
        },
    },
    "plotted_development": {
        "label": "Plotted Development",
        "weights": {
            "accessibility": 0.25,
            "catchment": 0.25,
            "infrastructure": 0.30,
            "environmental": 0.20,
        },
    },
}


def get_persona_weights(persona_key: str) -> Dict[str, float]:
    """Returns the weight dict for a given persona key. Falls back to 'general'."""
    profile = PERSONA_PROFILES.get(persona_key, PERSONA_PROFILES["general"])
    return profile["weights"]


def list_personas() -> List[Dict[str, Any]]:
    """Returns all persona profiles as a list for the frontend."""
    result = []
    for key, profile in PERSONA_PROFILES.items():
        result.append({
            "id": key,
            "label": profile["label"],
            "description": profile["description"],
            "icon": profile["icon"],
            "weights": profile["weights"],
            "priority_amenities": profile["priority_amenities"],
            "filters_defaults": profile["filters_defaults"],
        })
    return result
