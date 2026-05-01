import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

const TRAVERTINE = '#e0d4b8'
const TRAVERTINE_DARK = '#b8a888'
const GLASS_TINT = '#c8d4d8'
const PHONE_BLACK = '#1a1a18'
const PHONE_GLOW = '#ffc468'
const BRASS = '#c8a468'

export function CagedPhone() {
  const phoneGlowRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (phoneGlowRef.current) {
      const mat = phoneGlowRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = 0.7 + Math.sin(clock.elapsedTime * 1.5) * 0.15
    }
  })

  return (
    <group position={[0.5, 0, -2]}>
      {/* === PODIUM — travertine, stepped === */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.85, 0.12, 0.85]} />
        <meshStandardMaterial color={TRAVERTINE_DARK} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.75, 0.08, 0.75]} />
        <meshStandardMaterial color={TRAVERTINE} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[0.55, 1.25, 0.55]} />
        <meshStandardMaterial color={TRAVERTINE} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[0.6, 0.06, 0.6]} />
        <meshStandardMaterial color={TRAVERTINE_DARK} roughness={0.7} />
      </mesh>

      {/* === GLASS DISPLAY CASE === */}
      {([
        { pos: [0, 1.85, 0.27] as const, rot: [0, 0, 0] as const },
        { pos: [0, 1.85, -0.27] as const, rot: [0, 0, 0] as const },
        { pos: [0.27, 1.85, 0] as const, rot: [0, Math.PI / 2, 0] as const },
        { pos: [-0.27, 1.85, 0] as const, rot: [0, Math.PI / 2, 0] as const },
      ]).map((wall, i) => (
        <mesh key={`glass-${i}`} position={[wall.pos[0], wall.pos[1], wall.pos[2]]} rotation={[wall.rot[0], wall.rot[1], wall.rot[2]]}>
          <planeGeometry args={[0.54, 0.7]} />
          <meshPhysicalMaterial
            color={GLASS_TINT}
            transparent
            opacity={0.18}
            roughness={0.05}
            transmission={0.92}
            side={2}
          />
        </mesh>
      ))}

      {/* Top of case */}
      <mesh position={[0, 2.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.54, 0.54]} />
        <meshPhysicalMaterial
          color={GLASS_TINT}
          transparent
          opacity={0.18}
          roughness={0.05}
          transmission={0.92}
          side={2}
        />
      </mesh>

      {/* Brass corner posts */}
      {([
        [-0.27, 1.85, -0.27],
        [0.27, 1.85, -0.27],
        [-0.27, 1.85, 0.27],
        [0.27, 1.85, 0.27],
      ] as [number, number, number][]).map((p, i) => (
        <mesh key={`post-${i}`} position={p}>
          <cylinderGeometry args={[0.012, 0.012, 0.7, 6]} />
          <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Brass top frame */}
      {([
        { pos: [0, 2.2, 0.27] as const, size: [0.54, 0.012, 0.012] as const },
        { pos: [0, 2.2, -0.27] as const, size: [0.54, 0.012, 0.012] as const },
        { pos: [-0.27, 2.2, 0] as const, size: [0.012, 0.012, 0.54] as const },
        { pos: [0.27, 2.2, 0] as const, size: [0.012, 0.012, 0.54] as const },
      ]).map((r, i) => (
        <mesh key={`top-${i}`} position={[r.pos[0], r.pos[1], r.pos[2]]}>
          <boxGeometry args={[r.size[0], r.size[1], r.size[2]]} />
          <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* === PHONE — upright inside the case === */}
      <group position={[0, 1.85, 0]}>
        <mesh>
          <boxGeometry args={[0.24, 0.5, 0.03]} />
          <meshStandardMaterial color={PHONE_BLACK} roughness={0.4} metalness={0.4} />
        </mesh>
        <mesh ref={phoneGlowRef} position={[0, 0, 0.016]}>
          <planeGeometry args={[0.21, 0.45]} />
          <meshBasicMaterial color={PHONE_GLOW} transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, 0.2, 0.017]}>
          <planeGeometry args={[0.21, 0.025]} />
          <meshBasicMaterial color={PHONE_BLACK} />
        </mesh>
        <mesh position={[0, 0.08, 0.018]}>
          <planeGeometry args={[0.04, 0.05]} />
          <meshBasicMaterial color={PHONE_BLACK} />
        </mesh>
        <mesh position={[0, 0.115, 0.019]}>
          <torusGeometry args={[0.018, 0.005, 6, 12, Math.PI]} />
          <meshBasicMaterial color={PHONE_BLACK} />
        </mesh>
        <Text
          position={[0, -0.01, 0.018]}
          fontSize={0.045}
          color={PHONE_BLACK}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          BLOCKED
        </Text>
        <Text
          position={[0, -0.07, 0.018]}
          fontSize={0.022}
          color={PHONE_BLACK}
          anchorX="center"
          anchorY="middle"
        >
          stretch to unlock
        </Text>
        <mesh position={[0, -0.22, 0.016]}>
          <ringGeometry args={[0.012, 0.016, 16]} />
          <meshBasicMaterial color="#3a3a38" />
        </mesh>
      </group>

      {/* === PLAQUE === */}
      <group position={[0, 0.95, 0.28]}>
        <mesh>
          <boxGeometry args={[0.5, 0.22, 0.012]} />
          <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0, 0.007]}>
          <planeGeometry args={[0.46, 0.18]} />
          <meshStandardMaterial color="#f4ead4" roughness={0.8} />
        </mesh>
        <Text
          position={[0, 0.05, 0.012]}
          fontSize={0.04}
          color="#2a2418"
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          YOUR PHONE
        </Text>
        <Text
          position={[0, 0.005, 0.012]}
          fontSize={0.022}
          color="#5a4030"
          anchorX="center"
          anchorY="middle"
        >
          On loan from yourself, 2026
        </Text>
        <Text
          position={[0, -0.04, 0.012]}
          fontSize={0.018}
          color="#8a6a4a"
          anchorX="center"
          anchorY="middle"
        >
          Held until stretch session complete
        </Text>
      </group>

      {/* Warm glow */}
      <pointLight position={[0, 1.85, 0]} color={PHONE_GLOW} intensity={2} distance={3} decay={2} />
    </group>
  )
}
