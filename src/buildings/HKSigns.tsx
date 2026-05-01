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

   Orientation: the FLAT FACE of the sign points ALONG the street
   (+Z, toward the approaching driver) — matches real 1980s HK
   signage where signs project out from the facade perpendicular to
   the wall so passers-by walking the sidewalk see them head-on as
   they approach. Previously signs were rotated 90° and only legible
   when the tram was directly adjacent.
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

  const chars = text.split('')

  return (
    <group>
      {/* Wall bracket + support arm + drop pin — kept outside the
          sign body so they live in world-X space. */}
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

      {/* Sign body — face normal = +Z (toward the driver approaching
          from further down the street). No Y-rotation. */}
      <group position={[signX, y, 0]}>
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

  return (
    <group position={[signX, y, 0]}>
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

  return (
    <group position={[x, y, 0]}>
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
   Sign 4: Pawnshop (大押) — the iconic calabash / gourd-shaped HK
   pawnshop sign. Two stacked discs on a red board: smaller top disc
   with the shop-name characters, larger bottom disc with a single
   大 / 押 character. Yellow-neon ring borders on both discs (the
   tube border that made them glow at night), white-neon strokes on
   the characters themselves. Mounted perpendicular to the facade,
   face pointing +Z so the approaching driver sees it head-on.
   ────────────────────────────────────────────────────────────────── */
function PawnshopSign({
  side,
  y,
  shopName = '昌和',
  borderColor = '#ffcc20',
  bgColor = '#c82820',
  textColor = '#fafaf0',
}: {
  side: 1 | -1
  y: number
  shopName?: string
  borderColor?: string
  bgColor?: string
  textColor?: string
}) {
  const projection = 2.4
  const facadeX = side * FACADE_X
  const signX = side * (FACADE_X - projection)
  const topR = 0.55
  const botR = 0.7
  // Stack the two discs with a small overlap to form the gourd silhouette
  const topY = botR * 0.8
  const botY = -topR * 0.25
  const totalTop = topY + topR
  const shopChars = shopName.split('')

  return (
    <group>
      {/* Wall bracket + horizontal arm + drop pin — matches VerticalHanger. */}
      <mesh position={[facadeX - side * 0.05, y + 0.2, 0]}>
        <boxGeometry args={[0.1, 0.35, 0.32]} />
        <meshStandardMaterial color="#1a1a18" roughness={0.85} />
      </mesh>
      <mesh
        position={[side * (FACADE_X - projection / 2), y + totalTop + 0.25, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.045, 0.045, projection, 8]} />
        <meshStandardMaterial color="#1a1a18" roughness={0.85} />
      </mesh>
      <mesh position={[signX, y + totalTop + 0.1, 0]}>
        <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
        <meshStandardMaterial color="#1a1a18" roughness={0.85} />
      </mesh>

      {/* Sign body — face normal +Z, toward driver. */}
      <group position={[signX, y, 0]}>
        {/* TOP disc — dark backer, red board, yellow neon ring, name */}
        <group position={[0, topY, 0]}>
          {/* Dark backing (keeps the board reading as a solid shape at dusk) */}
          <mesh position={[0, 0, -0.02]}>
            <circleGeometry args={[topR + 0.03, 28]} />
            <meshStandardMaterial color={BOARD_DARK} roughness={0.9} />
          </mesh>
          {/* Red painted disc face */}
          <mesh>
            <circleGeometry args={[topR, 28]} />
            <meshStandardMaterial
              color={bgColor}
              emissive={bgColor}
              emissiveIntensity={0.25}
              roughness={0.8}
              toneMapped={false}
            />
          </mesh>
          {/* Yellow neon-tube ring */}
          <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[topR - 0.04, TUBE_RADIUS, 10, 36]} />
            <meshStandardMaterial
              color={borderColor}
              emissive={borderColor}
              emissiveIntensity={0.3}
              roughness={0.3}
              metalness={0.1}
              toneMapped={false}
            />
          </mesh>
          {/* Halo bleed behind */}
          <mesh position={[0, 0, -0.06]}>
            <planeGeometry args={[topR * 2.4, topR * 2.4]} />
            <meshBasicMaterial
              color={borderColor}
              transparent
              opacity={0.04}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          {/* Shop-name characters — side-by-side white-neon */}
          {shopChars.map((ch, i) => {
            const n = shopChars.length
            const slot = (topR * 1.2) / n
            const cx = (i - (n - 1) / 2) * slot
            return (
              <NeonText
                key={i}
                color={textColor}
                fontSize={topR * 0.82}
                position={[cx, 0, 0.05]}
              >
                {ch}
              </NeonText>
            )
          })}
        </group>

        {/* BOTTOM disc — 押 character */}
        <group position={[0, botY, 0]}>
          <mesh position={[0, 0, -0.02]}>
            <circleGeometry args={[botR + 0.03, 32]} />
            <meshStandardMaterial color={BOARD_DARK} roughness={0.9} />
          </mesh>
          <mesh>
            <circleGeometry args={[botR, 32]} />
            <meshStandardMaterial
              color={bgColor}
              emissive={bgColor}
              emissiveIntensity={0.25}
              roughness={0.8}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[botR - 0.05, TUBE_RADIUS, 10, 40]} />
            <meshStandardMaterial
              color={borderColor}
              emissive={borderColor}
              emissiveIntensity={0.3}
              roughness={0.3}
              metalness={0.1}
              toneMapped={false}
            />
          </mesh>
          <mesh position={[0, 0, -0.06]}>
            <planeGeometry args={[botR * 2.6, botR * 2.6]} />
            <meshBasicMaterial
              color={borderColor}
              transparent
              opacity={0.04}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
          <NeonText
            color={textColor}
            fontSize={botR * 1.4}
            position={[0, 0, 0.05]}
          >
            押
          </NeonText>
        </group>
      </group>
    </group>
  )
}

/* ──────────────────────────────────────────────────────────────────
   Sign 5: Mahjong parlour (麻雀館) — big bold street-level sign.
   Red board with huge green/yellow 麻雀 characters stacked vertical,
   flanked by a tiny white 中 (red-dragon winning tile) motif at the
   bottom. The 麻雀館 was a ubiquitous 1980s HK shop; these signs
   were noticeably larger and louder than the neighbours to draw
   punters off the street. Face normal +Z, driver-facing.
   ────────────────────────────────────────────────────────────────── */
function MahjongSign({
  side,
  y,
}: {
  side: 1 | -1
  y: number
}) {
  const projection = 2.4
  const facadeX = side * FACADE_X
  const signX = side * (FACADE_X - projection)
  const width = 1.1
  const height = 2.8
  // Two-character 麻雀 dominant green-on-red palette (the other common
  // local palette is red-on-yellow; picked green because it reads
  // cleanest against our warm street lighting).
  const borderColor = '#ffd850'     // yellow tube border
  const bgColor = '#b01818'         // deep red board
  const charColor = '#6eeac0'       // green neon chars (麻雀)

  return (
    <group>
      {/* Wall bracket + horizontal arm + drop pin */}
      <mesh position={[facadeX - side * 0.05, y, 0]}>
        <boxGeometry args={[0.1, 0.4, 0.34]} />
        <meshStandardMaterial color="#1a1a18" roughness={0.85} />
      </mesh>
      <mesh
        position={[side * (FACADE_X - projection / 2), y + height / 2 + 0.1, 0]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.05, 0.05, projection, 8]} />
        <meshStandardMaterial color="#1a1a18" roughness={0.85} />
      </mesh>
      <mesh position={[signX, y + height / 2 + 0.05, 0]}>
        <cylinderGeometry args={[0.032, 0.032, 0.2, 8]} />
        <meshStandardMaterial color="#1a1a18" roughness={0.85} />
      </mesh>

      <group position={[signX, y, 0]}>
        {/* Dark backing */}
        <mesh position={[0, 0, -0.02]}>
          <boxGeometry args={[width + 0.08, height + 0.08, 0.04]} />
          <meshStandardMaterial color={BOARD_DARK} roughness={0.9} />
        </mesh>
        {/* Red painted board face — mildly emissive so the red reads
            as a lit panel, not flat paint */}
        <mesh>
          <boxGeometry args={[width, height, 0.1]} />
          <meshStandardMaterial
            color={bgColor}
            emissive={bgColor}
            emissiveIntensity={0.2}
            roughness={0.8}
            toneMapped={false}
          />
        </mesh>
        {/* Yellow neon tube border (inset) */}
        <group position={[0, 0, 0.055]}>
          <NeonTube width={width * 0.92} height={height * 0.96} color={borderColor} />
        </group>
        {/* Halo bleed — day near-zero, night bright */}
        <mesh position={[0, 0, -0.06]}>
          <planeGeometry args={[width * 2.6, height * 1.35]} />
          <meshBasicMaterial
            color={borderColor}
            transparent
            opacity={0.04}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* 麻 — top character, huge green-neon stroke */}
        <NeonText
          color={charColor}
          fontSize={width * 0.8}
          position={[0, height * 0.27, 0.08]}
        >
          麻
        </NeonText>
        {/* 雀 — middle character */}
        <NeonText
          color={charColor}
          fontSize={width * 0.8}
          position={[0, -height * 0.02, 0.08]}
        >
          雀
        </NeonText>

        {/* 中 winning-tile motif — small cream tile with red 中 at the
            bottom of the board. Distinctive mahjong shorthand. */}
        <group position={[0, -height * 0.37, 0.065]}>
          {/* Tile face */}
          <mesh>
            <boxGeometry args={[width * 0.48, width * 0.64, 0.02]} />
            <meshStandardMaterial color="#f4ead0" roughness={0.55} metalness={0.1} />
          </mesh>
          {/* Tile bevel edge — a slightly brighter rim */}
          <mesh position={[0, 0, 0.001]}>
            <boxGeometry args={[width * 0.46, width * 0.62, 0.022]} />
            <meshStandardMaterial color="#fafaf0" roughness={0.45} metalness={0.15} />
          </mesh>
          {/* Red 中 character (not neon — painted on porcelain) */}
          <Text
            position={[0, 0, 0.014]}
            fontSize={width * 0.42}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            <meshStandardMaterial color="#c81818" roughness={0.55} metalness={0} />
            中
          </Text>
        </group>
      </group>
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
  | {
      kind: 'pawnshop'
      z: number
      side: 1 | -1
      y: number
      shopName: string
    }
  | {
      kind: 'mahjong'
      z: number
      side: 1 | -1
      y: number
    }

const PAWN_SHOP_NAMES = ['昌和', '永和', '福泰', '同泰', '榮昌', '德榮']

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

  // Guarantee at least 2 pawnshop signs — stream them in at dedicated
  // positions rather than leaving their appearance to chance.
  const pawnshopSlots = new Set<number>()
  if (positions.length >= 3) pawnshopSlots.add(Math.floor(positions.length * 0.2))
  if (positions.length >= 10) pawnshopSlots.add(Math.floor(positions.length * 0.65))

  // Same for mahjong parlour signs — anchored to fixed slots so the
  // punter always catches one within the first third of the route.
  const mahjongSlots = new Set<number>()
  if (positions.length >= 3) mahjongSlots.add(Math.floor(positions.length * 0.12))
  if (positions.length >= 10) mahjongSlots.add(Math.floor(positions.length * 0.48))
  if (positions.length >= 20) mahjongSlots.add(Math.floor(positions.length * 0.82))

  positions.forEach((zp, idx) => {
    const side: 1 | -1 = r() < 0.5 ? 1 : -1
    const kind = r()
    const colorIdx = Math.floor(r() * COLORS.length)
    const color = COLORS[colorIdx]

    if (pawnshopSlots.has(idx)) {
      const name = PAWN_SHOP_NAMES[Math.floor(r() * PAWN_SHOP_NAMES.length)]
      signs.push({
        kind: 'pawnshop',
        z: zp,
        side,
        y: 4.2 + r() * 1.8,
        shopName: name,
      })
      return
    }

    if (mahjongSlots.has(idx)) {
      signs.push({
        kind: 'mahjong',
        z: zp,
        side,
        y: 4.5 + r() * 1.6,
      })
      return
    }

    if (kind < 0.5) {
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
    } else if (kind < 0.78) {
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
    } else if (kind < 0.92) {
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
    } else {
      // Pawnshop (大押) gourd sign — occasional
      const name = PAWN_SHOP_NAMES[Math.floor(r() * PAWN_SHOP_NAMES.length)]
      signs.push({
        kind: 'pawnshop',
        z: zp,
        side,
        y: 4.2 + r() * 1.8,
        shopName: name,
      })
    }
  })
  return signs
}

