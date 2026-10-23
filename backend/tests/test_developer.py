import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_extended_site_dossier_d1():
    """Verify D1: Multi-Source Extended Site Analysis Dossier & Deterministic Site Risk Score."""
    payload = {
        "latitude": 28.6280,
        "longitude": 77.3649,
        "display_name": "Sector 62, Noida Development Site",
        "city": "Noida",
        "scale_acres": 3.5
    }
    response = client.post("/api/developer/site-dossier", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Core scores
    assert "site_risk_score" in data
    assert 0.0 <= data["site_risk_score"] <= 100.0
    assert "site_readiness_score" in data
    assert data["site_readiness_score"] == round(100.0 - data["site_risk_score"], 1)
    assert "risk_level" in data
    assert "deal_breaker_flags" in data
    assert isinstance(data["deal_breaker_flags"], list)

    # Required sections
    sections = data.get("sections", {})
    assert "soil" in sections
    assert "groundwater" in sections
    assert "environmental" in sections
    assert "air_quality" in sections
    assert "seismic" in sections
    assert "terrain" in sections
    assert "crime_macro" in sections

    # Non-negotiable: Every metric shows source, timestamp, confidence, and portal verification link
    for sec_name, sec_obj in sections.items():
        assert "source" in sec_obj, f"Missing source in section {sec_name}"
        assert "timestamp" in sec_obj, f"Missing timestamp in section {sec_name}"
        assert "confidence" in sec_obj, f"Missing confidence in section {sec_name}"
        assert "portal_url" in sec_obj, f"Missing portal_url in section {sec_name}"
        assert sec_obj["portal_url"].startswith("http"), f"Invalid portal_url in {sec_name}"

    # Specific data checks
    soil_data = sections["soil"]["data"]
    assert "bearing_capacity_hint_kn_m2" in soil_data
    assert soil_data["borehole_test_required"] is True

    gw_data = sections["groundwater"]["data"]
    assert gw_data["category"] in ["Safe", "Semi-Critical", "Critical", "Over-Exploited"]
    assert "cgwa_noc_implication" in gw_data


def test_feasibility_simulator_d7():
    """Verify D7: Development Feasibility Simulator, IRR, Monte Carlo, and Sensitivity."""
    payload = {
        "plot_acres": 3.5,
        "typology": "apartment_complex",
        "far": 2.75,
        "ground_coverage_pct": 35.0,
        "land_cost_total_cr": 45.0,
        "construction_cost_per_sqft": 3200.0,
        "sale_price_per_sqft": 7800.0,
        "absorption_months": 30,
        "financing_interest_pct": 9.5,
        "debt_equity_ratio": 0.6
    }
    response = client.post("/api/developer/feasibility", json=payload)
    assert response.status_code == 200
    data = response.json()

    # Financial Summary
    summary = data.get("summary", {})
    assert summary["plot_sqft"] > 0
    assert summary["bua_sqft"] > 0
    assert summary["salable_sqft"] > 0
    assert summary["units_count"] > 0
    assert summary["total_project_cost_cr"] > summary["land_cost_cr"]
    assert summary["total_revenue_cr"] > 0
    assert "annualized_irr_pct" in summary
    assert "profit_margin_pct" in summary
    assert summary["break_even_month"] > 0

    # Monthly cash flows
    monthly_cfs = data.get("monthly_cash_flows", [])
    assert len(monthly_cfs) > 10
    assert monthly_cfs[0] < 0  # Initial land acquisition outflow

    # Monte Carlo 1,000 simulations
    mc = data.get("monte_carlo", {})
    assert mc["simulations_count"] == 1000
    assert 0.0 <= mc["probability_of_profit_pct"] <= 100.0
    assert "p10_irr_pct" in mc
    assert "p50_median_irr_pct" in mc
    assert "p90_irr_pct" in mc
    assert mc["p10_irr_pct"] <= mc["p50_median_irr_pct"] <= mc["p90_irr_pct"]

    # Sensitivity Tornado Chart
    tornado = data.get("sensitivity_tornado", [])
    assert len(tornado) == 3
    for item in tornado:
        assert "parameter" in item
        assert "swing_cr" in item
        assert item["swing_cr"] >= 0

    # Typology Recommendations
    recs = data.get("typology_recommendations", [])
    assert len(recs) == 4
    assert data["best_fit_typology"] in ["apartment_complex", "residential_colony", "commercial_it_hub", "mixed_use"]


def test_deal_verdict_d10():
    """Verify D10: Deal Score (0-100), Verdict, and Waterfall Breakdown."""
    payload = {
        "latitude": 28.6280,
        "longitude": 77.3649,
        "display_name": "Sector 62, Noida Development Site",
        "city": "Noida",
        "feasibility_inputs": {
            "plot_acres": 3.5,
            "typology": "apartment_complex",
            "far": 2.75,
            "land_cost_total_cr": 45.0,
            "construction_cost_per_sqft": 3200.0,
            "sale_price_per_sqft": 7800.0
        }
    }
    response = client.post("/api/developer/deal-verdict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "deal_score" in data
    assert 0.0 <= data["deal_score"] <= 100.0
    assert data["verdict"] in ["BUY", "WATCH", "AVOID"]
    assert "verdict_summary" in data

    # Waterfall decomposition
    waterfall = data.get("waterfall_breakdown", [])
    assert len(waterfall) >= 4
    assert waterfall[0]["factor"] == "Baseline Market Neutral Datum"
    assert waterfall[0]["delta"] == 50.0

    # Grounded AI explanation
    ai_summary = data.get("ai_grounded_summary", "")
    assert len(ai_summary) > 20


def test_command_center_composite():
    """Verify composite command center endpoint returning all D1, D7, and D10 payloads."""
    payload = {
        "latitude": 28.6280,
        "longitude": 77.3649,
        "display_name": "Sector 62, Noida Development Site",
        "city": "Noida",
        "feasibility_inputs": {
            "plot_acres": 3.5,
            "typology": "apartment_complex",
            "far": 2.75,
            "land_cost_total_cr": 45.0,
            "construction_cost_per_sqft": 3200.0,
            "sale_price_per_sqft": 7800.0
        }
    }
    response = client.post("/api/developer/command-center", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert "site_dossier" in data
    assert "feasibility" in data
    assert "deal_verdict" in data


def test_price_history_and_golden_zones_d2():
    """Verify D2: Price History, CAGR, Volatility, and Golden/Danger Zone Classification."""
    res = client.get("/api/developer/price-history?locality_id=sector-62-noida&city=Noida")
    assert res.status_code == 200
    data = res.json()
    assert "history" in data
    assert len(data["history"]) >= 8
    assert "cagr_3yr" in data
    assert "zone_classification" in data
    assert data["zone_classification"] in ["Golden Zone", "Watchlist", "Danger Zone"]
    assert "classification_rule" in data
    assert data["portal_url"].startswith("http")


def test_future_price_forecast_and_backtest_d3():
    """Verify D3: 3/5/10 Year Range Forecast, Confidence Bands, and Backtest Panel."""
    res = client.get("/api/developer/price-forecast?locality_id=sector-62-noida&city=Noida&pipeline_uplift_pct=15.0")
    assert res.status_code == 200
    data = res.json()
    assert "forecasts" in data
    fc = data["forecasts"]
    for horizon in ["3_year", "5_year", "10_year"]:
        assert horizon in fc
        assert fc[horizon]["pessimistic_case"] < fc[horizon]["base_case"] < fc[horizon]["optimistic_case"]

    assert data["disclaimer_badge"] == "Projection, not a guarantee"
    assert "backtest_panel" in data
    assert data["backtest_panel"]["error_variance_pct"] < 10.0


def test_pipeline_and_subsidies_d4():
    """Verify D4: Government Pipeline Tracker & Subsidies Catalog."""
    res = client.get("/api/developer/pipeline-subsidies?latitude=28.6280&longitude=77.3649&max_dist_km=50.0")
    assert res.status_code == 200
    data = res.json()
    assert "nearby_pipeline_projects" in data
    assert len(data["nearby_pipeline_projects"]) > 0
    assert "subsidies_and_incentives" in data
    assert len(data["subsidies_and_incentives"]) > 0
    assert data["subsidies_and_incentives"][0]["portal_link"].startswith("http")


def test_job_boom_and_demand_elasticity_d5_d6():
    """Verify D5 & D6: Job-Sector Boom Index & Demand Elasticity Analysis."""
    res_jobs = client.get("/api/developer/job-boom-index?locality_id=sector-62-noida")
    assert res_jobs.status_code == 200
    d_jobs = res_jobs.json()
    assert "job_boom_index" in d_jobs
    assert d_jobs["confidence_badge"] == "Estimated"

    res_demand = client.get("/api/developer/demand-elasticity?locality_id=sector-62-noida")
    assert res_demand.status_code == 200
    d_demand = res_demand.json()
    assert d_demand["demand_verdict"] in ["Undersupplied", "Balanced", "Oversupplied"]
    assert "elasticity_bracket" in d_demand
    assert "inventory_overhang_months" in d_demand


def test_top_opportunities_d8():
    """Verify D8: Developer Multi-Layer Filters and Ranked Opportunities."""
    payload = {
        "max_budget_cr": 100.0,
        "min_acres": 2.0,
        "max_aqi": 200,
        "verdict": "ALL",
        "zone": "ALL"
    }
    res = client.post("/api/developer/top-opportunities", json=payload)
    assert res.status_code == 200
    opps = res.json()
    assert isinstance(opps, list)
    assert len(opps) > 0
    for o in opps:
        assert o["asking_cost_cr"] <= 100.0
        assert o["scale_acres"] >= 2.0


def test_ground_truth_survey_module_d9():
    """Verify D9: Ground-Truth Survey Module (submission & checklist export)."""
    survey_payload = {
        "site_id": "site_28.628_77.3649",
        "surveyor_name": "Senior Geotechnical Engineer",
        "measured_sbc_kn_m2": 210.0,
        "access_road_width_m": 24.0,
        "water_pipeline_active": True,
        "photos_count": 5
    }
    res = client.post("/api/developer/survey", json=survey_payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "success"
    assert "survey_id" in data

    res_list = client.get("/api/developer/surveys/site_28.628_77.3649")
    assert res_list.status_code == 200
    surveys = res_list.json()
    assert len(surveys) >= 1

    res_chk = client.get("/api/developer/survey-checklist")
    assert res_chk.status_code == 200
    chk = res_chk.json()
    assert "checklist_sections" in chk
    assert len(chk["checklist_sections"]) >= 3


def test_developer_zones_weights_normalization_and_scoring():
    """TASK 1: Verify weights normalization and deterministic 0-100 score bounds."""
    from app.services.developer_zones_service import normalize_weights, compute_developer_zone_scores

    # Unnormalized arbitrary weights
    raw_w = {
        "connectivity": 50.0,
        "amenities": 50.0,
        "aqi": 50.0,
        "traffic": 50.0,
        "flood_safety": 0.0,
        "groundwater": 0.0,
        "growth_potential": 0.0,
        "infrastructure": 0.0,
    }
    norm_w = normalize_weights(raw_w)
    assert abs(sum(norm_w.values()) - 100.0) < 0.01
    assert norm_w["connectivity"] == 25.0

    # Compute scores across zones
    res = compute_developer_zone_scores(weights=raw_w)
    assert res["total_zones"] >= 10
    assert abs(sum(res["weights_applied"].values()) - 100.0) < 0.01

    for z in res["zones"]:
        score = z["suitability_score"]
        assert 0.0 <= score <= 100.0
        assert z["demo_badge"] == "Demo data"
        assert z["source_label"] == "Seeded demo dataset"
        assert z["color"].startswith("#")


def test_developer_zones_hard_thresholds_dimming():
    """TASK 1: Verify hard thresholds dim non-compliant zones with clear fail reasons."""
    from app.services.developer_zones_service import compute_developer_zone_scores

    # Strict filters: low AQI and tight budget
    filters = {
        "max_aqi": 130,            # Sector 62 has AQI 142 -> should fail
        "max_budget_sqft": 7000,   # Sector 18 has 16500 -> should fail
        "flood_allowed": "low_only" # Sector 115 has Elevated -> should fail
    }

    res = compute_developer_zone_scores(filters=filters)
    assert res["qualifying_zones"] < res["total_zones"]

    # Verify Sector 62 is dimmed due to AQI
    sec62 = next((z for z in res["zones"] if z["id"] == "noida-sec-62"), None)
    assert sec62 is not None
    assert sec62["is_dimmed"] is True
    assert any("AQI" in r for r in sec62["fail_reasons"])
    assert sec62["color"] == "#94a3b8"

    # Verify Sector 18 is dimmed due to price
    sec18 = next((z for z in res["zones"] if z["id"] == "noida-sec-18"), None)
    assert sec18 is not None
    assert sec18["is_dimmed"] is True
    assert any("budget" in r.lower() or "price" in r.lower() for r in sec18["fail_reasons"])

    # Verify top_recommended only contains non-dimmed zones
    for rec in res["top_recommended"]:
        assert rec["is_dimmed"] is False


def test_developer_zones_api_endpoints():
    """TASK 1: Verify GET /api/developer/zones and POST /api/developer/zones/score endpoints."""
    # Test GET
    res_get = client.get("/api/developer/zones?city=Noida&max_aqi=150")
    assert res_get.status_code == 200
    data_get = res_get.json()
    assert "zones" in data_get
    assert "legend" in data_get
    assert len(data_get["zones"]) >= 5

    # Test POST
    payload = {
        "city": "Noida",
        "filters": {
            "max_aqi": 200,
            "max_budget_sqft": 10000,
            "min_growth_pct": 10.0
        },
        "weights": {
            "growth_potential": 30.0,
            "infrastructure": 30.0,
            "connectivity": 20.0,
            "amenities": 20.0
        }
    }
    res_post = client.post("/api/developer/zones/score", json=payload)
    assert res_post.status_code == 200
    data_post = res_post.json()
    assert "top_recommended" in data_post
    assert len(data_post["top_recommended"]) > 0
    assert abs(sum(data_post["weights_applied"].values()) - 100.0) < 0.01


