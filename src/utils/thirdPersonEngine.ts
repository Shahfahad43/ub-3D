import { AABBCollider, resolveCollision } from './spatialEngine';

export interface ThirdPersonState {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  charYaw: number;
  camYaw: number;
  camPitch: number;
  camDist: number;
  targetCamYaw: number;
  targetCamPitch: number;
  targetCamDist: number;
  walkCycle: number;
  gaitBlend: number;
  idleTime: number;
  isGrounded: boolean;
}

export interface ThirdPersonInput {
  forwardInput: number; // +1 forward (W/Up), -1 backward (S/Down)
  rightInput: number; // +1 right (D/Right), -1 left (A/Left)
  turnInput: number; // +1 orbit left (Q), -1 orbit right (E)
  sprint: boolean;
  isDraggingCamera: boolean;
  mouseSensitivity: number;
}

export interface HumanWalkPose {
  pelvisYOffset: number;
  pelvisYaw: number;
  pelvisRoll: number;
  torsoPitch: number; // negative = forward lean toward -Z
  torsoYaw: number;
  headPitch: number;
  leftHipX: number; // positive = leg swings forward (-Z)
  rightHipX: number;
  leftKneeX: number; // negative = knee bends naturally backward (+Z)
  rightKneeX: number;
  leftAnkleX: number;
  rightAnkleX: number;
  leftShoulderX: number; // positive = arm swings forward (-Z)
  rightShoulderX: number;
  leftShoulderZ: number; // slight outward natural arm hang
  rightShoulderZ: number;
  leftElbowX: number; // positive = elbow bends naturally forward (-Z)
  rightElbowX: number;
  skirtFrontX: number; // positive = hem flares forward
  skirtBackX: number; // negative = hem flares backward
  shemaghTailPitch: number; // negative = drapes trail backward (+Z)
  shemaghTailSway: number;
}

export const THIRD_PERSON_WALK_SPEED = 5.4;
export const THIRD_PERSON_SPRINT_SPEED = 9.6;
export const THIRD_PERSON_RADIUS = 0.65;
export const THIRD_PERSON_MIN_DIST = 2.8;
export const THIRD_PERSON_MAX_DIST = 14.0;
export const THIRD_PERSON_MIN_PITCH = 0.06;
export const THIRD_PERSON_MAX_PITCH = 0.92;

export function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

/**
 * Returns minimal signed angular difference (to - from) wrapped to [-PI, PI].
 */
export function shortestAngleDelta(fromRad: number, toRad: number): number {
  let diff = ((toRad - fromRad + Math.PI) % (Math.PI * 2));
  if (diff < 0) diff += Math.PI * 2;
  return diff - Math.PI;
}

export function dampValue(current: number, target: number, lambda: number, dt: number): number {
  const alpha = 1 - Math.exp(-lambda * Math.max(0, dt));
  return current + (target - current) * alpha;
}

export function dampAngle(currentRad: number, targetRad: number, lambda: number, dt: number): number {
  const alpha = 1 - Math.exp(-lambda * Math.max(0, dt));
  return currentRad + shortestAngleDelta(currentRad, targetRad) * alpha;
}

export function createInitialThirdPersonState(
  x = -175,
  z = -35,
  yaw = -Math.PI / 2,
): ThirdPersonState {
  return {
    x,
    y: 0,
    z,
    vx: 0,
    vy: 0,
    vz: 0,
    charYaw: yaw,
    camYaw: yaw,
    camPitch: 0.28,
    camDist: 5.4,
    targetCamYaw: yaw,
    targetCamPitch: 0.28,
    targetCamDist: 5.4,
    walkCycle: 0,
    gaitBlend: 0,
    idleTime: 0,
    isGrounded: true,
  };
}

/**
 * Advances smooth camera-relative 3rd-person character kinematics, velocity damping,
 * character heading alignment, stride cadence, and wall-sliding collision.
 */
