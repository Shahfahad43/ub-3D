import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import {
  CAMPUS_BUILDINGS,
  CAMPUS_ROADS,
  CampusBuilding,
  RoadSegment,
} from '../data/campusData';

export interface SaudiStudentRig {
  pelvis: THREE.Group;
  torso: THREE.Group;
  head: THREE.Group;
  leftHip: THREE.Group;
  rightHip: THREE.Group;
  leftKnee: THREE.Group;
  rightKnee: THREE.Group;
  leftAnkle: THREE.Group;
  rightAnkle: THREE.Group;
  leftShoulder: THREE.Group;
  rightShoulder: THREE.Group;
  leftElbow: THREE.Group;
  rightElbow: THREE.Group;
  skirtFront: THREE.Group;
  skirtBack: THREE.Group;
  shemaghLeft: THREE.Group;
  shemaghRight: THREE.Group;
  shemaghBack: THREE.Group;
}

export interface CampusCarRig {
  chassis: THREE.Group;
  frontLeftSteer: THREE.Group;
  frontRightSteer: THREE.Group;
  frontLeftWheel: THREE.Group;
  frontRightWheel: THREE.Group;
  rearLeftWheel: THREE.Group;
  rearRightWheel: THREE.Group;
  headlightMat: THREE.MeshStandardMaterial;
  taillightMat: THREE.MeshStandardMaterial;
  reverseLightMat: THREE.MeshStandardMaterial;
  headlightBeams: THREE.Group;
  steeringWheel: THREE.Group;
}

export interface BuiltCampusScene {
  rootGroup: THREE.Group;
  clickableMeshes: THREE.Object3D[];
  buildingGroups: Map<string, THREE.Group>;
  nightEmissiveMaterials: THREE.MeshStandardMaterial[];
  streetLightFixtures: THREE.MeshStandardMaterial[];
  windUniforms: Array<{ value: number }>;
  nightLightGroup: THREE.Group;
  routeLineGroup: THREE.Group;
  measureGroup: THREE.Group;
  playerAvatarGroup: THREE.Group;
  playerAvatarRig: SaudiStudentRig;
  campusCarGroup: THREE.Group;
  campusCarRig: CampusCarRig;
  selectionRing: THREE.Mesh;
}

function createCrestAndSignageTexture(options: {
  variant:
    | 'gate1_front'
    | 'gate2_tower'
    | 'gate2_left'
    | 'gate2_right'
    | 'bldg18_portal'
    | 'bldg19_crest'
    | 'university_wall_logo';
  maxAnisotropy: number;
}): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  if (options.variant === 'gate1_front') {
    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, 1024, 256);

    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 2;
    for (let x = 128; x < 1024; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }

    ctx.fillStyle = '#1D4ED8';
    ctx.fillRect(0, 0, 1024, 10);
    ctx.fillRect(0, 246, 1024, 10);

    ctx.fillStyle = '#0F296B';
    ctx.font = 'bold 64px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('جامعة بيشة', 430, 110);

    ctx.font = 'bold 42px "Outfit", sans-serif';
    ctx.fillText('University of Bisha', 430, 185);

    const cx = 790;
    const cy = 124;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(cx - 56, cy - 68);
    ctx.lineTo(cx + 56, cy - 68);
    ctx.lineTo(cx + 56, cy + 10);
    ctx.quadraticCurveTo(cx + 56, cy + 68, cx, cy + 84);
    ctx.quadraticCurveTo(cx - 56, cy + 68, cx - 56, cy + 10);
    ctx.closePath();
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 7;
    ctx.strokeStyle = '#0F296B';
    ctx.stroke();

    ctx.fillStyle = '#0284C7';
    ctx.beginPath();
    ctx.arc(cx, cy - 6, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#15803D';
    ctx.fillRect(cx - 6, cy - 22, 12, 34);
    ctx.restore();

    ctx.fillStyle = '#0F296B';
    ctx.font = 'bold 52px "JetBrains Mono", monospace';
    ctx.fillText('1', 920, 205);
  } else if (options.variant === 'gate2_tower') {
    canvas.width = 512;
    canvas.height = 512;
    const c2 = canvas.getContext('2d')!;
    c2.fillStyle = '#CBD5E1';
    c2.fillRect(0, 0, 512, 512);

    c2.strokeStyle = '#94A3B8';
    c2.lineWidth = 3;
    for (let x = 0; x <= 512; x += 64) {
      c2.beginPath();
      c2.moveTo(x, 0);
      c2.lineTo(x, 512);
      c2.stroke();
    }
    for (let y = 0; y <= 512; y += 64) {
      c2.beginPath();
      c2.moveTo(0, y);
      c2.lineTo(512, y);
      c2.stroke();
    }

    const cx = 256;
    const cy = 128;
    c2.beginPath();
    c2.moveTo(cx - 52, cy - 62);
    c2.lineTo(cx + 52, cy - 62);
    c2.lineTo(cx + 52, cy + 12);
    c2.quadraticCurveTo(cx + 52, cy + 64, cx, cy + 82);
    c2.quadraticCurveTo(cx - 52, cy + 64, cx - 52, cy + 12);
    c2.closePath();
    c2.fillStyle = '#F8FAFC';
    c2.fill();
    c2.lineWidth = 8;
    c2.strokeStyle = '#0F172A';
    c2.stroke();

    c2.fillStyle = '#0284C7';
    c2.beginPath();
    c2.arc(cx, cy - 4, 24, 0, Math.PI * 2);
    c2.fill();
    c2.fillStyle = '#15803D';
    c2.fillRect(cx - 5, cy - 20, 10, 32);
  } else if (options.variant === 'gate2_left') {
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 3;
    for (let x = 0; x <= 1024; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 58px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('University of Bisha', 512, 148);
  } else if (options.variant === 'gate2_right') {
    ctx.fillStyle = '#CBD5E1';
    ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 3;
    for (let x = 0; x <= 1024; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, 256);
      ctx.stroke();
    }
    ctx.fillStyle = '#0F172A';
    ctx.font = 'bold 68px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('جامعة بيشة', 512, 152);
  } else if (options.variant === 'bldg18_portal') {
    // Gold Arabic college title above dark-glass entrance of Building 18 (seen in video 00:32-00:46)
    ctx.fillStyle = '#1E293B';
    ctx.fillRect(0, 0, 1024, 256);
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = 6;
    ctx.strokeRect(12, 12, 1000, 232);
    ctx.fillStyle = '#FBBF24';
    ctx.font = 'bold 56px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('كلية الحاسبات وتقنية المعلومات', 512, 118);
    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 34px "Outfit", sans-serif';
    ctx.fillText('College of Computing & Information Technology — 18', 512, 192);
  } else if (options.variant === 'bldg19_crest') {
    canvas.width = 256;
    canvas.height = 256;
    const c19 = canvas.getContext('2d')!;
    c19.fillStyle = '#F5EFE6';
    c19.fillRect(0, 0, 256, 256);
    c19.fillStyle = '#0F172A';
    c19.font = 'bold 92px "Outfit", sans-serif';
    c19.textAlign = 'center';
    c19.fillText('19', 128, 110);
    // Shield emblem below 19 (seen in video 01:00)
    c19.strokeStyle = '#0F296B';
    c19.lineWidth = 6;
    c19.strokeRect(88, 138, 80, 88);
    c19.fillStyle = '#0284C7';
    c19.beginPath();
    c19.arc(128, 182, 24, 0, Math.PI * 2);
    c19.fill();
  } else if (options.variant === 'university_wall_logo') {
    canvas.width = 1024;
    canvas.height = 384;
    const cl = canvas.getContext('2d')!;

    // Architectural off-white panel with royal-navy border (normal mounted emblem in day, crisp backlit glow at night)
    cl.fillStyle = '#F8FAFC';
    cl.fillRect(0, 0, 1024, 384);

    cl.strokeStyle = '#0F296B';
    cl.lineWidth = 14;
    cl.strokeRect(10, 10, 1004, 364);

    cl.fillStyle = '#1D4ED8';
    cl.fillRect(17, 17, 990, 14);
    cl.fillRect(17, 353, 990, 14);

    // Official University of Bisha Shield Crest on left
    const cx = 190;
    const cy = 192;
    cl.save();
    cl.beginPath();
    cl.moveTo(cx - 86, cy - 102);
    cl.lineTo(cx + 86, cy - 102);
    cl.lineTo(cx + 86, cy + 14);
    cl.quadraticCurveTo(cx + 86, cy + 102, cx, cy + 128);
    cl.quadraticCurveTo(cx - 86, cy + 102, cx - 86, cy + 14);
    cl.closePath();
    cl.fillStyle = '#FFFFFF';
    cl.fill();
    cl.lineWidth = 11;
    cl.strokeStyle = '#0F296B';
    cl.stroke();

    // Blue sky arc & globe inside shield
    cl.fillStyle = '#0284C7';
    cl.beginPath();
    cl.arc(cx, cy - 12, 42, 0, Math.PI * 2);
    cl.fill();

    // Stylized green date palm inside crest
    cl.fillStyle = '#15803D';
    cl.fillRect(cx - 8, cy - 34, 16, 56);
    cl.beginPath();
    cl.arc(cx, cy - 38, 28, Math.PI, 0);
    cl.fill();
    cl.restore();

    // Bilingual University Title
    cl.fillStyle = '#0F296B';
    cl.textAlign = 'center';
    cl.font = 'bold 92px "Outfit", sans-serif';
    cl.fillText('جامعة بيشة', 610, 168);

    cl.fillStyle = '#1E3A8A';
    cl.font = 'bold 54px "Outfit", sans-serif';
    cl.fillText('University of Bisha', 610, 274);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = options.maxAnisotropy;
  return tex;
}

function createBuildingNumberTexture(
  numStr: string,
  bgHex: string,
  textHex: string,
  maxAnisotropy = 4,
): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;
  ctx.fillStyle = bgHex;
  ctx.fillRect(0, 0, 256, 256);
  ctx.fillStyle = textHex;
  ctx.font = 'bold 138px "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(numStr, 128, 132);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createStripedCurbTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  // Maroon-and-white / black-and-white alternating curb blocks (from video 00:15-01:25)
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#5B1924' : '#F8FAFC';
    ctx.fillRect(i * 32, 0, 32, 64);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createCheckerboardTileTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;
  // Red/terracotta and warm yellow/ochre checkerboard sidewalk & median tiles (from video 00:18-01:25)
  const tile = 32;
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x++) {
      ctx.fillStyle = (x + y) % 2 === 0 ? '#B85242' : '#DEC378';
      ctx.fillRect(x * tile, y * tile, tile, tile);
      ctx.strokeStyle = '#8C3D30';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x * tile, y * tile, tile, tile);
    }
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(8, 8);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createFootballPitchTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#15803D' : '#166534';
    ctx.fillRect(0, i * 64, 512, 64);
  }

  ctx.strokeStyle = '#F8FAFC';
  ctx.lineWidth = 6;
  ctx.strokeRect(28, 28, 456, 968);

  ctx.beginPath();
  ctx.moveTo(28, 512);
  ctx.lineTo(484, 512);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(256, 512, 68, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeRect(116, 28, 280, 130);
  ctx.strokeRect(116, 866, 280, 130);

  ctx.strokeRect(176, 28, 160, 52);
  ctx.strokeRect(176, 944, 160, 52);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createLightPoolTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 4, 128, 128, 124);
  grad.addColorStop(0, 'rgba(255, 236, 179, 0.95)');
  grad.addColorStop(0.28, 'rgba(255, 205, 112, 0.62)');
  grad.addColorStop(0.62, 'rgba(251, 176, 64, 0.22)');
  grad.addColorStop(1, 'rgba(251, 176, 64, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createDesertTerrainTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Sunlit pale golden Arabian desert sand outside campus walls (matching Bisha satellite surroundings)
  ctx.fillStyle = '#D5B789';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle wind-blown desert sand dunes
  for (let y = 0; y < 512; y += 16) {
    ctx.fillStyle = y % 32 === 0 ? 'rgba(186, 146, 94, 0.22)' : 'rgba(229, 203, 159, 0.22)';
    ctx.beginPath();
    ctx.moveTo(0, y);
    for (let x = 0; x <= 512; x += 64) {
      ctx.lineTo(x, y + Math.sin((x / 512) * Math.PI * 4 + y) * 3.5);
    }
    ctx.lineTo(512, y + 8);
    ctx.lineTo(0, y + 8);
    ctx.closePath();
    ctx.fill();
  }

  // Deterministic gravel, pebble & scrub speckles
  for (let i = 0; i < 2000; i++) {
    const px = (i * 73) % 512;
    const py = (i * 137) % 512;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(138, 102, 60, 0.24)' : 'rgba(238, 214, 174, 0.26)';
    ctx.fillRect(px, py, (i % 3) + 1, (i % 2) + 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(55, 55);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createCampusCourtyardTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Authentic compacted warm earthy desert soil & gravel inside campus compound (matching 3d_map2_8858c1fa.png & map_1bc43c3e.png)
  ctx.fillStyle = '#A67E53';
  ctx.fillRect(0, 0, 512, 512);

  // Natural organic compacted soil mottling & subtle graded earth patches
  for (let i = 0; i < 64; i++) {
    const cx = (i * 89 + 37) % 512;
    const cy = (i * 151 + 23) % 512;
    const rx = 26 + (i % 4) * 14;
    const ry = 18 + (i % 3) * 12;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(138, 101, 63, 0.26)' : 'rgba(186, 145, 98, 0.22)';
    ctx.beginPath();
    ctx.ellipse(cx, cy, rx, ry, (i * 0.4) % Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine compacted gravel & sandy silt grain across the campus grounds
  for (let i = 0; i < 2400; i++) {
    const px = (i * 67) % 512;
    const py = (i * 113) % 512;
    ctx.fillStyle = i % 3 === 0 ? 'rgba(116, 83, 49, 0.28)' : 'rgba(198, 158, 110, 0.24)';
    ctx.fillRect(px, py, (i % 2) + 1, (i % 2) + 1);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(28, 36);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

export function buildCampusScene(maxAnisotropy = 4): BuiltCampusScene {
  const rootGroup = new THREE.Group();
  const clickableMeshes: THREE.Object3D[] = [];
  const buildingGroups = new Map<string, THREE.Group>();
  const nightEmissiveMaterials: THREE.MeshStandardMaterial[] = [];
  const streetLightFixtures: THREE.MeshStandardMaterial[] = [];
  const windUniforms: Array<{ value: number }> = [];
  const nightLightGroup = new THREE.Group();
  nightLightGroup.visible = false;

  const curbTex = createStripedCurbTexture(maxAnisotropy);
  const checkerTex = createCheckerboardTileTexture(maxAnisotropy);
  const pitchTex = createFootballPitchTexture(maxAnisotropy);
  const desertTex = createDesertTerrainTexture(maxAnisotropy);
  const courtyardTex = createCampusCourtyardTexture(maxAnisotropy);
  const lightPoolTex = createLightPoolTexture();
  const lightPoolMat = new THREE.MeshBasicMaterial({
    map: lightPoolTex,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const desertGroundMat = new THREE.MeshStandardMaterial({
    map: desertTex,
    color: 0xffffff,
    roughness: 0.95,
    metalness: 0.0,
  });

  const campusInnerSandMat = new THREE.MeshStandardMaterial({
    map: courtyardTex,
    color: 0xffffff,
    roughness: 0.94,
    metalness: 0.0,
  });

  const asphaltMat = new THREE.MeshStandardMaterial({
    color: 0x262f3d,
    roughness: 0.78,
    metalness: 0.08,
  });

  const sidewalkMat = new THREE.MeshStandardMaterial({
    map: checkerTex,
    color: 0xffffff,
    roughness: 0.8,
    metalness: 0.04,
  });

  const creamStuccoMat = new THREE.MeshStandardMaterial({
    color: 0xf6f3ec,
    roughness: 0.72,
    metalness: 0.05,
  });

  const tanPilasterMat = new THREE.MeshStandardMaterial({
    color: 0xb98c62,
    roughness: 0.65,
    metalness: 0.08,
  });

  const windowMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.2,
    metalness: 0.75,
    emissive: new THREE.Color(0xffd27d),
    emissiveIntensity: 0.0,
  });
  nightEmissiveMaterials.push(windowMat);

  const streetLampBulbMat = new THREE.MeshStandardMaterial({
    color: 0xfffbeb,
    roughness: 0.15,
    metalness: 0.1,
    emissive: new THREE.Color(0xffdfa0),
    emissiveIntensity: 0.0,
  });
  streetLightFixtures.push(streetLampBulbMat);

  // 1. Base Exterior Desert Terrain & Strict Interior Paved Campus Pad (x: -195..195, z: -258..300)
  const worldGround = new THREE.Mesh(new THREE.PlaneGeometry(3600, 3600), desertGroundMat);
  worldGround.rotation.x = -Math.PI / 2;
  worldGround.position.set(0, -0.08, 25);
  worldGround.receiveShadow = true;
  rootGroup.add(worldGround);

  const campusPad = new THREE.Mesh(new THREE.PlaneGeometry(390, 558), campusInnerSandMat);
  campusPad.rotation.x = -Math.PI / 2;
  campusPad.position.set(0, -0.02, 21);
  campusPad.receiveShadow = true;
  rootGroup.add(campusPad);

  // 2. Road Network, Checkerboard Medians, Striped Curbs, Streetlamps & Highway Roundabout
  const roadsGroup = new THREE.Group();
  for (const road of CAMPUS_ROADS) {
    buildRoadSegment(
      road,
      roadsGroup,
      asphaltMat,
      sidewalkMat,
      curbTex,
      streetLampBulbMat,
      lightPoolMat,
      nightLightGroup,
    );
  }

  // Roundabout on the Main Highway outside Main Gate 1 (x = -232, z = -35)
  const roundaboutAsphalt = new THREE.Mesh(
    new THREE.CylinderGeometry(18, 18, 0.08, 32),
    asphaltMat,
  );
  roundaboutAsphalt.position.set(-232, 0.04, -35);
  roundaboutAsphalt.receiveShadow = true;
  roadsGroup.add(roundaboutAsphalt);

  const roundaboutCurbMat = new THREE.MeshStandardMaterial({
    map: curbTex,
    color: 0xffffff,
    roughness: 0.6,
  });
  const roundaboutIslandCurb = new THREE.Mesh(
    new THREE.CylinderGeometry(7.5, 7.5, 0.28, 28),
    roundaboutCurbMat,
  );
  roundaboutIslandCurb.position.set(-232, 0.14, -35);
  roadsGroup.add(roundaboutIslandCurb);

  const roundaboutLawn = new THREE.Mesh(
    new THREE.CylinderGeometry(6.9, 6.9, 0.32, 28),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 }),
  );
  roundaboutLawn.position.set(-232, 0.17, -35);
  roadsGroup.add(roundaboutLawn);

  // Central High-Mast 4-Arm Roundabout Luminaire & Night Light Pool
  const rbPoleMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.4,
    metalness: 0.7,
  });
  const rbPole = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.24, 11.5, 10), rbPoleMat);
  rbPole.position.set(-232, 5.75, -35);
  roadsGroup.add(rbPole);
  for (let a = 0; a < 4; a++) {
    const ang = (a * Math.PI) / 2;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.1, 0.1), rbPoleMat);
    arm.position.set(-232 + Math.cos(ang) * 1.1, 11.3, -35 + Math.sin(ang) * 1.1);
    arm.rotation.y = -ang;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.16, 0.4), streetLampBulbMat);
    head.position.set(-232 + Math.cos(ang) * 2.1, 11.25, -35 + Math.sin(ang) * 2.1);
    roadsGroup.add(arm, head);
  }
  const rbPool = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), lightPoolMat);
  rbPool.rotation.x = -Math.PI / 2;
  rbPool.position.set(-232, 0.15, -35);
  nightLightGroup.add(rbPool);

  rootGroup.add(roadsGroup);

  // 3. Build Every Verified, Partially Verified, and Unverified Campus Structure
  for (const bldg of CAMPUS_BUILDINGS) {
    const bGroup = new THREE.Group();
    bGroup.position.set(bldg.position.x, 0, bldg.position.z);
    if (bldg.rotationY) {
      bGroup.rotation.y = bldg.rotationY;
    }
    bGroup.userData = { buildingId: bldg.id };

    switch (bldg.archetype) {
      case 'main_gate_1':
        buildMainGate1(
          bGroup,
          bldg,
          maxAnisotropy,
          curbTex,
          windowMat,
          streetLampBulbMat,
          lightPoolMat,
          nightLightGroup,
          nightEmissiveMaterials,
        );
        break;
      case 'gate_2':
        buildGate2(
          bGroup,
          bldg,
          maxAnisotropy,
          curbTex,
          windowMat,
          streetLampBulbMat,
          lightPoolMat,
          nightLightGroup,
          nightEmissiveMaterials,
        );
        break;
      case 'campus_mosque':
        buildCampusMosque(bGroup, bldg, curbTex, windowMat);
        break;
      case 'building_18_computing':
        buildBuilding18Computing(
          bGroup,
          bldg,
          maxAnisotropy,
          creamStuccoMat,
          windowMat,
          sidewalkMat,
          nightEmissiveMaterials,
        );
        break;
      case 'pilaster_academic_19':
        buildPilasterAcademic19(
          bGroup,
          bldg,
          maxAnisotropy,
          creamStuccoMat,
          tanPilasterMat,
          windowMat,
          sidewalkMat,
          curbTex,
          nightEmissiveMaterials,
        );
        break;
      case 'building_20_arts':
        buildBuilding20Arts(bGroup, bldg, maxAnisotropy, windowMat, nightEmissiveMaterials);
        break;
      case 'red_roof_gym':
        buildRedRoofGymHall(bGroup, bldg, creamStuccoMat, windowMat);
        break;
      case 'sports_pitch':
        buildFootballStadiumPitch(
          bGroup,
          bldg,
          pitchTex,
          streetLampBulbMat,
          lightPoolMat,
          nightLightGroup,
        );
        break;
      case 'multi_sport_courts':
        buildMultiSportCourts(
          bGroup,
          bldg,
          streetLampBulbMat,
          lightPoolMat,
          nightLightGroup,
        );
        break;
      case 'single_sport_court':
        buildSingleSportCourt(
          bGroup,
          bldg,
          streetLampBulbMat,
          lightPoolMat,
          nightLightGroup,
        );
        break;
      case 'admin_numbered_row':
        buildAdminNumberedRow(
          bGroup,
          bldg,
          maxAnisotropy,
          windowMat,
          sidewalkMat,
          nightEmissiveMaterials,
        );
        break;
      case 'single_admin_building':
        buildSingleAdminBuilding(
          bGroup,
          bldg,
          maxAnisotropy,
          windowMat,
          sidewalkMat,
          nightEmissiveMaterials,
        );
        break;
      case 'north_admin_courtyard':
        buildNorthAdminCourtyard(
          bGroup,
          bldg,
          tanPilasterMat,
          creamStuccoMat,
          windowMat,
          sidewalkMat,
        );
        break;
      case 'football_grandstand':
        buildFootballGrandstand(
          bGroup,
          bldg,
          streetLampBulbMat,
          lightPoolMat,
          nightLightGroup,
        );
        break;
      case 'university_library':
        buildUniversityLibrary(
          bGroup,
          bldg,
          maxAnisotropy,
          creamStuccoMat,
          tanPilasterMat,
          windowMat,
          sidewalkMat,
          lightPoolMat,
          nightLightGroup,
          nightEmissiveMaterials,
        );
        break;
      case 'library_wing':
        buildLibraryAnnex(
          bGroup,
          bldg,
          creamStuccoMat,
          tanPilasterMat,
          windowMat,
          sidewalkMat,
        );
        break;
      case 'western_academic_wing':
        buildWesternAcademicWings(bGroup, bldg, creamStuccoMat, tanPilasterMat, windowMat);
        break;
      case 'formal_courtyard_garden':
        buildFormalCourtyardGarden(
          bGroup,
          bldg,
          sidewalkMat,
          curbTex,
          streetLampBulbMat,
          lightPoolMat,
          nightLightGroup,
        );
        break;
      case 'shaded_carport_bay':
        buildShadedParkingCorridor(bGroup, bldg);
        break;
      case 'southwest_support_hall':
        buildSouthwestSupportHall(bGroup, bldg);
        break;
    }

    // Invisible click-proxy volume for reliable raycasting
    const proxyGeo = new THREE.BoxGeometry(
      bldg.dimensions.width,
      Math.max(3.5, bldg.dimensions.height),
      bldg.dimensions.depth,
    );
    const proxyMat = new THREE.MeshBasicMaterial({ visible: false });
    const proxyMesh = new THREE.Mesh(proxyGeo, proxyMat);
    proxyMesh.position.y = Math.max(3.5, bldg.dimensions.height) / 2;
    proxyMesh.userData = { buildingId: bldg.id };
    bGroup.add(proxyMesh);
    clickableMeshes.push(proxyMesh);

    buildingGroups.set(bldg.id, bGroup);
    rootGroup.add(bGroup);
  }

  // 4. Perimeter Wall & Animated Date Palm Landscaping
  buildPerimeterWallAndPalms(rootGroup, maxAnisotropy, windUniforms);

  // 4b. Campus-Wide Night Illumination PointLights & Plaza Light Pools
  buildCampusNightIllumination(nightLightGroup, lightPoolMat);
  rootGroup.add(nightLightGroup);

  // 5. Dynamic Route Highlight Group, Distance Measurement Group, Player Avatar & Selection Ring
  const routeLineGroup = new THREE.Group();
  rootGroup.add(routeLineGroup);

  const measureGroup = new THREE.Group();
  rootGroup.add(measureGroup);

  const { avatar: playerAvatarGroup, rig: playerAvatarRig } = buildThirdPersonAvatar(maxAnisotropy);
  playerAvatarGroup.visible = false;
  rootGroup.add(playerAvatarGroup);

  const { carGroup: campusCarGroup, rig: campusCarRig } = buildCampusCar(maxAnisotropy);
  campusCarGroup.position.set(-154, 0, -50);
  campusCarGroup.rotation.y = 0;
  campusCarGroup.visible = true;
  rootGroup.add(campusCarGroup);

  const ringGeo = new THREE.RingGeometry(1.2, 1.65, 36);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x0ea5e9,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.9,
    depthWrite: false,
  });
  const selectionRing = new THREE.Mesh(ringGeo, ringMat);
  selectionRing.rotation.x = -Math.PI / 2;
  selectionRing.position.y = 0.14;
  selectionRing.visible = false;
  rootGroup.add(selectionRing);

  return {
    rootGroup,
    clickableMeshes,
    buildingGroups,
    nightEmissiveMaterials,
    streetLightFixtures,
    windUniforms,
    nightLightGroup,
    routeLineGroup,
    measureGroup,
    playerAvatarGroup,
    playerAvatarRig,
    campusCarGroup,
    campusCarRig,
    selectionRing,
  };
}

