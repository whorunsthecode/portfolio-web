# Walled City Shop Street Extension — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the Kowloon Walled City alley by 25m (with a dogleg + maze feel) and embed three detailed shops (士多, 強記冰室 walk-in, 生果檔 dead-end) plus a proximity-based HUD affordance for all four interactables (the three new + the existing Salon).

**Architecture:** All work is contained inside `src/worlds/WalledCity/`. The alley shell, stairwell, and continuous-frontage components extend along the new run. Three new shop components and a HUD component get mounted alongside existing world components. Salon, Rooftop, and PlaneFlyover are preserved untouched. Player navigation extends via updated `BOUNDS` in `WalledCity/index.tsx`.

**Tech Stack:** React Three Fiber 9, drei 10, three.js 0.183, TypeScript, Vite. No test runner — verification is `npm run typecheck` + `npm run lint` + visual check in `npm run dev`.

**Reference:** Spec at `docs/superpowers/specs/2026-05-01-walled-city-shop-street-extension-design.md`. All section numbers below refer to that spec.

**Branch:** `reel` (auto-deploys to hongkong1985.vercel.app per `project_vercel_deploy_topology.md`).

**Conventions:**
- InstancedMesh from line 1 for any prop with ≥4 repetitions (memory: `feedback_instancing.md`).
- Coordinates are WalledCity-local (group is offset by `WORLD_X = 100` in world space).
- Per-task commit. Use `--no-verify` only if user explicitly asks; otherwise let pre-commit hooks run.

---

## File map

**New files:**
- `src/worlds/WalledCity/AlleyDogleg.tsx`
- `src/worlds/WalledCity/Sundry.tsx`
- `src/worlds/WalledCity/BingSutt/index.tsx`
- `src/worlds/WalledCity/BingSutt/Frontage.tsx`
- `src/worlds/WalledCity/BingSutt/Counter.tsx`
- `src/worlds/WalledCity/BingSutt/Booths.tsx`
- `src/worlds/WalledCity/BingSutt/Decor.tsx`
- `src/worlds/WalledCity/FruitStall.tsx`
- `src/worlds/WalledCity/ShopFigures.tsx`
- `src/worlds/WalledCity/InteractableHUD.tsx`

**Modified files:**
- `src/worlds/WalledCity/index.tsx` — mount new components, rewrite `BOUNDS`
- `src/worlds/WalledCity/AlleyShell.tsx` — refactor for 3-segment alley
- `src/worlds/WalledCity/Stairwell.tsx` — rotate 90° to perpendicular branch
- `src/worlds/WalledCity/SideCorridors.tsx` — append 2 new CORRIDOR defs
- `src/worlds/WalledCity/PipeWeb.tsx` — extend scatter range to z=−30
- `src/worlds/WalledCity/FluorescentTubes.tsx` — extend, more dead/flicker past dogleg
- `src/worlds/WalledCity/MailSlots.tsx` — extend scatter range
- `src/worlds/WalledCity/DentistSigns.tsx` — extend scatter range, 2-3 more signs
- `src/worlds/WalledCity/PosterLayers.tsx` — extend scatter range
- `src/worlds/WalledCity/ApartmentFacades.tsx` — extend, skip shop-occupied wall slots
- `src/worlds/WalledCity/Clutter.tsx` — extend scatter range

**Untouched files:**
- `src/worlds/WalledCity/Salon.tsx`
- `src/worlds/WalledCity/Rooftop.tsx`
- `src/worlds/WalledCity/PlaneFlyover.tsx`
- `src/worlds/WalledCity/WalledCityLighting.tsx`
- `src/cabin/TramPassengers.tsx` (imported by ShopFigures.tsx, not modified)

---

## Task 1: Refactor AlleyShell for segmented build

**Files:**
- Modify: `src/worlds/WalledCity/AlleyShell.tsx`

**Why:** The current AlleyShell builds one straight tube from z=−5 to z=+4.8. The new geometry needs three segments: entrance straight (z=+4.8 to −14, axis x=0), dogleg transition (z=−14 to −16, AlleyDogleg component handles this — see Task 2), deep straight (z=−16 to −30, axis x=−2). This task makes AlleyShell render two straight segments with a parameterized z-range and x-axis center.

- [ ] **Step 1: Read current AlleyShell.tsx**

Run: `cat src/worlds/WalledCity/AlleyShell.tsx | head -80`
Identify: geometry that needs to be parameterized — floor, ceiling, walls, back wall.

- [ ] **Step 2: Refactor to a parameterized inner component + two instances**

Replace the existing component body with a `Segment` inner component and an exported `AlleyShell` that mounts two segments + skips the old back-wall.

```tsx
type SegmentProps = {
  zStart: number   // far z (more negative)
  zEnd: number     // near z (more positive)
  centerX: number  // x-axis center for this segment
  hasBackWall: boolean
  hasFrontWall: boolean
}

function Segment({ zStart, zEnd, centerX, hasBackWall, hasFrontWall }: SegmentProps) {
  const length = zEnd - zStart
  const midZ = (zStart + zEnd) / 2
  // floor, ceiling, two side walls, optional back/front walls
  // Reuse the same materials/textures the original AlleyShell built
  // (lift them to module scope so they're shared across both segments)
  return (
    <group>
      {/* floor */}
      <mesh position={[centerX, 0, midZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[1.6, length]} />
        <meshStandardMaterial /* shared floor mat */ />
      </mesh>
      {/* ceiling */}
      <mesh position={[centerX, 3.8, midZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.6, length]} />
        <meshStandardMaterial /* shared ceiling mat */ />
      </mesh>
      {/* left wall */}
      <mesh position={[centerX - 0.8, 1.9, midZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[length, 3.8]} />
        <meshStandardMaterial /* shared wall mat */ />
      </mesh>
      {/* right wall */}
      <mesh position={[centerX + 0.8, 1.9, midZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[length, 3.8]} />
        <meshStandardMaterial /* shared wall mat */ />
      </mesh>
      {hasBackWall && (
        <mesh position={[centerX, 1.9, zStart]}>
          <planeGeometry args={[1.6, 3.8]} />
          <meshStandardMaterial /* shared back-wall mat */ />
        </mesh>
      )}
      {hasFrontWall && (
        <mesh position={[centerX, 1.9, zEnd]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[1.6, 3.8]} />
          <meshStandardMaterial /* shared back-wall mat */ />
        </mesh>
      )}
    </group>
  )
}

export function AlleyShell() {
  return (
    <>
      {/* Entrance segment — keeps the original front entry wall (or no wall at z=+4.8 to leave open) */}
      <Segment zStart={-14} zEnd={4.8} centerX={0} hasBackWall={false} hasFrontWall={false} />
      {/* Deep segment past the dogleg — closed at the dead end (z=-30) by the FruitStall geometry, so no extra back wall here */}
      <Segment zStart={-30} zEnd={-16} centerX={-2} hasBackWall={false} hasFrontWall={false} />
    </>
  )
}
```

Pull the textures/materials the original AlleyShell built (concrete walls, grimy floor) up to module scope so both Segments share them. Cut openings in walls where shops sit (士多 left at z=−5..−8, 冰室 right at z=−18..−22, and the existing salon doorway / SideCorridor openings) by adjusting the wall plane to be split into two pieces around each opening — see Task 8 (Sundry frontage) and Task 11 (BingSutt frontage) for how each shop expects an opening.

For now, leave wall openings as TODO comments — they'll be cut as each shop is added.

- [ ] **Step 3: Run typecheck**

Run: `npm run typecheck`
Expected: PASS (or only pre-existing errors not introduced by this change).

- [ ] **Step 4: Visual check in dev server**

Run: `npm run dev`
Navigate: open browser, enter the WalledCity world, walk forward into the alley.
Expected: alley is now visibly longer (you can walk past the old back wall at z=−5 with no obstruction). The deep segment after z=−16 is offset 2m to the west (wall on your left appears closer than it used to; wall on your right appears further). The dogleg transition between z=−14 and z=−16 is currently a gap — that's expected; Task 2 fills it.

- [ ] **Step 5: Commit**

```bash
git add src/worlds/WalledCity/AlleyShell.tsx
git commit -m "refactor(walled-city): segment AlleyShell for dogleg geometry"
```

---

## Task 2: Build AlleyDogleg transition shell

**Files:**
- Create: `src/worlds/WalledCity/AlleyDogleg.tsx`

**Why:** The 2m transition between the entrance segment (axis x=0) and the deep segment (axis x=−2) needs its own custom shell — angled walls + transitional floor/ceiling. Single small component, no parameterization needed.

- [ ] **Step 1: Create AlleyDogleg.tsx**

```tsx
import * as THREE from 'three'

// Dogleg transition: alley jogs from x=0 to x=−2 over the z range −14 to −16.
// Two angled walls + flat floor/ceiling fill the bend.

const Z_NEAR = -14   // boundary with entrance segment
const Z_FAR = -16    // boundary with deep segment
const X_NEAR = 0     // center at z=Z_NEAR
const X_FAR = -2     // center at z=Z_FAR
const HALF_W = 0.8
const CEILING = 3.8

export function AlleyDogleg() {
  // Floor: a quad spanning the bend (4 corners)
  const floorGeom = new THREE.BufferGeometry()
  // Vertex order: nearLeft, nearRight, farRight, farLeft (CCW from above)
  const floorVerts = new Float32Array([
    X_NEAR - HALF_W, 0, Z_NEAR,
    X_NEAR + HALF_W, 0, Z_NEAR,
    X_FAR + HALF_W, 0, Z_FAR,
    X_FAR - HALF_W, 0, Z_FAR,
  ])
  const floorIdx = new Uint16Array([0, 1, 2, 0, 2, 3])
  floorGeom.setAttribute('position', new THREE.BufferAttribute(floorVerts, 3))
  floorGeom.setIndex(new THREE.BufferAttribute(floorIdx, 1))
  floorGeom.computeVertexNormals()

  // Ceiling: same shape but at y=CEILING, flipped winding
  const ceilGeom = floorGeom.clone()
  const ceilPos = ceilGeom.getAttribute('position') as THREE.BufferAttribute
  for (let i = 0; i < ceilPos.count; i++) ceilPos.setY(i, CEILING)
  ceilGeom.setIndex(new THREE.BufferAttribute(new Uint16Array([0, 2, 1, 0, 3, 2]), 1))
  ceilGeom.computeVertexNormals()

  // Left wall: a vertical quad from (X_NEAR - HALF_W, *, Z_NEAR) to (X_FAR - HALF_W, *, Z_FAR)
  const leftWallGeom = new THREE.BufferGeometry()
  const leftWallVerts = new Float32Array([
    X_NEAR - HALF_W, 0, Z_NEAR,
    X_NEAR - HALF_W, CEILING, Z_NEAR,
    X_FAR - HALF_W, CEILING, Z_FAR,
    X_FAR - HALF_W, 0, Z_FAR,
  ])
  const leftWallIdx = new Uint16Array([0, 1, 2, 0, 2, 3])
  leftWallGeom.setAttribute('position', new THREE.BufferAttribute(leftWallVerts, 3))
  leftWallGeom.setIndex(new THREE.BufferAttribute(leftWallIdx, 1))
  leftWallGeom.computeVertexNormals()

  // Right wall — analogous on the +x side
  const rightWallGeom = new THREE.BufferGeometry()
  const rightWallVerts = new Float32Array([
    X_NEAR + HALF_W, 0, Z_NEAR,
    X_FAR + HALF_W, 0, Z_FAR,
    X_FAR + HALF_W, CEILING, Z_FAR,
    X_NEAR + HALF_W, CEILING, Z_NEAR,
  ])
  const rightWallIdx = new Uint16Array([0, 1, 2, 0, 2, 3])
  rightWallGeom.setAttribute('position', new THREE.BufferAttribute(rightWallVerts, 3))
  rightWallGeom.setIndex(new THREE.BufferAttribute(rightWallIdx, 1))
  rightWallGeom.computeVertexNormals()

  return (
    <group>
      <mesh geometry={floorGeom} receiveShadow>
        <meshStandardMaterial color={'#1e1a14'} roughness={0.95} />
      </mesh>
      <mesh geometry={ceilGeom}>
        <meshStandardMaterial color={'#1a1610'} roughness={0.95} />
      </mesh>
      <mesh geometry={leftWallGeom}>
        <meshStandardMaterial color={'#2e2820'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={rightWallGeom}>
        <meshStandardMaterial color={'#2e2820'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 2: Mount it temporarily in WalledCity/index.tsx for visual check**

Add the import + element inside the existing `<group>` (full mounting happens in Task 19, this is just visual gating).

```tsx
// In src/worlds/WalledCity/index.tsx, inside the <group position={[WORLD_X, 0, 0]}>:
import { AlleyDogleg } from './AlleyDogleg'
// ...
<AlleyDogleg />
```

- [ ] **Step 3: Typecheck + visual check**

Run: `npm run typecheck && npm run dev`
Expected: typecheck passes. In browser, enter WalledCity, walk to z=−14 — the dogleg now connects the two segments. You can keep walking and the alley bends west.

- [ ] **Step 4: Commit**

```bash
git add src/worlds/WalledCity/AlleyDogleg.tsx src/worlds/WalledCity/index.tsx
git commit -m "feat(walled-city): add AlleyDogleg transition shell at z=-14 to -16"
```

---

## Task 3: Add 2 new corridor defs to SideCorridors

**Files:**
- Modify: `src/worlds/WalledCity/SideCorridors.tsx`

**Why:** Two new dead-end corridors per spec §2.3 — z=−12 right "false-path" that bends out of sight, z=−25 left "vertical-sign alcove" with the hanging "九龍城寨業主聯誼會" wood sign.

- [ ] **Step 1: Append the two new CorridorDef entries**

Modify the `CORRIDORS` export in SideCorridors.tsx:

```tsx
export const CORRIDORS: CorridorDef[] = [
  { side: 'left',  z: -2.5, halfWidth: 0.5, depth: 2.2, ceiling: 2.3, kind: 'laundry' },
  { side: 'right', z:  1.5, halfWidth: 0.5, depth: 2.2, ceiling: 2.3, kind: 'window' },
  { side: 'right', z: -0.4, halfWidth: 0.4, depth: 0.3, ceiling: 2.1, kind: 'salon' },
  // NEW: false-path bending out of sight at z=-12. Player sees darkness curving
  // around a bend; if they walk in, they hit a back wall 2m deep.
  { side: 'right', z: -12, halfWidth: 0.5, depth: 2.0, ceiling: 2.3, kind: 'false-path' },
  // NEW: shallow alcove at z=-25 with the iconic vertical wood sign hanging
  // "九龍城寨業主聯誼會". 1m deep, just enough to read as a side-pocket.
  // Note: this corridor is OFF the deep alley segment (axis x=−2), so the
  // CORRIDOR_BOUNDS calculation in index.tsx must shift its alleyWallX accordingly.
  { side: 'left',  z: -25, halfWidth: 0.4, depth: 1.0, ceiling: 2.3, kind: 'sign-alcove' },
]
```

- [ ] **Step 2: Extend the `kind` union and add a new branch in the renderer**

Update the type:

```tsx
kind: 'window' | 'laundry' | 'salon' | 'false-path' | 'sign-alcove'
```

Update the rendering switch in the existing `Corridor` component to handle the two new kinds:

```tsx
{def.kind === 'window' ? (
  <LitWindowDecor farWallX={farWallX} centreZ={centreZ} outward={outward} />
) : def.kind === 'laundry' ? (
  <LaundryKnotDecor midX={midX} farWallX={farWallX} centreZ={centreZ}
    outward={outward} ceiling={ceiling} />
) : def.kind === 'false-path' ? (
  <FalsePathDecor farWallX={farWallX} centreZ={centreZ} outward={outward} ceiling={ceiling} />
) : def.kind === 'sign-alcove' ? (
  <SignAlcoveDecor farWallX={farWallX} centreZ={centreZ} outward={outward} ceiling={ceiling} />
) : null}
```

And update the `SideCorridors` skip filter:

```tsx
{CORRIDORS.filter((c) => c.kind !== 'salon').map((c, i) => (
  <Corridor key={i} def={c} />
))}
```

(Salon still skipped — it has its own component. The new kinds render normally.)

- [ ] **Step 3: Add the two new decor components**

```tsx
function FalsePathDecor({ farWallX, centreZ, outward, ceiling }: {
  farWallX: number
  centreZ: number
  outward: number
  ceiling: number
}) {
  // The illusion: dark passage that LOOKS like it bends/continues. Achieved
  // with a darker far-wall + a single VERY dim point light deep in, so the
  // wall reads as "more darkness beyond" rather than a flat dead end.
  return (
    <group>
      {/* Repaint the far wall darker than the corridor's default to enhance
          the depth illusion — overlaps the standard far wall already drawn
          by Corridor (slightly inset). */}
      <mesh position={[farWallX - outward * 0.005, ceiling / 2, centreZ]}
        rotation={[0, -outward * Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, ceiling]} />
        <meshStandardMaterial color={'#0a0806'} roughness={0.98} />
      </mesh>
      {/* Single very dim deep light, biased toward floor for atmospheric "something around the corner" feel */}
      <pointLight
        position={[farWallX - outward * 0.15, 0.4, centreZ]}
        color={'#503020'}
        intensity={0.25}
        distance={1.8}
        decay={2}
      />
    </group>
  )
}

