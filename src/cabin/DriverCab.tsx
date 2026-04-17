/**
 * Driver console + wheel — the user IS the driver, so no figure.
 * Positioned at the FRONT (-Z end) of the upper deck cabin.
 *
 * Upper deck: floor y=0.5, front wall (Dashboard) at z=-10
 *
 * Clickable driver hitbox: there's an invisible hit-target overlaid on
 * the driver's console. Clicking it opens the retro-ticket Driver
 * contact card via the global store. Preserves the "you are the driver"
 * fiction — the click metaphor is "reach into your own pocket" rather
 * than summoning a figure. Hover reveals a brass ✉ sigil + hint text.
 */

import { useState } from 'react'
import { Text } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useStore } from '../store'

const FLOOR_Y = 0.5
const CABIN_FRONT_Z = -10

const DASHBOARD = '#3a3028'
const WHEEL_DARK = '#1a1a18'
const BRASS = '#c8a468'

export function DriverCab() {
  const consoleZ = CABIN_FRONT_Z + 0.25
  const wheelZ = CABIN_FRONT_Z + 0.35
  const driverX = 0
  const setShowDriverCard = useStore((s) => s.setShowDriverCard)
  const [hovered, setHovered] = useState(false)

  // Share hover cursor + hit handler to apply to the hotspot group
  const handleEnter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(true)
    document.body.style.cursor = 'pointer'
  }
  const handleLeave = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation()
    setHovered(false)
    document.body.style.cursor = ''
  }
  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    setShowDriverCard(true)
  }

  return (
    <group>
      {/* Console body */}
      <mesh position={[driverX, FLOOR_Y + 0.5, consoleZ]}>
        <boxGeometry args={[0.9, 1.0, 0.35]} />
        <meshStandardMaterial color={DASHBOARD} roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Console top surface */}
      <mesh position={[driverX, FLOOR_Y + 1.01, consoleZ]}>
        <boxGeometry args={[0.92, 0.02, 0.37]} />
        <meshStandardMaterial color="#4a4038" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Angled dashboard face */}
      <mesh position={[driverX, FLOOR_Y + 0.9, consoleZ + 0.22]} rotation={[-Math.PI / 6, 0, 0]}>
        <boxGeometry args={[0.85, 0.35, 0.02]} />
        <meshStandardMaterial color="#2a2218" roughness={0.6} metalness={0.3} />
      </mesh>

      {/* Dashboard indicator lights */}
      {[-0.28, -0.14, 0, 0.14, 0.28].map((xOff, i) => (
        <mesh
          key={`gauge-${i}`}
          position={[driverX + xOff, FLOOR_Y + 0.95, consoleZ + 0.24]}
          rotation={[-Math.PI / 6, 0, 0]}
        >
          <circleGeometry args={[0.025, 10]} />
          <meshBasicMaterial color={['#c82020', '#c8a048', '#3a8848', '#5a6a88', '#c8a048'][i]} />
        </mesh>
      ))}

      {/* Glow rings around lights */}
      {[-0.28, -0.14, 0, 0.14, 0.28].map((xOff, i) => (
        <mesh
          key={`glow-${i}`}
          position={[driverX + xOff, FLOOR_Y + 0.95, consoleZ + 0.235]}
          rotation={[-Math.PI / 6, 0, 0]}
        >
          <ringGeometry args={[0.025, 0.032, 10]} />
          <meshBasicMaterial color="#1a1410" />
        </mesh>
      ))}

      {/* Wheel — horizontal disc on console top */}
      <group position={[driverX, FLOOR_Y + 1.07, wheelZ]}>
        <mesh>
          <cylinderGeometry args={[0.18, 0.18, 0.04, 20]} />
          <meshStandardMaterial color={WHEEL_DARK} roughness={0.5} metalness={0.6} />
        </mesh>
        {/* Brass rim */}
        <mesh position={[0, 0.025, 0]}>
          <torusGeometry args={[0.175, 0.014, 8, 20]} />
          <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.25} />
        </mesh>
        {/* Center hub */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.05, 12]} />
          <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.25} />
        </mesh>
        {/* Three spokes */}
        {[0, Math.PI * 2 / 3, Math.PI * 4 / 3].map((angle, i) => (
          <mesh
            key={`spoke-${i}`}
            position={[Math.cos(angle) * 0.09, 0.015, Math.sin(angle) * 0.09]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[0.14, 0.015, 0.02]} />
            <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
          </mesh>
        ))}
        {/* Handle */}
        <mesh position={[0.22, 0.04, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.18, 10]} />
          <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.25} />
        </mesh>
        <mesh position={[0.31, 0.04, 0]}>
          <sphereGeometry args={[0.035, 10, 10]} />
          <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.25} />
        </mesh>
      </group>

      {/* Secondary lever (brake/throttle) */}
      <group position={[driverX + 0.28, FLOOR_Y + 1.07, wheelZ - 0.05]}>
        <mesh>
          <cylinderGeometry args={[0.013, 0.013, 0.35, 8]} />
          <meshStandardMaterial color={WHEEL_DARK} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.03, 10, 10]} />
          <meshStandardMaterial color="#8a2820" roughness={0.6} />
        </mesh>
      </group>

      {/* Ding-ding bell pedal on floor */}
      <mesh position={[driverX - 0.25, FLOOR_Y + 0.03, consoleZ]}>
        <cylinderGeometry args={[0.06, 0.07, 0.04, 12]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[driverX - 0.25, FLOOR_Y + 0.051, consoleZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.055, 12]} />
        <meshStandardMaterial color="#1a1410" />
      </mesh>

      {/* Overhead grab rail */}
      <mesh position={[driverX, FLOOR_Y + 2.3, consoleZ + 0.15]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.6, 10]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Rail supports to ceiling */}
      <mesh position={[driverX - 0.25, FLOOR_Y + 2.45, consoleZ + 0.15]}>
        <cylinderGeometry args={[0.014, 0.014, 0.3, 6]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[driverX + 0.25, FLOOR_Y + 2.45, consoleZ + 0.15]}>
        <cylinderGeometry args={[0.014, 0.014, 0.3, 6]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* ── Clickable DRIVER hotspot ─────────────────────────────── */}
      {/* Invisible hit-target wraps the whole driver console footprint */}
      <mesh
        position={[driverX, FLOOR_Y + 0.6, consoleZ + 0.05]}
        onPointerOver={handleEnter}
        onPointerOut={handleLeave}
        onClick={handleClick}
      >
        <boxGeometry args={[1.1, 1.4, 0.7]} />
        <meshBasicMaterial transparent opacity={hovered ? 0.08 : 0} color="#c8a048" />
      </mesh>

      {/* Brass ✉ sigil on the console top — subtle when idle, bright on hover */}
      <mesh
        position={[driverX + 0.35, FLOOR_Y + 1.025, consoleZ - 0.05]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[0.1, 0.07]} />
        <meshStandardMaterial
          color={BRASS}
          metalness={0.7}
          roughness={0.3}
          emissive={BRASS}
          emissiveIntensity={hovered ? 0.6 : 0.15}
          transparent
          opacity={hovered ? 0.95 : 0.5}
        />
      </mesh>
      <Text
        position={[driverX + 0.35, FLOOR_Y + 1.03, consoleZ - 0.05]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.05}
        color="#1a1410"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        ✉
      </Text>

      {/* Floating hint tooltip — only visible on hover */}
      {hovered && (
        <group position={[driverX, FLOOR_Y + 1.45, consoleZ + 0.3]}>
          {/* Backing plate */}
          <mesh>
            <planeGeometry args={[0.9, 0.22]} />
            <meshBasicMaterial color="#1a1410" transparent opacity={0.82} />
          </mesh>
          {/* Brass border */}
          <mesh position={[0, 0, -0.001]}>
            <planeGeometry args={[0.92, 0.24]} />
            <meshBasicMaterial color={BRASS} />
          </mesh>
          <Text
            position={[0, 0.035, 0.001]}
            fontSize={0.05}
            color="#f5ead0"
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            司機 · Talk to the driver
          </Text>
          <Text
            position={[0, -0.05, 0.001]}
            fontSize={0.032}
            color="#d4b880"
            anchorX="center"
            anchorY="middle"
          >
            click to exchange cards
          </Text>
        </group>
      )}
    </group>
  )
}