function buildRoadSegment(
  road: RoadSegment,
  parent: THREE.Group,
  asphaltMat: THREE.Material,
  sidewalkMat: THREE.Material,
  curbTex: THREE.Texture,
  bulbMat: THREE.Material,
  lightPoolMat: THREE.Material,
  nightLightGroup: THREE.Group,
) {
  const dx = road.end[0] - road.start[0];
  const dz = road.end[1] - road.start[1];
  const length = Math.hypot(dx, dz);
  const cx = (road.start[0] + road.end[0]) / 2;
  const cz = (road.start[1] + road.end[1]) / 2;
  const angle = Math.atan2(dx, dz);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);

  const segGroup = new THREE.Group();
  segGroup.position.set(cx, 0, cz);
  segGroup.rotation.y = angle;

  // Asphalt bed
  const roadMesh = new THREE.Mesh(new THREE.BoxGeometry(road.width, 0.08, length), asphaltMat);
  roadMesh.position.y = 0.04;
  roadMesh.receiveShadow = true;
  segGroup.add(roadMesh);

  // Dashed lane markings
  const dashMat = new THREE.MeshBasicMaterial({ color: 0xe2e8f0 });
  const dashCount = Math.floor(length / 8);
  for (let i = 0; i < dashCount; i++) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.22, 3.2), dashMat);
    dash.rotation.x = -Math.PI / 2;
    dash.position.set(0, 0.09, -length / 2 + i * 8 + 4);
    segGroup.add(dash);
  }

  // Center checkerboard median island on boulevards (seen in video 00:16–00:58)
  if (road.hasMedian) {
    const medianWalk = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.18, length - 4),
      sidewalkMat,
    );
    medianWalk.position.set(0, 0.09, 0);
    segGroup.add(medianWalk);
  }

  // Maroon-and-white striped curbs on both sides
  if (road.hasStripedCurb) {
    const clonedTex = curbTex.clone();
    clonedTex.needsUpdate = true;
    clonedTex.repeat.set(Math.max(2, Math.round(length / 4)), 1);
    const curbMat = new THREE.MeshStandardMaterial({
      map: clonedTex,
      color: 0xffffff,
      roughness: 0.65,
    });
    const leftCurb = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, length), curbMat);
    leftCurb.position.set(-road.width / 2 - 0.22, 0.11, 0);
    const rightCurb = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.22, length), curbMat);
    rightCurb.position.set(road.width / 2 + 0.22, 0.11, 0);
    segGroup.add(leftCurb, rightCurb);
  }

  // Red-and-yellow checkerboard pedestrian sidewalks
  if (road.hasSidewalk) {
    const leftWalk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, length), sidewalkMat);
    leftWalk.position.set(-road.width / 2 - 1.65, 0.08, 0);
    leftWalk.receiveShadow = true;
    const rightWalk = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, length), sidewalkMat);
    rightWalk.position.set(road.width / 2 + 1.65, 0.08, 0);
    rightWalk.receiveShadow = true;
    segGroup.add(leftWalk, rightWalk);
  }

  // Streetlamps along the road + Warm Night Light Pools on the Road Surface
  if (road.lampStyle) {
    const poleMat = new THREE.MeshStandardMaterial({
      color: road.lampStyle === 'y_modern' ? 0x111827 : 0x3b2f2f,
      roughness: 0.4,
      metalness: 0.7,
    });
    const step = 20;
    for (let z = -length / 2 + 8; z <= length / 2 - 6; z += step) {
      const lamp = new THREE.Group();
      const offsetX = road.hasMedian ? 0 : -road.width / 2 - 1.2;
      lamp.position.set(offsetX, 0, z);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.14, 7.2, 8), poleMat);
      pole.position.y = 3.6;
      lamp.add(pole);

      if (road.lampStyle === 'y_modern') {
        for (const side of [-1, 1]) {
          const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.8, 6), poleMat);
          arm.position.set(side * 0.65, 7.6, 0);
          arm.rotation.z = -side * 0.6;
          const ledHead = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.14, 0.36), bulbMat);
          ledHead.position.set(side * 1.25, 8.2, 0);
          lamp.add(arm, ledHead);
        }
      } else {
        const crossArm = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.08), poleMat);
        crossArm.position.y = 6.9;
        const leftGlobe = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), bulbMat);
        leftGlobe.position.set(-0.85, 6.65, 0);
        const rightGlobe = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), bulbMat);
        rightGlobe.position.set(0.85, 6.65, 0);
        lamp.add(crossArm, leftGlobe, rightGlobe);
      }
      segGroup.add(lamp);

      // Compute world (x, z) of this streetlamp so we can place a warm radial light pool on the road!
      const worldLampX = cx + offsetX * cosA + z * sinA;
      const worldLampZ = cz - offsetX * sinA + z * cosA;
      const roadCenterX = cx + z * sinA;
      const roadCenterZ = cz + z * cosA;

      const poolSize = Math.max(18, road.width * 1.85);
      const poolMesh = new THREE.Mesh(new THREE.PlaneGeometry(poolSize, poolSize), lightPoolMat);
      poolMesh.rotation.x = -Math.PI / 2;
      poolMesh.position.set((worldLampX + roadCenterX) * 0.5, 0.14, (worldLampZ + roadCenterZ) * 0.5);
      nightLightGroup.add(poolMesh);

      const haloMesh = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), lightPoolMat);
      haloMesh.rotation.x = -Math.PI / 2;
      haloMesh.position.set(worldLampX, road.lampStyle === 'y_modern' ? 8.1 : 6.7, worldLampZ);
      nightLightGroup.add(haloMesh);
    }
  }

  parent.add(segGroup);
}

/**
 * Reconstructs Main Gate 1 (/assets/aistudio/main_gate_3f2674ed.jpg) +
 * Entry Green Lawn Island with Vertical Black-and-White Bollard Lights (Video 00:05–00:11)
 */
function buildMainGate1(
  group: THREE.Group,
  bldg: CampusBuilding,
  maxAnisotropy: number,
  curbTex: THREE.Texture,
  windowMat: THREE.Material,
  bulbMat: THREE.Material,
  lightPoolMat: THREE.Material,
  nightLightGroup: THREE.Group,
  nightEmissiveMaterials: THREE.MeshStandardMaterial[],
) {
  const whiteCladMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.35,
    metalness: 0.15,
  });
  const royalBlueMat = new THREE.MeshStandardMaterial({
    color: 0x1d4ed8,
    roughness: 0.4,
    metalness: 0.2,
  });

  const signTex = createCrestAndSignageTexture({ variant: 'gate1_front', maxAnisotropy });
  const signFasciaMat = new THREE.MeshStandardMaterial({
    map: signTex,
    color: 0xffffff,
    roughness: 0.35,
    metalness: 0.1,
    emissive: new THREE.Color(0xffffff),
    emissiveMap: signTex,
    emissiveIntensity: 0.0,
  });
  nightEmissiveMaterials.push(signFasciaMat);

  const canopyWidthX = 7.2;
  const canopySpanZ = 22.0;
  const canopyHeightY = 2.8;
  const clearanceY = 5.4;

  const canopyBody = new THREE.Mesh(
    new THREE.BoxGeometry(canopyWidthX, canopyHeightY, canopySpanZ),
    whiteCladMat,
  );
  canopyBody.position.set(0, clearanceY + canopyHeightY / 2, 0);
  canopyBody.castShadow = true;
  canopyBody.receiveShadow = true;
  group.add(canopyBody);

  const westSignPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(canopySpanZ - 0.6, canopyHeightY - 0.2),
    signFasciaMat,
  );
  westSignPlane.rotation.y = -Math.PI / 2;
  westSignPlane.position.set(-canopyWidthX / 2 - 0.04, clearanceY + canopyHeightY / 2, 0);
  group.add(westSignPlane);

  const eastSignPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(canopySpanZ - 0.6, canopyHeightY - 0.2),
    signFasciaMat,
  );
  eastSignPlane.rotation.y = Math.PI / 2;
  eastSignPlane.position.set(canopyWidthX / 2 + 0.04, clearanceY + canopyHeightY / 2, 0);
  group.add(eastSignPlane);

  for (const pz of [-9.5, 0, 9.5]) {
    const colUpper = new THREE.Mesh(new THREE.BoxGeometry(2.2, clearanceY, 1.4), whiteCladMat);
    colUpper.position.set(0, clearanceY / 2, pz);
    colUpper.castShadow = true;
    group.add(colUpper);

    const blueAccent = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.4, 1.5), royalBlueMat);
    blueAccent.position.set(0, 2.2, pz);
    group.add(blueAccent);
  }

  const boothBody = new THREE.Mesh(new THREE.BoxGeometry(5.5, 3.2, 3.0), whiteCladMat);
  boothBody.position.set(0, 1.6, 0);
  boothBody.castShadow = true;
  group.add(boothBody);

  const boothWindows = new THREE.Mesh(new THREE.BoxGeometry(5.6, 1.2, 3.1), windowMat);
  boothWindows.position.set(0, 2.0, 0);
  group.add(boothWindows);

  const islandCurb = new THREE.Mesh(
    new THREE.BoxGeometry(22, 0.26, 3.6),
    new THREE.MeshStandardMaterial({ map: curbTex, color: 0xffffff, roughness: 0.6 }),
  );
  islandCurb.position.set(2, 0.13, 0);
  group.add(islandCurb);

  for (const lz of [-6, 6]) {
    const downlight = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 2.4), bulbMat);
    downlight.position.set(0, clearanceY - 0.05, lz);
    group.add(downlight);

    const gatePool = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), lightPoolMat);
    gatePool.rotation.x = -Math.PI / 2;
    gatePool.position.set(bldg.position.x, 0.16, bldg.position.z + lz);
    nightLightGroup.add(gatePool);
  }

  // Entry Green Lawn Island with Vertical Black-and-White Bollard Lights (Video 00:05–00:11)
  const lawnIslandGroup = new THREE.Group();
  lawnIslandGroup.position.set(16, 0, 14);
  const lawnCurb = new THREE.Mesh(
    new THREE.CylinderGeometry(8.5, 8.5, 0.24, 28),
    new THREE.MeshStandardMaterial({ map: curbTex, color: 0xffffff, roughness: 0.6 }),
  );
  lawnCurb.position.y = 0.12;
  const lawnTurf = new THREE.Mesh(
    new THREE.CylinderGeometry(7.9, 7.9, 0.28, 28),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 }),
  );
  lawnTurf.position.y = 0.15;
  lawnIslandGroup.add(lawnCurb, lawnTurf);

  const bollardBodyMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4 });
  for (let b = 0; b < 6; b++) {
    const ang = (b / 6) * Math.PI * 2;
    const bx = Math.cos(ang) * 6.8;
    const bz = Math.sin(ang) * 6.8;
    const bollard = new THREE.Mesh(new THREE.BoxGeometry(0.24, 1.1, 0.24), bollardBodyMat);
    bollard.position.set(bx, 0.7, bz);
    const ledStrip = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.75, 0.08), bulbMat);
    ledStrip.position.set(bx, 0.75, bz);
    lawnIslandGroup.add(bollard, ledStrip);

    const bollardPool = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 7.5), lightPoolMat);
    bollardPool.rotation.x = -Math.PI / 2;
    bollardPool.position.set(bldg.position.x + 16 + bx, 0.18, bldg.position.z + 14 + bz);
    nightLightGroup.add(bollardPool);
  }
  group.add(lawnIslandGroup);
}

/**
 * Reconstructs the University Mosque (مسجد الجامعة — Video 00:00–00:30):
 * - Warm sandstone/ochre stone cladding (#C89D70) with black granite base plinth
 * - Stepped crenelated roof parapet
 * - Tall square western Minaret tower (22m) with arched openings and finial
 * - Central terracotta-red pyramidal dome roof (#991B1B)
 * - Paired & triple tall arched windows on southern and western facades
 * - Manicured front green lawn bordered by striped curbs
 */
function buildCampusMosque(
  group: THREE.Group,
  bldg: CampusBuilding,
  curbTex: THREE.Texture,
  windowMat: THREE.Material,
) {
  const { width, depth, height } = bldg.dimensions;

  const stoneMat = new THREE.MeshStandardMaterial({
    color: 0xc89d70,
    roughness: 0.72,
    metalness: 0.06,
  });
  const lighterStoneMat = new THREE.MeshStandardMaterial({
    color: 0xdcc09e,
    roughness: 0.68,
    metalness: 0.05,
  });
  const blackPlinthMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.5,
  });
  const redDomeMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    roughness: 0.55,
    metalness: 0.2,
  });

  // Black base plinth (seen clearly in video 00:15–00:25)
  const plinth = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.3, 0.85, depth + 0.3),
    blackPlinthMat,
  );
  plinth.position.y = 0.425;
  group.add(plinth);

  // Main prayer hall body
  const hall = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), stoneMat);
  hall.position.y = height / 2;
  hall.castShadow = true;
  hall.receiveShadow = true;
  group.add(hall);

  // Stepped crenelated parapet along top of Mosque walls (video 00:02–00:25)
  for (let x = -width / 2 + 1.5; x <= width / 2 - 1.5; x += 3.0) {
    for (const sideZ of [-depth / 2, depth / 2]) {
      const merlon = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.9, 0.5), lighterStoneMat);
      merlon.position.set(x, height + 0.45, sideZ);
      group.add(merlon);
    }
  }

  // Central Terracotta-Red Pyramidal Hip Roof Dome (seen in video 00:02–00:28)
  const domeDrum = new THREE.Mesh(new THREE.BoxGeometry(10.5, 1.6, 10.5), lighterStoneMat);
  domeDrum.position.set(2, height + 0.8, 0);
  group.add(domeDrum);

  const pyramidalDome = new THREE.Mesh(new THREE.ConeGeometry(8.2, 4.2, 4), redDomeMat);
  pyramidalDome.rotation.y = Math.PI / 4;
  pyramidalDome.position.set(2, height + 3.7, 0);
  pyramidalDome.castShadow = true;
  group.add(pyramidalDome);

  // Tall Square Minaret Tower on the West side (left side in video 00:01–00:16)
  const minaretH = 22.5;
  const minaretX = -width / 2 + 3.2;
  const minaretZ = depth / 2 - 3.2;

  const minaretShaft = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, minaretH, 4.2),
    lighterStoneMat,
  );
  minaretShaft.position.set(minaretX, minaretH / 2, minaretZ);
  minaretShaft.castShadow = true;
  group.add(minaretShaft);

  // Minaret balcony cornice & upper lantern belfry
  const balcony = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.7, 5.0), stoneMat);
  balcony.position.set(minaretX, minaretH - 4.5, minaretZ);
  group.add(balcony);

  // Arched belfry windows near top of minaret
  const belfryWin = new THREE.Mesh(new THREE.BoxGeometry(4.35, 2.6, 1.6), windowMat);
  belfryWin.position.set(minaretX, minaretH - 2.3, minaretZ);
  const belfryWinZ = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.6, 4.35), windowMat);
  belfryWinZ.position.set(minaretX, minaretH - 2.3, minaretZ);
  group.add(belfryWin, belfryWinZ);

  const minaretSpire = new THREE.Mesh(new THREE.ConeGeometry(2.2, 3.0, 4), redDomeMat);
  minaretSpire.rotation.y = Math.PI / 4;
  minaretSpire.position.set(minaretX, minaretH + 1.5, minaretZ);
  group.add(minaretSpire);

  // Paired & Triple Arched Windows along South & West facades (video 00:15–00:28)
  const winPositionsX = [-8, -5.5, 1, 3.2, 5.4, 10, 12.2];
  for (const wx of winPositionsX) {
    const archWin = new THREE.Mesh(new THREE.BoxGeometry(1.25, 3.4, 0.24), windowMat);
    archWin.position.set(wx, 4.2, depth / 2 + 0.06);
    group.add(archWin);
  }

  // Front Green Lawn & Curb Apron on South/West side of Mosque (video 00:02–00:25)
  const frontLawn = new THREE.Mesh(
    new THREE.BoxGeometry(width + 8, 0.22, 9),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 }),
  );
  frontLawn.position.set(0, 0.11, depth / 2 + 5.2);
  group.add(frontLawn);

  const frontCurb = new THREE.Mesh(
    new THREE.BoxGeometry(width + 8.6, 0.26, 0.45),
    new THREE.MeshStandardMaterial({ map: curbTex, color: 0xffffff, roughness: 0.65 }),
  );
  frontCurb.position.set(0, 0.13, depth / 2 + 9.8);
  group.add(frontCurb);
}

/**
 * Reconstructs Building 18 — College of Computing & IT (مبنى 18 — Video 00:17–00:52):
 * - 2-story crisp off-white/cream block
 * - Projecting 3-level corner stair tower on the southwest corner bearing numeral "18"
 * - Vertical slate-gray window bay strips
 * - Two grand dark-glass entrance portals on the South facade with gold Arabic signage & steel-railed ramps
 */
function buildBuilding18Computing(
  group: THREE.Group,
  bldg: CampusBuilding,
  maxAnisotropy: number,
  creamMat: THREE.Material,
  windowMat: THREE.Material,
  sidewalkMat: THREE.Material,
  nightEmissiveMaterials: THREE.MeshStandardMaterial[],
) {
  const { width, depth, height } = bldg.dimensions;
  const slateStripMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.55 });
  const darkGlassMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.18,
    metalness: 0.82,
  });

  // Main 2-story building volume with dark plinth & roof coping for sharp daytime definition
  const plinth18 = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.3, 0.75, depth + 0.3),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 }),
  );
  plinth18.position.y = 0.375;
  group.add(plinth18);

  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), creamMat);
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const roofCoping18 = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.4, 0.45, depth + 0.4),
    slateStripMat,
  );
  roofCoping18.position.y = height + 0.22;
  group.add(roofCoping18);

  // Projecting Corner Stair Tower on West-South corner with numeral "18" (video 00:17–00:22)
  const towerH = height + 2.8;
  const tower = new THREE.Mesh(new THREE.BoxGeometry(7.2, towerH, 7.2), creamMat);
  tower.position.set(-width / 2 + 3.6, towerH / 2, depth / 2 - 2.8);
  tower.castShadow = true;
  group.add(tower);

  const numStr = bldg.buildingNumber || '18';
  const numTex = createBuildingNumberTexture(numStr, '#F4EFE6', '#1E293B', maxAnisotropy);
  const numMat = new THREE.MeshStandardMaterial({
    map: numTex,
    roughness: 0.5,
    emissive: new THREE.Color(0xffdfa0),
    emissiveMap: numTex,
    emissiveIntensity: 0.0,
  });
  nightEmissiveMaterials.push(numMat);
  const numSign = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 3.2), numMat);
  numSign.position.set(-width / 2 + 3.6, towerH - 2.2, depth / 2 + 0.85);
  group.add(numSign);

  // Vertical slate-gray window strips along South and North facades
  for (let x = -width / 2 + 9; x <= width / 2 - 4; x += 4.2) {
    for (const sideZ of [-1, 1]) {
      const strip = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, height - 1.4, 0.16),
        slateStripMat,
      );
      strip.position.set(x, height / 2, sideZ * (depth / 2 + 0.04));
      group.add(strip);

      for (const wy of [3.0, 7.2]) {
        const win = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.24), windowMat);
        win.position.set(x, wy, sideZ * (depth / 2 + 0.06));
        group.add(win);
      }
    }
  }

  // Grand Dark-Glass Entrance Portals with Signage & Ramps (single center portal for narrower wings like Bldgs 15/17)
  const portalSignTex = createCrestAndSignageTexture({ variant: 'bldg18_portal', maxAnisotropy });
  const portalSignMat = new THREE.MeshStandardMaterial({
    map: portalSignTex,
    roughness: 0.35,
    emissive: new THREE.Color(0xffdfa0),
    emissiveMap: portalSignTex,
    emissiveIntensity: 0.0,
  });
  nightEmissiveMaterials.push(portalSignMat);
  const rampMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
  const portalXs = width >= 44 ? [-5, 11] : [3];

  for (const portalX of portalXs) {
    const portalFrame = new THREE.Mesh(
      new THREE.BoxGeometry(6.8, height - 0.8, 1.4),
      darkGlassMat,
    );
    portalFrame.position.set(portalX, (height - 0.8) / 2, depth / 2 + 0.6);
    group.add(portalFrame);

    if (numStr === '18') {
      const goldSign = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.6), portalSignMat);
      goldSign.position.set(portalX, 5.2, depth / 2 + 1.34);
      group.add(goldSign);
    }

    // Concrete landing & wheelchair ramp in front of portal
    const landing = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.45, 2.8), rampMat);
    landing.position.set(portalX, 0.225, depth / 2 + 2.2);
    group.add(landing);
  }

  // Wide checkerboard pedestrian plaza in front of Building 18
  const plaza = new THREE.Mesh(new THREE.BoxGeometry(width + 6, 0.14, 6.5), sidewalkMat);
  plaza.position.set(0, 0.07, depth / 2 + 4.2);
  plaza.receiveShadow = true;
  group.add(plaza);
}

/**
 * Reconstructs Building 19 — 3-Story Cream & Tan Pilaster Academic Building
 * (/assets/aistudio/building_image_2e9fa5e1.jpg & Video 00:58–01:06):
 * - Cream stucco body (#F5EFE6)
 * - Projecting vertical tan pilasters (#C8A98E) rising above the roof into stepped parapet finials
 * - Central entrance bay with numeral "19" and University crest
 * - Wide red-and-yellow checkerboard tiled foreground plaza
 */
