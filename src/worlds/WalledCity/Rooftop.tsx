import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// The rooftop you emerge onto after climbing the stairwell.
//   x ∈ [-6, 6], z ∈ [-25, -11], y floor = 5, open sky above.
// Filled with the signature KWC rooftop clutter: fish-bone TV antennas,
// blue plastic water tanks, clotheslines with laundry, and surrounding
// taller-KWC silhouettes so you feel hemmed in by buildings even up high.

const ROOF_Y = 5
const ROOF_X_MIN = -6
const ROOF_X_MAX = 6
const ROOF_Z_MIN = -25
// Rooftop floor extends south to z=-7 so it covers the stairwell landing
// at x=[-6,-0.9], z=[-9,-8] (top of stairs from Stairwell.tsx). The bounds
// in WalledCity/index.tsx are already at z=-7. A rectangular hole is cut
// out of the floor mesh over the stair shaft so the player can descend.
const ROOF_Z_MAX = -7

// Stair-shaft hole — the player descends through this opening on the
// rooftop. Matches Stairwell.tsx: x=[-6,-0.9], z=[-9,-8].
const STAIR_HOLE_X_MIN = -6
const STAIR_HOLE_X_MAX = -0.9
const STAIR_HOLE_Z_MIN = -9
const STAIR_HOLE_Z_MAX = -8

function useRoofTex() {
  return useMemo(() => {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!
    // Asphalt + water stains
    ctx.fillStyle = '#2e2824'
    ctx.fillRect(0, 0, size, size)
    for (let i = 0; i < 2000; i++) {
      const shade = 25 + Math.random() * 25
      ctx.fillStyle = `rgb(${shade}, ${shade - 3}, ${shade - 6})`
      ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 3, 1 + Math.random() * 3)
    }
    // Tar patches
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = 'rgba(8, 6, 4, 0.55)'
      const x = Math.random() * size
      const y = Math.random() * size
      ctx.beginPath()
      ctx.ellipse(x, y, 20 + Math.random() * 40, 14 + Math.random() * 30, Math.random() * Math.PI, 0, Math.PI * 2)
      ctx.fill()
    }
    // White mineral salt deposits
    for (let i = 0; i < 18; i++) {
      ctx.fillStyle = 'rgba(180, 170, 150, 0.4)'
      ctx.beginPath()
      ctx.arc(Math.random() * size, Math.random() * size, 5 + Math.random() * 14, 0, Math.PI * 2)
      ctx.fill()
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(3, 3)
    return tex
  }, [])
}

