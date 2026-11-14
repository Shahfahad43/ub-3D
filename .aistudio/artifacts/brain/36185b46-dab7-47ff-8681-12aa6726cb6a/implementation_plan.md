# Implementation Plan — University of Bisha 3D Virtual Campus: Vast Masterplan & User-Annotated Layout

## Overview
This plan implements the user's feedback to eliminate cramped/contracted spacing and expand the University of Bisha 3D virtual campus into a vast, expansive open-world layout matching the user's annotated masterplan diagram (`specifying_everything__47ad10c3.png`), updating the Satellite Radar accordingly.

---

## 1. Vast Masterplan Expansion
- **Expansive Terrain & Campus Pad**:
  - Base desert terrain expanded from 900m to **2400m x 2400m** with distant desert horizon.
  - Developed campus pad expanded to **850m x 850m**.
  - Outer perimeter boundary walls and ring roads enclosing all facilities at a grand scale.
- **Unconstrained Exploration Limits**:
  - Walk mode collision boundary expanded from 185m to **550m**, eliminating collision barriers on outer avenues.
  - Orbit camera max distance expanded from 380m to **1400m**, and camera far clipping plane expanded to **3500m** for grand panoramic campus views.
  - Fog density reduced for crystal-clear masterplan visibility.

---

## 2. Accurate Incorporation of `specifying_everything__47ad10c3.png`
1. **"Library of the university" (`library-main` / `LIB-01`)**:
   - South multi-wing complex officially reconstructed as the **University Central Library (مكتبة الجامعة المركزية)**.
   - Central rotunda reading hall, patinated copper dome skylight, rhythmic arched reading windows, ceremonial terraced entrance plaza, switchback ADA ramp, and bilingual bronze plaque.
   - Warm interior reading light glow for Night Mode.
2. **"place for setting people watching football" (`sports-stadium-stands` / `SPRT-STANDS`)**:
   - Dedicated tiered spectator grandstand (مدرجات المشاهدين) along the eastern touchline of the football pitch.
   - Precast concrete seating steps with alternating royal blue and white contoured stadium seats, cantilevered sun-shade canopy roof, press box, vomitory stairs, and integrated match floodlights.
3. **"football ground" (`sports-football-pitch`)**:
   - Reconstructed to official regulation FIFA dimensions (105m x 70m) with perimeter clipped hedges, goalposts, and 6 high-mast stadium floodlight towers.
4. **"buildings 1 to 11" (`admin-row-cluster`)**:
   - Exactly 11 modular 2-story buildings numbered `1` through `11` from north to south along the eastern boulevard.
   - Corner stair towers bearing blue building numerals `1` to `11`, wheelchair ramps, horizontal window bands, black plinths, and security bollards.
5. **"car parking area" (`parking-central-corridor`)**:
   - Long continuous dual sun-shade carport corridor (215m) running parallel to Buildings 1 through 11 with palm-lined medians.
6. **"small playgrounds" (`sports-courts-west`)**:
   - 3 outdoor multi-sport hardcourts with perimeter chain-link fence, floodlights, and twin flagpoles.
7. **"mosque" (`mosque-main`)**:
   - University Mosque with square western minaret tower, terracotta-red pyramidal dome, arched windows, and landscaped lawn.
8. **Outer Loop Road Network**:
   - Added Northern, Eastern, Southern, and Western outer perimeter boulevards encircling the entire campus.

---

## 3. Satellite Radar & GIS Masterplan Update
- **User Masterplan Underlay**:
  - Set `/assets/aistudio/specifying_everything__47ad10c3.png` as the default underlay in both the bottom-left floating Satellite Radar and the expanded GIS modal, showing the user's handwritten pink annotations, numbers 1 to 11, and arrows directly in the radar!
- **Interactive Layer Switcher**:
  - Provided direct toggle buttons: `[ 🎯 User Masterplan (المخطط المحدد) | 🛰️ Original Satellite | 📐 Vector GIS ]`.
  - Upright SVG footprints, building labels, and radar position cones reflect all updated structures.

---

## 4. Verification & Testing
- Unit tests in `src/utils/spatialEngine.test.ts` passed (9/9 passed).
- Build compilation (`npm run build`) succeeded with 0 errors.
- Dev server running on port 3000.
