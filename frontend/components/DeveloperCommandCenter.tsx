'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Building2,
  HardHat,
  BarChart3,
  Flame,
  GitCompare,
  Layers,
  MapPin,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Sparkles,
  FileText,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Sliders,
  DollarSign,
  Calendar,
  Percent,
  Compass,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Info,
  Clock,
  RefreshCw,
  Landmark,
  Scale,
  Printer,
  Download,
  Filter,
  Send,
  CheckSquare,
  Search,
  Check,
  X,
  Play
} from 'lucide-react';
import {
  LocationItem,
  DeveloperCommandCenterResponse,
  FeasibilityInputs,
  TypologyRecommendation
} from '@/types';
import {
  fetchDeveloperCommandCenter,
  fetchPriceHistory,
  fetchPriceForecast,
  fetchPipelineSubsidies,
  fetchJobBoomIndex,
  fetchDemandElasticity,
  fetchTopLandOpportunities,
  submitGroundTruthSurvey,
  fetchSurveyChecklist
} from '@/lib/api';

const DynamicParcelMap = dynamic(() => import('./DeveloperParcelMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[440px] rounded-2xl bg-slate-900 flex flex-col items-center justify-center text-slate-400 border border-slate-800">
      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
      <span className="text-xs font-semibold text-slate-300">Rendering high-resolution satellite imagery...</span>
    </div>
  )
});

interface DeveloperCommandCenterProps {
  currentLocation: LocationItem;
  onNavigateView?: (view: string) => void;
  onSelectLocation?: (location: LocationItem) => void;
}

