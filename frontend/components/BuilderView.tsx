'use client';

import React, { useState } from 'react';
import {
  HardHat,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Scale,
  TrendingUp,
  ShieldAlert,
  Info
} from 'lucide-react';
import {
  LocationItem,
  BuilderSuitabilityResponse
} from '@/types';

interface BuilderProps {
  currentLocation: LocationItem;
  builderData: BuilderSuitabilityResponse | null;
  onRefreshBuilder: (type: string, budget: string, audience: string) => void;
}

export default function BuilderView({
  currentLocation,
  builderData,
  onRefreshBuilder,
}: BuilderProps) {
  const [projectType, setProjectType] = useState('residential');
  const [budgetBracket, setBudgetBracket] = useState('mid_market');
  const [targetAudience, setTargetAudience] = useState('families');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = () => {
    setIsUpdating(true);
    onRefreshBuilder(projectType, budgetBracket, targetAudience);
    setTimeout(() => setIsUpdating(false), 300);
  };

  const riskColor =
    builderData?.risk_level === 'Low'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : builderData?.risk_level === 'Moderate'
      ? 'text-amber-700 bg-amber-50 border-amber-200'
      : 'text-rose-700 bg-rose-50 border-rose-200';

  return (
    <div className="space-y-6">
      {/* Builder Dashboard Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-xs text-teal-700 font-medium mb-2">
              <HardHat className="w-3.5 h-3.5" />
              <span>Developer Due-Diligence Engine</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Builder Intelligence</h2>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Preliminary site feasibility evaluation for real estate developers and infrastructure planners based on arterial accessibility, demographic catchment, and environmental constraints.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-50 px-5 py-3 rounded-xl border border-slate-200 self-start md:self-auto shrink-0">
            <div>
              <span className="text-xs text-slate-500 block">Development Suitability</span>
              <div className="text-3xl font-extrabold text-slate-900">
                {builderData?.suitability_score || 79.5}
                <span className="text-sm text-slate-400 font-normal">/100</span>
              </div>
            </div>
            <div className="border-l border-slate-200 pl-4">
              <span className="text-xs text-slate-500 block">Risk Profile</span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border block mt-1 ${riskColor}`}>
                {builderData?.risk_level || 'Moderate'} Risk
              </span>
            </div>
          </div>
        </div>

        {/* Project Typology Controls */}
        <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Project Typology
            </label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
            >
              <option value="residential">Residential Township / Apartments</option>
              <option value="commercial">Commercial Office / IT Park</option>
              <option value="mixed_use">Mixed-Use Retail & Residential</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Target Budget Bracket
            </label>
            <select
              value={budgetBracket}
              onChange={(e) => setBudgetBracket(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
            >
              <option value="budget">Affordable / Budget Housing</option>
              <option value="mid_market">Mid-Market Premium</option>
              <option value="luxury">Luxury High-End</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">
              Primary Audience
            </label>
            <div className="flex gap-2">
              <select
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-teal-500 focus:bg-white"
              >
                <option value="families">Families with Children</option>
                <option value="young_professionals">Tech Professionals / Millennial</option>
                <option value="retail_footfall">High Footfall Retail Shoppers</option>
              </select>
              <button
                onClick={handleUpdate}
                disabled={isUpdating}
                className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-lg transition-colors shrink-0 shadow-xs"
              >
                {isUpdating ? '...' : 'Evaluate'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Feasibility Verdict Card */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
        <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">
          Executive Feasibility Verdict
        </span>
        <h3 className="text-xl font-bold text-slate-900 mt-1">
          {builderData?.feasibility_verdict || 'High Feasibility for Proposed Project'}
        </h3>
        <p className="text-xs text-slate-500 mt-2">
          Target Site: <strong className="text-slate-800">{currentLocation.display_name}</strong>
        </p>

        {/* 4 Pillars of Site Assessment */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(builderData?.metrics || []).map((metric, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200 p-4 rounded-xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">{metric.name}</span>
                <span className="font-bold text-teal-700">{metric.score}/100</span>
              </div>
              <p className="text-xs text-slate-700 mt-2 leading-relaxed">
                {metric.details}
              </p>
              <div className="mt-3 pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-mono">
                {metric.verified_data_point}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Key Drivers & Site Constraints */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Drivers */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-teal-700 text-sm font-semibold mb-3">
            <TrendingUp className="w-4 h-4 text-teal-600" />
            <span>Key Project Drivers</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {(builderData?.key_drivers || []).map((driver, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <span>{driver}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Identified Constraints */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-rose-700 text-sm font-semibold mb-3">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <span>Identified Site Constraints</span>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-700">
            {(builderData?.identified_constraints || []).map((constraint, i) => (
              <li key={i} className="flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{constraint}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Statutory Clearances & Due Diligence Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Statutory Clearances */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-sky-700 text-sm font-semibold mb-3">
            <FileCheck className="w-4 h-4 text-sky-600" />
            <span>Mandatory Statutory Clearances</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {(builderData?.statutory_clearances_required || []).map((clr, i) => (
              <li key={i} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200">
                <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                <span>{clr}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Due Diligence Checklist */}
        <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-xs">
          <div className="flex items-center gap-2 text-emerald-700 text-sm font-semibold mb-3">
            <Scale className="w-4 h-4 text-emerald-600" />
            <span>Pre-Construction Due-Diligence Protocol</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700">
            {(builderData?.due_diligence_checklist || []).map((chk, i) => (
              <li key={i} className="flex items-start gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="text-emerald-600 font-bold shrink-0">•</span>
                <span>{chk}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Decision-Support Legal Disclaimer */}
      <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <p>
          <strong>Statutory Disclaimer:</strong> {builderData?.disclaimer ||
            'This analysis is an automated decision-support heuristic synthesized from open geospatial datasets. It does not replace structural soil bore testing, certified municipal building sanction verification, or title clearance by legal counsel.'}
        </p>
      </div>
    </div>
  );
}
