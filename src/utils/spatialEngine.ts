import {
  CAMPUS_BUILDINGS,
  NAV_EDGES,
  NAV_NODES,
  BuildingCategory,
  CampusBuilding,
  NavNode,
} from '../data/campusData';

export interface RouteStep {
  fromNodeId: string;
  toNodeId: string;
  roadName: string;
  distanceMeters: number;
  directionCardinal: string;
  instruction: string;
}

export interface ComputedRoute {
  startBuildingId: string;
  endBuildingId: string;
  points: Array<{ x: number; z: number }>;
  nodeIds: string[];
  totalDistanceMeters: number;
  estimatedWalkMinutes: number;
  steps: RouteStep[];
  isFullyAccessible: boolean;
  accessibilityWarning?: string;
}

export interface DistanceMeasurement {
  pointA: { x: number; z: number };
  pointB: { x: number; z: number };
  straightLineMeters: number;
  manhattanWalkMeters: number;
  estimatedWalkMinutes: number;
  bearingDegrees: number;
  compassDirection: string;
}

export interface AABBCollider {
  id: string;
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  maxY: number;
}

export interface SolarLightingState {
  hour: number;
  phase: 'day' | 'golden_hour' | 'twilight' | 'night';
  sunPosition: [number, number, number];
  sunColorHex: number;
  sunIntensity: number;
  hemiSkyColorHex: number;
  hemiGroundColorHex: number;
  hemiIntensity: number;
  skyTopColorHex: number;
  skyHorizonColorHex: number;
  fogColorHex: number;
  streetlightsActive: boolean;
  windowGlowIntensity: number;
  exposure: number;
}

const WALKING_SPEED_MPS = 1.35; // 1.35 meters/sec (~4.86 km/h)

export function getCompassBearing(dx: number, dz: number): {
  degrees: number;
  cardinal: string;
} {
  // In our coordinate system: -Z is North (0 deg), +X is East (90 deg), +Z is South (180 deg), -X is West (270 deg)
  const rad = Math.atan2(dx, -dz);
  let deg = (rad * 180) / Math.PI;
  if (deg < 0) deg += 360;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const idx = Math.round(deg / 45) % 8;
  return {
    degrees: Math.round(deg),
    cardinal: directions[idx],
  };
}

export function measureDistanceMeters(
  pA: { x: number; z: number },
  pB: { x: number; z: number },
): DistanceMeasurement {
  const dx = pB.x - pA.x;
  const dz = pB.z - pA.z;
  const straight = Math.hypot(dx, dz);
  const manhattan = Math.abs(dx) + Math.abs(dz);
  const { degrees, cardinal } = getCompassBearing(dx, dz);

  return {
    pointA: { ...pA },
    pointB: { ...pB },
    straightLineMeters: Number(straight.toFixed(1)),
    manhattanWalkMeters: Number(manhattan.toFixed(1)),
    estimatedWalkMinutes: Math.max(1, Math.round(manhattan / (WALKING_SPEED_MPS * 60))),
    bearingDegrees: degrees,
    compassDirection: cardinal,
  };
}

