import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import type { Group } from 'three'
import { Text } from '@react-three/drei'
import { useStore } from '../../store'
import { InteractiveGlow } from '../../scene/components/InteractiveGlow'

export function Drift() {
  const groupRef = useRef<Group>(null)
  const envelopeRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const setModal = useStore((s) => s.setModal)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.position.y = 1.6 + Math.sin(t * 0.5) * 0.2
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.08
    }
    if (envelopeRef.current) {
      envelopeRef.current.rotation.z = Math.sin(t * 1.2) * 0.06
    }
  })

  const handleTap = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setModal('fantasy')
  }

  return (
    <group
      ref={groupRef}
      position={[-1.2, 1.6, -0.5]}
      scale={hovered ? 1.05 : 1}
      onClick={handleTap}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      {/* Cloud body — pyramid shape: wide base, narrow top */}

      {/* Bottom layer — 4 spheres wide */}
      <mesh position={[-0.45, -0.15, 0]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
      </mesh>
      <mesh position={[-0.15, -0.18, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#F8F4FF" roughness={0.95} />
      </mesh>
      <mesh position={[0.18, -0.18, 0]}>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshStandardMaterial color="#F8F4FF" roughness={0.95} />
      </mesh>
      <mesh position={[0.48, -0.15, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
      </mesh>

      {/* Middle layer — 3 spheres */}
      <mesh position={[-0.25, 0.1, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
      </mesh>
      <mesh position={[0.05, 0.15, 0]}>
        <sphereGeometry args={[0.32, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
      </mesh>
      <mesh position={[0.32, 0.1, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
      </mesh>

      {/* Top puff */}
      <mesh position={[0.05, 0.4, 0]}>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.95} />
      </mesh>

      {/* Soft lavender underglow */}
      <pointLight
        position={[0, -0.4, 0.3]}
        color="#b098d8"
        intensity={0.7}
        distance={3}
        decay={2}
      />

      {/* Eyes — deep purple */}
      <mesh position={[-0.12, 0.0, 0.5]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshBasicMaterial color="#5A4A7A" />
      </mesh>
      <mesh position={[0.18, 0.0, 0.5]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshBasicMaterial color="#5A4A7A" />
      </mesh>

      {/* Eye sparkles */}
      <mesh position={[-0.1, 0.02, 0.55]}>
        <sphereGeometry args={[0.018, 6, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.2, 0.02, 0.55]}>
        <sphereGeometry args={[0.018, 6, 6]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Pink blush cheeks */}
      <mesh position={[-0.28, -0.08, 0.45]} scale={[1, 0.65, 1]}>
        <circleGeometry args={[0.06, 16]} />
        <meshBasicMaterial color="#F498B0" transparent opacity={0.5} />
      </mesh>
      <mesh position={[0.35, -0.08, 0.45]} scale={[1, 0.65, 1]}>
        <circleGeometry args={[0.06, 16]} />
        <meshBasicMaterial color="#F498B0" transparent opacity={0.5} />
      </mesh>

      {/* Smile */}
      <mesh position={[0.03, -0.12, 0.5]}>
        <torusGeometry args={[0.07, 0.012, 6, 10, Math.PI]} />
        <meshBasicMaterial color="#5A4A7A" />
      </mesh>

      {/* Envelope held in front of Drift */}
      <group ref={envelopeRef} position={[0, -0.65, 0.25]}>
        {/* Envelope body — bigger now */}
        <mesh>
          <boxGeometry args={[0.7, 0.5, 0.04]} />
          <meshStandardMaterial color="#f4e4c8" roughness={0.85} />
        </mesh>
        {/* Envelope back fold creases — V shape */}
        <mesh position={[-0.18, 0.1, 0.025]} rotation={[0, 0, -0.5]}>
          <planeGeometry args={[0.36, 0.005]} />
          <meshBasicMaterial color="#a89868" />
        </mesh>
        <mesh position={[0.18, 0.1, 0.025]} rotation={[0, 0, 0.5]}>
          <planeGeometry args={[0.36, 0.005]} />
          <meshBasicMaterial color="#a89868" />
        </mesh>
        {/* Wax seal — bigger */}
        <mesh position={[0, 0, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.015, 16]} />
          <meshStandardMaterial color="#c82820" roughness={0.3} />
        </mesh>
        {/* "COMING SOON" text */}
        <Text
          position={[0, -0.15, 0.025]}
          fontSize={0.05}
          color="#5a4030"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
        >
          COMING SOON
        </Text>
      </group>

      <InteractiveGlow radius={0.7} color="#b098d8" y={-0.5} />
    </group>
  )
}
