import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib.js'
import { walledCityBus } from './bus'

// RectAreaLight needs LTC (Linearly Transformed Cosines) textures loaded
// before it can emit light. Without this init, the alley's main lights
// (SkySlitLight + the 3 entrance fluorescent tubes) silently fail and
// the world reads as black against the 0.08 ambient. This must be called
// exactly once at module load before any RectAreaLight enters the scene.
RectAreaLightUniformsLib.init()

// Lighting layer minus the tubes (moved to FluorescentTubes.tsx). What's
// here is ambient + sky-slit rake + incidental door/mouth spills. The
// sky-slit light dims when a plane passes overhead (see PlaneFlyover).

function SkySlitLight() {
  const ref = useRef<THREE.RectAreaLight>(null)
  useFrame(() => {
    if (ref.current) {
      // Dim to 25% at flyover peak
      ref.current.intensity = 8 * (1 - 0.75 * walledCityBus.flyoverK)
    }
  })
  return (
    <rectAreaLight
      ref={ref}
      position={[0, 3.9, 0]}
      width={0.28}
      height={9.6}
      intensity={8}
      color={'#ffe4a8'}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  )
}

export function WalledCityLighting() {
  return (
    <>
      {/* Deep-dark ambient — cold, low. Most visibility must come from the
          tubes and the sky slit. */}
      <ambientLight intensity={0.08} color={'#3a3a48'} />

      <SkySlitLight />

      {/* Warm spill from the open apartment door at z=-1.6 (left wall) */}
      <pointLight position={[-0.6, 1.2, -1.6]} color={'#ffa858'} intensity={0.4} distance={3} decay={2} />

      {/* Faint glow from the alley mouth (behind camera) */}
      <pointLight position={[0, 2.2, 4.6]} color={'#4a6a9a'} intensity={0.25} distance={4} decay={2} />
    </>
  )
}
