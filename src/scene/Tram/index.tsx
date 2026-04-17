/**
 * Tram exterior shell — ALL GREEN like real HK ding-ding.
 *
 * The CabinShell already handles the upper deck (y=0.5-2.5) with
 * transparent glass windows and green posts. This exterior adds:
 * - Lower deck body (y=-1.7 to 0.5) — green with windows
 * - Roof trim above upper deck
 * - Front/rear faces with CLEAR windshields
 * - Undercarriage + wheels
 * - Trolley pole
 * - Fleet numbers, destination board
 *
 * NO solid panels at upper deck level — CabinShell handles that.
 */
import { Text } from '@react-three/drei'
import { FrontSide, DoubleSide } from 'three'

const GREEN = '#1a5838'
const CREAM = '#f0e6c8'
const FRAME = '#1a1a18'

const W = 2.5
const HW = W / 2
const Z_CENTER = -3
const Z_LEN = 14.0
const Z_FRONT = Z_CENTER - Z_LEN / 2   // -10
const Z_REAR = Z_CENTER + Z_LEN / 2    // 4

const LOWER_BOT = -1.7
const LOWER_TOP = 0.5
const UPPER_TOP = 2.55
const ROOF_Y = 2.65

export function TramExteriorShell() {
  return (
    <group>
      <LowerDeckExterior />
      <BeltLine />
      <UpperDeckExterior />
      <RoofExterior />
      <FrontFace />
      <RearFace />
      <Undercarriage />
      <TrolleyPole />
    </group>
  )
}

/* Cream belt-line at deck boundary — the visual break that says "double-decker" */
function BeltLine() {
  const beltY = 0.5
  const beltH = 0.14
  const beltW = W + 0.08  // ledge overhang, clearly past deck sides
  const beltLen = Z_LEN + 0.12 // overhang past front/rear
  return (
    <group>
      {/* Main cream belt — wraps all four sides */}
      <mesh position={[0, beltY, Z_CENTER]}>
        <boxGeometry args={[beltW, beltH, beltLen]} />
        <meshStandardMaterial color={CREAM} roughness={0.75} />
      </mesh>
      {/* Thin dark pinstripe along bottom edge for definition */}
      <mesh position={[0, beltY - beltH / 2 + 0.012, Z_CENTER]}>
        <boxGeometry args={[beltW + 0.004, 0.024, beltLen + 0.004]} />
        <meshStandardMaterial color={FRAME} roughness={0.7} />
      </mesh>
    </group>
  )
}