export function findShortestRoute(
  startBuildingId: string,
  endBuildingId: string,
  options: { accessibleOnly?: boolean; buildings?: CampusBuilding[] } = {},
): ComputedRoute | null {
  const buildings = options.buildings ?? CAMPUS_BUILDINGS;
  const resolveId = (id: string) => {
    if (id === 'admin-row-cluster') return 'bldg-01';
    if (id === 'sports-courts-west') return 'sports-court-1';
    return id;
  };
  const resolvedStartId = resolveId(startBuildingId);
  const resolvedEndId = resolveId(endBuildingId);
  const startBldg = buildings.find((b) => b.id === resolvedStartId);
  const endBldg = buildings.find((b) => b.id === resolvedEndId);
  if (!startBldg || !endBldg) return null;

  const nodeMap = new Map<string, NavNode>();
  for (const n of NAV_NODES) {
    nodeMap.set(n.id, n);
  }

  const startNode = nodeMap.get(startBldg.entryNodeId);
  const endNode = nodeMap.get(endBldg.entryNodeId);
  if (!startNode || !endNode) return null;

  if (startBuildingId === endBuildingId) {
    return {
      startBuildingId,
      endBuildingId,
      points: [{ x: startNode.x, z: startNode.z }],
      nodeIds: [startNode.id],
      totalDistanceMeters: 0,
      estimatedWalkMinutes: 0,
      steps: [],
      isFullyAccessible: startBldg.accessible,
    };
  }

  // Build adjacency list
  const adj = new Map<string, Array<{ to: string; weight: number; roadName: string }>>();
  for (const n of NAV_NODES) {
    adj.set(n.id, []);
  }
  for (const edge of NAV_EDGES) {
    if (options.accessibleOnly && !edge.accessible) continue;
    const nA = nodeMap.get(edge.from);
    const nB = nodeMap.get(edge.to);
    if (!nA || !nB) continue;
    const dist = Math.hypot(nB.x - nA.x, nB.z - nA.z);
    adj.get(edge.from)!.push({ to: edge.to, weight: dist, roadName: edge.roadName });
    adj.get(edge.to)!.push({ to: edge.from, weight: dist, roadName: edge.roadName });
  }

  // Dijkstra / A* search
  const gScore = new Map<string, number>();
  const fScore = new Map<string, number>();
  const cameFrom = new Map<string, { prev: string; roadName: string; dist: number }>();
  const openSet = new Set<string>([startNode.id]);

  for (const n of NAV_NODES) {
    gScore.set(n.id, Infinity);
    fScore.set(n.id, Infinity);
  }
  gScore.set(startNode.id, 0);
  fScore.set(startNode.id, Math.hypot(endNode.x - startNode.x, endNode.z - startNode.z));

  while (openSet.size > 0) {
    let current = '';
    let bestF = Infinity;
    for (const id of openSet) {
      const f = fScore.get(id) ?? Infinity;
      if (f < bestF) {
        bestF = f;
        current = id;
      }
    }

    if (!current) break;
    if (current === endNode.id) break;

    openSet.delete(current);
    const neighbors = adj.get(current) ?? [];
    for (const neighbor of neighbors) {
      const tentativeG = (gScore.get(current) ?? Infinity) + neighbor.weight;
      if (tentativeG < (gScore.get(neighbor.to) ?? Infinity)) {
        cameFrom.set(neighbor.to, {
          prev: current,
          roadName: neighbor.roadName,
          dist: neighbor.weight,
        });
        gScore.set(neighbor.to, tentativeG);
        const nbNode = nodeMap.get(neighbor.to)!;
        const h = Math.hypot(endNode.x - nbNode.x, endNode.z - nbNode.z);
        fScore.set(neighbor.to, tentativeG + h);
        openSet.add(neighbor.to);
      }
    }
  }

  if (!cameFrom.has(endNode.id) && startNode.id !== endNode.id) {
    return null;
  }

  // Reconstruct path
  const nodeIds: string[] = [endNode.id];
  const rawSteps: RouteStep[] = [];
  let curr = endNode.id;

  while (cameFrom.has(curr)) {
    const info = cameFrom.get(curr)!;
    const fromN = nodeMap.get(info.prev)!;
    const toN = nodeMap.get(curr)!;
    const { cardinal } = getCompassBearing(toN.x - fromN.x, toN.z - fromN.z);
    rawSteps.unshift({
      fromNodeId: info.prev,
      toNodeId: curr,
      roadName: info.roadName,
      distanceMeters: Math.round(info.dist),
      directionCardinal: cardinal,
      instruction: `Head ${cardinal} along ${info.roadName} toward ${toN.label} (${Math.round(info.dist)}m)`,
    });
    nodeIds.unshift(info.prev);
    curr = info.prev;
  }

  // Include start building entrance offset and end building entrance offset
  const points: Array<{ x: number; z: number }> = [
    { x: startBldg.cameraViewPreset.walkSpawn[0], z: startBldg.cameraViewPreset.walkSpawn[2] },
    ...nodeIds.map((id) => {
      const n = nodeMap.get(id)!;
      return { x: n.x, z: n.z };
    }),
    { x: endBldg.cameraViewPreset.walkSpawn[0], z: endBldg.cameraViewPreset.walkSpawn[2] },
  ];

  let totalDist = 0;
  for (let i = 1; i < points.length; i++) {
    totalDist += Math.hypot(points[i].x - points[i - 1].x, points[i].z - points[i - 1].z);
  }
  totalDist = Math.round(totalDist);

  const isFullyAccessible = startBldg.accessible && endBldg.accessible;
  let accessibilityWarning: string | undefined;
  if (!startBldg.accessible || !endBldg.accessible) {
    const nonAccName = !startBldg.accessible ? startBldg.nameEn : endBldg.nameEn;
    accessibilityWarning = `${nonAccName} has a stepped concrete entrance landing; pathways to the entrance plaza are step-free, and ramp assistance is available at the door.`;
  }

  return {
    startBuildingId,
    endBuildingId,
    points,
    nodeIds,
    totalDistanceMeters: totalDist,
    estimatedWalkMinutes: Math.max(1, Math.round(totalDist / (WALKING_SPEED_MPS * 60))),
    steps: rawSteps,
    isFullyAccessible,
    accessibilityWarning,
  };
}

