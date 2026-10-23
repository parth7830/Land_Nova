'use client';

import React, { useState, useEffect } from 'react';
import {
  GitCompare,
  Trophy,
  Building,
  UserCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  LocationItem,
  LocationComparisonResponse
} from '@/types';
import { fetchComparison } from '@/lib/api';

interface ComparisonProps {
  currentLocation: LocationItem;
  onSelectMainLocation: (loc: LocationItem) => void;
}

export default function ComparisonView({
  currentLocation,
  onSelectMainLocation,
}: ComparisonProps) {
  const [locA, setLocA] = useState<LocationItem>(currentLocation);
  const [locB, setLocB] = useState<LocationItem>({
    id: 'connaught-place-delhi',
    display_name: 'Connaught Place, New Delhi, Delhi, India',
    locality: 'Connaught Place',
    city: 'New Delhi',
    country: 'India',
    latitude: 28.6315,
    longitude: 77.2167,
    is_demo: true,
  });

  const [comparison, setComparison] = useState<LocationComparisonResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const presetPairs = [
    {
      name: 'Noida Sec 62 vs CP Delhi',
      a: {
        id: 'sector-62-noida',
        display_name: 'Sector 62, Noida, Uttar Pradesh, India',
        locality: 'Sector 62',
        city: 'Noida',
        country: 'India',
        latitude: 28.6280,
        longitude: 77.3649,
      },
      b: {
        id: 'connaught-place-delhi',
        display_name: 'Connaught Place, New Delhi, Delhi, India',
        locality: 'Connaught Place',
        city: 'New Delhi',
        country: 'India',
        latitude: 28.6315,
        longitude: 77.2167,
      },
    },
    {
      name: 'Indiranagar vs BKC Mumbai',
      a: {
        id: 'indiranagar-bengaluru',
        display_name: 'Indiranagar, Bengaluru, Karnataka, India',
        locality: 'Indiranagar',
        city: 'Bengaluru',
        country: 'India',
        latitude: 12.9784,
        longitude: 77.6408,
      },
      b: {
        id: 'bkc-mumbai',
        display_name: 'Bandra Kurla Complex (BKC), Mumbai, Maharashtra, India',
        locality: 'BKC',
        city: 'Mumbai',
        country: 'India',
        latitude: 19.0657,
        longitude: 77.8681,
      },
    },
    {
      name: 'HITEC City vs Noida Sec 62',
      a: {
        id: 'hitec-city-hyderabad',
        display_name: 'HITEC City, Madhapur, Hyderabad, Telangana, India',
        locality: 'HITEC City',
        city: 'Hyderabad',
        country: 'India',
        latitude: 17.4435,
        longitude: 78.3772,
      },
      b: {
        id: 'sector-62-noida',
        display_name: 'Sector 62, Noida, Uttar Pradesh, India',
        locality: 'Sector 62',
        city: 'Noida',
        country: 'India',
        latitude: 28.6280,
        longitude: 77.3649,
      },
    },
  ];

  const runComparison = async (locationA: LocationItem, locationB: LocationItem) => {
    setLoading(true);
    try {
      const res = await fetchComparison(locationA, locationB);
      setComparison(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runComparison(locA, locB);
  }, [locA, locB]);

  const chartData = [
    {
      category: 'Overall Score',
      [locA.display_name.split(',')[0]]: comparison?.location_a?.overall_score || 78,
      [locB.display_name.split(',')[0]]: comparison?.location_b?.overall_score || 85,
    },
    {
      category: 'Connectivity',
      [locA.display_name.split(',')[0]]: comparison?.location_a?.factors?.connectivity?.score || 80,
      [locB.display_name.split(',')[0]]: comparison?.location_b?.factors?.connectivity?.score || 92,
    },
    {
      category: 'Amenities',
      [locA.display_name.split(',')[0]]: comparison?.location_a?.factors?.amenities?.score || 82,
      [locB.display_name.split(',')[0]]: comparison?.location_b?.factors?.amenities?.score || 88,
    },
    {
      category: 'Environment',
      [locA.display_name.split(',')[0]]: comparison?.location_a?.factors?.environment?.score || 68,
      [locB.display_name.split(',')[0]]: comparison?.location_b?.factors?.environment?.score || 60,
    },
    {
      category: 'Flood Resilience',
      [locA.display_name.split(',')[0]]: comparison?.location_a?.factors?.climate_flood?.score || 75,
      [locB.display_name.split(',')[0]]: comparison?.location_b?.factors?.climate_flood?.score || 85,
    },
  ];

  const nameA = locA.display_name.split(',')[0];
  const nameB = locB.display_name.split(',')[0];

  return (
    <div className="space-y-6">
      {/* Header & Preset Switchers */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-xs text-sky-700 font-medium mb-2">
              <GitCompare className="w-3.5 h-3.5" />
              <span>Side-by-Side Spatial Evaluation</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Location Comparison</h2>
            <p className="text-xs text-slate-500 mt-1">
              Compare two locations using the exact same deterministic scoring engine and transparent data layers.
            </p>
          </div>

          {/* Quick Pair Buttons */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            {presetPairs.map((pair, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setLocA(pair.a);
                  setLocB(pair.b);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium shrink-0 transition-colors shadow-xs"
              >
                {pair.name}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Locations Cards */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Location A */}
          <div className="bg-slate-50 border border-emerald-300 p-4 rounded-xl relative shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
              Location A
            </span>
            <h3 className="font-bold text-slate-900 text-base mt-1 truncate">
              {locA.display_name}
            </h3>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Livability Score</span>
              <span className="text-2xl font-extrabold text-slate-900">
                {comparison?.location_a?.overall_score || 78.4}
                <span className="text-xs text-slate-400">/100</span>
              </span>
            </div>
          </div>

          {/* Location B */}
          <div className="bg-slate-50 border border-sky-300 p-4 rounded-xl relative shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 block">
              Location B
            </span>
            <h3 className="font-bold text-slate-900 text-base mt-1 truncate">
              {locB.display_name}
            </h3>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-xs text-slate-500">Livability Score</span>
              <span className="text-2xl font-extrabold text-slate-900">
                {comparison?.location_b?.overall_score || 85.2}
                <span className="text-xs text-slate-400">/100</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Comparison Verdict Summary */}
      {comparison && (
        <div className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Head-to-Head Verdict</h3>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {comparison.head_to_head_summary}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
                <UserCheck className="w-4 h-4 text-emerald-600" />
                <span>Recommendation for Home Buyers</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {comparison.buyer_verdict}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs font-semibold text-sky-700 mb-1">
                <Building className="w-4 h-4 text-sky-600" />
                <span>Recommendation for Builders</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {comparison.builder_verdict}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Chart */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <h3 className="text-sm font-semibold text-slate-900 mb-4">
          Direct Metric Comparison Across Dimensions
        </h3>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 11 }} />
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
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
              <Bar dataKey={nameA} fill="#059669" radius={[4, 4, 0, 0]} />
              <Bar dataKey={nameB} fill="#0284c7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
