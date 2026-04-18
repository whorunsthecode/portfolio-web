/**
 * HK 1980s signage — the vertical hangers, horizontal banners, and
 * rooftop billboards that made Central/Mong Kok instantly recognisable.
 *
 * Density: ~25 signs total along the 140m scrolling corridor. "Tasteful"
 * per user choice, not the maximalist-neon Mong Kok look. Primary
 * reference is pic 1 (daytime street with trams): dense but legible,
 * big vertical signs for restaurants (龍門大酒樓), horizontal ELGIN-style
 * rooftop ads, small shop signs at street level.
 *
 * All signs have mild emissive so they'll light up when night mode is
 * added later (PR C). At day the emissive is subtle; at night the
 * Lighting component will bump it to full glow.
 *
 * Sign text is rendered via <Text> from @react-three/drei so the Chinese
 * characters stay crisp at any zoom.
 */

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../store'

/* ── Shop vocabulary — authentic HK shop types ──────────────────── */
const SHOPS_CHINESE = [
  '大酒樓',    // big restaurant
  '茶餐廳',    // cha chaan teng
  '藥房',      // pharmacy
  '金行',      // goldsmith
  '銀行',      // bank
  '大押',      // pawnshop
  '涼茶',      // herbal tea
  '麵家',      // noodle shop
  '粥店',      // congee shop
  '餅店',      // bakery
  '當鋪',      // pawnshop
  '眼鏡',      // optician
  '理髮',      // barber
  '影樓',      // photo studio
  '辦館',      // provisions
  '麻雀',      // mahjong parlour
  '夜總會',    // nightclub
  '酒店',      // hotel
  '書局',      // bookshop
  '電器',      // electronics
]

const SHOPS_BILINGUAL = [
  { zh: '大酒樓', en: 'RESTAURANT' },
  { zh: '金行',   en: 'JEWELLERY' },
  { zh: '銀行',   en: 'BANK' },
  { zh: '酒店',   en: 'HOTEL' },
  { zh: '大押',   en: 'PAWN' },
  { zh: '電器',   en: 'ELECTRIC' },
]

// Classic HK sign palette — red dominant, gold accents, teal/blue for banks,
// green for pawnshops, yellow for hotels
const COLORS = [
  { bg: '#c82020', text: '#f8e060' },  // red / gold
  { bg: '#a81818', text: '#f4ead4' },  // deep red / cream
  { bg: '#f8b020', text: '#1a0a08' },  // orange / black (pawnshop style)
  { bg: '#2a4878', text: '#f8e060' },  // navy / gold (bank)
  { bg: '#2a6a3a', text: '#f8e060' },  // green / gold
  { bg: '#f4ead4', text: '#a81818' },  // cream / red
  { bg: '#1a1614', text: '#f4c430' },  // black / yellow
  { bg: '#8a2020', text: '#f4ead4' },  // wine / cream
]

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

/* ──────────────────────────────────────────────────────────────────
   Geometry conventions
   ──────────────────────────────────────────────────────────────────
   Buildings are centred at world x = ±9 with depth 7, so their
   road-facing FACADE sits at world x = ±5.5 (= ROAD_HALF in
   TenementRow). Signs mount on the facade and project OUTWARD across
   the road — this is the authentic 1980s look where massive vertical
   hangers jutted over tram tracks. Sign `projection` values below
   are "metres past the facade toward the road centre."
   ────────────────────────────────────────────────────────────────── */
const FACADE_X = 5.5

/* ──────────────────────────────────────────────────────────────────
   Sign 1: Vertical hanger — massive 龍門大酒樓-style plate that hangs
   off the facade, suspended by a black steel arm, 2-4 characters
   stacked vertically. Huge at night.
   ────────────────────────────────────────────────────────────────── */