export function buildCampusColliders(buildings: CampusBuilding[] = CAMPUS_BUILDINGS): AABBCollider[] {
  const colliders: AABBCollider[] = [];

  for (const b of buildings) {
    // Open ground areas like gardens, sports fields, courts, and open-sided carports or gates with pass-through roadways
    if (
      b.archetype === 'sports_pitch' ||
      b.archetype === 'multi_sport_courts' ||
      b.archetype === 'formal_courtyard_garden' ||
      b.archetype === 'shaded_carport_bay'
    ) {
      continue;
    }

    if (b.archetype === 'main_gate_1') {
      // Central security booth island only so player can walk/drive through the dual gate lanes!
      colliders.push({
        id: `${b.id}-island`,
        minX: b.position.x - 5,
        maxX: b.position.x + 5,
        minZ: b.position.z - 2.2,
        maxZ: b.position.z + 2.2,
        maxY: b.dimensions.height,
      });
      continue;
    }

    if (b.archetype === 'gate_2') {
      // Central monumental tower only so left and right wing lanes remain walkable!
      colliders.push({
        id: `${b.id}-pylon`,
        minX: b.position.x - 4.5,
        maxX: b.position.x + 4.5,
        minZ: b.position.z - 3.5,
        maxZ: b.position.z + 3.5,
        maxY: b.dimensions.height,
      });
      continue;
    }

    const hw = b.dimensions.width / 2;
    const hd = b.dimensions.depth / 2;
    colliders.push({
      id: b.id,
      minX: b.position.x - hw,
      maxX: b.position.x + hw,
      minZ: b.position.z - hd,
      maxZ: b.position.z + hd,
      maxY: b.dimensions.height,
    });
  }

  // Campus Perimeter Boundary Walls (x: -195..195, z: -258..300) with Gate 1 & Gate 2 openings
  colliders.push(
    { id: 'wall-north', minX: -196, maxX: 196, minZ: -259, maxZ: -257, maxY: 4.8 },
    { id: 'wall-south', minX: -196, maxX: 196, minZ: 299, maxZ: 301, maxY: 4.8 },
    { id: 'wall-west-north', minX: -196, maxX: -194, minZ: -259, maxZ: -47, maxY: 4.8 },
    { id: 'wall-west-south', minX: -196, maxX: -194, minZ: -23, maxZ: 301, maxY: 4.8 },
    { id: 'wall-east-north', minX: 194, maxX: 196, minZ: -259, maxZ: 256, maxY: 4.8 },
    { id: 'wall-east-south', minX: 194, maxX: 196, minZ: 288, maxZ: 301, maxY: 4.8 },
  );

  return colliders;
}

export function resolveCollision(
  currentPos: { x: number; z: number },
  targetPos: { x: number; z: number },
  playerRadius: number,
  colliders: AABBCollider[],
): { x: number; z: number; collided: boolean } {
  // Clamp to overall campus exploration bounds (vast open masterplan)
  const BOUND = 750;
  let nextX = Math.max(-BOUND, Math.min(BOUND, targetPos.x));
  let nextZ = Math.max(-BOUND, Math.min(BOUND, targetPos.z));
  let collided = false;

  // Check X movement independently then Z movement for smooth wall sliding
  for (const c of colliders) {
    const minX = c.minX - playerRadius;
    const maxX = c.maxX + playerRadius;
    const minZ = c.minZ - playerRadius;
    const maxZ = c.maxZ + playerRadius;

    if (nextX > minX && nextX < maxX && currentPos.z > minZ && currentPos.z < maxZ) {
      nextX = currentPos.x;
      collided = true;
    }
  }

  for (const c of colliders) {
    const minX = c.minX - playerRadius;
    const maxX = c.maxX + playerRadius;
    const minZ = c.minZ - playerRadius;
    const maxZ = c.maxZ + playerRadius;

    if (nextX > minX && nextX < maxX && nextZ > minZ && nextZ < maxZ) {
      nextZ = currentPos.z;
      collided = true;
    }
  }

  return { x: nextX, z: nextZ, collided };
}

