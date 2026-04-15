import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const NUM_SPARKLES = 150

export function DreamSparkles() {
  const pointsRef = useRef<THREE.Points>(null)

  const { positions, offsets } = useMemo(() => {
    const positions = new Float32Array(NUM_SPARKLES * 3)
    const offsets = new Float32Array(NUM_SPARKLES * 3)
    for (let i = 0; i < NUM_SPARKLES; i++) {
      // Deterministic pseudo-random via trig seeds
      positions[i * 3 + 0] = (Math.sin(i * 12.9898) * 0.5) * 30
      positions[i * 3 + 1] = (Math.sin(i * 78.233) * 0.5) * 15
      positions[i * 3 + 2] = -5 - (Math.sin(i * 37.719) * 0.5 + 0.5) * 20
      offsets[i * 3 + 0] = (i * 0.3137) % (Math.PI * 2)
      offsets[i * 3 + 1] = (i * 0.7542) % (Math.PI * 2)
      offsets[i * 3 + 2] = (i * 1.1183) % (Math.PI * 2)
    }
    return { positions, offsets }
  }, [])

  useFrame(() => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.attributes.position
    const arr = posAttr.array as Float32Array
    const t = Date.now() * 0.0003

    for (let i = 0; i < NUM_SPARKLES; i++) {
      arr[i * 3 + 0] += Math.sin(t + offsets[i * 3]) * 0.004
      arr[i * 3 + 1] += Math.sin(t * 0.7 + offsets[i * 3 + 1]) * 0.005
      arr[i * 3 + 2] += Math.sin(t * 0.5 + offsets[i * 3 + 2]) * 0.003
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={NUM_SPARKLES}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffd080"
        size={0.1}
        transparent
        opacity={0.7}
        sizeAttenuation
      />
    </points>
  )
}
