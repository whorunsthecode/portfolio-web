import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { InfoTag } from '../scene/components/InfoTag'

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
// Tourist skin tones are in TOURIST_SKINS array below

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
export function OfficeMale() {
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
      {/* Torso — navy suit, narrower at waist */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.38, 0.4, 0.24]} />
        <meshStandardMaterial color="#2a3a5c" roughness={0.8} />
      </mesh>
      {/* Power shoulder pads — wider at top (80s silhouette) */}
      <mesh position={[0, 0.48, 0]}>
        <boxGeometry args={[0.44, 0.14, 0.25]} />
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
      {/* Folded Chinese newspaper resting on top of the briefcase */}
      <group position={[0.02, 0.105, 0.2]} rotation={[0, 0.15, 0]}>
        <Newspaper />
      </group>
      {/* Double A paper ream tucked beside him on the bench — the
          office worker's unmistakeable accessory back from the
          stationers. Sits on the seat to his aisle-side. */}
      <group position={[-0.34, -0.09, 0.02]} rotation={[0, -0.25, 0.05]}>
        <DoubleAPaperReam />
        <InfoTag label="Double A · office paper staple" offset={[0, 0.22, 0]} />
      </group>
    </group>
  )
}

// ── Variant 2: Female office worker (OL) ─────────────────────────────
export function OfficeFemale({ seed = 0 }: { seed?: number }) {
  const skin = SKIN_CN_B
  const hasGlasses = seed % 5 < 2 // ~40%
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
      {/* Oversized 80s glasses — chunky plastic, bigger than male's (40% chance) */}
      {hasGlasses && (
        <mesh position={[0, 0.63, 0.11]}>
          <boxGeometry args={[0.18, 0.06, 0.02]} />
          <meshStandardMaterial color="#1a1010" roughness={0.7} />
        </mesh>
      )}
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
export function Schoolboy() {
  const skin = SKIN_CN_C
  // Leg-swinging refs (feet don't reach floor)
  const leftLegRef = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (leftLegRef.current) leftLegRef.current.rotation.x = Math.sin(t * 2.0) * 0.15
    if (rightLegRef.current) rightLegRef.current.rotation.x = Math.sin(t * 2.0 + Math.PI) * 0.15
  })
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
      {/* Swinging legs with navy shorts + white knee socks */}
      {[
        { side: -1, ref: leftLegRef },
        { side: 1, ref: rightLegRef },
      ].map(({ side, ref }) => (
        <group key={side} ref={ref} position={[side * 0.12, -0.02, 0.1]}>
          {/* Upper leg (navy shorts) */}
          <mesh position={[0, 0, 0.125]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.055, 0.055, 0.25, 8]} />
            <meshStandardMaterial color="#1a2840" roughness={0.85} />
          </mesh>
          {/* Lower leg — white knee socks */}
          <mesh position={[0, -0.15, 0.25]}>
            <cylinderGeometry args={[0.05, 0.047, 0.3, 8]} />
            <meshStandardMaterial color="#fafaf0" roughness={0.8} />
          </mesh>
          {/* Shoe */}
          <mesh position={[0, -0.3, 0.29]}>
            <boxGeometry args={[0.12, 0.06, 0.14]} />
            <meshStandardMaterial color="#1a1614" roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Leather satchel beside him */}
      <mesh position={[0.25, 0.08, 0]}>
        <boxGeometry args={[0.08, 0.3, 0.25]} />
        <meshStandardMaterial color="#5c3a1e" roughness={0.85} />
      </mesh>
    </group>
  )
}