function buildPilasterAcademic19(
  group: THREE.Group,
  bldg: CampusBuilding,
  maxAnisotropy: number,
  creamMat: THREE.Material,
  tanMat: THREE.Material,
  windowMat: THREE.Material,
  sidewalkMat: THREE.Material,
  curbTex: THREE.Texture,
  nightEmissiveMaterials: THREE.MeshStandardMaterial[],
) {
  const { width, depth, height } = bldg.dimensions;

  const mainBody = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), creamMat);
  mainBody.position.set(0, height / 2, 0);
  mainBody.castShadow = true;
  mainBody.receiveShadow = true;
  group.add(mainBody);

  const roofParapet = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.4, 0.6, depth + 0.4),
    creamMat,
  );
  roofParapet.position.set(0, height + 0.3, 0);
  group.add(roofParapet);

  // Projecting vertical tan pilasters with stepped roof finials along South & North facades
  const numBays = 7;
  const baySpacing = (width - 6) / numBays;
  for (let i = 0; i <= numBays; i++) {
    const px = -width / 2 + 3 + i * baySpacing;
    for (const sideZ of [-1, 1]) {
      const pz = sideZ * (depth / 2 + 0.25);
      const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.85, height + 0.9, 0.55), tanMat);
      pilaster.position.set(px, (height + 0.9) / 2, pz);
      pilaster.castShadow = true;
      group.add(pilaster);

      const finialCap = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.45), tanMat);
      finialCap.position.set(px, height + 1.15, pz);
      group.add(finialCap);

      if (i < numBays) {
        const bayCenterX = px + baySpacing / 2;
        const spandrelColumn = new THREE.Mesh(
          new THREE.BoxGeometry(baySpacing * 0.58, height - 1.8, 0.16),
          tanMat,
        );
        spandrelColumn.position.set(bayCenterX, height / 2, sideZ * (depth / 2 + 0.04));
        group.add(spandrelColumn);

        for (let floor = 0; floor < 3; floor++) {
          const wy = 2.6 + floor * 3.8;
          for (const wxOff of [-0.6, 0.6]) {
            const win = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.55, 0.24), windowMat);
            win.position.set(bayCenterX + wxOff, wy, sideZ * (depth / 2 + 0.08));
            group.add(win);
          }
        }
      }
    }
  }

  // Central Entrance Tower Bay on South Facade bearing Numeral "19" & Crest (Video 01:00)
  const centralTower = new THREE.Mesh(
    new THREE.BoxGeometry(5.6, height + 1.8, 1.4),
    creamMat,
  );
  centralTower.position.set(0, (height + 1.8) / 2, depth / 2 + 0.5);
  group.add(centralTower);

  const numStr = bldg.buildingNumber || '19';
  const crestTex =
    numStr === '19'
      ? createCrestAndSignageTexture({ variant: 'bldg19_crest', maxAnisotropy })
      : createBuildingNumberTexture(numStr, '#F5EFE6', '#0F172A', maxAnisotropy);
  const crestMat = new THREE.MeshStandardMaterial({
    map: crestTex,
    roughness: 0.45,
    emissive: new THREE.Color(0xffdfa0),
    emissiveMap: crestTex,
    emissiveIntensity: 0.0,
  });
  nightEmissiveMaterials.push(crestMat);
  const crestPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 3.6), crestMat);
  crestPlane.position.set(0, height - 1.2, depth / 2 + 1.24);
  group.add(crestPlane);

  const portalGlazing = new THREE.Mesh(new THREE.BoxGeometry(3.4, 4.2, 0.25), windowMat);
  portalGlazing.position.set(0, 2.3, depth / 2 + 1.15);
  group.add(portalGlazing);

  // East & West side facade pilasters + 4-square horizontal window bands (building_image_2e9fa5e1.jpg)
  for (const sideX of [-1, 1]) {
    const sx = sideX * (width / 2 + 0.25);
    for (const pz of [-depth / 2 + 2, 0, depth / 2 - 2]) {
      const sidePilaster = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, height + 0.9, 0.85),
        tanMat,
      );
      sidePilaster.position.set(sx, (height + 0.9) / 2, pz);
      group.add(sidePilaster);
    }

    for (let floor = 0; floor < 3; floor++) {
      const wy = 2.6 + floor * 3.8;
      for (let wIdx = 0; wIdx < 4; wIdx++) {
        const wz = -depth / 4 + (wIdx - 1.5) * 1.45;
        const sqWin = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.95, 0.95), windowMat);
        sqWin.position.set(sideX * (width / 2 + 0.05), wy, wz);
        group.add(sqWin);
      }
    }
  }

  // Wide red-and-yellow checkerboard plaza apron in front of Building 19 (Video 01:01–01:05)
  const apronWalk = new THREE.Mesh(new THREE.BoxGeometry(width + 10, 0.14, 10), sidewalkMat);
  apronWalk.position.set(0, 0.07, depth / 2 + 5.0);
  apronWalk.receiveShadow = true;
  group.add(apronWalk);

  const apronCurb = new THREE.Mesh(
    new THREE.BoxGeometry(width + 10.4, 0.22, 0.45),
    new THREE.MeshStandardMaterial({ map: curbTex, color: 0xffffff, roughness: 0.65 }),
  );
  apronCurb.position.set(0, 0.11, depth / 2 + 10.1);
  group.add(apronCurb);
}

/**
 * Reconstructs Building 20 — Deanship of the College of Arts (عمادة كلية الآداب — Video 00:51–01:05):
 * - 2-story warm desert beige stucco building east of the Football Playground
 * - Projecting northwest corner tower with large black numeral "20"
 * - White rooftop service water tanks
 * - Dense date palm grove on its northwest corner
 */
function buildBuilding20Arts(
  group: THREE.Group,
  bldg: CampusBuilding,
  maxAnisotropy: number,
  windowMat: THREE.Material,
  nightEmissiveMaterials: THREE.MeshStandardMaterial[],
) {
  const { width, depth, height } = bldg.dimensions;
  const beigeMat = new THREE.MeshStandardMaterial({ color: 0xf1ebe0, roughness: 0.75 });
  const plinthMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.6 });

  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), beigeMat);
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(width + 0.3, 0.8, depth + 0.3), plinthMat);
  plinth.position.y = 0.4;
  group.add(plinth);

  // Northwest corner stair tower with numeral "20" (seen in video 00:54–01:04)
  const towerH = height + 2.4;
  const tower = new THREE.Mesh(new THREE.BoxGeometry(6.8, towerH, 6.8), beigeMat);
  tower.position.set(-width / 2 + 3.4, towerH / 2, -depth / 2 + 3.4);
  tower.castShadow = true;
  group.add(tower);

  const num20Tex = createBuildingNumberTexture('20', '#F1EBE0', '#0F172A', maxAnisotropy);
  const num20Mat = new THREE.MeshStandardMaterial({
    map: num20Tex,
    roughness: 0.5,
    emissive: new THREE.Color(0xffdfa0),
    emissiveMap: num20Tex,
    emissiveIntensity: 0.0,
  });
  nightEmissiveMaterials.push(num20Mat);
  const num20West = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), num20Mat);
  num20West.rotation.y = -Math.PI / 2;
  num20West.position.set(-width / 2 - 0.06, towerH - 2.2, -depth / 2 + 3.4);
  const num20North = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), num20Mat);
  num20North.rotation.y = Math.PI;
  num20North.position.set(-width / 2 + 3.4, towerH - 2.2, -depth / 2 - 0.06);
  group.add(num20West, num20North);

  // Two-story windows
  for (const wy of [3.0, 6.8]) {
    const winStrip = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.2, 1.3, depth - 10),
      windowMat,
    );
    winStrip.position.set(0, wy, 2);
    group.add(winStrip);
  }

  // White rooftop water tanks (visible in video 00:55)
  const tankMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.4 });
  for (const tz of [-8, 0, 8]) {
    const tank = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 2.2, 12), tankMat);
    tank.position.set(0, height + 1.1, tz);
    group.add(tank);
  }
}

/**
 * Reconstructs Gate 2 (/assets/aistudio/2nd_gate_964880f7.jpg)
 * Located at the South-East portal of the Formal Four-Quadrant Courtyard Garden (x = 104, z = 168)
 */
function buildGate2(
  group: THREE.Group,
  bldg: CampusBuilding,
  maxAnisotropy: number,
  curbTex: THREE.Texture,
  windowMat: THREE.Material,
  bulbMat: THREE.Material,
  lightPoolMat: THREE.Material,
  nightLightGroup: THREE.Group,
  nightEmissiveMaterials: THREE.MeshStandardMaterial[],
) {
  const navyFrameMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.4,
    metalness: 0.35,
  });
  const silverCladMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.3,
    metalness: 0.65,
  });

  const towerTex = createCrestAndSignageTexture({ variant: 'gate2_tower', maxAnisotropy });
  const leftWingTex = createCrestAndSignageTexture({ variant: 'gate2_left', maxAnisotropy });
  const rightWingTex = createCrestAndSignageTexture({ variant: 'gate2_right', maxAnisotropy });

  const towerFaceMat = new THREE.MeshStandardMaterial({
    map: towerTex,
    color: 0xffffff,
    roughness: 0.32,
    metalness: 0.45,
    emissive: new THREE.Color(0xffffff),
    emissiveMap: towerTex,
    emissiveIntensity: 0.0,
  });
  nightEmissiveMaterials.push(towerFaceMat);

  const towerFrame = new THREE.Mesh(new THREE.BoxGeometry(9.2, 11.5, 5.6), navyFrameMat);
  towerFrame.position.set(0, 5.75, 0);
  towerFrame.castShadow = true;
  towerFrame.receiveShadow = true;
  group.add(towerFrame);

  const frontPanel = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 10.1), towerFaceMat);
  frontPanel.position.set(0, 5.75, 2.83);
  group.add(frontPanel);

  const backPanel = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 10.1), towerFaceMat);
  backPanel.rotation.y = Math.PI;
  backPanel.position.set(0, 5.75, -2.83);
  group.add(backPanel);

  const serviceDoor = new THREE.Mesh(
    new THREE.BoxGeometry(1.25, 2.5, 0.16),
    new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.5 }),
  );
  serviceDoor.position.set(2.1, 1.45, 2.82);
  group.add(serviceDoor);

  const win1 = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.65, 0.14), windowMat);
  win1.position.set(-1.1, 2.6, 2.82);
  const win2 = new THREE.Mesh(new THREE.BoxGeometry(0.45, 1.3, 0.14), windowMat);
  win2.position.set(-0.2, 1.8, 2.82);
  group.add(win1, win2);

  const wingSpan = 11.5;
  const wingHeight = 1.9;
  const wingClearance = 5.6;

  const leftWingMat = new THREE.MeshStandardMaterial({
    map: leftWingTex,
    color: 0xffffff,
    roughness: 0.35,
    metalness: 0.35,
    emissive: new THREE.Color(0xffffff),
    emissiveMap: leftWingTex,
    emissiveIntensity: 0.0,
  });
  const rightWingMat = new THREE.MeshStandardMaterial({
    map: rightWingTex,
    color: 0xffffff,
    roughness: 0.35,
    metalness: 0.35,
    emissive: new THREE.Color(0xffffff),
    emissiveMap: rightWingTex,
    emissiveIntensity: 0.0,
  });
  nightEmissiveMaterials.push(leftWingMat, rightWingMat);

  const leftCanopy = new THREE.Mesh(
    new THREE.BoxGeometry(wingSpan, wingHeight, 3.8),
    silverCladMat,
  );
  leftCanopy.position.set(-4.6 - wingSpan / 2, wingClearance + wingHeight / 2, 0);
  leftCanopy.castShadow = true;
  group.add(leftCanopy);

  const leftSign = new THREE.Mesh(
    new THREE.PlaneGeometry(wingSpan - 0.4, wingHeight - 0.2),
    leftWingMat,
  );
  leftSign.position.set(-4.6 - wingSpan / 2, wingClearance + wingHeight / 2, 1.92);
  group.add(leftSign);

  const leftBackSign = new THREE.Mesh(
    new THREE.PlaneGeometry(wingSpan - 0.4, wingHeight - 0.2),
    leftWingMat,
  );
  leftBackSign.rotation.y = Math.PI;
  leftBackSign.position.set(-4.6 - wingSpan / 2, wingClearance + wingHeight / 2, -1.92);
  group.add(leftBackSign);

  const rightCanopy = new THREE.Mesh(
    new THREE.BoxGeometry(wingSpan, wingHeight, 3.8),
    silverCladMat,
  );
  rightCanopy.position.set(4.6 + wingSpan / 2, wingClearance + wingHeight / 2, 0);
  rightCanopy.castShadow = true;
  group.add(rightCanopy);

  const rightSign = new THREE.Mesh(
    new THREE.PlaneGeometry(wingSpan - 0.4, wingHeight - 0.2),
    rightWingMat,
  );
  rightSign.position.set(4.6 + wingSpan / 2, wingClearance + wingHeight / 2, 1.92);
  group.add(rightSign);

  const rightBackSign = new THREE.Mesh(
    new THREE.PlaneGeometry(wingSpan - 0.4, wingHeight - 0.2),
    rightWingMat,
  );
  rightBackSign.rotation.y = Math.PI;
  rightBackSign.position.set(4.6 + wingSpan / 2, wingClearance + wingHeight / 2, -1.92);
  group.add(rightBackSign);

  for (const side of [-1, 1]) {
    const outerPier = new THREE.Mesh(
      new THREE.BoxGeometry(1.6, wingClearance + wingHeight, 3.8),
      silverCladMat,
    );
    outerPier.position.set(side * (4.6 + wingSpan), (wingClearance + wingHeight) / 2, 0);
    outerPier.castShadow = true;
    group.add(outerPier);

    const lightStrip = new THREE.Mesh(new THREE.BoxGeometry(wingSpan - 2, 0.12, 1.2), bulbMat);
    lightStrip.position.set(side * (4.6 + wingSpan / 2), wingClearance - 0.05, 0);
    group.add(lightStrip);

    // Warm ground light pool under both Gate 2 wing canopies
    const gate2Pool = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), lightPoolMat);
    gate2Pool.rotation.x = -Math.PI / 2;
    gate2Pool.position.set(bldg.position.x, 0.16, bldg.position.z - side * 9.5);
    nightLightGroup.add(gate2Pool);
  }

  const medianIsland = new THREE.Mesh(
    new THREE.BoxGeometry(11.2, 0.24, 9.5),
    new THREE.MeshStandardMaterial({ map: curbTex, color: 0xffffff, roughness: 0.65 }),
  );
  medianIsland.position.set(0, 0.12, 0);
  group.add(medianIsland);
}

/**
 * Reconstructs the Red-Roof Indoor Sports Hall (/assets/aistudio/main_gate_3f2674ed.jpg & Video 00:05–00:09):
 * - Warm beige panel walls articulated by white pilasters
 * - Row of white exterior AC split units along the facade
 * - Classical white triangular pediment portico on the West side
 * - Terracotta-red pitched hip roof
 */
function buildRedRoofGymHall(
  group: THREE.Group,
  bldg: CampusBuilding,
  creamMat: THREE.Material,
  windowMat: THREE.Material,
) {
  const { width, depth, height } = bldg.dimensions;
  const wallH = height * 0.68;
  const roofH = height * 0.32;

  const beigeWallMat = new THREE.MeshStandardMaterial({
    color: 0xf0e9dc,
    roughness: 0.75,
    metalness: 0.05,
  });
  const redRoofMat = new THREE.MeshStandardMaterial({
    color: 0x991b1b,
    roughness: 0.55,
    metalness: 0.25,
  });

  const body = new THREE.Mesh(new THREE.BoxGeometry(width, wallH, depth), beigeWallMat);
  body.position.y = wallH / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  for (let x = -width / 2 + 2; x <= width / 2 - 2; x += 5.5) {
    const p1 = new THREE.Mesh(new THREE.BoxGeometry(0.55, wallH + 0.2, depth + 0.3), creamMat);
    p1.position.set(x, wallH / 2, 0);
    group.add(p1);

    // Exterior white AC split units visible in video 00:05–00:08
    const acUnit = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.65, 0.45), creamMat);
    acUnit.position.set(x + 2.2, wallH - 1.6, -depth / 2 - 0.22);
    group.add(acUnit);
  }

  const roofGeo = new THREE.ConeGeometry(Math.hypot(width, depth) * 0.54, roofH, 4);
  const roofMesh = new THREE.Mesh(roofGeo, redRoofMat);
  roofMesh.rotation.y = Math.PI / 4;
  roofMesh.scale.set(width / Math.hypot(width, depth), 1, depth / Math.hypot(width, depth));
  roofMesh.scale.multiplyScalar(1.42);
  roofMesh.position.y = wallH + roofH / 2;
  roofMesh.castShadow = true;
  group.add(roofMesh);

  // Classical white pediment portico on the West facade facing the entry avenue (Video 00:06–00:08)
  const porticoBox = new THREE.Mesh(new THREE.BoxGeometry(2.6, wallH * 0.85, 8.4), creamMat);
  porticoBox.position.set(-width / 2 - 1.2, (wallH * 0.85) / 2, 0);
  const pediment = new THREE.Mesh(new THREE.ConeGeometry(5.2, 1.8, 4), creamMat);
  pediment.rotation.y = Math.PI / 4;
  pediment.scale.set(0.45, 1, 1.15);
  pediment.position.set(-width / 2 - 1.2, wallH * 0.85 + 0.9, 0);
  group.add(porticoBox, pediment);

  const clerestoryWin = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.75, 1.0, depth + 0.35),
    windowMat,
  );
  clerestoryWin.position.set(0, wallH - 1.1, 0);
  group.add(clerestoryWin);
}

/**
 * Reconstructs the Central Turf Football Playground (Video 00:04, 00:11–00:54):
 * - Irrigated emerald turf field with markings & white goalposts
 * - Clipped dark-green perimeter hedge (#14532D) along the boundary fence
 * - Blue-and-white spectator wall on the north/west side
 * - 6 High-Mast Floodlight Towers
 */
function buildFootballStadiumPitch(
  group: THREE.Group,
  bldg: CampusBuilding,
  pitchTex: THREE.Texture,
  bulbMat: THREE.Material,
  lightPoolMat: THREE.Material,
  nightLightGroup: THREE.Group,
) {
  const { width, depth } = bldg.dimensions;

  const apronMat = new THREE.MeshStandardMaterial({ color: 0x9a5b32, roughness: 0.88 });
  const apron = new THREE.Mesh(new THREE.BoxGeometry(width + 6, 0.1, depth + 6), apronMat);
  apron.position.y = 0.05;
  apron.receiveShadow = true;
  group.add(apron);

  const turfMat = new THREE.MeshStandardMaterial({
    map: pitchTex,
    color: 0xffffff,
    roughness: 0.8,
  });
  const turf = new THREE.Mesh(new THREE.BoxGeometry(width, 0.14, depth), turfMat);
  turf.position.y = 0.09;
  turf.receiveShadow = true;
  group.add(turf);

  // Special Ornamental Living Green Plants Barrier enclosing the Football Playground (replacing solid flat wall)
  const planterCurbMat = new THREE.MeshStandardMaterial({ color: 0xd6cfc2, roughness: 0.78 });
  const darkFenceMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.55, metalness: 0.65 });
  const deepFoliageMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.85 });
  const emeraldFoliageMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.82 });
  const brightFoliageMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.8 });
  const blossomAccentMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.7 });
  const gardenTurfMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.9 });

  // Stone planter curbs + inner perimeter security fence framing the pitch
  const nCurb = new THREE.Mesh(new THREE.BoxGeometry(width + 7.6, 0.42, 2.6), planterCurbMat);
  nCurb.position.set(0, 0.21, -depth / 2 - 3.2);
  const sCurb = new THREE.Mesh(new THREE.BoxGeometry(width + 7.6, 0.42, 2.2), planterCurbMat);
  sCurb.position.set(0, 0.21, depth / 2 + 3.0);
  const wCurb = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.42, depth + 7.6), planterCurbMat);
  wCurb.position.set(-width / 2 - 3.0, 0.21, 0);
  const eCurb = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.42, depth + 7.6), planterCurbMat);
  eCurb.position.set(width / 2 + 3.0, 0.21, 0);
  group.add(nCurb, sCurb, wCurb, eCurb);

  // Ornamental landscaped green plants plaza border strip along the North side separating Playground & Road/Buildings
  const northPlantBed = new THREE.Mesh(new THREE.BoxGeometry(width + 18, 0.14, 24), gardenTurfMat);
  northPlantBed.position.set(0, 0.07, -depth / 2 - 14.5);
  northPlantBed.receiveShadow = true;
  group.add(northPlantBed);

  // Ornamental stone walkway curb bordering the northern road sidewalk
  const outerPlantCurb = new THREE.Mesh(new THREE.BoxGeometry(width + 18.6, 0.36, 0.8), planterCurbMat);
  outerPlantCurb.position.set(0, 0.18, -depth / 2 - 26.2);
  group.add(outerPlantCurb);

  // Wire fence rails along North & South pitch borders
  for (const ry of [1.2, 2.4, 3.3]) {
    const nRail = new THREE.Mesh(new THREE.BoxGeometry(width + 6, 0.06, 0.06), darkFenceMat);
    nRail.position.set(0, ry, -depth / 2 - 1.9);
    const sRail = new THREE.Mesh(new THREE.BoxGeometry(width + 6, 0.06, 0.06), darkFenceMat);
    sRail.position.set(0, ry, depth / 2 + 1.9);
    group.add(nRail, sRail);
  }

  // Generate organic positions for sculpted living green shrubs, ornamental crowns & blossom accents
  const bushItems: Array<{ x: number; z: number; sx: number; sy: number; sz: number; rot: number }> = [];
  const accentItems: Array<{ x: number; z: number; y: number; scale: number }> = [];
  const northXSpan = width + 10;
  for (let px = -northXSpan / 2; px <= northXSpan / 2; px += 1.55) {
    const wave = Math.sin(px * 0.42);
    const wave2 = Math.cos(px * 0.28);
    // Dense layered ornamental shrub wall right along the pitch fence
    bushItems.push({ x: px, z: -depth / 2 - 3.2 + wave * 0.22, sx: 1.15, sy: 1.45 + (wave + 1) * 0.22, sz: 1.1, rot: px * 0.5 });
    bushItems.push({ x: px + 0.75, z: -depth / 2 - 5.2 - wave * 0.2, sx: 1.0, sy: 1.1 + (1 - wave) * 0.2, sz: 1.0, rot: px * 0.8 });
    // Mid-terrace sculpted green plants & red/pink bougainvillea accents
    bushItems.push({ x: px + 0.35, z: -depth / 2 - 11.8 + wave2 * 1.1, sx: 1.2, sy: 1.25 + (wave2 + 1) * 0.18, sz: 1.15, rot: px * 0.65 });
    // Boulevard-facing ornamental green hedge border separating garden from road
    bushItems.push({ x: px, z: -depth / 2 - 23.6 + wave * 0.28, sx: 1.1, sy: 1.05 + (wave2 + 1) * 0.15, sz: 1.05, rot: px * 0.9 });
    if (Math.abs(Math.round(px)) % 4 === 0) {
      accentItems.push({ x: px, z: -depth / 2 - 11.8 + wave2 * 1.1, y: 1.55, scale: 0.48 });
      accentItems.push({ x: px + 0.7, z: -depth / 2 - 23.6 + wave * 0.28, y: 1.25, scale: 0.38 });
    }
    // South border shrubs
    if (Math.abs(px) <= width / 2 + 2.5) {
      bushItems.push({ x: px, z: depth / 2 + 3.0 + wave * 0.15, sx: 0.95, sy: 1.05, sz: 0.95, rot: px * 0.3 });
    }
  }
  const sideZSpan = depth + 4;
  for (let pz = -sideZSpan / 2; pz <= sideZSpan / 2; pz += 1.8) {
    const wave = Math.cos(pz * 0.35);
    bushItems.push({ x: -width / 2 - 3.0 + wave * 0.15, z: pz, sx: 0.95, sy: 1.15, sz: 1.0, rot: pz * 0.4 });
    bushItems.push({ x: width / 2 + 3.0 - wave * 0.15, z: pz, sx: 0.95, sy: 1.1, sz: 1.0, rot: pz * 0.6 });
  }

  const shrubBaseGeo = new THREE.DodecahedronGeometry(0.92, 1);
  const shrubTopGeo = new THREE.IcosahedronGeometry(0.68, 0);
  const shrubTipGeo = new THREE.ConeGeometry(0.45, 0.95, 6);
  const blossomGeo = new THREE.DodecahedronGeometry(0.45, 0);

  const baseInst = new THREE.InstancedMesh(shrubBaseGeo, deepFoliageMat, bushItems.length);
  const topInst = new THREE.InstancedMesh(shrubTopGeo, emeraldFoliageMat, bushItems.length);
  const tipInst = new THREE.InstancedMesh(shrubTipGeo, brightFoliageMat, bushItems.length);
  baseInst.castShadow = true;
  baseInst.receiveShadow = true;
  topInst.castShadow = true;

  const dummy = new THREE.Object3D();
  bushItems.forEach((b, idx) => {
    dummy.position.set(b.x, 0.85 * b.sy, b.z);
    dummy.rotation.set(0, b.rot, 0);
    dummy.scale.set(b.sx, b.sy, b.sz);
    dummy.updateMatrix();
    baseInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(b.x + 0.12, 1.42 * b.sy, b.z - 0.1);
    dummy.rotation.set(0.15, b.rot + 0.8, 0);
    dummy.scale.set(b.sx * 0.9, b.sy * 0.85, b.sz * 0.9);
    dummy.updateMatrix();
    topInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(b.x - 0.08, 1.85 * b.sy, b.z + 0.08);
    dummy.rotation.set(0, b.rot * 1.3, 0);
    dummy.scale.set(b.sx * 0.85, b.sy * 0.95, b.sz * 0.85);
    dummy.updateMatrix();
    tipInst.setMatrixAt(idx, dummy.matrix);
  });
  group.add(baseInst, topInst, tipInst);

  if (accentItems.length > 0) {
    const accentInst = new THREE.InstancedMesh(blossomGeo, blossomAccentMat, accentItems.length);
    accentItems.forEach((a, idx) => {
      dummy.position.set(a.x, a.y, a.z);
      dummy.rotation.set(0, a.x, 0);
      dummy.scale.setScalar(a.scale);
      dummy.updateMatrix();
      accentInst.setMatrixAt(idx, dummy.matrix);
    });
    group.add(accentInst);
  }

  // Blue-and-white spectator wall / low bleachers along the side (video 00:04 & 00:53)
  const whiteWall = new THREE.Mesh(
    new THREE.BoxGeometry(2.2, 2.2, 32),
    new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 }),
  );
  whiteWall.position.set(width / 2 + 1.4, 1.1, -12);
  const blueStripe = new THREE.Mesh(
    new THREE.BoxGeometry(2.3, 0.7, 32.2),
    new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4 }),
  );
  blueStripe.position.set(width / 2 + 1.4, 1.8, -12);
  group.add(whiteWall, blueStripe);

  // Goalposts
  const postMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.3,
    metalness: 0.6,
  });
  for (const endZ of [-depth / 2 + 3, depth / 2 - 3]) {
    const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 7.3, 8), postMat);
    crossbar.rotation.z = Math.PI / 2;
    crossbar.position.set(0, 2.44, endZ);
    const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.44, 8), postMat);
    leftPost.position.set(-3.65, 1.22, endZ);
    const rightPost = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.44, 8), postMat);
    rightPost.position.set(3.65, 1.22, endZ);
    group.add(crossbar, leftPost, rightPost);
  }

  // 6 High-Mast Stadium Floodlight Towers + Night Floodlight Ground Pools
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.4,
    metalness: 0.7,
  });
  for (const sideX of [-width / 2 - 3.5, width / 2 + 3.5]) {
    for (const mz of [-depth / 2 + 8, 0, depth / 2 - 8]) {
      const mastPole = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.42, 22, 10), poleMat);
      mastPole.position.set(sideX, 11, mz);
      mastPole.castShadow = true;
      group.add(mastPole);

      const headRack = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.8, 3.6), bulbMat);
      headRack.position.set(sideX, 22.2, mz);
      group.add(headRack);

      const mastHalo = new THREE.Mesh(new THREE.PlaneGeometry(7.5, 7.5), lightPoolMat);
      mastHalo.rotation.x = -Math.PI / 2;
      mastHalo.position.set(bldg.position.x + sideX, 21.8, bldg.position.z + mz);
      nightLightGroup.add(mastHalo);

      const pitchPool = new THREE.Mesh(new THREE.PlaneGeometry(36, 36), lightPoolMat);
      pitchPool.rotation.x = -Math.PI / 2;
      pitchPool.position.set(bldg.position.x + sideX * 0.42, 0.19, bldg.position.z + mz);
      nightLightGroup.add(pitchPool);
    }
  }
}

