import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { useStore } from '../../store'
import { InteractiveGlow } from '../../scene/components/InteractiveGlow'
import { TapHint } from '../../scene/components/TapHint'

export function Shrimps() {
  const groupRef = useRef<THREE.Group>(null)
  const [hovered, setHovered] = useState(false)
  const setModal = useStore((s) => s.setModal)
  const modal = useStore((s) => s.modal)

  const shrimpTex = useTexture('/assets/shrimp.png')

  // Ensure high-quality texture rendering
  useEffect(() => {
    if (shrimpTex) {
      shrimpTex.minFilter = THREE.LinearMipmapLinearFilter
      shrimpTex.magFilter = THREE.LinearFilter
      shrimpTex.anisotropy = 16
      shrimpTex.needsUpdate = true
    }
  }, [shrimpTex])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    groupRef.current.position.y = 1.8 + Math.sin(clock.elapsedTime * 0.6) * 0.04
  })

  return (
    <group
      ref={groupRef}
      position={[2.2, 1.2, -5.5]}
      onClick={(e) => {
        e.stopPropagation()
        setModal('gym')
      }}
      onPointerOver={() => {
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      {/* === SHRIMP — transparent billboard === */}
      <mesh scale={hovered ? [1.04, 1.04, 1] : [1, 1, 1]}>
        <planeGeometry args={[2.4, 1.3]} />
        <meshBasicMaterial
          map={shrimpTex}
          transparent
          alphaTest={0.05}
          side={2}
        />
      </mesh>

      {/* Soft warm glow behind */}
      <pointLight position={[0, 0, 0.3]} color="#ff8860" intensity={0.8} distance={3} decay={2} />

      <InteractiveGlow radius={0.8} color="#ff8ab0" y={-0.6} />

      <TapHint
        label="Tap the shrimp · 點擊蝦仔"
        storageKey="gym-shrimp"
        offset={[0, 0.95, 0]}
        dismissWhen={modal === 'gym'}
      />
    </group>
  )
}
