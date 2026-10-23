'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Search,
  MapPin,
  Wind,
  Droplets,
  Activity,
  Layers,
  Sparkles,
  HardHat,
  Clock
} from 'lucide-react';
import {
  LocationItem,
  AmenitiesResponse,
  WeatherClimateResponse,
  LivabilityResponse
} from '@/types';

// Dynamically import MapComponent with SSR turned off
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[420px] bg-slate-100 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500">
      <div className="flex items-center gap-2">
        <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <span>Loading Interactive Map...</span>
      </div>
    </div>
  ),
});

interface DashboardProps {
  currentLocation: LocationItem;
  onSelectLocation: (loc: LocationItem) => void;
  amenities: AmenitiesResponse | null;
  weather: WeatherClimateResponse | null;
  livability: LivabilityResponse | null;
  loading: boolean;
  onNavigateTab: (tab: string) => void;
  onSearch: (q: string) => Promise<LocationItem[]>;
}

export default function DashboardView({
  currentLocation,
  onSelectLocation,
  amenities,
  weather,
  livability,
  loading,
  onNavigateTab,
  onSearch,
}: DashboardProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const presetLocations: { label: string; id: string; lat: number; lon: number; city: string }[] = [
    { label: 'Sector 62, Noida', id: 'sector-62-noida', lat: 28.6280, lon: 77.3649, city: 'Noida' },
    { label: 'Connaught Place', id: 'connaught-place-delhi', lat: 28.6315, lon: 77.2167, city: 'New Delhi' },
    { label: 'Indiranagar', id: 'indiranagar-bengaluru', lat: 12.9784, lon: 77.6408, city: 'Bengaluru' },
    { label: 'BKC', id: 'bkc-mumbai', lat: 19.0657, lon: 77.8681, city: 'Mumbai' },
    { label: 'HITEC City', id: 'hitec-city-hyderabad', lat: 17.4435, lon: 78.3772, city: 'Hyderabad' },
  ];

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await onSearch(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
    setShowDropdown(true);
  };

  const handleSelectResult = (loc: LocationItem) => {
    onSelectLocation(loc);
    setShowDropdown(false);
    setSearchQuery('');
  };

  const counts = amenities?.counts_by_category || {
    transit: 0,
    healthcare: 0,
    education: 0,
    commercial: 0,
    recreation: 0,
    emergency: 0
  };

  const aqiColor = weather?.air_quality?.status_color || '#059669';

  return (
    <div className="space-y-6">
      {/* Top Search & Presets Bar */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl relative shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (e.target.value.length >= 2) {
                onSearch(e.target.value).then((res) => {
                  setSearchResults(res);
                  setShowDropdown(true);
                });
              } else {
                setShowDropdown(false);
              }
            }}
            placeholder="Search address, Indian locality (e.g., Sector 62 Noida, Connaught Place, Indiranagar)..."
            className="w-full pl-12 pr-28 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all"
          />
          <button
            type="submit"
            disabled={isSearching}
            className="absolute right-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            {isSearching ? 'Searching...' : 'Explore'}
          </button>
        </form>

        {/* Search Results Dropdown */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute left-4 right-4 top-16 z-50 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto">
            {searchResults.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectResult(item)}
                className="w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-100 last:border-0 flex items-center justify-between text-xs transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-slate-800 block truncate">
                      {item.display_name}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {item.city || item.country} • Lat: {item.latitude.toFixed(4)}, Lon: {item.longitude.toFixed(4)}
                    </span>
                  </div>
                </div>
                {item.is_demo && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                    Verified Hub
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Quick Location Pills */}
        <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar pt-1 text-xs">
          <span className="text-slate-500 font-medium shrink-0 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" /> Signature Hubs:
          </span>
          {presetLocations.map((p) => (
            <button
              key={p.id}
              onClick={() =>
                onSelectLocation({
                  id: p.id,
                  display_name: `${p.label}, ${p.city}, India`,
                  latitude: p.lat,
                  longitude: p.lon,
                  city: p.city,
                  country: 'India',
                  is_demo: true,
                })
              }
              className={`px-3 py-1 rounded-lg border text-xs font-medium shrink-0 transition-colors ${
                currentLocation.id === p.id
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Map & Primary Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Interactive Map & Filter Tabs (7 cols) */}
        <div className="lg:col-span-7 space-y-3 flex flex-col">
          {/* Map Category Filters */}
          <div className="flex items-center justify-between bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs shadow-xs">
            <span className="text-slate-500 font-medium flex items-center gap-1">
              <Layers className="w-3.5 h-3.5 text-slate-400" /> Filter Amenities:
            </span>
            <div className="flex items-center gap-1">
              {[
                { id: 'all', label: 'All', count: amenities?.total_count || 0 },
                { id: 'transit', label: 'Transit', count: counts.transit },
                { id: 'healthcare', label: 'Health', count: counts.healthcare },
                { id: 'education', label: 'Schools', count: counts.education },
                { id: 'commercial', label: 'Retail', count: counts.commercial },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                    activeCategory === cat.id
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {cat.label} ({cat.count})
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Map Box */}
          <div className="h-[460px] rounded-xl overflow-hidden border border-slate-200 shadow-sm">
            <MapComponent
              latitude={currentLocation.latitude}
              longitude={currentLocation.longitude}
              locationName={currentLocation.display_name}
              amenities={amenities?.items || []}
              activeCategory={activeCategory}
            />
          </div>
        </div>

        {/* Right Side: Key Metrics & Quick Actions (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Main Score Card */}
          <div className="bg-white border border-slate-200 p-5 rounded-2xl relative overflow-hidden shadow-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                  Deterministic Score
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5 truncate max-w-[220px]">
                  {currentLocation.display_name.split(',')[0]}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {currentLocation.city || currentLocation.country}
                </p>
              </div>

              {/* Big Score Metric */}
              <div className="text-right">
                <div className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-baseline justify-end gap-1">
                  <span>{livability?.overall_score || 78.4}</span>
                  <span className="text-sm font-semibold text-slate-400">/100</span>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block mt-1">
                  Grade {livability?.grade || 'A'}
                </span>
              </div>
            </div>

            {/* Data Completeness & Coverage Bar */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                <span>Data Completeness</span>
                <span className="font-semibold text-slate-800">
                  {livability?.data_completeness_pct || 100}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${livability?.data_completeness_pct || 100}%` }}
                />
              </div>
            </div>

            {/* Quick Dimension Pill Highlights */}
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Rapid Transit</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {counts.transit} Mapped Nodes
                </span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[11px]">Healthcare & Edu</span>
                <span className="font-semibold text-slate-800 mt-0.5 block">
                  {counts.healthcare + counts.education} Facilities
                </span>
              </div>
            </div>
          </div>

          {/* Environmental & Climate Tile */}
          <div className="grid grid-cols-2 gap-3">
            {/* Air Quality Tile */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">US AQI</span>
                <Wind className="w-4 h-4 text-amber-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {weather?.air_quality?.us_aqi || 95}
                </span>
                <span
                  className="text-[11px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: `${aqiColor}15`, color: aqiColor }}
                >
                  {weather?.air_quality?.category_label || 'Moderate'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                PM2.5: {weather?.air_quality?.pm2_5 || 32} µg/m³
              </p>
            </div>

            {/* Flood & Elevation Tile */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">Flood Resilience</span>
                <Droplets className="w-4 h-4 text-sky-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold text-slate-900">
                  {weather?.climate_risk?.elevation_meters || 180}m
                </span>
                <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  {weather?.climate_risk?.flood_risk_level || 'Low'} Risk
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Copernicus DEM model</p>
            </div>
          </div>

          {/* Action Quick Shortcuts */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => onNavigateTab('analysis')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-emerald-400 text-center transition-all group shadow-xs"
            >
              <Activity className="w-4 h-4 text-emerald-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-slate-800">Deep Analysis</span>
              <span className="text-[10px] text-slate-400">Factor breakdown</span>
            </button>

            <button
              onClick={() => onNavigateTab('advisor')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-amber-400 text-center transition-all group shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-amber-500 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-slate-800">AI Advisor</span>
              <span className="text-[10px] text-slate-400">Ask due-diligence</span>
            </button>

            <button
              onClick={() => onNavigateTab('builder')}
              className="flex flex-col items-center justify-center p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 hover:border-teal-400 text-center transition-all group shadow-xs"
            >
              <HardHat className="w-4 h-4 text-teal-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-semibold text-slate-800">Builder Mode</span>
              <span className="text-[10px] text-slate-400">Site feasibility</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
