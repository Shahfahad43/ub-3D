/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Maximize,
  Sliders,
  X,
} from 'lucide-react';
import {
  BuildingCategory,
  CAMPUS_BUILDINGS,
  CAMPUS_TOURS,
  CampusBuilding,
  CampusTour,
} from './data/campusData';
import {
  filterCampusStructures,
  findShortestRoute,
  measureDistanceMeters,
} from './utils/spatialEngine';
import { CampusViewport3D, NavigationMode } from './components/CampusViewport3D';
import { LeftExplorerSidebar, SidebarTab } from './components/LeftExplorerSidebar';
import { BuildingDossierPanel } from './components/BuildingDossierPanel';
import { BottomControlDock } from './components/BottomControlDock';
import { InteractiveCampusMap } from './components/InteractiveCampusMap';

export default function App() {
  const buildings = CAMPUS_BUILDINGS;

  // Selection & Explorer state
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>('gate-1');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('directory');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<BuildingCategory | 'all'>('all');
  const [savedBuildingIds, setSavedBuildingIds] = useState<string[]>([
    'gate-1',
    'mosque-main',
    'computing-bldg-18',
    'academic-bldg-19',
  ]);

  // Camera & Navigation Mode state
  const [navigationMode, setNavigationMode] = useState<NavigationMode>('aerial');
  const [hourOfDay, setHourOfDay] = useState<number>(10.5); // Crisp morning sunlight default
  const [headlightsOn, setHeadlightsOn] = useState<boolean>(false);
  const [carTelemetry, setCarTelemetry] = useState<{ speedKmh: number; gear: 'P' | 'D' | 'R' }>({
    speedKmh: 0,
    gear: 'P',
  });
  const [dockCollapsed, setDockCollapsed] = useState<boolean>(false);
  const [mouseSensitivity, setMouseSensitivity] = useState<number>(1.0);

  // Camera Fly-to & Zoom triggers
  const [cameraFlyTarget, setCameraFlyTarget] = useState<{
    cameraPos: [number, number, number];
    lookAt: [number, number, number];
    walkSpawn?: [number, number, number];
    walkYaw?: number;
    timestamp: number;
  } | null>(null);
  const [zoomTrigger, setZoomTrigger] = useState<{ delta: number; timestamp: number } | null>(
    null,
  );

  // Live Player / Camera Telemetry
  const [playerTelemetry, setPlayerTelemetry] = useState({
    x: -175,
    z: -35,
    yaw: -Math.PI / 2,
  });

  // Point-to-Point Route Planner state
  const [routeStartId, setRouteStartId] = useState<string>('gate-1');
  const [routeEndId, setRouteEndId] = useState<string>('computing-bldg-18');
  const [accessibleRouteOnly, setAccessibleRouteOnly] = useState<boolean>(false);
  const [routeActive, setRouteActive] = useState<boolean>(true);

  // Guided Tour state
  const [activeTour, setActiveTour] = useState<CampusTour | null>(null);
  const [activeTourStopIndex, setActiveTourStopIndex] = useState<number>(0);

  // Distance Measurement Tool state
  const [measureMode, setMeasureMode] = useState<boolean>(false);
  const [measurePointA, setMeasurePointA] = useState<{ x: number; z: number } | null>(null);
  const [measurePointB, setMeasurePointB] = useState<{ x: number; z: number } | null>(null);

  // Overlays & Modals
  const [isFullMapOpen, setIsFullMapOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullMapOpen(false);
        setIsSettingsOpen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Filtered buildings for sidebar
  const filteredBuildings = useMemo(
    () =>
      filterCampusStructures(
        buildings,
        searchQuery,
        selectedCategory,
      ),
    [buildings, searchQuery, selectedCategory],
  );

  const selectedBuilding = useMemo(
    () => buildings.find((b) => b.id === selectedBuildingId) ?? null,
    [buildings, selectedBuildingId],
  );

  // Computed A-to-B Route
  const computedRoute = useMemo(() => {
    if (!routeActive) return null;
    return findShortestRoute(routeStartId, routeEndId, {
      accessibleOnly: accessibleRouteOnly,
      buildings,
    });
  }, [routeActive, routeStartId, routeEndId, accessibleRouteOnly, buildings]);

  // Active Distance Measurement
  const activeMeasurement = useMemo(() => {
    if (!measurePointA || !measurePointB) return null;
    return measureDistanceMeters(measurePointA, measurePointB);
  }, [measurePointA, measurePointB]);

  // Handlers
  const handleSelectBuilding = (buildingId: string) => {
    setSelectedBuildingId(buildingId);
    const target = buildings.find((b) => b.id === buildingId);
    if (target && navigationMode === 'aerial') {
      setCameraFlyTarget({
        ...target.cameraViewPreset,
        timestamp: Date.now(),
      });
    }
  };

  const handleFlyToBuilding = (bldg: CampusBuilding) => {
    setSelectedBuildingId(bldg.id);
    setNavigationMode('aerial');
    setCameraFlyTarget({
      ...bldg.cameraViewPreset,
      timestamp: Date.now(),
    });
  };

  const handleWalkAtBuilding = (bldg: CampusBuilding) => {
    setSelectedBuildingId(bldg.id);
    setCameraFlyTarget({
      ...bldg.cameraViewPreset,
      timestamp: Date.now(),
    });
    setNavigationMode('first_person');
  };

  const handleRouteToBuilding = (destinationId: string) => {
    setRouteEndId(destinationId);
    setRouteActive(true);
    setSidebarOpen(true);
    setSidebarTab('routes');
  };

  const handleToggleSaveBuilding = (buildingId: string) => {
    setSavedBuildingIds((prev) =>
      prev.includes(buildingId) ? prev.filter((id) => id !== buildingId) : [...prev, buildingId],
    );
  };

  const handleStartTour = (tour: CampusTour) => {
    setActiveTour(tour);
    setActiveTourStopIndex(0);
    const firstBldg = buildings.find((b) => b.id === tour.stops[0]?.buildingId);
    if (firstBldg) {
      handleFlyToBuilding(firstBldg);
    }
  };

  const handleSelectTourStop = (index: number) => {
    if (!activeTour) return;
    const clamped = Math.max(0, Math.min(activeTour.stops.length - 1, index));
    setActiveTourStopIndex(clamped);
    const stop = activeTour.stops[clamped];
    const bldg = buildings.find((b) => b.id === stop.buildingId);
    if (bldg) {
      handleFlyToBuilding(bldg);
    }
  };

  const handleMeasureClickPoint = (pt: { x: number; z: number }) => {
    if (!measurePointA || (measurePointA && measurePointB)) {
      setMeasurePointA(pt);
      setMeasurePointB(null);
    } else {
      setMeasurePointB(pt);
    }
  };

  const handleResetAerialOverview = () => {
    setNavigationMode('aerial');
    setCameraFlyTarget({
      cameraPos: [-320, 240, 235],
      lookAt: [0, 0, 15],
      timestamp: Date.now(),
    });
  };

  const handleChangeNavigationMode = (mode: NavigationMode) => {
    if (mode === 'drive_car' && (hourOfDay < 6 || hourOfDay >= 17.5)) {
      setHeadlightsOn(true);
    }
    setNavigationMode(mode);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  };

  const currentTourStop = activeTour ? activeTour.stops[activeTourStopIndex] : null;

  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-slate-950 text-slate-100 select-none"
      data-state={navigationMode}
    >
      {/* Top Bar — Strict 3-Zone Contract: [1-line Brand Wordmark] — [4-5 Single-Line Nav Links] — [1 Primary Action] */}
      <header className="fixed top-0 left-0 right-0 z-40 h-14 px-6 bg-slate-950/95 border-b border-slate-800 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#campus-top"
          onClick={(e) => {
            e.preventDefault();
            handleResetAerialOverview();
          }}
          className="text-base font-display font-bold tracking-tight text-white whitespace-nowrap shrink-0"
        >
          University of Bisha — جامعة بيشة
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Primary Campus Navigation"
          className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300"
        >
          <a
            href="#locations"
            onClick={(e) => {
              e.preventDefault();
              setSidebarOpen(true);
              setSidebarTab('directory');
            }}
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Locations
          </a>
          <a
            href="#routes"
            onClick={(e) => {
              e.preventDefault();
              setSidebarOpen(true);
              setSidebarTab('routes');
              setRouteActive(true);
            }}
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Pathways
          </a>
          <a
            href="#tours"
            onClick={(e) => {
              e.preventDefault();
              setSidebarOpen(true);
              setSidebarTab('tours');
            }}
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Guided Tours
          </a>
          <a
            href="#campus-map"
            onClick={(e) => {
              e.preventDefault();
              setIsFullMapOpen(true);
            }}
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Campus Map
          </a>
          <a
            href="#settings"
            onClick={(e) => {
              e.preventDefault();
              setIsSettingsOpen(true);
            }}
            className="hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Settings
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() => {
              setSidebarOpen(true);
              setSidebarTab('tours');
              handleStartTour(CAMPUS_TOURS[0]);
            }}
            className="px-4 py-2 text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            Start Tour
          </button>
        </div>
      </header>

      {/* Main 3D WebGL Digital Twin Viewport */}
      <main className="w-full h-full pt-14">
        <CampusViewport3D
          buildings={buildings}
          selectedBuildingId={selectedBuildingId}
          onSelectBuilding={handleSelectBuilding}
          navigationMode={navigationMode}
          hourOfDay={hourOfDay}
          headlightsOn={headlightsOn}
          onToggleHeadlights={() => setHeadlightsOn((v) => !v)}
          activeRoutePoints={computedRoute ? computedRoute.points : []}
          measureMode={measureMode}
          measurePointA={measurePointA}
          measurePointB={measurePointB}
          onMeasureClickPoint={handleMeasureClickPoint}
          mouseSensitivity={mouseSensitivity}
          cameraFlyTarget={cameraFlyTarget}
          zoomTrigger={zoomTrigger}
          onPlayerTelemetryUpdate={setPlayerTelemetry}
          onCarTelemetryUpdate={setCarTelemetry}
        />
      </main>

      {/* Guided Tour Active Narration Overlay Banner */}
      {activeTour && currentTourStop && (
        <div
          className="fixed top-20 left-1/2 -translate-x-1/2 z-30 w-full max-w-xl px-4 pointer-events-auto"
          role="region"
          aria-label="Active Guided Tour Narration"
        >
          <div className="p-4 rounded-2xl bg-slate-950/95 border border-sky-500/50 shadow-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-sky-400">
              <span>
                {activeTour.title} · Stop 0{activeTourStopIndex + 1} / 0{activeTour.stops.length}
              </span>
              <button
                type="button"
                onClick={() => setActiveTour(null)}
                className="text-slate-400 hover:text-white"
              >
                Exit Tour
              </button>
            </div>
            <h3 className="text-sm font-display font-semibold text-white">
              {currentTourStop.title}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">{currentTourStop.narration}</p>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                disabled={activeTourStopIndex === 0}
                onClick={() => handleSelectTourStop(activeTourStopIndex - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 disabled:opacity-40 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous Stop</span>
              </button>
              <button
                type="button"
                disabled={activeTourStopIndex >= activeTour.stops.length - 1}
                onClick={() => handleSelectTourStop(activeTourStopIndex + 1)}
                className="px-3 py-1.5 rounded-lg bg-sky-500 text-slate-950 font-semibold text-xs disabled:opacity-40 flex items-center gap-1"
              >
                <span>Next Stop</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* First-Person / Third-Person / Drive Car Movement Helper Banner */}
      {navigationMode !== 'aerial' && navigationMode !== 'drive_car' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 px-4 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs text-slate-300 pointer-events-none flex items-center gap-3 whitespace-nowrap">
          <span>
            <strong className="text-white">WASD / Arrows</strong> Walk
          </span>
          <span>·</span>
          <span>
            <strong className="text-white">Shift</strong> Sprint
          </span>
          <span>·</span>
          <span>
            <strong className="text-white">Space</strong> Jump
          </span>
          <span>·</span>
          <span>
            <strong className="text-white">Drag Mouse / Q-E</strong> {navigationMode === 'third_person' ? 'Orbit Camera' : 'Look Around'}
          </span>
          {navigationMode === 'third_person' && (
            <>
              <span>·</span>
              <span>
                <strong className="text-white">Scroll</strong> Zoom
              </span>
            </>
          )}
        </div>
      )}

      {navigationMode === 'drive_car' && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-xl bg-slate-950/90 border border-emerald-500/40 text-[11px] text-slate-300 pointer-events-none flex items-center gap-2 whitespace-nowrap">
          <span>
            <strong className="text-white">W/S</strong> Drive
          </span>
          <span>·</span>
          <span>
            <strong className="text-white">A/D</strong> Steer
          </span>
          <span>·</span>
          <span>
            <strong className="text-white">Space</strong> Brake
          </span>
          <span>·</span>
          <span>
            <strong className="text-white">L</strong> Lights
          </span>
          <span>·</span>
          <span>
            <strong className="text-white">Drag / Scroll</strong> Camera
          </span>
        </div>
      )}

      {/* Left Campus Explorer Sidebar */}
      <LeftExplorerSidebar
        isOpen={sidebarOpen}
        onToggleOpen={() => setSidebarOpen((v) => !v)}
        activeTab={sidebarTab}
        onChangeTab={(tab) => {
          setSidebarTab(tab);
          if (tab === 'routes') setRouteActive(true);
        }}
        buildings={buildings}
        filteredBuildings={filteredBuildings}
        selectedBuildingId={selectedBuildingId}
        onSelectBuilding={handleSelectBuilding}
        onWalkAtBuilding={handleWalkAtBuilding}
        searchQuery={searchQuery}
        onChangeSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        onChangeCategory={setSelectedCategory}
        savedBuildingIds={savedBuildingIds}
        routeStartId={routeStartId}
        routeEndId={routeEndId}
        onChangeRouteStart={(id) => {
          setRouteStartId(id);
          setRouteActive(true);
        }}
        onChangeRouteEnd={(id) => {
          setRouteEndId(id);
          setRouteActive(true);
        }}
        accessibleRouteOnly={accessibleRouteOnly}
        onToggleAccessibleRoute={() => setAccessibleRouteOnly((v) => !v)}
        computedRoute={computedRoute}
        onClearRoute={() => setRouteActive(false)}
        onStartWalkAlongRoute={() => {
          const startBldg = buildings.find((b) => b.id === routeStartId);
          if (startBldg) {
            handleWalkAtBuilding(startBldg);
          }
        }}
        activeTour={activeTour}
        activeTourStopIndex={activeTourStopIndex}
        onStartTour={handleStartTour}
        onSelectTourStop={handleSelectTourStop}
        onStopTour={() => setActiveTour(null)}
      />

      {/* Right Selected Building Dossier Panel */}
      <BuildingDossierPanel
        building={selectedBuilding}
        onClose={() => setSelectedBuildingId(null)}
        onFlyToBuilding={handleFlyToBuilding}
        onWalkAtBuilding={handleWalkAtBuilding}
        onRouteToBuilding={handleRouteToBuilding}
        isSaved={selectedBuildingId ? savedBuildingIds.includes(selectedBuildingId) : false}
        onToggleSave={handleToggleSaveBuilding}
      />

      {/* Compact 2D GIS Radar (Shown at bottom-left when Left Sidebar is collapsed, or Fullscreen Modal when Expanded) */}
      {(!sidebarOpen || isFullMapOpen) && (
        <InteractiveCampusMap
          buildings={buildings}
          selectedBuildingId={selectedBuildingId}
          onSelectBuilding={handleSelectBuilding}
          onWalkToBuilding={handleWalkAtBuilding}
          playerTelemetry={playerTelemetry}
          activeRoutePoints={computedRoute ? computedRoute.points : []}
          isExpanded={isFullMapOpen}
          onToggleExpand={() => setIsFullMapOpen((v) => !v)}
        />
      )}

      {/* Collapsible Bottom Control Dock */}
      <BottomControlDock
        isCollapsed={dockCollapsed}
        onToggleCollapse={() => setDockCollapsed((v) => !v)}
        navigationMode={navigationMode}
        onChangeNavigationMode={handleChangeNavigationMode}
        hourOfDay={hourOfDay}
        onChangeHourOfDay={(nextHour) => {
          setHourOfDay(nextHour);
          if (navigationMode === 'drive_car' && (nextHour < 6 || nextHour >= 17.5)) {
            setHeadlightsOn(true);
          }
        }}
        onToggleDayNightQuick={() => {
          const goingNight = hourOfDay >= 6 && hourOfDay < 18.2;
          setHourOfDay(goingNight ? 21.0 : 10.5);
          if (navigationMode === 'drive_car') {
            setHeadlightsOn(goingNight);
          }
        }}
        onZoomIn={() => setZoomTrigger({ delta: 1, timestamp: Date.now() })}
        onZoomOut={() => setZoomTrigger({ delta: -1, timestamp: Date.now() })}
        onResetAerialOverview={handleResetAerialOverview}
        onToggleFullMap={() => setIsFullMapOpen((v) => !v)}
        measureMode={measureMode}
        onToggleMeasureMode={() => setMeasureMode((v) => !v)}
        activeMeasurement={activeMeasurement}
        onClearMeasurement={() => {
          setMeasurePointA(null);
          setMeasurePointB(null);
        }}
        carTelemetry={carTelemetry}
        headlightsOn={headlightsOn}
        onToggleHeadlights={() => setHeadlightsOn((v) => !v)}
      />

      {/* Navigation & Viewport Settings Modal */}
      {isSettingsOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Digital Twin Settings and Controls"
        >
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-base font-display font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-sky-400" />
                <span>Navigation & Environment Settings</span>
              </h2>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                aria-label="Close Settings"
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <div className="flex items-center justify-between text-slate-300 font-medium mb-1.5">
                  <label htmlFor="mouse-sens-range">Camera & Look Sensitivity</label>
                  <span className="font-mono text-sky-400">{mouseSensitivity.toFixed(1)}x</span>
                </div>
                <input
                  id="mouse-sens-range"
                  type="range"
                  min={0.3}
                  max={2.5}
                  step={0.1}
                  value={mouseSensitivity}
                  onChange={(e) => setMouseSensitivity(parseFloat(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-slate-300 font-medium">Viewport Display</span>
                <button
                  type="button"
                  onClick={handleToggleFullscreen}
                  className="px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-slate-200 border border-slate-800 flex items-center gap-1.5"
                >
                  <Maximize className="w-3.5 h-3.5 text-sky-400" />
                  <span>Toggle Fullscreen</span>
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5 text-slate-400">
                <div className="text-slate-200 font-semibold mb-1">Keyboard &amp; Mouse Controls</div>
                <div>· Orbit View: Left-drag to rotate, Right-drag to pan, Scroll to zoom</div>
                <div>· 1st/3rd Person: W/A/S/D or Arrow keys to walk, Shift to sprint</div>
                <div>· Jump &amp; Look: Spacebar to jump, Mouse drag or Q/E to look around</div>
                <div>· Drive Car: W/S throttle/reverse, A/D steer, Space handbrake, L headlights</div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsSettingsOpen(false)}
              className="w-full py-2 px-4 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
