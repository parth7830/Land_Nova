'use client';

import React, { useState } from 'react';
import {
  Building2,
  HardHat,
  BarChart3,
  Flame,
  GitCompare,
  Layers,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  FileText,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Sliders
} from 'lucide-react';
import { LocationItem } from '@/types';

interface DeveloperHomeProps {
  currentLocation: LocationItem;
  onNavigateView: (view: string) => void;
  onLaunchSiteReport: (params: {
    projectType: string;
    budgetBracket: string;
    targetAudience: string;
    scaleAcres: number;
  }) => void;
}

export default function DeveloperHome({
  currentLocation,
  onNavigateView,
  onLaunchSiteReport
}: DeveloperHomeProps) {
  const [projectType, setProjectType] = useState('residential_colony');
  const [budgetBracket, setBudgetBracket] = useState('mid_market');
  const [targetAudience, setTargetAudience] = useState('families');
  const [scaleAcres, setScaleAcres] = useState<number>(3.5);

  const savedProjects = [
    {
      id: 'proj-001',
      name: 'Noida Sector 62 Urban Res-Tower',
      type: 'Residential High-Rise',
      scale: '4.2 Acres',
      score: 82.5,
      verdict: 'Prime Feasible Site',
      date: '2026-03-18'
    },
    {
      id: 'proj-002',
      name: 'Indiranagar Tech Park Node',
      type: 'Commercial / Office',
      scale: '2.0 Acres',
      score: 86.0,
      verdict: 'High Commercial Absorption',
      date: '2026-03-14'
    },
    {
      id: 'proj-003',
      name: 'HITEC City Gated Villa Layout',
      type: 'Plotted Development',
      scale: '12.0 Acres',
      score: 84.0,
      verdict: 'Low Environmental Constraints',
      date: '2026-03-10'
    }
  ];

  const handleStartAnalysis = () => {
    onLaunchSiteReport({
      projectType,
      budgetBracket,
      targetAudience,
      scaleAcres
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Developer Hero (Clean Light Mode) */}
      <div className="relative rounded-3xl bg-gradient-to-r from-amber-50 via-orange-50 to-white border border-amber-200 p-8 sm:p-10 overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-semibold">
            <HardHat className="w-3.5 h-3.5 text-amber-700" />
            End-to-End Real Estate Developer Intelligence Suite
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Decide <span className="text-amber-700">WHERE</span> to Build and{' '}
            <span className="text-emerald-700">WHAT</span> to Build.
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Eliminate fragmented surveys. LandNova synthesizes soil characteristics (ISRIC SoilGrids),
            seismic vulnerability (USGS & BIS), climate normals (Open-Meteo), groundwater tables,
            and preliminary engineering feasibility in a single comprehensive report.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={handleStartAnalysis}
              className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-all hover:scale-102"
            >
              <BarChart3 className="w-4 h-4" />
              Generate 12-Section Site Analysis
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onNavigateView('heatmap')}
              className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs sm:text-sm flex items-center gap-2 transition-colors shadow-xs"
            >
              <Flame className="w-4 h-4 text-amber-600" />
              Development Suitability Heatmap
            </button>
          </div>
        </div>
      </div>

      {/* Preferences & Project Parameter Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Setup Card */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-600" />
              Configure Parameters for {currentLocation.display_name.split(',')[0]}
            </h3>
            <span className="text-xs text-amber-700 font-mono font-bold">Active Site</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Project Typology */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Project Typology</label>
              <select
                value={projectType}
                onChange={(e) => setProjectType(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                <option value="residential_colony">Residential Colony / Gated Enclave</option>
                <option value="commercial_office">Commercial / IT Office Complex</option>
                <option value="mixed_use">Mixed-Use (Retail + Residential)</option>
                <option value="plotted_development">Plotted / Villa Development</option>
              </select>
            </div>

            {/* Target Audience */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Target Demographic</label>
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                <option value="families">Family Households (2 & 3 BHK)</option>
                <option value="tech_professionals">Tech Professionals & Execs</option>
                <option value="investors">High-Net-Worth / Investors</option>
                <option value="retail_footfall">Retail Shoppers & Commercial Tenants</option>
              </select>
            </div>

            {/* Budget Bracket */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700">Pricing / Budget Bracket</label>
              <select
                value={budgetBracket}
                onChange={(e) => setBudgetBracket(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white"
              >
                <option value="affordable">Affordable Housing (PMAY Tier)</option>
                <option value="mid_market">Mid-Market Premium (₹60L - ₹1.5 Cr)</option>
                <option value="luxury">Luxury / Ultra-Luxury (₹2 Cr+)</option>
              </select>
            </div>

            {/* Scale Acres */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-700">Land Parcel Scale</span>
                <span className="text-amber-700 font-mono font-bold">{scaleAcres} Acres</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="25"
                step="0.5"
                value={scaleAcres}
                onChange={(e) => setScaleAcres(parseFloat(e.target.value))}
                className="w-full accent-amber-600 h-2 bg-slate-100 rounded-lg cursor-pointer mt-2"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleStartAnalysis}
              className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <FileText className="w-4 h-4" />
              Run Site Feasibility Analysis for {currentLocation.display_name.split(',')[0]}
            </button>
          </div>
        </div>

        {/* 12 Data Layers Overview Box */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            12 Verified Site Dimensions
          </h3>
          <div className="space-y-2 text-xs">
            {[
              { num: '1', title: 'Soil Properties', src: 'ISRIC SoilGrids 250m' },
              { num: '2', title: 'Groundwater Table', src: 'CGWB & India-WRIS' },
              { num: '3', title: 'Seismic Risk', src: 'USGS & BIS IS 1893' },
              { num: '4', title: 'Climate Normals', src: 'Open-Meteo ERA5' },
              { num: '5', title: 'Flood Risk', src: 'Copernicus DEM' },
              { num: '6', title: 'Protected Areas', src: 'OSM & MoEFCC' },
              { num: '7', title: 'Local Resources', src: 'Industrial & RMC' },
              { num: '8', title: 'Transit Connectivity', src: 'Multimodal Graph' },
              { num: '9', title: 'Resident Profile', src: 'Census of India (Dated)' },
              { num: '10', title: 'Market Indicators', src: 'Sub-Registrar Notice' },
              { num: '11', title: 'AI Recommendations', src: 'Gemini Structural' },
              { num: '12', title: 'Data Gaps Audit', src: 'Due Diligence Roadmap' },
            ].map(layer => (
              <div key={layer.num} className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                <span className="text-slate-700 font-medium flex items-center gap-2">
                  <span className="text-[10px] text-amber-600 font-mono w-4 font-bold">{layer.num}.</span>
                  {layer.title}
                </span>
                <span className="text-[10px] text-slate-500 font-mono truncate max-w-[120px]">{layer.src}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Saved Projects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-amber-600" />
            Saved Development Sites & Benchmark Projects
          </h3>
          <span className="text-xs text-slate-500">{savedProjects.length} Verified Benchmarks</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {savedProjects.map(proj => (
            <div
              key={proj.id}
              onClick={handleStartAnalysis}
              className="cursor-pointer rounded-2xl bg-white border border-slate-200 hover:border-amber-500 p-5 space-y-4 transition-all duration-200 group shadow-xs hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">
                    {proj.type}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-amber-700 transition-colors mt-0.5">
                    {proj.name}
                  </h4>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                  {proj.score}
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span>Scale:</span>
                  <span className="text-slate-800 font-medium">{proj.scale}</span>
                </div>
                <div className="flex justify-between">
                  <span>Feasibility:</span>
                  <span className="text-emerald-700 font-semibold">{proj.verdict}</span>
                </div>
                <div className="flex justify-between">
                  <span>Analyzed:</span>
                  <span className="text-slate-400">{proj.date}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs font-semibold text-amber-700 group-hover:translate-x-0.5 transition-transform">
                <span>View Full Feasibility Report</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