export default function DeveloperCommandCenter({
  currentLocation,
  onNavigateView,
  onSelectLocation
}: DeveloperCommandCenterProps) {
  // Active Navigation Tab
  const [activeTab, setActiveTab] = useState<
    'feasibility' | 'market_trends' | 'pipeline_subsidies' | 'demand_jobs' | 'compare_plots' | 'regulatory_roadmap' | 'survey' | 'top_plots'
  >('feasibility');

  // Input parameters for Feasibility Simulator (D7)
  const [plotAcres, setPlotAcres] = useState<number>(3.5);
  const [typology, setTypology] = useState<string>('apartment_complex');
  const [far, setFar] = useState<number>(2.75);
  const [landCostCr, setLandCostCr] = useState<number>(45.0);
  const [constructionCostSqft, setConstructionCostSqft] = useState<number>(3200);
  const [salePriceSqft, setSalePriceSqft] = useState<number>(7800);
  const [absorptionMonths, setAbsorptionMonths] = useState<number>(30);
  const [financingRate, setFinancingRate] = useState<number>(9.5);

  // Sensitivity Sliders
  const [priceModifierPct, setPriceModifierPct] = useState<number>(0);
  const [costOverrunPct, setCostOverrunPct] = useState<number>(0);
  const [timelineDelayMonths, setTimelineDelayMonths] = useState<number>(0);

  // D15: Scenario Time Machine (2026 -> 2030)
  const [scenarioYear, setScenarioYear] = useState<number>(2026);

  // Command Center Data State
  const [data, setData] = useState<DeveloperCommandCenterResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Additional Market Intelligence States
  const [priceHistory, setPriceHistory] = useState<any>(null);
  const [priceForecast, setPriceForecast] = useState<any>(null);
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [jobBoom, setJobBoom] = useState<any>(null);
  const [demandData, setDemandData] = useState<any>(null);
  const [topPlots, setTopPlots] = useState<any[]>([]);
  const [surveyChecklist, setSurveyChecklist] = useState<any>(null);

  // Field Survey Form State (D9)
  const [surveyorName, setSurveyorName] = useState('Senior Field Engineer');
  const [measuredSbc, setMeasuredSbc] = useState(210);
  const [measuredRoadWidth, setMeasuredRoadWidth] = useState(24);
  const [surveyNotes, setSurveyNotes] = useState('Borehole test confirmed dense sand stratum at 8m. No encumbrances.');
  const [surveySubmitted, setSurveySubmitted] = useState(false);

  // Developer AI Advisor State (D14)
  const [aiChatMessages, setAiChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    {
      sender: 'ai',
      text: 'Hello, I am your LandNova Developer Investment Advisor. Ask me anything about permissible FAR, capital budgeting, soil borehole SPT implications, or multi-plot ROI tradeoffs.'
    }
  ]);
  const [aiInputText, setAiInputText] = useState('');
  const [isAiReplying, setIsAiReplying] = useState(false);

  // Accordion expanded sections (D1)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    soil: true,
    groundwater: true,
    environmental: true,
    seismic: false,
    air_quality: false,
    terrain: false,
    crime: false
  });

  const toggleSection = (key: string) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Time Machine catalytic price uplift calculation based on scenarioYear (D15)
  const scenarioPipelineUplift = useMemo(() => {
    // 2026: Jewar Phase 1 (+3%)
    // 2027: Aqua Line Metro (+6%)
    // 2028: Data Center SEZ (+10%)
    // 2029: Peripheral link (+13%)
    // 2030: Aerotropolis full maturity (+18%)
    const uplifts: Record<number, number> = {
      2026: 0,
      2027: 5.5,
      2028: 10.0,
      2029: 14.5,
      2030: 18.5
    };
    return uplifts[scenarioYear] || 0;
  }, [scenarioYear]);

  // Fetch or re-compute command center data
  const loadCommandCenter = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const effectiveSalePrice = salePriceSqft * (1 + (priceModifierPct + scenarioPipelineUplift) / 100);
      const effectiveConstCost = constructionCostSqft * (1 + costOverrunPct / 100);
      const effectiveMonths = absorptionMonths + timelineDelayMonths;

      const payload = {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        display_name: currentLocation.display_name,
        city: currentLocation.city || 'Noida',
        feasibility_inputs: {
          plot_acres: plotAcres,
          typology: typology,
          far: far,
          ground_coverage_pct: 35.0,
          land_cost_total_cr: landCostCr,
          construction_cost_per_sqft: effectiveConstCost,
          sale_price_per_sqft: effectiveSalePrice,
          absorption_months: effectiveMonths,
          financing_interest_pct: financingRate,
          debt_equity_ratio: 0.6
        }
      };

      const [ccRes, histRes, fcRes, pipeRes, jobRes, demRes, plotsRes, chkRes] = await Promise.all([
        fetchDeveloperCommandCenter(payload),
        fetchPriceHistory(currentLocation.id, currentLocation.city || 'Noida'),
        fetchPriceForecast(currentLocation.id, currentLocation.city || 'Noida', scenarioPipelineUplift),
        fetchPipelineSubsidies(currentLocation.latitude, currentLocation.longitude),
        fetchJobBoomIndex(currentLocation.id),
        fetchDemandElasticity(currentLocation.id),
        fetchTopLandOpportunities(),
        fetchSurveyChecklist()
      ]);

      setData(ccRes);
      setPriceHistory(histRes);
      setPriceForecast(fcRes);
      setPipelineData(pipeRes);
      setJobBoom(jobRes);
      setDemandData(demRes);
      setTopPlots(plotsRes);
      setSurveyChecklist(chkRes);
    } catch (err) {
      console.error('Error loading developer command center', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadCommandCenter();
  }, [currentLocation, scenarioYear]);

  const siteDossier = data?.site_dossier;
  const feasibility = data?.feasibility;
  const verdict = data?.deal_verdict;

  // Handle D9 Ground-Truth Submission
  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitGroundTruthSurvey({
      site_id: siteDossier?.site_id || 'site_demo',
      surveyor_name: surveyorName,
      measured_sbc_kn_m2: measuredSbc,
      access_road_width_m: measuredRoadWidth,
      notes: surveyNotes,
      photos_count: 4
    });
    setSurveySubmitted(true);
    setTimeout(() => setSurveySubmitted(false), 5000);
  };

  // Handle D14 AI Advisor Chat
  const handleSendAiMessage = () => {
    if (!aiInputText.trim()) return;
    const userMsg = aiInputText.trim();
    setAiChatMessages((prev) => [...prev, { sender: 'user', text: userMsg }]);
    setAiInputText('');
    setIsAiReplying(true);

    setTimeout(() => {
      let reply = '';
      const lower = userMsg.toLowerCase();
      if (lower.includes('irr') || lower.includes('profit') || lower.includes('return')) {
        reply = `Based on your model inputs (${plotAcres} acres at FAR ${far}):\n• Projected Annualized IRR: **${feasibility?.summary.annualized_irr_pct || 22.4}%**\n• Gross Profit: **₹${feasibility?.summary.gross_profit_cr || 62.8} Cr** (${feasibility?.summary.profit_margin_pct || 23.4}% margin)\n• Monte Carlo 1,000 runs show a **${feasibility?.monte_carlo.probability_of_profit_pct || 94.6}%** probability of positive returns.`;
      } else if (lower.includes('water') || lower.includes('groundwater') || lower.includes('cgwa')) {
        reply = `Groundwater Due Diligence for ${currentLocation.city || 'Noida'}:\n• Aquifer Status: **Over-Exploited (112.4% extraction stage)**\n• CGWA Mandate: Direct borewell abstraction is restricted. Dual-piping, 100% rooftop RWH, and a municipal treated water bulk connection are mandatory prerequisites.`;
      } else if (lower.includes('seismic') || lower.includes('soil') || lower.includes('borehole')) {
        reply = `Geotechnical Analysis:\n• Soil: Gangetic alluvium with Safe Bearing Capacity estimated at **${siteDossier?.sections.soil.data.bearing_capacity_hint_kn_m2 || 180} kN/m²**.\n• Seismic: **${siteDossier?.sections.seismic.zone || 'Zone IV'}** (Z = ${siteDossier?.sections.seismic.zone_factor_z || 0.24}g). Ductile detailing per IS 13920:2016 is statutory.`;
      } else {
        reply = `For ${currentLocation.display_name.split(',')[0]} (${plotAcres} Acres):\n• Overall Deal Score: **${verdict?.deal_score || 78.4}/100** with a **${verdict?.verdict || 'BUY'}** verdict.\n• Best fit typology is **${feasibility?.best_fit_typology?.replace('_', ' ').toUpperCase()}**.\n• Catalytic uplift from ${pipelineData?.nearby_pipeline_projects?.length || 2} upcoming GatiShakti pipeline assets.`;
      }
      setAiChatMessages((prev) => [...prev, { sender: 'ai', text: reply }]);
      setIsAiReplying(false);
    }, 800);
  };

  const verdictBadge = useMemo(() => {
    if (!verdict) return null;
    if (verdict.verdict === 'BUY') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 tracking-wider shadow-sm flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> BUY VERDICT
        </span>
      );
    }
    if (verdict.verdict === 'WATCH') {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-400 border border-amber-500/40 tracking-wider shadow-sm flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400" /> WATCH CONDITIONAL
        </span>
      );
    }
    return (
      <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 tracking-wider shadow-sm flex items-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> AVOID BARRIER
      </span>
    );
  }, [verdict]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-16 print:bg-white print:text-black">
      {/* Top Command Bar */}
      <div className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-emerald-950/40">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">
                LANDNOVA DEVELOPER COMMAND CENTER
              </h1>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PRO 2026
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <MapPin className="w-3 h-3 text-cyan-400" />
              <span>{currentLocation.display_name}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400 font-mono text-[11px]">
                {currentLocation.latitude.toFixed(4)}°N, {currentLocation.longitude.toFixed(4)}°E
              </span>
            </div>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          {verdictBadge}
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-800 transition-all cursor-pointer"
            title="D13: Investor-Ready PDF Export"
          >
            <Printer className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export PDF</span>
          </button>
          <button
            onClick={() => loadCommandCenter(true)}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-slate-200 border border-slate-800 transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
            <span className="hidden sm:inline">Recalculate</span>
          </button>
          {onNavigateView && (
            <button
              onClick={() => onNavigateView('home')}
              className="px-3 py-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 border border-slate-700/60 transition-all cursor-pointer"
            >
              Exit
            </button>
          )}
        </div>
      </div>

      {/* D15: SCENARIO TIME MACHINE & NAVIGATION SUB-BAR */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-4 print:hidden">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {[
            { id: 'feasibility', label: 'Feasibility Simulator (D7/D1/D10)', icon: Sliders },
            { id: 'market_trends', label: 'Price History & Forecast (D2/D3)', icon: TrendingUp },
            { id: 'pipeline_subsidies', label: 'Infra & Subsidies (D4)', icon: Landmark },
            { id: 'demand_jobs', label: 'Jobs & Demand (D5/D6)', icon: Flame },
            { id: 'compare_plots', label: 'Compare Plots (D11)', icon: GitCompare },
            { id: 'regulatory_roadmap', label: 'Approval Roadmap (D12)', icon: CheckSquare },
            { id: 'survey', label: 'Ground-Truth Survey (D9)', icon: FileText },
            { id: 'top_plots', label: 'Top Opportunities (D8)', icon: Filter }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* D15: Scenario Time Machine Control */}
        <div className="flex items-center gap-3 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scenario Time Machine:</span>
          </div>
          <div className="flex items-center gap-1.5">
            {[2026, 2027, 2028, 2029, 2030].map((yr) => (
              <button
                key={yr}
                onClick={() => setScenarioYear(yr)}
                className={`px-2 py-0.5 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  scenarioYear === yr
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
          {scenarioPipelineUplift > 0 && (
            <span className="text-[10px] font-mono font-bold text-emerald-400">
              +{scenarioPipelineUplift}% Infra Uplift
            </span>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB CONTENT RENDERING */}
      {/* ========================================================= */}

      {/* TAB 1: FEASIBILITY SIMULATOR, DOSSIER & DEAL SCORE (D1, D7, D10) */}
      {activeTab === 'feasibility' && (
        <div className="flex-1 max-w-[1780px] w-full mx-auto px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* COLUMN 1: FEASIBILITY INPUTS & SENSITIVITY */}
          <div className="lg:col-span-3 space-y-5">
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-emerald-400" />
                  <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider">
                    Land &amp; Development Spec
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-slate-400">D7 ENGINE</span>
              </div>

              {/* Typology Select */}
              <div className="space-y-1.5 mb-4">
                <label className="text-xs font-semibold text-slate-300">Target Typology</label>
                <select
                  value={typology}
                  onChange={(e) => {
                    setTypology(e.target.value);
                    if (e.target.value === 'commercial_it_hub') setFar(3.5);
                    else if (e.target.value === 'residential_colony') setFar(1.75);
                    else setFar(2.75);
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-200 focus:outline-hidden focus:border-emerald-500"
                >
                  <option value="apartment_complex">High-Rise Apartment Complex</option>
                  <option value="commercial_it_hub">Grade-A Commercial IT / Tech Park</option>
                  <option value="mixed_use">Integrated Mixed-Use (Podium + Resi)</option>
                  <option value="residential_colony">Plotted Residential / Luxury Colony</option>
                </select>
              </div>

              {/* Plot Acres */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Plot Area</span>
                  <span className="text-emerald-400 font-bold font-mono">{plotAcres} Acres</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="25.0"
                  step="0.5"
                  value={plotAcres}
                  onChange={(e) => setPlotAcres(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
                <div className="text-[10px] text-slate-500 font-mono">
                  {(plotAcres * 43560).toLocaleString()} sq.ft. footprint
                </div>
              </div>

              {/* FAR */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Permissible FAR / FSI</span>
                  <span className="text-cyan-400 font-bold font-mono">{far.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="4.5"
                  step="0.25"
                  value={far}
                  onChange={(e) => setFar(parseFloat(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>

              {/* Land Cost */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Land Acquisition Cost</span>
                  <span className="text-slate-200 font-bold font-mono">₹{landCostCr} Cr</span>
                </div>
                <input
                  type="range"
                  min="5.0"
                  max="150.0"
                  step="2.5"
                  value={landCostCr}
                  onChange={(e) => setLandCostCr(parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Construction Cost */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Construction Cost / SqFt</span>
                  <span className="text-slate-200 font-bold font-mono">₹{constructionCostSqft.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="6500"
                  step="100"
                  value={constructionCostSqft}
                  onChange={(e) => setConstructionCostSqft(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Sale Realization */}
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Sale Realization / SqFt</span>
                  <span className="text-emerald-400 font-bold font-mono">₹{salePriceSqft.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="4000"
                  max="18000"
                  step="200"
                  value={salePriceSqft}
                  onChange={(e) => setSalePriceSqft(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              {/* Absorption Lifecycle */}
              <div className="space-y-1.5 mb-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-semibold">Lifecycle &amp; Absorption</span>
                  <span className="text-slate-200 font-bold font-mono">{absorptionMonths} Months</span>
                </div>
                <input
                  type="range"
                  min="18"
                  max="60"
                  step="3"
                  value={absorptionMonths}
                  onChange={(e) => setAbsorptionMonths(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* SENSITIVITY STRESS TEST SLIDERS */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4 shadow-xl">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    Sensitivity Modifiers
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-amber-400">STRESS-TEST</span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Price Shift</span>
                    <span className="font-mono font-bold text-emerald-400">{priceModifierPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="20"
                    step="5"
                    value={priceModifierPct}
                    onChange={(e) => setPriceModifierPct(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Cost Overrun</span>
                    <span className="font-mono font-bold text-rose-400">+{costOverrunPct}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="30"
                    step="5"
                    value={costOverrunPct}
                    onChange={(e) => setCostOverrunPct(parseInt(e.target.value))}
                    className="w-full accent-rose-400 cursor-pointer"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-400">Delay</span>
                    <span className="font-mono font-bold text-amber-400">+{timelineDelayMonths} Mos</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="18"
                    step="3"
                    value={timelineDelayMonths}
                    onChange={(e) => setTimelineDelayMonths(parseInt(e.target.value))}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: SATELLITE MAP & EXTENDED DOSSIER (D1) */}
          <div className="lg:col-span-5 space-y-5">
            {/* Satellite Map */}
            {verdict && siteDossier && (
              <DynamicParcelMap
                center={[currentLocation.latitude, currentLocation.longitude]}
                plotAcres={plotAcres}
                siteDossier={siteDossier}
                dealVerdict={verdict}
              />
            )}

            {/* Deal Breakers Banner */}
            {siteDossier && siteDossier.deal_breaker_flags.length > 0 && (
              <div className="rounded-2xl bg-amber-950/30 border border-amber-600/40 p-4 shadow-lg space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Active Site Regulatory &amp; Environmental Flags
                </div>
                <div className="space-y-1.5 text-xs text-amber-200/90 font-medium">
                  {siteDossier.deal_breaker_flags.map((flag, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-amber-900/20 p-2 rounded-xl border border-amber-800/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                      <span>{flag}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 12-Section Extended Site Dossier */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4 shadow-xl space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                    Extended Site Analysis Dossier
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">D1 DOSSIER</span>
              </div>

              {siteDossier && (
                <div className="space-y-2 text-xs">
                  {/* Soil & Foundation */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                    <button
                      onClick={() => toggleSection('soil')}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-slate-900/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-amber-400" />
                        <span>ISRIC SoilGrids &amp; Bearing Capacity</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          {siteDossier.sections.soil.data.bearing_capacity_hint_kn_m2} kN/m²
                        </span>
                        {expandedSections.soil ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                    {expandedSections.soil && (
                      <div className="px-3.5 pb-3 text-slate-400 text-xs space-y-2 border-t border-slate-800/60 pt-2">
                        <p className="text-[11px] text-slate-300">{siteDossier.sections.soil.data.foundation_recommendation}</p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                          <span>Confidence: {siteDossier.sections.soil.confidence}</span>
                          <a href={siteDossier.sections.soil.portal_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-cyan-400 hover:underline">
                            Verify on ISRIC Portal <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Groundwater & CGWA NOC */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                    <button
                      onClick={() => toggleSection('groundwater')}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-slate-900/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Landmark className="w-3.5 h-3.5 text-cyan-400" />
                        <span>CGWB Groundwater Table &amp; CGWA NOC</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-rose-500/10 text-rose-300 border border-rose-500/20">
                          {siteDossier.sections.groundwater.data.category}
                        </span>
                        {expandedSections.groundwater ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </div>
                    </button>
                    {expandedSections.groundwater && (
                      <div className="px-3.5 pb-3 text-slate-400 text-xs space-y-2 border-t border-slate-800/60 pt-2">
                        <p className="text-[11px] text-amber-300/90 bg-amber-950/20 p-2 rounded-lg border border-amber-900/30">
                          {siteDossier.sections.groundwater.data.cgwa_noc_implication}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                          <span>Confidence: {siteDossier.sections.groundwater.confidence}</span>
                          <a href={siteDossier.sections.groundwater.portal_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-cyan-400 hover:underline">
                            Verify on CGWB Portal <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* MoEFCC Environmental & Forest Clearances */}
                  <div className="rounded-xl border border-slate-800 bg-slate-950/60 overflow-hidden">
                    <button
                      onClick={() => toggleSection('environmental')}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between text-left font-semibold text-slate-200 hover:bg-slate-900/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>MoEFCC PARIVESH Clearance Flags</span>
                      </div>
                      {expandedSections.environmental ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    {expandedSections.environmental && (
                      <div className="px-3.5 pb-3 text-slate-400 text-xs space-y-2 border-t border-slate-800/60 pt-2">
                        <div className="text-[11px] font-semibold text-slate-300">Required Clearances:</div>
                        <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
                          {siteDossier.sections.environmental.clearances_likely_required.map((cl: string, idx: number) => (
                            <li key={idx}>{cl}</li>
                          ))}
                        </ul>
                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                          <span>Confidence: {siteDossier.sections.environmental.confidence}</span>
                          <a href={siteDossier.sections.environmental.portal_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-cyan-400 hover:underline">
                            Verify on PARIVESH Portal <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* COLUMN 3: DEAL SCORE (D10) & FEASIBILITY RESULTS */}
          <div className="lg:col-span-4 space-y-5">
            {/* Deal Score Ring Card */}
            <div className="rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 p-5 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  LandNova Deal Score
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  D10 VERDICT
                </span>
              </div>

              {verdict && (
                <div className="flex items-center gap-5">
                  <div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="40" className="text-slate-800 stroke-current" strokeWidth="9" fill="transparent" />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className={`stroke-current ${
                          verdict.deal_score >= 75
                            ? 'text-emerald-500'
                            : verdict.deal_score >= 60
                            ? 'text-amber-500'
                            : 'text-rose-500'
                        }`}
                        strokeWidth="9"
                        strokeDasharray={2 * Math.PI * 40}
                        strokeDashoffset={2 * Math.PI * 40 * (1 - verdict.deal_score / 100)}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-black tracking-tight text-white font-mono">{verdict.deal_score}</span>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">DEAL SCORE</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-1.5 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Site Readiness:</span>
                      <span className="font-mono font-bold text-cyan-400">{verdict.component_scores.site_readiness}/100</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Financial Feasibility:</span>
                      <span className="font-mono font-bold text-emerald-400">{verdict.component_scores.financial_feasibility}/100</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Catchment Demand:</span>
                      <span className="font-mono font-bold text-slate-200">{verdict.component_scores.catchment_demand}/100</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span className="text-slate-400">Infra Pipeline:</span>
                      <span className="font-mono font-bold text-purple-400">{verdict.component_scores.infrastructure_catalysts}/100</span>
                    </div>
                  </div>
                </div>
              )}

              {verdict && (
                <p className="mt-4 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 pt-3">
                  {verdict.verdict_summary}
                </p>
              )}
            </div>

            {/* Waterfall Factor Decomposition */}
            {verdict && (
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4 shadow-xl">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                    Why This Verdict (Waterfall)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">ATTRIBUTION</span>
                </div>

                <div className="space-y-2 text-xs">
                  {verdict.waterfall_breakdown.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px] truncate max-w-[210px]">{item.factor}</span>
                      <span
                        className={`font-mono text-xs font-bold ${
                          item.type === 'base'
                            ? 'text-slate-200'
                            : item.delta >= 0
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {item.type === 'base' ? '50.0' : item.delta >= 0 ? `+${item.delta}` : `${item.delta}`}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Financial Summary & Monte Carlo */}
            {feasibility && (
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800/90 p-4 shadow-xl space-y-3.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wider">
                      Financial Feasibility
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold">
                    IRR {feasibility.summary.annualized_irr_pct}%
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Revenue</div>
                    <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                      ₹{feasibility.summary.total_revenue_cr} Cr
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">Gross Profit</div>
                    <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
                      ₹{feasibility.summary.gross_profit_cr} Cr
                    </div>
                  </div>
                </div>

                {/* Monte Carlo 1,000 Runs */}
                <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      NumPy Monte Carlo (1,000 Runs)
                    </span>
                    <span className="text-[10px] font-bold text-emerald-400 font-mono">
                      {feasibility.monte_carlo.probability_of_profit_pct}% Prob of Profit
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono">
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">P10</span>
                      <span className="text-amber-400 font-bold">{feasibility.monte_carlo.p10_irr_pct}%</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">P50</span>
                      <span className="text-emerald-400 font-bold">{feasibility.monte_carlo.p50_median_irr_pct}%</span>
                    </div>
                    <div className="bg-slate-900 p-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-500 block">P90</span>
                      <span className="text-cyan-400 font-bold">{feasibility.monte_carlo.p90_irr_pct}%</span>
                    </div>
                  </div>
                  <div className="text-[9px] text-slate-500 italic text-right">
                    Projection, not a guarantee • Vectorized NumPy
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PRICE HISTORY & FUTURE FORECAST (D2 & D3) */}
      {activeTab === 'market_trends' && priceHistory && priceForecast && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* D2: Price History & Golden Zone */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    D2: Price History &amp; Golden Zone Analysis
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{priceHistory.locality_name} ({priceHistory.city})</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    priceHistory.zone_classification === 'Golden Zone'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : priceHistory.zone_classification === 'Watchlist'
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}
                >
                  {priceHistory.zone_classification}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 text-center text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">1-Yr CAGR</span>
                  <span className="text-emerald-400 font-bold">{priceHistory.cagr_1yr}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">3-Yr CAGR</span>
                  <span className="text-emerald-400 font-bold">{priceHistory.cagr_3yr}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">5-Yr CAGR</span>
                  <span className="text-cyan-400 font-bold">{priceHistory.cagr_5yr}%</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-500 block text-[10px]">Volatility</span>
                  <span className="text-slate-300 font-bold">{priceHistory.volatility_pct}%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-300">Historical Price Trend (₹/SqFt):</div>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-xs font-mono">
                  {(priceHistory.history || []).map((h: any) => (
                    <div key={h.year} className="p-2 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-500 block">{h.year}</span>
                      <span className="text-slate-200 font-bold">₹{h.avg_rate_sqft}</span>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
                {priceHistory.zone_reason}
              </p>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                <span>Source: {priceHistory.source}</span>
                <a href={priceHistory.portal_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-cyan-400 hover:underline">
                  Verify on NHB RESIDEX <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* D3: Future Price Forecast & Backtest Panel */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    D3: Price Expansion Forecast (3/5/10 Year)
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Anchored in historical CAGR + PM GatiShakti pipeline</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {priceForecast.disclaimer_badge}
                </span>
              </div>

              <div className="space-y-3">
                {['3_year', '5_year', '10_year'].map((hKey) => {
                  const fc = priceForecast.forecasts[hKey];
                  if (!fc) return null;
                  return (
                    <div key={hKey} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-white uppercase">{hKey.replace('_', ' ')} Forecast ({fc.target_year})</span>
                        <span className="text-[10px] font-mono text-emerald-400">{fc.cagr_projected_pct}% Projected CAGR</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Pessimistic</span>
                          <span className="text-rose-400 font-bold">₹{fc.pessimistic_case.toLocaleString()}</span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Base Case</span>
                          <span className="text-emerald-400 font-bold">₹{fc.base_case.toLocaleString()}</span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-500 block">Optimistic</span>
                          <span className="text-cyan-400 font-bold">₹{fc.optimistic_case.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Model Backtest Panel */}
              <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-1 text-xs">
                <div className="flex items-center justify-between font-bold text-emerald-400">
                  <span>{priceForecast.backtest_panel.validation_period}</span>
                  <span className="text-[10px]">{priceForecast.backtest_panel.accuracy_grade}</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  Predicted 2020: ₹{priceForecast.backtest_panel.model_forecasted_2020}/sqft vs Actual: ₹{priceForecast.backtest_panel.actual_reported_2020}/sqft ({priceForecast.backtest_panel.error_variance_pct}% error variance).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INFRASTRUCTURE PIPELINE & SUBSIDIES (D4) */}
      {activeTab === 'pipeline_subsidies' && pipelineData && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mega Infrastructure Pipeline */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-cyan-400" />
                    PM GatiShakti Mega Infrastructure Pipeline
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Announced &amp; Under-Construction Catalysts</p>
                </div>
                <span className="text-xs font-mono font-bold text-cyan-400">
                  {pipelineData.nearby_pipeline_projects.length} Nearby Projects
                </span>
              </div>

              <div className="space-y-3">
                {pipelineData.nearby_pipeline_projects.map((proj: any) => (
                  <div key={proj.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{proj.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        Comp: {proj.expected_completion_year}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span>Distance: <b className="text-slate-200">{proj.distance_km} km</b></span>
                      <span>•</span>
                      <span>Projected Uplift: <b className="text-emerald-400">+{proj.projected_price_uplift_pct}%</b></span>
                    </div>
                    <p className="text-[11px] text-slate-400">{proj.status}</p>
                    {proj.portal_link && (
                      <a href={proj.portal_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:underline pt-1">
                        Official Project Portal <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Subsidies & Incentives Catalog */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                    Developer Subsidies &amp; FAR Incentives
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">PMAY, TOD Bonuses &amp; Green Rating FAR Relief</p>
                </div>
              </div>

              <div className="space-y-3">
                {pipelineData.subsidies_and_incentives.map((sub: any) => (
                  <div key={sub.id} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-xs">{sub.title}</span>
                      <span className="text-[10px] font-mono text-emerald-400 font-semibold">{sub.authority}</span>
                    </div>
                    <p className="text-xs text-slate-300">{sub.benefits}</p>
                    <div className="p-2 rounded-lg bg-amber-950/20 border border-amber-900/30 text-[10px] text-amber-300">
                      ⚠️ {sub.verify_flag || 'Verify with local authority prior to statutory submission'}
                    </div>
                    {sub.portal_link && (
                      <a href={sub.portal_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[10px] text-cyan-400 hover:underline pt-1">
                        Verify on Government Portal <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: JOB BOOM & DEMAND ANALYSIS (D5 & D6) */}
      {activeTab === 'demand_jobs' && jobBoom && demandData && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* D5: Job-Sector Boom Index */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    D5: Job-Sector Boom Index
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Employment Driver &amp; Corporate Anchor Heat</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  {jobBoom.confidence_badge}
                </span>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950 border border-slate-800">
                <div className="w-16 h-16 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center font-mono font-black text-2xl text-amber-400">
                  {jobBoom.job_boom_index}
                </div>
                <div>
                  <div className="text-xs font-bold text-white">High Employment Absorption Affinity</div>
                  <p className="text-[11px] text-slate-400">{jobBoom.methodology}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Office POIs (3km)</span>
                  <span className="text-white font-bold text-sm">{jobBoom.job_drivers.office_poi_count_3km} Nodes</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Registered Tech Cos</span>
                  <span className="text-cyan-400 font-bold text-sm">{jobBoom.job_drivers.registered_tech_companies_district}</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-slate-300">Key Corporate Anchors:</div>
                <div className="flex flex-wrap gap-1.5">
                  {(jobBoom.job_drivers.key_employers || []).map((emp: string, idx: number) => (
                    <span key={idx} className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium">
                      {emp}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* D6: Demand & Elasticity Analysis */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-emerald-400" />
                    D6: Demand &amp; Elasticity Analysis
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Supply vs Sales Absorption Dynamics</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  {demandData.demand_verdict}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs font-mono text-center">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Quarterly Sales</span>
                  <span className="text-emerald-400 font-bold text-sm">{demandData.quarterly_absorption_units} Units</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">New Launches</span>
                  <span className="text-slate-200 font-bold text-sm">{demandData.quarterly_new_launches_units} Units</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-500 block">Overhang</span>
                  <span className="text-cyan-400 font-bold text-sm">{demandData.inventory_overhang_months} Mos</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Price Elasticity Bracket:</span>
                  <span className="text-white font-semibold">{demandData.elasticity_bracket}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Gross Residential Rental Yield:</span>
                  <span className="text-emerald-400 font-bold">{demandData.rental_yield_pct}% p.a.</span>
                </div>
                <p className="text-[11px] text-slate-400 pt-2 border-t border-slate-800/80">
                  {demandData.demand_explanation}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: COMPARE PLOTS (D11) */}
      {activeTab === 'compare_plots' && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <GitCompare className="w-4 h-4 text-cyan-400" />
                  D11: Side-by-Side Plot Comparison
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Compare key feasibility and environmental metrics across 3 benchmark sites</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  name: 'Noida Sector 62 Tech Parcel',
                  acres: 3.5,
                  cost_cr: 45.0,
                  score: 78.4,
                  verdict: 'BUY',
                  irr: '22.4%',
                  margin: '23.4%',
                  sbc: '180 kN/m²',
                  gw: 'Over-Exploited',
                  notes: 'Immediate ready infrastructure, high rental yield'
                },
                {
                  name: 'YEIDA Sector 28 Aerotropolis',
                  acres: 12.0,
                  cost_cr: 84.0,
                  score: 86.2,
                  verdict: 'BUY',
                  irr: '28.5%',
                  margin: '29.2%',
                  sbc: '200 kN/m²',
                  gw: 'Semi-Critical',
                  notes: 'Direct Jewar Airport catalyst, massive scale'
                },
                {
                  name: 'Greater Noida West Urban Node',
                  acres: 5.0,
                  cost_cr: 38.0,
                  score: 71.5,
                  verdict: 'WATCH',
                  irr: '18.2%',
                  margin: '19.8%',
                  sbc: '175 kN/m²',
                  gw: 'Over-Exploited',
                  notes: 'High competitive supply overhang'
                }
              ].map((plot, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-sm">{plot.name}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${plot.verdict === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {plot.verdict}
                    </span>
                  </div>
                  <div className="space-y-1 font-mono text-slate-300">
                    <div className="flex justify-between"><span>Scale / Asking:</span><b>{plot.acres} Ac / ₹{plot.cost_cr}Cr</b></div>
                    <div className="flex justify-between"><span>Deal Score:</span><b className="text-cyan-400">{plot.score}/100</b></div>
                    <div className="flex justify-between"><span>Projected IRR:</span><b className="text-emerald-400">{plot.irr}</b></div>
                    <div className="flex justify-between"><span>Gross Margin:</span><b>{plot.margin}</b></div>
                    <div className="flex justify-between"><span>Bearing Capacity:</span><b>{plot.sbc}</b></div>
                    <div className="flex justify-between"><span>Groundwater:</span><b>{plot.gw}</b></div>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/80">{plot.notes}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: REGULATORY ROADMAP (D12) */}
      {activeTab === 'regulatory_roadmap' && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  D12: Regulatory Sanction &amp; Approval Roadmap
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Sequential statutory clearances and estimated filing timelines</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { step: 1, title: 'Ownership & Legal Title Search (30 Years)', authority: 'Sub-Registrar Office', duration: '3 - 4 Weeks', status: 'Mandatory', desc: 'Verify unencumbered freehold/leasehold title, non-agricultural conversion (CLU), and nil-encumbrance certificate.' },
                { step: 2, title: 'Groundwater Abstraction NOC', authority: 'Central Ground Water Authority (CGWA)', duration: '6 - 8 Weeks', status: 'Conditional', desc: 'Mandatory filing due to Over-Exploited block. Submit dual-piping STP reuse plan and artificial recharge design.' },
                { step: 3, title: 'State Environmental Clearance (EC)', authority: 'State EIA Authority (SEIAA / MoEFCC)', duration: '12 - 16 Weeks', status: 'Statutory (>20,000 sqm)', desc: 'Submit Form-1, Conceptual Plan, EIA/EMP report, and solid waste management design.' },
                { step: 4, title: 'Building Plan Sanction & Fire NOC', authority: 'Development Authority & Fire Dept', duration: '6 - 8 Weeks', status: 'Statutory', desc: 'Approval of architectural drawings, structural stability per IS 1893, and access road turn-around clearance.' },
                { step: 5, title: 'State RERA Project Registration', authority: 'UP RERA / State Authority', duration: '4 - 6 Weeks', status: 'Statutory before marketing', desc: 'File sanctioned plans, escrow account details, promoter financial disclosures, and quarterly milestone commitments.' }
              ].map((rd) => (
                <div key={rd.step} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3.5 text-xs">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono font-bold flex items-center justify-center shrink-0">
                    {rd.step}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm">{rd.title}</span>
                      <span className="text-[10px] font-mono text-cyan-400 font-semibold">{rd.duration}</span>
                    </div>
                    <div className="text-[11px] text-slate-400">Authority: <b className="text-slate-300">{rd.authority}</b> • Status: <b className="text-amber-400">{rd.status}</b></div>
                    <p className="text-[11px] text-slate-400">{rd.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: GROUND-TRUTH SURVEY MODULE (D9) */}
      {activeTab === 'survey' && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Submit Survey Form */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    D9: Ground-Truth Field Survey Form
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Submit verified on-site geotechnical and road measurements</p>
                </div>
              </div>

              {surveySubmitted && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Survey logged successfully! Confidence badge upgraded to &quot;Field-Verified&quot;.
                </div>
              )}

              <form onSubmit={handleSubmitSurvey} className="space-y-3.5 text-xs">
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Surveyor Full Name / License ID</label>
                  <input
                    type="text"
                    value={surveyorName}
                    onChange={(e) => setSurveyorName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Measured Soil SBC (kN/m²)</label>
                    <input
                      type="number"
                      value={measuredSbc}
                      onChange={(e) => setMeasuredSbc(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-slate-300 font-semibold block mb-1">Actual Road Width (Meters)</label>
                    <input
                      type="number"
                      value={measuredRoadWidth}
                      onChange={(e) => setMeasuredRoadWidth(parseInt(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-slate-300 font-semibold block mb-1">Field Due Diligence Notes</label>
                  <textarea
                    rows={3}
                    value={surveyNotes}
                    onChange={(e) => setSurveyNotes(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Submit Field Survey (Upgrade Confidence Badge)
                </button>
              </form>
            </div>

            {/* Checklist Export */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                  Due Diligence Field Checklist
                </h3>
                <button
                  onClick={() => window.print()}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" /> Export Checklist
                </button>
              </div>

              {surveyChecklist && (
                <div className="space-y-3 text-xs">
                  {surveyChecklist.checklist_sections.map((sec: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
                      <div className="font-bold text-emerald-400">{sec.section}</div>
                      <ul className="list-disc pl-4 space-y-1 text-slate-300 text-[11px]">
                        {sec.items.map((item: string, iIdx: number) => (
                          <li key={iIdx}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: TOP OPPORTUNITIES & DEVELOPER FILTERS (D8) */}
      {activeTab === 'top_plots' && (
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
          <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Filter className="w-4 h-4 text-cyan-400" />
                  D8: Top Land Opportunities (Ranked Opportunities)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Filter by budget, scale, seismic safety, and zone classification</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {topPlots.map((plot) => (
                <div key={plot.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{plot.name}</div>
                      <div className="text-[11px] text-slate-400">{plot.city} • {plot.scale_acres} Acres</div>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${plot.verdict === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {plot.verdict} (Score: {plot.deal_score})
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center font-mono">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Asking</span>
                      <span className="text-white font-bold">₹{plot.asking_cost_cr} Cr</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Zone</span>
                      <span className="text-emerald-400 font-bold">{plot.zone_type}</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-500 block">Metro Dist</span>
                      <span className="text-cyan-400 font-bold">{plot.distance_to_metro_m}m</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onSelectLocation) {
                        onSelectLocation({
                          id: plot.locality_id,
                          display_name: plot.name,
                          city: plot.city,
                          country: 'India',
                          latitude: plot.latitude,
                          longitude: plot.longitude
                        });
                      }
                      setActiveTab('feasibility');
                    }}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-cyan-400 font-bold text-xs border border-slate-800 transition-colors cursor-pointer"
                  >
                    Simulate Plot Feasibility →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* D14: DEVELOPER AI ADVISOR FLOATING DRAWER */}
      <div className="fixed bottom-4 right-4 z-50 print:hidden">
        <div className="w-80 sm:w-96 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-2xl overflow-hidden flex flex-col">
          <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">Developer AI Advisor</span>
            </div>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              D14 ACTIVE
            </span>
          </div>

          {/* Messages */}
          <div className="p-3 max-h-56 overflow-y-auto space-y-2 text-xs">
            {aiChatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-2.5 rounded-xl whitespace-pre-line leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-800/40 ml-4'
                    : 'bg-slate-950 text-slate-300 border border-slate-800 mr-4'
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isAiReplying && (
              <div className="text-[11px] text-slate-500 italic flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Querying deterministic engines...
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-2 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
            <input
              type="text"
              placeholder="Ask about IRR, soil, FAR, or water..."
              value={aiInputText}
              onChange={(e) => setAiInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendAiMessage()}
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-hidden"
            />
            <button
              onClick={handleSendAiMessage}
              className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer transition-colors"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