function SkyDome() {
  // Shader-driven sky. Uses the vertex's local position normalized as a
  // direction (zenith at y=+1, horizon at y=0, below at y=-1). Smooth
  // gradient without UV wrap artifacts or texture banding — the canvas-
  // on-sphere approach collapses the 2D UV at the poles, which is what
  // produced the "starry night" concentric rings.
  return (
    <mesh position={[0, ROOF_Y + 1.65, (ROOF_Z_MIN + ROOF_Z_MAX) / 2]}>
      <sphereGeometry args={[80, 48, 24]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        vertexShader={`
          varying float vAltitude;
          void main() {
            vAltitude = normalize(position).y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          varying float vAltitude;

          vec3 dusk(float t) {
            vec3 zenith    = vec3(0.094, 0.118, 0.227);
            vec3 upperDusk = vec3(0.165, 0.149, 0.314);
            vec3 midViolet = vec3(0.345, 0.220, 0.361);
            vec3 pinkBand  = vec3(0.659, 0.345, 0.345);
            vec3 amber     = vec3(0.847, 0.518, 0.267);
            vec3 horizon   = vec3(0.910, 0.675, 0.329);
            vec3 below     = vec3(0.314, 0.220, 0.141);
            if (t < 0.22) return mix(zenith, upperDusk, t / 0.22);
            if (t < 0.46) return mix(upperDusk, midViolet, (t - 0.22) / 0.24);
            if (t < 0.66) return mix(midViolet, pinkBand, (t - 0.46) / 0.20);
            if (t < 0.80) return mix(pinkBand, amber, (t - 0.66) / 0.14);
            if (t < 0.92) return mix(amber, horizon, (t - 0.80) / 0.12);
            return mix(horizon, below, clamp((t - 0.92) / 0.08, 0.0, 1.0));
          }

          // Cheap hash-based dither (IQ) to break any residual 8-bit banding
          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
          }

          void main() {
            float t = 1.0 - clamp(vAltitude + 0.05, 0.0, 1.0);
            if (vAltitude < -0.05) t = 1.0;
            vec3 col = dusk(t);
            col += (hash(gl_FragCoord.xy) - 0.5) * 0.008;
            gl_FragColor = vec4(col, 1.0);
          }
        `}
      />
    </mesh>
  )
}

function Parapet() {
  // 0.5m-tall wall around the rooftop edge, keeps the player visually
  // inside (FPS bounds also clamp, but the parapet sells the enclosure).
  const t = 0.15
  return (
    <group position={[0, ROOF_Y + 0.25, 0]}>
      {/* North edge (z = ROOF_Z_MIN) */}
      <mesh position={[0, 0, ROOF_Z_MIN]}>
        <boxGeometry args={[ROOF_X_MAX - ROOF_X_MIN, 0.5, t]} />
        <meshStandardMaterial color={'#3a342a'} roughness={0.9} />
      </mesh>
      {/* West edge */}
      <mesh position={[ROOF_X_MIN, 0, (ROOF_Z_MIN + ROOF_Z_MAX) / 2]}>
        <boxGeometry args={[t, 0.5, ROOF_Z_MAX - ROOF_Z_MIN]} />
        <meshStandardMaterial color={'#3a342a'} roughness={0.9} />
      </mesh>
      {/* East edge */}
      <mesh position={[ROOF_X_MAX, 0, (ROOF_Z_MIN + ROOF_Z_MAX) / 2]}>
        <boxGeometry args={[t, 0.5, ROOF_Z_MAX - ROOF_Z_MIN]} />
        <meshStandardMaterial color={'#3a342a'} roughness={0.9} />
      </mesh>
      {/* South edge — full wall (the stair shaft is INSIDE the rooftop now,
          not at the edge, so no gap is needed here) */}
      <mesh position={[0, 0, ROOF_Z_MAX]}>
        <boxGeometry args={[ROOF_X_MAX - ROOF_X_MIN, 0.5, t]} />
        <meshStandardMaterial color={'#3a342a'} roughness={0.9} />
      </mesh>
    </group>
  )
}

// Stair access gap on the north railing — at the WEST end of the hole,
// near the stair TOP (x = STAIR_HOLE_X_MIN). Player must enter through
// this gap so they only fall a small height (stair floor at the gap is
// close to ROOF_Y).
const STAIR_ENTRY_GAP_X_MAX = STAIR_HOLE_X_MIN + 0.7  // 70 cm gap

function StairOpeningRailing() {
  // 1.1m-tall railing wrapping the stair-shaft hole on the rooftop. The
  // north side is the only practical approach (south side ends at the
  // south parapet), and we leave a 70cm gap at the WEST end of that
  // north rail — that's the stair-top corner where the stair floor sits
  // at y≈5, matching the rooftop, so the player can step in without a
  // big drop. Everywhere else, the rail discourages stepping off.
  const t = 0.08
  const railH = 1.1
  const railColor = '#3a342a'
  return (
    <group position={[0, ROOF_Y + railH / 2, 0]}>
      {/* North rail — split into east section (the only blocking side
          that matters; the west 70cm is left open as the entry gap) */}
      <mesh position={[
        (STAIR_ENTRY_GAP_X_MAX + STAIR_HOLE_X_MAX) / 2,
        0,
        STAIR_HOLE_Z_MIN,
      ]}>
        <boxGeometry args={[STAIR_HOLE_X_MAX - STAIR_ENTRY_GAP_X_MAX, railH, t]} />
        <meshStandardMaterial color={railColor} roughness={0.9} />
      </mesh>
      {/* East rail (x = STAIR_HOLE_X_MAX) — caps the east end of the hole */}
      <mesh position={[
        STAIR_HOLE_X_MAX,
        0,
        (STAIR_HOLE_Z_MIN + STAIR_HOLE_Z_MAX) / 2,
      ]}>
        <boxGeometry args={[t, railH, STAIR_HOLE_Z_MAX - STAIR_HOLE_Z_MIN]} />
        <meshStandardMaterial color={railColor} roughness={0.9} />
      </mesh>
      {/* South rail — full, blocks approach from the south rooftop strip */}
      <mesh position={[
        (STAIR_HOLE_X_MIN + STAIR_HOLE_X_MAX) / 2,
        0,
        STAIR_HOLE_Z_MAX,
      ]}>
        <boxGeometry args={[STAIR_HOLE_X_MAX - STAIR_HOLE_X_MIN, railH, t]} />
        <meshStandardMaterial color={railColor} roughness={0.9} />
      </mesh>
    </group>
  )
}

function RooftopFloor({ tex }: { tex: THREE.Texture }) {
  // The rooftop floor is split into 4 rectangles around the stair-shaft
  // hole at x=[STAIR_HOLE_X_MIN, STAIR_HOLE_X_MAX], z=[STAIR_HOLE_Z_MIN,
  // STAIR_HOLE_Z_MAX]. Cutting a hole this way avoids needing
  // ShapeGeometry. The 4 strips collectively cover everything except the
  // stair shaft.
  //
  // Layout (looking down on rooftop, +X right, -Z up):
  //   ┌─────────────────────────────┐
  //   │           NORTH             │  z = ROOF_Z_MIN .. STAIR_HOLE_Z_MIN
  //   ├──────┬──────┬───────────────┤
  //   │ WEST │ HOLE │     EAST      │  z = STAIR_HOLE_Z_MIN .. STAIR_HOLE_Z_MAX
  //   ├──────┴──────┴───────────────┤
  //   │           SOUTH             │  z = STAIR_HOLE_Z_MAX .. ROOF_Z_MAX
  //   └─────────────────────────────┘
  // (West is x < STAIR_HOLE_X_MIN, but STAIR_HOLE_X_MIN == ROOF_X_MIN here
  //  so the WEST cell has zero width and we skip it.)

  const mat = (
    <meshStandardMaterial map={tex} color={'#2a2420'} roughness={0.95} />
  )
  return (
    <group>
      {/* NORTH strip — full width, from north parapet down to stair-hole north edge */}
      <mesh
        position={[
          (ROOF_X_MIN + ROOF_X_MAX) / 2,
          ROOF_Y,
          (ROOF_Z_MIN + STAIR_HOLE_Z_MIN) / 2,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[ROOF_X_MAX - ROOF_X_MIN, STAIR_HOLE_Z_MIN - ROOF_Z_MIN]} />
        {mat}
      </mesh>

      {/* EAST strip — alongside the stair shaft, between hole east edge and east parapet */}
      <mesh
        position={[
          (STAIR_HOLE_X_MAX + ROOF_X_MAX) / 2,
          ROOF_Y,
          (STAIR_HOLE_Z_MIN + STAIR_HOLE_Z_MAX) / 2,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[ROOF_X_MAX - STAIR_HOLE_X_MAX, STAIR_HOLE_Z_MAX - STAIR_HOLE_Z_MIN]} />
        {mat}
      </mesh>

      {/* SOUTH strip — full width, from stair-hole south edge to south parapet */}
      <mesh
        position={[
          (ROOF_X_MIN + ROOF_X_MAX) / 2,
          ROOF_Y,
          (STAIR_HOLE_Z_MAX + ROOF_Z_MAX) / 2,
        ]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[ROOF_X_MAX - ROOF_X_MIN, ROOF_Z_MAX - STAIR_HOLE_Z_MAX]} />
        {mat}
      </mesh>
    </group>
  )
}

function Antenna({ x, z, h }: { x: number; z: number; h: number }) {
  // Fish-bone TV antenna: vertical pole + several horizontal cross-bars.
  // The bars get shorter as they go up.
  const bars = useMemo(() => {
    const n = 4 + Math.floor(Math.random() * 4)
    const arr: { y: number; width: number }[] = []
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1)
      arr.push({ y: 0.3 + t * (h - 0.3), width: 0.5 - t * 0.32 })
    }
    return arr
  }, [h])
  return (
    <group position={[x, ROOF_Y, z]}>
      {/* Vertical pole */}
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.012, 0.012, h, 6]} />
        <meshStandardMaterial color={'#8a8276'} metalness={0.5} roughness={0.6} />
      </mesh>
      {bars.map((b, i) => (
        <mesh key={i} position={[0, b.y, 0]} rotation={[0, Math.random() * 0.6, 0]}>
          <boxGeometry args={[b.width, 0.008, 0.008]} />
          <meshStandardMaterial color={'#6a6258'} metalness={0.5} roughness={0.6} />
        </mesh>
      ))}
      {/* Short cross support near the base */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.15, 0.008, 0.15]} />
        <meshStandardMaterial color={'#4a4236'} metalness={0.5} roughness={0.6} />
      </mesh>
    </group>
  )
}