// ── Variant 4: Secondary schoolgirl (中學生) ─────────────────────────
export function Schoolgirl({ seed = 0 }: { seed?: number }) {
  const skin = SKIN_CN_B
  const hasGlasses = seed % 10 < 3 // ~30%
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
      {/* Thin wire-rim glasses — studious look (30% chance) */}
      {hasGlasses && (
        <mesh position={[0, 0.63, 0.11]}>
          <boxGeometry args={[0.14, 0.04, 0.015]} />
          <meshStandardMaterial color="#8a8a8a" metalness={0.4} roughness={0.3} />
        </mesh>
      )}
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
      {/* Paperback held up as if reading — more detailed than a flat box */}
      <group position={[0, 0.28, 0.25]} rotation={[Math.PI / 2.2, 0, 0]}>
        <Paperback />
      </group>
      {/* School bag on floor beside her */}
      <mesh position={[0.22, -0.35, 0.1]}>
        <boxGeometry args={[0.1, 0.35, 0.3]} />
        <meshStandardMaterial color="#1a2840" roughness={0.85} />
      </mesh>
      {/* Small school crest patch on bag */}
      <mesh position={[0.28, -0.3, 0.1]}>
        <planeGeometry args={[0.04, 0.04]} />
        <meshStandardMaterial color="#c82820" roughness={0.7} />
      </mesh>
    </group>
  )
}

// ── Variant 5: Elderly auntie (師奶) ─────────────────────────────────
export function Auntie() {
  const skin = SKIN_CN_C
  const rightArmRef = useRef<THREE.Group>(null)
  // Subtle bracelet-rubbing gesture every ~20s
  useFrame(({ clock }) => {
    if (!rightArmRef.current) return
    const t = clock.elapsedTime
    const cycle = Math.sin(t * 0.3) // slow ~20s cycle
    rightArmRef.current.rotation.x = cycle > 0.9 ? 0.5 + Math.sin(t * 4) * 0.08 : 0.5
  })
  return (
    <group rotation={[0.12, 0, 0]}>{/* Slight forward hunch */}
      {/* Head — tilted slightly forward */}
      <mesh position={[0, 0.58, 0.05]}>
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
      {/* Left arm */}
      <group position={[-0.24, 0.22, 0]} rotation={[0.5, 0, 0]}>
        <mesh position={[0, -0.105, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.21, 8]} />
          <meshStandardMaterial color="#c86870" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.252, 0]}>
          <cylinderGeometry args={[0.036, 0.034, 0.168, 8]} />
          <meshStandardMaterial color={skin} roughness={0.75} />
        </mesh>
      </group>
      {/* Right arm (animated — bracelet rubbing) */}
      <group ref={rightArmRef} position={[0.24, 0.22, 0]} rotation={[0.5, 0, 0]}>
        <mesh position={[0, -0.105, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.21, 8]} />
          <meshStandardMaterial color="#c86870" roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.252, 0]}>
          <cylinderGeometry args={[0.036, 0.034, 0.168, 8]} />
          <meshStandardMaterial color={skin} roughness={0.75} />
        </mesh>
      </group>
      {/* Jade bracelet — green torus on left wrist */}
      <mesh position={[-0.24, -0.02, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.04, 0.012, 8, 16]} />
        <meshStandardMaterial color="#4a7840" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Loose black pants */}
      <SeatedLegs color="#2a2a2a" radius={0.07} spread={0.14} />
      {/* 中 mahjong tile on her lap — foreshadows her destination,
          the 麻雀館 up the street. Slightly tilted as if just pulled
          out of her handbag. */}
      <group position={[-0.08, 0.04, 0.2]} rotation={[-0.6, 0.2, 0.15]}>
        <MahjongTile />
        <InfoTag label="紅中 · off to 麻雀館" offset={[0, 0.14, 0]} />
      </group>
      {/* 紅白藍 bag — THE iconic HK object. Sits ON the bench next to
          her (local +X along the bench length), tilted slightly. The
          old position at y=-0.45 dropped it through the seat onto the
          floor behind her shins. */}
      <group position={[0.32, 0.08, 0.02]} rotation={[0, -0.2, 0.06]}>
        <RedWhiteBlueBag />
      </group>
    </group>
  )
}

