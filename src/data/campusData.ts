export type BuildingCategory =
  | 'gate'
  | 'mosque'
  | 'academic'
  | 'administration'
  | 'sports'
  | 'parking'
  | 'garden'
  | 'library'
  | 'facility';

export type ArchitecturalArchetype =
  | 'main_gate_1'
  | 'gate_2'
  | 'campus_mosque'
  | 'building_18_computing'
  | 'pilaster_academic_19'
  | 'building_20_arts'
  | 'red_roof_gym'
  | 'sports_pitch'
  | 'football_grandstand'
  | 'multi_sport_courts'
  | 'single_sport_court'
  | 'university_library'
  | 'library_wing'
  | 'western_academic_wing'
  | 'admin_numbered_row'
  | 'single_admin_building'
  | 'north_admin_courtyard'
  | 'shaded_carport_bay'
  | 'formal_courtyard_garden'
  | 'southwest_support_hall';

export interface CampusBuilding {
  id: string;
  code: string;
  buildingNumber?: string;
  nameEn: string;
  nameAr: string;
  category: BuildingCategory;
  archetype: ArchitecturalArchetype;
  description: string;
  position: { x: number; z: number };
  dimensions: { width: number; depth: number; height: number };
  rotationY?: number;
  floors: number;
  departments: string[];
  facilities: string[];
  architecturalDetails: {
    facadeMaterial: string;
    roofStructure: string;
    windowPattern: string;
    entranceType: string;
    colorPalette: string;
  };
  accessible: boolean;
  hasRampOrGroundEntry: boolean;
  entryNodeId: string;
  cameraViewPreset: {
    cameraPos: [number, number, number];
    lookAt: [number, number, number];
    walkSpawn: [number, number, number];
    walkYaw: number;
  };
}

export interface RoadSegment {
  id: string;
  name: string;
  start: [number, number];
  end: [number, number];
  width: number;
  hasMedian?: boolean;
  hasStripedCurb?: boolean;
  hasSidewalk?: boolean;
  lampStyle?: 'y_modern' | 'double_globe';
}

export interface NavNode {
  id: string;
  label: string;
  x: number;
  z: number;
  accessible: boolean;
}

export interface NavEdge {
  from: string;
  to: string;
  accessible: boolean;
  roadName: string;
}

export interface CampusTourStop {
  buildingId: string;
  title: string;
  narration: string;
  durationSec: number;
}

export interface CampusTour {
  id: string;
  title: string;
  titleAr: string;
  subtitle: string;
  estimatedMinutes: number;
  stops: CampusTourStop[];
}

export const CAMPUS_MAP_TRANSFORM = {
  u0: 525,
  v0: 595,
  scale: 1.68,
  angleDeg: 11.2,
  cosA: Math.cos((11.2 * Math.PI) / 180),
  sinA: Math.sin((11.2 * Math.PI) / 180),
};

export function worldToCampusSvg(x: number, z: number): { u: number; v: number } {
  const { u0, v0, scale, cosA, sinA } = CAMPUS_MAP_TRANSFORM;
  const u = u0 - scale * (x * cosA - z * sinA);
  const v = v0 - scale * (x * sinA + z * cosA);
  return { u: Number(u.toFixed(1)), v: Number(v.toFixed(1)) };
}

