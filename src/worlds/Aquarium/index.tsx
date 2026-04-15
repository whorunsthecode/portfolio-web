import type { ThreeEvent } from '@react-three/fiber'
import { PondChamber } from './PondChamber'
import { PondVegetation } from './PondVegetation'
import { SwimmingKoi } from './SwimmingKoi'
import { HatchingEgg } from './HatchingEgg'
import { WaterEffects } from './WaterEffects'
import { AquariumLighting } from './AquariumLighting'
import { useStore } from '../../store'

/**
 * THE AQUARIUM — PomoReef's world.
 * A side cross-section of a koi pond at sunset. Top half: sky, reeds,
 * lily pads. Bottom half: koi + a warmly-glowing egg mid-session with
 * a progress ring that loops every 15 seconds: wait → flash → crack →
 * new koi swims down and joins the pond.
 *
 * The whole scene is tappable — tapping anywhere opens the PomoReef
 * modal. Parented at world (0, -28, 0) to match WORLD_CAMERAS.aquarium.
 */
export function Aquarium() {
  const setModal = useStore((s) => s.setModal)

  const handleTap = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setModal('aquarium')
  }

  return (
    <group
      position={[0, -28, 0]}
      onClick={handleTap}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      <AquariumLighting />
      <PondChamber />
      <PondVegetation />
      <SwimmingKoi />
      <HatchingEgg />
      <WaterEffects />

      {/* Transparent tap-catching plane in front of the scene.
          Catches clicks that miss the koi/egg/vegetation meshes so the
          modal opens from any point on the pond. */}
      <mesh position={[0, 0, 1]}>
        <planeGeometry args={[10, 5]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  )
}