function VerticalHanger({
  side,
  y,
  text,
  color,
  height = 3.2,
  width = 0.75,
}: {
  side: 1 | -1
  y: number
  text: string
  color: { bg: string; text: string }
  height?: number
  width?: number
}) {
  // How far past the facade the sign hangs. Big: ~2.4m over the road.
  const projection = 2.4
  const facadeX = side * FACADE_X
  const signX = side * (FACADE_X - projection) // out over the road
  const rotY = side === 1 ? -Math.PI / 2 : Math.PI / 2

  const chars = text.split('')

  return (
    <group>
      {/* Wall bracket anchoring the arm to the facade */}
      <mesh position={[facadeX - side * 0.05, y, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.3]} />
        <meshStandardMaterial color="#1a1a18" roughness={0.85} />
      </mesh>

      {/* Support arm — steel beam from facade to sign */}
      <mesh
        position={[side * (FACADE_X - projection / 2), y + height / 2 + 0.1, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.04, 0.04, projection, 8]} />
        <meshStandardMaterial color="#1a1a18" roughness={0.85} />
      </mesh>
      {/* Short vertical drop from arm to top of sign */}
      <mesh position={[signX, y + height / 2 + 0.05, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
        <meshStandardMaterial color="#1a1a18" roughness={0.85} />
      </mesh>

      {/* Sign frame — thick dark border box behind the face */}
      <mesh position={[signX, y, 0]} rotation={[0, rotY, 0]}>
        <boxGeometry args={[width + 0.1, height + 0.1, 0.1]} />
        <meshStandardMaterial color="#1a1410" roughness={0.8} />
      </mesh>

      {/* Sign face — emissive plane that lights up at night */}
      <mesh position={[signX + side * 0.055, y, 0]} rotation={[0, rotY, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={color.bg}
          emissive={color.bg}
          emissiveIntensity={0.18}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>

      {/* Halo behind the sign — only really visible at night because of the
          additive blending + emissive bump. Gives the neon-tube bleed look. */}
      <mesh position={[signX + side * 0.05, y, 0]} rotation={[0, rotY, 0]}>
        <planeGeometry args={[width * 1.8, height * 1.25]} />
        <meshBasicMaterial
          color={color.bg}
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Vertical stack of Chinese characters */}
      {chars.map((ch, i) => {
        const charSize = Math.min(width * 0.78, height / chars.length * 0.78)
        const charY = y + (height / 2) - (i + 0.5) * (height / chars.length)
        return (
          <Text
            key={i}
            position={[signX + side * 0.057, charY, 0]}
            rotation={[0, rotY, 0]}
            fontSize={charSize}
            color={color.text}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {ch}
          </Text>
        )
      })}
    </group>
  )
}

/* ──────────────────────────────────────────────────────────────────
   Sign 2: Horizontal banner — wide bilingual plate mounted just off
   the facade. Projects a short distance so it has visual depth.
   ────────────────────────────────────────────────────────────────── */
function HorizontalBanner({
  side,
  y,
  text,
  color,
  width = 3.2,
  height = 0.8,
}: {
  side: 1 | -1
  y: number
  text: { zh: string; en: string }
  color: { bg: string; text: string }
  width?: number
  height?: number
}) {
  // Banners project ~0.5m from the facade — less than vertical hangers
  // but enough to cast real shadow.
  const projection = 0.5
  const signX = side * (FACADE_X - projection)
  const rotY = side === 1 ? -Math.PI / 2 : Math.PI / 2

  return (
    <group>
      {/* Frame */}
      <mesh position={[signX, y, 0]} rotation={[0, rotY, 0]}>
        <boxGeometry args={[width + 0.08, height + 0.08, 0.12]} />
        <meshStandardMaterial color="#1a1410" roughness={0.8} />
      </mesh>
      {/* Face */}
      <mesh position={[signX + side * 0.07, y, 0]} rotation={[0, rotY, 0]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={color.bg}
          emissive={color.bg}
          emissiveIntensity={0.18}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>
      {/* Halo */}
      <mesh position={[signX + side * 0.065, y, 0]} rotation={[0, rotY, 0]}>
        <planeGeometry args={[width * 1.4, height * 1.6]} />
        <meshBasicMaterial
          color={color.bg}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Chinese text (larger, top) */}
      <Text
        position={[signX + side * 0.075, y + height * 0.2, 0]}
        rotation={[0, rotY, 0]}
        fontSize={height * 0.48}
        color={color.text}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.08}
      >
        {text.zh}
      </Text>
      {/* English text (smaller, bottom) */}
      <Text
        position={[signX + side * 0.075, y - height * 0.26, 0]}
        rotation={[0, rotY, 0]}
        fontSize={height * 0.24}
        color={color.text}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.15}
      >
        {text.en}
      </Text>
    </group>
  )
}

/* ──────────────────────────────────────────────────────────────────
   Sign 3: Rooftop billboard — bilingual board standing on the roof of
   a low-rise, facing the road. ELGIN-style.
   ────────────────────────────────────────────────────────────────── */
function RooftopBillboard({
  side,
  y,
  text,
  color,
  width = 4.2,
  height = 1.2,
}: {
  side: 1 | -1
  y: number
  text: { zh: string; en: string }
  color: { bg: string; text: string }
  width?: number
  height?: number
}) {
  // Sits on the road-facing edge of the roof and faces the road centre.
  const x = side * (FACADE_X + 0.3)
  const rotY = side === 1 ? -Math.PI / 2 : Math.PI / 2

  return (
    <group position={[x, y, 0]} rotation={[0, rotY, 0]}>
      {/* Support legs dropping from the board to the roof */}
      {[-width / 2 + 0.3, width / 2 - 0.3].map((lx, i) => (
        <mesh key={i} position={[lx, -height / 2 - 0.5, 0]}>
          <boxGeometry args={[0.12, 1.0, 0.12]} />
          <meshStandardMaterial color="#1a1410" roughness={0.85} />
        </mesh>
      ))}
      {/* Billboard frame */}
      <mesh>
        <boxGeometry args={[width + 0.08, height + 0.08, 0.08]} />
        <meshStandardMaterial color="#1a1410" roughness={0.8} />
      </mesh>
      {/* Face */}
      <mesh position={[0, 0, 0.055]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial
          color={color.bg}
          emissive={color.bg}
          emissiveIntensity={0.2}
          roughness={0.55}
          metalness={0.05}
        />
      </mesh>
      {/* Halo */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[width * 1.25, height * 1.6]} />
        <meshBasicMaterial
          color={color.bg}
          transparent
          opacity={0.32}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Chinese text */}
      <Text
        position={[0, height * 0.2, 0.06]}
        fontSize={height * 0.45}
        color={color.text}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.08}
      >
        {text.zh}
      </Text>
      {/* English text */}
      <Text
        position={[0, -height * 0.26, 0.06]}
        fontSize={height * 0.26}
        color={color.text}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.2}
      >
        {text.en}
      </Text>
    </group>
  )
}

