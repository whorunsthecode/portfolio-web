const REED = '#3a7040'
const REED_DARK = '#2a5030'
const LILY_PAD = '#2a5030'
const LILY_FLOWER = '#f498b0'
const CATTAIL_BROWN = '#7a4828'

function Reed({
  position,
  count = 4,
  seed = 0,
}: {
  position: [number, number, number]
  count?: number
  seed?: number
}) {
  return (
    <group position={position}>
      {Array.from({ length: count }).map((_, i) => {
        // Deterministic jitter based on seed + index
        const jRand = Math.sin((seed + i) * 91.732) * 0.5
        const hRand = Math.sin((seed + i) * 37.415) * 0.5 + 0.5
        const xJitter = (i - count / 2) * 0.06 + jRand * 0.03
        const height = 0.35 + hRand * 0.3
        return (
          <mesh key={i} position={[xJitter, height / 2, 0]}>
            <boxGeometry args={[0.04, height, 0.04]} />
            <meshBasicMaterial color={i % 2 === 0 ? REED : REED_DARK} />
          </mesh>
        )
      })}
    </group>
  )
}

function Cattail({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Stalk */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.04, 1.0, 0.04]} />
        <meshBasicMaterial color={REED_DARK} />
      </mesh>
      {/* Fuzzy brown head */}
      <mesh position={[0, 0.8, 0.001]}>
        <boxGeometry args={[0.08, 0.24, 0.08]} />
        <meshBasicMaterial color={CATTAIL_BROWN} />
      </mesh>
      {/* Top spike */}
      <mesh position={[0, 1.0, 0]}>
        <boxGeometry args={[0.02, 0.06, 0.02]} />
        <meshBasicMaterial color={REED} />
      </mesh>
    </group>
  )
}

function LilyPad({
  position,
  hasFlower = false,
}: {
  position: [number, number, number]
  hasFlower?: boolean
}) {
  return (
    <group position={position}>
      {/* Flat pad */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 8]} />
        <meshBasicMaterial color={LILY_PAD} />
      </mesh>
      {/* Darker edge ring */}
      <mesh position={[0, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.18, 0.2, 8]} />
        <meshBasicMaterial color="#1a3820" />
      </mesh>
      {/* V-notch */}
      <mesh position={[0.1, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.1, 0.06]} />
        <meshBasicMaterial color="#2a4868" />
      </mesh>

      {hasFlower && (
        <>
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[0.08, 0.04, 0.08]} />
            <meshBasicMaterial color="#f498b0" />
          </mesh>
          {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
            <mesh
              key={i}
              position={[Math.cos(angle) * 0.05, 0.06, Math.sin(angle) * 0.05]}
              rotation={[0, angle, 0.3]}
            >
              <boxGeometry args={[0.06, 0.02, 0.03]} />
              <meshBasicMaterial color={LILY_FLOWER} />
            </mesh>
          ))}
          <mesh position={[0, 0.08, 0]}>
            <boxGeometry args={[0.03, 0.02, 0.03]} />
            <meshBasicMaterial color="#ffd460" />
          </mesh>
        </>
      )}
    </group>
  )
}

export function PondVegetation() {
  return (
    <group>
      {/* Reed clusters on both banks */}
      <Reed position={[-3.5, 0, -0.5]} count={5} seed={1} />
      <Reed position={[-2.8, 0, -0.6]} count={3} seed={2} />
      <Reed position={[3.2, 0, -0.5]} count={4} seed={3} />
      <Reed position={[3.8, 0, -0.6]} count={3} seed={4} />

      {/* Cattails */}
      <Cattail position={[-3.2, 0, -0.3]} />
      <Cattail position={[3.5, 0, -0.4]} />

      {/* Lily pads on the surface */}
      <LilyPad position={[-2, 0, -0.8]} hasFlower />
      <LilyPad position={[-1.2, 0, -1.4]} />
      <LilyPad position={[1.5, 0, -1.2]} hasFlower />
      <LilyPad position={[2.3, 0, -0.9]} />
      <LilyPad position={[0.3, 0, -1.6]} />
    </group>
  )
}
