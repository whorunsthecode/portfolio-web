import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store'

export function GestureGalleryExhibit() {
  const handRef = useRef<THREE.Group>(null)
  const orbitRef = useRef<THREE.Group>(null)
  const setModal = useStore((s) => s.setModal)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (handRef.current) {
      handRef.current.rotation.y = t * 0.4
      handRef.current.position.y = 2.0 + Math.sin(t * 0.8) * 0.08
    }
    if (orbitRef.current) {
      orbitRef.current.rotation.y = t * 0.25
    }
  })

  return (
    <group position={[0, 0, -3.5]}>
      {/* Pedestal */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.6, 1.0, 16]} />
        <meshStandardMaterial color="#e8e4dc" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Floating hand — palm + thumb + 4 fingers */}
      <group
        ref={handRef}
        onClick={(e) => {
          e.stopPropagation()
          setModal('museum')
        }}
        onPointerOver={() => { document.body.style.cursor = 'pointer' }}
        onPointerOut={() => { document.body.style.cursor = 'auto' }}
      >
        {/* Palm */}
        <mesh>
          <boxGeometry args={[0.35, 0.4, 0.1]} />
          <meshStandardMaterial color="#e8c8a0" roughness={0.6} />
        </mesh>
        {/* Thumb */}
        <mesh position={[-0.22, 0.05, 0]} rotation={[0, 0, Math.PI / 3]}>
          <cylinderGeometry args={[0.04, 0.04, 0.22, 8]} />
          <meshStandardMaterial color="#e8c8a0" roughness={0.6} />
        </mesh>
        {/* 4 fingers */}
        {[-0.12, -0.04, 0.04, 0.12].map((x, i) => (
          <mesh key={i} position={[x, 0.3, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.28, 8]} />
            <meshStandardMaterial color="#e8c8a0" roughness={0.6} />
          </mesh>
        ))}
      </group>

      {/* Orbiting thumbnails — 3 small painting cards */}
      <group ref={orbitRef} position={[0, 2.0, 0]}>
        {[0, 1, 2].map((i) => {
          const angle = (i / 3) * Math.PI * 2
          const r = 0.9
          const colors = ['#4a7a8c', '#f0c848', '#c8a048']
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
              rotation={[0, -angle + Math.PI / 2, 0]}
            >
              <planeGeometry args={[0.25, 0.18]} />
              <meshStandardMaterial color={colors[i]} roughness={0.7} side={2} />
            </mesh>
          )
        })}
      </group>

      {/* Wall label behind the exhibit */}
      <mesh position={[0, 3.8, -1.2]}>
        <planeGeometry args={[1.6, 0.3]} />
        <meshStandardMaterial color="#f0ead8" roughness={0.8} />
      </mesh>
    </group>
  )
}
