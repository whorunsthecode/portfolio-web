/**
 * Santa + reindeer easter egg.
 *
 * Hidden inside the SnowGlobe: Santa on his sleigh, drawn by 4
 * reindeer, flying in a slow orbit around the village image in the
 * upper third of the globe. At default camera distance the silhouette
 * reads as "tiny speck against the snow" — it only becomes obvious
 * when the user zooms into the globe, rewarding attention.
 *
 * Style: low-poly primitives matching the rest of the SnowGlobe
 * (tiny trees, snowflakes). Low enough pixel-count that it stays
 * charming rather than trying to be photorealistic.
 *
 * Composed to be rendered INSIDE the SnowGlobe's rotating group so
 * it shares the globe's rotation + position.
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const SANTA_RED = '#c82020'
const SANTA_RED_DARK = '#8a1818'
const SANTA_TRIM = '#f8f4e8'
const SANTA_BELT = '#1a1208'
const SANTA_SKIN = '#f4d4a8'
const REINDEER_BROWN = '#6a4228'
const REINDEER_BELLY = '#8a6848'
const ANTLER = '#4a3020'
const SLEIGH_WOOD = '#8a3818'
const SLEIGH_GOLD = '#d4a848'
const RUDOLF_NOSE = '#ff3030'
const REIN = '#3a2818'

// Santa orbits in the OUTDOOR space east of the post-office window.
// Window centre is at x=4.95, y=2.2 with a 1.9m-tall opening (top edge
// at y≈3.15). Santa flies a slow loop past +X of the window so he's
// framed by the pane. Y dropped from 3.5 → 2.4 because the old height
// put him just above the window's top edge — he was invisible from
// inside the room. Loop takes ~28s.
const ORBIT_CX = 8.5
const ORBIT_CZ = -1
const ORBIT_RX = 2.2
const ORBIT_RZ = 4.0
const ORBIT_Y = 2.4
const ORBIT_SPEED = 0.22 // radians/sec — slow, dreamy

export function SantaSleigh() {
  const groupRef = useRef<THREE.Group>(null)
  const bobRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    const angle = t * ORBIT_SPEED
    // Elliptical orbit — wider in Z than X so the sleigh tracks past the
    // window (at x=4.95) from left to right then disappears behind the
    // wall, looping back around.
    const x = ORBIT_CX + Math.cos(angle) * ORBIT_RX
    const z = ORBIT_CZ + Math.sin(angle) * ORBIT_RZ
    groupRef.current.position.set(x, ORBIT_Y, z)
    // Face tangent to the orbit — reindeer point the way they're flying
    groupRef.current.rotation.y = -angle + Math.PI / 2

    // Subtle vertical bob + slight banking
    if (bobRef.current) {
      bobRef.current.position.y = Math.sin(t * 1.7) * 0.06
      bobRef.current.rotation.z = Math.sin(t * 0.9) * 0.08
    }
  })

  return (
    <group ref={groupRef}>
      {/* Scaled larger now that he's in full-scale world space instead
          of inside a 0.9m snow globe — 0.5 reads well through the window */}
      <group ref={bobRef} scale={[0.5, 0.5, 0.5]}>
        {/* ── Reindeer team — 4 reindeer in 2×2 formation ahead of sleigh ── */}
        {/* Lead pair (Rudolf + partner) — closest to the sleigh's front */}
        <Reindeer position={[-0.12, 0, 0.6]} isRudolf />
        <Reindeer position={[0.12, 0, 0.6]} />
        {/* Front pair — further out in front */}
        <Reindeer position={[-0.14, 0.05, 1.15]} />
        <Reindeer position={[0.14, 0.05, 1.15]} />

        {/* Reins — four thin dark lines from sleigh front to each reindeer */}
        {[
          [-0.12, 0.6],
          [0.12, 0.6],
          [-0.14, 1.15],
          [0.14, 1.15],
        ].map(([rx, rz], i) => {
          const sx = 0        // sleigh attach x
          const sz = 0.2      // sleigh attach z (front of sleigh)
          const dx = rx - sx
          const dz = rz - sz
          const len = Math.sqrt(dx * dx + dz * dz)
          const midX = (sx + rx) / 2
          const midZ = (sz + rz) / 2
          const angle = Math.atan2(dz, dx)
          return (
            <mesh
              key={`rein-${i}`}
              position={[midX, 0.14, midZ]}
              rotation={[0, -angle, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.006, 0.006, len, 6]} />
              <meshStandardMaterial color={REIN} roughness={0.9} />
            </mesh>
          )
        })}

        {/* ── SLEIGH ──────────────────────────────────────────────── */}
        {/* Main sleigh body */}
        <group position={[0, 0, -0.05]}>
          {/* Sleigh base — curved wooden bench */}
          <mesh position={[0, 0.05, 0]}>
            <boxGeometry args={[0.32, 0.16, 0.42]} />
            <meshStandardMaterial color={SLEIGH_WOOD} roughness={0.65} />
          </mesh>
          {/* Curled-up front — signature "S" curl */}
          <mesh position={[0, 0.16, 0.24]} rotation={[0.5, 0, 0]}>
            <boxGeometry args={[0.3, 0.15, 0.14]} />
            <meshStandardMaterial color={SLEIGH_WOOD} roughness={0.65} />
          </mesh>
          <mesh position={[0, 0.28, 0.33]} rotation={[1.3, 0, 0]}>
            <boxGeometry args={[0.28, 0.1, 0.12]} />
            <meshStandardMaterial color={SLEIGH_WOOD} roughness={0.65} />
          </mesh>
          {/* Back panel */}
          <mesh position={[0, 0.22, -0.18]}>
            <boxGeometry args={[0.32, 0.32, 0.06]} />
            <meshStandardMaterial color={SLEIGH_WOOD} roughness={0.65} />
          </mesh>
          {/* Gold trim along bench side */}
          {[-1, 1].map((side) => (
            <mesh key={`trim-${side}`} position={[side * 0.16, 0.14, 0]}>
              <boxGeometry args={[0.01, 0.015, 0.42]} />
              <meshStandardMaterial color={SLEIGH_GOLD} metalness={0.75} roughness={0.3} />
            </mesh>
          ))}
          {/* Runners (the ski blades underneath) */}
          {[-1, 1].map((side) => (
            <group key={`runner-${side}`}>
              <mesh position={[side * 0.14, -0.04, 0]}>
                <boxGeometry args={[0.02, 0.03, 0.52]} />
                <meshStandardMaterial color={SLEIGH_GOLD} metalness={0.7} roughness={0.4} />
              </mesh>
              {/* Runner front curl up */}
              <mesh position={[side * 0.14, 0.0, 0.3]} rotation={[0.6, 0, 0]}>
                <boxGeometry args={[0.02, 0.03, 0.14]} />
                <meshStandardMaterial color={SLEIGH_GOLD} metalness={0.7} roughness={0.4} />
              </mesh>
            </group>
          ))}
          {/* Gift sack at the back of the sleigh — red with white ribbon */}
          <group position={[0, 0.3, -0.12]}>
            <mesh>
              <sphereGeometry args={[0.13, 12, 10]} />
              <meshStandardMaterial color={SANTA_RED_DARK} roughness={0.85} />
            </mesh>
            {/* Sack tie ribbon */}
            <mesh position={[0, 0.1, 0]}>
              <torusGeometry args={[0.08, 0.012, 6, 14]} />
              <meshStandardMaterial color={SANTA_TRIM} roughness={0.7} />
            </mesh>
            {/* Tiny present peeking out — green */}
            <mesh position={[0.05, 0.1, 0.05]}>
              <boxGeometry args={[0.05, 0.05, 0.05]} />
              <meshStandardMaterial color="#2a7a3a" roughness={0.8} />
            </mesh>
          </group>
        </group>

        {/* ── SANTA ───────────────────────────────────────────────── */}
        <group position={[0, 0.22, -0.04]}>
          {/* Body — red coat */}
          <mesh>
            <boxGeometry args={[0.18, 0.22, 0.16]} />
            <meshStandardMaterial color={SANTA_RED} roughness={0.8} />
          </mesh>
          {/* White coat trim — bottom hem */}
          <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.2, 0.04, 0.18]} />
            <meshStandardMaterial color={SANTA_TRIM} roughness={0.8} />
          </mesh>
          {/* Black belt */}
          <mesh position={[0, -0.01, 0.0]}>
            <boxGeometry args={[0.19, 0.04, 0.17]} />
            <meshStandardMaterial color={SANTA_BELT} roughness={0.7} />
          </mesh>
          {/* Gold belt buckle */}
          <mesh position={[0, -0.01, 0.087]}>
            <boxGeometry args={[0.045, 0.035, 0.01]} />
            <meshStandardMaterial color={SLEIGH_GOLD} metalness={0.8} roughness={0.3} />
          </mesh>
          {/* Head — skin */}
          <mesh position={[0, 0.17, 0]}>
            <sphereGeometry args={[0.09, 12, 10]} />
            <meshStandardMaterial color={SANTA_SKIN} roughness={0.85} />
          </mesh>
          {/* Beard — white, covers lower face */}
          <mesh position={[0, 0.12, 0.025]}>
            <sphereGeometry args={[0.085, 12, 10]} />
            <meshStandardMaterial color={SANTA_TRIM} roughness={0.9} />
          </mesh>
          {/* Hat — red cone */}
          <mesh position={[0, 0.26, 0]} rotation={[0, 0, -0.15]}>
            <coneGeometry args={[0.08, 0.16, 10]} />
            <meshStandardMaterial color={SANTA_RED} roughness={0.8} />
          </mesh>
          {/* Hat brim fluff */}
          <mesh position={[0, 0.19, 0]}>
            <cylinderGeometry args={[0.085, 0.085, 0.035, 12]} />
            <meshStandardMaterial color={SANTA_TRIM} roughness={0.9} />
          </mesh>
          {/* Hat pom-pom */}
          <mesh position={[0.018, 0.34, 0]}>
            <sphereGeometry args={[0.03, 10, 8]} />
            <meshStandardMaterial color={SANTA_TRIM} roughness={0.9} />
          </mesh>
          {/* Arms — two red cylinders reaching forward holding reins */}
          {[-1, 1].map((side) => (
            <group key={`arm-${side}`} position={[side * 0.09, 0.03, 0.08]}>
              <mesh rotation={[0.8, 0, side * 0.1]}>
                <cylinderGeometry args={[0.03, 0.028, 0.16, 8]} />
                <meshStandardMaterial color={SANTA_RED} roughness={0.8} />
              </mesh>
              {/* White cuff */}
              <mesh position={[0, -0.09, 0.06]}>
                <cylinderGeometry args={[0.032, 0.032, 0.02, 8]} />
                <meshStandardMaterial color={SANTA_TRIM} roughness={0.85} />
              </mesh>
              {/* Gloved hand */}
              <mesh position={[0, -0.1, 0.07]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color={SANTA_BELT} roughness={0.8} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Single reindeer — tan body, antlers, legs, tail. Rudolf has a red nose.
   ═══════════════════════════════════════════════════════════════════ */
function Reindeer({
  position,
  isRudolf = false,
}: {
  position: [number, number, number]
  isRudolf?: boolean
}) {
  const legRef = useRef<THREE.Group>(null)

  // Trotting leg animation — subtle front/back swing
  useFrame(({ clock }) => {
    if (!legRef.current) return
    const t = clock.elapsedTime
    legRef.current.rotation.x = Math.sin(t * 4) * 0.3
  })

  return (
    <group position={position}>
      {/* Body */}
      <mesh position={[0, 0.13, 0]}>
        <boxGeometry args={[0.08, 0.1, 0.22]} />
        <meshStandardMaterial color={REINDEER_BROWN} roughness={0.8} />
      </mesh>
      {/* Belly lighter patch */}
      <mesh position={[0, 0.085, 0]}>
        <boxGeometry args={[0.07, 0.05, 0.2]} />
        <meshStandardMaterial color={REINDEER_BELLY} roughness={0.85} />
      </mesh>
      {/* Neck — angled up toward head */}
      <mesh position={[0, 0.18, 0.14]} rotation={[-0.4, 0, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.1, 8]} />
        <meshStandardMaterial color={REINDEER_BROWN} roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 0.23, 0.18]}>
        <boxGeometry args={[0.06, 0.06, 0.08]} />
        <meshStandardMaterial color={REINDEER_BROWN} roughness={0.8} />
      </mesh>
      {/* Snout — lighter, slightly forward */}
      <mesh position={[0, 0.215, 0.22]}>
        <boxGeometry args={[0.04, 0.035, 0.04]} />
        <meshStandardMaterial color={REINDEER_BELLY} roughness={0.8} />
      </mesh>
      {/* Rudolf's red nose */}
      {isRudolf && (
        <>
          <mesh position={[0, 0.22, 0.245]}>
            <sphereGeometry args={[0.018, 10, 8]} />
            <meshBasicMaterial color={RUDOLF_NOSE} />
          </mesh>
          {/* Emissive halo around the nose */}
          <pointLight position={[0, 0.22, 0.25]} color={RUDOLF_NOSE} intensity={0.6} distance={0.3} decay={2} />
        </>
      )}
      {/* Eyes — two tiny dark dots */}
      {[-1, 1].map((side) => (
        <mesh key={`eye-${side}`} position={[side * 0.018, 0.24, 0.22]}>
          <sphereGeometry args={[0.005, 6, 6]} />
          <meshBasicMaterial color="#1a0806" />
        </mesh>
      ))}
      {/* Antlers — branching cylinders pointing up-back */}
      {[-1, 1].map((side) => (
        <group key={`antler-${side}`} position={[side * 0.025, 0.26, 0.16]}>
          {/* Main stem */}
          <mesh rotation={[-0.3, 0, side * 0.3]}>
            <cylinderGeometry args={[0.006, 0.008, 0.09, 6]} />
            <meshStandardMaterial color={ANTLER} roughness={0.9} />
          </mesh>
          {/* First branch */}
          <mesh position={[side * 0.02, 0.05, -0.015]} rotation={[-0.6, 0, side * 0.8]}>
            <cylinderGeometry args={[0.005, 0.005, 0.05, 6]} />
            <meshStandardMaterial color={ANTLER} roughness={0.9} />
          </mesh>
          {/* Second branch */}
          <mesh position={[side * 0.03, 0.03, 0.01]} rotation={[-0.2, 0, side * 1.0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.04, 6]} />
            <meshStandardMaterial color={ANTLER} roughness={0.9} />
          </mesh>
        </group>
      ))}
      {/* Tail — small white puff */}
      <mesh position={[0, 0.15, -0.11]}>
        <sphereGeometry args={[0.015, 8, 6]} />
        <meshStandardMaterial color={SANTA_TRIM} roughness={0.9} />
      </mesh>
      {/* Legs — 4 short cylinders, animated */}
      <group ref={legRef}>
        {[
          [-0.025, 0.08, 0.08],
          [0.025, 0.08, 0.08],
          [-0.025, 0.08, -0.08],
          [0.025, 0.08, -0.08],
        ].map(([lx, ly, lz], i) => (
          <mesh key={`leg-${i}`} position={[lx, ly - 0.04, lz]}>
            <cylinderGeometry args={[0.008, 0.008, 0.08, 6]} />
            <meshStandardMaterial color={REINDEER_BROWN} roughness={0.85} />
          </mesh>
        ))}
        {/* Hooves — tiny dark caps */}
        {[
          [-0.025, 0, 0.08],
          [0.025, 0, 0.08],
          [-0.025, 0, -0.08],
          [0.025, 0, -0.08],
        ].map(([lx, ly, lz], i) => (
          <mesh key={`hoof-${i}`} position={[lx, ly, lz]}>
            <boxGeometry args={[0.012, 0.012, 0.012]} />
            <meshStandardMaterial color="#1a1008" roughness={0.9} />
          </mesh>
        ))}
      </group>
    </group>
  )
}
