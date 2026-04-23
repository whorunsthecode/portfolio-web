import { Text } from '@react-three/drei'

// Two tiny cage lifts at the back of the arcade — the signature Chungking
// Mansions elevator bank. Frames are painted steel; gates are the visible
// diamond-pattern cage. One has its indicator at floor 5, one at G.

function LiftCage({ xOffset, floor }: { xOffset: number; floor: number }) {
  // Local group frame: lift door centre at origin, faces +Z (toward the
  // arcade). Parent sets x offset and z position near the back wall.
  return (
    <group position={[xOffset, 0, 0]}>
      {/* Steel frame surround */}
      {/* Left jamb */}
      <mesh position={[-0.52, 1.25, 0]}>
        <boxGeometry args={[0.12, 2.5, 0.3]} />
        <meshStandardMaterial color={'#3a3228'} metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Right jamb */}
      <mesh position={[0.52, 1.25, 0]}>
        <boxGeometry args={[0.12, 2.5, 0.3]} />
        <meshStandardMaterial color={'#3a3228'} metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Top lintel */}
      <mesh position={[0, 2.55, 0]}>
        <boxGeometry args={[1.16, 0.2, 0.3]} />
        <meshStandardMaterial color={'#3a3228'} metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Threshold */}
      <mesh position={[0, 0.04, 0.1]}>
        <boxGeometry args={[1.04, 0.08, 0.1]} />
        <meshStandardMaterial color={'#2a2418'} metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Dark interior void — implies the car isn't at this floor */}
      <mesh position={[0, 1.25, -0.05]}>
        <planeGeometry args={[0.94, 2.4]} />
        <meshStandardMaterial color={'#050402'} roughness={1} />
      </mesh>

      {/* Diamond cage gate — two sets of crossing diagonals */}
      {Array.from({ length: 5 }, (_, i) => {
        const y = 0.2 + i * 0.48
        return (
          <group key={`row-${i}`}>
            <mesh position={[0, y, 0.02]} rotation={[0, 0, Math.PI / 5]}>
              <boxGeometry args={[1.1, 0.015, 0.015]} />
              <meshStandardMaterial color={'#9a928a'} metalness={0.7} roughness={0.45} />
            </mesh>
            <mesh position={[0, y, 0.02]} rotation={[0, 0, -Math.PI / 5]}>
              <boxGeometry args={[1.1, 0.015, 0.015]} />
              <meshStandardMaterial color={'#9a928a'} metalness={0.7} roughness={0.45} />
            </mesh>
          </group>
        )
      })}

      {/* Floor indicator plate — brass rectangle with the digit */}
      <mesh position={[0, 2.82, 0.04]}>
        <boxGeometry args={[0.42, 0.26, 0.03]} />
        <meshStandardMaterial
          color={'#2a1f12'}
          emissive={'#d4a850'}
          emissiveIntensity={0.55}
          metalness={0.6}
          roughness={0.5}
        />
      </mesh>
      <Text
        position={[0, 2.82, 0.065]}
        fontSize={0.16}
        color={'#ffd890'}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.05}
      >
        {floor === 0 ? 'G' : String(floor)}
      </Text>

      {/* Call button */}
      <mesh position={[0.68, 1.1, 0.04]}>
        <boxGeometry args={[0.08, 0.14, 0.04]} />
        <meshStandardMaterial color={'#1a1a1a'} roughness={0.7} />
      </mesh>
      <mesh position={[0.68, 1.1, 0.065]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.018, 0.018, 0.01, 16]} />
        <meshStandardMaterial
          color={'#ff3a3a'}
          emissive={'#ff3a3a'}
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  )
}

export function CageLift() {
  // Positioned in front of the back wall (z = -4.85 since back wall at -5)
  return (
    <group position={[0, 0, -4.85]}>
      <LiftCage xOffset={-1.2} floor={5} />
      <LiftCage xOffset={1.2} floor={0} />

      {/* "LIFT 升降機" signboard centred between the two cars */}
      <mesh position={[0, 2.9, 0.02]}>
        <boxGeometry args={[1.0, 0.32, 0.04]} />
        <meshStandardMaterial color={'#1a1408'} roughness={0.8} />
      </mesh>
      <Text
        position={[0, 2.95, 0.045]}
        fontSize={0.13}
        color={'#f0d890'}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.12}
      >
        LIFT
      </Text>
      <Text
        position={[0, 2.82, 0.045]}
        fontSize={0.08}
        color={'#f0d890'}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
      >
        升降機
      </Text>
    </group>
  )
}
