/**
 * Pedestrian silhouettes walking the sidewalks.
 *
 * Each pedestrian walks along a predefined Z-path on either sidewalk
 * (x=±7.25), looping from the far horizon back around. Walking anim via
 * simple leg/arm phase on a sine wave — reads clearly from the tram
 * camera distance without expensive skeletal rigging.
 *
 * Sidewalks span z=-225 to z=+75 (300 long, centered at z=-75).
 * Pedestrians are recycled at both ends so they appear to stream past
 * continuously.
 */

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// Palette — 80s HK Central commuter demographics
const SKINS = ['#e8c8a0', '#f0d4b0', '#dfc090', '#d8b088']
const SHIRTS = [
  '#b84840', // red
  '#2a4a72', // navy
  '#6a5a88', // muted purple
  '#3a6a4a', // dark green
  '#c8a060', // tan / camel coat
  '#4a3c38', // brown
  '#7a8aa0', // dusty blue
  '#8a2432', // burgundy
  '#d8c4a0', // cream
  '#1a1a18', // black
]
const TROUSERS = ['#2a2420', '#3a3228', '#1a2030', '#2a2a28', '#4a3a30']

type PedVariant = 'walker' | 'businessman' | 'shopper'

interface Ped {
  id: number
  variant: PedVariant
  side: 1 | -1          // -1 = left sidewalk, +1 = right
  direction: 1 | -1     // +1 = walking toward camera (+Z), -1 = away (-Z)
  z: number
  speed: number         // units/sec
  xJitter: number       // random x offset within the sidewalk width
  shirtIdx: number
  skinIdx: number
  trouserIdx: number
  phase: number         // starting phase for walk animation
  hasHat: boolean
  hasBag: boolean
}

// Sidewalk goes x=±5.5 to ±9. Landmarks (SheungWanStalls, SaiYingPunShelter)
// protrude into the outer half of the sidewalk at x=±8, so we keep peds on
// the INNER HALF (closer to the curb) to avoid clipping them.
const SIDEWALK_INNER_X = 5.9   // just past curb at ±5.65
const SIDEWALK_OUTER_X = 7.1   // well clear of x=±8 landmark footprints
const SIDEWALK_CENTER_X = (SIDEWALK_INNER_X + SIDEWALK_OUTER_X) / 2  // 6.5
const SIDEWALK_HALF_WIDTH = (SIDEWALK_OUTER_X - SIDEWALK_INNER_X) / 2  // 0.6
const PEDS_PER_SIDE = 12
const Z_MIN = -220
const Z_MAX = 70
const Z_RANGE = Z_MAX - Z_MIN

// World scroll speed — matches Landmarks.tsx SCROLL_SPEED so peds move
// past the camera at the same rate as buildings, instead of floating
// relative to the scene.
const WORLD_SCROLL_SPEED = 4

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function pickVariant(): PedVariant {
  const r = Math.random()
  if (r < 0.4) return 'businessman'
  if (r < 0.75) return 'walker'
  return 'shopper'
}

function seedPed(id: number, side: 1 | -1, initialZ?: number): Ped {
  const direction: 1 | -1 = Math.random() < 0.5 ? 1 : -1
  return {
    id,
    variant: pickVariant(),
    side,
    direction,
    z: initialZ ?? rand(Z_MIN, Z_MAX),
    speed: rand(0.9, 1.6),
    xJitter: rand(-SIDEWALK_HALF_WIDTH, SIDEWALK_HALF_WIDTH),
    shirtIdx: Math.floor(Math.random() * SHIRTS.length),
    skinIdx: Math.floor(Math.random() * SKINS.length),
    trouserIdx: Math.floor(Math.random() * TROUSERS.length),
    phase: Math.random() * Math.PI * 2,
    hasHat: Math.random() < 0.25,
    hasBag: Math.random() < 0.4,
  }
}

export function Pedestrians() {
  const pedsRef = useRef<Ped[]>([])
  const groupRefs = useRef<Array<THREE.Group | null>>([])
  const legRefs = useRef<Array<Array<THREE.Group | null>>>([])
  const armRefs = useRef<Array<Array<THREE.Group | null>>>([])
  const initialized = useRef(false)

  if (!initialized.current) {
    let id = 0
    for (let i = 0; i < PEDS_PER_SIDE; i++) {
      pedsRef.current.push(seedPed(id++, -1, Z_MIN + (i / PEDS_PER_SIDE) * Z_RANGE + rand(-4, 4)))
      pedsRef.current.push(seedPed(id++,  1, Z_MIN + (i / PEDS_PER_SIDE) * Z_RANGE + rand(-4, 4)))
    }
    initialized.current = true
  }

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    for (let i = 0; i < pedsRef.current.length; i++) {
      const p = pedsRef.current[i]
      // World scrolls peds toward camera (+Z). The pedestrian's personal
      // walking speed adds/subtracts depending on which way they face.
      // direction +1 = walking toward camera, accelerating them;
      // direction -1 = walking away, slightly slower than world scroll.
      const worldZ = WORLD_SCROLL_SPEED * delta
      const personal = p.direction * p.speed * delta
      p.z += worldZ + personal * 0.3  // scaled down so walking is subtle vs scroll

      // Recycle when off the far end in either direction
      if (p.z > Z_MAX) p.z = Z_MIN + (p.z - Z_MAX)
      if (p.z < Z_MIN) p.z = Z_MAX - (Z_MIN - p.z)

      const g = groupRefs.current[i]
      if (!g) continue
      // Narrow jitter: peds stay near curb (closer to road), away from
      // x=±8 landmark footprints (stalls, shelter) that invade the sidewalk.
      const x = p.side * (SIDEWALK_CENTER_X + p.xJitter)
      g.position.set(x, 0.12, p.z)
      // Face walking direction (local +Z is forward for the group)
      g.rotation.y = p.direction === 1 ? 0 : Math.PI

      // Walk animation — leg + arm counter-swing
      const walkT = t * 3.2 + p.phase
      const legSwing = Math.sin(walkT) * 0.6
      const armSwing = -legSwing * 0.7

      const legs = legRefs.current[i]
      if (legs) {
        if (legs[0]) legs[0].rotation.x = legSwing
        if (legs[1]) legs[1].rotation.x = -legSwing
      }
      const arms = armRefs.current[i]
      if (arms) {
        if (arms[0]) arms[0].rotation.x = armSwing
        if (arms[1]) arms[1].rotation.x = -armSwing
      }

      // Subtle body bob
      g.position.y = 0.12 + Math.abs(Math.sin(walkT)) * 0.025
    }
  })

  return (
    <>
      {pedsRef.current.map((p, i) => (
        <group
          key={p.id}
          ref={(el) => {
            groupRefs.current[i] = el
          }}
        >
          <PedestrianFigure
            p={p}
            legRefCallback={(idx, el) => {
              if (!legRefs.current[i]) legRefs.current[i] = []
              legRefs.current[i][idx] = el
            }}
            armRefCallback={(idx, el) => {
              if (!armRefs.current[i]) armRefs.current[i] = []
              armRefs.current[i][idx] = el
            }}
          />
        </group>
      ))}
    </>
  )
}

