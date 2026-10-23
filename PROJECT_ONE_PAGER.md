# 🧭 LandNova — Project One-Pager
**AI-Powered Location Intelligence & Geospatial Feasibility Platform**  
*CU Hackathon 2026 | Built with FastAPI, Next.js 16, React 19, Leaflet & Google Gemini*

---

### 1. Executive Summary & Problem Statement
In real estate, **"The Location Is the Decision"**, yet critical location intelligence remains broken and fragmented:
- **For Home Buyers & Renters:** Property portals only showcase cosmetic photos and flat prices. Buyers are blind to street-level flood vulnerabilities, toxic air quality patterns, transit bottlenecks, true neighborhood reviews, and real social infrastructure.
- **For Real Estate Developers:** Evaluating land feasibility requires consulting dozens of disconnected government portals (geological surveys, seismic maps, groundwater boards, census records). There is no unified tool that answers **WHERE to buy**, **WHAT to build**, and **WHEN to build**.

**LandNova** solves this by unifying open geospatial APIs, deterministic multi-factor scoring algorithms, local community feedback, and Google Gemini AI into a real-time, source-labeled intelligence platform for buyers, renters, and developers.

---

### 2. Dual-Persona Architecture & User Journeys

| Target Persona | Key Workflows & Features | Value Delivered |
| :--- | :--- | :--- |
| **Home Buyers & Renters** | • **Interactive Persona Heatmap:** Cadastral boundaries color-graded by suitability (80–100 emerald to <40 red) generated with `"GENERATE SUITABILITY MAP"`.<br>• **Configurable Persona Presets:** Pre-calibrated score weights for *Families*, *Working Pros*, *Bachelors*, *Pet Owners*, and *Seniors*.<br>• **Community Review System:** SQLite-backed resident reviews with 1–5 star ratings, 6 category averages (*Safety, Connectivity, Cleanliness, Noise, Water & Power, Community*), resident-type filtering (*Owner, Tenant, Visitor*), helpful upvoting, and spam filters.<br>• **Area Analysis Drawer & Badges:** Verified score breakdowns, 15-min walkability, commute simulator, and review badges (`★ 4.4 demo`) on top recommended cards.<br>• **AI Location Advisor:** Natural language consultation on neighborhoods powered by Google Gemini. | Eliminates buyer remorse by exposing environmental risks, commute friction, and authentic resident sentiment before signing. |
| **Real Estate Developers** | • **Developer Cadastral Heatmap:** 12 seeded zones across Noida & Greater Noida scored deterministically in NumPy based on connectivity, amenities, AQI, traffic, flood risk, and land rates.<br>• **12-Section Site Feasibility Dossier:** Automated technical evaluation for any parcel or plot with ISRIC SoilGrids bearing capacity, USGS/BIS seismic hazard, CGWB groundwater extraction, and Copernicus GLO-30 elevation.<br>• **Development Feasibility Simulator (Hero Feature):** BUA calculations, capex/opex, projected IRR, payback periods, 1,000-run Monte Carlo simulations, and sensitivity curves.<br>• **Deal Score & Regulatory Roadmap:** 0–100 explainable Deal Score (Buy/Watch/Avoid), statutory approval checklists (RERA, CGWA NOC, SEIAA EC), and minimizable Developer AI Advisor (D14). | Cuts site evaluation time from weeks to seconds; prevents costly structural, environmental, and regulatory deal-breakers. |

---

### 3. Core Technical Architecture & Innovation

```
┌────────────────────────────────────────────────────────────────────────┐
│                      Next.js 16 + React 19 Frontend                    │
│   (Clean Light UI, Leaflet Dual Basemaps, Persona Heatmap, Live D14)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ REST / JSON (Async API)
┌───────────────────────────────────▼────────────────────────────────────┐
│                       FastAPI High-Performance Engine                  │
│  (Shared Async HTTP Client • TTLCache • NumPy Vectorized Scoring • SQLite)│
└──────┬────────────────────┬────────────────────┬─────────────────┬─────┘
       │                    │                    │                 │
┌──────▼──────┐      ┌──────▼──────┐      ┌──────▼──────┐   ┌──────▼──────┐
│  Geospatial │      │ Environment │      │ Geotechnical│   │  Generative │
│ OSM Overpass│      │ Open-Meteo  │      │ ISRIC Soil  │   │  AI Advisor │
│  & Photon   │      │ Copernicus  │      │ USGS + BIS  │   │Google Gemini│
│ (Amenities) │      │  (AQI/DEM)  │      │  (Seismic)  │   │(Flash-Lite) │
└─────────────┘      └─────────────┘      └─────────────┘   └─────────────┘
```

- **Zero-Hallucination Deterministic Engine:** All livability (0–100), developer suitability, and financial metrics are computed by pure deterministic code and NumPy models. Gemini AI explains and contextualizes numbers injected into its prompt without hallucinations.
- **Independent Community Layer:** Seeded and user-submitted reviews are persisted in SQLite (`data/reviews.db`) with strict profanity filtering and rate limiting, remaining strictly decoupled from objective suitability scores.
- **Engineered for Speed & Ergonomics:** Dual basemap toggles (Street/Satellite) placed strategically to preserve unobstructed Leaflet zoom controls (`+` and `-`). Responsive layout across desktop and mobile.

---

### 4. Data Provenance & Ethical Transparency
Every indicator rendered carries an explicit **confidence badge** (*High / Medium / Estimated*) and transparent methodology disclosure:
1. **Soil Properties:** ISRIC SoilGrids REST API v2.0 (250m satellite resolution; notes borehole SPT mandatory).
2. **Seismic Hazard:** USGS Earthquake Catalog + Bureau of Indian Standards (BIS IS 1893:2016 Zones II–V).
3. **Real-time Air Quality:** Open-Meteo European CAMS + US EPA AQI index (PM2.5, PM10).
4. **Civic & Social POIs:** OpenStreetMap Overpass API (hospitals, schools, metro, police within catchment).
5. **Flood & Topography:** Copernicus 30m Global Digital Elevation Model (GLO-30).
6. **Community Sentiment:** LandNova SQLite Verified Resident Reviews (`reviews.db`), distinct from algorithmic scores.

---

### 5. Competitive Edge & Hackathon Highlights
- **100% Functional & Verified:** **44/44 automated tests passing** across unit, scoring, buyer, developer, and reviews suites (`pytest`).
- **Production Build Ready:** Next.js 16 with React 19 builds cleanly with zero TypeScript or JSX compile errors.
- **Complete End-to-End Product:** Not a mockup — full working frontend, live dual-role dashboard, real public data ingestion, interactive spatial maps, and grounded AI.
- **Real-World Impact:** Protects families from flood-prone investments and empowers sustainable, data-driven urban development.
