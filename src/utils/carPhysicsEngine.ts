import { AABBCollider, resolveCollision } from './spatialEngine';
import { clamp, dampAngle, dampValue } from './thirdPersonEngine';

export interface CampusCarState {
  x: number;
  y: number;
  z: number;
  carYaw: number;
  speed: number; // signed m/s (+ forward along -Z, - reverse)
  steerAngle: number; // radians (+ left, - right)
  wheelSpin: number; // cumulative wheel rotation radians
  bodyPitch: number; // squat / brake dive
  bodyRoll: number; // corner lean
  camYaw: number;
  camPitch: number;
  camDist: number;
  targetCamYaw: number;
  targetCamPitch: number;
  targetCamDist: number;
  headlightsOn: boolean;
  isBraking: boolean;
  gear: 'P' | 'D' | 'R';
}

export interface CarControlInput {
  throttleInput: number; // +1 W/Up, -1 S/Down
  steerInput: number; // +1 Left (A/Left), -1 Right (D/Right)
  handbrake: boolean;
  orbitTurnInput: number; // +1 Q, -1 E
  isDraggingCamera: boolean;
  mouseSensitivity: number;
}

export const CAR_WHEEL_RADIUS = 0.34;
export const CAR_WHEELBASE = 2.7;
export const CAR_COLLISION_RADIUS = 1.35;
export const CAR_MAX_FORWARD_SPEED = 22.0; // ~79 km/h
export const CAR_MAX_REVERSE_SPEED = 8.0; // ~29 km/h
export const CAR_MIN_DIST = 4.5;
export const CAR_MAX_DIST = 18.0;
export const CAR_MIN_PITCH = 0.1;
export const CAR_MAX_PITCH = 0.85;

export function createInitialCarState(
  x = -154,
  z = -50,
  yaw = 0,
): CampusCarState {
  return {
    x,
    y: 0,
    z,
    carYaw: yaw,
    speed: 0,
    steerAngle: 0,
    wheelSpin: 0,
    bodyPitch: 0,
    bodyRoll: 0,
    camYaw: yaw,
    camPitch: 0.28,
    camDist: 7.6,
    targetCamYaw: yaw,
    targetCamPitch: 0.28,
    targetCamDist: 7.6,
    headlightsOn: false,
    isBraking: false,
    gear: 'P',
  };
}

/**
 * Checks whether a candidate car spawn position is free of buildings and walls.
 */
