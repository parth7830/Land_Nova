# 🧭 LandNova — Project One-Pager
**AI-Powered Location Intelligence & Geospatial Feasibility Platform**  
*CU Hackathon 2026 | Built with FastAPI, Next.js 16, Leaflet & Google Gemini*

---

### 1. Executive Summary & Problem Statement
In real estate, **"The Location Is the Decision"**, yet critical location intelligence remains broken and fragmented:
- **For Home Buyers & Renters:** Property portals only showcase cosmetic photos and flat prices. Buyers are blind to street-level flood vulnerabilities, toxic air quality patterns, transit bottlenecks, and real social infrastructure.
- **For Real Estate Developers:** Evaluating land feasibility requires consulting dozens of disconnected government portals (geological surveys, seismic maps, groundwater boards, census records). There is no unified tool that answers both **WHERE to build** and **WHAT to build**.

**LandNova** solves this by unifying open geospatial APIs, deterministic multi-factor scoring algorithms, and Google Gemini AI into a real-time, source-labeled intelligence platform for buyers, renters, and builders.

---

### 2. Dual-Persona Architecture & User Journeys

| Target Persona | Key Workflows & Features | Value Delivered |
| :--- | :--- | :--- |
| **Home Buyers & Renters** | • **Interactive Livability Heatmap:** 10×10 geo-grid color-coded by livability (80-100 emerald to <40 red).<br>• **Configurable Persona Presets:** Pre-calibrated score weights for *Families* (schools/safety), *Working Pros* (transit/metro), and *Bachelors* (lifestyle/mobility).<br>• **Property Listings with Location Intel:** Deep dives with live AQI, flood safety, and amenities.<br>• **AI Location Advisor:** Natural language consultation on neighborhoods powered by Google Gemini. | Eliminates buyer remorse by exposing environmental risks and neighborhood realities before visiting or signing. |
| **Real Estate Developers** | • **12-Section Land Feasibility Dossier:** Automated technical evaluation for any parcel or plot.<br>• **Geo-Technical Ground Truth:** ISRIC SoilGrids (sand/clay/silt ratios), USGS & BIS IS 1893 Seismic zones, CGWB groundwater levels, and Copernicus GLO-30 elevation/slope.<br>• **Typology Optimization:** Tailored feasibility models for Residential Colonies, Commercial IT Hubs, or Mixed-Use developments.<br>• **Regulatory Checklists:** Flagged compliance requirements (RERA, CGWA NOC, EIA approvals). | Cuts site evaluation time from weeks to seconds; prevents costly structural and regulatory surprises. |

---

### 3. Core Technical Architecture & Innovation

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Next.js 16 + React 19 Frontend                    │
│   (Light Modern UI, Canvas Leaflet Grid, Debounced Search, Responsive)  │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST / JSON (Async API)
┌───────────────────────────────────▼────────────────────────────────────┐
│                       FastAPI High-Performance Engine                  │
│  (Shared Async HTTP Client • TTLCache 1-hr • NumPy Vectorized Scoring) │
└──────┬────────────────────┬────────────────────┬─────────────────┬─────┘
       │                    │                    │                 │
┌──────▼──────┐      ┌──────▼──────┐      ┌──────▼──────┐   ┌──────▼──────┐
│  Geospatial │      │ Environment │      │ Geotechnical│   │  Generative │
│ OSM Overpass│      │ Open-Meteo  │      │ ISRIC Soil  │   │  AI Advisor │
│  & Photon   │      │ Copernicus  │      │ USGS + BIS  │   │Google Gemini│
│ (Amenities) │      │  (AQI/DEM)  │      │  (Seismic)  │   │(Flash-Lite) │
└─────────────┘      └─────────────┘      └─────────────┘   └─────────────┘
```

- **Zero-Hallucination Deterministic Engine:** Livability (0–100) and site scores are calculated via pure mathematical algorithms across 5 core pillars: *Connectivity (25%), Amenities (25%), Environment (20%), Safety (15%), and Climate/Flood (15%)*.
- **Live Context-Injected Gemini AI:** Chat questions dynamically geocode target locations, retrieve live AQI and elevation, and inject verified ground truth into Gemini prompts.
- **Engineered for Speed:** Heatmap Overpass queries use single-bounding-box clustering with 10×10 NumPy grid rasterization, dropping response times from ~45s to sub-second cached queries.

---

### 4. Data Provenance & Ethical Transparency
LandNova strictly enforces source-labeled provenance. Every data card displays its origin, timestamp, and confidence rating:
1. **Soil Properties:** ISRIC SoilGrids REST API v2.0 (250m satellite resolution; notes boreholes required).
2. **Seismic Hazard:** USGS Earthquake Catalog + Bureau of Indian Standards (BIS IS 1893:2016 Zones II–V).
3. **Real-time Air Quality:** Open-Meteo European CAMS + US EPA AQI index (PM2.5, PM10).
4. **Civic & Social POIs:** OpenStreetMap Overpass API (hospitals, schools, metro, police within 1.5km).
5. **Flood & Topography:** Copernicus 30m Global Digital Elevation Model (GLO-30).

---

### 5. Competitive Edge & Hackathon Highlights
- **100% Functional & Verified:** 15/15 automated unit and integration tests passing (`pytest`).
- **Complete End-to-End Product:** Not a mockup — full working frontend, live map rendering, real public data ingestion, and interactive AI.
- **Real-World Impact:** Protects families from flood-prone investments and empowers sustainable urban planning.
