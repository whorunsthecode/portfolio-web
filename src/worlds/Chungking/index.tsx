import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { ChungkingArcade }   from './ChungkingArcade'
import { ShopStalls }        from './ShopStalls'
import { CageLift }          from './CageLift'
import { ArcadeLighting }    from './ArcadeLighting'
import { HangingSigns }      from './HangingSigns'
import { ChungkingLighting } from './ChungkingLighting'
import { ElevatorLobby }     from './ElevatorLobby'
import { Elevator }          from './Elevator'
import { FirstPersonControls, type Zone } from '../common/FirstPersonControls'

const WORLD_X = -100

const BOUNDS: Zone[] = [
  // Arcade — full 6m width, small buffer at entry end
  { min: [WORLD_X - 2.8, 0, -5.0], max: [WORLD_X + 2.8, 3.0, 4.8] },
  // Elevator lobby — 4m wide
  { min: [WORLD_X - 2.0, 0, -9.0], max: [WORLD_X + 2.0, 2.7, -5.0] },
]

// Light haze — real arcade had cooking-smoke + cigarette smoke under
// fluorescents, but it read as a bright lit interior, not horror fog.
function ChungkingFog() {
  const { scene } = useThree()
  useEffect(() => {
    const prev = scene.fog
    scene.fog = new THREE.FogExp2('#8a8270', 0.018)
    return () => { scene.fog = prev }
  }, [scene])
  return null
}

export function Chungking() {
  return (
    <>
      <group position={[WORLD_X, 0, 0]}>
        <ChungkingFog />
        <ArcadeLighting />
        <ChungkingLighting />
        <ChungkingArcade />
        <ShopStalls />
        <HangingSigns />
        <CageLift />
        <ElevatorLobby />
        <Elevator />
      </group>

      <FirstPersonControls
        bounds={BOUNDS}
        start={[WORLD_X, 0, 4.0]}
        startYaw={0}
        height={1.65}
        speed={2.8}
      />
    </>
  )
}
