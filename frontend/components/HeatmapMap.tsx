'use client';

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { HeatmapCell } from '@/types';

interface HeatmapMapProps {
  center: [number, number];
  zoom: number;
  cells: HeatmapCell[];
  onSelectCell: (cell: HeatmapCell) => void;
  selectedCell: HeatmapCell | null;
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

export default function HeatmapMap({
  center,
  zoom,
  cells,
  onSelectCell,
  selectedCell
}: HeatmapMapProps) {
  const getCellColor = (score: number) => {
    if (score < 0) return '#94a3b8'; // Slate for insufficient data
    if (score >= 80) return '#059669'; // Emerald
    if (score >= 60) return '#65a30d'; // Lime
    if (score >= 40) return '#d97706'; // Amber
    return '#dc2626'; // Red
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ width: '100%', height: '100%', backgroundColor: '#f1f5f9' }}
      className="rounded-2xl"
    >
      <MapController center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {cells.map((cell, idx) => {
        const color = getCellColor(cell.score);
        const isSelected =
          selectedCell &&
          Math.abs(selectedCell.latitude - cell.latitude) < 0.0001 &&
          Math.abs(selectedCell.longitude - cell.longitude) < 0.0001;

        return (
          <CircleMarker
            key={idx}
            center={[cell.latitude, cell.longitude]}
            radius={isSelected ? 26 : 20}
            pathOptions={{
              color: isSelected ? '#0f172a' : color,
              weight: isSelected ? 3.5 : 2,
              fillColor: color,
              fillOpacity: cell.score < 0 ? 0.4 : 0.75
            }}
            eventHandlers={{
              click: () => onSelectCell(cell)
            }}
          >
            <Popup>
              <div className="p-2 text-slate-900 text-xs space-y-1">
                <div className="font-bold flex items-center justify-between gap-3">
                  <span>Suitability Score</span>
                  <span
                    className="px-2 py-0.5 rounded text-white font-extrabold"
                    style={{ backgroundColor: color }}
                  >
                    {cell.score < 0 ? 'Insufficient Data' : `${cell.score}/100`}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600">
                  Completeness: {cell.data_completeness_pct}% • Grade: {cell.grade}
                </div>
                <div className="text-[10px] text-emerald-700 font-semibold pt-1">
                  Click to open full analysis drawer →
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
