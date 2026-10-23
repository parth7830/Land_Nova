'use client';

import React, { useState } from 'react';
import {
  X,
  Wind,
  Droplets,
  ShieldAlert,
  Train,
  GraduationCap,
  Building2,
  ShoppingBag,
  Trees,
  Volume2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Info,
  Calendar,
  Layers,
  Sparkles,
  Home
} from 'lucide-react';
import { BuyerSector, BuyerMetricDetail } from '@/types';

interface AreaAnalysisDrawerProps {
  sector: BuyerSector | null;
  onClose: () => void;
  onViewProperties: (sectorId: string) => void;
  onOpenChecklist?: (sectorId: string) => void;
  onOpenAffordability?: (sector: BuyerSector) => void;
  onOpenWalkability?: (sector: BuyerSector) => void;
  onOpenFloodClimate?: (sector: BuyerSector) => void;
  onOpenWaterfall?: (sector: BuyerSector) => void;
  onOpenCompare?: () => void;
  onOpenWeights?: () => void;
  onOpenShare?: () => void;
}

export default function AreaAnalysisDrawer({
  sector,
  onClose,
  onViewProperties,
  onOpenChecklist,
  onOpenAffordability,
  onOpenWalkability,
  onOpenFloodClimate,
  onOpenWaterfall,
  onOpenCompare,
  onOpenWeights,
  onOpenShare
}: AreaAnalysisDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'amenities' | 'environment' | 'safety'>('overview');
  const [expandedMetric, setExpandedMetric] = useState<string | null>(null);

  if (!sector) return null;

  const toggleExpand = (key: string) => {
    setExpandedMetric(expandedMetric === key ? null : key);
  };

  // Helper for metric icons
  const getMetricIcon = (key: string) => {
    switch (key) {
      case 'aqi': return <Wind className="w-4 h-4 text-emerald-600" />;
      case 'water_quality': return <Droplets className="w-4 h-4 text-blue-500" />;
      case 'crime_rate': return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      case 'connectivity': return <Train className="w-4 h-4 text-emerald-600" />;
      case 'schools': return <GraduationCap className="w-4 h-4 text-indigo-500" />;
      case 'hospitals': return <Building2 className="w-4 h-4 text-rose-500" />;
      case 'markets': return <ShoppingBag className="w-4 h-4 text-amber-500" />;
      case 'parks': return <Trees className="w-4 h-4 text-emerald-600" />;
      case 'noise_level': return <Volume2 className="w-4 h-4 text-violet-500" />;
      default: return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  // Group metrics by tab
  const getMetricsForTab = () => {
    const all = sector.metrics || {};
    if (activeTab === 'overview') {
      return ['connectivity', 'aqi', 'crime_rate', 'schools', 'markets'];
    }
    if (activeTab === 'amenities') {
      return ['schools', 'hospitals', 'markets', 'parks', 'connectivity'];
    }
    if (activeTab === 'environment') {
      return ['aqi', 'water_quality', 'noise_level', 'parks'];
    }
    if (activeTab === 'safety') {
      return ['crime_rate', 'hospitals', 'connectivity'];
    }
    return Object.keys(all);
  };

  // Circular Score ring parameters
  const score = sector.overall_score;
  const radius = 32;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <aside className="w-84 sm:w-96 shrink-0 bg-white border-l border-slate-200/90 shadow-lg flex flex-col h-full overflow-hidden transition-all duration-200 z-30">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/80">
        <div className="flex items-center gap-3">
          {/* Circular Score Ring */}
          <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
            <svg className="w-16 h-16 transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="text-slate-200"
                strokeWidth="5"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                className={`${
                  score >= 80
                    ? 'text-emerald-500'
                    : score >= 60
                    ? 'text-lime-500'
                    : score >= 40
                    ? 'text-amber-500'
                    : 'text-rose-500'
                } transition-all duration-1000 ease-out`}
                strokeWidth="5"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-base font-extrabold text-slate-900 leading-none">{Math.round(score)}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">/ 100</span>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight leading-snug">{sector.name}</h2>
            <p className="text-xs text-slate-500 font-medium">{sector.city}, Uttar Pradesh</p>
            <span
              className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                score >= 80
                  ? 'bg-emerald-100 text-emerald-800'
                  : score >= 60
                  ? 'bg-lime-100 text-lime-800'
                  : score >= 40
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {sector.grade_label}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-md transition"
          title="Close analysis"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-100 px-4 bg-white text-xs font-semibold">
        {(['overview', 'amenities', 'environment', 'safety'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`py-2.5 px-3 capitalize border-b-2 transition-all cursor-pointer ${
              activeTab === tab
                ? 'border-emerald-600 text-emerald-700 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Metric Rows */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {/* Quick Highlights / Bullet points */}
        {activeTab === 'overview' && (
          <div className="mb-3 p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-xs">
            <span className="font-bold text-slate-800 block mb-1.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Location Highlights</span>
            </span>
            <ul className="space-y-1 text-slate-600 text-[11px]">
              {sector.reasons.map((r, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Metric Rows */}
        {getMetricsForTab().map((key) => {
          const metric = sector.metrics[key];
          if (!metric) return null;
          const isExpanded = expandedMetric === key;

          return (
            <div
              key={key}
              className="border border-slate-200/80 rounded-xl overflow-hidden bg-white hover:border-slate-300 transition-all shadow-2xs"
            >
              {/* Row header */}
              <button
                type="button"
                onClick={() => toggleExpand(key)}
                className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-50/60 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                    {getMetricIcon(key)}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 block truncate">{metric.title}</span>
                    <span className="text-[11px] text-slate-500 block truncate">{metric.value}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      metric.badge_color === 'emerald'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : metric.badge_color === 'lime'
                        ? 'bg-lime-50 text-lime-700 border border-lime-200'
                        : metric.badge_color === 'amber'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {metric.badge}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Data Provenance & Formula */}
              {isExpanded && (
                <div className="p-3 bg-slate-50 border-t border-slate-100 text-xs text-slate-700 space-y-2 animate-in fade-in">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Source</span>
                      <span className="font-semibold text-slate-800">{metric.source}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Confidence</span>
                      <span
                        className={`inline-block px-1.5 py-0.2 rounded text-[10px] font-bold ${
                          metric.confidence === 'High'
                            ? 'bg-emerald-100 text-emerald-800'
                            : metric.confidence === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        {metric.confidence}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Data Nature</span>
                      <span className="font-medium text-slate-700">
                        {metric.is_proxy ? '⚠️ Transparent Proxy' : '✅ Verified Measured'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Timestamp</span>
                      <span className="font-medium text-slate-700">{metric.timestamp}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold mb-0.5">Scoring Formula</span>
                    <p className="text-[11px] text-slate-600 font-mono bg-white p-2 rounded border border-slate-200 leading-relaxed">
                      {metric.formula}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* Price & Rent Overview Card */}
        <div className="p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl space-y-2">
          <span className="text-xs font-bold text-emerald-950 flex items-center justify-between">
            <span>Market Benchmark (Demo Data)</span>
            <span className="text-[10px] bg-emerald-200/70 text-emerald-900 px-1.5 py-0.5 rounded font-mono">Sample Index</span>
          </span>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Avg Buying Rate</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">₹{sector.avg_price_sqft.toLocaleString()} / sq.ft</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Typical 2BHK Rent</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">₹{sector.avg_rent_2bhk.toLocaleString()} / mo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Action CTAs */}
      <div className="p-4 border-t border-slate-100 bg-white space-y-2">
        <button
          onClick={() => onViewProperties(sector.id)}
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>View Properties in {sector.name} ({sector.property_count})</span>
        </button>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {onOpenChecklist && (
            <button
              onClick={() => onOpenChecklist(sector.id)}
              className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-[11px] transition text-center cursor-pointer"
            >
              📋 Site Checklist
            </button>
          )}
          {onOpenAffordability && (
            <button
              onClick={() => onOpenAffordability(sector)}
              className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-[11px] transition text-center cursor-pointer"
            >
              💰 EMI Calculator
            </button>
          )}
          {onOpenWalkability && (
            <button
              onClick={() => onOpenWalkability(sector)}
              className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-[11px] transition text-center cursor-pointer"
            >
              🚶 Walkability
            </button>
          )}
          {onOpenFloodClimate && (
            <button
              onClick={() => onOpenFloodClimate(sector)}
              className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-[11px] transition text-center cursor-pointer"
            >
              🌊 Flood & Climate
            </button>
          )}
          {onOpenWaterfall && (
            <button
              onClick={() => onOpenWaterfall(sector)}
              className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-[11px] transition text-center cursor-pointer"
            >
              📊 Why This Score?
            </button>
          )}
          {onOpenCompare && (
            <button
              onClick={() => onOpenCompare()}
              className="py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-[11px] transition text-center cursor-pointer"
            >
              ⚖️ Compare Areas
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {onOpenWeights && (
            <button
              onClick={() => onOpenWeights()}
              className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-medium text-[11px] transition text-center border border-emerald-200 cursor-pointer"
            >
              🎚️ Custom Weights
            </button>
          )}
          {onOpenShare && (
            <button
              onClick={() => onOpenShare()}
              className="py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-medium text-[11px] transition text-center border border-emerald-200 cursor-pointer"
            >
              🔗 Share Search
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
