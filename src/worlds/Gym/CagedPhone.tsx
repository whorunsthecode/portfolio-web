import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const CAGE_GREY = '#3a3a38'
const PHONE_GLOW = '#ffc468'
const MAT_PURPLE = '#6a4888'

export function CagedPhone() {
  const phoneGlowRef = useRef<THREE.Mesh>(null)
  const cageRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (phoneGlowRef.current) {
      const mat = phoneGlowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.7 + Math.sin(t * 1.5) * 0.15
    }
    if (cageRef.current) {
      cageRef.current.rotation.y = t * 0.1
    }
  })

  const cagePosts: [number, number, number][] = [
    [-0.15, 0, -0.24],
    [0.15, 0, -0.24],
    [-0.15, 0, 0.24],
    [0.15, 0, 0.24],
  ]

  const cageRails: { pos: [number, number, number]; size: [number, number, number] }[] = [
    { pos: [0, 0.15, -0.24], size: [0.3, 0.006, 0.006] },
    { pos: [0, 0.15, 0.24], size: [0.3, 0.006, 0.006] },
    { pos: [-0.15, 0.15, 0], size: [0.006, 0.006, 0.48] },
    { pos: [0.15, 0.15, 0], size: [0.006, 0.006, 0.48] },
  ]

  return (
    <group position={[0, 0, -2]}>
      {/* Yoga mat — rolled out on the floor */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 0.6]} />
        <meshStandardMaterial color={MAT_PURPLE} roughness={0.9} />
      </mesh>
      {/* Mat edge ring */}
      <mesh position={[0, 0.025, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.88, 0.9, 32, 1]} />
        <meshStandardMaterial color="#8a68a8" />
      </mesh>

      {/* Phone */}
      <group position={[0, 0.1, 0]}>
        <mesh>
          <boxGeometry args={[0.18, 0.02, 0.38]} />
          <meshStandardMaterial color="#1a1a18" roughness={0.5} metalness={0.3} />
        </mesh>
        {/* Glowing amber screen */}
        <mesh
          ref={phoneGlowRef}
          position={[0, 0.012, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.16, 0.34]} />
          <meshBasicMaterial color={PHONE_GLOW} transparent opacity={0.7} />
        </mesh>
        {/* Lock icon body */}
        <mesh position={[0, 0.013, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.04, 0.05]} />
          <meshBasicMaterial color="#2a2418" />
        </mesh>
        {/* Lock icon shackle */}
        <mesh position={[0, 0.014, -0.03]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.018, 0.005, 6, 12, Math.PI]} />
          <meshBasicMaterial color="#2a2418" />
        </mesh>
      </group>

      {/* The cage — slowly rotating wire frame around the phone */}
      <group ref={cageRef} position={[0, 0.2, 0]}>
        {cagePosts.map((p, i) => (
          <mesh key={`post-${i}`} position={p}>
            <cylinderGeometry args={[0.006, 0.006, 0.3, 6]} />
            <meshStandardMaterial color={CAGE_GREY} metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        {cageRails.map((r, i) => (
          <mesh key={`rail-${i}`} position={r.pos}>
            <boxGeometry args={r.size} />
            <meshStandardMaterial color={CAGE_GREY} metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
        {/* Vertical thin bars on the long sides */}
        {[-0.2, -0.1, 0, 0.1, 0.2].map((z, i) => (
          <group key={`bars-${i}`}>
            <mesh position={[-0.15, 0, z]}>
              <cylinderGeometry args={[0.003, 0.003, 0.3, 6]} />
              <meshStandardMaterial color={CAGE_GREY} metalness={0.6} />
            </mesh>
            <mesh position={[0.15, 0, z]}>
              <cylinderGeometry args={[0.003, 0.003, 0.3, 6]} />
              <meshStandardMaterial color={CAGE_GREY} metalness={0.6} />
            </mesh>
          </group>
        ))}
        {/* Padlock on the front face */}
        <group position={[0, 0, 0.25]}>
          <mesh>
            <boxGeometry args={[0.05, 0.06, 0.02]} />
            <meshStandardMaterial color="#c8a048" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <torusGeometry args={[0.018, 0.005, 6, 12, Math.PI]} />
            <meshStandardMaterial color="#c8a048" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* Warm glow emanating from the phone */}
      <pointLight
        position={[0, 0.2, 0]}
        color={PHONE_GLOW}
        intensity={1.5}
        distance={3}
        decay={2}
      />
    </group>
  )
}
