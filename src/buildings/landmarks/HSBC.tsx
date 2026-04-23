import { useCityFacadeMaterial, CityFacadeMaterial } from '../CityFacade'
import { useStore } from '../../store'
import { InfoTag } from '../../scene/components/InfoTag'

/**
 * HSBC Main Building — Norman Foster, 1985. Defined by its structural
 * exoskeleton: no central core, all vertical loads transferred through
 * eight steel masts flanking the long sides, with floor plates hung off
 * the masts via triangular trusses at the "sky lobby" setback levels.
 *
 * Structure:
 *   Elevated 8m above ground (pedestrian plaza underneath)
 *   Tier 1 (widest, 29F)  y =  8..28
 *   Tier 2 (mid,   36F)  y = 28..44
 *   Tier 3 (top,   44F)  y = 44..58
 *   Logo pad + HSBC hex  y = 58..63
 *
 *   8 masts flank the long faces (4 on +Z, 4 on -Z)
 *   Triangular trusses at y=28 and y=44 (tier setbacks)
 *   X-bracing between adjacent masts per tier
 */

const STEEL = '#b4bcc4'
const STEEL_DARK = '#6a7480'
const HSBC_RED = '#d81e2a'
const HSBC_WHITE = '#f4f4f0'

function Mast({ x, z, height }: { x: number; z: number; height: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* Square steel box section, full height */}
      <mesh position={[0, height / 2, 0]} castShadow>
        <boxGeometry args={[0.55, height, 0.55]} />
        <meshStandardMaterial color={STEEL} roughness={0.5} metalness={0.55} />
      </mesh>
      {/* Darker shadow faces to read the section */}
      <mesh position={[0.28, height / 2, 0]}>
        <boxGeometry args={[0.02, height, 0.6]} />
        <meshStandardMaterial color={STEEL_DARK} roughness={0.65} metalness={0.5} />
      </mesh>
      <mesh position={[-0.28, height / 2, 0]}>
        <boxGeometry args={[0.02, height, 0.6]} />
        <meshStandardMaterial color={STEEL_DARK} roughness={0.65} metalness={0.5} />
      </mesh>
    </group>
  )
}

// X brace on a face between two adjacent masts. Face z fixed.
function XBrace({ x1, x2, yBot, yTop, z, thickness = 0.2 }: {
  x1: number; x2: number; yBot: number; yTop: number; z: number; thickness?: number
}) {
  const dx = x2 - x1
  const dy = yTop - yBot
  const len = Math.sqrt(dx * dx + dy * dy)
  const angle = Math.atan2(dy, dx)
  const cx = (x1 + x2) / 2
  const cy = (yBot + yTop) / 2
  return (
    <group position={[cx, cy, z]}>
      <mesh rotation={[0, 0, angle]}>
        <boxGeometry args={[len, thickness, 0.25]} />
        <meshStandardMaterial color={STEEL} roughness={0.5} metalness={0.55} />
      </mesh>
      <mesh rotation={[0, 0, -angle]}>
        <boxGeometry args={[len, thickness, 0.25]} />
        <meshStandardMaterial color={STEEL} roughness={0.5} metalness={0.55} />
      </mesh>
      {/* Central connector plate where the X crosses */}
      <mesh>
        <boxGeometry args={[0.4, 0.4, 0.3]} />
        <meshStandardMaterial color={STEEL_DARK} roughness={0.5} metalness={0.6} />
      </mesh>
    </group>
  )
}

