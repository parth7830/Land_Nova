'use client';

import React, { useState, useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Marker,
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
  Info,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Maximize2
} from 'lucide-react';
import { DeveloperZone } from '@/types';

// Fix Leaflet icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
});

function MapRecenter({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center[0], center[1], zoom, map]);
  return null;
}

interface DeveloperHeatmapMapProps {
  center: [number, number];
  zoom?: number;
  zones: DeveloperZone[];
  selectedZone: DeveloperZone | null;
  onSelectZone: (zone: DeveloperZone) => void;
  legend: Array<{
    range: string;
    label: string;
    color: string;
    dashed?: boolean;
  }>;
}

export default function DeveloperHeatmapMap({
  center,
  zoom = 12,
  zones,
  selectedZone,
  onSelectZone,
  legend
}: DeveloperHeatmapMapProps) {
  const [baseMap, setBaseMap] = useState<'street' | 'satellite'>('street');

  return (
    <div className="relative w-full h-full min-h-[550px] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        scrollWheelZoom={true}
      >
        <MapRecenter center={center} zoom={zoom} />

        {/* Base Layer */}
        {baseMap === 'street' ? (
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            maxZoom={19}
          />
        ) : (
          <TileLayer
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={18}
          />
        )}

        {/* Cadastral Developer Zones */}
        {zones.map((zone) => {
          const isSelected = selectedZone?.id === zone.id;
          const isDimmed = zone.is_dimmed;
          const score = zone.suitability_score ?? 70;
          const zoneColor = zone.color || (score >= 75 ? '#22c55e' : score >= 60 ? '#eab308' : score >= 45 ? '#f97316' : '#ef4444');

          return (
            <React.Fragment key={zone.id}>
              <Polygon
                positions={zone.polygon}
                pathOptions={{
                  fillColor: isDimmed ? '#94a3b8' : zoneColor,
                  fillOpacity: isDimmed ? 0.25 : isSelected ? 0.8 : 0.6,
                  color: isSelected ? '#0f172a' : isDimmed ? '#64748b' : '#334155',
                  weight: isSelected ? 3.5 : isDimmed ? 1.5 : 2,
                  dashArray: isDimmed ? '6, 6' : undefined
                }}
                eventHandlers={{
                  click: () => onSelectZone(zone)
                }}
              >
                <Tooltip sticky direction="top" opacity={0.95}>
                  <div className="p-1 max-w-xs text-xs font-sans">
                    <div className="font-bold text-slate-900 mb-0.5">{zone.name}</div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] uppercase font-semibold text-slate-500">{zone.city}</span>
                      {isDimmed ? (
                        <span className="px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 font-bold text-[10px]">
                          EXCLUDED
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          Score: {score.toFixed(1)}/100
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-600 grid grid-cols-2 gap-x-2 gap-y-0.5">
                      <div>Land: ₹{zone.land_price_sqft.toLocaleString()}/sqft</div>
                      <div>5-Yr Growth: +{zone.price_growth_5yr_pct}%</div>
                      <div>AQI: {zone.aqi}</div>
                      <div>Flood: {zone.flood_risk}</div>
                    </div>
                    {isDimmed && zone.fail_reasons && zone.fail_reasons.length > 0 && (
                      <div className="mt-1.5 pt-1 border-t border-slate-200 text-[10px] text-rose-600 font-medium">
                        Fail: {zone.fail_reasons[0]}
                      </div>
                    )}
                  </div>
                </Tooltip>
              </Polygon>

              {/* Center Zone Label Badge */}
              <Marker
                position={zone.center}
                icon={L.divIcon({
                  className: 'bg-transparent border-0',
                  html: `
                    <div style="
                      transform: translate(-50%, -50%);
                      background: ${isDimmed ? '#f1f5f9' : '#ffffff'};
                      border: 1.5px solid ${isDimmed ? '#94a3b8' : zoneColor};
                      border-radius: 9999px;
                      padding: 2px 7px;
                      font-size: 10px;
                      font-weight: 700;
                      color: ${isDimmed ? '#64748b' : '#0f172a'};
                      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
                      white-space: nowrap;
                      display: flex;
                      align-items: center;
                      gap: 4px;
                      cursor: pointer;
                    ">
                      <span>${zone.name.split('(')[0].trim()}</span>
                      <span style="
                        background: ${isDimmed ? '#e2e8f0' : zoneColor};
                        color: ${isDimmed ? '#475569' : '#ffffff'};
                        border-radius: 6px;
                        padding: 1px 4px;
                        font-size: 9px;
                      ">
                        ${isDimmed ? 'N/A' : score.toFixed(0)}
                      </span>
                    </div>
                  `,
                  iconSize: [0, 0]
                })}
                eventHandlers={{
                  click: () => onSelectZone(zone)
                }}
              />
            </React.Fragment>
          );
        })}
      </MapContainer>

      {/* Top Map Toggle: Base Layer & City Center */}
      <div className="absolute top-4 right-4 z-[1000] flex items-center gap-2">
        <div className="bg-white/95 backdrop-blur-md rounded-xl p-1 shadow-md border border-slate-200 flex text-xs font-semibold text-slate-700">
          <button
            onClick={() => setBaseMap('street')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              baseMap === 'street'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Street Map
          </button>
          <button
            onClick={() => setBaseMap('satellite')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              baseMap === 'satellite'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Legend & Demo Data Badge */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white/95 backdrop-blur-md rounded-xl p-3.5 shadow-lg border border-slate-200 max-w-xs font-sans">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-slate-900">Suitability Legend</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">
            Demo data
          </span>
        </div>
        <div className="space-y-1.5">
          {legend.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-2">
                <div
                  className="w-3.5 h-3.5 rounded"
                  style={{
                    backgroundColor: item.color,
                    border: item.dashed ? '1.5px dashed #64748b' : `1.5px solid ${item.color}`
                  }}
                />
                <span className="text-slate-700 font-medium">{item.label}</span>
              </div>
              <span className="text-slate-400 font-mono text-[10px]">{item.range}</span>
            </div>
          ))}
        </div>
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
          <span>Source: Seeded demo dataset</span>
          <span>FastAPI + NumPy</span>
        </div>
      </div>
    </div>
  );
}
