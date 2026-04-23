import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { HSBC } from './HSBC'
import { BoC } from './BoC'
import { Furama } from './Furama'
import { WesternMarket } from './WesternMarket'
import { JardineHouse } from './JardineHouse'
import { ManMoTemple } from './ManMoTemple'
import { CentralMarket } from './CentralMarket'
import { SheungWanStalls } from './SheungWanStalls'
import { TongLau } from './TongLau'
import { SaiYingPunShelter } from './SaiYingPunShelter'

const SCROLL_SPEED = 4
const ROUTE_LENGTH = 140 // extended from 90 to 140 for the longer route
const RESET_THRESHOLD = 15

interface LandmarkDef {
  component: React.FC
  x: number
  z: number
  rotY: number
}

// x = road edge (±5.5) + half building width. Order by z for readability;
// sides alternate so the skyline stays visually varied as you roll past.
//
// Period note: all landmarks here existed and were visually current in 1982.
// Jardine House (1973) and Furama (1973) replace the previously anachronistic
// IFC 2 (2003) and Cheung Kong Center (1999). Man Mo Temple (1847) and
// Central Market (1938) add low-rise character alongside the office towers.
const LANDMARKS: LandmarkDef[] = [
  // HSBC closer to the road so it reads through the tram window — was
  // x=15.5 which put it almost outside the camera's horizontal frustum.
  { component: HSBC,              x: 10,     z: -18,  rotY: 0 },
  { component: CentralMarket,     x: -12,    z: -26,  rotY: 0 },
  // BoC also brought in — was x=-14.5, outside frustum.
  { component: BoC,               x: -10,    z: -34,  rotY: 0 },
  { component: Furama,            x: 12,     z: -48,  rotY: 0 },
  { component: WesternMarket,     x: -13.5,  z: -60,  rotY: 0 },
  { component: JardineHouse,      x: 13.5,   z: -75,  rotY: 0 },
  { component: ManMoTemple,       x: 9.5,    z: -83,  rotY: 0 },
  { component: SheungWanStalls,   x: 0,      z: -92,  rotY: 0 },
  { component: TongLau,           x: 0,      z: -105, rotY: 0 },
  { component: SaiYingPunShelter, x: -8,     z: -120, rotY: 0 },
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
