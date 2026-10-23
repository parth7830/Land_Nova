'use client';

import React, { useState, useEffect } from 'react';
import {
  Compass,
  Users,
  Building2,
  ArrowRight,
  MapPin,
  Brain,
  BarChart3,
  Shield,
  Layers,
  ChevronRight,
  Sparkles,
  Flame,
  CheckCircle2
} from 'lucide-react';

import Navbar from '@/components/Navbar';
import BuyerHome from '@/components/BuyerHome';
import PersonaPreferences from '@/components/PersonaPreferences';
import HeatmapExplorer from '@/components/HeatmapExplorer';
import PropertyDetail from '@/components/PropertyDetail';
import DeveloperHome from '@/components/DeveloperHome';
import DeveloperSiteReportView from '@/components/DeveloperSiteReportView';
import AnalysisView from '@/components/AnalysisView';
import ComparisonView from '@/components/ComparisonView';
import AIAdvisorView from '@/components/AIAdvisorView';
import ChatWidget from '@/components/ChatWidget';

import {
  LocationItem,
  PropertyListing,
  AmenitiesResponse,
  WeatherClimateResponse,
  LivabilityResponse,
  DeveloperSiteReport
} from '@/types';

import {
  fetchAmenities,
  fetchWeatherAndClimate,
  fetchLivabilityAssessment,
  fetchDeveloperSiteReport
} from '@/lib/api';

