import { PostOfficeRoom } from './PostOfficeRoom'
import { SnowGlobe } from './SnowGlobe'
import { PostcardStation } from './PostcardStation'
import { Snowfall } from './Snowfall'
import { ChristmasLighting } from './ChristmasLighting'
import { SantaSleigh } from './SantaSleigh'
import { WorldOrbit } from '../../scene/components/WorldOrbit'

export function ChristmasVillage() {
  return (
    <group position={[100, 0, 0]}>
      <ChristmasLighting />
      <PostOfficeRoom />
      <SnowGlobe />
      <PostcardStation />
      <Snowfall />
      {/* Easter egg — Santa + reindeer flying a slow loop past the
          post-office window. Visible through the transparent glass
          when you look toward the right wall. */}
      <SantaSleigh />
      <WorldOrbit target={[100, 1.5, -1.5]} minDistance={2} maxDistance={8} />
    </group>
  )
}
