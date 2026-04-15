const WATER_DEEP = '#1a3858'
const WATER_MID = '#2a5878'
const WATER_LIGHT = '#4a88a8'
const GLASS_TINT = '#88c0d0'
const SAND_BOTTOM = '#d8c498'
const TANK_FRAME = '#1a1818'

export function TankInterior() {
  return (
    <group>
      {/* Water volume — large sphere around the camera, blue tint */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[15, 24, 24]} />
        <meshBasicMaterial color={WATER_DEEP} side={1} />
      </mesh>

      {/* Lighter water gradient around middle */}
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[12, 16, 16]} />
        <meshBasicMaterial color={WATER_MID} side={1} transparent opacity={0.5} />
      </mesh>

      {/* Bright water near surface */}
      <mesh position={[0, 4, 0]}>
        <sphereGeometry args={[8, 16, 16]} />
        <meshBasicMaterial color={WATER_LIGHT} side={1} transparent opacity={0.4} />
      </mesh>

      {/* === GLASS WALLS — 4 sides of the tank === */}
      <mesh position={[0, 1.5, 6]}>
        <planeGeometry args={[10, 6]} />
        <meshPhysicalMaterial
          color={GLASS_TINT}
          transparent
          opacity={0.15}
          roughness={0.05}
          transmission={0.9}
          side={2}
        />
      </mesh>
      <mesh position={[0, 1.5, -6]}>
        <planeGeometry args={[10, 6]} />
        <meshPhysicalMaterial
          color={GLASS_TINT}
          transparent
          opacity={0.15}
          roughness={0.05}
          transmission={0.9}
          side={2}
        />
      </mesh>
      <mesh position={[-5, 1.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[12, 6]} />
        <meshPhysicalMaterial
          color={GLASS_TINT}
          transparent
          opacity={0.15}
          roughness={0.05}
          transmission={0.9}
          side={2}
        />
      </mesh>
      <mesh position={[5, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[12, 6]} />
        <meshPhysicalMaterial
          color={GLASS_TINT}
          transparent
          opacity={0.15}
          roughness={0.05}
          transmission={0.9}
          side={2}
        />
      </mesh>

      {/* === BLACK TANK FRAME — visible edges === */}
      {[
        { pos: [0, 4.5, 6] as const, size: [10, 0.15, 0.15] as const },
        { pos: [0, 4.5, -6] as const, size: [10, 0.15, 0.15] as const },
        { pos: [-5, 4.5, 0] as const, size: [0.15, 0.15, 12] as const },
        { pos: [5, 4.5, 0] as const, size: [0.15, 0.15, 12] as const },
        { pos: [0, -1.5, 6] as const, size: [10, 0.15, 0.15] as const },
        { pos: [0, -1.5, -6] as const, size: [10, 0.15, 0.15] as const },
        { pos: [-5, -1.5, 0] as const, size: [0.15, 0.15, 12] as const },
        { pos: [5, -1.5, 0] as const, size: [0.15, 0.15, 12] as const },
        { pos: [-5, 1.5, 6] as const, size: [0.15, 6, 0.15] as const },
        { pos: [5, 1.5, 6] as const, size: [0.15, 6, 0.15] as const },
        { pos: [-5, 1.5, -6] as const, size: [0.15, 6, 0.15] as const },
        { pos: [5, 1.5, -6] as const, size: [0.15, 6, 0.15] as const },
      ].map((edge, i) => (
        <mesh key={i} position={[edge.pos[0], edge.pos[1], edge.pos[2]]}>
          <boxGeometry args={[edge.size[0], edge.size[1], edge.size[2]]} />
          <meshStandardMaterial color={TANK_FRAME} roughness={0.6} />
        </mesh>
      ))}

      {/* === SAND BOTTOM === */}
      <mesh position={[0, -1.4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 12]} />
        <meshStandardMaterial color={SAND_BOTTOM} roughness={0.9} />
      </mesh>

      {/* === SEAGRASS === */}
      {[
        { x: -3, z: 2, h: 2.0 },
        { x: -2, z: -1, h: 1.5 },
        { x: 3, z: 3, h: 1.8 },
        { x: 2.5, z: -2, h: 2.2 },
        { x: -3.5, z: -3, h: 1.6 },
        { x: 0, z: -4, h: 2.0 },
      ].map((g, i) => (
        <group key={i} position={[g.x, -1.4, g.z]}>
          {Array.from({ length: 4 }).map((_, j) => (
            <mesh
              key={j}
              position={[(j - 2) * 0.05, g.h / 2, (j % 2) * 0.05]}
              rotation={[0, 0, (Math.sin(i * 12 + j * 7) - 0.5) * 0.2]}
            >
              <boxGeometry args={[0.04, g.h, 0.04]} />
              <meshStandardMaterial color="#3a8050" roughness={0.85} />
            </mesh>
          ))}
        </group>
      ))}

      {/* === LIGHT BEAMS FROM ABOVE — caustic suggestion === */}
      {[
        { x: -2, z: 1 },
        { x: 1.5, z: -1 },
        { x: 0.5, z: 2.5 },
      ].map((b, i) => (
        <mesh key={i} position={[b.x, 2, b.z]}>
          <coneGeometry args={[1.5, 6, 12, 1, true]} />
          <meshBasicMaterial color="#a8d4e8" transparent opacity={0.08} side={2} />
        </mesh>
      ))}

      {/* === WATER SURFACE OVERHEAD === */}
      <mesh position={[0, 4.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 12]} />
        <meshBasicMaterial color="#88c4d8" transparent opacity={0.3} />
      </mesh>

      {/* === TINY ROCKS on sand === */}
      {[
        { x: -1.5, z: 1, s: 0.1 },
        { x: 2, z: -2, s: 0.08 },
        { x: -2, z: -1, s: 0.12 },
        { x: 1, z: 1.5, s: 0.09 },
      ].map((r, i) => (
        <mesh key={i} position={[r.x, -1.35, r.z]}>
          <sphereGeometry args={[r.s, 8, 8]} />
          <meshStandardMaterial color="#c8b890" roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}
