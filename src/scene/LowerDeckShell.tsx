const GREEN = '#007549'
const WOOD = '#5c3a1e'
const WOOD_DARK = '#4a3018'
const WOOD_LIGHT = '#6a4a2a'
const BRASS = '#d4b880'
const LEATHER = '#4a2818'

const LOWER_DECK_FLOOR_Y = -1.5
const LOWER_DECK_CEILING_Y = 0.42
const CABIN_WIDTH = 2.3
const CABIN_LENGTH = 13.5
const CABIN_Z_CENTER = -3

/* ── Lower floor ───────────────────────────────────────── */
function LowerFloor() {
  return (
    <mesh position={[0, LOWER_DECK_FLOOR_Y - 0.04, CABIN_Z_CENTER]} receiveShadow>
      <boxGeometry args={[CABIN_WIDTH, 0.08, CABIN_LENGTH]} />
      <meshStandardMaterial color={WOOD} roughness={0.85} />
    </mesh>
  )
}

/* ── Lower deck ceiling (underside of upper floor) ─────── */
function LowerDeckCeiling() {
  return (
    <mesh position={[0, LOWER_DECK_CEILING_Y, CABIN_Z_CENTER]}>
      <boxGeometry args={[CABIN_WIDTH, 0.04, CABIN_LENGTH]} />
      <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
    </mesh>
  )
}

/* ── Ceiling beams ─────────────────────────────────────── */
function LowerDeckBeams() {
  return (
    <>
      {[1, -1, -3, -5, -7].map((z) => (
        <mesh key={z} position={[0, LOWER_DECK_CEILING_Y - 0.05, z]}>
          <boxGeometry args={[CABIN_WIDTH, 0.08, 0.12]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.85} />
        </mesh>
      ))}
    </>
  )
}

/* ── Lower deck side walls ─────────────────────────────── */
function LowerWindowPanel({ side }: { side: 1 | -1 }) {
  const x = 1.125 * side
  const postZs = [3, 0.5, -2, -4.5, -7]

  return (
    <group>
      {/* Lower wainscoting — green tram paint */}
      <mesh position={[x, LOWER_DECK_FLOOR_Y + 0.3, CABIN_Z_CENTER]}>
        <boxGeometry args={[0.06, 0.6, CABIN_LENGTH]} />
        <meshStandardMaterial color={GREEN} roughness={0.6} />
      </mesh>

      {/* Window posts */}
      {postZs.map((z) => (
        <mesh key={z} position={[x, LOWER_DECK_FLOOR_Y + 1.15, z]}>
          <boxGeometry args={[0.05, 1.3, 0.05]} />
          <meshStandardMaterial color={GREEN} roughness={0.5} />
        </mesh>
      ))}

      {/* Top rail — just below the ceiling */}
      <mesh position={[x, LOWER_DECK_CEILING_Y - 0.08, CABIN_Z_CENTER]}>
        <boxGeometry args={[0.06, 0.06, CABIN_LENGTH]} />
        <meshStandardMaterial color={GREEN} roughness={0.5} />
      </mesh>

      {/* Bottom rail */}
      <mesh position={[x, LOWER_DECK_FLOOR_Y + 0.6, CABIN_Z_CENTER]}>
        <boxGeometry args={[0.06, 0.04, CABIN_LENGTH]} />
        <meshStandardMaterial color={GREEN} roughness={0.5} />
      </mesh>
    </group>
  )
}

