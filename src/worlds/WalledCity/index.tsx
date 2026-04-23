import { AlleyShell } from './AlleyShell'
import { PipeWeb } from './PipeWeb'
import { MailSlots } from './MailSlots'
import { ApartmentFacades } from './ApartmentFacades'
import { Clutter } from './Clutter'
import { WalledCityLighting } from './WalledCityLighting'
import { FluorescentTubes } from './FluorescentTubes'
import { DentistSigns } from './DentistSigns'
import { PosterLayers } from './PosterLayers'
import { PlaneFlyover } from './PlaneFlyover'
import { Stairwell, stairFloor } from './Stairwell'
import { Rooftop } from './Rooftop'
import { SideCorridors, CORRIDORS } from './SideCorridors'
import { FirstPersonControls, type Zone } from '../common/FirstPersonControls'

// The world group is translated to world x=100, so the FPS bounds below
// are in WORLD space with that offset baked in. FirstPersonControls writes
// to camera.position directly (always world space), so passing the offset
// via bounds is simpler than nesting inside the group.
const WORLD_X = 100

// Corridor bounds derived straight from the CORRIDORS defs so they
// stay in sync with whatever openings SideCorridors renders. Each
// corridor is a narrow rectangular walkable zone with a 0.2m buffer
// from the far wall and 0.05m from the side walls.
const CORRIDOR_BOUNDS: Zone[] = CORRIDORS.map((c) => {
  const zMin = c.z - c.halfWidth + 0.05
  const zMax = c.z + c.halfWidth - 0.05
  if (c.side === 'left') {
    return {
      min: [WORLD_X - 0.9 - c.depth + 0.2, 0, zMin],
      max: [WORLD_X - 0.8, c.ceiling, zMax],
    }
  }
  return {
    min: [WORLD_X + 0.8, 0, zMin],
    max: [WORLD_X + 0.9 + c.depth - 0.2, c.ceiling, zMax],
  }
})

const BOUNDS: Zone[] = [
  // Alley — 0.1m buffer from the left/right/front walls. Back edge
  // (z=-5) has NO buffer so the player can walk up to the doorway and
  // seam into the stairwell zone.
  { min: [WORLD_X - 0.8, 0, -5], max: [WORLD_X + 0.8, 3.8, 4.8] },
  ...CORRIDOR_BOUNDS,
  // Stairwell — floor ramps from y=0 at z=-5 up to y=5 at z=-11. The
  // alley back edge and the stairwell front edge BOTH live at z=-5 so
  // the floor height stays continuous (both report y=0 there).
  {
    min: [WORLD_X - 0.8, 0, -11], max: [WORLD_X + 0.8, 7, -5],
    floorFn: (_x, z) => stairFloor(_x, z),
  },
  // Rooftop — open-sky deck. Far edge also has no buffer with the
  // stairwell's far end (z=-11) for the same continuity reason.
  { min: [WORLD_X - 5.8, 5, -24.8], max: [WORLD_X + 5.8, 20, -11] },
]

export function WalledCity() {
  return (
    <>
      <group position={[WORLD_X, 0, 0]}>
        <WalledCityLighting />
        <FluorescentTubes />
        <AlleyShell />
        <PipeWeb />
        <MailSlots />
        <ApartmentFacades />
        <PosterLayers />
        <DentistSigns />
        <Clutter />
        <SideCorridors />
        <Stairwell />
        <Rooftop />
        <PlaneFlyover />
      </group>
      <FirstPersonControls
        bounds={BOUNDS}
        start={[WORLD_X, 0, 4.5]}
        startYaw={0}
        height={1.65}
        speed={2.8}
      />
    </>
  )
}
