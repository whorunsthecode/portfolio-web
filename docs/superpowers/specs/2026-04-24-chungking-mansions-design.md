# Chungking Mansions FPS World — Design Spec
**Date:** 2026-04-24 (rev 2 — post user review)
**Style reference:** Wong Kar-wai, *Chungking Express* (1994) + *Fallen Angels* (1995) back-corridor
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
        └── dead end: locked door + emissive floor strip (warm glow) + poster canvas texture
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
| Lobby | white tile (CM02) + rust streaks + mirror plane (separate reflective mesh) |
| Corridor front (z: -9 → -20) | green ceramic tile (CM01 `#326446`) + yellowed paint above tile line + peeling poster patches |
| Corridor rear (z: -20 → -29) | deep blue (CM10 `#0f1e3c`) — *Fallen Angels* palette shift, simulates back-alley darkness |

The green→blue colour transition is a per-zone material swap on the wall mesh, not a gradient shader. Two wall meshes per side, seamed at z = -20.

### Rule 2 — InstancedMesh for repeating props

| Component | Count | Draw calls saved vs. individual |
|---|---|---|
| `<Doors />` | ~10 corridor doors | 10 × 5 meshes → 1 (warm glow under gap = emissive floor strip, not a pointLight) |
| `<NeonTubes />` | ~8 ceiling fixtures | 8 × 2 meshes → 1 per variant |
| `<OverheadPipes />` | corridor pipe run | N segments → 1 |

Each instanced component accepts a `placements` array of `{position, rotation, color?}` and maps them onto `InstancedMesh` via instance matrices on mount.

---

## 3. Lighting Budget

**Hard limit: 8 dynamic lights across the entire Chungking world.**

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

Existing per-stall `<pointLight>` in `ShopStalls.tsx` (8 lights) are collapsed to the 3 arcade fills above.

---

## 4. Visual System (WKW colour language)

### Fog
```tsx
<fogExp2 color="#0a1408" density={0.12} />
```
Green-black falloff swallows corridor depth. No extra render pass.

### Emissive lift
All Chungking `meshStandardMaterial` surfaces: `envMapIntensity={0}`, `emissive` lifted by 0.03–0.06 to prevent pure-black shadows. Simulates ambient neon spill.

### Neon signs — emissive + flicker
`emissive={color} emissiveIntensity={2.5}` on sign panel meshes. 30% of neon fixtures flicker (matches a dying-ballast rate):

```tsx
const flicker = useMemo(() => Math.random() > 0.7, [])
useFrame(({ clock }) => {
  if (!flicker || !ref.current) return
  ref.current.emissiveIntensity = 2.5 + Math.sin(clock.elapsedTime * 20) * 1.5
})
```

Postprocessing bloom (`<EffectComposer><Bloom /></EffectComposer>`) deferred until frame-rate is measured with real geometry.

### Reflective floors
Lobby + corridor each get a second `<mesh>` at `y = 0.001`:
```tsx
<meshStandardMaterial roughness={0.05} metalness={0.4} color="#0a0c0a" />
```
Picks up ceiling lights and neon naturally. No env map needed.

### Mirror plane (lobby)
Low-cost fake reflection: baked canvas texture of the lobby rendered once on mount, applied to a plane with a subtle noise distortion. Not real-time reflection.
```tsx
<meshStandardMaterial
  map={bakedReflectionTexture}
  roughness={0.08}
  metalness={0.9}
/>
```
If performance is tight, drop distortion and use a plain dark metallic plane — the lobby lighting does most of the work.

### Film grain + contrast (CSS, zero GPU cost)
```css
canvas { filter: contrast(1.06) saturate(0.88); }

.grain-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100vw; height: 100vh;
  pointer-events: none;
  opacity: 0.04;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px 200px;
}
```

### Elevator door animation
`useFrame` lerp on door X position (same pattern as `PlaneFlyover.tsx`). Opens when player enters 1.5m trigger radius, closes after 3s. `<rectAreaLight>` inside shaft visible only when door is open.

### Elevator interior
Stainless steel walls (CM03, high metalness), wooden lower panel (CM09 dark brown), black rubber floor (`#1e1e1e`, no CM code needed — single mesh). Button panel: canvas texture with faded floor numbers 1–17.

