import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from './store'

// v3 — warmer, faded golden palette (Kodak Portra 400 feel)
const DAY_AMBIENT = { color: new THREE.Color('#f8d098'), intensity: 0.95 }
const NIGHT_AMBIENT = { color: new THREE.Color('#6a5a8a'), intensity: 1.1 }

const DAY_SUN = { color: new THREE.Color('#ffa040'), intensity: 1.25 }
const NIGHT_SUN = { color: new THREE.Color('#8a70c0'), intensity: 0.7 }

const DAY_CABIN = { color: new THREE.Color('#ffe8c8'), intensity: 0.3 }
const NIGHT_CABIN = { color: new THREE.Color('#ffb868'), intensity: 2.5 }

const LERP_SPEED = 4 // ~800ms to settle (exponential ease)

export function Lighting() {
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const dirRef = useRef<THREE.DirectionalLight>(null)
  const cabinRef = useRef<THREE.PointLight>(null)
  const mode = useStore((s) => s.mode)
  const target = mode === 'night' ? 1 : 0
  const blend = useRef(mode === 'night' ? 1 : 0)

  useFrame((_, delta) => {
    const t = blend.current
    const diff = target - t
    if (Math.abs(diff) > 0.001) {
      blend.current += diff * Math.min(LERP_SPEED * delta * 3, 1)
    } else {
      blend.current = target
    }

    const b = blend.current

    if (ambientRef.current) {
      ambientRef.current.color.lerpColors(DAY_AMBIENT.color, NIGHT_AMBIENT.color, b)
      ambientRef.current.intensity = THREE.MathUtils.lerp(DAY_AMBIENT.intensity, NIGHT_AMBIENT.intensity, b)
    }

    if (dirRef.current) {
      dirRef.current.color.lerpColors(DAY_SUN.color, NIGHT_SUN.color, b)
      dirRef.current.intensity = THREE.MathUtils.lerp(DAY_SUN.intensity, NIGHT_SUN.intensity, b)
    }

    if (cabinRef.current) {
      cabinRef.current.color.lerpColors(DAY_CABIN.color, NIGHT_CABIN.color, b)
      cabinRef.current.intensity = THREE.MathUtils.lerp(DAY_CABIN.intensity, NIGHT_CABIN.intensity, b)
    }
  })

  return (
    <>
      <ambientLight ref={ambientRef} />
      {/* Warm cabin interior light */}
      <pointLight
        ref={cabinRef}
        position={[0, 2.2, -5]}
        distance={15}
        decay={1.5}
      />
      <directionalLight
        ref={dirRef}
        position={[-3, 10, -8]}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={100}
        shadow-camera-left={-15}
        shadow-camera-right={15}
        shadow-camera-top={15}
        shadow-camera-bottom={-15}
      />
      {/* Teal shadow fill — Wong Kar-wai split-tone: warm highlights, cool shadows */}
      <directionalLight
        position={[3, 5, 8]}
        color="#5878a0"
        intensity={0.15}
      />
    </>
  )
}