/* Upper deck exterior — thick green frame (bands + posts) with transparent glass. */
function UpperDeckExterior() {
  const uw = W - 0.04
  const uhw = uw / 2
  const uLen = Z_LEN - 0.5

  const botBandH = 0.5
  const topBandH = 0.45
  const botBandY = LOWER_TOP + botBandH / 2
  const topBandY = UPPER_TOP - topBandH / 2
  const winBottom = LOWER_TOP + botBandH
  const winTop = UPPER_TOP - topBandH
  const winH = winTop - winBottom
  const winCY = (winBottom + winTop) / 2

  const postZs = [3.5, 1.2, -1.1, -3.4, -5.7, -8.0, -9.5]

  return (
    <group>
      {[-1, 1].map((side) => {
        const x = side * uhw
        const rot: [number, number, number] = [0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]
        return (
          <group key={`upper-${side}`}>
            <mesh position={[x, botBandY, Z_CENTER]}>
              <boxGeometry args={[0.08, botBandH, uLen]} />
              <meshStandardMaterial color={GREEN} roughness={0.55} />
            </mesh>

            <mesh position={[x, topBandY, Z_CENTER]}>
              <boxGeometry args={[0.08, topBandH, uLen]} />
              <meshStandardMaterial color={GREEN} roughness={0.55} />
            </mesh>

            {postZs.map((pz) => (
              <mesh key={`up-${pz}`} position={[x, winCY, pz]}>
                <boxGeometry args={[0.08, winH, 0.1]} />
                <meshStandardMaterial color={GREEN} roughness={0.55} />
              </mesh>
            ))}

            {postZs.slice(0, -1).map((pz, i) => {
              const nz = postZs[i + 1]
              const mid = (pz + nz) / 2
              const span = Math.abs(pz - nz) - 0.14
              return (
                <mesh key={`ug-${i}`} position={[x + side * 0.01, winCY, mid]} rotation={rot}>
                  <planeGeometry args={[span, winH - 0.04]} />
                  <meshPhysicalMaterial color="#a8c8d0" transparent opacity={0.2} transmission={0.6} roughness={0.08} side={DoubleSide} />
                </mesh>
              )
            })}
          </group>
        )
      })}

      {/* Front upper */}
      <mesh position={[0, topBandY, Z_FRONT]}>
        <boxGeometry args={[uw, topBandH, 0.07]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      <mesh position={[0, botBandY, Z_FRONT]}>
        <boxGeometry args={[uw, botBandH, 0.07]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      {[-uhw + 0.1, uhw - 0.1].map((px, i) => (
        <mesh key={`fup-${i}`} position={[px, winCY, Z_FRONT]}>
          <boxGeometry args={[0.2, winH, 0.07]} />
          <meshStandardMaterial color={GREEN} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, winCY, Z_FRONT - 0.04]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[uw - 0.45, winH - 0.04]} />
        <meshPhysicalMaterial color="#e8f0f4" transparent opacity={0.1} transmission={0.9} roughness={0.03} side={DoubleSide} />
      </mesh>

      {/* Rear upper */}
      <mesh position={[0, topBandY, Z_REAR]}>
        <boxGeometry args={[uw, topBandH, 0.07]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      <mesh position={[0, botBandY, Z_REAR]}>
        <boxGeometry args={[uw, botBandH, 0.07]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      {[-uhw + 0.1, uhw - 0.1].map((px, i) => (
        <mesh key={`rup-${i}`} position={[px, winCY, Z_REAR]}>
          <boxGeometry args={[0.2, winH, 0.07]} />
          <meshStandardMaterial color={GREEN} roughness={0.55} />
        </mesh>
      ))}
      <mesh position={[0, winCY, Z_REAR + 0.04]}>
        <planeGeometry args={[uw - 0.45, winH - 0.04]} />
        <meshPhysicalMaterial color="#a8c8d0" transparent opacity={0.2} transmission={0.6} roughness={0.08} side={DoubleSide} />
      </mesh>

      <mesh position={[0, ROOF_Y + 0.15, Z_FRONT + 0.5]}>
        <boxGeometry args={[0.35, 0.25, 0.04]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.7} />
      </mesh>
    </group>
  )
}

/* Lower deck body — solid green with window cutouts. Below camera so doesn't block view */
function LowerDeckExterior() {
  const h = LOWER_TOP - LOWER_BOT  // 2.2
  const cy = (LOWER_BOT + LOWER_TOP) / 2

  // Cream skirt below windows, thin green trim above. Windows fill the middle band.
  const bottomStripH = 0.85  // CREAM skirt — taller so windows sit at realistic eye level
  const topStripH = 0.22     // thin green trim band at top (meets cream belt-line at y=0.5)
  const windowH = h - bottomStripH - topStripH
  const windowCY = LOWER_BOT + bottomStripH + windowH / 2

  return (
    <group>
      {[-1, 1].map((side) => {
        const x = side * HW
        const rot: [number, number, number] = [0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]
        return (
          <group key={`lower-${side}`}>
            {/* Bottom solid strip — CREAM skirt below windows */}
            <mesh position={[x, LOWER_BOT + bottomStripH / 2, Z_CENTER]}>
              <boxGeometry args={[0.07, bottomStripH, Z_LEN]} />
              <meshStandardMaterial color={CREAM} roughness={0.75} />
            </mesh>

            {/* Top thin strip — green */}
            <mesh position={[x, LOWER_TOP - topStripH / 2, Z_CENTER]}>
              <boxGeometry args={[0.07, topStripH, Z_LEN]} />
              <meshStandardMaterial color={GREEN} roughness={0.55} />
            </mesh>

            {/* Vertical posts between windows */}
            {Array.from({ length: 8 }, (_, i) => {
              const z = Z_FRONT + 1.0 + i * 1.65
              return (
                <mesh key={`lp-${i}`} position={[x + side * 0.001, windowCY, z]} rotation={rot}>
                  <planeGeometry args={[0.06, windowH]} />
                  <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
                </mesh>
              )
            })}

            {/* Tinted glass filling window spaces */}
            {Array.from({ length: 7 }, (_, i) => {
              const z = Z_FRONT + 1.0 + i * 1.65 + 0.825
              return (
                <mesh key={`lg-${i}`} position={[x, windowCY, z]} rotation={rot}>
                  <planeGeometry args={[1.5, windowH - 0.05]} />
                  <meshPhysicalMaterial color="#a0c0c8" transparent opacity={0.25} transmission={0.5} roughness={0.1} side={DoubleSide} />
                </mesh>
              )
            })}
          </group>
        )
      })}
    </group>
  )
}

/* Roof — just the top cap and edge trim */
function RoofExterior() {
  return (
    <group>
      {/* Flat roof panel */}
      <mesh position={[0, ROOF_Y, Z_CENTER]}>
        <boxGeometry args={[W - 0.1, 0.08, Z_LEN - 0.5]} />
        <meshStandardMaterial color="#c8bda8" roughness={0.75} side={FrontSide} />
      </mesh>
      {/* Green trim along roof edges */}
      {[-(W - 0.1) / 2, (W - 0.1) / 2].map((x, i) => (
        <mesh key={`rt-${i}`} position={[x, ROOF_Y - 0.02, Z_CENTER]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, Z_LEN - 0.5, 8]} />
          <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
        </mesh>
      ))}
    </group>
  )
}

/* Trolley pole — connects to overhead catenary */
function TrolleyPole() {
  return (
    <group position={[0, ROOF_Y + 0.04, Z_CENTER + 1]}>
      <mesh>
        <boxGeometry args={[0.2, 0.1, 0.2]} />
        <meshStandardMaterial color={FRAME} />
      </mesh>
      <mesh position={[0, 1.0, -0.7]} rotation={[Math.PI / 5, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2.2, 8]} />
        <meshStandardMaterial color="#2a2a28" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.85, -1.4]} rotation={[Math.PI / 5, 0, 0]}>
        <boxGeometry args={[0.1, 0.025, 0.2]} />
        <meshStandardMaterial color="#c8a048" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

/* Front face — green frame with CLEAR windshield openings */
function FrontFace() {
  const z = Z_FRONT - 0.01
  const lh = LOWER_TOP - LOWER_BOT
  const lcy = (LOWER_BOT + LOWER_TOP) / 2

  return (
    <group>
      {/* Lower front — green frame pieces around windshield */}
      {/* Bottom strip */}
      <mesh position={[0, LOWER_BOT + 0.2, Z_FRONT]}>
        <boxGeometry args={[W, 0.4, 0.06]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      {/* Top strip */}
      <mesh position={[0, LOWER_TOP - 0.06, Z_FRONT]}>
        <boxGeometry args={[W, 0.12, 0.06]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      {/* Left pillar */}
      <mesh position={[-HW + 0.12, lcy, Z_FRONT]}>
        <boxGeometry args={[0.24, lh, 0.06]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      {/* Right pillar */}
      <mesh position={[HW - 0.12, lcy, Z_FRONT]}>
        <boxGeometry args={[0.24, lh, 0.06]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      {/* Center pillar */}
      <mesh position={[0, lcy + 0.15, Z_FRONT]}>
        <boxGeometry args={[0.06, lh * 0.7, 0.06]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>

      {/* Lower windshield glass — CLEAR */}
      <mesh position={[0, lcy + 0.15, Z_FRONT]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W - 0.5, lh * 0.65]} />
        <meshPhysicalMaterial color="#e8f0f4" transparent opacity={0.1} transmission={0.9} roughness={0.03} side={DoubleSide} />
      </mesh>

      {/* Upper front — green frame */}
      <mesh position={[-HW + 0.1, (UPPER_TOP + LOWER_TOP) / 2, z]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.2, UPPER_TOP - LOWER_TOP]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      <mesh position={[HW - 0.1, (UPPER_TOP + LOWER_TOP) / 2, z]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.2, UPPER_TOP - LOWER_TOP]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      <mesh position={[0, UPPER_TOP - 0.06, z]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W, 0.12]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>

      {/* Upper windshield — clear */}
      <mesh position={[0, (UPPER_TOP + LOWER_TOP) / 2, z + 0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W - 0.4, UPPER_TOP - LOWER_TOP - 0.2]} />
        <meshPhysicalMaterial color="#e8f0f4" transparent opacity={0.1} transmission={0.9} roughness={0.03} side={DoubleSide} />
      </mesh>

      {/* Destination board */}
      <mesh position={[0, LOWER_TOP - 0.14, z - 0.005]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.4, 0.18]} />
        <meshStandardMaterial color="#d8e8f0" roughness={0.7} side={FrontSide} />
      </mesh>
      <Text position={[0, LOWER_TOP - 0.14, z - 0.01]} rotation={[0, Math.PI, 0]}
        fontSize={0.065} color="#1a2818" anchorX="center" anchorY="middle" fontWeight="bold">
        屈地街 WHITTY ST
      </Text>

      {/* Route 88 box */}
      <mesh position={[-0.6, LOWER_TOP - 0.12, z - 0.008]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.2, 0.2]} />
        <meshBasicMaterial color="#f8e8b8" />
      </mesh>
      <Text position={[-0.6, LOWER_TOP - 0.12, z - 0.012]} rotation={[0, Math.PI, 0]}
        fontSize={0.12} color="#a82020" anchorX="center" anchorY="middle" fontWeight="bold">
        88
      </Text>

      {/* Fleet number */}
      {[-0.85, 0.85].map((x, i) => (
        <Text key={`ffl-${i}`} position={[x, UPPER_TOP - 0.12, z - 0.008]} rotation={[0, Math.PI, 0]}
          fontSize={0.08} color={CREAM} anchorX="center" anchorY="middle" fontWeight="bold">
          088
        </Text>
      ))}

      {/* Headlights */}
      {[-0.45, 0.45].map((x, i) => (
        <mesh key={`hl-${i}`} position={[x, LOWER_BOT + 0.2, z - 0.005]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.07, 12]} />
          <meshBasicMaterial color="#ffecb8" />
        </mesh>
      ))}

      {/* Bottom fleet number */}
      <Text position={[0, LOWER_BOT + 0.12, z - 0.008]} rotation={[0, Math.PI, 0]}
        fontSize={0.09} color={CREAM} anchorX="center" anchorY="middle" fontWeight="bold">
        088
      </Text>

      {/* Bumper */}
      <mesh position={[0, LOWER_BOT + 0.03, Z_FRONT]}>
        <boxGeometry args={[W, 0.1, 0.05]} />
        <meshStandardMaterial color={FRAME} roughness={0.6} metalness={0.3} side={FrontSide} />
      </mesh>
    </group>
  )
}

/* Rear face — similar frame construction */
function RearFace() {
  const z = Z_REAR + 0.01
  const lh = LOWER_TOP - LOWER_BOT
  const lcy = (LOWER_BOT + LOWER_TOP) / 2

  return (
    <group>
      {/* Lower rear frame */}
      <mesh position={[0, LOWER_BOT + 0.2, z]}>
        <planeGeometry args={[W, 0.4]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      <mesh position={[0, LOWER_TOP - 0.06, z]}>
        <planeGeometry args={[W, 0.12]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      <mesh position={[-HW + 0.12, lcy, z]}>
        <planeGeometry args={[0.24, lh]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      <mesh position={[HW - 0.12, lcy, z]}>
        <planeGeometry args={[0.24, lh]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>

      {/* Rear glass */}
      <mesh position={[0, lcy + 0.15, z - 0.001]}>
        <planeGeometry args={[W - 0.5, lh * 0.65]} />
        <meshPhysicalMaterial color="#a0c0c8" transparent opacity={0.2} transmission={0.6} roughness={0.1} side={DoubleSide} />
      </mesh>

      {/* Upper rear frame */}
      <mesh position={[-HW + 0.1, (UPPER_TOP + LOWER_TOP) / 2, z]}>
        <planeGeometry args={[0.2, UPPER_TOP - LOWER_TOP]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      <mesh position={[HW - 0.1, (UPPER_TOP + LOWER_TOP) / 2, z]}>
        <planeGeometry args={[0.2, UPPER_TOP - LOWER_TOP]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      <mesh position={[0, UPPER_TOP - 0.06, z]}>
        <planeGeometry args={[W, 0.12]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>

      {/* Upper rear glass */}
      <mesh position={[0, (UPPER_TOP + LOWER_TOP) / 2, z - 0.001]}>
        <planeGeometry args={[W - 0.4, UPPER_TOP - LOWER_TOP - 0.2]} />
        <meshPhysicalMaterial color="#a0c0c8" transparent opacity={0.2} transmission={0.6} roughness={0.1} side={DoubleSide} />
      </mesh>

      {/* Tail lights */}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={`tl-${i}`} position={[x, LOWER_BOT + 0.25, z + 0.005]}>
          <circleGeometry args={[0.055, 10]} />
          <meshBasicMaterial color="#c82020" />
        </mesh>
      ))}

      {/* Fleet number */}
      <Text position={[0, LOWER_BOT + 0.12, z + 0.008]}
        fontSize={0.09} color={CREAM} anchorX="center" anchorY="middle" fontWeight="bold">
        088
      </Text>

      {/* Bumper */}
      <mesh position={[0, LOWER_BOT + 0.03, Z_REAR]}>
        <boxGeometry args={[W, 0.1, 0.05]} />
        <meshStandardMaterial color={FRAME} roughness={0.6} metalness={0.3} side={FrontSide} />
      </mesh>
    </group>
  )
}

/* Wheels and undercarriage */
function Undercarriage() {
  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh key={`sk-${side}`}
          position={[side * HW, LOWER_BOT - 0.15, Z_CENTER]}
          rotation={[0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <planeGeometry args={[Z_LEN - 0.4, 0.3]} />
          <meshStandardMaterial color="#1a2a20" roughness={0.7} side={FrontSide} />
        </mesh>
      ))}
      {[Z_FRONT + 2, Z_REAR - 2].map((bz, i) => (
        <group key={`bg-${i}`} position={[0, LOWER_BOT - 0.3, bz]}>
          <mesh>
            <boxGeometry args={[W - 0.3, 0.15, 1.2]} />
            <meshStandardMaterial color="#0a0a08" roughness={0.6} metalness={0.3} />
          </mesh>
          {[[-0.55, -0.45], [0.55, -0.45], [-0.55, 0.45], [0.55, 0.45]].map(([wx, wz], j) => (
            <mesh key={j} position={[wx, -0.04, wz]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.16, 0.16, 0.09, 12]} />
              <meshStandardMaterial color="#1a1a18" roughness={0.5} metalness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
