import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const NUM_BUBBLES = 30

function SurfaceRipple({ x, phase }: { x: number; phase: number }) {
  const ringRef = useRef<THREE.Mesh>(null)
  useFrame(({ clock }) => {
    if (!ringRef.current) return
    const t = (clock.elapsedTime + phase) % 4
    const progress = t / 4
    ringRef.current.scale.setScalar(0.1 + progress * 0.6)
    const mat = ringRef.current.material as THREE.MeshBasicMaterial
    mat.opacity = 0.6 * (1 - progress)
  })

  return (
    <mesh ref={ringRef} position={[x, 0.03, -1.2]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.8, 1.0, 16]} />
      <meshBasicMaterial color="#a8d0e0" transparent opacity={0.5} />
    </mesh>
  )
}

export function WaterEffects() {
  const bubblesRef = useRef<THREE.Points>(null)

  const bubblePositions = useMemo(() => {
    const arr = new Float32Array(NUM_BUBBLES * 3)
    for (let i = 0; i < NUM_BUBBLES; i++) {
      // Deterministic seeds
      arr[i * 3 + 0] = (Math.sin(i * 12.9898) * 0.5) * 7
      arr[i * 3 + 1] = -1.8 + (Math.sin(i * 78.233) * 0.5 + 0.5) * 2
      arr[i * 3 + 2] = -1.2 + (Math.sin(i * 37.719) * 0.5) * 0.3
    }
    return arr
  }, [])

  useFrame(() => {
    if (!bubblesRef.current) return
    const positions = bubblesRef.current.geometry.attributes.position.array as Float32Array
    const now = Date.now() * 0.001
    for (let i = 0; i < NUM_BUBBLES; i++) {
      // Deterministic rise speed per bubble
      const rise = 0.005 + ((Math.sin(i * 9.123) * 0.5 + 0.5) * 0.005)
      positions[i * 3 + 1] += rise
      positions[i * 3 + 0] += Math.sin(now + i) * 0.002
      if (positions[i * 3 + 1] > -0.05) {
        positions[i * 3 + 1] = -1.8
        positions[i * 3 + 0] = (Math.sin(i * 12.9898 + now * 0.1) * 0.5) * 7
      }
    }
    bubblesRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <group>
      {/* Rising bubbles */}
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
          size={0.06}
          transparent
          opacity={0.6}
          sizeAttenuation
        />
      </points>

      {/* Two surface ripple rings pulsing out of phase */}
      <SurfaceRipple x={-1.5} phase={0} />
      <SurfaceRipple x={2.0} phase={2.5} />
    </group>
  )
}
