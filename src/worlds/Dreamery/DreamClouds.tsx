import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function MiniCloud({ position, scale, phaseOffset }: {
  position: [number, number, number]
  scale: number
  phaseOffset: number
}) {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime + phaseOffset
    groupRef.current.position.y = position[1] + Math.sin(t * 0.4) * 0.08
    groupRef.current.position.x = position[0] + Math.sin(t * 0.3) * 0.05
  })

  return (
    <group ref={groupRef} position={position} scale={[scale, scale, scale]}>
      <mesh position={[-0.18, -0.08, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#F5F0FF" roughness={0.95} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, -0.08, 0]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#F5F0FF" roughness={0.95} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.18, -0.08, 0]}>
        <sphereGeometry args={[0.18, 12, 12]} />
        <meshStandardMaterial color="#F5F0FF" roughness={0.95} transparent opacity={0.85} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} transparent opacity={0.85} />
      </mesh>
    </group>
  )
}

function Sparkle({ position, phaseOffset }: { position: [number, number, number]; phaseOffset: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.elapsedTime + phaseOffset
    meshRef.current.position.y = position[1] + Math.sin(t * 0.6) * 0.15
    meshRef.current.scale.setScalar(0.7 + Math.sin(t * 2) * 0.3)
  })
  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.025, 6, 6]} />
      <meshBasicMaterial color="#E8DEFF" />
    </mesh>
  )
}

export function DreamClouds() {
  return (
    <group>
      <MiniCloud position={[2.0, 2.5, -1]} scale={0.6} phaseOffset={0} />
      <MiniCloud position={[-2.5, 3.0, -2]} scale={0.5} phaseOffset={1.5} />
      <MiniCloud position={[1.0, 3.2, -2.5]} scale={0.4} phaseOffset={3.0} />
      <MiniCloud position={[-1.5, 2.8, 0.5]} scale={0.5} phaseOffset={4.5} />

      {Array.from({ length: 25 }).map((_, i) => {
        const x = (Math.sin(i * 2.1) * 0.5) * 6
        const y = 1 + Math.sin(i * 1.7) * 1.5 + 1.5
        const z = (Math.sin(i * 3.3) * 0.5) * 4 - 1
        return (
          <Sparkle
            key={i}
            position={[x, y, z]}
            phaseOffset={i * 0.25}
          />
        )
      })}
    </group>
  )
}
