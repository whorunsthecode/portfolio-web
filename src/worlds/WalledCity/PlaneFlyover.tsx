import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { walledCityBus } from './bus'

// Kai Tak approach overhead. Drives `walledCityBus.flyoverK` on a cycle:
// idle → rising → peak → falling → idle. The sky-slit mesh + rectAreaLight
// read the bus and dim together so the alley goes dark for a few seconds
// as the plane passes.
//
// From the rooftop you can actually SEE the plane: a simple 747 silhouette
// sweeps from east to west over the roofline during the peak+fall window.
// From inside the alley, a narrow shadow band slides along the sky slit.

const IDLE_MIN = 18    // seconds
const IDLE_MAX = 38
const FIRST_DELAY_MIN = 6
const FIRST_DELAY_MAX = 12

const RISE_DUR = 1.4
const PEAK_DUR = 2.4
const FALL_DUR = 3.4

const PLANE_Y = 22
const PLANE_Z = -18
const PLANE_X_START = 32
const PLANE_X_END = -32

type Phase = 'idle' | 'rise' | 'peak' | 'fall'

function Plane747({ planeRef }: { planeRef: React.RefObject<THREE.Group | null> }) {
  // Cathay-ish white fuselage with a green cheat-line. Scale is generous
  // so it reads clearly from the rooftop — real 747 is ~70m long; we use
  // 12m here so it's the right apparent size at the distance it flies.
  return (
    <group ref={planeRef} visible={false}>
      {/* Fuselage — nose points to -X (so the plane flies forward that way) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.6, 0.45, 12, 10]} />
        <meshStandardMaterial color={'#f0ece4'} roughness={0.5} metalness={0.1} />
      </mesh>
      {/* Green belly cheat-line */}
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, -0.1, 0]}>
        <cylinderGeometry args={[0.62, 0.47, 12, 10, 1, true, 0, Math.PI * 0.4]} />
        <meshStandardMaterial color={'#2a5a40'} roughness={0.55} side={THREE.DoubleSide} />
      </mesh>
      {/* Main wings — swept slightly, thin */}
      <mesh position={[0.4, -0.1, 0]}>
        <boxGeometry args={[2.0, 0.12, 8.5]} />
        <meshStandardMaterial color={'#e0dcd0'} roughness={0.55} />
      </mesh>
      {/* Tail horizontal stabilisers */}
      <mesh position={[-4.8, 0.2, 0]}>
        <boxGeometry args={[1.1, 0.08, 3.6]} />
        <meshStandardMaterial color={'#e0dcd0'} roughness={0.55} />
      </mesh>
      {/* Vertical tail fin */}
      <mesh position={[-4.8, 1.4, 0]}>
        <boxGeometry args={[1.3, 2.0, 0.1]} />
        <meshStandardMaterial color={'#e0dcd0'} roughness={0.55} />
      </mesh>
      {/* Four engines, two under each wing */}
      {[
        [0.6, -0.45,  1.8],
        [0.6, -0.45,  3.4],
        [0.6, -0.45, -1.8],
        [0.6, -0.45, -3.4],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.28, 0.26, 1.6, 10]} />
          <meshStandardMaterial color={'#b8b4ac'} roughness={0.4} metalness={0.3} />
        </mesh>
      ))}
      {/* Nav lights — tiny emissive blobs on wingtips */}
      <mesh position={[0.4, -0.05, 4.2]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial emissive={'#40ff40'} emissiveIntensity={3} color={'#40ff40'} />
      </mesh>
      <mesh position={[0.4, -0.05, -4.2]}>
        <sphereGeometry args={[0.1, 6, 6]} />
        <meshStandardMaterial emissive={'#ff4040'} emissiveIntensity={3} color={'#ff4040'} />
      </mesh>
    </group>
  )
}

export function PlaneFlyover() {
  const phaseRef = useRef<Phase>('idle')
  const phaseStart = useRef(0)
  const nextTrigger = useRef(0)
  const shadowRef = useRef<THREE.Mesh>(null)
  const planeRef = useRef<THREE.Group>(null)

  useEffect(() => {
    nextTrigger.current = FIRST_DELAY_MIN + Math.random() * (FIRST_DELAY_MAX - FIRST_DELAY_MIN)
  }, [])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime

    if (phaseRef.current === 'idle') {
      if (t >= nextTrigger.current) {
        phaseRef.current = 'rise'
        phaseStart.current = t
      }
      walledCityBus.flyoverK = 0
      if (shadowRef.current) shadowRef.current.visible = false
      if (planeRef.current) planeRef.current.visible = false
      return
    }

    const phaseT = t - phaseStart.current

    if (phaseRef.current === 'rise') {
      const p = Math.min(phaseT / RISE_DUR, 1)
      walledCityBus.flyoverK = p * 0.55
      if (p >= 1) {
        phaseRef.current = 'peak'
        phaseStart.current = t
      }
    } else if (phaseRef.current === 'peak') {
      const jitter = 0.05 * Math.sin(phaseT * 22)
      walledCityBus.flyoverK = Math.min(1, 0.9 + jitter)
      if (phaseT >= PEAK_DUR) {
        phaseRef.current = 'fall'
        phaseStart.current = t
      }
    } else {
      const p = Math.min(phaseT / FALL_DUR, 1)
      walledCityBus.flyoverK = (1 - p) * 0.7
      if (p >= 1) {
        phaseRef.current = 'idle'
        walledCityBus.flyoverK = 0
        nextTrigger.current = t + IDLE_MIN + Math.random() * (IDLE_MAX - IDLE_MIN)
      }
    }

    // Progress across the full event window, 0..1
    const totalDur = RISE_DUR + PEAK_DUR + FALL_DUR
    const totalT =
      phaseRef.current === 'rise' ? phaseT
      : phaseRef.current === 'peak' ? RISE_DUR + phaseT
      : RISE_DUR + PEAK_DUR + phaseT
    const p = totalT / totalDur

    // Alley shadow band sliding along the slit
    if (shadowRef.current) {
      shadowRef.current.position.z = -7 + p * 14
      shadowRef.current.visible = true
    }
    // Rooftop-visible plane crossing east→west
    if (planeRef.current) {
      planeRef.current.position.x = PLANE_X_START + p * (PLANE_X_END - PLANE_X_START)
      planeRef.current.position.y = PLANE_Y
      planeRef.current.position.z = PLANE_Z
      planeRef.current.visible = true
    }
  })

  return (
    <>
      {/* Alley shadow — narrow band below the sky slit */}
      <mesh ref={shadowRef} position={[0, 3.805, 0]} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[0.32, 1.8]} />
        <meshBasicMaterial color={'#050402'} side={THREE.DoubleSide} />
      </mesh>
      <Plane747 planeRef={planeRef} />
    </>
  )
}
