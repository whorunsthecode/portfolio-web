import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HSBC } from './HSBC'
import { BoC } from './BoC'
import { CheungKong } from './CheungKong'
import { IFC2 } from './IFC2'
import { WesternMarket } from './WesternMarket'
import { SheungWanStalls } from './SheungWanStalls'
import { TongLau } from './TongLau'
import { SaiYingPunShelter } from './SaiYingPunShelter'

const SCROLL_SPEED = 6
const ROUTE_LENGTH = 140 // extended from 90 to 140 for the longer route
const RESET_THRESHOLD = 15

interface LandmarkDef {
  component: React.FC
  x: number
  z: number
  rotY: number
}

// x = road edge (±5.5) + half building width
const LANDMARKS: LandmarkDef[] = [
  { component: HSBC,             x: 15.5,   z: -18,  rotY: 0 },
  { component: BoC,              x: -14.5,  z: -34,  rotY: 0 },
  { component: CheungKong,       x: 12.5,   z: -48,  rotY: 0 },
  { component: WesternMarket,    x: -13.5,  z: -60,  rotY: 0 },
  { component: IFC2,             x: 13.5,   z: -75,  rotY: 0 },
  { component: SheungWanStalls,  x: 0,      z: -90,  rotY: 0 },  // stalls handle their own x offsets internally
  { component: TongLau,          x: 0,      z: -105, rotY: 0 },  // tong lau handle their own x offsets internally
  { component: SaiYingPunShelter,x: -8,     z: -120, rotY: 0 },  // left side of the road
]

export function Landmarks() {
  const groupRef = useRef<THREE.Group>(null)
  const offsets = useRef(LANDMARKS.map((l) => l.z))

  useFrame((_, delta) => {
    if (!groupRef.current) return
    const children = groupRef.current.children

    for (let i = 0; i < children.length; i++) {
      offsets.current[i] += SCROLL_SPEED * delta
      if (offsets.current[i] > RESET_THRESHOLD) {
        offsets.current[i] -= ROUTE_LENGTH
      }
      children[i].position.z = offsets.current[i]
    }
  })

  return (
    <group ref={groupRef}>
      {LANDMARKS.map((lm, i) => {
        const Comp = lm.component
        return (
          <group key={i} position={[lm.x, 0, lm.z]} rotation={[0, lm.rotY, 0]}>
            <Comp />
          </group>
        )
      })}
    </group>
  )
}
