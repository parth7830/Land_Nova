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
  const [baseMap, setBaseMap] = useState<'street' | 'satellite'>('street');

  // Compute a realistic plot polygon boundary centered around [lat, lon]
  // 1 acre ≈ 4046.86 m²; side length in meters for a square plot: sqrt(acres * 4047)
  const [lat, lon] = center;
  const sideMeters = Math.sqrt(Math.max(0.5, plotAcres) * 4046.86);
  const dLat = (sideMeters / 111320.0) / 2.0;
  const dLon = (sideMeters / (111320.0 * Math.cos((lat * Math.PI) / 180.0))) / 2.0;

  const parcelPolygon: [number, number][] = [
    [lat - dLat, lon - dLon],
    [lat - dLat, lon + dLon],
    [lat + dLat, lon + dLon],
    [lat + dLat, lon - dLon]
  ];

  const verdictColor =
    dealVerdict.verdict === 'BUY'
      ? '#059669' // emerald-600
      : dealVerdict.verdict === 'WATCH'
      ? '#d97706' // amber-600
      : '#e11d48'; // rose-600

  // ESZ buffer circles safely extracted
  const eszZones = (
    siteDossier?.sections?.environmental?.nearby_eco_sensitive_zones ||
    (siteDossier?.sections?.environmental as any)?.data?.eco_sensitive_zones ||
    []
  ).filter((z: any) => z && (z.lat != null || z.center_lat != null));
  const nearbyInfra = dealVerdict?.nearby_infrastructure || [];

  return (
    <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-xs">
      {/* Top Map Switcher Bar */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-xs font-semibold text-slate-700">
        <span className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
          <Layers className="w-3.5 h-3.5 text-emerald-600" />
          Basemap:
        </span>
        <button
          onClick={() => setBaseMap('street')}
          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
            baseMap === 'street'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Street
        </button>
        <button
          onClick={() => setBaseMap('satellite')}
          className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
            baseMap === 'satellite'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Satellite
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-10 hidden sm:flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm text-[11px] text-slate-700">
        <span className="flex items-center gap-1 font-semibold text-slate-800">
          <span
            className="w-3 h-3 rounded-xs inline-block border"
            style={{ backgroundColor: verdictColor, borderColor: verdictColor }}
          />
          Target Parcel ({plotAcres} Ac)
        </span>
        <span className="text-slate-300">|</span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-2.5 rounded-full border-2 border-dashed border-amber-500 inline-block" />
          MoEFCC ESZ Buffer
        </span>
        <span className="text-slate-300">|</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-cyan-600 inline-block" />
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
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
            maxZoom={19}
          />
        )}

        {/* Target Development Parcel Boundary */}
        <Polygon
          positions={parcelPolygon}
          pathOptions={{
            color: verdictColor,
            fillColor: verdictColor,
            fillOpacity: 0.35,
            weight: 3,
            dashArray: dealVerdict.verdict === 'AVOID' ? '6, 6' : undefined
          }}
        >
          <Tooltip permanent direction="center" className="parcel-map-tooltip">
            <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-sm bg-white/95 text-slate-900 border border-slate-300 shadow-sm">
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

        {/* ESZ Zones Buffers */}
        {eszZones.map((zone: any) => {
          const zLat = zone.lat ?? zone.center_lat;
          const zLon = zone.lon ?? zone.center_lon;
          if (zLat == null || zLon == null) return null;
          return (
            <Circle
              key={zone.name || zone.id}
              center={[zLat, zLon]}
              radius={(zone.buffer_radius_km || 1.0) * 1000}
              pathOptions={{
                color: '#d97706',
                fillColor: '#f59e0b',
                fillOpacity: 0.12,
                weight: 2,
                dashArray: '5, 5'
              }}
            >
            <Popup>
              <div className="p-2 space-y-1 text-slate-900 text-xs">
                <div className="font-bold text-amber-700 flex items-center gap-1">
                  <Trees className="w-3.5 h-3.5" />
                  {zone.name}
                </div>
                <div>Statutory Buffer: {zone.buffer_radius_km} km</div>
                <div className="text-[11px] text-slate-500">{zone.notification_number}</div>
              </div>
            </Popup>
          </Circle>
          );
        })}

        {/* Nearby Pipeline Infrastructure Markers */}
        {nearbyInfra.map((infra: any, idx: number) => {
          const isAirport = infra.name.toLowerCase().includes('airport');
          return (
            <Circle
              key={idx}
              center={[lat + (idx % 2 === 0 ? 0.015 : -0.012), lon + (idx % 2 === 0 ? 0.018 : -0.015)]}
              radius={350}
              pathOptions={{
                color: '#0284c7',
                fillColor: '#38bdf8',
                fillOpacity: 0.4,
                weight: 2
              }}
            >
              <Popup>
                <div className="p-2 space-y-1 text-slate-900 text-xs">
                  <div className="font-bold text-cyan-700 flex items-center gap-1">
                    {isAirport ? <Plane className="w-3.5 h-3.5" /> : <Train className="w-3.5 h-3.5" />}
                    {infra.name}
                  </div>
                  <div>Estimated Completion: {infra.completion_year || 2026}</div>
                  <div>Catalytic Price Uplift: +{infra.uplift_pct || 15.0}%</div>
                  {infra.portal_link && (
                    <a
                      href={infra.portal_link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-600 flex items-center gap-1 text-[11px] hover:underline"
                    >
                      Project Portal <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>
    </div>
  );
}
