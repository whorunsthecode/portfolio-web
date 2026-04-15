import { GymRoom } from './GymRoom'
import { GymEquipment } from './GymEquipment'
import { CagedPhone } from './CagedPhone'
import { Shrimps } from './Shrimps'
import { GymLighting } from './GymLighting'

/**
 * THE GYM — stiff's world.
 * Lime gym interior, a caged phone on a yoga mat under a dramatic
 * spotlight, and a semicircle of judgmental red-orange shrimps
 * (coach included) watching you through the screen.
 *
 * Parented at world (100, 0, 100) to match WORLD_CAMERAS.gym.
 */
export function Gym() {
  return (
    <group position={[100, 0, 100]}>
      <GymLighting />
      <GymRoom />
      <GymEquipment />
      <CagedPhone />
      <Shrimps />
    </group>
  )
}