function AntennaForest() {
  // Nine antennas instead of 28 — clustered in two small groups plus a
  // couple of stragglers so they read as "apartments each had their own"
  // rather than a uniform field.
  const antennas = useMemo<{ x: number; z: number; h: number }[]>(() => [
    // Cluster near the back-left corner
    { x: -4.2, z: -22.5, h: 2.6 },
    { x: -3.6, z: -23.1, h: 2.0 },
    { x: -4.4, z: -21.4, h: 1.8 },
    // Cluster mid-right
    { x:  3.5, z: -20.5, h: 2.4 },
    { x:  4.1, z: -21.2, h: 1.9 },
    // Stragglers
    { x:  1.4, z: -24.1, h: 2.2 },
    { x: -1.8, z: -19.3, h: 1.7 },
    { x:  4.8, z: -24.2, h: 2.1 },
    { x: -2.4, z: -22.8, h: 1.6 },
  ], [])
  return (
    <>
      {antennas.map((a, i) => <Antenna key={i} x={a.x} z={a.z} h={a.h} />)}
    </>
  )
}

// HK-style bamboo drying rack: two metal A-frame stands carrying a
// horizontal bamboo pole. Garments are hung from clothespins with their
// real silhouette (singlet / shirt / pants / shorts / towel) — closer
// to what Girard's 1980s rooftop shots show than triangular drapes.
type GarmentType = 'singlet' | 'tshirt' | 'shirt' | 'pants' | 'shorts' | 'towel'

interface GarmentData {
  offset: number    // along the pole (X in rack-local frame)
  type: GarmentType
  color: string
}

interface Rack {
  center: [number, number, number]
  length: number
  rot: number
  garments: GarmentData[]
}

// HK 1980s working-class palette — aged whites, faded pastels, dark
// utility pants, khaki.
const WHITE   = '#ecdcc8'
const CREAM   = '#dcc8a0'
const PALEBLU = '#9ab4c8'
const TAN     = '#b89878'
const KHAKI   = '#a89060'
const NAVY    = '#2e3850'
const CHARCOAL = '#282420'
const FADERED = '#a84838'
const PINK    = '#d89098'
const YELLOW  = '#d8c060'
const GREEN   = '#7a9470'

