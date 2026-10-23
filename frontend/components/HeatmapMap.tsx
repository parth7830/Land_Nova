'use client';

import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Rectangle, Popup, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { HeatmapCell } from '@/types';

interface HeatmapMapProps {
  center: [number, number];
  zoom: number;
  cells: HeatmapCell[];
  onSelectCell: (cell: HeatmapCell) => void;
  selectedCell: HeatmapCell | null;
  isSidebarOpen?: boolean;
  onMapMoveEnd?: (bbox: { min_lat: number; max_lat: number; min_lon: number; max_lon: number }) => void;
}

// Controller to update center/zoom programmatically
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

// Debounced moveend handler (800ms debounce - Requirement 2)
function MapMoveHandler({
  onMoveEnd
}: {
  onMoveEnd?: (bbox: { min_lat: number; max_lat: number; min_lon: number; max_lon: number }) => void;
}) {
  const map = useMap();
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!onMoveEnd) return;
    const handleMove = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        const bounds = map.getBounds();
        onMoveEnd({
          min_lat: bounds.getSouth(),
          max_lat: bounds.getNorth(),
          min_lon: bounds.getWest(),
          max_lon: bounds.getEast()
        });
      }, 800);
    };

    map.on('moveend', handleMove);
    return () => {
      map.off('moveend', handleMove);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [map, onMoveEnd]);

  return null;
}

// Invalidate size immediately and after layout changes (sidebar toggle, resize)
function MapResizer({ isSidebarOpen }: { isSidebarOpen?: boolean }) {
  const map = useMap();

  useEffect(() => {
    map.invalidateSize();
    const t1 = setTimeout(() => map.invalidateSize(), 100);
    const t2 = setTimeout(() => map.invalidateSize(), 350);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isSidebarOpen, map]);

  useEffect(() => {
    const handleResize = () => map.invalidateSize();
    window.addEventListener('resize', handleResize);
    const initialTimer = setTimeout(() => map.invalidateSize(), 150);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(initialTimer);
    };
  }, [map]);

  return null;
}

