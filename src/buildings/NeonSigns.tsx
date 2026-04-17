/**
 * Neon signs — the defining visual of 1980s Hong Kong Central / Sheung Wan.
 *
 * Signs project OUT from building facades over the street (horizontal
 * cantilevered boards) and hang down vertically. Chinese characters in
 * bright emissive colors against a dark back panel. Subtle flicker animation.
 *
 * Positions are distributed along the scrolling corridor (z=-5 to z=-135)
 * at heights above the ground-floor shops (~y=4 to y=10).
 */

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { makeTextTexture } from '../cabin/TextTexture'

// Iconic shop/business types for neon signs. Each has character + hue.
const NEON_DEFS = [
  { text: '金行', color: '#ffc040', bg: '#2a1810' },       // goldsmith
  { text: '藥房', color: '#ff3a3a', bg: '#1a0a0a' },       // pharmacy
  { text: '酒家', color: '#ff8030', bg: '#1a0a0a' },       // restaurant
  { text: '茶樓', color: '#ffd060', bg: '#2a1810' },       // tea house
  { text: '銀行', color: '#30b8ff', bg: '#0a1020' },       // bank
  { text: '餐廳', color: '#ff4090', bg: '#1a0a14' },       // diner
  { text: '影樓', color: '#b040ff', bg: '#14081a' },       // photo studio
  { text: '當鋪', color: '#ffa030', bg: '#1a1008' },       // pawnshop
  { text: '麻雀', color: '#40ff60', bg: '#081a0a' },       // mahjong parlour
  { text: '夜總會', color: '#ff4040', bg: '#14060a' },     // nightclub
  { text: '理髮', color: '#ff80c0', bg: '#1a0a14' },       // barbershop
  { text: '酒店', color: '#ffff80', bg: '#1a1a0a' },       // hotel
]

// Seed random for stable placement
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

interface NeonSign {
  id: number
  z: number
  y: number
  side: 1 | -1          // -1 = left building, +1 = right building
  orientation: 'horizontal' | 'vertical'
  defIdx: number
  width: number
  height: number
  projection: number    // how far out from building face (into street)
  flickerSeed: number
}

function buildSigns(): NeonSign[] {
  const r = seededRandom(7919)
  const signs: NeonSign[] = []
  let id = 0
  // Signs every ~8-14m along the scrolling corridor
  let z = -5
  while (z > -135) {
    const side: 1 | -1 = r() < 0.5 ? 1 : -1
    const orientation: 'horizontal' | 'vertical' = r() < 0.55 ? 'horizontal' : 'vertical'
    const defIdx = Math.floor(r() * NEON_DEFS.length)
    const y = 3.5 + r() * 5.5  // above shopfront, below roofline

    signs.push({
      id: id++,
      z,
      y,
      side,
      orientation,
      defIdx,
      width: orientation === 'horizontal' ? 1.8 + r() * 1.4 : 0.55 + r() * 0.25,
      height: orientation === 'horizontal' ? 0.55 + r() * 0.25 : 1.8 + r() * 1.2,
      projection: 0.6 + r() * 0.5,
      flickerSeed: r() * 100,
    })
    z -= 7 + r() * 7
  }
  return signs
}

const SIGNS = buildSigns()
const SCROLL_SPEED = 6
const ROUTE_LENGTH = 140
const RESET_THRESHOLD = 15

export function NeonSigns() {
  const groupRef = useRef<THREE.Group>(null)
  const offsets = useRef(SIGNS.map((s) => s.z))

  // Precompute texture per sign
  const signsWithTex = useMemo(
    () =>
      SIGNS.map((s) => {
        const def = NEON_DEFS[s.defIdx]
        const tex = makeTextTexture({
          text: def.text,
          fontSize: s.orientation === 'horizontal' ? 96 : 72,
          color: def.color,
          background: def.bg,
          width: s.orientation === 'horizontal' ? 384 : 128,
          height: s.orientation === 'horizontal' ? 128 : 384,
        })
        return { ...s, tex, def }
      }),
    [],
  )

  // Flicker + scroll
  useFrame((state, delta) => {
    if (!groupRef.current) return
    const t = state.clock.elapsedTime
    const children = groupRef.current.children
    for (let i = 0; i < children.length; i++) {
      offsets.current[i] += SCROLL_SPEED * delta
      if (offsets.current[i] > RESET_THRESHOLD) {
        offsets.current[i] -= ROUTE_LENGTH
      }
      const child = children[i] as THREE.Group
      child.position.z = offsets.current[i]

      // Subtle flicker — occasional dips in emissive intensity
      const s = signsWithTex[i]
      const flickerT = t * 1.7 + s.flickerSeed
      const noise = Math.sin(flickerT) * Math.sin(flickerT * 3.1 + 1.2)
      const flicker = 0.8 + 0.2 * noise + (Math.sin(t * 11 + s.flickerSeed) > 0.98 ? -0.4 : 0)
      const plane = child.children[1] as THREE.Mesh | undefined
      if (plane) {
        const mat = plane.material as THREE.MeshStandardMaterial
        mat.emissiveIntensity = Math.max(0.2, flicker)
      }
    }
  })

  return (
    <group ref={groupRef}>
      {signsWithTex.map((s) => {
        const buildingX = s.side * 9  // buildings start at x=±9
        const outwardX = s.side * (9 - s.projection)  // sign is between building and road
        const rotY = s.side === 1 ? -Math.PI / 2 : Math.PI / 2

        return (
          <group key={s.id} position={[0, 0, s.z]}>
            {/* Support arm — small bracket from building to sign */}
            <mesh
              position={[s.side * (9 - s.projection / 2), s.y, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.03, 0.03, s.projection, 8]} />
              <meshStandardMaterial color="#1a1a18" roughness={0.85} />
            </mesh>

            {/* Main sign face — double-sided so it reads from inside the tram */}
            <mesh
              position={[outwardX, s.y, 0]}
              rotation={[0, rotY, 0]}
            >
              <planeGeometry args={[s.width, s.height]} />
              <meshStandardMaterial
                map={s.tex}
                emissive={new THREE.Color(s.def.color)}
                emissiveMap={s.tex}
                emissiveIntensity={0.9}
                toneMapped={false}
                side={THREE.DoubleSide}
              />
            </mesh>

            {/* Back-face dark panel (so it's not transparent from behind) */}
            <mesh
              position={[buildingX + s.side * -0.005, s.y, 0]}
              rotation={[0, rotY, 0]}
            >
              <planeGeometry args={[s.width + 0.05, s.height + 0.05]} />
              <meshStandardMaterial color={s.def.bg} side={THREE.FrontSide} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
