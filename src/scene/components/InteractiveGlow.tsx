import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface InteractiveGlowProps {
  radius?: number
  color?: string
  y?: number
}

export function InteractiveGlow({
  radius = 0.5,
  color = '#ffffff',
  y = 0,
}: InteractiveGlowProps) {
  const outerRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    if (outerRef.current) {
      // Pulse outward
      const pulse = 1 + Math.sin(t * 1.8) * 0.12
      outerRef.current.scale.set(pulse, pulse, 1)
      const mat = outerRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.35 + Math.sin(t * 1.8) * 0.2
    }

    if (innerRef.current) {
      // Counter-pulse inward
      const pulse2 = 1 - Math.sin(t * 1.8) * 0.08
      innerRef.current.scale.set(pulse2, pulse2, 1)
      const mat2 = innerRef.current.material as THREE.MeshBasicMaterial
      mat2.opacity = 0.5 + Math.sin(t * 1.8 + 1) * 0.2
    }
  })

  return (
    <group position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Outer glow ring */}
      <mesh ref={outerRef}>
        <ringGeometry args={[radius * 0.88, radius, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.4}
          side={2}
          depthWrite={false}
        />
      </mesh>
      {/* Inner brighter ring */}
      <mesh ref={innerRef}>
        <ringGeometry args={[radius * 0.7, radius * 0.85, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.55}
          side={2}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