export function isCarPositionClear(
  x: number,
  z: number,
  colliders: AABBCollider[],
  radius = CAR_COLLISION_RADIUS + 0.35,
): boolean {
  for (const c of colliders) {
    if (
      x > c.minX - radius &&
      x < c.maxX + radius &&
      z > c.minZ - radius &&
      z < c.maxZ + radius
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Finds the nearest obstacle-free road/plaza coordinate to place or enter the car safely.
 */
export function findSafeCarSpawn(
  preferredX: number,
  preferredZ: number,
  colliders: AABBCollider[],
): { x: number; z: number } {
  if (isCarPositionClear(preferredX, preferredZ, colliders)) {
    return { x: preferredX, z: preferredZ };
  }
  const radii = [2.5, 5, 8, 12, 16, 22];
  for (const r of radii) {
    for (let a = 0; a < 12; a++) {
      const ang = (a / 12) * Math.PI * 2;
      const cx = preferredX + Math.cos(ang) * r;
      const cz = preferredZ + Math.sin(ang) * r;
      if (isCarPositionClear(cx, cz, colliders)) {
        return { x: cx, z: cz };
      }
    }
  }
  // Reliable wide boulevard fallback inside Main Gate 1
  return { x: -172, z: -29 };
}

/**
 * Advances Ackermann-style campus vehicle physics, wheel spin, suspension squat/roll,
 * collision sliding, and smooth chase camera alignment.
 */
export function stepCarPhysics(
  state: CampusCarState,
  input: CarControlInput,
  dtRaw: number,
  colliders: AABBCollider[],
): { speedKmh: number } {
  const dt = clamp(dtRaw, 0, 0.08);
  const absSpeed = Math.abs(state.speed);

  // 1. Speed-sensitive steering angle (tight at parking speeds, stable at high speed)
  const speedSteerScale = clamp(1 - absSpeed / 30, 0.48, 1.0);
  const maxSteer = 0.54 * speedSteerScale;
  const targetSteer = input.steerInput * maxSteer;
  const steerLambda = Math.abs(input.steerInput) > 0.01 ? 9.5 : 12.5;
  state.steerAngle = dampValue(state.steerAngle, targetSteer, steerLambda, dt);

  // 2. Throttle, braking, reverse, handbrake & natural rolling drag
  let targetPitch = 0;
  let isBraking = false;

  if (input.handbrake) {
    isBraking = absSpeed > 0.1;
    const brakeDecel = 26.0 * dt;
    if (absSpeed <= brakeDecel) {
      state.speed = 0;
    } else {
      state.speed -= Math.sign(state.speed) * brakeDecel;
      targetPitch = -0.028 * Math.sign(state.speed);
    }
  } else if (input.throttleInput > 0.01) {
    if (state.speed < -0.4) {
      // Braking out of reverse
      isBraking = true;
      state.speed = Math.min(0, state.speed + 24.0 * dt);
      targetPitch = 0.025;
    } else {
      // Smooth forward acceleration
      state.speed = Math.min(CAR_MAX_FORWARD_SPEED, state.speed + 11.5 * dt);
      targetPitch = 0.022 * clamp(1 - state.speed / CAR_MAX_FORWARD_SPEED, 0.2, 1);
    }
  } else if (input.throttleInput < -0.01) {
    if (state.speed > 0.4) {
      // Braking forward motion
      isBraking = true;
      state.speed = Math.max(0, state.speed - 22.0 * dt);
      targetPitch = -0.032;
    } else {
      // Reverse gear
      isBraking = true; // Reverse lights + tail indicators active
      state.speed = Math.max(-CAR_MAX_REVERSE_SPEED, state.speed - 7.8 * dt);
      targetPitch = -0.014;
    }
  } else {
    // Natural rolling & aerodynamic drag
    const drag = (2.8 + absSpeed * 0.14) * dt;
    if (absSpeed <= drag) {
      state.speed = 0;
    } else {
      state.speed -= Math.sign(state.speed) * drag;
    }
  }

  state.isBraking = isBraking;
  state.gear = Math.abs(state.speed) < 0.15 && Math.abs(input.throttleInput) < 0.01
    ? 'P'
    : state.speed < -0.05 || (state.speed <= 0 && input.throttleInput < -0.01)
      ? 'R'
      : 'D';

  // 3. Bicycle Ackermann heading update
  if (Math.abs(state.speed) > 0.08 && Math.abs(state.steerAngle) > 0.002) {
    const angularVel = (state.speed / CAR_WHEELBASE) * Math.tan(state.steerAngle);
    state.carYaw += angularVel * dt;
  }

  // 4. Advance position & resolve campus building/wall collisions
  const fwdX = -Math.sin(state.carYaw);
  const fwdZ = -Math.cos(state.carYaw);
  const prevX = state.x;
  const prevZ = state.z;
  const resolved = resolveCollision(
    { x: prevX, z: prevZ },
    { x: prevX + fwdX * state.speed * dt, z: prevZ + fwdZ * state.speed * dt },
    CAR_COLLISION_RADIUS,
    colliders,
  );
  state.x = resolved.x;
  state.z = resolved.z;

  const actualDisp = Math.hypot(state.x - prevX, state.z - prevZ);
  const signedActualSpeed =
    dt > 0.0001
      ? Math.sign(state.speed || 1) * (actualDisp / dt)
      : 0;

  if (resolved.collided) {
    // Scrub speed smoothly on wall contact while preserving sliding momentum
    state.speed *= 0.45;
    if (actualDisp < 0.002) {
      state.speed = 0;
    }
  }

  // 5. Wheel spin & body suspension pitch/roll
  state.wheelSpin += (signedActualSpeed / CAR_WHEEL_RADIUS) * dt;
  const targetRoll = clamp(
    (state.speed / 12) * state.steerAngle * 0.11,
    -0.065,
    0.065,
  );
  state.bodyPitch = dampValue(state.bodyPitch, targetPitch, 10, dt);
  state.bodyRoll = dampValue(state.bodyRoll, targetRoll, 10, dt);

  // 6. Chase camera orbit & auto-alignment behind car while driving
  const keyOrbitRate = 1.9 * clamp(input.mouseSensitivity, 0.3, 2.5);
  if (Math.abs(input.orbitTurnInput) > 0.01) {
    state.targetCamYaw += input.orbitTurnInput * keyOrbitRate * dt;
  } else if (!input.isDraggingCamera && Math.abs(state.speed) > 0.8) {
    // When driving forward align camera behind car; when reversing follow smoothly without whipping 180°
    const followYaw = state.speed >= 0 ? state.carYaw : state.carYaw;
    const alignLambda = state.speed >= 0 ? 3.2 : 1.1;
    state.targetCamYaw = dampAngle(state.targetCamYaw, followYaw, alignLambda, dt);
  }

  state.targetCamPitch = clamp(state.targetCamPitch, CAR_MIN_PITCH, CAR_MAX_PITCH);
  state.targetCamDist = clamp(state.targetCamDist, CAR_MIN_DIST, CAR_MAX_DIST);

  state.camYaw = dampAngle(state.camYaw, state.targetCamYaw, 14, dt);
  state.camPitch = dampValue(state.camPitch, state.targetCamPitch, 14, dt);
  state.camDist = dampValue(state.camDist, state.targetCamDist, 12, dt);

  return {
    speedKmh: Math.round(Math.abs(state.speed) * 3.6),
  };
}