export function stepThirdPersonKinematics(
  state: ThirdPersonState,
  input: ThirdPersonInput,
  dtRaw: number,
  colliders: AABBCollider[],
): { speed: number; isMoving: boolean } {
  const dt = clamp(dtRaw, 0, 0.08);
  state.idleTime += dt;

  // 1. Q/E smooth keyboard orbit + gentle corner follow when steering with A/D while moving
  const keyOrbitRate = 1.9 * clamp(input.mouseSensitivity, 0.3, 2.5);
  if (Math.abs(input.turnInput) > 0.01) {
    state.targetCamYaw += input.turnInput * keyOrbitRate * dt;
  } else if (
    !input.isDraggingCamera &&
    Math.abs(input.rightInput) > 0.1 &&
    input.forwardInput >= 0
  ) {
    // Gentle camera steer behind turning runner so keyboard-only A/D feels natural
    state.targetCamYaw -= input.rightInput * 0.7 * dt;
  }

  state.targetCamPitch = clamp(
    state.targetCamPitch,
    THIRD_PERSON_MIN_PITCH,
    THIRD_PERSON_MAX_PITCH,
  );
  state.targetCamDist = clamp(
    state.targetCamDist,
    THIRD_PERSON_MIN_DIST,
    THIRD_PERSON_MAX_DIST,
  );

  // Smooth exponential camera orbit interpolation
  state.camYaw = dampAngle(state.camYaw, state.targetCamYaw, 16, dt);
  state.camPitch = dampValue(state.camPitch, state.targetCamPitch, 16, dt);
  state.camDist = dampValue(state.camDist, state.targetCamDist, 14, dt);

  // 2. Camera-relative desired movement direction in XZ
  const fwdX = -Math.sin(state.camYaw);
  const fwdZ = -Math.cos(state.camYaw);
  const rightX = Math.cos(state.camYaw);
  const rightZ = -Math.sin(state.camYaw);

  let wishX = fwdX * input.forwardInput + rightX * input.rightInput;
  let wishZ = fwdZ * input.forwardInput + rightZ * input.rightInput;
  const wishMag = Math.hypot(wishX, wishZ);

  const maxSpeed = input.sprint ? THIRD_PERSON_SPRINT_SPEED : THIRD_PERSON_WALK_SPEED;
  let targetVx = 0;
  let targetVz = 0;
  if (wishMag > 0.01) {
    wishX /= wishMag;
    wishZ /= wishMag;
    targetVx = wishX * maxSpeed;
    targetVz = wishZ * maxSpeed;
  }

  // Smooth acceleration when starting, brisk braking when stopping
  const accelLambda = wishMag > 0.01 ? 12 : 10;
  state.vx = dampValue(state.vx, targetVx, accelLambda, dt);
  state.vz = dampValue(state.vz, targetVz, accelLambda, dt);

  if (Math.hypot(state.vx, state.vz) < 0.03 && wishMag < 0.01) {
    state.vx = 0;
    state.vz = 0;
  }

  // 3. Apply collision-safe XZ step and measure actual ground displacement
  const prevX = state.x;
  const prevZ = state.z;
  const resolved = resolveCollision(
    { x: prevX, z: prevZ },
    { x: prevX + state.vx * dt, z: prevZ + state.vz * dt },
    THIRD_PERSON_RADIUS,
    colliders,
  );
  state.x = resolved.x;
  state.z = resolved.z;

  const actualDx = state.x - prevX;
  const actualDz = state.z - prevZ;
  const actualSpeed = dt > 0.0001 ? Math.hypot(actualDx, actualDz) / dt : 0;

  if (resolved.collided && dt > 0.0001) {
    if (Math.abs(actualDx) < Math.abs(state.vx * dt) * 0.25) state.vx = 0;
    if (Math.abs(actualDz) < Math.abs(state.vz * dt) * 0.25) state.vz = 0;
  }

  // 4. Smoothly rotate student to face actual movement direction
  if (wishMag > 0.01 && Math.hypot(state.vx, state.vz) > 0.25) {
    const desiredHeading = Math.atan2(-state.vx, -state.vz);
    state.charYaw = dampAngle(state.charYaw, desiredHeading, 12, dt);
  }

  // 5. Vertical jump & gravity
  if (!state.isGrounded || state.vy > 0) {
    state.y += state.vy * dt;
    state.vy -= 18.0 * dt;
    if (state.y <= 0) {
      state.y = 0;
      state.vy = 0;
      state.isGrounded = true;
    }
  }

  // 6. Stride cadence tied directly to ground speed (zero foot sliding)
  const targetGait = clamp(actualSpeed / THIRD_PERSON_WALK_SPEED, 0, 1.45);
  state.gaitBlend = dampValue(state.gaitBlend, targetGait, 11, dt);
  if (actualSpeed > 0.15 && state.isGrounded) {
    state.walkCycle += actualSpeed * 1.85 * dt;
  }

  return {
    speed: actualSpeed,
    isMoving: actualSpeed > 0.2,
  };
}

