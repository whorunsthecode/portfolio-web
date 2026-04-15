const WALL_PURPLE = '#5A4A7A'
const FLOOR_LIGHT = '#E8DEFF'
const BED_LINEN = '#F5F0FF'
const BED_BLANKET = '#A78BCA'
const NIGHTSTAND = '#5A4A7A'
const WINDOW_NIGHT = '#1A1438'
const STAR_GLOW = '#F5F0FF'
const ACCENT_GOLD = '#E0C880'

export function Bedroom() {
  return (
    <group>
      {/* Floor — light purple */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color={FLOOR_LIGHT} roughness={0.85} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2, -3]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={WALL_PURPLE} roughness={0.85} side={2} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-4, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color={WALL_PURPLE} roughness={0.85} side={2} />
      </mesh>

      {/* Right wall */}
      <mesh position={[4, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial color={WALL_PURPLE} roughness={0.85} side={2} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#6A5A8A" roughness={0.85} />
      </mesh>

      {/* === WINDOW — ornate, with night sky, stars, crescent moon === */}
      <mesh position={[1.5, 2.3, -2.95]}>
        <boxGeometry args={[1.6, 1.8, 0.08]} />
        <meshStandardMaterial color="#3A2A5A" roughness={0.6} />
      </mesh>
      {/* Window pane */}
      <mesh position={[1.5, 2.3, -2.91]}>
        <planeGeometry args={[1.5, 1.7]} />
        <meshBasicMaterial color={WINDOW_NIGHT} />
      </mesh>
      {/* Vertical mullions */}
      <mesh position={[1.0, 2.3, -2.9]}>
        <boxGeometry args={[0.04, 1.7, 0.01]} />
        <meshStandardMaterial color="#3A2A5A" />
      </mesh>
      <mesh position={[2.0, 2.3, -2.9]}>
        <boxGeometry args={[0.04, 1.7, 0.01]} />
        <meshStandardMaterial color="#3A2A5A" />
      </mesh>
      {/* Horizontal mullion */}
      <mesh position={[1.5, 2.3, -2.9]}>
        <boxGeometry args={[1.5, 0.04, 0.01]} />
        <meshStandardMaterial color="#3A2A5A" />
      </mesh>

      {/* Stars — varied sizes */}
      {Array.from({ length: 15 }).map((_, i) => {
        const x = 1.0 + Math.sin(i * 2.7) * 0.5 + 0.5
        const y = 1.55 + Math.sin(i * 1.3) * 0.75 + 0.75
        const r = 0.015 + Math.sin(i * 3.1) * 0.012 + 0.012
        return (
          <mesh key={i} position={[x, y, -2.89]}>
            <circleGeometry args={[r, 6]} />
            <meshBasicMaterial color={STAR_GLOW} />
          </mesh>
        )
      })}

      {/* Crescent moon */}
      <mesh position={[1.85, 2.7, -2.89]}>
        <circleGeometry args={[0.14, 16]} />
        <meshBasicMaterial color={STAR_GLOW} />
      </mesh>
      {/* Crescent shadow */}
      <mesh position={[1.92, 2.72, -2.88]}>
        <circleGeometry args={[0.13, 16]} />
        <meshBasicMaterial color={WINDOW_NIGHT} />
      </mesh>

      {/* Small cloud visible through window */}
      <group position={[1.2, 2.1, -2.88]}>
        <mesh position={[-0.05, 0, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial color="#A78BCA" />
        </mesh>
        <mesh position={[0.05, 0, 0]}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="#A78BCA" />
        </mesh>
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshBasicMaterial color="#A78BCA" />
        </mesh>
      </group>

      {/* === BED === */}
      {/* Mattress base */}
      <mesh position={[-1.2, 0.4, -0.5]}>
        <boxGeometry args={[2.0, 0.3, 2.5]} />
        <meshStandardMaterial color="#7A6A9A" roughness={0.85} />
      </mesh>
      {/* Mattress top — light purple sheets */}
      <mesh position={[-1.2, 0.6, -0.5]}>
        <boxGeometry args={[2.0, 0.15, 2.5]} />
        <meshStandardMaterial color={BED_LINEN} roughness={0.85} />
      </mesh>
      {/* Blanket — primary purple */}
      <mesh position={[-1.2, 0.71, 0.2]}>
        <boxGeometry args={[2.0, 0.04, 1.4]} />
        <meshStandardMaterial color={BED_BLANKET} roughness={0.85} />
      </mesh>
      {/* Pillow */}
      <mesh position={[-1.2, 0.78, -1.4]}>
        <boxGeometry args={[1.6, 0.15, 0.5]} />
        <meshStandardMaterial color={BED_LINEN} roughness={0.85} />
      </mesh>
      {/* Headboard — deep purple */}
      <mesh position={[-1.2, 1.2, -1.85]}>
        <boxGeometry args={[2.0, 1.0, 0.1]} />
        <meshStandardMaterial color={NIGHTSTAND} roughness={0.8} />
      </mesh>

      {/* === NIGHTSTAND === */}
      <mesh position={[0.6, 0.4, -1.4]}>
        <boxGeometry args={[0.8, 0.8, 0.6]} />
        <meshStandardMaterial color={NIGHTSTAND} roughness={0.8} />
      </mesh>
      <mesh position={[0.6, 0.4, -1.08]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, 0.04, 12]} />
        <meshStandardMaterial color={ACCENT_GOLD} metalness={0.6} />
      </mesh>

      {/* === LAMP === */}
      <mesh position={[0.6, 0.85, -1.4]}>
        <cylinderGeometry args={[0.06, 0.08, 0.1, 12]} />
        <meshStandardMaterial color={ACCENT_GOLD} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[0.6, 1.0, -1.4]}>
        <cylinderGeometry args={[0.015, 0.015, 0.2, 8]} />
        <meshStandardMaterial color="#B0A060" metalness={0.5} />
      </mesh>
      <mesh position={[0.6, 1.18, -1.4]}>
        <coneGeometry args={[0.15, 0.2, 12, 1, true]} />
        <meshStandardMaterial color={BED_LINEN} roughness={0.6} side={2} />
      </mesh>
      <pointLight position={[0.6, 1.15, -1.4]} color="#FFE0A8" intensity={2.5} distance={6} decay={2} />

      {/* === JOURNAL ON BED === */}
      <mesh position={[-0.7, 0.74, -0.7]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.35, 0.04, 0.45]} />
        <meshStandardMaterial color="#5A4A7A" roughness={0.85} />
      </mesh>
      <mesh position={[-0.7, 0.77, -0.7]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.32, 0.02, 0.42]} />
        <meshStandardMaterial color={BED_LINEN} roughness={0.85} />
      </mesh>
      <mesh position={[-0.55, 0.79, -0.65]} rotation={[0, 0.5, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.18, 8]} />
        <meshStandardMaterial color="#1a1010" />
      </mesh>

      {/* === RUG === */}
      <mesh position={[-0.5, 0.005, 0.8]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <planeGeometry args={[3, 2]} />
        <meshStandardMaterial color="#A78BCA" roughness={0.95} />
      </mesh>
      <mesh position={[-0.5, 0.008, 0.8]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <ringGeometry args={[0.95, 1.0, 4]} />
        <meshStandardMaterial color="#8A6AAA" />
      </mesh>
    </group>
  )
}
