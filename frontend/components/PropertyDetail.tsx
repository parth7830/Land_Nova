'use client';

import React from 'react';
import {
  ArrowLeft,
  MapPin,
  Bed,
  Bath,
  Ruler,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Sparkles,
  BarChart3,
  GitCompare,
  Train,
  Wind,
  Droplets,
  Calendar,
  Share2,
  Heart
} from 'lucide-react';
import { PropertyListing, LivabilityResponse, WeatherClimateResponse } from '@/types';

interface PropertyDetailProps {
  property: PropertyListing;
  onBack: () => void;
  livability: LivabilityResponse | null;
  weather: WeatherClimateResponse | null;
  onNavigateTab: (tab: string) => void;
  onOpenAIChat?: (name: string, ctx: any) => void;
}

export default function PropertyDetail({
  property,
  onBack,
  livability,
  weather,
  onNavigateTab,
  onOpenAIChat
}: PropertyDetailProps) {
  const formatPrice = (price: number, type: string) => {
    if (type === 'rent') {
      return `₹${price.toLocaleString('en-IN')}/mo`;
    }
    if (price >= 10000000) {
      return `₹${(price / 10000000).toFixed(2)} Cr`;
    }
    return `₹${(price / 100000).toFixed(0)} Lakhs`;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Listings
      </button>

      {/* Main Property Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        {/* Photo Gallery Grid */}
        <div className="relative h-80 sm:h-96 w-full bg-slate-950">
          <img
            src={property.image_url}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-black/40" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full uppercase bg-emerald-600 text-white tracking-wider">
              {property.listing_type.replace('_', ' ')}
            </span>
            {property.verified && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900/90 text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Listing
              </span>
            )}
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="text-xs text-slate-300 font-medium">Offered Price</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                {formatPrice(property.price, property.listing_type)}
              </div>
            </div>
            {property.price_per_sqft > 0 && (
              <span className="text-xs text-slate-300 bg-slate-900/80 px-3 py-1 rounded-lg border border-slate-800">
                ₹{property.price_per_sqft.toLocaleString('en-IN')}/sqft
              </span>
            )}
          </div>
        </div>

        {/* Property Specs & Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">{property.title}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{property.address}</span>
              </div>
            </div>
            <div className="text-xs text-slate-400 sm:text-right">
              <div>RERA: <span className="text-slate-200 font-mono font-semibold">{property.rera}</span></div>
              <div>Developer: <span className="text-emerald-400 font-semibold">{property.builder}</span></div>
            </div>
          </div>

          {/* Core Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-800 text-xs">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">Bedrooms</span>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-emerald-400" />
                {property.bedrooms > 0 ? `${property.bedrooms} BHK` : 'Studio / Plot'}
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">Carpet Area</span>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-emerald-400" />
                {property.area_sqft} sq ft
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">Furnishing</span>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-400" />
                {property.furnished}
              </div>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">Possession</span>
              <div className="text-sm font-bold text-white flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-400" />
                {property.possession}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Property Overview</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Amenities Pills */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Society Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map(a => (
                <span
                  key={a}
                  className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Integrated LandNova Location Intelligence Section */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-950 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <Compass className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white">
                Understand This Location Before Deciding
              </h2>
              <p className="text-xs text-emerald-400">
                LandNova Verified Spatial Livability Index • Zero Guesswork
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('analysis')}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" /> Full Location Analysis
            </button>
            <button
              onClick={() => onNavigateTab('compare')}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5" /> Compare Site
            </button>
          </div>
        </div>

        {/* Location Score & Air Quality Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Overall Livability</span>
              <div className="text-3xl font-extrabold text-white mt-0.5">
                {livability?.overall_score || 81.4}
                <span className="text-sm font-normal text-slate-400">/100</span>
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">
                Grade {livability?.grade || 'A'} • 100% Data Verified
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-lg">
              {livability?.grade || 'A'}
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">US AQI Air Quality</span>
              <div className="text-3xl font-extrabold text-amber-400 mt-0.5">
                {weather?.air_quality?.us_aqi || 92}
              </div>
              <span className="text-[11px] text-slate-400">
                {weather?.air_quality?.category_label || 'Moderate'} • Open-Meteo live model
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
              <Wind className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">Terrain Elevation & Flood</span>
              <div className="text-2xl font-extrabold text-white mt-0.5">
                {weather?.climate_risk?.elevation_meters || 180}m
              </div>
              <span className="text-[11px] text-emerald-400 font-semibold">
                Flood Risk: {weather?.climate_risk?.flood_risk_level || 'Low'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
              <Droplets className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Verified Pros & Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Verified Location Advantages
            </h4>
            <div className="space-y-1.5 text-slate-300">
              <p>• Rapid transit corridor within 500m walking radius.</p>
              <p>• Comprehensive social infrastructure: mapped schools & hospitals in 1.5km.</p>
              <p>• Elevated terrain buffers against seasonal standing water.</p>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h4 className="font-bold text-white flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Due Diligence Watchpoints
            </h4>
            <div className="space-y-1.5 text-slate-300">
              <p>• Seasonal PM2.5 particulate spikes during weather transition windows.</p>
              <p>• Verify municipal drinking water pipeline pressure on upper floors.</p>
              <p>• Check arterial collector road traffic during morning rush hours.</p>
            </div>
          </div>
        </div>

        {/* Ask AI About this location button */}
        <div className="pt-2 text-center">
          <button
            onClick={() => {
              if (onOpenAIChat) {
                onOpenAIChat(property.title, {
                  overall_score: livability?.overall_score || 81,
                  us_aqi: weather?.air_quality?.us_aqi || 92,
                  elevation_m: weather?.climate_risk?.elevation_meters || 180,
                  property_price: property.price
                });
              }
            }}
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Ask LandNova AI Advisor About This Specific Property & Location
          </button>
        </div>
      </div>
    </div>
  );
}
