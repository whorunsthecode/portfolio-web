import { useCityFacadeMaterial, CityFacadeMaterial } from '../CityFacade'
import { useStore } from '../../store'

/**
 * HSBC Main Building — three stacked boxes with setbacks.
 * Signature X-bracing across tier sections. Twin antenna masts.
 * At night, bracing glows cool white for bloom.
 */
export function HSBC() {
  const mode = useStore((s) => s.mode)

  // Bottom tier — widest
  const bottomProps = useCityFacadeMaterial({
    baseColor: [0.55, 0.58, 0.62],  // steel grey
    windowDensityX: 8,
    windowDensityY: 12,
    bandSpacing: 0.04,
    bracingType: 1,     // X per tier
    bracingColor: [0.85, 0.88, 0.92],
    bracingWidth: 0.05,
    tiers: 4,
    windowTint: [0.4, 0.45, 0.55],
    seed: 301,
    nightLitFraction: 0.6,
    roughness: 0.5,
    metalness: 0.3,
  })

  // Middle setback
  const middleProps = useCityFacadeMaterial({
    baseColor: [0.58, 0.60, 0.65],
    windowDensityX: 7,
    windowDensityY: 5,
    bandSpacing: 0.04,
    bracingType: 1,
    bracingColor: [0.85, 0.88, 0.92],
    bracingWidth: 0.04,
    tiers: 2,
    windowTint: [0.4, 0.45, 0.55],
    seed: 302,
    nightLitFraction: 0.55,
    roughness: 0.5,
    metalness: 0.3,
  })

  // Top tower
  const topProps = useCityFacadeMaterial({
    baseColor: [0.60, 0.62, 0.67],
    windowDensityX: 6,
    windowDensityY: 4,
    bandSpacing: 0.04,
    bracingType: 1,
    bracingColor: [0.85, 0.88, 0.92],
    bracingWidth: 0.05,
    tiers: 2,
    windowTint: [0.4, 0.45, 0.55],
    seed: 303,
    nightLitFraction: 0.5,
    roughness: 0.5,
    metalness: 0.3,
  })

  return (
    <group>
      {/* Bottom tier: 20×40×14 */}
      <mesh position={[0, 20, 0]} castShadow receiveShadow>
        <boxGeometry args={[20, 40, 14]} />
        <CityFacadeMaterial matProps={bottomProps} />
      </mesh>

      {/* Middle setback: 18×12×12 */}
      <mesh position={[0, 46, 0]} castShadow>
        <boxGeometry args={[18, 12, 12]} />
        <CityFacadeMaterial matProps={middleProps} />
      </mesh>

      {/* Top tower: 15×8×10 */}
      <mesh position={[0, 56, 0]} castShadow>
        <boxGeometry args={[15, 8, 10]} />
        <CityFacadeMaterial matProps={topProps} />
      </mesh>

      {/* Twin antenna masts */}
      {[-3, 3].map((x) => (
        <group key={x} position={[x, 60, 0]}>
          {/* Mast */}
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[0.12, 0.18, 8, 8]} />
            <meshStandardMaterial color="#8a8a90" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Horizontal crossbar */}
          <mesh position={[0, 6, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.06, 0.06, 3, 6]} />
            <meshStandardMaterial color="#8a8a90" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* Night: emissive bracing accent lines (for bloom) */}
      {mode === 'night' && (
        <>
          {/* Subtle glow planes on facade edges to catch bloom */}
          {[-10.05, 10.05].map((x) => (
            <mesh key={x} position={[x, 20, 0]}>
              <planeGeometry args={[0.1, 40]} />
              <meshBasicMaterial
                color="#aabbdd"
                transparent
                opacity={0.15}
              />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}
