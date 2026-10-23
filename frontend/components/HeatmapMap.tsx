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
  MapPin
} from 'lucide-react';
import { BuyerSector, HeatmapCell } from '@/types';

// Fix Leaflet Default Marker Icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

interface HeatmapMapProps {
  center: [number, number];
  zoom: number;
  sectors: BuyerSector[];
  selectedSector: BuyerSector | null;
  onSelectSector: (sector: BuyerSector) => void;
  isSidebarOpen?: boolean;
  onMapMoveEnd?: (bbox: { min_lat: number; max_lat: number; min_lon: number; max_lon: number }) => void;
  maxCommuteFilter?: number;
}

// Controller to update center/zoom programmatically
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: false });
    map.invalidateSize();
  }, [center[0], center[1], zoom, map]);
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
function MapResizer({ isSidebarOpen, sectorCount }: { isSidebarOpen?: boolean; sectorCount?: number }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 80);
    const t2 = setTimeout(() => map.invalidateSize(), 250);
    const t3 = setTimeout(() => map.invalidateSize(), 600);

    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      window.removeEventListener('resize', onResize);
    };
  }, [isSidebarOpen, sectorCount, map]);

  return null;
}

export default function HeatmapMap({
  center,
  zoom,
  sectors,
  selectedSector,
  onSelectSector,
  isSidebarOpen,
  onMapMoveEnd,
  maxCommuteFilter = 120
}: HeatmapMapProps) {
  // Basemap style: street (clean light) or satellite (aerial)
  const [basemap, setBasemap] = useState<'street' | 'satellite'>('street');

  // Layer Toggle Pills: Heat Map, Transport, Amenities, AQI, Crime, Schools, Hospitals
  const [activeLayer, setActiveLayer] = useState<
    'heatmap' | 'transport' | 'amenities' | 'aqi' | 'crime' | 'schools' | 'hospitals'
  >('heatmap');

  const layersList = [
    { id: 'heatmap', label: 'Heat Map', icon: Sparkles },
    { id: 'transport', label: 'Transport', icon: Train },
    { id: 'amenities', label: 'Amenities', icon: ShoppingBag },
    { id: 'aqi', label: 'AQI', icon: Wind },
    { id: 'crime', label: 'Crime (Proxy)', icon: ShieldCheck },
    { id: 'schools', label: 'Schools', icon: GraduationCap },
    { id: 'hospitals', label: 'Hospitals', icon: Building2 }
  ] as const;

  // Color helper based on active layer metric
  const getSectorStyle = (sector: BuyerSector) => {
    const isSelected = selectedSector?.id === sector.id;
    const isCommuteDimmed = sector.is_within_commute === false;

    let score = sector.overall_score;

    if (activeLayer === 'transport') {
      score = sector.metrics?.connectivity?.score || score;
    } else if (activeLayer === 'aqi') {
      score = sector.metrics?.aqi?.score || score;
    } else if (activeLayer === 'crime') {
      score = sector.metrics?.crime_rate?.score || score;
    } else if (activeLayer === 'schools') {
      score = sector.metrics?.schools?.score || score;
    } else if (activeLayer === 'hospitals') {
      score = sector.metrics?.hospitals?.score || score;
    } else if (activeLayer === 'amenities') {
      const s1 = sector.metrics?.schools?.score || 70;
      const s2 = sector.metrics?.hospitals?.score || 70;
      const s3 = sector.metrics?.markets?.score || 70;
      score = (s1 + s2 + s3) / 3;
    }

    // Color gradient mapping: 80-100 emerald, 60-79 lime, 40-59 amber, <40 red
    let fill = '#059669'; // Emerald
    let stroke = '#047857';

    if (score < 40) {
      fill = '#dc2626'; // Red
      stroke = '#b91c1c';
    } else if (score < 60) {
      fill = '#d97706'; // Amber
      stroke = '#b45309';
    } else if (score < 80) {
      fill = '#65a30d'; // Lime
      stroke = '#4d7c0f';
    }

    return {
      fillColor: fill,
      color: isSelected ? '#0f172a' : stroke,
      weight: isSelected ? 3.5 : 2,
      fillOpacity: isCommuteDimmed ? 0.25 : isSelected ? 0.75 : 0.58,
      dashArray: isCommuteDimmed ? '6, 6' : undefined
    };
  };

  return (
    <div className="w-full h-full min-h-[500px] relative" style={{ minHeight: '520px', height: '100%' }}>
      {/* Top Left: Layer Filters (Clean horizontal scroll, responsive) */}
      <div className="absolute top-3 left-3 z-[400] max-w-[calc(100%-150px)] sm:max-w-[calc(100%-200px)] overflow-x-auto pb-1 no-scrollbar">
        <div className="bg-white/95 backdrop-blur-md px-2 py-1.5 rounded-2xl shadow-md border border-slate-200/90 flex items-center gap-1 w-max">
          {layersList.map((layer) => {
            const Icon = layer.icon;
            const isActive = activeLayer === layer.id;
            return (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{layer.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Top Right: Basemap Switcher (Tucked away cleanly on the right) */}
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

      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', minHeight: '520px', backgroundColor: '#f1f5f9' }}
        className="rounded-2xl z-10 w-full h-full"
      >
        <MapController center={center} zoom={zoom} />
        <MapResizer isSidebarOpen={isSidebarOpen} sectorCount={sectors.length} />
        <CustomMapControls center={center} />

        {/* 1. Reliable Base Tile Layers */}
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

        {/* 2. Sectors Polygons with Interactive Visual Field */}
        {sectors.map((sector) => {
          const style = getSectorStyle(sector);
          const isSelected = selectedSector?.id === sector.id;

          return (
            <React.Fragment key={sector.id}>
              <Polygon
                positions={sector.polygon}
                pathOptions={style}
                eventHandlers={{
                  click: () => onSelectSector(sector)
                }}
              >
                <Tooltip sticky direction="top" opacity={0.96}>
                  <div className="p-1 text-slate-900 text-xs">
                    <div className="flex items-center gap-1.5 font-bold">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: style.fillColor }} />
                      <span>{sector.name}</span>
                      <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[10px] font-black">
                        Score: {sector.overall_score}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      ₹{sector.avg_price_sqft.toLocaleString()}/sq.ft • {sector.commute.car_minutes} min commute
                    </div>
                    {sector.is_within_commute === false && (
                      <div className="text-[10px] text-amber-600 font-semibold mt-0.5">
                        ⚠️ Beyond max commute filter ({sector.commute.car_minutes}m &gt; {maxCommuteFilter}m)
                      </div>
                    )}
                  </div>
                </Tooltip>

                <Popup>
                  <div className="p-2 text-slate-900 text-xs space-y-2 min-w-[210px]">
                    <div className="font-bold flex items-center justify-between gap-3 border-b border-slate-100 pb-1.5">
                      <span className="text-xs font-extrabold text-slate-900">{sector.name}</span>
                      <span
                        className="px-2 py-0.5 rounded text-white font-extrabold text-xs shadow-xs"
                        style={{ backgroundColor: style.fillColor }}
                      >
                        {sector.overall_score}/100
                      </span>
                    </div>

                    <div className="text-[11px] space-y-1 text-slate-600">
                      <div>
                        <strong>Avg Rate:</strong> ₹{sector.avg_price_sqft.toLocaleString()} / sq.ft
                      </div>
                      <div>
                        <strong>Drive Time:</strong> ~{sector.commute.car_minutes} mins to workplace
                      </div>
                      <div>
                        <strong>AQI:</strong> {sector.metrics.aqi.value}
                      </div>
                      <div>
                        <strong>Safety Proxy:</strong> {sector.metrics.crime_rate.badge} ({sector.metrics.crime_rate.value})
                      </div>
                    </div>

                    <div
                      onClick={() => onSelectSector(sector)}
                      className="pt-1 text-[11px] text-emerald-700 font-bold flex items-center gap-1 cursor-pointer hover:underline"
                    >
                      Click to open full Area Analysis →
                    </div>
                  </div>
                </Popup>
              </Polygon>

              {/* Sector Centroid Marker with Label */}
              <CircleMarker
                center={sector.center}
                radius={isSelected ? 10 : 8}
                pathOptions={{
                  fillColor: isSelected ? '#ffffff' : style.fillColor,
                  color: isSelected ? '#0f172a' : '#ffffff',
                  weight: isSelected ? 3 : 2,
                  fillOpacity: 1
                }}
                eventHandlers={{
                  click: () => onSelectSector(sector)
                }}
              >
                <Tooltip permanent direction="center" className="sector-score-pill">
                  <span
                    className="font-extrabold text-[10px] text-white px-1.5 py-0.5 rounded-full shadow-md border border-white/80 select-none cursor-pointer"
                    style={{ backgroundColor: style.fillColor }}
                  >
                    {sector.overall_score}
                  </span>
                </Tooltip>
              </CircleMarker>
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Bottom-Right Legend: Location Suitability Score Gradient */}
      <div className="absolute bottom-4 right-4 z-[400] bg-white/95 backdrop-blur-md px-3.5 py-2.5 rounded-xl shadow-lg border border-slate-200/90 text-xs max-w-[240px] hidden sm:block">
        <div className="font-bold text-slate-900 text-[11px] mb-1.5 flex items-center justify-between">
          <span>Location Suitability Score</span>
          <span className="text-[9px] text-slate-400 font-mono">0 - 100</span>
        </div>

        {/* Color Gradient Bar */}
        <div className="w-full h-2.5 rounded-full bg-gradient-to-r from-red-600 via-amber-500 via-lime-500 to-emerald-600 shadow-inner mb-2" />

        <div className="flex justify-between text-[10px] text-slate-600 font-semibold">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-600 inline-block" /> Low (0-20)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" /> Mod (21-60)
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" /> High (61-100)
          </span>
        </div>
      </div>
    </div>
  );
}
