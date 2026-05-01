import { TankInterior } from './TankInterior'
import { SwimmingKoi } from './SwimmingKoi'
import { HatchingEgg } from './HatchingEgg'
import { WaterEffects } from './WaterEffects'
import { AquariumLighting } from './AquariumLighting'
import { WorldOrbit } from '../../scene/components/WorldOrbit'
import { InteractiveGlow } from '../../scene/components/InteractiveGlow'
import { TapHint } from '../../scene/components/TapHint'
import { useStore } from '../../store'

/**
 * THE AQUARIUM — PomoReef's world.
 * The camera is INSIDE an aquarium tank. Glass walls visible on all sides,
 * koi swimming around at varied depths, hatching egg centered in front.
 *
 * Parented at world (0, -28, 0) to match WORLD_CAMERAS.aquarium.
 */
export function Aquarium() {
  const setModal = useStore((s) => s.setModal)
  const modal = useStore((s) => s.modal)

  return (
    <group
      position={[0, -28, 0]}
      onClick={(e) => {
        e.stopPropagation()
        setModal('aquarium')
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto'
      }}
    >
      <AquariumLighting />
      <TankInterior />
      <SwimmingKoi />
      <HatchingEgg />
      <InteractiveGlow radius={0.6} color="#ffd878" y={-0.5} />
      <WaterEffects />
      <WorldOrbit target={[0, -27.5, -2]} minDistance={2} maxDistance={8} />

      {/* Hint floats above the hatching egg — the world's focal point. */}
      <TapHint
        label="Tap the tank · 點擊魚缸"
        storageKey="aquarium-tank"
        offset={[0, 0.7, -1.5]}
        dismissWhen={modal === 'aquarium'}
      />
    </group>
  )
}