export const CAMPUS_BUILDINGS: CampusBuilding[] = [
  {
    id: 'gate-1',
    code: 'GATE-01',
    buildingNumber: '1',
    nameEn: 'Main Gate 1 — University of Bisha',
    nameAr: 'البوابة الرئيسية ١ — جامعة بيشة',
    category: 'gate',
    archetype: 'main_gate_1',
    description:
      'Primary western vehicular and pedestrian campus portal opposite the Al-Nakheel highway roundabout, featuring a wide white aluminum canopy, University crest, royal blue columns, and central security checkpoint.',
    position: { x: -195, z: -35 },
    dimensions: { width: 14, depth: 24, height: 8.5 },
    rotationY: 0,
    floors: 1,
    departments: ['Campus Security & Access Control', 'Main Visitor Portal'],
    facilities: [
      'Dual Entry & Exit Vehicular Lanes',
      'Central Security Booth',
      'Entry Green Lawn Island with Vertical LED Bollards',
      'Twin Campus Flagpoles (Saudi & University Flags)',
    ],
    architecturalDetails: {
      facadeMaterial: 'White aluminum composite canopy fascia with royal blue column accents',
      roofStructure: 'Flat cantilevered canopy with recessed downlights',
      windowPattern: 'Tinted security booth observation glazing',
      entranceType: 'Dual-lane portal leading to the Entry Green Lawn Plaza',
      colorPalette: 'Crisp White (#F8FAFC), Royal Blue (#1D4ED8), Maroon/White Curbs',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-gate1-plaza',
    cameraViewPreset: {
      cameraPos: [-236, 16, -35],
      lookAt: [-185, 4, -35],
      walkSpawn: [-216, 0, -35],
      walkYaw: -Math.PI / 2,
    },
  },
  {
    id: 'mosque-main',
    code: 'MOSQ-01',
    nameEn: 'University Mosque & Minaret',
    nameAr: 'مسجد الجامعة',
    category: 'mosque',
    archetype: 'campus_mosque',
    description:
      'Central University Mosque situated on the northwest entry plaza, featuring warm sandstone masonry, a square western minaret, central terracotta-red pyramidal dome, arched windows, and manicured lawns.',
    position: { x: -118, z: -118 },
    dimensions: { width: 38, depth: 32, height: 9.5 },
    rotationY: 0,
    floors: 1,
    departments: ['University Prayer Facility & Islamic Center'],
    facilities: [
      'Main Prayer Hall with Central Pyramidal Dome',
      'Square Western Minaret Tower (22m)',
      'Ablution (Wudu) Facilities',
      'Landscaped Western & Southern Green Lawn',
    ],
    architecturalDetails: {
      facadeMaterial: 'Warm sandstone/ochre stone cladding (#C89D70) with black granite base plinth',
      roofStructure: 'Flat roof with stepped crenelated parapet and central terracotta-red pyramidal dome',
      windowPattern: 'Paired and triple tall arched stained-glass windows on southern and western facades',
      entranceType: 'Accessible ground-level prayer hall portals facing the northern avenue plaza',
      colorPalette: 'Warm Ochre Stone (#C89D70), Terracotta Red Dome (#991B1B), Lawn Green (#15803D)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-mosque-south',
    cameraViewPreset: {
      cameraPos: [-134, 16, -74],
      lookAt: [-118, 6, -118],
      walkSpawn: [-118, 0, -90],
      walkYaw: 0,
    },
  },
  {
    id: 'academic-bldg-17',
    code: 'BLDG-17',
    buildingNumber: '17',
    nameEn: 'Building 17 — Preparatory & Basic Sciences Complex',
    nameAr: 'مبنى ١٧ — مبنى السنة التحضيرية والعلوم الأساسية',
    category: 'academic',
    archetype: 'building_18_computing',
    description:
      'Two-story preparatory and basic sciences academic building positioned between the University Mosque and Building 18 along Playground Northern Boulevard.',
    position: { x: -67, z: -118 },
    dimensions: { width: 32, depth: 28, height: 11.0 },
    rotationY: 0,
    floors: 2,
    departments: [
      'Preparatory Year Program (السنة التحضيرية)',
      'Basic Natural Sciences & Mathematics',
    ],
    facilities: [
      'Lecture Halls & Seminar Classrooms',
      'Corner Staircase Tower #17',
      'Shaded Landscaped Front Lawn & Cross-Street Access',
    ],
    architecturalDetails: {
      facadeMaterial: 'Crisp off-white/cream stucco with vertical slate-gray window bay bands',
      roofStructure: 'Flat roof with dark slate coping and corner tower bearing numeral "17"',
      windowPattern: 'Rhythmic 2-story rectangular windows set in vertical slate strips',
      entranceType: 'Dark-glazed front portal with concrete ramp facing Playground Boulevard',
      colorPalette: 'Cream White (#F3EFEA), Slate Gray Stripes (#64748B)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-bldg17-south',
    cameraViewPreset: {
      cameraPos: [-74, 16, -74],
      lookAt: [-67, 5, -118],
      walkSpawn: [-67, 0, -90],
      walkYaw: 0,
    },
  },
  {
    id: 'computing-bldg-18',
    code: 'BLDG-18',
    buildingNumber: '18',
    nameEn: 'Building 18 — College of Computing & Information Technology',
    nameAr: 'مبنى ١٨ — كلية الحاسبات وتقنية المعلومات',
    category: 'academic',
    archetype: 'building_18_computing',
    description:
      'College of Computing and Information Technology featuring a crisp two-story cream stucco facade, slate vertical window bays, twin dark-glass entrance portals with gold Arabic signage, and accessible ramps.',
    position: { x: -9, z: -118 },
    dimensions: { width: 44, depth: 28, height: 11.0 },
    rotationY: 0,
    floors: 2,
    departments: [
      'College of Computing and Information Technology (كلية الحاسبات وتقنية المعلومات)',
      'Department of Computer Science',
      'Department of Information Systems & Cybersecurity',
    ],
    facilities: [
      'Computing & AI Laboratories',
      'Twin Main Portals with Accessibility Ramps',
      'Corner Staircase Tower #18',
      'Lecture Rooms & Faculty Offices',
    ],
    architecturalDetails: {
      facadeMaterial: 'Crisp off-white/cream stucco with vertical slate-gray window bay bands',
      roofStructure: 'Flat roof with projecting 3-level corner stair tower bearing numeral "18"',
      windowPattern: 'Rhythmic 2-story rectangular windows set in vertical gray spandrel strips',
      entranceType: 'Two grand dark-glazed portals with gold illuminated Arabic college titles and steel-railed ramps',
      colorPalette: 'Cream White (#F3EFEA), Slate Gray Stripes (#64748B), Gold Signage (#F59E0B)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-bldg18-south',
    cameraViewPreset: {
      cameraPos: [-18, 16, -74],
      lookAt: [-9, 5, -118],
      walkSpawn: [-9, 0, -90],
      walkYaw: 0,
    },
  },
  {
    id: 'academic-bldg-19',
    code: 'BLDG-19',
    buildingNumber: '19',
    nameEn: 'Building 19 — 3-Story Academic Building',
    nameAr: 'مبنى ١٩ — المبنى الأكاديمي (ثلاثة طوابق)',
    category: 'academic',
    archetype: 'pilaster_academic_19',
    description:
      'Three-story academic building east of Building 18 featuring cream stucco walls, projecting tan sandstone pilasters with stepped parapet finials, recessed twin window bays, and a checkerboard tiled front plaza.',
    position: { x: 36, z: -118 },
    dimensions: { width: 36, depth: 28, height: 13.5 },
    rotationY: 0,
    floors: 3,
    departments: [
      'Academic Lecture Halls & Science Laboratories',
      'Shared College Classrooms (Building 19)',
    ],
    facilities: [
      '3 Stories of Lecture Halls',
      'Central Portal with University Crest & Numeral 19',
      'Red-and-Yellow Checkerboard Tiled Pedestrian Plaza',
      'Side Ramped & Stepped Entrances',
    ],
    architecturalDetails: {
      facadeMaterial: 'Cream/off-white stucco articulated by projecting vertical tan/sandstone pilasters',
      roofStructure: 'Flat roof with stepped crenelated parapet finials crowning each vertical pilaster',
      windowPattern: 'Recessed vertical bays containing 3 stories of twin dark-glazed rectangular windows',
      entranceType: 'Central tower portal with numeral "19" and University crest above dark-glazed doors',
      colorPalette: 'Cream Stucco (#F5EFE6), Warm Tan Pilasters (#C8A98E), Checkerboard Red/Yellow Pavers',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-bldg19-south',
    cameraViewPreset: {
      cameraPos: [26, 16, -74],
      lookAt: [36, 6, -118],
      walkSpawn: [36, 0, -90],
      walkYaw: -0.2,
    },
  },
  {
    id: 'academic-bldg-15',
    code: 'BLDG-15',
    buildingNumber: '15',
    nameEn: 'Building 15 — Applied Colleges Wing (North-West)',
    nameAr: 'مبنى ١٥ — مجمع الكليات التطبيقية الشمالي',
    category: 'academic',
    archetype: 'building_18_computing',
    description:
      'Two-story northwestern applied sciences and vocational labs wing located along the Inner Academic Boulevard across from the University Mosque.',
    position: { x: -118, z: -202 },
    dimensions: { width: 42, depth: 34, height: 11.5 },
    rotationY: 0,
    floors: 2,
    departments: ['Applied Sciences & Vocational Labs (Building 15)'],
    facilities: ['Lecture Classrooms', 'Stair Tower #15', 'Accessible Front Plaza'],
    architecturalDetails: {
      facadeMaterial: 'Off-white stucco with slate vertical window strips',
      roofStructure: 'Flat roof with corner stair tower bearing numeral "15"',
      windowPattern: '2-story vertical window bays',
      entranceType: 'Glazed accessible entrance facing Inner Academic Boulevard',
      colorPalette: 'Cream White (#F3EFEA), Slate Gray (#64748B)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-north-inner-west',
    cameraViewPreset: {
      cameraPos: [-118, 18, -158],
      lookAt: [-118, 6, -202],
      walkSpawn: [-118, 0, -172],
      walkYaw: 0,
    },
  },
  {
    id: 'academic-bldg-16',
    code: 'BLDG-16',
    buildingNumber: '16',
    nameEn: 'Building 16 — College of Sciences & Medical Labs (North Front)',
    nameAr: 'مبنى ١٦ — كلية العلوم والمختبرات الطبية',
    category: 'academic',
    archetype: 'pilaster_academic_19',
    description:
      'Three-story College of Sciences and Medical Labs complex facing the Inner Academic Boulevard with tan sandstone pilasters, stepped roof finials, and a ceremonial checkerboard plaza.',
    position: { x: -24, z: -202 },
    dimensions: { width: 58, depth: 36, height: 14.5 },
    rotationY: 0,
    floors: 3,
    departments: [
      'College of Science (كلية العلوم)',
      'Biological & Medical Reference Laboratories',
    ],
    facilities: [
      '3 Stories of Teaching & Research Labs',
      'Central Portal Bearing Numeral "16"',
      'Checkerboard Ceremonial Plaza Facing Inner Boulevard',
    ],
    architecturalDetails: {
      facadeMaterial: 'Cream stucco with projecting vertical tan pilasters and stepped parapet finials',
      roofStructure: 'Flat roof with central tower bearing numeral "16"',
      windowPattern: 'Three-story recessed twin window bays',
      entranceType: 'Central monumental portal with ramped plaza',
      colorPalette: 'Cream Stucco (#F5EFE6), Warm Tan Pilasters (#C8A98E)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-north-inner-mid',
    cameraViewPreset: {
      cameraPos: [-24, 22, -148],
      lookAt: [-24, 7, -202],
      walkSpawn: [-24, 0, -172],
      walkYaw: 0,
    },
  },
  {
    id: 'academic-bldg-14',
    code: 'BLDG-14',
    buildingNumber: '14',
    nameEn: 'Building 14 — North Engineering & Research Wing',
    nameAr: 'مبنى ١٤ — جناح الهندسة والأبحاث الشمالي',
    category: 'academic',
    archetype: 'pilaster_academic_19',
    description:
      'Three-story northern engineering and research wing facing the Inner Academic Boulevard with sandstone pilasters and ramped entrance plaza.',
    position: { x: 34, z: -202 },
    dimensions: { width: 36, depth: 36, height: 13.0 },
    rotationY: 0,
    floors: 3,
    departments: ['Engineering Studios & Faculty Offices (Building 14)'],
    facilities: ['3 Stories of Academic Classrooms', 'Stair Tower #14', 'Checkerboard Sidewalk'],
    architecturalDetails: {
      facadeMaterial: 'Cream stucco with sandstone pilasters',
      roofStructure: 'Flat roof with stepped parapet',
      windowPattern: '3-story recessed dark-glazed windows',
      entranceType: 'Central entrance portal facing Inner Academic Boulevard',
      colorPalette: 'Cream Stucco (#F5EFE6), Warm Tan (#C8A98E)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-north-inner-east',
    cameraViewPreset: {
      cameraPos: [34, 20, -148],
      lookAt: [34, 6, -202],
      walkSpawn: [34, 0, -172],
      walkYaw: 0,
    },
  },
  {
    id: 'arts-bldg-20',
    code: 'BLDG-20',
    buildingNumber: '20',
    nameEn: 'Building 20 — Deanship of the College of Arts',
    nameAr: 'مبنى ٢٠ — عمادة كلية الآداب',
    category: 'academic',
    archetype: 'building_20_arts',
    description:
      'Deanship of the College of Arts positioned immediately east of the Football Playground behind a dense grove of date palms, featuring warm desert beige stucco and corner tower #20.',
    position: { x: 35, z: -48 },
    dimensions: { width: 28, depth: 36, height: 10.0 },
    rotationY: 0,
    floors: 2,
    departments: [
      'Deanship of the College of Arts (عمادة كلية الآداب)',
      'Department of Arabic & English Languages',
      'Humanities & Social Sciences Seminar Rooms',
    ],
    facilities: ['Deanship Offices', 'Academic Wings', 'Shaded Date Palm Courtyard'],
    architecturalDetails: {
      facadeMaterial: 'Warm desert beige stucco with dark base plinth and corner tower labeled "20"',
      roofStructure: 'Flat multi-wing roof with corner stair bulkhead and white rooftop service tanks',
      windowPattern: 'Two-story rectangular multi-pane windows',
      entranceType: 'Accessible entrances facing the Northern and Eastern avenues',
      colorPalette: 'Desert Beige (#E5D3BD), Charcoal Numeral "20" (#1E293B), Palm Green (#15803D)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-bldg20-north',
    cameraViewPreset: {
      cameraPos: [14, 14, -76],
      lookAt: [35, 5, -48],
      walkSpawn: [48, 0, -76],
      walkYaw: Math.PI * 0.85,
    },
  },
  {
    id: 'sports-football-pitch',
    code: 'SPRT-02',
    nameEn: 'University Football Playground & Stadium',
    nameAr: 'الملعب الرياضي لكرة القدم',
    category: 'sports',
    archetype: 'sports_pitch',
    description:
      'Full-size irrigated turf football stadium in the central campus core, bordered by sculpted ornamental green shrubs and planter beds, chain-link fencing, and six high-mast floodlight towers.',
    position: { x: -26, z: 12 },
    dimensions: { width: 70, depth: 110, height: 1.5 },
    rotationY: 0,
    floors: 1,
    departments: ['Deanship of Student Affairs — University Athletics'],
    facilities: [
      'Full-Size FIFA Irrigated Turf Football Pitch (110m x 70m)',
      '6 High-Mast Floodlight Towers',
      'Sculpted Ornamental Green Plants & Planter Bed Border',
      'Dual Regulation Goalposts & Corner Flags',
    ],
    architecturalDetails: {
      facadeMaterial: 'Irrigated emerald turf enclosed by chain-link fence and multi-layered living ornamental green shrubs & planter beds',
      roofStructure: 'Open-air stadium illuminated by 6 high-mast floodlight towers',
      windowPattern: 'N/A',
      entranceType: 'Ground-level field gates',
      colorPalette: 'Emerald Turf (#15803D), Sculpted Foliage Greens (#14532D / #22C55E), White Lines',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-bldg18-south',
    cameraViewPreset: {
      cameraPos: [-78, 52, -74],
      lookAt: [-26, 1, 12],
      walkSpawn: [-46, 0, -56],
      walkYaw: Math.PI * 0.85,
    },
  },
  {
    id: 'sports-stadium-stands',
    code: 'SPRT-STANDS',
    nameEn: 'Football Stadium Spectator Grandstand',
    nameAr: 'مدرجات المشاهدين لملعب كرة القدم',
    category: 'sports',
    archetype: 'football_grandstand',
    description:
      'Tiered spectator grandstand along the eastern sideline of the football pitch featuring royal blue and white seating rows, a cantilevered sun-shade canopy, and accessible viewing platforms.',
    position: { x: 35, z: 22 },
    dimensions: { width: 14, depth: 88, height: 7.5 },
    rotationY: 0,
    floors: 1,
    departments: ['Athletics Spectator Facilities & Match Seating'],
    facilities: [
      'Tiered Stadium Seating (Royal Blue & White)',
      'Cantilevered Sun-Shade Canopy Roof',
      'Integrated High-Mast Match Floodlights',
      'Wheelchair Accessible Spectator Viewing Platform',
    ],
    architecturalDetails: {
      facadeMaterial: 'Precast structural concrete seating steps with powder-coated blue seats and steel railings',
      roofStructure: 'Cantilevered white tensile steel shade canopy',
      windowPattern: 'Open-air tiered grandstand',
      entranceType: 'Dual ground-level ramped spectator vomitories',
      colorPalette: 'Royal Blue Seats (#1D4ED8), White Canopy (#F8FAFC), Concrete Gray (#94A3B8)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-stadium-stands',
    cameraViewPreset: {
      cameraPos: [64, 22, 22],
      lookAt: [35, 4, 22],
      walkSpawn: [52, 0, 22],
      walkYaw: -Math.PI / 2,
    },
  },
  {
    id: 'sports-court-1',
    code: 'SPRT-C1',
    nameEn: 'Small Playground 1 — Basketball & Volleyball Hardcourt',
    nameAr: 'الملاعب الصغيرة ١ — ملعب كرة السلة والطائرة',
    category: 'sports',
    archetype: 'single_sport_court',
    description:
      'Outdoor basketball and volleyball hardcourt featuring acrylic red-and-green athletic surfacing, regulation hoops, perimeter fencing, and corner floodlights.',
    position: { x: -118, z: -56 },
    dimensions: { width: 26, depth: 26, height: 4.5 },
    rotationY: 0,
    floors: 1,
    departments: ['Student Affairs — Recreation & Outdoor Sports'],
    facilities: ['Regulation Basketball Court', 'Volleyball Posts', 'LED Match Floodlights'],
    architecturalDetails: {
      facadeMaterial: 'High-durability acrylic athletic surfacing (#B91C1C and #15803D) with dark perimeter fence',
      roofStructure: 'Open-air court with 4 corner floodlight pylons',
      windowPattern: 'N/A',
      entranceType: 'Ground-level court gates',
      colorPalette: 'Acrylic Red (#B91C1C), Court Green (#15803D), White Boundaries',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-gate1-plaza',
    cameraViewPreset: {
      cameraPos: [-152, 16, -56],
      lookAt: [-118, 2, -56],
      walkSpawn: [-138, 0, -56],
      walkYaw: -Math.PI * 0.6,
    },
  },
  {
    id: 'sports-court-2',
    code: 'SPRT-C2',
    nameEn: 'Small Playground 2 — Tennis & Futsal Hardcourt',
    nameAr: 'الملاعب الصغيرة ٢ — ملعب التنس والأنشطة',
    category: 'sports',
    archetype: 'single_sport_court',
    description:
      'Outdoor tennis and futsal hardcourt located south of Court 1 with emerald acrylic surfacing, center net, and safety enclosure.',
    position: { x: -118, z: -14 },
    dimensions: { width: 26, depth: 26, height: 4.5 },
    rotationY: 0,
    floors: 1,
    departments: ['Student Affairs — Tennis & Racquet Sports'],
    facilities: ['Regulation Tennis Hardcourt', 'Steel Tension Net', 'Perimeter Safety Enclosure'],
    architecturalDetails: {
      facadeMaterial: 'Emerald-green acrylic sport surfacing with white baseline striping',
      roofStructure: 'Open-air hardcourt',
      windowPattern: 'N/A',
      entranceType: 'Ground-level court access gate',
      colorPalette: 'Court Green (#15803D), Border Red (#B91C1C), White Lines',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-gate1-plaza',
    cameraViewPreset: {
      cameraPos: [-152, 16, -14],
      lookAt: [-118, 2, -14],
      walkSpawn: [-138, 0, -14],
      walkYaw: -Math.PI * 0.6,
    },
  },
  {
    id: 'sports-gym-hall',
    code: 'SPRT-01',
    nameEn: 'Red-Roof Indoor Sports Hall & Athletics Center',
    nameAr: 'الصالة الرياضية المغطاة (السقف الأحمر)',
    category: 'sports',
    archetype: 'red_roof_gym',
    description:
      'Red-roof indoor sports hall and athletics center situated south of the outdoor courts, featuring a terracotta hipped roof, cream pilaster walls, and a classical western pediment portico.',
    position: { x: -118, z: 34 },
    dimensions: { width: 34, depth: 26, height: 9.0 },
    rotationY: 0,
    floors: 1,
    departments: ['Deanship of Student Affairs — Indoor Athletics'],
    facilities: ['Indoor Basketball & Volleyball Arena', 'Fitness Studio', 'Team Locker Rooms'],
    architecturalDetails: {
      facadeMaterial: 'Warm beige panel walls with white pilasters and exterior AC units',
      roofStructure: 'Terracotta-red pitched hip roof (#991B1B)',
      windowPattern: 'Upper clerestory band glazing',
      entranceType: 'Classical white triangular pediment portico on the West facade',
      colorPalette: 'Terracotta Red (#991B1B), Warm Beige (#E6D5C3), Crisp White',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-west-mid',
    cameraViewPreset: {
      cameraPos: [-156, 18, 34],
      lookAt: [-118, 4.5, 34],
      walkSpawn: [-142, 0, 34],
      walkYaw: -Math.PI / 2,
    },
  },
  {
    id: 'bldg-north-courtyard',
    code: 'BLDG-NC1',
    nameEn: 'North Campus Administration & Protocol Pavilion',
    nameAr: 'المجمع الإداري الشمالي — مبنى المراسم والضيافة',
    category: 'administration',
    archetype: 'north_admin_courtyard',
    description:
      'Two-story square courtyard administration and protocol complex at the northern terminus of the eastern administration boulevard, wrapping a central landscaped atrium.',
    position: { x: 154, z: -202 },
    dimensions: { width: 40, depth: 38, height: 10.5 },
    rotationY: 0,
    floors: 2,
    departments: ['University Protocol & External Delegations', 'Executive Conference Center'],
    facilities: ['Central Landscaped Courtyard', 'VIP Reception Atrium', 'Conference Boardroom'],
    architecturalDetails: {
      facadeMaterial: 'Warm desert tan stucco (#DFC8AE) with stepped corner pilasters and dark base plinth',
      roofStructure: 'Flat roof with stepped parapet surrounding central open-air atrium',
      windowPattern: 'Rhythmic 2-story rectangular tinted windows',
      entranceType: 'Ceremonial covered entrance portico facing the inner northern avenue',
      colorPalette: 'Desert Tan (#DFC8AE), Bronze Glazing, Black Plinth',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-east-north',
    cameraViewPreset: {
      cameraPos: [112, 24, -158],
      lookAt: [154, 5, -202],
      walkSpawn: [130, 0, -166],
      walkYaw: Math.PI * 0.25,
    },
  },
  {
    id: 'bldg-01',
    code: 'BLDG-01',
    buildingNumber: '1',
    nameEn: 'Building 1 — University Administration & Admissions',
    nameAr: 'مبنى ١ — عمادة القبول والتسجيل وإدارة الجامعة',
    category: 'administration',
    archetype: 'single_admin_building',
    description:
      'Two-story modular administration block housing Admissions and Registration along Eastern Administration Boulevard, featuring a projecting corner stair tower bearing numeral 1 and accessible ramps.',
    position: { x: 152, z: -80 },
    dimensions: { width: 26, depth: 18, height: 10.5 },
    rotationY: 0,
    floors: 2,
    departments: ['Deanship of Admissions & Registration (عمادة القبول والتسجيل)', 'Student Records & Matriculation'],
    facilities: ['Main Admissions Hall', 'Registration Service Counters', 'Corner Stair Tower #1'],
    architecturalDetails: {
      facadeMaterial: 'Warm desert tan stucco (#DFC8AE) with charcoal base plinth and projecting stair tower',
      roofStructure: 'Flat roof with parapet and blue numeral "1" on northwest corner stair tower',
      windowPattern: 'Horizontal multi-pane rectangular windows on floors 1 and 2',
      entranceType: 'Recessed corner entrance portal with concrete landing and wheelchair ramp',
      colorPalette: 'Warm Tan (#DFC8AE), Royal Blue Numeral (#1D4ED8), Charcoal Plinth',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-east-north',
    cameraViewPreset: {
      cameraPos: [116, 15, -80],
      lookAt: [152, 5, -80],
      walkSpawn: [128, 0, -80],
      walkYaw: Math.PI / 2,
    },
  },
  {
    id: 'bldg-02',
    code: 'BLDG-02',
    buildingNumber: '2',
    nameEn: 'Building 2 — Deanship of Student Affairs',
    nameAr: 'مبنى ٢ — عمادة شؤون الطلاب',
    category: 'administration',
    archetype: 'single_admin_building',
    description:
      'Two-story modular administration block housing the Deanship of Student Affairs along Eastern Administration Boulevard, featuring corner stair tower #2 and ramped access.',
    position: { x: 152, z: -53 },
    dimensions: { width: 26, depth: 18, height: 10.5 },
    rotationY: 0,
    floors: 2,
    departments: ['Deanship of Student Affairs (عمادة شؤون الطلاب)', 'Student Activities & Counseling'],
    facilities: ['Student Counseling Offices', 'Extracurricular Activities Hub', 'Corner Stair Tower #2'],
    architecturalDetails: {
      facadeMaterial: 'Desert tan stucco with dark base plinth and stair tower with blue numeral "2"',
      roofStructure: 'Flat roof with parapet',
      windowPattern: 'Horizontal multi-pane windows',
      entranceType: 'Ramped corner portal',
      colorPalette: 'Tan Stucco (#DFC8AE), Blue Numeral (#1D4ED8)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-east-north',
    cameraViewPreset: {
      cameraPos: [116, 15, -53],
      lookAt: [152, 5, -53],
      walkSpawn: [128, 0, -53],
      walkYaw: Math.PI / 2,
    },
  },
  {
    id: 'bldg-03',
    code: 'BLDG-03',
    buildingNumber: '3',
    nameEn: 'Building 3 — Academic Development & Quality',
    nameAr: 'مبنى ٣ — عمادة التطوير الأكاديمي والجودة',
    category: 'administration',
    archetype: 'single_admin_building',
    description:
      'Two-story modular administration block housing Academic Development and Quality along Eastern Administration Boulevard, featuring corner stair tower #3 and security bollards.',
    position: { x: 152, z: -26 },
    dimensions: { width: 26, depth: 18, height: 10.5 },
    rotationY: 0,
    floors: 2,
    departments: ['Deanship of Academic Development & Quality (عمادة التطوير والجودة)', 'Curriculum Accreditation'],
    facilities: ['Accreditation Meeting Rooms', 'Quality Auditing Center', 'Corner Stair Tower #3'],
    architecturalDetails: {
      facadeMaterial: 'Warm desert tan stucco with black base plinth',
      roofStructure: 'Flat roof with corner tower labeled "3"',
      windowPattern: 'Horizontal 2-story multi-pane glazing',
      entranceType: 'Accessible entrance with concrete bollards',
      colorPalette: 'Desert Tan (#DFC8AE), Royal Blue Numeral (#1D4ED8)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-east-bldg10',
    cameraViewPreset: {
      cameraPos: [116, 15, -26],
      lookAt: [152, 5, -26],
      walkSpawn: [128, 0, -26],
      walkYaw: Math.PI / 2,
    },
  },
  {
    id: 'bldg-04',
    code: 'BLDG-04',
    buildingNumber: '4',
    nameEn: 'Building 4 — Graduate Studies & Research',
    nameAr: 'مبنى ٤ — عمادة الدراسات العليا والبحث العلمي',
    category: 'administration',
    archetype: 'single_admin_building',
    description:
      'Two-story modular administration block housing Graduate Studies and Scientific Research, featuring warm tan stucco, black base plinth, and corner stair tower #4.',
    position: { x: 152, z: 1 },
    dimensions: { width: 26, depth: 18, height: 10.5 },
    rotationY: 0,
    floors: 2,
    departments: ['Deanship of Graduate Studies & Scientific Research', 'Research Grants Office'],
    facilities: ['Postgraduate Administration', 'Thesis Defense Chamber', 'Corner Stair Tower #4'],
    architecturalDetails: {
      facadeMaterial: 'Warm tan stucco (#DFC8AE) with black base plinth',
      roofStructure: 'Flat roof with parapet',
      windowPattern: 'Horizontal multi-pane windows',
      entranceType: 'Ramped corner entrance portal',
      colorPalette: 'Tan Stucco (#DFC8AE), Royal Blue Numeral (#1D4ED8)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-east-bldg10',
    cameraViewPreset: {
      cameraPos: [116, 15, 1],
      lookAt: [152, 5, 1],
      walkSpawn: [128, 0, 1],
      walkYaw: Math.PI / 2,
    },
  },
  {
    id: 'bldg-05',
    code: 'BLDG-05',
    buildingNumber: '5',
    nameEn: 'Building 5 — Financial Affairs & Procurement',
    nameAr: 'مبنى ٥ — الإدارة العامة للشؤون المالية والمشتريات',
    category: 'administration',
    archetype: 'single_admin_building',
    description:
      'Two-story modular administration block housing Financial Affairs and Procurement, featuring corner stair tower #5 and accessible front plaza.',
    position: { x: 152, z: 28 },
    dimensions: { width: 26, depth: 18, height: 10.5 },
    rotationY: 0,
    floors: 2,
    departments: ['Directorate of Financial Affairs & Procurement', 'Budgeting & Payroll'],
    facilities: ['Finance Directorate Offices', 'Procurement Counter', 'Corner Stair Tower #5'],
    architecturalDetails: {
      facadeMaterial: 'Warm desert tan stucco with black base plinth',
      roofStructure: 'Flat roof with stair tower labeled "5"',
      windowPattern: 'Two-story window bands',
      entranceType: 'Wheelchair ramped portal',
      colorPalette: 'Tan Stucco (#DFC8AE), Royal Blue Numeral (#1D4ED8)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-east-mid',
    cameraViewPreset: {
      cameraPos: [116, 15, 28],
      lookAt: [152, 5, 28],
      walkSpawn: [128, 0, 28],
      walkYaw: Math.PI / 2,
    },
  },
  {
    id: 'bldg-06',
    code: 'BLDG-06',
    buildingNumber: '6',
    nameEn: 'Building 6 — Human Resources & Faculty',
    nameAr: 'مبنى ٦ — الإدارة العامة للموارد البشرية وأعضاء هيئة التدريس',
    category: 'administration',
    archetype: 'single_admin_building',
    description:
      'Two-story modular administration block housing Human Resources and Faculty Affairs along Eastern Administration Boulevard, featuring corner stair tower #6.',
    position: { x: 152, z: 55 },
    dimensions: { width: 26, depth: 18, height: 10.5 },
    rotationY: 0,
    floors: 2,
    departments: ['Directorate of Human Resources (الموارد البشرية)', 'Faculty Affairs & Employment'],
    facilities: ['Employee Services Center', 'Faculty Affairs Offices', 'Corner Stair Tower #6'],
    architecturalDetails: {
      facadeMaterial: 'Warm tan stucco (#DFC8AE) with black base plinth',
      roofStructure: 'Flat roof with stair tower labeled "6"',
      windowPattern: 'Horizontal multi-pane glazing',
      entranceType: 'Ramped corner entrance portal',
      colorPalette: 'Tan Stucco (#DFC8AE), Royal Blue Numeral (#1D4ED8)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-east-mid',
    cameraViewPreset: {
      cameraPos: [116, 15, 55],
      lookAt: [152, 5, 55],
      walkSpawn: [128, 0, 55],
      walkYaw: Math.PI / 2,
    },
  },
  {
    id: 'bldg-07',
    code: 'BLDG-07',
    buildingNumber: '7',
    nameEn: 'Building 7 — Information Technology & Cybersecurity',
    nameAr: 'مبنى ٧ — الإدارة العامة لتقنية المعلومات والأمن السيبراني',
    category: 'administration',
    archetype: 'single_admin_building',
    description:
      'Two-story modular administration block housing Information Technology and Cybersecurity operations, featuring corner stair tower #7 and ramped corner entry.',
    position: { x: 152, z: 82 },
    dimensions: { width: 26, depth: 18, height: 10.5 },
    rotationY: 0,
    floors: 2,
    departments: ['Directorate of Information Technology & Cybersecurity', 'Enterprise Network Operations'],
    facilities: ['Central University Server Hub', 'Campus IT Helpdesk', 'Corner Stair Tower #7'],
    architecturalDetails: {
      facadeMaterial: 'Desert tan stucco with dark base plinth',
      roofStructure: 'Flat roof with parapet',
      windowPattern: 'Horizontal multi-pane windows',
      entranceType: 'Ramped entrance with steel handrail',
      colorPalette: 'Tan Stucco (#DFC8AE), Royal Blue Numeral (#1D4ED8)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-east-mid',
    cameraViewPreset: {
      cameraPos: [116, 15, 82],
      lookAt: [152, 5, 82],
      walkSpawn: [128, 0, 82],
      walkYaw: Math.PI / 2,
    },
  },
  {
    id: 'bldg-08',
    code: 'BLDG-08',
    buildingNumber: '8',
    nameEn: 'Building 8 — Facilities & Projects Maintenance',
    nameAr: 'مبنى ٨ — الإدارة العامة للمشاريع والصيانة',
    category: 'administration',
    archetype: 'single_admin_building',
    description:
      'Two-story modular administration block housing Facilities, Projects, and Maintenance operations, featuring corner stair tower #8.',
    position: { x: 152, z: 109 },
    dimensions: { width: 26, depth: 18, height: 10.5 },
    rotationY: 0,
    floors: 2,
    departments: ['Directorate of Projects, Facilities & Maintenance', 'Campus Operations & Safety'],
    facilities: ['Engineering & Projects Office', 'Maintenance Dispatch Desk', 'Corner Stair Tower #8'],
    architecturalDetails: {
      facadeMaterial: 'Warm desert tan stucco with black base plinth',
      roofStructure: 'Flat roof with stair tower labeled "8"',
      windowPattern: 'Two-story window bands',
      entranceType: 'Wheelchair ramped portal',
      colorPalette: 'Tan Stucco (#DFC8AE), Royal Blue Numeral (#1D4ED8)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-east-mid',
    cameraViewPreset: {
      cameraPos: [116, 15, 109],
      lookAt: [152, 5, 109],
      walkSpawn: [128, 0, 109],
      walkYaw: Math.PI / 2,
    },
  },
  {
    id: 'bldg-09',
    code: 'BLDG-09',
    buildingNumber: '9',
    nameEn: 'Building 9 — Community Service & Continuing Education',
    nameAr: 'مبنى ٩ — عمادة خدمة المجتمع والتعليم المستمر',
    category: 'administration',
    archetype: 'single_admin_building',
    description:
      'Two-story modular administration block housing Community Service and Continuing Education, featuring corner stair tower #9 and front pedestrian walkway.',
    position: { x: 152, z: 136 },
    dimensions: { width: 26, depth: 18, height: 10.5 },
    rotationY: 0,
    floors: 2,
    departments: ['Deanship of Community Service & Continuing Education', 'Professional Training Programs'],
    facilities: ['Public Training Rooms', 'Community Outreach Center', 'Corner Stair Tower #9'],
    architecturalDetails: {
      facadeMaterial: 'Tan stucco with dark base plinth and blue numeral "9"',
      roofStructure: 'Flat roof with parapet',
      windowPattern: 'Horizontal multi-pane glazing',
      entranceType: 'Ramped corner entrance',
      colorPalette: 'Tan Stucco (#DFC8AE), Royal Blue Numeral (#1D4ED8)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-east-south',
    cameraViewPreset: {
      cameraPos: [116, 15, 136],
      lookAt: [152, 5, 136],
      walkSpawn: [128, 0, 136],
      walkYaw: Math.PI / 2,
    },
  },
  {
    id: 'bldg-10',
    code: 'BLDG-10',
    buildingNumber: '10',
    nameEn: 'Building 10 — Institutional Communication & Media',
    nameAr: 'مبنى ١٠ — الإدارة العامة للاتصال المؤسسي والإعلام',
    category: 'administration',
    archetype: 'single_admin_building',
    description:
      'Two-story modular administration block housing Institutional Communication and Media, featuring corner stair tower #10, concrete bollards, and ramped landing.',
    position: { x: 152, z: 163 },
    dimensions: { width: 26, depth: 18, height: 10.5 },
    rotationY: 0,
    floors: 2,
    departments: ['Directorate of Institutional Communication & Media', 'Official University Press Office'],
    facilities: ['Media Production Studio', 'Press Briefing Room', 'Corner Stair Tower #10'],
    architecturalDetails: {
      facadeMaterial: 'Warm desert tan stucco with black base plinth and blue numeral "10"',
      roofStructure: 'Flat roof with stair tower labeled "10"',
      windowPattern: 'Horizontal multi-pane glazing',
      entranceType: 'Ramped corner entrance with concrete bollards',
      colorPalette: 'Tan Stucco (#DFC8AE), Royal Blue Numeral (#1D4ED8)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-east-south',
    cameraViewPreset: {
      cameraPos: [116, 15, 163],
      lookAt: [152, 5, 163],
      walkSpawn: [128, 0, 163],
      walkYaw: Math.PI / 2,
    },
  },
  {
    id: 'bldg-11',
    code: 'BLDG-11',
    buildingNumber: '11',
    nameEn: 'Building 11 — University Rectorate & Vice-Rectorates',
    nameAr: 'مبنى ١١ — مكتب معالي رئيس الجامعة وإدارة الجامعة',
    category: 'administration',
    archetype: 'single_admin_building',
    description:
      'Two-story modular administration block housing the University Rectorate and Executive Council offices at the southern end of the administration row, featuring corner stair tower #11.',
    position: { x: 152, z: 190 },
    dimensions: { width: 26, depth: 18, height: 10.5 },
    rotationY: 0,
    floors: 2,
    departments: ['University Rectorate (مكتب معالي رئيس الجامعة)', 'Vice-Rectorate for Academic Affairs', 'Executive Council Chamber'],
    facilities: ['Rectorate Executive Boardroom', 'VIP Protocol Suite', 'Corner Stair Tower #11'],
    architecturalDetails: {
      facadeMaterial: 'Warm desert tan stucco with black base plinth and blue numeral "11"',
      roofStructure: 'Flat roof with projecting stair tower labeled "11"',
      windowPattern: 'Horizontal multi-pane windows',
      entranceType: 'Ramped entrance with steel handrails and concrete bollards',
      colorPalette: 'Tan Stucco (#DFC8AE), Royal Blue Numeral (#1D4ED8)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-east-south',
    cameraViewPreset: {
      cameraPos: [116, 15, 190],
      lookAt: [152, 5, 190],
      walkSpawn: [128, 0, 190],
      walkYaw: Math.PI / 2,
    },
  },
  {
    id: 'garden-south-courtyard',
    code: 'GRDN-01',
    nameEn: 'Formal Four-Quadrant Courtyard Garden',
    nameAr: 'الحديقة الهندسية والساحة الجنوبية',
    category: 'garden',
    archetype: 'formal_courtyard_garden',
    description:
      'Symmetrical four-quadrant landscaped courtyard garden at the southern end of the eastern administration boulevard with cross-axial checkerboard walkways and central plaza feature.',
    position: { x: 150, z: 248 },
    dimensions: { width: 34, depth: 26, height: 1.5 },
    rotationY: 0,
    floors: 1,
    departments: ['Campus Landscaping & Ceremonial Plaza'],
    facilities: ['Four-Quadrant Geometric Lawns', 'Axial Tiled Walkways', 'Central Ceremonial Plinth'],
    architecturalDetails: {
      facadeMaterial: 'Manicured turf quadrants framed by red-and-yellow checkerboard pavers and curbs',
      roofStructure: 'Open-Air Parterre Garden',
      windowPattern: 'N/A',
      entranceType: 'Four cardinal pedestrian pathways',
      colorPalette: 'Lawn Green (#15803D), Checkerboard Pavers (#B45309 / #EAB308)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-east-south',
    cameraViewPreset: {
      cameraPos: [114, 28, 248],
      lookAt: [150, 1, 248],
      walkSpawn: [128, 0, 248],
      walkYaw: -Math.PI / 2,
    },
  },
  {
    id: 'gate-2',
    code: 'GATE-02',
    buildingNumber: '2',
    nameEn: 'Gate 2 — Southeastern Monumental Portal',
    nameAr: 'البوابة الثانية — جامعة بيشة',
    category: 'gate',
    archetype: 'gate_2',
    description:
      'Southeastern monumental portal adjacent to the Formal Courtyard Garden, featuring a dark-navy framed central tower with brushed silver aluminum cladding, University emblem, and twin horizontal wing canopies.',
    position: { x: 195, z: 272 },
    dimensions: { width: 32, depth: 10, height: 11.5 },
    rotationY: Math.PI / 2,
    floors: 2,
    departments: ['Southeastern Ceremonial Portal & Administration Access Control'],
    facilities: ['Monumental Central Pylon Tower', 'Twin Vehicular Wing Canopies', 'Security Room'],
    architecturalDetails: {
      facadeMaterial: 'Brushed silver aluminum cladding framed in deep navy-charcoal steel casing',
      roofStructure: 'Monumental flat-topped central pylon with twin horizontal wing canopies',
      windowPattern: 'Two recessed service windows and ground-level white paneled security door',
      entranceType: 'Dual-lane vehicular portal at the South-East corner of the Formal Courtyard Garden',
      colorPalette: 'Brushed Silver (#CBD5E1), Deep Navy (#0F172A), Crest Teal (#0284C7)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-gate2-portal',
    cameraViewPreset: {
      cameraPos: [236, 12, 272],
      lookAt: [195, 5.5, 272],
      walkSpawn: [220, 0, 272],
      walkYaw: Math.PI / 2,
    },
  },
  {
    id: 'library-main',
    code: 'LIB-01',
    nameEn: 'University Central Library — Academic Reading & Main Hall',
    nameAr: 'مكتبة الجامعة المركزية — مبنى القراءة الرئيسي',
    category: 'library',
    archetype: 'university_library',
    description:
      'Monumental five-story University Central Library spanning the entire southern sector behind the football stadium, featuring ivory-limestone cladding, sandstone pilasters, reading hall ribbon windows, and University emblems illuminated at night.',
    position: { x: -44, z: 143 },
    dimensions: { width: 176, depth: 106, height: 22.0 },
    rotationY: 0,
    floors: 5,
    departments: [
      'Deanship of Library Affairs (عمادة شؤون المكتبات)',
      'Central Academic Reference & Digital Archives',
      'Quiet Study Halls & Research Carrels',
    ],
    facilities: [
      'Five-Story Full-Width Rectilinear Reading & Reference Complex',
      'Illuminated University of Bisha Logo Facade (Facing Football Ground)',
      'Terraced Ceremonial Entrance Plaza & Wheelchair Ramps',
      'Warm Night Reading Hall Glazing',
    ],
    architecturalDetails: {
      facadeMaterial: 'Ivory-limestone cladding with warm sandstone pilasters and monumental University of Bisha wall crest',
      roofStructure: 'Authentic flat roof with dark-slate coping parapet and central rectangular service penthouse',
      windowPattern: 'Five-tier horizontal ribbon windows illuminating all academic & study floors',
      entranceType: 'Terraced entrance portico with bronze bilingual signage and accessible ramp',
      colorPalette: 'Ivory Limestone (#F2EDE2), Warm Sandstone (#B98C62), Illuminated University Emblem',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-west-south',
    cameraViewPreset: {
      cameraPos: [24, 34, 28],
      lookAt: [-44, 12, 130],
      walkSpawn: [-44, 0, 78],
      walkYaw: Math.PI,
    },
  },
  {
    id: 'library-annex',
    code: 'LIB-02',
    nameEn: 'University Central Library — Research, Archives & Deanship Wing',
    nameAr: 'مكتبة الجامعة المركزية — جناح الأبحاث والمخطوطات والعمادة',
    category: 'library',
    archetype: 'library_wing',
    description:
      'Three-story southern research, manuscripts, and archives wing linked to the Main Library Hall via a shaded ground-level colonnade.',
    position: { x: -44, z: 233 },
    dimensions: { width: 156, depth: 40, height: 15.0 },
    rotationY: 0,
    floors: 3,
    departments: [
      'Deanship of Library Affairs Administration',
      'Manuscript & Historical Archives',
      'Scholarly Research Suites',
    ],
    facilities: [
      'Digital Archives & Rare Manuscripts Vault',
      'Faculty Research Carrels',
      'Connecting Shaded Ground Colonnade to Main Hall',
    ],
    architecturalDetails: {
      facadeMaterial: 'Warm sandstone ashlar cladding matching Main Library Hall with bronze signage',
      roofStructure: 'Flat roof with stepped parapet',
      windowPattern: 'Three-story archive & gallery windows',
      entranceType: 'Covered connecting colonnade & southern accessible courtyard portal',
      colorPalette: 'Warm Sandstone (#D4B996), Desert Tan (#DFC8AE)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-sw-corner',
    cameraViewPreset: {
      cameraPos: [-144, 34, 248],
      lookAt: [-44, 8, 233],
      walkSpawn: [-136, 0, 233],
      walkYaw: -Math.PI / 2,
    },
  },
  {
    id: 'parking-east-perimeter',
    code: 'PARK-E1',
    nameEn: 'Eastern Perimeter Car Parking Area',
    nameAr: 'مواقف السيارات الشرقية — البوابة الثانية والمباني الإدارية',
    category: 'parking',
    archetype: 'shaded_carport_bay',
    description:
      'Linear shaded vehicle parking bays along the eastern perimeter avenue adjacent to the administration row and Gate 2.',
    position: { x: 181, z: 60 },
    dimensions: { width: 14, depth: 260, height: 3.4 },
    rotationY: 0,
    floors: 1,
    departments: ['Administration & Visitor Shaded Parking'],
    facilities: ['Linear Shaded Parking Rows', 'Direct Pedestrian Access to Buildings 1..11 and Gate 2'],
    architecturalDetails: {
      facadeMaterial: 'Sloped desert-tan sun canopies supported by steel pylons',
      roofStructure: 'Sloped cantilevered canopy',
      windowPattern: 'Open-sided',
      entranceType: 'Vehicular access from Eastern Avenue',
      colorPalette: 'Desert Sand (#D6BE9F), Steel Gray',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-east-mid',
    cameraViewPreset: {
      cameraPos: [212, 32, 60],
      lookAt: [181, 2, 60],
      walkSpawn: [192, 0, 60],
      walkYaw: Math.PI / 2,
    },
  },
  {
    id: 'parking-west-corridor',
    code: 'PARK-W1',
    nameEn: 'Western Shaded Parking Bays',
    nameAr: 'مواقف السيارات المظللة — القطاع الغربي',
    category: 'parking',
    archetype: 'shaded_carport_bay',
    description:
      'Parallel rows of cantilevered sun-shade carports along the western campus avenue south of Main Gate 1.',
    position: { x: -179, z: 85 },
    dimensions: { width: 20, depth: 160, height: 3.4 },
    rotationY: 0,
    floors: 1,
    departments: ['Student & Visitor Shaded Parking'],
    facilities: ['Parallel Shaded Carport Rows', 'Direct Walkway to Academic Wings'],
    architecturalDetails: {
      facadeMaterial: 'Cantilevered steel columns with arched desert-tan sun-shade canopies',
      roofStructure: 'Curved solar-protection carport canopies',
      windowPattern: 'Open-sided',
      entranceType: 'Direct vehicular access from Western Campus Avenue',
      colorPalette: 'Desert Sand Canopy (#D6BE9F), White/Charcoal Steel Posts',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-west-mid',
    cameraViewPreset: {
      cameraPos: [-216, 30, 85],
      lookAt: [-179, 2, 85],
      walkSpawn: [-162, 0, 85],
      walkYaw: Math.PI / 2,
    },
  },
  {
    id: 'parking-central-corridor',
    code: 'PARK-C1',
    nameEn: 'Central Spine Shaded Parking Area',
    nameAr: 'مواقف السيارات المظللة — المحور الأوسط',
    category: 'parking',
    archetype: 'shaded_carport_bay',
    description:
      'Twin north-south shaded parking strips bordered by date palm medians running parallel to the eastern administration boulevard.',
    position: { x: 91, z: 80 },
    dimensions: { width: 22, depth: 270, height: 3.4 },
    rotationY: 0,
    floors: 1,
    departments: ['Faculty & Administration Staff Parking'],
    facilities: ['Twin North-South Shaded Carport Strips', 'Palm-Lined Pedestrian Median'],
    architecturalDetails: {
      facadeMaterial: 'Continuous linear steel-supported sun-shade canopies bordered by date palms',
      roofStructure: 'Sloped desert-tan shade roofs',
      windowPattern: 'Open-sided',
      entranceType: 'Vehicular access along Eastern Administration Boulevard',
      colorPalette: 'Sand Canopy (#D6BE9F), Palm Green (#15803D)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-east-mid',
    cameraViewPreset: {
      cameraPos: [56, 32, 80],
      lookAt: [91, 2, 80],
      walkSpawn: [110, 0, 80],
      walkYaw: Math.PI / 2,
    },
  },
  {
    id: 'support-hall-sw',
    code: 'UTIL-SW1',
    nameEn: 'South-West Perimeter Multipurpose & Support Halls',
    nameAr: 'مباني الخدمات والمرافق المساندة — الركن الجنوبي الغربي',
    category: 'facility',
    archetype: 'southwest_support_hall',
    description:
      'Southwest campus logistics, maintenance, and multipurpose support halls with high-albedo flat roofs along the southwest perimeter zone.',
    position: { x: -178, z: 222 },
    dimensions: { width: 20, depth: 50, height: 6.5 },
    rotationY: 0,
    floors: 1,
    departments: ['Campus Operations & Support Facilities'],
    facilities: ['White-Roofed Structural Halls'],
    architecturalDetails: {
      facadeMaterial: 'Clean institutional stucco panels with high-albedo white roof',
      roofStructure: 'High-albedo white flat structural roofs',
      windowPattern: 'Clerestory service bays',
      entranceType: 'Ground-level access',
      colorPalette: 'White Roof (#F8FAFC), Neutral Massing (#CBD5E1)',
    },
    accessible: true,
    hasRampOrGroundEntry: true,
    entryNodeId: 'n-sw-corner',
    cameraViewPreset: {
      cameraPos: [-146, 20, 222],
      lookAt: [-178, 3.5, 222],
      walkSpawn: [-162, 0, 222],
      walkYaw: Math.PI / 2,
    },
  },
];

export const CAMPUS_ROADS: RoadSegment[] = [
  // Exterior Main Highway on the West
  {
    id: 'road-main-highway',
    name: 'Al-Nakheel Main Highway',
    start: [-232, -275],
    end: [-232, 310],
    width: 18,
    hasMedian: true,
    hasStripedCurb: true,
    lampStyle: 'y_modern',
  },
  // Main Gate 1 Entry Avenue from Highway Roundabout to Entry Plaza
  {
    id: 'road-gate1-entry',
    name: 'Main Gate 1 Entry Avenue',
    start: [-232, -35],
    end: [-154, -35],
    width: 14,
    hasMedian: true,
    hasStripedCurb: true,
    hasSidewalk: true,
    lampStyle: 'y_modern',
  },
  // Western Internal Avenue (from North Academic Wings past Mosque, Entry Plaza, Red-Roof Hall & Library)
  {
    id: 'road-west-avenue',
    name: 'Western Campus Avenue',
    start: [-154, -238],
    end: [-154, 272],
    width: 12,
    hasStripedCurb: true,
    hasSidewalk: true,
    lampStyle: 'y_modern',
  },
  // Playground Northern Boulevard (separating Football Playground + Botanical Hedge from Mosque, Bldgs 17, 18, 19)
  {
    id: 'road-north-boulevard',
    name: 'Playground Northern Boulevard (طريق الكليات الشمالي)',
    start: [-154, -82],
    end: [120, -82],
    width: 14,
    hasMedian: true,
    hasStripedCurb: true,
    hasSidewalk: true,
    lampStyle: 'y_modern',
  },
  // Inner Academic Boulevard (running IN BETWEEN Mosque/Bldgs 17-19 and Front North Bldgs 15-14/Courtyard)
  {
    id: 'road-north-inner',
    name: 'Inner Academic Campus Boulevard',
    start: [-154, -154],
    end: [180, -154],
    width: 14,
    hasMedian: true,
    hasStripedCurb: true,
    hasSidewalk: true,
    lampStyle: 'y_modern',
  },
  // North-Central Cross Street (running IN BETWEEN Building 17 and Building 18)
  {
    id: 'road-north-cross-west',
    name: 'Computing & Sciences Cross Street',
    start: [-41, -154],
    end: [-41, -82],
    width: 10,
    hasStripedCurb: true,
    hasSidewalk: true,
    lampStyle: 'y_modern',
  },
  // Outer North Cross Street (running IN BETWEEN Building 15 and Building 16)
  {
    id: 'road-north-cross-outer',
    name: 'Northern Colleges Cross Street',
    start: [-80, -238],
    end: [-80, -154],
    width: 10,
    hasStripedCurb: true,
    hasSidewalk: true,
    lampStyle: 'y_modern',
  },
  // Northern Inner Perimeter Service Lane inside the North Wall
  {
    id: 'road-north-service',
    name: 'Northern Campus Perimeter Lane',
    start: [-154, -238],
    end: [180, -238],
    width: 12,
    hasStripedCurb: true,
    hasSidewalk: true,
    lampStyle: 'y_modern',
  },
  // Central Spine Road (Between Football Playground / Bldg 19-20 / Library and Central Parking)
  {
    id: 'road-central-spine',
    name: 'Central Campus Spine Road',
    start: [64, -238],
    end: [64, 272],
    width: 12,
    hasStripedCurb: true,
    hasSidewalk: true,
    lampStyle: 'y_modern',
  },
  // Eastern Administration Boulevard (running South in front of Buildings 1..11 to Formal Garden & Gate 2)
  {
    id: 'road-east-admin-boulevard',
    name: 'Eastern Administration Boulevard (طريق الإدارة — مباني ١ إلى ١١)',
    start: [120, -238],
    end: [120, 272],
    width: 14,
    hasStripedCurb: true,
    hasSidewalk: true,
    lampStyle: 'double_globe',
  },
  // Formal Garden North Cross-Street (between Building 11 and the Formal 4-Quadrant Garden)
  {
    id: 'road-garden-north',
    name: 'Formal Garden North Plaza Avenue',
    start: [120, 224],
    end: [180, 224],
    width: 10,
    hasStripedCurb: true,
    hasSidewalk: true,
    lampStyle: 'double_globe',
  },
  // Formal Garden East Avenue leading South into Gate 2 Portal
  {
    id: 'road-garden-east',
    name: 'Gate 2 Inner Approach Avenue',
    start: [180, 224],
    end: [180, 272],
    width: 10,
    hasStripedCurb: true,
    hasSidewalk: true,
    lampStyle: 'double_globe',
  },
  // Southern Campus Perimeter Avenue & Gate 2 Portal Road
  {
    id: 'road-south-avenue',
    name: 'Southern Campus Avenue & Gate 2 Portal Road',
    start: [-154, 272],
    end: [228, 272],
    width: 14,
    hasMedian: true,
    hasStripedCurb: true,
    hasSidewalk: true,
    lampStyle: 'double_globe',
  },
  // Eastern Exterior Street outside the Eastern Wall (connects Gate 2 Portal at z=272)
  {
    id: 'road-east-exterior',
    name: 'Eastern Perimeter Street',
    start: [228, -275],
    end: [228, 310],
    width: 16,
    hasMedian: true,
    hasStripedCurb: true,
    lampStyle: 'double_globe',
  },
  // Vast Outer Loop Perimeter Roads encircling the expanded campus
  {
    id: 'road-outer-loop-north',
    name: 'Northern Outer Perimeter Boulevard',
    start: [-262, -288],
    end: [258, -288],
    width: 14,
    hasMedian: true,
    hasStripedCurb: true,
    hasSidewalk: true,
    lampStyle: 'y_modern',
  },
  {
    id: 'road-outer-loop-east',
    name: 'Eastern Outer Perimeter Avenue',
    start: [258, -288],
    end: [258, 325],
    width: 14,
    hasMedian: true,
    hasStripedCurb: true,
    hasSidewalk: true,
    lampStyle: 'double_globe',
  },
  {
    id: 'road-outer-loop-south',
    name: 'Southern Outer Perimeter Boulevard',
    start: [-262, 325],
    end: [258, 325],
    width: 14,
    hasMedian: true,
    hasStripedCurb: true,
    hasSidewalk: true,
    lampStyle: 'double_globe',
  },
  {
    id: 'road-outer-loop-west',
    name: 'Western Outer Perimeter Highway',
    start: [-262, -288],
    end: [-262, 325],
    width: 14,
    hasMedian: true,
    hasStripedCurb: true,
    hasSidewalk: true,
    lampStyle: 'y_modern',
  },
];

export const NAV_NODES: NavNode[] = [
  { id: 'n-roundabout', label: 'Main Gate 1 Highway Roundabout', x: -232, z: -35, accessible: true },
  { id: 'n-gate1-plaza', label: 'Main Gate 1 Entry Lawn Plaza', x: -154, z: -35, accessible: true },
  { id: 'n-mosque-south', label: 'University Mosque & Playground West Corner', x: -154, z: -82, accessible: true },
  { id: 'n-bldg17-south', label: 'Building 17 & Cross-Street South Junction', x: -41, z: -82, accessible: true },
  { id: 'n-bldg18-south', label: 'Building 18 (Computing) & Playground North', x: -9, z: -82, accessible: true },
  { id: 'n-bldg19-south', label: 'Building 19 Checkerboard Plaza', x: 36, z: -82, accessible: true },
  { id: 'n-bldg20-north', label: 'Building 19 & Building 20 Crossroads', x: 64, z: -82, accessible: true },
  { id: 'n-north-inner-west', label: 'Inner Academic Blvd — Bldgs 15 & Mosque North', x: -154, z: -154, accessible: true },
  { id: 'n-north-inner-mid', label: 'Inner Academic Blvd — Bldgs 16 & 18 Crossroads', x: -41, z: -154, accessible: true },
  { id: 'n-north-inner-east', label: 'Inner Academic Blvd — Central Spine Junction', x: 64, z: -154, accessible: true },
  { id: 'n-stadium-stands', label: 'Stadium Spectator Grandstand', x: 64, z: 22, accessible: true },
  { id: 'n-east-north', label: 'Buildings 1–11 & Northern Boulevard T-Junction', x: 120, z: -82, accessible: true },
  { id: 'n-east-bldg10', label: 'Buildings 3–4 & Palm Median Boulevard', x: 120, z: 1, accessible: true },
  { id: 'n-east-mid', label: 'Administration Row Mid Boulevard (Bldgs 5–8)', x: 120, z: 55, accessible: true },
  { id: 'n-east-south', label: 'Formal Courtyard Garden NW Junction', x: 120, z: 224, accessible: true },
  { id: 'n-garden-sw', label: 'Formal Courtyard Garden SW Corner', x: 120, z: 272, accessible: true },
  { id: 'n-gate2-portal', label: 'Gate 2 Southeastern Monumental Portal', x: 195, z: 272, accessible: true },
  { id: 'n-west-mid', label: 'Indoor Sports Hall & Western Parking Walk', x: -154, z: 34, accessible: true },
  { id: 'n-west-south', label: 'University Central Library Main Plaza', x: -154, z: 114, accessible: true },
  { id: 'n-sw-corner', label: 'Southwest Perimeter Corner', x: -154, z: 272, accessible: true },
  { id: 'n-south-mid', label: 'South-Central Support Yard Junction', x: 64, z: 152, accessible: true },
  { id: 'n-south-spine', label: 'Southern Spine Crossroads', x: 64, z: 272, accessible: true },
];

export const NAV_EDGES: NavEdge[] = [
  { from: 'n-roundabout', to: 'n-gate1-plaza', accessible: true, roadName: 'Main Gate 1 Entry Avenue' },
  { from: 'n-gate1-plaza', to: 'n-mosque-south', accessible: true, roadName: 'Western Campus Avenue (North)' },
  { from: 'n-mosque-south', to: 'n-north-inner-west', accessible: true, roadName: 'Western Campus Avenue (Upper North)' },
  { from: 'n-mosque-south', to: 'n-bldg17-south', accessible: true, roadName: 'Playground Northern Boulevard' },
  { from: 'n-bldg17-south', to: 'n-bldg18-south', accessible: true, roadName: 'Playground Northern Boulevard' },
  { from: 'n-bldg18-south', to: 'n-bldg19-south', accessible: true, roadName: 'Playground Northern Boulevard' },
  { from: 'n-bldg19-south', to: 'n-bldg20-north', accessible: true, roadName: 'Playground Northern Boulevard' },
  { from: 'n-bldg17-south', to: 'n-north-inner-mid', accessible: true, roadName: 'Computing & Sciences Cross Street' },
  { from: 'n-north-inner-west', to: 'n-north-inner-mid', accessible: true, roadName: 'Inner Academic Campus Boulevard' },
  { from: 'n-north-inner-mid', to: 'n-north-inner-east', accessible: true, roadName: 'Inner Academic Campus Boulevard' },
  { from: 'n-north-inner-east', to: 'n-bldg20-north', accessible: true, roadName: 'Central Campus Spine Road (North)' },
  { from: 'n-bldg20-north', to: 'n-stadium-stands', accessible: true, roadName: 'Central Campus Spine Road' },
  { from: 'n-stadium-stands', to: 'n-south-mid', accessible: true, roadName: 'Central Campus Spine Road' },
  { from: 'n-bldg20-north', to: 'n-east-north', accessible: true, roadName: 'Playground Northern Boulevard' },
  { from: 'n-east-north', to: 'n-east-bldg10', accessible: true, roadName: 'Eastern Administration Boulevard' },
  { from: 'n-east-bldg10', to: 'n-east-mid', accessible: true, roadName: 'Eastern Administration Boulevard' },
  { from: 'n-east-mid', to: 'n-east-south', accessible: true, roadName: 'Eastern Administration Boulevard' },
  { from: 'n-east-south', to: 'n-garden-sw', accessible: true, roadName: 'Eastern Administration Boulevard (Garden Loop)' },
  { from: 'n-garden-sw', to: 'n-gate2-portal', accessible: true, roadName: 'Southern Campus Avenue & Gate 2 Portal Road' },
  { from: 'n-gate1-plaza', to: 'n-west-mid', accessible: true, roadName: 'Western Campus Avenue' },
  { from: 'n-west-mid', to: 'n-west-south', accessible: true, roadName: 'Western Campus Avenue' },
  { from: 'n-west-south', to: 'n-sw-corner', accessible: true, roadName: 'Western Campus Avenue (South)' },
  { from: 'n-south-mid', to: 'n-south-spine', accessible: true, roadName: 'Central Campus Spine Road' },
  { from: 'n-sw-corner', to: 'n-south-spine', accessible: true, roadName: 'Southern Campus Avenue' },
  { from: 'n-south-spine', to: 'n-garden-sw', accessible: true, roadName: 'Southern Campus Avenue' },
];

export const CAMPUS_TOURS: CampusTour[] = [
  {
    id: 'tour-main-avenue',
    title: '01. Main Gate to Administration Campus Tour',
    titleAr: 'جولة الحرم الرئيسي — من البوابة ١ إلى مباني الإدارة',
    subtitle: 'Follow the main campus avenue from Main Gate 1 past the Mosque, academic colleges, and administration row.',
    estimatedMinutes: 5,
    stops: [
      {
        buildingId: 'gate-1',
        title: 'Main Gate 1 & Entry Lawn Plaza',
        narration:
          'Starting inside Main Gate 1: to the north stands the University Mosque, and to the south lie the circular green entry lawn with vertical LED bollards, twin flagpoles, multi-sport courts, and the Red-Roof Indoor Sports Hall.',
        durationSec: 10,
      },
      {
        buildingId: 'mosque-main',
        title: 'University Mosque (مسجد الجامعة)',
        narration:
          'On the northwest corner stands the University Mosque with its square minaret tower, central terracotta-red pyramidal dome roof, arched windows, crenelated parapet, and manicured front lawn.',
        durationSec: 12,
      },
      {
        buildingId: 'computing-bldg-18',
        title: 'Building 18 (كلية الحاسبات) & Football Playground',
        narration:
          'Traveling east along Playground Northern Boulevard: on the north side sits Building 18 with gold Arabic college signage and accessible ramps; on the south side is the Football Playground bordered by sculpted ornamental greenery.',
        durationSec: 12,
      },
      {
        buildingId: 'academic-bldg-19',
        title: 'Building 19 (3-Story Academic Building) & Building 20',
        narration:
          'Continuing east past Building 18: Building 19 rises with three stories of twin windows between tan sandstone pilasters, while Building 20 (Deanship of Arts) stands across the avenue behind a grove of date palms.',
        durationSec: 12,
      },
      {
        buildingId: 'bldg-01',
        title: 'Administration Row — Buildings 1 to 11',
        narration:
          'At the eastern T-junction beside the shaded carports, the route turns south along Eastern Administration Boulevard alongside the aligned 2-story numbered buildings from Building 1 through Building 11.',
        durationSec: 14,
      },
    ],
  },
  {
    id: 'tour-full-campus',
    title: '02. Complete University Masterplan Tour',
    titleAr: 'الجولة الشاملة للحرم الجامعي ببيشة',
    subtitle: 'Explore all campus gates, sports facilities, academic colleges, central library, and landscaped gardens.',
    estimatedMinutes: 8,
    stops: [
      {
        buildingId: 'gate-1',
        title: 'Main Gate 1 Welcome Portal',
        narration:
          'Main Gate 1 on the western highway connects the entry roundabout to the campus road network.',
        durationSec: 10,
      },
      {
        buildingId: 'sports-gym-hall',
        title: 'Red-Roof Indoor Sports Hall & Multi-Sport Courts',
        narration:
          'South of the entry lawn island stand the fenced multi-sport courts and the Red-Roof Indoor Sports Hall with its classical pediment portico.',
        durationSec: 10,
      },
      {
        buildingId: 'library-main',
        title: 'University Central Library',
        narration:
          'Spanning the southern academic sector behind the football stadium is the five-story University Central Library featuring illuminated crest emblems and reading halls.',
        durationSec: 12,
      },
      {
        buildingId: 'garden-south-courtyard',
        title: 'Formal Four-Quadrant Courtyard Garden & Gate 2',
        narration:
          'At the southern end of the Eastern Boulevard lies the Formal Four-Quadrant Courtyard Garden and the monumental Gate 2 portal.',
        durationSec: 12,
      },
    ],
  },
];
