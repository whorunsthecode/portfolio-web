import { TerminusGround } from './TerminusGround'
import { TerminusShelter } from './TerminusShelter'
import { InfoPanel } from './InfoPanel'
import { ParkedTram } from './ParkedTram'
import { TerminusLighting } from './TerminusLighting'
import { TerminusSky } from './TerminusSky'
import { WorldOrbit } from '../../scene/components/WorldOrbit'

/**
 * THE TERMINUS — last stop on the route.
 * A HK tram stop at dusk where the info panel itself is the interface,
 * showing Karmen's contact methods as tram "stops" along a route strip.
 *
 * World origin sits at world-coords (0, 0, 100) to match WORLD_CAMERAS.terminus.
 */
export function Terminus() {
  return (
    <group position={[0, 0, 100]}>
      <TerminusLighting />
      <TerminusSky />
      <TerminusGround />
      <TerminusShelter />
      <InfoPanel />
      <ParkedTram />
      <WorldOrbit target={[0, 1.2, 97.8]} minDistance={2} maxDistance={8} />
    </group>
  )
}
