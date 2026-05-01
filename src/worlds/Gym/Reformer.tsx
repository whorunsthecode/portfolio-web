const REFORMER_BLACK = '#2a2826'
const REFORMER_LEATHER = '#d4c4a8'
const REFORMER_WOOD = '#a88858'
const SPRING_SILVER = '#a8a8a8'
const BRASS = '#c8a468'

/**
 * Single reformer pilates machine — aligned parallel to the mirror wall.
 * Facing the mirror (right wall) so the user sees it from the side.
 */
export function Reformer() {
  return (
    <group position={[-0.5, 0, -4]} rotation={[0, Math.PI / 2, 0]}>
      {/* === MAIN FRAME — long rectangular base along Z axis === */}
      {/* Rails — two parallel tracks the carriage slides on */}
      <mesh position={[-0.28, 0.12, 0]}>
        <boxGeometry args={[0.05, 0.04, 2.6]} />
        <meshStandardMaterial color={REFORMER_BLACK} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0.28, 0.12, 0]}>
        <boxGeometry args={[0.05, 0.04, 2.6]} />
        <meshStandardMaterial color={REFORMER_BLACK} roughness={0.5} metalness={0.3} />
      </mesh>

      {/* Cross braces connecting the rails */}
      {[-1.1, 0, 1.1].map((z, i) => (
        <mesh key={`brace-${i}`} position={[0, 0.1, z]}>
          <boxGeometry args={[0.6, 0.03, 0.06]} />
          <meshStandardMaterial color={REFORMER_BLACK} roughness={0.5} metalness={0.3} />
        </mesh>
      ))}

      {/* 4 wooden feet */}
      {([
        [-0.28, 0.045, -1.2],
        [0.28, 0.045, -1.2],
        [-0.28, 0.045, 1.2],
        [0.28, 0.045, 1.2],
      ] as [number, number, number][]).map((p, i) => (
        <mesh key={`foot-${i}`} position={p}>
          <boxGeometry args={[0.07, 0.09, 0.07]} />
          <meshStandardMaterial color={REFORMER_WOOD} roughness={0.7} />
        </mesh>
      ))}

      {/* === SLIDING CARRIAGE — the upholstered platform === */}
      <mesh position={[0, 0.2, -0.1]}>
        <boxGeometry args={[0.58, 0.06, 1.1]} />
        <meshStandardMaterial color={REFORMER_BLACK} roughness={0.5} metalness={0.4} />
      </mesh>
      {/* Cream leather pad */}
      <mesh position={[0, 0.26, -0.1]}>
        <boxGeometry args={[0.54, 0.05, 1.06]} />
        <meshStandardMaterial color={REFORMER_LEATHER} roughness={0.85} />
      </mesh>
      {/* Center stitching */}
      <mesh position={[0, 0.29, -0.1]}>
        <boxGeometry args={[0.008, 0.003, 1.04]} />
        <meshStandardMaterial color="#a89878" />
      </mesh>

      {/* === SHOULDER BLOCKS === */}
      <mesh position={[-0.15, 0.38, -0.55]}>
        <boxGeometry args={[0.16, 0.16, 0.1]} />
        <meshStandardMaterial color={REFORMER_LEATHER} roughness={0.85} />
      </mesh>
      <mesh position={[0.15, 0.38, -0.55]}>
        <boxGeometry args={[0.16, 0.16, 0.1]} />
        <meshStandardMaterial color={REFORMER_LEATHER} roughness={0.85} />
      </mesh>

      {/* === HEADREST === */}
      <mesh position={[0, 0.34, -0.7]} rotation={[Math.PI / 8, 0, 0]}>
        <boxGeometry args={[0.36, 0.03, 0.12]} />
        <meshStandardMaterial color={REFORMER_LEATHER} roughness={0.85} />
      </mesh>

      {/* === FOOT BAR at the foot end (z+) === */}
      <mesh position={[-0.28, 0.4, 0.75]}>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
        <meshStandardMaterial color={SPRING_SILVER} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.28, 0.4, 0.75]}>
        <cylinderGeometry args={[0.015, 0.015, 0.5, 8]} />
        <meshStandardMaterial color={SPRING_SILVER} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Horizontal bar */}
      <mesh position={[0, 0.6, 0.75]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.018, 0.018, 0.6, 12]} />
        <meshStandardMaterial color={SPRING_SILVER} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* === SPRINGS — connecting carriage to foot-end frame === */}
      {/* Springs run from z=0.45 (carriage edge) to z=0.75 (foot bar base) */}
      {[
        { x: -0.15, color: '#d8c068' },
        { x: -0.05, color: '#d04a4a' },
        { x: 0.05, color: '#3a8848' },
        { x: 0.15, color: '#3a6898' },
      ].map((s, i) => (
        <group key={`spring-${i}`}>
          {/* Coil spring visual */}
          <mesh position={[s.x, 0.18, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.018, 0.018, 0.25, 8]} />
            <meshStandardMaterial color={s.color} metalness={0.4} roughness={0.5} />
          </mesh>
          {/* Hook at carriage end */}
          <mesh position={[s.x, 0.18, 0.47]}>
            <sphereGeometry args={[0.008, 6, 6]} />
            <meshStandardMaterial color={s.color} metalness={0.5} />
          </mesh>
          {/* Hook at frame end */}
          <mesh position={[s.x, 0.18, 0.73]}>
            <sphereGeometry args={[0.008, 6, 6]} />
            <meshStandardMaterial color={s.color} metalness={0.5} />
          </mesh>
        </group>
      ))}

      {/* === ROPES/STRAPS at head end === */}
      {/* Pulley posts */}
      <mesh position={[-0.28, 0.55, -1.15]}>
        <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
        <meshStandardMaterial color={SPRING_SILVER} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.28, 0.55, -1.15]}>
        <cylinderGeometry args={[0.015, 0.015, 0.8, 8]} />
        <meshStandardMaterial color={SPRING_SILVER} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Brass finials */}
      <mesh position={[-0.28, 0.96, -1.15]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0.28, 0.96, -1.15]}>
        <sphereGeometry args={[0.02, 8, 8]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Leather strap loops */}
      <mesh position={[-0.22, 0.3, -1.1]}>
        <torusGeometry args={[0.05, 0.01, 6, 12]} />
        <meshStandardMaterial color="#5a4030" roughness={0.85} />
      </mesh>
      <mesh position={[0.22, 0.3, -1.1]}>
        <torusGeometry args={[0.05, 0.01, 6, 12]} />
        <meshStandardMaterial color="#5a4030" roughness={0.85} />
      </mesh>
    </group>
  )
}
