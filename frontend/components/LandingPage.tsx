'use client';

import React from 'react';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  Activity,
  Sparkles,
  GitCompare,
  HardHat,
  Wind,
  Droplets,
  CheckCircle2
} from 'lucide-react';
import { LocationItem } from '@/types';

interface LandingProps {
  onStartAnalysis: (loc?: LocationItem) => void;
  onOpenBuilder: () => void;
  onOpenCompare: () => void;
}

export default function LandingPage({
  onStartAnalysis,
  onOpenBuilder,
  onOpenCompare,
}: LandingProps) {
  const sampleHubs: { name: string; score: number; aqi: number; flood: string; tag: string }[] = [
    { name: 'Sector 62, Noida', score: 78.4, aqi: 168, flood: 'Moderate', tag: 'IT & Residential Hub' },
    { name: 'Connaught Place, New Delhi', score: 85.2, aqi: 182, flood: 'Low', tag: 'Commercial CBD' },
    { name: 'Indiranagar, Bengaluru', score: 86.8, aqi: 68, flood: 'Low', tag: 'Prime Urban Retail' },
    { name: 'BKC, Mumbai', score: 79.5, aqi: 112, flood: 'Elevated', tag: 'Financial Center' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Soft emerald glow background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-100/60 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs text-emerald-700 font-medium mb-6 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI-Powered Location Intelligence Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            The Location Is <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-sky-600">
              the Decision.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Property listings only show what is inside four walls. <strong>LandNova</strong> analyzes the surrounding location: transit corridors, real amenities, environmental quality, and climate risks to empower home buyers and property developers.
          </p>

          {/* Action CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onStartAnalysis()}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/20 hover:scale-105"
            >
              <Compass className="w-4 h-4" />
              Analyze a Location
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenBuilder}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-sm transition-all shadow-xs"
            >
              <HardHat className="w-4 h-4 text-emerald-600" />
              Builder Intelligence
            </button>

            <button
              onClick={onOpenCompare}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 font-semibold text-sm transition-all shadow-xs"
            >
              <GitCompare className="w-4 h-4 text-sky-600" />
              Compare Sites
            </button>
          </div>

          {/* Core Concept Banner */}
          <div className="mt-12 p-3 bg-white rounded-xl border border-slate-200 shadow-xs inline-flex items-center gap-2 text-xs text-slate-600">
            <span className="text-emerald-700 font-semibold">Formula:</span>
            <span>One Location</span>
            <span>→</span>
            <span>Multiple Data Layers</span>
            <span>→</span>
            <span>Deterministic Scoring</span>
            <span>→</span>
            <span className="text-slate-900 font-semibold">Confident Decisions</span>
          </div>
        </div>

        {/* Live Interactive Benchmark Showcase Cards */}
        <div className="max-w-5xl mx-auto mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {sampleHubs.map((hub, i) => (
            <div
              key={i}
              onClick={() => onStartAnalysis()}
              className="bg-white hover:bg-slate-50/80 border border-slate-200 hover:border-emerald-400 p-4 rounded-xl transition-all cursor-pointer group shadow-xs hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-500">{hub.tag}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                  {hub.score}/100
                </span>
              </div>
              <h3 className="font-semibold text-slate-900 text-sm mt-2 group-hover:text-emerald-600 transition-colors truncate">
                {hub.name}
              </h3>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-amber-500" /> AQI {hub.aqi}
                </span>
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-sky-500" /> {hub.flood} Risk
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Pillars Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Comprehensive Location Intelligence
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Moving beyond static listing portals with real OpenStreetMap amenities, live Open-Meteo weather, Copernicus elevation terrain, and AI advisory reasoning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700 mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Livability Engine</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Deterministic 5-factor livability index covering transit, education, healthcare, green spaces, and air quality without arbitrary scores.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 mb-4">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Environmental & Flood</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Integrated Open-Meteo air quality (PM2.5, PM10) and Copernicus DEM elevation to evaluate monsoon flood resilience before you commit.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-700 mb-4">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">AI Location Advisor</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Conversational advisor powered by Google Gemini grounded strictly in retrieved location metrics. Distinguishes verified data from estimates.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl hover:border-slate-300 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center text-teal-700 mb-4">
                <HardHat className="w-5 h-5" />
              </div>
              <h3 className="text-base font-semibold text-slate-900">Builder Intelligence</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Tailored for developers: feasibility scoring, road width and rapid transit proximity, statutory clearance roadmap (RERA, Fire, EIA).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Persona Comparison Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Tailored for Every Stakeholder
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Buyer Persona */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                Persona 1
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Home Buyers & Renters</h3>
              <p className="text-xs text-slate-600 mt-2 mb-4">
                Find out whether an area truly fits your family, health, and daily commuting patterns before signing a long-term lease or mortgage.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Evaluate school commute times and multi-specialty hospital proximity
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Monitor real seasonal air pollution (PM2.5) and heat stress days
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  Identify low-lying flood pockets and unmanaged stormwater drainage
                </li>
              </ul>
              <button
                onClick={() => onStartAnalysis()}
                className="mt-6 w-full py-2.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold transition-colors"
              >
                Analyze as Home Buyer
              </button>
            </div>

            {/* Builder Persona */}
            <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                Persona 2
              </span>
              <h3 className="text-xl font-bold text-slate-900 mt-1">Builders & Developers</h3>
              <p className="text-xs text-slate-600 mt-2 mb-4">
                Conduct preliminary site feasibility, assess road accessibility for construction, and plan statutory due diligence requirements.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-700">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  Verify arterial road connectivity and right-of-way (ROW) clearance
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  Analyze neighborhood catchment demand for residential vs commercial
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                  Check statutory due diligence roadmap (State RERA, Fire NOC, CTE)
                </li>
              </ul>
              <button
                onClick={onOpenBuilder}
                className="mt-6 w-full py-2.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-semibold transition-colors"
              >
                Launch Builder Intelligence
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-200 bg-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
            Ready to make location-informed decisions?
          </h2>
          <p className="mt-3 text-sm text-slate-600">
            Explore live interactive maps, deterministic livability scoring, and AI due-diligence in real-time.
          </p>
          <button
            onClick={() => onStartAnalysis()}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all shadow-md shadow-emerald-600/20"
          >
            <Compass className="w-4 h-4" />
            Launch Live Dashboard
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <p>LandNova Location Intelligence • Built with Next.js, FastAPI, OpenStreetMap & Google Gemini</p>
      </footer>
    </div>
  );
}
