import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

const NEON_PINK = '#ff8ab0'
const NEON_PINK_BRIGHT = '#ffb0c8'

export function NeonSign() {
  const lightRef = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    if (lightRef.current) {
      lightRef.current.intensity = 1.4 + Math.sin(clock.elapsedTime * 8) * 0.08
    }
  })

  return (
    <group position={[2.2, 2.5, -5.92]}>
      <pointLight
        ref={lightRef}
        position={[0, 0, 0.3]}
        color={NEON_PINK}
        intensity={1.4}
        distance={3}
        decay={2}
      />

      {/* "stretch" — elegant with wide letter spacing */}
      <Text
        position={[0, 0.1, 0.02]}
        fontSize={0.22}
        color={NEON_PINK_BRIGHT}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.18}
        outlineWidth={0.006}
        outlineColor={NEON_PINK}
      >
        stretch
      </Text>
    </group>
  )
}
