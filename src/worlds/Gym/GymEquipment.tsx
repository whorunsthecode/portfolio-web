const PLANT_OLIVE = '#7a8870'
const PLANT_OLIVE_LIGHT = '#9aa888'
const PLANT_TRUNK = '#5a4838'
const PLANTER_STONE = '#a0988a'
const TRAVERTINE = '#e0d4b8'
const TRAVERTINE_DARK = '#b8a888'
const BOUCLE = '#e8dcc4'
const BLOCK_CORK = '#c4a870'

function OliveTree() {
  return (
    <group position={[-1.8, 0, -5.2]}>
      <mesh position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.4, 0.42, 0.6, 16]} />
        <meshStandardMaterial color={PLANTER_STONE} roughness={0.95} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.42, 0.4, 0.04, 16]} />
        <meshStandardMaterial color="#888178" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.38, 0.38, 0.02, 12]} />
        <meshStandardMaterial color="#3a2820" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.0, 0]}>
        <cylinderGeometry args={[0.05, 0.07, 0.8, 8]} />
        <meshStandardMaterial color={PLANT_TRUNK} roughness={0.9} />
      </mesh>
      <mesh position={[-0.1, 1.4, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.04, 0.05, 0.6, 8]} />
        <meshStandardMaterial color={PLANT_TRUNK} roughness={0.9} />
      </mesh>
      <mesh position={[0.12, 1.5, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.04, 0.05, 0.5, 8]} />
        <meshStandardMaterial color={PLANT_TRUNK} roughness={0.9} />
      </mesh>
      {([
        { pos: [-0.25, 1.7, 0.05], scale: 0.45 },
        { pos: [0.25, 1.85, -0.05], scale: 0.4 },
        { pos: [0, 2.05, 0.1], scale: 0.45 },
        { pos: [-0.15, 2.0, -0.12], scale: 0.35 },
        { pos: [0.18, 2.15, 0.08], scale: 0.32 },
        { pos: [-0.05, 2.3, -0.05], scale: 0.3 },
      ] as { pos: [number, number, number]; scale: number }[]).map((c, i) => (
        <mesh key={i} position={c.pos}>
          <sphereGeometry args={[c.scale, 12, 8]} />
          <meshStandardMaterial color={i % 2 === 0 ? PLANT_OLIVE : PLANT_OLIVE_LIGHT} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

function TravertineBench() {
  return (
    <group position={[2, 0, -5.4]}>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[1.4, 0.45, 0.5]} />
        <meshStandardMaterial color={TRAVERTINE} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.46, 0]}>
        <boxGeometry args={[1.42, 0.04, 0.52]} />
        <meshStandardMaterial color={TRAVERTINE_DARK} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[1.3, 0.12, 0.4]} />
        <meshStandardMaterial color={BOUCLE} roughness={0.95} />
      </mesh>
      <mesh position={[-0.4, 0.65, 0]}>
        <boxGeometry args={[0.3, 0.08, 0.25]} />
        <meshStandardMaterial color="#f0e8d8" roughness={0.95} />
      </mesh>
      <mesh position={[0.55, 0.65, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.18, 12]} />
        <meshPhysicalMaterial color="#dceaf0" transparent opacity={0.5} transmission={0.8} roughness={0.1} />
      </mesh>
    </group>
  )
}

