import { useMemo } from 'react'
import * as THREE from 'three'

// Steep, narrow concrete stairwell branching perpendicular off the alley's
// LEFT wall at z=-8.5. Climbs westward along the X axis from x=-0.9
// (alley wall, y=0) up to x=-6 (rooftop level, y=5). Opens directly onto
// the rooftop deck without a doorway — the rooftop bound extends south to
// cover the landing.
//
// Coordinates (local to the WalledCity world group):
//   x ∈ [-6, -0.9]   — run (5.1m horizontal)
//   z ∈ [-9, -8]     — interior width (1m)
//   y floor ramps from 0 at x=-0.9 to 5 at x=-6
//   y ceiling: ramped 2m above the floor (low and claustrophobic)

const STAIR_X_NEAR = -0.9    // alley side
const STAIR_X_FAR = -6       // rooftop side
const STAIR_Z_MIN = -9
const STAIR_Z_MAX = -8
const STAIR_RISE = 5
const STAIR_WIDTH_Z = STAIR_Z_MAX - STAIR_Z_MIN  // 1m

// Floor height function used by the FPS bounds. Stairs ramp along X.
export function stairFloor(x: number, _z: number): number {
  const t = (STAIR_X_NEAR - x) / (STAIR_X_NEAR - STAIR_X_FAR)
  const clamped = Math.max(0, Math.min(1, t))
  return STAIR_RISE * clamped
}

function makeConcreteTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#3a342a'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 1200; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const shade = 35 + Math.random() * 30
    ctx.fillStyle = `rgb(${shade}, ${shade - 3}, ${shade - 8})`
    ctx.fillRect(x, y, 1 + Math.random() * 3, 1 + Math.random() * 3)
  }
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 10 + Math.random() * 40
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, 'rgba(10, 18, 10, 0.6)')
    g.addColorStop(1, 'rgba(10, 18, 10, 0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

export function Stairwell() {
  const wallTex = useMemo(() => makeConcreteTexture(512), [])

  // Build N steps along X. Each tread is a small box; risers are vertical planes.
  const stepCount = 22
  const stepRun = (STAIR_X_NEAR - STAIR_X_FAR) / stepCount  // 0.232m
  const stepRise = STAIR_RISE / stepCount                    // 0.227m
  const midX = (STAIR_X_NEAR + STAIR_X_FAR) / 2
  const midZ = (STAIR_Z_MIN + STAIR_Z_MAX) / 2

  return (
    <group>
      {/* Side wall at z=STAIR_Z_MIN (north side) — vertical plane spanning
          the run, tall enough to clear the top of the climb. */}
      <mesh
        position={[midX, 3.5, STAIR_Z_MIN]}
      >
        <planeGeometry args={[Math.abs(STAIR_X_NEAR - STAIR_X_FAR), 7]} />
        <meshStandardMaterial map={wallTex} color={'#2e2820'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Side wall at z=STAIR_Z_MAX (south side) */}
      <mesh
        position={[midX, 3.5, STAIR_Z_MAX]}
      >
        <planeGeometry args={[Math.abs(STAIR_X_NEAR - STAIR_X_FAR), 7]} />
        <meshStandardMaterial map={wallTex} color={'#2e2820'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* Sloped ceiling 2m above the ramping floor. Two end-points:
          - At x=STAIR_X_NEAR (y=0):    ceiling y=2.0
          - At x=STAIR_X_FAR  (y=5):    ceiling y=7.0
          Plane spans the diagonal between those two heights. */}
      <mesh
        position={[midX, (2 + 7) / 2, midZ]}
        rotation={[0, 0, Math.atan2(5, Math.abs(STAIR_X_NEAR - STAIR_X_FAR))]}
      >
        <planeGeometry
          args={[
            Math.sqrt(Math.pow(STAIR_X_NEAR - STAIR_X_FAR, 2) + 25),
            STAIR_WIDTH_Z,
          ]}
        />
        <meshStandardMaterial map={wallTex} color={'#1e1a14'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* Steps — treads + risers. Run along -X. Each tread sits at the
          floor height for its x position; the riser is the vertical face
          on the alley-facing side of the next-higher tread. */}
      {Array.from({ length: stepCount }).map((_, i) => {
        // i=0 is closest to alley (x=STAIR_X_NEAR side), highest x.
        const xCenter = STAIR_X_NEAR - (i + 0.5) * stepRun
        const yTop = (i + 1) * stepRise
        return (
          <group key={i}>
            {/* Tread (horizontal step surface) */}
            <mesh position={[xCenter, yTop - 0.02, midZ]}>
              <boxGeometry args={[stepRun, 0.04, STAIR_WIDTH_Z - 0.04]} />
              <meshStandardMaterial color={'#3a342a'} roughness={0.9} />
            </mesh>
            {/* Riser — vertical face on the alley side of this tread */}
            <mesh
              position={[xCenter + stepRun / 2 - 0.001, yTop - stepRise / 2, midZ]}
              rotation={[0, Math.PI / 2, 0]}
            >
              <planeGeometry args={[STAIR_WIDTH_Z - 0.04, stepRise]} />
              <meshStandardMaterial color={'#2a241a'} roughness={0.95} side={THREE.DoubleSide} />
            </mesh>
          </group>
        )
      })}

      {/* Single bare bulb halfway up the stairwell */}
      <group position={[midX, 3.5, midZ]}>
        <mesh>
          <sphereGeometry args={[0.04, 10, 8]} />
          <meshStandardMaterial color={'#f8e4a0'} emissive={'#f8cc70'} emissiveIntensity={2.5} />
        </mesh>
        <pointLight color={'#f8cc70'} intensity={0.55} distance={5} decay={2} />
      </group>
      {/* Second bulb near the top so you can see where you're heading */}
      <group position={[STAIR_X_FAR + 0.4, 5.5, midZ]}>
        <mesh>
          <sphereGeometry args={[0.04, 10, 8]} />
          <meshStandardMaterial color={'#f8e4a0'} emissive={'#f8cc70'} emissiveIntensity={2.5} />
        </mesh>
        <pointLight color={'#f8cc70'} intensity={0.45} distance={4} decay={2} />
      </group>

      {/* Low ambient so the stairwell isn't pitch-black away from the bulbs */}
      <ambientLight intensity={0.04} color={'#201a14'} />
    </group>
  )
}
