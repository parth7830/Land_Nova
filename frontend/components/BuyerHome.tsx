'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Bed,
  Bath,
  Ruler,
  Building,
  Flame,
  Search,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  SlidersHorizontal,
  Home,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { PropertyListing, LocationItem } from '@/types';
import { fetchListings } from '@/lib/api';

interface BuyerHomeProps {
  onSelectProperty: (property: PropertyListing) => void;
  onOpenHeatmap: () => void;
  selectedCity?: string;
  onSelectLocation: (loc: LocationItem) => void;
}

export default function BuyerHome({
  onSelectProperty,
  onOpenHeatmap,
  selectedCity,
  onSelectLocation
}: BuyerHomeProps) {
  const [listings, setListings] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeListingType, setActiveListingType] = useState<string>('all');
  const [activeCity, setActiveCity] = useState<string>(selectedCity || 'all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const filters: any = {};
        if (activeListingType !== 'all') filters.listing_type = activeListingType;
        if (activeCity !== 'all') filters.city = activeCity;
        if (searchQuery.trim()) filters.q = searchQuery.trim();

        const data = await fetchListings(filters);
        setListings(data.listings);
      } catch (err) {
        console.error('Failed to load listings', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [activeListingType, activeCity, searchQuery]);

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
    <div className="space-y-8 pb-16">
      {/* Hero Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 border border-slate-800 p-8 sm:p-12 overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered Location Intelligence for Buyers & Renters
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Don&apos;t Just Pick a Property. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-sky-400">
              Pick the Right Location.
            </span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Every property below is enriched with LandNova&apos;s 5-factor verified Livability Index
            (transit, amenities, AQI air quality, civic safety, and flood risk).
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenHeatmap}
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-950/40 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              Explore Persona Heatmap Explorer
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-400">
              Personalized to your family, commute, or lifestyle profile.
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Properties' },
            { id: 'buy', label: 'Buy' },
            { id: 'rent', label: 'Rent' },
            { id: 'new_project', label: 'New Projects' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveListingType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                activeListingType === tab.id
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* City Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {['all', 'Noida', 'Delhi', 'Bengaluru', 'Mumbai', 'Hyderabad'].map(c => (
            <button
              key={c}
              onClick={() => setActiveCity(c)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
                activeCity.toLowerCase() === c.toLowerCase()
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/40'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {c === 'all' ? 'All Hubs' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Illustrative Notice Pill */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <span className="font-semibold text-slate-200 flex items-center gap-2">
          Hot Selling Properties
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {listings.length} Available
          </span>
        </span>
        <span className="text-[11px] text-slate-500 italic">
          Sample listings (illustrative demo data) • Structured behind pluggable service interface
        </span>
      </div>

      {/* Property Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 rounded-2xl bg-slate-900 border border-slate-800 animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
          <Home className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No properties match your filter</h3>
          <p className="text-xs text-slate-400 mt-1">Try resetting the city or price filter parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(prop => (
            <div
              key={prop.id}
              onClick={() => onSelectProperty(prop)}
              className="group cursor-pointer rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 shadow-lg hover:shadow-xl hover:shadow-emerald-950/20 overflow-hidden transition-all duration-300 flex flex-col"
            >
              {/* Photo & Badges */}
              <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
                <img
                  src={prop.image_url}
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    prop.listing_type === 'rent'
                      ? 'bg-sky-500/90 text-white'
                      : prop.listing_type === 'new_project'
                      ? 'bg-amber-500/90 text-slate-950'
                      : 'bg-emerald-600/90 text-white'
                  }`}>
                    {prop.listing_type.replace('_', ' ')}
                  </span>
                  {prop.verified && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-900/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>

                {/* LandNova Score Pill */}
                <div className="absolute top-3 right-3 bg-slate-900/90 backdrop-blur-md border border-emerald-500/40 rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-md">
                  <span className="text-[10px] text-slate-300 font-medium">Livability:</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {prop.livability_score}/100
                  </span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                  <div className="text-lg font-extrabold tracking-tight">
                    {formatPrice(prop.price, prop.listing_type)}
                  </div>
                  {prop.price_per_sqft > 0 && (
                    <div className="text-[11px] text-slate-300">
                      ₹{prop.price_per_sqft.toLocaleString('en-IN')}/sqft
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                    {prop.title}
                  </h3>
                  <div className="flex items-center gap-1 text-slate-400 text-xs mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{prop.locality}, {prop.city}</span>
                  </div>
                </div>

                {/* Specs Row */}
                <div className="flex items-center justify-between py-2 border-y border-slate-800/80 text-slate-300 text-xs">
                  {prop.bedrooms > 0 && (
                    <div className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-slate-400" />
                      <span>{prop.bedrooms} BHK</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-slate-400" />
                    <span>{prop.area_sqft} sqft</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <Building className="w-3.5 h-3.5" />
                    <span>{prop.possession}</span>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                    {prop.builder}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 group-hover:translate-x-0.5 transition-transform">
                    Location Analysis <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
