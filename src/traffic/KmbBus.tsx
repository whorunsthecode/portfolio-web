import { Text } from '@react-three/drei'
import { InfoTag } from '../scene/components/InfoTag'

const KMB_RED = '#c62828'
const KMB_CREAM = '#f4e4c8'
const DARK_GLASS = '#1a2028'
const DARK = '#1a1614'
const CHROME = '#b0b0b0'
const HEADLIGHT = '#f4ead4'
const ROUTE_AMBER = '#f4c430'

const DESTINATIONS = [
  { route: '1', zh: '尖沙咀', en: 'TSIM SHA TSUI' },
  { route: '2', zh: '旺角', en: 'MONG KOK' },
  { route: '12', zh: '中環', en: 'CENTRAL' },
  { route: '40', zh: '紅磡', en: 'HUNG HOM' },
]

/**
 * 1980s KMB Leyland Victory Mk II — front-engine double-decker.
 * The distinctive protruding bonnet is the defining 80s silhouette,
 * contrasting with modern flat-fronted buses.
 */
export function KmbBus({ variantSeed = 0 }: { variantSeed?: number }) {
  const dest = DESTINATIONS[variantSeed % DESTINATIONS.length]

  return (
    <group>
      {/* === LOWER DECK — red body === */}
      <mesh position={[0, 1.35, 0]}>
        <boxGeometry args={[10, 2.5, 2.5]} />
        <meshStandardMaterial color={KMB_RED} roughness={0.6} />
      </mesh>

      {/* Lower deck windows — both sides */}
      {[-1, 1].map((sideZ) =>
        Array.from({ length: 7 }, (_, i) => (
          <mesh
            key={`lw-${sideZ}-${i}`}
            position={[-3.5 + i * 1.0, 1.6, sideZ * 1.26]}
          >
            <planeGeometry args={[0.75, 0.7]} />
            <meshStandardMaterial color={DARK_GLASS} />
          </mesh>
        )),
      )}

      {/* === UPPER DECK — cream with red lower band === */}
      <mesh position={[0.25, 3.7, 0]}>
        <boxGeometry args={[9.5, 2.2, 2.5]} />
        <meshStandardMaterial color={KMB_CREAM} roughness={0.7} />
      </mesh>
      {/* Red horizontal band where cream meets red (thin stripe) */}
      <mesh position={[0.25, 2.65, 0]}>
        <boxGeometry args={[9.51, 0.15, 2.52]} />
        <meshStandardMaterial color={KMB_RED} roughness={0.6} />
      </mesh>

      {/* Upper deck windows — two rows per side (top + bottom strip) */}
      {[-1, 1].map((sideZ) =>
        Array.from({ length: 7 }, (_, i) => (
          <mesh
            key={`uw-${sideZ}-${i}`}
            position={[-3.3 + i * 1.0, 3.95, sideZ * 1.26]}
          >
            <planeGeometry args={[0.75, 0.85]} />
            <meshStandardMaterial color={DARK_GLASS} />
          </mesh>
        )),
      )}

      {/* === FRONT BONNET — the critical Victory Mk II silhouette === */}
      <mesh position={[5.75, 1.15, 0]}>
        <boxGeometry args={[1.5, 1.8, 2.5]} />
        <meshStandardMaterial color={KMB_RED} roughness={0.6} />
      </mesh>
      {/* Bonnet top (slightly sloped impression via thin cream strip) */}
      <mesh position={[5.75, 2.08, 0]}>
        <boxGeometry args={[1.5, 0.05, 2.5]} />
        <meshStandardMaterial color={DARK} roughness={0.8} />
      </mesh>

      {/* === HEADLIGHTS — rectangular, flanking grille === */}
      <mesh position={[6.52, 1.05, 0.85]}>
        <boxGeometry args={[0.05, 0.3, 0.4]} />
        <meshBasicMaterial color={HEADLIGHT} />
      </mesh>
      <mesh position={[6.52, 1.05, -0.85]}>
        <boxGeometry args={[0.05, 0.3, 0.4]} />
        <meshBasicMaterial color={HEADLIGHT} />
      </mesh>

      {/* Grille — dark vertical slats */}
      <mesh position={[6.52, 1.35, 0]}>
        <boxGeometry args={[0.04, 0.6, 1.2]} />
        <meshStandardMaterial color={DARK} roughness={0.7} />
      </mesh>
      {/* Chrome bumper */}
      <mesh position={[6.52, 0.55, 0]}>
        <boxGeometry args={[0.06, 0.18, 2.3]} />
        <meshStandardMaterial color={CHROME} metalness={0.6} roughness={0.3} />
      </mesh>

      {/* === FRONT DESTINATION BLIND — above cab === */}
      <mesh position={[5.76, 2.6, 0]}>
        <planeGeometry args={[1.4, 0.5]} />
        <meshStandardMaterial color={KMB_CREAM} roughness={0.7} />
      </mesh>
      <Text
        position={[5.77, 2.72, 0]}
        fontSize={0.35}
        color={ROUTE_AMBER}
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI / 2, 0]}
      >
        {dest.route}
      </Text>
      <Text
        position={[5.77, 2.48, 0]}
        fontSize={0.13}
        color={KMB_RED}
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI / 2, 0]}
      >
        {`${dest.zh} ${dest.en}`}
      </Text>

      {/* Upper deck front destination (smaller) */}
      <mesh position={[5.01, 4.2, 0]}>
        <planeGeometry args={[1.6, 0.6]} />
        <meshStandardMaterial color={KMB_CREAM} roughness={0.7} />
      </mesh>
      <Text
        position={[5.02, 4.35, 0]}
        fontSize={0.32}
        color={ROUTE_AMBER}
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI / 2, 0]}
      >
        {dest.route}
      </Text>
      <Text
        position={[5.02, 4.05, 0]}
        fontSize={0.16}
        color={KMB_RED}
        anchorX="center"
        anchorY="middle"
        rotation={[0, Math.PI / 2, 0]}
      >
        {dest.en}
      </Text>

      {/* === "KMB 九龍巴士" WORDMARK ON SIDES === */}
      {[1, -1].map((sideZ) => (
        <Text
          key={`kmb-${sideZ}`}
          position={[0, 0.55, sideZ * 1.27]}
          fontSize={0.45}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          rotation={[0, sideZ > 0 ? 0 : Math.PI, 0]}
        >
          KMB  九龍巴士
        </Text>
      ))}

      {/* === WHEELS — 4 dark cylinders (2-axle Victory) === */}
      {[
        [4.5, 0.5, 1.25],
        [4.5, 0.5, -1.25],
        [-3.8, 0.5, 1.25],
        [-3.8, 0.5, -1.25],
      ].map((p, i) => (
        <mesh
          key={i}
          position={p as [number, number, number]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.5, 0.5, 0.3, 14]} />
          <meshStandardMaterial color={DARK} roughness={0.85} />
        </mesh>
      ))}

      {/* Rear tail lights */}
      <mesh position={[-5.01, 1.2, 0.9]}>
        <boxGeometry args={[0.05, 0.2, 0.25]} />
        <meshBasicMaterial color="#ff2020" />
      </mesh>
      <mesh position={[-5.01, 1.2, -0.9]}>
        <boxGeometry args={[0.05, 0.2, 0.25]} />
        <meshBasicMaterial color="#ff2020" />
      </mesh>

      <InfoTag label="KMB Leyland · '80s double-decker" offset={[0, 5.8, 0]} />
    </group>
  )
}
