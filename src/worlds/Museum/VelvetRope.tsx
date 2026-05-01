function Stanchion({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Base */}
      <mesh>
        <cylinderGeometry args={[0.15, 0.18, 0.04, 16]} />
        <meshStandardMaterial color="#2a2418" roughness={0.6} />
      </mesh>
      {/* Brass pole */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 1.0, 12]} />
        <meshStandardMaterial color="#c8a048" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Top orb */}
      <mesh position={[0, 1.05, 0]}>
        <sphereGeometry args={[0.04, 12, 12]} />
        <meshStandardMaterial color="#c8a048" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Hook ring */}
      <mesh position={[0, 0.95, 0]}>
        <torusGeometry args={[0.025, 0.005, 6, 12]} />
        <meshStandardMaterial color="#c8a048" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

export function VelvetRope() {
  const stanchionL: [number, number, number] = [-0.9, 0, -1.0]
  const stanchionR: [number, number, number] = [0.9, 0, -1.0]

  return (
    <group>
      <Stanchion position={stanchionL} />
      <Stanchion position={stanchionR} />

      {/* Red velvet rope — straight cylinder across the two posts */}
      <mesh position={[0, 0.85, -1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 1.8, 8]} />
        <meshStandardMaterial color="#8a1818" roughness={0.6} />
      </mesh>

      {/* Fake sag segment — slightly darker thicker cylinder below center */}
      <mesh position={[0, 0.78, -1.0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.4, 8]} />
        <meshStandardMaterial color="#6a1010" roughness={0.6} />
      </mesh>
    </group>
  )
}
