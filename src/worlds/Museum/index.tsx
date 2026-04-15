import { MuseumRoom } from './MuseumRoom'
import { Paintings } from './Paintings'
import { GestureGalleryExhibit } from './GestureGalleryExhibit'
import { MuseumLighting } from './MuseumLighting'
import { TrackLights } from './TrackLights'
import { VelvetRope } from './VelvetRope'
import { GuardChair } from './GuardChair'

export function Museum() {
  return (
    <group position={[-100, 0, 0]}>
      <MuseumLighting />
      <TrackLights />
      <MuseumRoom />
      <Paintings />
      <GestureGalleryExhibit />
      <VelvetRope />
      <GuardChair />
    </group>
  )
}
