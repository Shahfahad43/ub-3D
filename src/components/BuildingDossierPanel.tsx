import React from 'react';
import {
  Bookmark,
  Building2,
  Compass,
  Navigation,
  Route,
  X,
} from 'lucide-react';
import { CampusBuilding } from '../data/campusData';

interface BuildingDossierPanelProps {
  building: CampusBuilding | null;
  onClose: () => void;
  onFlyToBuilding: (building: CampusBuilding) => void;
  onWalkAtBuilding: (building: CampusBuilding) => void;
  onRouteToBuilding: (buildingId: string) => void;
  isSaved: boolean;
  onToggleSave: (buildingId: string) => void;
}

export const BuildingDossierPanel: React.FC<BuildingDossierPanelProps> = ({
  building,
  onClose,
  onFlyToBuilding,
  onWalkAtBuilding,
  onRouteToBuilding,
  isSaved,
  onToggleSave,
}) => {
  if (!building) return null;

  return (
    <aside
      aria-label="Selected Building Information Dossier"
      className="fixed top-20 right-5 bottom-24 z-30 w-96 max-w-[calc(100vw-2.5rem)] bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800 flex items-start justify-between gap-3 bg-slate-900/90">
        <div className="min-w-0">
          <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5 flex-wrap">
            <span className="text-sky-400 font-semibold">{building.code}</span>
            <span aria-hidden="true">·</span>
            <span className="capitalize">{building.category}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-400 font-medium">
              {building.floors} {building.floors === 1 ? 'Level' : 'Floors'}
            </span>
          </div>
          <h2 className="text-base font-display font-semibold text-white mt-1 leading-snug">
            {building.nameEn}
          </h2>
          <p className="text-sm text-slate-300 font-medium mt-0.5">{building.nameAr}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onToggleSave(building.id)}
            aria-label={isSaved ? `Remove ${building.nameEn} from Saved Places` : `Save ${building.nameEn}`}
            className={`p-2 rounded-lg border transition-colors ${
              isSaved
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Building Dossier"
            className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Quick Navigation Actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => onFlyToBuilding(building)}
            className="px-3 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>Orbit View</span>
          </button>
          <button
            type="button"
            onClick={() => onWalkAtBuilding(building)}
            className="px-3 py-2 text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Navigation className="w-3.5 h-3.5 text-emerald-400" />
            <span>Walk Here</span>
          </button>
          <button
            type="button"
            onClick={() => onRouteToBuilding(building.id)}
            className="px-3 py-2 text-xs font-medium bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
          >
            <Route className="w-3.5 h-3.5" />
            <span>Route To</span>
          </button>
        </div>

        {/* Building Overview */}
        <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-sky-300">
            <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Campus Structure Overview</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{building.description}</p>
        </div>

        {/* Dimensional Specifications */}
        <div>
          <h3 className="text-xs font-semibold text-slate-300 mb-2">
            Campus &amp; Dimensional Specifications
          </h3>
          <div className="grid grid-cols-2 gap-2.5 text-xs font-mono bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-slate-500 block text-[11px]">Campus Coordinates</span>
              <span className="text-slate-200">
                X: {building.position.x}m · Z: {building.position.z}m
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Accessibility</span>
              <span className="text-emerald-300">
                {building.accessible ? 'Ramp / Step-Free' : 'Stepped Entry'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Footprint (W × D)</span>
              <span className="text-slate-200">
                {building.dimensions.width}m × {building.dimensions.depth}m
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Height &amp; Floors</span>
              <span className="text-slate-200">
                {building.dimensions.height}m · {building.floors} {building.floors === 1 ? 'Level' : 'Floors'}
              </span>
            </div>
          </div>
        </div>

        {/* Architectural Characteristics */}
        <div className="space-y-2 text-xs">
          <h3 className="font-semibold text-slate-300">Architectural Characteristics</h3>
          <div className="space-y-1.5 text-slate-300 bg-slate-900/50 p-3.5 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-slate-500">Facade &amp; Cladding: </span>
              <span>{building.architecturalDetails.facadeMaterial}</span>
            </div>
            <div>
              <span className="text-slate-500">Roof Structure: </span>
              <span>{building.architecturalDetails.roofStructure}</span>
            </div>
            <div>
              <span className="text-slate-500">Fenestration / Windows: </span>
              <span>{building.architecturalDetails.windowPattern}</span>
            </div>
            <div>
              <span className="text-slate-500">Entrance &amp; Accessibility: </span>
              <span>{building.architecturalDetails.entranceType}</span>
            </div>
          </div>
        </div>

        {/* Departments & Facilities */}
        <div className="space-y-3 text-xs">
          <div>
            <h3 className="font-semibold text-slate-300 mb-1.5">Departments &amp; Purpose</h3>
            <ul className="space-y-1 text-slate-300">
              {building.departments.map((dept) => (
                <li key={dept} className="leading-relaxed">
                  · {dept}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-slate-300 mb-1.5">Available Facilities</h3>
            <ul className="space-y-1 text-slate-300">
              {building.facilities.map((fac) => (
                <li key={fac} className="leading-relaxed">
                  · {fac}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </aside>
  );
};
