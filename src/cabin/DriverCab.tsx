/**
 * Driver console — rebuilt to match user's reference photos:
 * gray/teal painted-steel enclosure with a dense left-side switch +
 * gauge cluster, large central analog dial, right-side red LED route
 * display, chunky ergonomic gear lever on the left-front, and a
 * 3-spoke steering wheel on the right. The driver is still implied
 * (the user IS the driver) so no figure.
 *
 * Positioned at the FRONT (-Z end) of the upper deck cabin.
 * Upper deck: floor y=0.5, front wall (Dashboard) at z=-10
 *
 * Clickable DriverBadge: small brass envelope on the SLOPED DASHBOARD
 * face, BELOW the gauge-row lights — moved from the console top where
 * it was too hidden. Only the badge's ~11×7.5cm plane receives pointer
 * events, so OrbitControls drag still works everywhere else.
 *
 * Period: 1982. 7-segment red LEDs existed; analog pressure gauges
 * always fit; gray painted-steel panels are period-correct.
 */

import { useRef, useState } from 'react'
import { Text } from '@react-three/drei'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'

const FLOOR_Y = 0.5
const CABIN_FRONT_Z = -10

const PANEL_GRAY = '#6a7278'       // cool gray painted steel
const PANEL_GRAY_DARK = '#4a5258'  // shadow / recessed areas
const PANEL_EDGE = '#9aa2a8'       // lighter catchlight on top edges
const DIAL_FACE = '#f0e8d8'        // cream dial face
const DIAL_NUM = '#1a1410'         // black numerals
const NEEDLE_RED = '#c82020'
const LED_RED = '#ff2030'          // bright 7-segment red
const LED_BG = '#1a0808'           // dark LED bezel interior
const BRASS = '#c8a468'
const WHEEL_DARK = '#1a1a18'
const WHEEL_METAL = '#4a4a4a'
const KNOB_DARK = '#1a1410'

