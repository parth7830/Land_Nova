# 🧭 LandNova — AI-Powered Location Intelligence Platform

> **"The Location Is the Decision."**  
> *Providing structured, deterministic, source-labeled location intelligence for Home Buyers, Renters, and Real Estate Developers.*

[![Tests](https://img.shields.io/badge/tests-24%20passed-emerald?style=flat-square)](./backend/tests)
[![Next.js](https://img.shields.io/badge/frontend-Next.js%2016%20%7C%20React%2019-slate?style=flat-square)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI%200.110-teal?style=flat-square)](https://fastapi.tiangolo.com)
[![Geospatial](https://img.shields.io/badge/maps-Leaflet%20%2B%20OpenStreetMap-blue?style=flat-square)](https://leafletjs.com)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini%20Flash-amber?style=flat-square)](https://ai.google.dev)
[![Theme](https://img.shields.io/badge/UI-Clean%20Light%20Theme-emerald?style=flat-square)]()

---

## 1. Core Problem Statement

Real estate developers have no single tool that analyzes a location end-to-end (**soil characteristics, groundwater table, seismic hazard, climate normals, local resources, multimodal connectivity, and resident profile/needs**) to decide **WHERE to build** and **WHAT to build**. 

Simultaneously, buyers and renters only see cosmetic listing photos and prices, with no real analysis of surrounding neighborhood livability, pollution, transit friction, or flood history.

**LandNova bridges this gap** by synthesizing open geospatial datasets, machine learning models, deterministic scoring engines, and Google Gemini AI into structured, source-labeled intelligence for both audiences.

---

## 2. End-to-End User Journeys

```
                 ┌────────────────────────────────┐
                 │    Page 1: Role Gateway        │
                 │   (Choose Persona / Path)      │
                 └───────────────┬────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│ Buyer / Renter Journey          │   │ Real Estate Developer Journey   │
│ • Verified 5-Factor Livability  │   │ • 12-Section Site Feasibility   │
│ • Interactive Spatial Heatmap   │   │ • Soil (ISRIC SoilGrids 250m)   │
│ • Street & Satellite Basemaps   │   │ • Seismic Hazard (USGS/BIS)     │
│ • Live Commute & EMI Simulator  │   │ • Climate Normals & Flooding    │
│ • 15-Minute City Walkability    │   │ • Demographic Profile (Census)  │
│ • Waterfall Score Breakdown     │   │ • Preliminary Structural Advice │
└────────────────┬────────────────┘   └────────────────┬────────────────┘
                 ▼                                     ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│ Spatial Heatmap Explorer        │   │ Developer Feasibility Dossier   │
│ • Clean Light OpenStreetMap/Esri│   │ • Foundation Recommendations    │
│ • Sector Polygon Visual Field   │   │ • Rainwater Harvesting Mandates │
│ • 7 Layer Filters (AQI, Transit)│   │ • Catchment Spending Persona    │
│ • Right Area Analysis Drawer    │   │ • Exportable Regulatory PDF     │
└─────────────────────────────────┘   └─────────────────────────────────┘
```

---

## 3. Buyer & Renter Experience

### Part A: Spatial Heatmap & Explorer (Clean Light Mode)
- **Interactive Multi-Basemap Map**: Instant toggle between **🗺️ Street Map** (OpenStreetMap — clean, crisp, 100% reliable) and **🛰️ Satellite** (Esri World Imagery with CartoDB labels).
- **Smooth Visual Field**: Sector cadastral boundaries color-graded by suitability (Emerald: 80–100, Lime: 60–79, Amber: 40–59, Red: <40) with centroid score badges.
- **7 Layer Toggles**: Heat Map, Transit & Multimodal, Amenities, AQI, Crime (Proxy), Schools, and Hospitals.
- **Left Preferences Panel**: Property type chips, budget slider, amenity toggles, environmental filters, max commute constraint, and live normalized weight display.
- **Right Area Analysis Drawer**: Circular suitability score ring, 4 category tabs (*Overview, Amenities, Environment, Safety*), expandable metric rows showing data source, freshness timestamp, confidence badge, and exact mathematical formula.
- **Bottom Recommended Cards**: Ranked horizontal cards with match badges and deterministic reason bullets.

### Part B: Advanced Intelligence Features
1. **Commute Calculator (B1)**: Real-time driving, transit, and cycling estimates from candidate sectors to user workplace, with automatic visual dimming for sectors outside maximum commute time.
2. **Compare Candidate Areas (B2)**: Side-by-side comparison matrix for 2–3 sectors featuring deterministic metrics alongside a strictly-grounded Gemini AI comparative assessment.
3. **Affordability & EMI Calculator (B3)**: Real-time unit price simulation, 20% down payment calculation, 20-year monthly EMI estimate, and household income stress-test guidelines.
4. **15-Minute-City Walkability Score (B4)**: Walking distances and durations to daily essentials (*grocery, pharmacy, primary school, transit, park*) with categorical walkability labels.
5. **Flood & Climate Deep Dive (B5)**: Copernicus GLO-30 absolute elevation, 10-year historical monsoon extreme rainfall records (24h max), and 12-month seasonal AQI curve.
6. **Custom Weights & Presets (B6)**: Direct 5-pillar slider fine-tuning (*Connectivity, Amenities, Environment, Safety, Climate/Flood*) with 1-click presets (*Family, Working Professional, Bachelor, Pet Owner, Senior Citizen*).
7. **Shareable Search URLs (B7)**: Encodes selected location, candidate sectors, budget, and weights directly into shareable links.
8. **Grounded AI Advisor (B8)**: Natural language inquiry engine grounded strictly in verified numerical context (zero LLM hallucination).
9. **Site Visit Checklist (B9)**: Automated, prioritized inspection checklist tailored to the site's environmental and geotechnical risks, formatted for print.
10. **Waterfall Explainability (B10)**: "Why This Score?" decomposition detailing each pillar's raw score, applied percentage weight, and points contribution to the final 0–100 score.

---

## 4. LandNova Data Honesty Map

Every metric rendered across LandNova carries an explicit **confidence badge** (*High / Medium / Estimated*) and transparent methodology disclosure:

| Indicator | Nature | Primary Source | Confidence Badge | Methodology / Proxy Description |
| :--- | :--- | :--- | :--- | :--- |
| **Air Quality (AQI / PM2.5)** | Measured | Open-Meteo Air Quality & CAMS | `High` | Hourly satellite-blended atmospheric CAMS model |
| **Multimodal Transit** | Measured | OpenStreetMap Overpass API | `High` | Metro stations, bus stops, and railway hubs within catchment |
| **Social Amenities** | Measured | OpenStreetMap Overpass API | `High` | Verified schools, tertiary hospitals, daily markets, and parks |
| **Elevation & Flood Risk** | Measured | Copernicus GLO-30 DEM | `High` | Absolute elevation in meters & relative topography drainage |
| **Extreme Rainfall** | Measured | Open-Meteo Historical Archive | `High` | 10-year monsoon 24-hour peak precipitation records |
| **Safety & Crime** | **Proxy** | OpenStreetMap Civic POIs | `Estimated` | Distance to nearest police outpost & civic lighting coverage |
| **Water Quality** | **Proxy** | CGWB District Groundwater Index | `Estimated` | District aquifer TDS (mg/L) & Central Ground Water Board benchmarks |
| **Ambient Noise** | **Proxy** | OpenStreetMap Road Hierarchy | `Estimated` | Proximity to national highways, arterial expressways, and commercial POIs |
| **Property Prices** | Sample Index | State Benchmark Index | `Sample Index` | Curated sample market baseline per sq.ft (demo mode) |

---

## 5. API Reference

All backend endpoints are async, resilient, and cached with TTLCache:

### Buyer Intelligence Endpoints (`/api/buyer/*`)
- `GET /api/buyer/sectors?city=Noida` — List candidate benchmark sectors with full metrics
- `POST /api/buyer/evaluate` — Evaluate sectors against user preferences and custom weights
- `GET /api/buyer/top-recommended?city=Noida` — Ranked top candidate areas
- `POST /api/buyer/commute` — Multi-modal commute calculations
- `POST /api/buyer/compare` — Side-by-side sector comparison + Grounded AI summary
- `POST /api/buyer/affordability` — Unit price and EMI simulation
- `GET /api/buyer/walkability/{sector_id}` — 15-Minute-City essential errands breakdown
- `GET /api/buyer/flood-climate/{sector_id}` — Elevation, 10-year rainfall extremes, seasonal AQI
- `GET /api/buyer/waterfall/{sector_id}` — Score contribution waterfall breakdown
- `GET /api/buyer/checklist/{sector_id}` — Prioritized site visit inspection checklist
- `POST /api/buyer/ai-query` — Grounded natural language query answering

### Core Location & Feasibility Endpoints (`/api/*`)
- `GET /api/geocode?q=...` — Instant local matching + Photon geocoding with Nominatim fallback
- `GET /api/location/{id}/amenities` — Overpass API spatial amenity counts
- `GET /api/location/{id}/weather` — Real-time weather, AQI, and Copernicus DEM elevation
- `POST /api/analysis/livability` — Deterministic 5-factor livability scoring engine
- `POST /api/developer/site-report` — 12-Section comprehensive developer feasibility dossier
- `POST /api/chat/advisor` — Conversational AI location advisor with strict grounding

---

## 6. Local Quickstart

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- Python 3.10+ (Python 3.11/3.12/3.14 supported)

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows (or: source venv/bin/activate on Linux/Mac)
pip install -r requirements.txt

# Run Unit Tests (24 passed)
$env:PYTHONPATH='.'; python -m pytest -q

# Start FastAPI Server (Port 8000)
$env:PYTHONPATH='.'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install

# Production Build & Verification
npm run build

# Start Next.js Server (Port 3000)
npm run start
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 7. Test Suite Status

```
backend/tests/test_api.py ......... passed (7 tests)
backend/tests/test_scoring.py .... passed (4 tests)
backend/tests/test_v2.py ........ passed (4 tests)
backend/tests/test_buyer.py ..... passed (9 tests)
======================== 24 passed in 91s ========================
```

---

## 8. Hackathon Integrity Guarantee

1. **Zero Hallucination**: Every single score (livability, feasibility, walkability, commute) is computed by deterministic Python math from verified inputs. Google Gemini Flash is only given verified numbers in its prompt to generate structured explanations.
2. **Transparent Proxies**: Where official real-time government APIs do not exist (crime, water quality, noise), LandNova explicitly flags metrics as `Estimated` with full proxy methodology disclosed.
3. **Fail-Safe Offline Mode**: If public APIs (Overpass, Open-Meteo) experience network throttling, LandNova seamlessly falls back to pre-warmed benchmark indices without crashing the user interface.
