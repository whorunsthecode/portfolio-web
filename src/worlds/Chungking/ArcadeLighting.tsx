import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Three fluorescent strips running down the ceiling. One is on the verge
// of failing — flickers with a Perlin-ish jitter. The rest hum steady.

function FluorescentTube({ z, flicker }: { z: number; flicker?: boolean }) {
  const lightRef = useRef<THREE.RectAreaLight>(null)
  const bulbRef = useRef<THREE.MeshStandardMaterial>(null)
  const seed = z * 17.3

  useFrame(({ clock }) => {
    if (!flicker) return
    const t = clock.elapsedTime
    // Two-hertz jitter with occasional deep drops to sell a dying ballast
    const base = 0.78
    const dip =
      Math.sin(t * 14 + seed) > 0.7 && Math.sin(t * 3.1 + seed * 0.3) > 0.2
        ? 0.2 + Math.sin(t * 80 + seed) * 0.1
        : 1
    const intensity = base * dip
    if (lightRef.current) lightRef.current.intensity = 5.5 * intensity
    if (bulbRef.current) bulbRef.current.emissiveIntensity = 1.4 * intensity
  })

  return (
    <group position={[0, 3.14, z]}>
      {/* Tube fixture housing */}
      <mesh>
        <boxGeometry args={[0.35, 0.08, 1.4]} />
        <meshStandardMaterial color={'#e8e2d0'} roughness={0.6} />
      </mesh>
      {/* Tube itself — bright emissive strip */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.26, 0.02, 1.32]} />
        <meshStandardMaterial
          ref={bulbRef}
          color={'#f8fcff'}
          emissive={'#d8ecff'}
          emissiveIntensity={1.4}
        />
      </mesh>
      <rectAreaLight
        ref={lightRef}
        position={[0, -0.08, 0]}
        width={1.3}
        height={0.24}
        intensity={5.5}
        color={'#d8ecff'}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  )
}

export function ArcadeLighting() {
  return (
    <>
      {/* Base ambient — just enough so the floor isn't pure black under the
          tubes' shadow falloff. Warm tint biases toward tungsten fill from
          shop signage spilling out. */}
      <ambientLight intensity={0.22} color={'#a88c5a'} />

      {/* Three ceiling tubes at even spacing down the arcade depth */}
      <FluorescentTube z={-3.2} />
      <FluorescentTube z={-0.4} flicker />
      <FluorescentTube z={2.4} />

      {/* Warm spill from the back — simulates a lift-lobby bulb glow */}
      <pointLight position={[0, 1.8, -4.5]} color={'#ffb070'} intensity={0.35} distance={4} decay={2} />

      {/* Cool spill from the arcade mouth — street light leaking in */}
      <pointLight position={[0, 2.2, 4.6]} color={'#9ec8ff'} intensity={0.3} distance={5} decay={2} />
    </>
  )
}
