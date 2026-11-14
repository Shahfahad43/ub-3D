import React from 'react';
import {
  Accessibility,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Compass,
  MapPin,
  Navigation,
  Play,
  Route,
  Search,
  Square,
  X,
} from 'lucide-react';
import {
  BuildingCategory,
  CAMPUS_TOURS,
  CampusBuilding,
  CampusTour,
} from '../data/campusData';
import { ComputedRoute } from '../utils/spatialEngine';

export type SidebarTab = 'directory' | 'routes' | 'tours' | 'saved';

interface LeftExplorerSidebarProps {
  isOpen: boolean;
  onToggleOpen: () => void;
  activeTab: SidebarTab;
  onChangeTab: (tab: SidebarTab) => void;
  buildings: CampusBuilding[];
  filteredBuildings: CampusBuilding[];
  selectedBuildingId: string | null;
  onSelectBuilding: (buildingId: string) => void;
  onWalkAtBuilding: (building: CampusBuilding) => void;
  searchQuery: string;
  onChangeSearchQuery: (q: string) => void;
  selectedCategory: BuildingCategory | 'all';
  onChangeCategory: (cat: BuildingCategory | 'all') => void;
  savedBuildingIds: string[];
  // Route Planner
  routeStartId: string;
  routeEndId: string;
  onChangeRouteStart: (id: string) => void;
  onChangeRouteEnd: (id: string) => void;
  accessibleRouteOnly: boolean;
  onToggleAccessibleRoute: () => void;
  computedRoute: ComputedRoute | null;
  onClearRoute: () => void;
  onStartWalkAlongRoute: () => void;
  // Guided Tours
  activeTour: CampusTour | null;
  activeTourStopIndex: number;
  onStartTour: (tour: CampusTour) => void;
  onSelectTourStop: (index: number) => void;
  onStopTour: () => void;
}

const CATEGORIES: Array<{ id: BuildingCategory | 'all'; label: string }> = [
  { id: 'all', label: 'All' },
  { id: 'gate', label: 'Gates' },
  { id: 'mosque', label: 'Mosque' },
  { id: 'academic', label: 'Academic' },
  { id: 'administration', label: 'Admin' },
  { id: 'sports', label: 'Sports' },
  { id: 'parking', label: 'Parking' },
  { id: 'garden', label: 'Gardens' },
];