const RACKS: Rack[] = [
  {
    center: [-3.8, ROOF_Y, -14], length: 2.8, rot: 0,
    garments: [
      { offset: -1.0, type: 'singlet', color: WHITE },
      { offset: -0.3, type: 'pants',   color: NAVY },
      { offset:  0.4, type: 'shorts',  color: KHAKI },
      { offset:  1.0, type: 'shirt',   color: PALEBLU },
    ],
  },
  {
    center: [2.4, ROOF_Y, -13], length: 2.4, rot: -0.15,
    garments: [
      { offset: -0.85, type: 'tshirt', color: FADERED },
      { offset: -0.25, type: 'towel',  color: PINK },
      { offset:  0.35, type: 'shorts', color: TAN },
      { offset:  0.95, type: 'tshirt', color: YELLOW },
    ],
  },
  {
    center: [-1.2, ROOF_Y, -17.5], length: 2.2, rot: 0.3,
    garments: [
      { offset: -0.75, type: 'singlet', color: WHITE },
      { offset: -0.15, type: 'pants',   color: CHARCOAL },
      { offset:  0.4,  type: 'shirt',   color: CREAM },
      { offset:  0.9,  type: 'towel',   color: GREEN },
    ],
  },
]

function buildGarmentShape(type: GarmentType): { shape: THREE.Shape; w: number; h: number } {
  // Shapes are drawn with y=0 at the top (clothespin line) and negative
  // y going downward, so positioning on the pole is just y = poleY.
  const s = new THREE.Shape()
  switch (type) {
    case 'singlet': {
      // Sleeveless ribbed undershirt — narrow shoulder straps, deep
      // armholes, straight-cut hem.
      const w = 0.4, h = 0.6
      s.moveTo(-0.09, 0)        // left strap inner-top
      s.lineTo(-0.09, -0.08)    // strap down
      s.lineTo(-0.17, -0.16)    // out to armpit
      s.lineTo(-0.2,  -0.55)    // side seam down to hem
      s.lineTo(-0.18, -h)       // hem left
      s.lineTo( 0.18, -h)       // hem right
      s.lineTo( 0.2,  -0.55)
      s.lineTo( 0.17, -0.16)
      s.lineTo( 0.09, -0.08)
      s.lineTo( 0.09, 0)        // right strap inner-top
      s.lineTo( 0.06, -0.05)    // across the neckline (dip)
      s.lineTo(-0.06, -0.05)
      s.lineTo(-0.09, 0)
      return { shape: s, w, h }
    }
    case 'tshirt': {
      // Short-sleeve T — sleeves flare out at shoulders.
      const w = 0.58, h = 0.55
      s.moveTo(-0.05, 0)        // collar right edge
      s.lineTo(-0.15, -0.04)    // neck dip left
      s.lineTo(-0.22, -0.02)    // out to sleeve top
      s.lineTo(-0.29, -0.02)    // sleeve end top
      s.lineTo(-0.29, -0.14)    // sleeve end bottom
      s.lineTo(-0.21, -0.17)    // in to torso
      s.lineTo(-0.2,  -h)       // hem left
      s.lineTo( 0.2,  -h)
      s.lineTo( 0.21, -0.17)
      s.lineTo( 0.29, -0.14)
      s.lineTo( 0.29, -0.02)
      s.lineTo( 0.22, -0.02)
      s.lineTo( 0.15, -0.04)
      s.lineTo( 0.05, 0)
      s.lineTo( 0.02, -0.06)    // neck curve
      s.lineTo(-0.02, -0.06)
      s.lineTo(-0.05, 0)
      return { shape: s, w, h }
    }
    case 'shirt': {
      // Collared short-sleeve button-up — small collar bumps + placket.
      const w = 0.6, h = 0.58
      s.moveTo(-0.08, 0)
      s.lineTo(-0.14, -0.04)    // collar point left
      s.lineTo(-0.18, -0.02)
      s.lineTo(-0.22, -0.03)
      s.lineTo(-0.3,  -0.03)    // sleeve end top
      s.lineTo(-0.3,  -0.16)
      s.lineTo(-0.22, -0.19)
      s.lineTo(-0.22, -h)       // hem left
      s.lineTo( 0.22, -h)
      s.lineTo( 0.22, -0.19)
      s.lineTo( 0.3,  -0.16)
      s.lineTo( 0.3,  -0.03)
      s.lineTo( 0.22, -0.03)
      s.lineTo( 0.18, -0.02)
      s.lineTo( 0.14, -0.04)
      s.lineTo( 0.08, 0)
      s.lineTo( 0.03, -0.07)    // placket top
      s.lineTo(-0.03, -0.07)
      s.lineTo(-0.08, 0)
      return { shape: s, w, h }
    }
    case 'pants': {
      // Long straight-cut pants hung by the waistband — waist at top,
      // two legs separated by an inner seam gap.
      const w = 0.4, h = 0.72
      s.moveTo(-0.2, 0)         // waist left
      s.lineTo( 0.2, 0)         // waist right
      s.lineTo( 0.18, -h)       // right leg outer
      s.lineTo( 0.06, -h)       // right leg inner
      s.lineTo( 0.03, -0.2)     // inner seam up to crotch
      s.lineTo(-0.03, -0.2)
      s.lineTo(-0.06, -h)
      s.lineTo(-0.18, -h)
      s.lineTo(-0.2, 0)
      return { shape: s, w, h }
    }
    case 'shorts': {
      // Knee-length shorts — same structure as pants, shorter.
      const w = 0.44, h = 0.38
      s.moveTo(-0.22, 0)
      s.lineTo( 0.22, 0)
      s.lineTo( 0.2,  -h)
      s.lineTo( 0.05, -h)
      s.lineTo( 0.03, -0.18)
      s.lineTo(-0.03, -0.18)
      s.lineTo(-0.05, -h)
      s.lineTo(-0.2,  -h)
      s.lineTo(-0.22, 0)
      return { shape: s, w, h }
    }
    case 'towel': {
      const w = 0.46, h = 0.6
      s.moveTo(-0.23, 0)
      s.lineTo( 0.23, 0)
      s.lineTo( 0.23, -h)
      s.lineTo(-0.23, -h)
      s.lineTo(-0.23, 0)
      return { shape: s, w, h }
    }
  }
}

