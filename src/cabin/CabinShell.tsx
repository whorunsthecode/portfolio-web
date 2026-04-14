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

/* ── Ceiling ───────────────────────────────────────────── */
function Ceiling() {
  return (
    <mesh position={[0, 2.5, -3]}>
      <boxGeometry args={[2.3, 0.08, 12.5]} />
      <meshStandardMaterial color={CREAM} roughness={0.7} />
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
          <meshStandardMaterial color="#6a4a2a" roughness={0.8} />
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

      {/* Glass windows — all panes, visible as frosted glass */}
      {postZs.slice(0, -1).map((z, i) => {
        const nextZ = postZs[i + 1]
        const midZ = (z + nextZ) / 2
        const spanZ = Math.abs(z - nextZ) - 0.08
        return (
          <mesh key={`glass-${i}`} position={[x, 1.57, midZ]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[spanZ, 1.0]} />
            <meshStandardMaterial color="#b8ccd4" transparent opacity={0.35} roughness={0.3} side={2} />
          </mesh>
        )
      })}

      {/* Glass pane between last post (z=-7) and windshield (z=-10) */}
      <mesh position={[x, 1.57, -8.5]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[2.8, 1.0]} />
        <meshStandardMaterial color="#b8ccd4" transparent opacity={0.35} roughness={0.3} side={2} />
      </mesh>

      {/* Solid upper wall — between top of windows and ceiling */}
      <mesh position={[x, 2.3, -3]}>
        <boxGeometry args={[0.06, 0.35, 12.5]} />
        <meshStandardMaterial color={CREAM} roughness={0.7} />
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

      {/* Solid upper windshield header — closes the gap to ceiling */}
      <mesh position={[0, 2.35, 0]}>
        <boxGeometry args={[2.3, 0.35, 0.06]} />
        <meshStandardMaterial color={CREAM} roughness={0.7} />
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

export function CabinShell() {
  return (
    <group>
      <Floor />
      <Ceiling />
      <CeilingBeams />
      <WindowPanel side={1} />
      <WindowPanel side={-1} />
      <Dashboard />
      <StaircaseHole />
    </group>
  )
}
