/**
 * Bamboo scaffolding — the signature HK construction texture.
 *
 * Traditional bamboo-pole scaffolding (still used on HK high-rises
 * today) wraps selected tenements along the corridor. Per user design
 * choice: 1-in-6 coverage so 2-3 scaffolded buildings are visible at
 * any time — realistic background texture without dominating.
 *
 * Geometry per scaffolded building:
 *   - 6 vertical bamboo uprights along the facade
 *   - Horizontal cross-pieces every 3m (one per floor)
 *   - A few diagonal braces for rigidity
 *   - Translucent green mesh netting overlay (the iconic HK dust
 *     screen — that characteristic bright green fabric)
 *
 * All bamboo uses warm tan #a08a50 with subtle variation per pole.
 * Netting is meshBasicMaterial with 0.35 opacity so the building +
 * windows behind are still visible.
 *
 * Positioned relative to the scrolling tenement row (which moves at
 * 6 u/s). This component has its OWN z offsets that scroll in sync
 * with the tenements. Placing them in the same corridor at selected
 * z positions means scaffold covers THOSE specific buildings.
 */

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BAMBOO = '#a08a50'
const BAMBOO_DARK = '#7a6a3c'
const NETTING_GREEN = '#4a7040'

const SCROLL_SPEED = 6
const ROUTE_LENGTH = 140
const RESET_THRESHOLD = 15

/* ── Single scaffolded building wrap ──────────────────────────────── */
function ScaffoldWrap({
  side,
  height,
  width = 8,
  hasNetting = true,
}: {
  side: 1 | -1
  height: number
  width?: number   // facade width along Z (tenements run along Z axis)
  hasNetting?: boolean
}) {
  // Scaffold sits 0.3m proud of the building face (x=±9)
  const x = side * 8.7
  const floors = Math.max(2, Math.floor(height / 3))

  // 6 vertical uprights spread along facade
  const upright = 6
  const uprightZs = Array.from({ length: upright }, (_, i) => {
    return (i - (upright - 1) / 2) * (width / (upright - 1))
  })

  // Horizontal cross-pieces — one per floor, full facade width
  const crossYs = Array.from({ length: floors }, (_, i) => (i + 1) * 3)

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

      {/* A couple of diagonal braces every ~2 floors for rigidity */}
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
            position={[x + 0.03, (y1 + y2) / 2, 0]}
            rotation={[angle - Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.022, 0.022, len, 6]} />
            <meshStandardMaterial color={BAMBOO_DARK} roughness={0.9} />
          </mesh>
        )
      })}

      {/* Green mesh netting — translucent overlay covering ~60% of the
          facade, with a section left open near the top showing raw
          scaffolding (realistic — scaffolding goes up floor by floor) */}
      {hasNetting && (
        <mesh
          position={[x + 0.04, (height * 0.35), 0]}
          rotation={[0, side === 1 ? -Math.PI / 2 : Math.PI / 2, 0]}
        >
          <planeGeometry args={[width - 0.5, height * 0.65]} />
          <meshBasicMaterial
            color={NETTING_GREEN}
            transparent
            opacity={0.38}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Safety-tape stripes on the lowest cross-piece — yellow+black */}
      <mesh position={[x + 0.04, 2.6, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, width - 0.3, 6]} />
        <meshStandardMaterial color="#f4c020" roughness={0.8} />
      </mesh>
    </group>
  )
}

/* ── Scrolling composite ──────────────────────────────────────────── */
interface ScaffoldDef {
  z: number
  side: 1 | -1
  height: number
  width: number
  hasNetting: boolean
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Every 6th tenement has scaffolding — spread along the full corridor.
// Tenements live z=-2 to z=-130 per TenementRow. We place scaffolds at
// those intervals so ~2-3 are always in view as the world scrolls.
function buildScaffolds(): ScaffoldDef[] {
  const r = seededRandom(42)
  const scaffolds: ScaffoldDef[] = []

  // Tenement spacing is ~7m. 1-in-6 → every ~42m. Offset sides so not
  // both sides have scaffold at the same z (would block the tram view).
  for (let z = -10; z > -130; z -= 14 + r() * 8) {
    const side: 1 | -1 = r() < 0.5 ? 1 : -1
    scaffolds.push({
      z,
      side,
      height: 15 + Math.floor(r() * 10),  // 15-25m
      width: 7 + r() * 2,
      hasNetting: r() < 0.7,               // 70% have green netting
    })
  }
  return scaffolds
}

export function BambooScaffold() {
  const groupRef = useRef<THREE.Group>(null)
  const scaffolds = useMemo(() => buildScaffolds(), [])
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
