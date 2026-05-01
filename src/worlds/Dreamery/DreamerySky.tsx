import { useMemo } from 'react'
import { BackSide } from 'three'

export function DreamerySky() {
  // Deterministic star field — seeded by trig so positions don't change on re-render
  const stars = useMemo(
    () =>
      Array.from({ length: 80 }).map((_, i) => {
        const angle = (Math.sin(i * 12.9898) * 43758.5453) % (Math.PI * 2)
        const height = (Math.sin(i * 78.233) * 0.5) * 30 - 5
        const r = 35 + ((Math.sin(i * 37.719) * 0.5 + 0.5) * 4)
        const size = 0.08 + (Math.sin(i * 91.123) * 0.5 + 0.5) * 0.08
        return {
          x: Math.cos(angle) * r,
          y: height,
          z: Math.sin(angle) * r,
          size,
        }
      }),
    [],
  )

  return (
    <group>
      {/* Large sphere around the scene acts as the sky backdrop */}
      <mesh scale={[100, 100, 100]}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#3a2a5a" side={BackSide} />
      </mesh>

      {/* Gradient overlay — horizontal bands fake a vertical gradient */}
      {[
        { y: 25, color: '#1a1848' }, // top: deep indigo
        { y: 10, color: '#4a3a6a' },
        { y: 0, color: '#6a4874' }, // middle: lavender
        { y: -10, color: '#8a5878' },
        { y: -22, color: '#b86a78' }, // bottom: soft pink
      ].map((band, i) => (
        <mesh key={i} position={[0, band.y, -40]}>
          <planeGeometry args={[120, 15]} />
          <meshBasicMaterial color={band.color} />
        </mesh>
      ))}

      {/* Scattered starfield */}
      {stars.map((s, i) => (
        <mesh key={`star-${i}`} position={[s.x, s.y, s.z]}>
          <sphereGeometry args={[s.size, 6, 6]} />
          <meshBasicMaterial color="#fff0d4" />
        </mesh>
      ))}

      {/* A few brighter "wishing stars" with subtle glow */}
      {(
        [
          [-8, 5, -15],
          [6, 8, -12],
          [-3, -4, -18],
        ] as [number, number, number][]
      ).map((pos, i) => (
        <group key={`bright-${i}`} position={pos}>
          <mesh>
            <sphereGeometry args={[0.15, 8, 8]} />
            <meshBasicMaterial color="#fff4c8" />
          </mesh>
          <pointLight color="#fff4c8" intensity={0.5} distance={6} decay={2} />
        </group>
      ))}
    </group>
  )
}
