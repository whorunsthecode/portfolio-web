import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type * as THREE from 'three'

// Broken neon tube (purple) — flickers like a short circuit
function BrokenNeon() {
  const ref = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime
    const spark = Math.sin(t * 40) > 0.6 && Math.sin(t * 7.3) > 0.1
    ref.current.emissiveIntensity = spark
      ? 2.8 + Math.abs(Math.sin(t * 120)) * 1.2
      : 0.3
  })

  return (
    // Wall-mounted at z=−24 right side, slightly drooping
    <group position={[0.82, 2.1, -24]} rotation={[0, -Math.PI / 2, 0.15]}>
      <mesh>
        <cylinderGeometry args={[0.012, 0.012, 0.7, 8]} />
        <meshStandardMaterial
          ref={ref}
          color="#b43cc8"
          emissive="#b43cc8"
          emissiveIntensity={0.3}
        />
      </mesh>
    </group>
  )
}

export function FallenAngelsEggs() {
  return (
    <group>
      {/* Sony Walkman — floor corner at z≈−18 */}
      <group position={[-0.82, 0, -18.5]}>
        {/* Body */}
        <mesh position={[0, 0.045, 0]}>
          <boxGeometry args={[0.14, 0.09, 0.28]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.5} roughness={0.6} />
        </mesh>
        {/* Headphone jack glow */}
        <mesh position={[0, 0.09, 0.14]}>
          <cylinderGeometry args={[0.006, 0.006, 0.02, 8]} />
          <meshStandardMaterial color="#c8a040" emissive="#c8a040" emissiveIntensity={0.8} />
        </mesh>
      </group>

      {/* Blue Ribbon beer can — z≈−22 right base */}
      <group position={[0.75, 0.065, -22]}>
        <mesh>
          <cylinderGeometry args={[0.033, 0.033, 0.13, 16]} />
          <meshStandardMaterial color="#1a3a6a" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Pull-tab */}
        <mesh position={[0, 0.07, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.005, 12]} />
          <meshStandardMaterial color="#c0c0c0" metalness={0.9} roughness={0.3} />
        </mesh>
      </group>

      {/* Broken neon tube — purple, short-circuit flicker */}
      <BrokenNeon />

      {/* Red payphone — dead-end left, z≈−28 */}
      <group position={[-0.76, 0, -28]}>
        {/* Body box */}
        <mesh position={[0, 0.9, 0.12]}>
          <boxGeometry args={[0.35, 0.5, 0.18]} />
          <meshStandardMaterial color="#c01818" roughness={0.7} />
        </mesh>
        {/* Handset — hanging down (cord broke) */}
        <mesh position={[-0.1, 0.62, 0.22]} rotation={[0.8, 0, 0.3]}>
          <boxGeometry args={[0.05, 0.18, 0.04]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.75} />
        </mesh>
        {/* Coin slot glow */}
        <mesh position={[0, 1.08, 0.215]}>
          <boxGeometry args={[0.08, 0.01, 0.005]} />
          <meshStandardMaterial color="#d4a820" emissive="#d4a820" emissiveIntensity={0.6} />
        </mesh>
      </group>
    </group>
  )
}
