# 🧭 LandNova — AI-Powered Location Intelligence Platform

> **"The Location Is the Decision."**  
> *Providing structured, source-labeled location intelligence for Home Buyers, Renters, and Real Estate Developers.*

[![Tests](https://img.shields.io/badge/tests-15%20passed-emerald)](./backend/tests)
[![Next.js](https://img.shields.io/badge/frontend-Next.js%2016%20App%20Router-slate)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI%200.110-teal)](https://fastapi.tiangolo.com)
[![Geospatial](https://img.shields.io/badge/maps-Leaflet%20%2B%20OpenStreetMap-blue)](https://leafletjs.com)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini-amber)](https://ai.google.dev)

---

## 1. Core Problem Statement

Real estate developers have no single tool that analyzes a location end-to-end (**soil characteristics, groundwater table, seismic hazard, climate normals, local resources, multimodal connectivity, and resident profile/needs**) to decide **WHERE to build** and **WHAT to build**. 

Simultaneously, buyers and renters only see cosmetic listing photos and prices, with no real analysis of the surrounding neighborhood livability, pollution, transit friction, or flood history.

**LandNova bridges this gap** by synthesizing open geospatial datasets, machine learning models, deterministic scoring engines, and Google Gemini AI into structured, source-labeled intelligence for both audiences.

---

## 2. End-to-End User Journeys (v2 Architecture)

```
                 ┌────────────────────────────────┐
                 │    Page 1: Role Gateway        │
                 │   (Choose Persona / Path)      │
                 └───────────────┬────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│ Page 2: Buyer / Renter Home     │   │ Developer Home                  │
│ • "Hot Selling Properties" Grid │   │ • Project Typology (Res/Comm)   │
│ • Area & Price Filter Popovers  │   │ • Scale (Acres) & Target Budget │
│ • City Geocoding Autocomplete   │   │ • Saved Benchmark Sites         │
└────────────────┬────────────────┘   └────────────────┬────────────────┘
                 ▼                                     ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│ Page 3: Persona & Preferences   │   │ 12-Section Site Analysis Report │
│ • Family / Pro / Bachelor Cards │   │ • Soil (ISRIC SoilGrids 250m)   │
│ • Preloaded Configurable Weights│   │ • Seismic (USGS & BIS IS 1893)  │
│ • Mandatory Amenities Checklist │   │ • Groundwater (CGWB / WRIS)     │
└────────────────┬────────────────┘   │ • Census Resident Profile       │
                 ▼                    │ • Gemini Structural Guidance    │
┌─────────────────────────────────┐   └─────────────────────────────────┘
│ Page 4: Heatmap Explorer        │
│ • Full-screen Leaflet Grid      │
│ • Persona-Weighted Color Legend │
│ • Filter Sidebar & Top 5 Areas  │
│ • Slide-out Detail Drawer       │
└─────────────────────────────────┘
```

---

## 3. Verified Data Layers & Provenance

Every data point rendered by LandNova is explicitly labeled with its **source**, **timestamp**, **confidence level**, and **status** (`ok`, `partial`, or `unavailable`):

| Layer | Primary Source | Status / Confidence | Fallback / Resolution Handling |
| :--- | :--- | :--- | :--- |
| **Geocoding & Boundaries** | OpenStreetMap Nominatim | Live (High) | Verified benchmark coordinates catalog |
| **Social Amenities & POIs** | OpenStreetMap Overpass API | Live (High) | Cached local POI indices (1.5km catchment) |
| **Weather & Real-time AQI** | Open-Meteo Air Quality & CAMS | Live (High) | US AQI, PM2.5, PM10 & European AQI |
| **Terrain & Flood Safety** | Copernicus GLO-30 DEM | Live (Moderate) | Elevation gradient & runoff heuristics |
| **Soil Properties** | ISRIC SoilGrids REST API v2.0 | Live / Model (250m) | Sand/silt/clay mix; notes SPT survey needed |
| **Seismic Risk** | USGS Earthquake Catalog + BIS IS 1893 | Live (Official) | Historical events (<300km) + BIS Zones II–V |
| **Groundwater Table** | Central Ground Water Board (CGWB) | Partial / Benchmark | District-level depth; hydrogeologist VES needed |
| **Demographics & Profile** | Census of India (District/Ward) | Partial (Dated) | Cites Census year (2011); labeled as dated |
| **Market Indicators** | State Sub-Registrar / IGRS | Unavailable | Labeled "Data unavailable via open API" |
| **AI Location Advisor** | Google Gemini 1.5 Flash | Live / Structured Demo | Zero-hallucination ground truth context |

---

## 4. Scoring Engine & Persona Weight Profiles

Livability and site feasibility scores are computed **deterministically** (never hallucinated by an LLM). 

### Persona Weight Presets (`app/core/personas.py`)
- **Family:** Amenities (30%), Environment/AQI (25%), Safety (20%), Connectivity (15%), Climate/Flood (10%).
- **Working Professional:** Connectivity (35%), Amenities (20%), Environment (20%), Climate/Flood (15%), Safety (10%).
- **Bachelor(s):** Connectivity (30%), Amenities/Nightlife (25%), Environment (15%), Safety (15%), Climate/Flood (15%).

### Developer Suitability Weights
- **Commercial / Office:** Accessibility (35%), Catchment (30%), Civic Infrastructure (20%), Environmental Buffer (15%).
- **Residential Colony:** Catchment (35%), Infrastructure (25%), Environmental (20%), Accessibility (20%).
- **Mixed-Use:** Accessibility (30%), Catchment (25%), Infrastructure (25%), Environmental (20%).

---

## 5. Known Limitations & Data Integrity Disclosures

In accordance with LandNova's core data integrity rules:

1. **Soil Data Resolution:** ISRIC SoilGrids provides macro-spatial estimates at 250m satellite resolution. It cannot substitute for on-site geotechnical boreholes (Standard Penetration Tests) required before structural foundation sign-off.
2. **Groundwater Table:** Micro-level plot water tables fluctuate seasonally. India-WRIS and CGWB data represent district/block averages; plot-level vertical electrical soundings (VES) and CGWA NOCs remain mandatory.
3. **Crime & Safety Statistics:** National Crime Records Bureau (NCRB) statistics exist only at district/state levels. LandNova never presents district averages as street-level safety, relying instead on mapped civic emergency nodes (police, fire, hospitals).
4. **Census Demographics:** The decennial Census of India was last executed in 2011. While LandNova uses these verified benchmarks, all demographics are flagged with a "Dated" warning banner.
5. **Government Circle Rates:** Automated property registration transaction registries are not publicly accessible via open APIs across Indian states; this indicator is labeled as "Data unavailable via verified public open API".

---

## 6. Quickstart & Local Execution

### Backend (FastAPI + Python 3.11+)
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt

# Run Unit Tests (15 passed)
$env:PYTHONPATH='.'; python -m pytest

# Start Server
$env:PYTHONPATH='.'; python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend (Next.js 16 + React 19 + Tailwind CSS)
```bash
cd frontend
npm install
npm run build
npm run start
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 7. Verified Hackathon Test Coverage

```
tests/test_api.py ......... passed (7 tests)
tests/test_scoring.py .... passed (4 tests)
tests/test_v2.py ........ passed (4 tests: personas, listings, heatmap, developer site report)
Total: 15 passed, 0 failures
```
