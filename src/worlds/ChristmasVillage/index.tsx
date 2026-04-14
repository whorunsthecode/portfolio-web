import { ChristmasGround } from './ChristmasGround'
import { VillageHouses } from './VillageHouses'
import { ChristmasTree } from './ChristmasTree'
import { Snowfall } from './Snowfall'
import { ChristmasLighting } from './ChristmasLighting'

export function ChristmasVillage() {
  return (
    <group position={[100, 0, 0]}>
      <ChristmasLighting />
      <ChristmasGround />
      <VillageHouses />
      <ChristmasTree />
      <Snowfall />
    </group>
  )
}
