'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import LandingPage from '@/components/LandingPage';
import DashboardView from '@/components/DashboardView';
import AnalysisView from '@/components/AnalysisView';
import AIAdvisorView from '@/components/AIAdvisorView';
import ComparisonView from '@/components/ComparisonView';
import BuilderView from '@/components/BuilderView';
import {
  LocationItem,
  AmenitiesResponse,
  WeatherClimateResponse,
  LivabilityResponse,
  BuilderSuitabilityResponse
} from '@/types';
import {
  searchLocations,
  fetchAmenities,
  fetchWeatherAndClimate,
  fetchLivabilityAssessment,
  fetchBuilderSuitability
} from '@/lib/api';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  
  // Default signature location: Sector 62, Noida
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

  const [amenities, setAmenities] = useState<AmenitiesResponse | null>(null);
  const [weather, setWeather] = useState<WeatherClimateResponse | null>(null);
  const [livability, setLivability] = useState<LivabilityResponse | null>(null);
  const [builderData, setBuilderData] = useState<BuilderSuitabilityResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Load location data when currentLocation changes
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [amenitiesRes, weatherRes, livabilityRes, builderRes] = await Promise.all([
          fetchAmenities(currentLocation.id, currentLocation.latitude, currentLocation.longitude),
          fetchWeatherAndClimate(currentLocation.id, currentLocation.latitude, currentLocation.longitude),
          fetchLivabilityAssessment(
            currentLocation.id,
            currentLocation.latitude,
            currentLocation.longitude,
            currentLocation.display_name
          ),
          fetchBuilderSuitability(
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
          setBuilderData(builderRes);
        }
      } catch (err) {
        console.error('Failed to load location data', err);
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

  const handleRecalculateWeights = async (weights: any) => {
    const updated = await fetchLivabilityAssessment(
      currentLocation.id,
      currentLocation.latitude,
      currentLocation.longitude,
      currentLocation.display_name,
      weights
    );
    setLivability(updated);
  };

  const handleRefreshBuilder = async (type: string, budget: string, audience: string) => {
    const updated = await fetchBuilderSuitability(
      currentLocation.id,
      currentLocation.latitude,
      currentLocation.longitude,
      currentLocation.display_name,
      type,
      budget,
      audience
    );
    setBuilderData(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        selectedLocationName={currentLocation.display_name}
        isDemoMode={currentLocation.is_demo}
      />

      <main className="flex-1">
        {currentTab === 'landing' && (
          <LandingPage
            onStartAnalysis={(loc) => {
              if (loc) setCurrentLocation(loc);
              setCurrentTab('dashboard');
            }}
            onOpenBuilder={() => setCurrentTab('builder')}
            onOpenCompare={() => setCurrentTab('compare')}
          />
        )}

        {currentTab !== 'landing' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {currentTab === 'dashboard' && (
              <DashboardView
                currentLocation={currentLocation}
                onSelectLocation={(loc) => setCurrentLocation(loc)}
                amenities={amenities}
                weather={weather}
                livability={livability}
                loading={loading}
                onNavigateTab={(tab) => setCurrentTab(tab)}
                onSearch={searchLocations}
              />
            )}

            {currentTab === 'analysis' && (
              <AnalysisView
                currentLocation={currentLocation}
                livability={livability}
                weather={weather}
                onRecalculateWithWeights={handleRecalculateWeights}
                onNavigateTab={(tab) => setCurrentTab(tab)}
              />
            )}

            {currentTab === 'advisor' && (
              <AIAdvisorView
                currentLocation={currentLocation}
                livability={livability}
                weather={weather}
                amenities={amenities}
              />
            )}

            {currentTab === 'compare' && (
              <ComparisonView
                currentLocation={currentLocation}
                onSelectMainLocation={(loc) => setCurrentLocation(loc)}
              />
            )}

            {currentTab === 'builder' && (
              <BuilderView
                currentLocation={currentLocation}
                builderData={builderData}
                onRefreshBuilder={handleRefreshBuilder}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
