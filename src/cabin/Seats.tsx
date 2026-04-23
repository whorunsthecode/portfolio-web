/**
 * Authentic HK tram bench layout — two long benches facing each other
 * + three individual forward-facing seats at the rear.
 *
 * Upper deck coordinates (from CabinShell):
 *   Floor y=0.5, width=2.3, z-center=-3, length=12.5
 *   Front wall (Dashboard) at z=-10, rear at z≈3.25
 *   Window posts from z=3 to z=-7
 */

const FLOOR_Y = 0.5
const CABIN_HALF_WIDTH = 1.15       // 2.3 / 2
const CABIN_FRONT_Z = -9.25         // z-center - length/2
const CABIN_REAR_Z = -1.75          // z-center + length/2 (tram shortened to 9m)

const SEAT_WOOD = '#8a6a3a'
const SEAT_WOOD_DARK = '#5a4028'
const SEAT_LEATHER = '#3a2820'
const SEAT_FRAME = '#2a2828'
const BRASS = '#c8a048'

const SEAT_Y = FLOOR_Y + 0.45
const BACKREST_Y = FLOOR_Y + 0.9
const RAIL_Y = FLOOR_Y + 1.6
const SEAT_DEPTH = 0.35

// Bench region — leave front 2m for driver console, rear 1.5m for boarding + rear seats
const BENCH_FRONT_Z = CABIN_FRONT_Z + 2.0
const BENCH_REAR_Z = CABIN_REAR_Z - 1.5
const BENCH_LENGTH = BENCH_REAR_Z - BENCH_FRONT_Z

export function Seats() {
  return (
    <group>
      {/* Long bench — left side, closer to aisle for narrower tram feel */}
      <LongBench
        xPosition={-CABIN_HALF_WIDTH + 0.42}
        zCenter={(BENCH_FRONT_Z + BENCH_REAR_Z) / 2}
        length={BENCH_LENGTH}
        facing="right"
      />

      {/* Long bench — right side */}
      <LongBench
        xPosition={CABIN_HALF_WIDTH - 0.42}
        zCenter={(BENCH_FRONT_Z + BENCH_REAR_Z) / 2}
        length={BENCH_LENGTH}
        facing="left"
      />

      {/* Rear forward-facing seats removed — after the tram was
          shortened to 9m, these sat past the bench end in the rear
          boarding aisle and read as floating chairs. */}
    </group>
  )
}

function LongBench({
  xPosition,
  zCenter,
  length,
  facing,
}: {
  xPosition: number
  zCenter: number
  length: number
  facing: 'left' | 'right'
}) {
  const backrestXOffset = facing === 'right' ? -SEAT_DEPTH / 2 + 0.03 : SEAT_DEPTH / 2 - 0.03
  const aisleDirection = facing === 'right' ? 0.2 : -0.2

  return (
    <group position={[xPosition, 0, zCenter]}>
      {/* Seat surface */}
      <mesh position={[0, SEAT_Y, 0]}>
        <boxGeometry args={[SEAT_DEPTH, 0.06, length]} />
        <meshStandardMaterial color={SEAT_WOOD} roughness={0.8} />
      </mesh>

      {/* Wood slat detail */}
      {[-0.12, -0.04, 0.04, 0.12].map((x, i) => (
        <mesh key={`slat-${i}`} position={[x, SEAT_Y + 0.032, 0]}>
          <boxGeometry args={[0.006, 0.003, length - 0.05]} />
          <meshStandardMaterial color={SEAT_WOOD_DARK} />
        </mesh>
      ))}

      {/* Backrest */}
      <mesh position={[backrestXOffset, BACKREST_Y, 0]}>
        <boxGeometry args={[0.04, 0.5, length]} />
        <meshStandardMaterial color={SEAT_WOOD} roughness={0.8} />
      </mesh>

      {/* Backrest trim */}
      <mesh position={[backrestXOffset + (facing === 'right' ? 0.022 : -0.022), BACKREST_Y + 0.12, 0]}>
        <boxGeometry args={[0.005, 0.02, length - 0.05]} />
        <meshStandardMaterial color={SEAT_WOOD_DARK} />
      </mesh>

      {/* Metal legs every 1.2m */}
      {Array.from({ length: Math.floor(length / 1.2) + 1 }).map((_, i) => {
        const z = -length / 2 + i * 1.2
        if (Math.abs(z) > length / 2 - 0.1) return null
        return (
          <mesh key={`leg-${i}`} position={[0, FLOOR_Y + 0.22, z]}>
            <boxGeometry args={[SEAT_DEPTH - 0.05, 0.44, 0.025]} />
            <meshStandardMaterial color={SEAT_FRAME} metalness={0.4} roughness={0.6} />
          </mesh>
        )
      })}

      {/* Brass handrail above bench */}
      <mesh position={[aisleDirection * 1.8, RAIL_Y, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, length - 0.1, 8]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Brass vertical supports */}
      {Array.from({ length: Math.floor(length / 1.5) + 1 }).map((_, i) => {
        const z = -length / 2 + 0.4 + i * 1.5
        if (Math.abs(z) > length / 2 - 0.1) return null
        return (
          <mesh key={`sup-${i}`} position={[aisleDirection * 1.8, RAIL_Y + 0.18, z]}>
            <cylinderGeometry args={[0.014, 0.014, 0.35, 6]} />
            <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
          </mesh>
        )
      })}

      {/* Hanging leather straps every 1m */}
      {Array.from({ length: Math.floor(length / 1.0) + 1 }).map((_, i) => {
        const z = -length / 2 + 0.6 + i * 1.0
        if (Math.abs(z) > length / 2 - 0.3) return null
        return (
          <group key={`strap-${i}`} position={[aisleDirection * 1.8, RAIL_Y - 0.08, z]}>
            <mesh>
              <boxGeometry args={[0.02, 0.14, 0.004]} />
              <meshStandardMaterial color={SEAT_LEATHER} roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.09, 0]}>
              <torusGeometry args={[0.035, 0.007, 6, 12]} />
              <meshStandardMaterial color={SEAT_LEATHER} roughness={0.85} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

