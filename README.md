# 🧭 LandNova — AI-Powered Location Intelligence Platform

> **"The Location Is the Decision."**  
> *Turning fragmented urban datasets into actionable real estate intelligence for Home Buyers, Renters, and Property Developers.*

[![Tests](https://img.shields.io/badge/tests-11%20passed-emerald)](./backend/tests)
[![Next.js](https://img.shields.io/badge/frontend-Next.js%2016%20App%20Router-slate)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/backend-FastAPI%200.110-teal)](https://fastapi.tiangolo.com)
[![Geospatial](https://img.shields.io/badge/maps-Leaflet%20%2B%20OpenStreetMap-blue)](https://leafletjs.com)
[![AI](https://img.shields.io/badge/AI-Google%20Gemini-amber)](https://ai.google.dev)

---

## 1. Product Vision

Existing property platforms primarily show what exists inside four walls (bedrooms, square footage, listing price). **LandNova** analyzes everything around the property: rapid transit accessibility, essential civic amenities, environmental air quality, monsoon flood resilience, and statutory development viability.

### Primary User Personas:
1. **Home Buyers & Renters:** Determine whether an area aligns with daily life, school commutes for children, healthcare proximity, and seasonal pollution/waterlogging patterns.
2. **Builders & Developers:** Conduct preliminary site suitability assessments covering road right-of-way (ROW), rapid transit proximity, catchment demand, and pre-construction statutory clearances (State RERA, Fire NOC, CTE).

---

## 2. Platform Architecture

```
landnova/
├── frontend/                   # Next.js 16 (App Router) + TypeScript + Tailwind CSS
│   ├── app/
│   │   ├── layout.tsx          # Dark modern SaaS layout with metadata
│   │   ├── page.tsx            # State orchestrator for Landing, Dashboard, Analysis, Advisor, Compare, Builder
│   │   └── globals.css         # Dark theme surfaces and Leaflet CSS overrides
│   ├── components/
│   │   ├── Navbar.tsx          # Navigation header with active location & demo status
│   │   ├── LandingPage.tsx     # Hero ("The Location Is the Decision"), feature pillars, persona matrices
│   │   ├── DashboardView.tsx   # Live geocoding search, interactive Leaflet map, amenity filters
│   │   ├── AnalysisView.tsx    # 5-factor livability breakdown, radar/bar charts, weight sliders
│   │   ├── AIAdvisorView.tsx   # Context-grounded conversational AI advisor (Gemini + Demo fallback)
│   │   ├── ComparisonView.tsx  # Side-by-side head-to-head location comparison & verdicts
│   │   ├── BuilderView.tsx     # Developer feasibility dashboard (typology, budget, statutory roadmap)
│   │   └── MapComponent.tsx    # Leaflet interactive map with 1.5km catchment radius and category pins
│   ├── lib/
│   │   └── api.ts              # Resilient API client with client-side demo catalog fallback
│   ├── types/
│   │   └── index.ts            # TypeScript interfaces
│   └── Dockerfile
├── backend/                    # Python FastAPI REST Service
│   ├── app/
│   │   ├── api/endpoints/      # Locations, Amenities, Analysis, AI Advisor, History
│   │   ├── core/config.py      # App settings and environment variables
│   │   ├── models/database.py  # SQLAlchemy models (SQLite default, PostgreSQL/PostGIS compatible)
│   │   ├── schemas/            # Pydantic schemas for requests, responses, and validation
│   │   ├── services/
│   │   │   ├── geocoding_service.py # OpenStreetMap Nominatim with Haversine distance
│   │   │   ├── amenities_service.py # OpenStreetMap Overpass live querying & caching
│   │   │   ├── weather_service.py   # Open-Meteo live weather, US AQI, and elevation models
│   │   │   ├── demo_data_service.py # Verified benchmark datasets for Indian hubs
│   │   │   └── gemini_service.py    # Google Gemini AI SDK with structured fallback engine
│   │   ├── scoring/
│   │   │   ├── livability.py   # Deterministic 5-factor livability scoring engine
│   │   │   └── builder.py      # Development suitability scoring engine for developers
│   │   └── main.py             # FastAPI entry point with CORS, lifespan DB init, /health
│   ├── tests/
│   │   ├── test_scoring.py     # Unit tests for livability, missing data normalization, weights
│   │   └── test_api.py         # End-to-end API integration tests
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml          # Containerized local deployment
├── .env.example
├── .gitignore
└── README.md
```

---

## 3. Deterministic Scoring Engine

LandNova enforces a strict, transparent mathematical scoring engine in the Python backend:

### Livability Score Formula
$$\text{Livability Score} = 0.25 \cdot C + 0.25 \cdot A + 0.20 \cdot E + 0.15 \cdot S + 0.15 \cdot F$$

Where:
- **$C$ (Connectivity — 25%):** Walking proximity to rapid transit (metro/railway/bus hubs), road hierarchy, and transit stop density.
- **$A$ (Nearby Amenities — 25%):** Count and distribution of schools/universities, hospitals/clinics, parks, and retail supermarkets within 1.5km - 2km.
- **$E$ (Environmental Quality — 20%):** US Air Quality Index (AQI), PM2.5, and PM10 metrics from Open-Meteo Air Quality & CAMS, combined with green space buffer.
- **$S$ (Civic Safety Heuristic — 15%):** Proximity to mapped emergency facilities (police, fire, civic responders) within coverage perimeter (explicitly documented as an urban infrastructure proxy, never a fabricated crime statistic).
- **$F$ (Climate & Flood Resilience — 15%):** Elevation above sea level from Copernicus DEM, monsoon extreme rainfall historical records, and surface runoff vulnerability.

### Core Transparency Guarantees:
1. **Zero False Zeroes:** When data for a dimension is unavailable, it is never assigned an artificial 0 score.
2. **Dynamic Weight Normalization:** Missing dimensions are normalized across available factors only and explicitly tagged with `is_partial: true`.
3. **Data Completeness Index:** Separately reports the percentage of verified data layers (e.g. 100% vs 80%).

---

## 4. Curated Signature Benchmark Locations

Out of the box, LandNova includes verified benchmark datasets for instant, zero-lag demonstration across major Indian metropolitan hubs:

1. **Sector 62, Noida, Uttar Pradesh:** Major IT and educational corridor with Blue Line metro stations (Electronic City, Sec 62) and Fortis Healthcare.
2. **Connaught Place, New Delhi:** Heritage central business district (CBD) with high multi-modal transit interchange (Rajiv Chowk).
3. **Indiranagar, Bengaluru, Karnataka:** Premium residential and commercial retail corridor with Purple Line metro accessibility and favorable elevation.
4. **Bandra Kurla Complex (BKC), Mumbai:** Leading financial hub with Aqua Line metro, Convention Centre, and coastal tidal drainage considerations.
5. **HITEC City, Madhapur, Hyderabad:** Major technology corridor with rapid transit and granite bedrock terrain.

*Users can also search for any global or Indian locality via live OpenStreetMap Nominatim geocoding.*

---

## 5. Quickstart Guide

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Step 1: Start the Python Backend
```bash
# Navigate to backend
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the backend server (runs on port 8000)
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
- API Docs: `http://localhost:8000/docs`
- Health check: `http://localhost:8000/health`

### Step 2: Run Backend Automated Tests
```bash
cd backend
$env:PYTHONPATH='.'; python -m pytest tests
# On Linux/macOS: PYTHONPATH=. pytest tests
```
*Expected: 11 passed (scoring calculations, missing data normalization, builder suitability, API endpoints).*

### Step 3: Start the Next.js Frontend
```bash
# Open a new terminal and navigate to frontend
cd frontend

# Run development server
npm run dev
# OR run the production build
npm run start
```
- Open `http://localhost:3000` in your browser.

---

## 6. Docker Deployment (Optional)

Run the full stack containerized with Docker Compose:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:8000`

---

## 7. AI Advisor & Gemini Configuration

LandNova uses the official Google Gemini API for context-grounded real estate due diligence.
- To enable live LLM reasoning, set your Gemini API key in `backend/.env`:
  ```env
  GEMINI_API_KEY=your_gemini_api_key_here
  ```
- **Demo Mode:** If no key is provided, LandNova automatically activates its **Deterministic Advisory Engine**, providing structured, hallucination-free advice grounded directly in the location's retrieved metrics.

---

## 8. REST API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health status, database mode, and active data providers |
| `GET` | `/api/geocode?q={query}` | Geocode address or locality with bounding boxes |
| `GET` | `/api/locations/demo` | List curated signature Indian demonstration hubs |
| `GET` | `/api/location/{id}/amenities` | Mapped amenities by category from OpenStreetMap Overpass |
| `GET` | `/api/location/{id}/weather` | Real-time weather, US AQI, and elevation climate data |
| `POST` | `/api/analysis/livability` | Calculate deterministic 5-factor livability score |
| `POST` | `/api/analysis/development` | Generate Builder & Developer suitability report |
| `POST` | `/api/analysis/compare` | Head-to-head side-by-side comparison of two locations |
| `POST` | `/api/ai/chat` | Conversational location advisor grounded in spatial context |
| `POST` | `/api/ai/location-report` | Executive due-diligence report generation |
| `GET` | `/api/history` | Recent searches and evaluated locations |

---

## 9. Hackathon Judges Demonstration Walkthrough

1. **Landing Page:** Review the product vision (*"The Location Is the Decision"*), the core formula banner, and quick-click signature cards.
2. **Live Dashboard:** Click on **Sector 62, Noida** or type any locality in the search bar. Observe the dynamic Leaflet map, 1.5km coverage perimeter, categorized amenity pins, and live Open-Meteo AQI/elevation tiles.
3. **Location Analysis:** Open the deep-dive tab to inspect the 5 dimensions, radar chart, and adjust the **Configurable Factor Weights** sliders to watch scores recalculate in real-time.
4. **AI Location Advisor:** Ask questions like *"Is this area suitable for a family?"* or *"What are the main disadvantages of living here?"*. Notice how verified metrics are cited and unverified caveats are highlighted.
5. **Location Comparison:** Compare **Sector 62, Noida vs Connaught Place, New Delhi** or **Indiranagar vs BKC Mumbai**. Review the head-to-head delta, category winners, and separate buyer vs builder verdicts.
6. **Builder Intelligence:** Switch project typology from *Residential* to *Commercial Office*, adjust target audience and budget bracket, and examine the development suitability score, risk level, statutory clearances (RERA, Fire NOC, CTE), and pre-construction checklist.

---

*LandNova — The Location Is the Decision.*