// Triangular truss at a setback level — the big chevron that spans
// between adjacent masts. Carries the load of the tier above.
function Truss({ x1, x2, y, z }: { x1: number; x2: number; y: number; z: number }) {
  const dx = x2 - x1
  const cx = (x1 + x2) / 2
  const trussH = 1.6
  return (
    <group position={[cx, y, z]}>
      {/* Top chord — horizontal bar */}
      <mesh position={[0, trussH / 2, 0]}>
        <boxGeometry args={[dx, 0.28, 0.3]} />
        <meshStandardMaterial color={STEEL} roughness={0.5} metalness={0.55} />
      </mesh>
      {/* Bottom chord */}
      <mesh position={[0, -trussH / 2, 0]}>
        <boxGeometry args={[dx, 0.28, 0.3]} />
        <meshStandardMaterial color={STEEL} roughness={0.5} metalness={0.55} />
      </mesh>
      {/* Diagonal members — V then inverted V across the span */}
      {[-0.75, -0.25, 0.25, 0.75].map((t, i) => {
        const dirUp = i % 2 === 0
        const x0 = t * dx
        const x1b = (t + 0.25) * dx
        const yb = dirUp ? -trussH / 2 : trussH / 2
        const ytp = dirUp ? trussH / 2 : -trussH / 2
        const ddx = x1b - x0
        const ddy = ytp - yb
        const len = Math.sqrt(ddx * ddx + ddy * ddy)
        const a = Math.atan2(ddy, ddx)
        return (
          <mesh key={i} position={[(x0 + x1b) / 2, (yb + ytp) / 2, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[len, 0.18, 0.22]} />
            <meshStandardMaterial color={STEEL_DARK} roughness={0.55} metalness={0.55} />
          </mesh>
        )
      })}
    </group>
  )
}

function SupportColumn({ x, z, height }: { x: number; z: number; height: number }) {
  return (
    <mesh position={[x, height / 2, z]}>
      <cylinderGeometry args={[0.45, 0.55, height, 12]} />
      <meshStandardMaterial color={STEEL_DARK} roughness={0.55} metalness={0.55} />
    </mesh>
  )
}

function HsbcLogo({ y }: { y: number }) {
  // Classic HSBC hexagon — red + white diagonal halves.
  return (
    <group position={[0, y, 0]}>
      {/* Mounting plinth */}
      <mesh>
        <boxGeometry args={[4, 1, 3]} />
        <meshStandardMaterial color={'#2a2a2a'} roughness={0.7} />
      </mesh>
      {/* Hexagonal logo panel — simplified as two triangles */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[0, 1.4, s * 1.6]} rotation={[0, s === 1 ? 0 : Math.PI, 0]}>
          <boxGeometry args={[3.2, 2.2, 0.06]} />
          <meshStandardMaterial color={HSBC_WHITE} roughness={0.6} />
        </mesh>
      ))}
      {[1, -1].map((s) => (
        <mesh key={`r-${s}`} position={[0, 1.4, s * 1.63]} rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[2.2, 0.55, 0.02]} />
          <meshStandardMaterial
            color={HSBC_RED}
            emissive={HSBC_RED}
            emissiveIntensity={0.3}
            roughness={0.55}
          />
        </mesh>
      ))}
    </group>
  )
}