export function DriverCab() {
  const consoleZ = CABIN_FRONT_Z + 0.3   // slightly more forward
  const driverX = 0

  // Console dims (wider + slightly deeper than before — matches reference)
  const panelW = 1.25
  const panelH = 1.0
  const panelD = 0.42

  // Sloped dashboard face (tilted 28° back toward driver, matches reference)
  const dashTilt = -Math.PI / 6.5
  const dashY = FLOOR_Y + 0.92
  const dashZ = consoleZ + panelD / 2 + 0.02

  return (
    <group>
      {/* ── MAIN GRAY-STEEL ENCLOSURE ───────────────────────────── */}
      {/* Body */}
      <mesh position={[driverX, FLOOR_Y + panelH / 2, consoleZ]} castShadow>
        <boxGeometry args={[panelW, panelH, panelD]} />
        <meshStandardMaterial color={PANEL_GRAY} roughness={0.55} metalness={0.35} />
      </mesh>
      {/* Dark side panel inserts (left + right flanks) for metal-seam detail */}
      {[-1, 1].map((side) => (
        <mesh
          key={`flank-${side}`}
          position={[driverX + side * (panelW / 2 + 0.001), FLOOR_Y + panelH / 2, consoleZ]}
        >
          <boxGeometry args={[0.004, panelH - 0.08, panelD - 0.04]} />
          <meshStandardMaterial color={PANEL_GRAY_DARK} roughness={0.7} />
        </mesh>
      ))}
      {/* Top highlight strip (catchlight) */}
      <mesh position={[driverX, FLOOR_Y + panelH + 0.005, consoleZ]}>
        <boxGeometry args={[panelW + 0.02, 0.01, panelD + 0.02]} />
        <meshStandardMaterial color={PANEL_EDGE} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Console top surface — flat workspace */}
      <mesh position={[driverX, FLOOR_Y + panelH + 0.015, consoleZ]}>
        <boxGeometry args={[panelW + 0.03, 0.02, panelD + 0.03]} />
        <meshStandardMaterial color={PANEL_GRAY_DARK} roughness={0.55} metalness={0.35} />
      </mesh>

      {/* ── SLOPED DASHBOARD FACE ───────────────────────────────── */}
      <mesh position={[driverX, dashY, dashZ]} rotation={[dashTilt, 0, 0]}>
        <boxGeometry args={[panelW - 0.06, 0.4, 0.02]} />
        <meshStandardMaterial color={PANEL_GRAY_DARK} roughness={0.55} metalness={0.35} />
      </mesh>
      {/* Thin brass trim along the top edge of the dashboard face */}
      <mesh
        position={[driverX, dashY + 0.195 * Math.cos(dashTilt), dashZ + 0.195 * Math.sin(-dashTilt)]}
        rotation={[dashTilt, 0, 0]}
      >
        <boxGeometry args={[panelW - 0.06, 0.01, 0.025]} />
        <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
      </mesh>

      {/* ── LEFT CLUSTER: toggles + alarm + small LED ─────────── */}
      <LeftSwitchCluster
        position={[driverX - 0.4, dashY, dashZ]}
        rotation={[dashTilt, 0, 0]}
      />

      {/* ── CENTER: large analog dial ──────────────────────────── */}
      <AnalogDial
        position={[driverX - 0.05, dashY + 0.05, dashZ + 0.001]}
        rotation={[dashTilt, 0, 0]}
      />

      {/* ── RIGHT: red LED route display ───────────────────────── */}
      <RedLedRouteDisplay
        position={[driverX + 0.33, dashY + 0.05, dashZ + 0.001]}
        rotation={[dashTilt, 0, 0]}
      />

      {/* ── GAUGE WARNING LIGHTS — row along top edge of dashboard */}
      {[-0.42, -0.29, -0.16, 0.16, 0.29, 0.42].map((xOff, i) => {
        const topEdgeY = dashY + 0.17 * Math.cos(dashTilt)
        const topEdgeZ = dashZ + 0.17 * Math.sin(-dashTilt)
        // Reduced red load — only one red warning (centre-left). Rest are
        // amber / green / blue / amber / amber.
        const colors = ['#c8a048', '#c88020', '#3a8848', '#5a8ac8', '#c88020', '#c8a048']
        return (
          <group
            key={`warn-${i}`}
            position={[driverX + xOff, topEdgeY, topEdgeZ]}
            rotation={[dashTilt, 0, 0]}
          >
            {/* Dark bezel */}
            <mesh position={[0, 0, 0.002]}>
              <circleGeometry args={[0.018, 14]} />
              <meshStandardMaterial color="#0a0606" />
            </mesh>
            {/* Light lens */}
            <mesh position={[0, 0, 0.005]}>
              <circleGeometry args={[0.012, 10]} />
              <meshBasicMaterial color={colors[i]} />
            </mesh>
            {/* Emissive halo */}
            <mesh position={[0, 0, 0.004]}>
              <ringGeometry args={[0.012, 0.02, 10]} />
              <meshBasicMaterial color={colors[i]} transparent opacity={0.35} />
            </mesh>
          </group>
        )
      })}

      {/* ── CONTACT BADGE — positioned BELOW the "88 WHITTY" LED route
            display per user request. x=+0.33 matches the LED display's
            x offset; y offset of -0.16 in local dashboard space drops
            the badge below the display; z=+0.08 lifts it proud of the
            dashboard face along the surface normal. */}
      <group position={[driverX, dashY, dashZ]} rotation={[dashTilt, 0, 0]}>
        <group position={[0.33, -0.16, 0]}>
          <DriverBadge
            position={[0, 0, 0.08]}
            rotation={[0, 0, 0]}
          />
        </group>
      </group>

      {/* ── STEERING WHEEL — moved to RIGHT side per reference ── */}
      <SteeringWheel
        position={[driverX + 0.36, FLOOR_Y + panelH + 0.05, consoleZ + 0.08]}
      />

      {/* ── CHUNKY GEAR LEVER — LEFT-FRONT of console ─────────── */}
      <GearLever
        position={[driverX - 0.38, FLOOR_Y + panelH + 0.025, consoleZ + 0.06]}
      />

      {/* ── SECONDARY SMALL LEVER — right of wheel ─────────────── */}
      <group position={[driverX + 0.48, FLOOR_Y + panelH + 0.03, consoleZ - 0.02]}>
        <mesh>
          <cylinderGeometry args={[0.013, 0.013, 0.3, 8]} />
          <meshStandardMaterial color={WHEEL_DARK} metalness={0.5} />
        </mesh>
        {/* Brass knob (was crimson — too much red overall) */}
        <mesh position={[0, 0.16, 0]}>
          <sphereGeometry args={[0.028, 10, 10]} />
          <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.35} />
        </mesh>
      </group>

      {/* ── DING-DING BELL PEDAL on floor ─────────────────────── */}
      <mesh position={[driverX - 0.3, FLOOR_Y + 0.03, consoleZ]}>
        <cylinderGeometry args={[0.065, 0.075, 0.04, 12]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[driverX - 0.3, FLOOR_Y + 0.051, consoleZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.058, 12]} />
        <meshStandardMaterial color="#1a1410" />
      </mesh>

      {/* ── OVERHEAD GRAB RAIL — driver handhold ──────────────── */}
      <mesh position={[driverX, FLOOR_Y + 2.3, consoleZ + 0.2]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.022, 0.022, 0.7, 10]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[driverX - 0.3, FLOOR_Y + 2.45, consoleZ + 0.2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.3, 6]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[driverX + 0.3, FLOOR_Y + 2.45, consoleZ + 0.2]}>
        <cylinderGeometry args={[0.014, 0.014, 0.3, 6]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Left switch / alarm / small-LED cluster
   ═══════════════════════════════════════════════════════════════════ */
function LeftSwitchCluster({
  position,
  rotation,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Recessed cluster background — slightly darker plate */}
      <mesh position={[0, 0, 0.002]}>
        <planeGeometry args={[0.22, 0.32]} />
        <meshStandardMaterial color={PANEL_GRAY_DARK} roughness={0.65} metalness={0.3} />
      </mesh>
      {/* Brass bezel frame around the cluster */}
      <mesh position={[0, 0, 0.003]}>
        <ringGeometry args={[0.145, 0.158, 4]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* 5 toggle switches arranged 2-3 vertical */}
      {[
        [-0.06, 0.105],
        [0.06, 0.105],
        [-0.06, 0.02],
        [0.06, 0.02],
        [0, -0.06],
      ].map(([x, y], i) => (
        <group key={`tog-${i}`} position={[x, y, 0.006]}>
          {/* Base plate */}
          <mesh>
            <boxGeometry args={[0.036, 0.036, 0.006]} />
            <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.5} />
          </mesh>
          {/* Toggle stem — tilted slightly for visual interest */}
          <mesh position={[0, 0.01, 0.014]} rotation={[i % 2 === 0 ? 0.25 : -0.2, 0, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.028, 6]} />
            <meshStandardMaterial color="#c8c8c8" metalness={0.75} roughness={0.25} />
          </mesh>
          {/* Toggle tip */}
          <mesh position={[0, 0.02 + (i % 2 === 0 ? 0.005 : -0.004), 0.025]}>
            <sphereGeometry args={[0.007, 8, 6]} />
            <meshStandardMaterial color="#f4f4f4" metalness={0.7} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* Small 4-digit red LED readout — bottom-right of cluster */}
      <group position={[0.04, -0.12, 0.005]}>
        <mesh>
          <boxGeometry args={[0.1, 0.03, 0.006]} />
          <meshStandardMaterial color={LED_BG} roughness={0.3} metalness={0.1} />
        </mesh>
        <Text
          position={[0, 0, 0.005]}
          fontSize={0.022}
          color={LED_RED}
          anchorX="center"
          anchorY="middle"
          fontWeight="bold"
        >
          0123
        </Text>
      </group>

      {/* Amber emergency button — bottom-left of cluster (was red, but
          the panel already has the red dial needle and the red-tinted
          LED display, so swapping this to amber tones down total red
          load and still reads as "industrial emergency button"). */}
      <group position={[-0.065, -0.12, 0.007]}>
        {/* Dark base ring */}
        <mesh>
          <ringGeometry args={[0.018, 0.026, 16]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.6} />
        </mesh>
        {/* Amber button cap */}
        <mesh position={[0, 0, 0.004]}>
          <circleGeometry args={[0.018, 16]} />
          <meshBasicMaterial color="#e89020" />
        </mesh>
        {/* Subtle highlight dot */}
        <mesh position={[-0.005, 0.005, 0.005]}>
          <circleGeometry args={[0.005, 10]} />
          <meshBasicMaterial color="#ffc060" transparent opacity={0.6} />
        </mesh>
      </group>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Center analog dial (speedometer / air-pressure gauge)
   ═══════════════════════════════════════════════════════════════════ */
function AnalogDial({
  position,
  rotation,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
}) {
  const r = 0.11

  return (
    <group position={position} rotation={rotation}>
      {/* Brass bezel ring */}
      <mesh position={[0, 0, 0.001]}>
        <ringGeometry args={[r - 0.004, r + 0.012, 32]} />
        <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
      </mesh>
      {/* Cream dial face */}
      <mesh position={[0, 0, 0.002]}>
        <circleGeometry args={[r - 0.004, 32]} />
        <meshStandardMaterial color={DIAL_FACE} roughness={0.7} metalness={0.1} />
      </mesh>
      {/* Glass highlight (subtle) */}
      <mesh position={[0, 0.03, 0.004]}>
        <circleGeometry args={[r - 0.02, 24]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.08} roughness={0.1} />
      </mesh>

      {/* 11 tick marks around the perimeter (0..10 semicircle) */}
      {Array.from({ length: 11 }, (_, i) => {
        const angle = Math.PI + (i / 10) * Math.PI  // 180° → 360° = bottom arc
        const isMajor = i % 2 === 0
        const outerR = r - 0.01
        const innerR = isMajor ? r - 0.03 : r - 0.022
        const x = Math.cos(angle) * ((outerR + innerR) / 2)
        const y = Math.sin(angle) * ((outerR + innerR) / 2)
        return (
          <mesh
            key={`tick-${i}`}
            position={[x, y, 0.004]}
            rotation={[0, 0, angle - Math.PI / 2]}
          >
            <planeGeometry args={[0.002, outerR - innerR]} />
            <meshStandardMaterial color={DIAL_NUM} roughness={0.8} />
          </mesh>
        )
      })}

      {/* Numerals at major ticks: 0, 20, 40, 60, 80, 100 km/h */}
      {[0, 20, 40, 60, 80, 100].map((num, i) => {
        const angle = Math.PI + (i / 5) * Math.PI
        const labelR = r - 0.042
        const x = Math.cos(angle) * labelR
        const y = Math.sin(angle) * labelR
        return (
          <Text
            key={`num-${i}`}
            position={[x, y, 0.005]}
            fontSize={0.016}
            color={DIAL_NUM}
            anchorX="center"
            anchorY="middle"
            fontWeight="bold"
          >
            {num}
          </Text>
        )
      })}

      {/* "km/h" label centered below hub */}
      <Text position={[0, -0.04, 0.005]} fontSize={0.011} color={DIAL_NUM} anchorX="center" anchorY="middle">
        km/h
      </Text>

      {/* Red needle — points to "40" (angle = π + 0.4π = 1.4π) */}
      <group position={[0, 0, 0.006]} rotation={[0, 0, Math.PI * 0.4 - Math.PI / 2]}>
        <mesh position={[0, 0.04, 0]}>
          <planeGeometry args={[0.005, 0.08]} />
          <meshBasicMaterial color={NEEDLE_RED} />
        </mesh>
        {/* Counter-weight tail */}
        <mesh position={[0, -0.015, 0]}>
          <planeGeometry args={[0.008, 0.03]} />
          <meshBasicMaterial color={NEEDLE_RED} />
        </mesh>
      </group>

      {/* Center hub cap — brass dome */}
      <mesh position={[0, 0, 0.007]}>
        <sphereGeometry args={[0.01, 10, 8]} />
        <meshStandardMaterial color={BRASS} metalness={0.8} roughness={0.25} />
      </mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Right red-LED route display — 7-segment style panel
   ═══════════════════════════════════════════════════════════════════ */
function RedLedRouteDisplay({
  position,
  rotation,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
}) {
  return (
    <group position={position} rotation={rotation}>
      {/* Dark recessed bezel */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[0.22, 0.14]} />
        <meshStandardMaterial color="#1a1410" roughness={0.7} />
      </mesh>
      {/* Brass frame */}
      <mesh position={[0, 0, 0.0015]}>
        <ringGeometry args={[0.11, 0.115, 4]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Inner LED face */}
      <mesh position={[0, 0, 0.003]}>
        <planeGeometry args={[0.205, 0.125]} />
        <meshStandardMaterial color={LED_BG} roughness={0.25} metalness={0.2} />
      </mesh>
      {/* Route number — white 7-segment style (was red; user asked to whiten) */}
      <Text
        position={[-0.065, 0.025, 0.005]}
        fontSize={0.048}
        color="#f0e8d8"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        88
      </Text>
      {/* Dot separator */}
      <Text
        position={[-0.025, 0.025, 0.005]}
        fontSize={0.048}
        color="#f0e8d8"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        ·
      </Text>
      {/* Destination short code */}
      <Text
        position={[0.035, 0.025, 0.005]}
        fontSize={0.03}
        color="#f0e8d8"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.08}
      >
        WHITTY
      </Text>
      {/* Smaller stop counter — white (was red; too much red overall) */}
      <Text
        position={[0, -0.04, 0.005]}
        fontSize={0.018}
        color="#f0e8d8"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.1}
      >
        STOP 05/12
      </Text>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Steering wheel — 3-spoke black with metal rim
   ═══════════════════════════════════════════════════════════════════ */
function SteeringWheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Column — thick vertical cylinder up from dashboard */}
      <mesh position={[0, -0.18, 0]}>
        <cylinderGeometry args={[0.025, 0.032, 0.3, 12]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Main rim — tilted forward slightly toward driver */}
      <group rotation={[Math.PI / 2.2, 0, 0]}>
        <mesh>
          <torusGeometry args={[0.19, 0.022, 10, 24]} />
          <meshStandardMaterial color={WHEEL_DARK} roughness={0.5} metalness={0.5} />
        </mesh>
        {/* Three spokes */}
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => (
          <mesh
            key={`sp-${i}`}
            position={[Math.cos(angle) * 0.09, 0, Math.sin(angle) * 0.09]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[0.16, 0.018, 0.026]} />
            <meshStandardMaterial color={WHEEL_METAL} metalness={0.55} roughness={0.45} />
          </mesh>
        ))}
        {/* Center hub */}
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 0.03, 16]} />
          <meshStandardMaterial color={WHEEL_DARK} metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Horn / logo center — brass disc */}
        <mesh position={[0, 0.018, 0]}>
          <cylinderGeometry args={[0.028, 0.028, 0.008, 14]} />
          <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Chunky gear lever with ergonomic knob
   ═══════════════════════════════════════════════════════════════════ */
