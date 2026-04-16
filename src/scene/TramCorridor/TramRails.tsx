/**
 * Enhanced tram rails — four steel rails (two tracks) running down the road
 * with polished contact strips, concrete track beds, and periodic crossties.
 *
 * Rail positions match the existing Street.tsx layout exactly:
 *   Inner track (user's tram): x = -0.4, +0.4 (center 0, gauge 0.8)
 *   Outer track (oncoming):    x = -3.2, -2.6 (center -2.9, gauge 0.6)
 */

const RAIL_STEEL = '#5a5048'
const RAIL_SHINE = '#8a8278'
const TRACK_BED = '#3a322c'
const SLEEPER = '#2a221c'

const RAIL_LENGTH = 300
const RAIL_WIDTH = 0.07
const RAIL_HEIGHT = 0.04
const RAIL_Y = 0.07           // matches existing rail y position
const RAIL_Z_CENTER = -75     // road is centered at z=-75

// Existing rail positions (must match Street.tsx TramTracks)
const RAILS = [-3.2, -2.6, -0.4, 0.4]

// Track centers and gauges for bed/sleeper placement
const TRACKS = [
  { center: -2.9, gauge: 0.6 },  // outer (oncoming)
  { center: 0, gauge: 0.8 },     // inner (user's tram)
]

const SLEEPER_SPACING = 4
const SLEEPER_COUNT = 40

export function TramRails() {
  return (
    <group>
      {/* === STEEL RAILS — four rails with polished contact tops === */}
      {RAILS.map((x, i) => (
        <group key={`rail-${i}`}>
          {/* Rail body */}
          <mesh position={[x, RAIL_Y, RAIL_Z_CENTER]}>
            <boxGeometry args={[RAIL_WIDTH, RAIL_HEIGHT, RAIL_LENGTH]} />
            <meshStandardMaterial
              color={RAIL_STEEL}
              roughness={0.5}
              metalness={0.6}
            />
          </mesh>
          {/* Polished top strip — where wheels make contact, catches light */}
          <mesh position={[x, RAIL_Y + RAIL_HEIGHT / 2 + 0.002, RAIL_Z_CENTER]}>
            <boxGeometry args={[RAIL_WIDTH * 0.65, 0.005, RAIL_LENGTH]} />
            <meshStandardMaterial
              color={RAIL_SHINE}
              roughness={0.2}
              metalness={0.85}
            />
          </mesh>
        </group>
      ))}

      {/* === CONCRETE/TARMAC BED between each track's rails === */}
      {TRACKS.map((track, i) => (
        <mesh
          key={`bed-${i}`}
          position={[track.center, 0.052, RAIL_Z_CENTER]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[track.gauge - 0.04, RAIL_LENGTH]} />
          <meshStandardMaterial color={TRACK_BED} roughness={0.92} />
        </mesh>
      ))}

      {/* === CROSSTIES — subtle dark rectangles perpendicular to rails === */}
      {Array.from({ length: SLEEPER_COUNT }, (_, i) => {
        const z = -i * SLEEPER_SPACING + 8
        return (
          <group key={`tie-${i}`}>
            {TRACKS.map((track, j) => (
              <mesh
                key={`tie-${i}-${j}`}
                position={[track.center, 0.054, z]}
              >
                <boxGeometry args={[track.gauge + 0.16, 0.008, 0.14]} />
                <meshStandardMaterial color={SLEEPER} roughness={0.95} />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}
