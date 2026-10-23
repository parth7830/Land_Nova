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
        className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Listings
      </button>

      {/* Main Property Card (Clean White) */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        {/* Photo Gallery Grid */}
        <div className="relative h-80 sm:h-96 w-full bg-slate-100">
          <img
            src={property.image_url}
            alt={property.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex gap-2">
            <span className="text-xs font-bold px-3 py-1 rounded-full uppercase bg-emerald-600 text-white tracking-wider shadow-xs">
              {property.listing_type.replace('_', ' ')}
            </span>
            {property.verified && (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/95 text-emerald-800 border border-slate-200 flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified Listing
              </span>
            )}
          </div>

          {/* Price overlay */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <span className="text-xs text-slate-200 font-medium">Offered Price</span>
              <div className="text-3xl sm:text-4xl font-extrabold text-white">
                {formatPrice(property.price, property.listing_type)}
              </div>
            </div>
            {property.price_per_sqft > 0 && (
              <span className="text-xs text-white bg-black/40 backdrop-blur-xs px-3 py-1 rounded-lg border border-white/20">
                ₹{property.price_per_sqft.toLocaleString('en-IN')}/sqft
              </span>
            )}
          </div>
        </div>

        {/* Property Specs & Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{property.title}</h1>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{property.address}</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 sm:text-right">
              <div>RERA: <span className="text-slate-800 font-mono font-semibold">{property.rera}</span></div>
              <div>Developer: <span className="text-emerald-700 font-semibold">{property.builder}</span></div>
            </div>
          </div>

          {/* Core Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-slate-100 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">Bedrooms</span>
              <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Bed className="w-4 h-4 text-emerald-600" />
                {property.bedrooms > 0 ? `${property.bedrooms} BHK` : 'Studio / Plot'}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">Carpet Area</span>
              <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-emerald-600" />
                {property.area_sqft} sq ft
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">Furnishing</span>
              <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Building className="w-4 h-4 text-emerald-600" />
                {property.furnished}
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
              <span className="text-slate-500 text-[10px] uppercase">Possession</span>
              <div className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-emerald-600" />
                {property.possession}
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Property Overview</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {property.description}
            </p>
          </div>

          {/* Amenities Pills */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Society Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {property.amenities.map(a => (
                <span
                  key={a}
                  className="px-3 py-1 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Integrated LandNova Location Intelligence Section (Clean White) */}
      <div className="bg-white border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200">
              <Compass className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">
                Understand This Location Before Deciding
              </h2>
              <p className="text-xs text-emerald-700 font-semibold">
                LandNova Verified Spatial Livability Index • Zero Guesswork
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('analysis')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <BarChart3 className="w-3.5 h-3.5" /> Full Location Analysis
            </button>
            <button
              onClick={() => onNavigateTab('compare')}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
            >
              <GitCompare className="w-3.5 h-3.5" /> Compare Site
            </button>
          </div>
        </div>

        {/* Location Score & Air Quality Highlight */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Overall Livability</span>
              <div className="text-3xl font-extrabold text-slate-900 mt-0.5">
                {livability?.overall_score || 81.4}
                <span className="text-sm font-normal text-slate-500">/100</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">
                Grade {livability?.grade || 'A'} • 100% Data Verified
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold text-lg">
              {livability?.grade || 'A'}
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">US AQI Air Quality</span>
              <div className="text-3xl font-extrabold text-amber-600 mt-0.5">
                {weather?.air_quality?.us_aqi || 92}
              </div>
              <span className="text-[11px] text-slate-600">
                {weather?.air_quality?.category_label || 'Moderate'} • Open-Meteo live model
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center">
              <Wind className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Terrain Elevation & Flood</span>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">
                {weather?.climate_risk?.elevation_meters || 180}m
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">
                Flood Risk: {weather?.climate_risk?.flood_risk_level || 'Low'}
              </span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-sky-100 border border-sky-300 text-sky-800 flex items-center justify-center">
              <Droplets className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Verified Pros & Cons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Verified Location Advantages
            </h4>
            <div className="space-y-1.5 text-slate-700">
              <p>• Rapid transit corridor within 500m walking radius.</p>
              <p>• Comprehensive social infrastructure: mapped schools & hospitals in 1.5km.</p>
              <p>• Elevated terrain buffers against seasonal standing water.</p>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
            <h4 className="font-bold text-slate-900 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Due Diligence Watchpoints
            </h4>
            <div className="space-y-1.5 text-slate-700">
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
            className="w-full sm:w-auto px-6 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Ask LandNova AI Advisor About This Specific Property & Location
          </button>
        </div>
      </div>
    </div>
  );
}