/**
 * Reconstructs the 3 Multi-Sport Courts + Twin Flagpoles + Black Digital Totem Sign (Video 00:04–00:12)
 */
function buildMultiSportCourts(
  group: THREE.Group,
  bldg: CampusBuilding,
  bulbMat: THREE.Material,
  lightPoolMat: THREE.Material,
  nightLightGroup: THREE.Group,
) {
  const { width, depth } = bldg.dimensions;
  const redCourtMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.75 });
  const greenCourtMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 });
  const whiteLineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });

  const pad = new THREE.Mesh(new THREE.BoxGeometry(width, 0.12, depth), redCourtMat);
  pad.position.y = 0.06;
  pad.receiveShadow = true;
  group.add(pad);

  const courtSpacing = depth / 3;
  for (let i = 0; i < 3; i++) {
    const cz = -depth / 2 + courtSpacing * (i + 0.5);
    const innerCourt = new THREE.Mesh(
      new THREE.BoxGeometry(width - 5, 0.15, courtSpacing - 4),
      i === 1 ? redCourtMat : greenCourtMat,
    );
    innerCourt.position.set(0, 0.08, cz);
    group.add(innerCourt);

    const borderLine = new THREE.Mesh(
      new THREE.RingGeometry((courtSpacing - 6) * 0.42, (courtSpacing - 6) * 0.45, 4),
      whiteLineMat,
    );
    borderLine.rotation.x = -Math.PI / 2;
    borderLine.rotation.z = Math.PI / 4;
    borderLine.position.set(0, 0.17, cz);
    group.add(borderLine);

    // Court Floodlight Poles & Night Court Light Pools
    const courtPool = new THREE.Mesh(new THREE.PlaneGeometry(22, 22), lightPoolMat);
    courtPool.rotation.x = -Math.PI / 2;
    courtPool.position.set(bldg.position.x, 0.2, bldg.position.z + cz);
    nightLightGroup.add(courtPool);
  }

  const lightPoleMat = new THREE.MeshStandardMaterial({
    color: 0x475569,
    roughness: 0.4,
    metalness: 0.7,
  });
  for (const cz of [-depth / 3, depth / 3]) {
    for (const sx of [-width / 2 - 1.2, width / 2 + 1.2]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 11, 8), lightPoleMat);
      pole.position.set(sx, 5.5, cz);
      const fixture = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.45, 1.4), bulbMat);
      fixture.position.set(sx, 11.1, cz);
      group.add(pole, fixture);
    }
  }

  // Twin Campus Flagpoles (Saudi Flag & University Flag) + Black Digital Totem (Video 00:04–00:12)
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.3,
    metalness: 0.6,
  });
  for (const [idx, fz] of [-depth / 2 - 4, -depth / 2 + 2].entries()) {
    const flagpole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.16, 15, 10), poleMat);
    flagpole.position.set(-width / 2 - 3.5, 7.5, fz);
    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 1.8, 3.0),
      new THREE.MeshStandardMaterial({
        color: idx === 0 ? 0x15803d : 0x1d4ed8,
        roughness: 0.6,
      }),
    );
    flag.position.set(-width / 2 - 3.5, 13.8, fz + 1.5);
    group.add(flagpole, flag);
  }

  // Matte-black vertical digital sign totem next to the flagpoles (Video 00:05)
  const totem = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 4.2, 1.6),
    new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.5 }),
  );
  totem.position.set(-width / 2 - 4.2, 2.1, -depth / 2 - 1);
  group.add(totem);
}

/**
 * Reconstructs the 8 Aligned Numbered Buildings (Buildings 11, 10, 9, 8, 7, 6, 5, 4)
 * along the Eastern Boulevard (إدارة جامعة بيشة — Video 01:08–01:27):
 * - 8 modular 2-story warm-tan buildings
 * - Projecting corner stair tower on each building bearing its blue numeral ("11" down to "4")
 * - Black base plinth, horizontal multi-pane windows, ramped entrance, and concrete bollards
 * - Northern curved white carports at the T-junction (Video 01:08–01:13)
 */
function buildAdminNumberedRow(
  group: THREE.Group,
  bldg: CampusBuilding,
  maxAnisotropy: number,
  windowMat: THREE.Material,
  sidewalkMat: THREE.Material,
  nightEmissiveMaterials: THREE.MeshStandardMaterial[],
) {
  const { width, depth, height } = bldg.dimensions;
  const buildingNumbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
  const numBlocks = buildingNumbers.length;
  const slotDepth = depth / numBlocks;
  const blockDepth = slotDepth - 4.2;

  const tanWallMat = new THREE.MeshStandardMaterial({
    color: 0xdfc8ae,
    roughness: 0.74,
    metalness: 0.05,
  });
  const blackPlinthMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.55 });
  const rampMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
  const bollardMat = new THREE.MeshStandardMaterial({ color: 0xd6cfc2, roughness: 0.7 });

  for (let i = 0; i < numBlocks; i++) {
    const bz = -depth / 2 + slotDepth * (i + 0.5);
    const numLabel = buildingNumbers[i];

    // Main 2-story warm-tan block
    const block = new THREE.Mesh(
      new THREE.BoxGeometry(width - 2, height, blockDepth),
      tanWallMat,
    );
    block.position.set(1, height / 2, bz);
    block.castShadow = true;
    block.receiveShadow = true;
    group.add(block);

    // Black base plinth (Video 01:18–01:26)
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(width - 1.6, 0.8, blockDepth + 0.3),
      blackPlinthMat,
    );
    plinth.position.set(1, 0.4, bz);
    group.add(plinth);

    // Projecting northwest corner stair tower with Blue Building Number (11, 10, 9...)
    const towerH = height + 2.2;
    const towerZ = bz - blockDepth / 2 + 2.8;
    const tower = new THREE.Mesh(new THREE.BoxGeometry(6.2, towerH, 5.8), tanWallMat);
    tower.position.set(-width / 2 + 3.1, towerH / 2, towerZ);
    tower.castShadow = true;
    group.add(tower);

    const numTex = createBuildingNumberTexture(numLabel, '#DFC8AE', '#1D4ED8', maxAnisotropy);
    const numMat = new THREE.MeshStandardMaterial({
      map: numTex,
      roughness: 0.45,
      emissive: new THREE.Color(0xffdfa0),
      emissiveMap: numTex,
      emissiveIntensity: 0.0,
    });
    nightEmissiveMaterials.push(numMat);
    const westNumPlane = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), numMat);
    westNumPlane.rotation.y = -Math.PI / 2;
    westNumPlane.position.set(-width / 2 - 0.05, towerH - 1.9, towerZ);
    const northNumPlane = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 2.8), numMat);
    northNumPlane.rotation.y = Math.PI;
    northNumPlane.position.set(-width / 2 + 3.1, towerH - 1.9, towerZ - 2.95);
    group.add(westNumPlane, northNumPlane);

    // Vertical stairwell window & ramped entrance at the corner tower (Video 01:16–01:26)
    const stairWin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.8, 1.2), windowMat);
    stairWin.position.set(-width / 2 - 0.02, 5.8, towerZ + 1.2);
    group.add(stairWin);

    const rampLanding = new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.45, 5.2), rampMat);
    rampLanding.position.set(-width / 2 - 1.2, 0.225, towerZ + 1.5);
    group.add(rampLanding);

    // Horizontal multi-pane window bands on Floors 1 and 2
    for (const wy of [2.8, 6.8]) {
      const winBand = new THREE.Mesh(
        new THREE.BoxGeometry(width - 1.7, 1.3, blockDepth - 6),
        windowMat,
      );
      winBand.position.set(1, wy, bz + 1.8);
      group.add(winBand);
    }

    // Concrete security bollards along the western sidewalk in front of each building (Video 01:18–01:26)
    for (let b = -2; b <= 2; b++) {
      const bollard = new THREE.Mesh(
        new THREE.CylinderGeometry(0.18, 0.2, 0.85, 8),
        bollardMat,
      );
      bollard.position.set(-width / 2 - 3.6, 0.425, bz + b * 3.4);
      group.add(bollard);
    }
  }

  // Continuous checkerboard sidewalk along the front (West) of Buildings 11–4
  const frontWalk = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.14, depth), sidewalkMat);
  frontWalk.position.set(-width / 2 - 2.1, 0.07, 0);
  frontWalk.receiveShadow = true;
  group.add(frontWalk);

  // Curved White Cantilevered Carport Canopy at the Northern T-Junction (Video 01:08–01:13)
  const whiteShadeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.45 });
  const carportRoof = new THREE.Mesh(
    new THREE.BoxGeometry(22, 0.25, 5.5),
    whiteShadeMat,
  );
  carportRoof.position.set(-10, 3.3, -depth / 2 - 8);
  carportRoof.rotation.x = 0.14;
  group.add(carportRoof);
}

/**
 * Reconstructs the South-West Academic Complex & Dome Skylight Courtyard Wings
 */
function buildWesternAcademicWings(
  group: THREE.Group,
  bldg: CampusBuilding,
  creamMat: THREE.Material,
  tanMat: THREE.Material,
  windowMat: THREE.Material,
) {
  const { width, depth, height } = bldg.dimensions;

  const spine = new THREE.Mesh(new THREE.BoxGeometry(16, height, depth), creamMat);
  spine.position.set(width / 2 - 8, height / 2, 0);
  spine.castShadow = true;
  spine.receiveShadow = true;
  group.add(spine);

  const wingZOffsets = [-depth * 0.36, -depth * 0.12, depth * 0.14, depth * 0.38];
  for (const wz of wingZOffsets) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(width - 14, height - 1.0, 11), creamMat);
    bar.position.set(-7, (height - 1.0) / 2, wz);
    bar.castShadow = true;
    bar.receiveShadow = true;
    group.add(bar);

    const winStrip = new THREE.Mesh(
      new THREE.BoxGeometry(width - 16, height - 3.5, 11.2),
      windowMat,
    );
    winStrip.position.set(-7, (height - 1.0) / 2, wz);
    group.add(winStrip);
  }

  const atriumKerb = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.55, 4.5, depth * 0.32),
    tanMat,
  );
  atriumKerb.position.set(-width * 0.18, 2.25, 0);
  group.add(atriumKerb);

  for (let gx = -2; gx <= 1; gx++) {
    for (let gz = -1; gz <= 1; gz++) {
      const skylightCurb = new THREE.Mesh(
        new THREE.BoxGeometry(3.6, 0.6, 3.6),
        tanMat,
      );
      skylightCurb.position.set(-width * 0.18 + gx * 5.2, 4.6, gz * 5.5);
      group.add(skylightCurb);
    }
  }
}

/**
 * Reconstructs the Tiered Spectator Grandstand (place for setting people watching football)
 * Specified along the touchline of the Football Ground in specifying_everything__47ad10c3.png:
 * - Precast concrete tiered steps
 * - Contoured royal blue and white spectator seating rows
 * - Cantilevered tensile sun-shade canopy
 * - High-mast match floodlights & commentary booth
 */
function buildFootballGrandstand(
  group: THREE.Group,
  bldg: CampusBuilding,
  bulbMat: THREE.Material,
  lightPoolMat: THREE.Material,
  nightLightGroup: THREE.Group,
) {
  const { width, depth, height } = bldg.dimensions;
  const concreteMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
  const blueSeatMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.5 });
  const whiteSeatMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.5 });
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.1 });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.8 });

  // Base platform
  const basePlinth = new THREE.Mesh(new THREE.BoxGeometry(width, 0.5, depth), concreteMat);
  basePlinth.position.y = 0.25;
  basePlinth.receiveShadow = true;
  group.add(basePlinth);

  // Stepped tiers (7 tiered rows along the length of the touchline)
  const numTiers = 7;
  const tierWidth = (width - 2.5) / numTiers;
  const tierRise = (height * 0.65) / numTiers;

  for (let t = 0; t < numTiers; t++) {
    const tx = -width / 2 + 1.2 + t * tierWidth + tierWidth / 2;
    const ty = 0.5 + (t + 1) * tierRise;
    const tierStep = new THREE.Mesh(
      new THREE.BoxGeometry(tierWidth + 0.1, ty, depth - 4),
      concreteMat,
    );
    tierStep.position.set(tx, ty / 2, 0);
    tierStep.castShadow = true;
    tierStep.receiveShadow = true;
    group.add(tierStep);

    // Contoured Stadium Seats along each tier
    const seatRows = Math.floor((depth - 8) / 1.6);
    const seatMat = t % 2 === 0 ? blueSeatMat : whiteSeatMat;
    for (let s = 0; s < seatRows; s++) {
      const sz = -(depth - 8) / 2 + s * 1.6 + 0.8;
      const seat = new THREE.Mesh(new THREE.BoxGeometry(tierWidth * 0.7, 0.45, 1.1), seatMat);
      seat.position.set(tx, ty + 0.22, sz);
      group.add(seat);
    }
  }

  // Elevated Cantilevered Shade Canopy Roof
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(width + 2, 0.35, depth), canopyMat);
  canopy.position.set(0, height + 0.6, 0);
  canopy.rotation.z = -0.06;
  canopy.castShadow = true;
  group.add(canopy);

  // Structural Cantilever Steel Pylons along the back (east side)
  const numPylons = Math.floor(depth / 16);
  for (let p = 0; p <= numPylons; p++) {
    const pz = -depth / 2 + (depth / numPylons) * p;
    const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.35, height + 1.2, 12), steelMat);
    pylon.position.set(width / 2 - 0.5, (height + 1.2) / 2, pz);
    pylon.castShadow = true;
    group.add(pylon);

    // Cantilever arm out over the seats
    const arm = new THREE.Mesh(new THREE.BoxGeometry(width + 1.5, 0.3, 0.3), steelMat);
    arm.position.set(0, height + 0.4, pz);
    group.add(arm);
  }

  // Press / Commentary Box in the center top tier
  const pressBox = new THREE.Mesh(
    new THREE.BoxGeometry(4.2, 2.6, 12),
    new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.3, metalness: 0.6 }),
  );
  pressBox.position.set(width / 2 - 2.5, height - 0.2, 0);
  group.add(pressBox);

  // Night Floodlights integrated into the canopy rim
  for (const fz of [-depth * 0.35, 0, depth * 0.35]) {
    const floodFixture = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.3, 1.6), bulbMat);
    floodFixture.position.set(-width / 2, height + 0.3, fz);
    group.add(floodFixture);

    const standPool = new THREE.Mesh(new THREE.PlaneGeometry(28, 28), lightPoolMat);
    standPool.rotation.x = -Math.PI / 2;
    standPool.position.set(bldg.position.x, 0.22, bldg.position.z + fz);
    nightLightGroup.add(standPool);
  }
}

/**
 * Reconstructs the University Central Library Main Hall (Library of the university)
 * Designated in specifying_everything__47ad10c3.png:
 * - Authentic Saudi university flat roof with stepped parapets and central clerestory skylight atrium
 * - NO GREEN DOME (removed in compliance with ground truth and real campus architecture)
 * - Symmetrical 3-story reading wings with tall arched library windows
 * - Ceremonial entrance portico with bronze bilingual signage
 * - Terraced entrance steps and accessible switchback ramp
 */
