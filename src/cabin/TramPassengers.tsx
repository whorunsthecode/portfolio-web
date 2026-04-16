import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

/*
 * Stylized low-poly tram passengers — architectural-viz silhouette figures.
 * 6 variants reflecting 1980s HK commuter demographics.
 *
 * Uses meshStandardMaterial (matching the cabin's existing material system)
 * rather than MeshToonMaterial since nothing else in the scene uses toon shading.
 */

// ── Skin tone pool (Chinese + tourist variation) ─────────────────────
const SKIN_CN_A = '#e8c8a0'
const SKIN_CN_B = '#f0d4b0'
const SKIN_CN_C = '#dfc090'
const SKIN_WHITE = '#f4dcc4'
// Additional skin tones for future tourist variation:
// Southeast Asian '#c89878', Japanese '#f0d0a8'

// ── Shared sub-components ────────────────────────────────────────────

/** Seated legs: two cylinders angled forward from the seat edge, with
 *  lower legs hanging down. `legColor` for trousers / skirt overlay. */
function SeatedLegs({
  color,
  shoeColor = '#1a1614',
  radius = 0.06,
  upperLen = 0.35,
  lowerLen = 0.4,
  spread = 0.12,
}: {
  color: string
  shoeColor?: string
  radius?: number
  upperLen?: number
  lowerLen?: number
  spread?: number
}) {
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * spread, -0.02, 0.1]}>
          {/* Upper leg — on seat, angled slightly forward */}
          <mesh position={[0, 0, upperLen / 2]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[radius, radius, upperLen, 8]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
          {/* Lower leg — hanging down from seat edge */}
          <mesh position={[0, -lowerLen / 2, upperLen]}>
            <cylinderGeometry args={[radius * 0.9, radius * 0.85, lowerLen, 8]} />
            <meshStandardMaterial color={color} roughness={0.85} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -lowerLen, upperLen + 0.04]}>
            <boxGeometry args={[radius * 2.2, 0.06, 0.14]} />
            <meshStandardMaterial color={shoeColor} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Simple arms hanging at sides or resting on lap. */
function Arms({
  color,
  skinColor,
  radius = 0.04,
  length = 0.42,
  spread = 0.24,
  restAngle = 0.3,
}: {
  color: string
  skinColor: string
  radius?: number
  length?: number
  spread?: number
  restAngle?: number
}) {
  return (
    <group>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * spread, 0.22, 0]} rotation={[restAngle, 0, 0]}>
          {/* Upper arm (clothed) */}
          <mesh position={[0, -length / 4, 0]}>
            <cylinderGeometry args={[radius, radius, length / 2, 8]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
          {/* Forearm (skin) */}
          <mesh position={[0, -length * 0.6, 0]}>
            <cylinderGeometry args={[radius * 0.9, radius * 0.85, length / 2.5, 8]} />
            <meshStandardMaterial color={skinColor} roughness={0.75} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ── Variant 1: Male office worker (寫字樓打工仔) ─────────────────────
function OfficeMale() {
  const skin = SKIN_CN_A
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color={skin} roughness={0.75} />
      </mesh>
      {/* Hair — conservative side-part, flat box on top */}
      <mesh position={[0, 0.72, -0.02]}>
        <boxGeometry args={[0.2, 0.06, 0.18]} />
        <meshStandardMaterial color="#1a1010" roughness={0.9} />
      </mesh>
      {/* Large square glasses — 80s oversized plastic frames */}
      <mesh position={[0, 0.63, 0.1]}>
        <boxGeometry args={[0.16, 0.05, 0.02]} />
        <meshStandardMaterial color="#2a2018" roughness={0.7} />
      </mesh>
      {/* Torso — navy suit with power shoulders (wider top than bottom) */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.42, 0.5, 0.25]} />
        <meshStandardMaterial color="#2a3a5c" roughness={0.8} />
      </mesh>
      {/* White shirt collar visible */}
      <mesh position={[0, 0.52, 0.08]}>
        <boxGeometry args={[0.18, 0.06, 0.08]} />
        <meshStandardMaterial color="#fafaf0" roughness={0.7} />
      </mesh>
      {/* Burgundy tie */}
      <mesh position={[0, 0.35, 0.13]}>
        <boxGeometry args={[0.04, 0.28, 0.015]} />
        <meshStandardMaterial color="#7a2828" roughness={0.75} />
      </mesh>
      <Arms color="#2a3a5c" skinColor={skin} />
      <SeatedLegs color="#2a3a5c" />
      {/* Briefcase on lap */}
      <mesh position={[0, 0.06, 0.22]}>
        <boxGeometry args={[0.35, 0.08, 0.25]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.8} />
      </mesh>
      {/* Briefcase handle */}
      <mesh position={[0, 0.12, 0.22]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.12, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
      </mesh>
    </group>
  )
}

