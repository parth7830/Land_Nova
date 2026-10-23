'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  GitCompare,
  Trees,
  CloudRain,
  Share2,
  Sliders,
  Check,
  Copy,
  TrendingUp,
  Shield,
  Train,
  GraduationCap,
  Building2,
  Wind
} from 'lucide-react';
import { BuyerSector } from '@/types';
import { compareBuyerSectors } from '@/lib/api';

// ==================== B2: COMPARE MODAL ====================
export function CompareModal({
  allSectors,
  initialSectorIds,
  onClose
}: {
  allSectors: BuyerSector[];
  initialSectorIds: string[];
  onClose: () => void;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSectorIds.length >= 2 ? initialSectorIds.slice(0, 3) : allSectors.slice(0, 2).map((s) => s.id)
  );
  const [comparisonData, setComparisonData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchComparison() {
      setLoading(true);
      const res = await compareBuyerSectors(selectedIds);
      setComparisonData(res);
      setLoading(false);
    }
    if (selectedIds.length >= 2) {
      fetchComparison();
    }
  }, [selectedIds]);

  const toggleSector = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 2) {
        setSelectedIds(selectedIds.filter((s) => s !== id));
      }
    } else {
      if (selectedIds.length < 3) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <GitCompare className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Compare Candidate Locations</h3>
            <p className="text-xs text-slate-500">Side-by-side deterministic metrics + Grounded Gemini analysis</p>
          </div>
        </div>

        {/* Sector selector chips */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <span className="text-xs text-slate-500 font-semibold">Select 2 to 3 sectors:</span>
          {allSectors.map((s) => {
            const isSelected = selectedIds.includes(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggleSector(s.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {s.name}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-12 flex items-center justify-center">
            <div className="w-7 h-7 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : comparisonData ? (
          <div className="space-y-5">
            {/* Grounded AI summary */}
            <div className="p-4 bg-emerald-50/80 rounded-xl border border-emerald-200 text-xs text-slate-800 space-y-1.5">
              <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>AI Comparative Assessment (Strictly Grounded in Verified Metrics)</span>
              </span>
              <p className="text-slate-700 text-xs whitespace-pre-line leading-relaxed">
                {comparisonData.grounded_ai_summary}
              </p>
            </div>

            {/* Side-by-side Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-900">
                  <tr>
                    <th className="p-3">Indicator / Metric</th>
                    {comparisonData.sectors.map((s: BuyerSector) => (
                      <th key={s.id} className="p-3">
                        <span className="text-xs font-extrabold text-slate-900 block">{s.name}</span>
                        <span className="text-[10px] text-emerald-700 font-mono font-bold">
                          Score: {s.overall_score}/100
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">Avg Property Rate</td>
                    {comparisonData.sectors.map((s: BuyerSector) => (
                      <td key={s.id} className="p-3 font-mono font-bold">
                        ₹{s.avg_price_sqft.toLocaleString()} / sq.ft
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">Air Quality (AQI)</td>
                    {comparisonData.sectors.map((s: BuyerSector) => (
                      <td key={s.id} className="p-3">
                        <span className="font-bold">{s.metrics.aqi.value}</span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">Transit &amp; Multimodal</td>
                    {comparisonData.sectors.map((s: BuyerSector) => (
                      <td key={s.id} className="p-3">
                        {s.metrics.connectivity.value}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">Schools in 2km</td>
                    {comparisonData.sectors.map((s: BuyerSector) => (
                      <td key={s.id} className="p-3">
                        {s.metrics.schools.value}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">Safety &amp; Emergency (Proxy)</td>
                    {comparisonData.sectors.map((s: BuyerSector) => (
                      <td key={s.id} className="p-3">
                        <span className="font-bold text-slate-800">{s.metrics.crime_rate.badge}</span> (
                        {s.metrics.crime_rate.value})
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-800">Estimated Drive to Workplace</td>
                    {comparisonData.sectors.map((s: BuyerSector) => (
                      <td key={s.id} className="p-3 font-mono font-bold text-emerald-700">
                        {s.commute.car_minutes} mins
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== B4: 15-MINUTE-CITY WALKABILITY MODAL ====================
export function WalkabilityModal({
  sector,
  onClose
}: {
  sector: BuyerSector;
  onClose: () => void;
}) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWalk() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/buyer/walkability/${sector.id}`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.warn('Walkability error', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWalk();
  }, [sector]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🚶</span>
          <div>
            <h3 className="text-base font-bold text-slate-900">15-Minute-City Walkability Score</h3>
            <p className="text-xs text-slate-500">{sector.name} Essential Errands Cadastral Analysis</p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-950 block">{data.walkability_label}</span>
                <span className="text-[11px] text-emerald-800">
                  Max walk time to essentials: {data.max_walk_to_essentials_minutes} mins
                </span>
              </div>
              <span className="text-2xl font-black text-emerald-700 font-mono">
                {Math.round(data.walkability_score)}/100
              </span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-800 block">Distance to Daily Essentials:</span>
              {data.essentials.map((item: any, i: number) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg border border-slate-200/70 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-800">{item.category}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block font-mono">{item.distance_meters}m</span>
                    <span className="text-[10px] text-emerald-700 font-medium">{item.duration_minutes} min walk</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== B5: FLOOD & CLIMATE DEEP DIVE MODAL ====================
export function FloodClimateModal({
  sector,
  onClose
}: {
  sector: BuyerSector;
  onClose: () => void;
}) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchClimate() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/buyer/flood-climate/${sector.id}`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.warn('Flood error', err);
      } finally {
        setLoading(false);
      }
    }
    fetchClimate();
  }, [sector]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[85vh] overflow-y-auto animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🌊</span>
          <div>
            <h3 className="text-base font-bold text-slate-900">Flood &amp; Climate Deep Dive</h3>
            <p className="text-xs text-slate-500">Copernicus GLO-30 Elevation &amp; 10-Year Monsoon Extreme Analysis</p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-4 text-xs">
            {/* Topography Summary Card */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Absolute Elevation</span>
                <span className="text-base font-extrabold text-slate-900 font-mono">{data.elevation_m} meters</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{data.elevation_source}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold block">Flood Vulnerability</span>
                <span className="text-base font-extrabold text-emerald-700">{data.flood_risk_level} Risk</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">{data.relative_topography}</span>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed bg-emerald-50/70 p-3 rounded-lg border border-emerald-200">
              {data.reasoning}
            </p>

            {/* 10-Year Extreme Monsoon Rainfall Records */}
            <div>
              <span className="text-xs font-bold text-slate-800 block mb-2">
                10-Year Extreme Monsoon Rainfall Events (24-Hour Max):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5">
                {data.historical_extremes.map((item: any) => (
                  <div key={item.year} className="p-2 rounded-lg border border-slate-200 bg-white text-center">
                    <span className="text-[10px] text-slate-400 font-mono block">{item.year}</span>
                    <span className="text-xs font-bold text-slate-800 font-mono block">
                      {item.max_24h_rainfall_mm} mm
                    </span>
                    <span className="text-[9px] text-emerald-700 block truncate">{item.flood_status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 12-Month AQI Seasonal Curve */}
            <div>
              <span className="text-xs font-bold text-slate-800 block mb-2">
                12-Month Seasonal Air Quality (AQI) Profile:
              </span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {data.seasonal_aqi_trend.map((month: any) => (
                  <div
                    key={month.month}
                    className={`p-2 rounded-lg border text-center ${
                      month.aqi < 100
                        ? 'bg-emerald-50 border-emerald-200'
                        : month.aqi < 200
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-rose-50 border-rose-200'
                    }`}
                  >
                    <span className="text-[10px] font-bold text-slate-700 block">{month.month}</span>
                    <span className="text-xs font-black font-mono block">{month.aqi} AQI</span>
                    <span className="text-[9px] text-slate-500 block truncate">{month.season}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== B10: WATERFALL EXPLAINABILITY MODAL ====================
export function WaterfallModal({
  sector,
  onClose
}: {
  sector: BuyerSector;
  onClose: () => void;
}) {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWaterfall() {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/buyer/waterfall/${sector.id}`);
        if (res.ok) {
          setData(await res.json());
        }
      } catch (err) {
        console.warn('Waterfall error', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWaterfall();
  }, [sector]);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">📊</span>
          <div>
            <h3 className="text-base font-bold text-slate-900">&quot;Why This Score?&quot; Waterfall Breakdown</h3>
            <p className="text-xs text-slate-500">{sector.name} Algorithmic Contribution Decomposition</p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : data ? (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center font-bold">
              <span className="text-slate-800">Final Deterministic Score:</span>
              <span className="text-emerald-700 text-lg font-mono">{data.overall_score} / 100</span>
            </div>

            <div className="space-y-2">
              {data.waterfall_bars.map((bar: any, i: number) => (
                <div key={i} className="p-2.5 bg-white border border-slate-200 rounded-lg text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{bar.pillar}</span>
                    <span className="font-mono text-emerald-700 font-bold">+{bar.contribution} pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all"
                      style={{ width: `${(bar.contribution / 25) * 100}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>Raw Score: {bar.raw_score}</span>
                    <span>Weight Applied: {bar.weight_pct}%</span>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 font-mono bg-slate-50 p-2 rounded border border-slate-200">
              Formula: Overall Score = Sum(Pillar_Score_i * Weight_i)
            </p>
          </div>
        ) : null}

        <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== B6: CUSTOM WEIGHT SLIDERS & PRESETS MODAL ====================
export function PresetsAndWeightsModal({
  currentWeights,
  onApplyWeights,
  onClose
}: {
  currentWeights: Record<string, number>;
  onApplyWeights: (weights: Record<string, number>) => void;
  onClose: () => void;
}) {
  const [weights, setWeights] = useState<Record<string, number>>({
    connectivity: currentWeights.connectivity || 25,
    amenities: currentWeights.amenities || 25,
    environment: currentWeights.environment || 20,
    safety: currentWeights.safety || 15,
    climate_flood: currentWeights.climate_flood || 15
  });

  const presets = [
    { name: 'Family', weights: { connectivity: 15, amenities: 30, environment: 25, safety: 20, climate_flood: 10 } },
    { name: 'Working Professional', weights: { connectivity: 35, amenities: 20, environment: 20, safety: 10, climate_flood: 15 } },
    { name: 'Bachelor', weights: { connectivity: 30, amenities: 25, environment: 15, safety: 15, climate_flood: 15 } },
    { name: 'Pet Owner', weights: { connectivity: 20, amenities: 20, environment: 35, safety: 15, climate_flood: 10 } },
    { name: 'Senior Citizen', weights: { connectivity: 15, amenities: 30, environment: 25, safety: 20, climate_flood: 10 } }
  ];

  const handleApply = () => {
    onApplyWeights(weights);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xl">🎚️</span>
          <div>
            <h3 className="text-base font-bold text-slate-900">Custom Scoring Presets &amp; Sliders</h3>
            <p className="text-xs text-slate-500">Fine-tune the 5 algorithmic pillars directly</p>
          </div>
        </div>

        {/* 5 Presets Chips */}
        <div className="mb-4">
          <span className="text-[11px] font-bold text-slate-700 block mb-1.5">Load Preset:</span>
          <div className="flex flex-wrap gap-1.5">
            {presets.map((p) => (
              <button
                key={p.name}
                onClick={() => setWeights(p.weights)}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer"
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* 5 Sliders */}
        <div className="space-y-3 mb-5 text-xs">
          {Object.entries(weights).map(([k, val]) => (
            <div key={k} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="flex justify-between items-center mb-1">
                <span className="capitalize font-semibold text-slate-800">{k.replace('_', ' ')}</span>
                <span className="font-bold text-emerald-700 font-mono">{val}%</span>
              </div>
              <input
                type="range"
                min={5}
                max={60}
                step={5}
                value={val}
                onChange={(e) => setWeights({ ...weights, [k]: Number(e.target.value) })}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition cursor-pointer"
          >
            Apply Weights
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== B7: SHAREABLE SEARCH MODAL ====================
export function ShareSearchModal({
  currentUrl,
  onClose
}: {
  currentUrl: string;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-3">
          <Share2 className="w-6 h-6" />
        </div>

        <h3 className="text-base font-bold text-slate-900 mb-1">Share Your Custom Search</h3>
        <p className="text-xs text-slate-500 mb-4">
          All your chosen filters, weights, and selected candidate areas are encoded directly in this URL.
        </p>

        <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-xl p-2 mb-4">
          <input
            type="text"
            readOnly
            value={currentUrl}
            className="bg-transparent text-xs text-slate-700 w-full focus:outline-none font-mono truncate"
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1 shrink-0 cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
        >
          Done
        </button>
      </div>
    </div>
  );
}
