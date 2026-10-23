'use client';

import React from 'react';
import { Sparkles, ArrowRight, MapPin, CheckCircle2 } from 'lucide-react';
import { BuyerSector } from '@/types';

interface TopRecommendedCardsProps {
  sectors: BuyerSector[];
  selectedSectorId: string | null;
  onSelectSector: (sector: BuyerSector) => void;
  onViewProperties: (sectorId: string) => void;
}

export default function TopRecommendedCards({
  sectors,
  selectedSectorId,
  onSelectSector,
  onViewProperties
}: TopRecommendedCardsProps) {
  if (!sectors || sectors.length === 0) return null;

  return (
    <div className="w-full bg-white/95 backdrop-blur-md border-t border-slate-200/90 p-3 sm:p-4 z-20 shadow-md">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <h3 className="text-xs font-bold text-slate-900 tracking-tight">
            Top Recommended Areas <span className="text-slate-400 font-normal">(Ranked deterministically by your preferences)</span>
          </h3>
        </div>
        <span className="text-[11px] text-slate-500 font-medium">Click card to highlight area</span>
      </div>

      {/* Horizontal Scroll Cards */}
      <div className="flex gap-3 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
        {sectors.map((sector, index) => {
          const isSelected = selectedSectorId === sector.id;
          const score = sector.overall_score;

          return (
            <div
              key={sector.id}
              onClick={() => onSelectSector(sector)}
              className={`min-w-[270px] sm:min-w-[300px] max-w-[320px] rounded-xl border p-3 cursor-pointer transition-all shrink-0 flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-50/70 border-emerald-500 shadow-sm ring-1 ring-emerald-500'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              <div>
                {/* Header with Rank, Name, and Score Badge */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                      #{index + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">{sector.name}</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-0.5 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{sector.city} • ₹{sector.avg_price_sqft.toLocaleString()}/sq.ft</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-lg text-xs font-black shrink-0 ${
                      score >= 80
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : score >= 60
                        ? 'bg-lime-600 text-white'
                        : 'bg-amber-500 text-white'
                    }`}
                  >
                    {score}
                  </span>
                </div>

                {/* 3 Reason Bullets generated deterministically */}
                <ul className="space-y-1 mb-2.5 text-[11px] text-slate-600">
                  {sector.reasons.slice(0, 3).map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-tight">
                      <span className="text-emerald-500 font-bold shrink-0">•</span>
                      <span className="line-clamp-1">{r}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-500 font-medium">
                  {sector.commute ? `${sector.commute.car_minutes}m drive` : `${sector.property_count} properties`}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewProperties(sector.id);
                  }}
                  className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  <span>View Properties</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