export default function HeatmapMap({
  center,
  zoom,
  cells,
  onSelectCell,
  selectedCell,
  isSidebarOpen,
  onMapMoveEnd
}: HeatmapMapProps) {
  // Color legend specification:
  // 80-100 emerald, 60-79 lime, 40-59 amber, <40 red, no data gray with dashed outline
  const getCellTheme = (score: number) => {
    if (score < 0) {
      return {
        fill: '#94a3b8', // Gray
        stroke: '#475569',
        isNoData: true,
        label: 'No Data'
      };
    }
    if (score >= 80) {
      return {
        fill: '#059669', // Emerald
        stroke: '#047857',
        isNoData: false,
        label: '80-100 (Excellent)'
      };
    }
    if (score >= 60) {
      return {
        fill: '#65a30d', // Lime
        stroke: '#4d7c0f',
        isNoData: false,
        label: '60-79 (Good)'
      };
    }
    if (score >= 40) {
      return {
        fill: '#d97706', // Amber
        stroke: '#b45309',
        isNoData: false,
        label: '40-59 (Moderate)'
      };
    }
    return {
      fill: '#dc2626', // Red
      stroke: '#b91c1c',
      isNoData: false,
      label: '<40 (Poor Match)'
    };
  };

  // Derive rectangular cell bounds dynamically from the grid coordinates
  const cellBoundsMap = useMemo(() => {
    if (!cells || cells.length === 0) return [];

    const uniqueLats = Array.from(new Set(cells.map((c) => c.latitude))).sort((a, b) => a - b);
    const uniqueLons = Array.from(new Set(cells.map((c) => c.longitude))).sort((a, b) => a - b);

    // Calculate step intervals
    let latStep = 0.015;
    if (uniqueLats.length > 1) {
      let minDiff = Infinity;
      for (let i = 1; i < uniqueLats.length; i++) {
        const diff = uniqueLats[i] - uniqueLats[i - 1];
        if (diff > 0.0001 && diff < minDiff) minDiff = diff;
      }
      if (minDiff < Infinity) latStep = minDiff;
    }

    let lonStep = 0.015;
    if (uniqueLons.length > 1) {
      let minDiff = Infinity;
      for (let i = 1; i < uniqueLons.length; i++) {
        const diff = uniqueLons[i] - uniqueLons[i - 1];
        if (diff > 0.0001 && diff < minDiff) minDiff = diff;
      }
      if (minDiff < Infinity) lonStep = minDiff;
    }

    const halfLat = (latStep / 2) * 0.94; // 6% padding between grid cells for clean visual separation
    const halfLon = (lonStep / 2) * 0.94;

    return cells.map((cell) => {
      const southWest: [number, number] = [cell.latitude - halfLat, cell.longitude - halfLon];
      const northEast: [number, number] = [cell.latitude + halfLat, cell.longitude + halfLon];
      return {
        cell,
        bounds: [southWest, northEast] as [[number, number], [number, number]]
      };
    });
  }, [cells]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '100%', height: '100%' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        preferCanvas={true}
        style={{ width: '100%', height: '100%', minHeight: '100%', backgroundColor: '#f1f5f9' }}
        className="rounded-2xl z-10"
      >
        <MapController center={center} zoom={zoom} />
        <MapResizer isSidebarOpen={isSidebarOpen} />
        <MapMoveHandler onMoveEnd={onMapMoveEnd} />

        {/* Clean Standard OpenStreetMap Tile Layer (No API Key Required) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Colored Grid Cells (Rectangle) */}
        {cellBoundsMap.map(({ cell, bounds }, idx) => {
          const theme = getCellTheme(cell.score);
          const isSelected =
            selectedCell &&
            Math.abs(selectedCell.latitude - cell.latitude) < 0.0001 &&
            Math.abs(selectedCell.longitude - cell.longitude) < 0.0001;

          return (
            <Rectangle
              key={`${cell.latitude}-${cell.longitude}-${idx}`}
              bounds={bounds}
              pathOptions={{
                color: isSelected ? '#0f172a' : theme.stroke,
                weight: isSelected ? 3.5 : theme.isNoData ? 1.5 : 1.2,
                fillColor: theme.fill,
                fillOpacity: theme.isNoData ? 0.35 : isSelected ? 0.82 : 0.62,
                dashArray: theme.isNoData ? '5, 5' : undefined
              }}
              eventHandlers={{
                click: () => onSelectCell(cell)
              }}
            >
              <Tooltip sticky direction="top" opacity={0.96}>
                <div className="p-1 text-slate-900 text-xs">
                  <div className="flex items-center gap-1.5 font-bold">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: theme.fill }}
                    />
                    {theme.isNoData ? (
                      <span className="text-slate-600">No Data (Insufficient metrics)</span>
                    ) : (
                      <span>
                        Score: <strong>{cell.score}/100</strong> (Grade {cell.grade})
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    ({cell.latitude.toFixed(3)}, {cell.longitude.toFixed(3)}) • {cell.data_completeness_pct}% verified
                  </div>
                </div>
              </Tooltip>

              <Popup>
                <div className="p-2 text-slate-900 text-xs space-y-2 min-w-[200px]">
                  <div className="font-bold flex items-center justify-between gap-3 border-b border-slate-100 pb-1.5">
                    <span className="text-[11px] uppercase tracking-wider text-slate-500">
                      Grid Cell Metric
                    </span>
                    <span
                      className="px-2 py-0.5 rounded text-white font-extrabold text-xs shadow-xs"
                      style={{ backgroundColor: theme.fill }}
                    >
                      {theme.isNoData ? 'No Data' : `${cell.score}/100`}
                    </span>
                  </div>

                  <div className="text-[11px] space-y-1 text-slate-600">
                    <div>
                      <strong>Coordinates:</strong> {cell.latitude.toFixed(4)}, {cell.longitude.toFixed(4)}
                    </div>
                    <div>
                      <strong>Data Completeness:</strong> {cell.data_completeness_pct}%
                    </div>
                    <div>
                      <strong>Suitability Grade:</strong> {cell.grade}
                    </div>
                  </div>

                  {cell.factors_summary && Object.keys(cell.factors_summary).length > 0 && (
                    <div className="pt-1.5 border-t border-slate-100 space-y-1">
                      <div className="text-[10px] font-semibold text-slate-500 uppercase">Top Factors</div>
                      {Object.entries(cell.factors_summary).slice(0, 3).map(([key, val]) => (
                        <div key={key} className="flex justify-between text-[11px]">
                          <span className="capitalize text-slate-600">{key.replace('_', ' ')}</span>
                          <span className="font-semibold text-slate-800">{Math.round(val)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 text-[10px] text-emerald-700 font-semibold flex items-center gap-1 cursor-pointer">
                    Click cell to inspect full parameters in drawer →
                  </div>
                </div>
              </Popup>
            </Rectangle>
          );
        })}
      </MapContainer>
    </div>
  );
}
