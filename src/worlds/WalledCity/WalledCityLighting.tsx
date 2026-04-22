import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Two light sources define this room:
// 1. A single fluorescent tube deep in the alley, the kind that clicks
//    and dies every third cycle.
// 2. The sky slit above — a bright warm line that rakes down the walls
//    directly below it.

function DyingFluorescent() {
  const areaRef = useRef<THREE.RectAreaLight>(null)
  const bulbRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    // Alternating long-on / brief-stutter-off pattern
    const cycle = Math.floor(t * 0.6) % 4
    let k = 1
    if (cycle === 3) {
      // dying phase — flicker heavily
      k = 0.2 + (Math.sin(t * 40) > 0.3 ? 0.6 : 0)
    } else if (Math.sin(t * 18) > 0.85) {
      // tiny micro-stutters in the healthy phase
      k = 0.7
    }
    if (areaRef.current) areaRef.current.intensity = 6 * k
    if (bulbRef.current) bulbRef.current.emissiveIntensity = 1.5 * k
  })

  return (
    <group position={[0, 3.25, -2.5]}>
      <mesh>
        <boxGeometry args={[0.24, 0.08, 1.0]} />
        <meshStandardMaterial color={'#d0c8b0'} roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.18, 0.02, 0.9]} />
        <meshStandardMaterial
          ref={bulbRef}
          color={'#eef4ff'}
          emissive={'#c8d8ff'}
          emissiveIntensity={1.5}
        />
      </mesh>
      <rectAreaLight
        ref={areaRef}
        position={[0, -0.08, 0]}
        width={0.88}
        height={0.18}
        intensity={6}
        color={'#c8d8ff'}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  )
}

export function WalledCityLighting() {
  return (
    <>
      {/* Deep-dark ambient — cold, low. Most visibility must come from the
          tube and the sky slit. */}
      <ambientLight intensity={0.08} color={'#3a3a48'} />

      <DyingFluorescent />

      {/* Sky slit illumination — long rect light above the gap in the
          ceiling, pointing down. Warms the floor and the tops of the
          walls directly below the slit. */}
      <rectAreaLight
        position={[0, 3.9, 0]}
        width={0.28}
        height={9.6}
        intensity={8}
        color={'#ffe4a8'}
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Warm spill from the open apartment door at z=-1.6 (left wall) */}
      <pointLight position={[-0.6, 1.2, -1.6]} color={'#ffa858'} intensity={0.4} distance={3} decay={2} />

      {/* Faint glow from the alley mouth (behind camera) */}
      <pointLight position={[0, 2.2, 4.6]} color={'#4a6a9a'} intensity={0.25} distance={4} decay={2} />
    </>
  )
}
