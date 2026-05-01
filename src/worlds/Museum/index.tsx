import { MuseumRoom } from './MuseumRoom'
import { Paintings, MuseumBench } from './Paintings'
import { GestureGalleryExhibit } from './GestureGalleryExhibit'
import { MuseumLighting } from './MuseumLighting'
import { TrackLights } from './TrackLights'
import { VelvetRope } from './VelvetRope'
import { GuardChair } from './GuardChair'
import { WorldOrbit } from '../../scene/components/WorldOrbit'

export function Museum() {
  return (
    <group position={[-100, 0, 0]}>
      <MuseumLighting />
      <TrackLights />
      <MuseumRoom />
      <Paintings />
      {/* Viewing bench — positioned between the VelvetRope exhibit and
          the back wall so visitors can sit and look at the paintings */}
      <MuseumBench />
      <GestureGalleryExhibit />
      <VelvetRope />
      <GuardChair />
      {/* Room is 6×10×5 with target at local [0,1.5,-2]; nearest wall is 3
          units away. maxDistance kept snug so extreme orbit angles don't
          clip past the back wall, but loosened enough (was 2.8) that
          visitors can actually pull back to see the whole gallery. */}
      <WorldOrbit target={[-100, 1.5, -2]} minDistance={1.5} maxDistance={5.5} />
    </group>
  )
}