export function computeSolarLighting(hourOfDay: number): SolarLightingState {
  const hour = ((hourOfDay % 24) + 24) % 24;

  // Solar elevation: sunrise ~06:00, solar noon 12:15, sunset ~18:15 in Bisha
  const normalizedDay = (hour - 6) / 12; // 0 at 6:00, 0.5 at 12:00, 1.0 at 18:00
  const sunAngle = normalizedDay * Math.PI;
  const sinElev = Math.sin(sunAngle);
  const cosAzim = Math.cos(sunAngle);

  const radius = 190;
  const sunX = -cosAzim * radius;
  const sunY = Math.max(18, Math.abs(sinElev) * 165);
  const sunZ = -65 + Math.sin(normalizedDay * Math.PI * 0.5) * 45;

  if (hour >= 7.0 && hour <= 16.75) {
    // Full Arabian Daylight — calibrated contrast so cream/tan facades, cool paved courtyard, and warm desert remain distinct
    return {
      hour,
      phase: 'day',
      sunPosition: [sunX, sunY, sunZ],
      sunColorHex: 0xfff5e0,
      sunIntensity: 1.75,
      hemiSkyColorHex: 0x7ec8f2,
      hemiGroundColorHex: 0x6f655a,
      hemiIntensity: 0.62,
      skyTopColorHex: 0x1e64b4,
      skyHorizonColorHex: 0x9bd0f5,
      fogColorHex: 0xcbe4f9,
      streetlightsActive: false,
      windowGlowIntensity: 0.0,
      exposure: 0.96,
    };
  }

  if ((hour >= 5.5 && hour < 7.0) || (hour > 16.75 && hour <= 18.5)) {
    // Dawn / Golden Hour (matches Gate 2 photograph sky)
    return {
      hour,
      phase: 'golden_hour',
      sunPosition: [sunX, 42, sunZ],
      sunColorHex: 0xff9e5e,
      sunIntensity: 1.45,
      hemiSkyColorHex: 0x4f7cac,
      hemiGroundColorHex: 0x8a6d53,
      hemiIntensity: 0.7,
      skyTopColorHex: 0x173766,
      skyHorizonColorHex: 0xe69f65,
      fogColorHex: 0xd19a72,
      streetlightsActive: hour >= 17.5 || hour < 6.2,
      windowGlowIntensity: 0.45,
      exposure: 1.05,
    };
  }

  if ((hour >= 5.0 && hour < 5.5) || (hour > 18.5 && hour <= 19.25)) {
    // Blue Hour Twilight
    return {
      hour,
      phase: 'twilight',
      sunPosition: [sunX, 30, sunZ],
      sunColorHex: 0x6488ea,
      sunIntensity: 0.65,
      hemiSkyColorHex: 0x1e3a5f,
      hemiGroundColorHex: 0x2a2421,
      hemiIntensity: 0.5,
      skyTopColorHex: 0x0b162c,
      skyHorizonColorHex: 0x26466d,
      fogColorHex: 0x182b49,
      streetlightsActive: true,
      windowGlowIntensity: 0.85,
      exposure: 0.98,
    };
  }

  // Night Mode
  return {
    hour,
    phase: 'night',
    sunPosition: [60, 120, -80], // Moonlight direction
    sunColorHex: 0x7da2d9,
    sunIntensity: 0.24,
    hemiSkyColorHex: 0x101c30,
    hemiGroundColorHex: 0x0d0c0a,
    hemiIntensity: 0.2,
    skyTopColorHex: 0x040812,
    skyHorizonColorHex: 0x081120,
    fogColorHex: 0x070f1d,
    streetlightsActive: true,
    windowGlowIntensity: 1.35,
    exposure: 1.05,
  };
}

export function filterCampusStructures(
  structures: CampusBuilding[],
  query: string,
  category: BuildingCategory | 'all',
): CampusBuilding[] {
  const normalizedQuery = query.trim().toLowerCase();

  return structures.filter((b) => {
    if (category !== 'all' && b.category !== category) {
      return false;
    }
    if (!normalizedQuery) {
      return true;
    }
    const haystack = [
      b.nameEn,
      b.nameAr,
      b.code,
      b.category,
      ...b.departments,
      ...b.facilities,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalizedQuery);
  });
}
