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
      {/* Hero Banner (Clean Light Theme) */}
      <div className="relative rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-white border border-emerald-100 p-8 sm:p-10 overflow-hidden shadow-xs">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            AI-Powered Location Intelligence for Buyers & Renters
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Find the Right Property in the{' '}
            <span className="text-emerald-600">Right Location</span>.
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Every property is analyzed with LandNova&apos;s verified 5-factor Livability Index:
            transit access, civic amenities, air quality, safety infrastructure, and flood resilience.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenHeatmap}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs sm:text-sm shadow-sm flex items-center gap-2 transition-all hover:scale-102"
            >
              <Flame className="w-4 h-4 text-amber-300" />
              Explore Persona Heatmap Explorer
              <ArrowRight className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500">
              Personalized to your family, commute, or lifestyle.
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white border border-slate-200 p-4 rounded-2xl shadow-xs">
        {/* Type Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Properties' },
            { id: 'buy', label: 'Buy' },
            { id: 'rent', label: 'Rent' },
            { id: 'new_project', label: 'New Projects' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveListingType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors shrink-0 ${
                activeListingType === tab.id
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
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
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-semibold'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
              }`}
            >
              {c === 'all' ? 'All Hubs' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Illustrative Notice Pill */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span className="font-semibold text-slate-800 flex items-center gap-2">
          Hot Selling Properties
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-medium">
            {listings.length} Available
          </span>
        </span>
        <span className="text-[11px] text-slate-400 italic">
          Sample listings (illustrative demo data) • Verified livability scoring
        </span>
      </div>

      {/* Property Grid (Crisp White Cards) */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-80 rounded-2xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200">
          <Home className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No properties match your filter</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the city or price filter parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(prop => (
            <div
              key={prop.id}
              onClick={() => onSelectProperty(prop)}
              className="group cursor-pointer rounded-2xl bg-white border border-slate-200 hover:border-emerald-500 shadow-xs hover:shadow-md overflow-hidden transition-all duration-200 flex flex-col"
            >
              {/* Photo & Badges */}
              <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                <img
                  src={prop.image_url}
                  alt={prop.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    prop.listing_type === 'rent'
                      ? 'bg-sky-600 text-white'
                      : prop.listing_type === 'new_project'
                      ? 'bg-amber-500 text-slate-900'
                      : 'bg-emerald-600 text-white'
                  }`}>
                    {prop.listing_type.replace('_', ' ')}
                  </span>
                  {prop.verified && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/95 text-emerald-700 shadow-xs flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  )}
                </div>

                {/* LandNova Score Pill */}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl px-2.5 py-1 flex items-center gap-1.5 shadow-xs">
                  <span className="text-[10px] text-slate-600 font-medium">Livability:</span>
                  <span className="text-xs font-bold text-emerald-700">
                    {prop.livability_score}/100
                  </span>
                </div>

                {/* Bottom Overlay Info */}
                <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white">
                  <div className="text-lg font-extrabold tracking-tight">
                    {formatPrice(prop.price, prop.listing_type)}
                  </div>
                  {prop.price_per_sqft > 0 && (
                    <div className="text-[11px] text-slate-200">
                      ₹{prop.price_per_sqft.toLocaleString('en-IN')}/sqft
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                    {prop.title}
                  </h3>
                  <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate">{prop.locality}, {prop.city}</span>
                  </div>
                </div>

                {/* Specs Row */}
                <div className="flex items-center justify-between py-2 border-y border-slate-100 text-slate-600 text-xs">
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
                  <div className="flex items-center gap-1 text-slate-500">
                    <Building className="w-3.5 h-3.5" />
                    <span>{prop.possession}</span>
                  </div>
                </div>

                {/* Bottom CTA */}
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-500 truncate max-w-[150px]">
                    {prop.builder}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform">
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
