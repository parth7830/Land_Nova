# 🧭 LandNova — AI-Powered Location Intelligence Platform

> **"The Location Is the Decision."**  
> *Providing structured, deterministic, source-labeled location intelligence for Home Buyers, Renters, and Real Estate Developers.*

[![Tests](https://img.shields.io/badge/tests-44%20passed-emerald?style=flat-square)](./backend/tests)
[![Next.js](https://img.shields.io/badge/frontend-Next.js%2016%20%7C%20React%2019-slate?style=flat-square)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI%200.110-teal?style=flat-square)](https://fastapi.tiangolo.com)
[![Geospatial](https://img.shields.io/badge/maps-Leaflet%20%2B%20OpenStreetMap-blue?style=flat-square)](https://leafletjs.com)
[![Database](https://img.shields.io/badge/reviews-SQLite%203-indigo?style=flat-square)](https://sqlite.org)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini%20Flash-amber?style=flat-square)](https://ai.google.dev)
[![Theme](https://img.shields.io/badge/UI-Clean%20Light%20Theme-emerald?style=flat-square)]()

---

## 1. Core Problem Statement

Real estate developers have no unified system that analyzes a parcel end-to-end (**soil characteristics, groundwater table, seismic hazard, climate normals, local resources, multimodal connectivity, and resident profiles**) to decide **WHERE to buy**, **WHAT to build**, and **WHEN to build**. 

Simultaneously, buyers and renters only see cosmetic listing photos and prices, with no real analysis of surrounding neighborhood livability, pollution, transit friction, authentic resident sentiment, or flood history.

**LandNova bridges this gap** by synthesizing open geospatial datasets, statistical algorithms, deterministic scoring engines, SQLite-backed community feedback, and Google Gemini AI into structured, source-labeled intelligence for both audiences.

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
│ • Verified 5-Factor Livability  │   │ • Developer Cadastral Heatmap   │
│ • Interactive Persona Heatmap   │   │ • 12-Section Site Feasibility   │
│ • Street & Satellite Basemaps   │   │ • Soil (ISRIC SoilGrids 250m)   │
│ • Live Commute & EMI Simulator  │   │ • Seismic Hazard (USGS/BIS)     │
│ • 15-Minute City Walkability    │   │ • Climate Normals & Flooding    │
│ • SQLite Community Reviews Tab  │   │ • 1,000-Run Monte Carlo Sim     │
│ • Waterfall Score Breakdown     │   │ • Minimizable AI Advisor (D14)  │
└────────────────┬────────────────┘   └────────────────┬────────────────┘
                 ▼                                     ▼
┌─────────────────────────────────┐   ┌─────────────────────────────────┐
│ Spatial Heatmap Explorer        │   │ Developer Feasibility Dossier   │
│ • Clean Light OpenStreetMap/Esri│   │ • Foundation Recommendations    │
│ • "GENERATE SUITABILITY MAP"    │   │ • Permissible FAR & Capex/IRR   │
│ • 7 Layer Filters (AQI, Transit)│   │ • Catchment Spending Persona    │
│ • Right Area Analysis Drawer    │   │ • Exportable Regulatory PDF     │
└─────────────────────────────────┘   └─────────────────────────────────┘
```

---

## 3. Buyer & Renter Experience

### Part A: Spatial Heatmap & Persona Explorer (Clean Light Mode)
- **"GENERATE SUITABILITY MAP"**: One-click generation of the personalized suitability heatmap with `"EXPLORE PERSONA HEATMAP"` subtitle.
- **Interactive Multi-Basemap Map**: Instant toggle between **🗺️ Street Map** (OpenStreetMap — clean, crisp, 100% reliable) and **🛰️ Satellite** (Esri World Imagery with CartoDB labels). Top-right placement guarantees Leaflet zoom buttons (`+` and `-`) remain fully visible on the top-left.
- **Cadastral Boundary Visual Field**: Sector cadastral boundaries color-graded by suitability (Emerald: 80–100, Lime: 60–79, Amber: 40–59, Red: <40) with centroid score badges.
- **7 Layer Toggles**: Heat Map, Transit & Multimodal, Amenities, AQI, Crime (Proxy), Schools, and Hospitals.
- **Left Preferences Panel**: Property type chips, budget slider, amenity toggles, environmental filters, max commute constraint, and live normalized weight display.
- **Right Area Analysis Drawer**: Circular suitability score ring, 5 category tabs (*Overview, Amenities, Environment, Safety, ★ Reviews*), expandable metric rows showing data source, freshness timestamp, confidence badge, and exact mathematical formula.
- **Bottom Recommended Cards**: Ranked horizontal cards with match badges, commute drive times, deterministic reason bullets, and review rating badges (`★ 4.4 demo`).

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

### Part C: Community Review System (B11)
- **Dedicated Reviews Tab**: Seamlessly integrated inside `AreaAnalysisDrawer` alongside objective metrics.
- **Multi-Category Ratings**: 1–5 overall star rating plus granular ratings across 6 pillars (*Safety, Connectivity, Cleanliness, Noise, Water & Power, Community*).
- **SQLite Persistence**: Stored in `data/reviews.db` with automated migrations and seeded demo reviews across Noida sectors.
- **Resident Filtering & Sorting**: Filter by resident type (*Owner*, *Tenant*, *Visitor*) and sort by *Newest*, *Highest Rating*, *Lowest Rating*, and *Most Helpful*.
- **Interactive Review Form**: "Write a Review" modal with real-time character counter (20–500 chars), interactive star pickers, stay duration, and rate-limiting (max 5 submissions/hr/IP).
- **Decoupled Scoring & Labeling**: Seeded reviews are explicitly flagged as `"Demo reviews"` and user submissions as `"Community review"`. Community reviews are kept strictly separated from deterministic suitability scores (no silent score blending).

---

## 4. Real Estate Developer Experience & Command Center

### Part A: Developer Cadastral Heatmap
- **Seeded Zone Dataset**: 12 cadastral zones across Noida and Greater Noida (`backend/data/developer_demo_zones.json`) with demo metrics: connectivity score, amenities score, AQI, traffic level, flood risk, groundwater category, land rates (₹/sqft), 5-year CAGR, and permitted FAR.
- **NumPy Scoring Engine**: Vectorized multi-criteria evaluation with configurable weights (*Connectivity, Amenities, AQI, Traffic, Growth, Land Rate, FAR*) and normalized scoring.
- **Hard Exclusions & Dimming**: Zones failing strict user constraints (e.g., maximum budget ₹12,000/sqft, minimum FAR 2.5, maximum AQI 180, or flood risk exclusions) are dimmed out on the map with visual failure tags (`Fail: Land price exceeds threshold`).
- **Interactive Map & Drawer**: Polygon boundaries with score-based color ramp, interactive click inspection, dynamic legend, and instant plot simulation transition.

### Part B: Developer Command Center (D1 – D15)
LandNova answers the three foundational developer questions: **WHERE to buy**, **WHAT to build**, and **WHEN to build**.

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
- **D14. Developer AI Advisor**: Minimizable floating assistant with `D14 ACTIVE` status, collapsible into a neat pill, grounded strictly in injected site numbers.
- **D15. Scenario Time Machine (2026 → 2030)**: Interactive slider showing infrastructure completion impact and catalytic price uplifts in real time.

---

## 5. LandNova Data Honesty & Provenance Map

Every metric rendered across LandNova carries an explicit **confidence badge** (*High / Medium / Estimated*) and transparent methodology disclosure:

| Indicator | Nature | Primary Source | Confidence Badge | Methodology / Proxy Description |
| :--- | :--- | :--- | :--- | :--- |
| **Air Quality (AQI / PM2.5)** | Measured | Open-Meteo Air Quality & CAMS | `High` | Hourly satellite-blended atmospheric CAMS model |
| **Multimodal Transit** | Measured | OpenStreetMap Overpass API | `High` | Metro stations, bus stops, and railway hubs within catchment |
| **Social Amenities** | Measured | OpenStreetMap Overpass API | `High` | Verified schools, tertiary hospitals, daily markets, and parks |
| **Elevation & Flood Risk** | Measured | Copernicus GLO-30 DEM | `High` | Absolute elevation in meters & relative topography drainage |
| **Extreme Rainfall** | Measured | Open-Meteo Historical Archive | `High` | 10-year monsoon 24-hour peak precipitation records |
| **Soil & Foundations** | Modeled | ISRIC SoilGrids REST API v2.0 | `Medium` | 250m satellite resolution; borehole SPT cores required |
| **Groundwater Status** | Measured | Central Ground Water Board (CGWB) | `Medium` | Block/district stage of extraction & CGWA NOC restrictions |
| **Safety & Crime** | **Proxy** | OpenStreetMap Civic POIs | `Estimated` | Distance to nearest police outpost & civic lighting coverage |
| **Community Sentiment** | Direct | LandNova SQLite Review DB | `Community` / `Demo` | Verified local reviews with spam/profanity filters |
| **Property Prices** | Sample Index | State Benchmark Index | `Sample Index` | Curated sample market baseline per sq.ft (demo mode) |

---

## 6. API Reference

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

### Review Endpoints (`/api/reviews/*`)
- `GET /api/reviews?area_id={id}&sort={sort}&resident_type={type}` — List reviews with aggregate stats
- `POST /api/reviews` — Submit new review with input validation, sanitization, and rate-limiting
- `POST /api/reviews/{id}/helpful` — Upvote helpfulness counter

### Developer Intelligence Endpoints (`/api/developer/*`)
- `GET /api/developer/zones?city=Noida` — List seeded cadastral developer zones
- `POST /api/developer/zones/score` — Score developer zones via NumPy with custom weights and thresholds
- `GET /api/developer/command-center?location_id=...` — Complete 15-section site dossier & feasibility report
- `POST /api/developer/simulate-feasibility` — Financial engine with Monte Carlo and IRR calculations
- `POST /api/developer/ground-truth-survey` — Record field-verified site inspection data

### Core Location Endpoints (`/api/*`)
- `GET /api/geocode?q=...` — Instant local matching + Photon geocoding with Nominatim fallback
- `GET /api/location/{id}/amenities` — Overpass API spatial amenity counts
- `GET /api/location/{id}/weather` — Real-time weather, AQI, and Copernicus DEM elevation
- `POST /api/analysis/livability` — Deterministic 5-factor livability scoring engine

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

# Run Full Test Suite (44 passed)
python -m pytest tests/

# Start FastAPI Server (Port 8000)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install

# Production Build & Verification
npm run build

# Start Next.js Development Server (Port 3000)
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 8. Test Suite Status

```
tests/test_api.py ......... passed (7 tests)
tests/test_scoring.py .... passed (4 tests)
tests/test_v2.py ........ passed (4 tests)
tests/test_buyer.py ..... passed (9 tests)
tests/test_developer.py . passed (13 tests)
tests/test_reviews.py ... passed (7 tests)
======================== 44 passed in 50s ========================
```

---

## 9. Hackathon Integrity Guarantee

1. **Zero Hallucination**: Every single score (livability, site risk, IRR, deal score, walkability, commute) is computed by deterministic Python math from verified inputs. Google Gemini Flash is only given verified numbers in its prompt to generate structured explanations.
2. **Transparent Proxies**: Where official real-time government APIs do not exist (crime, water quality, job drivers), LandNova explicitly flags metrics as `Estimated` with full proxy methodology disclosed.
3. **Decoupled Community Layer**: Reviews submitted by users or seeded in the demo never silently inflate or distort the deterministic livability or feasibility scores.
4. **Fail-Safe Offline Mode**: If public APIs (Overpass, Open-Meteo) experience network throttling, LandNova seamlessly falls back to pre-warmed benchmark indices without crashing the user interface.
