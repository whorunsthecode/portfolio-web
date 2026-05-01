/**
 * Interior details that make the upper deck read as a real HK tram:
 * - Yellow vertical grab poles (the iconic element)
 * - Horizontal ceiling grab rail
 * - Ceiling lights (warm bulbs)
 * - Ad panels above windows
 * - Rear wall with opening
 *
 * Cabin: floor y=0.5, ceiling y=2.5, width=2.3, z from -9.25 to 3.25
 */

const FLOOR_Y = 0.5
const CEILING_Y = 2.5
const CABIN_WIDTH = 2.3
const Z_CENTER = -3
const Z_LENGTH = 12.5
const Z_END = Z_CENTER + Z_LENGTH / 2     // 3.25

const POLE_SILVER = '#c0c0c0'    // chrome/silver grab poles
const DARK_WOOD = '#3a2818'
const AD_CREAM = '#f0e6c8'
const AD_BORDER = '#5a3a1a'

export function CabinDetails() {
  return (
    <group>
      <VerticalPoles />
      <CeilingGrabRail />
      <CeilingLights />
      <AdPanels />
      <RearWall />
      <FloorDetails />
    </group>
  )
}

/* ── Yellow vertical grab poles — the most iconic HK tram element ── */
function VerticalPoles() {
  // Poles run from floor to ceiling in the aisle, evenly spaced
  const poleZs = [-7, -5, -3, -1, 1]

  return (
    <>
      {poleZs.map((z) => (
        <group key={`pole-${z}`}>
          {/* Main yellow pole — floor to ceiling */}
          <mesh position={[0, (FLOOR_Y + CEILING_Y) / 2, z]}>
            <cylinderGeometry args={[0.025, 0.025, CEILING_Y - FLOOR_Y, 12]} />
            <meshStandardMaterial color={POLE_SILVER} metalness={0.4} roughness={0.3} />
          </mesh>
          {/* Chrome cap at top */}
          <mesh position={[0, CEILING_Y - 0.02, z]}>
            <cylinderGeometry args={[0.035, 0.035, 0.04, 12]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.6} roughness={0.2} />
          </mesh>
          {/* Chrome cap at bottom */}
          <mesh position={[0, FLOOR_Y + 0.02, z]}>
            <cylinderGeometry args={[0.035, 0.035, 0.04, 12]} />
            <meshStandardMaterial color="#c0c0c0" metalness={0.6} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Additional poles near the staircase area at rear */}
      {[-0.4, 0.4].map((x) => (
        <mesh key={`stair-pole-${x}`} position={[x, (FLOOR_Y + CEILING_Y) / 2, Z_END - 0.8]}>
          <cylinderGeometry args={[0.025, 0.025, CEILING_Y - FLOOR_Y, 12]} />
          <meshStandardMaterial color={POLE_SILVER} metalness={0.4} roughness={0.3} />
        </mesh>
      ))}
    </>
  )
}

/* ── Horizontal ceiling grab rail running lengthwise ── */
function CeilingGrabRail() {
  const railY = CEILING_Y - 0.25
  const railLength = Z_LENGTH - 1.0

  return (
    <group>
      {/* Main horizontal rail — runs center of ceiling */}
      <mesh position={[0, railY, Z_CENTER]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, railLength, 8]} />
        <meshStandardMaterial color={POLE_SILVER} metalness={0.4} roughness={0.3} />
      </mesh>

      {/* Short support rods from ceiling to rail */}
      {[-7, -5, -3, -1, 1].map((z) => (
        <mesh key={`csup-${z}`} position={[0, railY + 0.12, z]}>
          <cylinderGeometry args={[0.012, 0.012, 0.25, 6]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.6} roughness={0.2} />
        </mesh>
      ))}

      {/* Two side rails — above each bench row */}
      {[-0.7, 0.7].map((x) => (
        <mesh key={`side-rail-${x}`} position={[x, railY, Z_CENTER]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.014, 0.014, railLength, 8]} />
          <meshStandardMaterial color={POLE_SILVER} metalness={0.4} roughness={0.3} />
        </mesh>
      ))}

      {/* Hanging leather straps from side rails (additional to bench straps) */}
      {[-0.7, 0.7].map((x) =>
        [-6, -4, -2, 0].map((z) => (
          <group key={`strap-${x}-${z}`} position={[x, railY - 0.05, z]}>
            <mesh>
              <boxGeometry args={[0.018, 0.12, 0.004]} />
              <meshStandardMaterial color="#3a2820" roughness={0.85} />
            </mesh>
            <mesh position={[0, -0.08, 0]}>
              <torusGeometry args={[0.03, 0.006, 6, 10]} />
              <meshStandardMaterial color="#3a2820" roughness={0.85} />
            </mesh>
          </group>
        ))
      )}
    </group>
  )
}

