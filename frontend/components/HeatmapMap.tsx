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
    if (score < 0) return '#64748b'; // Gray for insufficient data
    if (score >= 80) return '#10b981'; // Emerald
    if (score >= 60) return '#84cc16'; // Lime
    if (score >= 40) return '#f59e0b'; // Amber
    return '#ef4444'; // Red
  };

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ width: '100%', height: '100%', backgroundColor: '#090d16' }}
      className="rounded-2xl"
    >
      <MapController center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
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
              color: isSelected ? '#ffffff' : color,
              weight: isSelected ? 3 : 1.5,
              fillColor: color,
              fillOpacity: cell.score < 0 ? 0.35 : 0.65
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
