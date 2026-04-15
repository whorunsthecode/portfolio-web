import { Bedroom } from './Bedroom'
import { Drift } from './Drift'
import { DreamClouds } from './DreamClouds'
import { DreameryLighting } from './DreameryLighting'
import { WorldOrbit } from '../../scene/components/WorldOrbit'

/**
 * THE DREAMERY — a cozy bedroom scene.
 * Drift the cloud hovers over the bed holding a "coming soon" envelope.
 * Tapping Drift opens the DreamDump modal.
 *
 * World is parented at world-coords (0, 62, 0) to keep matching
 * WORLD_CAMERAS.fantasy.
 */
export function Dreamery() {
  return (
    <group position={[0, 62, 0]}>
      <DreameryLighting />
      <Bedroom />
      <Drift />
      <DreamClouds />
      <WorldOrbit target={[-1.2, 63, -0.5]} minDistance={2} maxDistance={6} />
    </group>
  )
}