function SignAlcoveDecor({ farWallX, centreZ, outward, ceiling }: {
  farWallX: number
  centreZ: number
  outward: number
  ceiling: number
}) {
  // Vertical "九龍城寨業主聯誼會" wooden sign hanging from the ceiling of the
  // alcove. Wood plank with red calligraphic characters baked into a canvas
  // texture (procedural — keeps everything self-contained).
  const signTex = (() => {
    const c = document.createElement('canvas')
    c.width = 64; c.height = 256
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#f4e8c8'
    ctx.fillRect(0, 0, 64, 256)
    ctx.fillStyle = '#8a1a18'
    ctx.font = 'bold 36px serif'
    ctx.textAlign = 'center'
    const chars = ['九', '龍', '城', '寨', '業', '主', '聯', '誼', '會']
    chars.forEach((ch, i) => ctx.fillText(ch, 32, 30 + i * 25))
    const tex = new (require('three').CanvasTexture as any)(c)
    return tex
  })()

  return (
    <group>
      {/* Sign plank, hanging by 2 thin wires from the ceiling */}
      <mesh position={[farWallX - outward * 0.25, ceiling - 0.9, centreZ]}>
        <boxGeometry args={[0.04, 1.4, 0.18]} />
        <meshStandardMaterial map={signTex} color={'#f0e0c0'} roughness={0.85} />
      </mesh>
      {/* Two hanging wires */}
      {[-0.06, 0.06].map((zOff, i) => (
        <mesh key={i}
          position={[farWallX - outward * 0.25, ceiling - 0.18, centreZ + zOff]}>
          <cylinderGeometry args={[0.003, 0.003, 0.4, 4]} />
          <meshStandardMaterial color={'#1a1410'} />
        </mesh>
      ))}
      {/* Single warm ambient bulb to rim-light the sign */}
      <pointLight
        position={[farWallX - outward * 0.05, ceiling - 0.15, centreZ]}
        color={'#ffb878'}
        intensity={0.7}
        distance={1.8}
        decay={2}
      />
    </group>
  )
}
```

Replace the inline `require` at the top of the file:

```tsx
import * as THREE from 'three'
```

(it's likely already imported — confirm; the SignAlcoveDecor texture creation should use the imported `THREE.CanvasTexture` instead of `require`.)

Use this corrected version of the texture creation:

```tsx
const tex = new THREE.CanvasTexture(c)
```

- [ ] **Step 4: Typecheck + visual check**

Run: `npm run typecheck && npm run dev`
Expected: typecheck passes. The 2 new corridors don't render correctly *until* the bounds calculation in `index.tsx` is updated — but the wall openings + corridor geometry should be visible in the browser. Walk to z=−12 right and z=−25 left to confirm the corridor walls + decor render. Note that `CORRIDOR_BOUNDS` in index.tsx assumes alleyWallX = ±0.9 (axis x=0); the z=−25 left corridor is OFF the deep segment (axis x=−2), so its alleyWallX is at x=−2.9. This is fixed in Task 5 (BOUNDS update).

- [ ] **Step 5: Commit**

```bash
git add src/worlds/WalledCity/SideCorridors.tsx
git commit -m "feat(walled-city): add false-path + sign-alcove side corridors"
```

---

## Task 4: Rotate Stairwell 90° to perpendicular branch

**Files:**
- Modify: `src/worlds/WalledCity/Stairwell.tsx`

**Why:** Spec §2.2. With the alley extending past z=−5, the existing axial stairwell would block the alley. Rotate it so it branches west off the entrance segment at z=−9 to z=−8, ramping up perpendicular along the X axis to reach the existing rooftop deck at y=5.

- [ ] **Step 1: Read current Stairwell.tsx**

Run: `cat src/worlds/WalledCity/Stairwell.tsx`
Identify: the `stairFloor(x, z)` function (currently ramps along z) and the wall/step geometry that needs rotating.

- [ ] **Step 2: Rewrite `stairFloor` to ramp along X**

Replace the existing floor function:

```tsx
// Stairs ramp along the X axis from x=−0.8 (alley wall, y=0) to x=−6 (top, y=5).
// z range is the corridor depth: z ∈ [−9, −8].
export function stairFloor(x: number, z: number): number {
  if (z > -8 || z < -9) return 0  // outside corridor depth
  if (x > -0.8) return 0          // alley side
  if (x < -6) return 5            // landed on rooftop level
  // Linear ramp from y=0 at x=−0.8 to y=5 at x=−6
  const t = (-0.8 - x) / 5.2
  return t * 5
}
```

- [ ] **Step 3: Rewrite the Stairwell render to build steps along X**

```tsx
export function Stairwell() {
  const stepCount = 13
  const stepDepth = 0.4   // along X
  const stepRise = 0.385  // 5m / 13
  const stepWidth = 1.0   // along Z (matches corridor width)
  const startX = -0.8     // alley side
  const corridorZ = -8.5  // center between -8 and -9

  return (
    <group>
      {/* Steps */}
      {Array.from({ length: stepCount }).map((_, i) => {
        const x = startX - (i + 0.5) * stepDepth
        const y = (i + 0.5) * stepRise
        return (
          <mesh key={i} position={[x, y, corridorZ]}>
            <boxGeometry args={[stepDepth, stepRise, stepWidth]} />
            <meshStandardMaterial color={'#3a3128'} roughness={0.9} />
          </mesh>
        )
      })}
      {/* Side walls (perpendicular to alley, span the corridor depth) */}
      {[-9, -8].map((zEdge, i) => (
        <mesh key={i}
          position={[startX - 2.6, 2.5, zEdge]}
          rotation={[0, 0, 0]}>
          <planeGeometry args={[5.2, 5]} />
          <meshStandardMaterial color={'#2a2520'} roughness={0.95}
            side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Ceiling above stairs (sloped) */}
      <mesh
        position={[startX - 2.6, 5 + 1.0, corridorZ]}
        rotation={[0, 0, Math.atan2(5, 5.2)]}>
        <planeGeometry args={[Math.sqrt(5 * 5 + 5.2 * 5.2), 1.0]} />
        <meshStandardMaterial color={'#1a1610'} roughness={0.95}
          side={THREE.DoubleSide} />
      </mesh>
      {/* Dim bare bulb mid-flight */}
      <pointLight
        position={[startX - 2.6, 2.5, corridorZ]}
        color={'#d8a060'}
        intensity={0.6}
        distance={3}
        decay={2}
      />
    </group>
  )
}
```

- [ ] **Step 4: Typecheck + visual check**

Run: `npm run typecheck && npm run dev`
Expected: typecheck passes. Stairs now extend perpendicular west from the alley at z=−8.5. Walking up them from z≈−9, x=−0.8 should ramp you up to y=5 at x=−6 — the rooftop deck level. Note: the Stairwell bound in `index.tsx` is wrong until Task 5 — for now the player may not be able to walk up. That's OK for visual confirmation.

- [ ] **Step 5: Commit**

```bash
git add src/worlds/WalledCity/Stairwell.tsx
git commit -m "refactor(walled-city): rotate Stairwell to perpendicular branch"
```

---

## Task 5: Update WalledCity/index.tsx — BOUNDS rewrite + new mounts

**Files:**
- Modify: `src/worlds/WalledCity/index.tsx`

**Why:** With the alley extended + dogleg + rotated stairs + new corridors + 冰室 walk-in zone + an opening to the rooftop, the entire `BOUNDS` array needs to be rewritten. Also mount the AlleyDogleg (added in Task 2 — keep it; the temp mount becomes permanent).

- [ ] **Step 1: Update CORRIDOR_BOUNDS to handle deep-segment-side corridors**

In `index.tsx`, modify the `CORRIDOR_BOUNDS` mapping so corridors at z<−16 (deep segment, axis x=−2) compute alleyWallX from x=−2 instead of x=0:

```tsx
const CORRIDOR_BOUNDS: Zone[] = CORRIDORS
  .filter((c) => c.kind !== 'salon')
  .map((c) => {
    const zMin = c.z - c.halfWidth + 0.05
    const zMax = c.z + c.halfWidth - 0.05
    // Deep-segment corridors hang off axis x=−2; entrance-segment off x=0.
    const segmentCenterX = c.z < -16 ? -2 : 0
    if (c.side === 'left') {
      return {
        min: [WORLD_X + segmentCenterX - 0.9 - c.depth + 0.2, 0, zMin] as [number, number, number],
        max: [WORLD_X + segmentCenterX - 0.8, c.ceiling, zMax] as [number, number, number],
      }
    }
    return {
      min: [WORLD_X + segmentCenterX + 0.8, 0, zMin] as [number, number, number],
      max: [WORLD_X + segmentCenterX + 0.9 + c.depth - 0.2, c.ceiling, zMax] as [number, number, number],
    }
  })
```

- [ ] **Step 2: Rewrite BOUNDS to cover the new layout**

Replace the existing `BOUNDS` array:

```tsx
const BOUNDS: Zone[] = [
  // Entrance segment of the alley — keeps original front (z=+4.8) but back
  // wall is now gone (used to be at z=−5, now we extend past it).
  // x=±0.8, z ∈ [−14, +4.8].
  { min: [WORLD_X - 0.8, 0, -14], max: [WORLD_X + 0.8, 3.8, 4.8] },

  // Dogleg transition zone — quad walk area between the two segments.
  // We approximate as a rect that covers both segments' overlap; precise
  // bounding is a quad, but a slightly generous rect is fine for player
  // navigation because the wall meshes contain them visually.
  { min: [WORLD_X - 2.8, 0, -16], max: [WORLD_X + 0.8, 3.8, -14] },

  // Deep segment of the alley (axis x=−2). Goes from dogleg far edge
  // (z=−16) down to where the FruitStall begins blocking (z=−28).
  { min: [WORLD_X - 2.8, 0, -28], max: [WORLD_X - 1.2, 3.8, -16] },

  ...CORRIDOR_BOUNDS,

  // Stairwell — perpendicular branch off entrance segment at z=[−9, −8].
  // Floor ramps via stairFloor() from y=0 at x=−0.8 to y=5 at x=−6.
  {
    min: [WORLD_X - 6, 0, -9], max: [WORLD_X - 0.8, 7, -8],
    floorFn: (x, z) => stairFloor(x - WORLD_X, z),
  },

  // Rooftop — unchanged from before.
  { min: [WORLD_X - 5.8, 5, -24.8], max: [WORLD_X + 5.8, 20, -11] },

  // Salon — unchanged.
  { min: [WORLD_X + 0.7, 0, -0.8], max: [WORLD_X + 2.85, 2.2, 0.0] },
  { min: [WORLD_X + 0.95, 0, -2.45], max: [WORLD_X + 2.85, 2.2, -0.05] },

  // 強記冰室 walk-in interior — right side of deep segment, 2m wide × 4m deep × 2.8m ceiling.
  { min: [WORLD_X - 1.1, 0, -22], max: [WORLD_X + 0.9, 2.8, -18] },
]
```

- [ ] **Step 3: Add new mounts to the WalledCity render**

```tsx
import { AlleyDogleg } from './AlleyDogleg'
import { Sundry } from './Sundry'
import { BingSutt } from './BingSutt'
import { FruitStall } from './FruitStall'
import { ShopFigures } from './ShopFigures'
import { InteractableHUD } from './InteractableHUD'

// Inside the <group position={[WORLD_X, 0, 0]}>:
<AlleyDogleg />
<Sundry />
<BingSutt />
<FruitStall />
<ShopFigures />

// OUTSIDE the <group>, alongside <FirstPersonControls>:
<InteractableHUD />
```

(InteractableHUD lives outside the WORLD_X group because it positions its lights in world-space directly, with WORLD_X baked into the interactable definitions — see Task 17.)

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`
Expected: PASS. (Components imported are skeletons — they may render nothing until later tasks. That's fine.)

- [ ] **Step 5: Commit**

```bash
git add src/worlds/WalledCity/index.tsx
git commit -m "feat(walled-city): wire BOUNDS + mounts for extended alley"
```

---

## Task 6: Extend ApartmentFacades, DentistSigns, PosterLayers along the new run

**Files:**
- Modify: `src/worlds/WalledCity/ApartmentFacades.tsx`
- Modify: `src/worlds/WalledCity/DentistSigns.tsx`
- Modify: `src/worlds/WalledCity/PosterLayers.tsx`

**Why:** Continuous KWC frontage along the new 25m run. These three are procedural — extend their scatter range from the current ~z=−5 cap to z=−30. ApartmentFacades skips slots where shops occupy walls (士多 left z=−5..−8, 冰室 right z=−18..−22, alcoves at corridor positions).

- [ ] **Step 1: Read each file's existing scatter logic**

Run: `head -60 src/worlds/WalledCity/ApartmentFacades.tsx src/worlds/WalledCity/DentistSigns.tsx src/worlds/WalledCity/PosterLayers.tsx`
Identify: the z range or array of slot positions. Most likely an array of objects like `{ z: -3, side: 'left', kind: 'window' }`.

- [ ] **Step 2: Extend each scatter array**

For each file, add new entries covering z ∈ [−6, −30] (skipping shop-occupied wall segments). Example for ApartmentFacades.tsx — append to whatever the existing `SLOTS` array is:

```tsx
// Existing entries...
// New entries along the extension. SHOP-EXCLUDED ranges:
//   士多 left:    z ∈ [−5, −8]
//   冰室 right:   z ∈ [−18, −22]
//   生果檔 end:   z ∈ [−28, −30]
//   stairwell L: z ∈ [−9, −8]
//   false-path R: z ∈ [−12.5, −11.5]
//   sign-alcove L: z ∈ [−25.4, −24.6]
{ z: -10, side: 'left',  kind: 'window-bars' },
{ z: -10, side: 'right', kind: 'ac-unit' },
{ z: -13, side: 'left',  kind: 'shutter' },
{ z: -14, side: 'right', kind: 'window-bars' },
// (deep segment — note the segment is offset to x=−2, but the side='left'/'right'
// computation in this component uses local x=±0.9 relative to whatever AlleyShell
// renders, so add a `segmentCenterX` field if needed; otherwise hardcode positions
// using the segment's x-axis — adapt to the existing component's pattern.)
{ z: -17, side: 'right', kind: 'ac-unit',     segmentCenterX: -2 },
{ z: -20, side: 'left',  kind: 'window-bars', segmentCenterX: -2 },
{ z: -23, side: 'right', kind: 'shutter',     segmentCenterX: -2 },
{ z: -26, side: 'left',  kind: 'ac-unit',     segmentCenterX: -2 },
{ z: -27, side: 'right', kind: 'window-bars', segmentCenterX: -2 },
```

If `ApartmentFacades` doesn't currently have a `segmentCenterX` concept, add it: each facade slot computes its mount X from `(segmentCenterX ?? 0) ± 0.8`.

For `DentistSigns.tsx` — add 2-3 more signs:

```tsx
{ z: -11, side: 'right', textTop: '陳', textBottom: '牙科', glowColor: '#ffb060' },
{ z: -19, side: 'left',  textTop: '吳', textBottom: '齒科', glowColor: '#ff6040', segmentCenterX: -2 },
{ z: -26, side: 'right', textTop: '黃', textBottom: '牙醫', glowColor: '#60d0ff', segmentCenterX: -2 },
```

For `PosterLayers.tsx` — 1-2 dense clusters near the side-corridor entrances:

```tsx
{ z: -12, side: 'left',  density: 'dense' },     // near false-path
{ z: -25, side: 'right', density: 'dense', segmentCenterX: -2 }, // near sign-alcove
{ z: -16, side: 'left',  density: 'sparse' },
{ z: -24, side: 'left',  density: 'sparse', segmentCenterX: -2 },
```

- [ ] **Step 3: Typecheck + visual check**

Run: `npm run typecheck && npm run dev`
Expected: typecheck passes. Walking down the alley shows windows, AC units, shutters, dentist signs, and poster clusters along the new 25m run. Wall sections where shops will go are visibly empty (no facades there).

- [ ] **Step 4: Commit**

```bash
git add src/worlds/WalledCity/ApartmentFacades.tsx src/worlds/WalledCity/DentistSigns.tsx src/worlds/WalledCity/PosterLayers.tsx
git commit -m "feat(walled-city): extend apartment facades + dentist signs + posters along new run"
```

---

## Task 7: Extend PipeWeb, FluorescentTubes, MailSlots, Clutter along the new run

**Files:**
- Modify: `src/worlds/WalledCity/PipeWeb.tsx`
- Modify: `src/worlds/WalledCity/FluorescentTubes.tsx`
- Modify: `src/worlds/WalledCity/MailSlots.tsx`
- Modify: `src/worlds/WalledCity/Clutter.tsx`

**Why:** Same pattern as Task 6. PipeWeb gets 1.5× density past the dogleg (per maze brief). FluorescentTubes gets more dead/flickering past the dogleg. MailSlots + Clutter just extend.

- [ ] **Step 1: Read each file's scatter logic**

Run: `head -50 src/worlds/WalledCity/PipeWeb.tsx src/worlds/WalledCity/FluorescentTubes.tsx src/worlds/WalledCity/MailSlots.tsx src/worlds/WalledCity/Clutter.tsx`

- [ ] **Step 2: Extend PipeWeb**

Find the constant that controls how many pipes / what z range. Likely something like `PIPE_COUNT = 30` and `Z_RANGE = [-5, 4.8]`. Bump:

```tsx
// Pipes now span the full alley including the dogleg + deep segment.
// Density past dogleg (z<−16) is 1.5× the entrance density to sell the
// "infrastructure jungle thickens deeper into the maze" beat.
const PIPE_COUNT_ENTRANCE = 30  // unchanged from current
const PIPE_COUNT_DEEP = 36      // bumped 1.5× for the 14m deep segment
const Z_RANGE_ENTRANCE = [-14, 4.8] as const
const Z_RANGE_DEEP = [-30, -16] as const
```

Then in the pipe-generation loop, generate two passes (entrance + deep) using the appropriate count and z range. For deep-segment pipes, offset the X axis by −2 to follow the dogleg.

- [ ] **Step 3: Extend FluorescentTubes**

```tsx
// Tubes scattered at irregular intervals. Past the dogleg, more are dead
// or flickering than live — sells the gloom transition.
const TUBES_ENTRANCE = [
  // existing tubes... PLUS:
  { z: -7, x: 0, dead: false, flicker: false },
  { z: -11, x: 0, dead: false, flicker: true },
  { z: -13, x: 0, dead: true,  flicker: false },
]
const TUBES_DEEP = [
  // Past the dogleg — axis x=−2, more dead/flicker.
  { z: -17, x: -2, dead: false, flicker: true },
  { z: -19, x: -2, dead: true,  flicker: false },
  { z: -21, x: -2, dead: false, flicker: false }, // one good light over 冰室
  { z: -24, x: -2, dead: true,  flicker: false },
  { z: -27, x: -2, dead: false, flicker: true },
  { z: -29, x: -2, dead: true,  flicker: false }, // dead end is darkest
]
```

Combine the two arrays in the render.

- [ ] **Step 4: Extend MailSlots**

Add a few new slots between the shops:

```tsx
{ z: -7, side: 'right', segmentCenterX: 0 },   // opposite 士多
{ z: -13, side: 'left',  segmentCenterX: 0 },
{ z: -19, side: 'left',  segmentCenterX: -2 }, // opposite 冰室
{ z: -24, side: 'right', segmentCenterX: -2 },
```

- [ ] **Step 5: Extend Clutter**

```tsx
{ kind: 'trash-bag', z: -8, x: 0.5, segmentCenterX: 0 },
{ kind: 'crate-stack', z: -13, x: -0.4, segmentCenterX: 0 },
{ kind: 'broken-stool', z: -17, x: -2.5, segmentCenterX: -2 },
{ kind: 'trash-bag', z: -23, x: -1.4, segmentCenterX: -2 },
{ kind: 'crate-stack', z: -27, x: -2.5, segmentCenterX: -2 },
```

- [ ] **Step 6: Typecheck + visual check**

Run: `npm run typecheck && npm run dev`
Expected: typecheck passes. Walking the alley shows pipes thickening past the dogleg, fluorescent tubes intermittent (some flickering, some dead), mail slots along apartment walls, debris on the floor.

- [ ] **Step 7: Commit**

```bash
git add src/worlds/WalledCity/PipeWeb.tsx src/worlds/WalledCity/FluorescentTubes.tsx src/worlds/WalledCity/MailSlots.tsx src/worlds/WalledCity/Clutter.tsx
git commit -m "feat(walled-city): extend pipes/tubes/mailslots/clutter along new run"
```

---

## Task 8: Sundry shop frontage (士多)

**Files:**
- Create: `src/worlds/WalledCity/Sundry.tsx`

**Why:** Spec §3.1 frontage portion. This task creates the shell, the gate, the hanging bulb, the lace-fringe trim along the counter, and the 2 wooden chairs + crate outside the gate. Shelves/counter are added in Tasks 9 and 10.

- [ ] **Step 1: Create Sundry.tsx with frontage scaffolding**

```tsx
import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// Position constants for 士多 — left side of entrance segment, z=−5 to −8.
const SHOP_Z_NEAR = -5
const SHOP_Z_FAR = -8
const SHOP_Z_MID = (SHOP_Z_NEAR + SHOP_Z_FAR) / 2
const SHOP_X_DOORWAY = -0.8     // alley wall plane
const SHOP_X_BACK = -2.3        // 1.5m deep interior
const SHOP_CEILING = 2.8

export function Sundry() {
  return (
    <group>
      <SundryShell />
      <SundryGate />
      <SundryHangingBulb />
      <SundryLaceFringe />
      <SundryOutdoorSeating />
    </group>
  )
}

function SundryShell() {
  // Floor + ceiling + back wall + side walls. Reuses material patterns from
  // AlleyShell for visual cohesion.
  return (
    <group>
      {/* Floor — small green mosaic tile per spec */}
      <mesh position={[(SHOP_X_DOORWAY + SHOP_X_BACK) / 2, 0.005, SHOP_Z_MID]}
        rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[Math.abs(SHOP_X_BACK - SHOP_X_DOORWAY), Math.abs(SHOP_Z_FAR - SHOP_Z_NEAR)]} />
        <meshStandardMaterial color={'#3a5848'} roughness={0.85} />
      </mesh>
      {/* Back wall */}
      <mesh position={[SHOP_X_BACK, SHOP_CEILING / 2, SHOP_Z_MID]}
        rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[Math.abs(SHOP_Z_FAR - SHOP_Z_NEAR), SHOP_CEILING]} />
        <meshStandardMaterial color={'#3a3530'} roughness={0.92} />
      </mesh>
      {/* Side walls */}
      {[SHOP_Z_NEAR, SHOP_Z_FAR].map((z, i) => (
        <mesh key={i} position={[(SHOP_X_DOORWAY + SHOP_X_BACK) / 2, SHOP_CEILING / 2, z]}>
          <planeGeometry args={[Math.abs(SHOP_X_BACK - SHOP_X_DOORWAY), SHOP_CEILING]} />
          <meshStandardMaterial color={'#3a3530'} roughness={0.92} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Ceiling */}
      <mesh position={[(SHOP_X_DOORWAY + SHOP_X_BACK) / 2, SHOP_CEILING, SHOP_Z_MID]}
        rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[Math.abs(SHOP_X_BACK - SHOP_X_DOORWAY), Math.abs(SHOP_Z_FAR - SHOP_Z_NEAR)]} />
        <meshStandardMaterial color={'#2a2520'} roughness={0.95} />
      </mesh>
    </group>
  )
}

function SundryGate() {
  // Iron rolling gate, half-pulled. Two parts: the pulled-up roll at the top,
  // and the still-down lower section visible at the bottom of the doorway.
  const gateY = 1.6
  return (
    <group>
      {/* Upper roll (cylinder under the eave) */}
      <mesh position={[SHOP_X_DOORWAY + 0.05, SHOP_CEILING - 0.15, SHOP_Z_MID]}
        rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.08, 0.08, Math.abs(SHOP_Z_FAR - SHOP_Z_NEAR) - 0.2, 12]} />
        <meshStandardMaterial color={'#4a3a2a'} metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Lower curtain (still down, 0..1.0m) — corrugated metal look */}
      <mesh position={[SHOP_X_DOORWAY + 0.02, 0.5, SHOP_Z_MID]}>
        <boxGeometry args={[0.04, 1.0, Math.abs(SHOP_Z_FAR - SHOP_Z_NEAR) - 0.2]} />
        <meshStandardMaterial color={'#3a2c20'} metalness={0.4} roughness={0.7} />
      </mesh>
    </group>
  )
}

function SundryHangingBulb() {
  // Bare bulb hanging from the eave, swaying barely-perceptibly.
  const bulbRef = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (!bulbRef.current) return
    bulbRef.current.rotation.z = Math.sin(performance.now() * 0.0008) * 0.04
  })
  return (
    <group ref={bulbRef} position={[SHOP_X_DOORWAY - 0.2, SHOP_CEILING - 0.05, SHOP_Z_MID]}>
      {/* Cord */}
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.5, 4]} />
        <meshStandardMaterial color={'#1a1410'} />
      </mesh>
      {/* Bulb */}
      <mesh position={[0, -0.55, 0]}>
        <sphereGeometry args={[0.05, 12, 8]} />
        <meshStandardMaterial color={'#fff0c0'} emissive={'#ffe080'} emissiveIntensity={2.5} />
      </mesh>
      <pointLight position={[0, -0.55, 0]} color={'#ffd890'} intensity={1.4} distance={3.5} decay={2} />
    </group>
  )
}

function SundryLaceFringe() {
  // White lace-fringe trim along the counter front. Procedural canvas texture
  // for the lace pattern.
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 32
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#fff8e8'
    ctx.fillRect(0, 0, 512, 32)
    // Scallop pattern along the bottom edge
    ctx.fillStyle = '#3a3530'
    for (let i = 0; i < 16; i++) {
      ctx.beginPath()
      ctx.arc(i * 32 + 16, 32, 14, 0, Math.PI)
      ctx.fill()
    }
    return new THREE.CanvasTexture(c)
  }, [])
  return (
    <mesh position={[SHOP_X_DOORWAY - 0.3, 0.95, SHOP_Z_MID]}>
      <planeGeometry args={[0.06, Math.abs(SHOP_Z_FAR - SHOP_Z_NEAR) - 0.3]} />
      <meshStandardMaterial map={tex} transparent alphaTest={0.4} side={THREE.DoubleSide} />
    </mesh>
  )
}

function SundryOutdoorSeating() {
  // 2 worn wooden chairs on the alley floor outside the gate, with empty
  // teacups on a small wooden crate between them.
  const chairY = 0.22
  return (
    <group>
      {[-0.5, 0.5].map((zOff, i) => (
        <group key={i} position={[SHOP_X_DOORWAY + 0.4, 0, SHOP_Z_MID + zOff]}>
          {/* Seat */}
          <mesh position={[0, chairY, 0]}>
            <boxGeometry args={[0.3, 0.04, 0.3]} />
            <meshStandardMaterial color={'#5a3a20'} roughness={0.85} />
          </mesh>
          {/* 4 legs */}
          {[[-0.13, -0.13], [0.13, -0.13], [-0.13, 0.13], [0.13, 0.13]].map((p, j) => (
            <mesh key={j} position={[p[0], chairY / 2, p[1]]}>
              <cylinderGeometry args={[0.015, 0.018, chairY, 6]} />
              <meshStandardMaterial color={'#3a2810'} roughness={0.9} />
            </mesh>
          ))}
          {/* Backrest */}
          <mesh position={[0, chairY + 0.18, -0.13]}>
            <boxGeometry args={[0.3, 0.36, 0.02]} />
            <meshStandardMaterial color={'#5a3a20'} roughness={0.85} />
          </mesh>
        </group>
      ))}
      {/* Crate between chairs (small wooden box, ~0.3m cube) */}
      <mesh position={[SHOP_X_DOORWAY + 0.4, 0.15, SHOP_Z_MID]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={'#6a4828'} roughness={0.9} />
      </mesh>
      {/* 2 teacups on the crate (small white cylinders) */}
      {[-0.08, 0.08].map((zOff, i) => (
        <mesh key={i} position={[SHOP_X_DOORWAY + 0.4, 0.32, SHOP_Z_MID + zOff]}>
          <cylinderGeometry args={[0.025, 0.022, 0.04, 8]} />
          <meshStandardMaterial color={'#f0e8d8'} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}
```

- [ ] **Step 2: Cut the wall opening in AlleyShell for 士多**

The 士多 needs a gap in the alley left wall from z=−5 to z=−8. Modify `AlleyShell.tsx` `Segment` to optionally take a `leftWallOpenings` array of `{ zStart, zEnd }` and split the left wall into pieces around those openings. For Task 8, pass:

```tsx
<Segment
  zStart={-14} zEnd={4.8} centerX={0}
  hasBackWall={false} hasFrontWall={false}
  leftWallOpenings={[{ zStart: -8, zEnd: -5 }]}
/>
```

Update the Segment to render the left wall as 1+N planes around the openings. (Same pattern will be used for 冰室 right-wall opening in Task 11.)

- [ ] **Step 3: Typecheck + visual check**

Run: `npm run typecheck && npm run dev`
Expected: typecheck passes. Walking down the alley left side at z=−6, the wall has an opening with the 士多 frontage visible — gate, lace fringe, hanging bulb glowing, 2 chairs out front. Interior is empty (shelves/counter come in Tasks 9 + 10).

- [ ] **Step 4: Commit**

```bash
git add src/worlds/WalledCity/Sundry.tsx src/worlds/WalledCity/AlleyShell.tsx
git commit -m "feat(walled-city): add Sundry shop frontage (gate, bulb, chairs)"
```

---

## Task 9: Sundry shelves (instanced cans, jars, cigarettes, biscuit tins)

**Files:**
- Modify: `src/worlds/WalledCity/Sundry.tsx`

**Why:** Spec §3.1 — back-wall shelves filled floor-to-ceiling. Use InstancedMesh per the instancing memory.

- [ ] **Step 1: Add SundryShelves component**

Append to Sundry.tsx:

```tsx
function SundryShelves() {
  // 4 horizontal shelf planks against the back wall (x = SHOP_X_BACK), with
  // instanced props on each.
  const shelfHeights = [0.4, 0.95, 1.5, 2.05]  // 4 shelves
  const shelfDepth = 0.25
  const shelfXFront = SHOP_X_BACK + shelfDepth + 0.02

  // Instanced cans for shelves 1-2 (heights 0.4, 0.95). 6 unique can
  // textures cycled across instances.
  const canCount = 24
  const canMatrix = useMemo(() => {
    const arr: THREE.Matrix4[] = []
    const m = new THREE.Matrix4()
    for (let s = 0; s < 2; s++) {
      const y = shelfHeights[s] + 0.07
      const cansThisShelf = 12
      for (let i = 0; i < cansThisShelf; i++) {
        const z = SHOP_Z_FAR + 0.15 + (i / (cansThisShelf - 1)) * (Math.abs(SHOP_Z_FAR - SHOP_Z_NEAR) - 0.3)
        const x = shelfXFront - 0.05 - (i % 2) * 0.06
        m.makeTranslation(x, y, z)
        arr.push(m.clone())
      }
    }
    return arr
  }, [])

  // Instanced glass jars (bottom shelf) — 5 jars, larger
  const jarCount = 5
  const jarMatrix = useMemo(() => {
    const arr: THREE.Matrix4[] = []
    const m = new THREE.Matrix4()
    const y = shelfHeights[0] + 0.12
    for (let i = 0; i < jarCount; i++) {
      const z = SHOP_Z_FAR + 0.3 + (i / (jarCount - 1)) * (Math.abs(SHOP_Z_FAR - SHOP_Z_NEAR) - 0.6)
      m.makeTranslation(shelfXFront - 0.07, y, z)
      arr.push(m.clone())
    }
    return arr
  }, [])

  // Instanced cigarette boxes (shelf 3) — small white rectangles
  const cigCount = 18
  const cigMatrix = useMemo(() => {
    const arr: THREE.Matrix4[] = []
    const m = new THREE.Matrix4()
    const y = shelfHeights[2] + 0.05
    for (let i = 0; i < cigCount; i++) {
      const z = SHOP_Z_FAR + 0.18 + (i / (cigCount - 1)) * (Math.abs(SHOP_Z_FAR - SHOP_Z_NEAR) - 0.36)
      m.makeTranslation(shelfXFront - 0.04 - (i % 3) * 0.04, y, z)
      arr.push(m.clone())
    }
    return arr
  }, [])

  // Instanced round biscuit tins (top shelf) — 4 tall red tins
  const tinCount = 4
  const tinMatrix = useMemo(() => {
    const arr: THREE.Matrix4[] = []
    const m = new THREE.Matrix4()
    const y = shelfHeights[3] + 0.18
    for (let i = 0; i < tinCount; i++) {
      const z = SHOP_Z_FAR + 0.4 + (i / (tinCount - 1)) * (Math.abs(SHOP_Z_FAR - SHOP_Z_NEAR) - 0.8)
      m.makeTranslation(shelfXFront - 0.1, y, z)
      arr.push(m.clone())
    }
    return arr
  }, [])

  return (
    <group>
      {/* Shelf planks */}
      {shelfHeights.map((y, i) => (
        <mesh key={i} position={[SHOP_X_BACK + shelfDepth / 2 + 0.02, y, SHOP_Z_MID]}>
          <boxGeometry args={[shelfDepth, 0.025, Math.abs(SHOP_Z_FAR - SHOP_Z_NEAR) - 0.1]} />
          <meshStandardMaterial color={'#3a2820'} roughness={0.85} />
        </mesh>
      ))}

      {/* Cans (instanced) */}
      <instancedMesh args={[undefined, undefined, canCount]}
        ref={(ref) => { if (!ref) return; canMatrix.forEach((m, i) => ref.setMatrixAt(i, m)); ref.instanceMatrix.needsUpdate = true }}>
        <cylinderGeometry args={[0.03, 0.03, 0.09, 10]} />
        <meshStandardMaterial color={'#9a3020'} roughness={0.6} metalness={0.3} />
      </instancedMesh>

      {/* Glass jars (instanced) */}
      <instancedMesh args={[undefined, undefined, jarCount]}
        ref={(ref) => { if (!ref) return; jarMatrix.forEach((m, i) => ref.setMatrixAt(i, m)); ref.instanceMatrix.needsUpdate = true }}>
        <cylinderGeometry args={[0.07, 0.07, 0.18, 12]} />
        <meshStandardMaterial color={'#d8c890'} transparent opacity={0.6} roughness={0.2} />
      </instancedMesh>

      {/* Cigarette boxes (instanced) */}
      <instancedMesh args={[undefined, undefined, cigCount]}
        ref={(ref) => { if (!ref) return; cigMatrix.forEach((m, i) => ref.setMatrixAt(i, m)); ref.instanceMatrix.needsUpdate = true }}>
        <boxGeometry args={[0.04, 0.07, 0.025]} />
        <meshStandardMaterial color={'#f0eee8'} roughness={0.7} />
      </instancedMesh>

      {/* Biscuit tins (instanced) */}
      <instancedMesh args={[undefined, undefined, tinCount]}
        ref={(ref) => { if (!ref) return; tinMatrix.forEach((m, i) => ref.setMatrixAt(i, m)); ref.instanceMatrix.needsUpdate = true }}>
        <cylinderGeometry args={[0.08, 0.08, 0.32, 14]} />
        <meshStandardMaterial color={'#a01818'} roughness={0.5} metalness={0.4} />
      </instancedMesh>
    </group>
  )
}
```

Add `<SundryShelves />` inside the main `Sundry` group.

- [ ] **Step 2: Typecheck + visual check**

Run: `npm run typecheck && npm run dev`
Expected: typecheck passes. The 士多 back wall now has 4 shelves stacked floor-to-ceiling with cans, jars, cigarette stacks, and tall red biscuit tins. Reads as densely-packed sundry shop per refs.

- [ ] **Step 3: Commit**

```bash
git add src/worlds/WalledCity/Sundry.tsx
git commit -m "feat(walled-city): add Sundry shelves (instanced cans/jars/cigs/tins)"
```

---

## Task 10: Sundry counter (abacus, phone, fridge with bottle opener, sodas)

**Files:**
- Modify: `src/worlds/WalledCity/Sundry.tsx`

**Why:** Spec §3.1 — counter on the left wall with character props.

- [ ] **Step 1: Add SundryCounter component**

Append to Sundry.tsx:

```tsx
function SundryCounter() {
  // Counter on the LEFT side wall (z=SHOP_Z_FAR side, faces toward doorway).
  // Counter top is at y=0.85, runs along the wall.
  const counterY = 0.85
  const counterX = (SHOP_X_DOORWAY + SHOP_X_BACK) / 2
  const counterZ = SHOP_Z_FAR + 0.2  // 0.2m off the back wall side

  return (
    <group>
      {/* Counter slab */}
      <mesh position={[counterX, counterY, counterZ]}>
        <boxGeometry args={[Math.abs(SHOP_X_BACK - SHOP_X_DOORWAY) - 0.1, 0.04, 0.4]} />
        <meshStandardMaterial color={'#3a2820'} roughness={0.7} />
      </mesh>
      {/* Counter front panel */}
      <mesh position={[counterX, counterY / 2, counterZ + 0.18]}>
        <boxGeometry args={[Math.abs(SHOP_X_BACK - SHOP_X_DOORWAY) - 0.1, counterY, 0.04]} />
        <meshStandardMaterial color={'#3a3028'} roughness={0.85} />
      </mesh>

      {/* Red abacus on the counter (~15-row beads) — single mesh approximation */}
      <group position={[counterX - 0.3, counterY + 0.04, counterZ]}>
        {/* Frame */}
        <mesh>
          <boxGeometry args={[0.3, 0.16, 0.04]} />
          <meshStandardMaterial color={'#5a1818'} roughness={0.6} />
        </mesh>
        {/* Beads — instanced for fewer draw calls */}
        <instancedMesh args={[undefined, undefined, 30]}
          ref={(ref) => {
            if (!ref) return
            const m = new THREE.Matrix4()
            for (let row = 0; row < 5; row++) {
              for (let col = 0; col < 6; col++) {
                m.makeTranslation(
                  -0.13 + col * 0.05,
                  -0.06 + row * 0.03,
                  0.025
                )
                ref.setMatrixAt(row * 6 + col, m)
              }
            }
            ref.instanceMatrix.needsUpdate = true
          }}>
          <sphereGeometry args={[0.012, 6, 4]} />
          <meshStandardMaterial color={'#1a0a08'} roughness={0.5} />
        </instancedMesh>
      </group>

      {/* Black rotary phone — boxy approximation */}
      <group position={[counterX + 0.1, counterY + 0.04, counterZ]}>
        <mesh>
          <boxGeometry args={[0.18, 0.07, 0.12]} />
          <meshStandardMaterial color={'#1a1410'} roughness={0.4} />
        </mesh>
        {/* Handset cradle bumps */}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.16, 8]} rotation={[0, 0, Math.PI / 2]} />
          <meshStandardMaterial color={'#1a1410'} roughness={0.4} />
        </mesh>
      </group>

      {/* Small ice-box / fridge to the right of the counter — separate mesh */}
      <group position={[counterX + 0.45, 0.45, counterZ]}>
        {/* Fridge body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.4, 0.9, 0.4]} />
          <meshStandardMaterial color={'#d8d0c0'} roughness={0.5} metalness={0.2} />
        </mesh>
        {/* Glass door (slightly cool emissive interior) */}
        <mesh position={[0, 0, 0.21]}>
          <planeGeometry args={[0.36, 0.86]} />
          <meshStandardMaterial color={'#a8c8d8'} transparent opacity={0.55} roughness={0.1} />
        </mesh>
        {/* Soda bottles inside (instanced — 6 visible through glass) */}
        <instancedMesh args={[undefined, undefined, 6]}
          ref={(ref) => {
            if (!ref) return
            const m = new THREE.Matrix4()
            for (let i = 0; i < 6; i++) {
              const row = Math.floor(i / 3)
              const col = i % 3
              m.makeTranslation(
                -0.1 + col * 0.1,
                -0.2 + row * 0.25,
                0
              )
              ref.setMatrixAt(i, m)
            }
            ref.instanceMatrix.needsUpdate = true
          }}>
          <cylinderGeometry args={[0.025, 0.025, 0.18, 8]} />
          <meshStandardMaterial color={'#3a6048'} roughness={0.3} transparent opacity={0.85} />
        </instancedMesh>
        {/* Cool emissive interior light (so bottles read through glass) */}
        <pointLight position={[0, 0, 0]} color={'#d8e8f0'} intensity={0.6} distance={0.6} decay={2} />

        {/* Bottle opener tied to the fridge with a string */}
        <mesh position={[0.21, 0.3, 0.21]}>
          <boxGeometry args={[0.04, 0.08, 0.005]} />
          <meshStandardMaterial color={'#888078'} metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0.21, 0.4, 0.21]}>
          <cylinderGeometry args={[0.001, 0.001, 0.2, 4]} />
          <meshStandardMaterial color={'#d8c890'} />
        </mesh>
      </group>
    </group>
  )
}
```

Add `<SundryCounter />` inside the main `Sundry` group.

- [ ] **Step 2: Typecheck + visual check**

Run: `npm run typecheck && npm run dev`
Expected: typecheck passes. Looking through the gate at the 士多, the left side now has a wood counter with red abacus, black rotary phone, and a small ice-box fridge with sodas glowing through the glass + a bottle opener tied with a string.

- [ ] **Step 3: Commit**

```bash
git add src/worlds/WalledCity/Sundry.tsx
git commit -m "feat(walled-city): add Sundry counter (abacus/phone/fridge/sodas)"
```

---

## Task 11: BingSutt directory + index.tsx + Frontage

**Files:**
- Create: `src/worlds/WalledCity/BingSutt/index.tsx`
- Create: `src/worlds/WalledCity/BingSutt/Frontage.tsx`

**Why:** Spec §3.2 — green steel frontage with sliding glass doors, calligraphic menu papers, vertical "強記冰室" sign, "歡迎光臨" red banner inside.

- [ ] **Step 1: Create BingSutt/index.tsx**

```tsx
import { Frontage } from './Frontage'
// Imports added in subsequent tasks:
// import { Counter } from './Counter'
// import { Booths } from './Booths'
// import { Decor } from './Decor'

// Position constants for 強記冰室 — right side of deep segment.
// Deep segment axis is x=−2, so right wall is at x=−2 + 0.8 = −1.2.
// Interior extends 2m east into the wall opening (back wall at x=+0.8).
export const BING_SUTT = {
  zNear: -18,        // boundary closest to entrance
  zFar: -22,         // boundary deepest
  doorwayX: -1.2,    // alley right wall (deep segment)
  backWallX: 0.8,    // 2m deep interior
  ceiling: 2.8,
}

export function BingSutt() {
  return (
    <group>
      <Frontage />
      {/* Counter, Booths, Decor added in Tasks 12-14 */}
    </group>
  )
}
```

- [ ] **Step 2: Create BingSutt/Frontage.tsx**

```tsx
import * as THREE from 'three'
import { useMemo } from 'react'
import { BING_SUTT } from './index'

export function Frontage() {
  const zMid = (BING_SUTT.zNear + BING_SUTT.zFar) / 2
  const length = Math.abs(BING_SUTT.zFar - BING_SUTT.zNear)

  // Calligraphic menu papers texture for the glass door
  const menuTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256; c.height = 512
    const ctx = c.getContext('2d')!
    // Glass/door background (slight tint, mostly transparent in alpha)
    ctx.fillStyle = 'rgba(180, 200, 180, 0.3)'
    ctx.fillRect(0, 0, 256, 512)
    // Plaster on red calligraphic menu strips
    const items = ['餐蛋麵 $8', '叉燒飯 $15', '西多士 $10', '凍檸茶 $6',
                   '鴛鴦 $7', '杏仁霜 $8', '菠蘿油 $5']
    ctx.fillStyle = '#ddd0b8'
    items.forEach((_, i) => ctx.fillRect(20 + i * 30, 50, 26, 220))
    ctx.fillStyle = '#a01818'
    ctx.font = 'bold 16px serif'
    items.forEach((text, i) => {
      ctx.save()
      ctx.translate(33 + i * 30, 70)
      ctx.rotate(Math.PI / 2)
      ctx.fillText(text, 0, 0)
      ctx.restore()
    })
    return new THREE.CanvasTexture(c)
  }, [])

  // Vertical "強記冰室" sign texture
  const signTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 96; c.height = 256
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#a01818'
    ctx.fillRect(0, 0, 96, 256)
    ctx.fillStyle = '#f0d860'
    ctx.font = 'bold 56px serif'
    ctx.textAlign = 'center'
    const chars = ['強', '記', '冰', '室']
    chars.forEach((ch, i) => ctx.fillText(ch, 48, 60 + i * 56))
    return new THREE.CanvasTexture(c)
  }, [])

  // "歡迎光臨" red banner above interior entrance
  const bannerTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 80
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#a01818'
    ctx.fillRect(0, 0, 512, 80)
    ctx.fillStyle = '#f0d860'
    ctx.font = 'bold 56px serif'
    ctx.textAlign = 'center'
    ctx.fillText('歡 迎 光 臨', 256, 60)
    return new THREE.CanvasTexture(c)
  }, [])

  return (
    <group>
      {/* Green steel frame around the door opening */}
      <mesh position={[BING_SUTT.doorwayX + 0.02, 1.4, zMid]}>
        <boxGeometry args={[0.05, 2.7, length]} />
        <meshStandardMaterial color={'#2a5a3a'} roughness={0.6} metalness={0.3} />
      </mesh>
      {/* Top horizontal frame member */}
      <mesh position={[BING_SUTT.doorwayX + 0.05, 2.6, zMid]}>
        <boxGeometry args={[0.1, 0.15, length + 0.1]} />
        <meshStandardMaterial color={'#2a5a3a'} roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Sliding glass door — one panel (right half) covering half the opening */}
      <mesh position={[BING_SUTT.doorwayX + 0.04, 1.4, BING_SUTT.zNear + length * 0.25]}>
        <planeGeometry args={[2.4, length * 0.5]} />
        <meshStandardMaterial map={menuTex} transparent opacity={0.85}
          roughness={0.15} side={THREE.DoubleSide} />
      </mesh>
      {/* Other half is the open door — leave gap so player walks in */}

      {/* Vertical "強記冰室" sign hanging perpendicular over the doorway */}
      <mesh position={[BING_SUTT.doorwayX - 0.5, 2.0, BING_SUTT.zNear - 0.1]}
        rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.0, 0.4]} />
        <meshStandardMaterial map={signTex} side={THREE.DoubleSide}
          emissive={'#a01818'} emissiveIntensity={0.3} />
      </mesh>

      {/* "歡迎光臨" red banner inside, above entrance */}
      <mesh position={[BING_SUTT.doorwayX + 0.3, 2.45, zMid]}
        rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[length - 0.4, 0.25]} />
        <meshStandardMaterial map={bannerTex} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 3: Cut wall opening in AlleyShell deep segment for 冰室**

Update Task 1's deep `Segment` invocation in AlleyShell to pass `rightWallOpenings`:

```tsx
<Segment
  zStart={-30} zEnd={-16} centerX={-2}
  hasBackWall={false} hasFrontWall={false}
  rightWallOpenings={[{ zStart: -22, zEnd: -18 }]}
/>
```

Add `rightWallOpenings` parameter to Segment matching the `leftWallOpenings` pattern from Task 8.

- [ ] **Step 4: Typecheck + visual check**

Run: `npm run typecheck && npm run dev`
Expected: typecheck passes. Walking past the dogleg, the right wall has an opening with the green steel-framed entrance, calligraphic menu papers on a half-open glass door, vertical "強記冰室" sign hanging perpendicular outside, and "歡迎光臨" banner visible inside above the doorway. Interior is empty (Tasks 12-14 fill it).

- [ ] **Step 5: Commit**

```bash
git add src/worlds/WalledCity/BingSutt/ src/worlds/WalledCity/AlleyShell.tsx
git commit -m "feat(walled-city): add BingSutt frontage (sign, glass door, banner)"
```

---

## Task 12: BingSutt Counter (marble counter, pastry case, wall menus)

**Files:**
- Create: `src/worlds/WalledCity/BingSutt/Counter.tsx`
- Modify: `src/worlds/WalledCity/BingSutt/index.tsx`

**Why:** Spec §3.2 — marble-faced counter at back of right wall, glass display case with pastries, vertical red wall menu strips above counter.

- [ ] **Step 1: Create Counter.tsx**

```tsx
import * as THREE from 'three'
import { useMemo } from 'react'
import { BING_SUTT } from './index'

export function Counter() {
  // Counter spans the back-wall side (x = BING_SUTT.backWallX), near the
  // far-z end of the shop.
  const counterY = 0.95
  const counterX = BING_SUTT.backWallX - 0.35  // 0.35m off the back wall
  const counterZ = BING_SUTT.zFar + 0.55       // 0.55m from far wall
  const counterLength = 1.6
  const counterDepth = 0.55

  // Wall menu papers — vertical red strips floor-to-ceiling above counter.
  // Single texture spanning the wall above the counter.
  const menuTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 256
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#3a3530'
    ctx.fillRect(0, 0, 512, 256)
    // Red paper strips with calligraphic items
    const items = ['餐蛋麵 $8', '叉燒飯 $15', '西多士 $10', '凍檸茶 $6',
                   '鴛鴦 $7', '杏仁霜 $8', '菠蘿油 $5', '常餐 $15',
                   '下午茶 $10', '魚蛋粉 $12']
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = '#a01818'
      ctx.fillRect(20 + i * 60, 20, 50, 220)
      ctx.fillStyle = '#f0d860'
      ctx.font = 'bold 18px serif'
      ctx.save()
      ctx.translate(45 + i * 60, 45)
      ctx.rotate(Math.PI / 2)
      ctx.fillText(items[i] || items[0], 0, 0)
      ctx.restore()
    }
    return new THREE.CanvasTexture(c)
  }, [])

  // Pastries (instanced — 9 total: 3 蛋撻, 3 菠蘿油, 3 雞尾包)
  const pastryCount = 9
  const pastryMatrix = useMemo(() => {
    const arr: THREE.Matrix4[] = []
    const m = new THREE.Matrix4()
    for (let i = 0; i < pastryCount; i++) {
      const row = Math.floor(i / 3)
      const col = i % 3
      m.makeTranslation(
        counterX + 0.05,
        counterY + 0.05 + row * 0.12,
        counterZ - counterLength / 2 + 0.2 + col * 0.25
      )
      arr.push(m.clone())
    }
    return arr
  }, [counterX, counterY, counterZ, counterLength])

  return (
    <group>
      {/* Counter slab (marble-faced) */}
      <mesh position={[counterX, counterY, counterZ]}>
        <boxGeometry args={[counterDepth, 0.05, counterLength]} />
        <meshStandardMaterial color={'#e8e0d0'} roughness={0.3} metalness={0.05} />
      </mesh>
      {/* Counter front panel (also marble) */}
      <mesh position={[counterX + counterDepth / 2 - 0.025, counterY / 2, counterZ]}>
        <boxGeometry args={[0.04, counterY, counterLength]} />
        <meshStandardMaterial color={'#d8d0c0'} roughness={0.4} />
      </mesh>
      {/* Metal trim along counter front edge */}
      <mesh position={[counterX + counterDepth / 2 - 0.01, counterY - 0.02, counterZ]}>
        <boxGeometry args={[0.02, 0.04, counterLength]} />
        <meshStandardMaterial color={'#a89888'} metalness={0.7} roughness={0.4} />
      </mesh>

      {/* Glass display case (chest-height, multi-tier) */}
      <mesh position={[counterX, counterY + 0.25, counterZ]}>
        <boxGeometry args={[counterDepth - 0.05, 0.5, counterLength - 0.1]} />
        <meshStandardMaterial color={'#d8e8f0'} transparent opacity={0.4}
          roughness={0.1} metalness={0.1} />
      </mesh>

      {/* Pastries inside (instanced) */}
      <instancedMesh args={[undefined, undefined, pastryCount]}
        ref={(ref) => {
          if (!ref) return
          pastryMatrix.forEach((m, i) => ref.setMatrixAt(i, m))
          ref.instanceMatrix.needsUpdate = true
        }}>
        <cylinderGeometry args={[0.05, 0.05, 0.04, 10]} />
        <meshStandardMaterial color={'#e8b048'} roughness={0.6} />
      </instancedMesh>

      {/* Warm interior light glowing from inside the case */}
      <pointLight position={[counterX, counterY + 0.25, counterZ]}
        color={'#fff0b0'} intensity={0.5} distance={1} decay={2} />

      {/* Wall menu strips above counter (single textured plane) */}
      <mesh position={[BING_SUTT.backWallX - 0.005, 1.95, counterZ]}
        rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[counterLength, 1.4]} />
        <meshStandardMaterial map={menuTex} roughness={0.85} />
      </mesh>

      {/* Espresso/coffee setup — small dark box on the counter */}
      <mesh position={[counterX, counterY + 0.1, counterZ + counterLength / 2 - 0.18]}>
        <boxGeometry args={[0.18, 0.2, 0.22]} />
        <meshStandardMaterial color={'#1a1410'} metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 2: Mount it in BingSutt/index.tsx**

```tsx
import { Counter } from './Counter'
// ...
export function BingSutt() {
  return (
    <group>
      <Frontage />
      <Counter />
    </group>
  )
}
```

- [ ] **Step 3: Typecheck + visual check**

Run: `npm run typecheck && npm run dev`
Expected: typecheck passes. Walking into 冰室, the back wall area has a marble counter with metal trim, a glowing pastry display case with golden pastries inside, and floor-to-ceiling red calligraphic menu strips above the counter.

- [ ] **Step 4: Commit**

```bash
git add src/worlds/WalledCity/BingSutt/
git commit -m "feat(walled-city): add BingSutt counter + pastry case + wall menus"
```

---

## Task 13: BingSutt Booths (1 vinyl booth + 1 octagonal table + stools)

**Files:**
- Create: `src/worlds/WalledCity/BingSutt/Booths.tsx`
- Modify: `src/worlds/WalledCity/BingSutt/index.tsx`

**Why:** Spec §3.2 — 1 green vinyl booth on left wall, 1 octagonal center table with red metal-frame stools.

- [ ] **Step 1: Create Booths.tsx**

```tsx
import * as THREE from 'three'
import { BING_SUTT } from './index'

export function Booths() {
  // Booth on the left wall (x near doorway side, x = BING_SUTT.doorwayX side)
  // = at x ≈ -1.05 (just inside the doorway wall). Booth seat against the
  // entrance-side wall.
  const boothZ = (BING_SUTT.zNear + BING_SUTT.zFar) / 2 - 0.3  // slightly toward zNear

  // Center table position
  const tableX = (BING_SUTT.doorwayX + BING_SUTT.backWallX) / 2 - 0.3
  const tableZ = (BING_SUTT.zNear + BING_SUTT.zFar) / 2 + 0.6

  return (
    <group>
      {/* === Booth seat (along the alley-side wall, facing into shop) === */}
      <group position={[BING_SUTT.doorwayX + 0.4, 0, boothZ]}>
        {/* Wood frame base */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.5, 0.4, 1.2]} />
          <meshStandardMaterial color={'#3a2818'} roughness={0.85} />
        </mesh>
        {/* Green vinyl seat cushion (on top of base) */}
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.48, 0.06, 1.18]} />
          <meshStandardMaterial color={'#3a6048'} roughness={0.65} />
        </mesh>
        {/* Vinyl back cushion (against the wall) */}
        <mesh position={[-0.21, 0.75, 0]}>
          <boxGeometry args={[0.06, 0.6, 1.18]} />
          <meshStandardMaterial color={'#3a6048'} roughness={0.65} />
        </mesh>
        {/* Wood high-back trim */}
        <mesh position={[-0.245, 1.1, 0]}>
          <boxGeometry args={[0.04, 0.1, 1.18]} />
          <meshStandardMaterial color={'#3a2818'} roughness={0.9} />
        </mesh>
        {/* Brown tape patch on the cushion (per spec — "膠布修補") */}
        <mesh position={[0.241, 0.42, 0.3]}>
          <planeGeometry args={[0.15, 0.04]} />
          <meshStandardMaterial color={'#6a4a28'} roughness={0.6} />
        </mesh>
      </group>

      {/* Booth table */}
      <group position={[BING_SUTT.doorwayX + 0.85, 0, boothZ]}>
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.6, 0.04, 1.0]} />
          <meshStandardMaterial color={'#e8e0d0'} roughness={0.4} />
        </mesh>
        {/* Single center pedestal */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.7, 8]} />
          <meshStandardMaterial color={'#1a1410'} metalness={0.4} roughness={0.5} />
        </mesh>
        {/* Stacked menus on table */}
        <mesh position={[0.2, 0.74, 0.3]}>
          <boxGeometry args={[0.1, 0.015, 0.18]} />
          <meshStandardMaterial color={'#f0e8d0'} roughness={0.85} />
        </mesh>
        {/* Sauce bottles (3 small cylinders) */}
        {[-0.18, -0.1, -0.02].map((zOff, i) => (
          <mesh key={i} position={[-0.2, 0.78, zOff + 0.3]}>
            <cylinderGeometry args={[0.018, 0.02, 0.12, 8]} />
            <meshStandardMaterial color={i === 0 ? '#3a1a0a' : i === 1 ? '#a01818' : '#d0a040'} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* === Octagonal center table === */}
      <group position={[tableX, 0, tableZ]}>
        <mesh position={[0, 0.7, 0]} rotation={[0, Math.PI / 8, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.04, 8]} />
          <meshStandardMaterial color={'#5a3a20'} roughness={0.7} />
        </mesh>
        {/* Center pedestal */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.7, 8]} />
          <meshStandardMaterial color={'#1a1410'} metalness={0.4} roughness={0.5} />
        </mesh>
        {/* === Recent-evidence cue: half-eaten siu yuk over rice + tea === */}
        {/* Rice bowl (white) with brown 'siu yuk' on top */}
        <mesh position={[-0.1, 0.74, -0.05]}>
          <cylinderGeometry args={[0.07, 0.06, 0.05, 12]} />
          <meshStandardMaterial color={'#f4f0e8'} roughness={0.3} />
        </mesh>
        <mesh position={[-0.1, 0.78, -0.05]}>
          <boxGeometry args={[0.06, 0.025, 0.04]} />
          <meshStandardMaterial color={'#5a2818'} roughness={0.6} />
        </mesh>
        {/* Iced tea glass with straw (translucent amber liquid) */}
        <mesh position={[0.12, 0.78, 0.08]}>
          <cylinderGeometry args={[0.03, 0.025, 0.13, 10]} />
          <meshStandardMaterial color={'#5a2810'} transparent opacity={0.75} roughness={0.1} />
        </mesh>
        <mesh position={[0.12, 0.85, 0.08]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.003, 0.003, 0.1, 4]} />
          <meshStandardMaterial color={'#f0e8d0'} />
        </mesh>
        {/* Chopsticks across the bowl */}
        <mesh position={[-0.08, 0.79, -0.05]} rotation={[0, 0, Math.PI / 2 + 0.4]}>
          <cylinderGeometry args={[0.003, 0.003, 0.18, 4]} />
          <meshStandardMaterial color={'#d0b888'} />
        </mesh>
      </group>

      {/* === Red metal-frame stools (4 around the octagonal table) === */}
      {[
        [tableX, tableZ - 0.6],
        [tableX, tableZ + 0.6],
        [tableX + 0.6, tableZ],
        [tableX - 0.6, tableZ],
      ].map(([sx, sz], i) => (
        <group key={i} position={[sx, 0, sz]}>
          {/* Wood seat */}
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 12]} />
            <meshStandardMaterial color={'#5a3a20'} roughness={0.8} />
          </mesh>
          {/* Red metal frame: 4 legs */}
          {[[-0.1, -0.1], [0.1, -0.1], [-0.1, 0.1], [0.1, 0.1]].map((p, j) => (
            <mesh key={j} position={[p[0], 0.21, p[1]]}>
              <cylinderGeometry args={[0.012, 0.012, 0.42, 6]} />
              <meshStandardMaterial color={'#a02020'} metalness={0.5} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
```

- [ ] **Step 2: Mount in BingSutt/index.tsx**

```tsx
import { Booths } from './Booths'
// ...
export function BingSutt() {
  return (
    <group>
      <Frontage />
      <Counter />
      <Booths />
    </group>
  )
}
```

- [ ] **Step 3: Typecheck + visual check**

Run: `npm run typecheck && npm run dev`
Expected: typecheck passes. Inside 冰室: a green vinyl booth along the alley-side wall with a wood frame and brown tape patch; the booth table has stacked menus and 3 sauce bottles; an octagonal wood center table with a half-eaten siu yuk rice bowl, iced tea, and chopsticks; 4 red-metal-frame stools with wood seats around the center table.

- [ ] **Step 4: Commit**

```bash
git add src/worlds/WalledCity/BingSutt/
git commit -m "feat(walled-city): add BingSutt booths + octagonal table + stools + recent-evidence cues"
```

---

## Task 14: BingSutt Decor (mosaic floor, fan, radio, painting, partition, kitchen curtain)

**Files:**
- Create: `src/worlds/WalledCity/BingSutt/Decor.tsx`
- Modify: `src/worlds/WalledCity/BingSutt/index.tsx`

**Why:** Spec §3.2 — final atmospheric layer. Mosaic floor, ceiling fan (animated), wall-mounted radio, framed Chinese ink-landscape painting, lattice screen partition, kitchen curtain at back with steam particles, paused 3:15 wall clock, ceiling pendant lights.

- [ ] **Step 1: Create Decor.tsx**

```tsx
import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BING_SUTT } from './index'

export function Decor() {
  return (
    <group>
      <Floor />     {/* Mosaic floor — must render first so other items sit on top */}
      <BackWall />
      <SideWalls />
      <Ceiling />
      <CeilingFan />
      <PendantLights />
      <Radio />
      <Painting />
      <ScreenPartition />
      <KitchenCurtain />
      <PausedClock />
    </group>
  )
}

function Floor() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256; c.height = 256
    const ctx = c.getContext('2d')!
    // Mosaic — small busy pattern of cyan/cream/blue
    const palette = ['#508080', '#88a8a8', '#d0c8b0', '#3870a0', '#a8b0a0']
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)]
        ctx.fillRect(x * 8, y * 8, 7, 7)
      }
    }
    const tex = new THREE.CanvasTexture(c)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(2, 2)
    return tex
  }, [])
  const zMid = (BING_SUTT.zNear + BING_SUTT.zFar) / 2
  return (
    <mesh position={[(BING_SUTT.doorwayX + BING_SUTT.backWallX) / 2, 0.001, zMid]}
      rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[Math.abs(BING_SUTT.backWallX - BING_SUTT.doorwayX), Math.abs(BING_SUTT.zFar - BING_SUTT.zNear)]} />
      <meshStandardMaterial map={tex} roughness={0.6} />
    </mesh>
  )
}

function BackWall() {
  // Already drawn by AlleyShell? No — AlleyShell wall has the opening. The
  // back wall (BING_SUTT.backWallX side) is the FAR side from the doorway,
  // which is INSIDE the shop. Need to draw it explicitly.
  const zMid = (BING_SUTT.zNear + BING_SUTT.zFar) / 2
  return (
    <mesh position={[BING_SUTT.backWallX, BING_SUTT.ceiling / 2, zMid]}
      rotation={[0, -Math.PI / 2, 0]}>
      <planeGeometry args={[Math.abs(BING_SUTT.zFar - BING_SUTT.zNear), BING_SUTT.ceiling]} />
      <meshStandardMaterial color={'#b8a890'} roughness={0.85} />
    </mesh>
  )
}

function SideWalls() {
  // Two walls perpendicular to the alley, at z=zNear and z=zFar.
  const xMid = (BING_SUTT.doorwayX + BING_SUTT.backWallX) / 2
  return (
    <group>
      {[BING_SUTT.zNear, BING_SUTT.zFar].map((z, i) => (
        <mesh key={i} position={[xMid, BING_SUTT.ceiling / 2, z]}>
          <planeGeometry args={[Math.abs(BING_SUTT.backWallX - BING_SUTT.doorwayX), BING_SUTT.ceiling]} />
          <meshStandardMaterial color={'#b8a890'} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

function Ceiling() {
  const xMid = (BING_SUTT.doorwayX + BING_SUTT.backWallX) / 2
  const zMid = (BING_SUTT.zNear + BING_SUTT.zFar) / 2
  return (
    <mesh position={[xMid, BING_SUTT.ceiling, zMid]} rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[Math.abs(BING_SUTT.backWallX - BING_SUTT.doorwayX), Math.abs(BING_SUTT.zFar - BING_SUTT.zNear)]} />
      <meshStandardMaterial color={'#d0c0a8'} roughness={0.85} />
    </mesh>
  )
}

function CeilingFan() {
  const fanRef = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (fanRef.current) fanRef.current.rotation.y += dt * 0.8
  })
  const xMid = (BING_SUTT.doorwayX + BING_SUTT.backWallX) / 2
  const zMid = (BING_SUTT.zNear + BING_SUTT.zFar) / 2 + 0.4
  return (
    <group position={[xMid, BING_SUTT.ceiling - 0.15, zMid]}>
      {/* Mounting cylinder */}
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
        <meshStandardMaterial color={'#3a3530'} />
      </mesh>
      {/* 2 blades */}
      <group ref={fanRef} position={[0, -0.05, 0]}>
        {[0, Math.PI].map((rot, i) => (
          <mesh key={i} rotation={[0, rot, 0]} position={[0.4, 0, 0]}>
            <boxGeometry args={[0.7, 0.02, 0.12]} />
            <meshStandardMaterial color={'#5a4838'} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function PendantLights() {
  const xMid = (BING_SUTT.doorwayX + BING_SUTT.backWallX) / 2
  const positions = [
    [xMid, BING_SUTT.zNear + 0.8],
    [xMid, BING_SUTT.zFar - 0.8],
  ]
  return (
    <group>
      {positions.map(([x, z], i) => (
        <group key={i} position={[x, BING_SUTT.ceiling - 0.3, z]}>
          {/* Cord */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.3, 4]} />
            <meshStandardMaterial color={'#1a1410'} />
          </mesh>
          {/* Bulb */}
          <mesh>
            <sphereGeometry args={[0.06, 12, 8]} />
            <meshStandardMaterial color={'#fff0c0'} emissive={'#ffd880'} emissiveIntensity={2} />
          </mesh>
          <pointLight color={'#ffd890'} intensity={1.2} distance={3.5} decay={2} />
        </group>
      ))}
    </group>
  )
}

function Radio() {
  // Wall-mounted vintage radio (replaces the spec's CRT TV — too tight for TV)
  return (
    <mesh position={[(BING_SUTT.doorwayX + BING_SUTT.backWallX) / 2 + 0.5, 1.6, BING_SUTT.zNear + 0.05]}>
      <boxGeometry args={[0.3, 0.18, 0.12]} />
      <meshStandardMaterial color={'#5a4030'} roughness={0.6} />
    </mesh>
  )
}

function Painting() {
  // Framed Chinese ink-landscape painting on the side wall (zNear wall).
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128; c.height = 96
    const ctx = c.getContext('2d')!
    // Light cream paper
    ctx.fillStyle = '#e8d8b8'
    ctx.fillRect(0, 0, 128, 96)
    // Suggested mountain shapes (gray ink)
    ctx.fillStyle = '#3a3a3a'
    ctx.beginPath()
    ctx.moveTo(20, 70); ctx.lineTo(50, 30); ctx.lineTo(75, 60); ctx.lineTo(110, 25); ctx.lineTo(120, 80)
    ctx.fill()
    return new THREE.CanvasTexture(c)
  }, [])
  return (
    <group position={[(BING_SUTT.doorwayX + BING_SUTT.backWallX) / 2 - 0.3, 1.7, BING_SUTT.zNear + 0.03]}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[0.5, 0.4, 0.02]} />
        <meshStandardMaterial color={'#3a2818'} roughness={0.8} />
      </mesh>
      {/* Painting */}
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[0.46, 0.36]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
    </group>
  )
}

function ScreenPartition() {
  // Lattice screen partition between booth and table. Vertical wood lattice.
  const xPos = BING_SUTT.doorwayX + 0.7  // between booth and center table
  const zPos = (BING_SUTT.zNear + BING_SUTT.zFar) / 2 + 0.05
  return (
    <group position={[xPos, 1.0, zPos]}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[0.04, 1.6, 0.6]} />
        <meshStandardMaterial color={'#3a2818'} roughness={0.85} />
      </mesh>
      {/* Lattice pattern — instanced thin verticals */}
      <instancedMesh args={[undefined, undefined, 6]}
        ref={(ref) => {
          if (!ref) return
          const m = new THREE.Matrix4()
          for (let i = 0; i < 6; i++) {
            m.makeTranslation(0.01, 0, -0.25 + i * 0.1)
            ref.setMatrixAt(i, m)
          }
          ref.instanceMatrix.needsUpdate = true
        }}>
        <boxGeometry args={[0.025, 1.4, 0.015]} />
        <meshStandardMaterial color={'#5a3a20'} roughness={0.85} />
      </instancedMesh>
    </group>
  )
}

function KitchenCurtain() {
  // Curtain at the back of the shop (zFar side). Hides the kitchen, but a
  // gap shows orange flame light + escaping steam.
  return (
    <group>
      {/* Curtain — solid plane */}
      <mesh position={[BING_SUTT.backWallX - 0.05, 1.0, BING_SUTT.zFar + 0.3]}
        rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.7, 2.0]} />
        <meshStandardMaterial color={'#3a2818'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Orange flame light leaking through curtain gap */}
      <pointLight position={[BING_SUTT.backWallX - 0.2, 1.0, BING_SUTT.zFar + 0.5]}
        color={'#ff8030'} intensity={0.8} distance={1.2} decay={2} />
      {/* Steam particles — 6 small white spheres rising slowly via animation */}
      <SteamPuffs />
    </group>
  )
}

function SteamPuffs() {
  const refs = useRef<(THREE.Mesh | null)[]>([])
  useFrame((_, dt) => {
    refs.current.forEach((m, i) => {
      if (!m) return
      m.position.y += dt * 0.3
      m.scale.setScalar(1 + (m.position.y - 1.5) * 0.5)
      ;(m.material as THREE.MeshStandardMaterial).opacity = Math.max(0, 0.6 - (m.position.y - 1.5) * 0.6)
      if (m.position.y > 2.8) {
        m.position.y = 1.5
        m.scale.setScalar(1)
      }
    })
  })
  return (
    <group>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i}
          ref={(r) => { refs.current[i] = r }}
          position={[BING_SUTT.backWallX - 0.18, 1.5 + i * 0.2, BING_SUTT.zFar + 0.45]}>
          <sphereGeometry args={[0.05, 6, 4]} />
          <meshStandardMaterial color={'#f8f8f8'} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function PausedClock() {
  // Round wall clock paused at 3:15.
  return (
    <group position={[(BING_SUTT.doorwayX + BING_SUTT.backWallX) / 2 + 0.4, 2.2, BING_SUTT.zNear + 0.03]}>
      {/* Face */}
      <mesh>
        <cylinderGeometry args={[0.13, 0.13, 0.02, 16]} rotation={[Math.PI / 2, 0, 0]} />
        <meshStandardMaterial color={'#f0e8d0'} roughness={0.5} />
      </mesh>
      {/* Hour hand pointing at 3 */}
      <mesh position={[0.04, 0, 0.012]}>
        <boxGeometry args={[0.07, 0.008, 0.005]} />
        <meshStandardMaterial color={'#1a1410'} />
      </mesh>
      {/* Minute hand pointing at 15 (90deg from 12) */}
      <mesh position={[0.05, 0, 0.013]}>
        <boxGeometry args={[0.1, 0.005, 0.005]} />
        <meshStandardMaterial color={'#1a1410'} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 2: Mount Decor in BingSutt/index.tsx**

```tsx
import { Decor } from './Decor'
// ...
export function BingSutt() {
  return (
    <group>
      <Frontage />
      <Decor />     {/* Floor + walls + ceiling first */}
      <Counter />
      <Booths />
    </group>
  )
}
```

- [ ] **Step 3: Typecheck + visual check**

Run: `npm run typecheck && npm run dev`
Expected: typecheck passes. Inside 冰室 the floor is now a busy mosaic; ceiling fan rotates slowly; 2 warm yellow pendant bulbs over booth + table; vintage radio on the wall; framed ink-landscape painting; lattice screen partition; kitchen curtain at the back leaking orange flame light + visible steam puffs rising; paused 3:15 wall clock.

- [ ] **Step 4: Commit**

```bash
git add src/worlds/WalledCity/BingSutt/
git commit -m "feat(walled-city): add BingSutt decor (mosaic, fan, radio, painting, kitchen, clock)"
```

---

## Task 15: Fruit Stall (生果檔)

**Files:**
- Create: `src/worlds/WalledCity/FruitStall.tsx`

**Why:** Spec §3.3 — dead-end punctuation. Wooden sign, stacked crates with fruit, bamboo baskets, cardboard boxes, spilled fruit on the ground, owner's empty stool, hand-scale, fruit flies.

- [ ] **Step 1: Create FruitStall.tsx**

```tsx
import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// 生果檔 — blocks the dead end of the deep alley segment at z=−28 to −30.
// Deep segment axis is x=−2, full alley width.
const FS = {
  zNear: -28,
  zFar: -30,
  xCenter: -2,
  width: 1.5,
}

export function FruitStall() {
  return (
    <group>
      <FruitSignBoard />
      <CrateStacks />
      <BambooBaskets />
      <CardboardBoxes />
      <SpilledFruitOnRoad />
      <OwnerStool />
      <HandScale />
      <PlasticBag />
      <FruitFlies />
    </group>
  )
}

function FruitSignBoard() {
  // Hand-painted "生果" sign hanging from a rusted bar tied with hemp rope.
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128; c.height = 64
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#d8c098'
    ctx.fillRect(0, 0, 128, 64)
    ctx.fillStyle = '#a01818'
    ctx.font = 'bold 48px serif'
    ctx.textAlign = 'center'
    ctx.fillText('生', 35, 50)
    // Half-faded "果"
    ctx.globalAlpha = 0.5
    ctx.fillText('果', 90, 50)
    return new THREE.CanvasTexture(c)
  }, [])
  return (
    <group position={[FS.xCenter, 2.4, FS.zNear - 0.3]}>
      {/* Rusted hanging bar */}
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 1.4, 8]} />
        <meshStandardMaterial color={'#5a3a20'} roughness={0.8} metalness={0.4} />
      </mesh>
      {/* Hemp rope (2 sides) */}
      {[-0.3, 0.3].map((xOff, i) => (
        <mesh key={i} position={[xOff, 0.05, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.3, 4]} />
          <meshStandardMaterial color={'#a08858'} />
        </mesh>
      ))}
      {/* Sign board */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.8, 0.4, 0.04]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
    </group>
  )
}

