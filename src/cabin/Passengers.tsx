/**
 * Seated + standing commuter passengers on the tram.
 * Visible when the driver (user) rotates to look backward.
 *
 * Upper deck: floor y=0.5, cabin z from -9.25 to 3.25, half-width 1.15
 */
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const FLOOR_Y = 0.5
const CABIN_HALF_WIDTH = 1.15
const CABIN_REAR_Z = -1.75

const SKIN = '#d4b090'
const SKIN_2 = '#c4a080'
const SKIN_3 = '#b89070'

const SHIRTS = ['#3a5848', '#5a3828', '#28384a', '#4a2838', '#6a5848', '#2a4858', '#484838']
const PANTS = '#2a2838'
const PANTS_2 = '#383028'

function SeatedPassenger({
  xPosition,
  zPosition,
  facing,
  shirtColor,
  skinColor,
  hasBag = false,
}: {
  xPosition: number
  zPosition: number
  facing: 'left' | 'right'
  shirtColor: string
  skinColor: string
  hasBag?: boolean
}) {
  const bodyRotY = facing === 'right' ? -Math.PI / 2 : Math.PI / 2

  return (
    <group position={[xPosition, FLOOR_Y, zPosition]} rotation={[0, bodyRotY, 0]}>
      {/* Legs bent (sitting) */}
      <mesh position={[-0.06, 0.55, 0.1]} rotation={[Math.PI / 2.5, 0, 0]}>
        <boxGeometry args={[0.08, 0.4, 0.1]} />
        <meshStandardMaterial color={PANTS} roughness={0.85} />
      </mesh>
      <mesh position={[0.06, 0.55, 0.1]} rotation={[Math.PI / 2.5, 0, 0]}>
        <boxGeometry args={[0.08, 0.4, 0.1]} />
        <meshStandardMaterial color={PANTS} roughness={0.85} />
      </mesh>

      {/* Torso */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.28, 0.4, 0.18]} />
        <meshStandardMaterial color={shirtColor} roughness={0.85} />
      </mesh>

      {/* Arms resting */}
      <mesh position={[-0.17, 0.85, 0.02]}>
        <boxGeometry args={[0.08, 0.35, 0.1]} />
        <meshStandardMaterial color={shirtColor} roughness={0.85} />
      </mesh>
      <mesh position={[0.17, 0.85, 0.02]}>
        <boxGeometry args={[0.08, 0.35, 0.1]} />
        <meshStandardMaterial color={shirtColor} roughness={0.85} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 1.22, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} />
      </mesh>

      {/* Hair */}
      <mesh position={[0, 1.27, -0.02]}>
        <sphereGeometry args={[0.105, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#2a1a10" roughness={0.95} />
      </mesh>

      {/* Optional bag on lap */}
      {hasBag && (
        <mesh position={[0, 0.7, 0.15]}>
          <boxGeometry args={[0.12, 0.12, 0.08]} />
          <meshStandardMaterial color="#8a5830" roughness={0.85} />
        </mesh>
      )}
    </group>
  )
}

function StandingPassenger({
  xPosition,
  zPosition,
  shirtColor,
  skinColor,
  armUp = 'left',
}: {
  xPosition: number
  zPosition: number
  shirtColor: string
  skinColor: string
  armUp?: 'left' | 'right' | 'both'
}) {
  const bobRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!bobRef.current) return
    const t = clock.elapsedTime
    bobRef.current.rotation.z = Math.sin(t * 0.7 + xPosition * 3) * 0.025
  })

  return (
    <group position={[xPosition, FLOOR_Y, zPosition]}>
      <group ref={bobRef}>
        {/* Legs */}
        <mesh position={[-0.06, 0.4, 0]}>
          <boxGeometry args={[0.1, 0.8, 0.12]} />
          <meshStandardMaterial color={PANTS_2} roughness={0.85} />
        </mesh>
        <mesh position={[0.06, 0.4, 0]}>
          <boxGeometry args={[0.1, 0.8, 0.12]} />
          <meshStandardMaterial color={PANTS_2} roughness={0.85} />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 1.05, 0]}>
          <boxGeometry args={[0.32, 0.5, 0.2]} />
          <meshStandardMaterial color={shirtColor} roughness={0.85} />
        </mesh>

        {/* Left arm */}
        {armUp === 'left' || armUp === 'both' ? (
          <mesh position={[-0.22, 1.4, 0]} rotation={[0, 0, 0.4]}>
            <boxGeometry args={[0.08, 0.5, 0.08]} />
            <meshStandardMaterial color={shirtColor} roughness={0.85} />
          </mesh>
        ) : (
          <mesh position={[-0.2, 0.95, 0]}>
            <boxGeometry args={[0.08, 0.45, 0.1]} />
            <meshStandardMaterial color={shirtColor} roughness={0.85} />
          </mesh>
        )}

        {/* Right arm */}
        {armUp === 'right' || armUp === 'both' ? (
          <mesh position={[0.22, 1.4, 0]} rotation={[0, 0, -0.4]}>
            <boxGeometry args={[0.08, 0.5, 0.08]} />
            <meshStandardMaterial color={shirtColor} roughness={0.85} />
          </mesh>
        ) : (
          <mesh position={[0.2, 0.95, 0]}>
            <boxGeometry args={[0.08, 0.45, 0.1]} />
            <meshStandardMaterial color={shirtColor} roughness={0.85} />
          </mesh>
        )}

        {/* Head */}
        <mesh position={[0, 1.5, 0]}>
          <sphereGeometry args={[0.11, 12, 12]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>

        {/* Hair */}
        <mesh position={[0, 1.55, -0.02]}>
          <sphereGeometry args={[0.115, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#2a1a10" roughness={0.95} />
        </mesh>
      </group>
    </group>
  )
}

export function Passengers() {
  const leftBenchX = -CABIN_HALF_WIDTH + 0.22
  const rightBenchX = CABIN_HALF_WIDTH - 0.22

  return (
    <group>
      {/* Seated on left bench (facing right/+X toward aisle) */}
      <SeatedPassenger xPosition={leftBenchX} zPosition={CABIN_REAR_Z - 3.5} facing="right" shirtColor={SHIRTS[0]} skinColor={SKIN} />
      <SeatedPassenger xPosition={leftBenchX} zPosition={CABIN_REAR_Z - 2.2} facing="right" shirtColor={SHIRTS[2]} skinColor={SKIN_2} hasBag />

      {/* Seated on right bench (facing left/-X toward aisle) */}
      <SeatedPassenger xPosition={rightBenchX} zPosition={CABIN_REAR_Z - 4.0} facing="left" shirtColor={SHIRTS[4]} skinColor={SKIN_3} />
      <SeatedPassenger xPosition={rightBenchX} zPosition={CABIN_REAR_Z - 2.5} facing="left" shirtColor={SHIRTS[1]} skinColor={SKIN} />

      {/* Standing in aisle holding straps */}
      <StandingPassenger xPosition={0} zPosition={CABIN_REAR_Z - 3.0} shirtColor={SHIRTS[3]} skinColor={SKIN_2} armUp="left" />
      <StandingPassenger xPosition={0.1} zPosition={CABIN_REAR_Z - 4.5} shirtColor={SHIRTS[5]} skinColor={SKIN} armUp="right" />

      {/* The passenger that used to sit on the rear forward-facing
          seat was removed alongside those seats (see Seats.tsx). After
          the tram was shortened they had no seat to sit on. */}
    </group>
  )
}
