const SHELTER_CREAM = '#f4e8c8'
const SHELTER_DARK = '#2a2418'
const GLASS = '#c8d4d8'

export function TerminusShelter() {
  return (
    <group position={[0, 0.2, 0]}>
      {/* 4 support posts at the corners */}
      {([
        [-1.6, 1.0, -2.2],
        [1.6, 1.0, -2.2],
        [-1.6, 1.0, 2.2],
        [1.6, 1.0, 2.2],
      ] as [number, number, number][]).map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.1, 2.0, 0.1]} />
          <meshStandardMaterial color={SHELTER_DARK} roughness={0.6} />
        </mesh>
      ))}

      {/* Slanted glass/polycarbonate roof */}
      <mesh position={[0, 2.0, 0]} rotation={[Math.PI / 16, 0, 0]}>
        <boxGeometry args={[3.4, 0.06, 4.8]} />
        <meshPhysicalMaterial
          color={GLASS}
          transparent
          opacity={0.55}
          roughness={0.2}
          transmission={0.5}
        />
      </mesh>

      {/* Roof frame — thin metal edges */}
      {([
        { pos: [0, 2.05, -2.4], size: [3.4, 0.04, 0.04] },
        { pos: [0, 2.05, 2.4], size: [3.4, 0.04, 0.04] },
        { pos: [-1.7, 2.05, 0], size: [0.04, 0.04, 4.8] },
        { pos: [1.7, 2.05, 0], size: [0.04, 0.04, 4.8] },
      ] as { pos: [number, number, number]; size: [number, number, number] }[]).map((f, i) => (
        <mesh key={i} position={f.pos}>
          <boxGeometry args={f.size} />
          <meshStandardMaterial color={SHELTER_DARK} roughness={0.6} />
        </mesh>
      ))}

      {/* Back wall — cream panel (the info panel hangs on this) */}
      <mesh position={[0, 1.0, -2.25]}>
        <boxGeometry args={[3.2, 1.8, 0.04]} />
        <meshStandardMaterial color={SHELTER_CREAM} roughness={0.8} />
      </mesh>

      {/* Bench — wood slats on metal frame */}
      <group position={[0, 0.5, -1.7]}>
        {[-0.35, -0.15, 0.05, 0.25].map((zOff, i) => (
          <mesh key={i} position={[0, 0, zOff]}>
            <boxGeometry args={[2.8, 0.05, 0.15]} />
            <meshStandardMaterial color="#5a3a20" roughness={0.85} />
          </mesh>
        ))}
        <mesh position={[-1.3, -0.2, 0]}>
          <boxGeometry args={[0.04, 0.4, 0.7]} />
          <meshStandardMaterial color={SHELTER_DARK} />
        </mesh>
        <mesh position={[1.3, -0.2, 0]}>
          <boxGeometry args={[0.04, 0.4, 0.7]} />
          <meshStandardMaterial color={SHELTER_DARK} />
        </mesh>
      </group>
    </group>
  )
}
