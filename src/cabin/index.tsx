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
      <Seats />
      <DriverCab />
      <FrontExitPath />
      <TramPassengers />
      <CabinDetails />
      <SpiralStaircase />
      <UpperDeck />
    </group>
  )
}
