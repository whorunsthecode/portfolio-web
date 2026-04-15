import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'

type Variant = 'tree' | 'house' | 'rock' | 'flag'

interface IslandProps {
  position: [number, number, number]
  scale: number
  variant: Variant
  phaseOffset: number
}

function Island({ position, scale, variant, phaseOffset }: IslandProps) {
  const groupRef = useRef<Group>(null)
  const baseY = position[1]

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime + phaseOffset
    groupRef.current.position.y = baseY + Math.sin(t * 0.4) * 0.15
    groupRef.current.rotation.y = Math.sin(t * 0.2) * 0.05
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Grassy top */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.3, 0.4, 12]} />
        <meshStandardMaterial color="#8a7ab8" roughness={0.8} />
      </mesh>

      {/* Rocky bottom tapering to a point */}
      <mesh position={[0, -0.4, 0]}>
        <coneGeometry args={[0.3, 0.6, 8]} />
        <meshStandardMaterial color="#6a5a98" roughness={0.85} />
      </mesh>

      {/* Subtle glow ring under the island */}
      <mesh position={[0, -0.75, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.3, 0.6, 16]} />
        <meshBasicMaterial color="#c8b0d8" transparent opacity={0.4} />
      </mesh>

      {variant === 'tree' && (
        <group position={[0, 0.2, 0]}>
          <mesh position={[0, 0.2, 0]}>
            <cylinderGeometry args={[0.04, 0.05, 0.4, 6]} />
            <meshStandardMaterial color="#4a2818" />
          </mesh>
          <mesh position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.18, 8, 8]} />
            <meshStandardMaterial color="#5a7a68" roughness={0.8} />
          </mesh>
          <mesh position={[-0.08, 0.42, 0.08]}>
            <sphereGeometry args={[0.14, 8, 8]} />
            <meshStandardMaterial color="#4a6a58" roughness={0.8} />
          </mesh>
        </group>
      )}

      {variant === 'house' && (
        <group position={[0, 0.2, 0]}>
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.3, 0.3, 0.3]} />
            <meshStandardMaterial color="#e8c898" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.4, 0]}>
            <coneGeometry args={[0.25, 0.2, 4]} />
            <meshStandardMaterial color="#8a4a38" />
          </mesh>
          <mesh position={[0, 0.15, 0.16]}>
            <planeGeometry args={[0.08, 0.1]} />
            <meshBasicMaterial color="#ffb868" />
          </mesh>
          <pointLight
            position={[0, 0.2, 0.2]}
            color="#ffb868"
            intensity={0.4}
            distance={1.5}
            decay={2}
          />
        </group>
      )}

      {variant === 'rock' && (
        <group position={[0, 0.15, 0]}>
          <mesh rotation={[0.3, 0.5, 0.2]}>
            <octahedronGeometry args={[0.25, 0]} />
            <meshStandardMaterial
              color="#b098d8"
              roughness={0.3}
              metalness={0.4}
              emissive="#6a4888"
              emissiveIntensity={0.3}
            />
          </mesh>
        </group>
      )}

      {variant === 'flag' && (
        <group position={[0, 0.2, 0]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.6, 6]} />
            <meshStandardMaterial color="#4a3a28" />
          </mesh>
          <mesh position={[0.12, 0.5, 0]}>
            <planeGeometry args={[0.2, 0.12]} />
            <meshStandardMaterial color="#d85090" side={2} />
          </mesh>
        </group>
      )}
    </group>
  )
}

export function FloatingIslands() {
  const islands = useMemo<IslandProps[]>(
    () => [
      { position: [-4, 2, -6], scale: 0.7, variant: 'tree', phaseOffset: 0 },
      { position: [5, -1, -8], scale: 0.9, variant: 'house', phaseOffset: 1.2 },
      { position: [-6, -3, -10], scale: 0.5, variant: 'rock', phaseOffset: 2.4 },
      { position: [7, 3, -12], scale: 0.6, variant: 'tree', phaseOffset: 3.6 },
      { position: [-2, 4, -14], scale: 0.4, variant: 'flag', phaseOffset: 4.8 },
      { position: [3, -4, -11], scale: 0.7, variant: 'rock', phaseOffset: 6.0 },
      { position: [-8, 0, -15], scale: 0.8, variant: 'house', phaseOffset: 7.2 },
    ],
    [],
  )

  return (
    <>
      {islands.map((island, i) => (
        <Island key={i} {...island} />
      ))}
    </>
  )
}
