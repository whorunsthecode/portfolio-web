import { DreamerySky } from './DreamerySky'
import { FloatingIslands } from './FloatingIslands'
import { Drift } from './Drift'
import { DreamSparkles } from './DreamSparkles'
import { DreameryLighting } from './DreameryLighting'

/**
 * THE DREAMERY — a non-grounded dreamscape.
 * Drift the cloud hovers at the center holding a "coming soon" envelope.
 * Tapping Drift opens the DreamDump modal.
 *
 * World is parented at world-coords (0, 62, 0) to keep matching
 * WORLD_CAMERAS.fantasy, which was already placed high above the street.
 */
export function Dreamery() {
  return (
    <group position={[0, 62, 0]}>
      <DreameryLighting />
      <DreamerySky />
      <FloatingIslands />
      <DreamSparkles />
      <Drift />
    </group>
  )
}
