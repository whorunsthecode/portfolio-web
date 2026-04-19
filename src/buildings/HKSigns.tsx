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
import { InfoTag } from '../scene/components/InfoTag'

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

// Restrained neon palette — real 80s HK signs were a DARK board with thin
// glowing tube outlines and glowing character strokes, not solid coloured
// lightboxes. `border` = the tube rectangle around the sign edge, `text` =
// the character strokes. Kept to six combos so the street doesn't turn
// into Mong Kok chaos.
const COLORS = [
  { border: '#ff3040', text: '#ffd850' }, // red tube / yellow chars — classic
  { border: '#ff6020', text: '#ffe8b0' }, // amber / cream
  { border: '#ffcc20', text: '#ff3848' }, // yellow / red
  { border: '#28dcc0', text: '#ffffff' }, // teal / white
  { border: '#48c850', text: '#ffe850' }, // lime / yellow
  { border: '#5088ff', text: '#ffe850' }, // cobalt / yellow
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
   the road — authentic 1980s look.

   Rendering model for each sign (see refs):
     1. Dark board — matte black backing, no emissive, absorbs glare
     2. NeonTube border — thin glowing cylinders tracing the edge
     3. Glowing character strokes — drei <Text> with a custom
        meshStandardMaterial whose emissiveIntensity is lerped at
        night by the top-level useFrame
     4. Additive halo plane — soft bleed behind the sign, near-zero
        opacity during the day, bright at night

   The emissive lerp in useFrame finds any mesh whose emissive colour
   is > 0.05 (so board stays dark) and bumps intensity up at night.
   ────────────────────────────────────────────────────────────────── */
const FACADE_X = 5.5
const BOARD_DARK = '#0b0b0a'
const TUBE_RADIUS = 0.025

/** Rectangle outline of thin glowing cylinders — the neon-tube border
 *  that's the iconic part of every HK sign. Rendered in local XY space
 *  at z = 0, suitable to sit inside a rotated parent group. */
function NeonTube({
  width,
  height,
  color,
}: {
  width: number
  height: number
  color: string
}) {
  const halfW = width / 2
  const halfH = height / 2
  const segments: Array<{
    pos: [number, number, number]
    rot: [number, number, number]
    len: number
  }> = [
    // Top
    { pos: [0, halfH, 0], rot: [0, 0, Math.PI / 2], len: width },
    // Bottom
    { pos: [0, -halfH, 0], rot: [0, 0, Math.PI / 2], len: width },
    // Left
    { pos: [-halfW, 0, 0], rot: [0, 0, 0], len: height },
    // Right
    { pos: [halfW, 0, 0], rot: [0, 0, 0], len: height },
  ]
  return (
    <group>
      {segments.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={s.rot}>
          <cylinderGeometry args={[TUBE_RADIUS, TUBE_RADIUS, s.len, 10]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.3}
            roughness={0.3}
            metalness={0.1}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/** Neon character. drei Text with a child meshStandardMaterial so the
 *  character strokes themselves glow and pick up the day/night lerp. */
function NeonText({
  children,
  color,
  fontSize,
  position,
  letterSpacing,
}: {
  children: string
  color: string
  fontSize: number
  position: [number, number, number]
  letterSpacing?: number
}) {
  return (
    <Text
      position={position}
      fontSize={fontSize}
      anchorX="center"
      anchorY="middle"
      fontWeight="bold"
      letterSpacing={letterSpacing}
    >
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.3}
        roughness={0.3}
        metalness={0}
        toneMapped={false}
      />
      {children}
    </Text>
  )
}

/* ──────────────────────────────────────────────────────────────────
   Sign 1: Vertical hanger — tall plate suspended from the facade,
   stacked characters glowing in neon tube strokes.
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
  color: { border: string; text: string }
  height?: number
  width?: number
}) {
  const projection = 2.4
  const facadeX = side * FACADE_X
  const signX = side * (FACADE_X - projection)
  const rotY = side === 1 ? -Math.PI / 2 : Math.PI / 2

  const chars = text.split('')

  return (
    <group>
      {/* Wall bracket + support arm + drop pin — kept outside the
          rotated group because they live in world-X space. */}
      <mesh position={[facadeX - side * 0.05, y, 0]}>
        <boxGeometry args={[0.1, 0.3, 0.3]} />
        <meshStandardMaterial color="#1a1a18" roughness={0.85} />
      </mesh>
      <mesh
        position={[side * (FACADE_X - projection / 2), y + height / 2 + 0.1, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.04, 0.04, projection, 8]} />
        <meshStandardMaterial color="#1a1a18" roughness={0.85} />
      </mesh>
      <mesh position={[signX, y + height / 2 + 0.05, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
        <meshStandardMaterial color="#1a1a18" roughness={0.85} />
      </mesh>

      {/* Rotated sign body — dark board, tube border, glowing chars */}
      <group position={[signX, y, 0]} rotation={[0, rotY, 0]}>
        {/* Dark board — absorbs scene lighting, no emissive */}
        <mesh>
          <boxGeometry args={[width, height, 0.1]} />
          <meshStandardMaterial color={BOARD_DARK} roughness={0.9} />
        </mesh>

        {/* Neon tube border (on the road-facing side) */}
        <group position={[0, 0, 0.055]}>
          <NeonTube width={width * 0.92} height={height * 0.96} color={color.border} />
        </group>

        {/* Halo bleed behind the board — almost invisible by day */}
        <mesh position={[0, 0, -0.06]}>
          <planeGeometry args={[width * 2.2, height * 1.25]} />
          <meshBasicMaterial
            color={color.border}
            transparent
            opacity={0.04}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* Stacked glowing characters */}
        {chars.map((ch, i) => {
          const charSize = Math.min(width * 0.72, height / chars.length * 0.72)
          const charY = (height / 2) - (i + 0.5) * (height / chars.length)
          return (
            <NeonText
              key={i}
              color={color.text}
              fontSize={charSize}
              position={[0, charY, 0.07]}
            >
              {ch}
            </NeonText>
          )
        })}
      </group>
    </group>
  )
}

/* ──────────────────────────────────────────────────────────────────
   Sign 2: Horizontal banner — wide bilingual plate near ground level,
   short projection, dark board + tube border + glowing chars.
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
  color: { border: string; text: string }
  width?: number
  height?: number
}) {
  const projection = 0.5
  const signX = side * (FACADE_X - projection)
  const rotY = side === 1 ? -Math.PI / 2 : Math.PI / 2

  return (
    <group position={[signX, y, 0]} rotation={[0, rotY, 0]}>
      <mesh>
        <boxGeometry args={[width, height, 0.12]} />
        <meshStandardMaterial color={BOARD_DARK} roughness={0.9} />
      </mesh>

      <group position={[0, 0, 0.065]}>
        <NeonTube width={width * 0.95} height={height * 0.88} color={color.border} />
      </group>

      {/* Halo */}
      <mesh position={[0, 0, -0.07]}>
        <planeGeometry args={[width * 1.6, height * 1.8]} />
        <meshBasicMaterial
          color={color.border}
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <NeonText
        color={color.text}
        fontSize={height * 0.46}
        position={[0, height * 0.2, 0.08]}
        letterSpacing={0.08}
      >
        {text.zh}
      </NeonText>
      <NeonText
        color={color.text}
        fontSize={height * 0.22}
        position={[0, -height * 0.26, 0.08]}
        letterSpacing={0.18}
      >
        {text.en}
      </NeonText>
    </group>
  )
}