// ── Variant 6: Tourist (late-80s style) ──────────────────────────────
const TOURIST_SKINS = ['#f4dcc4', '#c89878', '#f0d0a8'] // white, SEA, JP
export function Tourist({ seed = 0 }: { seed?: number }) {
  const skin = TOURIST_SKINS[seed % TOURIST_SKINS.length]
  const cameraRef = useRef<THREE.Group>(null)
  // Lift camera to face every ~15s
  useFrame(({ clock }) => {
    if (!cameraRef.current) return
    const t = clock.elapsedTime
    const cycle = Math.sin(t * 0.4) // ~15s full cycle
    const lifting = cycle > 0.85
    cameraRef.current.position.y = lifting ? 0.52 : 0.38
    cameraRef.current.position.z = lifting ? 0.12 : 0.16
  })
  return (
    <group rotation={[0.08, 0, 0]}>{/* Leaning forward, actively engaged */}
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
      <group ref={cameraRef} position={[0, 0.38, 0.16]}>
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
      {/* Yellow Walkman clipped to the fanny pack — listening while sightseeing */}
      <group position={[-0.12, 0.12, 0.2]} rotation={[0.2, -0.3, 0.2]}>
        <Walkman />
      </group>
    </group>
  )
}

// ── Shared commuter props — newspapers, books, cassette Walkmans ───

/** Folded Chinese newspaper (Oriental Daily / Ming Pao feel — greyish
 *  paper with black inky column strips). No masthead / logo. */
function Newspaper() {
  return (
    <group>
      {/* Main folded paper */}
      <mesh>
        <boxGeometry args={[0.18, 0.01, 0.13]} />
        <meshStandardMaterial color="#e4dac8" roughness={0.92} />
      </mesh>
      {/* Black ink column strips on top face */}
      {[-0.055, -0.018, 0.018, 0.055].map((x, i) => (
        <mesh key={i} position={[x, 0.006, 0]}>
          <boxGeometry args={[0.022, 0.001, 0.11]} />
          <meshStandardMaterial color="#1a1410" roughness={0.9} />
        </mesh>
      ))}
      {/* Darker fold crease down the middle */}
      <mesh position={[0, 0.0055, 0]}>
        <boxGeometry args={[0.001, 0.001, 0.13]} />
        <meshStandardMaterial color="#5a4a38" roughness={0.9} />
      </mesh>
    </group>
  )
}

/** Small paperback book — red leatherette cover with a blank cream
 *  spine panel. No title text. */
function Paperback() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.11, 0.015, 0.155]} />
        <meshStandardMaterial color="#8a2028" roughness={0.78} />
      </mesh>
      {/* Cream pages edge */}
      <mesh position={[0, 0, 0.0081]}>
        <boxGeometry args={[0.108, 0.013, 0.002]} />
        <meshStandardMaterial color="#f4ead4" roughness={0.85} />
      </mesh>
      {/* Gold decorative spine line */}
      <mesh position={[0, 0.0081, 0]}>
        <boxGeometry args={[0.003, 0.001, 0.145]} />
        <meshStandardMaterial color="#c8a048" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

/** Early-80s yellow Sony TPS-L2-style Walkman cassette player with
 *  thin orange headphone wire. No brand logo. */
function Walkman() {
  return (
    <group>
      {/* Yellow-and-silver body (original TPS-L2 colourway) */}
      <mesh>
        <boxGeometry args={[0.09, 0.055, 0.015]} />
        <meshStandardMaterial color="#e8c838" roughness={0.6} metalness={0.15} />
      </mesh>
      {/* Silver top half */}
      <mesh position={[0, 0.014, 0]}>
        <boxGeometry args={[0.09, 0.025, 0.016]} />
        <meshStandardMaterial color="#c8c8cc" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Cassette window — clear-ish dark face */}
      <mesh position={[0, 0, 0.008]}>
        <boxGeometry args={[0.07, 0.04, 0.001]} />
        <meshStandardMaterial color="#2a2820" roughness={0.5} metalness={0.2} />
      </mesh>
      {/* Two little reels inside the window */}
      {[-0.016, 0.016].map((x, i) => (
        <mesh key={i} position={[x, 0, 0.0085]}>
          <cylinderGeometry args={[0.008, 0.008, 0.0005, 12]} />
          <meshStandardMaterial color="#4a4238" roughness={0.7} />
        </mesh>
      ))}
      {/* Orange foam headphone wire dangling out the side */}
      <mesh position={[-0.052, 0.01, 0]} rotation={[0, 0, -0.5]}>
        <cylinderGeometry args={[0.0015, 0.0015, 0.2, 4]} />
        <meshStandardMaterial color="#e86828" roughness={0.85} />
      </mesh>
    </group>
  )
}

