import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const ORNAMENT_COLORS = ['#c82820', '#f4c430', '#2a6ac8', '#e8a028', '#a82898']

export function ChristmasTree() {
  const treeRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (treeRef.current) {
      treeRef.current.rotation.z = Math.sin(clock.getElapsedTime() * 0.8) * 0.01
    }
  })

  return (
    <group ref={treeRef} position={[-1.5, 0, -2]}>
      {/* Trunk */}
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.6, 8]} />
        <meshStandardMaterial color="#3a2010" roughness={0.9} />
      </mesh>

      {/* Foliage — 3 stacked cones */}
      <mesh position={[0, 1.0, 0]} castShadow>
        <coneGeometry args={[0.8, 1.2, 8]} />
        <meshStandardMaterial color="#1a4a28" roughness={0.9} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <coneGeometry args={[0.6, 1.0, 8]} />
        <meshStandardMaterial color="#1a4a28" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.1, 0]} castShadow>
        <coneGeometry args={[0.4, 0.8, 8]} />
        <meshStandardMaterial color="#1a4a28" roughness={0.9} />
      </mesh>

      {/* Star on top */}
      <mesh position={[0, 2.7, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color="#f4e480" />
      </mesh>
      <pointLight position={[0, 2.7, 0]} color="#f4e480" intensity={0.8} distance={2} decay={2} />

      {/* 12 ornaments */}
      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2 + i * 0.3
        const tier = i % 3
        const tierY = [2.0, 1.4, 0.9][tier]
        const tierR = [0.25, 0.4, 0.55][tier]
        const color = ORNAMENT_COLORS[i % ORNAMENT_COLORS.length]
        return (
          <group key={i} position={[Math.cos(angle) * tierR, tierY, Math.sin(angle) * tierR]}>
            <mesh>
              <sphereGeometry args={[0.05, 8, 8]} />
              <meshStandardMaterial color={color} roughness={0.3} metalness={0.4} />
            </mesh>
            <pointLight color={color} intensity={0.15} distance={0.8} decay={2} />
          </group>
        )
      })}

      {/* Snow pile at base */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.6, 0.65, 0.1, 8]} />
        <meshBasicMaterial color="#e8ecf4" />
      </mesh>
    </group>
  )
}
