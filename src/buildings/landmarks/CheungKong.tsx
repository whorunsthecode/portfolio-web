import { useCityFacadeMaterial, CityFacadeMaterial } from '../CityFacade'

/**
 * Cheung Kong Center — simplest landmark.
 * Clean rectangular slab, pink-beige facade, dense window grid.
 * Mechanical equipment cap on top + central antenna.
 */
export function CheungKong() {
  const facadeProps = useCityFacadeMaterial({
    baseColor: [0.82, 0.75, 0.70],  // pink-beige
    windowDensityX: 10,
    windowDensityY: 15,
    bandSpacing: 0.02,
    seed: 201,
    nightLitFraction: 0.7,
    roughness: 0.6,
    metalness: 0.15,
  })

  return (
    <group>
      {/* Main tower */}
      <mesh position={[0, 22.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[14, 45, 14]} />
        <CityFacadeMaterial matProps={facadeProps} />
      </mesh>

      {/* Mechanical cap */}
      <mesh position={[0, 46, 0]}>
        <boxGeometry args={[10, 2, 10]} />
        <meshStandardMaterial color="#7a7570" roughness={0.8} />
      </mesh>

      {/* Antenna */}
      <mesh position={[0, 50, 0]}>
        <cylinderGeometry args={[0.15, 0.1, 6, 8]} />
        <meshStandardMaterial color="#9a9590" metalness={0.5} roughness={0.3} />
      </mesh>
    </group>
  )
}
