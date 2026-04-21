import { useFrame } from '@react-three/fiber'
import { Sky } from './Sky'
import { Road, LaneMarkings, Sidewalks } from './Street'
import { TramCorridor } from './scene/TramCorridor'
import { Lighting } from './Lighting'
import { Cabin } from './cabin'
import { TramExteriorShell } from './scene/Tram'
import { TenementRow } from './buildings/TenementRow'
import { Landmarks } from './buildings/landmarks/Landmarks'
import { HKSigns } from './buildings/HKSigns'
import { BambooScaffold } from './buildings/BambooScaffold'
import { TrafficSystem } from './traffic/TrafficSystem'
import { Pedestrians } from './traffic/Pedestrians'
import { useStore } from './store'

function RouteTracker() {
  const advanceRoute = useStore((s) => s.advanceRoute)
  useFrame((_, delta) => {
    advanceRoute(delta * 6)
  })
  return null
}

export function Scene() {
  return (
    <>
      <Sky />
      <Lighting />
      <Road />
      <Sidewalks />
      <TramCorridor />
      <LaneMarkings />
      <TramExteriorShell />
      <Cabin />
      <TenementRow />
      <Landmarks />
      <HKSigns />
      <BambooScaffold />
      <TrafficSystem />
      <Pedestrians />
      <RouteTracker />
    </>
  )
}