const SCROLL_SPEED = 4
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

interface SignMatCache {
  halos: THREE.MeshBasicMaterial[]
  emissives: THREE.MeshStandardMaterial[]
}

export function HKSigns() {
  const groupRef = useRef<THREE.Group>(null)
  const signs = useMemo(() => buildSigns(), [])
  const offsets = useRef(signs.map((s) => s.z))
  const mode = useStore((s) => s.mode)
  const blend = useRef(mode === 'night' ? 1 : 0)
  // Per-sign material caches. We traverse each sign subtree once the
  // first time it's mounted, collect pointers to the halo / emissive
  // materials, and thereafter update them directly — avoids walking
  // every sign's ~4–10 descendants every frame at 60fps (which the
  // mobile profile flagged as a top CPU cost).
  const matCache = useRef<SignMatCache[]>([])
  const cacheBuilt = useRef(false)

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

    // Build the cache on the first frame the group has its children
    // mounted. All subsequent frames read from the cache.
    if (!cacheBuilt.current && children.length === signs.length) {
      matCache.current = children.map((child) => {
        const halos: THREE.MeshBasicMaterial[] = []
        const emissives: THREE.MeshStandardMaterial[] = []
        child.traverse((obj) => {
          if (!(obj as THREE.Mesh).isMesh) return
          const mat = (obj as THREE.Mesh).material as
            | THREE.MeshStandardMaterial
            | THREE.MeshBasicMaterial
            | undefined
          if (!mat) return
          if (
            (mat as THREE.MeshBasicMaterial).isMeshBasicMaterial &&
            (mat as THREE.MeshBasicMaterial).blending === THREE.AdditiveBlending
          ) {
            halos.push(mat as THREE.MeshBasicMaterial)
            return
          }
          const std = mat as THREE.MeshStandardMaterial
          if (
            std.emissive &&
            std.emissiveIntensity !== undefined &&
            (std.emissive.r > 0.05 ||
              std.emissive.g > 0.05 ||
              std.emissive.b > 0.05)
          ) {
            emissives.push(std)
          }
        })
        return { halos, emissives }
      })
      cacheBuilt.current = true
    }

    for (let i = 0; i < children.length; i++) {
      // Scroll each sign
      offsets.current[i] += SCROLL_SPEED * delta
      if (offsets.current[i] > RESET_THRESHOLD) {
        offsets.current[i] -= ROUTE_LENGTH
      }
      children[i].position.z = offsets.current[i]

      // Fast path via the cache — no traverse().
      const cached = matCache.current[i]
      if (!cached) continue
      const halos = cached.halos
      for (let h = 0; h < halos.length; h++) halos[h].opacity = haloOpacity
      const emissives = cached.emissives
      for (let e = 0; e < emissives.length; e++) emissives[e].emissiveIntensity = emissiveIntensity
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
            {s.kind === 'pawnshop' && (
              <PawnshopSign
                side={s.side}
                y={s.y}
                shopName={s.shopName}
              />
            )}
            {s.kind === 'mahjong' && (
              <MahjongSign
                side={s.side}
                y={s.y}
              />
            )}
          </group>
        ))}
      </group>
      <InfoTag label="Neon signs · disappearing craft" offset={[-6, 11, -4]} />
    </group>
  )
}