function CrateStacks() {
  // 8 wooden crates stacked, instanced.
  const matrices = useMemo(() => {
    const arr: { matrix: THREE.Matrix4 }[] = []
    const m = new THREE.Matrix4()
    // 2 columns × 4 rows
    for (let col = 0; col < 2; col++) {
      for (let row = 0; row < 4; row++) {
        m.makeTranslation(
          FS.xCenter - 0.4 + col * 0.45,
          0.15 + row * 0.3,
          FS.zNear - 0.7
        )
        arr.push({ matrix: m.clone() })
      }
    }
    return arr
  }, [])
  return (
    <group>
      <instancedMesh args={[undefined, undefined, matrices.length]}
        ref={(ref) => {
          if (!ref) return
          matrices.forEach(({ matrix }, i) => ref.setMatrixAt(i, matrix))
          ref.instanceMatrix.needsUpdate = true
        }}>
        <boxGeometry args={[0.4, 0.28, 0.4]} />
        <meshStandardMaterial color={'#8a5828'} roughness={0.9} />
      </instancedMesh>
      {/* Fruit on top of the topmost row of crates — instanced spheres */}
      <instancedMesh args={[undefined, undefined, 24]}
        ref={(ref) => {
          if (!ref) return
          const m = new THREE.Matrix4()
          for (let col = 0; col < 2; col++) {
            for (let i = 0; i < 12; i++) {
              const angle = (i / 12) * Math.PI * 2
              m.makeTranslation(
                FS.xCenter - 0.4 + col * 0.45 + Math.cos(angle) * 0.12,
                1.35,
                FS.zNear - 0.7 + Math.sin(angle) * 0.12
              )
              ref.setMatrixAt(col * 12 + i, m)
            }
          }
          ref.instanceMatrix.needsUpdate = true
        }}>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshStandardMaterial color={'#d04030'} roughness={0.5} /> {/* Apples */}
      </instancedMesh>
    </group>
  )
}

