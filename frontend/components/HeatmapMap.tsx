'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Popup,
  Tooltip,
  useMap,
  CircleMarker
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  Crosshair,
  Plus,
  Minus,
  Sparkles,
  Train,
  GraduationCap,
  Building2,
  Trees,
  ShoppingBag,
  Wind,
  ShieldCheck,
  Volume2,
  ArrowLeft,
  Star,
  MapPin,
  AlertCircle
} from 'lucide-react';
import { BuyerSector, AreaHeatmapResponse, HeatmapLayerType } from '@/types';

// Fix Leaflet Default Marker Icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

// Custom POI DivIcons
function createPoiIcon(category: string) {
  let bg = '#0284c7'; // cyan
  let symbol = '📍';
  if (category === 'schools') {
    bg = '#8b5cf6'; // purple
    symbol = '🎓';
  } else if (category === 'hospitals') {
    bg = '#ef4444'; // red
    symbol = '🏥';
  } else if (category === 'transport') {
    bg = '#0284c7'; // blue
    symbol = '🚇';
  } else if (category === 'parks') {
    bg = '#16a34a'; // green
    symbol = '🌳';
  } else if (category === 'amenities') {
    bg = '#f59e0b'; // amber
    symbol = '🛍️';
  }

  return L.divIcon({
    className: 'poi-custom-pin',
    html: `
      <div style="
        background-color: ${bg};
        width: 26px;
        height: 26px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 13px;
        cursor: pointer;
      ">
        ${symbol}
      </div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -12]
  });
}

function createBestBlockIcon() {
  return L.divIcon({
    className: 'best-block-pin',
    html: `
      <div style="
        background: linear-gradient(135deg, #10b981, #059669);
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 0 10px rgba(16, 185, 129, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
        color: white;
        font-weight: bold;
      ">
        ★
      </div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11]
  });
}

function createCentroidBadgeIcon(name: string, score: number, color: string) {
  return L.divIcon({
    className: 'sector-centroid-badge',
    html: `
      <div style="
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(4px);
        border: 1px solid rgba(226, 232, 240, 0.9);
        border-radius: 9999px;
        padding: 2px 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
        display: flex;
        align-items: center;
        gap: 5px;
        font-family: inherit;
        white-space: nowrap;
        pointer-events: none;
      ">
        <span style="font-weight: 700; font-size: 11px; color: #0f172a;">${name.split('(')[0].trim()}</span>
        <span style="
          background-color: ${color};
          color: #ffffff;
          font-weight: 800;
          font-size: 10px;
          border-radius: 6px;
          padding: 1px 4px;
        ">${score}</span>
      </div>
    `,
    iconSize: [110, 26],
    iconAnchor: [55, 13]
  });
}

interface HeatmapMapProps {
  center: [number, number];
  zoom: number;
  sectors: BuyerSector[];
  selectedSector: BuyerSector | null;
  onSelectSector: (sector: BuyerSector) => void;
  activeLayer: HeatmapLayerType;
  drilldownData: AreaHeatmapResponse | null;
  isDrilldownMode: boolean;
  onBackToCity: () => void;
  onDrilldownArea: (sector: BuyerSector) => void;
  loadingGrid?: boolean;
  isSidebarOpen?: boolean;
  onMapMoveEnd?: (bbox: { min_lat: number; max_lat: number; min_lon: number; max_lon: number }) => void;
  maxCommuteFilter?: number;
}

// Map Controller for smooth fly-to animations
function MapViewController({
  center,
  zoom,
  isDrilldownMode,
  selectedSector
}: {
  center: [number, number];
  zoom: number;
  isDrilldownMode: boolean;
  selectedSector: BuyerSector | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (isDrilldownMode && selectedSector && selectedSector.polygon.length > 0) {
      const bounds = L.latLngBounds(selectedSector.polygon.map(p => [p[0], p[1]]));
      map.flyToBounds(bounds, { duration: 1.2, padding: [35, 35] });
    } else {
      map.flyTo(center, zoom, { duration: 1.0 });
    }
  }, [center, zoom, isDrilldownMode, selectedSector, map]);

  return null;
}

