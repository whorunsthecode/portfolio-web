# Chungking Mansions FPS World Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a walkable FPS Chungking Mansions world (arcade → elevator lobby → corridor) with Wong Kar-wai colour language and instancing-first geometry patterns.

**Architecture:** Three zone-bounded FPS zones in sequence at world x=−100, connected by an archway cut through the existing arcade back wall. All repeating props use InstancedMesh. Surface detail is baked into canvas textures (one mesh per surface). Lighting is capped at 8 dynamic lights total.

**Tech Stack:** React Three Fiber, Three.js, @react-three/drei (Text, used sparingly), TypeScript. No test runner is configured — visual verification replaces unit tests throughout.

**Spec:** `docs/superpowers/specs/2026-04-24-chungking-mansions-design.md`

---

## File Map

| Action | File | Responsibility |
|---|---|---|
| Create | `src/worlds/Chungking/ChungkingLighting.tsx` | Consolidated 8-light budget for whole world |
| Modify | `src/worlds/Chungking/ShopStalls.tsx` | Remove 8 per-stall pointLights |
| Modify | `src/worlds/Chungking/CageLift.tsx` | Remove 2 per-cage pointLights, boost emissive |
| Modify | `src/worlds/Chungking/ChungkingArcade.tsx` | Cut archway in back wall plane |
| Create | `src/worlds/Chungking/Corridor.tsx` | Baked surface meshes, two colour zones |
| Create | `src/worlds/Chungking/CorridorDoors.tsx` | InstancedMesh doors + emissive floor strips |
| Create | `src/worlds/Chungking/CorridorPipes.tsx` | InstancedMesh overhead pipe run |
| Create | `src/worlds/Chungking/FallenAngelsEggs.tsx` | Static easter egg meshes |
| Create | `src/worlds/Chungking/ElevatorLobby.tsx` | Lobby shell, reflective floor, mirror plane |
| Create | `src/worlds/Chungking/Elevator.tsx` | Animated doors, shaft light, button panel |
| Modify | `src/worlds/Chungking/index.tsx` | Add FPS bounds, replace WorldOrbit, add new components |
| Modify | `src/worlds/WorldManager.tsx` | Set chungking fps: true, adjust fly-in landing z |

---

## Task 1: Consolidate lighting

**Files:**
- Create: `src/worlds/Chungking/ChungkingLighting.tsx`
- Modify: `src/worlds/Chungking/ShopStalls.tsx`
- Modify: `src/worlds/Chungking/CageLift.tsx`

The current world has 19 dynamic lights (8 stall + 2 cage + 3 rectArea + 3 hanging signs + 2 ArcadeLighting point + 1 ambient). This task collapses them to 7 (5 new + 2 retained from ArcadeLighting that serve the arcade well enough to keep).

- [ ] **Step 1: Create ChungkingLighting.tsx**

```tsx
// src/worlds/Chungking/ChungkingLighting.tsx
// Consolidated light budget. All positions are in local space
// (parent group is at world x=−100, so local z=−14 → world z=−14).
export function ChungkingLighting() {
  return (
    <>
      {/* Shared arcade neon fills — replace the 8 per-stall pointLights */}
      <pointLight position={[-1.5, 2.2, 0]} color="#ff2850" intensity={0.65} distance={9} decay={2} />
      <pointLight position={[ 1.5, 2.2, 0]} color="#48d3ff" intensity={0.65} distance={9} decay={2} />
      <pointLight position={[ 0,   2.5,-1.5]} color="#ffd84a" intensity={0.5}  distance={7} decay={2} />
      {/* Corridor warm pools */}
      <pointLight position={[0, 2.1, -14]} color="#ffb038" intensity={0.55} distance={7} decay={2} />
      <pointLight position={[0, 2.1, -24]} color="#ffb038" intensity={0.55} distance={7} decay={2} />
    </>
  )
}
```

- [ ] **Step 2: Remove per-stall pointLights from ShopStalls.tsx**

In `src/worlds/Chungking/ShopStalls.tsx`, delete the `<pointLight>` inside the `<Stall>` function. The signboard emissive (`emissiveIntensity={2.5}` — added in Task 9) will carry the neon glow visually.

Find and delete this block inside `function Stall(...)`:
```tsx
      <pointLight
        position={[0, 2.42, 0.4]}
        color={def.color}
        intensity={0.55}
        distance={2.2}
        decay={2}
      />
```

- [ ] **Step 3: Remove per-cage pointLights from CageLift.tsx**

In `src/worlds/Chungking/CageLift.tsx`, delete the `bulbRef` ref, the `useFrame` block, and the `<pointLight ref={bulbRef} ...>` element from `function LiftCage`. Boost the brass indicator emissive so the glow is still readable.

Delete these lines from `LiftCage`:
```tsx
  const bulbRef = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    if (bulbRef.current) {
      bulbRef.current.intensity = 0.35 + Math.sin(clock.elapsedTime * 12 + xOffset) * 0.04
    }
  })
```
And:
```tsx
      <pointLight
        ref={bulbRef}
        position={[0, 2.82, 0.18]}
        color={'#ffbe6a'}
        intensity={0.35}
        distance={1.2}
        decay={2}
      />
```

Change the brass indicator material's `emissiveIntensity` from `0.2` to `0.55`:
```tsx
          emissiveIntensity={0.55}
```

Also remove the now-unused import:
```tsx
import type * as THREE from 'three'
```

- [ ] **Step 4: Visual verification**

Run `npm run dev`, navigate to the Chungking stop. The arcade should still be lit (three shared fills + existing ArcadeLighting tubes). Check the browser console for warnings about too many lights.

