import { CabinShell } from './CabinShell'
import { Seats } from './Seats'
import { CabinDetails } from './CabinDetails'
import { DestinationBlind } from './DestinationBlind'
import { TramPassengers } from './TramPassengers'
import { LowerDeckShell } from '../scene/LowerDeckShell'
import { SpiralStaircase } from '../scene/SpiralStaircase'

export function Cabin() {
  return (
    <group>
      <LowerDeckShell />
      <CabinShell />
      <Seats />
      <TramPassengers />
      <CabinDetails />
      <DestinationBlind />
      <SpiralStaircase />
    </group>
  )
}
