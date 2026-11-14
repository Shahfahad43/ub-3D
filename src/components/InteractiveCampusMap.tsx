import React, { useState } from 'react';
import {
  Compass,
  MapPin,
  Maximize2,
  Navigation,
  X,
} from 'lucide-react';
import {
  BuildingCategory,
  CAMPUS_MAP_TRANSFORM,
  CAMPUS_ROADS,
  CampusBuilding,
  worldToCampusSvg,
} from '../data/campusData';

interface InteractiveCampusMapProps {
  buildings: CampusBuilding[];
  selectedBuildingId: string | null;
  onSelectBuilding: (buildingId: string) => void;
  onWalkToBuilding: (building: CampusBuilding) => void;
  playerTelemetry: {
    x: number;
    z: number;
    yaw: number;
  };
  activeRoutePoints: Array<{ x: number; z: number }>;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function getCategoryStroke(category: BuildingCategory): string {
  if (category === 'academic' || category === 'library') return '#38BDF8';
  if (category === 'administration') return '#F59E0B';
  if (category === 'sports' || category === 'garden') return '#10B981';
  if (category === 'mosque' || category === 'gate') return '#A78BFA';
  return '#94A3B8';
}

function getCategoryFill(category: BuildingCategory, isSelected: boolean): string {
  if (isSelected) return 'rgba(14, 165, 233, 0.55)';
  if (category === 'academic' || category === 'library') return 'rgba(56, 189, 248, 0.25)';
  if (category === 'administration') return 'rgba(245, 158, 11, 0.24)';
  if (category === 'sports' || category === 'garden') return 'rgba(16, 185, 129, 0.24)';
  if (category === 'mosque' || category === 'gate') return 'rgba(167, 139, 250, 0.26)';
  return 'rgba(148, 163, 184, 0.20)';
}

export const InteractiveCampusMap: React.FC<InteractiveCampusMapProps> = ({
  buildings,
  selectedBuildingId,
  onSelectBuilding,
  onWalkToBuilding,
  playerTelemetry,
  activeRoutePoints,
  isExpanded,
  onToggleExpand,
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const hoveredBuilding = buildings.find((b) => b.id === (hoveredId ?? selectedBuildingId));
  const { scale, angleDeg } = CAMPUS_MAP_TRANSFORM;

  const renderMapSvg = (detailedLabels: boolean) => {
    const roundaboutPt = worldToCampusSvg(-232, -35);
    const playerPt = worldToCampusSvg(playerTelemetry.x, playerTelemetry.z);

    return (
      <svg
        viewBox="0 0 1000 1000"
        className="w-full h-full select-none"
        role="img"
        aria-label="University of Bisha Interactive 2D Campus Map"
      >
        {/* Clean Vector GIS Background */}
        <rect x="0" y="0" width="1000" height="1000" fill="#0F172A" />

        {/* Subtle GIS Coordinate Grid */}
        {[200, 400, 600, 800].map((g) => (
          <g key={g} stroke="rgba(148, 163, 184, 0.12)" strokeWidth="1">
            <line x1={g} y1={0} x2={g} y2={1000} />
            <line x1={0} y1={g} x2={1000} y2={g} />
          </g>
        ))}

        {/* Campus Road Network */}
        {CAMPUS_ROADS.map((road) => {
          const p1 = worldToCampusSvg(road.start[0], road.start[1]);
          const p2 = worldToCampusSvg(road.end[0], road.end[1]);
          const strokeW = road.width * scale;
          return (
            <g key={road.id}>
              <line
                x1={p1.u}
                y1={p1.v}
                x2={p2.u}
                y2={p2.v}
                stroke="rgba(30, 41, 59, 0.85)"
                strokeWidth={strokeW}
                strokeLinecap="round"
              />
              <line
                x1={p1.u}
                y1={p1.v}
                x2={p2.u}
                y2={p2.v}
                stroke="rgba(148, 163, 184, 0.45)"
                strokeWidth={1.6}
                strokeDasharray="7 7"
              />
            </g>
          );
        })}

        {/* Main Gate 1 Highway Roundabout */}
        <circle
          cx={roundaboutPt.u}
          cy={roundaboutPt.v}
          r={18 * scale}
          fill="rgba(30, 41, 59, 0.8)"
          stroke="#94A3B8"
          strokeWidth="2"
        />
        <circle cx={roundaboutPt.u} cy={roundaboutPt.v} r={6.9 * scale} fill="#15803D" />

        {/* Building Footprints */}
        {buildings.map((b) => {
          const center = worldToCampusSvg(b.position.x, b.position.z);
          const w = b.dimensions.width * scale;
          const h = b.dimensions.depth * scale;
          const isSelected = b.id === selectedBuildingId;
          const strokeColor = isSelected ? '#FFFFFF' : getCategoryStroke(b.category);
          const fillColor = getCategoryFill(b.category, isSelected);
          const rotDeg = angleDeg - ((b.rotationY ?? 0) * 180) / Math.PI;

          return (
            <g
              key={b.id}
              data-testid={`map-building-${b.id}`}
              className="cursor-pointer transition-opacity hover:opacity-95"
              onClick={(e) => {
                e.stopPropagation();
                onSelectBuilding(b.id);
              }}
              onMouseEnter={() => setHoveredId(b.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <g transform={`translate(${center.u}, ${center.v}) rotate(${rotDeg})`}>
                <rect
                  x={-w / 2}
                  y={-h / 2}
                  width={w}
                  height={h}
                  rx={4}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3.5 : 2}
                />
              </g>

              {detailedLabels && (
                <g transform={`translate(${center.u}, ${center.v})`}>
                  <rect
                    x={-44}
                    y={-18}
                    width={88}
                    height={32}
                    rx={5}
                    fill="rgba(2, 6, 23, 0.85)"
                    stroke={strokeColor}
                    strokeWidth={1.2}
                    className="pointer-events-none"
                  />
                  <text
                    x={0}
                    y={-4}
                    textAnchor="middle"
                    fill="#F8FAFC"
                    fontSize="12"
                    fontWeight="700"
                    className="pointer-events-none"
                  >
                    {b.buildingNumber ? `#${b.buildingNumber} (${b.code})` : b.code}
                  </text>
                  <text
                    x={0}
                    y={10}
                    textAnchor="middle"
                    fill="#CBD5E1"
                    fontSize="10"
                    className="pointer-events-none"
                  >
                    {b.nameAr.slice(0, 20)}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* Active Navigation Route Polyline */}
        {activeRoutePoints.length >= 2 && (
          <polyline
            fill="none"
            stroke="#0EA5E9"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="12 6"
            points={activeRoutePoints
              .map((pt) => {
                const p = worldToCampusSvg(pt.x, pt.z);
                return `${p.u},${p.v}`;
              })
              .join(' ')}
          />
        )}

        {/* Explorer Current Position & Heading Cone */}
        <g
          transform={`translate(${playerPt.u}, ${playerPt.v}) rotate(${
            180 + angleDeg - (playerTelemetry.yaw * 180) / Math.PI
          })`}
        >
          <polygon points="0,-24 -12,8 12,8" fill="rgba(56, 189, 248, 0.4)" />
          <circle cx="0" cy="0" r="8" fill="#0EA5E9" stroke="#F8FAFC" strokeWidth="3" />
        </g>
      </svg>
    );
  };

  if (!isExpanded) {
    return (
      <div
        className="fixed bottom-4 left-5 z-20 w-56 h-56 rounded-xl bg-slate-950/95 border border-slate-800 shadow-xl overflow-hidden flex flex-col"
        aria-label="Campus 2D Minimap"
      >
        <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-800/80 bg-slate-900/90 text-[11px] text-slate-300">
          <span className="font-medium flex items-center gap-1.5 whitespace-nowrap">
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Campus Radar</span>
          </span>
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label="Expand Full Campus Map"
            className="p-1 text-slate-400 hover:text-white rounded transition-colors"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="relative flex-1 bg-slate-950 overflow-hidden">
          <div className="relative w-full h-full">{renderMapSvg(false)}</div>
        </div>
        <div className="px-2.5 py-1 bg-slate-900/95 border-t border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-center justify-between">
          <span>X: {playerTelemetry.x}m</span>
          <span>Z: {playerTelemetry.z}m</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/95 flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Interactive 2D Campus Map Overlay"
    >
      <div className="w-full max-w-6xl h-[86vh] bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div>
            <h2 className="text-lg font-display font-semibold text-white">
              University of Bisha Interactive Campus Map — خريطة الحرم الجامعي
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Vector GIS campus directory displaying gates, academic colleges, central library, sports complex, and administration buildings.
            </p>
          </div>
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label="Close Full Campus Map"
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          {/* Interactive Vector GIS Canvas */}
          <div className="lg:col-span-2 relative bg-slate-950 flex items-center justify-center p-4 overflow-hidden">
            <div className="relative w-full max-w-[650px] aspect-square rounded-xl overflow-hidden border border-slate-800">
              <div className="relative w-full h-full">{renderMapSvg(true)}</div>
            </div>
            {/* Legend */}
            <div className="absolute bottom-6 left-6 bg-slate-900/95 border border-slate-800 rounded-lg px-3.5 py-2 text-xs text-slate-300 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-400 inline-block" />
                <span>Academic &amp; Library</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                <span>Administration</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                <span>Sports &amp; Gardens</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-violet-400 inline-block" />
                <span>Mosque &amp; Gates</span>
              </span>
            </div>
          </div>

          {/* Right Inspection & Teleport Column */}
          <div className="border-l border-slate-800 bg-slate-900/90 p-5 flex flex-col justify-between overflow-y-auto">
            {hoveredBuilding ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-mono text-sky-400">
                    {hoveredBuilding.code} · {hoveredBuilding.category.toUpperCase()}
                  </div>
                  <h3 className="text-lg font-display font-semibold text-white mt-1">
                    {hoveredBuilding.nameEn}
                  </h3>
                  <p className="text-sm text-slate-300 font-medium">{hoveredBuilding.nameAr}</p>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                  {hoveredBuilding.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                  <div>
                    <span className="text-slate-500 block">Footprint</span>
                    <span className="text-slate-200">
                      {hoveredBuilding.dimensions.width}m × {hoveredBuilding.dimensions.depth}m
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Height / Floors</span>
                    <span className="text-slate-200">
                      {hoveredBuilding.dimensions.height}m ({hoveredBuilding.floors}F)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Campus Position</span>
                    <span className="text-slate-200">
                      X: {hoveredBuilding.position.x}m, Z: {hoveredBuilding.position.z}m
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Accessibility</span>
                    <span className="text-slate-200">
                      {hoveredBuilding.accessible ? 'Ramp / Step-Free' : 'Stepped Entry'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectBuilding(hoveredBuilding.id);
                      onToggleExpand();
                    }}
                    className="flex-1 px-4 py-2 text-xs font-medium bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Inspect in 3D</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onWalkToBuilding(hoveredBuilding);
                      onToggleExpand();
                    }}
                    className="flex-1 px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Walk Here (1st Person)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-400">
                Select or hover over any building footprint on the campus map to inspect its architectural specifications and coordinates.
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Current Explorer Coordinates</span>
              <span className="font-mono text-slate-200">
                X: {playerTelemetry.x}m · Z: {playerTelemetry.z}m
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