export default function Home() {
  // Navigation State
  const [currentRole, setCurrentRole] = useState<'gateway' | 'buyer' | 'developer'>('gateway');
  const [currentView, setCurrentView] = useState<string>('home');

  // Selected Location (Default: Sector 62, Noida)
  const [currentLocation, setCurrentLocation] = useState<LocationItem>({
    id: 'sector-62-noida',
    display_name: 'Sector 62, Noida, Uttar Pradesh, India',
    locality: 'Sector 62',
    city: 'Noida',
    state: 'Uttar Pradesh',
    country: 'India',
    latitude: 28.6280,
    longitude: 77.3649,
    bounding_box: [28.618, 28.638, 77.354, 77.375],
    is_demo: true,
    source: 'Verified Benchmark Index'
  });

  // Selected Property for Buyer Details View
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);

  // Core Data States
  const [amenities, setAmenities] = useState<AmenitiesResponse | null>(null);
  const [weather, setWeather] = useState<WeatherClimateResponse | null>(null);
  const [livability, setLivability] = useState<LivabilityResponse | null>(null);
  const [siteReport, setSiteReport] = useState<DeveloperSiteReport | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Active persona for heatmap
  const [activePersona, setActivePersona] = useState<string>('family');

  // Default to Page 1: Role Gateway so user can always pick their role
  // We keep localStorage updated when they choose, but do not bypass the gateway on entry
  useEffect(() => {
    // Check if URL has an explicit ?role= parameter, otherwise show gateway
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRole = params.get('role');
      if (urlRole === 'buyer' || urlRole === 'developer') {
        setCurrentRole(urlRole);
      }
    }
  }, []);

  // Fetch location data whenever currentLocation changes
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [amenitiesRes, weatherRes, livabilityRes] = await Promise.all([
          fetchAmenities(currentLocation.id, currentLocation.latitude, currentLocation.longitude),
          fetchWeatherAndClimate(currentLocation.id, currentLocation.latitude, currentLocation.longitude),
          fetchLivabilityAssessment(
            currentLocation.id,
            currentLocation.latitude,
            currentLocation.longitude,
            currentLocation.display_name
          )
        ]);

        if (!isCancelled) {
          setAmenities(amenitiesRes);
          setWeather(weatherRes);
          setLivability(livabilityRes);
        }
      } catch (err) {
        console.error('Failed to load location metrics', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      isCancelled = true;
    };
  }, [currentLocation]);

  // Handle switching role
  const handleSelectRole = (role: 'buyer' | 'developer') => {
    setCurrentRole(role);
    setCurrentView('home');
    if (typeof window !== 'undefined') {
      localStorage.setItem('landnova_role', role);
    }
  };

  // Launch Developer Site Report
  const handleLaunchSiteReport = async (params: {
    projectType: string;
    budgetBracket: string;
    targetAudience: string;
    scaleAcres: number;
  }) => {
    setLoading(true);
    try {
      const rep = await fetchDeveloperSiteReport({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        display_name: currentLocation.display_name,
        city: currentLocation.city || 'Noida',
        project_type: params.projectType,
        budget_bracket: params.budgetBracket,
        target_audience: params.targetAudience,
        scale_acres: params.scaleAcres
      });
      setSiteReport(rep);
      setCurrentView('site-report');
    } catch (err) {
      console.error('Failed to generate site report', err);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // VIEW 1: PAGE 1 - ROLE GATEWAY
  // ==========================================
  if (currentRole === 'gateway') {
    return (
      <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans">
        {/* Top Header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <Compass className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <span className="text-lg font-bold tracking-tight">
              LANDNOVA
              <span className="ml-2 text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                AI
              </span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Demo Mode: You are free to proceed without mandatory login.')}
              className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => handleSelectRole('buyer')}
              className="px-4 py-2 text-xs bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition-colors text-white"
            >
              Sign Up
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-6xl mx-auto w-full">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                <Compass className="w-8 h-8 text-white stroke-[2]" />
              </div>
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight mb-4">
              LAND<span className="text-emerald-400">NOVA</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-300 font-semibold mb-3">
              The Location Is the Decision.
            </p>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto leading-relaxed">
              AI-powered location intelligence platform for smarter real estate decisions.
              Providing structured, source-labeled location intelligence for buyers, renters, and real estate developers.
            </p>
          </div>

          {/* Two Large Selectable Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl w-full mb-16">
            {/* Buyer / Renter Card */}
            <div
              onClick={() => handleSelectRole('buyer')}
              className="group cursor-pointer relative p-8 rounded-3xl border-2 border-slate-800 hover:border-emerald-500 bg-slate-900/60 hover:bg-slate-900/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-emerald-950/30 text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Users className="w-7 h-7 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                  I&apos;m a Buyer / Renter
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  Explore properties with verified livability scores, air quality index, transit access,
                  and generate personalized spatial heatmaps based on your lifestyle persona.
                </p>
              </div>

              <div className="flex items-center text-emerald-400 text-xs sm:text-sm font-semibold group-hover:gap-2 transition-all">
                Enter Buyer Flow <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>

            {/* Developer Card */}
            <div
              onClick={() => handleSelectRole('developer')}
              className="group cursor-pointer relative p-8 rounded-3xl border-2 border-slate-800 hover:border-amber-500 bg-slate-900/60 hover:bg-slate-900/90 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-950/30 text-left flex flex-col justify-between"
            >
              <div>
                <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                  <Building2 className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                  I&apos;m a Real Estate Developer
                </h3>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed mb-6">
                  Analyze sites end-to-end: soil properties (ISRIC SoilGrids), seismic risk (USGS/BIS),
                  climate normals (Open-Meteo), groundwater, demographic needs, and AI engineering guidance.
                </p>
              </div>

              <div className="flex items-center text-amber-400 text-xs sm:text-sm font-semibold group-hover:gap-2 transition-all">
                Enter Developer Flow <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </div>
          </div>

          {/* Core Problem Statement Section */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 max-w-4xl w-full mb-16 shadow-xl">
            <h3 className="text-base font-bold text-white mb-3 text-center uppercase tracking-wider">
              The Real Estate Intelligence Problem
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-center max-w-2xl mx-auto">
              Real estate developers have no single tool that analyzes a location end-to-end
              (soil, groundwater, seismic risk, climate, local resources, connectivity, resident profile and needs)
              to decide <strong className="text-white">WHERE to build</strong> and <strong className="text-white">WHAT to build</strong>.
              Buyers and renters only see listing photos and prices, with no real analysis of the neighborhood.
            </p>
            <div className="mt-4 pt-4 border-t border-slate-800 text-center">
              <span className="text-xs text-emerald-400 font-semibold">
                LandNova solves this by providing structured, source-labeled location intelligence for both groups.
              </span>
            </div>
          </div>

          {/* How LandNova Works: 4 Pillars */}
          <div className="max-w-4xl w-full mb-16">
            <h3 className="text-sm font-bold text-white mb-6 text-center uppercase tracking-wider">
              How LandNova Works
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { step: '1', title: 'One Location', desc: 'Pick any coordinates or address across India' },
                { step: '2', title: 'Multiple Data Layers', desc: 'OpenStreetMap, Open-Meteo, Copernicus & USGS' },
                { step: '3', title: 'Intelligent Analysis', desc: 'Deterministic 5-factor scoring + Gemini AI insights' },
                { step: '4', title: 'Personalized Decisions', desc: 'Persona-weighted heatmaps and site feasibility' }
              ].map(item => (
                <div key={item.step} className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-center">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center mx-auto mb-2">
                    {item.step}
                  </div>
                  <h4 className="text-xs font-bold text-white mb-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Verified Data Sources Badges */}
          <div className="text-center space-y-3">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Grounded in Verified Public Datasets
            </h4>
            <div className="flex flex-wrap justify-center gap-2 max-w-2xl mx-auto">
              {[
                'OpenStreetMap Overpass API',
                'Open-Meteo Air Quality (CAMS)',
                'ISRIC SoilGrids 250m Global Model',
                'USGS Earthquake Hazards Program',
                'Bureau of Indian Standards (BIS IS 1893)',
                'Copernicus GLO-30 Elevation Model',
                'Census of India District Benchmarks',
                'Google Gemini AI Location Advisor'
              ].map(src => (
                <span
                  key={src}
                  className="px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] text-slate-400 font-medium"
                >
                  {src}
                </span>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 px-6 py-6 text-center text-xs text-slate-500">
          LandNova — The Location Is the Decision • Made for CU Hackathon 2026
        </footer>
      </div>
    );
  }

  // ==========================================
  // OPERATIONAL VIEW: BUYER OR DEVELOPER FLOWS
  // ==========================================
  return (
    <div className="min-h-screen bg-[#090d16] text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Role-Aware Persistent Navbar */}
      <Navbar
        currentRole={currentRole}
        onSwitchRole={(newRole) => {
          setCurrentRole(newRole);
          setCurrentView('home');
          if (typeof window !== 'undefined') {
            localStorage.setItem('landnova_role', newRole);
          }
        }}
        currentView={currentView}
        onNavigateView={(v) => {
          setSelectedProperty(null);
          setCurrentView(v);
        }}
        selectedLocation={currentLocation}
        onSelectLocation={(loc) => setCurrentLocation(loc)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* BUYER FLOW VIEWS */}
        {currentRole === 'buyer' && (
          <>
            {/* Page 2: Buyer Home */}
            {currentView === 'home' && !selectedProperty && (
              <BuyerHome
                onSelectProperty={(p) => {
                  setSelectedProperty(p);
                  setCurrentView('property-detail');
                }}
                onOpenHeatmap={() => setCurrentView('preferences')}
                selectedCity={currentLocation.city}
                onSelectLocation={(loc) => setCurrentLocation(loc)}
              />
            )}

            {/* Property Detail with Location Analysis */}
            {currentView === 'property-detail' && selectedProperty && (
              <PropertyDetail
                property={selectedProperty}
                onBack={() => {
                  setSelectedProperty(null);
                  setCurrentView('home');
                }}
                livability={livability}
                weather={weather}
                onNavigateTab={(tab) => setCurrentView(tab)}
              />
            )}

            {/* Page 3: Persona & Preferences */}
            {currentView === 'preferences' && (
              <PersonaPreferences
                onGenerateHeatmap={(prefs) => {
                  setActivePersona(prefs.persona);
                  setCurrentView('heatmap');
                }}
                initialCity={currentLocation.city || 'Noida'}
              />
            )}

            {/* Page 4: Heatmap Explorer */}
            {currentView === 'heatmap' && (
              <HeatmapExplorer
                currentLocation={currentLocation}
                initialPersona={activePersona}
                onNavigateTab={(tab) => setCurrentView(tab)}
              />
            )}

            {/* Reusable Analysis View */}
            {currentView === 'analysis' && (
              <AnalysisView
                currentLocation={currentLocation}
                livability={livability}
                weather={weather}
                onRecalculateWithWeights={async (weights) => {
                  const updated = await fetchLivabilityAssessment(
                    currentLocation.id,
                    currentLocation.latitude,
                    currentLocation.longitude,
                    currentLocation.display_name,
                    weights
                  );
                  setLivability(updated);
                }}
                onNavigateTab={(tab) => setCurrentView(tab)}
              />
            )}

            {/* Comparison View */}
            {currentView === 'compare' && (
              <ComparisonView
                currentLocation={currentLocation}
                onSelectMainLocation={(loc) => setCurrentLocation(loc)}
              />
            )}

            {/* AI Advisor View */}
            {currentView === 'advisor' && (
              <AIAdvisorView
                currentLocation={currentLocation}
                livability={livability}
                weather={weather}
                amenities={amenities}
              />
            )}
          </>
        )}

        {/* DEVELOPER FLOW VIEWS */}
        {currentRole === 'developer' && (
          <>
            {/* Developer Home */}
            {currentView === 'home' && (
              <DeveloperHome
                currentLocation={currentLocation}
                onNavigateView={(v) => setCurrentView(v)}
                onLaunchSiteReport={handleLaunchSiteReport}
              />
            )}

            {/* 12-Section Site Report View */}
            {currentView === 'site-report' && siteReport && (
              <DeveloperSiteReportView
                report={siteReport}
                onBack={() => setCurrentView('home')}
                onNavigateView={(v) => setCurrentView(v)}
              />
            )}

            {/* Developer Heatmap Explorer */}
            {currentView === 'heatmap' && (
              <HeatmapExplorer
                currentLocation={currentLocation}
                initialPersona="working_professional"
                onNavigateTab={(tab) => setCurrentView(tab)}
              />
            )}

            {/* Compare Sites View */}
            {currentView === 'compare' && (
              <ComparisonView
                currentLocation={currentLocation}
                onSelectMainLocation={(loc) => setCurrentLocation(loc)}
              />
            )}

            {/* AI Advisor View */}
            {currentView === 'advisor' && (
              <AIAdvisorView
                currentLocation={currentLocation}
                livability={livability}
                weather={weather}
                amenities={amenities}
              />
            )}
          </>
        )}
      </main>

      {/* Floating AI Chatbot Widget (Always available across views) */}
      <ChatWidget
        currentLocationName={currentLocation.display_name.split(',')[0]}
        currentLocationContext={{
          overall_score: livability?.overall_score || 81,
          us_aqi: weather?.air_quality?.us_aqi || 92,
          elevation_m: weather?.climate_risk?.elevation_meters || 180,
          flood_risk_level: weather?.climate_risk?.flood_risk_level || 'Low'
        }}
        userPersona={currentRole === 'developer' ? 'builder_developer' : 'home_buyer'}
      />
    </div>
  );
}
