import { Text } from '@react-three/drei'
import { InfoTag } from '../scene/components/InfoTag'

const TAXI_RED = '#c8272e'
const SILVER_ROOF = '#b8b8b8'
const HEADLIGHT = '#f4ead4'
const DARK = '#1a1a18'
const GRILLE_GREEN = '#2a6a3c'
const TAXI_SIGN_YELLOW = '#f4c430'

/**
 * 1980s Nissan Cedric Y31 taxi — the defining HK taxi silhouette.
 * Boxy three-box sedan, red body, silver roof, green grille plate.
 */
export function RedTaxi() {
  return (
    <group>
      {/* === LOWER BODY — red === */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4.5, 0.8, 1.7]} />
        <meshStandardMaterial color={TAXI_RED} roughness={0.6} />
      </mesh>

      {/* === UPPER CABIN — red lower + silver roof === */}
      {/* Cabin red portion */}
      <mesh position={[0, 1.1, 0]}>
        <boxGeometry args={[2.8, 0.45, 1.6]} />
        <meshStandardMaterial color={TAXI_RED} roughness={0.6} />
      </mesh>
      {/* Silver roof */}
      <mesh position={[0, 1.4, 0]}>
        <boxGeometry args={[2.8, 0.2, 1.6]} />
        <meshStandardMaterial color={SILVER_ROOF} roughness={0.5} metalness={0.2} />
      </mesh>

      {/* === CABIN WINDOWS — dark glass === */}
      {/* Front windshield */}
      <mesh position={[1.35, 1.2, 0]} rotation={[0, 0.15, 0]}>
        <planeGeometry args={[0.3, 0.5]} />
        <meshStandardMaterial color="#2a3848" transparent opacity={0.7} />
      </mesh>
      {/* Rear window */}
      <mesh position={[-1.35, 1.2, 0]} rotation={[0, -0.15, 0]}>
        <planeGeometry args={[0.3, 0.5]} />
        <meshStandardMaterial color="#2a3848" transparent opacity={0.7} />
      </mesh>
      {/* Side windows */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[0, 1.2, 0.81 * side]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.6, 0.5]} />
          <meshStandardMaterial color="#2a3848" transparent opacity={0.6} side={2} />
        </mesh>
      ))}

      {/* === HEADLIGHTS — rectangular === */}
      <mesh position={[2.26, 0.5, 0.55]}>
        <boxGeometry args={[0.05, 0.15, 0.3]} />
        <meshBasicMaterial color={HEADLIGHT} />
      </mesh>
      <mesh position={[2.26, 0.5, -0.55]}>
        <boxGeometry args={[0.05, 0.15, 0.3]} />
        <meshBasicMaterial color={HEADLIGHT} />
      </mesh>

      {/* === TAIL LIGHTS — red rectangles === */}
      <mesh position={[-2.26, 0.5, 0.55]}>
        <boxGeometry args={[0.05, 0.15, 0.3]} />
        <meshBasicMaterial color="#ff2020" />
      </mesh>
      <mesh position={[-2.26, 0.5, -0.55]}>
        <boxGeometry args={[0.05, 0.15, 0.3]} />
        <meshBasicMaterial color="#ff2020" />
      </mesh>

      {/* === GRILLE — dark with green plate === */}
      <mesh position={[2.26, 0.5, 0]}>
        <boxGeometry args={[0.05, 0.4, 1.0]} />
        <meshStandardMaterial color={DARK} roughness={0.7} />
      </mesh>
      {/* Green semi-circular plate */}
      <mesh position={[2.28, 0.45, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.12, 16, 0, Math.PI]} />
        <meshStandardMaterial color={GRILLE_GREEN} />
      </mesh>

      {/* === BUMPERS — chrome === */}
      <mesh position={[2.3, 0.2, 0]}>
        <boxGeometry args={[0.08, 0.1, 1.6]} />
        <meshStandardMaterial color="#a8a8a8" metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-2.3, 0.2, 0]}>
        <boxGeometry args={[0.08, 0.1, 1.6]} />
        <meshStandardMaterial color="#a8a8a8" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* === ROOF TAXI SIGN === */}
      <mesh position={[0, 1.58, 0]}>
        <boxGeometry args={[0.5, 0.15, 0.15]} />
        <meshStandardMaterial color={TAXI_SIGN_YELLOW} roughness={0.6} />
      </mesh>
      <Text
        position={[0, 1.58, 0.08]}
        fontSize={0.06}
        color={TAXI_RED}
        anchorX="center"
        anchorY="middle"
      >
        的士 TAXI
      </Text>

      {/* === DOOR TEXT — "TAXI" on each side === */}
      <Text
        position={[0.3, 0.5, 0.86]}
        fontSize={0.1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        TAXI
      </Text>
      <Text
        position={[0.3, 0.5, -0.86]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.1}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        TAXI
      </Text>

      {/* === WHEELS — 4 dark cylinders === */}
      {[
        [1.4, 0.15, 0.85],
        [1.4, 0.15, -0.85],
        [-1.4, 0.15, 0.85],
        [-1.4, 0.15, -0.85],
      ].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.18, 12]} />
          <meshStandardMaterial color={DARK} roughness={0.8} />
        </mesh>
      ))}

      <InfoTag label="Red taxi · Nissan Cedric Y31" offset={[0, 2.6, 0]} />
    </group>
  )
}
