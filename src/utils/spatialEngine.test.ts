import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CAMPUS_BUILDINGS,
  CAMPUS_TOURS,
  worldToCampusSvg,
} from '../data/campusData';
import {
  buildCampusColliders,
  computeSolarLighting,
  filterCampusStructures,
  findShortestRoute,
  measureDistanceMeters,
  resolveCollision,
} from './spatialEngine';
import {
  computeHumanWalkPose,
  computeSafeThirdPersonCameraPos,
  createInitialThirdPersonState,
  shortestAngleDelta,
  stepThirdPersonKinematics,
} from './thirdPersonEngine';
import {
  createInitialCarState,
  findSafeCarSpawn,
  isCarPositionClear,
  stepCarPhysics,
} from './carPhysicsEngine';

test('worldToCampusSvg projects campus landmarks onto 2D vector GIS map coordinates', () => {
  const pitchSvg = worldToCampusSvg(0, 0);
  assert.equal(pitchSvg.u, 525);
  assert.equal(pitchSvg.v, 595);

  const gate1Svg = worldToCampusSvg(-195, -35);
  assert.ok(gate1Svg.u > 800 && gate1Svg.u < 860);
  assert.ok(gate1Svg.v > 690 && gate1Svg.v < 750);

  const gardenSvg = worldToCampusSvg(150, 248);
  assert.ok(gardenSvg.u > 320 && gardenSvg.u < 395);
  assert.ok(gardenSvg.v > 80 && gardenSvg.v < 165);
});

test('all campus buildings and tours have clean architectural descriptions and zero exposed reference material', () => {
  assert.ok(CAMPUS_BUILDINGS.length >= 13);

  const forbiddenPatterns = [
    '/assets/aistudio',
    '.jpg',
    '.png',
    '.mp4',
    'google.com/maps',
    'maps.app.goo.gl',
    'bicycle',
  ];

  for (const b of CAMPUS_BUILDINGS) {
    assert.ok(b.dimensions.width > 0 && b.dimensions.depth > 0 && b.dimensions.height > 0);
    assert.ok(b.description.trim().length > 20, `${b.id} must have a clean architectural description`);
    const serialized = JSON.stringify(b).toLowerCase();
    for (const pattern of forbiddenPatterns) {
      assert.ok(!serialized.includes(pattern), `${b.id} must not expose ${pattern}`);
    }
  }

  const toursSerialized = JSON.stringify(CAMPUS_TOURS).toLowerCase();
  for (const pattern of forbiddenPatterns) {
    assert.ok(!toursSerialized.includes(pattern), `CAMPUS_TOURS must not expose ${pattern}`);
  }
});

test('findShortestRoute computes valid pathway between Main Gate 1 and Building 18 (Computing & IT)', () => {
  const route = findShortestRoute('gate-1', 'computing-bldg-18');
  assert.ok(route, 'Route should exist');
  assert.ok(route.totalDistanceMeters > 80);
  assert.ok(route.estimatedWalkMinutes >= 1);
  assert.ok(route.steps.length >= 2);
  assert.equal(route.isFullyAccessible, true);
});

test('findShortestRoute computes valid pathway along the bicycle video route from Gate 1 to Administration Building 1', () => {
  const route = findShortestRoute('gate-1', 'bldg-01', { accessibleOnly: true });
  assert.ok(route, 'Route to Administration Building 1 should resolve');
  assert.equal(route.isFullyAccessible, true);
  assert.ok(route.totalDistanceMeters > 150);
});

test('measureDistanceMeters calculates accurate distance and bearing between Gate 1 and Gate 2 at the South-East Garden Portal', () => {
  const gate1 = CAMPUS_BUILDINGS.find((b) => b.id === 'gate-1')!;
  const gate2 = CAMPUS_BUILDINGS.find((b) => b.id === 'gate-2')!;
  assert.equal(gate2.position.x, 195);
  assert.ok(gate2.position.z >= 270, 'Gate 2 positioned at southeast portal road');
  const m = measureDistanceMeters(gate1.position, gate2.position);

  assert.ok(m.straightLineMeters > 260);
  assert.ok(m.manhattanWalkMeters > m.straightLineMeters);
  assert.equal(m.compassDirection, 'SE');

  const routeToGate2 = findShortestRoute('gate-1', 'gate-2');
  assert.ok(routeToGate2, 'Route from Gate 1 to Gate 2 should resolve');
  assert.ok(routeToGate2.totalDistanceMeters > 280);
});