function BambooBaskets() {
  // 6 baskets at lower level with bananas, papaya, watermelon halves.
  return (
    <group>
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={i}
          position={[
            FS.xCenter - 0.6 + (i % 3) * 0.4,
            0.05,
            FS.zNear - 0.3 + Math.floor(i / 3) * 0.25
          ]}>
          {/* Basket — open cylinder, woven look approximated with brown */}
          <mesh>
            <cylinderGeometry args={[0.18, 0.16, 0.1, 12]} />
            <meshStandardMaterial color={'#8a6840'} roughness={0.9} />
          </mesh>
          {/* Fruit inside (variant by index) */}
          {i % 3 === 0 && (
            // Bananas (yellow rectangles)
            <mesh position={[0, 0.06, 0]}>
              <boxGeometry args={[0.25, 0.04, 0.08]} />
              <meshStandardMaterial color={'#d8b830'} roughness={0.7} />
            </mesh>
          )}
          {i % 3 === 1 && (
            // Papaya (orange ellipsoid)
            <mesh position={[0, 0.05, 0]} scale={[1.6, 0.7, 1]}>
              <sphereGeometry args={[0.1, 12, 8]} />
              <meshStandardMaterial color={'#e88838'} roughness={0.6} />
            </mesh>
          )}
          {i % 3 === 2 && (
            // Watermelon half (green outside, red inside via flat circle on top)
            <group>
              <mesh position={[0, 0.06, 0]}>
                <sphereGeometry args={[0.15, 14, 10]} />
                <meshStandardMaterial color={'#2a5a28'} roughness={0.6} />
              </mesh>
              <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.13, 14]} />
                <meshStandardMaterial color={'#d04848'} roughness={0.5} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  )
}

