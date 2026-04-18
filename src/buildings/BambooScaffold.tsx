/**
 * Bamboo scaffolding — the signature HK construction texture.
 *
 * Wraps selected tenement facades along the corridor. Unlike the previous
 * implementation, which generated its own z positions and ended up floating
 * between buildings, this one samples from the shared BUILDINGS list in
 * TenementRow and plants each scaffold directly on a real facade.
 *
 * Geometry per scaffolded building:
 *   - 6 vertical bamboo uprights along the facade
 *   - Horizontal cross-pieces every 3m (one per floor)
 *   - A few diagonal braces for rigidity
 *   - Translucent green mesh netting overlay (the iconic HK dust screen)
 *   - Safety-tape yellow bar at street level
 *
 * Scroll is driven here, matching the lane-markings/tenement speed. Sharing
 * BUILDINGS means scaffolds inherit the same landmark exclusions — we never
 * wrap an HSBC or a Man Mo Temple.
 */

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { BUILDINGS, TENEMENT_DEPTH, type BuildingDef } from './TenementRow'

const BAMBOO = '#a08a50'
const BAMBOO_DARK = '#7a6a3c'
const NETTING_GREEN = '#4a7040'

const SCROLL_SPEED = 6
const ROUTE_LENGTH = 140
const RESET_THRESHOLD = 15

/** Single scaffolded building wrap — laid out around an external facade.
 *  `x` is the world-space plane the scaffold lives on (just outside the
 *  facade), `width` is the facade length along Z. */
function ScaffoldWrap({
  x,
  side,
  height,
  width,
  hasNetting,
}: {
  x: number
  side: 1 | -1
  height: number
  width: number
  hasNetting: boolean
}) {
  const floors = Math.max(2, Math.floor(height / 3))

  const upright = 6
  const uprightZs = Array.from({ length: upright }, (_, i) => {
    return (i - (upright - 1) / 2) * (width / (upright - 1))
  })

  const crossYs = Array.from({ length: floors }, (_, i) => (i + 1) * 3)

  // Netting sits slightly further from the facade than the uprights so it
  // reads as draped over the cage, not clipping into it.
  const nettingPushOut = -side * 0.05

  return (
    <group>
      {/* Vertical bamboo uprights */}
      {uprightZs.map((zOff, i) => (
        <mesh key={`up-${i}`} position={[x, height / 2, zOff]}>
          <cylinderGeometry args={[0.035, 0.035, height, 6]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? BAMBOO : BAMBOO_DARK}
            roughness={0.9}
          />
        </mesh>
      ))}

      {/* Horizontal cross-pieces per floor */}
      {crossYs.map((cy, i) => (
        <mesh
          key={`cross-${i}`}
          position={[x, cy, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.028, 0.028, width, 6]} />
          <meshStandardMaterial color={BAMBOO} roughness={0.9} />
        </mesh>
      ))}

      {/* Diagonal braces every ~2 floors for rigidity */}
      {Array.from({ length: Math.floor(floors / 2) }, (_, i) => {
        const y1 = i * 6
        const y2 = y1 + 6
        const dy = y2 - y1
        const dx = width / 3
        const len = Math.sqrt(dy * dy + dx * dx)
        const angle = Math.atan2(dy, dx)
        return (
          <mesh
            key={`diag-${i}`}
            position={[x - side * 0.03, (y1 + y2) / 2, 0]}
            rotation={[angle - Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.022, 0.022, len, 6]} />
            <meshStandardMaterial color={BAMBOO_DARK} roughness={0.9} />
          </mesh>
        )
      })}

      {/* Green mesh netting — translucent, covers most of the facade, with
          a strip left open near the top (scaffolding climbs floor by floor) */}
      {hasNetting && (
        <mesh
          position={[x + nettingPushOut, height * 0.38, 0]}
          rotation={[0, side === 1 ? -Math.PI / 2 : Math.PI / 2, 0]}
        >
          <planeGeometry args={[width - 0.2, height * 0.72]} />
          <meshBasicMaterial
            color={NETTING_GREEN}
            transparent
            opacity={0.42}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Safety-tape bar at pedestrian height */}
      <mesh
        position={[x - side * 0.03, 2.6, 0]}
        rotation={[Math.PI / 2, 0, 0]}
      >
        <cylinderGeometry args={[0.035, 0.035, width - 0.3, 6]} />
        <meshStandardMaterial color="#f4c020" roughness={0.8} />
      </mesh>
    </group>
  )
}

/* ── Scaffold selection: sample from BUILDINGS ───────────────────────── */

interface ScaffoldDef {
  buildingIdx: number
  z: number
  x: number
  side: 1 | -1
  height: number
  width: number
  hasNetting: boolean
}

function hash(seed: number) {
  const s = Math.sin(seed) * 43758.5453
  return s - Math.floor(s)
}

/** Pick ~1-in-3 tenements for scaffolding. Uses each building's own seed so
 *  the choice is deterministic across renders. Returns one ScaffoldDef per
 *  selected building, positioned just outside its facade. */
function selectScaffolds(buildings: BuildingDef[]): ScaffoldDef[] {
  const out: ScaffoldDef[] = []
  for (let i = 0; i < buildings.length; i++) {
    const b = buildings[i]
    // Probability gate — ~1-in-3 buildings get scaffolded
    if (hash(b.seed + 13) > 0.35) continue

    const sideNum: 1 | -1 = b.side === 'right' ? 1 : -1
    // Facade plane (road-facing edge of the building) sits at
    //   worldX = side * (xOffset - depth/2)
    // Push the scaffold 0.25m further outward (toward the road) so it
    // reads as wrapping the wall rather than clipping through it.
    const facadeX = sideNum * (b.xOffset - TENEMENT_DEPTH / 2)
    const scaffoldX = facadeX - sideNum * 0.25

    const h = 15 + Math.floor(hash(b.seed + 27) * 10)
    const w = 7.5 + hash(b.seed + 41) * 1.4

    out.push({
      buildingIdx: i,
      z: b.z,
      x: scaffoldX,
      side: sideNum,
      height: h,
      width: w,
      hasNetting: hash(b.seed + 59) < 0.75,
    })
  }
  return out
}

export function BambooScaffold() {
  const groupRef = useRef<THREE.Group>(null)
  const scaffolds = useMemo(() => selectScaffolds(BUILDINGS), [])
  const offsets = useRef(scaffolds.map((s) => s.z))

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const children = groupRef.current.children
    for (let i = 0; i < children.length; i++) {
      offsets.current[i] += SCROLL_SPEED * delta
      if (offsets.current[i] > RESET_THRESHOLD) {
        offsets.current[i] -= ROUTE_LENGTH
      }
      children[i].position.z = offsets.current[i]
    }
  })

  return (
    <group ref={groupRef}>
      {scaffolds.map((s, i) => (
        <group key={i} position={[0, 0, s.z]}>
          <ScaffoldWrap
            x={s.x}
            side={s.side}
            height={s.height}
            width={s.width}
            hasNetting={s.hasNetting}
          />
        </group>
      ))}
    </group>
  )
}