/* ── Ceiling lights — warm bulbs in simple fixtures ── */
function CeilingLights() {
  const lightZs = [-7, -4, -1, 2]

  return (
    <>
      {lightZs.map((z) => (
        <group key={`light-${z}`} position={[0, CEILING_Y - 0.1, z]}>
          {/* Fixture base */}
          <mesh>
            <cylinderGeometry args={[0.06, 0.06, 0.03, 8]} />
            <meshStandardMaterial color={DARK_WOOD} roughness={0.7} />
          </mesh>
          {/* Bulb — emissive warm glow */}
          <mesh position={[0, -0.04, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color="#ffe8b0" emissive="#ffe0a0" emissiveIntensity={0.8} />
          </mesh>
          {/* Actual light */}
          <pointLight
            position={[0, -0.1, 0]}
            color="#ffe0c0"
            intensity={0.4}
            distance={4}
            decay={2}
          />
        </group>
      ))}
    </>
  )
}

/* ── Ad panels above windows — cream rectangles with dark borders ── */
function AdPanels() {
  // Small ad panels sit between the top of windows (y≈2.1) and ceiling
  const panelY = 2.25
  const panelZs = [-6.5, -3.5, -0.5]

  return (
    <>
      {[-1, 1].map((side) => {
        const x = 1.1 * side
        return panelZs.map((z) => (
          <group key={`ad-${side}-${z}`} position={[x, panelY, z]}>
            {/* Border */}
            <mesh rotation={[0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}>
              <planeGeometry args={[1.8, 0.22]} />
              <meshStandardMaterial color={AD_BORDER} roughness={0.8} />
            </mesh>
            {/* Inner cream panel */}
            <mesh
              position={[side * -0.001, 0, 0]}
              rotation={[0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}
            >
              <planeGeometry args={[1.7, 0.18]} />
              <meshStandardMaterial color={AD_CREAM} roughness={0.7} />
            </mesh>
          </group>
        ))
      })}
    </>
  )
}

/* ── Rear wall with staircase opening ── */
function RearWall() {
  const rearZ = Z_END

  return (
    <group>
      {/* Upper portion of rear wall — cream */}
      <mesh position={[0, 2.0, rearZ]}>
        <boxGeometry args={[CABIN_WIDTH, 1.0, 0.06]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.7} />
      </mesh>

      {/* Lower wall sections on either side of staircase opening */}
      {[-0.75, 0.75].map((x) => (
        <mesh key={`rear-wall-${x}`} position={[x, 1.0, rearZ]}>
          <boxGeometry args={[0.7, 1.0, 0.06]} />
          <meshStandardMaterial color="#2a4838" roughness={0.6} />
        </mesh>
      ))}

      {/* Handrail across the staircase opening */}
      <mesh position={[0, 1.2, rearZ]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.02, 0.02, 0.8, 8]} />
        <meshStandardMaterial color={POLE_SILVER} metalness={0.4} roughness={0.3} />
      </mesh>
    </group>
  )
}

/* ── Floor details — dark rubber aisle strip, edge trim ── */
function FloorDetails() {
  return (
    <group>
      {/* Dark rubber aisle strip down the center */}
      <mesh position={[0, FLOOR_Y + 0.005, Z_CENTER]}>
        <boxGeometry args={[0.6, 0.01, Z_LENGTH - 0.5]} />
        <meshStandardMaterial color="#2a2828" roughness={0.9} />
      </mesh>

      {/* Lighter wood edge strips along the walls */}
      {[-1.05, 1.05].map((x) => (
        <mesh key={`edge-${x}`} position={[x, FLOOR_Y + 0.005, Z_CENTER]}>
          <boxGeometry args={[0.12, 0.01, Z_LENGTH - 0.5]} />
          <meshStandardMaterial color="#7a5a2a" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}