/* ──────────────────────────────────────────────────────────────────
   Composite — distributed along the scrolling corridor
   ────────────────────────────────────────────────────────────────── */

type Sign =
  | {
      kind: 'vertical'
      z: number
      side: 1 | -1
      y: number
      text: string
      color: (typeof COLORS)[number]
      height?: number
      width?: number
    }
  | {
      kind: 'horizontal'
      z: number
      side: 1 | -1
      y: number
      text: { zh: string; en: string }
      color: (typeof COLORS)[number]
      width?: number
      height?: number
    }
  | {
      kind: 'rooftop'
      z: number
      side: 1 | -1
      y: number
      text: { zh: string; en: string }
      color: (typeof COLORS)[number]
      width?: number
      height?: number
    }

function buildSigns(): Sign[] {
  const r = seededRandom(5309)
  const signs: Sign[] = []

  // Distribute along z=-5 to z=-135 with gaps. Target ~25 signs.
  const positions: number[] = []
  let z = -5
  while (z > -135) {
    positions.push(z)
    z -= 4 + r() * 3   // 4-7m spacing
  }

  for (const zp of positions) {
    const side: 1 | -1 = r() < 0.5 ? 1 : -1
    const kind = r()
    const colorIdx = Math.floor(r() * COLORS.length)
    const color = COLORS[colorIdx]

    if (kind < 0.55) {
      // Vertical hanger — most common
      const chars = SHOPS_CHINESE[Math.floor(r() * SHOPS_CHINESE.length)]
      // Taller for longer text
      const height = 1.4 + (chars.length - 2) * 0.35 + r() * 0.3
      signs.push({
        kind: 'vertical',
        z: zp,
        side,
        y: 4 + r() * 3,
        text: chars,
        color,
        height,
        width: 0.45 + r() * 0.15,
      })
    } else if (kind < 0.85) {
      // Horizontal banner
      const pair = SHOPS_BILINGUAL[Math.floor(r() * SHOPS_BILINGUAL.length)]
      signs.push({
        kind: 'horizontal',
        z: zp,
        side,
        y: 3.5 + r() * 4,
        text: pair,
        color,
        width: 2.2 + r() * 1.0,
        height: 0.5 + r() * 0.2,
      })
    } else {
      // Rooftop billboard — rarer, higher
      const pair = SHOPS_BILINGUAL[Math.floor(r() * SHOPS_BILINGUAL.length)]
      signs.push({
        kind: 'rooftop',
        z: zp,
        side,
        y: 8.5 + r() * 2,
        text: pair,
        color,
        width: 3.0 + r() * 0.8,
        height: 0.7 + r() * 0.2,
      })
    }
  }
  return signs
}

