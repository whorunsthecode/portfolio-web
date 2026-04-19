import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface InteractiveGlowProps {
  radius?: number
  color?: string
  y?: number
}

/**
 * InteractiveGlow — pulsing floor ring under a tappable 3D element.
 *
 * Layers:
 *   1. Ping ring  — expands outward from radius×0.7 → radius×1.5 over a 1.8s
 *                   cycle, opacity fades 0.75 → 0. Classic "tap here" ripple.
 *   2. Outer ring — steady pulse, scales 0.85–1.15, base opacity bumped so the
 *                   affordance is legible on desktop without the TapHint chip.
 *   3. Inner ring — counter-pulses, fills in the center so the glow doesn't
 *                   read as a thin outline.
 */
export function InteractiveGlow({
  radius = 0.5,
  color = '#ffffff',
  y = 0,
}: InteractiveGlowProps) {
  const pingRef = useRef<THREE.Mesh>(null)
  const outerRef = useRef<THREE.Mesh>(null)
  const innerRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    if (pingRef.current) {
      // 0→1 sawtooth over 1.8s: expand + fade out
      const p = (t % 1.8) / 1.8
      const scale = 0.7 + p * 0.8 // 0.7 → 1.5
      pingRef.current.scale.set(scale, scale, 1)
      const mat = pingRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = (1 - p) * 0.75
    }

    if (outerRef.current) {
      // Pulse outward, larger amplitude + higher base opacity than before
      const pulse = 1 + Math.sin(t * 1.8) * 0.15
      outerRef.current.scale.set(pulse, pulse, 1)
      const mat = outerRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.6 + Math.sin(t * 1.8) * 0.25
    }

    if (innerRef.current) {
      // Counter-pulse inward
      const pulse2 = 1 - Math.sin(t * 1.8) * 0.08
      innerRef.current.scale.set(pulse2, pulse2, 1)
      const mat2 = innerRef.current.material as THREE.MeshBasicMaterial
      mat2.opacity = 0.65 + Math.sin(t * 1.8 + 1) * 0.25
    }
  })

  return (
    <group position={[0, y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Expanding ping ripple — the "tap here" signal */}
      <mesh ref={pingRef}>
        <ringGeometry args={[radius * 0.92, radius, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.75}
          side={2}
          depthWrite={false}
        />
      </mesh>
      {/* Outer glow ring */}
      <mesh ref={outerRef}>
        <ringGeometry args={[radius * 0.86, radius, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.7}
          side={2}
          depthWrite={false}
        />
      </mesh>
      {/* Inner brighter ring */}
      <mesh ref={innerRef}>
        <ringGeometry args={[radius * 0.68, radius * 0.84, 48]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.8}
          side={2}
          depthWrite={false}
        />
      </mesh>
    </group>
  )
}
