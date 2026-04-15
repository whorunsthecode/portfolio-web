interface TrackLightProps {
  position: [number, number, number]
  targetPos: [number, number, number]
}

function TrackLight({ position, targetPos }: TrackLightProps) {
  const dx = targetPos[0] - position[0]
  const dy = targetPos[1] - position[1]
  const dz = targetPos[2] - position[2]
  const yaw = Math.atan2(dx, dz)
  const pitch = Math.atan2(-dy, Math.sqrt(dx * dx + dz * dz))

  return (
    <group position={position} rotation={[0, yaw, 0]}>
      {/* Short mount arm from track to fixture */}
      <mesh position={[0, -0.05, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 6]} />
        <meshStandardMaterial color="#2a2418" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Fixture housing — aimed at the target */}
      <group position={[0, -0.1, 0]} rotation={[pitch, 0, 0]}>
        <mesh position={[0, 0, 0.08]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.06, 0.12, 12]} />
          <meshStandardMaterial color="#1a1a18" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Warm bulb face */}
        <mesh position={[0, 0, 0.14]}>
          <circleGeometry args={[0.04, 12]} />
          <meshBasicMaterial color="#fff0d4" />
        </mesh>
      </group>
    </group>
  )
}

export function TrackLights() {
  return (
    <group>
      {/* Track rails — thin black strips along the ceiling */}
      <mesh position={[-2.5, 4.92, 0]}>
        <boxGeometry args={[0.04, 0.04, 10]} />
        <meshStandardMaterial color="#2a2418" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[2.5, 4.92, 0]}>
        <boxGeometry args={[0.04, 0.04, 10]} />
        <meshStandardMaterial color="#2a2418" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.92, -4.7]}>
        <boxGeometry args={[6, 0.04, 0.04]} />
        <meshStandardMaterial color="#2a2418" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 4.92, 0]}>
        <boxGeometry args={[0.04, 0.04, 10]} />
        <meshStandardMaterial color="#2a2418" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Fixtures aimed at each painting */}
      <TrackLight position={[-2.5, 4.9, -2]} targetPos={[-2.95, 2.5, -2]} />
      <TrackLight position={[2.5, 4.9, 0]} targetPos={[2.95, 2.5, 0]} />
      <TrackLight position={[0, 4.9, -4.3]} targetPos={[0, 2.5, -4.95]} />

      {/* Two fixtures converging on the centerpiece */}
      <TrackLight position={[-0.8, 4.9, -1]} targetPos={[0, 2.2, -2.0]} />
      <TrackLight position={[0.8, 4.9, -1]} targetPos={[0, 2.2, -2.0]} />
    </group>
  )
}
