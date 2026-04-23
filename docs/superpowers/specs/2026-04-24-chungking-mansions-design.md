# Chungking Mansions FPS World — Design Spec
**Date:** 2026-04-24
**Style reference:** Wong Kar-wai, *Chungking Express* (1994)
**Navigation:** First-person walk-through, same system as Walled City

---

## 1. Zone Architecture

Three walkable zones in sequence, all at world `x = -100`:

```
Entrance arcade   z: +5 → -5    6m wide × 3.2m tall   (existing shell)
        ↓ archway cut in back wall (1.8m wide × 2.2m tall, concrete lintel fills to 3.2m ceiling)
Elevator lobby    z: -5 → -9    4m wide × 2.8m tall   (new)
        ↓ side passage at lobby left wall
Corridor          z: -9 → -29   1.8m wide × 2.6m tall (new, ~20m)
        └── dead end: locked door + dim warm light under the gap
```

FPS bounds follow the same `Zone[]` pattern as `WalledCity/index.tsx`. No `floorFn` — all zones are flat. `start` position remains `[-100, 0, 4.5]` facing -Z.

The only change to existing geometry: `ChungkingArcade.tsx` back wall plane is replaced with two planes flanking a 1.8m opening + a concrete lintel mesh above.

---

## 2. Surface & Instancing Patterns

### Rule 1 — Baked surface textures
One `<mesh>` per surface (floor, ceiling, each wall). Canvas textures paint tile grids, grout, stains, water streaks, and graffiti. Zero per-tile geometry.

| Zone | Texture set |
|---|---|
| Arcade | existing `ChungkingArcade.tsx` canvas textures |
| Lobby | white tile + rust streaks + mirror plane (separate reflective mesh) |
| Corridor | green ceramic tile (CM01 `#326446`) + yellowed paint above tile line + peeling poster patches |

### Rule 2 — InstancedMesh for repeating props

| Component | Count | Draw calls saved vs. individual |
|---|---|---|
| `<Doors />` | ~10 corridor doors | 10 × 5 meshes → 1 (warm glow under gap = emissive floor strip, not a pointLight) |
| `<NeonTubes />` | ~8 ceiling fixtures | 8 × 2 meshes → 1 per variant |
| `<OverheadPipes />` | corridor pipe run | N segments → 1 |

Each instanced component accepts a `placements` array of `{position, rotation, color?}` and maps them onto `InstancedMesh` via instance matrices on mount.

---

## 3. Lighting Budget

**Hard limit: 8 point lights across the entire Chungking world.**

| Light | Zone | Colour | Purpose |
|---|---|---|---|
| Arcade neon fill A | Arcade | `#ff2850` | Shared spill for left-side stalls |
| Arcade neon fill B | Arcade | `#48d3ff` | Shared spill for right-side stalls |
| Arcade neon fill C | Arcade | `#ffd84a` | Hanging sign glow |
| Lobby overhead | Lobby | `#d8ecff` | Flickering rectAreaLight (dying ballast) |
| Elevator shaft | Lobby | `#f0f8ff` | Inside elevator, visible when door open |
| Corridor A | Corridor | `#ffb038` | Warm pool at z = -14 |
| Corridor B | Corridor | `#ffb038` | Warm pool at z = -24 |
| Ambient fill | World | `#8c7040` | `<ambientLight intensity={0.18} />` |

Existing per-stall `<pointLight>` in `ShopStalls.tsx` (8 lights) are collapsed to the 3 arcade fills above. Mobile tradeoff accepted.

---

## 4. Visual System (WKW colour language)

### Fog
```tsx
<fogExp2 color="#0a1408" density={0.12} />
```
Green-black falloff swallows corridor depth. No extra render pass.

### Emissive lift
All Chungking `meshStandardMaterial` surfaces: `envMapIntensity={0}`, `emissive` lifted by 0.03–0.06 to prevent pure-black shadows. Simulates ambient neon spill.

### Neon signs
`emissive={color} emissiveIntensity={2.5}` on sign panel meshes. Drives bloom through the existing pipeline without `@react-three/postprocessing`. Postprocessing (`<EffectComposer><Bloom /></EffectComposer>`) is deferred until frame-rate is measured with real geometry.

### Film grain + contrast (CSS, zero GPU cost)
```css
canvas { filter: contrast(1.06) saturate(0.88); }
canvas::after {
  /* SVG feTurbulence noise overlay */
}
```

### Reflective floors
Lobby + corridor each get a second `<mesh>` at `y = 0.001`:
```tsx
<meshStandardMaterial roughness={0.05} metalness={0.4} color="#0a0c0a" />
```
Picks up ceiling lights and neon naturally. No env map needed.

### Elevator door animation
`useFrame` lerp on door X position (same pattern as `PlaneFlyover.tsx`). Opens when player enters 1.5m trigger radius, closes after 3s. `<rectAreaLight>` inside shaft visible only when door is open.

---

## 5. Component File Plan

```
src/worlds/Chungking/
  index.tsx                 — zone bounds + FirstPersonControls (replaces WorldOrbit)
  ChungkingArcade.tsx       — existing, back wall gets archway opening
  ShopStalls.tsx            — existing, pointLights collapsed to 3
  HangingSigns.tsx          — existing, unchanged
  ArcadeLighting.tsx        — existing, unchanged
  CageLift.tsx              — existing, unchanged
  ElevatorLobby.tsx         — new: lobby shell + reflective floor + mirror plane
  Elevator.tsx              — new: animated doors + shaft light + button panel
  Corridor.tsx              — new: baked surface meshes + fog sells depth
  CorridorDoors.tsx         — new: InstancedMesh doors with per-instance warm light under gap
  CorridorPipes.tsx         — new: InstancedMesh overhead pipe run
  ChungkingLighting.tsx     — new: consolidated 8-light budget
```

---

## 6. Material Palette Reference

| ID | Name | RGB | Usage |
|---|---|---|---|
| CM01 | Green ceramic tile | `#326446` | Corridor/lobby walls |
| CM02 | White tile | `#dcdcdc` | Lobby walls |
| CM03 | Stainless elevator door | `#b4bec8` | Mirror-finish, high metalness |
| CM04 | Neon red | `#ff2850` | Self-emissive, intensity 2.5 |
| CM05 | Neon green | `#28ff64` | Self-emissive |
| CM06 | Neon yellow | `#ffdc32` | Self-emissive |
| CM07 | Fluorescent white | `#f0f8ff` | Lobby ceiling light |
| CM08 | Warm bulb | `#ffb038` | Corridor door pools |
| CM09 | Dark wood door | `#503218` | InstancedMesh doors |

---

## 7. Out of Scope (MVP)

- Floors 2–17 exterior facade (painted backdrop only, no FPS access)
- A/B/C/D/E wing splits — one corridor represents the feel
- Stairwell to upper floor (can be added as a follow-on zone)
- Audio / sound design
- People / NPC characters
- `@react-three/postprocessing` bloom (deferred pending perf measurement)
