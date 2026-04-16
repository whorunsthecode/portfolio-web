import { TerminusGround } from './TerminusGround'
import { TerminusShelter } from './TerminusShelter'
import { StopPole } from './StopPole'
import { RouteMap } from './RouteMap'
import { InfoPanel } from './InfoPanel'
import { ParkedTram } from './ParkedTram'
import { TerminusLighting } from './TerminusLighting'
import { TerminusSky } from './TerminusSky'
import { WorldOrbit } from '../../scene/components/WorldOrbit'

/**
 * THE TERMINUS — last stop on the route.
 * An authentic 1960s-70s HK tram stop: narrow concrete refuge island in
 * the middle of the road, vintage scalloped-roof shelter, iconic circular
 * pole-mounted stop sign, framed route map, and the contact ticket board.
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
      <StopPole />

      {/* Route map hangs on the shelter's cream back wall (inside shelter) */}
      <group position={[0, 0.2, 0]}>
        <RouteMap />
      </group>

      {/* Info panel repositioned to RIGHT interior wall of shelter,
          rotated 90° so it faces outward from the right-side wall */}
      <group position={[0.6, 0.2, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[0.85, 0.85, 0.85]}>
        <InfoPanel />
      </group>

      <ParkedTram />
      <WorldOrbit target={[0, 1.2, 97.8]} minDistance={2} maxDistance={8} />
    </group>
  )
}
