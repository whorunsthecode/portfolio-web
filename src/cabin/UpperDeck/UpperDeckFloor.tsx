/**
 * Upper deck floor — sits on top of the lower deck ceiling (y=2.5).
 * Wood plank deck matching the lower deck aesthetic.
 */

const WOOD = '#5c3a1e'
const WOOD_DARK = '#3a2414'

const FLOOR_Y = 0.75          // 2.55 - 1.8 cabin group offset; world y = 2.55
const FLOOR_LENGTH = 7.5
const FLOOR_WIDTH = 2.2
const Z_CENTER = -5.5
const STAIR_Z = -2.5

export function UpperDeckFloor() {
  return (
    <group>
      {/* Main deck plank */}
      <mesh position={[0, FLOOR_Y, Z_CENTER]} receiveShadow>
        <boxGeometry args={[FLOOR_WIDTH, 0.06, FLOOR_LENGTH]} />
        <meshStandardMaterial color={WOOD} roughness={0.85} />
      </mesh>
      {/* Staircase opening */}
      <mesh position={[0, FLOOR_Y + 0.04, STAIR_Z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.75, 20]} />
        <meshBasicMaterial color="#0a0604" />
      </mesh>
      {/* Center aisle darker runner */}
      <mesh position={[0, FLOOR_Y + 0.032, Z_CENTER]}>
        <boxGeometry args={[0.55, 0.005, FLOOR_LENGTH - 0.2]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
      </mesh>
      {/* Plank grooves running length-wise for detail */}
      {[-0.7, -0.35, 0.35, 0.7].map((x, i) => (
        <mesh key={`plank-${i}`} position={[x, FLOOR_Y + 0.031, Z_CENTER]}>
          <boxGeometry args={[0.008, 0.003, FLOOR_LENGTH - 0.3]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.95} />
        </mesh>
      ))}
    </group>
  )
}
