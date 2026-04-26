import { CabinShell } from './CabinShell'
import { Seats } from './Seats'
import { DriverCab } from './DriverCab'
import { TramPassengers } from './TramPassengers'
import { CabinDetails } from './CabinDetails'
import { LowerDeckShell } from '../scene/LowerDeckShell'
import { SpiralStaircase } from '../scene/SpiralStaircase'
import { UpperDeck } from './UpperDeck'
import { FrontExitPath } from './FrontExitPath'

export function Cabin() {
  return (
    <group position={[0, 1.8, 0]}>
      <LowerDeckShell />
      <CabinShell />
      {/* Original cabin content was authored against FLOOR_Y=0.5 (a
          single-deck tram). After the lower/upper deck split, these files
          still reference that constant, so they end up floating at upper-
          deck height. Shift them down by 2.0 so they land on the lower
          deck floor (LOWER_DECK_FLOOR_Y = -1.5). */}
      <group position={[0, -2, 0]}>
        <Seats />
        <DriverCab />
        <FrontExitPath />
        <TramPassengers />
        <CabinDetails />
      </group>
      <SpiralStaircase />
      <UpperDeck />
    </group>
  )
}