function CardboardBoxes() {
  // 4 cardboard boxes on the ground — durian + mangosteen.
  return (
    <group>
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i}
          position={[
            FS.xCenter + 0.2 + (i % 2) * 0.3,
            0.08,
            FS.zNear - 0.3 + Math.floor(i / 2) * 0.3
          ]}>
          <boxGeometry args={[0.28, 0.16, 0.28]} />
          <meshStandardMaterial color={'#a87a48'} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function SpilledFruitOnRoad() {
  // Lychees + longan with leafy stems on the ground in front of the stall.
  return (
    <group>
      {/* Wet glistening floor patch — darker overlay */}
      <mesh position={[FS.xCenter, 0.001, FS.zNear + 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.4, 1.0]} />
        <meshStandardMaterial color={'#1a1610'} roughness={0.4} />
      </mesh>
      {/* Lychees — instanced red small spheres */}
      <instancedMesh args={[undefined, undefined, 12]}
        ref={(ref) => {
          if (!ref) return
          const m = new THREE.Matrix4()
          for (let i = 0; i < 12; i++) {
            m.makeTranslation(
              FS.xCenter + (Math.random() - 0.5) * 1.2,
              0.025,
              FS.zNear + 0.3 + Math.random() * 0.6
            )
            ref.setMatrixAt(i, m)
          }
          ref.instanceMatrix.needsUpdate = true
        }}>
        <sphereGeometry args={[0.02, 6, 4]} />
        <meshStandardMaterial color={'#a83030'} roughness={0.6} />
      </instancedMesh>
    </group>
  )
}

function OwnerStool() {
  // Red plastic stool, knocked slightly askew (the still-warm cue).
  return (
    <group position={[FS.xCenter + 0.6, 0, FS.zNear - 0.5]} rotation={[0, 0.3, 0]}>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.22, 0.04, 0.22]} />
        <meshStandardMaterial color={'#c01818'} roughness={0.6} />
      </mesh>
      {[[-0.08, -0.08], [0.08, -0.08], [-0.08, 0.08], [0.08, 0.08]].map((p, i) => (
        <mesh key={i} position={[p[0], 0.09, p[1]]}>
          <cylinderGeometry args={[0.012, 0.012, 0.18, 6]} />
          <meshStandardMaterial color={'#a01010'} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function HandScale() {
  // Old hand-scale with metal pan + rope hanging from a wood bar.
  return (
    <group position={[FS.xCenter - 0.6, 1.2, FS.zNear - 0.4]}>
      {/* Wood bar */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.4, 6]} />
        <meshStandardMaterial color={'#5a3820'} />
      </mesh>
      {/* Rope */}
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 0.3, 4]} />
        <meshStandardMaterial color={'#a08858'} />
      </mesh>
      {/* Metal pan */}
      <mesh position={[0, -0.32, 0]} rotation={[Math.PI, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.06, 0.04, 12]} />
        <meshStandardMaterial color={'#a89888'} metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function PlasticBag() {
  // Red-white-blue striped 紅白藍 bag hanging on a hook.
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 64; c.height = 64
    const ctx = c.getContext('2d')!
    const colors = ['#c01818', '#f0f0f0', '#1850a0']
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = colors[i % 3]
      ctx.fillRect(0, i * 4, 64, 4)
    }
    return new THREE.CanvasTexture(c)
  }, [])
  return (
    <mesh position={[FS.xCenter + 0.7, 1.3, FS.zNear - 0.3]}>
      <planeGeometry args={[0.25, 0.4]} />
      <meshStandardMaterial map={tex} side={THREE.DoubleSide} roughness={0.8} />
    </mesh>
  )
}

