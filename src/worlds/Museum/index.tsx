import { MuseumRoom } from './MuseumRoom'
import { Paintings } from './Paintings'
import { GestureGalleryExhibit } from './GestureGalleryExhibit'
import { MuseumLighting } from './MuseumLighting'

export function Museum() {
  return (
    <group position={[-100, 0, 0]}>
      <MuseumLighting />
      <MuseumRoom />
      <Paintings />
      <GestureGalleryExhibit />
    </group>
  )
}
