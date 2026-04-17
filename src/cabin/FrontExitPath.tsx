/**
 * Front-exit path — the walk-forward aisle past the driver to the
 * left-side exit door. Reference: in real HK trams, boarding is at
 * the REAR and exit is at the FRONT-LEFT, past the driver's cabin.
 * Passengers drop coins/tap card at a farebox beside the driver,
 * then step down through a single hinged door to the street.
 *
 * Period: 1982 — wood + brass + painted steel + paper farebox.
 * No stainless steel, no Octopus.
 *
 * Cabin layout:
 *   floor y=0.5, ceiling y=2.5, front wall z=-10
 *   driver console at x=0, z≈-9.75
 *   cabin walls x=±1.15
 *
 * Exit is on the LEFT (x=-1.15 side), between the driver and the
 * front wall.
 */

import { Text } from '@react-three/drei'
import { DoubleSide } from 'three'

const FLOOR_Y = 0.5
const CABIN_FRONT_Z = -10
const CABIN_LEFT_X = -1.15       // exit is on the left flank

const WOOD_TEAK = '#6a3a20'
const WOOD_TEAK_DARK = '#4a2818'
const PAINTED_STEEL = '#dcd6c0'
const BRASS = '#c8a048'
const GREEN = '#0d6b3a'

export function FrontExitPath() {
  const doorZ = CABIN_FRONT_Z + 0.55 // slight z offset back from front wall
  const exitX = CABIN_LEFT_X         // -1.15
  const doorH = 1.8
  const doorCY = FLOOR_Y + doorH / 2 + 0.05

  return (
    <group>
      {/* ── Exit door opening: dark panel suggests open sky / street ── */}
      <mesh position={[exitX - 0.02, doorCY, doorZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.9, doorH]} />
        <meshStandardMaterial color="#1a1410" side={DoubleSide} />
      </mesh>

      {/* ── Hinged exit door (swung open outward) ─────────────────── */}
      <group
        position={[exitX, doorCY, doorZ - 0.45]}
        rotation={[0, -Math.PI / 2.3, 0]}
      >
        {/* Green painted steel door panel */}
        <mesh position={[-0.3, 0, 0]}>
          <boxGeometry args={[0.6, doorH, 0.04]} />
          <meshStandardMaterial color={GREEN} roughness={0.55} />
        </mesh>
        {/* Upper translucent glass window */}
        <mesh position={[-0.3, 0.35, 0.022]}>
          <planeGeometry args={[0.48, 0.75]} />
          <meshPhysicalMaterial
            color="#c8dce0"
            transparent
            opacity={0.25}
            transmission={0.6}
            roughness={0.08}
            side={DoubleSide}
          />
        </mesh>
        {/* Brass horizontal push bar */}
        <mesh position={[-0.5, -0.1, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.3, 8]} />
          <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
        </mesh>
      </group>

      {/* ── Farebox on a teak post beside the driver ──────────────── */}
      {/* Teak post */}
      <mesh position={[exitX + 0.2, FLOOR_Y + 0.55, doorZ + 0.7]}>
        <boxGeometry args={[0.08, 1.1, 0.08]} />
        <meshStandardMaterial color={WOOD_TEAK} roughness={0.5} />
      </mesh>
      {/* Brass base + cap */}
      <mesh position={[exitX + 0.2, FLOOR_Y + 0.05, doorZ + 0.7]}>
        <boxGeometry args={[0.12, 0.08, 0.12]} />
        <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[exitX + 0.2, FLOOR_Y + 1.07, doorZ + 0.7]}>
        <boxGeometry args={[0.1, 0.06, 0.1]} />
        <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
      </mesh>

      {/* Paper farebox — green metal box */}
      <group position={[exitX + 0.2, FLOOR_Y + 0.9, doorZ + 0.7]}>
        <mesh>
          <boxGeometry args={[0.16, 0.26, 0.14]} />
          <meshStandardMaterial color="#2a5a3a" roughness={0.8} />
        </mesh>
        {/* Coin slot — facing the aisle (+X) */}
        <mesh position={[0.081, 0.06, 0]}>
          <boxGeometry args={[0.003, 0.012, 0.08]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
        </mesh>
        {/* "收費 $1.20" label */}
        <Text position={[0.082, -0.02, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.025} color="#f0e6c8" anchorX="center" anchorY="middle" fontWeight="bold">
          收費 FARE
        </Text>
        <Text position={[0.082, -0.06, 0]} rotation={[0, Math.PI / 2, 0]} fontSize={0.032} color="#f8dd66" anchorX="center" anchorY="middle" fontWeight="bold">
          $1.20
        </Text>
        {/* Brass corner rivets */}
        {[-1, 1].flatMap((sy) =>
          [-1, 1].map((sz) => (
            <mesh key={`rivet-${sy}-${sz}`} position={[0.08, sy * 0.1, sz * 0.055]}>
              <sphereGeometry args={[0.008, 6, 6]} />
              <meshStandardMaterial color={BRASS} metalness={0.8} roughness={0.3} />
            </mesh>
          )),
        )}
      </group>

      {/* ── Brass grab handrail along the exit aisle ──────────────── */}
      {/* Vertical pole at the forward end (by the door) */}
      <mesh position={[exitX + 0.15, FLOOR_Y + 1.0, doorZ]}>
        <cylinderGeometry args={[0.018, 0.018, 1.8, 10]} />
        <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
      </mesh>
      {/* Horizontal rail along the exit aisle ceiling */}
      <mesh position={[exitX + 0.2, FLOOR_Y + 1.85, doorZ + 0.35]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.7, 10]} />
        <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
      </mesh>
      {/* Hanging leather strap at the exit */}
      <group position={[exitX + 0.2, FLOOR_Y + 1.77, doorZ + 0.35]}>
        <mesh>
          <boxGeometry args={[0.02, 0.14, 0.004]} />
          <meshStandardMaterial color="#3a2820" roughness={0.85} />
        </mesh>
        <mesh position={[0, -0.09, 0]}>
          <torusGeometry args={[0.035, 0.008, 6, 12]} />
          <meshStandardMaterial color="#3a2820" roughness={0.85} />
        </mesh>
      </group>

      {/* ── Boarding step (painted steel plate with safety edge) ── */}
      <mesh position={[exitX - 0.2, FLOOR_Y - 0.08, doorZ]}>
        <boxGeometry args={[0.5, 0.04, 0.9]} />
        <meshStandardMaterial color={PAINTED_STEEL} metalness={0.15} roughness={0.7} />
      </mesh>
      {/* Safety-yellow edge strip on the outer rim of the step */}
      <mesh position={[exitX - 0.44, FLOOR_Y - 0.06, doorZ]}>
        <boxGeometry args={[0.02, 0.005, 0.9]} />
        <meshStandardMaterial color="#e8c048" roughness={0.7} />
      </mesh>

      {/* ── "出 EXIT" painted text on the step (amber paint) ────── */}
      <Text
        position={[exitX - 0.2, FLOOR_Y - 0.058, doorZ]}
        rotation={[-Math.PI / 2, 0, -Math.PI / 2]}
        fontSize={0.06}
        color="#c89028"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        出  EXIT
      </Text>

      {/* ── Small "落車 DROP FARE" sign on the farebox post ──── */}
      <group position={[exitX + 0.165, FLOOR_Y + 1.25, doorZ + 0.7]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <planeGeometry args={[0.2, 0.1]} />
          <meshStandardMaterial color="#f0e6c8" roughness={0.7} side={DoubleSide} />
        </mesh>
        <Text position={[0, 0.018, 0.002]} fontSize={0.022} color="#1a1410" anchorX="center" anchorY="middle" fontWeight="bold">
          落車
        </Text>
        <Text position={[0, -0.022, 0.002]} fontSize={0.018} color="#1a1410" anchorX="center" anchorY="middle">
          DROP FARE
        </Text>
      </group>

      {/* ── Teak chair-rail dado along the exit aisle wall ────── */}
      <mesh position={[exitX - 0.005, FLOOR_Y + 0.55, doorZ + 0.7]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.1, 0.35, 0.04]} />
        <meshStandardMaterial color={WOOD_TEAK} roughness={0.5} />
      </mesh>
      {/* Dark trim lines top + bottom of dado */}
      <mesh position={[exitX - 0.007, FLOOR_Y + 0.72, doorZ + 0.7]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.1, 0.018, 0.003]} />
        <meshStandardMaterial color={WOOD_TEAK_DARK} roughness={0.8} />
      </mesh>
      <mesh position={[exitX - 0.007, FLOOR_Y + 0.38, doorZ + 0.7]} rotation={[0, Math.PI / 2, 0]}>
        <boxGeometry args={[1.1, 0.018, 0.003]} />
        <meshStandardMaterial color={WOOD_TEAK_DARK} roughness={0.8} />
      </mesh>
    </group>
  )
}
