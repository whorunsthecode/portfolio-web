import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type Profile = 'healthy' | 'flicker' | 'dying'

interface Tube {
  z: number
  profile: Profile
  seed: number
}

// Spec: roughly 30% healthy / 50% flickering / 20% dying. With 3 tubes
// that's one of each. Placement is spread along the 10m alley (z -5..5)
// avoiding the deepest wall and leaving the middle for the open door spill.
const TUBES: Tube[] = [
  { z: -4.2, profile: 'dying',   seed: 1.7 },
  { z: -0.8, profile: 'flicker', seed: 4.3 },
  { z:  2.8, profile: 'healthy', seed: 2.1 },
]

function tubeIntensity(profile: Profile, t: number, seed: number): number {
  switch (profile) {
    case 'healthy': {
      // Stable with barely perceptible hum — 0.9..1.0 sine at ~60Hz flutter
      const hum = 0.95 + 0.05 * Math.sin(t * 8 + seed)
      // Very occasional micro-stutter
      const stutter = Math.sin(t * 0.37 + seed) > 0.97 ? 0.85 : 1
      return hum * stutter
    }
    case 'flicker': {
      // Irregular strobing — two overlapping sines create an aperiodic feel.
      // Base ~0.6–0.9 with occasional full-off blips.
      const a = Math.sin(t * 11 + seed)
      const b = Math.sin(t * 2.3 + seed * 0.7)
      const base = 0.6 + 0.35 * (a * 0.6 + b * 0.4)
      const dropout = Math.sin(t * 3.1 + seed) > 0.92 ? 0.05 : 1
      return base * dropout
    }
    case 'dying': {
      // Long dead phases, brief violent relights. Cycle ~6s: 4s dark, 2s
      // strobing back to life.
      const cycle = (t + seed) % 6
      if (cycle < 4) {
        return 0.02 + (Math.sin(t * 23) > 0.6 ? 0.15 : 0)
      }
      return 0.3 + (Math.sin(t * 45) > 0.3 ? 0.7 : 0)
    }
  }
}

function Tube({ tube }: { tube: Tube }) {
  const lightRef = useRef<THREE.RectAreaLight>(null)
  const bulbRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    const k = tubeIntensity(tube.profile, clock.elapsedTime, tube.seed)
    if (lightRef.current) lightRef.current.intensity = 6 * k
    if (bulbRef.current) bulbRef.current.emissiveIntensity = 1.6 * k
  })

  return (
    <group position={[0, 3.25, tube.z]}>
      {/* Metal housing */}
      <mesh>
        <boxGeometry args={[0.24, 0.08, 1.0]} />
        <meshStandardMaterial color={'#b8b0a0'} roughness={0.75} metalness={0.2} />
      </mesh>
      {/* Bulb — cold-white with slight green tint from age */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.18, 0.02, 0.9]} />
        <meshStandardMaterial
          ref={bulbRef}
          color={'#eef4e8'}
          emissive={'#d0dcb8'}
          emissiveIntensity={1.6}
        />
      </mesh>
      {/* Downward cast */}
      <rectAreaLight
        ref={lightRef}
        position={[0, -0.08, 0]}
        width={0.88}
        height={0.18}
        intensity={6}
        color={'#d4e0c0'}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      {/* Suspension wires — two thin vertical lines to the ceiling */}
      <mesh position={[-0.08, 0.27, -0.4]}>
        <cylinderGeometry args={[0.005, 0.005, 0.55, 4]} />
        <meshStandardMaterial color={'#1a1410'} />
      </mesh>
      <mesh position={[0.08, 0.27, 0.4]}>
        <cylinderGeometry args={[0.005, 0.005, 0.55, 4]} />
        <meshStandardMaterial color={'#1a1410'} />
      </mesh>
    </group>
  )
}

export function FluorescentTubes() {
  return (
    <>
      {TUBES.map((t, i) => (
        <Tube key={i} tube={t} />
      ))}
    </>
  )
}