/** 紅白藍 nylon tote — iconic red/white/blue woven-plastic HK bag.
 *  Stripe pattern follows the classic Chan Pak Lam tote: wide white
 *  bands broken up by wide BLUE bands, with THIN RED pin-stripes
 *  flanking each blue band — the authentic W-R-B-R-W-R-B-R-W run.
 *  Reusable prop: callers place it on the floor beside a passenger.
 *  `scale` controls overall size for smaller secondary uses. */
function RedWhiteBlueBag({ scale = 1 }: { scale?: number }) {
  const RED = '#c82820'
  const BLUE = '#1a3a8a'
  // W-R-B-R-W-R-B-R-W across the 0.3m face: two wide blue bands
  // flanked by thin red pin-stripes, wide white fills between.
  // `w` is stripe width, `x` is local-X centre. White body shows
  // through the gaps automatically.
  const stripes: Array<{ x: number; w: number; color: string }> = [
    { x: -0.10, w: 0.010, color: RED },
    { x: -0.08, w: 0.030, color: BLUE },
    { x: -0.06, w: 0.010, color: RED },
    { x:  0.06, w: 0.010, color: RED },
    { x:  0.08, w: 0.030, color: BLUE },
    { x:  0.10, w: 0.010, color: RED },
  ]
  return (
    <group scale={[scale, scale, scale]}>
      {/* White woven body */}
      <mesh>
        <boxGeometry args={[0.3, 0.36, 0.18]} />
        <meshStandardMaterial color="#f4f4ea" roughness={0.85} />
      </mesh>
      {/* Vertical stripes — front */}
      {stripes.map((s, i) => (
        <mesh key={`f-${i}`} position={[s.x, 0, 0.0911]}>
          <planeGeometry args={[s.w, 0.34]} />
          <meshStandardMaterial color={s.color} roughness={0.85} />
        </mesh>
      ))}
      {/* Vertical stripes — back */}
      {stripes.map((s, i) => (
        <mesh key={`b-${i}`} position={[s.x, 0, -0.0911]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[s.w, 0.34]} />
          <meshStandardMaterial color={s.color} roughness={0.85} />
        </mesh>
      ))}
      {/* Red border piping — top, bottom, sides */}
      <mesh position={[0, 0.183, 0]}>
        <boxGeometry args={[0.31, 0.015, 0.19]} />
        <meshStandardMaterial color="#c82820" roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.183, 0]}>
        <boxGeometry args={[0.31, 0.015, 0.19]} />
        <meshStandardMaterial color="#c82820" roughness={0.75} />
      </mesh>
      <mesh position={[-0.153, 0, 0]}>
        <boxGeometry args={[0.013, 0.38, 0.19]} />
        <meshStandardMaterial color="#c82820" roughness={0.75} />
      </mesh>
      <mesh position={[0.153, 0, 0]}>
        <boxGeometry args={[0.013, 0.38, 0.19]} />
        <meshStandardMaterial color="#c82820" roughness={0.75} />
      </mesh>
      {/* Twin blue rope handle loops on top */}
      {[-0.08, 0.08].map((hx, i) => (
        <mesh key={`h-${i}`} position={[hx, 0.24, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.055, 0.01, 6, 14]} />
          <meshStandardMaterial color="#1a3a8a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/** Mahjong 中 tile — cream porcelain with bevelled cream-white face
 *  and a painted red 中 (red-dragon) character. Small enough to sit
 *  on a passenger's lap or palm, readable as a tile at conversational
 *  distance. */
function MahjongTile() {
  const W = 0.09
  const H = 0.12
  const D = 0.045
  return (
    <group>
      {/* Cream body with green back (real tiles have a bamboo-green
          lamination on the back) */}
      <mesh>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#2a6848" roughness={0.6} />
      </mesh>
      {/* Cream-white face slightly proud of the body for the bevel */}
      <mesh position={[0, 0, D / 2 + 0.001]}>
        <boxGeometry args={[W * 0.94, H * 0.94, 0.006]} />
        <meshStandardMaterial color="#f4ead0" roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Red 中 character painted on the face */}
      <Text
        position={[0, 0, D / 2 + 0.005]}
        fontSize={H * 0.6}
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        <meshStandardMaterial color="#c81818" roughness={0.55} />
        中
      </Text>
    </group>
  )
}

/** Double A copy-paper ream — thin white A4 box with the iconic
 *  blue diagonal wrap + "Double A" wordmark. Common sight in 80s HK
 *  office lobbies and in the arms of office workers heading back
 *  from the stationers. */
function DoubleAPaperReam() {
  const DOUBLE_A_BLUE = '#0ea5d4'
  const DOUBLE_A_DEEP = '#0b3a8a'
  const W = 0.34
  const H = 0.06
  const D = 0.24
  return (
    <group>
      {/* White paper box body */}
      <mesh>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#f4f4ea" roughness={0.82} />
      </mesh>
      {/* Diagonal blue band wrapping the front long face (iconic on
          real Double A reams). Rendered as a thin plane slightly
          proud of the box front. */}
      <mesh position={[0, 0, D / 2 + 0.001]} rotation={[0, 0, -0.35]}>
        <planeGeometry args={[W * 1.3, H * 0.55]} />
        <meshStandardMaterial color={DOUBLE_A_BLUE} roughness={0.7} />
      </mesh>
      {/* Deep-blue sub-band for the Premium strip */}
      <mesh position={[0, -0.002, D / 2 + 0.0015]} rotation={[0, 0, -0.35]}>
        <planeGeometry args={[W * 1.3, H * 0.18]} />
        <meshStandardMaterial color={DOUBLE_A_DEEP} roughness={0.7} />
      </mesh>
      {/* Stylised large "A" on the left — a blue triangle + white
          cross-bar, readable from a short distance. */}
      <mesh position={[-W * 0.32, 0, D / 2 + 0.002]} rotation={[0, 0, 0]}>
        <planeGeometry args={[H * 0.8, H * 0.8]} />
        <meshStandardMaterial color={DOUBLE_A_BLUE} roughness={0.7} />
      </mesh>
      {/* Top label strip — duplicates the band on the top face so the
          brand reads when the ream is carried flat. */}
      <mesh position={[0, H / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 0.95, D * 0.35]} />
        <meshStandardMaterial color={DOUBLE_A_BLUE} roughness={0.7} />
      </mesh>
      {/* Premium sub-line on top */}
      <mesh position={[0, H / 2 + 0.0015, D * 0.08]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W * 0.6, D * 0.08]} />
        <meshStandardMaterial color={DOUBLE_A_DEEP} roughness={0.7} />
      </mesh>
    </group>
  )
}

// ── Shared beverage props — iconic HK drinks held by passengers ─────

/** Vitasoy-style paper carton (brown body, green side stripe, straw).
 *  No brand logo per user instruction — reads as generic HK soy milk. */
function VitasoyCarton() {
  return (
    <group>
      {/* Main brown carton body */}
      <mesh>
        <boxGeometry args={[0.07, 0.14, 0.045]} />
        <meshStandardMaterial color="#4a3020" roughness={0.75} />
      </mesh>
      {/* Green side stripe (iconic green band on Vitasoy-style cartons) */}
      <mesh position={[0.0361, 0, 0]}>
        <boxGeometry args={[0.001, 0.12, 0.04]} />
        <meshStandardMaterial color="#2a7840" roughness={0.7} />
      </mesh>
      {/* Cream top-seam cap */}
      <mesh position={[0, 0.075, 0]}>
        <boxGeometry args={[0.072, 0.012, 0.048]} />
        <meshStandardMaterial color="#f0e4c4" roughness={0.7} />
      </mesh>
      {/* Straw poking out */}
      <mesh position={[0.015, 0.095, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 0.05, 6]} />
        <meshStandardMaterial color="#fafaf2" roughness={0.6} />
      </mesh>
    </group>
  )
}

/** HK-style Lemon Tea carton — yellow body with green horizontal band,
 *  slightly taller/skinnier than Vitasoy. No logo. */
function LemonTeaCarton() {
  return (
    <group>
      {/* Yellow main body */}
      <mesh>
        <boxGeometry args={[0.055, 0.13, 0.04]} />
        <meshStandardMaterial color="#e8c838" roughness={0.75} />
      </mesh>
      {/* Green horizontal band */}
      <mesh position={[0, -0.02, 0.0206]}>
        <boxGeometry args={[0.056, 0.02, 0.001]} />
        <meshStandardMaterial color="#3a8a48" roughness={0.7} />
      </mesh>
      {/* Small dark tea-color panel near top */}
      <mesh position={[0, 0.04, 0.0206]}>
        <boxGeometry args={[0.045, 0.02, 0.001]} />
        <meshStandardMaterial color="#5a3818" roughness={0.7} />
      </mesh>
      {/* Cream top-seam cap */}
      <mesh position={[0, 0.07, 0]}>
        <boxGeometry args={[0.057, 0.012, 0.042]} />
        <meshStandardMaterial color="#f0e4c4" roughness={0.7} />
      </mesh>
      {/* Straw */}
      <mesh position={[0.012, 0.09, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 0.05, 6]} />
        <meshStandardMaterial color="#fafaf2" roughness={0.6} />
      </mesh>
    </group>
  )
}

// ── Variant 6: Anita Mui 梅艷芳 ────────────────────────────────────────
// Anita's signature: bold androgynous silhouette, strong shoulders in
// sharp black tuxedo-style jacket, deep red lipstick, dark short hair
// with volume, dramatic statement earrings. Often held drinks in her
// casual shots — giving her a carton of lemon tea for everyday
// commuter flavour.
function AnitaMui() {
  const skin = SKIN_CN_B
  return (
    <group>
      {/* Head */}
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.13, 12, 10]} />
        <meshStandardMaterial color={skin} roughness={0.75} />
      </mesh>
      {/* Hair — dark short volumetric, tousled wave (Anita's iconic cut) */}
      <mesh position={[0, 0.7, -0.02]}>
        <sphereGeometry args={[0.16, 14, 10]} />
        <meshStandardMaterial color="#0a0604" roughness={0.85} />
      </mesh>
      {/* Side swoop of hair crossing forehead */}
      <mesh position={[0.06, 0.67, 0.06]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.14, 0.04, 0.1]} />
        <meshStandardMaterial color="#0a0604" roughness={0.85} />
      </mesh>
      {/* Statement earrings — large gold geometric */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 0.14, 0.56, 0]}>
          <boxGeometry args={[0.02, 0.05, 0.015]} />
          <meshStandardMaterial color="#d4a028" metalness={0.75} roughness={0.25} />
        </mesh>
      ))}
      {/* Deep red lipstick */}
      <mesh position={[0, 0.57, 0.12]}>
        <boxGeometry args={[0.06, 0.018, 0.01]} />
        <meshStandardMaterial color="#a81020" roughness={0.5} />
      </mesh>
      {/* Black tuxedo jacket — SHARP structured shoulders */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[0.42, 0.48, 0.24]} />
        <meshStandardMaterial color="#0a0806" roughness={0.75} />
      </mesh>
      {/* Massive power shoulders */}
      <mesh position={[0, 0.52, 0]}>
        <boxGeometry args={[0.5, 0.1, 0.26]} />
        <meshStandardMaterial color="#0a0806" roughness={0.75} />
      </mesh>
      {/* White shirt collar visible — open neckline, no tie (Anita's look) */}
      <mesh position={[0, 0.48, 0.1]}>
        <boxGeometry args={[0.16, 0.1, 0.06]} />
        <meshStandardMaterial color="#fafaf0" roughness={0.7} />
      </mesh>
      {/* Slim black tie */}
      <mesh position={[0, 0.38, 0.13]}>
        <boxGeometry args={[0.025, 0.2, 0.012]} />
        <meshStandardMaterial color="#1a1410" roughness={0.6} />
      </mesh>
      <Arms color="#0a0806" skinColor={skin} spread={0.25} />
      {/* Tailored black trousers */}
      <SeatedLegs color="#0a0806" radius={0.065} />
      {/* Lemon-tea carton held in lap */}
      <group position={[0.1, 0.04, 0.22]} rotation={[-0.4, 0.3, 0]}>
        <LemonTeaCarton />
        <InfoTag label="Vita Lemon Tea · HK staple" offset={[0, 0.18, 0]} />
      </group>
      {/* 紅白藍 nylon tote tucked on the bench next to her — slightly
          smaller than Auntie's so it reads as a second, personal bag
          (not a duplicate). Lifted to bench level so it sits on the
          seat rather than sinking through it. */}
      <group position={[-0.32, 0.05, 0.02]} rotation={[0, 0.25, 0.08]}>
        <RedWhiteBlueBag scale={0.82} />
        <InfoTag label="紅白藍 · HK's utility tote" offset={[0, 0.3, 0]} />
      </group>
      <InfoTag label="Anita Mui · Madonna of Asia" offset={[0, 0.95, 0]} />
    </group>
  )
}