function buildUniversityLibrary(
  group: THREE.Group,
  bldg: CampusBuilding,
  maxAnisotropy: number,
  creamMat: THREE.Material,
  tanMat: THREE.Material,
  windowMat: THREE.Material,
  sidewalkMat: THREE.Material,
  lightPoolMat: THREE.Material,
  nightLightGroup: THREE.Group,
  nightEmissiveMaterials: THREE.MeshStandardMaterial[],
) {
  const { width, depth, height } = bldg.dimensions;

  const limestoneMat = new THREE.MeshStandardMaterial({
    color: 0xf2ede2,
    roughness: 0.72,
    metalness: 0.05,
  });
  const plinthDarkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
  const copingDarkMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6 });
  const hvacMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.45 });

  // 1. Broad paved entrance apron & dark stone base plinth
  const baseApron = new THREE.Mesh(new THREE.BoxGeometry(width + 8, 0.5, depth + 8), sidewalkMat);
  baseApron.position.y = 0.25;
  baseApron.receiveShadow = true;
  group.add(baseApron);

  const wallPlinth = new THREE.Mesh(
    new THREE.BoxGeometry(width + 0.6, 1.1, depth + 0.6),
    plinthDarkMat,
  );
  wallPlinth.position.y = 0.55;
  group.add(wallPlinth);

  // 2. Monumental 5-story rectilinear main building mass spanning behind the football ground
  const mainMass = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), limestoneMat);
  mainMass.position.set(0, height / 2, 0);
  mainMass.castShadow = true;
  mainMass.receiveShadow = true;
  group.add(mainMass);

  // Clean flat roof deck + stepped perimeter parapet coping borders (zero slab-on-slab z-fighting)
  const roofDeckMat = new THREE.MeshStandardMaterial({ color: 0xe6dfd4, roughness: 0.85 });
  const roofDeck = new THREE.Mesh(new THREE.BoxGeometry(width - 2.4, 0.22, depth - 2.4), roofDeckMat);
  roofDeck.position.set(0, height + 0.11, 0);
  roofDeck.receiveShadow = true;
  group.add(roofDeck);

  for (const sz of [-1, 1]) {
    const parapetWall = new THREE.Mesh(
      new THREE.BoxGeometry(width + 1.0, 1.3, 1.4),
      limestoneMat,
    );
    parapetWall.position.set(0, height + 0.65, sz * (depth / 2 - 0.2));
    const parapetCap = new THREE.Mesh(
      new THREE.BoxGeometry(width + 1.5, 0.28, 1.8),
      copingDarkMat,
    );
    parapetCap.position.set(0, height + 1.42, sz * (depth / 2 - 0.2));
    group.add(parapetWall, parapetCap);
  }
  for (const sx of [-1, 1]) {
    const parapetWall = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 1.3, depth + 1.0),
      limestoneMat,
    );
    parapetWall.position.set(sx * (width / 2 - 0.2), height + 0.65, 0);
    const parapetCap = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.28, depth + 1.5),
      copingDarkMat,
    );
    parapetCap.position.set(sx * (width / 2 - 0.2), height + 1.42, 0);
    group.add(parapetWall, parapetCap);
  }

  // Rectilinear rooftop service penthouse & HVAC units (standard flat roof)
  const roofPenthouse = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.42, 2.4, depth * 0.34),
    limestoneMat,
  );
  roofPenthouse.position.set(0, height + 1.42, 0);
  roofPenthouse.castShadow = true;
  const penthouseCap = new THREE.Mesh(
    new THREE.BoxGeometry(width * 0.42 + 0.7, 0.35, depth * 0.34 + 0.7),
    copingDarkMat,
  );
  penthouseCap.position.set(0, height + 2.78, 0);
  group.add(roofPenthouse, penthouseCap);

  for (const hx of [-width * 0.34, width * 0.34]) {
    for (const hz of [-depth * 0.22, depth * 0.22]) {
      const hvac = new THREE.Mesh(new THREE.BoxGeometry(6.5, 1.7, 5.2), hvacMat);
      hvac.position.set(hx, height + 0.85, hz);
      group.add(hvac);
    }
  }

  // 3. Rhythmic architectural pilasters & 5-story window bands around all 4 facades
  for (let px = -width / 2 + 5; px <= width / 2 - 5; px += 11) {
    for (const sz of [-1, 1]) {
      if (sz === -1 && Math.abs(px) < 19.5) continue; // Keep North wall logo bay unobstructed
      const pilaster = new THREE.Mesh(new THREE.BoxGeometry(1.15, height + 1.1, 0.85), tanMat);
      pilaster.position.set(px, (height + 1.1) / 2, (sz * depth) / 2 + sz * 0.3);
      group.add(pilaster);
    }
  }
  for (let pz = -depth / 2 + 5; pz <= depth / 2 - 5; pz += 11) {
    for (const sx of [-1, 1]) {
      if (sx === 1 && Math.abs(pz) < 15.0) continue; // Keep East wall logo bay unobstructed
      const pilaster = new THREE.Mesh(new THREE.BoxGeometry(0.85, height + 1.1, 1.15), tanMat);
      pilaster.position.set((sx * width) / 2 + sx * 0.3, (height + 1.1) / 2, pz);
      group.add(pilaster);
    }
  }

  // Multi-floor window bays across all 5 stories (y = 3.2 .. 19.6)
  const floorLevels = [3.2, 7.2, 11.4, 15.5, 19.5];
  const northWingW = width / 2 - 26;
  const eastWingD = depth / 2 - 18;
  const southWingW = width / 2 - 20;

  for (const wy of floorLevels) {
    // West facade (-X): continuous 5-floor ribbon windows
    const westWin = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.05, depth - 10), windowMat);
    westWin.position.set(-width / 2 - 0.08, wy, 0);
    group.add(westWin);

    // East facade (+X): lower 2 floors continuous, upper 3 floors flanking the East Logo
    if (wy > 9) {
      for (const sz of [-1, 1]) {
        const eastSideWin = new THREE.Mesh(
          new THREE.BoxGeometry(0.3, 2.05, eastWingD),
          windowMat,
        );
        eastSideWin.position.set(width / 2 + 0.08, wy, sz * (16 + eastWingD / 2));
        group.add(eastSideWin);
      }
    } else {
      const eastWin = new THREE.Mesh(new THREE.BoxGeometry(0.3, 2.05, depth - 10), windowMat);
      eastWin.position.set(width / 2 + 0.08, wy, 0);
      group.add(eastWin);
    }

    // North facade (-Z, facing Football Ground): lower 2 floors continuous, upper 3 floors frame the giant central Logo
    if (wy > 9) {
      for (const sx of [-1, 1]) {
        const nSideWin = new THREE.Mesh(new THREE.BoxGeometry(northWingW, 2.05, 0.3), windowMat);
        nSideWin.position.set(sx * (22 + northWingW / 2), wy, -depth / 2 - 0.08);
        group.add(nSideWin);
      }
    } else {
      const northWin = new THREE.Mesh(new THREE.BoxGeometry(width - 12, 2.05, 0.3), windowMat);
      northWin.position.set(0, wy, -depth / 2 - 0.08);
      group.add(northWin);
    }

    // South facade (+Z): twin expansive reading hall wings flanking the central portico
    for (const sx of [-1, 1]) {
      const sWin = new THREE.Mesh(new THREE.BoxGeometry(southWingW, 2.05, 0.3), windowMat);
      sWin.position.set(sx * (15 + southWingW / 2), wy, depth / 2 + 0.08);
      group.add(sWin);
    }
  }

  // 4. University of Bisha Illuminated Wall Logo facing the Football Ground (normal by day, glowing at night)
  const wallLogoTex = createCrestAndSignageTexture({
    variant: 'university_wall_logo',
    maxAnisotropy,
  });
  const wallLogoMat = new THREE.MeshStandardMaterial({
    map: wallLogoTex,
    roughness: 0.42,
    metalness: 0.12,
    emissive: new THREE.Color(0xfff4d4),
    emissiveMap: wallLogoTex,
    emissiveIntensity: 0.0,
  });
  nightEmissiveMaterials.push(wallLogoMat);

  // Monumental North wall emblem (32m x 12m, 2.67:1 aspect) directly facing the Football Ground
  const logoFrameNorth = new THREE.Mesh(new THREE.BoxGeometry(33.4, 13.0, 0.5), plinthDarkMat);
  logoFrameNorth.position.set(0, height - 6.6, -depth / 2 - 0.25);
  const logoFaceNorth = new THREE.Mesh(new THREE.PlaneGeometry(32.0, 12.0), wallLogoMat);
  logoFaceNorth.rotation.y = Math.PI;
  logoFaceNorth.position.set(0, height - 6.6, -depth / 2 - 0.54);
  group.add(logoFrameNorth, logoFaceNorth);

  // Matching University Logo mounted on the East wall facing the Central Spine Road
  const logoFrameEast = new THREE.Mesh(new THREE.BoxGeometry(0.5, 9.8, 25.2), plinthDarkMat);
  logoFrameEast.position.set(width / 2 + 0.25, height - 6.2, 0);
  const logoFaceEast = new THREE.Mesh(new THREE.PlaneGeometry(24.0, 9.0), wallLogoMat);
  logoFaceEast.rotation.y = Math.PI / 2;
  logoFaceEast.position.set(width / 2 + 0.54, height - 6.2, 0);
  group.add(logoFrameEast, logoFaceEast);

  // 5. Grand Front Entrance Portico & Portal on South Wall
  const porticoW = 24;
  const porticoH = 11.5;
  const portico = new THREE.Mesh(new THREE.BoxGeometry(porticoW, porticoH, 5.0), creamMat);
  portico.position.set(0, porticoH / 2, depth / 2 + 2.3);
  portico.castShadow = true;
  const porticoTrim = new THREE.Mesh(new THREE.BoxGeometry(porticoW + 0.8, 0.65, 5.5), tanMat);
  porticoTrim.position.set(0, porticoH + 0.3, depth / 2 + 2.3);
  group.add(portico, porticoTrim);

  // Dark-glass library doors
  const doors = new THREE.Mesh(new THREE.BoxGeometry(9.0, 4.8, 0.3), windowMat);
  doors.position.set(0, 2.4, depth / 2 + 4.9);
  group.add(doors);

  // Bronze Signage Plaque: "مكتبة جامعة بيشة المركزية — University Central Library"
  const plaqueCanvas = document.createElement('canvas');
  plaqueCanvas.width = 1024;
  plaqueCanvas.height = 256;
  const pctx = plaqueCanvas.getContext('2d')!;
  pctx.fillStyle = '#1C1917';
  pctx.fillRect(0, 0, 1024, 256);
  pctx.strokeStyle = '#D97706';
  pctx.lineWidth = 10;
  pctx.strokeRect(12, 12, 1000, 232);
  pctx.fillStyle = '#F59E0B';
  pctx.font = 'bold 56px "Outfit", sans-serif';
  pctx.textAlign = 'center';
  pctx.fillText('مكتبة جامعة بيشة المركزية', 512, 95);
  pctx.font = 'bold 36px "Outfit", sans-serif';
  pctx.fillText('University of Bisha Central Library', 512, 175);
  const plaqueTex = new THREE.CanvasTexture(plaqueCanvas);
  plaqueTex.anisotropy = maxAnisotropy;

  const signMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(11.6, 2.9),
    new THREE.MeshStandardMaterial({
      map: plaqueTex,
      roughness: 0.35,
      metalness: 0.4,
      emissive: new THREE.Color(0xffdfa0),
      emissiveMap: plaqueTex,
      emissiveIntensity: 0.0,
    }),
  );
  signMesh.position.set(0, porticoH - 2.0, depth / 2 + 4.92);
  nightEmissiveMaterials.push(signMesh.material as THREE.MeshStandardMaterial);
  group.add(signMesh);

  // Accessible Entrance Ramp and Steps
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(6.0, 0.4, 12), sidewalkMat);
  ramp.position.set(porticoW / 2 + 3.8, 0.2, depth / 2 + 6);
  ramp.rotation.x = 0.04;
  group.add(ramp);

  // Night Illumination Light Pools along the North Logo Promenade & South Plaza
  for (const lx of [-54, 0, 54]) {
    const northPool = new THREE.Mesh(new THREE.PlaneGeometry(46, 28), lightPoolMat);
    northPool.rotation.x = -Math.PI / 2;
    northPool.position.set(bldg.position.x + lx, 0.24, bldg.position.z - depth / 2 - 11);
    nightLightGroup.add(northPool);
  }
  const southPool = new THREE.Mesh(new THREE.PlaneGeometry(52, 36), lightPoolMat);
  southPool.rotation.x = -Math.PI / 2;
  southPool.position.set(bldg.position.x, 0.24, bldg.position.z + depth / 2 + 10);
  nightLightGroup.add(southPool);
}

/**
 * Reconstructs the University Central Library Research & Deanship Wing (Library of the university)
 * Designated in specifying_everything__47ad10c3.png:
 * - Second southern block of the library complex
 * - 2-story sandstone ashlar facade with rhythmic arched archive windows
 * - Covered shaded connecting gallery colonnade linking it to the Main Reading Hall
 */
function buildLibraryAnnex(
  group: THREE.Group,
  bldg: CampusBuilding,
  creamMat: THREE.Material,
  tanMat: THREE.Material,
  windowMat: THREE.Material,
  sidewalkMat: THREE.Material,
) {
  const { width, depth, height } = bldg.dimensions;
  const sandstoneMat = new THREE.MeshStandardMaterial({
    color: 0xf0ebe1,
    roughness: 0.72,
    metalness: 0.05,
  });

  // Base plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(width + 4, 0.4, depth + 4), sidewalkMat);
  plinth.position.y = 0.2;
  plinth.receiveShadow = true;
  group.add(plinth);

  // Main 2-story building mass
  const body = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), sandstoneMat);
  body.position.y = height / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  group.add(body);

  // Decorative stepped roof parapet
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(width + 0.8, 1.0, depth + 0.8), tanMat);
  parapet.position.set(0, height + 0.5, 0);
  group.add(parapet);

  // Arched archive windows along East/West and South wings
  const numBays = Math.floor(depth / 8);
  for (let b = 0; b < numBays; b++) {
    const bz = -depth / 2 + (depth / numBays) * (b + 0.5);
    for (const sx of [-1, 1]) {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.3, height * 0.65, 3.8), windowMat);
      win.position.set((sx * width) / 2 + (sx > 0 ? 0.08 : -0.08), height / 2, bz);
      group.add(win);
    }
  }
  const southBays = Math.max(4, Math.floor(width / 14));
  for (let b = 0; b < southBays; b++) {
    const bx = -width / 2 + (width / southBays) * (b + 0.5);
    const winS = new THREE.Mesh(new THREE.BoxGeometry(6.5, height * 0.62, 0.3), windowMat);
    winS.position.set(bx, height / 2, depth / 2 + 0.08);
    group.add(winS);
  }

  // Connecting Covered Glazed Colonnade to Main Library Hall to the North (z: 196..213)
  const colonnadeW = 14.0;
  const colonnadeH = 5.2;
  const colonnadeD = 17.5;
  const colonnadeRoof = new THREE.Mesh(new THREE.BoxGeometry(colonnadeW, 0.4, colonnadeD), tanMat);
  colonnadeRoof.position.set(0, colonnadeH, -depth / 2 - colonnadeD / 2);
  group.add(colonnadeRoof);

  const colonnadeGlass = new THREE.Mesh(
    new THREE.BoxGeometry(colonnadeW - 0.5, colonnadeH - 0.5, colonnadeD),
    windowMat,
  );
  colonnadeGlass.position.set(0, colonnadeH / 2, -depth / 2 - colonnadeD / 2);
  group.add(colonnadeGlass);
}

/**
 * Reconstructs an Individual Administration Building (Buildings 1 to 11)
 * Specified as "buildings 1 2 3 4 5 6 7 8 9 10 11" along the Eastern Boulevard in specifying_everything__47ad10c3.png:
 * - Distinct 2-story warm-tan building
 * - Projecting northwest corner stair tower bearing the blue numeral ("1" to "11") on both west and north faces
 * - Black base plinth, horizontal multi-pane window bands, vertical stairwell window, ramped entrance, bollards, and sidewalk
 */
function buildSingleAdminBuilding(
  group: THREE.Group,
  bldg: CampusBuilding,
  maxAnisotropy: number,
  windowMat: THREE.Material,
  sidewalkMat: THREE.Material,
  nightEmissiveMaterials: THREE.MeshStandardMaterial[],
) {
  const { width, depth, height } = bldg.dimensions;
  const numLabel = bldg.buildingNumber || bldg.id.replace('bldg-', '');

  const tanWallMat = new THREE.MeshStandardMaterial({
    color: 0xf2ede2,
    roughness: 0.74,
    metalness: 0.05,
  });
  const blackPlinthMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.55 });
  const rampMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.8 });
  const bollardMat = new THREE.MeshStandardMaterial({ color: 0xd6cfc2, roughness: 0.7 });

  // Main 2-story warm-ivory limestone block
  const block = new THREE.Mesh(new THREE.BoxGeometry(width - 2, height, depth), tanWallMat);
  block.position.set(1, height / 2, 0);
  block.castShadow = true;
  block.receiveShadow = true;
  group.add(block);

  // Parapet with contrasting sandstone coping cap
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(width - 1.6, 0.7, depth + 0.4), tanWallMat);
  parapet.position.set(1, height + 0.35, 0);
  const parapetCap = new THREE.Mesh(
    new THREE.BoxGeometry(width - 1.3, 0.25, depth + 0.6),
    new THREE.MeshStandardMaterial({ color: 0x6b5b4b, roughness: 0.65 }),
  );
  parapetCap.position.set(1, height + 0.78, 0);
  group.add(parapet, parapetCap);

  // Rooftop AC service unit
  const acUnit = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 1.3, 4.2),
    new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4 }),
  );
  acUnit.position.set(2.5, height + 0.65, -depth * 0.15);
  group.add(acUnit);

  // Black base plinth (Video 01:18–01:26)
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(width - 1.6, 0.8, depth + 0.3), blackPlinthMat);
  plinth.position.set(1, 0.4, 0);
  group.add(plinth);

  // Projecting northwest corner stair tower with Blue Building Number (1..11)
  const towerH = height + 2.2;
  const towerZ = -depth / 2 + 3.1;
  const tower = new THREE.Mesh(new THREE.BoxGeometry(6.2, towerH, 6.0), tanWallMat);
  tower.position.set(-width / 2 + 3.1, towerH / 2, towerZ);
  tower.castShadow = true;
  group.add(tower);

  const numTex = createBuildingNumberTexture(numLabel, '#F2EDE2', '#1D4ED8', maxAnisotropy);
  const numMat = new THREE.MeshStandardMaterial({
    map: numTex,
    roughness: 0.45,
    emissive: new THREE.Color(0xffdfa0),
    emissiveMap: numTex,
    emissiveIntensity: 0.0,
  });
  nightEmissiveMaterials.push(numMat);

  const westNumPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.0), numMat);
  westNumPlane.rotation.y = -Math.PI / 2;
  westNumPlane.position.set(-width / 2 - 0.05, towerH - 1.9, towerZ);

  const northNumPlane = new THREE.Mesh(new THREE.PlaneGeometry(3.0, 3.0), numMat);
  northNumPlane.rotation.y = Math.PI;
  northNumPlane.position.set(-width / 2 + 3.1, towerH - 1.9, towerZ - 3.05);
  group.add(westNumPlane, northNumPlane);

  // Vertical stairwell window
  const stairWin = new THREE.Mesh(new THREE.BoxGeometry(0.2, 4.8, 1.4), windowMat);
  stairWin.position.set(-width / 2 - 0.02, 5.8, towerZ + 1.2);
  group.add(stairWin);

  // Wheelchair ramp & entrance landing (Video 01:16–01:26)
  const rampLanding = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.45, 5.2), rampMat);
  rampLanding.position.set(-width / 2 - 1.4, 0.225, towerZ + 1.5);
  group.add(rampLanding);

  // Horizontal multi-pane window bands on Floors 1 and 2
  for (const wy of [2.8, 6.8]) {
    const winBand = new THREE.Mesh(new THREE.BoxGeometry(width - 1.7, 1.3, depth - 5), windowMat);
    winBand.position.set(1, wy, 1.8);
    group.add(winBand);
  }

  // Security bollards along the front sidewalk
  for (let b = -1; b <= 1; b++) {
    const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.85, 8), bollardMat);
    bollard.position.set(-width / 2 - 3.6, 0.425, b * 4.2);
    group.add(bollard);
  }

  // Interlocking sidewalk in front
  const walk = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.14, depth + 2), sidewalkMat);
  walk.position.set(-width / 2 - 2.1, 0.07, 0);
  walk.receiveShadow = true;
  group.add(walk);
}

/**
 * Reconstructs the North Campus Administration & Protocol Pavilion (buildings)
 * Indicated by the northernmost "buildings" arrow in specifying_everything__47ad10c3.png:
 * - Square 2-story courtyard building with open central atrium
 * - Stepped pilaster articulation and shaded portico
 */
function buildNorthAdminCourtyard(
  group: THREE.Group,
  bldg: CampusBuilding,
  tanMat: THREE.Material,
  creamMat: THREE.Material,
  windowMat: THREE.Material,
  sidewalkMat: THREE.Material,
) {
  const { width, depth, height } = bldg.dimensions;

  // Base plinth
  const plinth = new THREE.Mesh(new THREE.BoxGeometry(width + 4, 0.35, depth + 4), sidewalkMat);
  plinth.position.y = 0.175;
  plinth.receiveShadow = true;
  group.add(plinth);

  // Outer courtyard perimeter wings
  const wingThickness = 7;
  const courtW = width - wingThickness * 2;
  const courtD = depth - wingThickness * 2;

  // North wing
  const northWing = new THREE.Mesh(new THREE.BoxGeometry(width, height, wingThickness), creamMat);
  northWing.position.set(0, height / 2, -depth / 2 + wingThickness / 2);
  // South wing
  const southWing = new THREE.Mesh(new THREE.BoxGeometry(width, height, wingThickness), creamMat);
  southWing.position.set(0, height / 2, depth / 2 - wingThickness / 2);
  // West wing
  const westWing = new THREE.Mesh(new THREE.BoxGeometry(wingThickness, height, courtD), creamMat);
  westWing.position.set(-width / 2 + wingThickness / 2, height / 2, 0);
  // East wing
  const eastWing = new THREE.Mesh(new THREE.BoxGeometry(wingThickness, height, courtD), creamMat);
  eastWing.position.set(width / 2 - wingThickness / 2, height / 2, 0);

  northWing.castShadow = true;
  southWing.castShadow = true;
  westWing.castShadow = true;
  eastWing.castShadow = true;
  group.add(northWing, southWing, westWing, eastWing);

  // Parapet trim
  const parapet = new THREE.Mesh(new THREE.BoxGeometry(width + 0.6, 0.8, depth + 0.6), tanMat);
  parapet.position.set(0, height + 0.4, 0);
  group.add(parapet);

  // Central landscaped courtyard floor
  const courtyardTurf = new THREE.Mesh(
    new THREE.BoxGeometry(courtW - 1, 0.2, courtD - 1),
    new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.8 }),
  );
  courtyardTurf.position.set(0, 0.1, 0);
  group.add(courtyardTurf);

  // Window bands
  for (const wy of [2.8, 6.8]) {
    const winWest = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.3, depth - 10), windowMat);
    winWest.position.set(-width / 2 - 0.05, wy, 0);
    const winEast = new THREE.Mesh(new THREE.BoxGeometry(0.25, 1.3, depth - 10), windowMat);
    winEast.position.set(width / 2 + 0.05, wy, 0);
    group.add(winWest, winEast);
  }

  // Entrance portico on South facade
  const portico = new THREE.Mesh(new THREE.BoxGeometry(10, 4.5, 3.5), tanMat);
  portico.position.set(0, 2.25, depth / 2 + 1.5);
  group.add(portico);
}

/**
 * Reconstructs an Individual Small Playground Hardcourt (small playgrounds)
 * Specified in specifying_everything__47ad10c3.png:
 * - Acrylic regulation surfacing (Basketball / Volleyball or Tennis / Futsal)
 * - Chain-link boundary fence with steel posts
 * - Sports apparatus (hoops, net) and perimeter match floodlights
 */
function buildSingleSportCourt(
  group: THREE.Group,
  bldg: CampusBuilding,
  bulbMat: THREE.Material,
  lightPoolMat: THREE.Material,
  nightLightGroup: THREE.Group,
) {
  const { width, depth } = bldg.dimensions;
  const isTennis = bldg.id === 'sports-court-2';

  const redCourtMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.75 });
  const greenCourtMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.75 });
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.6, wireframe: true });
  const steelMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.7 });

  // Border apron
  const apron = new THREE.Mesh(new THREE.BoxGeometry(width, 0.12, depth), redCourtMat);
  apron.position.y = 0.06;
  apron.receiveShadow = true;
  group.add(apron);

  // Inner playing court
  const innerCourt = new THREE.Mesh(new THREE.BoxGeometry(width - 4, 0.14, depth - 4), greenCourtMat);
  innerCourt.position.y = 0.08;
  innerCourt.receiveShadow = true;
  group.add(innerCourt);

  // White painted boundary lines
  const lineMat = new THREE.MeshBasicMaterial({ color: 0xf8fafc });
  const outerLine = new THREE.Mesh(new THREE.BoxGeometry(width - 5, 0.15, 0.12), lineMat);
  outerLine.position.set(0, 0.09, -depth / 2 + 2.5);
  const outerLine2 = new THREE.Mesh(new THREE.BoxGeometry(width - 5, 0.15, 0.12), lineMat);
  outerLine2.position.set(0, 0.09, depth / 2 - 2.5);
  group.add(outerLine, outerLine2);

  // Chain-link boundary fence
  const fenceH = 3.6;
  const fence = new THREE.Mesh(new THREE.BoxGeometry(width, fenceH, depth), fenceMat);
  fence.position.y = fenceH / 2;
  group.add(fence);

  if (isTennis) {
    // Center tennis net
    const net = new THREE.Mesh(
      new THREE.BoxGeometry(width - 4, 0.9, 0.08),
      new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.6, wireframe: true }),
    );
    net.position.set(0, 0.55, 0);
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8), steelMat);
    postL.position.set(-width / 2 + 2, 0.6, 0);
    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 1.2, 8), steelMat);
    postR.position.set(width / 2 - 2, 0.6, 0);
    group.add(net, postL, postR);
  } else {
    // Basketball hoops on both ends
    for (const ez of [-depth / 2 + 3.2, depth / 2 - 3.2]) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 3.8, 8), steelMat);
      pole.position.set(0, 1.9, ez);
      const backboard = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 1.1, 0.08),
        new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.3 }),
      );
      backboard.position.set(0, 3.2, ez + (ez < 0 ? 0.6 : -0.6));
      const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.03, 8, 16),
        new THREE.MeshStandardMaterial({ color: 0xf97316 }),
      );
      rim.rotation.x = Math.PI / 2;
      rim.position.set(0, 2.9, ez + (ez < 0 ? 0.85 : -0.85));
      group.add(pole, backboard, rim);
    }
  }

  // 4 Corner floodlights
  for (const cx of [-width / 2 + 0.8, width / 2 - 0.8]) {
    for (const cz of [-depth / 2 + 0.8, depth / 2 - 0.8]) {
      const pylon = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 7.5, 8), steelMat);
      pylon.position.set(cx, 3.75, cz);
      const head = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.8), bulbMat);
      head.position.set(cx, 7.6, cz);
      group.add(pylon, head);

      const courtLightPool = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), lightPoolMat);
      courtLightPool.rotation.x = -Math.PI / 2;
      courtLightPool.position.set(bldg.position.x + cx * 0.4, 0.22, bldg.position.z + cz * 0.4);
      nightLightGroup.add(courtLightPool);
    }
  }
}

/**
 * Reconstructs the Formal Four-Quadrant Courtyard Garden at the Southeast corner
 */
function buildFormalCourtyardGarden(
  group: THREE.Group,
  bldg: CampusBuilding,
  sidewalkMat: THREE.Material,
  curbTex: THREE.Texture,
  bulbMat: THREE.Material,
  lightPoolMat: THREE.Material,
  nightLightGroup: THREE.Group,
) {
  const { width, depth } = bldg.dimensions;

  const basePlinth = new THREE.Mesh(new THREE.BoxGeometry(width, 0.16, depth), sidewalkMat);
  basePlinth.position.y = 0.08;
  basePlinth.receiveShadow = true;
  group.add(basePlinth);

  const turfMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.85 });
  const quadW = (width - 8) / 2;
  const quadD = (depth - 8) / 2;
  const poleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });

  for (const sx of [-1, 1]) {
    for (const sz of [-1, 1]) {
      const qx = sx * (quadW / 2 + 1.8);
      const qz = sz * (quadD / 2 + 1.8);
      const quad = new THREE.Mesh(new THREE.BoxGeometry(quadW, 0.24, quadD), turfMat);
      quad.position.set(qx, 0.16, qz);
      quad.receiveShadow = true;
      group.add(quad);

      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.12, 4.2, 8), poleMat);
      post.position.set(qx, 2.1, qz);
      const globe = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 10), bulbMat);
      globe.position.set(qx, 4.3, qz);
      group.add(post, globe);

      const gardenPool = new THREE.Mesh(new THREE.PlaneGeometry(14, 14), lightPoolMat);
      gardenPool.rotation.x = -Math.PI / 2;
      gardenPool.position.set(bldg.position.x + qx, 0.29, bldg.position.z + qz);
      nightLightGroup.add(gardenPool);
    }
  }

  const centerCurb = new THREE.Mesh(
    new THREE.BoxGeometry(6.2, 0.45, 6.2),
    new THREE.MeshStandardMaterial({ map: curbTex, color: 0xffffff, roughness: 0.6 }),
  );
  centerCurb.position.y = 0.24;
  group.add(centerCurb);

  const fountainBasin = new THREE.Mesh(
    new THREE.CylinderGeometry(2.2, 2.4, 0.75, 20),
    new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.2, metalness: 0.4 }),
  );
  fountainBasin.position.y = 0.48;
  group.add(fountainBasin);

  const fountainPool = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), lightPoolMat);
  fountainPool.rotation.x = -Math.PI / 2;
  fountainPool.position.set(bldg.position.x, 0.28, bldg.position.z);
  nightLightGroup.add(fountainPool);
}