// ── Variant 2: Female office worker (OL) ─────────────────────────────
function OfficeFemale() {
  const skin = SKIN_CN_B
  return (
    <group>
      {/* Head — slightly larger for 80s perm volume */}
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.13, 12, 10]} />
        <meshStandardMaterial color={skin} roughness={0.75} />
      </mesh>
      {/* 80s perm hair — voluminous sphere framing face (Anita Mui silhouette) */}
      <mesh position={[0, 0.65, -0.03]}>
        <sphereGeometry args={[0.17, 12, 10]} />
        <meshStandardMaterial color="#2a1a0a" roughness={0.9} />
      </mesh>
      {/* Earrings — large gold hoops, signature 80s */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.14, 0.58, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.025, 0.006, 8, 12]} />
          <meshStandardMaterial color="#d4a028" metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* Lipstick — small red mark on lower face */}
      <mesh position={[0, 0.57, 0.12]}>
        <boxGeometry args={[0.05, 0.015, 0.01]} />
        <meshStandardMaterial color="#c82820" roughness={0.6} />
      </mesh>
      {/* Torso — pastel blouse with MASSIVE shoulder pads */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.45, 0.48, 0.24]} />
        <meshStandardMaterial color="#f4c4d0" roughness={0.7} />
      </mesh>
      {/* Shoulder pad emphasis — extra width at top */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.48, 0.08, 0.24]} />
        <meshStandardMaterial color="#f4c4d0" roughness={0.7} />
      </mesh>
      <Arms color="#f4c4d0" skinColor={skin} spread={0.26} />
      {/* Pencil skirt — charcoal, knees together */}
      <SeatedLegs color="#3a3a42" spread={0.08} radius={0.065} />
      {/* Structured handbag on lap */}
      <mesh position={[0.12, 0.06, 0.18]}>
        <boxGeometry args={[0.28, 0.18, 0.12]} />
        <meshStandardMaterial color="#5a1a28" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ── Variant 3: Primary schoolboy (小學生) ────────────────────────────
function Schoolboy() {
  const skin = SKIN_CN_C
  return (
    <group scale={[0.75, 0.75, 0.75]}>
      {/* Head — slightly larger proportionally (child) */}
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.14, 12, 10]} />
        <meshStandardMaterial color={skin} roughness={0.75} />
      </mesh>
      {/* Bowl cut hair */}
      <mesh position={[0, 0.68, -0.02]}>
        <sphereGeometry args={[0.15, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a1010" roughness={0.9} />
      </mesh>
      {/* White short-sleeve shirt */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.36, 0.45, 0.22]} />
        <meshStandardMaterial color="#fafaf0" roughness={0.75} />
      </mesh>
      {/* School badge on chest */}
      <mesh position={[0.08, 0.4, 0.115]}>
        <planeGeometry args={[0.06, 0.06]} />
        <meshStandardMaterial color="#2a5a8a" roughness={0.7} />
      </mesh>
      <Arms color="#fafaf0" skinColor={skin} radius={0.035} length={0.35} spread={0.2} />
      {/* Navy shorts */}
      <SeatedLegs color="#1a2840" radius={0.055} upperLen={0.25} lowerLen={0.3} />
      {/* Leather satchel beside him */}
      <mesh position={[0.25, 0.08, 0]}>
        <boxGeometry args={[0.08, 0.3, 0.25]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.85} />
      </mesh>
    </group>
  )
}

