import os
import asyncio
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.models.database import init_db
from app.api.endpoints import locations, analysis, ai, history, v2
from app.core.http_client import get_shared_client, close_shared_client

from contextlib import asynccontextmanager

async def prewarm_cache():
    """
    Pre-warms in-memory cache for Delhi, Noida, Gurugram, Mumbai, and Bengaluru
    so user requests for key locations respond with zero latency (Requirement 4).
    """
    from app.services.geocoding_service import geocode_query
    from app.api.endpoints.v2 import generate_heatmap, HeatmapRequest

    major_cities = [
        {"name": "Delhi", "min_lat": 28.57, "max_lat": 28.65, "min_lon": 77.16, "max_lon": 77.26},
        {"name": "Noida", "min_lat": 28.58, "max_lat": 28.66, "min_lon": 77.32, "max_lon": 77.40},
        {"name": "Gurugram", "min_lat": 28.42, "max_lat": 28.50, "min_lon": 77.04, "max_lon": 77.12},
        {"name": "Mumbai", "min_lat": 19.02, "max_lat": 19.10, "min_lon": 72.82, "max_lon": 72.90},
        {"name": "Bengaluru", "min_lat": 12.93, "max_lat": 13.01, "min_lon": 77.59, "max_lon": 77.67},
    ]

    for city in major_cities:
        try:
            await geocode_query(city["name"])
            req = HeatmapRequest(
                min_lat=city["min_lat"],
                max_lat=city["max_lat"],
                min_lon=city["min_lon"],
                max_lon=city["max_lon"],
                persona="family",
                grid_size=5
            )
            await generate_heatmap(req)
        except Exception as e:
            print(f"Pre-warm notice for {city['name']}: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_db()
    except Exception as e:
        print(f"Database initialization notice: {e}")
    
    # Initialize shared HTTP client and trigger background cache pre-warm
    get_shared_client()
    asyncio.create_task(prewarm_cache())

    yield

    # Clean shutdown of shared HTTP client connection pool
    await close_shared_client()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Deterministic geospatial scoring, OpenStreetMap & Open-Meteo integrations, and Gemini AI Location Advisor.",
    lifespan=lifespan
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", tags=["System Health"])
async def health_check():
    return {
        "status": "healthy",
        "service": "LandNova Geospatial Intelligence API",
        "version": settings.VERSION,
        "database": "sqlite_ready" if settings.DATABASE_URL.startswith("sqlite") else "postgres_configured",
        "gemini_api_configured": bool(settings.GEMINI_API_KEY),
        "demo_mode_active": True,
        "supported_data_sources": [
            "OpenStreetMap Nominatim",
            "Photon OSM Elasticsearch",
            "OpenStreetMap Overpass API (Single-Query BBox)",
            "Open-Meteo Weather & Air Quality",
            "Copernicus GLO-30 Elevation Model"
        ]
    }

# Register Routers
app.include_router(locations.router, prefix="/api")
app.include_router(analysis.router, prefix="/api/analysis")
app.include_router(ai.router, prefix="/api/ai")
app.include_router(history.router, prefix="/api")
app.include_router(v2.router, prefix="/api")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred.", "error": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
