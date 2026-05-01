import { AlleyShell } from './AlleyShell'
import { AlleyDogleg } from './AlleyDogleg'
import { Sundry } from './Sundry'
import { BingSutt } from './BingSutt'
import { FruitStall } from './FruitStall'
import { ShopFigures } from './ShopFigures'
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
import { Salon } from './Salon'
import { FirstPersonControls, type Zone } from '../common/FirstPersonControls'

// The world group is translated to world x=100, so the FPS bounds below
// are in WORLD space with that offset baked in. FirstPersonControls writes
// to camera.position directly (always world space), so passing the offset
// via bounds is simpler than nesting inside the group.
const WORLD_X = 100

// Corridor bounds derived straight from the CORRIDORS defs so they stay
// in sync with whatever openings SideCorridors renders.
//
// Two skips:
//   - 'salon' has its own dedicated bounds below
//   - 'stairwell' has the rotated Stairwell bound below (with floorFn)
//
// Segment-aware: corridors at z<-16 sit on the deep alley segment
// (axis x=-2), so their alley wall plane is offset accordingly.
const CORRIDOR_BOUNDS: Zone[] = CORRIDORS
  .filter((c) => c.kind !== 'salon' && c.kind !== 'stairwell')
  .map((c) => {
    const zMin = c.z - c.halfWidth + 0.05
    const zMax = c.z + c.halfWidth - 0.05
    const segCenterX = c.z < -16 ? -2 : 0
    if (c.side === 'left') {
      return {
        min: [WORLD_X + segCenterX - 0.9 - c.depth + 0.2, 0, zMin] as [number, number, number],
        max: [WORLD_X + segCenterX - 0.8, c.ceiling, zMax] as [number, number, number],
      }
    }
    return {
      min: [WORLD_X + segCenterX + 0.8, 0, zMin] as [number, number, number],
      max: [WORLD_X + segCenterX + 0.9 + c.depth - 0.2, c.ceiling, zMax] as [number, number, number],
    }
  })

const BOUNDS: Zone[] = [
  // Entrance alley segment — axis x=0, z from front wall (+4.8) down to
  // dogleg boundary (-14). 0.1m buffer from left/right walls.
  { min: [WORLD_X - 0.8, 0, -14], max: [WORLD_X + 0.8, 3.8, 4.8] },

  // Dogleg transition zone — covers the bend between segments. Slightly
  // generous rectangle (the wall meshes contain the player visually).
  { min: [WORLD_X - 2.8, 0, -16], max: [WORLD_X + 0.8, 3.8, -14] },

  // Deep alley segment — axis x=-2, z from dogleg boundary (-16) down to
  // FruitStall blockade (-28). 1.6m walkable width centered on x=-2.
  { min: [WORLD_X - 2.8, 0, -28], max: [WORLD_X - 1.2, 3.8, -16] },

  // BingSutt doorway-overlap strip — narrow zone that lets the player
  // cross the alley→shop threshold at z ∈ [-22, -18]. Without this the
  // 0.2m gap between alley bound (x≤-1.2) and shop bound (x≥-1.0)
  // blocks entry.
  { min: [WORLD_X - 1.2, 0, -22], max: [WORLD_X - 1.0, 3.8, -18] },

  ...CORRIDOR_BOUNDS,

  // Stairwell — perpendicular branch off entrance segment left wall at
  // z=[-9, -8]. Floor ramps from y=0 at x=-0.9 up to y=5 at x=-6.
  {
    min: [WORLD_X - 6, 0, -9], max: [WORLD_X - 0.8, 7, -8],
    floorFn: (x, _z) => stairFloor(x - WORLD_X, _z),
  },

  // Rooftop — open-sky deck. Extended SOUTH to z=-7 (was -11) so the
  // stairwell landing at x=-6, z=-8.5 falls inside the bound; player
  // can step off the stairs onto the rooftop seamlessly.
  { min: [WORLD_X - 5.8, 5, -24.8], max: [WORLD_X + 5.8, 20, -7] },

  // Salon — small KWC barber unit off the right alley wall (entrance
  // segment). Doorway and interior unchanged from the existing build.
  { min: [WORLD_X + 0.7, 0, -0.8], max: [WORLD_X + 2.85, 2.2, 0.0] },
  { min: [WORLD_X + 0.95, 0, -2.45], max: [WORLD_X + 2.85, 2.2, -0.05] },

  // 強記冰室 walk-in interior — right side of deep segment. 2m wide
  // (x ∈ [-1.0, +0.8] = 1.8m walkable + 0.2m wall margins) × 4m deep
  // (z ∈ [-22, -18]) × 2.8m ceiling.
  { min: [WORLD_X - 1.0, 0, -22], max: [WORLD_X + 0.8, 2.8, -18] },
]

export function WalledCity() {
  return (
    <>
      <group position={[WORLD_X, 0, 0]}>
        <WalledCityLighting />
        <FluorescentTubes />
        <AlleyShell />
        <AlleyDogleg />
        <PipeWeb />
        <MailSlots />
        <ApartmentFacades />
        <PosterLayers />
        <DentistSigns />
        <Clutter />
        <SideCorridors />
        <Stairwell />
        <Rooftop />
        <Salon />
        <PlaneFlyover />
        <Sundry />
        <BingSutt />
        <FruitStall />
        <ShopFigures />
      </group>
      {/* InteractableHUD mounts in Task 17/18 */}
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