export const LeftExplorerSidebar: React.FC<LeftExplorerSidebarProps> = ({
  isOpen,
  onToggleOpen,
  activeTab,
  onChangeTab,
  buildings,
  filteredBuildings,
  selectedBuildingId,
  onSelectBuilding,
  onWalkAtBuilding,
  searchQuery,
  onChangeSearchQuery,
  selectedCategory,
  onChangeCategory,
  savedBuildingIds,
  routeStartId,
  routeEndId,
  onChangeRouteStart,
  onChangeRouteEnd,
  accessibleRouteOnly,
  onToggleAccessibleRoute,
  computedRoute,
  onClearRoute,
  onStartWalkAlongRoute,
  activeTour,
  activeTourStopIndex,
  onStartTour,
  onSelectTourStop,
  onStopTour,
}) => {
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onToggleOpen}
        aria-label="Open Campus Explorer Sidebar"
        className="fixed top-20 left-5 z-30 px-3.5 py-2.5 rounded-xl bg-slate-950/95 border border-slate-800 text-slate-200 hover:text-white shadow-xl flex items-center gap-2 text-xs font-medium transition-colors whitespace-nowrap"
      >
        <ChevronRight className="w-4 h-4 text-sky-400" />
        <span>Campus Explorer ({buildings.length})</span>
      </button>
    );
  }

  const savedBuildings = buildings.filter((b) => savedBuildingIds.includes(b.id));

  return (
    <aside
      aria-label="Campus Locations and Navigation Sidebar"
      className="fixed top-20 left-5 bottom-4 z-30 w-84 max-w-[calc(100vw-2.5rem)] bg-slate-950/95 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
    >
      {/* Top Tab Bar + Collapse Button */}
      <div className="p-2.5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-1.5">
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 flex-1">
          {(
            [
              { id: 'directory', label: 'Locations' },
              { id: 'routes', label: 'Routes' },
              { id: 'tours', label: 'Tours' },
              { id: 'saved', label: `Saved (${savedBuildingIds.length})` },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onChangeTab(t.id)}
              className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                activeTab === t.id
                  ? 'bg-sky-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onToggleOpen}
          aria-label="Collapse Campus Explorer Sidebar"
          className="p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400 hover:text-white transition-colors shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Tab 1: Campus Directory & Search */}
      {activeTab === 'directory' && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="p-3.5 border-b border-slate-800 space-y-3 bg-slate-900/40">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                aria-label="Search Campus Locations"
                value={searchQuery}
                onChange={(e) => onChangeSearchQuery(e.target.value)}
                placeholder="Search buildings, كلية الحاسبات, Gate..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl bg-slate-900 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onChangeSearchQuery('')}
                  aria-label="Clear search query"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Filter Buttons */}
            <div className="flex items-center flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onChangeCategory(cat.id)}
                  className={`px-2.5 py-1 text-[11px] font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    selectedCategory === cat.id
                      ? 'bg-slate-100 text-slate-950'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Building List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {filteredBuildings.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                <p>No campus structures match your current search or category filter.</p>
                <button
                  type="button"
                  onClick={() => {
                    onChangeSearchQuery('');
                    onChangeCategory('all');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-sky-400 hover:text-sky-300 font-medium"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredBuildings.map((b) => {
                const isSelected = b.id === selectedBuildingId;
                return (
                  <div
                    key={b.id}
                    className={`p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-sky-500/15 border-sky-500/50'
                        : 'bg-slate-900/75 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onSelectBuilding(b.id)}
                        className="text-left flex-1 min-w-0"
                      >
                        <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                          <span className="text-sky-400 font-semibold">{b.code}</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize text-slate-400">{b.category}</span>
                        </div>
                        <div className="text-xs font-semibold text-white mt-0.5 leading-snug">
                          {b.nameEn}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{b.nameAr}</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => onWalkAtBuilding(b)}
                        aria-label={`Walk at ${b.nameEn}`}
                        className="p-2 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 shrink-0 transition-colors"
                        title="Walk Here in 1st Person"
                      >
                        <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Point-to-Point Pathway Navigation */}
      {activeTab === 'routes' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-3 bg-slate-900/70 p-3.5 rounded-xl border border-slate-800">
            <h3 className="text-xs font-semibold text-white flex items-center gap-1.5">
              <Route className="w-4 h-4 text-sky-400" />
              <span>Point-to-Point Campus Route Planner</span>
            </h3>

            <div>
              <label
                htmlFor="route-start-select"
                className="block text-[11px] text-slate-400 font-medium mb-1"
              >
                Starting Location
              </label>
              <select
                id="route-start-select"
                value={routeStartId}
                onChange={(e) => onChangeRouteStart(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} — {b.nameEn} ({b.nameAr})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="route-end-select"
                className="block text-[11px] text-slate-400 font-medium mb-1"
              >
                Destination Location
              </label>
              <select
                id="route-end-select"
                value={routeEndId}
                onChange={(e) => onChangeRouteEnd(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-sky-500"
              >
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.code} — {b.nameEn} ({b.nameAr})
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={onToggleAccessibleRoute}
              className={`w-full px-3 py-2 rounded-lg border text-xs font-medium flex items-center justify-between gap-3 transition-colors ${
                accessibleRouteOnly
                  ? 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <span className="flex items-center gap-2 whitespace-nowrap">
                <Accessibility className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Step-Free Accessible Route</span>
              </span>
              <span className="font-mono text-[11px] shrink-0">
                {accessibleRouteOnly ? 'ACTIVE' : 'OFF'}
              </span>
            </button>
          </div>

          {computedRoute && (
            <div className="space-y-3">
              {/* Route Summary Metrics */}
              <div className="grid grid-cols-2 gap-2.5 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs font-mono">
                <div>
                  <span className="text-slate-500 block text-[11px]">Pathway Distance</span>
                  <span className="text-base font-semibold text-sky-400">
                    {computedRoute.totalDistanceMeters} m
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Walking Time</span>
                  <span className="text-base font-semibold text-white">
                    ~{computedRoute.estimatedWalkMinutes} min
                  </span>
                </div>
              </div>

              {computedRoute.accessibilityWarning && (
                <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/40 text-xs text-amber-200 leading-relaxed">
                  {computedRoute.accessibilityWarning}
                </div>
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onStartWalkAlongRoute}
                  className="flex-1 py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Walk This Route</span>
                </button>
                <button
                  type="button"
                  onClick={onClearRoute}
                  className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-medium transition-colors whitespace-nowrap"
                >
                  Clear
                </button>
              </div>

              {/* Turn-by-Turn Directions */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-slate-300">
                  Directional Guidance ({computedRoute.steps.length} Segments)
                </h4>
                {computedRoute.steps.length === 0 ? (
                  <p className="text-xs text-slate-400">
                    Start and destination are at the same campus node.
                  </p>
                ) : (
                  <ol className="space-y-1.5 text-xs">
                    {computedRoute.steps.map((step, idx) => (
                      <li
                        key={`${step.fromNodeId}-${step.toNodeId}-${idx}`}
                        className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800/80 text-slate-300 flex items-start gap-2.5"
                      >
                        <span className="font-mono text-sky-400 font-semibold shrink-0">
                          0{idx + 1}.
                        </span>
                        <span className="leading-relaxed">{step.instruction}</span>
                      </li>
                    ))}
                  </ol>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Predefined Guided Campus Tours */}
      {activeTab === 'tours' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {CAMPUS_TOURS.map((tour) => {
            const isRunning = activeTour?.id === tour.id;
            return (
              <div
                key={tour.id}
                className={`p-4 rounded-xl border space-y-3 transition-all ${
                  isRunning
                    ? 'bg-sky-500/15 border-sky-500/50'
                    : 'bg-slate-900/80 border-slate-800'
                }`}
              >
                <div>
                  <div className="text-[11px] font-mono text-sky-400">
                    {tour.stops.length} Campus Stops · ~{tour.estimatedMinutes} min
                  </div>
                  <h3 className="text-sm font-display font-semibold text-white mt-0.5">
                    {tour.title}
                  </h3>
                  <p className="text-xs text-slate-300">{tour.titleAr}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{tour.subtitle}</p>
                </div>

                {isRunning ? (
                  <div className="space-y-2.5 pt-2 border-t border-slate-800">
                    <div className="space-y-1.5">
                      {tour.stops.map((stop, idx) => (
                        <button
                          key={stop.buildingId}
                          type="button"
                          onClick={() => onSelectTourStop(idx)}
                          className={`w-full text-left p-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                            activeTourStopIndex === idx
                              ? 'bg-sky-500 text-slate-950 font-semibold'
                              : 'bg-slate-950/80 text-slate-300 hover:text-white'
                          }`}
                        >
                          <span className="truncate">
                            0{idx + 1}. {stop.title}
                          </span>
                          <Compass className="w-3.5 h-3.5 shrink-0" />
                        </button>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={onStopTour}
                      className="w-full py-2 px-3 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-medium flex items-center justify-center gap-1.5"
                    >
                      <Square className="w-3.5 h-3.5" />
                      <span>End Guided Tour</span>
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => onStartTour(tour)}
                    className="w-full py-2 px-3 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>Start Guided Tour</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 4: Saved Places */}
      {activeTab === 'saved' && (
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {savedBuildings.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 space-y-2">
              <Bookmark className="w-6 h-6 text-slate-500 mx-auto" />
              <p>No saved campus locations yet.</p>
              <p className="text-[11px] text-slate-500">
                Click the bookmark icon on any building dossier to save quick-access landmarks here.
              </p>
            </div>
          ) : (
            savedBuildings.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-2"
              >
                <button
                  type="button"
                  onClick={() => onSelectBuilding(b.id)}
                  className="text-left min-w-0 flex-1"
                >
                  <div className="text-[11px] font-mono text-sky-400">{b.code}</div>
                  <div className="text-xs font-semibold text-white truncate">{b.nameEn}</div>
                  <div className="text-[11px] text-slate-400 truncate">{b.nameAr}</div>
                </button>
                <button
                  type="button"
                  onClick={() => onWalkAtBuilding(b)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 hover:text-white flex items-center gap-1 shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-400" />
                  <span>Visit</span>
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </aside>
  );
};
