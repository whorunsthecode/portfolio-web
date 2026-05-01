const SHELTER_CREAM = '#f0e6c8'
const SHELTER_CREAM_DARK = '#d4c8a0'
const SHELTER_GREEN = '#2a4838'
const SHELTER_METAL = '#1a1a18'
const ROOF_PANEL = '#e8ddb8'

const ISLAND_HEIGHT = 0.2

/**
 * Vintage 1960s-70s HK tram shelter — slim green steel posts, flat cream roof
 * with scalloped edge fascia (THE signature period detail), cream back wall,
 * wooden bench with metal armrest dividers.
 */
export function TerminusShelter() {
  return (
    <group position={[0, ISLAND_HEIGHT, 0]}>
      {/* === 6 SLIM GREEN STEEL POSTS (3 per long side) === */}
      {[
        { x: -0.8, z: -2.2 },
        { x: 0.8, z: -2.2 },
        { x: -0.8, z: 0 },
        { x: 0.8, z: 0 },
        { x: -0.8, z: 2.2 },
        { x: 0.8, z: 2.2 },
      ].map((p, i) => (
        <group key={`post-${i}`} position={[p.x, 0, p.z]}>
          {/* Main post — slim green cylinder */}
          <mesh position={[0, 1.1, 0]}>
            <cylinderGeometry args={[0.035, 0.04, 2.2, 10]} />
            <meshStandardMaterial color={SHELTER_GREEN} roughness={0.7} />
          </mesh>
          {/* Small base cap */}
          <mesh position={[0, 0.03, 0]}>
            <cylinderGeometry args={[0.07, 0.08, 0.06, 10]} />
            <meshStandardMaterial color={SHELTER_METAL} roughness={0.6} />
          </mesh>
          {/* Top cap/knuckle */}
          <mesh position={[0, 2.22, 0]}>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color={SHELTER_GREEN} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* === FLAT ROOF === */}
      <mesh position={[0, 2.25, 0]}>
        <boxGeometry args={[1.9, 0.08, 5.0]} />
        <meshStandardMaterial color={ROOF_PANEL} roughness={0.85} />
      </mesh>

      {/* === SCALLOPED FASCIA — front + back edges (signature vintage detail) === */}
      {[-2.52, 2.52].map((z, edgeIdx) => (
        Array.from({ length: 10 }, (_, i) => (
          <mesh
            key={`scallop-fb-${edgeIdx}-${i}`}
            position={[-0.855 + i * 0.19, 2.18, z]}
            rotation={[0, edgeIdx === 1 ? Math.PI : 0, 0]}
          >
            <circleGeometry args={[0.08, 8, Math.PI, Math.PI]} />
            <meshStandardMaterial color={SHELTER_CREAM} roughness={0.85} side={2} />
          </mesh>
        ))
      ))}

      {/* === SCALLOPED FASCIA — side edges === */}
      {Array.from({ length: 20 }, (_, i) => {
        const z = -2.35 + i * 0.235
        return (
          <group key={`scallop-side-${i}`}>
            <mesh position={[-0.955, 2.18, z]} rotation={[0, Math.PI / 2, 0]}>
              <circleGeometry args={[0.08, 8, Math.PI, Math.PI]} />
              <meshStandardMaterial color={SHELTER_CREAM} roughness={0.85} side={2} />
            </mesh>
            <mesh position={[0.955, 2.18, z]} rotation={[0, -Math.PI / 2, 0]}>
              <circleGeometry args={[0.08, 8, Math.PI, Math.PI]} />
              <meshStandardMaterial color={SHELTER_CREAM} roughness={0.85} side={2} />
            </mesh>
          </group>
        )
      })}

      {/* === GREEN ROOF EDGE TRIM === */}
      {[
        { pos: [0, 2.29, -2.5] as const, size: [1.9, 0.03, 0.03] as const },
        { pos: [0, 2.29, 2.5] as const, size: [1.9, 0.03, 0.03] as const },
        { pos: [-0.95, 2.29, 0] as const, size: [0.03, 0.03, 5.0] as const },
        { pos: [0.95, 2.29, 0] as const, size: [0.03, 0.03, 5.0] as const },
      ].map((t, i) => (
        <mesh key={`trim-${i}`} position={[...t.pos]}>
          <boxGeometry args={[...t.size]} />
          <meshStandardMaterial color={SHELTER_GREEN} roughness={0.7} />
        </mesh>
      ))}

      {/* === CREAM BACK WALL (route map + info panel mount surface) === */}
      <mesh position={[0, 1.1, -2.48]}>
        <boxGeometry args={[1.7, 1.8, 0.04]} />
        <meshStandardMaterial color={SHELTER_CREAM} roughness={0.85} />
      </mesh>

      {/* Subtle grime patches on back wall */}
      {[[-0.5, 0.4], [0.3, -0.3], [0.6, 0.7]].map(([dx, dy], i) => (
        <mesh key={`grime-${i}`} position={[dx, 1.1 + dy, -2.46]}>
          <circleGeometry args={[0.12, 8]} />
          <meshBasicMaterial color={SHELTER_CREAM_DARK} transparent opacity={0.3} />
        </mesh>
      ))}

      {/* === WOODEN BENCH inside shelter === */}
      <group position={[0, 0, -1.6]}>
        {/* 3 seat slats */}
        {[-0.15, 0, 0.15].map((zOff, i) => (
          <mesh key={`seat-${i}`} position={[0, 0.45, zOff]}>
            <boxGeometry args={[1.5, 0.04, 0.12]} />
            <meshStandardMaterial color="#6a4a28" roughness={0.85} />
          </mesh>
        ))}
        {/* 3 backrest slats */}
        {[-0.2, 0, 0.2].map((xOff, i) => (
          <mesh key={`back-${i}`} position={[xOff, 0.75, -0.28]}>
            <boxGeometry args={[0.12, 0.6, 0.04]} />
            <meshStandardMaterial color="#6a4a28" roughness={0.85} />
          </mesh>
        ))}
        {/* Metal frame legs */}
        {[-0.65, 0.65].map((x, i) => (
          <mesh key={`leg-${i}`} position={[x, 0.22, 0]}>
            <boxGeometry args={[0.04, 0.44, 0.5]} />
            <meshStandardMaterial color={SHELTER_METAL} roughness={0.7} />
          </mesh>
        ))}
        {/* Armrest dividers */}
        {[-0.45, 0.45].map((x, i) => (
          <mesh key={`arm-${i}`} position={[x, 0.6, 0]}>
            <boxGeometry args={[0.025, 0.3, 0.04]} />
            <meshStandardMaterial color={SHELTER_METAL} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
