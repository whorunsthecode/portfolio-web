export function GuardChair() {
  const legs: [number, number, number][] = [
    [-0.17, 0.22, 0.17],
    [0.17, 0.22, 0.17],
    [-0.17, 0.22, -0.17],
    [0.17, 0.22, -0.17],
  ]

  return (
    <group position={[-2.6, 0, 4.2]} rotation={[0, Math.PI / 4, 0]}>
      {/* Seat */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[0.4, 0.06, 0.4]} />
        <meshStandardMaterial color="#3a2418" roughness={0.8} />
      </mesh>

      {/* Wine-velvet seat cushion */}
      <mesh position={[0, 0.49, 0]}>
        <boxGeometry args={[0.36, 0.04, 0.36]} />
        <meshStandardMaterial color="#6a1a20" roughness={0.7} />
      </mesh>

      {/* Backrest */}
      <mesh position={[0, 0.75, -0.17]}>
        <boxGeometry args={[0.4, 0.5, 0.04]} />
        <meshStandardMaterial color="#3a2418" roughness={0.8} />
      </mesh>

      {/* Back cushion */}
      <mesh position={[0, 0.75, -0.15]}>
        <boxGeometry args={[0.34, 0.44, 0.04]} />
        <meshStandardMaterial color="#6a1a20" roughness={0.7} />
      </mesh>

      {/* 4 legs */}
      {legs.map((pos, i) => (
        <mesh key={i} position={pos}>
          <cylinderGeometry args={[0.02, 0.025, 0.44, 6]} />
          <meshStandardMaterial color="#2a1a10" roughness={0.8} />
        </mesh>
      ))}

      {/* Small gold plaque on the backrest */}
      <mesh position={[0, 0.9, -0.13]}>
        <planeGeometry args={[0.1, 0.04]} />
        <meshStandardMaterial color="#c8a048" metalness={0.6} />
      </mesh>
    </group>
  )
}