// Map Controls: Zoom in/out, Locate Me
function CustomMapControls({ center }: { center: [number, number] }) {
  const map = useMap();

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          map.flyTo([pos.coords.latitude, pos.coords.longitude], 14, { duration: 1.0 });
        },
        () => {
          map.flyTo(center, 13, { duration: 1.0 });
        }
      );
    } else {
      map.flyTo(center, 13, { duration: 1.0 });
    }
  };

  return (
    <div className="absolute top-16 right-4 z-[400] flex flex-col gap-1.5 shadow-md">
      <button
        onClick={() => map.zoomIn()}
        className="w-8 h-8 bg-white/95 hover:bg-white text-slate-800 rounded-lg flex items-center justify-center border border-slate-200 transition shadow-xs cursor-pointer font-bold"
        title="Zoom In"
      >
        <Plus className="w-4 h-4" />
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-8 h-8 bg-white/95 hover:bg-white text-slate-800 rounded-lg flex items-center justify-center border border-slate-200 transition shadow-xs cursor-pointer font-bold"
        title="Zoom Out"
      >
        <Minus className="w-4 h-4" />
      </button>
      <button
        onClick={handleLocateMe}
        className="w-8 h-8 bg-white/95 hover:bg-white text-emerald-700 rounded-lg flex items-center justify-center border border-slate-200 transition shadow-xs cursor-pointer"
        title="Locate Me / Recenter"
      >
        <Crosshair className="w-4 h-4" />
      </button>
    </div>
  );
}

// Invalidate size immediately and after layout changes
function MapResizer({ isSidebarOpen }: { isSidebarOpen?: boolean }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const t = setTimeout(() => map.invalidateSize(), 150);
    return () => clearTimeout(t);
  }, [isSidebarOpen, map]);

  return null;
}

