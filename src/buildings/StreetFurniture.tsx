/**
 * HK 1980s street furniture — scattered along the sidewalks for density.
 *
 * Four types that every Central / Sheung Wan photo shows:
 *   - Red British-style post box (郵政信箱) — iconic HK colonial heritage
 *   - Curved HK lamp posts with globe heads
 *   - Red phone booths — late 80s HK Telephone
 *   - Yellow fire hydrants (or red, depending on era)
 *
 * All placed on the outer half of the sidewalk (x=±7.5 to ±8.8) so they
 * don't clash with pedestrians (who walk x=±5.9 to ±7.1 per Pedestrians.tsx).
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type FurnitureType = 'postbox' | 'lamp' | 'phonebooth' | 'hydrant' | 'bin'

interface Furniture {
  type: FurnitureType
  x: number
  z: number
  rotY: number
}

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// Types weighted by realism — lamps most common, phone booths rarer
const TYPE_POOL: FurnitureType[] = [
  'lamp', 'lamp', 'lamp', 'lamp', 'lamp',      // 5
  'postbox', 'postbox',                         // 2
  'hydrant', 'hydrant', 'hydrant',              // 3
  'phonebooth', 'phonebooth',                   // 2
  'bin', 'bin', 'bin',                          // 3
]

function buildFurniture(): Furniture[] {
  const r = seededRandom(31415)
  const items: Furniture[] = []
  // Distribute along z=-5 to z=-135, both sides
  let z = -5
  while (z > -135) {
    const side: 1 | -1 = r() < 0.5 ? 1 : -1
    // Outer half of the sidewalk to stay clear of pedestrians
    const x = side * (7.5 + r() * 1.3)
    const type = TYPE_POOL[Math.floor(r() * TYPE_POOL.length)]
    // Lamps face inward toward the road; others face the road too
    const rotY = side === 1 ? Math.PI : 0
    items.push({ type, x, z, rotY })
    z -= 3.5 + r() * 3.5
  }
  return items
}

const ITEMS = buildFurniture()
const SCROLL_SPEED = 6
const ROUTE_LENGTH = 140
const RESET_THRESHOLD = 15

export function StreetFurniture() {
  const groupRef = useRef<THREE.Group>(null)
  const offsets = useRef(ITEMS.map((i) => i.z))

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
      {ITEMS.map((item, i) => (
        <group
          key={i}
          position={[item.x, 0.12, item.z]}
          rotation={[0, item.rotY, 0]}
        >
          {renderItem(item.type, i)}
        </group>
      ))}
    </group>
  )
}

function renderItem(type: FurnitureType, seed: number) {
  switch (type) {
    case 'lamp': return <LampPost seed={seed} />
    case 'postbox': return <PostBox />
    case 'phonebooth': return <PhoneBooth />
    case 'hydrant': return <FireHydrant />
    case 'bin': return <TrashBin />
  }
}

/* ── Curved HK colonial lamp post ─────────────────── */
function LampPost({ seed }: { seed: number }) {
  // Random twinkle if night mode later, for now steady
  const emissive = 0.9 + (seed % 3) * 0.05
  return (
    <group>
      {/* Base */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.22, 0.4, 0.22]} />
        <meshStandardMaterial color="#2a1f18" roughness={0.9} />
      </mesh>
      {/* Main pole */}
      <mesh position={[0, 2.0, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 3.4, 10]} />
        <meshStandardMaterial color="#2a1f18" roughness={0.8} />
      </mesh>
      {/* Decorative collar */}
      <mesh position={[0, 3.65, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.12, 10]} />
        <meshStandardMaterial color="#1a120a" roughness={0.8} />
      </mesh>
      {/* Arm — curves out toward road */}
      <mesh position={[0, 3.85, 0.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.6, 8]} />
        <meshStandardMaterial color="#2a1f18" roughness={0.8} />
      </mesh>
      {/* Globe */}
      <mesh position={[0, 3.85, 0.6]}>
        <sphereGeometry args={[0.14, 12, 10]} />
        <meshBasicMaterial color="#fff1c8" />
      </mesh>
      {/* Subtle emissive cap — suggests bulb */}
      <pointLight position={[0, 3.85, 0.6]} intensity={emissive * 0.3} distance={3.5} color="#fff1c8" />
    </group>
  )
}

