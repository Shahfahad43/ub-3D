import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { CampusBuilding } from '../data/campusData';
import {
  buildCampusScene,
  BuiltCampusScene,
  updateMeasurementLine3D,
  updateRouteLine3D,
} from '../three/campusBuilders';
import {
  buildCampusColliders,
  computeSolarLighting,
  resolveCollision,
} from '../utils/spatialEngine';
import {
  clamp,
  computeHumanWalkPose,
  computeSafeThirdPersonCameraPos,
  createInitialThirdPersonState,
  stepThirdPersonKinematics,
  THIRD_PERSON_MAX_DIST,
  THIRD_PERSON_MAX_PITCH,
  THIRD_PERSON_MIN_DIST,
  THIRD_PERSON_MIN_PITCH,
  ThirdPersonState,
} from '../utils/thirdPersonEngine';

import {
  CAR_MAX_DIST,
  CAR_MAX_PITCH,
  CAR_MIN_DIST,
  CAR_MIN_PITCH,
  CampusCarState,
  createInitialCarState,
  findSafeCarSpawn,
  stepCarPhysics,
} from '../utils/carPhysicsEngine';

export type NavigationMode = 'aerial' | 'first_person' | 'third_person' | 'drive_car';

interface CampusViewport3DProps {
  buildings: CampusBuilding[];
  selectedBuildingId: string | null;
  onSelectBuilding: (buildingId: string) => void;
  navigationMode: NavigationMode;
  hourOfDay: number;
  headlightsOn?: boolean;
  onToggleHeadlights?: () => void;
  activeRoutePoints: Array<{ x: number; z: number }>;
  measureMode: boolean;
  measurePointA: { x: number; z: number } | null;
  measurePointB: { x: number; z: number } | null;
  onMeasureClickPoint: (pt: { x: number; z: number }) => void;
  mouseSensitivity: number;
  cameraFlyTarget: {
    cameraPos: [number, number, number];
    lookAt: [number, number, number];
    walkSpawn?: [number, number, number];
    walkYaw?: number;
    timestamp: number;
  } | null;
  zoomTrigger: { delta: number; timestamp: number } | null;
  onPlayerTelemetryUpdate: (telemetry: {
    x: number;
    z: number;
    yaw: number;
  }) => void;
  onCarTelemetryUpdate?: (telemetry: { speedKmh: number; gear: 'P' | 'D' | 'R' }) => void;
}

