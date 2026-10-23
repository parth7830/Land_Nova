'use client';

import React from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  Sparkles,
  ExternalLink,
  MapPin,
  TrendingUp,
  Download,
  Info,
  Building2,
  Flame,
  Check,
  Compass,
  ArrowLeft
} from 'lucide-react';
import { DeveloperSiteReport } from '@/types';

interface DeveloperSiteReportViewProps {
  report: DeveloperSiteReport;
  onBack: () => void;
  onNavigateView: (view: string) => void;
}

export default function DeveloperSiteReportView({
  report,
  onBack,
  onNavigateView
}: DeveloperSiteReportViewProps) {
  const getStatusBadge = (status: string) => {
    if (status === 'ok') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Live Verified
        </span>
      );
    }
    if (status === 'partial') {
      return (
        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
          <Info className="w-3 h-3 text-amber-600" /> Regional Benchmark
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200 font-semibold">
        <AlertTriangle className="w-3 h-3 text-red-600" /> Data Unavailable
      </span>
    );
  };

  const { sections } = report;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Developer Dashboard
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 border border-slate-200 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" /> Export PDF
          </button>
          <button
            onClick={() => onNavigateView('heatmap')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white transition-colors shadow-xs"
          >
            <Flame className="w-3.5 h-3.5" /> View on Heatmap
          </button>
        </div>
      </div>

      {/* Header Summary Banner (Clean White Card) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
              <Building2 className="w-4 h-4" />
              12-Section Comprehensive Site Intelligence Report
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {report.display_name}
            </h1>
            <p className="text-xs text-slate-500">
              Coordinates: {report.coordinates.latitude.toFixed(4)}°N, {report.coordinates.longitude.toFixed(4)}°E • City: {report.city} • Typology: {report.project_metadata.project_type.replace('_', ' ').toUpperCase()} • Scale: {report.project_metadata.scale_acres} Acres
            </p>
          </div>

          {/* Overall Suitability Score Card */}
          <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold block">
                Development Feasibility
              </span>
              <div className="text-3xl font-extrabold text-slate-900">
                {report.suitability_score}
                <span className="text-sm font-normal text-slate-500">/100</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">{report.feasibility_verdict}</span>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center font-bold text-lg shrink-0">
              {report.suitability_score >= 80 ? 'Grade A' : 'Grade B'}
            </div>
          </div>
        </div>

        {/* 5-Factor Score Breakdown Progress Bars */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4 border-t border-slate-100">
          {Object.entries(report.score_breakdown).map(([factorKey, factorScore]) => (
            <div key={factorKey} className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-600 block truncate capitalize">
                {factorKey.replace(/_/g, ' ')}
              </span>
              <div className="text-sm font-bold text-amber-700 mt-0.5">{factorScore}/100</div>
              <div className="w-full h-1 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                <div
                  className="h-full bg-amber-600 rounded-full"
                  style={{ width: `${factorScore}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 12 Comprehensive Sections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Soil Properties */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              1. Soil Type & Properties
            </h3>
            {getStatusBadge(sections.soil_properties?.status)}
          </div>
          <p className="text-xs text-slate-800 font-semibold">
            Classification: {sections.soil_properties?.general_classification}
          </p>
          <div className="text-[11px] text-slate-600 space-y-1">
            <p>{sections.soil_properties?.bearing_capacity_guidance}</p>
            {sections.soil_properties?.note && (
              <p className="text-amber-700 italic">{sections.soil_properties?.note}</p>
            )}
          </div>
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
            <span>Source: {sections.soil_properties?.source}</span>
            <span>Confidence: {sections.soil_properties?.confidence}</span>
          </div>
        </div>

        {/* Section 2: Groundwater Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              2. Groundwater / Water Table
            </h3>
            {getStatusBadge(sections.groundwater_status?.status)}
          </div>
          <p className="text-xs text-slate-800 font-semibold">
            Estimated Depth: {sections.groundwater_status?.water_table_depth_bgl}
          </p>
          <div className="text-[11px] text-slate-600 space-y-1">
            <p>{sections.groundwater_status?.cancellation_guidance}</p>
            <p className="text-slate-400">{sections.groundwater_status?.note}</p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
            <span>Source: {sections.groundwater_status?.source}</span>
            <span>Confidence: {sections.groundwater_status?.confidence}</span>
          </div>
        </div>

        {/* Section 3: Seismic Risk */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              3. Seismic Risk (USGS & BIS)
            </h3>
            {getStatusBadge(sections.seismic_risk?.status)}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
              BIS {sections.seismic_risk?.bis_seismic_zone}
            </span>
            <span className="text-xs text-slate-700">
              Hazard: {sections.seismic_risk?.hazard_level} • PGA: {sections.seismic_risk?.peak_ground_acceleration}
            </span>
          </div>
          <p className="text-[11px] text-slate-600">
            {sections.seismic_risk?.engineering_recommendation}
          </p>
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
            <span>Code: {sections.seismic_risk?.applicable_design_code}</span>
            <span>Source: {sections.seismic_risk?.source}</span>
          </div>
        </div>

        {/* Section 4: Climate Normals */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              4. Climate Normals & Weather
            </h3>
            {getStatusBadge(sections.climate_normals?.status)}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-800">
            <div>Annual Rainfall: ~{sections.climate_normals?.annual_mean_rainfall_mm} mm</div>
            <div>Extreme Heat Days: ~{sections.climate_normals?.extreme_heat_days_annually}/year</div>
          </div>
          <p className="text-[11px] text-slate-600">
            {sections.climate_normals?.passive_design_guidance}
          </p>
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
            <span>Source: {sections.climate_normals?.source}</span>
            <span>Confidence: {sections.climate_normals?.confidence}</span>
          </div>
        </div>

        {/* Section 5: Flood & Landslide */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              5. Flood & Landslide Resilience
            </h3>
            {getStatusBadge(sections.flood_and_landslide?.status)}
          </div>
          <div className="text-xs text-slate-800">
            Site Elevation: ~{sections.flood_and_landslide?.site_elevation_meters}m • Runoff: {sections.flood_and_landslide?.surface_runoff_vulnerability}
          </div>
          <p className="text-[11px] text-slate-600">
            {sections.flood_and_landslide?.stormwater_recommendation}
          </p>
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
            <span>Source: {sections.flood_and_landslide?.source}</span>
            <span>Confidence: {sections.flood_and_landslide?.confidence}</span>
          </div>
        </div>

        {/* Section 6: Biodiversity & Protected Areas */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              6. Biodiversity & Protected Areas
            </h3>
            {getStatusBadge(sections.biodiversity_protected_areas?.status)}
          </div>
          <div className="text-xs text-slate-800">
            Nearest Wildlife Sanctuary: ~{sections.biodiversity_protected_areas?.distance_to_nearest_sanctuary_km} km
          </div>
          <p className="text-[11px] text-slate-600">
            Eco-Sensitive Zone (ESZ): {sections.biodiversity_protected_areas?.in_eco_sensitive_zone ? 'Inside (Restricted)' : 'Outside Mapped Buffer (No Clearance Penalty)'}
          </p>
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
            <span>Source: {sections.biodiversity_protected_areas?.source}</span>
            <span>Confidence: {sections.biodiversity_protected_areas?.confidence}</span>
          </div>
        </div>

        {/* Section 7: Local Resources & Logistics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              7. Local Resources & Land Use
            </h3>
            {getStatusBadge(sections.local_resources?.status)}
          </div>
          <div className="text-xs text-slate-800">
            Nearest Water Feature: {sections.local_resources?.nearest_water_body}
          </div>
          <p className="text-[11px] text-slate-600">
            Construction Supply: {sections.local_resources?.construction_material_logistics}
          </p>
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
            <span>Source: {sections.local_resources?.source}</span>
            <span>Confidence: {sections.local_resources?.confidence}</span>
          </div>
        </div>

        {/* Section 8: Connectivity & Transport */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              8. Multimodal Connectivity
            </h3>
            {getStatusBadge(sections.connectivity_transport?.status)}
          </div>
          <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-800">
            <div>Metro Rail: {sections.connectivity_transport?.nearest_metro_rail_station}</div>
            <div>Expressway: {sections.connectivity_transport?.nearest_national_highway}</div>
          </div>
          <p className="text-[11px] text-slate-600">
            Emergency Access: {sections.connectivity_transport?.fire_tender_accessibility}
          </p>
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
            <span>Source: {sections.connectivity_transport?.source}</span>
            <span>Confidence: {sections.connectivity_transport?.confidence}</span>
          </div>
        </div>

        {/* Section 9: Demographics & Census */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              9. Resident Profile (Census Data)
            </h3>
            {getStatusBadge(sections.demographics_census?.status)}
          </div>
          <div className="text-xs text-slate-800">
            District: {sections.demographics_census?.district} • Literacy: {sections.demographics_census?.literacy_rate}
          </div>
          <div className="text-[11px] text-slate-600 space-y-1">
            <p><strong className="text-slate-800">Inferred Need:</strong> {sections.demographics_census?.likely_needs_inference}</p>
            <p className="text-amber-700 text-[10px] font-semibold">Flag: {sections.demographics_census?.census_year}</p>
          </div>
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
            <span>Source: {sections.demographics_census?.source}</span>
            <span>Confidence: {sections.demographics_census?.confidence}</span>
          </div>
        </div>

        {/* Section 10: Market Indicators */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              10. Market & Circle Rate Status
            </h3>
            {getStatusBadge(sections.market_indicators?.status)}
          </div>
          <p className="text-xs text-slate-700">
            Automated registry transactions are unavailable via open API.
          </p>
          <p className="text-[11px] text-slate-500">
            {sections.market_indicators?.guidance}
          </p>
          <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
            <span>Source: {sections.market_indicators?.source}</span>
            <span>Confidence: {sections.market_indicators?.confidence}</span>
          </div>
        </div>
      </div>

      {/* Section 11: AI-Assisted Architecture & Engineering Recommendations */}
      <div className="bg-gradient-to-br from-emerald-50/50 via-teal-50/30 to-white border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                11. AI-Assisted Engineering & Architecture Recommendations
              </h3>
              <p className="text-[11px] text-emerald-800 font-medium">
                Powered by Google Gemini • Grounded in site soil, seismic zone & climate normals
              </p>
            </div>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold">
            Preliminary Guidance
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-sans shadow-xs">
          {report.ai_engineering_recommendations?.text}
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-800">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
          <span>{report.ai_engineering_recommendations?.disclaimer}</span>
        </div>
      </div>

      {/* Section 12: Data Gaps List & Statutory Clearances Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Data Gaps List */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            12. Due Diligence Data Gaps (Pre-Acquisition Checklist)
          </h3>
          <p className="text-[11px] text-slate-500">
            The following data points must be verified via physical surveys prior to investment sign-off:
          </p>
          <div className="space-y-2 text-xs">
            {report.data_gaps.map((gap, i) => (
              <div key={i} className="flex items-start gap-2 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="text-amber-600 font-bold">•</span>
                <span>{gap}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Statutory Clearances Roadmap */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 shadow-xs">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Required Statutory Clearances Roadmap
          </h3>
          <p className="text-[11px] text-slate-500">
            Mandatory regulatory permissions required before commencement of construction:
          </p>
          <div className="space-y-2 text-xs">
            {report.statutory_clearances.map((clearance, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <div className="w-4 h-4 rounded bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 text-emerald-600" />
                </div>
                <span>{clearance}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