/**
 * Computes articulated human walking/running/idle biomechanics for the Saudi student avatar.
 */
export function computeHumanWalkPose(
  walkCycle: number,
  gaitBlend: number,
  idleTime: number,
  isGrounded: boolean,
  vy: number,
): HumanWalkPose {
  const amp = clamp(gaitBlend, 0, 1.35);
  const sprintFactor = clamp((gaitBlend - 0.85) / 0.5, 0, 1);
  const breathe = Math.sin(idleTime * 2.1);

  if (!isGrounded) {
    const airFactor = clamp(Math.abs(vy) / 6.5, 0.2, 1);
    return {
      pelvisYOffset: 0.02,
      pelvisYaw: 0,
      pelvisRoll: 0,
      torsoPitch: -0.09,
      torsoYaw: 0,
      headPitch: 0.04,
      leftHipX: 0.42 * airFactor,
      rightHipX: -0.18 * airFactor,
      leftKneeX: -0.68 * airFactor,
      rightKneeX: -0.35 * airFactor,
      leftAnkleX: -0.15,
      rightAnkleX: -0.15,
      leftShoulderX: -0.25,
      rightShoulderX: 0.32,
      leftShoulderZ: -0.16,
      rightShoulderZ: 0.16,
      leftElbowX: 0.55,
      rightElbowX: 0.55,
      skirtFrontX: 0.34,
      skirtBackX: -0.22,
      shemaghTailPitch: -0.26,
      shemaghTailSway: Math.sin(idleTime * 5) * 0.06,
    };
  }

  const s = Math.sin(walkCycle);
  const c = Math.cos(walkCycle);

  // Hip swings: positive rotates leg forward (-Z), negative rotates backward (+Z)
  const strideAngle = (0.56 + sprintFactor * 0.24) * Math.min(amp, 1.15);
  const leftHipX = s * strideAngle;
  const rightHipX = -s * strideAngle;

  // Natural human knee flexion: peaks during swing recovery (-cos phase) + subtle stance cushion
  const leftSwingKnee = Math.max(0, -c);
  const rightSwingKnee = Math.max(0, c);
  const leftStanceCushion = Math.max(0, s) * 0.14;
  const rightStanceCushion = Math.max(0, -s) * 0.14;

  const kneeAmp = (0.76 + sprintFactor * 0.34) * Math.min(amp, 1.15);
  const leftKneeX = -(leftSwingKnee * kneeAmp + leftStanceCushion * Math.min(amp, 1));
  const rightKneeX = -(rightSwingKnee * kneeAmp + rightStanceCushion * Math.min(amp, 1));

  // Ankle dorsiflexion / push-off
  const leftAnkleX = Math.sin(walkCycle - 0.5) * 0.24 * Math.min(amp, 1);
  const rightAnkleX = -Math.sin(walkCycle - 0.5) * 0.24 * Math.min(amp, 1);

  // Opposite arm swing with natural elbow bend (never straight-armed robot swing)
  const armAmp = (0.52 + sprintFactor * 0.26) * Math.min(amp, 1.15);
  const leftShoulderX = -s * armAmp;
  const rightShoulderX = s * armAmp;

  const idleArmRest = 0.06 + breathe * 0.012;
  const leftShoulderZ = -(idleArmRest + 0.04 * Math.min(amp, 1));
  const rightShoulderZ = idleArmRest + 0.04 * Math.min(amp, 1);

  const baseElbowBend = 0.16 + 0.22 * Math.min(amp, 1) + sprintFactor * 0.38;
  const leftElbowX = baseElbowBend + Math.max(0, leftShoulderX) * 0.45;
  const rightElbowX = baseElbowBend + Math.max(0, rightShoulderX) * 0.45;

  // Pelvis double-frequency bounce & hip counter-twist
  const pelvisYOffset =
    Math.abs(s) * (0.036 + sprintFactor * 0.024) * Math.min(amp, 1.1) +
    breathe * 0.005 * (1 - Math.min(amp, 1));
  const pelvisYaw = c * 0.075 * Math.min(amp, 1);
  const pelvisRoll = s * 0.032 * Math.min(amp, 1);

  // Spine counter-rotation & subtle natural forward lean
  const torsoYaw = -c * 0.068 * Math.min(amp, 1);
  const torsoPitch = -(0.048 + sprintFactor * 0.11) * Math.min(amp, 1) + breathe * 0.008;
  const headPitch = -torsoPitch * 0.55 + Math.sin(idleTime * 0.9) * 0.02 * (1 - Math.min(amp, 1));

  // Articulated Thobe hem panels glide cleanly over striding knees
  const maxFwdLeg = Math.max(0, leftHipX, rightHipX);
  const maxBackLeg = Math.min(0, leftHipX, rightHipX);
  const skirtFrontX = maxFwdLeg * 0.72 + 0.03 * Math.min(amp, 1);
  const skirtBackX = maxBackLeg * 0.65 - 0.02 * Math.min(amp, 1);

  // Shemagh drapes trail smoothly when moving and sway gently with steps
  const shemaghTailPitch = -(0.04 + 0.16 * Math.min(amp, 1.2) + Math.abs(s) * 0.04 * Math.min(amp, 1));
  const shemaghTailSway = c * 0.045 * Math.min(amp, 1) + Math.sin(idleTime * 1.6) * 0.015;

  return {
    pelvisYOffset,
    pelvisYaw,
    pelvisRoll,
    torsoPitch,
    torsoYaw,
    headPitch,
    leftHipX,
    rightHipX,
    leftKneeX,
    rightKneeX,
    leftAnkleX,
    rightAnkleX,
    leftShoulderX,
    rightShoulderX,
    leftShoulderZ,
    rightShoulderZ,
    leftElbowX,
    rightElbowX,
    skirtFrontX,
    skirtBackX,
    shemaghTailPitch,
    shemaghTailSway,
  };
}

