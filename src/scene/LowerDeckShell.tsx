const GREEN = '#007549'
const WOOD = '#5c3a1e'
const WOOD_DARK = '#4a3018'
const WOOD_LIGHT = '#6a4a2a'
const BRASS = '#d4b880'
const LEATHER = '#4a2818'

const LOWER_DECK_FLOOR_Y = -1.5
const LOWER_DECK_CEILING_Y = 0.42
const CABIN_WIDTH = 2.3
const CABIN_LENGTH = 8.5
const CABIN_Z_CENTER = -5.5

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
      {[-2, -4, -6, -8].map((z) => (
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
  const postZs = [-2, -4.5, -7]

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

/* ── Open rear platform — iconic HK tram feature ─────── */
function RearBoardingArea() {
  const rearZ = -2.0
  return (
    <group position={[0, LOWER_DECK_FLOOR_Y, 0]}>
      {/* Half-height side barriers (waist-high, not full walls) */}
      <mesh position={[-CABIN_WIDTH / 2 + 0.15, 0.5, rearZ]}>
        <boxGeometry args={[0.3, 1.0, 0.05]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      <mesh position={[CABIN_WIDTH / 2 - 0.15, 0.5, rearZ]}>
        <boxGeometry args={[0.3, 1.0, 0.05]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>

      {/* Central grab pole — tall brass pole */}
      <mesh position={[0, 1.0, rearZ + 0.05]}>
        <cylinderGeometry args={[0.03, 0.03, 2.0, 10]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Platform step extending beyond cabin */}
      <mesh position={[0, 0.02, rearZ + 0.2]}>
        <boxGeometry args={[CABIN_WIDTH - 0.2, 0.04, 0.4]} />
        <meshStandardMaterial color={WOOD_LIGHT} roughness={0.85} />
      </mesh>

      {/* Anti-slip brass strips on step */}
      {[-0.5, -0.25, 0, 0.25, 0.5].map((xp, i) => (
        <mesh key={`strip-${i}`} position={[xp, 0.045, rearZ + 0.2]}>
          <boxGeometry args={[0.08, 0.005, 0.38]} />
          <meshStandardMaterial color={BRASS} roughness={0.8} />
        </mesh>
      ))}

      {/* Fare box */}
      <mesh position={[0.6, 0.8, rearZ - 0.4]}>
        <boxGeometry args={[0.2, 0.5, 0.25]} />
        <meshStandardMaterial color="#2a4a2a" roughness={0.8} />
      </mesh>
      <mesh position={[0.6, 1.0, rearZ - 0.275]}>
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
      <RearBoardingArea />
      <LowerDeckStraps />
      <LowerDeckSideSeats />
      <LowerDeckLight />
    </group>
  )
}