/**
 * Reconstructs the Shaded Cantilevered Carport Parking Corridors
 */
function buildShadedParkingCorridor(group: THREE.Group, bldg: CampusBuilding) {
  const { width, depth } = bldg.dimensions;
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0xd6be9f,
    roughness: 0.7,
    metalness: 0.1,
  });
  const postMat = new THREE.MeshStandardMaterial({
    color: 0x334155,
    roughness: 0.5,
    metalness: 0.7,
  });

  const numRows = Math.max(4, Math.floor(depth / 11));
  const rowStep = depth / numRows;

  for (let i = 0; i < numRows; i++) {
    const rz = -depth / 2 + rowStep * (i + 0.5);
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(width - 3, 0.22, 5.2), shadeMat);
    canopy.position.set(0, 3.2, rz);
    canopy.rotation.x = 0.12;
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    group.add(canopy);

    for (const px of [-width / 3, width / 3]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 3.2, 8), postMat);
      post.position.set(px, 1.6, rz - 1.2);
      group.add(post);
    }
  }
}

/**
 * Reconstructs the Unverified South-Central Support Halls (Honest Conservative Massing)
 */
function buildSouthwestSupportHall(group: THREE.Group, bldg: CampusBuilding) {
  const { width, depth, height } = bldg.dimensions;
  const neutralWallMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.85,
    metalness: 0.05,
  });
  const whiteRoofMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.6,
    metalness: 0.1,
  });

  for (const sz of [-depth * 0.24, depth * 0.24]) {
    const hall = new THREE.Mesh(
      new THREE.BoxGeometry(width, height, depth * 0.42),
      neutralWallMat,
    );
    hall.position.set(0, height / 2, sz);
    hall.castShadow = true;
    hall.receiveShadow = true;

    const roof = new THREE.Mesh(
      new THREE.BoxGeometry(width + 0.6, 0.4, depth * 0.42 + 0.6),
      whiteRoofMat,
    );
    roof.position.set(0, height + 0.2, sz);
    group.add(hall, roof);
  }
}

/**
 * Generates procedural diamond-patterned pruned-petiole Date Palm bark color + bump textures
 * matching Phoenix dactylifera trunks in /public/assets/aistudio/datestree_7e72db40.jpg.
 */
function createDatePalmBarkTextures(maxAnisotropy: number): {
  colorMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bCtx = bumpCanvas.getContext('2d')!;

  ctx.fillStyle = '#5a432e';
  ctx.fillRect(0, 0, size, size);
  bCtx.fillStyle = '#383838';
  bCtx.fillRect(0, 0, size, size);

  const cols = 8;
  const rows = 16;
  const cellW = size / cols;
  const cellH = size / rows;

  for (let r = -1; r <= rows + 1; r++) {
    const xShift = r % 2 === 0 ? 0 : cellW * 0.5;
    for (let c = -1; c <= cols + 1; c++) {
      const cx = c * cellW + xShift;
      const cy = r * cellH;
      const jitter = ((r * 37 + c * 17) % 11) - 5;

      // Dark crevice shadow under each pruned frond boot
      ctx.fillStyle = '#3a291a';
      ctx.beginPath();
      ctx.moveTo(cx, cy - cellH * 0.65);
      ctx.lineTo(cx + cellW * 0.56, cy + cellH * 0.12);
      ctx.lineTo(cx, cy + cellH * 0.72);
      ctx.lineTo(cx - cellW * 0.56, cy + cellH * 0.12);
      ctx.closePath();
      ctx.fill();

      // Main woody petiole stub diamond
      const shade = 108 + jitter * 3;
      ctx.fillStyle = `rgb(${shade + 18}, ${shade - 4}, ${shade - 28})`;
      ctx.beginPath();
      ctx.moveTo(cx, cy - cellH * 0.45);
      ctx.lineTo(cx + cellW * 0.46, cy + cellH * 0.08);
      ctx.lineTo(cx, cy + cellH * 0.5);
      ctx.lineTo(cx - cellW * 0.46, cy + cellH * 0.08);
      ctx.closePath();
      ctx.fill();

      // Sun-bleached tan fibrous upper cut edge
      ctx.strokeStyle = '#b49876';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(cx - cellW * 0.36, cy + cellH * 0.02);
      ctx.lineTo(cx, cy - cellH * 0.38);
      ctx.lineTo(cx + cellW * 0.36, cy + cellH * 0.02);
      ctx.stroke();

      // Fine vertical woody fibers
      ctx.strokeStyle = 'rgba(65, 45, 28, 0.45)';
      ctx.lineWidth = 1.4;
      for (let f = -2; f <= 2; f++) {
        ctx.beginPath();
        ctx.moveTo(cx + f * 6, cy - cellH * 0.18);
        ctx.lineTo(cx + f * 7, cy + cellH * 0.38);
        ctx.stroke();
      }

      // Bump map diamond relief
      bCtx.fillStyle = '#cfcfcf';
      bCtx.beginPath();
      bCtx.moveTo(cx, cy - cellH * 0.42);
      bCtx.lineTo(cx + cellW * 0.44, cy + cellH * 0.08);
      bCtx.lineTo(cx, cy + cellH * 0.46);
      bCtx.lineTo(cx - cellW * 0.44, cy + cellH * 0.08);
      bCtx.closePath();
      bCtx.fill();

      bCtx.strokeStyle = '#ffffff';
      bCtx.lineWidth = 3;
      bCtx.beginPath();
      bCtx.moveTo(cx - cellW * 0.34, cy + cellH * 0.02);
      bCtx.lineTo(cx, cy - cellH * 0.34);
      bCtx.lineTo(cx + cellW * 0.34, cy + cellH * 0.02);
      bCtx.stroke();
    }
  }

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  colorMap.wrapS = THREE.RepeatWrapping;
  colorMap.wrapT = THREE.RepeatWrapping;
  colorMap.repeat.set(2, 5);
  colorMap.anisotropy = maxAnisotropy;

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.colorSpace = THREE.NoColorSpace;
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(2, 5);
  bumpMap.anisotropy = maxAnisotropy;

  return { colorMap, bumpMap };
}

/**
 * Builds an authentic multi-part Date Palm trunk with root flare, textured diamond petiole-ribbed column,
 * and flared upper crown sheath (pivot at bottom-center y = 0).
 */
function createDatePalmTrunkGeometry(): THREE.BufferGeometry {
  const rootFlare = new THREE.CylinderGeometry(0.45, 0.64, 0.6, 10, 1);
  rootFlare.translate(0, 0.3, 0);

  const mainTrunk = new THREE.CylinderGeometry(0.31, 0.46, 5.7, 10, 14);
  const posAttr = mainTrunk.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    const x = posAttr.getX(i);
    const y = posAttr.getY(i);
    const z = posAttr.getZ(i);
    const ang = Math.atan2(z, x);
    // Subtle organic petiole stub ridges along the shaft
    const ridge = 1.0 + 0.065 * Math.sin(y * 10.5 + ang * 4.0);
    posAttr.setXYZ(i, x * ridge, y, z * ridge);
  }
  mainTrunk.computeVertexNormals();
  mainTrunk.translate(0, 3.15, 0);

  const crownSheath = new THREE.CylinderGeometry(0.48, 0.33, 0.85, 10, 3);
  crownSheath.translate(0, 6.1, 0);

  const merged = mergeGeometries([rootFlare, mainTrunk, crownSheath], false);
  rootFlare.dispose();
  mainTrunk.dispose();
  crownSheath.dispose();
  return merged;
}

/**
 * Builds a single merged 46-frond pinnate Date Palm crown BufferGeometry matching Phoenix dactylifera
 * (/assets/aistudio/datestree_7e72db40.jpg): fibrous crown heart, dense 4-tier starburst canopy,
 * alternating V-folded pointed leaflets, and rich deep olive-emerald vertex shading.
 */
function createDatePalmCrownGeometry(): THREE.BufferGeometry {
  const positions: number[] = [];
  const colors: number[] = [];
  const normals: number[] = [];

  const tmpA = new THREE.Vector3();
  const tmpB = new THREE.Vector3();
  const tmpC = new THREE.Vector3();
  const edge1 = new THREE.Vector3();
  const edge2 = new THREE.Vector3();
  const faceN = new THREE.Vector3();

  const pushTri = (
    ax: number,
    ay: number,
    az: number,
    bx: number,
    by: number,
    bz: number,
    cx: number,
    cy: number,
    cz: number,
    cr: number,
    cg: number,
    cb: number,
    tr: number,
    tg: number,
    tb: number,
  ) => {
    tmpA.set(ax, ay, az);
    tmpB.set(bx, by, bz);
    tmpC.set(cx, cy, cz);
    edge1.subVectors(tmpB, tmpA);
    edge2.subVectors(tmpC, tmpA);
    faceN.crossVectors(edge1, edge2).normalize();
    if (faceN.lengthSq() < 0.0001) faceN.set(0, 1, 0);

    positions.push(ax, ay, az, bx, by, bz, cx, cy, cz);
    normals.push(
      faceN.x,
      faceN.y,
      faceN.z,
      faceN.x,
      faceN.y,
      faceN.z,
      faceN.x,
      faceN.y,
      faceN.z,
    );
    colors.push(cr, cg, cb, cr, cg, cb, tr, tg, tb);
  };

  // Fibrous olive-brown crown heart where petiole bases pack tightly together
  const heartRings = 6;
  const heartSegs = 10;
  for (let r = 0; r < heartRings; r++) {
    const phi0 = (r / heartRings) * Math.PI;
    const phi1 = ((r + 1) / heartRings) * Math.PI;
    for (let s = 0; s < heartSegs; s++) {
      const th0 = (s / heartSegs) * Math.PI * 2;
      const th1 = ((s + 1) / heartSegs) * Math.PI * 2;
      const rad0 = 0.52;
      const radY = 0.56;
      const cy = 0.16;
      const p00: [number, number, number] = [Math.sin(phi0) * Math.cos(th0) * rad0, cy + Math.cos(phi0) * radY, Math.sin(phi0) * Math.sin(th0) * rad0];
      const p10: [number, number, number] = [Math.sin(phi1) * Math.cos(th0) * rad0, cy + Math.cos(phi1) * radY, Math.sin(phi1) * Math.sin(th0) * rad0];
      const p01: [number, number, number] = [Math.sin(phi0) * Math.cos(th1) * rad0, cy + Math.cos(phi0) * radY, Math.sin(phi0) * Math.sin(th1) * rad0];
      const p11: [number, number, number] = [Math.sin(phi1) * Math.cos(th1) * rad0, cy + Math.cos(phi1) * radY, Math.sin(phi1) * Math.sin(th1) * rad0];
      if (r > 0) {
        pushTri(p00[0], p00[1], p00[2], p10[0], p10[1], p10[2], p01[0], p01[1], p01[2], 0.16, 0.14, 0.06, 0.12, 0.18, 0.05);
      }
      if (r < heartRings - 1) {
        pushTri(p01[0], p01[1], p01[2], p10[0], p10[1], p10[2], p11[0], p11[1], p11[2], 0.16, 0.14, 0.06, 0.12, 0.18, 0.05);
      }
    }
  }

  interface FrondTier {
    count: number;
    length: number;
    pitchRad: number;
    droop: number;
    phaseOffset: number;
    baseColor: [number, number, number];
    tipColor: [number, number, number];
  }

  const tiers: FrondTier[] = [
    // Tier 0: Steep central upright spear & fountain tuft (iconic V-crown top)
    {
      count: 7,
      length: 3.1,
      pitchRad: 1.28,
      droop: 0.36,
      phaseOffset: 0.08,
      baseColor: [0.065, 0.165, 0.04],
      tipColor: [0.165, 0.34, 0.088],
    },
    // Tier 1: Upper radiating fountain fronds
    {
      count: 12,
      length: 3.8,
      pitchRad: 0.94,
      droop: 0.88,
      phaseOffset: 0.32,
      baseColor: [0.055, 0.15, 0.036],
      tipColor: [0.145, 0.305, 0.078],
    },
    // Tier 2: Full mid canopy sweeping arched fronds
    {
      count: 15,
      length: 4.35,
      pitchRad: 0.52,
      droop: 1.62,
      phaseOffset: 0.56,
      baseColor: [0.048, 0.135, 0.032],
      tipColor: [0.13, 0.275, 0.072],
    },
    // Tier 3: Lower wide-spreading & gently drooping skirt fronds
    {
      count: 12,
      length: 3.9,
      pitchRad: 0.14,
      droop: 1.98,
      phaseOffset: 0.84,
      baseColor: [0.045, 0.115, 0.028],
      tipColor: [0.135, 0.23, 0.068],
    },
  ];

  const spinePoint = (t: number, len: number, pitch: number, droop: number) => {
    const out = Math.cos(pitch) * len * t + Math.sin(pitch) * droop * 0.42 * t * t;
    const up = Math.sin(pitch) * len * t - droop * t * t;
    return { out, up };
  };

  for (const tier of tiers) {
    for (let f = 0; f < tier.count; f++) {
      const azim =
        (f / tier.count) * Math.PI * 2 +
        tier.phaseOffset +
        Math.sin(f * 2.3 + tier.phaseOffset) * 0.12;
      const cosA = Math.cos(azim);
      const sinA = Math.sin(azim);
      // Right-hand tangent perpendicular to frond azimuth
      const tanX = -sinA;
      const tanZ = cosA;

      const fLen = tier.length * (0.93 + 0.13 * Math.sin(f * 1.9));
      const fPitch = tier.pitchRad + Math.cos(f * 2.7) * 0.07;
      const fDroop = tier.droop * (0.92 + 0.14 * Math.cos(f * 1.3));

      const toWorld = (out: number, up: number, lat: number): [number, number, number] => [
        cosA * out + tanX * lat,
        up,
        sinA * out + tanZ * lat,
      ];

      // 1. Tapered central rachis midrib (6 segments)
      const spineSegs = 6;
      for (let s = 0; s < spineSegs; s++) {
        const t0 = s / spineSegs;
        const t1 = (s + 1) / spineSegs;
        const p0 = spinePoint(t0, fLen, fPitch, fDroop);
        const p1 = spinePoint(t1, fLen, fPitch, fDroop);
        const w0 = 0.075 * (1 - t0 * 0.72);
        const w1 = 0.075 * (1 - t1 * 0.72);

        const l0 = toWorld(p0.out, p0.up, -w0);
        const r0 = toWorld(p0.out, p0.up, w0);
        const l1 = toWorld(p1.out, p1.up, -w1);
        const r1 = toWorld(p1.out, p1.up, w1);

        pushTri(
          l0[0], l0[1], l0[2],
          r0[0], r0[1], r0[2],
          l1[0], l1[1], l1[2],
          0.16, 0.17, 0.06,
          0.11, 0.21, 0.055,
        );
        pushTri(
          r0[0], r0[1], r0[2],
          r1[0], r1[1], r1[2],
          l1[0], l1[1], l1[2],
          0.16, 0.17, 0.06,
          0.11, 0.21, 0.055,
        );
      }

      // 2. 16 pairs of dense, overlapping V-folded pinnate leaflets along both sides of the spine
      const leafletPairs = 16;
      for (let k = 0; k < leafletPairs; k++) {
        const t = 0.11 + (k / (leafletPairs - 1)) * 0.86;
        const sp = spinePoint(t, fLen, fPitch, fDroop);
        const envelope = Math.sin(Math.pow(t, 0.76) * Math.PI);
        const leafLen = 0.34 + 0.62 * envelope;
        const baseHalfW = 0.072 + 0.036 * envelope;

        // Forward sweep + alternating V-dihedral stagger so pinnae catch light like real Date Palms
        const stagger = k % 2 === 0 ? 1.0 : 0.42;
        const fwdOut = leafLen * 0.56;
        const sideLat = leafLen * 0.78;
        const dihedralUp = leafLen * ((0.34 - t * 0.24) * stagger);

        const rCol = tier.baseColor[0] + (tier.tipColor[0] - tier.baseColor[0]) * t;
        const gCol = tier.baseColor[1] + (tier.tipColor[1] - tier.baseColor[1]) * t;
        const bCol = tier.baseColor[2] + (tier.tipColor[2] - tier.baseColor[2]) * t;

        for (const side of [-1, 1]) {
          const b0 = toWorld(sp.out - baseHalfW, sp.up, side * 0.02);
          const b1 = toWorld(sp.out + baseHalfW, sp.up, side * 0.02);
          const mid = toWorld(
            sp.out + fwdOut * 0.54,
            sp.up + dihedralUp * 0.9,
            side * sideLat * 0.58,
          );
          const tip = toWorld(
            sp.out + fwdOut,
            sp.up + dihedralUp * 0.48,
            side * sideLat,
          );

          pushTri(
            b0[0], b0[1], b0[2],
            mid[0], mid[1], mid[2],
            tip[0], tip[1], tip[2],
            rCol, gCol, bCol,
            Math.min(1, rCol * 1.24), Math.min(1, gCol * 1.24), Math.min(1, bCol * 1.15),
          );
          pushTri(
            b0[0], b0[1], b0[2],
            b1[0], b1[1], b1[2],
            mid[0], mid[1], mid[2],
            rCol * 0.84, gCol * 0.84, bCol * 0.84,
            rCol, gCol, bCol,
          );
        }
      }
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeBoundingSphere();
  return geo;
}

/**
 * Builds Instanced Date Palms (Phoenix dactylifera matching /assets/aistudio/datestree_7e72db40.jpg
 * with slow wind sway on leaves) + Monumental Perimeter Wall enclosing the widened campus.
 */
function buildPerimeterWallAndPalms(
  rootGroup: THREE.Group,
  maxAnisotropy: number,
  windUniforms: Array<{ value: number }>,
) {
  const palmPositions: Array<[number, number]> = [];
  // Main Gate 1 & Entry Plaza palms
  for (let z = -60; z <= 12; z += 14) {
    palmPositions.push([-170, z]);
  }
  // Palm Grove at the Northwest corner of Building 20 (prominent in video 00:50–01:04!)
  palmPositions.push(
    [13, -64],
    [17, -56],
    [15, -46],
    [13, -36],
    [17, -28],
    [14, -20],
  );
  // Ornamental date palms separating Playground Northern Boulevard from Mosque, Bldg 17, Bldg 18 & Bldg 19
  palmPositions.push(
    [-145, -128],
    [-145, -108],
    [-136, -94],
    [-100, -94],
    [-76, -94],
    [-58, -94],
    [-26, -94],
    [-10, -94],
    [6, -94],
    [24, -94],
    [48, -94],
    // Ornamental palms lining the North Playground Botanical Buffer
    [-56, -64],
    [-38, -64],
    [-20, -64],
    [-2, -64],
    // Inner Academic Boulevard (z = -154) palms in front of Buildings 15, 16, 14 & Courtyard
    [-132, -172],
    [-102, -172],
    [-52, -172],
    [-24, -172],
    [4, -172],
    [26, -172],
    [46, -172],
    [138, -172],
  );
  // Palms along the Eastern Administration Boulevard median (video 01:18–01:24)
  for (let z = -90; z <= 205; z += 18) {
    palmPositions.push([129, z]);
  }
  // Palms around Formal Four-Quadrant Garden
  palmPositions.push([132, 232], [168, 232], [132, 262], [168, 262]);
  // Palms along Western & Southern Library Plazas
  palmPositions.push(
    [-140, 82],
    [-140, 114],
    [-140, 146],
    [-140, 194],
    [-140, 232],
    [55, -30],
    [55, 40],
    [55, 110],
    [55, 165],
    [55, 220],
    [-110, 268],
    [-75, 268],
    [-44, 268],
    [-13, 268],
    [22, 268],
  );

  const palmCount = palmPositions.length;
  const { colorMap: barkColorMap, bumpMap: barkBumpMap } = createDatePalmBarkTextures(maxAnisotropy);
  const trunkGeo = createDatePalmTrunkGeometry();
  const trunkMat = new THREE.MeshStandardMaterial({
    map: barkColorMap,
    bumpMap: barkBumpMap,
    bumpScale: 0.16,
    roughness: 0.92,
    metalness: 0.02,
  });

  const crownGeo = createDatePalmCrownGeometry();
  const windTimeUniform = { value: 0 };
  windUniforms.push(windTimeUniform);

  const crownMat = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.86,
    metalness: 0.0,
    envMapIntensity: 0.55,
    side: THREE.DoubleSide,
  });
  crownMat.onBeforeCompile = (shader) => {
    shader.uniforms.uWindTime = windTimeUniform;
    shader.vertexShader = 'uniform float uWindTime;\n' + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
      '#include <begin_vertex>',
      `
      #include <begin_vertex>
      #ifdef USE_INSTANCING
        float palmSeed = instanceMatrix[3][0] * 0.13 + instanceMatrix[3][2] * 0.19;
      #else
        float palmSeed = 0.0;
      #endif
      float radialWeight = smoothstep(0.32, 3.6, length(position.xz));
      float slowBreeze = sin(uWindTime * 0.72 + palmSeed);
      float crossGust = cos(uWindTime * 0.42 + palmSeed * 0.7 + position.x * 0.35);
      float leafFlutter = sin(uWindTime * 1.8 + palmSeed * 1.4 + position.x * 1.45 + position.z * 1.25);
      transformed.x += (slowBreeze * 0.24 + crossGust * 0.11 + leafFlutter * 0.055) * radialWeight;
      transformed.z += (slowBreeze * 0.15 - crossGust * 0.09 + leafFlutter * 0.04) * radialWeight;
      transformed.y += (sin(uWindTime * 1.05 + palmSeed + length(position.xz) * 0.5) * 0.14 + leafFlutter * 0.035) * radialWeight;
      `,
    );
  };

  const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, palmCount);
  const crownInst = new THREE.InstancedMesh(crownGeo, crownMat, palmCount);
  trunkInst.castShadow = true;
  trunkInst.receiveShadow = true;
  crownInst.castShadow = true;
  crownInst.receiveShadow = true;

  const dummy = new THREE.Object3D();
  const tint = new THREE.Color();
  palmPositions.forEach(([px, pz], idx) => {
    const hash = Math.sin(px * 12.9898 + pz * 78.233) * 43758.5453;
    const rand = hash - Math.floor(hash);
    const scaleH = 0.88 + rand * 0.26; // Natural height variety (~8.2m to 10.6m total palm)
    const scaleR = 0.94 + ((rand * 7.3) % 1) * 0.18;
    const rotY = rand * Math.PI * 2;
    const leanX = (rand - 0.5) * 0.035;
    const leanZ = (((rand * 3.7) % 1) - 0.5) * 0.035;

    dummy.position.set(px, 0, pz);
    dummy.rotation.set(leanX, rotY, leanZ);
    dummy.scale.set(scaleR, scaleH, scaleR);
    dummy.updateMatrix();
    trunkInst.setMatrixAt(idx, dummy.matrix);

    const crownY = 6.22 * scaleH;
    dummy.position.set(
      px + Math.sin(leanZ) * crownY,
      crownY,
      pz - Math.sin(leanX) * crownY,
    );
    dummy.rotation.set(leanX, rotY + 0.4, leanZ);
    dummy.scale.set(scaleR, scaleH, scaleR);
    dummy.updateMatrix();
    crownInst.setMatrixAt(idx, dummy.matrix);

    const shade = 0.78 + rand * 0.2;
    tint.setRGB(shade, shade * (0.98 + rand * 0.04), shade * 0.94);
    crownInst.setColorAt(idx, tint);
  });
  trunkInst.instanceMatrix.needsUpdate = true;
  crownInst.instanceMatrix.needsUpdate = true;
  if (crownInst.instanceColor) crownInst.instanceColor.needsUpdate = true;
  trunkInst.computeBoundingSphere();
  crownInst.computeBoundingSphere();
  rootGroup.add(trunkInst, crownInst);

  // Campus Perimeter Boundary Wall (strictly enclosing x: -195..195, z: -195..300, joining Main Gate 1 & Gate 2)
  const wallMat = new THREE.MeshStandardMaterial({ color: 0xf6f4ef, roughness: 0.72, metalness: 0.04 });
  const wallPlinthMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.6 });
  const wallCopingMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.55 });
  const fenceMetalMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.45,
    metalness: 0.65,
  });

  const pillarPositions: Array<{ x: number; z: number; corner?: boolean }> = [];
  const picketPositions: Array<{ x: number; z: number }> = [];

  const addWallSpan = (
    axis: 'x' | 'z',
    length: number,
    cx: number,
    cz: number,
  ) => {
    const w = axis === 'x' ? length : 1.3;
    const d = axis === 'z' ? length : 1.3;

    // Dark base plinth
    const plinth = new THREE.Mesh(
      new THREE.BoxGeometry(axis === 'x' ? length + 0.2 : 1.6, 0.5, axis === 'z' ? length + 0.2 : 1.6),
      wallPlinthMat,
    );
    plinth.position.set(cx, 0.25, cz);
    plinth.receiveShadow = true;

    // Crisp white masonry lower wall
    const wall = new THREE.Mesh(new THREE.BoxGeometry(w, 2.1, d), wallMat);
    wall.position.set(cx, 1.55, cz);
    wall.castShadow = true;
    wall.receiveShadow = true;

    // Concrete coping ledge
    const cap = new THREE.Mesh(
      new THREE.BoxGeometry(axis === 'x' ? length + 0.2 : 1.55, 0.22, axis === 'z' ? length + 0.2 : 1.55),
      wallCopingMat,
    );
    cap.position.set(cx, 2.7, cz);

    // Upper security steel horizontal fence rails (y = 3.35 and y = 4.05)
    const midRail = new THREE.Mesh(
      new THREE.BoxGeometry(axis === 'x' ? length : 0.22, 0.14, axis === 'z' ? length : 0.22),
      fenceMetalMat,
    );
    midRail.position.set(cx, 3.35, cz);

    const topRail = new THREE.Mesh(
      new THREE.BoxGeometry(axis === 'x' ? length : 0.28, 0.18, axis === 'z' ? length : 0.28),
      fenceMetalMat,
    );
    topRail.position.set(cx, 4.05, cz);

    rootGroup.add(plinth, wall, cap, midRail, topRail);

    // Record pillar locations every 12m along span
    const startOffset = -length / 2;
    const numSegments = Math.max(1, Math.round(length / 12));
    const step = length / numSegments;
    for (let i = 0; i <= numSegments; i++) {
      const offset = startOffset + i * step;
      const px = axis === 'x' ? cx + offset : cx;
      const pz = axis === 'z' ? cz + offset : cz;
      pillarPositions.push({ x: px, z: pz });
    }

    // Record vertical steel fence pickets every 2.4m along span
    for (let offset = startOffset + 1.2; offset < length / 2 - 0.8; offset += 2.4) {
      const kx = axis === 'x' ? cx + offset : cx;
      const kz = axis === 'z' ? cz + offset : cz;
      picketPositions.push({ x: kx, z: kz });
    }
  };

  // North wall (x: -195..195 at z = -258) — widened north campus expanse
  addWallSpan('x', 390, 0, -258);
  // South wall (x: -195..195 at z = 300)
  addWallSpan('x', 390, 0, 300);
  // West wall at x = -195, meeting Main Gate 1 directly (opening z = -47..-23)
  addWallSpan('z', 211, -195, -152.5);
  addWallSpan('z', 323, -195, 138.5);
  // East wall at x = 195, meeting Gate 2 directly (opening z = 256..288)
  addWallSpan('z', 514, 195, -1);
  addWallSpan('z', 12, 195, 294);

  // Corner landmark piers at all 4 compound corners
  for (const [cx, cz] of [
    [-195, -258],
    [195, -258],
    [195, 300],
    [-195, 300],
  ]) {
    const cornerPier = new THREE.Mesh(new THREE.BoxGeometry(2.6, 5.4, 2.6), wallMat);
    cornerPier.position.set(cx, 2.7, cz);
    cornerPier.castShadow = true;
    cornerPier.receiveShadow = true;
    const cornerCap = new THREE.Mesh(new THREE.BoxGeometry(2.95, 0.45, 2.95), wallPlinthMat);
    cornerCap.position.set(cx, 5.55, cz);
    rootGroup.add(cornerPier, cornerCap);
  }

  // Instanced masonry pillars + dark caps
  const pillarGeo = new THREE.BoxGeometry(1.65, 4.6, 1.65);
  const pillarCapGeo = new THREE.BoxGeometry(1.9, 0.35, 1.9);
  const pillarInst = new THREE.InstancedMesh(pillarGeo, wallMat, pillarPositions.length);
  const pillarCapInst = new THREE.InstancedMesh(pillarCapGeo, wallPlinthMat, pillarPositions.length);
  pillarInst.castShadow = true;
  pillarInst.receiveShadow = true;

  pillarPositions.forEach((p, idx) => {
    dummy.position.set(p.x, 2.3, p.z);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    pillarInst.setMatrixAt(idx, dummy.matrix);

    dummy.position.set(p.x, 4.72, p.z);
    dummy.updateMatrix();
    pillarCapInst.setMatrixAt(idx, dummy.matrix);
  });
  rootGroup.add(pillarInst, pillarCapInst);

  // Instanced upper steel fence pickets
  const picketGeo = new THREE.BoxGeometry(0.16, 1.4, 0.16);
  const picketInst = new THREE.InstancedMesh(picketGeo, fenceMetalMat, picketPositions.length);
  picketPositions.forEach((k, idx) => {
    dummy.position.set(k.x, 3.45, k.z);
    dummy.scale.set(1, 1, 1);
    dummy.updateMatrix();
    picketInst.setMatrixAt(idx, dummy.matrix);
  });
  rootGroup.add(picketInst);
}

