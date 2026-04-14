const PAINTINGS = [
  // Monet water lilies — blue/green palette
  { position: [-2.95, 2.5, -2] as const, rotation: [0, Math.PI / 2, 0] as const, colors: ['#4a7a8c', '#6a9a88', '#2a5a6c'], title: 'Water Lilies' },
  // Van Gogh starry night — blue/yellow palette
  { position: [2.95, 2.5, 0] as const, rotation: [0, -Math.PI / 2, 0] as const, colors: ['#1a2848', '#f0c848', '#284878'], title: 'Starry Night' },
  // Klimt gold — gold/red palette
  { position: [0, 2.5, -4.95] as const, rotation: [0, 0, 0] as const, colors: ['#c8a048', '#8a3828', '#e8c878'], title: 'The Kiss' },
]

export function Paintings() {
  return (
    <>
      {PAINTINGS.map((p, i) => (
        <group key={i} position={p.position} rotation={p.rotation}>
          {/* Gold frame */}
          <mesh position={[0, 0, -0.02]}>
            <boxGeometry args={[1.4, 1.0, 0.08]} />
            <meshStandardMaterial color="#c8a048" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Canvas — 3 stacked color strips */}
          <mesh position={[0, 0.2, 0.03]}>
            <planeGeometry args={[1.2, 0.25]} />
            <meshStandardMaterial color={p.colors[0]} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.03]}>
            <planeGeometry args={[1.2, 0.25]} />
            <meshStandardMaterial color={p.colors[1]} roughness={0.8} />
          </mesh>
          <mesh position={[0, -0.2, 0.03]}>
            <planeGeometry args={[1.2, 0.25]} />
            <meshStandardMaterial color={p.colors[2]} roughness={0.8} />
          </mesh>
          {/* Plaque below frame */}
          <mesh position={[0, -0.62, 0]}>
            <planeGeometry args={[0.4, 0.08]} />
            <meshStandardMaterial color="#e8e0d0" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </>
  )
}
