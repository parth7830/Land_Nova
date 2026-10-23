import os
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.models.database import init_db
from app.api.endpoints import locations, analysis, ai, history

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        init_db()
    except Exception as e:
        print(f"Database initialization notice: {e}")
    yield

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
    """
    Standard health check endpoint providing service uptime, API configuration, and Gemini availability.
    """
    return {
        "status": "healthy",
        "service": "LandNova Geospatial Intelligence API",
        "version": settings.VERSION,
        "database": "sqlite_ready" if settings.DATABASE_URL.startswith("sqlite") else "postgres_configured",
        "gemini_api_configured": bool(settings.GEMINI_API_KEY),
        "demo_mode_active": True,
        "supported_data_sources": [
            "OpenStreetMap Nominatim",
            "OpenStreetMap Overpass API",
            "Open-Meteo Weather Forecast",
            "Open-Meteo Air Quality & CAMS",
            "Copernicus DEM & Flood Resilience Heuristics"
        ]
    }

# Register Routers
app.include_router(locations.router, prefix="/api")
app.include_router(analysis.router, prefix="/api/analysis")
app.include_router(ai.router, prefix="/api/ai")
app.include_router(history.router, prefix="/api")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "An internal server error occurred.", "error": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
