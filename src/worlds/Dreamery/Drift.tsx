import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import type { Group } from 'three'
import { useStore } from '../../store'

export function Drift() {
  const groupRef = useRef<Group>(null)
  const envelopeRef = useRef<Group>(null)
  const [hovered, setHovered] = useState(false)
  const setModal = useStore((s) => s.setModal)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 0.5) * 0.2
      groupRef.current.rotation.y = Math.sin(t * 0.3) * 0.08
    }
    if (envelopeRef.current) {
      envelopeRef.current.rotation.z = Math.sin(t * 1.2) * 0.06
    }
  })

  const handleTap = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    // Modal keyed off stop id — kept as 'fantasy' to avoid breaking references
    setModal('fantasy')
  }

  return (
    <group
      ref={groupRef}
      position={[0, 0, -4]}
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
      {/* Cloud body — overlapping spheres */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.7, 16, 16]} />
        <meshStandardMaterial color="#f8f4e8" roughness={0.9} />
      </mesh>
      <mesh position={[-0.55, -0.05, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#f8f4e8" roughness={0.9} />
      </mesh>
      <mesh position={[0.55, -0.05, 0]}>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color="#f8f4e8" roughness={0.9} />
      </mesh>
      <mesh position={[-0.25, 0.3, 0]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="#f8f4e8" roughness={0.9} />
      </mesh>
      <mesh position={[0.25, 0.3, 0]}>
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshStandardMaterial color="#f8f4e8" roughness={0.9} />
      </mesh>

      {/* Soft lavender underglow (sells the gradient bottom) */}
      <pointLight
        position={[0, -0.4, 0.3]}
        color="#b098d8"
        intensity={0.7}
        distance={3}
        decay={2}
      />

      {/* Closed sleepy eyes — small upward arcs ⌒ ⌒ */}
      <mesh position={[-0.22, 0.05, 0.6]}>
        <torusGeometry args={[0.07, 0.012, 8, 16, Math.PI]} />
        <meshBasicMaterial color="#3a2a5a" />
      </mesh>
      <mesh position={[0.22, 0.05, 0.6]}>
        <torusGeometry args={[0.07, 0.012, 8, 16, Math.PI]} />
        <meshBasicMaterial color="#3a2a5a" />
      </mesh>

      {/* Pink blush cheeks — two small rosy ovals */}
      <mesh position={[-0.32, -0.05, 0.58]} scale={[1, 0.65, 1]}>
        <circleGeometry args={[0.07, 16]} />
        <meshBasicMaterial color="#f4a8b0" transparent opacity={0.85} />
      </mesh>
      <mesh position={[0.32, -0.05, 0.58]} scale={[1, 0.65, 1]}>
        <circleGeometry args={[0.07, 16]} />
        <meshBasicMaterial color="#f4a8b0" transparent opacity={0.85} />
      </mesh>

      {/* Tiny gentle smile — small ∪ arc */}
      <mesh position={[0, -0.08, 0.6]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.055, 0.011, 8, 16, Math.PI]} />
        <meshBasicMaterial color="#3a2a5a" />
      </mesh>

      {/* Envelope held in front of Drift */}
      <group ref={envelopeRef} position={[0, -0.8, 0.3]}>
        {/* Envelope body */}
        <mesh>
          <boxGeometry args={[0.5, 0.35, 0.02]} />
          <meshStandardMaterial color="#f4e4c8" roughness={0.85} />
        </mesh>
        {/* Flap — triangular prism hint */}
        <mesh position={[0, 0.08, 0.012]} rotation={[0, 0, Math.PI]}>
          <coneGeometry args={[0.26, 0.18, 3]} />
          <meshStandardMaterial color="#e8d4a8" />
        </mesh>
        {/* Wax seal */}
        <mesh position={[0, 0, 0.015]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.01, 12]} />
          <meshStandardMaterial color="#c82820" roughness={0.3} />
        </mesh>
        {/* "Coming Soon" band */}
        <mesh position={[0, -0.1, 0.015]}>
          <planeGeometry args={[0.4, 0.06]} />
          <meshBasicMaterial color="#6a5a40" />
        </mesh>
      </group>

      {/* Hover ring */}
      {hovered && (
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.3, 1.4, 32]} />
          <meshBasicMaterial color="#f8b8c8" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}
