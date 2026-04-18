import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Tenement, TENEMENT_STYLES, type TenementStyle } from './Tenement'

/* ── Seeded random ─────────────────────────────────────── */
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

/* ── Static building layout ────────────────────────────── */
export interface BuildingDef {
  z: number
  side: 'left' | 'right'
  style: TenementStyle
  seed: number
  xOffset: number
}

const ROAD_HALF = 5.5  // buildings start this far from center
/** Tenement depth (perpendicular to road). Exported so BambooScaffold can
 *  compute the facade plane from each BuildingDef without re-reading the
 *  Tenement component internals. */
export const TENEMENT_DEPTH = 7
const SCROLL_SPEED = 6 // match lane marking speed

// Landmark z positions — skip tenements near these so landmarks are visible.
// Keep in sync with LANDMARKS in buildings/landmarks/Landmarks.tsx.
const LANDMARK_ZONES: { z: number; side: 'left' | 'right' }[] = [
  { z: -18, side: 'right' },   // HSBC
  { z: -26, side: 'left' },    // Central Market
  { z: -34, side: 'left' },    // BoC
  { z: -48, side: 'right' },   // Furama Hotel
  { z: -60, side: 'left' },    // Western Market
  { z: -75, side: 'right' },   // Jardine House
  { z: -83, side: 'right' },   // Man Mo Temple
  { z: -92, side: 'left' },    // Sheung Wan stalls
  { z: -92, side: 'right' },
  { z: -105, side: 'left' },   // Tong lau
  { z: -105, side: 'right' },
  { z: -120, side: 'left' },   // Sai Ying Pun shelter
  { z: -120, side: 'right' },
]

/** Radius (in Z) around each landmark where no tenement may spawn on the
 *  same side. Wider than before so signature buildings (HSBC, Jardine
 *  House, Furama, Man Mo, Central Market) don't visually merge with the
 *  neighbouring tenement row. ~22m clears roughly two tenement footprints
 *  on either side of the landmark. */
const LANDMARK_CLEAR_RADIUS = 22

function isNearLandmark(z: number, side: 'left' | 'right'): boolean {
  return LANDMARK_ZONES.some((lm) =>
    lm.side === side && Math.abs(z - lm.z) < LANDMARK_CLEAR_RADIUS
  )
}

function generateBuildings(): BuildingDef[] {
  const r = seededRandom(42)
  const buildings: BuildingDef[] = []
  let z = -2

  while (z > -130) {
    // Left side — skip if landmark is nearby on this side
    if (!isNearLandmark(z, 'left')) {
      buildings.push({
        z,
        side: 'left',
        style: TENEMENT_STYLES[Math.floor(r() * TENEMENT_STYLES.length)],
        seed: Math.floor(r() * 10000),
        xOffset: ROAD_HALF + 3.5 + r() * 0.5,
      })
    } else {
      r(); r(); r() // consume random values to keep seeding stable
    }

    // Right side
    const rz = z - 1 - r() * 2
    if (!isNearLandmark(rz, 'right')) {
      buildings.push({
        z: rz,
        side: 'right',
        style: TENEMENT_STYLES[Math.floor(r() * TENEMENT_STYLES.length)],
        seed: Math.floor(r() * 10000),
        xOffset: ROAD_HALF + 3.5 + r() * 0.5,
      })
    } else {
      r(); r(); r()
    }

    z -= 9 + r() * 3
  }

  return buildings
}

export const BUILDINGS = generateBuildings()
const MIN_Z = Math.min(...BUILDINGS.map((b) => b.z)) - 12
const RANGE = 10 - MIN_Z // total z-range for recycling

export function TenementRow() {
  const groupRef = useRef<THREE.Group>(null)
  // Track per-building z offsets for recycling
  const offsets = useRef(BUILDINGS.map((b) => b.z))

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const children = groupRef.current.children

    for (let i = 0; i < children.length; i++) {
      offsets.current[i] += SCROLL_SPEED * delta
      if (offsets.current[i] > 10) {
        offsets.current[i] -= RANGE + Math.random() * 3
      }
      children[i].position.z = offsets.current[i]
    }
  })

  return (
    <group ref={groupRef}>
      {BUILDINGS.map((b, i) => {
        const x = b.side === 'left' ? -b.xOffset : b.xOffset
        return (
          <Tenement
            key={i}
            position={[x, 0, b.z]}
            side={b.side}
            style={b.style}
            seed={b.seed}
          />
        )
      })}
    </group>
  )
}
