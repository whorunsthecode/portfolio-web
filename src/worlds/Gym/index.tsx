import { GymRoom } from './GymRoom'
import { GymEquipment } from './GymEquipment'
import { CagedPhone } from './CagedPhone'
import { Shrimps } from './Shrimps'
import { NeonSign } from './NeonSign'
import { GymLighting } from './GymLighting'
import { WorldOrbit } from '../../scene/components/WorldOrbit'

export function Gym() {
  return (
    <group position={[100, 0, 100]}>
      <GymLighting />
      <GymRoom />
      <GymEquipment />
      <CagedPhone />
      <Shrimps />
      <NeonSign />
      <WorldOrbit target={[100.3, 1.6, 97]} minDistance={2} maxDistance={8} />
    </group>
  )
}
