'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  TrendingUp,
  MapPin,
  Building2,
  ShieldAlert,
  Info,
  CheckCircle2,
  AlertTriangle,
  X,
  Layers,
  Search,
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';
import { DeveloperZone, DeveloperZonesResponse, LocationItem } from '@/types';
import { fetchDeveloperZones, scoreDeveloperZones } from '@/lib/api';

const DynamicDeveloperHeatmapMap = dynamic(() => import('./DeveloperHeatmapMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 text-slate-500 min-h-[550px] rounded-2xl border border-slate-200">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-700">Loading Developer Cadastral Map...</span>
      </div>
    </div>
  )
});

interface DeveloperHeatmapExplorerProps {
  currentLocation?: LocationItem;
  onNavigateTab?: (tab: string) => void;
  onSelectZoneForFeasibility?: (zone: DeveloperZone) => void;
}

export default function DeveloperHeatmapExplorer({
  currentLocation,
  onNavigateTab,
  onSelectZoneForFeasibility
}: DeveloperHeatmapExplorerProps) {
  // City filter
  const [selectedCity, setSelectedCity] = useState<string>('Noida');

  // Hard filter states
  const [minConnectivity, setMinConnectivity] = useState<number>(60);
  const [minAmenities, setMinAmenities] = useState<number>(50);
  const [maxAqi, setMaxAqi] = useState<number>(180);
  const [maxPriceSqft, setMaxPriceSqft] = useState<number>(25000);
  const [minGrowthPct, setMinGrowthPct] = useState<number>(8);
  const [allowedTraffic, setAllowedTraffic] = useState<string[]>(['Low', 'Medium', 'High', 'Severe']);
  const [allowedFlood, setAllowedFlood] = useState<string[]>(['Low', 'Moderate', 'High']);
  const [allowedGroundwater, setAllowedGroundwater] = useState<string[]>([
    'Safe',
    'Semi-Critical',
    'Critical',
    'Over-Exploited'
  ]);

  // Active preset tag
  const [activePreset, setActivePreset] = useState<string>('balanced');

  // Server response state
  const [zonesData, setZonesData] = useState<DeveloperZonesResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedZone, setSelectedZone] = useState<DeveloperZone | null>(null);

  // Map center coordinates
  const mapCenter = useMemo<[number, number]>(() => {
    if (selectedZone) return selectedZone.center;
    if (selectedCity === 'Greater Noida') return [28.4720, 77.4980];
    return [28.5650, 77.3750]; // Default Noida center
  }, [selectedZone, selectedCity]);

  // Initial load
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    fetchDeveloperZones(selectedCity)
      .then((res) => {
        if (isMounted) {
          setZonesData(res);
          if (res.zones && res.zones.length > 0 && !selectedZone) {
            setSelectedZone(res.top_recommended?.[0] || res.zones[0]);
          }
        }
      })
      .catch((err) => console.error('Error fetching developer zones', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedCity]);

  // Debounced filter evaluator (250ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      const filters = {
        min_connectivity: minConnectivity,
        min_amenities: minAmenities,
        max_aqi: maxAqi,
        max_price_sqft: maxPriceSqft,
        min_growth_pct: minGrowthPct,
        allowed_traffic: allowedTraffic,
        allowed_flood: allowedFlood,
        allowed_groundwater: allowedGroundwater
      };

      scoreDeveloperZones({
        city: selectedCity,
        filters
      })
        .then((res) => {
          setZonesData(res);
          // If current selectedZone became dimmed, update its instance
          if (selectedZone) {
            const updated = res.zones.find((z) => z.id === selectedZone.id);
            if (updated) setSelectedZone(updated);
          }
        })
        .catch((err) => console.error('Error recalculating developer scores', err));
    }, 250);

    return () => clearTimeout(handler);
  }, [
    selectedCity,
    minConnectivity,
    minAmenities,
    maxAqi,
    maxPriceSqft,
    minGrowthPct,
    allowedTraffic,
    allowedFlood,
    allowedGroundwater
  ]);

  // Preset Handlers
  const handleApplyPreset = (preset: 'balanced' | 'high_growth' | 'transit_oriented' | 'budget') => {
    setActivePreset(preset);
    if (preset === 'balanced') {
      setMinConnectivity(60);
      setMinAmenities(50);
      setMaxAqi(180);
      setMaxPriceSqft(25000);
      setMinGrowthPct(8);
      setAllowedTraffic(['Low', 'Medium', 'High', 'Severe']);
      setAllowedFlood(['Low', 'Moderate', 'High']);
      setAllowedGroundwater(['Safe', 'Semi-Critical', 'Critical', 'Over-Exploited']);
    } else if (preset === 'high_growth') {
      setMinConnectivity(70);
      setMinAmenities(50);
      setMaxAqi(160);
      setMaxPriceSqft(15000);
      setMinGrowthPct(16);
      setAllowedTraffic(['Low', 'Medium', 'High']);
      setAllowedFlood(['Low', 'Moderate']);
      setAllowedGroundwater(['Safe', 'Semi-Critical', 'Critical', 'Over-Exploited']);
    } else if (preset === 'transit_oriented') {
      setMinConnectivity(85);
      setMinAmenities(75);
      setMaxAqi(180);
      setMaxPriceSqft(25000);
      setMinGrowthPct(10);
      setAllowedTraffic(['Low', 'Medium', 'High']);
      setAllowedFlood(['Low', 'Moderate', 'High']);
      setAllowedGroundwater(['Safe', 'Semi-Critical', 'Critical', 'Over-Exploited']);
    } else if (preset === 'budget') {
      setMinConnectivity(65);
      setMinAmenities(50);
      setMaxAqi(170);
      setMaxPriceSqft(8000);
      setMinGrowthPct(10);
      setAllowedTraffic(['Low', 'Medium', 'High', 'Severe']);
      setAllowedFlood(['Low', 'Moderate']);
      setAllowedGroundwater(['Safe', 'Semi-Critical', 'Critical', 'Over-Exploited']);
    }
  };

  const toggleArrayFilter = (arr: string[], item: string, setter: (val: string[]) => void) => {
    if (arr.includes(item)) {
      if (arr.length > 1) {
        setter(arr.filter((x) => x !== item));
      }
    } else {
      setter([...arr, item]);
    }
  };

  const zones = zonesData?.zones || [];
  const topRecommended = zonesData?.top_recommended || [];
  const totalCount = zones.length;
  const qualifyingCount = zonesData?.qualifying_zones ?? zones.filter((z) => !z.is_dimmed).length;
  const excludedCount = totalCount - qualifyingCount;

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-slate-200 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                Developer Feasibility &amp; Land Suitability Heatmap
              </h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Seeded demo dataset
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Deterministic NumPy scoring across 9 cadastral, environmental, and macroeconomic metrics.
            </p>
          </div>
        </div>

        {/* City Filter & Zone Counters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setSelectedCity('Noida')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedCity === 'Noida' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Noida
            </button>
            <button
              onClick={() => setSelectedCity('Greater Noida')}
              className={`px-3 py-1 rounded-md transition-colors ${
                selectedCity === 'Greater Noida'
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Greater Noida
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
            <span className="text-slate-500">Status:</span>
            <span className="font-bold text-emerald-700">{qualifyingCount} Qualifying</span>
            <span className="text-slate-300">|</span>
            <span className="font-bold text-rose-600">{excludedCount} Excluded</span>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Filters Sidebar (Left) + Map (Center) + Drawer/Ranked (Right/Bottom) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left Filter Sidebar */}
        <div className="w-full lg:w-80 bg-white border-r border-slate-200 flex flex-col h-auto lg:h-[calc(100vh-140px)] overflow-y-auto">
          <div className="p-4 border-b border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Filter className="w-3.5 h-3.5 text-emerald-600" />
                Developer Criteria
              </div>
              <button
                onClick={() => handleApplyPreset('balanced')}
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-900 transition-colors font-medium"
                title="Reset all filters"
              >
                <RotateCcw className="w-3 h-3" />
                Reset
              </button>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => handleApplyPreset('high_growth')}
                className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-semibold border transition-all ${
                  activePreset === 'high_growth'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🔥 High Growth
              </button>
              <button
                onClick={() => handleApplyPreset('transit_oriented')}
                className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-semibold border transition-all ${
                  activePreset === 'transit_oriented'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                🚇 Transit Hub
              </button>
              <button
                onClick={() => handleApplyPreset('budget')}
                className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-semibold border transition-all ${
                  activePreset === 'budget'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                💰 Budget Value
              </button>
              <button
                onClick={() => handleApplyPreset('balanced')}
                className={`px-2 py-1.5 rounded-lg text-left text-[11px] font-semibold border transition-all ${
                  activePreset === 'balanced'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                ⚖️ Balanced
              </button>
            </div>
          </div>

          {/* Filter Sliders */}
          <div className="p-4 space-y-4 text-xs">
            {/* Min Connectivity */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Min Connectivity Score</span>
                <span className="font-mono text-emerald-700">{minConnectivity}/100</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                step="5"
                value={minConnectivity}
                onChange={(e) => {
                  setMinConnectivity(Number(e.target.value));
                  setActivePreset('custom');
                }}
                className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Min Amenities */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Min Nearby Amenities</span>
                <span className="font-mono text-emerald-700">{minAmenities}/100</span>
              </div>
              <input
                type="range"
                min="40"
                max="95"
                step="5"
                value={minAmenities}
                onChange={(e) => {
                  setMinAmenities(Number(e.target.value));
                  setActivePreset('custom');
                }}
                className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Max AQI */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Max Allowed AQI</span>
                <span className="font-mono text-amber-700">&le; {maxAqi}</span>
              </div>
              <input
                type="range"
                min="90"
                max="200"
                step="5"
                value={maxAqi}
                onChange={(e) => {
                  setMaxAqi(Number(e.target.value));
                  setActivePreset('custom');
                }}
                className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-slate-500">Zones with AQI above this are dimmed/greyed.</span>
            </div>

            {/* Max Land Price */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Max Land Price</span>
                <span className="font-mono text-emerald-700">₹{maxPriceSqft.toLocaleString()}/sqft</span>
              </div>
              <input
                type="range"
                min="4000"
                max="25000"
                step="1000"
                value={maxPriceSqft}
                onChange={(e) => {
                  setMaxPriceSqft(Number(e.target.value));
                  setActivePreset('custom');
                }}
                className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Min 5-Yr Growth */}
            <div>
              <div className="flex justify-between font-semibold text-slate-700 mb-1">
                <span>Min 5-Yr Price Growth</span>
                <span className="font-mono text-emerald-700">+{minGrowthPct}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="30"
                step="1"
                value={minGrowthPct}
                onChange={(e) => {
                  setMinGrowthPct(Number(e.target.value));
                  setActivePreset('custom');
                }}
                className="w-full accent-emerald-600 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>

            {/* Allowed Flood Risk */}
            <div>
              <span className="font-semibold text-slate-700 block mb-1.5">Permissible Flood Risk</span>
              <div className="grid grid-cols-3 gap-1">
                {['Low', 'Moderate', 'High'].map((f) => {
                  const active = allowedFlood.includes(f);
                  return (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleArrayFilter(allowedFlood, f, setAllowedFlood)}
                      className={`py-1 text-center rounded text-[11px] font-semibold border transition-all ${
                        active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      {f}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Allowed Traffic Levels */}
            <div>
              <span className="font-semibold text-slate-700 block mb-1.5">Traffic Congestion Tolerance</span>
              <div className="grid grid-cols-2 gap-1">
                {['Low', 'Medium', 'High', 'Severe'].map((t) => {
                  const active = allowedTraffic.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => toggleArrayFilter(allowedTraffic, t, setAllowedTraffic)}
                      className={`py-1 text-center rounded text-[11px] font-semibold border transition-all ${
                        active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      {t}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Allowed Groundwater Category */}
            <div>
              <span className="font-semibold text-slate-700 block mb-1.5">CGWA Groundwater Category</span>
              <div className="grid grid-cols-2 gap-1">
                {['Safe', 'Semi-Critical', 'Critical', 'Over-Exploited'].map((g) => {
                  const active = allowedGroundwater.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => toggleArrayFilter(allowedGroundwater, g, setAllowedGroundwater)}
                      className={`py-1 px-1 text-center rounded text-[10px] font-semibold border truncate transition-all ${
                        active
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                      title={g}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Leaflet Polygon Map */}
        <div className="flex-1 h-[500px] lg:h-[calc(100vh-140px)] p-3 flex flex-col">
          <DynamicDeveloperHeatmapMap
            center={mapCenter}
            zoom={selectedCity === 'Greater Noida' ? 12 : 13}
            zones={zones}
            selectedZone={selectedZone}
            onSelectZone={(z) => setSelectedZone(z)}
            legend={zonesData?.legend || []}
          />
        </div>

        {/* Right / Side Panel: Top Recommended & Zone Detail */}
        <div className="w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col h-auto lg:h-[calc(100vh-140px)] overflow-y-auto">
          {/* Selected Zone Card (Drawer content) */}
          {selectedZone ? (
            <div className="p-4 border-b border-slate-200">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[10px] uppercase font-bold text-slate-500">{selectedZone.city}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                      {selectedZone.demo_badge || 'Demo data'}
                    </span>
                  </div>
                  <h2 className="text-base font-bold text-slate-900 leading-snug">{selectedZone.name}</h2>
                </div>
                {/* Score Ring / Pill */}
                <div className="text-right">
                  {selectedZone.is_dimmed ? (
                    <div className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-extrabold">
                      EXCLUDED
                    </div>
                  ) : (
                    <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center">
                      <div className="text-[10px] uppercase font-bold text-emerald-600">Score</div>
                      <div className="text-lg font-black">{selectedZone.suitability_score?.toFixed(1) || 'N/A'}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Exclusion Alert Banner */}
              {selectedZone.is_dimmed && selectedZone.fail_reasons && (
                <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  <div className="flex items-center gap-1.5 font-bold mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    Failed Hard Filter Thresholds:
                  </div>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-700">
                    {selectedZone.fail_reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium">Land Price</span>
                  <div className="font-bold text-slate-900">₹{selectedZone.land_price_sqft.toLocaleString()}/sqft</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium">5-Yr Price Growth</span>
                  <div className="font-bold text-emerald-700">+{selectedZone.price_growth_5yr_pct}%</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium">Air Quality</span>
                  <div className="font-bold text-slate-900">AQI {selectedZone.aqi}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] text-slate-500 font-medium">Upcoming Metro / Infra</span>
                  <div className="font-bold text-slate-900">{selectedZone.upcoming_infra_dist_km} km</div>
                </div>
              </div>

              {/* Factor Breakdown Bars */}
              <div className="space-y-2 mb-4">
                <span className="text-xs font-bold text-slate-900 block">Factor Suitability Breakdown</span>
                
                {/* Connectivity */}
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-600">Connectivity &amp; Transit</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedZone.connectivity_score}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${selectedZone.connectivity_score}%` }}
                    />
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-600">Nearby Civic Amenities</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedZone.nearby_amenities_score}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${selectedZone.nearby_amenities_score}%` }}
                    />
                  </div>
                </div>

                {/* Traffic */}
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-600">Traffic Congestion ({selectedZone.traffic_congestion_level})</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedZone.traffic_score}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${selectedZone.traffic_score}%` }}
                    />
                  </div>
                </div>

                {/* Flood Risk */}
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-600">Flood Inundation Safety ({selectedZone.flood_risk})</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedZone.flood_safety_score}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full"
                      style={{ width: `${selectedZone.flood_safety_score}%` }}
                    />
                  </div>
                </div>

                {/* Groundwater */}
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-slate-600">Groundwater ({selectedZone.groundwater_category})</span>
                    <span className="font-mono font-semibold text-slate-800">{selectedZone.groundwater_score}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-sky-500 rounded-full"
                      style={{ width: `${selectedZone.groundwater_score}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {onSelectZoneForFeasibility && (
                  <button
                    onClick={() => onSelectZoneForFeasibility(selectedZone)}
                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>Simulate Feasibility</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
                {onNavigateTab && (
                  <button
                    onClick={() => onNavigateTab('site-report')}
                    className="py-2 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors border border-slate-200"
                  >
                    Site Report
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400">
              <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Click any polygon on the map to view zone details and factor breakdown.</p>
            </div>
          )}

          {/* Top Recommended Zones List */}
          <div className="p-4 flex-1">
            <div className="flex items-center justify-between mb-2.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Top Recommended Zones
              </h3>
              <span className="text-[10px] font-semibold text-slate-500">Ranked by Score</span>
            </div>

            <div className="space-y-2">
              {topRecommended.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-50 text-slate-500 text-xs text-center border border-dashed border-slate-200">
                  No zones match current hard filters. Try relaxing AQI, growth, or price criteria.
                </div>
              ) : (
                topRecommended.map((zone, idx) => {
                  const isSelected = selectedZone?.id === zone.id;
                  return (
                    <div
                      key={zone.id}
                      onClick={() => setSelectedZone(zone)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-400'
                          : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-bold text-[10px] flex items-center justify-center">
                            #{idx + 1}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-900 leading-snug">{zone.name}</div>
                            <div className="text-[10px] text-slate-500">{zone.city}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-extrabold text-xs">
                            {zone.suitability_score?.toFixed(1)}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                        <span>₹{zone.land_price_sqft.toLocaleString()}/sqft</span>
                        <span className="text-emerald-700 font-semibold">+{zone.price_growth_5yr_pct}% 5-Yr</span>
                        <span>AQI {zone.aqi}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