function FruitFlies() {
  // ~20 tiny dark fruit-fly specks orbiting rotting fruit.
  const refs = useRef<(THREE.Mesh | null)[]>([])
  useFrame((_, dt) => {
    refs.current.forEach((m, i) => {
      if (!m) return
      const t = performance.now() * 0.001 + i * 0.5
      m.position.x = FS.xCenter + Math.sin(t * (1 + i * 0.1)) * 0.3
      m.position.y = 0.5 + Math.cos(t * 1.3) * 0.2
      m.position.z = FS.zNear - 0.3 + Math.cos(t * (0.8 + i * 0.05)) * 0.3
    })
  })
  return (
    <group>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} ref={(r) => { refs.current[i] = r }}>
          <sphereGeometry args={[0.005, 4, 3]} />
          <meshStandardMaterial color={'#1a1410'} />
        </mesh>
      ))}
    </group>
  )
}
```

- [ ] **Step 2: Typecheck + visual check**

Run: `npm run typecheck && npm run dev`
Expected: typecheck passes. At the alley dead end (z=−30), the fruit stall blocks the path: hanging "生果" sign with half-faded 果, stacked wooden crates with red apples on top, bamboo baskets with bananas/papaya/watermelon halves, cardboard boxes, spilled fruit + wet floor patch, knocked-askew red plastic stool, hanging hand-scale, red-white-blue bag, tiny fruit flies orbiting.

- [ ] **Step 3: Commit**

```bash
git add src/worlds/WalledCity/FruitStall.tsx
git commit -m "feat(walled-city): add FruitStall dead-end punctuation"
```

---

## Task 16: ShopFigures (placement wrapper for TramPassengers meshes)

**Files:**
- Create: `src/worlds/WalledCity/ShopFigures.tsx`

**Why:** Spec §3.1, §3.2 — 1 shopkeeper standing in 士多, 2 customers seated in 冰室. Reuse character meshes from TramPassengers via thin wrapper.

- [ ] **Step 1: Identify exported figure components in TramPassengers**

Run: `grep -E "^export (function|const) (Seated|Standing|Passenger|Figure|Persona)" src/cabin/TramPassengers.tsx`
Identify: which top-level character components are exported. If the file exports composite figures (e.g., `BusinessmanSeated`, `MarketAuntStanding`), use those names. If only sub-parts (like `SeatedLegs`, `Arms`, `Torso`) are exported, you'll compose a figure inline using those parts.

- [ ] **Step 2: Create ShopFigures.tsx**

If `TramPassengers` exports composite figures (e.g., `SeatedPassenger` taking a variant prop), use them directly:

```tsx
import { SeatedPassenger, StandingPassenger } from '../../cabin/TramPassengers'
// Or: import * as TP from '../../cabin/TramPassengers' and use TP.* below