export default function HeatmapMap({
  center,
  zoom,
  sectors,
  selectedSector,
  onSelectSector,
  activeLayer,
  drilldownData,
  isDrilldownMode,
  onBackToCity,
  onDrilldownArea,
  loadingGrid = false,
  isSidebarOpen
}: HeatmapMapProps) {
  const [basemap, setBasemap] = useState<'street' | 'satellite'>('street');

  // Helper to extract score for active layer on a sector
  const getSectorScoreForLayer = (sector: BuyerSector): number => {
    if (activeLayer === 'all') {
      return sector.overall_score;
    }
    if (sector.layer_scores && sector.layer_scores[activeLayer] !== undefined) {
      return sector.layer_scores[activeLayer];
    }
    // Fallback to metrics map if layer_scores not present
    if (activeLayer === 'transport') return sector.metrics?.connectivity?.score || sector.overall_score;
    if (activeLayer === 'aqi') return sector.metrics?.aqi?.score || sector.overall_score;
    if (activeLayer === 'crime') return sector.metrics?.crime_rate?.score || sector.overall_score;
    if (activeLayer === 'schools') return sector.metrics?.schools?.score || sector.overall_score;
    if (activeLayer === 'hospitals') return sector.metrics?.hospitals?.score || sector.overall_score;
    if (activeLayer === 'parks') return sector.metrics?.parks?.score || sector.overall_score;
    if (activeLayer === 'noise') return sector.metrics?.noise_level?.score || sector.overall_score;
    if (activeLayer === 'amenities') return sector.metrics?.markets?.score || sector.overall_score;
    return sector.overall_score;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#22c55e'; // emerald
    if (score >= 65) return '#84cc16'; // lime
    if (score >= 50) return '#eab308'; // yellow
    if (score >= 35) return '#f97316'; // orange
    return '#ef4444'; // red
  };

  const getSectorPolygonStyle = (sector: BuyerSector) => {
    const isSelected = selectedSector?.id === sector.id;
    const isCommuteDimmed = sector.is_within_commute === false;
    const score = getSectorScoreForLayer(sector);
    const color = getScoreColor(score);

    return {
      fillColor: color,
      color: isSelected ? '#0f172a' : color,
      weight: isSelected ? 3.5 : 2,
      fillOpacity: isCommuteDimmed ? 0.2 : isSelected ? 0.75 : 0.60,
      dashArray: isCommuteDimmed ? '6, 6' : undefined
    };
  };

  return (
    <div className="w-full h-full min-h-[500px] relative" style={{ minHeight: '520px', height: '100%' }}>
      {/* Top Left: Breadcrumb / Back to City Button in Drilldown Mode */}
      {isDrilldownMode && selectedSector && (
        <div className="absolute top-3 left-3 z-[400] flex items-center gap-2">
          <button
            onClick={onBackToCity}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 hover:bg-white text-slate-800 font-bold rounded-xl shadow-md border border-slate-200 text-xs transition cursor-pointer hover:scale-102"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-600" />
            <span>Back to City View</span>
          </button>
          <div className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold text-slate-700 hidden sm:flex items-center gap-1">
            <span className="text-slate-400 font-normal">{selectedSector.city}</span>
            <span className="text-slate-300">›</span>
            <span className="text-emerald-700 font-bold">{selectedSector.name}</span>
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              25×25 Fine Grid
            </span>
          </div>
        </div>
      )}

      {/* Top Right: Basemap Switcher (Tucked away cleanly on the right to preserve top-left Leaflet zoom controls) */}
      <div className="absolute top-3 right-3 z-[400]">
        <div className="bg-white/95 backdrop-blur-md px-1.5 py-1.5 rounded-2xl shadow-md border border-slate-200/90 flex items-center gap-1">
          <button
            onClick={() => setBasemap('street')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              basemap === 'street'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Clean Light Street Map"
          >
            🗺️ Street
          </button>
          <button
            onClick={() => setBasemap('satellite')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              basemap === 'satellite'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="High-Resolution Satellite Imagery"
          >
            🛰️ Sat
          </button>
        </div>
      </div>

      {/* Loading Skeleton Overlay for Area Drilldown */}
      {loadingGrid && (
        <div className="absolute inset-0 z-[500] bg-slate-900/20 backdrop-blur-xs flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-3">
            <div className="w-5 h-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <div className="text-xs font-semibold text-slate-800">
              Interpolating 25×25 street-level grid for {selectedSector?.name || 'Area'}...
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Layer Legend */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white/95 backdrop-blur-md rounded-2xl p-3 shadow-lg border border-slate-200/90 max-w-xs font-sans text-xs">
        <div className="flex items-center justify-between gap-3 mb-1.5">
          <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            {drilldownData?.layer_label || activeLayer.toUpperCase()}
          </span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
            {isDrilldownMode ? 'Area Grid' : 'City Sectors'}
          </span>
        </div>

        {/* Gradient Bar */}
        <div className="w-full h-2 rounded-full mb-1" style={{ background: 'linear-gradient(to right, #ef4444, #f97316, #eab308, #84cc16, #22c55e)' }} />

        <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mb-1">
          <span>{drilldownData?.legend?.min_label || 'Low (0)'}</span>
          <span className="font-bold text-slate-700">50</span>
          <span>{drilldownData?.legend?.max_label || 'High (100)'}</span>
        </div>

        <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
          <span className="truncate max-w-[170px]">
            {drilldownData?.legend?.unit || (activeLayer === 'aqi' ? 'Air Purity' : 'Suitability Index')}
          </span>
          <span className="px-1 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[9px]">
            {drilldownData?.confidence || 'High'}
          </span>
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '520px', backgroundColor: '#f1f5f9' }}
        className="rounded-2xl z-10 w-full h-full"
      >
        <MapViewController
          center={center}
          zoom={zoom}
          isDrilldownMode={isDrilldownMode}
          selectedSector={selectedSector}
        />
        <MapResizer isSidebarOpen={isSidebarOpen} />
        <CustomMapControls center={center} />

        {/* Basemap Tiles */}
        {basemap === 'street' ? (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        ) : (
          <>
            <TileLayer
              attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              maxZoom={19}
            />
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}.png"
              maxZoom={19}
              opacity={0.9}
            />
          </>
        )}

        {/* 1. CITY LEVEL: AREA-WISE POLYGONS (When not in drilldown mode) */}
        {!isDrilldownMode &&
          sectors.map((sector) => {
            const style = getSectorPolygonStyle(sector);
            const score = getSectorScoreForLayer(sector);
            const isSelected = selectedSector?.id === sector.id;

            return (
              <React.Fragment key={sector.id}>
                <Polygon
                  positions={sector.polygon}
                  pathOptions={style}
                  eventHandlers={{
                    click: () => {
                      onSelectSector(sector);
                      onDrilldownArea(sector);
                    }
                  }}
                >
                  <Tooltip sticky direction="top" opacity={0.96}>
                    <div className="p-1 max-w-xs font-sans text-xs">
                      <div className="font-bold text-slate-900 mb-0.5">{sector.name}</div>
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-[10px] uppercase font-semibold text-slate-500">{sector.city}</span>
                        <span
                          className="px-1.5 py-0.5 rounded font-bold text-[10px] text-white"
                          style={{ backgroundColor: style.fillColor }}
                        >
                          {drilldownData?.layer_label || activeLayer.toUpperCase()}: {score}/100
                        </span>
                      </div>
                      <div className="space-y-0.5 text-[11px] text-slate-600 mb-1">
                        {sector.reasons.slice(0, 2).map((r, ri) => (
                          <div key={ri} className="flex items-start gap-1">
                            <span className="text-emerald-600">•</span>
                            <span>{r}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-1 border-t border-slate-100 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                        <span>Click to drill down into 25×25 grid →</span>
                      </div>
                    </div>
                  </Tooltip>
                </Polygon>

                {/* Centroid Badge */}
                <Marker
                  position={sector.center}
                  icon={createCentroidBadgeIcon(sector.name, score, style.fillColor)}
                  eventHandlers={{
                    click: () => {
                      onSelectSector(sector);
                      onDrilldownArea(sector);
                    }
                  }}
                />
              </React.Fragment>
            );
          })}

        {/* 2. AREA DRILL-DOWN LEVEL: FINE 25x25 INTERPOLATED GRID & LOCAL POIS */}
        {isDrilldownMode && selectedSector && (
          <>
            {/* Outline of the Area Boundary */}
            <Polygon
              positions={selectedSector.polygon}
              pathOptions={{
                fillColor: 'transparent',
                color: '#0f172a',
                weight: 2.5,
                dashArray: '4, 4'
              }}
            />

            {/* Fine 25x25 Interpolated Grid Cells */}
            {drilldownData?.cells &&
              drilldownData.cells.map((cell, idx) => (
                <CircleMarker
                  key={idx}
                  center={[cell.lat, cell.lng]}
                  radius={7}
                  pathOptions={{
                    fillColor: cell.color,
                    fillOpacity: 0.70,
                    stroke: false
                  }}
                >
                  <Tooltip direction="top" opacity={0.92}>
                    <div className="text-[11px] font-sans">
                      <div className="font-bold text-slate-900">
                        {drilldownData.layer_label}: <span style={{ color: cell.color }}>{cell.score}/100</span>
                      </div>
                      <div className="text-[9px] text-slate-500 font-mono">
                        Coord: {cell.lat.toFixed(4)}, {cell.lng.toFixed(4)}
                      </div>
                    </div>
                  </Tooltip>
                </CircleMarker>
              ))}

            {/* Best Block Marker */}
            {drilldownData?.summary?.best_block && (
              <Marker
                position={[drilldownData.summary.best_block.lat, drilldownData.summary.best_block.lng]}
                icon={createBestBlockIcon()}
              >
                <Popup>
                  <div className="p-1 font-sans text-xs">
                    <div className="font-bold text-emerald-700 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                      Top Performing Micro-Block
                    </div>
                    <div className="text-slate-700 font-semibold mt-0.5">
                      Score: {drilldownData.summary.best_block.score}/100
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      Optimal zone within {selectedSector.name} for {drilldownData.layer_label}.
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Active Layer POI Markers */}
            {drilldownData?.pois &&
              drilldownData.pois.map((poi) => (
                <Marker
                  key={poi.id}
                  position={[poi.lat, poi.lng]}
                  icon={createPoiIcon(poi.category)}
                >
                  <Popup>
                    <div className="p-1 font-sans text-xs">
                      <div className="font-bold text-slate-900">{poi.name}</div>
                      <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                        {poi.category} • {poi.distance_m}m from center
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
          </>
        )}
      </MapContainer>
    </div>
  );
}
