import { CabinShell } from './CabinShell'
import { Seats } from './Seats'
import { DriverCab } from './DriverCab'
import { TramPassengers } from './TramPassengers'
import { CabinDetails } from './CabinDetails'
import { DestinationBlind } from './DestinationBlind'
import { LowerDeckShell } from '../scene/LowerDeckShell'
import { SpiralStaircase } from '../scene/SpiralStaircase'
import { UpperDeck } from './UpperDeck'

export function Cabin() {
  return (
    <group>
      <LowerDeckShell />
      <CabinShell />
      <Seats />
      <DriverCab />
      <TramPassengers />
      <CabinDetails />
      <DestinationBlind />
      <SpiralStaircase />
      <UpperDeck />
    </group>
  )
}