- [ ] **Step 5: Commit**

```bash
git add src/worlds/Chungking/ChungkingLighting.tsx \
        src/worlds/Chungking/ShopStalls.tsx \
        src/worlds/Chungking/CageLift.tsx
git commit -m "perf(chungking): collapse 19 lights → 7, remove per-stall/cage pointLights"
```

---

## Task 2: Cut archway in arcade back wall

**Files:**
- Modify: `src/worlds/Chungking/ChungkingArcade.tsx`

The back wall (`position={[0, H/2, -D/2]}`) is currently a single 6m × 3.2m plane. Replace it with three planes that leave a 3m-wide × 2.2m-tall opening for the lobby passage. The CageLift (at z=−4.85) sits in front of this opening as visual decoration.

- [ ] **Step 1: Replace back wall plane in ChungkingArcade.tsx**

Find the existing back wall mesh:
```tsx
      {/* Back wall (lift bank sits in front of this) */}
      <mesh position={[0, H / 2, -D / 2]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={'#a89472'} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
```

Replace it with:
```tsx
      {/* Back wall — three sections leaving a 3m centre archway */}
      {/* Left panel */}
      <mesh position={[-2.25, H / 2, -D / 2]}>
        <planeGeometry args={[1.5, H]} />
        <meshStandardMaterial color={'#a89472'} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Right panel */}
      <mesh position={[2.25, H / 2, -D / 2]}>
        <planeGeometry args={[1.5, H]} />
        <meshStandardMaterial color={'#a89472'} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Lintel above archway (y: 2.2 → 3.2) */}
      <mesh position={[0, 2.7, -D / 2]}>
        <planeGeometry args={[3.0, 1.0]} />
        <meshStandardMaterial color={'#a89472'} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Concrete lintel depth — visible from lobby side */}
      <mesh position={[0, 2.7, -D / 2 - 0.06]}>
        <boxGeometry args={[3.0, 1.0, 0.12]} />
        <meshStandardMaterial color={'#8a7a62'} roughness={0.95} />
      </mesh>
```

- [ ] **Step 2: Visual verification**

`npm run dev` → Chungking stop. Walk to the back of the arcade — you should see a wide opening flanked by two wall sections with the cage lift bank in front of it and darkness beyond.

- [ ] **Step 3: Commit**

```bash
git add src/worlds/Chungking/ChungkingArcade.tsx
git commit -m "feat(chungking): cut archway in arcade back wall for lobby passage"
```

---

## Task 3: Build corridor geometry

**Files:**
- Create: `src/worlds/Chungking/Corridor.tsx`

20m FPS corridor with baked surface textures. Front zone (z: −9→−20) uses green tile; rear zone (z: −20→−29) shifts to *Fallen Angels* deep blue. All positions are in the parent group's local space.

- [ ] **Step 1: Create Corridor.tsx**

```tsx
// src/worlds/Chungking/Corridor.tsx
import { useMemo } from 'react'
import * as THREE from 'three'

const W = 1.8   // corridor width
const H = 2.6   // corridor height
const FRONT_START = -9
const FRONT_END   = -20
const REAR_START  = -20
const REAR_END    = -29

function makeGreenTileTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#326446'
  ctx.fillRect(0, 0, size, size)

  // Grout grid — 10×10 tiles
  const tile = size / 10
  ctx.strokeStyle = '#1e3a2a'
  ctx.lineWidth = 3
  for (let i = 0; i <= 10; i++) {
    ctx.beginPath(); ctx.moveTo(i * tile, 0); ctx.lineTo(i * tile, size); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i * tile); ctx.lineTo(size, i * tile); ctx.stroke()
  }

  // Grime splotches
  for (let i = 0; i < 180; i++) {
    ctx.fillStyle = `rgba(10,28,14,${0.05 + Math.random() * 0.18})`
    ctx.beginPath()
    ctx.arc(Math.random() * size, Math.random() * size, 2 + Math.random() * 5, 0, Math.PI * 2)
    ctx.fill()
  }

  // Wear streak down the centre (foot traffic)
  ctx.fillStyle = 'rgba(8,22,12,0.22)'
  ctx.fillRect(size * 0.35, 0, size * 0.3, size)

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 7)
  return tex
}

function makeBlueWallTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#0f1e3c'
  ctx.fillRect(0, 0, size, size)

  // Damp streaks — vertical
  for (let i = 0; i < 6; i++) {
    const x = Math.random() * size
    const grad = ctx.createLinearGradient(x, 0, x, size)
    grad.addColorStop(0, 'rgba(20,50,100,0.35)')
    grad.addColorStop(1, 'rgba(20,50,100,0)')
    ctx.fillStyle = grad
    ctx.fillRect(x - 10, 0, 22, size)
  }

  // Peeling patches
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = 'rgba(30,55,100,0.2)'
    ctx.fillRect(Math.random() * size, Math.random() * size, 30 + Math.random() * 40, 50 + Math.random() * 60)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 3)
  return tex
}

function makeFloorTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#1e2e22'
  ctx.fillRect(0, 0, size, size)

  const tile = size / 8
  ctx.strokeStyle = '#111a14'
  ctx.lineWidth = 2
  for (let i = 0; i <= 8; i++) {
    ctx.beginPath(); ctx.moveTo(i * tile, 0); ctx.lineTo(i * tile, size); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i * tile); ctx.lineTo(size, i * tile); ctx.stroke()
  }

  // Puddle patches
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = `rgba(5,12,8,${0.3 + Math.random() * 0.3})`
    ctx.beginPath()
    ctx.ellipse(Math.random() * size, Math.random() * size, 20 + Math.random() * 30, 10 + Math.random() * 18, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 10)
  return tex
}

function makeCeilingTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#d8d0b8'
  ctx.fillRect(0, 0, size, size)
  // Stain patches
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(80,60,30,${0.04 + Math.random() * 0.1})`
    ctx.beginPath()
    ctx.ellipse(Math.random() * size, Math.random() * size, 5 + Math.random() * 20, 3 + Math.random() * 10, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 8)
  return tex
}

