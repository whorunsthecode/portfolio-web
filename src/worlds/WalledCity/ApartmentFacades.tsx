import { useMemo } from 'react'
import * as THREE from 'three'

// Each door in MailSlots is an apartment. This component renders the
// above-door half of that apartment's facade so the walls read as many
// distinct units stacked together rather than one continuous concrete
// corridor. For each door we paint:
//   - a faded tint wash over the wall segment (unique colour per unit)
//   - a small barred window, lit or dark
//   - a rusted air-con box bolted next to the window
//   - a horizontal bamboo laundry pole jutting into the alley with one
//     garment draped over it

interface Unit {
  side: 'left' | 'right'
  z: number         // door centre z
  paint: string     // wall-wash hue
  paintAlpha: number
  windowLit: boolean
  acBoxSide: -1 | 1 // which z-side of the door the AC box sits on
  garmentColor: string
  garmentWidth: number
  segmentCenterX?: number // 0 for entrance segment, -2 for deep segment
}

// Keep in sync with MailSlots LEFT_DOORS / RIGHT_DOORS door z-positions.
// Tuples are [z, segmentCenterX]. Default segmentCenterX is 0 (entrance).
const DOOR_LEFT: { z: number; seg?: number }[] = [
  { z: -3.4 }, { z: -1.6 }, { z: 0.2 }, { z: 2.0 }, { z: 3.7 },
  // Entrance extension
  { z: -10.5 }, { z: -13 },
  // Deep segment
  { z: -17.5, seg: -2 }, { z: -21.5, seg: -2 }, { z: -23.5, seg: -2 }, { z: -27, seg: -2 },
]
const DOOR_RIGHT: { z: number; seg?: number }[] = [
  // Skip z=-0.8 — that slot is the Salon storefront, not an apartment.
  { z: -2.6 }, { z: 1.0 }, { z: 2.8 },
  // Entrance extension
  { z: -4.5 }, { z: -7.5 }, { z: -10 }, { z: -13.5 },
  // Deep segment
  { z: -17, seg: -2 }, { z: -23, seg: -2 }, { z: -25.5, seg: -2 }, { z: -27.5, seg: -2 },
]

const PAINT_CYCLE = [
  { c: '#7a8a74', a: 0.16 }, // faded sea-green
  { c: '#8a7466', a: 0.14 }, // salmon
  { c: '#6e7a8a', a: 0.12 }, // dusty blue
  { c: '#8a7c5a', a: 0.14 }, // ochre
  { c: '#7a6a70', a: 0.10 }, // mauve
  { c: '#000000', a: 0    }, // bare concrete
]

const GARMENTS = ['#d8d0c0', '#5a6a88', '#b84030', '#d0a070', '#3a5450', '#e8d498', '#2a2a2a', '#b08840']

function buildUnits(): Unit[] {
  const out: Unit[] = []
  DOOR_LEFT.forEach((d, i) => {
    const p = PAINT_CYCLE[i % PAINT_CYCLE.length]
    out.push({
      side: 'left',
      z: d.z,
      segmentCenterX: d.seg,
      paint: p.c,
      paintAlpha: p.a,
      windowLit: i % 2 === 0,
      acBoxSide: i % 2 === 0 ? 1 : -1,
      garmentColor: GARMENTS[i % GARMENTS.length],
      garmentWidth: 0.28 + (i % 3) * 0.04,
    })
  })
  DOOR_RIGHT.forEach((d, i) => {
    const p = PAINT_CYCLE[(i + 2) % PAINT_CYCLE.length]
    out.push({
      side: 'right',
      z: d.z,
      segmentCenterX: d.seg,
      paint: p.c,
      paintAlpha: p.a,
      windowLit: i % 2 === 1,
      acBoxSide: i % 2 === 0 ? -1 : 1,
      garmentColor: GARMENTS[(i + 3) % GARMENTS.length],
      garmentWidth: 0.24 + (i % 3) * 0.05,
    })
  })
  return out
}