function AFrame({ x, z, height = 1.6 }: { x: number; z: number; height?: number }) {
  // Inverted-V metal stand. Two legs meet at the top where the bamboo
  // pole rests. A short horizontal brace mid-way locks them together.
  const legLen = Math.hypot(height, 0.4)
  const legAngle = Math.atan2(0.4, height)
  return (
    <group position={[x, 0, z]}>
      {[-1, 1].map((s, i) => (
        <mesh
          key={i}
          position={[0, height / 2, s * 0.2]}
          rotation={[s * legAngle, 0, 0]}
        >
          <cylinderGeometry args={[0.018, 0.018, legLen, 6]} />
          <meshStandardMaterial color={'#5a4a38'} metalness={0.4} roughness={0.7} />
        </mesh>
      ))}
      {/* Horizontal brace between the legs */}
      <mesh position={[0, height * 0.45, 0]}>
        <boxGeometry args={[0.02, 0.02, 0.3]} />
        <meshStandardMaterial color={'#5a4a38'} metalness={0.4} roughness={0.7} />
      </mesh>
    </group>
  )
}

function HangingGarment({ data, poleY }: { data: GarmentData; poleY: number }) {
  const { geom, w } = useMemo(() => {
    const { shape, w, h } = buildGarmentShape(data.type)
    return { geom: new THREE.ShapeGeometry(shape), w, h }
  }, [data.type])
  return (
    <group position={[data.offset, poleY, 0]}>
      {/* Garment silhouette — single flat plane, double-sided so the
          back of the shirt looks the same as the front. The garment's
          local origin (0, 0) is at the clothesline height, so the body
          of the garment hangs into negative Y. */}
      <mesh geometry={geom}>
        <meshStandardMaterial color={data.color} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Two clothespins gripping the top edge */}
      <mesh position={[-w / 4, 0.01, 0.012]}>
        <boxGeometry args={[0.025, 0.04, 0.02]} />
        <meshStandardMaterial color={'#3a2a20'} roughness={0.9} />
      </mesh>
      <mesh position={[w / 4, 0.01, 0.012]}>
        <boxGeometry args={[0.025, 0.04, 0.02]} />
        <meshStandardMaterial color={'#3a2a20'} roughness={0.9} />
      </mesh>
    </group>
  )
}