/* ── Driver's cockpit ──────────────────────────────────── */
function DriverCockpit() {
  return (
    <group position={[0, LOWER_DECK_FLOOR_Y, -9.5]}>
      {/* Front panel */}
      <mesh position={[0, 0.6, 0]}>
        <boxGeometry args={[1.8, 1.0, 0.15]} />
        <meshStandardMaterial color={LEATHER} roughness={0.8} />
      </mesh>

      {/* Controller wheel — brass */}
      <mesh position={[-0.3, 0.8, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.015, 8, 16]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Brake lever */}
      <mesh position={[0.3, 0.9, 0.1]} rotation={[0, 0, Math.PI / 8]}>
        <cylinderGeometry args={[0.02, 0.02, 0.4, 8]} />
        <meshStandardMaterial color="#2a1a10" roughness={0.7} />
      </mesh>
      <mesh position={[0.35, 1.1, 0.1]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Bell pull rope */}
      <mesh position={[-0.8, 1.3, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.5, 6]} />
        <meshStandardMaterial color="#8a6a4a" roughness={0.8} />
      </mesh>

      {/* Driver's stool */}
      <mesh position={[0, 0.35, -0.3]}>
        <cylinderGeometry args={[0.15, 0.15, 0.1, 12]} />
        <meshStandardMaterial color={LEATHER} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.15, -0.3]}>
        <cylinderGeometry args={[0.04, 0.04, 0.3, 8]} />
        <meshStandardMaterial color="#3a3a3a" roughness={0.7} />
      </mesh>
    </group>
  )
}

/* ── Rear boarding area ────────────────────────────────── */
function RearBoardingArea() {
  return (
    <group position={[0, LOWER_DECK_FLOOR_Y, 3]}>
      {/* Door frame on the right side */}
      <mesh position={[0.9, 0.8, 0]}>
        <boxGeometry args={[0.04, 1.6, 0.9]} />
        <meshStandardMaterial color="#2a1a10" roughness={0.8} />
      </mesh>

      {/* Step up from pavement */}
      <mesh position={[1.0, 0.2, 0]}>
        <boxGeometry args={[0.3, 0.08, 0.8]} />
        <meshStandardMaterial color={WOOD_LIGHT} roughness={0.85} />
      </mesh>

      {/* Fare box */}
      <mesh position={[0.6, 0.8, -0.4]}>
        <boxGeometry args={[0.2, 0.5, 0.25]} />
        <meshStandardMaterial color="#2a4a2a" roughness={0.8} />
      </mesh>
      {/* Fare box slot */}
      <mesh position={[0.6, 1.0, -0.275]}>
        <boxGeometry args={[0.12, 0.03, 0.02]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  )
}

/* ── Standing-room hand straps ─────────────────────────── */
function LowerDeckStraps() {
  const zPositions = [1, -1, -3, -5]
  return (
    <>
      {zPositions.map((z) => (
        <group key={z} position={[0, LOWER_DECK_CEILING_Y - 0.2, z]}>
          <mesh position={[0, -0.12, 0]}>
            <boxGeometry args={[0.025, 0.22, 0.008]} />
            <meshStandardMaterial color={LEATHER} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.045, 0.008, 8, 16]} />
            <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </>
  )
}

/* ── Fold-down side seats ──────────────────────────────── */
function LowerDeckSideSeats() {
  return (
    <group>
      {[-5, -3].map((z) => (
        <group key={z} position={[-1.0, LOWER_DECK_FLOOR_Y + 0.4, z]}>
          <mesh>
            <boxGeometry args={[0.1, 0.04, 0.4]} />
            <meshStandardMaterial color={WOOD} roughness={0.85} />
          </mesh>
        </group>
      ))}
      <group position={[1.0, LOWER_DECK_FLOOR_Y + 0.4, -4]}>
        <mesh>
          <boxGeometry args={[0.1, 0.04, 0.4]} />
          <meshStandardMaterial color={WOOD} roughness={0.85} />
        </mesh>
      </group>
    </group>
  )
}

/* ── Interior light for lower deck ─────────────────────── */
function LowerDeckLight() {
  return (
    <pointLight
      position={[0, LOWER_DECK_CEILING_Y - 0.15, CABIN_Z_CENTER]}
      color="#ffe8c8"
      intensity={1.5}
      distance={12}
      decay={1.5}
    />
  )
}

/* ── Assemble ──────────────────────────────────────────── */
export function LowerDeckShell() {
  return (
    <group>
      <LowerFloor />
      <LowerDeckCeiling />
      <LowerDeckBeams />
      <LowerWindowPanel side={1} />
      <LowerWindowPanel side={-1} />
      <DriverCockpit />
      <RearBoardingArea />
      <LowerDeckStraps />
      <LowerDeckSideSeats />
      <LowerDeckLight />
    </group>
  )
}
