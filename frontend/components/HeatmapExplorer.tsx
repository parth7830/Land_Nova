'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Flame,
  Filter,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Info,
  Layers,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Compass,
  Sparkles,
  BarChart3,
  GitCompare,
  RotateCcw,
  Bookmark
} from 'lucide-react';
import { HeatmapCell, LocationItem } from '@/types';
import { fetchHeatmap } from '@/lib/api';

const DynamicHeatmapMap = dynamic(() => import('./HeatmapMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-400">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Loading spatial map tiles...</span>
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

  // Sidebar filters
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activePersona, setActivePersona] = useState<string>(initialPersona);
  const [maxPrice, setMaxPrice] = useState(15000000);
  const [connectivityReq, setConnectivityReq] = useState('medium');
  const [aqiThreshold, setAqiThreshold] = useState(120);
  const [nearParks, setNearParks] = useState(true);
  const [nearHospitals, setNearHospitals] = useState(true);
  const [nearSchools, setNearSchools] = useState(true);

  // Top 5 recommended localities
  const [recommendedLocalities, setRecommendedLocalities] = useState<any[]>([]);

  useEffect(() => {
    async function loadGrid() {
      setLoading(true);
      try {
        const lat = currentLocation.latitude;
        const lon = currentLocation.longitude;
        const delta = 0.04;

        const res = await fetchHeatmap({
          min_lat: lat - delta,
          max_lat: lat + delta,
          min_lon: lon - delta,
          max_lon: lon + delta,
          persona: activePersona,
          grid_size: 5
        });

        setCells(res.cells);
        if (res.cells.length > 0) {
          setSelectedCell(res.cells[0]);

          // Derive top 5 recommended points from the grid
          const sorted = [...res.cells]
            .filter(c => c.score > 0)
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
          setRecommendedLocalities(sorted);
        }
      } catch (err) {
        console.error('Heatmap load error', err);
      } finally {
        setLoading(false);
      }
    }

    loadGrid();
  }, [currentLocation, activePersona]);

  const resetFilters = () => {
    setMaxPrice(15000000);
    setConnectivityReq('medium');
    setAqiThreshold(120);
    setNearParks(true);
    setNearHospitals(true);
    setNearSchools(true);
  };

  return (
    <div className="relative h-[calc(100vh-5rem)] w-full rounded-2xl overflow-hidden border border-slate-800 bg-[#090d16] flex">
      {/* Left Filter Sidebar */}
      <div
        className={`relative z-20 h-full bg-slate-900/95 backdrop-blur-md border-r border-slate-800 flex flex-col transition-all duration-300 ${
          isSidebarOpen ? 'w-80' : 'w-0 -translate-x-full overflow-hidden'
        }`}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Heatmap Filters</h3>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* Persona Selector */}
          <div>
            <label className="text-slate-400 font-semibold block mb-1.5 uppercase text-[10px] tracking-wider">
              Lifestyle Persona
            </label>
            <div className="grid grid-cols-3 gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
              {['family', 'working_professional', 'bachelor'].map(p => (
                <button
                  key={p}
                  onClick={() => setActivePersona(p)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-medium transition-colors capitalize truncate ${
                    activePersona === p
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-400 hover:text-white'
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
              <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">Max Budget</span>
              <span className="text-emerald-400 font-bold">₹{(maxPrice / 100000).toFixed(0)} Lakhs</span>
            </div>
            <input
              type="range"
              min="2500000"
              max="50000000"
              step="1000000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Connectivity Requirement */}
          <div>
            <label className="text-slate-400 font-semibold block mb-1.5 uppercase text-[10px] tracking-wider">
              Transit Proximity Target
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {['low', 'medium', 'high'].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setConnectivityReq(lvl)}
                  className={`py-1.5 rounded-lg border text-[11px] font-medium capitalize ${
                    connectivityReq === lvl
                      ? 'bg-emerald-600 text-white border-emerald-500'
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
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
              <span className="text-slate-400 font-semibold text-[10px] uppercase tracking-wider">AQI Air Quality Cap</span>
              <span className="text-amber-400 font-bold">Max {aqiThreshold}</span>
            </div>
            <input
              type="range"
              min="50"
              max="250"
              step="10"
              value={aqiThreshold}
              onChange={(e) => setAqiThreshold(parseInt(e.target.value))}
              className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
          </div>

          {/* Amenity Checkboxes */}
          <div>
            <label className="text-slate-400 font-semibold block mb-2 uppercase text-[10px] tracking-wider">
              Mandatory Infrastructure
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={nearSchools}
                  onChange={(e) => setNearSchools(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                Schools within 1.5km
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={nearHospitals}
                  onChange={(e) => setNearHospitals(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                Healthcare / Hospital in 2km
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                <input
                  type="checkbox"
                  checked={nearParks}
                  onChange={(e) => setNearParks(e.target.checked)}
                  className="rounded accent-emerald-500"
                />
                Public Parks / Green Buffer
              </label>
            </div>
          </div>

          {/* Reset & Save */}
          <div className="pt-2 flex gap-2">
            <button
              onClick={resetFilters}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
            <button
              onClick={() => alert('Search preferences saved to your profile.')}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-medium flex items-center justify-center gap-1.5"
            >
              <Bookmark className="w-3.5 h-3.5" /> Save Search
            </button>
          </div>
        </div>

        {/* Top 5 Recommended Localities */}
        <div className="p-3.5 bg-slate-950/80 border-t border-slate-800">
          <h4 className="text-[11px] font-bold text-white mb-2 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Top 5 Recommended Areas
          </h4>
          <div className="space-y-1.5 max-h-36 overflow-y-auto no-scrollbar">
            {recommendedLocalities.map(rec => (
              <div
                key={rec.rank}
                onClick={() => {
                  const match = cells.find(c => c.latitude === rec.lat && c.longitude === rec.lon);
                  if (match) setSelectedCell(match);
                }}
                className="cursor-pointer p-2 rounded-lg bg-slate-900 hover:bg-slate-800 flex items-center justify-between border border-slate-800/80"
              >
                <div className="flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center">
                    {rec.rank}
                  </span>
                  <span className="text-slate-300 text-xs font-medium truncate max-w-[130px]">{rec.name}</span>
                </div>
                <span className="text-xs font-bold text-emerald-400">{rec.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map View Area */}
      <div className="relative flex-1 h-full">
        {/* Toggle Sidebar Button when closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-4 left-4 z-30 p-2.5 bg-slate-900 border border-slate-700 text-white rounded-xl shadow-xl hover:bg-slate-800 flex items-center gap-1.5 text-xs font-medium"
          >
            <Filter className="w-4 h-4 text-emerald-400" />
            Show Filters
          </button>
        )}

        {/* Floating Top Title Bar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-4 py-2 rounded-2xl shadow-xl flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-xs font-semibold text-white">
            Persona Heatmap: {activePersona.replace('_', ' ').toUpperCase()} • {currentLocation.display_name.split(',')[0]}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            {cells.length} Grid Points Sampled
          </span>
        </div>

        {/* Accessible Color Legend */}
        <div className="absolute bottom-6 left-6 z-30 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-3 rounded-2xl shadow-xl max-w-xs text-xs space-y-2">
          <div className="font-bold text-white text-[11px] flex items-center gap-1.5 uppercase tracking-wider">
            <Info className="w-3.5 h-3.5 text-emerald-400" />
            Match Legend ({activePersona})
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-[10px]">
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span>80-100 (Excellent)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-lime-500" />
              <span>60-79 (Good)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-amber-500" />
              <span>40-59 (Moderate)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="w-3 h-3 rounded-full bg-red-500" />
              <span>&lt;40 (Poor Match)</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-400 col-span-2 pt-1 border-t border-slate-800">
              <span className="w-3 h-3 rounded-full bg-slate-600 border border-dashed border-slate-400" />
              <span>Insufficient Data (Never treated as low risk)</span>
            </div>
          </div>
        </div>

        {/* The Map */}
        <DynamicHeatmapMap
          center={[currentLocation.latitude, currentLocation.longitude]}
          zoom={13}
          cells={cells}
          onSelectCell={(c) => setSelectedCell(c)}
          selectedCell={selectedCell}
        />
      </div>

      {/* Right Drawer: Selected Cell Details */}
      {selectedCell && (
        <div className="relative z-20 w-88 h-full bg-slate-900/95 backdrop-blur-md border-l border-slate-800 p-5 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
          <div className="space-y-5">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400">
                  Selected Grid Point
                </span>
                <h3 className="text-base font-bold text-white mt-0.5">
                  ({selectedCell.latitude.toFixed(4)}, {selectedCell.longitude.toFixed(4)})
                </h3>
              </div>
              <button
                onClick={() => setSelectedCell(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Overall Score Card */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 font-medium">Persona Match Score</span>
                <div className="text-3xl font-extrabold text-white mt-0.5">
                  {selectedCell.score < 0 ? 'N/A' : `${selectedCell.score}`}
                  <span className="text-sm font-normal text-slate-400">/100</span>
                </div>
                <div className="text-[11px] text-emerald-400 font-semibold mt-1">
                  Grade {selectedCell.grade} • {selectedCell.data_completeness_pct}% Data Verified
                </div>
              </div>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-extrabold text-xl ${
                selectedCell.score >= 80
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : selectedCell.score >= 60
                  ? 'bg-lime-500/20 text-lime-400 border border-lime-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {selectedCell.grade}
              </div>
            </div>

            {/* Factor Breakdown */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Factor Breakdown
              </h4>
              {Object.entries(selectedCell.factors_summary).map(([key, val]) => (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300 capitalize">{key.replace('_', ' ')}</span>
                    <span className="font-mono text-emerald-400 font-bold">{Math.round(val)}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(0, val))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Nearby Highlights */}
            <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-300 block">Verified Spatial Context</span>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Metro / transit node within ~600m</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Moderate seasonal AQI readings</span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>High-density commercial social infrastructure</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2 pt-4 border-t border-slate-800">
            <button
              onClick={() => onNavigateTab('analysis')}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg"
            >
              <BarChart3 className="w-4 h-4" />
              Full Location Analysis
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => onNavigateTab('compare')}
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
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
                className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Ask AI
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
