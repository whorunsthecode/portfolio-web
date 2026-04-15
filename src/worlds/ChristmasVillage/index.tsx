import { PostOfficeRoom } from './PostOfficeRoom'
import { SnowGlobe } from './SnowGlobe'
import { PostcardStation } from './PostcardStation'
import { Snowfall } from './Snowfall'
import { ChristmasLighting } from './ChristmasLighting'
import { WorldOrbit } from '../../scene/components/WorldOrbit'

export function ChristmasVillage() {
  return (
    <group position={[100, 0, 0]}>
      <ChristmasLighting />
      <PostOfficeRoom />
      <SnowGlobe />
      <PostcardStation />
      <Snowfall />
      <WorldOrbit target={[100, 1.5, -1.5]} minDistance={2} maxDistance={8} />
    </group>
  )
}
