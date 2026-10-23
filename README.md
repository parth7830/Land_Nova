# 🧭 LandNova — AI-Powered Location Intelligence Platform

> **"The Location Is the Decision."**  
> *Providing structured, deterministic, source-labeled location intelligence for Home Buyers, Renters, and Real Estate Developers.*

[![Tests](https://img.shields.io/badge/tests-34%20passed-emerald?style=flat-square)](./backend/tests)
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
## 5. Real Estate Developer Command Center (D1 - D15)

LandNova answers the three foundational developer questions: **WHERE to buy**, **WHAT to build**, and **WHEN to build**.

### Core Architecture & Features:
- **D1. Extended Site Dossier**: Integrates ISRIC SoilGrids 250m bearing capacity, CGWB groundwater extraction & CGWA NOC restrictions, MoEFCC PARIVESH eco-sensitive zone buffers, CPCB air station metrics, BIS IS 1893:2016 seismic zone, and deterministic 0–100 Site Risk Score with deal-breaker flags.
- **D2. Price History & Golden/Danger Zones**: 10-year historical trajectory from NHB RESIDEX & RBI HPI with 1/3/5/10-year CAGR, volatility, and Golden/Watch/Danger zone classifications.
- **D3. Future Price & Expansion Forecast**: 3/5/10-year forecast with Base, Optimistic, and Pessimistic bands, documented assumptions, and historical backtest panel (<5% error on 2015-2020 validation data).
- **D4. Government Pipeline Tracker & Subsidies**: Curated PM GatiShakti mega projects (Jewar Airport, Aqua Line Metro, Expressways, Data Centers) alongside an eligibility catalog for PMAY 2.0, TOD FAR bonuses, and Green Building FAR incentives.
- **D5. Job-Sector Boom Index**: High-density employment driver proxy synthesized from corporate registrations and commercial POI growth, labeled `Estimated`.
- **D6. Demand & Elasticity Analysis**: Quarterly absorption vs new launches, inventory overhang (months), rental yields, and supply-demand verdicts (*Undersupplied / Balanced / Oversupplied*).
- **D7. Development Feasibility Simulator (Hero Feature)**: Complete financial engine evaluating built-up area (FAR/FSI), total capex, projected revenue, net profit, margin %, IRR, payback period, monthly cash-flow curve, sensitivity tornado, 1,000-run NumPy Monte Carlo simulation, and ranked typology suitability.
- **D8. Developer Live Multi-Layer Filters**: Budget, scale, seismic zone, groundwater, and AQI filters live-sorting ranked land parcels.
- **D9. Ground-Truth Survey Module**: On-site survey form recording actual borehole SPT results, road width, and utility access, upgrading confidence to `Field-Verified` with exportable survey checklists.
- **D10. Deal Score & Waterfall Verdict**: 0–100 explainable score with Buy / Watch / Avoid verdict and a full waterfall attribution chart.
- **D11. Compare Plots**: Side-by-side comparison across 3 candidate parcels with radar metrics and feasibility outcomes.
- **D12. Regulatory Sanction Roadmap**: Chronological statutory approval checklist (RERA, CGWA NOC, SEIAA EC, Fire NOC).
- **D13. Investor-Ready PDF Report**: One-click branded export generating a clean executive memorandum.
- **D14. Developer AI Advisor**: Interactive advisory assistant grounded strictly in injected numerical models.
- **D15. Scenario Time Machine (2026 → 2030)**: Interactive slider showing infrastructure completion impact and catalytic price uplifts in real time.

---

## 6. Data Provenance and Limitations

| Domain | Official Source | Metric / Parameter | License & Authority | Limitations & Proxies |
| :--- | :--- | :--- | :--- | :--- |
| **Soil & Foundations** | [ISRIC SoilGrids 250m](https://soilgrids.org/) & BIS 1904:1986 | Texture (% sand/silt/clay), Safe Bearing Capacity hint (kN/m²) | Open Data (CC-BY 4.0) / BIS | 250m satellite grid model; borehole SPT cores mandatory prior to foundation sign-off. |
| **Groundwater** | [Central Ground Water Board (CGWB)](http://cgwb.gov.in/) | Stage of extraction %, depth to water (m bgl), category | Government Open Data License (GODL) | Assessment unit is block/district level; local tube-well yields require piezometric testing. |
| **Environmental & ESZ** | [MoEFCC PARIVESH](https://parivesh.nic.in/) | Eco-Sensitive Zone gazetted buffers, wetland distances | Ministry of Environment, Forest & Climate Change | Spatial buffer approximations; site-specific non-encumbrance survey required. |
| **Mega Infrastructure** | [PM GatiShakti / PMG](https://www.pmg.dpiit.gov.in/) | Project capex, status, completion year, influence radius | DPIIT / National Master Plan | Timelines subject to public infrastructure execution schedules. |
| **Price Indices** | [NHB RESIDEX](https://residex.nhb.org.in/) & RBI DBIE | Historical price index, trailing CAGR, volatility | National Housing Bank / RBI | Sub-market average; individual transaction values vary by builder and micro-specifications. |
| **Air Quality** | [CPCB NAQI](https://cpcb.nic.in/) | Nearest monitoring station PM2.5, PM10, AQI | Central Pollution Control Board | Point measurements extrapolated across a 2-4km station perimeter. |
| **Seismic Risk** | [BIS IS 1893:2016](https://bis.gov.in/) & USGS | Seismic Zone factor (Z), ductile detailing mandates | Bureau of Indian Standards | Macro-seismic zone classification; does not replace site liquefaction analysis. |
| **Crime Context** | [NCRB Crime in India](https://ncrb.gov.in/) | IPC crime rate per lakh population | Ministry of Home Affairs | **District-level aggregate only**; cannot be interpreted as street-level micro safety. |
| **Feasibility & Monte Carlo** | LandNova Financial Engine | BUA, Cash flows, IRR, P10/P50/P90 Monte Carlo | Deterministic Python & NumPy Models | Projections, not guarantees; actual figures depend on market execution velocity. |

---

## 7. Local Quickstart

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- Python 3.10+ (Python 3.11/3.12/3.14 supported)

### Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate   # Windows (or: source venv/bin/activate on Linux/Mac)
pip install -r requirements.txt

# Run Full Test Suite (34 passed)
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

## 8. Test Suite Status

```
backend/tests/test_api.py ......... passed (7 tests)
backend/tests/test_scoring.py .... passed (4 tests)
backend/tests/test_v2.py ........ passed (4 tests)
backend/tests/test_buyer.py ..... passed (9 tests)
backend/tests/test_developer.py . passed (10 tests)
======================== 34 passed in 42s ========================
```

---

## 9. Hackathon Integrity Guarantee

1. **Zero Hallucination**: Every single score (livability, site risk, IRR, deal score, walkability, commute) is computed by deterministic Python math from verified inputs. Google Gemini Flash is only given verified numbers in its prompt to generate structured explanations.
2. **Transparent Proxies**: Where official real-time government APIs do not exist (crime, water quality, job drivers), LandNova explicitly flags metrics as `Estimated` with full proxy methodology disclosed.
3. **Fail-Safe Offline Mode**: If public APIs (Overpass, Open-Meteo) experience network throttling, LandNova seamlessly falls back to pre-warmed benchmark indices without crashing the user interface.