function GearLever({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Gear gate — painted metal mounting plate */}
      <mesh position={[0, -0.005, 0]}>
        <boxGeometry args={[0.14, 0.012, 0.18]} />
        <meshStandardMaterial color={PANEL_GRAY_DARK} metalness={0.45} roughness={0.55} />
      </mesh>
      {/* Gate slot (dark) */}
      <mesh position={[0, 0.001, 0]}>
        <boxGeometry args={[0.04, 0.004, 0.14]} />
        <meshStandardMaterial color="#0a0606" roughness={0.9} />
      </mesh>
      {/* Shaft — tilted slightly forward */}
      <mesh position={[0, 0.08, 0.01]} rotation={[0.08, 0, 0]}>
        <cylinderGeometry args={[0.014, 0.018, 0.17, 10]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.45} />
      </mesh>
      {/* Shaft brass collar near base */}
      <mesh position={[0, 0.012, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.014, 12]} />
        <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
      </mesh>
      {/* Ergonomic knob — teardrop black with subtle highlight */}
      <group position={[0, 0.172, 0.025]}>
        <mesh>
          <sphereGeometry args={[0.038, 14, 12]} />
          <meshStandardMaterial color={KNOB_DARK} roughness={0.4} metalness={0.2} />
        </mesh>
        {/* Top highlight to suggest glossy plastic */}
        <mesh position={[0.014, 0.02, 0.01]} scale={[0.7, 0.5, 0.5]}>
          <sphereGeometry args={[0.03, 10, 8]} />
          <meshStandardMaterial color="#4a4a4a" transparent opacity={0.35} roughness={0.2} />
        </mesh>
        {/* Tiny brass plaque on side */}
        <mesh position={[0, -0.01, 0.035]}>
          <planeGeometry args={[0.028, 0.012]} />
          <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Clickable brass contact badge — now on sloped dashboard
   ═══════════════════════════════════════════════════════════════════ */
function DriverBadge({
  position,
  rotation,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
}) {
  const setShowDriverCard = useStore((s) => s.setShowDriverCard)
  const [hovered, setHovered] = useState(false)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)

  // Always-on breathing pulse so touch users (no hover) still notice the
  // badge. Hover boosts above the pulse peak on desktop.
  useFrame((state) => {
    if (!materialRef.current) return
    const t = state.clock.elapsedTime
    const pulse = 0.32 + 0.22 * Math.sin(t * 2.2)
    materialRef.current.emissiveIntensity = hovered ? 0.85 : pulse
  })

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
    <group position={position} rotation={rotation}>
      {/* Small elegant brass plaque — restored to original clean look.
          Positioning is handled by the outer nested-transform groups in
          DriverCab (the sign-error trap from earlier attempts is gone). */}
      <mesh
        onPointerOver={handleEnter}
        onPointerOut={handleLeave}
        onClick={handleClick}
      >
        <planeGeometry args={[0.12, 0.08]} />
        <meshStandardMaterial
          ref={materialRef}
          color={BRASS}
          metalness={0.75}
          roughness={hovered ? 0.22 : 0.3}
          emissive={BRASS}
          emissiveIntensity={0.3}
        />
      </mesh>
      {/* Engraved envelope glyph */}
      <Text
        position={[0, 0.008, 0.001]}
        fontSize={0.05}
        color="#1a1410"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        ✉
      </Text>
      {/* Tiny caption */}
      <Text
        position={[0, -0.025, 0.001]}
        fontSize={0.012}
        color="#1a1410"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.22}
      >
        司機 DRIVER
      </Text>
    </group>
  )
}
