'use client';

import React, { useState, useMemo } from 'react';
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Info,
  RotateCcw,
  Sparkles,
  MapPin,
  Clock,
  ShieldCheck,
  Wind,
  Droplets,
  Volume2,
  Building,
  Home,
  Trees,
  Check,
  X
} from 'lucide-react';
import { BuyerPreferences } from '@/types';

interface BuyerPreferencesPanelProps {
  preferences: BuyerPreferences;
  onUpdatePreferences: (updated: Partial<BuyerPreferences>) => void;
  onGenerate: () => void;
  onReset: () => void;
  weightsApplied?: Record<string, number>;
  loading?: boolean;
}

export default function BuyerPreferencesPanel({
  preferences,
  onUpdatePreferences,
  onGenerate,
  onReset,
  weightsApplied,
  loading = false
}: BuyerPreferencesPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showFormulaPopover, setShowFormulaPopover] = useState(false);

  // Property Types
  const propertyTypes = ['Apartment', 'Villa', 'Plot', 'Commercial'];

  // Amenities list
  const amenitiesList = [
    'Schools',
    'Hospitals',
    'Parks',
    'Metro Connectivity',
    'Malls',
    'Sports Facilities',
    'Workplaces',
    'Markets'
  ];

  // Languages list
  const languages = ['Hindi', 'English', 'Punjabi', 'Bengali', 'Marathi', 'Tamil', 'Telugu'];

  const togglePropertyType = (type: string) => {
    const current = preferences.property_types || [];
    if (current.includes(type)) {
      if (current.length > 1) {
        onUpdatePreferences({ property_types: current.filter((t) => t !== type) });
      }
    } else {
      onUpdatePreferences({ property_types: [...current, type] });
    }
  };

  const toggleAmenity = (amenity: string) => {
    const current = preferences.preferred_amenities || [];
    if (current.includes(amenity)) {
      onUpdatePreferences({ preferred_amenities: current.filter((a) => a !== amenity) });
    } else {
      onUpdatePreferences({ preferred_amenities: [...current, amenity] });
    }
  };

  const formatPrice = (val: number) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(1)} Cr`;
    }
    return `₹${(val / 100000).toFixed(0)} Lakhs`;
  };

  // Live calculated weights based on current toggle state
  const computedWeights = useMemo(() => {
    if (weightsApplied && Object.keys(weightsApplied).length > 0) {
      return weightsApplied;
    }
    let w_conn = 0.25;
    let w_amen = 0.25;
    let w_env = 0.20;
    let w_safe = 0.15;
    let w_clim = 0.15;

    if (preferences.preferred_amenities.includes('Metro Connectivity')) w_conn += 0.10;
    if (preferences.preferred_amenities.some((a) => ['Schools', 'Hospitals', 'Parks'].includes(a))) w_amen += 0.10;
    if (preferences.good_aqi) w_env += 0.08;
    if (preferences.low_noise) w_env += 0.05;
    if (preferences.low_crime) w_safe += 0.10;
    if (preferences.max_commute_minutes < 40) w_conn += 0.10;

    const total = w_conn + w_amen + w_env + w_safe + w_clim;
    return {
      connectivity: Number(((w_conn / total) * 100).toFixed(1)),
      amenities: Number(((w_amen / total) * 100).toFixed(1)),
      environment: Number(((w_env / total) * 100).toFixed(1)),
      safety: Number(((w_safe / total) * 100).toFixed(1)),
      climate_flood: Number(((w_clim / total) * 100).toFixed(1))
    };
  }, [preferences, weightsApplied]);

  if (isCollapsed) {
    return (
      <div className="absolute top-15 left-3 z-30">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 sm:px-3 sm:py-2 bg-white/95 backdrop-blur-md border border-slate-200/90 rounded-xl shadow-md text-slate-700 hover:text-emerald-700 hover:border-emerald-300 transition-all flex items-center gap-1.5 font-bold text-xs cursor-pointer"
          title="Open Preferences"
        >
          <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Preferences</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Mobile/Tablet Backdrop overlay */}
      <div
        onClick={() => setIsCollapsed(true)}
        className="fixed inset-0 bg-black/35 backdrop-blur-xs z-40 lg:hidden animate-in fade-in"
      />

      <aside className="fixed inset-y-0 left-0 z-50 w-80 sm:w-88 bg-white border-r border-slate-200/90 shadow-2xl lg:relative lg:inset-auto lg:z-20 lg:shadow-sm flex flex-col h-full overflow-hidden transition-all duration-300 ease-in-out animate-in slide-in-from-left-5">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Your Preferences</h2>
            <p className="text-[11px] text-slate-500 font-medium">Fine-tune location intelligence</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowFormulaPopover(!showFormulaPopover)}
            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition"
            title="How your score is calculated"
          >
            <Info className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-md transition"
            title="Collapse panel"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Formula Popover */}
      {showFormulaPopover && (
        <div className="m-3 p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-xl text-xs text-slate-800 shadow-md relative animate-in fade-in zoom-in-95">
          <button
            onClick={() => setShowFormulaPopover(false)}
            className="absolute top-2 right-2 text-emerald-700 hover:text-emerald-900"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mathematical Score Weights</span>
          </div>
          <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">
            Every preference selected dynamically boosts its underlying pillar weight. All weights are mathematically normalized to sum to 100%:
          </p>
          <div className="space-y-1 font-mono text-[10px]">
            <div className="flex justify-between text-slate-700">
              <span>Connectivity:</span> <span className="font-semibold text-emerald-700">{computedWeights.connectivity}%</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Amenities:</span> <span className="font-semibold text-emerald-700">{computedWeights.amenities}%</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Environment:</span> <span className="font-semibold text-emerald-700">{computedWeights.environment}%</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Safety (Proxy):</span> <span className="font-semibold text-emerald-700">{computedWeights.safety}%</span>
            </div>
            <div className="flex justify-between text-slate-700">
              <span>Climate/Flood:</span> <span className="font-semibold text-emerald-700">{computedWeights.climate_flood}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-slate-800 text-xs">
        {/* 1. Property Type Chips */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-2">Property Type</label>
          <div className="grid grid-cols-2 gap-1.5">
            {propertyTypes.map((type) => {
              const selected = preferences.property_types?.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => togglePropertyType(type)}
                  className={`px-3 py-2 rounded-lg border text-xs font-medium flex items-center justify-between transition-all ${
                    selected
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-2xs font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span>{type}</span>
                  {selected && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Budget Range Slider */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-800">Budget Range</label>
            <span className="text-[11px] font-bold text-emerald-700 font-mono">
              {formatPrice(preferences.min_budget)} – {formatPrice(preferences.max_budget)}
            </span>
          </div>
          <input
            type="range"
            min={2500000}
            max={40000000}
            step={500000}
            value={preferences.max_budget}
            onChange={(e) => onUpdatePreferences({ max_budget: Number(e.target.value) })}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>₹25L</span>
            <span>₹2Cr</span>
            <span>₹4Cr+</span>
          </div>
        </div>

        {/* 3. Preferred Amenities Chips */}
        <div>
          <label className="block text-xs font-semibold text-slate-800 mb-2">Preferred Amenities</label>
          <div className="flex flex-wrap gap-1.5">
            {amenitiesList.map((amenity) => {
              const selected = preferences.preferred_amenities?.includes(amenity);
              return (
                <button
                  key={amenity}
                  type="button"
                  onClick={() => toggleAmenity(amenity)}
                  className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-medium transition-all ${
                    selected
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs font-semibold'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {amenity}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Environment & Health */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
          <label className="block text-xs font-semibold text-slate-800 mb-1">Environment & Health</label>
          
          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={preferences.good_aqi}
              onChange={(e) => onUpdatePreferences({ good_aqi: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <Wind className="w-3.5 h-3.5 text-emerald-600" />
            <span>Good Air Quality (AQI &lt; 100)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={preferences.good_water}
              onChange={(e) => onUpdatePreferences({ good_water: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <Droplets className="w-3.5 h-3.5 text-blue-500" />
            <span>Good Water Quality (TDS &lt; 400)</span>
          </label>

          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={preferences.low_noise}
              onChange={(e) => onUpdatePreferences({ low_noise: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Low Ambient Noise Levels</span>
          </label>
        </div>

        {/* 5. Safety & Community */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
          <label className="block text-xs font-semibold text-slate-800">Safety & Community</label>
          
          <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700 hover:text-slate-900">
            <input
              type="checkbox"
              checked={preferences.low_crime}
              onChange={(e) => onUpdatePreferences({ low_crime: e.target.checked })}
              className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
            />
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Low Crime Rate (High Police & Emergency Coverage)</span>
          </label>

          <div>
            <span className="text-[10px] text-slate-500 block mb-1">Preferred Local Language</span>
            <select
              value={preferences.local_language}
              onChange={(e) => onUpdatePreferences({ local_language: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              {languages.map((lang) => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 6. Commute Preferences */}
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Max Commute Time</span>
            </label>
            <span className="text-[11px] font-bold text-emerald-700 font-mono">
              {preferences.max_commute_minutes} mins
            </span>
          </div>

          <input
            type="range"
            min={15}
            max={120}
            step={5}
            value={preferences.max_commute_minutes}
            onChange={(e) => onUpdatePreferences({ max_commute_minutes: Number(e.target.value) })}
            className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
          />

          <div>
            <span className="text-[10px] text-slate-500 block mb-1">Workplace Address / Hub</span>
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={preferences.workplace_address}
                onChange={(e) => onUpdatePreferences({ workplace_address: e.target.value })}
                placeholder="e.g. Sector 62, Noida"
                className="w-full text-xs text-slate-700 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer CTA Buttons */}
      <div className="p-4 border-t border-slate-100 bg-white space-y-2">
        <button
          onClick={onGenerate}
          disabled={loading}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold text-xs transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Generating Heatmap...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Heat Map</span>
            </>
          )}
        </button>

        <button
          onClick={onReset}
          className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl font-medium text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Filters</span>
        </button>
      </div>
    </aside>
    </>
  );
}
