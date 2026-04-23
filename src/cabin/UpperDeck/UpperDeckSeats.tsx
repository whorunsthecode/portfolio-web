/**
 * Upper deck seats — two rows of FORWARD-FACING bench pairs, center aisle.
 * Matches reference HK Tram #88 upper deck layout: passengers sit facing
 * the driver end (-Z), in pairs on either side of a narrow central aisle.
 *
 * Coords: floor y=2.55, seat surface y=2.95, headrest y=3.45.
 */

const SEAT_WOOD = '#8a6a3a'
const SEAT_WOOD_DARK = '#5a4028'
const SEAT_FRAME = '#2a2828'
const BRASS = '#c8a048'

const FLOOR_Y = 0.75          // 2.55 - 1.8 cabin group offset; world y = 2.55
const SEAT_Y = FLOOR_Y + 0.45      // world 3.0
const BACKREST_Y = FLOOR_Y + 0.85  // world 3.4
const SEAT_DEPTH = 0.45            // along Z (front-to-back of seat)
const SEAT_WIDTH = 0.45            // along X (each seat)

// Forward-facing seat rows along the tram length. Trimmed to 4 rows
// after the tram was shortened to 9m (Z_END=-1.75); the old back rows
// at z=1.5, z=0, z=-1.5 were past the new rear wall and read as
// floating seats in mid-air.
const ROW_ZS = [-3.0, -4.5, -6.0, -7.5]

const SIDE_X_OUTER = 0.85   // outer seat x from center
const SIDE_X_INNER = 0.38   // inner seat x (against aisle)

export function UpperDeckSeats() {
  return (
    <group>
      {ROW_ZS.map((z, i) => (
        <group key={`row-${i}`}>
          {/* Left pair (outer + inner) */}
          <ForwardBenchPair x={-SIDE_X_OUTER} z={z} />
          {/* Right pair */}
          <ForwardBenchPair x={SIDE_X_OUTER} z={z} />
        </group>
      ))}

      {/* Aisle ceiling grab rail — brass, running length-wise. Trimmed
          to 5.5m after the tram was shortened. */}
      <mesh position={[0, FLOOR_Y + 1.5, -5.25]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 5.5, 10]} />
        <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
      </mesh>

      {/* Hanging straps */}
      {ROW_ZS.map((z, i) => (
        <group key={`strap-${i}`} position={[0, FLOOR_Y + 1.42, z + 0.3]}>
          <mesh>
            <boxGeometry args={[0.02, 0.16, 0.005]} />
            <meshStandardMaterial color="#3a2820" roughness={0.85} />
          </mesh>
          <mesh position={[0, -0.1, 0]}>
            <torusGeometry args={[0.04, 0.008, 6, 14]} />
            <meshStandardMaterial color="#3a2820" roughness={0.85} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Two forward-facing seats side by side (one bench pair). */
function ForwardBenchPair({ x, z }: { x: number; z: number }) {
  const innerX = x > 0 ? SIDE_X_INNER : -SIDE_X_INNER

  return (
    <group>
      {[x, innerX].map((sx, i) => (
        <group key={`seat-${i}`} position={[sx, 0, z]}>
          {/* Seat cushion */}
          <mesh position={[0, SEAT_Y, 0]}>
            <boxGeometry args={[SEAT_WIDTH, 0.08, SEAT_DEPTH]} />
            <meshStandardMaterial color={SEAT_WOOD} roughness={0.85} />
          </mesh>
          {/* Wood slats on cushion surface */}
          {[-0.14, -0.07, 0, 0.07, 0.14].map((sz, si) => (
            <mesh key={`cslat-${si}`} position={[0, SEAT_Y + 0.042, sz]}>
              <boxGeometry args={[SEAT_WIDTH - 0.04, 0.003, 0.005]} />
              <meshStandardMaterial color={SEAT_WOOD_DARK} />
            </mesh>
          ))}
          {/* Backrest (behind the seat, so +Z side since facing forward means -Z is front) */}
          <mesh position={[0, BACKREST_Y, SEAT_DEPTH / 2 - 0.03]}>
            <boxGeometry args={[SEAT_WIDTH, 0.5, 0.04]} />
            <meshStandardMaterial color={SEAT_WOOD} roughness={0.85} />
          </mesh>
          {/* Backrest vertical slats */}
          {[-0.12, 0, 0.12].map((bx, bi) => (
            <mesh key={`bslat-${bi}`} position={[bx, BACKREST_Y, SEAT_DEPTH / 2 - 0.01]}>
              <boxGeometry args={[0.004, 0.46, 0.006]} />
              <meshStandardMaterial color={SEAT_WOOD_DARK} />
            </mesh>
          ))}
          {/* Brass grab handle on top of backrest */}
          <mesh position={[0, BACKREST_Y + 0.27, SEAT_DEPTH / 2 - 0.03]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.015, 0.015, SEAT_WIDTH - 0.04, 8]} />
            <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.35} />
          </mesh>
          {/* Metal leg/frame under seat */}
          <mesh position={[0, FLOOR_Y + 0.22, 0]}>
            <boxGeometry args={[SEAT_WIDTH - 0.06, 0.44, 0.03]} />
            <meshStandardMaterial color={SEAT_FRAME} metalness={0.4} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
