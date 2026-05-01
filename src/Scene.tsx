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
import { MisterSofteeStop } from './traffic/MisterSofteeStop'
import { useStore } from './store'
import { Worlds } from './worlds/WorldManager'

function RouteTracker() {
  const advanceRoute = useStore((s) => s.advanceRoute)
  useFrame((_, delta) => {
    advanceRoute(delta * 4)
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
      <MisterSofteeStop />
      <RouteTracker />
      <Worlds />
    </>
  )
}