test('resolveCollision prevents walking through solid buildings while permitting open road movement', () => {
  const colliders = buildCampusColliders();
  const bldg19 = CAMPUS_BUILDINGS.find((b) => b.id === 'academic-bldg-19')!;

  // Attempt to step from outside south edge directly into Building 19 footprint
  const outsidePos = {
    x: bldg19.position.x,
    z: bldg19.position.z + bldg19.dimensions.depth / 2 + 2,
  };
  const insideTarget = { x: bldg19.position.x, z: bldg19.position.z };
  const res = resolveCollision(outsidePos, insideTarget, 1.0, colliders);

  assert.equal(res.collided, true);
  assert.equal(res.z, outsidePos.z);

  // Walking along open Playground Northern Boulevard (z = -82) and Inner Academic Boulevard (z = -154) should not collide
  const roadStart = { x: -20, z: -82 };
  const roadNext = { x: -15, z: -82 };
  const roadRes = resolveCollision(roadStart, roadNext, 1.0, colliders);
  assert.equal(roadRes.collided, false);
  assert.equal(roadRes.x, -15);

  const innerRoadRes = resolveCollision({ x: -30, z: -154 }, { x: -25, z: -154 }, 1.0, colliders);
  assert.equal(innerRoadRes.collided, false);
  assert.equal(innerRoadRes.x, -25);
});

test('perimeter walls enclose the campus while Gate 1 and Gate 2 remain passable', () => {
  const colliders = buildCampusColliders();
  // North wall blocks stepping into z = -258
  const northWallAttempt = resolveCollision({ x: 0, z: -255.5 }, { x: 0, z: -257.5 }, 1.0, colliders);
  assert.equal(northWallAttempt.collided, true);

  // Main Gate 1 entry lane (-195, -29) remains passable
  const gate1Walk = resolveCollision({ x: -197, z: -29 }, { x: -194, z: -29 }, 0.9, colliders);
  assert.equal(gate1Walk.collided, false);

  // Gate 2 entry lane (195, 265) remains passable
  const gate2Walk = resolveCollision({ x: 193, z: 265 }, { x: 196, z: 265 }, 0.9, colliders);
  assert.equal(gate2Walk.collided, false);
});

test('computeSolarLighting transitions properly between Day, Golden Hour, and Night', () => {
  const noon = computeSolarLighting(12.5);
  assert.equal(noon.phase, 'day');
  assert.equal(noon.streetlightsActive, false);

  const dusk = computeSolarLighting(17.8);
  assert.equal(dusk.phase, 'golden_hour');
  assert.equal(dusk.streetlightsActive, true);

  const midnight = computeSolarLighting(23.0);
  assert.equal(midnight.phase, 'night');
  assert.equal(midnight.streetlightsActive, true);
  assert.equal(midnight.windowGlowIntensity, 1.35);
});

test('filterCampusStructures supports both Arabic and English search queries and category filters', () => {
  const computingAr = filterCampusStructures(CAMPUS_BUILDINGS, 'كلية الحاسبات', 'all');
  assert.equal(computingAr.length, 1);
  assert.equal(computingAr[0].id, 'computing-bldg-18');

  const mosqueOnly = filterCampusStructures(CAMPUS_BUILDINGS, '', 'mosque');
  assert.equal(mosqueOnly.length, 1);
  assert.equal(mosqueOnly[0].id, 'mosque-main');
});

