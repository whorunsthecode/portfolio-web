const FLOOR_COLOR = '#8a6a42'   // warm parquet
const WALL_COLOR = '#f0e8d8'    // cream
const CEILING_COLOR = '#f8f2e4' // slightly lighter cream
const MOLDING_COLOR = '#ffffff' // white crown molding

export function MuseumRoom() {
  return (
    <group>
      {/* Floor — warm wood parquet */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 10]} />
        <meshStandardMaterial color={FLOOR_COLOR} roughness={0.7} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 10]} />
        <meshStandardMaterial color={CEILING_COLOR} roughness={0.9} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-3, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} side={2} />
      </mesh>

      {/* Right wall */}
      <mesh position={[3, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} side={2} />
      </mesh>

      {/* Back wall (opposite from camera arrival) */}
      <mesh position={[0, 2.5, -5]}>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} side={2} />
      </mesh>

      {/* Front wall (behind camera — subtle enclosure) */}
      <mesh position={[0, 2.5, 5]}>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} side={2} />
      </mesh>

      {/* Crown molding — 4 thin strips where walls meet ceiling */}
      {[
        { pos: [0, 4.9, -5], args: [6, 0.15, 0.08] },   // back
        { pos: [0, 4.9, 5], args: [6, 0.15, 0.08] },    // front
        { pos: [-3, 4.9, 0], args: [0.08, 0.15, 10] },  // left
        { pos: [3, 4.9, 0], args: [0.08, 0.15, 10] },   // right
      ].map((m, i) => (
        <mesh key={i} position={m.pos as [number, number, number]}>
          <boxGeometry args={m.args as [number, number, number]} />
          <meshStandardMaterial color={MOLDING_COLOR} roughness={0.6} />
        </mesh>
      ))}

      {/* Baseboard — 4 strips where walls meet floor */}
      {[
        { pos: [0, 0.08, -5], args: [6, 0.16, 0.04] },
        { pos: [0, 0.08, 5], args: [6, 0.16, 0.04] },
        { pos: [-3, 0.08, 0], args: [0.04, 0.16, 10] },
        { pos: [3, 0.08, 0], args: [0.04, 0.16, 10] },
      ].map((m, i) => (
        <mesh key={i} position={m.pos as [number, number, number]}>
          <boxGeometry args={m.args as [number, number, number]} />
          <meshStandardMaterial color="#f0eae0" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}
