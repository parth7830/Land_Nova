import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "LandNova — AI-Powered Location Intelligence Platform"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "true").lower() == "true"
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "*"
    ]
    
    # Database (PostgreSQL / PostGIS compatible, SQLite fallback)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./landnova.db")
    
    # AI - Google Gemini
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
    
    # External Geospatial & Climate Services
    NOMINATIM_USER_AGENT: str = os.getenv("NOMINATIM_USER_AGENT", "LandNova-Geospatial-Intelligence/1.0 (contact@landnova.local)")
    OVERPASS_API_URL: str = os.getenv("OVERPASS_API_URL", "https://overpass-api.de/api/interpreter")
    OPEN_METEO_FORECAST_URL: str = "https://api.open-meteo.com/v1/forecast"
    OPEN_METEO_AIR_QUALITY_URL: str = "https://air-quality-api.open-meteo.com/v1/air-quality"
    
    # Default Livability Scoring Weights
    WEIGHT_CONNECTIVITY: float = 0.25
    WEIGHT_AMENITIES: float = 0.25
    WEIGHT_ENVIRONMENT: float = 0.20
    WEIGHT_SAFETY: float = 0.15
    WEIGHT_CLIMATE_FLOOD: float = 0.15

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()
