import { Text } from '@react-three/drei'

const RED = '#c82820'
const BLACK = '#1a1a18'

/* ── Squat rack ── */
function SquatRack() {
  const posts: [number, number, number][] = [
    [-0.6, 1.35, -0.3],
    [0.6, 1.35, -0.3],
    [-0.6, 1.35, 0.3],
    [0.6, 1.35, 0.3],
  ]

  return (
    <group position={[-2.5, 0, -3.5]} rotation={[0, Math.PI / 8, 0]}>
      {posts.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.08, 2.7, 0.08]} />
          <meshStandardMaterial color={RED} roughness={0.6} />
        </mesh>
      ))}
      {/* Top cross bars */}
      <mesh position={[0, 2.7, -0.3]}>
        <boxGeometry args={[1.2, 0.08, 0.08]} />
        <meshStandardMaterial color={RED} roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.7, 0.3]}>
        <boxGeometry args={[1.2, 0.08, 0.08]} />
        <meshStandardMaterial color={RED} roughness={0.6} />
      </mesh>
      {/* Barbell */}
      <mesh position={[0, 1.6, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.04, 0.04, 1.5, 12]} />
        <meshStandardMaterial color={BLACK} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Weight plates */}
      {[-0.6, 0.6].map((x, i) => (
        <mesh key={i} position={[x, 1.6, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.22, 0.22, 0.05, 24]} />
          <meshStandardMaterial color={BLACK} roughness={0.7} />
        </mesh>
      ))}
      {/* Safety collars */}
      {[-0.5, 0.5].map((x, i) => (
        <mesh key={i} position={[x, 1.6, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.06, 0.06, 0.04, 12]} />
          <meshStandardMaterial color={RED} />
        </mesh>
      ))}
    </group>
  )
}

/* ── Dumbbell rack with 3 pairs ── */
function DumbbellRack() {
  return (
    <group position={[2.5, 0, -3.5]} rotation={[0, -Math.PI / 8, 0]}>
      {/* Rack frame */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.4, 0.6, 0.4]} />
        <meshStandardMaterial color={BLACK} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[1.4, 0.08, 0.5]} />
        <meshStandardMaterial color={BLACK} />
      </mesh>
      {[-0.5, 0, 0.5].map((x, i) => {
        const size = 0.06 + i * 0.02
        return (
          <group key={i} position={[x, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.025, 0.025, 0.35, 10]} />
              <meshStandardMaterial color={BLACK} metalness={0.6} />
            </mesh>
            {[-0.16, 0.16].map((y, j) => (
              <mesh key={j} position={[0, y, 0]}>
                <cylinderGeometry args={[size, size, 0.08, 16]} />
                <meshStandardMaterial color={RED} />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}

/* ── Kettlebells lined on the floor ── */
function Kettlebells() {
  const kbs: { x: number; size: number; color: string }[] = [
    { x: 0, size: 0.2, color: RED },
    { x: 0.5, size: 0.22, color: BLACK },
    { x: 1.0, size: 0.18, color: RED },
  ]

  return (
    <group position={[-2.8, 0, 2.5]}>
      {kbs.map((kb, i) => (
        <group key={i} position={[kb.x, 0, 0]}>
          <mesh position={[0, kb.size, 0]}>
            <sphereGeometry args={[kb.size, 12, 12]} />
            <meshStandardMaterial color={kb.color} roughness={0.7} />
          </mesh>
          <mesh position={[0, kb.size * 2 + 0.03, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[kb.size * 0.5, 0.02, 6, 16, Math.PI]} />
            <meshStandardMaterial color={BLACK} metalness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ── Foam rollers on a shelf ── */
function FoamRollers() {
  return (
    <group position={[2.8, 0.8, 2]}>
      <mesh>
        <boxGeometry args={[1.4, 0.05, 0.4]} />
        <meshStandardMaterial color={BLACK} />
      </mesh>
      {[-0.45, 0, 0.45].map((x, i) => (
        <mesh key={i} position={[x, 0.08, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.07, 0.07, 0.4, 16]} />
          <meshStandardMaterial color={i === 1 ? RED : BLACK} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/* ── Resistance bands hanging from a wall hook ── */
function ResistanceBands() {
  const bands: { dx: number; len: number; color: string }[] = [
    { dx: 0, len: 0.7, color: RED },
    { dx: 0.1, len: 0.8, color: BLACK },
    { dx: -0.08, len: 0.6, color: RED },
  ]

  return (
    <group position={[-3.4, 2.5, 1]}>
      <mesh>
        <cylinderGeometry args={[0.015, 0.015, 0.1, 8]} />
        <meshStandardMaterial color={BLACK} metalness={0.6} />
      </mesh>
      {bands.map((b, i) => (
        <mesh key={i} position={[b.dx, -b.len / 2 - 0.05, 0]}>
          <torusGeometry args={[0.1, 0.015, 6, 12]} />
          <meshStandardMaterial color={b.color} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/* ── Motivational poster: STRETCH OR ELSE ── */
function MotivationalPoster() {
  return (
    <group position={[0, 2.5, -4.95]}>
      {/* Poster backing */}
      <mesh>
        <planeGeometry args={[1.6, 1.0]} />
        <meshStandardMaterial color="#f0f0e8" roughness={0.8} />
      </mesh>
      {/* Black border band */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[1.55, 0.95]} />
        <meshStandardMaterial color={BLACK} />
      </mesh>
      {/* Inner white */}
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[1.5, 0.9]} />
        <meshStandardMaterial color="#f4f4ec" />
      </mesh>
      {/* Red stripe */}
      <mesh position={[0, -0.2, 0.003]}>
        <planeGeometry args={[1.5, 0.15]} />
        <meshStandardMaterial color={RED} />
      </mesh>
      {/* Bold "STRETCH" — upper half */}
      <Text
        position={[0, 0.15, 0.004]}
        fontSize={0.22}
        color="#1a1a18"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
      >
        STRETCH
      </Text>
      {/* "OR ELSE" — on the red stripe */}
      <Text
        position={[0, -0.2, 0.005]}
        fontSize={0.1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.15}
      >
        OR ELSE
      </Text>
    </group>
  )
}

export function GymEquipment() {
  return (
    <>
      <SquatRack />
      <DumbbellRack />
      <Kettlebells />
      <FoamRollers />
      <ResistanceBands />
      <MotivationalPoster />
    </>
  )
}
