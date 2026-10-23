from typing import List, Dict, Optional
from pydantic import BaseModel, Field

class LocationBase(BaseModel):
    display_name: str
    locality: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    country: str = "India"
    latitude: float
    longitude: float
    bounding_box: Optional[List[float]] = None

class LocationResponse(LocationBase):
    id: str
    is_demo: bool = False
    source: str = "Nominatim / OpenStreetMap"

    class Config:
        from_attributes = True

class GeocodeSearchResult(BaseModel):
    query: str
    results: List[LocationResponse]

class AmenityItem(BaseModel):
    id: str
    name: str
    category: str # "education", "healthcare", "transit", "recreation", "commercial", "emergency"
    sub_category: str # "school", "hospital", "metro_station", "park", "supermarket", etc.
    latitude: float
    longitude: float
    distance_meters: float
    source: str = "OpenStreetMap"

class AmenitiesSummary(BaseModel):
    education: int = 0
    healthcare: int = 0
    transit: int = 0
    recreation: int = 0
    commercial: int = 0
    emergency: int = 0

class AmenitiesResponse(BaseModel):
    location_id: str
    latitude: float
    longitude: float
    radius_meters: int
    total_count: int
    counts_by_category: AmenitiesSummary
    items: List[AmenityItem]
    data_source: str = "OpenStreetMap Overpass API"
    data_freshness: str

class WeatherCurrent(BaseModel):
    temperature_c: float
    relative_humidity: float
    apparent_temperature: float
    wind_speed_kmh: float
    precipitation_mm: float
    weather_description: str
    weather_code: int

class AirQualityData(BaseModel):
    us_aqi: Optional[int] = None
    pm2_5: Optional[float] = None
    pm10: Optional[float] = None
    european_aqi: Optional[int] = None
    category_label: str = "Moderate"
    status_color: str = "#f59e0b"

class ClimateRiskData(BaseModel):
    elevation_meters: float
    flood_risk_level: str # "Low", "Moderate", "Elevated", "High"
    flood_risk_score: float # 0-100 (100 = safest)
    annual_rainfall_mm: float
    extreme_heat_days_per_year: int
    historical_flood_note: str

class WeatherClimateResponse(BaseModel):
    location_id: str
    latitude: float
    longitude: float
    current: WeatherCurrent
    air_quality: Optional[AirQualityData] = None
    climate_risk: ClimateRiskData
    source: str = "Open-Meteo & Copernicus Climate Service"
    data_freshness: str
