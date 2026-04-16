const WOOD = '#5c3a1e'
const WOOD_LIGHT = '#8b6b3d'
const CREAM = '#f4e4c8'
const GREEN = '#007549'

/* ── Floor ─────────────────────────────────────────────── */
function Floor() {
  return (
    <mesh position={[0, 0.5, -3]} receiveShadow>
      <boxGeometry args={[2.3, 0.08, 12.5]} />
      <meshStandardMaterial color={WOOD} roughness={0.85} />
    </mesh>
  )
}

/* ── Ceiling — dark wood like reference photos ─────────── */
function Ceiling() {
  return (
    <mesh position={[0, 2.5, -3]}>
      <boxGeometry args={[2.3, 0.08, 12.5]} />
      <meshStandardMaterial color="#3a2a1a" roughness={0.85} />
    </mesh>
  )
}

/* ── Ceiling beams — thicker so they're visible ────────── */
function CeilingBeams() {
  const zPositions = [1, -1, -3, -5, -7]
  return (
    <>
      {zPositions.map((z) => (
        <mesh key={z} position={[0, 2.44, z]}>
          <boxGeometry args={[2.3, 0.12, 0.25]} />
          <meshStandardMaterial color="#2a1a0e" roughness={0.85} />
        </mesh>
      ))}
    </>
  )
}

/* ── Window panel side ─────────────────────────────────── */
function WindowPanel({ side }: { side: 1 | -1 }) {
  const x = 1.125 * side
  // Spec z positions: 3, 0.5, -2, -4.5, -7, -9
  const postZs = [3, 0.5, -2, -4.5, -7]

  return (
    <group>
      {/* Lower wall panel — HK tram green, runs full length */}
      <mesh position={[x, 0.79, -3]}>
        <boxGeometry args={[0.06, 0.5, 12.5]} />
        <meshStandardMaterial color={GREEN} roughness={0.6} />
      </mesh>

      {/* Green vertical posts — window frames */}
      {postZs.map((z) => (
        <mesh key={z} position={[x, 1.57, z]}>
          <boxGeometry args={[0.05, 1.06, 0.05]} />
          <meshStandardMaterial color={GREEN} roughness={0.5} />
        </mesh>
      ))}

      {/* Top rail — green, connecting all posts */}
      <mesh position={[x, 2.1, -3]}>
        <boxGeometry args={[0.06, 0.08, 12.5]} />
        <meshStandardMaterial color={GREEN} roughness={0.5} />
      </mesh>

      {/* Bottom window sill rail — green */}
      <mesh position={[x, 1.04, -3]}>
        <boxGeometry args={[0.06, 0.06, 12.5]} />
        <meshStandardMaterial color={GREEN} roughness={0.5} />
      </mesh>

      {/* Glass windows + horizontal center mullion (sliding window divider) */}
      {postZs.slice(0, -1).map((z, i) => {
        const nextZ = postZs[i + 1]
        const midZ = (z + nextZ) / 2
        const spanZ = Math.abs(z - nextZ) - 0.08
        return (
          <group key={`glass-${i}`}>
            <mesh position={[x, 1.57, midZ]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[spanZ, 1.0]} />
              <meshPhysicalMaterial color="#d8e8ec" transparent opacity={0.2} roughness={0.1} metalness={0.1} transmission={0.7} thickness={0.03} side={2} />
            </mesh>
            {/* Horizontal center mullion — the sliding window divider */}
            <mesh position={[x + side * 0.01, 1.57, midZ]}>
              <boxGeometry args={[0.02, 0.025, spanZ]} />
              <meshStandardMaterial color="#1a1a18" />
            </mesh>
          </group>
        )
      })}

      {/* Glass pane between last post (z=-7) and windshield (z=-10) */}
      <mesh position={[x, 1.57, -8.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.8, 1.0]} />
        <meshPhysicalMaterial color="#d8e8ec" transparent opacity={0.2} roughness={0.1} metalness={0.1} transmission={0.7} thickness={0.03} side={2} />
      </mesh>

      {/* Glass pane from first post (z=3) to rear entrance (z=3.25) — short rear pane */}
      <mesh position={[x, 1.57, 3.12]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[0.2, 1.0]} />
        <meshPhysicalMaterial color="#d8e8ec" transparent opacity={0.2} roughness={0.1} metalness={0.1} transmission={0.7} thickness={0.03} side={2} />
      </mesh>

      {/* Solid upper wall — green (matching all-green exterior) */}
      <mesh position={[x, 2.3, -3]}>
        <boxGeometry args={[0.06, 0.35, 12.5]} />
        <meshStandardMaterial color={GREEN} roughness={0.6} />
      </mesh>
    </group>
  )
}