test('expanded University Central Library spans behind the football ground cleanly without overlap', () => {
  const lib = CAMPUS_BUILDINGS.find((b) => b.id === 'library-main')!;
  const pitch = CAMPUS_BUILDINGS.find((b) => b.id === 'sports-football-pitch')!;
  const annex = CAMPUS_BUILDINGS.find((b) => b.id === 'library-annex')!;
  const support = CAMPUS_BUILDINGS.find((b) => b.id === 'support-hall-sw')!;

  assert.ok(lib.dimensions.height >= 20, 'Library should be tall (5 stories / >= 20m)');
  assert.ok(lib.dimensions.width >= 170, 'Library should span wide behind the football ground');
  assert.ok(lib.dimensions.depth >= 100, 'Library should cover deep behind the football ground');

  const libMinX = lib.position.x - lib.dimensions.width / 2;
  const libMaxX = lib.position.x + lib.dimensions.width / 2;
  const libMinZ = lib.position.z - lib.dimensions.depth / 2;
  const libMaxZ = lib.position.z + lib.dimensions.depth / 2;

  const pitchMinX = pitch.position.x - pitch.dimensions.width / 2;
  const pitchMaxX = pitch.position.x + pitch.dimensions.width / 2;
  const pitchMaxZ = pitch.position.z + pitch.dimensions.depth / 2;

  assert.ok(libMinX <= pitchMinX && libMaxX >= pitchMaxX, 'Library spans across the entire width behind the football pitch');
  assert.ok(libMinZ > pitchMaxZ + 15, 'Library leaves clear promenade south of the football pitch');
  assert.ok(annex.position.z - annex.dimensions.depth / 2 > libMaxZ + 10, 'Library annex clears main library south wall');
  assert.ok(support.position.x + support.dimensions.width / 2 < libMinX - 20, 'Support hall does not overlap library');

  const colliders = buildCampusColliders();
  const promenadeWalk = resolveCollision({ x: -46, z: 78 }, { x: -42, z: 78 }, 1.0, colliders);
  assert.equal(promenadeWalk.collided, false);
});

test('northern academic tiers (Bldgs 17, 18, 19 and outer 15, 16, 14) maintain wide separation and navigable roads', () => {
  const pitch = CAMPUS_BUILDINGS.find((b) => b.id === 'sports-football-pitch')!;
  const b17 = CAMPUS_BUILDINGS.find((b) => b.id === 'academic-bldg-17')!;
  const b18 = CAMPUS_BUILDINGS.find((b) => b.id === 'computing-bldg-18')!;
  const b19 = CAMPUS_BUILDINGS.find((b) => b.id === 'academic-bldg-19')!;
  const b15 = CAMPUS_BUILDINGS.find((b) => b.id === 'academic-bldg-15')!;
  const b16 = CAMPUS_BUILDINGS.find((b) => b.id === 'academic-bldg-16')!;
  const b14 = CAMPUS_BUILDINGS.find((b) => b.id === 'academic-bldg-14')!;

  for (const b of [b17, b18, b19, b15, b16, b14]) {
    assert.ok(b, 'Northern building must exist in CAMPUS_BUILDINGS');
  }

  const pitchNorthEdge = pitch.position.z - pitch.dimensions.depth / 2;
  const intermediateSouthEdge = b18.position.z + b18.dimensions.depth / 2;
  const intermediateNorthEdge = b18.position.z - b18.dimensions.depth / 2;
  const outerSouthEdge = b16.position.z + b16.dimensions.depth / 2;

  // Wide botanical buffer + Playground Northern Boulevard between pitch and intermediate buildings
  assert.ok(pitchNorthEdge - intermediateSouthEdge >= 40, 'Wide space (>=40m) north of football pitch before Bldg 17/18/19');
  // Inner Academic Boulevard separating intermediate tier from outer front buildings
  assert.ok(intermediateNorthEdge - outerSouthEdge >= 40, 'Wide road corridor (>=40m) between intermediate tier and Bldg 15/16/14');
  // Cross street clearance between Bldg 17 and Bldg 18
  const b17Right = b17.position.x + b17.dimensions.width / 2;
  const b18Left = b18.position.x - b18.dimensions.width / 2;
  assert.ok(b18Left - b17Right >= 14, 'Cross street corridor between Building 17 and Building 18');

  const colliders = buildCampusColliders();
  // Cross street (x = -41) between Building 17 and Building 18 is open to walk
  const crossWalk = resolveCollision({ x: -41, z: -130 }, { x: -41, z: -126 }, 1.0, colliders);
  assert.equal(crossWalk.collided, false);
  // Service road (z = -238) inside northern wall is open
  const serviceWalk = resolveCollision({ x: -24, z: -238 }, { x: -18, z: -238 }, 1.0, colliders);
  assert.equal(serviceWalk.collided, false);
});