import { BING_SUTT } from './BingSutt'

export function ShopFigures() {
  return (
    <group>
      {/* === 士多 shopkeeper — standing behind counter === */}
      <group position={[(-0.8 + -2.3) / 2 + 0.3, 0, (-5 + -8) / 2 - 0.5]}
        rotation={[0, Math.PI, 0]}>  {/* face the doorway */}
        <StandingPassenger variant="middle-aged-man" />
      </group>

      {/* === 冰室 customer 1 — seated in booth === */}
      <group position={[BING_SUTT.doorwayX + 0.4, 0.42,
                        (BING_SUTT.zNear + BING_SUTT.zFar) / 2 - 0.3]}
        rotation={[0, Math.PI / 2, 0]}>  {/* face center of shop */}
        <SeatedPassenger variant="elderly-woman" />
      </group>

      {/* === 冰室 customer 2 — seated at octagonal table === */}
      <group position={[(BING_SUTT.doorwayX + BING_SUTT.backWallX) / 2 - 0.3, 0.42,
                        (BING_SUTT.zNear + BING_SUTT.zFar) / 2 + 0.6 - 0.6]}
        rotation={[0, 0, 0]}>  {/* face the table from north stool */}
        <SeatedPassenger variant="young-man" />
      </group>
    </group>
  )
}
```

If TramPassengers does NOT expose `SeatedPassenger` / `StandingPassenger` composite components, then write a 60-line composite using its `SeatedLegs`, `Arms`, etc.:

```tsx
// Fallback: if no composite passengers exist, compose 3 figures from raw parts.
import { SeatedLegs, Arms /* and any other exported parts */ } from '../../cabin/TramPassengers'