/* ── Dashboard (front wall — the windshield frame) ─────── */
function Dashboard() {
  return (
    <group position={[0, 0, -10]}>
      {/* Lower wood panel */}
      <mesh position={[0, 0.875, 0]}>
        <boxGeometry args={[2.3, 0.35, 0.06]} />
        <meshStandardMaterial color={WOOD} roughness={0.85} />
      </mesh>

      {/* Dashboard strip */}
      <mesh position={[0, 1.08, 0]}>
        <boxGeometry args={[2.3, 0.04, 0.08]} />
        <meshStandardMaterial color={WOOD_LIGHT} roughness={0.7} />
      </mesh>

      {/* Top windshield rail — green */}
      <mesh position={[0, 2.12, 0]}>
        <boxGeometry args={[2.3, 0.06, 0.12]} />
        <meshStandardMaterial color={GREEN} roughness={0.5} />
      </mesh>

      {/* Upper windshield header — nearly clear glass */}
      <mesh position={[0, 2.35, 0.01]}>
        <planeGeometry args={[2.2, 0.35]} />
        <meshPhysicalMaterial color="#eef4f6" transparent opacity={0.12} roughness={0.03} metalness={0.1} transmission={0.9} thickness={0.02} side={2} />
      </mesh>

      {/* Left windshield post */}
      <mesh position={[-1.125, 1.57, 0]}>
        <boxGeometry args={[0.05, 1.06, 0.05]} />
        <meshStandardMaterial color={GREEN} roughness={0.5} />
      </mesh>

      {/* Right windshield post */}
      <mesh position={[1.125, 1.57, 0]}>
        <boxGeometry args={[0.05, 1.06, 0.05]} />
        <meshStandardMaterial color={GREEN} roughness={0.5} />
      </mesh>

      {/* Center windshield post */}
      <mesh position={[0, 1.57, 0]}>
        <boxGeometry args={[0.05, 1.06, 0.05]} />
        <meshStandardMaterial color={GREEN} roughness={0.5} />
      </mesh>

      {/* Full windshield glass — nearly clear so you see the road */}
      <mesh position={[0, 1.57, 0.01]}>
        <planeGeometry args={[2.2, 1.0]} />
        <meshPhysicalMaterial color="#eef4f6" transparent opacity={0.12} roughness={0.03} metalness={0.1} transmission={0.9} thickness={0.02} side={2} />
      </mesh>

      {/* Upper glass — also clear */}
      <mesh position={[0, 2.25, 0.01]}>
        <planeGeometry args={[2.2, 0.22]} />
        <meshPhysicalMaterial color="#eef4f6" transparent opacity={0.12} roughness={0.03} metalness={0.1} transmission={0.9} thickness={0.02} side={2} />
      </mesh>
    </group>
  )
}

/* ── Staircase hole in floor (dark circle at z=3.5) ────── */
function StaircaseHole() {
  return (
    <mesh position={[0, 0.55, 3.5]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.7, 16]} />
      <meshBasicMaterial color="#0a0604" side={2} />
    </mesh>
  )
}

/* ── Front face exterior details (destination board, route, headlights) ── */
function FrontFaceDetails() {
  const fz = -10.04 // just outside the dashboard wall

  return (
    <group>
      {/* Destination board — cream strip above windshield */}
      <mesh position={[0, 2.18, fz]}>
        <boxGeometry args={[2.0, 0.18, 0.02]} />
        <meshStandardMaterial color="#f0e6c8" roughness={0.8} />
      </mesh>

      {/* Route number box — upper left */}
      <group position={[-0.85, 2.18, fz - 0.01]}>
        <mesh>
          <boxGeometry args={[0.22, 0.22, 0.025]} />
          <meshStandardMaterial color="#1a1a18" />
        </mesh>
        <mesh position={[0, 0, -0.014]}>
          <planeGeometry args={[0.18, 0.18]} />
          <meshBasicMaterial color="#f8e8b8" />
        </mesh>
      </group>

      {/* Two round headlights at bottom */}
      {[-0.45, 0.45].map((hx, i) => (
        <group key={`hl-${i}`} position={[hx, 0.65, fz]}>
          <mesh>
            <cylinderGeometry args={[0.08, 0.08, 0.03, 12]} rotation={[Math.PI / 2, 0, 0]} />
            <meshStandardMaterial color="#1a1a18" />
          </mesh>
          <mesh position={[0, 0, -0.02]}>
            <circleGeometry args={[0.06, 12]} />
            <meshBasicMaterial color="#ffecb8" />
          </mesh>
        </group>
      ))}

      {/* Fleet number bottom center */}
      <mesh position={[0, 0.55, fz]}>
        <boxGeometry args={[0.35, 0.14, 0.01]} />
        <meshStandardMaterial color={GREEN} />
      </mesh>
    </group>
  )
}

export function CabinShell() {
  return (
    <group>
      <Floor />
      <Ceiling />
      <CeilingBeams />
      <WindowPanel side={1} />
      <WindowPanel side={-1} />
      <Dashboard />
      <FrontFaceDetails />
      <StaircaseHole />
    </group>
  )
}