function WindowWithGrille({ lit }: { lit: boolean }) {
  // Window size
  const w = 0.45
  const h = 0.45
  return (
    <group>
      {/* Window frame — metal surround */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w + 0.05, h + 0.05, 0.015]} />
        <meshStandardMaterial color={'#3a2a1c'} metalness={0.4} roughness={0.7} />
      </mesh>
      {/* Glass — lit amber if occupied, otherwise very dark reflective */}
      <mesh position={[0, 0, 0.009]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          color={lit ? '#c8a068' : '#141820'}
          emissive={lit ? '#d88840' : '#000000'}
          emissiveIntensity={lit ? 0.85 : 0}
          roughness={lit ? 0.75 : 0.3}
          metalness={lit ? 0 : 0.25}
        />
      </mesh>
      {/* Anti-theft grille — 2 horizontal + 3 vertical bars in front */}
      {[-h / 3, 0, h / 3].map((xOff, i) => (
        <mesh key={`v-${i}`} position={[xOff, 0, 0.02]}>
          <boxGeometry args={[0.015, h, 0.012]} />
          <meshStandardMaterial color={'#2a2018'} metalness={0.5} roughness={0.6} />
        </mesh>
      ))}
      {[-h / 3, h / 3].map((yOff, i) => (
        <mesh key={`h-${i}`} position={[0, yOff, 0.021]}>
          <boxGeometry args={[w, 0.015, 0.012]} />
          <meshStandardMaterial color={'#2a2018'} metalness={0.5} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function AirConBox({ flip }: { flip: number }) {
  // Boxy through-wall unit — a common 1970s/80s feature
  return (
    <group>
      {/* Housing */}
      <mesh>
        <boxGeometry args={[0.34, 0.26, 0.22]} />
        <meshStandardMaterial color={'#c8b898'} roughness={0.7} />
      </mesh>
      {/* Rust streaks along bottom — a darker thin box below */}
      <mesh position={[0, -0.14, 0.11]}>
        <boxGeometry args={[0.32, 0.02, 0.01]} />
        <meshStandardMaterial color={'#6a3a20'} roughness={0.9} />
      </mesh>
      {/* Louvres — 5 horizontal slits on the front */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[0, 0.08 - i * 0.04, 0.111]}>
          <planeGeometry args={[0.28, 0.018]} />
          <meshStandardMaterial color={'#2a2018'} roughness={0.95} />
        </mesh>
      ))}
      {/* Brand plate square on the right */}
      <mesh position={[0.08 * flip, -0.06, 0.112]}>
        <planeGeometry args={[0.06, 0.04]} />
        <meshStandardMaterial color={'#1a1410'} roughness={0.95} />
      </mesh>
      {/* Drip stain trail down from bottom */}
      <mesh position={[0, -0.4, 0.001]}>
        <planeGeometry args={[0.06, 0.45]} />
        <meshStandardMaterial color={'#3a2418'} transparent opacity={0.55} roughness={1} />
      </mesh>
    </group>
  )
}

function LaundryPole({ garmentColor, garmentWidth }: {
  garmentColor: string
  garmentWidth: number
}) {
  // Bamboo pole jutting out along +Z (into the alley, in the parent
  // UnitOverlay's local frame). Origin is at the wall; the pole extends
  // forward. One garment is draped over it, folded front-and-back.
  const poleLen = 0.65
  return (
    <group>
      {/* Pole — cylinder axis rotated to align with +Z */}
      <mesh position={[0, 0, poleLen / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, poleLen, 8]} />
        <meshStandardMaterial color={'#c89a5a'} roughness={0.8} />
      </mesh>
      {/* Mounting bracket at the wall end */}
      <mesh position={[0, -0.03, 0.025]}>
        <boxGeometry args={[0.05, 0.06, 0.04]} />
        <meshStandardMaterial color={'#3a2a1c'} metalness={0.4} roughness={0.7} />
      </mesh>
      {/* Draped garment — two panels hinged along the pole (Z axis).
          Width runs along Z (length of pole), height hangs along Y. */}
      {[1, -1].map((panelDir) => (
        <mesh
          key={panelDir}
          position={[panelDir * 0.04, -0.24, poleLen * 0.55]}
          rotation={[0, 0, panelDir * 0.22]}
        >
          <planeGeometry args={[garmentWidth, 0.5]} />
          <meshStandardMaterial color={garmentColor} roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

function UnitOverlay({ unit }: { unit: Unit }) {
  // Wall interior face is at x = segmentCenterX ± 0.87 in local coords with
  // normal pointing toward the centre of the alley. Position the unit's
  // components slightly offset from the wall so they don't z-fight.
  const segCenter = unit.segmentCenterX ?? 0
  const wallX = segCenter + (unit.side === 'left' ? -0.87 : 0.87)
  const faceY = unit.side === 'left' ? Math.PI / 2 : -Math.PI / 2
  const UNIT_WIDTH = 1.3   // along z — paint wash width

  return (
    <group position={[wallX, 0, unit.z]} rotation={[0, faceY, 0]}>
      {/* Paint wash — tinted transparent plane covering the wall segment
          above the door. Skipped if alpha is 0 (bare concrete unit). */}
      {unit.paintAlpha > 0 && (
        <mesh position={[0, 2.9, 0.003]}>
          <planeGeometry args={[UNIT_WIDTH, 1.8]} />
          <meshStandardMaterial
            color={unit.paint}
            transparent
            opacity={unit.paintAlpha}
            roughness={1}
            depthWrite={false}
          />
        </mesh>
      )}
      {/* Window — centred 0.6m above the door (door goes 0..2.1) */}
      <group position={[0, 2.75, 0.02]}>
        <WindowWithGrille lit={unit.windowLit} />
      </group>
      {/* Air-con box — on one side of the window */}
      <group position={[unit.acBoxSide * 0.45, 2.55, 0.12]}>
        <AirConBox flip={unit.acBoxSide} />
      </group>
      {/* Window sill — thin slab beneath the window */}
      <mesh position={[0, 2.48, 0.035]}>
        <boxGeometry args={[0.56, 0.035, 0.06]} />
        <meshStandardMaterial color={'#3a2a1c'} roughness={0.85} />
      </mesh>
      {/* Laundry pole — above AC box, opposite side, projecting into
          the alley along +Z in this group's local frame (group's local
          +Z already points inward after faceY rotation). */}
      <group position={[-unit.acBoxSide * 0.35, 3.15, 0.04]}>
        <LaundryPole
          garmentColor={unit.garmentColor}
          garmentWidth={unit.garmentWidth}
        />
      </group>
      {/* Small light spill from lit window onto the wall below */}
      {unit.windowLit && (
        <pointLight
          position={[0, 2.55, 0.4]}
          color={'#ffb060'}
          intensity={0.35}
          distance={2.2}
          decay={2}
        />
      )}
    </group>
  )
}

export function ApartmentFacades() {
  const units = useMemo(() => buildUnits(), [])
  return (
    <>
      {units.map((u, i) => <UnitOverlay key={i} unit={u} />)}
    </>
  )
}