function DryingRack({ rack }: { rack: Rack }) {
  const poleYAbs = ROOF_Y + 1.65
  const poleYLocal = poleYAbs - ROOF_Y
  const poleRadius = 0.018
  const halfLen = rack.length / 2
  return (
    <group position={rack.center} rotation={[0, rack.rot, 0]}>
      <AFrame x={-halfLen} z={0} height={1.65} />
      <AFrame x={ halfLen} z={0} height={1.65} />
      {/* Bamboo pole */}
      <mesh position={[0, poleYLocal, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[poleRadius, poleRadius, rack.length, 10]} />
        <meshStandardMaterial color={'#c89a5a'} roughness={0.8} />
      </mesh>
      {/* Bamboo node bands */}
      {[-0.7, 0, 0.7].map((t, i) => (
        <mesh key={i} position={[halfLen * t, poleYLocal, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[poleRadius * 1.05, poleRadius * 1.05, 0.04, 10]} />
          <meshStandardMaterial color={'#6a4828'} roughness={0.85} />
        </mesh>
      ))}
      {rack.garments.map((g, i) => (
        <HangingGarment key={i} data={g} poleY={poleYLocal} />
      ))}
    </group>
  )
}

function DryingRacks() {
  return (
    <>
      {RACKS.map((r, i) => <DryingRack key={i} rack={r} />)}
    </>
  )
}

// Two kids playing on the rooftop. Rendered as 2D billboard sprites
// (canvas-drawn silhouettes on a plane that always faces the camera).
// Primitive-built 3D kids read as disjointed limbs at this scale —
// flat silhouettes are more legible and stylistically match the dusk
// mood of the scene.

function drawThrowingKid(): HTMLCanvasElement {
  const W = 256, H = 384
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const skin   = '#c8946e'
  const hair   = '#1a1210'
  const shirt  = '#b03a30'
  const shirtS = '#7a241e'   // shadow
  const shorts = '#2a3448'
  const plane  = '#f0e8d0'

  // --- Legs (stand, one forward) ---
  ctx.fillStyle = shorts
  // Back (planted) leg
  ctx.beginPath()
  ctx.moveTo(124, 230)
  ctx.quadraticCurveTo(122, 310, 118, 358)
  ctx.lineTo(136, 358)
  ctx.quadraticCurveTo(138, 310, 138, 230)
  ctx.closePath()
  ctx.fill()
  // Shin skin peek + shoe at the bottom
  ctx.fillStyle = skin
  ctx.fillRect(118, 352, 20, 10)
  ctx.fillStyle = '#1a1210'
  ctx.fillRect(112, 360, 30, 8)
  // Front leg — stepped forward
  ctx.fillStyle = shorts
  ctx.beginPath()
  ctx.moveTo(135, 225)
  ctx.quadraticCurveTo(152, 300, 158, 348)
  ctx.lineTo(175, 346)
  ctx.quadraticCurveTo(170, 290, 152, 225)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = skin
  ctx.fillRect(158, 342, 20, 10)
  ctx.fillStyle = '#1a1210'
  ctx.fillRect(155, 350, 30, 8)

  // --- Torso (shirt) ---
  ctx.fillStyle = shirt
  ctx.beginPath()
  ctx.moveTo(108, 140)
  ctx.quadraticCurveTo(105, 195, 112, 232)   // side down
  ctx.lineTo(158, 232)
  ctx.quadraticCurveTo(165, 195, 160, 140)
  ctx.quadraticCurveTo(134, 128, 108, 140)    // neckline curve
  ctx.closePath()
  ctx.fill()
  // Shadow side of shirt
  ctx.fillStyle = shirtS
  ctx.beginPath()
  ctx.moveTo(148, 142)
  ctx.quadraticCurveTo(165, 195, 160, 232)
  ctx.lineTo(148, 232)
  ctx.closePath()
  ctx.fill()

  // --- Head ---
  ctx.fillStyle = skin
  ctx.beginPath()
  ctx.arc(134, 108, 26, 0, Math.PI * 2)
  ctx.fill()
  // Hair cap
  ctx.fillStyle = hair
  ctx.beginPath()
  ctx.arc(134, 108, 26, Math.PI * 1.05, Math.PI * 1.95)
  ctx.lineTo(154, 108)
  ctx.lineTo(114, 108)
  ctx.closePath()
  ctx.fill()
  // Eye (small dark smudge)
  ctx.fillStyle = '#1a1410'
  ctx.fillRect(144, 108, 3, 3)

  // --- Throwing arm — raised high, bent at elbow ---
  ctx.strokeStyle = skin
  ctx.lineWidth = 13
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(152, 148)              // shoulder
  ctx.quadraticCurveTo(178, 110, 195, 60)  // up and out
  ctx.stroke()
  // T-shirt sleeve on this arm
  ctx.strokeStyle = shirt
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.moveTo(150, 150)
  ctx.lineTo(164, 135)
  ctx.stroke()

  // --- Other arm — hanging down/back ---
  ctx.strokeStyle = skin
  ctx.lineWidth = 12
  ctx.beginPath()
  ctx.moveTo(114, 148)
  ctx.quadraticCurveTo(98, 180, 92, 220)
  ctx.stroke()
  ctx.strokeStyle = shirt
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.moveTo(110, 150)
  ctx.lineTo(104, 164)
  ctx.stroke()

  // --- Paper plane in throwing hand ---
  ctx.fillStyle = plane
  ctx.beginPath()
  ctx.moveTo(200, 55)
  ctx.lineTo(230, 40)
  ctx.lineTo(215, 60)
  ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = '#b8a890'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(200, 55)
  ctx.lineTo(220, 48)
  ctx.stroke()

  return canvas
}

function drawCrouchingKid(): HTMLCanvasElement {
  const W = 256, H = 384
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  const skin   = '#c8946e'
  const hair   = '#1a1210'
  const shirt  = '#d8b048'
  const shirtS = '#9a7a20'
  const shorts = '#3a3428'
  const plane  = '#f0e8d0'

  // Because the kid is squatting, the whole figure sits lower in the
  // canvas — head around y=155 instead of y=108, legs folded below.

  // --- Folded legs (thighs horizontal-ish, shins vertical) ---
  ctx.fillStyle = shorts
  // Left thigh + shin
  ctx.beginPath()
  ctx.moveTo(108, 250)
  ctx.quadraticCurveTo(100, 280, 98, 310)
  ctx.lineTo(82, 358)
  ctx.lineTo(112, 358)
  ctx.quadraticCurveTo(122, 320, 132, 262)
  ctx.closePath()
  ctx.fill()
  // Right thigh + shin
  ctx.beginPath()
  ctx.moveTo(135, 262)
  ctx.quadraticCurveTo(148, 320, 158, 358)
  ctx.lineTo(188, 358)
  ctx.quadraticCurveTo(182, 308, 175, 278)
  ctx.lineTo(165, 250)
  ctx.closePath()
  ctx.fill()
  // Feet peeking out
  ctx.fillStyle = skin
  ctx.fillRect(78, 352, 36, 8)
  ctx.fillRect(158, 352, 36, 8)
  ctx.fillStyle = '#1a1410'
  ctx.fillRect(74, 358, 42, 6)
  ctx.fillRect(154, 358, 42, 6)

  // --- Torso — compressed, slightly bent forward ---
  ctx.fillStyle = shirt
  ctx.beginPath()
  ctx.moveTo(104, 188)
  ctx.quadraticCurveTo(100, 235, 112, 258)
  ctx.lineTo(164, 258)
  ctx.quadraticCurveTo(174, 235, 170, 188)
  ctx.quadraticCurveTo(138, 174, 104, 188)
  ctx.closePath()
  ctx.fill()
  ctx.fillStyle = shirtS
  ctx.beginPath()
  ctx.moveTo(158, 190)
  ctx.quadraticCurveTo(174, 235, 164, 258)
  ctx.lineTo(150, 258)
  ctx.closePath()
  ctx.fill()

  // --- Head — tilted down ---
  ctx.fillStyle = skin
  ctx.beginPath()
  ctx.arc(130, 158, 26, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = hair
  ctx.beginPath()
  ctx.arc(130, 158, 26, Math.PI * 1.1, Math.PI * 1.95)
  ctx.lineTo(150, 158)
  ctx.lineTo(110, 158)
  ctx.closePath()
  ctx.fill()

  // --- Arms: one reaching forward to ground, one on knee ---
  // Forward arm
  ctx.strokeStyle = skin
  ctx.lineWidth = 12
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(142, 200)
  ctx.quadraticCurveTo(180, 240, 200, 290)
  ctx.stroke()
  ctx.strokeStyle = shirt
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.moveTo(140, 202)
  ctx.lineTo(154, 216)
  ctx.stroke()
  // Knee arm
  ctx.strokeStyle = skin
  ctx.lineWidth = 11
  ctx.beginPath()
  ctx.moveTo(112, 208)
  ctx.quadraticCurveTo(122, 238, 140, 258)
  ctx.stroke()
  ctx.strokeStyle = shirt
  ctx.lineWidth = 18
  ctx.beginPath()
  ctx.moveTo(110, 206)
  ctx.lineTo(118, 220)
  ctx.stroke()

  // --- Paper plane on the ground the kid is looking at ---
  ctx.fillStyle = plane
  ctx.beginPath()
  ctx.moveTo(200, 295)
  ctx.lineTo(230, 280)
  ctx.lineTo(212, 305)
  ctx.closePath()
  ctx.fill()

  return canvas
}

function BillboardKid({ pos, canvas, scale = 1 }: {
  pos: [number, number, number]
  canvas: HTMLCanvasElement
  scale?: number
}) {
  const group = useRef<THREE.Group>(null)
  const tex = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas)
    t.anisotropy = 4
    return t
  }, [canvas])
  useFrame(({ camera }) => {
    if (!group.current) return
    // Yaw-only billboard — always faces camera horizontally but stays
    // upright so the figure doesn't rotate weirdly when you look up.
    group.current.lookAt(camera.position.x, group.current.position.y, camera.position.z)
  })
  // Plane proportions match the 256×384 canvas (aspect 2:3), real-world
  // height ~1.1m for a kid.
  const h = 1.15 * scale
  const w = h * (256 / 384)
  return (
    <group ref={group} position={pos}>
      <mesh position={[0, h / 2, 0]}>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial
          map={tex}
          transparent
          alphaTest={0.5}
          roughness={0.95}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}

function RooftopKids() {
  const throwingCanvas = useMemo(() => drawThrowingKid(), [])
  const crouchingCanvas = useMemo(() => drawCrouchingKid(), [])
  return (
    <>
      <BillboardKid pos={[2.2, ROOF_Y, -16]} canvas={throwingCanvas} />
      <BillboardKid pos={[-1.6, ROOF_Y, -18.5]} canvas={crouchingCanvas} />
    </>
  )
}

function SurroundingBuildings() {
  // Dark silhouette blocks ringing the rooftop, taller than ROOF_Y, so
  // you feel hemmed in by KWC even on the rooftop — this is the key
  // "city not a hallway" beat from the Greg Girard shots.
  const blocks = useMemo(() => {
    const arr: { x: number; z: number; w: number; d: number; h: number }[] = []
    // Far north wall of buildings
    arr.push({ x: -8,  z: -32, w: 10, d: 5, h: 16 })
    arr.push({ x:  2,  z: -33, w: 8,  d: 6, h: 12 })
    arr.push({ x:  9,  z: -30, w: 6,  d: 5, h: 14 })
    // Left (west) flank
    arr.push({ x: -11, z: -20, w: 4, d: 8, h: 10 })
    arr.push({ x: -10, z: -12, w: 3, d: 6, h: 14 })
    arr.push({ x: -12, z: -26, w: 5, d: 6, h: 12 })
    // Right (east) flank
    arr.push({ x:  11, z: -19, w: 4, d: 8, h: 12 })
    arr.push({ x:  10, z: -25, w: 3, d: 5, h: 16 })
    arr.push({ x:  12, z: -14, w: 4, d: 5, h: 10 })
    // South (back toward alley) — low band so the hut still reads
    arr.push({ x: -9, z: -6, w: 4, d: 3, h: 8 })
    arr.push({ x:  9, z: -6, w: 4, d: 3, h: 9 })
    return arr
  }, [])

  // Random-but-deterministic window grid for each block
  const windows = useMemo(() => {
    return blocks.map((b) => {
      const perFloor = Math.max(3, Math.floor(b.w / 1.2))
      const floors = Math.max(3, Math.floor(b.h / 2.2))
      const pts: { u: number; v: number; lit: boolean }[] = []
      for (let f = 0; f < floors; f++) {
        for (let c = 0; c < perFloor; c++) {
          pts.push({
            u: (c + 0.5) / perFloor,
            v: (f + 0.5) / floors,
            lit: Math.random() < 0.35,
          })
        }
      }
      return pts
    })
  }, [blocks])

  return (
    <>
      {blocks.map((b, i) => (
        <group key={i} position={[b.x, b.h / 2, b.z]}>
          <mesh>
            <boxGeometry args={[b.w, b.h, b.d]} />
            <meshStandardMaterial color={'#14100c'} roughness={0.95} />
          </mesh>
          {/* Windows on the facing side (+Z) */}
          {windows[i].map((w, j) => (
            <mesh
              key={j}
              position={[
                -b.w / 2 + w.u * b.w,
                -b.h / 2 + w.v * b.h,
                b.d / 2 + 0.01,
              ]}
            >
              <planeGeometry args={[0.35, 0.35]} />
              <meshStandardMaterial
                color={w.lit ? '#e8c878' : '#1a1e24'}
                emissive={w.lit ? '#e8a858' : '#000000'}
                emissiveIntensity={w.lit ? 0.9 : 0}
                roughness={0.8}
              />
            </mesh>
          ))}
        </group>
      ))}
    </>
  )
}

/* Green plastic water tanks — KWC rooftops were dotted with mid-sized
   PE storage drums servicing each apartment's gravity-fed plumbing.
   Spec: 3-4 tanks, Ø1m × 1.5m, faded green (M13). */
function WaterTanks() {
  const tanks: { x: number; z: number; tilt: number }[] = [
    { x: -4.6, z: -13.6, tilt: 0.0 },
    { x:  4.4, z: -16.2, tilt: 0.04 },
    { x: -0.6, z: -23.4, tilt: -0.03 },
  ]
  return (
    <group>
      {tanks.map((t, i) => (
        <group key={i} position={[t.x, ROOF_Y, t.z]} rotation={[0, t.tilt, 0]}>
          {/* Concrete plinth — tanks sit on a small block, never directly on roof */}
          <mesh position={[0, 0.06, 0]}>
            <boxGeometry args={[1.1, 0.12, 1.1]} />
            <meshStandardMaterial color={'#5a5450'} roughness={0.9} />
          </mesh>
          {/* Tank body — Ø1m × 1.5m, faded green plastic */}
          <mesh position={[0, 0.87, 0]}>
            <cylinderGeometry args={[0.5, 0.5, 1.5, 18]} />
            <meshStandardMaterial color={'#28644a'} roughness={0.6} />
          </mesh>
          {/* Top cap — slightly darker rim */}
          <mesh position={[0, 1.62, 0]}>
            <cylinderGeometry args={[0.52, 0.5, 0.04, 18]} />
            <meshStandardMaterial color={'#1f4e38'} roughness={0.7} />
          </mesh>
          {/* Inlet hat — small dome on top */}
          <mesh position={[0, 1.66, 0]}>
            <cylinderGeometry args={[0.15, 0.18, 0.08, 12]} />
            <meshStandardMaterial color={'#1f4e38'} roughness={0.75} />
          </mesh>
          {/* Sun-bleach streaks: 4 vertical stripes lighter than body */}
          {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((a, k) => (
            <mesh key={k} position={[Math.cos(a) * 0.501, 0.87, Math.sin(a) * 0.501]} rotation={[0, -a + Math.PI / 2, 0]}>
              <planeGeometry args={[0.16, 1.4]} />
              <meshStandardMaterial color={'#3a7858'} roughness={0.7} transparent opacity={0.5} />
            </mesh>
          ))}
          {/* Outlet pipe + tap near the base */}
          <mesh position={[0.55, 0.18, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.018, 0.018, 0.18, 8]} />
            <meshStandardMaterial color={'#5a4030'} metalness={0.4} roughness={0.75} />
          </mesh>
          <mesh position={[0.65, 0.12, 0]}>
            <boxGeometry args={[0.04, 0.06, 0.04]} />
            <meshStandardMaterial color={'#c8a048'} metalness={0.7} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function Rooftop() {
  const floorTex = useRoofTex()
  return (
    <group>
      <SkyDome />
      <Parapet />
      <StairOpeningRailing />
      <RooftopFloor tex={floorTex} />
      <AntennaForest />
      <WaterTanks />
      <DryingRacks />
      <RooftopKids />
      <SurroundingBuildings />
      {/* Lighting — low, warm sunset from the west + cool fill from the
          zenith. Slightly punchier than before so the silhouettes of the
          kids, racks, and antennas read clearly against the dusk. */}
      <directionalLight position={[-22, 6, -16]} intensity={1.15} color={'#f2a860'} />
      <directionalLight position={[-10, 2, -10]} intensity={0.35} color={'#e07040'} />
      <hemisphereLight args={['#d88858', '#1a2040', 0.7]} />
      <ambientLight intensity={0.15} color={'#5a3a24'} />
    </group>
  )
}
