/**
 * Upper deck passengers — 7 seated silhouettes visible through the
 * translucent upper-deck windows.
 *
 * Intentionally simpler than lower-deck TramPassengers because:
 *  1) Detail is lost through the tinted glass anyway — silhouettes read better.
 *  2) Kept contained in src/cabin/UpperDeck/ per user's architecture choice.
 *
 * Seat surface y=3.0 (matches UpperDeckSeats SEAT_Y).
 * Each passenger sits slightly inside the seat (Z+0.05 into backrest).
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SEAT_Y = 3.0

// Skin tones pool
const SKINS = ['#e8c8a0', '#f0d4b0', '#dfc090', '#d8b088']
// Clothing color pool (80s HK commuter palette)
const SHIRTS = ['#b84840', '#2a4a72', '#6a5a88', '#3a6a4a', '#c8a060', '#4a3c38', '#7a8aa0']
const TROUSERS = ['#2a2420', '#3a3228', '#1a2030', '#2a2a28']

interface SeatPos {
  x: number
  z: number
  shirtIdx: number
  skinIdx: number
  trouserIdx: number
  hairColor: string
  headTilt: number
}

// 7 seated passengers distributed across upper deck — matches UpperDeckSeats ROW_ZS
const PASSENGERS: SeatPos[] = [
  { x: -0.85, z: 1.5,  shirtIdx: 0, skinIdx: 0, trouserIdx: 0, hairColor: '#1a0f08', headTilt: -0.06 },
  { x: 0.85,  z: 1.5,  shirtIdx: 1, skinIdx: 1, trouserIdx: 1, hairColor: '#2a1810', headTilt: 0.04 },
  { x: -0.38, z: 0,    shirtIdx: 2, skinIdx: 0, trouserIdx: 2, hairColor: '#0a0604', headTilt: 0 },
  { x: 0.85,  z: -1.5, shirtIdx: 3, skinIdx: 2, trouserIdx: 0, hairColor: '#1a0f08', headTilt: -0.03 },
  { x: -0.85, z: -3.0, shirtIdx: 4, skinIdx: 1, trouserIdx: 1, hairColor: '#5a3020', headTilt: 0.02 },
  { x: 0.38,  z: -4.5, shirtIdx: 5, skinIdx: 3, trouserIdx: 2, hairColor: '#c8a060', headTilt: -0.08 },  // tourist-ish
  { x: -0.85, z: -6.0, shirtIdx: 6, skinIdx: 0, trouserIdx: 3, hairColor: '#2a1810', headTilt: 0.05 },
]

export function UpperDeckPassengers() {
  return (
    <group>
      {PASSENGERS.map((p, i) => (
        <SeatedPassenger key={i} pos={p} seed={i} />
      ))}
    </group>
  )
}

function SeatedPassenger({ pos, seed }: { pos: SeatPos; seed: number }) {
  const groupRef = useRef<THREE.Group>(null)

  // Tiny body sway from tram motion — reads through glass as subtle life
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    groupRef.current.rotation.z = Math.sin(t * 1.1 + seed * 1.7) * 0.022
    groupRef.current.position.y = SEAT_Y + Math.sin(t * 0.9 + seed * 2.3) * 0.008
  })

  const shirt = SHIRTS[pos.shirtIdx]
  const skin = SKINS[pos.skinIdx]
  const trouser = TROUSERS[pos.trouserIdx]

  return (
    <group ref={groupRef} position={[pos.x, SEAT_Y, pos.z]}>
      {/* Torso — rounded box */}
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.32, 0.44, 0.26]} />
        <meshStandardMaterial color={shirt} roughness={0.8} />
      </mesh>

      {/* Shoulders taper — top of torso */}
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.36, 0.12, 0.22]} />
        <meshStandardMaterial color={shirt} roughness={0.8} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.52, 0.01]}>
        <cylinderGeometry args={[0.055, 0.06, 0.08, 10]} />
        <meshStandardMaterial color={skin} roughness={0.85} />
      </mesh>

      {/* Head — slightly egg-shape */}
      <group position={[0, 0.65, 0.03]} rotation={[pos.headTilt, 0, 0]}>
        <mesh>
          <sphereGeometry args={[0.11, 14, 12]} />
          <meshStandardMaterial color={skin} roughness={0.85} />
        </mesh>
        {/* Hair cap — back of head */}
        <mesh position={[0, 0.035, -0.015]}>
          <sphereGeometry args={[0.113, 14, 12, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color={pos.hairColor} roughness={0.9} />
        </mesh>
      </group>

      {/* Arms resting on lap — two short cylinders */}
      {[-1, 1].map((side) => (
        <mesh
          key={`arm-${side}`}
          position={[side * 0.19, 0.12, 0.08]}
          rotation={[0.7, 0, side * -0.1]}
        >
          <cylinderGeometry args={[0.055, 0.05, 0.32, 8]} />
          <meshStandardMaterial color={shirt} roughness={0.8} />
        </mesh>
      ))}

      {/* Hands on lap */}
      {[-1, 1].map((side) => (
        <mesh key={`hand-${side}`} position={[side * 0.13, -0.03, 0.22]}>
          <sphereGeometry args={[0.045, 8, 8]} />
          <meshStandardMaterial color={skin} roughness={0.85} />
        </mesh>
      ))}

      {/* Upper legs — horizontal on seat */}
      {[-1, 1].map((side) => (
        <mesh
          key={`thigh-${side}`}
          position={[side * 0.085, -0.04, 0.05]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.07, 0.07, 0.34, 8]} />
          <meshStandardMaterial color={trouser} roughness={0.88} />
        </mesh>
      ))}

      {/* Lower legs — hanging down from seat edge */}
      {[-1, 1].map((side) => (
        <mesh
          key={`shin-${side}`}
          position={[side * 0.085, -0.26, 0.19]}
        >
          <cylinderGeometry args={[0.06, 0.055, 0.38, 8]} />
          <meshStandardMaterial color={trouser} roughness={0.88} />
        </mesh>
      ))}

      {/* Shoes */}
      {[-1, 1].map((side) => (
        <mesh
          key={`shoe-${side}`}
          position={[side * 0.085, -0.46, 0.22]}
        >
          <boxGeometry args={[0.09, 0.06, 0.18]} />
          <meshStandardMaterial color="#1a1410" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}
