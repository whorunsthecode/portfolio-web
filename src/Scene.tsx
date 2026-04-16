import { useFrame } from '@react-three/fiber'
import { Sky } from './Sky'
import { Road, LaneMarkings } from './Street'
import { TramCorridor } from './scene/TramCorridor'
import { Lighting } from './Lighting'
import { Cabin } from './cabin'
import { TenementRow } from './buildings/TenementRow'
import { Landmarks } from './buildings/landmarks/Landmarks'
import { TrafficSystem } from './traffic/TrafficSystem'
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
      <TramCorridor />
      <LaneMarkings />
      <Cabin />
      <TenementRow />
      <Landmarks />
      <TrafficSystem />
      <RouteTracker />
      <Worlds />
    </>
  )
}