/* ── Red HK post box (colonial style) ─────────────── */
function PostBox() {
  return (
    <group>
      {/* Cylindrical pillar */}
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[0.24, 0.26, 1.1, 16]} />
        <meshStandardMaterial color="#c8202a" roughness={0.65} />
      </mesh>
      {/* Domed top */}
      <mesh position={[0, 1.12, 0]}>
        <sphereGeometry args={[0.24, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#a81820" roughness={0.65} />
      </mesh>
      {/* Slot */}
      <mesh position={[0, 0.82, 0.245]}>
        <boxGeometry args={[0.22, 0.04, 0.01]} />
        <meshStandardMaterial color="#1a1010" roughness={0.9} />
      </mesh>
      {/* Crown badge — little gold square */}
      <mesh position={[0, 1.02, 0.24]}>
        <boxGeometry args={[0.12, 0.08, 0.01]} />
        <meshStandardMaterial color="#d4a848" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Base */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
        <meshStandardMaterial color="#1a1410" roughness={0.9} />
      </mesh>
    </group>
  )
}

/* ── Red phone booth ─────────────────────────────── */
function PhoneBooth() {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[0.7, 0.04, 0.7]} />
        <meshStandardMaterial color="#1a1410" roughness={0.9} />
      </mesh>
      {/* 4 corner posts */}
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`post-${sx}-${sz}`} position={[sx * 0.32, 1.2, sz * 0.32]}>
            <boxGeometry args={[0.06, 2.4, 0.06]} />
            <meshStandardMaterial color="#a81820" roughness={0.6} />
          </mesh>
        )),
      )}
      {/* Side walls (translucent glass panes with red frame top) */}
      {[-1, 1].map((sx) => (
        <mesh key={`swall-${sx}`} position={[sx * 0.34, 1.2, 0]}>
          <boxGeometry args={[0.02, 1.9, 0.6]} />
          <meshStandardMaterial
            color="#e0ecf0"
            transparent
            opacity={0.25}
            roughness={0.2}
          />
        </mesh>
      ))}
      {[-1, 1].map((sz) => (
        <mesh key={`bwall-${sz}`} position={[0, 1.2, sz * 0.34]}>
          <boxGeometry args={[0.6, 1.9, 0.02]} />
          <meshStandardMaterial
            color="#e0ecf0"
            transparent
            opacity={0.25}
            roughness={0.2}
          />
        </mesh>
      ))}
      {/* Red top cap */}
      <mesh position={[0, 2.45, 0]}>
        <boxGeometry args={[0.78, 0.18, 0.78]} />
        <meshStandardMaterial color="#a81820" roughness={0.6} />
      </mesh>
      {/* Small illuminated sign */}
      <mesh position={[0, 2.45, 0.4]}>
        <boxGeometry args={[0.5, 0.12, 0.02]} />
        <meshBasicMaterial color="#fff1c8" />
      </mesh>
    </group>
  )
}

/* ── Fire hydrant ─────────────────────────────────── */
function FireHydrant() {
  return (
    <group>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.12, 0.14, 0.44, 12]} />
        <meshStandardMaterial color="#c82020" roughness={0.75} />
      </mesh>
      {/* Cap on top */}
      <mesh position={[0, 0.46, 0]}>
        <cylinderGeometry args={[0.1, 0.11, 0.08, 10]} />
        <meshStandardMaterial color="#a81820" roughness={0.7} />
      </mesh>
      {/* Side outlets */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.12, 0.28, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.05, 0.05, 0.08, 8]} />
          <meshStandardMaterial color="#a81820" roughness={0.7} />
        </mesh>
      ))}
      {/* Base */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.02, 12]} />
        <meshStandardMaterial color="#1a1410" roughness={0.9} />
      </mesh>
    </group>
  )
}

/* ── Municipal trash bin ──────────────────────────── */
function TrashBin() {
  return (
    <group>
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.45, 0.9, 0.32]} />
        <meshStandardMaterial color="#2a5a3a" roughness={0.75} />
      </mesh>
      {/* Top lid band */}
      <mesh position={[0, 0.92, 0]}>
        <boxGeometry args={[0.48, 0.05, 0.35]} />
        <meshStandardMaterial color="#3a3a38" roughness={0.7} />
      </mesh>
      {/* Slot */}
      <mesh position={[0, 0.78, 0.17]}>
        <boxGeometry args={[0.24, 0.06, 0.01]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      {/* Small label plate */}
      <mesh position={[0, 0.55, 0.17]}>
        <boxGeometry args={[0.22, 0.14, 0.01]} />
        <meshStandardMaterial color="#f0e6c8" roughness={0.75} />
      </mesh>
    </group>
  )
}