// ── Variant 4: Secondary schoolgirl (中學生) ─────────────────────────
function Schoolgirl() {
  const skin = SKIN_CN_B
  return (
    <group scale={[0.88, 0.88, 0.88]}>
      {/* Head */}
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.13, 12, 10]} />
        <meshStandardMaterial color={skin} roughness={0.75} />
      </mesh>
      {/* Hair top */}
      <mesh position={[0, 0.68, -0.02]}>
        <sphereGeometry args={[0.14, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#1a1010" roughness={0.9} />
      </mesh>
      {/* Two low braids — classic 80s HK schoolgirl */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.1, 0.45, -0.06]} rotation={[0.2, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.02, 0.3, 8]} />
            <meshStandardMaterial color="#1a1010" roughness={0.9} />
          </mesh>
          {/* Red hair tie at base — signature detail */}
          <mesh position={[side * 0.1, 0.58, -0.04]}>
            <torusGeometry args={[0.03, 0.008, 8, 10]} />
            <meshStandardMaterial color="#c82820" roughness={0.7} />
          </mesh>
        </group>
      ))}
      {/* White blouse */}
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.36, 0.44, 0.22]} />
        <meshStandardMaterial color="#fafaf0" roughness={0.75} />
      </mesh>
      <Arms color="#fafaf0" skinColor={skin} radius={0.035} length={0.38} spread={0.2} />
      {/* Pleated navy skirt — cylinder for pleated silhouette */}
      <mesh position={[0, 0.02, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.2, 12]} />
        <meshStandardMaterial color="#1a2840" roughness={0.8} />
      </mesh>
      {/* White socks + black Mary Jane shoes */}
      <SeatedLegs color="#fafaf0" shoeColor="#1a1614" radius={0.05} upperLen={0.2} lowerLen={0.32} spread={0.1} />
      {/* Book held up as if reading */}
      <mesh position={[0, 0.28, 0.25]}>
        <boxGeometry args={[0.16, 0.22, 0.02]} />
        <meshStandardMaterial color="#f4ebd4" roughness={0.8} />
      </mesh>
    </group>
  )
}

// ── Variant 5: Elderly auntie (師奶) ─────────────────────────────────
function Auntie() {
  const skin = SKIN_CN_C
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 0.6, 0.02]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color={skin} roughness={0.75} />
      </mesh>
      {/* Grey perm — volumetric like OL but in grey */}
      <mesh position={[0, 0.64, -0.01]}>
        <sphereGeometry args={[0.16, 12, 10]} />
        <meshStandardMaterial color="#b0a8a0" roughness={0.9} />
      </mesh>
      {/* Floral blouse — warm rose (representing floral print) */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.42, 0.48, 0.26]} />
        <meshStandardMaterial color="#c86870" roughness={0.75} />
      </mesh>
      <Arms color="#c86870" skinColor={skin} spread={0.24} restAngle={0.5} />
      {/* Jade bracelet — green torus on left wrist */}
      <mesh position={[-0.24, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.04, 0.012, 8, 16]} />
        <meshStandardMaterial color="#4a7840" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Loose black pants */}
      <SeatedLegs color="#2a2a2a" radius={0.07} spread={0.14} />
      {/* 紅白藍 bag — THE iconic HK object, at her feet */}
      <group position={[0, -0.45, 0.35]}>
        <mesh>
          <boxGeometry args={[0.3, 0.35, 0.2]} />
          <meshStandardMaterial color="#ffffff" roughness={0.8} />
        </mesh>
        {/* Red stripe */}
        <mesh position={[0, 0.08, 0.101]}>
          <planeGeometry args={[0.3, 0.1]} />
          <meshStandardMaterial color="#c82820" roughness={0.8} />
        </mesh>
        {/* Blue stripe */}
        <mesh position={[0, -0.08, 0.101]}>
          <planeGeometry args={[0.3, 0.1]} />
          <meshStandardMaterial color="#1a3a8a" roughness={0.8} />
        </mesh>
        {/* Opposite side stripes */}
        <mesh position={[0, 0.08, -0.101]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.3, 0.1]} />
          <meshStandardMaterial color="#c82820" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.08, -0.101]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[0.3, 0.1]} />
          <meshStandardMaterial color="#1a3a8a" roughness={0.8} />
        </mesh>
      </group>
    </group>
  )
}

