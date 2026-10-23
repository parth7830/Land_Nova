'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import HeatmapExplorer from '@/components/HeatmapExplorer';
import ChatWidget from '@/components/ChatWidget';
import { LocationItem } from '@/types';

export default function BuyerHeatmapPage() {
  const router = useRouter();

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

  const handleSwitchRole = (role: 'gateway' | 'buyer' | 'developer') => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('landnova_role', role);
    }
    router.push(role === 'gateway' ? '/' : `/?role=${role}`);
  };

  const handleNavigateView = (view: string) => {
    if (view === 'heatmap') {
      return;
    }
    router.push(`/?role=buyer&view=${view}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentRole="buyer"
        onSwitchRole={handleSwitchRole}
        currentView="heatmap"
        onNavigateView={handleNavigateView}
        selectedLocation={currentLocation}
        onSelectLocation={(loc) => setCurrentLocation(loc)}
      />

      {/* Main Heatmap Container with explicit full height */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 w-full flex flex-col">
        <div className="w-full flex-1" style={{ height: 'calc(100vh - 80px)', minHeight: '620px' }}>
          <HeatmapExplorer
            currentLocation={currentLocation}
            initialPersona="family"
            onNavigateTab={handleNavigateView}
            onOpenAIChat={(locName, ctx) => {
              // Can trigger chat
            }}
          />
        </div>
      </main>

      <ChatWidget currentLocationName={currentLocation.display_name} />
    </div>
  );
}