function PedestrianFigure({
  p,
  legRefCallback,
  armRefCallback,
}: {
  p: Ped
  legRefCallback: (idx: number, el: THREE.Group | null) => void
  armRefCallback: (idx: number, el: THREE.Group | null) => void
}) {
  const shirt = SHIRTS[p.shirtIdx]
  const skin = SKINS[p.skinIdx]
  const trouser = TROUSERS[p.trouserIdx]

  // Businessmen tend to wear dark suits — override shirt/trouser for them
  const isBiz = p.variant === 'businessman'
  const bodyColor = isBiz ? '#1a1a20' : shirt
  const legColor = isBiz ? '#1a1a18' : trouser
  const hatColor = isBiz ? '#1a1410' : '#4a3a2a'

  return (
    <group>
      {/* Torso */}
      <mesh position={[0, 0.9, 0]}>
        <boxGeometry args={[0.28, 0.5, 0.2]} />
        <meshStandardMaterial color={bodyColor} roughness={0.85} />
      </mesh>
      {/* Shoulders taper */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[0.32, 0.08, 0.18]} />
        <meshStandardMaterial color={bodyColor} roughness={0.85} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.24, 0]}>
        <cylinderGeometry args={[0.045, 0.05, 0.06, 8]} />
        <meshStandardMaterial color={skin} roughness={0.85} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial color={skin} roughness={0.85} />
      </mesh>
      {/* Hair cap */}
      <mesh position={[0, 1.38, -0.005]}>
        <sphereGeometry args={[0.093, 12, 10, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
        <meshStandardMaterial color="#1a0f08" roughness={0.9} />
      </mesh>
      {/* Hat (some peds) */}
      {p.hasHat && (
        <group position={[0, 1.44, 0]}>
          <mesh>
            <cylinderGeometry args={[0.1, 0.105, 0.06, 12]} />
            <meshStandardMaterial color={hatColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, -0.035, 0]}>
            <cylinderGeometry args={[0.13, 0.13, 0.015, 14]} />
            <meshStandardMaterial color={hatColor} roughness={0.9} />
          </mesh>
        </group>
      )}

      {/* Arms — animated via ref */}
      <group
        ref={(el) => armRefCallback(0, el)}
        position={[-0.16, 1.1, 0]}
      >
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.44, 8]} />
          <meshStandardMaterial color={bodyColor} roughness={0.85} />
        </mesh>
      </group>
      <group
        ref={(el) => armRefCallback(1, el)}
        position={[0.16, 1.1, 0]}
      >
        <mesh position={[0, -0.2, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.44, 8]} />
          <meshStandardMaterial color={bodyColor} roughness={0.85} />
        </mesh>
        {/* Optional shopping bag on this hand */}
        {p.hasBag && (
          <mesh position={[0, -0.46, 0.08]}>
            <boxGeometry args={[0.12, 0.14, 0.06]} />
            <meshStandardMaterial
              color={p.variant === 'shopper' ? '#c82020' : '#4a3a28'}
              roughness={0.88}
            />
          </mesh>
        )}
      </group>

      {/* Legs — animated via ref */}
      <group
        ref={(el) => legRefCallback(0, el)}
        position={[-0.07, 0.65, 0]}
      >
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.05, 0.045, 0.58, 8]} />
          <meshStandardMaterial color={legColor} roughness={0.88} />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.6, 0.04]}>
          <boxGeometry args={[0.08, 0.05, 0.16]} />
          <meshStandardMaterial color="#1a1410" roughness={0.9} />
        </mesh>
      </group>
      <group
        ref={(el) => legRefCallback(1, el)}
        position={[0.07, 0.65, 0]}
      >
        <mesh position={[0, -0.28, 0]}>
          <cylinderGeometry args={[0.05, 0.045, 0.58, 8]} />
          <meshStandardMaterial color={legColor} roughness={0.88} />
        </mesh>
        <mesh position={[0, -0.6, 0.04]}>
          <boxGeometry args={[0.08, 0.05, 0.16]} />
          <meshStandardMaterial color="#1a1410" roughness={0.9} />
        </mesh>
      </group>
    </group>
  )
}

