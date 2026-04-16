/**
 * Overhead catenary wires — two main contact wires (one per track) running
 * the length of the street, plus cross-hangers connecting to pole brackets.
 *
 * Uses thin boxGeometry (not cylinders) for wires — simpler rotation and
 * reliable visibility at distance with anti-aliasing.
 *
 * Wire height = 6.0m (just below pole bracket height at 6.5m).
 */

const WIRE_DARK = '#1a1a18'
const WIRE_MID = '#2a2a28'

const WIRE_HEIGHT = 6.0
const WIRE_LENGTH = 300
const WIRE_Z_CENTER = -75     // matches road/rails

// Main contact wire x positions — directly above each track center
const WIRE_X = [0, -2.9]     // user's track and oncoming track

const POLE_X = 2.85
const POLE_SPACING = 7
const HANGER_COUNT = 20       // matches pole count

export function CatenaryWires() {
  return (
    <group>
      {/* === MAIN CONTACT WIRES — one above each track === */}
      {WIRE_X.map((x, i) => (
        <mesh key={`main-${i}`} position={[x, WIRE_HEIGHT, WIRE_Z_CENTER]}>
          <boxGeometry args={[0.02, 0.02, WIRE_LENGTH]} />
          <meshStandardMaterial color={WIRE_DARK} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* === CROSS HANGERS — at each pole position === */}
      {Array.from({ length: HANGER_COUNT }, (_, i) => {
        const z = -i * POLE_SPACING
        const xSide = i % 2 === 0 ? POLE_X : -POLE_X
        const inward = xSide > 0 ? -1 : 1

        // Bracket insulator is at xSide + inward * 2.7
        const insulatorX = xSide + inward * 2.7

        // Connect insulator to nearest main wire
        const nearestWireX = Math.abs(insulatorX - WIRE_X[0]) < Math.abs(insulatorX - WIRE_X[1])
          ? WIRE_X[0]
          : WIRE_X[1]

        const dropMidX = (insulatorX + nearestWireX) / 2
        const dropLen = Math.abs(insulatorX - nearestWireX)

        return (
          <group key={`hanger-${i}`}>
            {/* Drop wire from bracket insulator to nearest main contact wire */}
            {dropLen > 0.1 && (
              <mesh position={[dropMidX, WIRE_HEIGHT, z]}>
                <boxGeometry args={[dropLen, 0.015, 0.015]} />
                <meshStandardMaterial color={WIRE_DARK} metalness={0.5} roughness={0.5} />
              </mesh>
            )}

            {/* Cross-span wire between the two main contact wires */}
            {i % 3 === 0 && (
              <mesh position={[-1.45, WIRE_HEIGHT + 0.15, z]}>
                <boxGeometry args={[2.9, 0.012, 0.012]} />
                <meshStandardMaterial color={WIRE_MID} metalness={0.4} roughness={0.5} />
              </mesh>
            )}
          </group>
        )
      })}

      {/* === SUSPENSION WIRE — runs parallel above the contact wires,
           provides the catenary support between poles === */}
      {WIRE_X.map((x, i) => (
        <mesh key={`sus-${i}`} position={[x, WIRE_HEIGHT + 0.3, WIRE_Z_CENTER]}>
          <boxGeometry args={[0.012, 0.012, WIRE_LENGTH]} />
          <meshStandardMaterial color={WIRE_MID} metalness={0.4} roughness={0.5} />
        </mesh>
      ))}

      {/* === VERTICAL DROPPER WIRES — connect suspension to contact wire === */}
      {Array.from({ length: 30 }, (_, i) => {
        const z = -i * 10 + 5  // every 10m
        return WIRE_X.map((x, j) => (
          <mesh key={`drop-${i}-${j}`} position={[x, WIRE_HEIGHT + 0.15, z]}>
            <boxGeometry args={[0.008, 0.3, 0.008]} />
            <meshStandardMaterial color={WIRE_DARK} metalness={0.5} roughness={0.5} />
          </mesh>
        ))
      })}
    </group>
  )
}