/* ──────────────────────────────────────────────────────────────────
   Sign 3: Rooftop billboard — wider neon board standing on a low-rise
   roof, supported by two legs. Visible from further down the route.
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
  color: { border: string; text: string }
  width?: number
  height?: number
}) {
  const x = side * (FACADE_X + 0.3)
  const rotY = side === 1 ? -Math.PI / 2 : Math.PI / 2

  return (
    <group position={[x, y, 0]} rotation={[0, rotY, 0]}>
      {/* Support legs */}
      {[-width / 2 + 0.3, width / 2 - 0.3].map((lx, i) => (
        <mesh key={i} position={[lx, -height / 2 - 0.5, 0]}>
          <boxGeometry args={[0.12, 1.0, 0.12]} />
          <meshStandardMaterial color="#1a1410" roughness={0.85} />
        </mesh>
      ))}

      {/* Dark board */}
      <mesh>
        <boxGeometry args={[width, height, 0.1]} />
        <meshStandardMaterial color={BOARD_DARK} roughness={0.9} />
      </mesh>

      <group position={[0, 0, 0.055]}>
        <NeonTube width={width * 0.96} height={height * 0.9} color={color.border} />
      </group>

      {/* Halo */}
      <mesh position={[0, 0, -0.06]}>
        <planeGeometry args={[width * 1.35, height * 1.8]} />
        <meshBasicMaterial
          color={color.border}
          transparent
          opacity={0.04}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <NeonText
        color={color.text}
        fontSize={height * 0.44}
        position={[0, height * 0.2, 0.07]}
        letterSpacing={0.08}
      >
        {text.zh}
      </NeonText>
      <NeonText
        color={color.text}
        fontSize={height * 0.24}
        position={[0, -height * 0.26, 0.07]}
        letterSpacing={0.2}
      >
        {text.en}
      </NeonText>
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
    <group>
      {/* Inner group holds the scrolling children; the scroll loop in
          useFrame iterates its `.children` by index, so non-sign children
          must live in the outer group as siblings. */}
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
      <InfoTag label="Neon signs · disappearing craft" offset={[-6, 11, -4]} />
    </group>
  )
}
