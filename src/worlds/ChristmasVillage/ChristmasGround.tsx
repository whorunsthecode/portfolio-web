import { useMemo } from 'react'

export function ChristmasGround() {
  // Pre-compute star positions so they don't change on re-render
  const stars = useMemo(() =>
    Array.from({ length: 40 }).map((_, i) => ({
      x: (Math.sin(i * 73.156) * 0.5 + 0.5 - 0.5) * 60,
      y: 5 + (Math.sin(i * 41.732) * 0.5 + 0.5) * 12,
      size: 0.04 + (Math.sin(i * 29.345) * 0.5 + 0.5) * 0.03,
    })),
  [])

  return (
    <group>
      {/* Snowy ground — meshBasicMaterial so warm lights don't tint it sandy */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[60, 60]} />
        <meshBasicMaterial color="#d8dce8" />
      </mesh>

      {/* Dark sky enclosure — blocks main scene sky bleed */}
      <mesh position={[0, 10, -25]}>
        <planeGeometry args={[80, 40]} />
        <meshBasicMaterial color="#0a1020" />
      </mesh>
      <mesh position={[-25, 10, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[60, 40]} />
        <meshBasicMaterial color="#0a1020" />
      </mesh>
      <mesh position={[25, 10, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[60, 40]} />
        <meshBasicMaterial color="#0a1020" />
      </mesh>
      <mesh position={[0, 10, 25]}>
        <planeGeometry args={[80, 40]} />
        <meshBasicMaterial color="#0a1020" side={2} />
      </mesh>

      {/* Stars — deterministic positions */}
      {stars.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, -29]}>
          <circleGeometry args={[s.size, 6]} />
          <meshBasicMaterial color="#f8f8f0" />
        </mesh>
      ))}
    </group>
  )
}
