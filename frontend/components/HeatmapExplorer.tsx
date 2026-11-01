'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import {
  Sparkles,
  RotateCcw,
  SlidersHorizontal,
  Info,
  CheckCircle2,
  AlertTriangle,
  X,
  MapPin,
  Search,
  ArrowLeft,
  GraduationCap,
  Building2,
  ShieldCheck,
  Wind,
  Train,
  ShoppingBag,
  Trees,
  Volume2,
  Star,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { BuyerSector, BuyerPreferences, LocationItem, HeatmapLayerType, AreaHeatmapResponse } from '@/types';
import { evaluateBuyerPreferences, fetchBuyerSectors, fetchAreaHeatmapGrid, searchLocations } from '@/lib/api';
import BuyerPreferencesPanel from './BuyerPreferencesPanel';
import AreaAnalysisDrawer from './AreaAnalysisDrawer';
import TopRecommendedCards from './TopRecommendedCards';
import {
  CompareModal,
  WalkabilityModal,
  FloodClimateModal,
  WaterfallModal,
  PresetsAndWeightsModal,
  ShareSearchModal,
  AffordabilityModal
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

  // Two-Level Drilldown & Layer Selector State
  const [activeLayer, setActiveLayer] = useState<HeatmapLayerType>('all');
  const [isDrilldownMode, setIsDrilldownMode] = useState(false);
  const [drilldownData, setDrilldownData] = useState<AreaHeatmapResponse | null>(null);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [isSummaryCardVisible, setIsSummaryCardVisible] = useState(true);

  // Search box state (Photon + Local Sector matching, debounced)
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  // Modal States
  const [checklistSectorId, setChecklistSectorId] = useState<string | null>(null);
  const [checklistItems, setChecklistItems] = useState<any[]>([]);
  const [checklistLoading, setChecklistLoading] = useState(false);
  const [affordabilitySector, setAffordabilitySector] = useState<BuyerSector | null>(null);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [walkabilitySector, setWalkabilitySector] = useState<BuyerSector | null>(null);
  const [floodClimateSector, setFloodClimateSector] = useState<BuyerSector | null>(null);
  const [showWeightsModal, setShowWeightsModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [waterfallSector, setWaterfallSector] = useState<BuyerSector | null>(null);

  // 9 Supported Layers Definition
  const layersList = [
    { id: 'all' as HeatmapLayerType, label: 'All (Overall)', icon: Sparkles },
    { id: 'schools' as HeatmapLayerType, label: 'Schools', icon: GraduationCap },
    { id: 'hospitals' as HeatmapLayerType, label: 'Hospitals', icon: Building2 },
    { id: 'crime' as HeatmapLayerType, label: 'Crime (Safety)', icon: ShieldCheck },
    { id: 'aqi' as HeatmapLayerType, label: 'AQI (Clean Air)', icon: Wind },
    { id: 'transport' as HeatmapLayerType, label: 'Transport', icon: Train },
    { id: 'amenities' as HeatmapLayerType, label: 'Amenities', icon: ShoppingBag },
    { id: 'parks' as HeatmapLayerType, label: 'Parks', icon: Trees },
    { id: 'noise' as HeatmapLayerType, label: 'Noise (Quietness)', icon: Volume2 }
  ];

  // Sync URL query params with active layer & area
  const updateUrlParams = useCallback((layer: string, areaId?: string) => {
    if (typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('layer', layer);
    if (areaId) {
      url.searchParams.set('area', areaId);
    } else {
      url.searchParams.delete('area');
    }
    window.history.replaceState({}, '', url.toString());
  }, []);

  // Fetch Drilldown Grid for Area & Layer
  const loadAreaGrid = useCallback(async (sector: BuyerSector, layer: HeatmapLayerType) => {
    setLoadingGrid(true);
    try {
      const data = await fetchAreaHeatmapGrid(sector.id, layer, preferences.custom_weights, 25, sector.center, sector.polygon);
      setDrilldownData(data);
      setIsSummaryCardVisible(true);
    } catch (err) {
      console.warn('Failed to load area drilldown grid', err);
    } finally {
      setLoadingGrid(false);
    }
  }, [preferences.custom_weights]);

  // Handle Drilling down into a specific area
  const handleDrilldownArea = useCallback((sector: BuyerSector) => {
    setSelectedSector(sector);
    setIsDrilldownMode(true);
    setMapCenter(sector.center);
    setMapZoom(15);
    updateUrlParams(activeLayer, sector.id);
    loadAreaGrid(sector, activeLayer);
  }, [activeLayer, loadAreaGrid, updateUrlParams]);

  // Handle Switching Layer
  const handleSelectLayer = (layer: HeatmapLayerType) => {
    setActiveLayer(layer);
    updateUrlParams(layer, isDrilldownMode ? selectedSector?.id : undefined);
    if (isDrilldownMode && selectedSector) {
      loadAreaGrid(selectedSector, layer);
    }
  };

  // Return to City View
  const handleBackToCity = () => {
    setIsDrilldownMode(false);
    setMapZoom(13);
    if (selectedSector) {
      setMapCenter(selectedSector.center);
    }
    updateUrlParams(activeLayer);
  };

  // Load sectors whenever location changes or user generates heatmap
  const loadSectors = useCallback(async () => {
    setLoading(true);
    try {
      // Always use the current location's city and coordinates directly
      // to avoid stale preferences.city (which may still be 'Noida' on first render)
      const city = currentLocation.city || currentLocation.display_name?.split(',')[0]?.trim() || preferences.city || 'Noida';
      const evaluated = await evaluateBuyerPreferences({
        ...preferences,
        city,
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        workplace_coords: [currentLocation.latitude, currentLocation.longitude]
      });

      if (evaluated && evaluated.sectors && evaluated.sectors.length > 0) {
        setSectors(evaluated.sectors);
        setTopRecommended(evaluated.top_recommended || evaluated.sectors.slice(0, 5));
        setWeightsApplied(evaluated.weights_applied || {});

        // Check if URL specified an area to drill into on initial load
        if (typeof window !== 'undefined') {
          const params = new URLSearchParams(window.location.search);
          const initialAreaId = params.get('area');
          const initialLayer = params.get('layer') as HeatmapLayerType;
          if (initialLayer && layersList.some(l => l.id === initialLayer)) {
            setActiveLayer(initialLayer);
          }
          if (initialAreaId) {
            const matched = evaluated.sectors.find(s => s.id === initialAreaId);
            if (matched) {
              handleDrilldownArea(matched);
              return;
            }
          }
        }

        // Default select first top sector if none selected
        if (!selectedSector) {
          setSelectedSector(evaluated.sectors[0]);
          setMapCenter(evaluated.sectors[0].center);
        }
      } else {
        const fallbackList = await fetchBuyerSectors(city);
        if (fallbackList && fallbackList.length > 0) {
          setSectors(fallbackList);
          setTopRecommended(fallbackList.slice(0, 5));
          if (!selectedSector) {
            setSelectedSector(fallbackList[0]);
            setMapCenter(fallbackList[0].center);
          }
        }
      }
    } catch (err) {
      console.warn('Error loading sectors', err);
    } finally {
      setLoading(false);
    }
  }, [currentLocation, preferences, selectedSector, handleDrilldownArea]);

  // Sync preferences and map center whenever currentLocation changes
  useEffect(() => {
    // Reset previous location state
    setIsDrilldownMode(false);
    setDrilldownData(null);
    setSelectedSector(null);
    setSectors([]);
    setTopRecommended([]);

    if (currentLocation.city) {
      setPreferences((prev) => ({
        ...prev,
        city: currentLocation.city || prev.city || 'Noida',
        workplace_address: currentLocation.display_name.split(',')[0],
        workplace_coords: [currentLocation.latitude, currentLocation.longitude]
      }));
    }
    if (currentLocation.latitude && currentLocation.longitude) {
      setMapCenter([currentLocation.latitude, currentLocation.longitude]);
      setMapZoom(13);
    }
    loadSectors();
  }, [currentLocation]);

  // Debounced search logic for localities / sectors
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchDropdown(false);
      return;
    }

    setIsSearching(true);
    setShowSearchDropdown(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        // First match existing sectors
        const localMatches: LocationItem[] = sectors
          .filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || s.city.toLowerCase().includes(query.toLowerCase()))
          .map(s => ({
            id: s.id,
            display_name: `${s.name}, ${s.city}`,
            locality: s.name,
            city: s.city,
            country: 'India',
            latitude: s.center[0],
            longitude: s.center[1],
            is_demo: false,
            source: 'Local Benchmark Sector'
          }));

        // Second: query Photon API for geocoded localities
        const geoMatches = await searchLocations(query);
        const combined = [...localMatches, ...geoMatches.filter(g => !localMatches.some(l => l.id === g.id))].slice(0, 6);
        setSearchResults(combined);
      } catch (err) {
        console.warn('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    }, 250);
  };

  const handleSelectSearchResult = (loc: LocationItem) => {
    setShowSearchDropdown(false);
    setSearchQuery(loc.display_name.split(',')[0]);

    // Check if this matches a sector directly
    const matchedSector = sectors.find(s => s.id === loc.id || s.name.toLowerCase() === loc.locality?.toLowerCase());
    if (matchedSector) {
      handleDrilldownArea(matchedSector);
    } else {
      // Fly to custom coordinates
      setMapCenter([loc.latitude, loc.longitude]);
      setMapZoom(14);
      // Auto-select nearest sector
      let nearest = sectors[0];
      let minDist = 999999;
      for (const s of sectors) {
        const d = Math.hypot(s.center[0] - loc.latitude, s.center[1] - loc.longitude);
        if (d < minDist) {
          minDist = d;
          nearest = s;
        }
      }
      if (nearest) {
        handleDrilldownArea(nearest);
      }
    }
  };

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
    if (!isDrilldownMode) {
      setMapZoom(14);
    }
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
      {/* Top Header Controls: Layer Selector & Search Box */}
      <div className="px-3 sm:px-4 py-2.5 bg-white border-b border-slate-200/90 flex flex-wrap items-center justify-between gap-3 shrink-0 z-30">
        {/* Layer Selector Pill Bar (9 Layers, Scrollable, Animated) */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {layersList.map((layer) => {
            const Icon = layer.icon;
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                type="button"
                onClick={() => handleSelectLayer(layer.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs scale-102 ring-2 ring-emerald-500/20'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>

        {/* Debounced Search Box for Locality / Sector Drilldown */}
        <div className="relative w-full sm:w-64 md:w-72 shrink-0">
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs focus-within:border-emerald-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
            <Search className="w-3.5 h-3.5 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
              placeholder="Search sector to drill down..."
              className="bg-transparent border-none outline-hidden w-full text-slate-800 placeholder-slate-400 text-xs"
            />
            {isSearching && (
              <div className="w-3.5 h-3.5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin shrink-0" />
            )}
            {searchQuery && !isSearching && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowSearchDropdown(false);
                }}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute top-full right-0 mt-1.5 w-full sm:w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
              <div className="px-3 py-1 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                Sectors &amp; Localities
              </div>
              {searchResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full px-3 py-2 text-left hover:bg-emerald-50/70 flex items-center justify-between text-slate-800 transition cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="font-semibold truncate">{result.display_name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

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

        {/* A3. Center Map: 2-Level Heatmap (City Polygons / 25x25 Fine Grid Drill-down) */}
        <div className="flex-1 relative h-full min-h-[500px]">
          <DynamicHeatmapMap
            center={mapCenter}
            zoom={mapZoom}
            sectors={sectors}
            selectedSector={selectedSector}
            onSelectSector={handleSelectSector}
            activeLayer={activeLayer}
            drilldownData={drilldownData}
            isDrilldownMode={isDrilldownMode}
            onBackToCity={handleBackToCity}
            onDrilldownArea={handleDrilldownArea}
            loadingGrid={loadingGrid}
            maxCommuteFilter={preferences.max_commute_minutes}
            isSidebarOpen={Boolean(selectedSector)}
          />

          {/* Area Summary Card (Docked in Drill-Down Mode) */}
          {isDrilldownMode && drilldownData && selectedSector && isSummaryCardVisible && (
            <div className="absolute top-14 left-3 z-[400] max-w-xs sm:max-w-sm bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200/90 font-sans text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="font-bold text-slate-900 truncate">{selectedSector.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 shrink-0">
                    {drilldownData.layer_label}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-extrabold text-emerald-700">
                    {drilldownData.overall_layer_score}/100
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsSummaryCardVisible(false)}
                    className="p-1 hover:bg-slate-100 rounded-md text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Best & Worst Block Highlights */}
              <div className="grid grid-cols-2 gap-2 my-2.5">
                <div className="p-2 rounded-xl bg-emerald-50/70 border border-emerald-100">
                  <span className="text-[10px] text-emerald-800 font-bold block flex items-center gap-1">
                    <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" /> Best Micro-Block
                  </span>
                  <span className="text-base font-extrabold text-emerald-950 font-mono">
                    {drilldownData.summary.best_block.score}
                    <span className="text-[10px] text-slate-400 font-normal"> /100</span>
                  </span>
                </div>
                <div className="p-2 rounded-xl bg-rose-50/70 border border-rose-100">
                  <span className="text-[10px] text-rose-800 font-bold block">Lowest Block</span>
                  <span className="text-base font-extrabold text-rose-950 font-mono">
                    {drilldownData.summary.worst_block.score}
                    <span className="text-[10px] text-slate-400 font-normal"> /100</span>
                  </span>
                </div>
              </div>

              {/* Nearest Essential Facilities */}
              <div className="space-y-1 text-[11px] text-slate-600 pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-purple-600" /> Nearest School:
                  </span>
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                    {drilldownData.summary.nearest_school}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Building2 className="w-3 h-3 text-rose-600" /> Nearest Hospital:
                  </span>
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                    {drilldownData.summary.nearest_hospital}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Train className="w-3 h-3 text-sky-600" /> Nearest Metro:
                  </span>
                  <span className="font-semibold text-slate-800 truncate max-w-[150px]">
                    {drilldownData.summary.nearest_metro}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* A4. Right Panel: Selected Area Analysis */}
        {selectedSector && (
          <AreaAnalysisDrawer
            sector={selectedSector}
            activeLayer={activeLayer}
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
        onSelectSector={(sec) => {
          handleSelectSector(sec);
          handleDrilldownArea(sec);
        }}
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

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Site Visit Verification Checklist</h3>
                <p className="text-xs text-slate-500">
                  Prioritized ground checks for {sectors.find((s) => s.id === checklistSectorId)?.name}
                </p>
              </div>
            </div>

            {checklistLoading ? (
              <div className="py-12 flex justify-center items-center">
                <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                {checklistItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-800 text-sm">{item.item}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.priority === 'High'
                            ? 'bg-rose-100 text-rose-700'
                            : item.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{item.reason}</p>
                    <div className="mt-2 text-[10px] text-slate-400 font-mono">Category: {item.category}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Affordability EMI Calculator Modal (B3) */}
      {affordabilitySector && (
        <AffordabilityModal sector={affordabilitySector} onClose={() => setAffordabilitySector(null)} />
      )}

      {/* Compare Candidate Areas Modal (B2) */}
      {showCompareModal && (
        <CompareModal
          allSectors={sectors}
          initialSectorIds={selectedSector ? [selectedSector.id] : []}
          onClose={() => setShowCompareModal(false)}
        />
      )}

      {/* 15-Minute-City Walkability Modal (B4) */}
      {walkabilitySector && (
        <WalkabilityModal sector={walkabilitySector} onClose={() => setWalkabilitySector(null)} />
      )}

      {/* Flood & Climate Deep Dive Modal (B5) */}
      {floodClimateSector && (
        <FloodClimateModal sector={floodClimateSector} onClose={() => setFloodClimateSector(null)} />
      )}

      {/* Custom Weights & Presets Modal (B6) */}
      {showWeightsModal && (
        <PresetsAndWeightsModal
          currentWeights={preferences.custom_weights || { connectivity: 25, amenities: 25, environment: 20, safety: 15, climate_flood: 15 }}
          onApplyWeights={(newWeights) => {
            handleUpdatePreferences({ custom_weights: newWeights });
            loadSectors();
          }}
          onClose={() => setShowWeightsModal(false)}
        />
      )}

      {/* Share Search Link Modal (B7) */}
      {showShareModal && (
        <ShareSearchModal
          currentUrl={typeof window !== 'undefined' ? window.location.href : 'https://landnova.io'}
          onClose={() => setShowShareModal(false)}
        />
      )}

      {/* Waterfall Explainability Modal (B10) */}
      {waterfallSector && (
        <WaterfallModal sector={waterfallSector} onClose={() => setWaterfallSector(null)} />
      )}
    </div>
  );
}