const SCROLL_SPEED = 6
const ROUTE_LENGTH = 140
const RESET_THRESHOLD = 15

// Emissive intensity base (day) and night ceiling. At night we push the
// sign faces hard so they genuinely read as lit neon boards from across
// the street, not dim painted plates.
const DAY_EMISSIVE = 0.18
const NIGHT_EMISSIVE = 3.2
// The additive-blended halo planes behind each sign face. Near-invisible
// during the day so signs look like painted boards; at night they bloom
// into the neon-tube bleed you see in 1980s HK photos.
const DAY_HALO_OPACITY = 0.04
const NIGHT_HALO_OPACITY = 0.7
const EMISSIVE_LERP_SPEED = 3

export function HKSigns() {
  const groupRef = useRef<THREE.Group>(null)
  const signs = useMemo(() => buildSigns(), [])
  const offsets = useRef(signs.map((s) => s.z))
  const mode = useStore((s) => s.mode)
  const blend = useRef(mode === 'night' ? 1 : 0)

  useFrame((_, delta) => {
    if (!groupRef.current) return

    // Lerp the day/night blend
    const target = mode === 'night' ? 1 : 0
    const diff = target - blend.current
    if (Math.abs(diff) > 0.001) {
      blend.current += diff * Math.min(EMISSIVE_LERP_SPEED * delta * 3, 1)
    } else {
      blend.current = target
    }
    const emissiveIntensity = THREE.MathUtils.lerp(
      DAY_EMISSIVE,
      NIGHT_EMISSIVE,
      blend.current,
    )
    const haloOpacity = THREE.MathUtils.lerp(
      DAY_HALO_OPACITY,
      NIGHT_HALO_OPACITY,
      blend.current,
    )

    const children = groupRef.current.children
    for (let i = 0; i < children.length; i++) {
      // Scroll each sign
      offsets.current[i] += SCROLL_SPEED * delta
      if (offsets.current[i] > RESET_THRESHOLD) {
        offsets.current[i] -= ROUTE_LENGTH
      }
      children[i].position.z = offsets.current[i]

      // Walk descendants: bump emissive on the lit face planes, and scale
      // opacity on the additive halo planes behind them.
      children[i].traverse((obj) => {
        if (!(obj as THREE.Mesh).isMesh) return
        const mesh = obj as THREE.Mesh
        const mat = mesh.material as
          | THREE.MeshStandardMaterial
          | THREE.MeshBasicMaterial
        if (!mat) return

        // MeshBasicMaterial with AdditiveBlending → it's a halo plane.
        if (
          (mat as THREE.MeshBasicMaterial).isMeshBasicMaterial &&
          (mat as THREE.MeshBasicMaterial).blending === THREE.AdditiveBlending
        ) {
          ;(mat as THREE.MeshBasicMaterial).opacity = haloOpacity
          return
        }

        // MeshStandardMaterial with coloured emissive → it's a sign face.
        const std = mat as THREE.MeshStandardMaterial
        if (std.emissive && std.emissiveIntensity !== undefined) {
          if (
            std.emissive.r > 0.05 ||
            std.emissive.g > 0.05 ||
            std.emissive.b > 0.05
          ) {
            std.emissiveIntensity = emissiveIntensity
          }
        }
      })
    }
  })

  return (
    <group ref={groupRef}>
      {signs.map((s, i) => (
        <group key={i} position={[0, 0, s.z]}>
          {s.kind === 'vertical' && (
            <VerticalHanger
              side={s.side}
              y={s.y}
              text={s.text}
              color={s.color}
              height={s.height}
              width={s.width}
            />
          )}
          {s.kind === 'horizontal' && (
            <HorizontalBanner
              side={s.side}
              y={s.y}
              text={s.text}
              color={s.color}
              width={s.width}
              height={s.height}
            />
          )}
          {s.kind === 'rooftop' && (
            <RooftopBillboard
              side={s.side}
              y={s.y}
              text={s.text}
              color={s.color}
              width={s.width}
              height={s.height}
            />
          )}
        </group>
      ))}
    </group>
  )
}
