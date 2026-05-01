import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'
import { InteractiveGlow } from '../../scene/components/InteractiveGlow'
import { TapHint } from '../../scene/components/TapHint'

export function GestureGalleryExhibit() {
  const handRef = useRef<THREE.Group>(null)
  const setModal = useStore((s) => s.setModal)
  const modal = useStore((s) => s.modal)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    if (handRef.current) {
      handRef.current.rotation.y = t * 0.4
      handRef.current.position.y = 2.0 + Math.sin(t * 0.8) * 0.08
    }
  })

  return (
    <group position={[0, 0, -2.0]}>
      {/* Pedestal base — wider lower step */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[0.7, 0.75, 0.1, 24]} />
        <meshStandardMaterial color="#d8d0c0" roughness={0.5} metalness={0.15} />
      </mesh>

      {/* Main pedestal column — beveled marble */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.55, 1.1, 16]} />
        <meshStandardMaterial color="#e8e4dc" roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Top cap disc */}
      <mesh position={[0, 1.18, 0]}>
        <cylinderGeometry args={[0.56, 0.52, 0.04, 24]} />
        <meshStandardMaterial color="#d8d0c0" roughness={0.5} metalness={0.15} />
      </mesh>

      {/* Pedestal plaque — gold frame + cream face */}
      <group position={[0, 0.7, 0.5]}>
        <mesh>
          <boxGeometry args={[0.4, 0.14, 0.015]} />
          <meshStandardMaterial color="#c8a048" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.008]}>
          <planeGeometry args={[0.37, 0.11]} />
          <meshStandardMaterial color="#f4ebd4" roughness={0.8} />
        </mesh>
        <Text
          position={[0, 0.025, 0.012]}
          fontSize={0.022}
          color="#2a2418"
          anchorX="center"
          anchorY="middle"
        >
          GESTURE GALLERY
        </Text>
        <Text
          position={[0, -0.005, 0.012]}
          fontSize={0.016}
          color="#5a4030"
          anchorX="center"
          anchorY="middle"
        >
          Karmen Yip, 2025
        </Text>
        <Text
          position={[0, -0.03, 0.012]}
          fontSize={0.013}
          color="#8a6a4a"
          anchorX="center"
          anchorY="middle"
        >
          MediaPipe · Three.js · Gemini
        </Text>
      </group>

      <InteractiveGlow radius={0.6} color="#c8a048" y={1.2} />

      {/* Floating hand — palm + thumb + 4 fingers */}
      <group
        ref={handRef}
        scale={[1.8, 1.8, 1.8]}
        onClick={(e) => {
          e.stopPropagation()
          setModal('museum')
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
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

      <TapHint
        label="Tap the hand · 點擊手型"
        storageKey="museum-hand"
        offset={[0, 3.1, 0]}
        dismissWhen={modal === 'museum'}
      />
    </group>
  )
}
