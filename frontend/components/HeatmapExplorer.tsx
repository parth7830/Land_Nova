'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import {
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  AlertTriangle,
  X,
  MapPin
} from 'lucide-react';
import { BuyerSector, BuyerPreferences, LocationItem } from '@/types';
import { evaluateBuyerPreferences, fetchBuyerSectors } from '@/lib/api';
import BuyerPreferencesPanel from './BuyerPreferencesPanel';
import AreaAnalysisDrawer from './AreaAnalysisDrawer';
import TopRecommendedCards from './TopRecommendedCards';
import {
  CompareModal,
  WalkabilityModal,
  FloodClimateModal,
  WaterfallModal,
  PresetsAndWeightsModal,
  ShareSearchModal
} from './BuyerModals';

const DynamicHeatmapMap = dynamic(() => import('./HeatmapMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-slate-400 min-h-[500px]">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-semibold text-slate-200">Loading satellite terrain &amp; spatial grid...</span>
      </div>
    </div>
  )
});

interface HeatmapExplorerProps {
  currentLocation: LocationItem;
  initialPersona?: string;
  onNavigateTab: (tab: string) => void;
  onOpenAIChat?: (locName: string, context: any) => void;
}

export default function HeatmapExplorer({
  currentLocation,
  initialPersona = 'family',
  onNavigateTab,
  onOpenAIChat
}: HeatmapExplorerProps) {
  // State for sectors & recommendations
  const [sectors, setSectors] = useState<BuyerSector[]>([]);
  const [topRecommended, setTopRecommended] = useState<BuyerSector[]>([]);
  const [selectedSector, setSelectedSector] = useState<BuyerSector | null>(null);
  const [loading, setLoading] = useState(true);
  const [weightsApplied, setWeightsApplied] = useState<Record<string, number>>({});

  // Map viewport center and zoom
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    currentLocation.latitude || 28.628,
    currentLocation.longitude || 77.3649
  ]);
  const [mapZoom, setMapZoom] = useState(13);

  // Buyer Preferences State
  const [preferences, setPreferences] = useState<BuyerPreferences>({
    city: currentLocation.city || 'Noida',
    property_types: ['Apartment'],
    min_budget: 5000000,
    max_budget: 20000000,
    preferred_amenities: ['Metro Connectivity', 'Schools', 'Hospitals', 'Parks'],
    good_aqi: true,
    good_water: false,
    low_noise: false,
    low_crime: true,
    local_language: 'Hindi',
    max_commute_minutes: 45,
    workplace_address: 'Sector 62, Noida',
    workplace_coords: [28.628, 77.3649]
  });

  // Checklist Modal State (for B9 Site Visit Checklist)
  const [checklistSectorId, setChecklistSectorId] = useState<string | null>(null);
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [checklistLoading, setChecklistLoading] = useState(false);

  // Affordability Modal State (for B3 EMI Calculator)
  const [affordabilitySector, setAffordabilitySector] = useState<BuyerSector | null>(null);

  // B2: Compare Modal State
  const [showCompareModal, setShowCompareModal] = useState(false);

  // B4: Walkability Modal State
  const [walkabilitySector, setWalkabilitySector] = useState<BuyerSector | null>(null);

  // B5: Flood & Climate Modal State
  const [floodClimateSector, setFloodClimateSector] = useState<BuyerSector | null>(null);

  // B6: Custom Weights Modal State
  const [showWeightsModal, setShowWeightsModal] = useState(false);

  // B7: Share Search Modal State
  const [showShareModal, setShowShareModal] = useState(false);

  // B10: Waterfall Modal State
  const [waterfallSector, setWaterfallSector] = useState<BuyerSector | null>(null);

  // Load sectors whenever location changes or user generates heatmap
  const loadSectors = useCallback(async () => {
    setLoading(true);
    try {
      const city = currentLocation.city || 'Noida';
      const evaluated = await evaluateBuyerPreferences({
        ...preferences,
        city
      });

      if (evaluated && evaluated.sectors && evaluated.sectors.length > 0) {
        setSectors(evaluated.sectors);
        setTopRecommended(evaluated.top_recommended || evaluated.sectors.slice(0, 5));
        setWeightsApplied(evaluated.weights_applied || {});
        // Default select first top sector if none selected
        if (!selectedSector) {
          setSelectedSector(evaluated.sectors[0]);
        }
      } else {
        // Fallback to fetchBuyerSectors
        const fallbackList = await fetchBuyerSectors(city);
        setSectors(fallbackList);
        setTopRecommended(fallbackList.slice(0, 5));
        if (fallbackList.length > 0 && !selectedSector) {
          setSelectedSector(fallbackList[0]);
        }
      }
    } catch (err) {
      console.warn('Error loading sectors', err);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, preferences]);

  useEffect(() => {
    loadSectors();
  }, [currentLocation]);

  // Update center when location changes
  useEffect(() => {
    if (currentLocation.latitude && currentLocation.longitude) {
      setMapCenter([currentLocation.latitude, currentLocation.longitude]);
    }
  }, [currentLocation]);

  const handleUpdatePreferences = (updated: Partial<BuyerPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...updated }));
  };

  const handleResetPreferences = () => {
    const defaultPrefs: BuyerPreferences = {
      city: currentLocation.city || 'Noida',
      property_types: ['Apartment'],
      min_budget: 5000000,
      max_budget: 20000000,
      preferred_amenities: ['Metro Connectivity', 'Schools', 'Hospitals', 'Parks'],
      good_aqi: true,
      good_water: false,
      low_noise: false,
      low_crime: true,
      local_language: 'Hindi',
      max_commute_minutes: 45,
      workplace_address: 'Sector 62, Noida',
      workplace_coords: [28.628, 77.3649]
    };
    setPreferences(defaultPrefs);
    loadSectors();
  };

  const handleSelectSector = (sector: BuyerSector) => {
    setSelectedSector(sector);
    setMapCenter(sector.center);
    setMapZoom(14);
  };

  const handleViewProperties = (sectorId: string) => {
    onNavigateTab('listings');
  };

  // Open Site Checklist Modal
  const handleOpenChecklist = async (sectorId: string) => {
    setChecklistSectorId(sectorId);
    setChecklistLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/buyer/checklist/${sectorId}`);
      if (res.ok) {
        const data = await res.json();
        setChecklistItems(data.checklist || []);
      }
    } catch (err) {
      console.warn('Checklist fetch failed', err);
    } finally {
      setChecklistLoading(false);
    }
  };

  return (
    <div className="w-full h-full min-h-[640px] flex flex-col bg-slate-100 rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden relative">
      {/* Main Row: Left Preferences + Center Map + Right Selected Area Drawer */}
      <div className="flex-1 flex overflow-hidden relative min-h-[500px]">
        {/* A2. Left Preferences Panel */}
        <BuyerPreferencesPanel
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          onGenerate={loadSectors}
          onReset={handleResetPreferences}
          weightsApplied={weightsApplied}
          loading={loading}
        />

        {/* A3. Center Satellite Map & Continuous Smooth Heatmap */}
        <div className="flex-1 relative h-full min-h-[500px]">
          <DynamicHeatmapMap
            center={mapCenter}
            zoom={mapZoom}
            sectors={sectors}
            selectedSector={selectedSector}
            onSelectSector={handleSelectSector}
            maxCommuteFilter={preferences.max_commute_minutes}
            isSidebarOpen={Boolean(selectedSector)}
          />
        </div>

        {/* A4. Right Panel: Selected Area Analysis */}
        {selectedSector && (
          <AreaAnalysisDrawer
            sector={selectedSector}
            onClose={() => setSelectedSector(null)}
            onViewProperties={handleViewProperties}
            onOpenChecklist={handleOpenChecklist}
            onOpenAffordability={(sec) => setAffordabilitySector(sec)}
            onOpenWalkability={(sec) => setWalkabilitySector(sec)}
            onOpenFloodClimate={(sec) => setFloodClimateSector(sec)}
            onOpenWaterfall={(sec) => setWaterfallSector(sec)}
            onOpenCompare={() => setShowCompareModal(true)}
            onOpenWeights={() => setShowWeightsModal(true)}
            onOpenShare={() => setShowShareModal(true)}
          />
        )}
      </div>

      {/* A5. Bottom: Top Recommended Areas (Horizontal Cards) */}
      <TopRecommendedCards
        sectors={topRecommended}
        selectedSectorId={selectedSector?.id || null}
        onSelectSector={handleSelectSector}
        onViewProperties={handleViewProperties}
      />

      {/* Site Visit Checklist Modal */}
      {checklistSectorId && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setChecklistSectorId(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">📋</span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Site Visit Inspection Checklist
                </h3>
                <p className="text-xs text-slate-500">
                  Auto-generated from verified environmental &amp; geotechnical indicators for {selectedSector?.name}
                </p>
              </div>
            </div>

            {checklistLoading ? (
              <div className="py-8 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {checklistItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-bold text-slate-900">{item.title}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.severity === 'High'
                            ? 'bg-rose-100 text-rose-800'
                            : item.severity === 'Medium'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {item.severity} Priority
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 block mb-1 uppercase font-semibold">
                      Category: {item.category}
                    </span>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{item.reason}</p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition cursor-pointer"
              >
                🖨️ Print Checklist
              </button>
              <button
                onClick={() => setChecklistSectorId(null)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EMI & Affordability Modal */}
      {affordabilitySector && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setAffordabilitySector(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">💰</span>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Affordability &amp; Home Loan EMI Calculator
                </h3>
                <p className="text-xs text-slate-500">{affordabilitySector.name} Unit Cost Simulation</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-xs mb-4">
              <div className="flex justify-between text-slate-700">
                <span>Estimated Unit Price (1200 sq.ft):</span>
                <span className="font-extrabold text-slate-900 font-mono">
                  ₹{((affordabilitySector.avg_price_sqft * 1200) / 100000).toFixed(1)} Lakhs
                </span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Down Payment (20%):</span>
                <span className="font-bold text-slate-900 font-mono">
                  ₹{((affordabilitySector.avg_price_sqft * 1200 * 0.2) / 100000).toFixed(1)} Lakhs
                </span>
              </div>
              <div className="flex justify-between text-slate-700">
                <span>Estimated Monthly EMI (8.5%, 20 yrs):</span>
                <span className="font-extrabold text-emerald-800 text-sm font-mono">
                  ₹{Math.round((affordabilitySector.avg_price_sqft * 1200 * 0.8 * 0.008678)).toLocaleString()} / mo
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mb-4 leading-relaxed">
              Standard guideline: Your total monthly EMI should not exceed 35-40% of your net household income.
            </p>

            <button
              onClick={() => setAffordabilitySector(null)}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition cursor-pointer"
            >
              Close Calculator
            </button>
          </div>
        </div>
      )}

      {/* B2: Compare Modal */}
      {showCompareModal && sectors.length >= 2 && (
        <CompareModal
          allSectors={sectors}
          initialSectorIds={selectedSector ? [selectedSector.id] : []}
          onClose={() => setShowCompareModal(false)}
        />
      )}

      {/* B4: Walkability Modal */}
      {walkabilitySector && (
        <WalkabilityModal
          sector={walkabilitySector}
          onClose={() => setWalkabilitySector(null)}
        />
      )}

      {/* B5: Flood & Climate Modal */}
      {floodClimateSector && (
        <FloodClimateModal
          sector={floodClimateSector}
          onClose={() => setFloodClimateSector(null)}
        />
      )}

      {/* B10: Waterfall Explainability Modal */}
      {waterfallSector && (
        <WaterfallModal
          sector={waterfallSector}
          onClose={() => setWaterfallSector(null)}
        />
      )}

      {/* B6: Custom Weight Presets & Sliders Modal */}
      {showWeightsModal && (
        <PresetsAndWeightsModal
          currentWeights={weightsApplied}
          onApplyWeights={(newWeights) => {
            setWeightsApplied(newWeights);
            loadSectors();
          }}
          onClose={() => setShowWeightsModal(false)}
        />
      )}

      {/* B7: Share Search URL Modal */}
      {showShareModal && (
        <ShareSearchModal
          currentUrl={typeof window !== 'undefined' ? window.location.href : ''}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
}
