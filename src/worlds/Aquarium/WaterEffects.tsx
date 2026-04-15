import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const NUM_BUBBLES = 40

export function WaterEffects() {
  const bubblesRef = useRef<THREE.Points>(null)

  const bubblePositions = useMemo(() => {
    const arr = new Float32Array(NUM_BUBBLES * 3)
    for (let i = 0; i < NUM_BUBBLES; i++) {
      arr[i * 3 + 0] = (Math.sin(i * 12.9898) * 0.5) * 8
      arr[i * 3 + 1] = -1.4 + (Math.sin(i * 78.233) * 0.5 + 0.5) * 5
      arr[i * 3 + 2] = (Math.sin(i * 37.719) * 0.5) * 8
    }
    return arr
  }, [])

  useFrame(() => {
    if (!bubblesRef.current) return
    const positions = bubblesRef.current.geometry.attributes.position.array as Float32Array
    const now = Date.now() * 0.001
    for (let i = 0; i < NUM_BUBBLES; i++) {
      const rise = 0.004 + ((Math.sin(i * 9.123) * 0.5 + 0.5) * 0.004)
      positions[i * 3 + 1] += rise
      positions[i * 3 + 0] += Math.sin(now + i) * 0.002
      if (positions[i * 3 + 1] > 4.4) {
        positions[i * 3 + 1] = -1.4
        positions[i * 3 + 0] = (Math.sin(i * 12.9898 + now * 0.1) * 0.5) * 8
      }
    }
    bubblesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={bubblesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={NUM_BUBBLES}
          array={bubblePositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#b8e0f0"
        size={0.08}
        transparent
        opacity={0.6}
        sizeAttenuation
      />
    </points>
  )
}
