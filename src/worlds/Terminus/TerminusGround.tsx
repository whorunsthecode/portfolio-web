const ASPHALT = '#2a2824'
const ASPHALT_WORN = '#3a342c'
const CONCRETE_ISLAND = '#c8b898'
const ISLAND_EDGE = '#e8d4a8'
const YELLOW_HAZARD = '#e0b040'
const WHITE_STRIPE = '#dcd0b8'
const RAIL_STEEL = '#5a5048'
const RAIL_SHINE = '#8a8278'

const ISLAND_WIDTH = 1.8
const ISLAND_LENGTH = 8
const ISLAND_HEIGHT = 0.2

/**
 * Authentic HK tram stop ground — narrow concrete refuge island in the
 * middle of the road with kerb stones, hazard stripes, zebra crossings
 * at both ends, tram rails on both sides, and far sidewalks.
 */
export function TerminusGround() {
  return (
    <group>
      {/* === ROAD SURFACE === */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 20]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.9} />
      </mesh>

      {/* Worn asphalt patches near island */}
      {[
        { x: -3, z: 1, s: 4 },
        { x: 3, z: -1, s: 3 },
        { x: -4, z: -3, s: 3 },
      ].map((p, i) => (
        <mesh key={i} position={[p.x, 0.005, p.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[p.s, 12]} />
          <meshStandardMaterial color={ASPHALT_WORN} roughness={0.95} transparent opacity={0.5} />
        </mesh>
      ))}

      {/* === REFUGE ISLAND — raised concrete strip === */}
      <mesh position={[0, ISLAND_HEIGHT / 2, 0]} receiveShadow>
        <boxGeometry args={[ISLAND_WIDTH, ISLAND_HEIGHT, ISLAND_LENGTH]} />
        <meshStandardMaterial color={CONCRETE_ISLAND} roughness={0.9} />
      </mesh>

      {/* Island top surface — slightly lighter */}
      <mesh position={[0, ISLAND_HEIGHT + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[ISLAND_WIDTH - 0.1, ISLAND_LENGTH - 0.1]} />
        <meshStandardMaterial color="#d4c4a0" roughness={0.85} />
      </mesh>

      {/* Raised kerb stones along long edges */}
      {[-ISLAND_WIDTH / 2, ISLAND_WIDTH / 2].map((x, i) => (
        <mesh key={`kerb-${i}`} position={[x, ISLAND_HEIGHT / 2 + 0.02, 0]}>
          <boxGeometry args={[0.08, ISLAND_HEIGHT + 0.04, ISLAND_LENGTH]} />
          <meshStandardMaterial color={ISLAND_EDGE} roughness={0.85} />
        </mesh>
      ))}

      {/* Kerb stones on short ends */}
      {[-ISLAND_LENGTH / 2, ISLAND_LENGTH / 2].map((z, i) => (
        <mesh key={`end-${i}`} position={[0, ISLAND_HEIGHT / 2 + 0.02, z]}>
          <boxGeometry args={[ISLAND_WIDTH, ISLAND_HEIGHT + 0.04, 0.08]} />
          <meshStandardMaterial color={ISLAND_EDGE} roughness={0.85} />
        </mesh>
      ))}

      {/* === YELLOW HAZARD STRIPES on kerbs (faded) === */}
      {[-ISLAND_WIDTH / 2 - 0.04, ISLAND_WIDTH / 2 + 0.04].map((x, i) => (
        <mesh key={`hazard-${i}`} position={[x, ISLAND_HEIGHT + 0.05, 0]}>
          <boxGeometry args={[0.02, 0.02, ISLAND_LENGTH]} />
          <meshStandardMaterial color={YELLOW_HAZARD} roughness={0.85} />
        </mesh>
      ))}

      {/* === TRAM RAILS — on both sides of the island === */}
      {/* Left-hand track */}
      {[-2.5, -1.4].map((x, i) => (
        <group key={`rail-L-${i}`}>
          <mesh position={[x, 0.025, 0]}>
            <boxGeometry args={[0.06, 0.05, ISLAND_LENGTH + 12]} />
            <meshStandardMaterial color={RAIL_STEEL} roughness={0.5} metalness={0.6} />
          </mesh>
          <mesh position={[x, 0.055, 0]}>
            <boxGeometry args={[0.04, 0.005, ISLAND_LENGTH + 12]} />
            <meshStandardMaterial color={RAIL_SHINE} roughness={0.25} metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Right-hand track */}
      {[1.4, 2.5].map((x, i) => (
        <group key={`rail-R-${i}`}>
          <mesh position={[x, 0.025, 0]}>
            <boxGeometry args={[0.06, 0.05, ISLAND_LENGTH + 12]} />
            <meshStandardMaterial color={RAIL_STEEL} roughness={0.5} metalness={0.6} />
          </mesh>
          <mesh position={[x, 0.055, 0]}>
            <boxGeometry args={[0.04, 0.005, ISLAND_LENGTH + 12]} />
            <meshStandardMaterial color={RAIL_SHINE} roughness={0.25} metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* === ZEBRA CROSSINGS at both ends === */}
      {[-ISLAND_LENGTH / 2 - 1.5, ISLAND_LENGTH / 2 + 1.5].map((z, ci) => (
        <group key={`crossing-${ci}`}>
          {Array.from({ length: 8 }, (_, i) => (
            <mesh
              key={i}
              position={[-3.5 + i * 1.0, 0.01, z]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.5, 1.2]} />
              <meshStandardMaterial color={WHITE_STRIPE} roughness={0.85} />
            </mesh>
          ))}
        </group>
      ))}

      {/* === SIDEWALKS on far sides === */}
      {[-7, 7].map((x, i) => (
        <mesh key={`sw-${i}`} position={[x, 0.08, 0]} receiveShadow>
          <boxGeometry args={[2, 0.16, 20]} />
          <meshStandardMaterial color={CONCRETE_ISLAND} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}