test('third-person kinematics move smoothly relative to camera and turn student toward walking direction', () => {
  const colliders = buildCampusColliders();
  // Start on open Northern Boulevard looking North (yaw = 0 -> forward is -Z)
  const state = createInitialThirdPersonState(-20, -82, 0);

  // Shortest angle wrap check across +/- PI boundary
  const delta = shortestAngleDelta(Math.PI * 0.95, -Math.PI * 0.95);
  assert.ok(Math.abs(delta - Math.PI * 0.1) < 1e-5, 'Shortest angle crosses PI boundary cleanly');

  // Step right (D key) for several frames: student should move East (+X) and rotate charYaw toward -PI/2
  for (let i = 0; i < 20; i++) {
    stepThirdPersonKinematics(
      state,
      {
        forwardInput: 0,
        rightInput: 1,
        turnInput: 0,
        sprint: false,
        isDraggingCamera: false,
        mouseSensitivity: 1,
      },
      0.03,
      colliders,
    );
  }
  assert.ok(state.x > -18.5, 'Pressing D walks rightward (+X)');
  assert.ok(state.walkCycle > 0.5, 'Walk cycle advances smoothly with ground speed');
  assert.ok(state.gaitBlend > 0.7, 'Gait blend ramps smoothly toward walking');
  assert.ok(Math.abs(shortestAngleDelta(state.charYaw, -Math.PI / 2)) < 0.75, 'Student turns toward travel direction');
});

test('computeHumanWalkPose enforces natural human knee flexion, opposite arm-leg swing, and thobe drape parting', () => {
  const idle = computeHumanWalkPose(0, 0, 0.2, true, 0);
  assert.ok(Math.abs(idle.leftHipX) < 1e-5 && Math.abs(idle.rightHipX) < 1e-5);

  // Mid-stride phase: left leg forward (sin(PI/2)=1), right leg back, left arm back, right arm forward
  const stride = computeHumanWalkPose(Math.PI / 2, 1.0, 1.0, true, 0);
  assert.ok(stride.leftHipX > 0.3, 'Left hip swings forward');
  assert.ok(stride.rightHipX < -0.3, 'Right hip swings backward');
  assert.ok(stride.leftShoulderX < -0.25, 'Left arm swings opposite left leg');
  assert.ok(stride.rightShoulderX > 0.25, 'Right arm swings forward opposite right leg');
  assert.ok(stride.skirtFrontX > 0.2, 'Front thobe panel flares cleanly over forward knee');

  // Swing recovery phase (cos(PI) = -1): left knee bends naturally backward (negative X)
  const recovery = computeHumanWalkPose(Math.PI, 1.0, 1.2, true, 0);
  assert.ok(recovery.leftKneeX < -0.45, 'Human knee flexes backward during leg swing recovery');
  assert.ok(recovery.rightKneeX <= 0, 'Knees never hyperextend forward');
});

test('computeSafeThirdPersonCameraPos pulls inward instead of clipping inside nearby building walls', () => {
  const colliders = buildCampusColliders();
  const b18 = CAMPUS_BUILDINGS.find((b) => b.id === 'computing-bldg-18')!;
  const southWallZ = b18.position.z + b18.dimensions.depth / 2;

  // Student stands 1.2m south of Building 18, camera looking North (camYaw = Math.PI puts camera behind toward -Z inside B18!)
  const camPos = computeSafeThirdPersonCameraPos(
    { x: b18.position.x, y: 0, z: southWallZ + 1.2 },
    Math.PI,
    0.25,
    6.0,
    colliders,
  );
  assert.ok(camPos.z >= southWallZ - 0.5, 'Chase camera stops before penetrating Building 18 wall');
});