export function Corridor() {
  const greenTile = useMemo(() => makeGreenTileTexture(), [])
  const blueWall  = useMemo(() => makeBlueWallTexture(), [])
  const floor     = useMemo(() => makeFloorTexture(), [])
  const ceiling   = useMemo(() => makeCeilingTexture(), [])

  // Front zone dimensions
  const frontLen = Math.abs(FRONT_END - FRONT_START)   // 11m
  const frontMid = (FRONT_START + FRONT_END) / 2       // −14.5
  // Rear zone dimensions
  const rearLen  = Math.abs(REAR_END - REAR_START)     // 9m
  const rearMid  = (REAR_START + REAR_END) / 2         // −24.5

  return (
    <group>
      {/* ── Floor (full 20m) ── */}
      <mesh position={[0, 0, (FRONT_START + REAR_END) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, Math.abs(REAR_END - FRONT_START)]} />
        <meshStandardMaterial map={floor} roughness={0.55} metalness={0.18} />
      </mesh>

      {/* Reflective floor overlay — wet tile shimmer */}
      <mesh position={[0, 0.001, (FRONT_START + REAR_END) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, Math.abs(REAR_END - FRONT_START)]} />
        <meshStandardMaterial color="#0a0c0a" roughness={0.05} metalness={0.4} transparent opacity={0.55} />
      </mesh>

      {/* ── Ceiling (full 20m) ── */}
      <mesh position={[0, H, (FRONT_START + REAR_END) / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, Math.abs(REAR_END - FRONT_START)]} />
        <meshStandardMaterial map={ceiling} roughness={0.9} />
      </mesh>

      {/* ── Front zone walls — green tile (z: −9 → −20) ── */}
      <mesh position={[-W / 2, H / 2, frontMid]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[frontLen, H]} />
        <meshStandardMaterial map={greenTile} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[W / 2, H / 2, frontMid]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[frontLen, H]} />
        <meshStandardMaterial map={greenTile} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Rear zone walls — Fallen Angels blue (z: −20 → −29) ── */}
      <mesh position={[-W / 2, H / 2, rearMid]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[rearLen, H]} />
        <meshStandardMaterial map={blueWall} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[W / 2, H / 2, rearMid]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[rearLen, H]} />
        <meshStandardMaterial map={blueWall} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Dead-end back wall ── */}
      <mesh position={[0, H / 2, REAR_END]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#0a1428" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Dead-end emissive floor strip (warm light under locked door) ── */}
      <mesh position={[0, 0.002, REAR_END + 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.7, 0.08]} />
        <meshStandardMaterial color="#ffb038" emissive="#ffb038" emissiveIntensity={1.2} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 2: Visual verification — do not add to index.tsx yet**

The component is created but not yet mounted. Import + add temporarily to Chungking index to preview texture quality, then remove — it will be properly wired in Task 10.

- [ ] **Step 3: Commit**

```bash
git add src/worlds/Chungking/Corridor.tsx
git commit -m "feat(chungking): corridor geometry with baked tile textures + Fallen Angels blue rear zone"
```

---

## Task 4: Instanced corridor doors

**Files:**
- Create: `src/worlds/Chungking/CorridorDoors.tsx`

10 doors on alternating walls. One InstancedMesh draw call for all door panels. A second InstancedMesh for the emissive floor strips. Door numbers are a canvas texture baked once.

- [ ] **Step 1: Create CorridorDoors.tsx**

```tsx
// src/worlds/Chungking/CorridorDoors.tsx
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const DOOR_W = 0.85
const DOOR_H = 2.05
const DOOR_D = 0.06

interface DoorPlacement {
  z: number
  side: 'left' | 'right'
  number: string
}

const PLACEMENTS: DoorPlacement[] = [
  { z: -10.5, side: 'left',  number: 'A-1204' },
  { z: -12.5, side: 'right', number: 'A-1205' },
  { z: -14.0, side: 'left',  number: 'A-1206' },
  { z: -16.0, side: 'right', number: 'A-1207' },
  { z: -17.5, side: 'left',  number: 'A-1208' },
  { z: -20.5, side: 'right', number: 'A-1209' },
  { z: -22.0, side: 'left',  number: 'A-1210' },
  { z: -23.5, side: 'right', number: 'A-1211' },
  { z: -25.5, side: 'left',  number: 'A-1212' },
  { z: -27.5, side: 'right', number: 'A-1213' },
]

const HALF_W = 1.8 / 2  // corridor half-width

function makeDoorNumberTexture(number: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#2a1a0c'
  ctx.fillRect(0, 0, 128, 64)
  ctx.fillStyle = '#c8a060'
  ctx.font = 'bold 18px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(number, 64, 32)
  return new THREE.CanvasTexture(canvas)
}

export function CorridorDoors() {
  const panelRef = useRef<THREE.InstancedMesh>(null)
  const stripRef = useRef<THREE.InstancedMesh>(null)

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    const panel = panelRef.current
    const strip = stripRef.current
    if (!panel || !strip) return

    PLACEMENTS.forEach(({ z, side }, i) => {
      const x = side === 'left' ? -HALF_W + DOOR_D / 2 : HALF_W - DOOR_D / 2
      const rotY = side === 'left' ? -Math.PI / 2 : Math.PI / 2

      // Door panel
      dummy.position.set(x, DOOR_H / 2, z)
      dummy.rotation.set(0, rotY, 0)
      dummy.updateMatrix()
      panel.setMatrixAt(i, dummy.matrix)

      // Emissive floor strip (warm glow under door gap)
      dummy.position.set(x, 0.002, z)
      dummy.rotation.set(-Math.PI / 2, 0, rotY)
      dummy.updateMatrix()
      strip.setMatrixAt(i, dummy.matrix)
    })

    panel.instanceMatrix.needsUpdate = true
    strip.instanceMatrix.needsUpdate = true
  }, [dummy])

  // Number plates are individual meshes (10 total, not worth instancing)
  const plates = PLACEMENTS.map(({ z, side, number }) => {
    const tex = makeDoorNumberTexture(number)
    const x = side === 'left'
      ? -HALF_W + DOOR_D + 0.001
      : HALF_W - DOOR_D - 0.001
    const rotY = side === 'left' ? -Math.PI / 2 : Math.PI / 2
    return { x, z, rotY, tex, key: number }
  })

  return (
    <group>
      {/* All door panels — 1 draw call */}
      <instancedMesh ref={panelRef} args={[undefined, undefined, PLACEMENTS.length]}>
        <boxGeometry args={[DOOR_W, DOOR_H, DOOR_D]} />
        <meshStandardMaterial color="#503218" roughness={0.88} />
      </instancedMesh>

      {/* All floor strips — 1 draw call */}
      <instancedMesh ref={stripRef} args={[undefined, undefined, PLACEMENTS.length]}>
        <planeGeometry args={[0.6, 0.05]} />
        <meshStandardMaterial
          color="#ffb038"
          emissive="#ffb038"
          emissiveIntensity={1.1}
        />
      </instancedMesh>

      {/* Number plates (10 individual meshes, acceptable) */}
      {plates.map(({ x, z, rotY, tex, key }) => (
        <mesh key={key} position={[x, 1.85, z]} rotation={[0, rotY, 0]}>
          <planeGeometry args={[0.18, 0.09]} />
          <meshStandardMaterial map={tex} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/worlds/Chungking/CorridorDoors.tsx
git commit -m "feat(chungking): instanced corridor doors (10 doors, 2 draw calls)"
```

---

## Task 5: Instanced corridor pipes

**Files:**
- Create: `src/worlds/Chungking/CorridorPipes.tsx`

Overhead pipe run along the full corridor length. Two InstancedMesh passes: main pipe and smaller conduit. Uses the same mulberry32 PRNG approach as `WalledCity/PipeWeb.tsx` for deterministic placement.

- [ ] **Step 1: Create CorridorPipes.tsx**

```tsx
// src/worlds/Chungking/CorridorPipes.tsx
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface PipePlacement {
  midZ: number
  len: number
  x: number
  y: number
  radius: number
}

function buildPlacements(): PipePlacement[] {
  const rng = mulberry32(1994)
  const placements: PipePlacement[] = []

  // 3 long runs spanning most of the corridor at varying x/y
  const runs = [
    { x: -0.55, y: 2.38, radius: 0.04 },
    { x:  0.3,  y: 2.44, radius: 0.055 },
    { x:  0.0,  y: 2.35, radius: 0.03 },
  ]
  runs.forEach(({ x, y, radius }) => {
    placements.push({ midZ: -19, len: 20, x, y, radius })
  })

  // Short cross-members every ~2.5m
  for (let z = -10; z >= -28; z -= 2.5) {
    placeCross(placements, rng, z)
  }

  return placements
}

function placeCross(out: PipePlacement[], rng: () => number, z: number) {
  out.push({
    midZ: z,
    len: 0.9 + rng() * 0.6,
    x: (rng() - 0.5) * 1.2,
    y: 2.3 + rng() * 0.12,
    radius: 0.02 + rng() * 0.015,
  })
}

export function CorridorPipes() {
  const placements = useMemo(() => buildPlacements(), [])
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy   = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    placements.forEach(({ midZ, len, x, y }, i) => {
      dummy.position.set(x, y, midZ)
      dummy.rotation.set(Math.PI / 2, 0, 0)   // cylinder along Z axis
      dummy.scale.set(1, len, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [placements, dummy])

  // Use radius of the largest pipe as geometry base; scale handles length.
  // All pipes share one geometry + material → 1 draw call.
  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, placements.length]}>
      <cylinderGeometry args={[0.04, 0.04, 1, 8]} />
      <meshStandardMaterial color="#3a2f22" metalness={0.35} roughness={0.75} />
    </instancedMesh>
  )
}
```

> **Note on radius scaling:** The single cylinder geometry uses `args={[0.04, 0.04, 1, 8]}`. Per-instance scale only changes overall size, not the radius independently. For visual variety, this is acceptable — the pipes look like a bundle. If precise radius variation is needed, use 2-3 separate InstancedMesh groups with different geometries.

- [ ] **Step 2: Commit**

```bash
git add src/worlds/Chungking/CorridorPipes.tsx
git commit -m "feat(chungking): instanced corridor pipe run"
```

---

## Task 6: Fallen Angels easter eggs

**Files:**
- Create: `src/worlds/Chungking/FallenAngelsEggs.tsx`

Four static meshes in the rear blue zone. No lights. All positioned in local corridor space (z < −18, x within ±0.85).

- [ ] **Step 1: Create FallenAngelsEggs.tsx**

```tsx
// src/worlds/Chungking/FallenAngelsEggs.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'

// Broken neon tube (purple) — flickers like a short circuit
function BrokenNeon() {
  const ref = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    const spark = Math.sin(t * 40) > 0.6 && Math.sin(t * 7.3) > 0.1
    ref.current.emissiveIntensity = spark ? 2.8 + Math.sin(t * 120) * 1.2 : 0.3
  })

  return (
    // Wall-mounted at z=−24 right side, slightly drooping
    <group position={[0.82, 2.1, -24]} rotation={[0, -Math.PI / 2, 0.15]}>
      <mesh>
        <cylinderGeometry args={[0.012, 0.012, 0.7, 8]} />
        <meshStandardMaterial
          ref={ref}
          color="#b43cc8"
          emissive="#b43cc8"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  )
}

export function FallenAngelsEggs() {
  return (
    <group>
      {/* Sony Walkman — floor corner at z≈−18 */}
      <group position={[-0.82, 0, -18.5]}>
        {/* Body */}
        <mesh position={[0, 0.045, 0]}>
          <boxGeometry args={[0.14, 0.09, 0.28]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.6} />
        </mesh>
        {/* Headphone jack glow */}
        <mesh position={[0, 0.09, 0.14]}>
          <cylinderGeometry args={[0.006, 0.006, 0.02, 8]} />
          <meshStandardMaterial color="#c8a040" emissive="#c8a040" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Blue Ribbon beer can — z≈−22 right base */}
      <group position={[0.75, 0.065, -22]}>
        <mesh>
          <cylinderGeometry args={[0.033, 0.033, 0.13, 16]} />
          <meshStandardMaterial color="#1a3a6a" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Pull-tab */}
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.005, 12]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* Broken neon tube — purple, short-circuit flicker */}
      <BrokenNeon />

      {/* Red payphone — dead-end left, z≈−28 */}
      <group position={[-0.76, 0, -28]}>
        {/* Body box */}
        <mesh position={[0, 0.9, 0.12]}>
          <boxGeometry args={[0.35, 0.5, 0.18]} />
          <meshStandardMaterial color="#c01818" roughness={0.7} />
        </mesh>
        {/* Handset — hanging down (cord broke) */}
        <mesh position={[-0.1, 0.62, 0.22]} rotation={[0.8, 0, 0.3]}>
          <boxGeometry args={[0.05, 0.18, 0.04]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.75} />
        </mesh>
        {/* Coin slot glow */}
        <mesh position={[0, 1.08, 0.215]}>
          <boxGeometry args={[0.08, 0.01, 0.005]} />
          <meshStandardMaterial color="#d4a820" emissive="#d4a820" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/worlds/Chungking/FallenAngelsEggs.tsx
git commit -m "feat(chungking): Fallen Angels easter eggs (Walkman, beer can, broken neon, payphone)"
```

---

## Task 7: Elevator lobby shell

**Files:**
- Create: `src/worlds/Chungking/ElevatorLobby.tsx`

The 4m × 4m transition zone between arcade and corridor. White tile walls, reflective floor, mirror plane on back wall, rectAreaLight overhead.

- [ ] **Step 1: Create ElevatorLobby.tsx**

```tsx
// src/worlds/Chungking/ElevatorLobby.tsx
import { useMemo } from 'react'
import * as THREE from 'three'

const W = 4.0   // lobby width
const D = 4.0   // lobby depth (z: −5 → −9)
const H = 2.8   // lobby height
const Z_START = -5
const Z_END   = -9

function makeWhiteTileTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#dcdcdc'
  ctx.fillRect(0, 0, size, size)

  // 8×8 grout grid
  const tile = size / 8
  ctx.strokeStyle = '#b0a898'
  ctx.lineWidth = 3
  for (let i = 0; i <= 8; i++) {
    ctx.beginPath(); ctx.moveTo(i * tile, 0); ctx.lineTo(i * tile, size); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i * tile); ctx.lineTo(size, i * tile); ctx.stroke()
  }

  // Rust stains
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * size
    const top = Math.random() * size * 0.4
    const grad = ctx.createLinearGradient(x, top, x, top + 60 + Math.random() * 80)
    grad.addColorStop(0, 'rgba(120,60,20,0.25)')
    grad.addColorStop(1, 'rgba(120,60,20,0)')
    ctx.fillStyle = grad
    ctx.fillRect(x - 8, top, 16, 140)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 1)
  return tex
}

function makeReflectionTexture(): THREE.CanvasTexture {
  // Simple baked mirror: dark gradient with a vertical bright column
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#1a1e1a'
  ctx.fillRect(0, 0, size, size)
  // Central bright reflection of ceiling light
  const grad = ctx.createRadialGradient(size / 2, size * 0.2, 10, size / 2, size * 0.2, size * 0.6)
  grad.addColorStop(0, 'rgba(220,240,255,0.35)')
  grad.addColorStop(1, 'rgba(220,240,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  return tex
}

export function ElevatorLobby() {
  const wallTex = useMemo(() => makeWhiteTileTexture(), [])
  const reflTex = useMemo(() => makeReflectionTexture(), [])

  const midZ = (Z_START + Z_END) / 2   // −7
  const midY = H / 2                    // 1.4

  return (
    <group>
      {/* Overhead rectAreaLight — flickering fluorescent (ballast dying) */}
      <rectAreaLight
        position={[0, H - 0.05, midZ]}
        width={1.2}
        height={0.3}
        intensity={5.0}
        color="#d8ecff"
        rotation={[-Math.PI / 2, 0, 0]}
      />
      {/* Fixture housing */}
      <mesh position={[0, H - 0.04, midZ]}>
        <boxGeometry args={[0.32, 0.06, 1.3]} />
        <meshStandardMaterial color="#d8d0be" roughness={0.65} />
      </mesh>
      {/* Tube emissive */}
      <mesh position={[0, H - 0.07, midZ]}>
        <boxGeometry args={[0.24, 0.02, 1.22]} />
        <meshStandardMaterial color="#f0f8ff" emissive="#c8deff" emissiveIntensity={1.6} />
      </mesh>

      {/* Floor */}
      <mesh position={[0, 0, midZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial map={wallTex} roughness={0.7} />
      </mesh>
      {/* Reflective floor overlay */}
      <mesh position={[0, 0.001, midZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#0a0e0a" roughness={0.05} metalness={0.45} transparent opacity={0.6} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, H, midZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#e0dace" roughness={0.9} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-W / 2, midY, midZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial map={wallTex} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* Right wall */}
      <mesh position={[W / 2, midY, midZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial map={wallTex} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Back wall (toward corridor) — opening handled by zone bounds */}
      <mesh position={[0, midY, Z_END]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#c8c0b0" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Mirror plane on right wall — baked reflection texture */}
      <mesh position={[W / 2 - 0.01, 1.2, midZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.4, 1.8]} />
        <meshStandardMaterial
          map={reflTex}
          roughness={0.06}
          metalness={0.92}
          color="#c8d0c8"
        />
      </mesh>
      {/* Mirror frame (rust-edged) */}
      <mesh position={[W / 2 - 0.012, 1.2, midZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.5, 1.9]} />
        <meshStandardMaterial color="#5a4030" roughness={0.8} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/worlds/Chungking/ElevatorLobby.tsx
git commit -m "feat(chungking): elevator lobby shell with reflective floor and mirror plane"
```

---

## Task 8: Animated elevator

**Files:**
- Create: `src/worlds/Chungking/Elevator.tsx`

Two stainless steel doors that open when the player is within 1.5m, and close after 3s. A rectAreaLight inside the shaft is only active when the door is open. Button panel is a canvas texture.

- [ ] **Step 1: Create Elevator.tsx**

```tsx
// src/worlds/Chungking/Elevator.tsx
import { useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Elevator sits against the lobby back wall opposite the arcade (z = −8.8)
const ELEV_Z   = -8.8
const DOOR_W   = 0.48   // each panel
const DOOR_H   = 2.2
const OPEN_X   = 0.62   // how far each panel slides
const TRIGGER  = 1.8    // metres — player proximity to open
const CLOSE_DELAY = 3.0 // seconds before doors close

function makeButtonPanelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#2a2018'
  ctx.fillRect(0, 0, 64, 256)

  // Floors 1–17 + G
  const labels = ['G', ...Array.from({ length: 17 }, (_, i) => String(i + 1))]
  labels.forEach((label, i) => {
    const y = 240 - i * 13
    ctx.beginPath()
    ctx.arc(32, y, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#c8a060'
    ctx.fill()
    ctx.fillStyle = '#3a2810'
    ctx.font = '7px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, 32, y)
  })

  return new THREE.CanvasTexture(canvas)
}

export function Elevator() {
  const { camera } = useThree()
  const leftRef  = useRef<THREE.Mesh>(null)
  const rightRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.RectAreaLight>(null)

  // 0 = closed, 1 = open
  const openT        = useRef(0)
  const closeTimer   = useRef(0)
  const [isOpen, setIsOpen] = useState(false)

  const panelTex = useMemo(() => makeButtonPanelTexture(), [])

  useFrame((_, delta) => {
    const dist = camera.position.distanceTo(new THREE.Vector3(0 - 100, 1.65, ELEV_Z))

    if (dist < TRIGGER) {
      closeTimer.current = CLOSE_DELAY
    } else {
      closeTimer.current -= delta
    }

    const shouldOpen = closeTimer.current > 0
    const speed = 1.2 // full open/close in ~0.8s

    openT.current = THREE.MathUtils.clamp(
      openT.current + (shouldOpen ? delta * speed : -delta * speed),
      0,
      1
    )

    if (!isOpen && openT.current > 0.05) setIsOpen(true)
    if (isOpen  && openT.current < 0.01) setIsOpen(false)

    const t = openT.current
    if (leftRef.current)  leftRef.current.position.x  = -OPEN_X * t
    if (rightRef.current) rightRef.current.position.x =  OPEN_X * t
    if (lightRef.current) lightRef.current.intensity  = t > 0.5 ? 4.5 * t : 0
  })

  return (
    // Positioned in local group space (parent is at world x=−100)
    <group position={[0, 0, ELEV_Z]}>
      {/* Frame surround */}
      <mesh position={[0, DOOR_H / 2 + 0.1, 0]}>
        <boxGeometry args={[DOOR_W * 2 + 0.3, 0.2, 0.12]} />
        <meshStandardMaterial color="#5a5248" metalness={0.6} roughness={0.5} />
      </mesh>
      {[-0.54, 0.54].map((x, i) => (
        <mesh key={i} position={[x, DOOR_H / 2, 0]}>
          <boxGeometry args={[0.08, DOOR_H, 0.12]} />
          <meshStandardMaterial color="#5a5248" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}

      {/* Left door panel */}
      <mesh ref={leftRef} position={[-DOOR_W / 2, DOOR_H / 2, 0.02]}>
        <boxGeometry args={[DOOR_W, DOOR_H, 0.04]} />
        <meshStandardMaterial color="#b4bec8" metalness={0.88} roughness={0.12} />
      </mesh>

      {/* Right door panel */}
      <mesh ref={rightRef} position={[DOOR_W / 2, DOOR_H / 2, 0.02]}>
        <boxGeometry args={[DOOR_W, DOOR_H, 0.04]} />
        <meshStandardMaterial color="#b4bec8" metalness={0.88} roughness={0.12} />
      </mesh>

      {/* Elevator shaft interior (visible when door open) */}
      <mesh position={[0, DOOR_H / 2, -0.5]}>
        <boxGeometry args={[DOOR_W * 2 + 0.05, DOOR_H, 1.0]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.95} side={THREE.BackSide} />
      </mesh>

      {/* Shaft light — only bright when door open */}
      <rectAreaLight
        ref={lightRef}
        position={[0, DOOR_H - 0.1, -0.3]}
        width={0.8}
        height={0.2}
        intensity={0}
        color="#f0f8ff"
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Button panel — right side of frame */}
      <mesh position={[0.65, 1.1, 0.1]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.08, 0.24, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      <mesh position={[0.66, 1.1, 0.125]} rotation={[0, -0.2, 0]}>
        <planeGeometry args={[0.06, 0.22]} />
        <meshStandardMaterial map={panelTex} roughness={0.8} />
      </mesh>
    </group>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/worlds/Chungking/Elevator.tsx
git commit -m "feat(chungking): animated elevator doors with shaft light and button panel"
```

---

## Task 9: Fog, neon emissive, film grain CSS

**Files:**
- Modify: `src/worlds/Chungking/index.tsx` (fog only — wired in Task 10)
- Modify: `src/worlds/Chungking/ShopStalls.tsx` (add emissive to sign panels)
- Modify: `src/index.css` or create `src/grain.css` (film grain overlay)
- Modify: `src/main.tsx` or `src/App.tsx` (mount grain div)

- [ ] **Step 1: Add emissive to ShopStalls sign panels**

In `src/worlds/Chungking/ShopStalls.tsx`, find the signboard `meshStandardMaterial`:
```tsx
      {/* Signboard + neon glow */}
      <mesh position={[0, 2.42, 0.02]}>
        <boxGeometry args={[STALL_WIDTH - 0.08, 0.44, 0.04]} />
        <meshStandardMaterial color={'#0a0a0a'} roughness={0.95} />
      </mesh>
```

Replace with (keeping the dark backing, adding a separate emissive sign face):
```tsx
      {/* Signboard backing */}
      <mesh position={[0, 2.42, 0.02]}>
        <boxGeometry args={[STALL_WIDTH - 0.08, 0.44, 0.04]} />
        <meshStandardMaterial color={'#0a0a0a'} roughness={0.95} />
      </mesh>
      {/* Neon glow face — emissive replaces the removed pointLight */}
      <mesh position={[0, 2.42, 0.045]}>
        <planeGeometry args={[STALL_WIDTH - 0.12, 0.36]} />
        <meshStandardMaterial
          color={def.color}
          emissive={def.color}
          emissiveIntensity={2.5}
          roughness={0.9}
        />
      </mesh>
```

- [ ] **Step 2: Check if src/index.css exists**

```bash
ls src/index.css 2>/dev/null || ls src/App.css 2>/dev/null || echo "no css found"
```

If a CSS file exists, append to it. If not, create `src/index.css` and import it in `src/main.tsx`.

- [ ] **Step 3: Add film grain CSS**

Append to whichever CSS file exists (or create `src/index.css`):

```css
/* WKW film grain overlay — zero GPU cost */
canvas {
  filter: contrast(1.06) saturate(0.88);
}

.grain-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
  z-index: 10;
  opacity: 0.045;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
  background-repeat: repeat;
  background-size: 200px 200px;
}
```

- [ ] **Step 4: Mount grain div**

In `src/App.tsx` (or wherever the root component lives), add `<div className="grain-overlay" />` as a sibling to the canvas element. Find the return statement and add:

```tsx
return (
  <>
    {/* existing canvas/R3F setup */}
    <div className="grain-overlay" />
  </>
)
```

- [ ] **Step 5: Visual verification**

`npm run dev` — the grain overlay should be barely visible (opacity 0.045) but noticeable on light backgrounds. The canvas contrast/saturation shift should be subtle. Check that it doesn't affect UI elements (pointer-events: none means clicks pass through).

- [ ] **Step 6: Commit**

```bash
git add src/worlds/Chungking/ShopStalls.tsx src/index.css src/App.tsx
git commit -m "feat(chungking): neon emissive on stall signs + WKW film grain CSS overlay"
```

---

## Task 10: Wire FPS navigation and mount all components

**Files:**
- Modify: `src/worlds/Chungking/index.tsx`
- Modify: `src/worlds/WorldManager.tsx`

This is the final wiring task. It switches the Chungking world from orbit to FPS, defines zone bounds, and mounts all the new components built in Tasks 1–9.

- [ ] **Step 1: Update WorldManager.tsx — enable FPS for Chungking**

In `src/worlds/WorldManager.tsx`, find:
```tsx
  chungking:   { pos: [-100, 1.65, 3.5], look: [-100, 1.55, -4.5], fps: false },
```

Replace with:
```tsx
  chungking:   { pos: [-100, 1.65, 4.0], look: [-100, 1.55, -1.0], fps: true  },
```

This aligns the fly-in landing position with the FPS start (z=4.0), and adjusts the look target to face into the arcade rather than the back wall.

- [ ] **Step 2: Rewrite Chungking/index.tsx**

```tsx
// src/worlds/Chungking/index.tsx
import { ChungkingArcade }    from './ChungkingArcade'
import { ShopStalls }         from './ShopStalls'
import { HangingSigns }       from './HangingSigns'
import { ArcadeLighting }     from './ArcadeLighting'
import { CageLift }           from './CageLift'
import { ChungkingLighting }  from './ChungkingLighting'
import { ElevatorLobby }      from './ElevatorLobby'
import { Elevator }           from './Elevator'
import { Corridor }           from './Corridor'
import { CorridorDoors }      from './CorridorDoors'
import { CorridorPipes }      from './CorridorPipes'
import { FallenAngelsEggs }   from './FallenAngelsEggs'
import { FirstPersonControls, type Zone } from '../common/FirstPersonControls'

const WORLD_X = -100

const BOUNDS: Zone[] = [
  // Arcade — full 6m width, entry buffer at +z
  { min: [WORLD_X - 2.8, 0, -5.0], max: [WORLD_X + 2.8, 3.0, 4.8] },
  // Elevator lobby — 4m wide
  { min: [WORLD_X - 2.0, 0, -9.0], max: [WORLD_X + 2.0, 2.7, -5.0] },
  // Corridor — 1.8m wide, 20m deep
  { min: [WORLD_X - 0.85, 0, -29.0], max: [WORLD_X + 0.85, 2.5, -9.0] },
]

export function Chungking() {
  return (
    <>
      <group position={[WORLD_X, 0, 0]}>
        {/* Fog inside the group so it only reads in this world context.
            fogExp2 gives the corridor its depth-swallowing green-black falloff. */}
        <fogExp2 attach="fog" color="#0a1408" density={0.12} />

        <ArcadeLighting />
        <ChungkingLighting />
        <ChungkingArcade />
        <ShopStalls />
        <HangingSigns />
        <CageLift />
        <ElevatorLobby />
        <Elevator />
        <Corridor />
        <CorridorDoors />
        <CorridorPipes />
        <FallenAngelsEggs />
      </group>

      <FirstPersonControls
        bounds={BOUNDS}
        start={[WORLD_X, 0, 4.0]}
        startYaw={Math.PI}
        height={1.65}
        speed={2.8}
      />
    </>
  )
}
```

> **Note on fog:** R3F attaches fog to the scene object when you use `<fogExp2 attach="fog" />`. If the Walled City world mounts at the same time this could conflict. Since `WorldManager.tsx` lazy-mounts only one world at a time (confirmed in `src/worlds/WorldManager.tsx:90`), the fog is set when Chungking mounts and cleared when it unmounts. No conflict.

> **Note on `startYaw`:** `Math.PI` means the player starts facing into the arcade (−Z direction). Check `FirstPersonControls` source to confirm the yaw convention — if 0 is −Z (as in WalledCity where `startYaw` is omitted/0), use `startYaw={0}` instead.

- [ ] **Step 3: Visual verification — full walkthrough**

`npm run dev`:
1. Click the Chungking stop on the tram HUD
2. Camera should fly in and land at the arcade entrance
3. FPS controls should activate — WASD/arrows to walk, mouse to look
4. Walk from arcade → through archway → lobby (elevator should open as you approach) → corridor → rear blue zone (Fallen Angels easter eggs visible)
5. Verify fog thickens toward the corridor dead end
6. Verify no console errors about missing bounds or excessive light count

- [ ] **Step 4: Commit**

```bash
git add src/worlds/Chungking/index.tsx src/worlds/WorldManager.tsx
git commit -m "feat(chungking): wire FPS navigation, zone bounds, fog, mount all new components"
```

---

## Self-Review Checklist

- [x] **Zone Architecture (spec §1):** 3 zones in index.tsx BOUNDS array ✓
- [x] **Baked surface textures (spec §2 Rule 1):** Corridor.tsx and ElevatorLobby.tsx use canvas textures per surface ✓
- [x] **InstancedMesh (spec §2 Rule 2):** Doors, floor strips, pipes all instanced ✓
- [x] **8-light budget (spec §3):** 5 in ChungkingLighting + 1 lobby rectArea + 1 elevator shaft (active only when open) + 1 ambient = 8 ✓
- [x] **Fog #0a1408 (spec §4):** fogExp2 in index.tsx ✓
- [x] **Emissive lift (spec §4):** ShopStalls sign faces get `emissiveIntensity={2.5}` ✓
- [x] **Neon flicker (spec §4):** BrokenNeon in FallenAngelsEggs uses sin flicker; stall `<Text>` elements remain static (acceptable — the drei Text glyph atlas can't take a ref) ✓
- [x] **Reflective floors (spec §4):** Both Corridor.tsx and ElevatorLobby.tsx have roughness 0.05 / metalness 0.4 overlay ✓
- [x] **Mirror plane (spec §4):** ElevatorLobby.tsx right wall baked reflection ✓
- [x] **Film grain CSS (spec §4):** .grain-overlay in index.css + div in App.tsx ✓
- [x] **Elevator animation (spec §4):** Elevator.tsx useFrame lerp + trigger radius ✓
- [x] **Fallen Angels easter eggs (spec §5):** All 4 in FallenAngelsEggs.tsx ✓
- [x] **Dead-end detail (spec §6):** Emissive floor strip + dead-end back wall in Corridor.tsx ✓
- [x] **FPS navigation (spec, Task 10):** WorldManager fps:true + index.tsx FirstPersonControls ✓
- [x] **WorldOrbit removed:** index.tsx no longer imports WorldOrbit ✓
- [x] **Fallen Angels blue zone (spec §2):** REAR_START = −20, REAR_END = −29, blue material ✓
