import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const NUM_FLAKES = 400

export function Snowfall() {
  const pointsRef = useRef<THREE.Points>(null)

  const positions = useMemo(() => {
    const arr = new Float32Array(NUM_FLAKES * 3)
    for (let i = 0; i < NUM_FLAKES; i++) {
      arr[i * 3 + 0] = (Math.sin(i * 73.156) * 0.5 + 0.5 - 0.5) * 40
      arr[i * 3 + 1] = (Math.sin(i * 41.732) * 0.5 + 0.5) * 15
      arr[i * 3 + 2] = (Math.sin(i * 17.453) * 0.5 + 0.5 - 0.5) * 30 - 4
    }
    return arr
  }, [])

  const velocities = useMemo(() => {
    const arr = new Float32Array(NUM_FLAKES)
    for (let i = 0; i < NUM_FLAKES; i++) {
      arr[i] = 0.01 + (Math.sin(i * 29.345) * 0.5 + 0.5) * 0.02
    }
    return arr
  }, [])

  useFrame(() => {
    if (!pointsRef.current) return
    const posAttr = pointsRef.current.geometry.attributes.position
    const arr = posAttr.array as Float32Array

    for (let i = 0; i < NUM_FLAKES; i++) {
      arr[i * 3 + 1] -= velocities[i]
      arr[i * 3 + 0] += Math.sin(Date.now() * 0.0005 + i) * 0.003
      if (arr[i * 3 + 1] < 0) {
        arr[i * 3 + 1] = 15
        arr[i * 3 + 0] = (Math.sin(i * 73.156 + Date.now() * 0.001) * 0.5) * 40
      }
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
          count={NUM_FLAKES}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#ffffff"
        size={0.08}
        transparent
        opacity={0.85}
        sizeAttenuation
      />
    </points>
  )
}
