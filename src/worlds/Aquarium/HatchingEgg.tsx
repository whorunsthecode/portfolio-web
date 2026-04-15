import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

const EGG_GLOW = '#f4d068'
const EGG_WARM = '#ffb050'
const RING_COLOR = '#ffd878'
const KOI_NEW = '#f87028'
const KOI_WHITE = '#f4ece0'

const CYCLE_LENGTH = 15
const PHASE_WAITING_END = 10
const PHASE_CRACK_END = 12
const PHASE_SWIM_END = 15

export function HatchingEgg() {
  const eggRef = useRef<THREE.Group>(null)
  const eggBodyRef = useRef<THREE.Mesh>(null)
  const ringFillRef = useRef<THREE.Mesh>(null)
  const crackRef = useRef<THREE.Group>(null)
  const newKoiRef = useRef<THREE.Group>(null)
  const newKoiBodyRef = useRef<THREE.Mesh>(null)
  const flashRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime % CYCLE_LENGTH

    // Egg phases
    if (eggRef.current && eggBodyRef.current) {
      const mat = eggBodyRef.current.material as THREE.MeshBasicMaterial

      if (t < PHASE_WAITING_END) {
        // Waiting — float + pulse
        eggRef.current.visible = true
        eggRef.current.position.y = Math.sin(t * 1.0) * 0.05
        eggRef.current.position.x = Math.sin(t * 0.7) * 0.08
        eggRef.current.scale.setScalar(1 + Math.sin(t * 2) * 0.03)
        mat.opacity = 0.85 + Math.sin(t * 2.5) * 0.1
      } else if (t < PHASE_CRACK_END) {
        // Cracking — shake, fade, slight grow
        const crackProgress = (t - PHASE_WAITING_END) / (PHASE_CRACK_END - PHASE_WAITING_END)
        eggRef.current.visible = true
        eggRef.current.position.x = Math.sin(t * 30) * 0.03 * (1 - crackProgress)
        mat.opacity = 1 - crackProgress
        eggRef.current.scale.setScalar(1 + crackProgress * 0.3)
      } else {
        eggRef.current.visible = false
      }
    }

    // Progress ring — rotates to reveal during waiting, hidden after
    if (ringFillRef.current) {
      if (t < PHASE_WAITING_END) {
        const progress = t / PHASE_WAITING_END
        ringFillRef.current.rotation.z = -progress * Math.PI * 2
        ringFillRef.current.visible = true
      } else {
        ringFillRef.current.visible = false
      }
    }

    // Flash at completion
    if (flashRef.current) {
      const mat = flashRef.current.material as THREE.MeshBasicMaterial
      if (t >= PHASE_WAITING_END && t < PHASE_WAITING_END + 0.5) {
        const flashProgress = (t - PHASE_WAITING_END) / 0.5
        mat.opacity = (1 - flashProgress) * 0.8
        flashRef.current.scale.setScalar(1 + flashProgress * 2)
      } else {
        mat.opacity = 0
      }
    }

    // Crack pieces — visible during crack phase
    if (crackRef.current) {
      crackRef.current.visible = t >= PHASE_WAITING_END && t < PHASE_CRACK_END
      if (crackRef.current.visible) {
        const crackProgress = (t - PHASE_WAITING_END) / (PHASE_CRACK_END - PHASE_WAITING_END)
        crackRef.current.rotation.z = crackProgress * 0.5
        crackRef.current.scale.setScalar(1 + crackProgress)
      }
    }

    // New koi — emerges during hatch, swims down + fades into the pool
    if (newKoiRef.current && newKoiBodyRef.current) {
      if (t >= PHASE_CRACK_END && t < PHASE_SWIM_END) {
        const emergeProgress = (t - PHASE_CRACK_END) / (PHASE_SWIM_END - PHASE_CRACK_END)
        newKoiRef.current.visible = true
        newKoiRef.current.position.y = -emergeProgress * 1.2
        newKoiRef.current.position.x = Math.sin(emergeProgress * 4) * 0.3
        newKoiRef.current.rotation.z = emergeProgress * 0.5
        const mat = newKoiBodyRef.current.material as THREE.MeshBasicMaterial
        mat.opacity = 1 - emergeProgress * 0.8
        mat.transparent = true
      } else {
        newKoiRef.current.visible = false
      }
    }
  })

  const tickAngles = [0, Math.PI / 2, Math.PI, Math.PI * 1.5]
  const crackPieces: [number, number, number][] = [
    [0.15, 0.1, 0.5],
    [-0.12, 0.05, -0.3],
    [0.08, -0.12, 0.7],
    [-0.1, -0.08, -0.8],
    [0.05, 0.15, 0.2],
  ]

  return (
    <group position={[0, -0.4, -1]}>
      {/* The egg */}
      <group ref={eggRef}>
        {/* Outer glow disc */}
        <mesh position={[0, 0, -0.01]}>
          <circleGeometry args={[0.25, 12]} />
          <meshBasicMaterial color={EGG_GLOW} transparent opacity={0.3} />
        </mesh>
        {/* Body */}
        <mesh ref={eggBodyRef}>
          <boxGeometry args={[0.16, 0.22, 0.16]} />
          <meshBasicMaterial color={EGG_WARM} transparent opacity={0.9} />
        </mesh>
        {/* Inner highlight */}
        <mesh position={[0.03, 0.04, 0.08]}>
          <boxGeometry args={[0.04, 0.06, 0.01]} />
          <meshBasicMaterial color="#fff4d0" />
        </mesh>
      </group>

      {/* Progress ring assembly */}
      <group position={[0, 0, 0.05]}>
        {/* Faint background ring */}
        <mesh>
          <ringGeometry args={[0.32, 0.36, 32]} />
          <meshBasicMaterial color={RING_COLOR} transparent opacity={0.2} />
        </mesh>
        {/* Rotating fill ring */}
        <mesh ref={ringFillRef}>
          <ringGeometry args={[0.32, 0.36, 32, 1, 0, Math.PI * 2]} />
          <meshBasicMaterial color={RING_COLOR} transparent opacity={0.9} side={2} />
        </mesh>
        {/* Tick marks */}
        {tickAngles.map((angle, i) => (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.34, Math.sin(angle) * 0.34, 0]}
            rotation={[0, 0, angle]}
          >
            <boxGeometry args={[0.02, 0.06, 0.02]} />
            <meshBasicMaterial color="#fff4a0" />
          </mesh>
        ))}
      </group>

      {/* Flash */}
      <mesh ref={flashRef} position={[0, 0, 0.01]}>
        <circleGeometry args={[0.35, 12]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0} />
      </mesh>

      {/* Crack shards */}
      <group ref={crackRef} visible={false}>
        {crackPieces.map((piece, i) => (
          <mesh
            key={i}
            position={[piece[0], piece[1], 0]}
            rotation={[0, 0, piece[2]]}
          >
            <boxGeometry args={[0.03, 0.05, 0.02]} />
            <meshBasicMaterial color={EGG_WARM} />
          </mesh>
        ))}
      </group>

      {/* New koi — emerges from the hatch */}
      <group ref={newKoiRef} visible={false}>
        <mesh ref={newKoiBodyRef}>
          <boxGeometry args={[0.2, 0.08, 0.1]} />
          <meshBasicMaterial color={KOI_NEW} transparent />
        </mesh>
        <mesh position={[0.1, 0, 0]}>
          <boxGeometry args={[0.08, 0.06, 0.08]} />
          <meshBasicMaterial color={KOI_NEW} transparent />
        </mesh>
        <mesh position={[-0.15, 0, 0]}>
          <boxGeometry args={[0.06, 0.1, 0.02]} />
          <meshBasicMaterial color="#c85020" transparent />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.1, 0.02, 0.06]} />
          <meshBasicMaterial color={KOI_WHITE} transparent />
        </mesh>
      </group>

      {/* FOCUSING label below the egg */}
      <Text
        position={[0, -0.6, 0.1]}
        fontSize={0.08}
        color="#ffd460"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.15}
      >
        FOCUSING · 25:00
      </Text>

      {/* Ambient glow */}
      <pointLight
        position={[0, 0, 0]}
        color={EGG_GLOW}
        intensity={1.5}
        distance={2.5}
        decay={2}
      />
    </group>
  )
}
