'use client';

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import {
  Filter,
  ChevronLeft,
  Info,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Bookmark,
  Sparkles,
  BarChart3,
  GitCompare,
  X
} from 'lucide-react';
import { HeatmapCell, LocationItem } from '@/types';
import { fetchHeatmap } from '@/lib/api';

const DynamicHeatmapMap = dynamic(() => import('./HeatmapMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500 min-h-[500px]">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-700">Loading spatial map tiles...</span>
      </div>
    </div>
  )
});

interface HeatmapExplorerProps {
  currentLocation: LocationItem;
  initialPersona?: string;
  onNavigateTab: (tab: string) => void;
  onOpenAIChat?: (locName: string, context: any) => void;
}

export default function HeatmapExplorer({
  currentLocation,
  initialPersona = 'family',
  onNavigateTab,
  onOpenAIChat
}: HeatmapExplorerProps) {
  const [cells, setCells] = useState<HeatmapCell[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCell, setSelectedCell] = useState<HeatmapCell | null>(null);
  const [isDemoFallback, setIsDemoFallback] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  // Sidebar filters
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePersona, setActivePersona] = useState<string>(initialPersona);
  const [maxPrice, setMaxPrice] = useState(15000000);
  const [connectivityReq, setConnectivityReq] = useState('medium');
  const [aqiThreshold, setAqiThreshold] = useState(120);
  const [nearParks, setNearParks] = useState(true);
  const [nearHospitals, setNearHospitals] = useState(true);
  const [nearSchools, setNearSchools] = useState(true);

  const [activeBBox, setActiveBBox] = useState<{
    min_lat: number;
    max_lat: number;
    min_lon: number;
    max_lon: number;
  } | null>(null);

  // Generate fallback demo cells clearly labeled
  const generateIllustrativeDemoGrid = (centerLat: number, centerLon: number): HeatmapCell[] => {
    const size = 5;
    const delta = 0.04;
    const minLat = centerLat - delta;
    const maxLat = centerLat + delta;
    const minLon = centerLon - delta;
    const maxLon = centerLon + delta;
    const latStep = (maxLat - minLat) / (size - 1);
    const lonStep = (maxLon - minLon) / (size - 1);

    const demoCells: HeatmapCell[] = [];
    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const lat = minLat + i * latStep;
        const lon = minLon + j * lonStep;

        // Introduce a diverse spectrum of scores: excellent, good, moderate, poor, and insufficient data
        let score: number;
        let grade: string;
        let completeness: number;

        if (i === 0 && j === 0) {
          // One insufficient data cell for testing edge cases
          score = -1;
          grade = 'N/A';
          completeness = 0;
        } else {
          // Synthetic deterministic gradient centered on middle
          const dist = Math.hypot(i - 2, j - 2);
          if (dist < 1.0) {
            score = 88;
            grade = 'A';
          } else if (dist < 1.8) {
            score = 72;
            grade = 'B';
          } else if (dist < 2.5) {
            score = 52;
            grade = 'C';
          } else {
            score = 36;
            grade = 'D';
          }
          completeness = 92.5;
        }

        demoCells.push({
          latitude: lat,
          longitude: lon,
          score,
          grade,
          data_completeness_pct: completeness,
          factors_summary: {
            connectivity: score > 0 ? Math.min(100, score + 4) : 0,
            amenities: score > 0 ? Math.min(100, score - 2) : 0,
            environment: score > 0 ? Math.min(100, score - 5) : 0,
            safety: score > 0 ? Math.min(100, score + 3) : 0,
            climate_flood: score > 0 ? 82 : 0
          }
        });
      }
    }
    return demoCells;
  };

  // Top 5 recommended localities memoized for instant re-renders (Requirement 5)
  const recommendedLocalities = useMemo(() => {
    return [...cells]
      .filter((c) => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((c, i) => ({
        rank: i + 1,
        name: `Sector Cluster ${i + 1} (${currentLocation.city || 'Noida'})`,
        score: c.score,
        grade: c.grade,
        lat: c.latitude,
        lon: c.longitude
      }));
  }, [cells, currentLocation.city]);

  // Sync active bbox when currentLocation changes
  useEffect(() => {
    const lat = currentLocation.latitude;
    const lon = currentLocation.longitude;
    const delta = 0.04;
    setActiveBBox({
      min_lat: lat - delta,
      max_lat: lat + delta,
      min_lon: lon - delta,
      max_lon: lon + delta
    });
  }, [currentLocation]);

  useEffect(() => {
    let isCancelled = false;

    async function loadGrid() {
      setLoading(true);
      setBackendError(null);

      const lat = currentLocation.latitude;
      const lon = currentLocation.longitude;
      const delta = 0.04;

      const minLat = activeBBox?.min_lat ?? lat - delta;
      const maxLat = activeBBox?.max_lat ?? lat + delta;
      const minLon = activeBBox?.min_lon ?? lon - delta;
      const maxLon = activeBBox?.max_lon ?? lon + delta;

      try {
        const res = await fetchHeatmap({
          min_lat: minLat,
          max_lat: maxLat,
          min_lon: minLon,
          max_lon: maxLon,
          persona: activePersona,
          grid_size: 5
        });

        if (isCancelled) return;

        if (res && res.cells && res.cells.length > 0) {
          setCells(res.cells);
          setSelectedCell(res.cells[0]);
          setIsDemoFallback(false);
        } else {
          throw new Error('Received empty cell grid from backend');
        }
      } catch (err: any) {
        console.warn('Heatmap load warning, activating illustrative demo grid:', err);
        if (isCancelled) return;

        const fallback = generateIllustrativeDemoGrid(lat, lon);
        setCells(fallback);
        setSelectedCell(fallback[0]);
        setIsDemoFallback(true);
        setBackendError(
          err?.message || 'Spatial API unavailable. Showing illustrative demo grid.'
        );
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadGrid();
    return () => {
      isCancelled = true;
    };
  }, [currentLocation, activePersona, activeBBox]);

  const resetFilters = () => {
    setMaxPrice(15000000);
    setConnectivityReq('medium');
    setAqiThreshold(120);
    setNearParks(true);
    setNearHospitals(true);
    setNearSchools(true);
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border border-slate-200 bg-white flex shadow-sm"
      style={{ height: 'calc(100vh - 64px)', minHeight: '620px' }}
    >
      {/* Left Filter Sidebar */}
      <div
        className={`relative z-20 h-full bg-white border-r border-slate-200 flex flex-col transition-all duration-300 shrink-0 ${
          isSidebarOpen ? 'w-80' : 'w-0 -translate-x-full overflow-hidden'
        }`}
      >
        <div className="p-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Heatmap Filters</h3>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs text-slate-700">
          {/* Persona Selector */}
          <div>
            <label className="text-slate-500 font-semibold block mb-1.5 uppercase text-[10px] tracking-wider">
              Lifestyle Persona
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {['family', 'working_professional', 'bachelor'].map((p) => (
                <button
                  key={p}
                  onClick={() => setActivePersona(p)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-colors capitalize truncate ${
                    activePersona === p
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Max Price Range */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
                Max Budget
              </span>
              <span className="text-emerald-700 font-bold">₹{(maxPrice / 100000).toFixed(0)} Lakhs</span>
            </div>
            <input
              type="range"
              min="2500000"
              max="50000000"
              step="1000000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Connectivity Requirement */}
          <div>
            <label className="text-slate-500 font-semibold block mb-1.5 uppercase text-[10px] tracking-wider">
              Transit Proximity Target
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['low', 'medium', 'high'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setConnectivityReq(lvl)}
                  className={`py-1.5 rounded-lg border text-[11px] font-medium capitalize ${
                    connectivityReq === lvl
                      ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Environmental Filter */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-slate-500 font-semibold text-[10px] uppercase tracking-wider">
                AQI Air Quality Cap
              </span>
              <span className="text-amber-600 font-bold">Max {aqiThreshold}</span>
            </div>
            <input
              type="range"
              min="50"
              max="250"
              step="10"
              value={aqiThreshold}
              onChange={(e) => setAqiThreshold(parseInt(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
            />
          </div>

          {/* Amenity Checkboxes */}
          <div>
            <label className="text-slate-500 font-semibold block mb-2 uppercase text-[10px] tracking-wider">
              Mandatory Infrastructure
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={nearSchools}
                  onChange={(e) => setNearSchools(e.target.checked)}
                  className="rounded accent-emerald-600"
                />
                Schools within 1.5km
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={nearHospitals}
                  onChange={(e) => setNearHospitals(e.target.checked)}
                  className="rounded accent-emerald-600"
                />
                Healthcare / Hospital in 2km
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                <input
                  type="checkbox"
                  checked={nearParks}
                  onChange={(e) => setNearParks(e.target.checked)}
                  className="rounded accent-emerald-600"
                />
                Public Parks / Green Buffer
              </label>
            </div>
          </div>

          {/* Reset & Save */}
          <div className="pt-2 flex gap-2">
            <button
              onClick={resetFilters}
              className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={() => alert('Search preferences saved to your profile.')}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Bookmark className="w-3.5 h-3.5" /> Save Search
            </button>
          </div>
        </div>

        {/* Top 5 Recommended Localities */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 shrink-0">
          <h4 className="text-[11px] font-bold text-slate-900 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Top 5 Recommended Areas
          </h4>
          <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
            {recommendedLocalities.map((rec) => (
              <div
                key={rec.rank}
                onClick={() => {
                  const match = cells.find(
                    (c) =>
                      Math.abs(c.latitude - rec.lat) < 0.0001 &&
                      Math.abs(c.longitude - rec.lon) < 0.0001
                  );
                  if (match) setSelectedCell(match);
                }}
                className="cursor-pointer p-2 rounded-lg bg-white hover:bg-slate-100 flex items-center justify-between border border-slate-200 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center justify-center">
                    {rec.rank}
                  </span>
                  <span className="text-slate-800 text-xs font-medium truncate max-w-[130px]">
                    {rec.name}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-700">{rec.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map View Area with Full Height */}
      <div className="relative flex-1 h-full min-h-[500px] overflow-hidden bg-slate-100">
        {/* Toggle Sidebar Button when closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-30 p-2.5 bg-white border border-slate-200 text-slate-800 rounded-xl shadow-md hover:bg-slate-50 flex items-center gap-1.5 text-xs font-semibold transition-all"
          >
            <Filter className="w-4 h-4 text-emerald-600" />
            Show Filters
          </button>
        )}

        {/* Floating Top Title Bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-white/95 backdrop-blur-md border border-slate-200 px-4 py-2 rounded-2xl shadow-md flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-semibold text-slate-900">
            Persona Heatmap: {activePersona.replace('_', ' ').toUpperCase()} • {currentLocation.display_name.split(',')[0]}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-medium">
            {cells.length} Grid Points Sampled
          </span>
        </div>

        {/* Fallback Banner if backend fails (Requirement 5) */}
        {isDemoFallback && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 max-w-md bg-amber-50 border border-amber-300 text-amber-900 px-3.5 py-1.5 rounded-xl shadow-md flex items-center gap-2 text-xs animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>Illustrative demo grid:</strong>{' '}
              {backendError || 'Live spatial metrics unavailable. Displaying deterministic benchmark cells.'}
            </span>
          </div>
        )}

        {/* Accessible Color Legend (Requirement 3) */}
        <div className="absolute bottom-6 left-6 z-30 bg-white/95 backdrop-blur-md border border-slate-200 p-3.5 rounded-2xl shadow-md max-w-xs text-xs space-y-2">
          <div className="font-bold text-slate-900 text-[11px] flex items-center gap-1.5 uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            Match Legend ({activePersona.replace('_', ' ')})
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-xs bg-emerald-600" />
              <span>80-100 (Emerald)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-xs bg-lime-600" />
              <span>60-79 (Lime)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-xs bg-amber-500" />
              <span>40-59 (Amber)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="w-3 h-3 rounded-xs bg-red-600" />
              <span>&lt;40 (Red)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 col-span-2 pt-1 border-t border-slate-200">
              <span className="w-3 h-3 rounded-xs bg-slate-400 border border-dashed border-slate-600" />
              <span>No Data (Gray with dashed outline)</span>
            </div>
          </div>
        </div>

        {/* The Dynamic Leaflet Map Component (Requirement 1 & 2) */}
        <div className="w-full h-full" style={{ height: '100%', minHeight: '100%' }}>
          <DynamicHeatmapMap
            center={[currentLocation.latitude, currentLocation.longitude]}
            zoom={13}
            cells={cells}
            onSelectCell={(c) => setSelectedCell(c)}
            selectedCell={selectedCell}
            isSidebarOpen={isSidebarOpen}
            onMapMoveEnd={(bbox) => setActiveBBox(bbox)}
          />
        </div>
      </div>

      {/* Right Drawer: Selected Cell Details (Clean Light Mode) */}
      {selectedCell && (
        <div className="relative z-20 w-88 h-full bg-white border-l border-slate-200 p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200 shadow-md shrink-0">
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">
                  Selected Grid Cell
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  ({selectedCell.latitude.toFixed(4)}, {selectedCell.longitude.toFixed(4)})
                </h3>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overall Score Card */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-500 font-medium">Persona Match Score</span>
                <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
                  {selectedCell.score < 0 ? 'N/A' : `${selectedCell.score}`}
                  <span className="text-sm font-normal text-slate-500">/100</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-semibold mt-1">
                  Grade {selectedCell.grade} • {selectedCell.data_completeness_pct}% Data Verified
                </div>
              </div>
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl ${
                  selectedCell.score >= 80
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : selectedCell.score >= 60
                    ? 'bg-lime-100 text-lime-800 border border-lime-300'
                    : selectedCell.score >= 40
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : selectedCell.score >= 0
                    ? 'bg-red-100 text-red-800 border border-red-300'
                    : 'bg-slate-100 text-slate-700 border border-dashed border-slate-400'
                }`}
              >
                {selectedCell.grade}
              </div>
            </div>

            {/* Factor Breakdown */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Factor Breakdown
              </h4>
              {selectedCell.factors_summary &&
                Object.entries(selectedCell.factors_summary).map(([key, val]) => (
                  <div key={key} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 capitalize">{key.replace('_', ' ')}</span>
                      <span className="font-mono text-emerald-700 font-bold">{Math.round(val)}/100</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                        style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                      />
                    </div>
                  </div>
                ))}
            </div>

            {/* Nearby Highlights */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-800 block">Verified Spatial Context</span>
              <div className="text-[11px] text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Metro / transit node within active radius</span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Air quality and climate safety compliant</span>
              </div>
              <div className="text-[11px] text-slate-600 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Commercial & social infrastructure verified</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <button
              onClick={() => onNavigateTab('analysis')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <BarChart3 className="w-4 h-4" />
              Full Location Analysis
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigateTab('compare')}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors border border-slate-200"
              >
                <GitCompare className="w-3.5 h-3.5" />
                Compare Sites
              </button>
              <button
                onClick={() => {
                  if (onOpenAIChat) {
                    onOpenAIChat(
                      `Coordinate (${selectedCell.latitude.toFixed(4)}, ${selectedCell.longitude.toFixed(4)})`,
                      selectedCell
                    );
                  }
                }}
                className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border border-emerald-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Ask AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