// ── Variant 7: Leslie Cheung 張國榮 ───────────────────────────────────
// Monica era (1984), designed by Eddie Lau — the iconic RED-dominant
// look Eddie chose "to accentuate his unique personal charm." Fluffy
// feathered 80s hair with side-swept fringe, single silver stud
// earring, cropped red jacket over white shirt, tailored trousers.
// Holding a Vitasoy carton — casual Cantopop-star-on-the-MTR vibe.
function LeslieCheung() {
  const skin = SKIN_CN_A
  const MONICA_RED = '#c82420'
  const MONICA_RED_DARK = '#8a1818'

  return (
    <group>
      {/* Head */}
      <mesh position={[0, 0.62, 0]}>
        <sphereGeometry args={[0.12, 12, 10]} />
        <meshStandardMaterial color={skin} roughness={0.75} />
      </mesh>
      {/* Hair — fluffy feathered 80s style */}
      <mesh position={[0, 0.72, -0.01]}>
        <sphereGeometry args={[0.14, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#1a0f08" roughness={0.85} />
      </mesh>
      {/* Signature side-swept fringe across forehead */}
      <mesh position={[-0.05, 0.7, 0.07]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.14, 0.04, 0.1]} />
        <meshStandardMaterial color="#1a0f08" roughness={0.85} />
      </mesh>
      {/* Silver stud earring on right ear — a Leslie signature */}
      <mesh position={[0.13, 0.6, 0]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color="#d4d4d4" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* Monica-era RED jacket — Eddie Lau's signature choice */}
      <mesh position={[0, 0.28, 0]}>
        <boxGeometry args={[0.4, 0.46, 0.24]} />
        <meshStandardMaterial color={MONICA_RED} roughness={0.75} />
      </mesh>
      {/* Wide 80s shoulders */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.46, 0.1, 0.25]} />
        <meshStandardMaterial color={MONICA_RED} roughness={0.75} />
      </mesh>
      {/* Lapels — darker red diagonal V */}
      <mesh position={[-0.06, 0.38, 0.123]} rotation={[0, 0, -0.3]}>
        <planeGeometry args={[0.06, 0.22]} />
        <meshStandardMaterial color={MONICA_RED_DARK} roughness={0.7} />
      </mesh>
      <mesh position={[0.06, 0.38, 0.123]} rotation={[0, 0, 0.3]}>
        <planeGeometry args={[0.06, 0.22]} />
        <meshStandardMaterial color={MONICA_RED_DARK} roughness={0.7} />
      </mesh>
      {/* Open-collar white shirt through the V */}
      <mesh position={[0, 0.44, 0.124]}>
        <boxGeometry args={[0.1, 0.12, 0.01]} />
        <meshStandardMaterial color="#fafaf0" roughness={0.7} />
      </mesh>
      {/* Slim black tie — hinting at the Monica-era styling */}
      <mesh position={[0, 0.37, 0.128]}>
        <boxGeometry args={[0.02, 0.14, 0.012]} />
        <meshStandardMaterial color="#1a1410" roughness={0.6} />
      </mesh>
      <Arms color={MONICA_RED} skinColor={skin} spread={0.23} />
      {/* Dark tailored trousers */}
      <SeatedLegs color="#1a1410" radius={0.065} />
      {/* Vitasoy carton held casually */}
      <group position={[-0.08, 0.04, 0.22]} rotation={[-0.3, -0.2, 0.1]}>
        <VitasoyCarton />
        <InfoTag label="Vitasoy · HK's childhood soy milk" offset={[0, 0.2, 0]} />
      </group>
      <InfoTag label="Leslie Cheung · Cantopop icon, 1984" offset={[0, 0.95, 0]} />
    </group>
  )
}

// ── Animated wrapper per passenger ───────────────────────────────────

// Variant render functions — some accept a seed prop for conditional details
export function renderVariant(index: number, seed: number) {
  switch (index) {
    case 0: return <OfficeMale />
    case 1: return <OfficeFemale seed={seed} />
    case 2: return <Schoolboy />
    case 3: return <Schoolgirl seed={seed} />
    case 4: return <Auntie />
    case 5: return <Tourist seed={seed} />
    case 6: return <AnitaMui />
    case 7: return <LeslieCheung />
    default: return <OfficeMale />
  }
}

interface SeatAssignment {
  variant: number // index into VARIANTS
  x: number
  z: number
  facingAngle?: number // Y rotation, 0 = facing +Z (toward rear)
}

// Place 6 passengers on the long benches facing INWARD toward the aisle.
// Passenger figures are modeled with local +Z as their FRONT (glasses,
// tie, shirt collar are all at +Z on the body). The Y-rotation convention
// in three.js is: a rotation of +π/2 around Y maps local +Z to world +X.
//
// So a passenger at the LEFT bench (x=-0.73) whose front should point
// toward the aisle (+X) needs facingAngle = +π/2. Previous values had
// the signs swapped, making passengers face the windows instead of each
// other — user reported "passengers still facing toward the windows
// when it is not physically possible."
//
// Left bench  x = -0.73 → face +X (aisle) → facingAngle = +π/2
// Right bench x = +0.73 → face -X (aisle) → facingAngle = -π/2
const ASSIGNMENTS: SeatAssignment[] = [
  { variant: 0, x: -0.73, z: -6.5, facingAngle: Math.PI / 2 },    // Office male with newspaper — left bench
  { variant: 7, x: 0.73,  z: -6.5, facingAngle: -Math.PI / 2 },   // Leslie Cheung (Monica-era red jacket + Vitasoy) — right bench
  { variant: 1, x: 0.73,  z: -5.5, facingAngle: -Math.PI / 2 },   // OL "pink top lady" — right bench
  { variant: 6, x: -0.73, z: -5.3, facingAngle: Math.PI / 2 },    // Anita Mui (black tuxedo + lemon tea) — left bench, faces Leslie
  { variant: 4, x: 0.73,  z: -4.2, facingAngle: -Math.PI / 2 },   // Auntie with 紅白藍 bag — right bench
  { variant: 2, x: -0.73, z: -4.0, facingAngle: Math.PI / 2 },    // Schoolboy — left bench
  { variant: 3, x: -0.73, z: -2.5, facingAngle: Math.PI / 2 },    // Schoolgirl with paperback — left bench
  { variant: 5, x: 0.73,  z: -1.5, facingAngle: -Math.PI / 2 },   // Tourist with Walkman — right bench
]

// Bench seat top is at world y=0.98 (SEAT_Y 0.95 + half of 0.06 thickness).
// Passenger's local origin sits at the HIP with thighs horizontal at y=0 and
// shins hanging down from y=−0.02 to y=−0.4. Putting the hip origin at seat
// top meant the thighs rendered ~5cm INSIDE the bench and the shins/shoes
// poked through the bench front panel. Lift the hip to bench-top + clearance.
const SEAT_Y = 1.08

export function AnimatedPassenger({
  variant,
  position,
  personalOffset,
  seed,
  facingAngle = 0,
}: {
  variant: number
  position: [number, number, number]
  personalOffset: number
  seed: number
  facingAngle?: number
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime

    // Tiny body sway from tram motion
    groupRef.current.rotation.z =
      Math.sin(t * 1.2 + personalOffset) * 0.025

    // Tourist actively looks around (additive to facing angle)
    if (variant === 5) {
      groupRef.current.rotation.y =
        facingAngle + Math.sin(t * 0.4 + personalOffset) * 0.3
    }
  })

  return (
    <group ref={groupRef} position={position} rotation={[0, facingAngle, 0]}>
      {renderVariant(variant, seed)}
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
          personalOffset={i * 1.7}
          seed={i * 7 + 3}
          facingAngle={seat.facingAngle}
        />
      ))}
    </group>
  )
}
