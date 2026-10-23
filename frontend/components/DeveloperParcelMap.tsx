'use client';

import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
  Circle,
  Popup,
  Tooltip,
  useMap
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Layers,
  MapPin,
  ShieldAlert,
  Train,
  Plane,
  Crosshair,
  ExternalLink,
  Trees
} from 'lucide-react';
import { ExtendedSiteDossier, DealVerdictResponse } from '@/types';

// Fix Leaflet icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

function MapRecenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14, { animate: true });
  }, [center, map]);
  return null;
}

interface DeveloperParcelMapProps {
  center: [number, number];
  plotAcres: number;
  siteDossier: ExtendedSiteDossier;
  dealVerdict: DealVerdictResponse;
}

export default function DeveloperParcelMap({
  center,
  plotAcres,
  siteDossier,
  dealVerdict
}: DeveloperParcelMapProps) {
  const [baseMap, setBaseMap] = useState<'satellite' | 'dark'>('satellite');

  // Compute a realistic plot polygon boundary centered around [lat, lon]
  // 1 acre ≈ 4046.86 m²; side length in meters for a square plot: sqrt(acres * 4047)
  const sideMeters = Math.sqrt(plotAcres * 4046.86);
  const deltaLat = sideMeters / 111320 / 2;
  const deltaLon = sideMeters / (111320 * Math.cos((center[0] * Math.PI) / 180)) / 2;

  const parcelPolygon: [number, number][] = [
    [center[0] - deltaLat, center[1] - deltaLon],
    [center[0] + deltaLat, center[1] - deltaLon],
    [center[0] + deltaLat, center[1] + deltaLon],
    [center[0] - deltaLat, center[1] + deltaLon]
  ];

  const verdictColor =
    dealVerdict.verdict === 'BUY'
      ? '#10b981' // emerald-500
      : dealVerdict.verdict === 'WATCH'
      ? '#f59e0b' // amber-500
      : '#f43f5e'; // rose-500

  return (
    <div className="relative w-full h-[400px] md:h-[480px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* Map Layer Switcher */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700/80 shadow-lg">
        <button
          onClick={() => setBaseMap('satellite')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            baseMap === 'satellite'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Satellite (Esri)
        </button>
        <button
          onClick={() => setBaseMap('dark')}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            baseMap === 'dark'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Dark Topo
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[11px] text-slate-300 shadow-md">
        <span className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-xs border-2 inline-block"
            style={{ borderColor: verdictColor, backgroundColor: `${verdictColor}33` }}
          />
          Target Parcel ({plotAcres} Acres)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full border border-amber-500/80 bg-amber-500/20 inline-block" />
          MoEFCC ESZ Buffer (1km)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block" />
          GatiShakti Pipeline Node
        </span>
      </div>

      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
      >
        <MapRecenter center={center} />

        {baseMap === 'satellite' ? (
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            maxZoom={19}
          />
        ) : (
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap contributors &copy; CARTO"
            maxZoom={19}
          />
        )}

        {/* Target Development Parcel Boundary */}
        <Polygon
          positions={parcelPolygon}
          pathOptions={{
            color: verdictColor,
            fillColor: verdictColor,
            fillOpacity: 0.28,
            weight: 3,
            dashArray: dealVerdict.verdict === 'AVOID' ? '6, 6' : undefined
          }}
        >
          <Tooltip permanent direction="center" className="parcel-map-tooltip">
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-950/90 text-white border border-slate-700 shadow-sm">
              {siteDossier.display_name.split(',')[0]} ({plotAcres} Ac)
            </span>
          </Tooltip>
          <Popup>
            <div className="p-2 space-y-1 text-slate-900 min-w-[200px]">
              <div className="font-bold text-sm text-slate-900">{siteDossier.display_name}</div>
              <div className="text-xs text-slate-600">
                Plot Size: <span className="font-semibold text-slate-800">{plotAcres} Acres</span>
              </div>
              <div className="text-xs text-slate-600">
                Site Readiness Score:{' '}
                <span className="font-bold text-emerald-600">{siteDossier.site_readiness_score}/100</span>
              </div>
              <div className="text-xs text-slate-600">
                Verdict:{' '}
                <span
                  className="font-bold"
                  style={{ color: verdictColor }}
                >
                  {dealVerdict.verdict} (Score: {dealVerdict.deal_score})
                </span>
              </div>
            </div>
          </Popup>
        </Polygon>

        {/* Nearby MoEFCC Protected / Eco-Sensitive Zones */}
        {(siteDossier.sections.environmental.nearby_eco_sensitive_zones || []).map((esz: any) => (
          <Circle
            key={esz.id}
            center={center}
            radius={esz.buffer_radius_km * 1000}
            pathOptions={{
              color: '#f59e0b',
              fillColor: '#f59e0b',
              fillOpacity: 0.08,
              weight: 1.5,
              dashArray: '4, 4'
            }}
          >
            <Popup>
              <div className="p-1.5 text-xs text-slate-900 max-w-[240px]">
                <div className="font-bold text-amber-700 flex items-center gap-1">
                  <Trees className="w-3.5 h-3.5" />
                  {esz.name}
                </div>
                <div className="text-[11px] text-slate-600 mt-1">
                  Distance: <span className="font-semibold">{esz.distance_km} km</span> ({esz.buffer_radius_km}km Buffer Zone)
                </div>
                <div className="text-[10px] text-slate-500 mt-1 italic">{esz.restrictions}</div>
              </div>
            </Popup>
          </Circle>
        ))}

        {/* Center Target Parcel Marker */}
        <Marker position={center}>
          <Popup>
            <div className="text-xs font-semibold text-slate-900">
              {siteDossier.display_name}
              <div className="text-[10px] text-slate-500">
                Lat: {center[0].toFixed(4)}, Lon: {center[1].toFixed(4)}
              </div>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
