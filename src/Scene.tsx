import { useFrame } from '@react-three/fiber'
import { Sky } from './Sky'
import { Road, LaneMarkings, Sidewalks } from './Street'
import { TramCorridor } from './scene/TramCorridor'
import { Lighting } from './Lighting'
import { Cabin } from './cabin'
import { TramExteriorShell } from './scene/Tram'
import { TenementRow } from './buildings/TenementRow'
import { Landmarks } from './buildings/landmarks/Landmarks'
import { NeonSigns } from './buildings/NeonSigns'
import { StreetFurniture } from './buildings/StreetFurniture'
import { TrafficSystem } from './traffic/TrafficSystem'
import { Pedestrians } from './traffic/Pedestrians'
import { useStore } from './store'
import { Worlds } from './worlds/WorldManager'

function RouteTracker() {
  const advanceRoute = useStore((s) => s.advanceRoute)
  useFrame((_, delta) => {
    advanceRoute(delta * 6) // same speed as scroll (6 units/sec), route loops at 140
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
      <NeonSigns />
      <StreetFurniture />
      <TrafficSystem />
      <Pedestrians />
      <RouteTracker />
      <Worlds />
    </>
  )
}