/**
 * Builds distributed Campus-Wide Night PointLights & Architectural Plaza Light Pools
 * so clicking "Night Visit" illuminates every road, gate, stadium, mosque, and building.
 */
function buildCampusNightIllumination(
  nightLightGroup: THREE.Group,
  lightPoolMat: THREE.Material,
) {
  const keyNightLights: Array<{
    pos: [number, number, number];
    color: number;
    intensity: number;
    distance: number;
  }> = [
    // Main Gate 1 & Highway Roundabout Entry Plaza
    { pos: [-195, 14, -35], color: 0xffdfa0, intensity: 56, distance: 115 },
    // University Mosque, Building 17, Building 18 & Playground Northern Boulevard
    { pos: [-118, 16, -98], color: 0xffd896, intensity: 54, distance: 115 },
    { pos: [-67, 16, -98], color: 0xffd896, intensity: 54, distance: 115 },
    { pos: [-9, 16, -98], color: 0xffd896, intensity: 56, distance: 115 },
    // Building 19, Building 20 & North Inner Academic Complex (15, 16, 14, NC1)
    { pos: [36, 16, -98], color: 0xffd896, intensity: 54, distance: 115 },
    { pos: [-118, 16, -180], color: 0xffd896, intensity: 54, distance: 120 },
    { pos: [-24, 18, -180], color: 0xffd896, intensity: 60, distance: 125 },
    { pos: [34, 16, -180], color: 0xffd896, intensity: 54, distance: 120 },
    { pos: [154, 16, -180], color: 0xffd896, intensity: 48, distance: 115 },
    // Central Football Stadium Floodlights (North & South high-mast fill)
    { pos: [-26, 28, -22], color: 0xfff4d6, intensity: 76, distance: 150 },
    { pos: [-26, 28, 46], color: 0xfff4d6, intensity: 76, distance: 150 },
    // Football Stadium Spectator Grandstand (place for setting people watching football)
    { pos: [35, 16, 22], color: 0xffdfa0, intensity: 58, distance: 120 },
    // Multi-Sport Courts & Red-Roof Indoor Sports Hall
    { pos: [-118, 16, -10], color: 0xffdfa0, intensity: 52, distance: 115 },
    // Eastern Administration Boulevard North & Mid (Buildings 1 to 6)
    { pos: [132, 16, -40], color: 0xffd68a, intensity: 56, distance: 125 },
    { pos: [132, 16, 45], color: 0xffd68a, intensity: 56, distance: 125 },
    // Eastern Administration Boulevard South (Buildings 7 to 11)
    { pos: [132, 16, 145], color: 0xffd68a, intensity: 56, distance: 125 },
    // Formal Four-Quadrant Courtyard Garden & Gate 2 Southeastern Portal
    { pos: [172, 16, 260], color: 0xffe4ad, intensity: 64, distance: 125 },
    // University Central Library (Main Hall & Annex)
    { pos: [-44, 22, 92], color: 0xffe4ad, intensity: 72, distance: 155 },
    { pos: [-44, 18, 228], color: 0xffe4ad, intensity: 56, distance: 130 },
    // Southern Perimeter Road Corridor
    { pos: [40, 14, 272], color: 0xffd68a, intensity: 48, distance: 120 },
  ];

  for (const cfg of keyNightLights) {
    const pt = new THREE.PointLight(cfg.color, cfg.intensity, cfg.distance, 1.35);
    pt.position.set(...cfg.pos);
    nightLightGroup.add(pt);
  }

  // Architectural Facade & Plaza Ground Light Pools in front of key buildings
  const plazaPools: Array<{ x: number; z: number; size: number }> = [
    { x: -118, z: -96, size: 32 }, // University Mosque South Lawn & Entrance
    { x: -67, z: -98, size: 32 }, // Building 17 Academic Plaza
    { x: -9, z: -98, size: 38 }, // Building 18 Computing Portals Plaza
    { x: 36, z: -98, size: 34 }, // Building 19 Pilaster Academic Plaza
    { x: 35, z: -48, size: 30 }, // Building 20 Deanship of Arts
    { x: -118, z: -178, size: 34 }, // Building 15 Front Boulevard
    { x: -24, z: -178, size: 42 }, // Building 16 Academic Plaza
    { x: 34, z: -178, size: 34 }, // Building 14 Academic Plaza
    { x: 35, z: 22, size: 38 }, // Football Stadium Spectator Grandstand
    { x: -118, z: 34, size: 32 }, // Red-Roof Gym Hall Portico
    { x: -44, z: 204, size: 52 }, // University Central Library South Plaza
    { x: 134, z: -26, size: 34 }, // Administration Row North
    { x: 134, z: 82, size: 34 }, // Administration Row Mid
    { x: 134, z: 163, size: 34 }, // Administration Row South
    { x: 195, z: 272, size: 36 }, // Gate 2 Southeastern Monumental Portal
  ];

  for (const p of plazaPools) {
    const pool = new THREE.Mesh(new THREE.PlaneGeometry(p.size, p.size), lightPoolMat);
    pool.rotation.x = -Math.PI / 2;
    pool.position.set(p.x, 0.15, p.z);
    nightLightGroup.add(pool);
  }
}

/**
 * Generates an authentic traditional red-and-white Saudi Shemagh houndstooth / checkered weave texture.
 */
function createShemaghTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, size, size);

  const cell = 16;
  for (let y = 0; y < size; y += cell) {
    for (let x = 0; x < size; x += cell) {
      const ix = (x / cell) | 0;
      const iy = (y / cell) | 0;
      const diag = (ix + iy) % 2 === 0;
      if (diag) {
        // Bold traditional crimson Saudi Shemagh diamond weave
        ctx.fillStyle = '#b91c1c';
        ctx.beginPath();
        ctx.moveTo(x + cell * 0.5, y);
        ctx.lineTo(x + cell, y + cell * 0.5);
        ctx.lineTo(x + cell * 0.5, y + cell);
        ctx.lineTo(x, y + cell * 0.5);
        ctx.closePath();
        ctx.fill();

        // Fine white inner weave thread
        ctx.fillStyle = '#f8fafc';
        ctx.fillRect(x + cell * 0.44, y + cell * 0.44, 2, 2);
      } else {
        // Crisp crimson lattice threads between diamonds
        ctx.fillStyle = 'rgba(185, 28, 28, 0.58)';
        ctx.fillRect(x + cell * 0.44, y, 2, cell);
        ctx.fillRect(x, y + cell * 0.44, cell, 2);
      }
    }
  }

  // Traditional woven border band
  ctx.fillStyle = '#991b1b';
  ctx.fillRect(0, size - 12, size, 5);
  ctx.fillRect(0, size - 5, size, 3);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.2, 2.2);
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Builds a life-size (~1.77m) articulated Saudi University Student avatar wearing traditional
 * Saudi dress: crisp white Thobe with mandarin collar & breast pocket, white Sirwal,
 * brown leather Saudi sandals, red-and-white checkered Shemagh with articulated drapes,
 * and black double-cord Agal, facing forward along -Z.
 */
function buildThirdPersonAvatar(maxAnisotropy: number): {
  avatar: THREE.Group;
  rig: SaudiStudentRig;
} {
  const avatar = new THREE.Group();

  const thobeMat = new THREE.MeshStandardMaterial({
    color: 0xf4f6f8,
    roughness: 0.78,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  const thobeShadowMat = new THREE.MeshStandardMaterial({
    color: 0xe6ebf0,
    roughness: 0.82,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  const sirwalMat = new THREE.MeshStandardMaterial({
    color: 0xedf1f5,
    roughness: 0.85,
  });
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xc9936b,
    roughness: 0.65,
    metalness: 0.02,
  });
  const hairBeardMat = new THREE.MeshStandardMaterial({
    color: 0x1c1614,
    roughness: 0.88,
  });
  const shemaghTex = createShemaghTexture(maxAnisotropy);
  const shemaghMat = new THREE.MeshStandardMaterial({
    map: shemaghTex,
    roughness: 0.84,
    metalness: 0.02,
    side: THREE.DoubleSide,
  });
  const agalMat = new THREE.MeshStandardMaterial({
    color: 0x111318,
    roughness: 0.65,
    metalness: 0.08,
  });
  const leatherMat = new THREE.MeshStandardMaterial({
    color: 0x5c3419,
    roughness: 0.62,
    metalness: 0.06,
  });
  const soleMat = new THREE.MeshStandardMaterial({
    color: 0x1e1b18,
    roughness: 0.88,
  });
  const buttonMat = new THREE.MeshStandardMaterial({
    color: 0xdbeafe,
    roughness: 0.3,
    metalness: 0.2,
  });
  const metalMat = new THREE.MeshStandardMaterial({
    color: 0xcbd5e1,
    roughness: 0.28,
    metalness: 0.85,
  });

  // 1. Pelvis root (y = 0.90m, sole bottom lands cleanly at y = 0)
  const pelvis = new THREE.Group();
  pelvis.position.set(0, 0.9, 0);
  avatar.add(pelvis);

  // Waist yoke bridging torso and lower thobe skirt
  const waistYoke = new THREE.Mesh(
    new THREE.CylinderGeometry(0.168, 0.195, 0.2, 16),
    thobeMat,
  );
  waistYoke.scale.set(1.06, 1, 0.76);
  waistYoke.position.y = -0.02;
  waistYoke.castShadow = true;
  pelvis.add(waistYoke);

  // Fixed side drapery panels of the Thobe (mid-shin length so legs & sandals read clearly while walking)
  for (const side of [-1, 1]) {
    const sidePanel = new THREE.Mesh(
      new THREE.CylinderGeometry(0.082, 0.112, 0.5, 10, 1, true),
      thobeShadowMat,
    );
    sidePanel.position.set(side * 0.132, -0.27, 0.01);
    sidePanel.scale.set(0.62, 1, 0.96);
    sidePanel.castShadow = true;
    pelvis.add(sidePanel);
  }

  // Articulated Front & Back Thobe Skirt Panels (part naturally over knees & sirwal during stride)
  const skirtFront = new THREE.Group();
  skirtFront.position.set(0, -0.03, -0.035);
  const frontCurtainGeo = new THREE.CylinderGeometry(
    0.188,
    0.24,
    0.53,
    14,
    1,
    true,
    Math.PI * 0.65,
    Math.PI * 0.7,
  );
  const frontCurtain = new THREE.Mesh(frontCurtainGeo, thobeMat);
  frontCurtain.scale.set(1.0, 1, 0.72);
  frontCurtain.position.set(0, -0.26, 0.02);
  frontCurtain.castShadow = true;
  skirtFront.add(frontCurtain);
  pelvis.add(skirtFront);

  const skirtBack = new THREE.Group();
  skirtBack.position.set(0, -0.03, 0.035);
  const backCurtainGeo = new THREE.CylinderGeometry(
    0.188,
    0.24,
    0.53,
    14,
    1,
    true,
    -Math.PI * 0.35,
    Math.PI * 0.7,
  );
  const backCurtain = new THREE.Mesh(backCurtainGeo, thobeMat);
  backCurtain.scale.set(1.0, 1, 0.72);
  backCurtain.position.set(0, -0.26, -0.02);
  backCurtain.castShadow = true;
  skirtBack.add(backCurtain);
  pelvis.add(skirtBack);

  // 2. Articulated Left & Right Legs + Saudi Brown Leather Sandals
  const buildLeg = (side: -1 | 1) => {
    const hip = new THREE.Group();
    hip.position.set(side * 0.095, -0.02, 0);

    const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.062, 0.4, 12), sirwalMat);
    thigh.position.y = -0.2;
    thigh.castShadow = true;
    hip.add(thigh);

    const knee = new THREE.Group();
    knee.position.set(0, -0.4, 0);
    hip.add(knee);

    const kneeJointCap = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), sirwalMat);
    knee.add(kneeJointCap);

    const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.046, 0.36, 12), sirwalMat);
    shin.position.y = -0.18;
    shin.castShadow = true;
    knee.add(shin);

    const ankleSkin = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.07, 10), skinMat);
    ankleSkin.position.y = -0.38;
    knee.add(ankleSkin);

    const ankle = new THREE.Group();
    ankle.position.set(0, -0.4, 0);
    knee.add(ankle);

    // Foot (skin) resting inside Saudi leather sandal
    const footBody = new THREE.Mesh(new THREE.BoxGeometry(0.088, 0.042, 0.21), skinMat);
    footBody.position.set(0, -0.048, -0.045);
    footBody.castShadow = true;
    ankle.add(footBody);

    // Sandal dark sole (bottom sits cleanly at y = -0.08 relative to ankle => world y = 0)
    const sandalSole = new THREE.Mesh(new THREE.BoxGeometry(0.098, 0.022, 0.235), soleMat);
    sandalSole.position.set(0, -0.069, -0.045);
    sandalSole.castShadow = true;
    ankle.add(sandalSole);

    // Brown leather cross-straps
    const frontStrap = new THREE.Mesh(new THREE.BoxGeometry(0.102, 0.028, 0.068), leatherMat);
    frontStrap.position.set(0, -0.044, -0.075);
    const instepStrap = new THREE.Mesh(new THREE.BoxGeometry(0.098, 0.022, 0.036), leatherMat);
    instepStrap.position.set(0, -0.036, -0.01);
    ankle.add(frontStrap, instepStrap);

    pelvis.add(hip);
    return { hip, knee, ankle };
  };

  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);

  // 3. Articulated Upper Torso (White Thobe Bodice, Collar, Chest Pocket, Buttons)
  const torso = new THREE.Group();
  torso.position.set(0, 0.06, 0);
  pelvis.add(torso);

  const chest = new THREE.Mesh(new THREE.CylinderGeometry(0.198, 0.168, 0.48, 16), thobeMat);
  chest.scale.set(1.08, 1, 0.72);
  chest.position.y = 0.24;
  chest.castShadow = true;
  chest.receiveShadow = true;
  torso.add(chest);

  const shoulderBridge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.082, 0.082, 0.43, 12),
    thobeMat,
  );
  shoulderBridge.rotation.z = Math.PI / 2;
  shoulderBridge.scale.set(0.85, 1, 0.75);
  shoulderBridge.position.set(0, 0.44, 0);
  shoulderBridge.castShadow = true;
  torso.add(shoulderBridge);

  // Crisp Standing Saudi Mandarin Collar
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.078, 0.086, 0.058, 14),
    thobeMat,
  );
  collar.position.set(0, 0.505, 0);
  collar.castShadow = true;
  torso.add(collar);

  // Front Thobe Placket (jabzour) & 3 buttons along -Z chest front
  const placket = new THREE.Mesh(new THREE.BoxGeometry(0.042, 0.24, 0.012), thobeShadowMat);
  placket.position.set(0, 0.37, -0.136);
  torso.add(placket);
  for (let b = 0; b < 3; b++) {
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.014, 8), buttonMat);
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0, 0.45 - b * 0.06, -0.141);
    torso.add(btn);
  }

  // Left chest student pocket + silver pen clip
  const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.085, 0.012), thobeShadowMat);
  pocket.position.set(-0.09, 0.31, -0.132);
  const pen = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.07, 8), metalMat);
  pen.position.set(-0.072, 0.34, -0.138);
  torso.add(pocket, pen);

  // 4. Articulated Arms (Thobe Sleeves, Buttoned Cuffs, Silver Watch, Skin Hands)
  const buildArm = (side: -1 | 1) => {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.205, 0.43, 0);

    const shoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.062, 12, 12), thobeMat);
    shoulderCap.scale.set(0.95, 0.95, 0.85);
    shoulderCap.castShadow = true;
    shoulder.add(shoulderCap);

    const upperArm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.058, 0.05, 0.26, 12),
      thobeMat,
    );
    upperArm.position.y = -0.13;
    upperArm.castShadow = true;
    shoulder.add(upperArm);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.26, 0);
    shoulder.add(elbow);

    const elbowCap = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 10), thobeMat);
    elbow.add(elbowCap);

    const forearm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.043, 0.23, 12),
      thobeMat,
    );
    forearm.position.y = -0.115;
    forearm.castShadow = true;
    elbow.add(forearm);

    // Crisp Thobe wrist cuff (kabak)
    const cuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.046, 0.046, 0.042, 12),
      thobeShadowMat,
    );
    cuff.position.y = -0.22;
    elbow.add(cuff);

    // Silver wristwatch on left wrist
    if (side === -1) {
      const watch = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.018, 12), metalMat);
      watch.position.y = -0.242;
      elbow.add(watch);
    }

    // Natural skin hand
    const palm = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.088, 0.066), skinMat);
    palm.position.set(0, -0.285, -0.008);
    palm.castShadow = true;
    const thumb = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.042, 0.024), skinMat);
    thumb.position.set(-side * 0.015, -0.268, -0.042);
    elbow.add(palm, thumb);

    torso.add(shoulder);
    return { shoulder, elbow };
  };

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);

  // 5. Head, Facial Features, White Tagiyah, Red-and-White Saudi Shemagh & Black Agal
  const head = new THREE.Group();
  head.position.set(0, 0.52, 0);
  torso.add(head);

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.056, 0.068, 0.1, 12), skinMat);
  neck.position.y = 0.035;
  head.add(neck);

  // Head skull (sculpted oval facing -Z)
  const cranium = new THREE.Mesh(new THREE.SphereGeometry(0.112, 16, 16), skinMat);
  cranium.scale.set(0.88, 1.08, 0.96);
  cranium.position.set(0, 0.165, 0);
  cranium.castShadow = true;
  head.add(cranium);

  // Subtle human nose, eyes, eyebrows & trimmed Saudi beard
  const nose = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.042, 0.03), skinMat);
  nose.position.set(0, 0.16, -0.108);
  nose.rotation.x = 0.2;
  head.add(nose);

  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.011, 8, 8), hairBeardMat);
    eye.position.set(side * 0.034, 0.18, -0.095);
    const brow = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.008, 0.01), hairBeardMat);
    brow.position.set(side * 0.034, 0.197, -0.098);
    head.add(eye, brow);
  }

  // Neat trimmed beard & mustache framing the jaw
  const beard = new THREE.Mesh(
    new THREE.SphereGeometry(0.102, 14, 10, 0, Math.PI * 2, Math.PI * 0.56, Math.PI * 0.4),
    hairBeardMat,
  );
  beard.scale.set(0.9, 1.0, 0.98);
  beard.position.set(0, 0.155, -0.008);
  const mustache = new THREE.Mesh(new THREE.BoxGeometry(0.046, 0.011, 0.014), hairBeardMat);
  mustache.position.set(0, 0.132, -0.104);
  head.add(beard, mustache);

  // White under-cap (Tagiyah) peeking slightly above the brow
  const tagiyah = new THREE.Mesh(
    new THREE.SphereGeometry(0.114, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.45),
    thobeMat,
  );
  tagiyah.scale.set(0.9, 1.05, 0.98);
  tagiyah.position.set(0, 0.174, 0.004);
  head.add(tagiyah);

  // Red-and-White Checkered Shemagh Crown Dome & Snug Forehead Fold (tucked cleanly under Agal)
  const shemaghDome = new THREE.Mesh(
    new THREE.SphereGeometry(0.122, 18, 12, 0, Math.PI * 2, 0, Math.PI * 0.52),
    shemaghMat,
  );
  shemaghDome.scale.set(0.94, 1.02, 1.03);
  shemaghDome.position.set(0, 0.186, 0.008);
  shemaghDome.rotation.x = 0.06;
  shemaghDome.castShadow = true;
  head.add(shemaghDome);

  // Subtle forehead rim fold tucked neatly below the Agal
  const shemaghVisor = new THREE.Mesh(
    new THREE.CylinderGeometry(0.112, 0.118, 0.032, 14, 1, true, Math.PI * 0.72, Math.PI * 0.56),
    shemaghMat,
  );
  shemaghVisor.position.set(0, 0.215, -0.004);
  shemaghVisor.rotation.x = 0.08;
  head.add(shemaghVisor);

  // Articulated Shemagh Side & Rear Flowing Drapes (drape snugly over neck & shoulders with zero gap)
  const shemaghLeft = new THREE.Group();
  shemaghLeft.position.set(-0.088, 0.185, 0.005);
  const leftDrape = new THREE.Mesh(
    new THREE.CylinderGeometry(0.044, 0.095, 0.36, 8, 1, true, Math.PI * 0.12, Math.PI * 1.15),
    shemaghMat,
  );
  leftDrape.position.set(-0.015, -0.175, 0.035);
  leftDrape.rotation.z = -0.1;
  leftDrape.castShadow = true;
  shemaghLeft.add(leftDrape);
  head.add(shemaghLeft);

  const shemaghRight = new THREE.Group();
  shemaghRight.position.set(0.088, 0.185, 0.005);
  const rightDrape = new THREE.Mesh(
    new THREE.CylinderGeometry(0.044, 0.095, 0.36, 8, 1, true, -Math.PI * 0.27, Math.PI * 1.15),
    shemaghMat,
  );
  rightDrape.position.set(0.015, -0.175, 0.035);
  rightDrape.rotation.z = 0.1;
  rightDrape.castShadow = true;
  shemaghRight.add(rightDrape);
  head.add(shemaghRight);

  const shemaghBack = new THREE.Group();
  shemaghBack.position.set(0, 0.185, 0.025);
  const backDrape = new THREE.Mesh(
    new THREE.CylinderGeometry(0.112, 0.155, 0.4, 12, 1, true, -Math.PI * 0.46, Math.PI * 0.92),
    shemaghMat,
  );
  backDrape.position.set(0, -0.195, 0.015);
  backDrape.rotation.x = 0.05;
  backDrape.castShadow = true;
  shemaghBack.add(backDrape);
  head.add(shemaghBack);

  // Iconic Black Double-Cord Agal resting atop the Shemagh
  const agalLower = new THREE.Mesh(new THREE.TorusGeometry(0.117, 0.016, 10, 26), agalMat);
  agalLower.rotation.x = Math.PI / 2 + 0.06;
  agalLower.scale.set(0.94, 1.03, 1);
  agalLower.position.set(0, 0.238, 0.008);
  agalLower.castShadow = true;

  const agalUpper = new THREE.Mesh(new THREE.TorusGeometry(0.111, 0.015, 10, 26), agalMat);
  agalUpper.rotation.x = Math.PI / 2 + 0.06;
  agalUpper.scale.set(0.94, 1.03, 1);
  agalUpper.position.set(0, 0.264, 0.01);
  agalUpper.castShadow = true;

  // Twin black Agal cords hanging neatly at the back of the head
  for (const cordX of [-0.014, 0.014]) {
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.007, 0.18, 6), agalMat);
    cord.position.set(cordX, 0.15, 0.128);
    cord.rotation.x = -0.12;
    head.add(cord);
  }
  head.add(agalLower, agalUpper);

  const rig: SaudiStudentRig = {
    pelvis,
    torso,
    head,
    leftHip: leftLeg.hip,
    rightHip: rightLeg.hip,
    leftKnee: leftLeg.knee,
    rightKnee: rightLeg.knee,
    leftAnkle: leftLeg.ankle,
    rightAnkle: rightLeg.ankle,
    leftShoulder: leftArm.shoulder,
    rightShoulder: rightArm.shoulder,
    leftElbow: leftArm.elbow,
    rightElbow: rightArm.elbow,
    skirtFront,
    skirtBack,
    shemaghLeft,
    shemaghRight,
    shemaghBack,
  };

  return { avatar, rig };
}

function createCarDoorEmblemTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#F8FAFC';
  ctx.fillRect(0, 0, 512, 128);

  // University royal navy & emerald twin racing accent stripe
  ctx.fillStyle = '#0F296B';
  ctx.fillRect(0, 82, 512, 16);
  ctx.fillStyle = '#059669';
  ctx.fillRect(0, 102, 512, 8);

  // University of Bisha wordmark
  ctx.fillStyle = '#0F296B';
  ctx.font = 'bold 34px "Outfit", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('UNIVERSITY OF BISHA', 24, 48);
  ctx.fillStyle = '#047857';
  ctx.font = 'bold 26px "Outfit", sans-serif';
  ctx.fillText('جامعة بيشة · CAMPUS FLEET 01', 24, 76);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

function createLicensePlateTexture(maxAnisotropy: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 96;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, 256, 96);
  ctx.strokeStyle = '#0F172A';
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 248, 88);

  // Saudi plate green vertical badge strip on right
  ctx.fillStyle = '#059669';
  ctx.fillRect(204, 8, 42, 80);
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText('KSA', 225, 55);

  ctx.fillStyle = '#0F172A';
  ctx.font = 'bold 40px "JetBrains Mono", monospace';
  ctx.fillText('UB 2030', 108, 62);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = maxAnisotropy;
  return tex;
}

/**
 * Builds a sleek 3D Pearl-White University of Bisha Sedan (~4.52m long, facing -Z)
 * with independent steering front knuckles, rotating 5-spoke wheels, suspension chassis,
 * seated Saudi driver silhouette, headlights + ground beam wash, and brake/reverse lamps.
 */
function buildCampusCar(maxAnisotropy = 4): {
  carGroup: THREE.Group;
  rig: CampusCarRig;
} {
  const carGroup = new THREE.Group();

  // Suspension-mounted upper body pivoting around axle height (y = 0.34m)
  const chassis = new THREE.Group();
  chassis.position.set(0, 0.34, 0);
  carGroup.add(chassis);

  // Shared PBR Automotive Materials
  const bodyPaintMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.22,
    metalness: 0.28,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: 0x111827,
    roughness: 0.72,
    metalness: 0.15,
  });
  const chromeMat = new THREE.MeshStandardMaterial({
    color: 0xe2e8f0,
    roughness: 0.18,
    metalness: 0.9,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.08,
    metalness: 0.85,
    transparent: true,
    opacity: 0.78,
  });
  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x14171c,
    roughness: 0.88,
    metalness: 0.04,
  });
  const rimMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    roughness: 0.22,
    metalness: 0.85,
  });
  const caliperMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    roughness: 0.35,
    metalness: 0.4,
  });
  const interiorSeatMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b,
    roughness: 0.85,
  });

  const headlightMat = new THREE.MeshStandardMaterial({
    color: 0xfffbeb,
    roughness: 0.15,
    metalness: 0.2,
    emissive: new THREE.Color(0xfff4c2),
    emissiveIntensity: 0.35,
  });
  const taillightMat = new THREE.MeshStandardMaterial({
    color: 0xb91c1c,
    roughness: 0.25,
    metalness: 0.2,
    emissive: new THREE.Color(0xef4444),
    emissiveIntensity: 0.2,
  });
  const reverseLightMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.2,
    emissive: new THREE.Color(0xffffff),
    emissiveIntensity: 0.0,
  });

  const doorTex = createCarDoorEmblemTexture(maxAnisotropy);
  const doorEmblemMat = new THREE.MeshStandardMaterial({
    map: doorTex,
    roughness: 0.28,
    metalness: 0.2,
  });
  const plateTex = createLicensePlateTexture(maxAnisotropy);
  const plateMat = new THREE.MeshStandardMaterial({
    map: plateTex,
    roughness: 0.35,
  });

  // 1. Lower Underbody Floorpan & Side Rocker Skirts (local y relative to axle height 0.34)
  const underbody = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.16, 4.38), trimMat);
  underbody.position.set(0, -0.02, 0);
  underbody.castShadow = true;
  chassis.add(underbody);

  // Main Sculpted Beltline Body (width 1.88m, length 4.46m along Z)
  const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.48, 4.46), bodyPaintMat);
  lowerBody.position.set(0, 0.24, 0);
  lowerBody.castShadow = true;
  lowerBody.receiveShadow = true;
  chassis.add(lowerBody);

  // Subtle Wheel-Arch Fender Flares
  for (const fx of [-0.93, 0.93]) {
    for (const fz of [-1.35, 1.35]) {
      const flare = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.26, 0.94), bodyPaintMat);
      flare.position.set(fx, 0.22, fz);
      chassis.add(flare);
    }
  }

  // University Door Crest Panels (left & right doors)
  for (const side of [-1, 1]) {
    const doorPanel = new THREE.Mesh(new THREE.PlaneGeometry(1.85, 0.34), doorEmblemMat);
    doorPanel.position.set(side * 0.946, 0.26, 0.05);
    doorPanel.rotation.y = side === 1 ? Math.PI / 2 : -Math.PI / 2;
    chassis.add(doorPanel);
  }

  // Sculpted Sloped Hood (front -Z from z = -0.82 to z = -2.22)
  const hoodDeck = new THREE.Mesh(new THREE.BoxGeometry(1.74, 0.14, 1.42), bodyPaintMat);
  hoodDeck.position.set(0, 0.49, -1.48);
  hoodDeck.rotation.x = 0.065;
  hoodDeck.castShadow = true;
  chassis.add(hoodDeck);

  // Rear Trunk Deck (z = +1.05 to +2.22)
  const trunkDeck = new THREE.Mesh(new THREE.BoxGeometry(1.76, 0.15, 1.12), bodyPaintMat);
  trunkDeck.position.set(0, 0.52, 1.62);
  trunkDeck.rotation.x = -0.04;
  trunkDeck.castShadow = true;
  chassis.add(trunkDeck);

  // Subtle Rear Lip Spoiler
  const spoiler = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.05, 0.16), trimMat);
  spoiler.position.set(0, 0.59, 2.15);
  chassis.add(spoiler);

  // 2. Greenhouse Cabin (pillars, roof, windshields, side windows, shark-fin antenna)
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.46, 0.08, 1.68), bodyPaintMat);
  roof.position.set(0, 1.07, 0.18);
  roof.castShadow = true;
  chassis.add(roof);

  // Panoramic dark sunroof inset + shark-fin antenna
  const sunroof = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.025, 0.85), glassMat);
  sunroof.position.set(0, 1.11, 0.05);
  const sharkFin = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.14, 4), trimMat);
  sharkFin.position.set(0, 1.16, 0.82);
  sharkFin.rotation.x = -0.35;
  chassis.add(sunroof, sharkFin);

  // Sloped Front Windshield
  const windshield = new THREE.Mesh(new THREE.BoxGeometry(1.46, 0.04, 0.84), glassMat);
  windshield.position.set(0, 0.8, -0.76);
  windshield.rotation.x = -0.68;
  chassis.add(windshield);

  // Sloped Rear Window
  const rearGlass = new THREE.Mesh(new THREE.BoxGeometry(1.44, 0.04, 0.74), glassMat);
  rearGlass.position.set(0, 0.83, 1.12);
  rearGlass.rotation.x = 0.58;
  chassis.add(rearGlass);

  // Side Glass Bands & A/B/C Pillars
  for (const side of [-1, 1]) {
    const sideGlass = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 1.88), glassMat);
    sideGlass.position.set(side * 0.74, 0.82, 0.18);
    sideGlass.rotation.z = side * 0.18;
    chassis.add(sideGlass);

    // B-pillar
    const bPillar = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.45, 0.11), trimMat);
    bPillar.position.set(side * 0.75, 0.83, 0.18);
    bPillar.rotation.z = side * 0.18;
    chassis.add(bPillar);

    // A-pillar & C-pillar frames
    const aPillar = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.08, 0.86), bodyPaintMat);
    aPillar.position.set(side * 0.73, 0.81, -0.76);
    aPillar.rotation.x = -0.68;
    aPillar.rotation.z = side * 0.16;
    const cPillar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.09, 0.76), bodyPaintMat);
    cPillar.position.set(side * 0.73, 0.84, 1.12);
    cPillar.rotation.x = 0.58;
    cPillar.rotation.z = side * 0.16;
    chassis.add(aPillar, cPillar);

    // Sleek Side Mirrors
    const mirrorArm = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.05, 0.06), trimMat);
    mirrorArm.position.set(side * 0.92, 0.57, -0.58);
    const mirrorHousing = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.1, 0.12), bodyPaintMat);
    mirrorHousing.position.set(side * 1.01, 0.6, -0.56);
    chassis.add(mirrorArm, mirrorHousing);
  }

  // 3. Interior Cabin (Dashboard, Steering Wheel, Seats & Seated Saudi Student Driver)
  const dash = new THREE.Mesh(new THREE.BoxGeometry(1.42, 0.22, 0.34), trimMat);
  dash.position.set(0, 0.56, -0.66);
  chassis.add(dash);

  const steeringWheel = new THREE.Group();
  steeringWheel.position.set(-0.36, 0.66, -0.44);
  steeringWheel.rotation.x = 0.42;
  const wheelRim = new THREE.Mesh(new THREE.TorusGeometry(0.145, 0.018, 8, 18), trimMat);
  const wheelSpoke = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.025, 0.015), chromeMat);
  steeringWheel.add(wheelRim, wheelSpoke);
  chassis.add(steeringWheel);

  for (const sx of [-0.36, 0.36]) {
    const seatBack = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.52, 0.12), interiorSeatMat);
    seatBack.position.set(sx, 0.58, 0.2);
    seatBack.rotation.x = 0.16;
    chassis.add(seatBack);
  }

  // Seated Saudi Driver inside left driver seat (x = -0.36)
  const driverThobeMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.72 });
  const driverSkinMat = new THREE.MeshStandardMaterial({ color: 0xc68b59, roughness: 0.65 });
  const driverShemaghMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.75 });
  const driverTorso = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.15, 0.38, 10), driverThobeMat);
  driverTorso.position.set(-0.36, 0.61, 0.04);
  const driverHead = new THREE.Mesh(new THREE.SphereGeometry(0.105, 10, 10), driverSkinMat);
  driverHead.position.set(-0.36, 0.87, 0.02);
  const driverShemagh = new THREE.Mesh(
    new THREE.SphereGeometry(0.115, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55),
    driverShemaghMat,
  );
  driverShemagh.position.set(-0.36, 0.89, 0.03);
  const driverAgal = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.014, 6, 16), trimMat);
  driverAgal.rotation.x = Math.PI / 2;
  driverAgal.position.set(-0.36, 0.94, 0.03);
  chassis.add(driverTorso, driverHead, driverShemagh, driverAgal);

  // 4. Front Grille, Bumpers, License Plates, Headlights & Taillights
  // Front Bumper & Grille (-Z)
  const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.24, 0.14), bodyPaintMat);
  frontBumper.position.set(0, 0.12, -2.23);
  const frontGrille = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.22, 0.08), trimMat);
  frontGrille.position.set(0, 0.28, -2.24);
  const grilleChromeBar = new THREE.Mesh(new THREE.BoxGeometry(0.98, 0.035, 0.1), chromeMat);
  grilleChromeBar.position.set(0, 0.32, -2.25);
  const frontPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.15), plateMat);
  frontPlate.position.set(0, 0.13, -2.305);
  frontPlate.rotation.y = Math.PI;
  chassis.add(frontBumper, frontGrille, grilleChromeBar, frontPlate);

  // Rear Bumper, Diffuser, Dual Exhausts & Plate (+Z)
  const rearBumper = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.24, 0.14), bodyPaintMat);
  rearBumper.position.set(0, 0.13, 2.23);
  const rearDiffuser = new THREE.Mesh(new THREE.BoxGeometry(1.56, 0.14, 0.08), trimMat);
  rearDiffuser.position.set(0, 0.04, 2.25);
  const rearPlate = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.15), plateMat);
  rearPlate.position.set(0, 0.28, 2.24);
  chassis.add(rearBumper, rearDiffuser, rearPlate);

  for (const ex of [-0.56, 0.56]) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.12, 10), chromeMat);
    pipe.rotation.x = Math.PI / 2;
    pipe.position.set(ex, 0.03, 2.28);
    chassis.add(pipe);
  }

  // Headlight Clusters (-Z)
  for (const side of [-1, 1]) {
    const lamp = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.13, 0.12), headlightMat);
    lamp.position.set(side * 0.68, 0.33, -2.23);
    chassis.add(lamp);
  }

  // Taillight & Reverse Light Clusters (+Z)
  for (const side of [-1, 1]) {
    const tail = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.09), taillightMat);
    tail.position.set(side * 0.66, 0.4, 2.23);
    const rev = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.06, 0.1), reverseLightMat);
    rev.position.set(side * 0.5, 0.36, 2.235);
    chassis.add(tail, rev);
  }
  const centerTailBar = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.04, 0.08), taillightMat);
  centerTailBar.position.set(0, 0.42, 2.235);
  chassis.add(centerTailBar);

  // Crisp Ground-Projected Headlight Fan Wash + Low Beam Lenses (toggled via L or Night mode)
  const headlightBeams = new THREE.Group();
  headlightBeams.visible = false;
  const beamCanvas = document.createElement('canvas');
  beamCanvas.width = 256;
  beamCanvas.height = 512;
  const bCtx = beamCanvas.getContext('2d')!;
  const grad = bCtx.createRadialGradient(128, 490, 6, 128, 256, 310);
  grad.addColorStop(0.0, 'rgba(255, 248, 214, 0.92)');
  grad.addColorStop(0.32, 'rgba(255, 242, 185, 0.45)');
  grad.addColorStop(0.7, 'rgba(255, 232, 150, 0.14)');
  grad.addColorStop(1.0, 'rgba(255, 232, 150, 0.0)');
  bCtx.save();
  bCtx.beginPath();
  bCtx.moveTo(116, 512);
  bCtx.lineTo(140, 512);
  bCtx.lineTo(256, 0);
  bCtx.lineTo(0, 0);
  bCtx.closePath();
  bCtx.clip();
  bCtx.fillStyle = grad;
  bCtx.fillRect(0, 0, 256, 512);
  bCtx.restore();

  const beamTex = new THREE.CanvasTexture(beamCanvas);
  beamTex.colorSpace = THREE.SRGBColorSpace;
  const beamGroundMat = new THREE.MeshBasicMaterial({
    map: beamTex,
    transparent: true,
    opacity: 0.78,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  for (const side of [-1, 1]) {
    const beamWash = new THREE.Mesh(new THREE.PlaneGeometry(4.4, 22), beamGroundMat);
    beamWash.rotation.x = -Math.PI / 2;
    beamWash.position.set(side * 0.68, -0.21, -13.2);
    headlightBeams.add(beamWash);
  }
  chassis.add(headlightBeams);

  // 5. Four Independent 5-Spoke Alloy Wheels (radius 0.34m; axle at y = 0.34m)
  const buildWheel = (): THREE.Group => {
    const wheel = new THREE.Group();

    const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.24, 24), tireMat);
    tire.rotation.z = Math.PI / 2;
    tire.castShadow = true;
    wheel.add(tire);

    const rimBarrel = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.25, 18), rimMat);
    rimBarrel.rotation.z = Math.PI / 2;
    wheel.add(rimBarrel);

    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.065, 0.265, 12), chromeMat);
    hub.rotation.z = Math.PI / 2;
    wheel.add(hub);

    const caliper = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.11, 0.09), caliperMat);
    caliper.position.set(0, 0.08, 0.1);
    wheel.add(caliper);

    // 5 Radial Alloy Spokes in YZ plane so rotating wheel.rotation.x spins them visibly
    for (let s = 0; s < 5; s++) {
      const ang = (s / 5) * Math.PI * 2;
      const spoke = new THREE.Mesh(new THREE.BoxGeometry(0.255, 0.045, 0.38), rimMat);
      spoke.rotation.x = ang;
      wheel.add(spoke);
    }

    return wheel;
  };

  const frontLeftSteer = new THREE.Group();
  frontLeftSteer.position.set(-0.84, 0.34, -1.35);
  const frontLeftWheel = buildWheel();
  frontLeftSteer.add(frontLeftWheel);

  const frontRightSteer = new THREE.Group();
  frontRightSteer.position.set(0.84, 0.34, -1.35);
  const frontRightWheel = buildWheel();
  frontRightSteer.add(frontRightWheel);

  const rearLeftWheel = buildWheel();
  rearLeftWheel.position.set(-0.84, 0.34, 1.35);

  const rearRightWheel = buildWheel();
  rearRightWheel.position.set(0.84, 0.34, 1.35);

  carGroup.add(frontLeftSteer, frontRightSteer, rearLeftWheel, rearRightWheel);

  return {
    carGroup,
    rig: {
      chassis,
      frontLeftSteer,
      frontRightSteer,
      frontLeftWheel,
      frontRightWheel,
      rearLeftWheel,
      rearRightWheel,
      headlightMat,
      taillightMat,
      reverseLightMat,
      headlightBeams,
      steeringWheel,
    },
  };
}


/**
 * Updates the 3D navigation route ribbon and waypoint beacons along the selected path
 */
export function updateRouteLine3D(
  routeGroup: THREE.Group,
  points: Array<{ x: number; z: number }>,
) {
  while (routeGroup.children.length > 0) {
    const child = routeGroup.children[0] as THREE.Mesh;
    routeGroup.remove(child);
    child.geometry?.dispose();
  }

  if (points.length < 2) return;

  const ribbonMat = new THREE.MeshBasicMaterial({
    color: 0x0ea5e9,
    transparent: true,
    opacity: 0.9,
  });

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const dx = p2.x - p1.x;
    const dz = p2.z - p1.z;
    const segLen = Math.hypot(dx, dz);
    if (segLen < 0.1) continue;

    const segMesh = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.14, segLen), ribbonMat);
    segMesh.position.set((p1.x + p2.x) / 2, 0.26, (p1.z + p2.z) / 2);
    segMesh.rotation.y = Math.atan2(dx, dz);
    routeGroup.add(segMesh);
  }

  const beaconMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
  for (const pt of [points[0], points[points.length - 1]]) {
    const pin = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 3.2, 16), beaconMat);
    pin.position.set(pt.x, 1.6, pt.z);
    routeGroup.add(pin);
  }
}

/**
 * Updates the 3D distance measurement line between two clicked campus points
 */
export function updateMeasurementLine3D(
  measureGroup: THREE.Group,
  pointA: { x: number; z: number } | null,
  pointB: { x: number; z: number } | null,
) {
  while (measureGroup.children.length > 0) {
    const child = measureGroup.children[0] as THREE.Mesh;
    measureGroup.remove(child);
    child.geometry?.dispose();
  }

  const pinMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
  if (pointA) {
    const markerA = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.2, 4.0, 14), pinMat);
    markerA.position.set(pointA.x, 2.0, pointA.z);
    measureGroup.add(markerA);
  }
  if (pointB) {
    const markerB = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.2, 4.0, 14), pinMat);
    markerB.position.set(pointB.x, 2.0, pointB.z);
    measureGroup.add(markerB);
  }
  if (pointA && pointB) {
    const dx = pointB.x - pointA.x;
    const dz = pointB.z - pointA.z;
    const dist = Math.hypot(dx, dz);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, dist), pinMat);
    bar.position.set((pointA.x + pointB.x) / 2, 0.4, (pointA.z + pointB.z) / 2);
    bar.rotation.y = Math.atan2(dx, dz);
    measureGroup.add(bar);
  }
}
