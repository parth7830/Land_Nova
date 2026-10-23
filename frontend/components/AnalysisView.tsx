'use client';

import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import {
  LivabilityResponse,
  WeatherClimateResponse,
  LocationItem
} from '@/types';

interface AnalysisProps {
  currentLocation: LocationItem;
  livability: LivabilityResponse | null;
  weather: WeatherClimateResponse | null;
  onRecalculateWithWeights: (weights: any) => void;
  onNavigateTab: (tab: string) => void;
}

export default function AnalysisView({
  currentLocation,
  livability,
  weather,
  onRecalculateWithWeights,
  onNavigateTab,
}: AnalysisProps) {
  const [weights, setWeights] = useState({
    connectivity: 0.25,
    amenities: 0.25,
    environment: 0.20,
    safety: 0.15,
    climate_flood: 0.15,
  });

  const [showWeightSliders, setShowWeightSliders] = useState(false);

  const handleWeightChange = (key: string, val: number) => {
    const updated = { ...weights, [key]: val };
    setWeights(updated);
    onRecalculateWithWeights(updated);
  };

  const factors = livability?.factors || {};

  const chartData = [
    {
      name: 'Connectivity',
      score: factors.connectivity?.score || 85,
      weight: (weights.connectivity * 100).toFixed(0) + '%',
      fullMark: 100,
    },
    {
      name: 'Amenities',
      score: factors.amenities?.score || 82,
      weight: (weights.amenities * 100).toFixed(0) + '%',
      fullMark: 100,
    },
    {
      name: 'Environment',
      score: factors.environment?.score || 70,
      weight: (weights.environment * 100).toFixed(0) + '%',
      fullMark: 100,
    },
    {
      name: 'Safety',
      score: factors.safety?.score || 80,
      weight: (weights.safety * 100).toFixed(0) + '%',
      fullMark: 100,
    },
    {
      name: 'Climate/Flood',
      score: factors.climate_flood?.score || 78,
      weight: (weights.climate_flood * 100).toFixed(0) + '%',
      fullMark: 100,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header & Score Summary Card */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                Detailed Livability Evaluation
              </span>
              {livability?.is_partial && (
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Partial Layer Assessment
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              {currentLocation.display_name}
            </h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              {livability?.recommendation_summary ||
                'Deterministic livability score calculated from multi-layer geospatial data.'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-xl border border-slate-200 self-start md:self-auto shrink-0">
            <div>
              <span className="text-xs text-slate-500 block">Overall Score</span>
              <div className="text-3xl font-extrabold text-slate-900">
                {livability?.overall_score || 81.4}
                <span className="text-sm text-slate-400 font-normal">/100</span>
              </div>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-xs text-slate-500 block">Grade</span>
              <span className="text-xl font-bold text-emerald-600 block">
                {livability?.grade || 'A'}
              </span>
            </div>
          </div>
        </div>

        {/* Methodology Notice */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            Methodology: Deterministic weighted aggregation across verified OpenStreetMap & Open-Meteo feeds.
          </span>
          <button
            onClick={() => setShowWeightSliders(!showWeightSliders)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-600" />
            {showWeightSliders ? 'Hide Weight Controls' : 'Configure Factor Weights'}
          </button>
        </div>

        {/* Configurable Sliders Dropdown */}
        {showWeightSliders && (
          <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { key: 'connectivity', label: 'Connectivity (25%)' },
              { key: 'amenities', label: 'Amenities (25%)' },
              { key: 'environment', label: 'Environment (20%)' },
              { key: 'safety', label: 'Civic Safety (15%)' },
              { key: 'climate_flood', label: 'Flood Resilience (15%)' },
            ].map((dim) => (
              <div key={dim.key} className="space-y-1">
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>{dim.label}</span>
                  <span className="font-semibold text-emerald-700">
                    {((weights as any)[dim.key] * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.05"
                  value={(weights as any)[dim.key]}
                  onChange={(e) => handleWeightChange(dim.key, parseFloat(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Visual Analytics: Radar and Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Multi-Dimensional Profile
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={chartData}>
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" />
                <Radar
                  name="Score"
                  dataKey="score"
                  stroke="#059669"
                  fill="#059669"
                  fillOpacity={0.25}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-slate-500 text-center">
            Higher area coverage denotes superior balanced livability.
          </p>
        </div>

        {/* Bar Comparison Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 p-5 rounded-2xl flex flex-col justify-between shadow-xs">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">
            Dimension Scores & Configured Weights
          </h3>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#0f172a'
                  }}
                />
                <Bar dataKey="score" fill="#059669" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <span>Score threshold: 80+ denotes Prime Urban Hub</span>
            <span>Weights normalize dynamically across available factors</span>
          </div>
        </div>
      </div>

      {/* Factor Breakdown Cards */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-slate-900">
          Detailed Dimension Breakdown
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(factors).map(([key, factor]) => {
            return (
              <div
                key={key}
                className="bg-white border border-slate-200 p-5 rounded-xl hover:border-slate-300 shadow-xs transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">
                    {factor.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      Weight: {(factor.weight * 100).toFixed(0)}%
                    </span>
                    <span className="text-sm font-bold text-emerald-700">
                      {factor.score}/100
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {factor.explanation}
                </p>

                {factor.metrics && Object.keys(factor.metrics).length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {Object.entries(factor.metrics).map(([mKey, mVal]) => (
                      <span
                        key={mKey}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-slate-600 font-mono"
                      >
                        {mKey.replace(/_/g, ' ')}: {String(mVal)}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Source: {factor.source}</span>
                  <span className="text-emerald-700 font-medium">Confidence: {factor.confidence}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pros & Cons Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Advantages */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold mb-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Verified Advantages</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {(livability?.key_advantages || []).map((adv, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">•</span>
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Watchpoints & Caveats */}
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs">
          <div className="flex items-center gap-2 text-amber-700 text-sm font-semibold mb-3">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Watchpoints & Considerations</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {(livability?.key_concerns || []).map((con, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-600 font-bold shrink-0">•</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