test('stepCarPhysics accelerates smoothly, steers left/right with Ackermann geometry, reverses, and handbrakes', () => {
  const colliders = buildCampusColliders();
  // Start inside Main Gate 1 on wide open road facing North (yaw = 0 -> forward -Z)
  const car = createInitialCarState(-150, -35, 0);
  assert.equal(car.gear, 'P');

  // 1. Accelerate forward + steer left (A key -> steerInput = +1)
  let lastHud = { speedKmh: 0 };
  for (let i = 0; i < 30; i++) {
    lastHud = stepCarPhysics(
      car,
      {
        throttleInput: 1,
        steerInput: 1,
        handbrake: false,
        orbitTurnInput: 0,
        isDraggingCamera: false,
        mouseSensitivity: 1,
      },
      0.03,
      colliders,
    );
  }
  assert.equal(car.gear, 'D');
  assert.ok(car.speed > 5 && lastHud.speedKmh > 18, 'Car accelerates cleanly along campus road');
  assert.ok(car.steerAngle > 0.2, 'Steer angle turns left when A is held');
  assert.ok(car.carYaw > 0.15, 'Heading turns left (positive yaw) under forward+left steering');
  assert.ok(car.wheelSpin > 5, 'Wheels rotate continuously with forward travel');
  assert.ok(car.z < -35 && car.x < -150, 'Car advances forward (-Z) and arcs left (-X)');

  // 2. Engage handbrake to bring car back down smoothly
  for (let i = 0; i < 20; i++) {
    stepCarPhysics(
      car,
      {
        throttleInput: 0,
        steerInput: 0,
        handbrake: true,
        orbitTurnInput: 0,
        isDraggingCamera: false,
        mouseSensitivity: 1,
      },
      0.03,
      colliders,
    );
  }
  assert.equal(car.speed, 0);
  assert.equal(car.gear, 'P');

  // 3. Reverse gear check
  for (let i = 0; i < 15; i++) {
    stepCarPhysics(
      car,
      {
        throttleInput: -1,
        steerInput: 0,
        handbrake: false,
        orbitTurnInput: 0,
        isDraggingCamera: false,
        mouseSensitivity: 1,
      },
      0.03,
      colliders,
    );
  }
  assert.equal(car.gear, 'R');
  assert.ok(car.speed < -2, 'Car shifts into Reverse and backs up smoothly');
  assert.equal(car.isBraking, true, 'Reverse/brake lights illuminate while reversing');
});

test('campus car respects building/wall collisions while driving cleanly through Main Gate 1 and findSafeCarSpawn avoids obstacles', () => {
  const colliders = buildCampusColliders();
  const b18 = CAMPUS_BUILDINGS.find((b) => b.id === 'computing-bldg-18')!;

  // Initial spawn near Gate 1 is clear
  const startCar = createInitialCarState();
  assert.equal(isCarPositionClear(startCar.x, startCar.z, colliders), true);

  // Driving westward through Main Gate 1 lane (-195, -29) stays clear
  const gateCar = createInitialCarState(-188, -29, Math.PI / 2); // facing West (-X)
  for (let i = 0; i < 45; i++) {
    stepCarPhysics(
      gateCar,
      {
        throttleInput: 1,
        steerInput: 0,
        handbrake: false,
        orbitTurnInput: 0,
        isDraggingCamera: false,
        mouseSensitivity: 1,
      },
      0.03,
      colliders,
    );
  }
  assert.ok(gateCar.x < -194, 'Car drives smoothly out through Main Gate 1 lane');

  // Driving directly into Building 18 stops cleanly outside its south wall
  const wallCar = createInitialCarState(
    b18.position.x,
    b18.position.z + b18.dimensions.depth / 2 + 2.5,
    0,
  );
  for (let i = 0; i < 30; i++) {
    stepCarPhysics(
      wallCar,
      {
        throttleInput: 1,
        steerInput: 0,
        handbrake: false,
        orbitTurnInput: 0,
        isDraggingCamera: false,
        mouseSensitivity: 1,
      },
      0.03,
      colliders,
    );
  }
  assert.ok(
    wallCar.z >= b18.position.z + b18.dimensions.depth / 2 + 1.2,
    'Car stops cleanly outside Building 18 wall instead of clipping inside',
  );

  // findSafeCarSpawn relocates out of Building 18 center to open boulevard
  const safe = findSafeCarSpawn(b18.position.x, b18.position.z, colliders);
  assert.equal(isCarPositionClear(safe.x, safe.z, colliders), true);
});