---

## 5. *Fallen Angels* Easter Eggs (static meshes, zero extra lights)

All placed in the corridor rear zone (z < -18) where the palette has already shifted to deep blue. Each is a small static mesh with subtle emissive — no interaction, no pointLights.

| Easter egg | Position | Implementation |
|---|---|---|
| Sony Walkman | z ≈ -18, floor corner | Small box mesh, emissive `#c8a040` micro-glow |
| Blue Ribbon beer can | z ≈ -22, wall base | Cylinder mesh, logo as canvas texture |
| Broken neon tube (purple) | z ≈ -24, wall-mounted | Tube mesh `emissive="#b43cc8"`, sin flicker simulates short circuit |
| Red payphone | z ≈ -28, dead-end left | Box stack mesh, handset hanging down (visual cue: something happened here) |

---

## 6. Corridor Dead End Detail

The locked door at z = -29:
- Door mesh: CM09 dark wood, slightly ajar angle (5°) to suggest it could open
- Emissive floor strip at `y = 0.001`, `z = -28.8`: `color="#ffb038" emissiveIntensity={1.2}` — warm light leaking under the gap
- Door canvas texture: layers of stickers, a faded "GUEST HOUSE" poster, torn corner revealing older text beneath

---

## 7. Visual Contrast with Walled City

Deliberate differentiation between the two worlds:

| Element | Walled City | Chungking Mansions |
|---|---|---|
| Dominant hue | Grey-green mould, concrete | Cold green tile → Fallen Angels blue |
| Light character | Fluorescent flicker (green-white) | Neon bloom (red / blue / yellow) |
| Spatial feel | Vertical compression (14-floor canyon) | Horizontal maze (corridor radiates) |
| Floor | Wet puddles, grime | Reflective tile |
| Materials | Concrete + rust + cable tangle | Steel + glass + ceramic tile |
| Atmospheric cue | Dripping water, distant aircraft | Elevator hum, neon buzz |

---

## 8. Component File Plan

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
  Corridor.tsx              — new: baked surface meshes + colour zone split at z=-20
  CorridorDoors.tsx         — new: InstancedMesh doors + emissive floor strips
  CorridorPipes.tsx         — new: InstancedMesh overhead pipe run
  FallenAngelsEggs.tsx      — new: Walkman, beer can, broken neon, payphone
  ChungkingLighting.tsx     — new: consolidated 8-light budget
```

---

## 9. Material Palette Reference

| ID | Name | RGB | Usage |
|---|---|---|---|
| CM01 | Green ceramic tile | `#326446` | Corridor front walls/floor |
| CM02 | White tile | `#dcdcdc` | Lobby walls |
| CM03 | Stainless elevator door | `#b4bec8` | Mirror-finish, high metalness |
| CM04 | Neon red | `#ff2850` | Self-emissive, intensity 2.5 |
| CM05 | Neon green | `#28ff64` | Self-emissive |
| CM06 | Neon yellow | `#ffdc32` | Self-emissive |
| CM07 | Fluorescent white | `#f0f8ff` | Lobby ceiling light |
| CM08 | Warm bulb | `#ffb038` | Corridor door pools + dead-end strip |
| CM09 | Dark wood door | `#503218` | InstancedMesh doors |
| CM10 | Fallen Angels blue | `#0f1e3c` | Corridor rear wall zone (z < -20) |

---

## 10. Build Priority

1. Corridor base mesh + CM01 canvas texture
2. InstancedMesh doors + overhead pipes
3. 8-light budget in `ChungkingLighting.tsx`
4. Fog + film grain CSS overlay
5. `index.tsx` zone bounds + `FirstPersonControls` (replaces `WorldOrbit`)
6. Elevator lobby + animated elevator doors
7. Corridor rear: CM10 blue zone + *Fallen Angels* easter eggs
8. Mirror plane (after perf measurement)
9. Postprocessing bloom (after perf measurement)

---

## 11. Out of Scope (MVP)

- Floors 2–17 exterior facade (painted backdrop only, no FPS access)
- A/B/C/D/E wing splits — one corridor represents the feel
- Stairwell to upper floor (follow-on zone)
- Audio / sound design
- NPC characters / animated people
- Interactive easter eggs (hover text etc.)
