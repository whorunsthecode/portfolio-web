import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore, STOPS } from '../store'
import { makeTextTexture } from './TextTexture'

export function DestinationBlind() {
  const groupRef = useRef<THREE.Group>(null)
  const blindIndex = useStore((s) => s.blindIndex)
  const stop = STOPS[blindIndex]

  const labelTex = useMemo(() => makeTextTexture({
    text: stop.label,
    fontSize: 40,
    color: '#2a2a2a',
    fontFamily: 'Georgia, "Times New Roman", serif',
    width: 512,
    height: 96,
  }), [stop.label])

  useFrame(() => {
    if (!groupRef.current) return
    const t = performance.now() * 0.001
    groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.005
  })

  return (
    <group ref={groupRef} position={[0, 2.35, -9.3]}>
      {/* Wooden rod */}
      <mesh position={[0, 0.1, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 1.0, 8]} />
        <meshStandardMaterial color="#6a4428" roughness={0.7} />
      </mesh>
      {/* Brass end caps */}
      <mesh position={[-0.5, 0.1, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#d4b880" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0.5, 0.1, 0]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color="#d4b880" metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Cream fabric strip */}
      <mesh position={[0, 0, 0.01]}>
        <planeGeometry args={[0.85, 0.15]} />
        <meshStandardMaterial color="#f5edd8" roughness={0.85} />
      </mesh>
      {/* Label only */}
      <mesh position={[0, 0, 0.02]}>
        <planeGeometry args={[0.8, 0.09]} />
        <meshBasicMaterial map={labelTex} transparent />
      </mesh>
    </group>
  )
}
