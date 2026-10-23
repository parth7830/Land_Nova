'use client';

import React, { useEffect, useState } from 'react';
import { AmenityItem } from '@/types';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';

// Fix for default Leaflet icons in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Category color badges
const CATEGORY_COLORS: Record<string, string> = {
  transit: '#0284c7', // sky blue
  healthcare: '#e11d48', // rose
  education: '#d97706', // amber
  recreation: '#059669', // emerald
  commercial: '#9333ea', // purple
  emergency: '#0891b2', // cyan
};

function createCustomIcon(color: string, label: string) {
  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${color};
        width: 24px;
        height: 24px;
        border-radius: 50%;
        border: 2px solid #ffffff;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        font-weight: bold;
        color: #ffffff;
      ">
        ${label.charAt(0).toUpperCase()}
      </div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  });
}

const mainLocationIcon = L.divIcon({
  className: 'main-loc-pin',
  html: `
    <div style="
      background-color: #059669;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid #ffffff;
      box-shadow: 0 0 16px rgba(5, 150, 105, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      color: #ffffff;
      font-weight: bold;
    ">
      ★
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface MapProps {
  latitude: number;
  longitude: number;
  locationName: string;
  amenities: AmenityItem[];
  activeCategory?: string;
}

export default function MapComponent({
  latitude,
  longitude,
  locationName,
  amenities,
  activeCategory = 'all',
}: MapProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full h-full min-h-[350px] bg-slate-100 flex items-center justify-center rounded-xl border border-slate-200 text-slate-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
          <span>Loading Spatial Map...</span>
        </div>
      </div>
    );
  }

  const filteredAmenities =
    activeCategory === 'all'
      ? amenities
      : amenities.filter((a) => a.category === activeCategory);

  return (
    <div className="w-full h-full min-h-[400px] relative rounded-xl overflow-hidden border border-slate-200 shadow-xs">
      <MapContainer
        center={[latitude, longitude]}
        zoom={14}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <ChangeView center={[latitude, longitude]} zoom={14} />

        {/* Clean OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Primary Selected Location Marker */}
        <Marker position={[latitude, longitude]} icon={mainLocationIcon}>
          <Popup>
            <div className="p-1">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider block">
                Target Location
              </span>
              <h4 className="font-semibold text-slate-900 text-sm">{locationName}</h4>
              <p className="text-xs text-slate-500 mt-1">
                Lat: {latitude.toFixed(4)}, Lon: {longitude.toFixed(4)}
              </p>
            </div>
          </Popup>
        </Marker>

        {/* 1.5km Radius Catchment Area */}
        <Circle
          center={[latitude, longitude]}
          radius={1500}
          pathOptions={{
            color: '#059669',
            fillColor: '#059669',
            fillOpacity: 0.1,
            weight: 1.5,
            dashArray: '4, 4',
          }}
        />

        {/* Mapped Amenity Points */}
        {filteredAmenities.map((amenity) => {
          const color = CATEGORY_COLORS[amenity.category] || '#64748b';
          const icon = createCustomIcon(color, amenity.category);

          return (
            <Marker
              key={amenity.id}
              position={[amenity.latitude, amenity.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="p-1 max-w-[200px]">
                  <span
                    className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded inline-block mb-1"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    {amenity.category}
                  </span>
                  <h4 className="font-semibold text-slate-900 text-xs">{amenity.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    ~{Math.round(amenity.distance_meters)}m from center
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1 border-t border-slate-100 pt-1">
                    Source: {amenity.source}
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>

      {/* Map Legend Overlay in Light Mode */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg border border-slate-200 text-[11px] flex flex-wrap gap-2.5 items-center shadow-md">
        <span className="text-slate-500 font-medium">Layers:</span>
        <span className="flex items-center gap-1 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" /> Target
        </span>
        <span className="flex items-center gap-1 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-600" /> Transit
        </span>
        <span className="flex items-center gap-1 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600" /> Healthcare
        </span>
        <span className="flex items-center gap-1 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-600" /> Education
        </span>
        <span className="flex items-center gap-1 text-slate-700">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-600" /> Commercial
        </span>
      </div>
    </div>
  );
}