/** Large meditation gong on a wide curved stand */
function Gong() {
  const STAND = '#1a1614'
  const GONG_BRASS = '#8a7040'
  const GONG_DARK = '#5a4828'
  const GONG_CENTER = '#c8a048'

  return (
    <group position={[-3.2, 0, -4]} rotation={[0, Math.PI / 6, 0]}>
      {/* Stand — wide curved uprights like a real gong stand */}
      {/* Left upright — curved outward at base */}
      <mesh position={[-0.55, 0.8, 0]} rotation={[0, 0, 0.12]}>
        <cylinderGeometry args={[0.025, 0.03, 1.7, 8]} />
        <meshStandardMaterial color={STAND} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Right upright */}
      <mesh position={[0.55, 0.8, 0]} rotation={[0, 0, -0.12]}>
        <cylinderGeometry args={[0.025, 0.03, 1.7, 8]} />
        <meshStandardMaterial color={STAND} roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Top crossbar — above the gong */}
      <mesh position={[0, 1.65, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.95, 8]} />
        <meshStandardMaterial color={STAND} roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Base feet — wide flat */}
      <mesh position={[-0.65, 0.02, 0]}>
        <boxGeometry args={[0.15, 0.04, 0.25]} />
        <meshStandardMaterial color={STAND} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0.65, 0.02, 0]}>
        <boxGeometry args={[0.15, 0.04, 0.25]} />
        <meshStandardMaterial color={STAND} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Bottom crossbar for stability */}
      <mesh position={[0, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 1.3, 6]} />
        <meshStandardMaterial color={STAND} roughness={0.5} metalness={0.3} />
      </mesh>

      {/* === THE GONG — large vertical disc === */}
      {/* Use a circleGeometry facing forward (Z+) for a clean flat disc */}
      <mesh position={[0, 0.95, 0.008]}>
        <circleGeometry args={[0.55, 48]} />
        <meshStandardMaterial color={GONG_BRASS} metalness={0.85} roughness={0.2} side={2} />
      </mesh>

      {/* Center boss — small sphere on the face */}
      <mesh position={[0, 0.95, 0.02]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={GONG_CENTER} metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Subtle darker edge ring */}
      <mesh position={[0, 0.95, 0.01]}>
        <ringGeometry args={[0.5, 0.55, 48]} />
        <meshStandardMaterial color={GONG_DARK} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Hanging ropes from crossbar to gong */}
      <mesh position={[-0.25, 1.3, 0]} rotation={[0, 0, 0.15]}>
        <cylinderGeometry args={[0.006, 0.006, 0.35, 4]} />
        <meshStandardMaterial color="#5a4030" roughness={0.9} />
      </mesh>
      <mesh position={[0.25, 1.3, 0]} rotation={[0, 0, -0.15]}>
        <cylinderGeometry args={[0.006, 0.006, 0.35, 4]} />
        <meshStandardMaterial color="#5a4030" roughness={0.9} />
      </mesh>

      {/* Mallet leaning against the stand */}
      <mesh position={[0.7, 0.3, 0.15]} rotation={[0.1, 0, 0.2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 6]} />
        <meshStandardMaterial color="#5a4030" roughness={0.8} />
      </mesh>
      <mesh position={[0.78, 0.52, 0.18]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshStandardMaterial color="#d8c4a8" roughness={0.9} />
      </mesh>
    </group>
  )
}

/** Baby pink yoga mats — organized in a row, like a real class */
function FloorMats() {
  const PINK = '#f4b8c8'
  const PINK_DARK = '#e8a8b8'
  const PINK_LINE = '#d8909c'

  // 4 mats in a neat horizontal row, all aligned
  const mats = [
    { x: -2.2, color: PINK },
    { x: -0.7, color: PINK_DARK },
    { x: 0.8, color: PINK },
    { x: 2.3, color: PINK_DARK },
  ]

  return (
    <group position={[0, 0, 1]}>
      {mats.map((mat, i) => (
        <group key={i} position={[mat.x, 0.02, 0]}>
          {/* Mat body */}
          <mesh>
            <boxGeometry args={[0.7, 0.04, 1.8]} />
            <meshStandardMaterial color={mat.color} roughness={0.95} />
          </mesh>
          {/* Center line */}
          <mesh position={[0, 0.021, 0]}>
            <boxGeometry args={[0.025, 0.002, 1.7]} />
            <meshStandardMaterial color={PINK_LINE} />
          </mesh>
          {/* Block on each mat — like the reference photo */}
          <mesh position={[0, 0.08, -0.5]}>
            <boxGeometry args={[0.23, 0.08, 0.15]} />
            <meshStandardMaterial color={BLOCK_CORK} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function GymEquipment() {
  return (
    <>
      <OliveTree />
      {/* TravertineBench removed */}
      <Gong />
      <FloorMats />
    </>
  )
}