export const CampusViewport3D: React.FC<CampusViewport3DProps> = ({
  buildings,
  selectedBuildingId,
  onSelectBuilding,
  navigationMode,
  hourOfDay,
  headlightsOn = false,
  onToggleHeadlights,
  activeRoutePoints,
  measureMode,
  measurePointA,
  measurePointB,
  onMeasureClickPoint,
  mouseSensitivity,
  cameraFlyTarget,
  zoomTrigger,
  onPlayerTelemetryUpdate,
  onCarTelemetryUpdate,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Store mutable refs so React UI updates never recreate the WebGL context
  const callbacksRef = useRef({
    onSelectBuilding,
    onMeasureClickPoint,
    onPlayerTelemetryUpdate,
    onToggleHeadlights,
    onCarTelemetryUpdate,
  });
  callbacksRef.current = {
    onSelectBuilding,
    onMeasureClickPoint,
    onPlayerTelemetryUpdate,
    onToggleHeadlights,
    onCarTelemetryUpdate,
  };

  const stateRef = useRef({
    navigationMode,
    hourOfDay,
    headlightsOn,
    measureMode,
    mouseSensitivity,
    selectedBuildingId,
    buildings,
  });
  stateRef.current = {
    navigationMode,
    hourOfDay,
    headlightsOn,
    measureMode,
    mouseSensitivity,
    selectedBuildingId,
    buildings,
  };

  const builtSceneRef = useRef<BuiltCampusScene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orbitControlsRef = useRef<OrbitControls | null>(null);

  // Player kinematic state for 1st-person walk mode
  const playerRef = useRef({
    x: -175,
    y: 0,
    z: -35,
    vy: 0,
    yaw: -Math.PI / 2,
    pitch: 0.04,
    walkCycle: 0,
    isGrounded: true,
  });

  // Smooth third-person Saudi student state & orbit camera
  const thirdPersonRef = useRef<ThirdPersonState>(
    createInitialThirdPersonState(-175, -35, -Math.PI / 2),
  );
  // Campus drivable sedan state
  const carRef = useRef<CampusCarState>(
    createInitialCarState(-154, -50, 0),
  );
  const prevNavModeRef = useRef<NavigationMode>(navigationMode);
  const collidersRef = useRef(buildCampusColliders(buildings));
  const isDraggingLookRef = useRef(false);

  // Active smooth camera transition target
  const activeTransitionRef = useRef<{
    active: boolean;
    targetPos: THREE.Vector3;
    targetLook: THREE.Vector3;
  }>({
    active: false,
    targetPos: new THREE.Vector3(-320, 240, 235),
    targetLook: new THREE.Vector3(0, 0, 15),
  });

  // Update 3D route geometry when activeRoutePoints change
  useEffect(() => {
    if (!builtSceneRef.current) return;
    updateRouteLine3D(builtSceneRef.current.routeLineGroup, activeRoutePoints);
  }, [activeRoutePoints]);

  // Update 3D measurement markers when measurePointA / measurePointB change
  useEffect(() => {
    if (!builtSceneRef.current) return;
    updateMeasurementLine3D(builtSceneRef.current.measureGroup, measurePointA, measurePointB);
  }, [measurePointA, measurePointB]);

  // Update selection ring position when selectedBuildingId changes
  useEffect(() => {
    if (!builtSceneRef.current) return;
    const ring = builtSceneRef.current.selectionRing;
    if (!selectedBuildingId) {
      ring.visible = false;
      return;
    }
    const targetBldg = buildings.find((b) => b.id === selectedBuildingId);
    if (!targetBldg) {
      ring.visible = false;
      return;
    }
    const radius = Math.max(targetBldg.dimensions.width, targetBldg.dimensions.depth) * 0.62;
    ring.scale.set(radius, radius, 1);
    ring.position.set(targetBldg.position.x, 0.2, targetBldg.position.z);
    ring.visible = true;
  }, [selectedBuildingId, buildings]);

  // Handle explicit camera fly-to presets
  useEffect(() => {
    if (!cameraFlyTarget) return;
    if (cameraFlyTarget.walkSpawn) {
      playerRef.current.x = cameraFlyTarget.walkSpawn[0];
      playerRef.current.y = 0;
      playerRef.current.z = cameraFlyTarget.walkSpawn[2];
      thirdPersonRef.current.x = cameraFlyTarget.walkSpawn[0];
      thirdPersonRef.current.y = 0;
      thirdPersonRef.current.z = cameraFlyTarget.walkSpawn[2];
      thirdPersonRef.current.vx = 0;
      thirdPersonRef.current.vz = 0;
      thirdPersonRef.current.vy = 0;
      thirdPersonRef.current.isGrounded = true;
    }
    if (typeof cameraFlyTarget.walkYaw === 'number') {
      playerRef.current.yaw = cameraFlyTarget.walkYaw;
      playerRef.current.pitch = 0.04;
      thirdPersonRef.current.charYaw = cameraFlyTarget.walkYaw;
      thirdPersonRef.current.camYaw = cameraFlyTarget.walkYaw;
      thirdPersonRef.current.targetCamYaw = cameraFlyTarget.walkYaw;
    }
    const nextPos = new THREE.Vector3(...cameraFlyTarget.cameraPos);
    const nextLook = new THREE.Vector3(...cameraFlyTarget.lookAt);
    if (cameraRef.current && orbitControlsRef.current && stateRef.current.navigationMode === 'aerial') {
      cameraRef.current.position.lerp(nextPos, 0.94);
      orbitControlsRef.current.target.lerp(nextLook, 0.94);
      orbitControlsRef.current.update();
    }
    activeTransitionRef.current = {
      active: true,
      targetPos: nextPos,
      targetLook: nextLook,
    };
  }, [cameraFlyTarget]);

  // Handle zoom button triggers
  useEffect(() => {
    if (!zoomTrigger || !cameraRef.current || !orbitControlsRef.current) return;
    if (stateRef.current.navigationMode === 'third_person') {
      const tp = thirdPersonRef.current;
      tp.targetCamDist = clamp(
        tp.targetCamDist - zoomTrigger.delta * 1.25,
        THIRD_PERSON_MIN_DIST,
        THIRD_PERSON_MAX_DIST,
      );
      return;
    }
    if (stateRef.current.navigationMode === 'drive_car') {
      const car = carRef.current;
      car.targetCamDist = clamp(
        car.targetCamDist - zoomTrigger.delta * 1.4,
        CAR_MIN_DIST,
        CAR_MAX_DIST,
      );
      return;
    }
    const cam = cameraRef.current;
    const ctrl = orbitControlsRef.current;
    const dir = new THREE.Vector3().subVectors(ctrl.target, cam.position);
    const dist = dir.length();
    if (dist > 8 || zoomTrigger.delta < 0) {
      dir.normalize().multiplyScalar(zoomTrigger.delta * Math.max(8, dist * 0.18));
      cam.position.add(dir);
      activeTransitionRef.current.active = false;
    }
  }, [zoomTrigger]);

  // Handle switching between Aerial, First-Person, Third-Person, and Drive Car modes
  useEffect(() => {
    if (!orbitControlsRef.current || !builtSceneRef.current) return;
    const prevMode = prevNavModeRef.current;
    prevNavModeRef.current = navigationMode;

    const isAerial = navigationMode === 'aerial';
    orbitControlsRef.current.enabled = isAerial;
    builtSceneRef.current.playerAvatarGroup.visible = navigationMode === 'third_person';
    builtSceneRef.current.campusCarGroup.visible = true;

    if (isAerial && cameraRef.current) {
      const focusPos =
        prevMode === 'drive_car' ? carRef.current : thirdPersonRef.current;
      playerRef.current.x = focusPos.x;
      playerRef.current.z = focusPos.z;
      activeTransitionRef.current = {
        active: true,
        targetPos: new THREE.Vector3(focusPos.x - 55, 72, focusPos.z + 65),
        targetLook: new THREE.Vector3(focusPos.x, 2, focusPos.z),
      };
    } else {
      activeTransitionRef.current.active = false;
      if (navigationMode === 'drive_car' && cameraRef.current) {
        const car = carRef.current;
        const walker = prevMode === 'third_person' ? thirdPersonRef.current : playerRef.current;
        const distToCar = Math.hypot(walker.x - car.x, walker.z - car.z);
        if ((prevMode === 'first_person' || prevMode === 'third_person') && distToCar > 18) {
          const safeSpot = findSafeCarSpawn(walker.x, walker.z, collidersRef.current);
          car.x = safeSpot.x;
          car.z = safeSpot.z;
          car.carYaw = prevMode === 'third_person' ? thirdPersonRef.current.charYaw : playerRef.current.yaw;
        }
        car.speed = 0;
        car.steerAngle = 0;
        car.bodyPitch = 0;
        car.bodyRoll = 0;
        car.isBraking = false;
        car.gear = 'P';
        car.camYaw = car.carYaw;
        car.targetCamYaw = car.carYaw;
        builtSceneRef.current.campusCarGroup.position.set(car.x, 0, car.z);
        builtSceneRef.current.campusCarGroup.rotation.y = car.carYaw;

        const safeCam = computeSafeThirdPersonCameraPos(
          car,
          car.camYaw,
          car.camPitch,
          car.camDist,
          collidersRef.current,
          1.4,
        );
        cameraRef.current.position.set(safeCam.x, safeCam.y, safeCam.z);
        cameraRef.current.lookAt(car.x, 1.15, car.z);
      } else if (navigationMode === 'third_person' && cameraRef.current) {
        const tp = thirdPersonRef.current;
        if (prevMode === 'drive_car') {
          const car = carRef.current;
          const doorX = car.x - Math.cos(car.carYaw) * 2.1;
          const doorZ = car.z + Math.sin(car.carYaw) * 2.1;
          const safeExit = resolveCollision(
            { x: car.x, z: car.z },
            { x: doorX, z: doorZ },
            0.75,
            collidersRef.current,
          );
          tp.x = safeExit.x;
          tp.y = 0;
          tp.z = safeExit.z;
          tp.charYaw = car.carYaw;
          tp.camYaw = car.carYaw;
          tp.targetCamYaw = car.carYaw;
        } else {
          const p = playerRef.current;
          tp.x = p.x;
          tp.y = p.y;
          tp.z = p.z;
          tp.charYaw = p.yaw;
          tp.camYaw = p.yaw;
          tp.targetCamYaw = p.yaw;
        }
        tp.vx = 0;
        tp.vz = 0;
        const safe = computeSafeThirdPersonCameraPos(
          tp,
          tp.camYaw,
          tp.camPitch,
          tp.camDist,
          collidersRef.current,
        );
        cameraRef.current.position.set(safe.x, safe.y, safe.z);
        cameraRef.current.lookAt(tp.x, tp.y + 1.06, tp.z);
      } else if (navigationMode === 'first_person') {
        if (prevMode === 'drive_car') {
          const car = carRef.current;
          const doorX = car.x - Math.cos(car.carYaw) * 2.1;
          const doorZ = car.z + Math.sin(car.carYaw) * 2.1;
          const safeExit = resolveCollision(
            { x: car.x, z: car.z },
            { x: doorX, z: doorZ },
            0.75,
            collidersRef.current,
          );
          playerRef.current.x = safeExit.x;
          playerRef.current.y = 0;
          playerRef.current.z = safeExit.z;
          playerRef.current.yaw = car.carYaw;
        } else {
          const tp = thirdPersonRef.current;
          playerRef.current.x = tp.x;
          playerRef.current.y = tp.y;
          playerRef.current.z = tp.z;
          playerRef.current.yaw = tp.camYaw;
        }
      }
    }
  }, [navigationMode]);

  // Main WebGL initialization (runs once on mount)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x9bd0f5);
    scene.fog = new THREE.FogExp2(0xcbe4f9, 0.00042);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.25, 3500);
    camera.position.set(-320, 240, 235);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.96;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // Studio environment map for PBR reflections on Gate 2 aluminum & glass
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // Lighting rig (Warm Directional Key Sun + Cool/Warm Hemisphere Light)
    const hemiLight = new THREE.HemisphereLight(0x7ec8f2, 0x6f655a, 0.62);
    hemiLight.position.set(0, 150, 0);
    scene.add(hemiLight);

    const sunLight = new THREE.DirectionalLight(0xfff5e0, 1.75);
    sunLight.position.set(-120, 185, -80);
    sunLight.castShadow = !isSoftwareGl;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    sunLight.shadow.camera.near = 10;
    sunLight.shadow.camera.far = 1100;
    const d = 340;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);

    // Build the University of Bisha 3D Campus
    const maxAniso = renderer.capabilities.getMaxAnisotropy();
    const builtCampus = buildCampusScene(maxAniso);
    builtSceneRef.current = builtCampus;
    scene.add(builtCampus.rootGroup);

    const colliders = buildCampusColliders(stateRef.current.buildings);
    collidersRef.current = colliders;

    // OrbitControls for Aerial mode (vast open campus coverage)
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = !isSoftwareGl;
    controls.dampingFactor = 0.06;
    controls.maxPolarAngle = Math.PI / 2 - 0.03;
    controls.minDistance = 8;
    controls.maxDistance = 1800;
    controls.target.set(0, 0, 15);
    controls.update();
    orbitControlsRef.current = controls;

    const onControlStart = () => {
      activeTransitionRef.current.active = false;
    };
    controls.addEventListener('start', onControlStart);

    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // Keyboard & Pointer controls for 1st/3rd person movement + raycasting
    const keysPressed: Record<string, boolean> = {};
    const clearAllKeys = () => {
      for (const k of Object.keys(keysPressed)) {
        keysPressed[k] = false;
      }
      isDraggingLookRef.current = false;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement &&
        ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)
      ) {
        return;
      }
      if (
        stateRef.current.navigationMode !== 'aerial' &&
        (e.code === 'Space' ||
          e.code === 'ArrowUp' ||
          e.code === 'ArrowDown' ||
          e.code === 'ArrowLeft' ||
          e.code === 'ArrowRight')
      ) {
        e.preventDefault();
      }
      keysPressed[e.code] = true;
      if (e.code === 'KeyL' && stateRef.current.navigationMode === 'drive_car' && !e.repeat) {
        callbacksRef.current.onToggleHeadlights?.();
      }
      if (e.code === 'Space') {
        if (stateRef.current.navigationMode === 'third_person') {
          if (thirdPersonRef.current.isGrounded) {
            thirdPersonRef.current.vy = 6.4;
            thirdPersonRef.current.isGrounded = false;
          }
        } else if (
          stateRef.current.navigationMode === 'first_person' &&
          playerRef.current.isGrounded
        ) {
          playerRef.current.vy = 6.2;
          playerRef.current.isGrounded = false;
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      keysPressed[e.code] = false;
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', clearAllKeys);

    let pointerDownX = 0;
    let pointerDownY = 0;
    let lastLookX = 0;
    let lastLookY = 0;

    const raycaster = new THREE.Raycaster();
    const mouseVec = new THREE.Vector2();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const groundHitVec = new THREE.Vector3();

    const onPointerDown = (e: PointerEvent) => {
      pointerDownX = e.clientX;
      pointerDownY = e.clientY;
      lastLookX = e.clientX;
      lastLookY = e.clientY;
      if (stateRef.current.navigationMode !== 'aerial') {
        isDraggingLookRef.current = true;
      }
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingLookRef.current || stateRef.current.navigationMode === 'aerial') return;
      const dx = e.clientX - lastLookX;
      const dy = e.clientY - lastLookY;
      lastLookX = e.clientX;
      lastLookY = e.clientY;

      if (stateRef.current.navigationMode === 'third_person') {
        const sens = 0.0044 * stateRef.current.mouseSensitivity;
        const tp = thirdPersonRef.current;
        tp.targetCamYaw -= dx * sens;
        tp.targetCamPitch = clamp(
          tp.targetCamPitch + dy * sens,
          THIRD_PERSON_MIN_PITCH,
          THIRD_PERSON_MAX_PITCH,
        );
      } else if (stateRef.current.navigationMode === 'drive_car') {
        const sens = 0.0044 * stateRef.current.mouseSensitivity;
        const car = carRef.current;
        car.targetCamYaw -= dx * sens;
        car.targetCamPitch = clamp(
          car.targetCamPitch + dy * sens,
          CAR_MIN_PITCH,
          CAR_MAX_PITCH,
        );
      } else {
        const sens = 0.0028 * stateRef.current.mouseSensitivity;
        playerRef.current.yaw -= dx * sens;
        playerRef.current.pitch = Math.max(
          -Math.PI / 3,
          Math.min(Math.PI / 3, playerRef.current.pitch - dy * sens),
        );
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      isDraggingLookRef.current = false;
      const moveDist = Math.hypot(e.clientX - pointerDownX, e.clientY - pointerDownY);
      if (moveDist > 6 || e.button === 2) return; // Was a camera drag or right-drag, not a click

      const rect = renderer.domElement.getBoundingClientRect();
      mouseVec.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseVec.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseVec, camera);

      if (stateRef.current.measureMode) {
        if (raycaster.ray.intersectPlane(groundPlane, groundHitVec)) {
          callbacksRef.current.onMeasureClickPoint({
            x: Number(groundHitVec.x.toFixed(1)),
            z: Number(groundHitVec.z.toFixed(1)),
          });
        }
        return;
      }

      const hits = raycaster.intersectObjects(builtCampus.clickableMeshes, false);
      if (hits.length > 0) {
        const hitBuildingId = hits[0].object.userData?.buildingId;
        if (hitBuildingId) {
          callbacksRef.current.onSelectBuilding(hitBuildingId);
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (stateRef.current.navigationMode === 'third_person') {
        e.preventDefault();
        const tp = thirdPersonRef.current;
        tp.targetCamDist = clamp(
          tp.targetCamDist + e.deltaY * 0.0055,
          THIRD_PERSON_MIN_DIST,
          THIRD_PERSON_MAX_DIST,
        );
      } else if (stateRef.current.navigationMode === 'drive_car') {
        e.preventDefault();
        const car = carRef.current;
        car.targetCamDist = clamp(
          car.targetCamDist + e.deltaY * 0.0065,
          CAR_MIN_DIST,
          CAR_MAX_DIST,
        );
      }
    };

    const onContextMenu = (e: MouseEvent) => {
      if (stateRef.current.navigationMode !== 'aerial') {
        e.preventDefault();
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });
    domElem.addEventListener('contextmenu', onContextMenu);

    const onResize = () => {
      if (!container) return;
      const nw = container.clientWidth || window.innerWidth;
      const nh = container.clientHeight || window.innerHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    // Pre-allocated scratch vectors outside render loop (zero GC)
    const clock = new THREE.Clock();
    const scratchCamTarget = new THREE.Vector3();
    const scratchLookAt = new THREE.Vector3();
    let lastTelemetryTime = 0;
    let frameId = 0;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    function tick() {
      const dt = Math.min(0.1, clock.getDelta());
      const elapsed = clock.getElapsedTime();
      const currentState = stateRef.current;

      // 1. Update Solar Lighting (Day / Golden Hour / Twilight / Night)
      const solar = computeSolarLighting(currentState.hourOfDay);
      sunLight.position.set(...solar.sunPosition);
      sunLight.color.setHex(solar.sunColorHex);
      sunLight.intensity = solar.sunIntensity;

      hemiLight.color.setHex(solar.hemiSkyColorHex);
      hemiLight.groundColor.setHex(solar.hemiGroundColorHex);
      hemiLight.intensity = solar.hemiIntensity;

      (scene.background as THREE.Color).setHex(solar.skyHorizonColorHex);
      if (scene.fog instanceof THREE.FogExp2) {
        scene.fog.color.setHex(solar.fogColorHex);
      }
      renderer.toneMappingExposure = solar.exposure;
      scene.environmentIntensity =
        solar.phase === 'night'
          ? 0.08
          : solar.phase === 'twilight'
            ? 0.24
            : solar.phase === 'golden_hour'
              ? 0.45
              : 0.42;

      builtCampus.nightLightGroup.visible = solar.streetlightsActive;

      for (const mat of builtCampus.nightEmissiveMaterials) {
        mat.emissiveIntensity = solar.windowGlowIntensity;
      }
      for (const bulb of builtCampus.streetLightFixtures) {
        bulb.emissiveIntensity = solar.streetlightsActive ? 2.6 : 0.0;
      }
      for (const windU of builtCampus.windUniforms) {
        windU.value = elapsed;
      }

      // 2. Update Camera & Movement based on Navigation Mode
      if (currentState.navigationMode === 'aerial') {
        if (activeTransitionRef.current.active) {
          const alpha = 1 - Math.exp(-4.5 * dt);
          camera.position.lerp(activeTransitionRef.current.targetPos, alpha);
          controls.target.lerp(activeTransitionRef.current.targetLook, alpha);
          if (
            camera.position.distanceTo(activeTransitionRef.current.targetPos) < 0.6 &&
            controls.target.distanceTo(activeTransitionRef.current.targetLook) < 0.6
          ) {
            activeTransitionRef.current.active = false;
          }
        }
        controls.update();
      } else if (currentState.navigationMode === 'first_person') {
        // First-Person ground movement
        const p = playerRef.current;
        const turnSpeed = 1.8 * currentState.mouseSensitivity;
        if (keysPressed['KeyQ']) p.yaw += turnSpeed * dt;
        if (keysPressed['KeyE']) p.yaw -= turnSpeed * dt;

        const moveForward =
          Number(Boolean(keysPressed['KeyW'] || keysPressed['ArrowUp'])) -
          Number(Boolean(keysPressed['KeyS'] || keysPressed['ArrowDown']));
        const moveRight =
          Number(Boolean(keysPressed['KeyD'] || keysPressed['ArrowRight'])) -
          Number(Boolean(keysPressed['KeyA'] || keysPressed['ArrowLeft']));

        const speed = keysPressed['ShiftLeft'] || keysPressed['ShiftRight'] ? 13.5 : 7.2;
        const forwardX = -Math.sin(p.yaw);
        const forwardZ = -Math.cos(p.yaw);
        const rightX = Math.cos(p.yaw);
        const rightZ = -Math.sin(p.yaw);

        let dx = forwardX * moveForward + rightX * moveRight;
        let dz = forwardZ * moveForward + rightZ * moveRight;
        const mag = Math.hypot(dx, dz);
        if (mag > 0.001) {
          dx = (dx / mag) * speed * dt;
          dz = (dz / mag) * speed * dt;
          p.walkCycle += dt * (speed * 1.1);
        }

        const resolved = resolveCollision(
          { x: p.x, z: p.z },
          { x: p.x + dx, z: p.z + dz },
          0.75,
          colliders,
        );
        p.x = resolved.x;
        p.z = resolved.z;

        // Vertical jump & gravity physics
        if (!p.isGrounded || p.vy > 0) {
          p.y += p.vy * dt;
          p.vy -= 16.5 * dt;
          if (p.y <= 0) {
            p.y = 0;
            p.vy = 0;
            p.isGrounded = true;
          }
        }

        const headBob = mag > 0.001 && p.isGrounded ? Math.sin(p.walkCycle) * 0.06 : 0;
        camera.position.set(p.x, 1.75 + p.y + headBob, p.z);
        scratchLookAt.set(
          p.x - Math.sin(p.yaw) * Math.cos(p.pitch) * 10,
          1.75 + p.y + Math.sin(p.pitch) * 10,
          p.z - Math.cos(p.yaw) * Math.cos(p.pitch) * 10,
        );
        camera.lookAt(scratchLookAt);
      } else if (currentState.navigationMode === 'third_person') {
        // Third-Person Saudi Student Character Mode (smooth camera-relative steering & human biomechanics)
        const tp = thirdPersonRef.current;
        const forwardInput =
          Number(Boolean(keysPressed['KeyW'] || keysPressed['ArrowUp'])) -
          Number(Boolean(keysPressed['KeyS'] || keysPressed['ArrowDown']));
        const rightInput =
          Number(Boolean(keysPressed['KeyD'] || keysPressed['ArrowRight'])) -
          Number(Boolean(keysPressed['KeyA'] || keysPressed['ArrowLeft']));
        const turnInput =
          Number(Boolean(keysPressed['KeyQ'])) - Number(Boolean(keysPressed['KeyE']));
        const sprint = Boolean(keysPressed['ShiftLeft'] || keysPressed['ShiftRight']);

        stepThirdPersonKinematics(
          tp,
          {
            forwardInput,
            rightInput,
            turnInput,
            sprint,
            isDraggingCamera: isDraggingLookRef.current,
            mouseSensitivity: currentState.mouseSensitivity,
          },
          dt,
          colliders,
        );

        // Keep playerRef synced so mode transitions & telemetry stay aligned
        playerRef.current.x = tp.x;
        playerRef.current.y = tp.y;
        playerRef.current.z = tp.z;
        playerRef.current.yaw = tp.charYaw;

        const avatar = builtCampus.playerAvatarGroup;
        const rig = builtCampus.playerAvatarRig;
        avatar.position.set(tp.x, tp.y, tp.z);
        avatar.rotation.y = tp.charYaw;

        const pose = computeHumanWalkPose(
          tp.walkCycle,
          tp.gaitBlend,
          tp.idleTime,
          tp.isGrounded,
          tp.vy,
        );
        rig.pelvis.position.y = 0.9 + pose.pelvisYOffset;
        rig.pelvis.rotation.y = pose.pelvisYaw;
        rig.pelvis.rotation.z = pose.pelvisRoll;
        rig.torso.rotation.x = pose.torsoPitch;
        rig.torso.rotation.y = pose.torsoYaw;
        rig.head.rotation.x = pose.headPitch;

        rig.leftHip.rotation.x = pose.leftHipX;
        rig.rightHip.rotation.x = pose.rightHipX;
        rig.leftKnee.rotation.x = pose.leftKneeX;
        rig.rightKnee.rotation.x = pose.rightKneeX;
        rig.leftAnkle.rotation.x = pose.leftAnkleX;
        rig.rightAnkle.rotation.x = pose.rightAnkleX;

        rig.leftShoulder.rotation.x = pose.leftShoulderX;
        rig.rightShoulder.rotation.x = pose.rightShoulderX;
        rig.leftShoulder.rotation.z = pose.leftShoulderZ;
        rig.rightShoulder.rotation.z = pose.rightShoulderZ;
        rig.leftElbow.rotation.x = pose.leftElbowX;
        rig.rightElbow.rotation.x = pose.rightElbowX;

        rig.skirtFront.rotation.x = pose.skirtFrontX;
        rig.skirtBack.rotation.x = pose.skirtBackX;
        rig.shemaghLeft.rotation.x = pose.shemaghTailPitch;
        rig.shemaghLeft.rotation.z = pose.shemaghTailSway;
        rig.shemaghRight.rotation.x = pose.shemaghTailPitch;
        rig.shemaghRight.rotation.z = -pose.shemaghTailSway;
        rig.shemaghBack.rotation.x = pose.shemaghTailPitch * 1.15;

        // Smooth obstacle-safe damped third-person chase camera
        const safeCam = computeSafeThirdPersonCameraPos(
          tp,
          tp.camYaw,
          tp.camPitch,
          tp.camDist,
          colliders,
        );
        scratchCamTarget.set(safeCam.x, safeCam.y, safeCam.z);
        const dampAlpha = 1 - Math.exp(-16 * dt);
        camera.position.lerp(scratchCamTarget, dampAlpha);
        scratchLookAt.set(tp.x, tp.y + 1.06, tp.z);
        camera.lookAt(scratchLookAt);
      } else {
        // Drive Campus Sedan Mode (smooth Ackermann steering, rotating wheels, chase cam & lights)
        const car = carRef.current;
        const throttleInput =
          Number(Boolean(keysPressed['KeyW'] || keysPressed['ArrowUp'])) -
          Number(Boolean(keysPressed['KeyS'] || keysPressed['ArrowDown']));
        const steerInput =
          Number(Boolean(keysPressed['KeyA'] || keysPressed['ArrowLeft'])) -
          Number(Boolean(keysPressed['KeyD'] || keysPressed['ArrowRight']));
        const orbitTurnInput =
          Number(Boolean(keysPressed['KeyQ'])) - Number(Boolean(keysPressed['KeyE']));
        const handbrake = Boolean(keysPressed['Space']);

        car.headlightsOn = Boolean(currentState.headlightsOn);
        stepCarPhysics(
          car,
          {
            throttleInput,
            steerInput,
            handbrake,
            orbitTurnInput,
            isDraggingCamera: isDraggingLookRef.current,
            mouseSensitivity: currentState.mouseSensitivity,
          },
          dt,
          colliders,
        );

        playerRef.current.x = car.x;
        playerRef.current.z = car.z;
        playerRef.current.yaw = car.carYaw;

        const carObj = builtCampus.campusCarGroup;
        const carRig = builtCampus.campusCarRig;
        carObj.position.set(car.x, 0, car.z);
        carObj.rotation.y = car.carYaw;
        carRig.chassis.rotation.x = car.bodyPitch;
        carRig.chassis.rotation.z = car.bodyRoll;
        carRig.frontLeftSteer.rotation.y = car.steerAngle;
        carRig.frontRightSteer.rotation.y = car.steerAngle;
        carRig.steeringWheel.rotation.z = -car.steerAngle * 2.2;
        carRig.frontLeftWheel.rotation.x = -car.wheelSpin;
        carRig.frontRightWheel.rotation.x = -car.wheelSpin;
        carRig.rearLeftWheel.rotation.x = -car.wheelSpin;
        carRig.rearRightWheel.rotation.x = -car.wheelSpin;

        const lampsOn = car.headlightsOn;
        carRig.headlightMat.emissiveIntensity = lampsOn ? 2.6 : 0.35;
        carRig.headlightBeams.visible = lampsOn;
        carRig.taillightMat.emissiveIntensity = car.isBraking ? 2.6 : lampsOn ? 1.1 : 0.2;
        carRig.reverseLightMat.emissiveIntensity = car.gear === 'R' ? 2.2 : 0.0;

        const safeCam = computeSafeThirdPersonCameraPos(
          car,
          car.camYaw,
          car.camPitch,
          car.camDist,
          colliders,
          1.4,
        );
        scratchCamTarget.set(safeCam.x, safeCam.y, safeCam.z);
        const dampAlpha = 1 - Math.exp(-15 * dt);
        camera.position.lerp(scratchCamTarget, dampAlpha);
        scratchLookAt.set(car.x, 1.15, car.z);
        camera.lookAt(scratchLookAt);
      }

      // Keep parked car lights subtle when not actively driving
      if (currentState.navigationMode !== 'drive_car') {
        const carRig = builtCampus.campusCarRig;
        const lampsOn = Boolean(currentState.headlightsOn) || solar.streetlightsActive;
        carRig.headlightMat.emissiveIntensity = lampsOn ? 0.55 : 0.12;
        carRig.headlightBeams.visible = false;
        carRig.taillightMat.emissiveIntensity = lampsOn ? 0.45 : 0.12;
        carRig.reverseLightMat.emissiveIntensity = 0.0;
      }

      // Throttled telemetry update (<= 5Hz) for 2D Minimap & Car Driving HUD
      if (elapsed - lastTelemetryTime > 0.22) {
        lastTelemetryTime = elapsed;
        const pos =
          currentState.navigationMode === 'aerial'
            ? { x: controls.target.x, z: controls.target.z, yaw: 0 }
            : currentState.navigationMode === 'third_person'
              ? { x: thirdPersonRef.current.x, z: thirdPersonRef.current.z, yaw: thirdPersonRef.current.charYaw }
              : currentState.navigationMode === 'drive_car'
                ? { x: carRef.current.x, z: carRef.current.z, yaw: carRef.current.carYaw }
                : { x: playerRef.current.x, z: playerRef.current.z, yaw: playerRef.current.yaw };
        callbacksRef.current.onPlayerTelemetryUpdate({
          x: Number(pos.x.toFixed(1)),
          z: Number(pos.z.toFixed(1)),
          yaw: pos.yaw,
        });
        if (currentState.navigationMode === 'drive_car') {
          callbacksRef.current.onCarTelemetryUpdate?.({
            speedKmh: Math.round(Math.abs(carRef.current.speed) * 3.6),
            gear: carRef.current.gear,
          });
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    frameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      controls.removeEventListener('start', onControlStart);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', clearAllKeys);
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      domElem.removeEventListener('wheel', onWheel);
      domElem.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('resize', onResize);
      controls.dispose();
      renderer.dispose();
      if (domElem.parentNode === container) {
        container.removeChild(domElem);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      data-testid="campus-webgl-viewport"
      className="relative w-full h-full overflow-hidden select-none cursor-grab active:cursor-grabbing"
      aria-label="University of Bisha 3D Digital Twin Viewport"
    />
  );
};