/**
 * Computes obstacle-safe third-person chase camera world position along spherical arm
 * (camYaw, camPitch, camDist), pulling inward cleanly if a building wall intersects the sightline.
 */
export function computeSafeThirdPersonCameraPos(
  target: { x: number; y: number; z: number },
  camYaw: number,
  camPitch: number,
  camDist: number,
  colliders: AABBCollider[],
  focusHeight = 1.06,
): { x: number; y: number; z: number } {
  const focusY = target.y + focusHeight;
  const cosP = Math.cos(camPitch);
  const sinP = Math.sin(camPitch);

  // Camera sits behind focus along (+sin(camYaw), +cos(camYaw))
  const armX = Math.sin(camYaw) * cosP;
  const armY = sinP;
  const armZ = Math.cos(camYaw) * cosP;

  let safeDist = camDist;
  const steps = 16;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const probeDist = camDist * t;
    const px = target.x + armX * probeDist;
    const py = focusY + armY * probeDist;
    const pz = target.z + armZ * probeDist;

    let hit = false;
    for (const c of colliders) {
      if (
        py <= c.maxY + 0.3 &&
        px > c.minX - 0.35 &&
        px < c.maxX + 0.35 &&
        pz > c.minZ - 0.35 &&
        pz < c.maxZ + 0.35
      ) {
        hit = true;
        break;
      }
    }
    if (hit) {
      safeDist = Math.max(0.45, camDist * ((i - 1) / steps));
      break;
    }
  }

  return {
    x: target.x + armX * safeDist,
    y: Math.max(target.y + 0.55, focusY + armY * safeDist),
    z: target.z + armZ * safeDist,
  };
}
