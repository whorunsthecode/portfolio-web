import { useFrame } from '@react-three/fiber'
import { Sky } from './Sky'
import { Road, TramTracks, LaneMarkings, CatenaryPoles } from './Street'
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
      <TramTracks />
      <LaneMarkings />
      <CatenaryPoles />
      <Cabin />
      <TenementRow />
      <Landmarks />
      <TrafficSystem />
      <RouteTracker />
      <Worlds />
    </>
  )
}