// ── Variant 6: Tourist (late-80s style) ──────────────────────────────
function Tourist() {
  const skin = SKIN_WHITE
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color={skin} roughness={0.75} />
      </mesh>
      {/* Slightly messy dark hair */}
      <mesh position={[0, 0.7, -0.02]}>
        <sphereGeometry args={[0.13, 10, 8, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.9} />
      </mesh>
      {/* Loud Hawaiian / colorful polo — teal */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.4, 0.5, 0.25]} />
        <meshStandardMaterial color="#3aa8a0" roughness={0.7} />
      </mesh>
      <Arms color="#3aa8a0" skinColor={skin} spread={0.22} restAngle={0.4} />
      {/* Beige pleated trousers — 80s tourist dad */}
      <SeatedLegs color="#c4b490" radius={0.065} />
      {/* Film camera around neck — Nikon FM / Canon AE-1 */}
      <group position={[0, 0.38, 0.16]}>
        {/* Camera body */}
        <mesh>
          <boxGeometry args={[0.12, 0.08, 0.06]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
        {/* Lens */}
        <mesh position={[0, 0, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.03, 0.04, 10]} />
          <meshStandardMaterial color="#2a2a2a" roughness={0.5} />
        </mesh>
        {/* Strap (thin cylinder loop) */}
        <mesh position={[0, 0.1, -0.01]} rotation={[0.3, 0, 0]}>
          <torusGeometry args={[0.08, 0.006, 6, 16, Math.PI]} />
          <meshStandardMaterial color="#8a2020" roughness={0.8} />
        </mesh>
      </group>
      {/* Fanny pack at waist */}
      <mesh position={[0, 0.1, 0.15]}>
        <boxGeometry args={[0.2, 0.06, 0.08]} />
        <meshStandardMaterial color="#f4c430" roughness={0.75} />
      </mesh>
      {/* Unfolded map on lap */}
      <mesh position={[0, 0.06, 0.2]} rotation={[-0.3, 0, 0]}>
        <planeGeometry args={[0.3, 0.25]} />
        <meshStandardMaterial color="#f4ebd4" roughness={0.8} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

// ── Animated wrapper per passenger ───────────────────────────────────

const VARIANTS = [
  OfficeMale,
  OfficeFemale,
  Schoolboy,
  Schoolgirl,
  Auntie,
  Tourist,
] as const

interface SeatAssignment {
  variant: number // index into VARIANTS
  x: number
  z: number
  facingAngle?: number // Y rotation, 0 = facing +Z (toward rear)
}

// Place 6 passengers on existing seats (rows 1–3, skipping row 0 which
// is the player's row at z=-7.0). Seat X = ±0.7, Y cushion top ≈ 0.73.
const ASSIGNMENTS: SeatAssignment[] = [
  { variant: 0, x: -0.7, z: -5.5 },  // Office male — row 1 left
  { variant: 1, x: 0.7, z: -5.5 },   // Office female — row 1 right
  { variant: 2, x: -0.7, z: -4.0 },  // Schoolboy — row 2 left
  { variant: 3, x: 0.7, z: -4.0 },   // Schoolgirl — row 2 right
  { variant: 4, x: -0.7, z: -2.5 },  // Auntie — row 3 left
  { variant: 5, x: 0.7, z: -2.5 },   // Tourist — row 3 right
]

const SEAT_Y = 0.73 // cushion top (seat group y=0.56 + cushion local y=0.14 + half height 0.03)

function AnimatedPassenger({
  variant,
  position,
  personalOffset,
}: {
  variant: number
  position: [number, number, number]
  personalOffset: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const Variant = VARIANTS[variant]

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime

    // Tiny head/body sway from tram motion — all passengers
    groupRef.current.rotation.z =
      Math.sin(t * 1.2 + personalOffset) * 0.025

    // Tourist actively looks around
    if (variant === 5 && groupRef.current.children[0]) {
      // Rotate the whole upper body slightly for the tourist
      groupRef.current.rotation.y =
        Math.sin(t * 0.4 + personalOffset) * 0.3
    }
  })

  return (
    <group ref={groupRef} position={position}>
      <Variant />
    </group>
  )
}

// ── Main export ──────────────────────────────────────────────────────

export function TramPassengers() {
  return (
    <group>
      {ASSIGNMENTS.map((seat, i) => (
        <AnimatedPassenger
          key={i}
          variant={seat.variant}
          position={[seat.x, SEAT_Y, seat.z]}
          personalOffset={i * 1.7} // stagger sway phase
        />
      ))}
    </group>
  )
}
