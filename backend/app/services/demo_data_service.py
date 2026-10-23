from typing import Dict, Any, List

# Curated demonstration locations with realistic geospatial benchmarks
DEMO_LOCATIONS: Dict[str, Dict[str, Any]] = {
    "sector-62-noida": {
        "id": "sector-62-noida",
        "display_name": "Sector 62, Noida, Uttar Pradesh, India",
        "locality": "Sector 62",
        "city": "Noida",
        "state": "Uttar Pradesh",
        "country": "India",
        "latitude": 28.6280,
        "longitude": 77.3649,
        "bounding_box": [28.618, 28.638, 77.354, 77.375],
        "amenities": {
            "counts_by_category": {
                "education": 8,
                "healthcare": 5,
                "transit": 6,
                "recreation": 4,
                "commercial": 12,
                "emergency": 3
            },
            "items": [
                {
                    "id": "osm_trans_1",
                    "name": "Noida Electronic City Metro Station (Blue Line)",
                    "category": "transit",
                    "sub_category": "subway_station",
                    "latitude": 28.6276,
                    "longitude": 77.3725,
                    "distance_meters": 750,
                    "source": "OpenStreetMap Verified"
                },
                {
                    "id": "osm_trans_2",
                    "name": "Sector 62 Metro Station",
                    "category": "transit",
                    "sub_category": "subway_station",
                    "latitude": 28.6212,
                    "longitude": 77.3621,
                    "distance_meters": 820,
                    "source": "OpenStreetMap Verified"
                },
                {
                    "id": "osm_health_1",
                    "name": "Fortis Hospital Noida",
                    "category": "healthcare",
                    "sub_category": "hospital",
                    "latitude": 28.6188,
                    "longitude": 77.3732,
                    "distance_meters": 1200,
                    "source": "OpenStreetMap Verified"
                },
                {
                    "id": "osm_edu_1",
                    "name": "Jaypee Institute of Information Technology (JIIT)",
                    "category": "education",
                    "sub_category": "university",
                    "latitude": 28.6301,
                    "longitude": 77.3718,
                    "distance_meters": 650,
                    "source": "OpenStreetMap Verified"
                },
                {
                    "id": "osm_rec_1",
                    "name": "Tot Mall Park & Green Belt",
                    "category": "recreation",
                    "sub_category": "park",
                    "latitude": 28.6295,
                    "longitude": 77.3610,
                    "distance_meters": 420,
                    "source": "OpenStreetMap Verified"
                },
                {
                    "id": "osm_comm_1",
                    "name": "B-Block Commercial Complex & Supermarket",
                    "category": "commercial",
                    "sub_category": "supermarket",
                    "latitude": 28.6265,
                    "longitude": 77.3635,
                    "distance_meters": 280,
                    "source": "OpenStreetMap Verified"
                },
                {
                    "id": "osm_emg_1",
                    "name": "Sector 58 / 62 Police Station",
                    "category": "emergency",
                    "sub_category": "police",
                    "latitude": 28.6150,
                    "longitude": 77.3610,
                    "distance_meters": 1400,
                    "source": "OpenStreetMap Verified"
                }
            ]
        },
        "weather_climate": {
            "current": {
                "temperature_c": 29.5,
                "relative_humidity": 48.0,
                "apparent_temperature": 30.2,
                "wind_speed_kmh": 11.4,
                "precipitation_mm": 0.0,
                "weather_description": "Clear Sky / Mild Haze",
                "weather_code": 0
            },
            "air_quality": {
                "us_aqi": 168,
                "pm2_5": 88.5,
                "pm10": 162.0,
                "european_aqi": 72,
                "category_label": "Unhealthy for Sensitive Groups",
                "status_color": "#ef4444"
            },
            "climate_risk": {
                "elevation_meters": 204.0,
                "flood_risk_level": "Moderate",
                "flood_risk_score": 72.0,
                "annual_rainfall_mm": 730.0,
                "extreme_heat_days_per_year": 45,
                "historical_flood_note": "Occasional monsoon localized road waterlogging along underpasses; high master-plan stormwater drainage capacity."
            }
        }
    },
    "connaught-place-delhi": {
        "id": "connaught-place-delhi",
        "display_name": "Connaught Place, New Delhi, Delhi, India",
        "locality": "Connaught Place",
        "city": "New Delhi",
        "state": "Delhi",
        "country": "India",
        "latitude": 28.6315,
        "longitude": 77.2167,
        "bounding_box": [28.625, 28.638, 77.208, 77.225],
        "amenities": {
            "counts_by_category": {
                "education": 4,
                "healthcare": 6,
                "transit": 12,
                "recreation": 6,
                "commercial": 38,
                "emergency": 5
            },
            "items": [
                {
                    "id": "osm_cp_trans_1",
                    "name": "Rajiv Chowk Metro Interchange (Blue & Yellow Lines)",
                    "category": "transit",
                    "sub_category": "subway_station",
                    "latitude": 28.6328,
                    "longitude": 77.2195,
                    "distance_meters": 150,
                    "source": "OpenStreetMap Verified"
                },
                {
                    "id": "osm_cp_trans_2",
                    "name": "Shivaji Stadium Metro Station (Airport Express Line)",
                    "category": "transit",
                    "sub_category": "subway_station",
                    "latitude": 28.6285,
                    "longitude": 77.2115,
                    "distance_meters": 550,
                    "source": "OpenStreetMap Verified"
                },
                {
                    "id": "osm_cp_health_1",
                    "name": "Dr. Ram Manohar Lohia (RML) Hospital",
                    "category": "healthcare",
                    "sub_category": "hospital",
                    "latitude": 28.6242,
                    "longitude": 77.2012,
                    "distance_meters": 1600,
                    "source": "OpenStreetMap Verified"
                },
                {
                    "id": "osm_cp_rec_1",
                    "name": "Central Park, Connaught Place",
                    "category": "recreation",
                    "sub_category": "park",
                    "latitude": 28.6322,
                    "longitude": 77.2185,
                    "distance_meters": 80,
                    "source": "OpenStreetMap Verified"
                },
                {
                    "id": "osm_cp_emg_1",
                    "name": "Connaught Place Police Station",
                    "category": "emergency",
                    "sub_category": "police",
                    "latitude": 28.6335,
                    "longitude": 77.2140,
                    "distance_meters": 320,
                    "source": "OpenStreetMap Verified"
                }
            ]
        },
        "weather_climate": {
            "current": {
                "temperature_c": 30.1,
                "relative_humidity": 45.0,
                "apparent_temperature": 30.8,
                "wind_speed_kmh": 12.0,
                "precipitation_mm": 0.0,
                "weather_description": "Sunny / Light Haze",
                "weather_code": 1
            },
            "air_quality": {
                "us_aqi": 182,
                "pm2_5": 115.0,
                "pm10": 195.0,
                "european_aqi": 78,
                "category_label": "Unhealthy",
                "status_color": "#ef4444"
            },
            "climate_risk": {
                "elevation_meters": 216.0,
                "flood_risk_level": "Low",
                "flood_risk_score": 86.0,
                "annual_rainfall_mm": 790.0,
                "extreme_heat_days_per_year": 52,
                "historical_flood_note": "Elevated central ridge zone; negligible natural river flood vulnerability."
            }
        }
    },
    "indiranagar-bengaluru": {
        "id": "indiranagar-bengaluru",
        "display_name": "Indiranagar, Bengaluru, Karnataka, India",
        "locality": "Indiranagar",
        "city": "Bengaluru",
        "state": "Karnataka",
        "country": "India",
        "latitude": 12.9784,
        "longitude": 77.6408,
        "bounding_box": [12.965, 12.988, 77.630, 77.655],
        "amenities": {
            "counts_by_category": {
                "education": 7,
                "healthcare": 8,
                "transit": 5,
                "recreation": 5,
                "commercial": 32,
                "emergency": 3
            },
            "items": [
                {
                    "id": "osm_blr_trans_1",
                    "name": "Indiranagar Metro Station (Purple Line)",
                    "category": "transit",
                    "sub_category": "subway_station",
                    "latitude": 12.9783,
                    "longitude": 77.6385,
                    "distance_meters": 240,
                    "source": "OpenStreetMap Verified"
                },
                {
                    "id": "osm_blr_health_1",
                    "name": "Chinmaya Mission Hospital",
                    "category": "healthcare",
                    "sub_category": "hospital",
                    "latitude": 12.9805,
                    "longitude": 77.6432,
                    "distance_meters": 350,
                    "source": "OpenStreetMap Verified"
                },
                {
                    "id": "osm_blr_rec_1",
                    "name": "Defence Colony Park & Play Area",
                    "category": "recreation",
                    "sub_category": "park",
                    "latitude": 12.9750,
                    "longitude": 77.6440,
                    "distance_meters": 480,
                    "source": "OpenStreetMap Verified"
                },
                {
                    "id": "osm_blr_comm_1",
                    "name": "100 Feet Road Retail Corridor",
                    "category": "commercial",
                    "sub_category": "mall",
                    "latitude": 12.9720,
                    "longitude": 77.6412,
                    "distance_meters": 300,
                    "source": "OpenStreetMap Verified"
                }
            ]
        },
        "weather_climate": {
            "current": {
                "temperature_c": 24.5,
                "relative_humidity": 68.0,
                "apparent_temperature": 24.8,
                "wind_speed_kmh": 14.5,
                "precipitation_mm": 0.2,
                "weather_description": "Partly Cloudy",
                "weather_code": 2
            },
            "air_quality": {
                "us_aqi": 68,
                "pm2_5": 20.2,
                "pm10": 48.0,
                "european_aqi": 34,
                "category_label": "Moderate / Good",
                "status_color": "#10b981"
            },
            "climate_risk": {
                "elevation_meters": 910.0,
                "flood_risk_level": "Low",
                "flood_risk_score": 88.0,
                "annual_rainfall_mm": 970.0,
                "extreme_heat_days_per_year": 12,
                "historical_flood_note": "Plateau topography; excellent natural slope gradient prevents persistent standing water."
            }
        }
    },
    "bkc-mumbai": {
        "id": "bkc-mumbai",
        "display_name": "Bandra Kurla Complex (BKC), Mumbai, Maharashtra, India",
        "locality": "BKC",
        "city": "Mumbai",
        "state": "Maharashtra",
        "country": "India",
        "latitude": 19.0657,
        "longitude": 77.8681,
        "bounding_box": [19.055, 19.075, 72.855, 72.880],
        "amenities": {
            "counts_by_category": {
                "education": 3,
                "healthcare": 4,
                "transit": 8,
                "recreation": 3,
                "commercial": 24,
                "emergency": 4
            },
            "items": [
                {
                    "id": "osm_mum_trans_1",
                    "name": "BKC Metro Station (Aqua Line 3)",
                    "category": "transit",
                    "sub_category": "subway_station",
                    "latitude": 19.0665,
                    "longitude": 72.8670,
                    "distance_meters": 180,
                    "source": "OpenStreetMap Verified"
                },
                {
                    "id": "osm_mum_health_1",
                    "name": "Asian Heart Institute",
                    "category": "healthcare",
                    "sub_category": "hospital",
                    "latitude": 19.0620,
                    "longitude": 72.8690,
                    "distance_meters": 450,
                    "source": "OpenStreetMap Verified"
                },
                {
                    "id": "osm_mum_comm_1",
                    "name": "Jio World Drive & Convention Centre",
                    "category": "commercial",
                    "sub_category": "mall",
                    "latitude": 19.0635,
                    "longitude": 72.8655,
                    "distance_meters": 350,
                    "source": "OpenStreetMap Verified"
                }
            ]
        },
        "weather_climate": {
            "current": {
                "temperature_c": 28.8,
                "relative_humidity": 76.0,
                "apparent_temperature": 32.5,
                "wind_speed_kmh": 16.2,
                "precipitation_mm": 0.0,
                "weather_description": "Humid / Hazy Sunshine",
                "weather_code": 1
            },
            "air_quality": {
                "us_aqi": 112,
                "pm2_5": 42.0,
                "pm10": 85.0,
                "european_aqi": 52,
                "category_label": "Moderate",
                "status_color": "#f59e0b"
            },
            "climate_risk": {
                "elevation_meters": 8.0,
                "flood_risk_level": "Elevated",
                "flood_risk_score": 58.0,
                "annual_rainfall_mm": 2400.0,
                "extreme_heat_days_per_year": 28,
                "historical_flood_note": "Mithi river flood zone proximity; high monsoon rainfall vulnerability requires engineered plinth elevation."
            }
        }
    },
    "hitec-city-hyderabad": {
        "id": "hitec-city-hyderabad",
        "display_name": "HITEC City, Madhapur, Hyderabad, Telangana, India",
        "locality": "HITEC City",
        "city": "Hyderabad",
        "state": "Telangana",
        "country": "India",
        "latitude": 17.4435,
        "longitude": 78.3772,
        "bounding_box": [17.435, 17.455, 78.365, 78.390],
        "amenities": {
            "counts_by_category": {
                "education": 6,
                "healthcare": 5,
                "transit": 7,
                "recreation": 4,
                "commercial": 26,
                "emergency": 3
            },
            "items": [
                {
                    "id": "osm_hyd_trans_1",
                    "name": "HITEC City Metro Station (Blue Line)",
                    "category": "transit",
                    "sub_category": "subway_station",
                    "latitude": 17.4452,
                    "longitude": 78.3790,
                    "distance_meters": 220,
                    "source": "OpenStreetMap Verified"
                },
                {
                    "id": "osm_hyd_health_1",
                    "name": "Medicover Hospitals Madhapur",
                    "category": "healthcare",
                    "sub_category": "hospital",
                    "latitude": 17.4485,
                    "longitude": 78.3820,
                    "distance_meters": 680,
                    "source": "OpenStreetMap Verified"
                },
                {
                    "id": "osm_hyd_comm_1",
                    "name": "Inorbit Mall Cyberabad",
                    "category": "commercial",
                    "sub_category": "mall",
                    "latitude": 17.4355,
                    "longitude": 78.3860,
                    "distance_meters": 1100,
                    "source": "OpenStreetMap Verified"
                }
            ]
        },
        "weather_climate": {
            "current": {
                "temperature_c": 27.2,
                "relative_humidity": 55.0,
                "apparent_temperature": 28.0,
                "wind_speed_kmh": 10.5,
                "precipitation_mm": 0.0,
                "weather_description": "Partly Cloudy",
                "weather_code": 2
            },
            "air_quality": {
                "us_aqi": 85,
                "pm2_5": 28.0,
                "pm10": 64.0,
                "european_aqi": 42,
                "category_label": "Moderate",
                "status_color": "#10b981"
            },
            "climate_risk": {
                "elevation_meters": 542.0,
                "flood_risk_level": "Low",
                "flood_risk_score": 85.0,
                "annual_rainfall_mm": 820.0,
                "extreme_heat_days_per_year": 38,
                "historical_flood_note": "Granite bedrock terrain with good natural drainage corridors."
            }
        }
    }
}

def get_demo_location(location_id: str) -> Optional[Dict[str, Any]]:
    # Exact or fuzzy key lookup
    cleaned = location_id.lower().replace(" ", "-").replace(",", "")
    for key, data in DEMO_LOCATIONS.items():
        if key in cleaned or cleaned in key:
            return data
    return None

def find_closest_demo(lat: float, lon: float) -> Optional[Dict[str, Any]]:
    # If coordinates are very close to one of the demo cities, use its realistic profile
    for key, data in DEMO_LOCATIONS.items():
        dlat = abs(data["latitude"] - lat)
        dlon = abs(data["longitude"] - lon)
        if dlat < 0.1 and dlon < 0.1:
            return data
    return None
