import React from 'react';
import {
  Car,
  ChevronDown,
  ChevronUp,
  Footprints,
  Globe,
  Map as MapIcon,
  Moon,
  RotateCcw,
  Ruler,
  Sun,
  User,
  Lightbulb,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { NavigationMode } from './CampusViewport3D';
import { DistanceMeasurement } from '../utils/spatialEngine';

interface BottomControlDockProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  navigationMode: NavigationMode;
  onChangeNavigationMode: (mode: NavigationMode) => void;
  hourOfDay: number;
  onChangeHourOfDay: (hour: number) => void;
  onToggleDayNightQuick: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetAerialOverview: () => void;
  onToggleFullMap: () => void;
  measureMode: boolean;
  onToggleMeasureMode: () => void;
  activeMeasurement: DistanceMeasurement | null;
  onClearMeasurement: () => void;
  carTelemetry?: { speedKmh: number; gear: 'P' | 'D' | 'R' };
  headlightsOn?: boolean;
  onToggleHeadlights?: () => void;
}

function formatHourLabel(hour: number): string {
  const h = Math.floor(((hour % 24) + 24) % 24);
  const m = Math.round((hour - Math.floor(hour)) * 60) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export const BottomControlDock: React.FC<BottomControlDockProps> = ({
  isCollapsed,
  onToggleCollapse,
  navigationMode,
  onChangeNavigationMode,
  hourOfDay,
  onChangeHourOfDay,
  onToggleDayNightQuick,
  onZoomIn,
  onZoomOut,
  onResetAerialOverview,
  onToggleFullMap,
  measureMode,
  onToggleMeasureMode,
  activeMeasurement,
  onClearMeasurement,
  carTelemetry = { speedKmh: 0, gear: 'P' },
  headlightsOn = false,
  onToggleHeadlights,
}) => {
  const isNight = hourOfDay < 6 || hourOfDay >= 18.2;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center max-w-[95vw]"
      aria-label="Campus Navigation and Environment Controls"
    >
      {/* Active Car Driving Telemetry HUD (stacked cleanly above dock) */}
      {navigationMode === 'drive_car' && (
        <div
          data-testid="car-driving-hud"
          className="mb-2 px-4 py-1.5 rounded-2xl bg-slate-950/95 border border-emerald-500/40 shadow-xl flex items-center gap-4 text-xs"
        >
          <div className="flex items-baseline gap-1.5 font-mono">
            <span
              data-testid="car-speed-readout"
              className="text-lg font-bold text-white tabular-nums"
            >
              {carTelemetry.speedKmh}
            </span>
            <span className="text-[10px] text-slate-400">KM/H</span>
          </div>
          <div className="h-5 w-px bg-slate-800" />
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-400">GEAR</span>
            <span
              data-testid="car-gear-readout"
              className={`px-2 py-0.5 rounded-md font-mono font-bold text-xs ${
                carTelemetry.gear === 'R'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : carTelemetry.gear === 'D'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
              }`}
            >
              {carTelemetry.gear}
            </span>
          </div>
          <div className="h-5 w-px bg-slate-800" />
          <button
            type="button"
            data-testid="car-headlights-toggle"
            onClick={(e) => {
              e.currentTarget.blur();
              onToggleHeadlights?.();
            }}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              headlightsOn
                ? 'bg-amber-400/20 border-amber-400/50 text-amber-200'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>{headlightsOn ? 'Lights On' : 'Lights Off'}</span>
          </button>
        </div>
      )}

      {/* Active Measurement Readout Banner */}
      {measureMode && (
        <div className="mb-2 px-4 py-2 rounded-xl bg-slate-950/95 border border-amber-500/50 text-xs text-slate-200 shadow-xl flex items-center gap-4">
          <span className="text-amber-300 font-semibold flex items-center gap-1.5 whitespace-nowrap">
            <Ruler className="w-3.5 h-3.5" />
            <span>Geospatial Distance Tool</span>
          </span>
          {activeMeasurement ? (
            <div className="flex items-center gap-3 font-mono text-xs">
              <span>
                Direct: <strong className="text-white">{activeMeasurement.straightLineMeters}m</strong>
              </span>
              <span>·</span>
              <span>
                Pathway: <strong className="text-sky-400">{activeMeasurement.manhattanWalkMeters}m</strong>
              </span>
              <span>·</span>
              <span>
                Walk: <strong className="text-emerald-400">~{activeMeasurement.estimatedWalkMinutes} min</strong> ({activeMeasurement.compassDirection})
              </span>
              <button
                type="button"
                onClick={onClearMeasurement}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
              >
                Reset Points
              </button>
            </div>
          ) : (
            <span className="text-slate-400">
              Click any two points on the 3D campus ground to measure real-world meters.
            </span>
          )}
        </div>
      )}

      {/* Collapse / Expand Tab */}
      <button
        type="button"
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? 'Show Controls' : 'Hide Controls'}
        className="mb-1.5 px-3 py-1 rounded-full bg-slate-950/95 border border-slate-800 text-[11px] font-medium text-slate-300 hover:text-white shadow-lg flex items-center gap-1.5 transition-colors whitespace-nowrap"
      >
        {isCollapsed ? (
          <>
            <ChevronUp className="w-3.5 h-3.5 text-sky-400" />
            <span>Show Controls</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            <span>Hide Controls</span>
          </>
        )}
      </button>

      {/* Main Dock Bar */}
      {!isCollapsed && (
        <div className="px-4 py-2.5 rounded-2xl bg-slate-950/95 border border-slate-800 shadow-2xl flex items-center gap-3 flex-wrap justify-center">
          {/* 1. Perspective / Movement Mode Switcher */}
          <div
            className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800"
            role="group"
            aria-label="Camera Perspective Mode"
          >
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onChangeNavigationMode('aerial');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                navigationMode === 'aerial'
                  ? 'bg-sky-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Aerial Orbit</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onChangeNavigationMode('first_person');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                navigationMode === 'first_person'
                  ? 'bg-sky-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Footprints className="w-3.5 h-3.5" />
              <span>1st-Person Walk</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onChangeNavigationMode('third_person');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                navigationMode === 'third_person'
                  ? 'bg-sky-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>3rd-Person</span>
            </button>
            <button
              type="button"
              data-testid="drive-car-button"
              onClick={(e) => {
                e.currentTarget.blur();
                onChangeNavigationMode('drive_car');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                navigationMode === 'drive_car'
                  ? 'bg-emerald-500 text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Car className="w-3.5 h-3.5" />
              <span>Drive Car</span>
            </button>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* 2. Zoom & Reset Controls */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onZoomIn();
              }}
              aria-label="Zoom In"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onZoomOut();
              }}
              aria-label="Zoom Out"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onResetAerialOverview();
              }}
              aria-label="Reset Campus Aerial View"
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-colors"
              title="Reset Campus Overview"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* 3. Dedicated Night Visit Button & Solar Time-of-Day Slider */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-testid="night-visit-button"
              onClick={onToggleDayNightQuick}
              aria-label={isNight ? 'Switch to Daylight View' : 'Night Visit — Turn On All Campus Lights'}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all whitespace-nowrap border shadow-sm ${
                isNight
                  ? 'bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/50'
              }`}
              title={
                isNight
                  ? 'Return to Daylight Campus View (10:30 AM)'
                  : 'Shift to Nighttime (9:00 PM) with all campus & road lights illuminated'
              }
            >
              {isNight ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-slate-950" />
                  <span>Daylight View</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-300" />
                  <span>Night Visit</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              {isNight ? (
                <Moon className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              )}
              <span className="font-mono text-xs text-slate-200">{formatHourLabel(hourOfDay)}</span>
              <input
                type="range"
                aria-label="Solar Time of Day"
                min={0}
                max={23.9}
                step={0.1}
                value={hourOfDay}
                onChange={(e) => onChangeHourOfDay(parseFloat(e.target.value))}
                className="w-20 accent-sky-400 cursor-pointer"
              />
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* 4. Interactive Map & Measure Tool */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onToggleFullMap}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <MapIcon className="w-3.5 h-3.5 text-sky-400" />
              <span>2D Map</span>
            </button>

            <button
              type="button"
              onClick={onToggleMeasureMode}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                measureMode
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-200'
              }`}
            >
              <Ruler className="w-3.5 h-3.5 text-amber-400" />
              <span>Measure</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