export function HSBC() {
  const mode = useStore((s) => s.mode)

  // Footprint + tier heights
  const BASE_Y = 8                 // elevated plaza clearance
  const T1_TOP = 28                // tier 1 (widest)
  const T2_TOP = 44                // tier 2 (mid)
  const T3_TOP = 58                // tier 3 (top)
  const LOGO_Y = T3_TOP + 0.5

  // Shrunk from 24×15×58 to fit alongside the tram route without
  // overflowing into the road or the tenement row. The tiers keep the
  // same proportions so the stepped silhouette still reads clearly.
  const T1_W = 13, T1_D = 8
  const T2_W = 11.5, T2_D = 7.5
  const T3_W = 9, T3_D = 6.5

  // Mast columns rescaled to the narrower footprint — 4 per long face
  const mastXs = [-5.6, -1.9, 1.9, 5.6]
  const mastZs = [-T1_D / 2 - 0.3, T1_D / 2 + 0.3]
  const MAST_H = T3_TOP

  const tier1Props = useCityFacadeMaterial({
    baseColor: [0.62, 0.66, 0.72],
    windowDensityX: 10,
    windowDensityY: 9,
    bandSpacing: 0.045,
    bracingType: 0,
    bracingColor: [0.8, 0.82, 0.85],
    bracingWidth: 0.02,
    tiers: 3,
    windowTint: [0.45, 0.55, 0.65],
    panelAlternate: false,
    seed: 301,
    nightLitFraction: 0.6,
    roughness: 0.5,
    metalness: 0.4,
  })
  const tier2Props = useCityFacadeMaterial({
    baseColor: [0.64, 0.68, 0.74],
    windowDensityX: 9,
    windowDensityY: 7,
    bandSpacing: 0.05,
    bracingType: 0,
    bracingColor: [0.8, 0.82, 0.85],
    bracingWidth: 0.02,
    tiers: 2,
    windowTint: [0.45, 0.55, 0.65],
    panelAlternate: false,
    seed: 302,
    nightLitFraction: 0.55,
    roughness: 0.5,
    metalness: 0.4,
  })
  const tier3Props = useCityFacadeMaterial({
    baseColor: [0.66, 0.7, 0.76],
    windowDensityX: 7,
    windowDensityY: 6,
    bandSpacing: 0.05,
    bracingType: 0,
    bracingColor: [0.8, 0.82, 0.85],
    bracingWidth: 0.02,
    tiers: 2,
    windowTint: [0.45, 0.55, 0.65],
    panelAlternate: false,
    seed: 303,
    nightLitFraction: 0.5,
    roughness: 0.5,
    metalness: 0.4,
  })

  return (
    <group>
      {/* Support columns lifting the building 8m above ground */}
      {mastXs.map((x) => mastZs.map((z) => (
        <SupportColumn key={`col-${x}-${z}`} x={x} z={z} height={BASE_Y} />
      )))}

      {/* ── Building body — three stepped tiers ── */}
      <mesh position={[0, (BASE_Y + T1_TOP) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[T1_W, T1_TOP - BASE_Y, T1_D]} />
        <CityFacadeMaterial matProps={tier1Props} />
      </mesh>
      <mesh position={[0, (T1_TOP + T2_TOP) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[T2_W, T2_TOP - T1_TOP, T2_D]} />
        <CityFacadeMaterial matProps={tier2Props} />
      </mesh>
      <mesh position={[0, (T2_TOP + T3_TOP) / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[T3_W, T3_TOP - T2_TOP, T3_D]} />
        <CityFacadeMaterial matProps={tier3Props} />
      </mesh>

      {/* ── Exoskeleton — 8 steel masts, 4 per long face ── */}
      {mastXs.map((x) => mastZs.map((z) => (
        <Mast key={`m-${x}-${z}`} x={x} z={z} height={MAST_H} />
      )))}

      {/* ── X-bracing between adjacent masts on each face, per tier ── */}
      {mastZs.map((z) => (
        <group key={`braces-${z}`}>
          {[0, 1, 2].map((i) => {
            const x1 = mastXs[i]
            const x2 = mastXs[i + 1]
            return (
              <group key={i}>
                <XBrace x1={x1} x2={x2} yBot={BASE_Y} yTop={T1_TOP - 1.5} z={z} />
                <XBrace x1={x1} x2={x2} yBot={T1_TOP + 1.5} yTop={T2_TOP - 1.5} z={z} thickness={0.18} />
                {/* Top tier — narrower, so only brace under the tier */}
                {Math.abs(x1) < T3_W / 2 && Math.abs(x2) < T3_W / 2 && (
                  <XBrace x1={x1} x2={x2} yBot={T2_TOP + 1.5} yTop={T3_TOP - 0.8} z={z} thickness={0.16} />
                )}
              </group>
            )
          })}
        </group>
      ))}

      {/* ── Triangular trusses at each setback level ── */}
      {mastZs.map((z) => (
        <group key={`truss-${z}`}>
          {[0, 1, 2].map((i) => {
            const x1 = mastXs[i]
            const x2 = mastXs[i + 1]
            return (
              <group key={i}>
                <Truss x1={x1} x2={x2} y={T1_TOP} z={z} />
                <Truss x1={x1} x2={x2} y={T2_TOP} z={z} />
              </group>
            )
          })}
        </group>
      ))}

      {/* ── Rooftop crown — maintenance cranes ("feng shui cannons") ── */}
      {[-1, 1].map((s) => (
        <group key={`crane-${s}`} position={[s * 5, T3_TOP + 0.5, 0]} rotation={[0, s > 0 ? -0.3 : 0.3, 0]}>
          {/* Crane base */}
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[1.2, 0.8, 1.2]} />
            <meshStandardMaterial color={'#3a3a3a'} roughness={0.7} />
          </mesh>
          {/* Crane arm pointing outward */}
          <mesh position={[s * 1.8, 1.1, 0]} rotation={[0, 0, -0.15 * s]}>
            <boxGeometry args={[3.0, 0.25, 0.25]} />
            <meshStandardMaterial color={'#8a8a8a'} metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Crane tip (the "cannon") */}
          <mesh position={[s * 3.3, 0.9, 0]}>
            <cylinderGeometry args={[0.18, 0.14, 0.8, 8]} />
            <meshStandardMaterial color={'#5a5a5a'} metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* ── HSBC hexagonal logo + night backlight ── */}
      <HsbcLogo y={LOGO_Y} />

      {/* ── Night accent: red LED outline on the exoskeleton ── */}
      {mode === 'night' && mastZs.map((z) => (
        <group key={`neon-${z}`}>
          {[0, 1, 2].map((i) => {
            const x1 = mastXs[i]
            const x2 = mastXs[i + 1]
            const cx = (x1 + x2) / 2
            const len = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(T1_TOP - BASE_Y, 2))
            const a = Math.atan2(T1_TOP - BASE_Y, x2 - x1)
            return (
              <mesh key={i} position={[cx, (BASE_Y + T1_TOP) / 2, z + Math.sign(z) * 0.05]} rotation={[0, 0, a]}>
                <planeGeometry args={[len, 0.15]} />
                <meshBasicMaterial color={'#ff2a3a'} transparent opacity={0.75} />
              </mesh>
            )
          })}
        </group>
      ))}

      <InfoTag
        label="HSBC Main Building · Norman Foster 1985"
        offset={[T1_W / 2 + 4, (BASE_Y + T3_TOP) / 2, 0]}
        side="right"
      />
    </group>
  )
}