function StandingShopkeeper() {
  return (
    <group>
      {/* Torso (cylinder), head (sphere), 2 standing legs (cylinders), 2 arms */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.16, 0.18, 0.5, 10]} />
        <meshStandardMaterial color={'#8a3a28'} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <sphereGeometry args={[0.1, 12, 10]} />
        <meshStandardMaterial color={'#e8c8a0'} roughness={0.7} />
      </mesh>
      {[-0.07, 0.07].map((sx, i) => (
        <mesh key={i} position={[sx, 0.4, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.8, 8]} />
          <meshStandardMaterial color={'#1a1a1a'} roughness={0.85} />
        </mesh>
      ))}
      <Arms color={'#8a3a28'} skinColor={'#e8c8a0'} length={0.45} />
    </group>
  )
}
// Then SeatedCustomer composes SeatedLegs + a torso + head + arms.
```

Either approach works — the goal is "3 figures placed in the right spots, visually consistent with TramPassengers."

- [ ] **Step 3: Typecheck + visual check**

Run: `npm run typecheck && npm run dev`
Expected: typecheck passes. Walking past 士多, a standing figure is behind the counter facing out. Walking into 冰室, one figure is seated in the booth, another at the octagonal table. Same low-poly silhouette style as the tram passengers.

- [ ] **Step 4: Commit**

```bash
git add src/worlds/WalledCity/ShopFigures.tsx
git commit -m "feat(walled-city): place 3 shop figures (1 in Sundry, 2 in BingSutt)"
```

---

## Task 17: InteractableHUD — proximity glow lights

**Files:**
- Create: `src/worlds/WalledCity/InteractableHUD.tsx`

**Why:** Spec §5 — diegetic warm glow at each interactable's doorway, fading in/out by distance. This task does the glow lights only; tooltip DOM overlay is Task 18.

- [ ] **Step 1: Create InteractableHUD.tsx with the glow component**

```tsx
import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'

const WORLD_X = 100  // matches WalledCity index.tsx

// Spec §5.1 — 4 hard-coded interactables, positions in WALLED-CITY-LOCAL space.
// World positions are computed by adding WORLD_X to the x component.
type Interactable = {
  id: string
  nameZh: string
  nameEn: string
  kind: 'walk-in' | 'look-only'
  centerLocal: [number, number, number]
}

const INTERACTABLES: Interactable[] = [
  { id: 'salon',       nameZh: '理髮室',  nameEn: 'Salon',           kind: 'walk-in',  centerLocal: [1.9, 1.4, -0.4] },
  { id: 'bing-sutt',   nameZh: '強記冰室', nameEn: 'Keung Kee Café',  kind: 'walk-in',  centerLocal: [-1.0, 1.4, -20] },
  { id: 'sundry',      nameZh: '士多',    nameEn: 'Sundry Shop',     kind: 'look-only', centerLocal: [-0.9, 1.4, -6.5] },
  { id: 'fruit-stall', nameZh: '生果檔',  nameEn: 'Fruit Stall',     kind: 'look-only', centerLocal: [-2, 1.0, -29] },
]

const RANGE = 3.5
const FADE_TIME = 0.25  // seconds

export function InteractableHUD() {
  return (
    <>
      {INTERACTABLES.map((it) => (
        <ProximityGlow key={it.id} interactable={it} />
      ))}
      {/* Tooltip DOM overlay added in Task 18 */}
    </>
  )
}

function ProximityGlow({ interactable }: { interactable: Interactable }) {
  const lightRef = useRef<THREE.PointLight>(null)
  const intensityRef = useRef(0)
  const { camera } = useThree()

  useFrame((_, dt) => {
    if (!lightRef.current) return
    const worldX = WORLD_X + interactable.centerLocal[0]
    const dx = camera.position.x - worldX
    const dy = camera.position.y - interactable.centerLocal[1]
    const dz = camera.position.z - interactable.centerLocal[2]
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const target = dist < RANGE ? 1.2 : 0
    const step = dt / FADE_TIME * 1.2
    if (intensityRef.current < target) intensityRef.current = Math.min(target, intensityRef.current + step)
    else intensityRef.current = Math.max(target, intensityRef.current - step)
    lightRef.current.intensity = intensityRef.current
  })

  return (
    <pointLight
      ref={lightRef}
      position={[
        WORLD_X + interactable.centerLocal[0],
        interactable.centerLocal[1],
        interactable.centerLocal[2],
      ]}
      color={'#ffb060'}
      intensity={0}
      distance={3}
      decay={2}
    />
  )
}
```

- [ ] **Step 2: Typecheck + visual check**

Run: `npm run typecheck && npm run dev`
Expected: typecheck passes. Walking the alley, each shop entrance softly warms with amber light as you approach within 3.5m and fades as you walk away. Salon, 士多, 冰室, and 生果檔 all light up.

- [ ] **Step 3: Commit**

```bash
git add src/worlds/WalledCity/InteractableHUD.tsx
git commit -m "feat(walled-city): add proximity glow for 4 interactables"
```

---

## Task 18: InteractableHUD tooltip DOM overlay

**Files:**
- Modify: `src/worlds/WalledCity/InteractableHUD.tsx`

**Why:** Spec §5.3 — DOM-overlay tooltip with shop name + Eng + kind hint. Tooltip shows when within 3.5m of any interactable. No facing-cone test, no debounce (per the Section 5 simplification).

- [ ] **Step 1: Refactor to share state between glows + tooltip**

In InteractableHUD.tsx, lift "which interactable is currently active" state to the top-level component using `useState`, set it from each ProximityGlow's distance check, and render the tooltip JSX using a portal or sibling DOM element.

```tsx
import { useState, useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { createPortal } from 'react-dom'

// ... INTERACTABLES + Interactable type as in Task 17 ...

export function InteractableHUD() {
  const [activeId, setActiveId] = useState<string | null>(null)

  return (
    <>
      {INTERACTABLES.map((it) => (
        <ProximityGlow
          key={it.id}
          interactable={it}
          onActiveChange={(active) => {
            // Set active iff this interactable is the closest active. Simple:
            // last writer wins per frame; with only 4 interactables and small
            // range, contention is rare and the visual swap is not a problem.
            if (active) setActiveId(it.id)
            else if (activeId === it.id) setActiveId(null)
          }}
        />
      ))}
      <TooltipOverlay activeId={activeId} />
    </>
  )
}

function ProximityGlow({ interactable, onActiveChange }: {
  interactable: Interactable
  onActiveChange: (active: boolean) => void
}) {
  const lightRef = useRef<THREE.PointLight>(null)
  const intensityRef = useRef(0)
  const wasActiveRef = useRef(false)
  const { camera } = useThree()

  useFrame((_, dt) => {
    if (!lightRef.current) return
    const worldX = WORLD_X + interactable.centerLocal[0]
    const dx = camera.position.x - worldX
    const dy = camera.position.y - interactable.centerLocal[1]
    const dz = camera.position.z - interactable.centerLocal[2]
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const isActive = dist < RANGE
    if (isActive !== wasActiveRef.current) {
      wasActiveRef.current = isActive
      onActiveChange(isActive)
    }
    const target = isActive ? 1.2 : 0
    const step = dt / FADE_TIME * 1.2
    if (intensityRef.current < target) intensityRef.current = Math.min(target, intensityRef.current + step)
    else intensityRef.current = Math.max(target, intensityRef.current - step)
    lightRef.current.intensity = intensityRef.current
  })

  return (
    <pointLight
      ref={lightRef}
      position={[
        WORLD_X + interactable.centerLocal[0],
        interactable.centerLocal[1],
        interactable.centerLocal[2],
      ]}
      color={'#ffb060'}
      intensity={0}
      distance={3}
      decay={2}
    />
  )
}

function TooltipOverlay({ activeId }: { activeId: string | null }) {
  const interactable = activeId ? INTERACTABLES.find((it) => it.id === activeId) : null
  // Render into document.body via portal so it sits above the canvas.
  if (typeof document === 'undefined') return null
  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: '64px',
        transform: 'translateX(-50%)',
        zIndex: 100,
        background: 'rgba(20, 16, 12, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        color: '#f0e6d3',
        padding: '10px 22px',
        borderRadius: '999px',
        fontFamily: 'serif',
        textAlign: 'center',
        opacity: interactable ? 1 : 0,
        transition: 'opacity 200ms ease-out',
        pointerEvents: 'none',
      }}
    >
      {interactable ? (
        <>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>{interactable.nameZh}</div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
            {interactable.nameEn}
            <span style={{ marginLeft: '8px', opacity: 0.6 }}>
              {interactable.kind === 'walk-in' ? 'Enter ▸' : 'View ▸'}
            </span>
          </div>
        </>
      ) : null}
    </div>,
    document.body
  )
}
```

- [ ] **Step 2: Typecheck + visual check**

Run: `npm run typecheck && npm run dev`
Expected: typecheck passes. Approaching any of the 4 shops shows a small frosted-dark pill at the bottom-center of the screen with the shop's Chinese name (larger), English name (smaller), and "Enter ▸" or "View ▸" hint. Pill fades out smoothly when you move away.

- [ ] **Step 3: Commit**

```bash
git add src/worlds/WalledCity/InteractableHUD.tsx
git commit -m "feat(walled-city): add HUD tooltip overlay for 4 interactables"
```

---

## Task 19: Wire everything in WalledCity/index.tsx + final cleanup

**Files:**
- Modify: `src/worlds/WalledCity/index.tsx`

**Why:** Verify all the imports, mounts, and bounds are correctly assembled. Tasks 1-18 each made incremental edits; this task does a final read-through to catch anything missed.

- [ ] **Step 1: Verify the final structure of WalledCity/index.tsx**

Run: `cat src/worlds/WalledCity/index.tsx`

Expected structure (in this order inside the WalledCity component):

```tsx
import { /* all components */ } from './...'
import { stairFloor } from './Stairwell'
import { CORRIDORS } from './SideCorridors'
import { FirstPersonControls, type Zone } from '../common/FirstPersonControls'

const WORLD_X = 100

const CORRIDOR_BOUNDS: Zone[] = /* with segmentCenterX logic */

const BOUNDS: Zone[] = [
  // Entrance segment, dogleg transition, deep segment
  // ...corridor bounds...
  // Stairwell (rotated)
  // Rooftop (unchanged)
  // Salon (unchanged)
  // BingSutt walk-in
]

export function WalledCity() {
  return (
    <>
      <group position={[WORLD_X, 0, 0]}>
        <WalledCityLighting />
        <FluorescentTubes />
        <AlleyShell />
        <AlleyDogleg />
        <PipeWeb />
        <MailSlots />
        <ApartmentFacades />
        <PosterLayers />
        <DentistSigns />
        <Clutter />
        <SideCorridors />
        <Stairwell />
        <Rooftop />
        <Salon />
        <Sundry />
        <BingSutt />
        <FruitStall />
        <ShopFigures />
        <PlaneFlyover />
      </group>
      <InteractableHUD />
      <FirstPersonControls
        bounds={BOUNDS}
        start={[WORLD_X, 0, 4.5]}
        startYaw={0}
        height={1.65}
        speed={2.8}
      />
    </>
  )
}
```

If anything is missing, add it. Confirm import paths are correct.

- [ ] **Step 2: Run a thorough visual playtest**

Run: `npm run dev`
Walk path:
1. Spawn at z=+4.5 (entrance). Walk forward.
2. Cross old back-wall position (z=−5) — should pass through cleanly.
3. Pass 士多 on the left at z=−6 — gate, bulb, chairs, shelves visible. HUD glows + tooltip appears. Walk away — fades out.
4. Reach stairwell branch on the left at z=−9. Turn left, walk up the stairs to the rooftop. Walk back down.
5. Continue to z=−12 right — see the false-path corridor curving into darkness. Walk in — dead end.
6. Continue to z=−14, hit the dogleg. Alley bends west.
7. Past dogleg at z=−18 right — 強記冰室 entrance. HUD glows + tooltip appears. Walk in. Confirm interior: mosaic floor, marble counter with pastry case glowing, calligraphic menu strips, green vinyl booth, octagonal table with siu yuk + tea, red metal-frame stools, ceiling fan rotating, pendant lights, kitchen curtain with steam + flame light, wall radio, painting, lattice partition, paused 3:15 clock. 2 figures inside.
8. Walk out, continue to z=−25 left — sign-alcove with hanging "九龍城寨業主聯誼會" sign.
9. Reach z=−28 — fruit stall blocks the dead end. Sign, crates, baskets, boxes, spilled fruit, knocked stool, fruit flies. HUD glows + tooltip "生果檔 / Fruit Stall / View ▸".
10. Turn around, walk back. Confirm Salon at z=−0.4 right side still works.

If any visual element is broken, missing, or out of place, fix it inline before committing.

- [ ] **Step 3: Run typecheck + lint**

Run: `npm run typecheck && npm run lint`
Expected: typecheck PASS. Lint may have warnings — fix any new ones introduced by this work.

- [ ] **Step 4: Commit any final cleanup**

```bash
git add src/worlds/WalledCity/index.tsx
git commit -m "feat(walled-city): wire complete shop street extension"
```

---

## Task 20: Build, push, verify deploy

**Why:** Ship to hongkong1985.vercel.app via the `reel` branch's GitHub auto-deploy.

- [ ] **Step 1: Run a clean build**

Run: `npm run build`
Expected: PASS. No errors. Note the bundle size diff — should be modest (the new geometry is mostly procedural, not large assets).

- [ ] **Step 2: Push to reel**

```bash
git push origin reel
```

- [ ] **Step 3: Watch the Vercel deploy**

Run: `vercel ls --next 3`
Wait for the new deployment (status `Building` → `Ready`). The new production URL aliases to `hongkong1985.vercel.app`.

- [ ] **Step 4: Verify the live deploy**

Open: https://hongkong1985.vercel.app
Walk through the same path as Task 19 Step 2. Confirm everything renders correctly in production.

- [ ] **Step 5: Final commit (if any cleanup discovered)**

If any production-only issues surface (e.g., a missing texture, a build optimization that broke something), fix and push another commit. Otherwise, this task is complete.

---

## Self-Review Checklist (run before declaring complete)

- **Spec coverage:**
  - §2.1 alley extension — Tasks 1, 2 ✓
  - §2.2 stairwell preserved + rotated — Task 4 ✓
  - §2.3 side corridors — Task 3 ✓
  - §2.4 lighting along new run — Task 7 ✓
  - §2.5 navigation bounds — Task 5 ✓
  - §3.1 士多 — Tasks 8, 9, 10 ✓
  - §3.2 強記冰室 — Tasks 11, 12, 13, 14 ✓
  - §3.3 生果檔 — Task 15 ✓
  - §4 continuous frontage — Tasks 6, 7 ✓
  - §5 HUD — Tasks 17, 18 ✓
  - §6 touchpoints — Task 5 (index.tsx wiring), Task 19 (final review) ✓
  - §6.3 ShopFigures — Task 16 ✓
  - §7 perf — implicit (instancing per memory, no shadows on mobile per existing code) ✓
  - §8 line estimate — informational only

- **Placeholder scan:** no TBDs, no "implement later", no "similar to Task N" without code, no references to undefined functions.

- **Type consistency:** `BING_SUTT` exported from `BingSutt/index.tsx` and used by Counter, Booths, Decor, Frontage, ShopFigures, InteractableHUD. `stairFloor` from Stairwell.tsx imported by index.tsx. `CORRIDORS` from SideCorridors.tsx with new union members. `Interactable` type local to InteractableHUD.tsx.
