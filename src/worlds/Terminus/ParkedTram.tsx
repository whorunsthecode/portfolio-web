const TRAM_GREEN = '#1a4a2c'
const WARM_WINDOW = '#ffa848'

export function ParkedTram() {
  // Parked behind the shelter, visible above the cream back wall
  // (back wall top is ~y=1.9; upper deck of tram sits around y=2.7)
  return (
    <group position={[0, 0, -9]}>
      {/* Lower deck body */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[10, 1.8, 2.3]} />
        <meshStandardMaterial color={TRAM_GREEN} roughness={0.6} />
      </mesh>

      {/* Upper deck body */}
      <mesh position={[0, 2.7, 0]}>
        <boxGeometry args={[10, 1.8, 2.3]} />
        <meshStandardMaterial color="#d4c8a8" roughness={0.7} />
      </mesh>

      {/* Lower deck windows — warm lit rectangles */}
      {[-3, -1, 1, 3].map((x, i) => (
        <mesh key={`lw-${i}`} position={[x, 1.1, 1.16]}>
          <planeGeometry args={[0.6, 0.8]} />
          <meshBasicMaterial color={i % 2 === 0 ? WARM_WINDOW : '#2a2420'} />
        </mesh>
      ))}

      {/* Upper deck windows */}
      {[-3, -1, 1, 3].map((x, i) => (
        <mesh key={`uw-${i}`} position={[x, 2.9, 1.16]}>
          <planeGeometry args={[0.6, 0.8]} />
          <meshBasicMaterial color={i % 2 === 1 ? WARM_WINDOW : '#2a2420'} />
        </mesh>
      ))}

      {/* Warm emissive glow from within */}
      <pointLight position={[0, 2, 1.5]} color={WARM_WINDOW} intensity={0.6} distance={6} decay={2} />

      {/* Trolley pole */}
      <mesh position={[0, 4.2, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.03, 0.03, 2, 6]} />
        <meshStandardMaterial color="#2a1a10" />
      </mesh>
    </group>
  )
}
