'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  Smile,
  Sliders,
  Check,
  Flame,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  MapPin,
  Compass,
  Train,
  CheckSquare
} from 'lucide-react';
import { PersonaProfile } from '@/types';
import { fetchPersonas } from '@/lib/api';

interface PersonaPreferencesProps {
  onGenerateHeatmap: (preferences: {
    persona: string;
    weights: Record<string, number>;
    listingType: 'buy' | 'rent';
    priceRange: [number, number];
    connectivityImportance: 'low' | 'medium' | 'high';
    requiredAmenities: string[];
    nativeLanguage?: string;
  }) => void;
  initialCity?: string;
}

export default function PersonaPreferences({
  onGenerateHeatmap,
  initialCity = 'Noida'
}: PersonaPreferencesProps) {
  const [personas, setPersonas] = useState<PersonaProfile[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('family');
  const [weights, setWeights] = useState<Record<string, number>>({
    connectivity: 0.15,
    amenities: 0.30,
    environment: 0.25,
    safety: 0.20,
    climate_flood: 0.10
  });

  const [listingType, setListingType] = useState<'buy' | 'rent'>('buy');
  const [maxPrice, setMaxPrice] = useState<number>(12000000);
  const [connectivityImportance, setConnectivityImportance] = useState<'low' | 'medium' | 'high'>('medium');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'hospital', 'school', 'park', 'market'
  ]);
  const [preferredLanguage, setPreferredLanguage] = useState<string>('Hindi / English');

  useEffect(() => {
    async function load() {
      const data = await fetchPersonas();
      setPersonas(data);
      if (data.length > 0) {
        const initial = data.find(p => p.id === 'family') || data[0];
        setSelectedPersonaId(initial.id);
        setWeights(initial.weights);
        setConnectivityImportance(initial.filters_defaults.connectivity_importance);
        setSelectedAmenities(initial.filters_defaults.preferred_amenities);
      }
    }
    load();
  }, []);

  const handlePersonaSelect = (p: PersonaProfile) => {
    setSelectedPersonaId(p.id);
    setWeights(p.weights);
    setConnectivityImportance(p.filters_defaults.connectivity_importance);
    setSelectedAmenities(p.filters_defaults.preferred_amenities);
  };

  const handleWeightChange = (key: string, val: number) => {
    setWeights(prev => ({ ...prev, [key]: val }));
  };

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const allAvailableAmenities = [
    { id: 'hospital', label: 'Multi-Specialty Hospital' },
    { id: 'school', label: 'Reputed Schools (CBSE/ICSE)' },
    { id: 'college', label: 'Colleges & Universities' },
    { id: 'market', label: 'Daily Supermarket / Fresh Market' },
    { id: 'mall', label: 'Shopping Mall & Cinema' },
    { id: 'sports', label: 'Sports Complex / Gym' },
    { id: 'entertainment', label: 'Nightlife & Restaurants' },
    { id: 'park', label: 'Green Public Parks & Walking Tracks' }
  ];

  const handleProceed = () => {
    onGenerateHeatmap({
      persona: selectedPersonaId,
      weights,
      listingType,
      priceRange: [0, maxPrice],
      connectivityImportance,
      requiredAmenities: selectedAmenities,
      nativeLanguage: preferredLanguage
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          Persona & Preferences Setup
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Personalize Your Location Heatmap
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 max-w-xl mx-auto">
          Choose a lifestyle persona. LandNova preloads verified factor weights and priorities,
          which you can customize before generating the spatial heatmap.
        </p>
      </div>

      {/* Step 1: Choose Persona */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">1</span>
          Select Your Persona
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {personas.map(p => {
            const isSelected = selectedPersonaId === p.id;
            const Icon = p.id === 'family' ? Users : p.id === 'working_professional' ? Briefcase : Smile;

            return (
              <div
                key={p.id}
                onClick={() => handlePersonaSelect(p)}
                className={`cursor-pointer rounded-2xl p-5 border-2 transition-all ${
                  isSelected
                    ? 'bg-emerald-50/70 border-emerald-500 shadow-md scale-[1.01]'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <h4 className="text-sm font-bold text-slate-900 mb-1">{p.label}</h4>
                <p className="text-xs text-slate-600 leading-relaxed mb-3">{p.description}</p>

                <div className="pt-2 border-t border-slate-200/60 text-[10px] text-slate-500 flex flex-wrap gap-1">
                  {p.priority_amenities.map(pa => (
                    <span key={pa} className="px-1.5 py-0.5 bg-white rounded text-slate-600 border border-slate-200">
                      {pa}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Editable Weight Sliders */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-600" />
            Configurable Scoring Weights for {selectedPersonaId.replace('_', ' ').toUpperCase()}
          </h4>
          <span className="text-[11px] text-slate-500">Sum of weights: {(Object.values(weights).reduce((a, b) => a + b, 0)).toFixed(2)}</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { key: 'connectivity', label: 'Transit & Connectivity' },
            { key: 'amenities', label: 'Social Amenities (Schools/Hospitals)' },
            { key: 'environment', label: 'Environmental Quality & AQI' },
            { key: 'safety', label: 'Civic Safety Infrastructure' },
            { key: 'climate_flood', label: 'Flood & Climate Resilience' }
          ].map(factor => (
            <div key={factor.key} className="space-y-1">
              <div className="flex justify-between text-xs text-slate-700">
                <span>{factor.label}</span>
                <span className="font-mono text-emerald-700 font-bold">{Math.round((weights[factor.key] || 0.2) * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.60"
                step="0.05"
                value={weights[factor.key] || 0.2}
                onChange={(e) => handleWeightChange(factor.key, parseFloat(e.target.value))}
                className="w-full accent-emerald-600 h-1.5 bg-slate-100 rounded-lg cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Step 2: Preference Inputs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">2</span>
          Budget & Amenity Filters
        </h3>

        {/* Buy / Rent & Price Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800">Budget Limit</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setListingType('buy');
                  setMaxPrice(12000000);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  listingType === 'buy' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Buy
              </button>
              <button
                type="button"
                onClick={() => {
                  setListingType('rent');
                  setMaxPrice(35000);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  listingType === 'rent' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                Rent
              </button>
            </div>
          </div>

          <div className="flex justify-between items-center text-xs text-emerald-700 font-bold">
            <span>₹0</span>
            <span>
              {listingType === 'buy'
                ? `Up to ₹${(maxPrice / 100000).toFixed(0)} Lakhs`
                : `Up to ₹${maxPrice.toLocaleString('en-IN')}/month`}
            </span>
          </div>

          <input
            type="range"
            min={listingType === 'buy' ? 1000000 : 10000}
            max={listingType === 'buy' ? 60000000 : 100000}
            step={listingType === 'buy' ? 500000 : 2500}
            value={maxPrice}
            onChange={(e) => setMaxPrice(parseInt(e.target.value))}
            className="w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer"
          />
        </div>

        {/* Connectivity Importance */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <Train className="w-3.5 h-3.5 text-sky-600" />
            Connectivity Importance (Metro / Highway Proximity)
          </label>
          <div className="grid grid-cols-3 gap-3">
            {(['low', 'medium', 'high'] as const).map(level => (
              <button
                key={level}
                type="button"
                onClick={() => setConnectivityImportance(level)}
                className={`py-2 text-xs font-medium rounded-xl border transition-colors capitalize ${
                  connectivityImportance === level
                    ? 'bg-emerald-600 text-white border-emerald-600 font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Required Amenities Checklist */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
            <CheckSquare className="w-3.5 h-3.5 text-emerald-600" />
            Required Amenities Checklist
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {allAvailableAmenities.map(amenity => {
              const isChecked = selectedAmenities.includes(amenity.id);
              return (
                <div
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`cursor-pointer flex items-center gap-2.5 p-2.5 rounded-xl border text-xs transition-colors ${
                    isChecked
                      ? 'bg-emerald-50/70 border-emerald-300 text-slate-900 font-medium'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                    isChecked ? 'bg-emerald-600 text-white' : 'border border-slate-300 bg-white'
                  }`}>
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span>{amenity.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Generate Heatmap CTA */}
      <div className="text-center pt-2">
        <button
          onClick={handleProceed}
          className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md flex items-center justify-center gap-3 mx-auto transition-all hover:scale-102"
        >
          <Flame className="w-5 h-5 text-amber-300" />
          Generate Spatial Suitability Heatmap
          <ArrowRight className="w-4 h-4" />
        </button>
        <p className="text-[11px] text-slate-500 mt-2">
          Samples coordinates across {initialCity} and computes persona-weighted scores in real-time.
        </p>
      </div>
    </div>
  );
}
