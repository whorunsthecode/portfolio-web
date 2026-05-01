import { useMemo } from 'react'
import * as THREE from 'three'

// A steep, narrow concrete stairwell behind the alley. Enters through the
// doorway cut into the alley's back wall at z=-5 and climbs to z=-11, 5m
// up, where it emerges onto the rooftop through a second doorway.
//
// Coordinates (local to the WalledCity world group at x=100, y=0, z=0):
//   x ∈ [-0.85, 0.85]  — interior width
//   z ∈ [-11, -5]      — run (6m)
//   y floor: -5(z+5)/6 — 0 at z=-5 (alley level), 5 at z=-11 (rooftop level)
//   y ceiling: 7       — flat, low and claustrophobic

const STAIR_MIN_Z = -11
const STAIR_MAX_Z = -5
const STAIR_RISE = 5      // metres
const STAIR_WIDTH = 1.7
const STAIR_HEIGHT = 7    // ceiling height, absolute

// Floor height function used by the FPS bounds (see bounds array below).
export function stairFloor(_x: number, z: number): number {
  const t = (STAIR_MAX_Z - z) / (STAIR_MAX_Z - STAIR_MIN_Z)
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
  // Mould edges
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

  // Stair treads — visible steps climbing from z=-5, y=0 up to z=-11, y=5
  const steps = useMemo(() => {
    const arr: { z: number; y: number }[] = []
    const count = 25
    for (let i = 0; i < count; i++) {
      const t0 = i / count
      arr.push({
        z: STAIR_MAX_Z - t0 * (STAIR_MAX_Z - STAIR_MIN_Z),
        y: t0 * STAIR_RISE,
      })
    }
    return arr
  }, [])

  const stepRun = (STAIR_MAX_Z - STAIR_MIN_Z) / 25 // 0.24 m
  const stepRise = STAIR_RISE / 25                 // 0.20 m

  return (
    <group>
      {/* Left wall */}
      <mesh position={[-STAIR_WIDTH / 2, STAIR_HEIGHT / 2, (STAIR_MIN_Z + STAIR_MAX_Z) / 2]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[STAIR_MAX_Z - STAIR_MIN_Z, STAIR_HEIGHT]} />
        <meshStandardMaterial map={wallTex} color={'#2e2820'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Right wall */}
      <mesh position={[STAIR_WIDTH / 2, STAIR_HEIGHT / 2, (STAIR_MIN_Z + STAIR_MAX_Z) / 2]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[STAIR_MAX_Z - STAIR_MIN_Z, STAIR_HEIGHT]} />
        <meshStandardMaterial map={wallTex} color={'#2e2820'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Ceiling at y=7 — a flat slab across the stairwell */}
      <mesh position={[0, STAIR_HEIGHT, (STAIR_MIN_Z + STAIR_MAX_Z) / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[STAIR_WIDTH, STAIR_MAX_Z - STAIR_MIN_Z]} />
        <meshStandardMaterial map={wallTex} color={'#1e1a14'} roughness={0.95} />
      </mesh>
      {/* Far end wall (z = STAIR_MIN_Z = -11) with doorway to rooftop
          cut out at x ∈ [-0.5, 0.5], y ∈ [STAIR_RISE, STAIR_RISE+2]. Split
          the wall into a left jamb, right jamb, and top lintel. */}
      {[
        // Left jamb: full height, to left of doorway
        { x: (-STAIR_WIDTH / 2 + -0.5) / 2, w: (-0.5 - (-STAIR_WIDTH / 2)), y: STAIR_HEIGHT / 2, h: STAIR_HEIGHT },
        // Right jamb: full height, to right of doorway
        { x: (STAIR_WIDTH / 2 + 0.5) / 2,  w: (STAIR_WIDTH / 2 - 0.5),     y: STAIR_HEIGHT / 2, h: STAIR_HEIGHT },
        // Bottom lintel: below doorway (y = 0 to STAIR_RISE) behind the door
        { x: 0, w: 1.0, y: STAIR_RISE / 2, h: STAIR_RISE },
        // Top lintel: above the doorway (y = STAIR_RISE+2 to STAIR_HEIGHT)
        { x: 0, w: 1.0, y: (STAIR_RISE + 2 + STAIR_HEIGHT) / 2, h: STAIR_HEIGHT - (STAIR_RISE + 2) },
      ].map((seg, i) => (
        <mesh key={i} position={[seg.x, seg.y, STAIR_MIN_Z]}>
          <planeGeometry args={[seg.w, seg.h]} />
          <meshStandardMaterial map={wallTex} color={'#2e2820'} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Stair treads + risers */}
      {steps.map((s, i) => (
        <group key={i}>
          {/* Tread (horizontal step surface) */}
          <mesh position={[0, s.y + stepRise / 2, s.z - stepRun / 2]}>
            <boxGeometry args={[STAIR_WIDTH - 0.04, 0.04, stepRun]} />
            <meshStandardMaterial color={'#3a342a'} roughness={0.9} />
          </mesh>
          {/* Riser (vertical step face facing the climber) */}
          <mesh position={[0, s.y + stepRise / 2, s.z + 0.001]}>
            <planeGeometry args={[STAIR_WIDTH - 0.04, stepRise]} />
            <meshStandardMaterial color={'#2a241a'} roughness={0.95} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}

      {/* Single bare bulb halfway up the stairwell */}
      <group position={[0, STAIR_HEIGHT - 0.25, (STAIR_MIN_Z + STAIR_MAX_Z) / 2]}>
        <mesh>
          <sphereGeometry args={[0.04, 10, 8]} />
          <meshStandardMaterial color={'#f8e4a0'} emissive={'#f8cc70'} emissiveIntensity={2.5} />
        </mesh>
        <pointLight color={'#f8cc70'} intensity={0.55} distance={5} decay={2} />
      </group>
      {/* Second bulb near the top, so you can see where you're heading */}
      <group position={[0, STAIR_HEIGHT - 0.25, STAIR_MIN_Z + 0.6]}>
        <mesh>
          <sphereGeometry args={[0.04, 10, 8]} />
          <meshStandardMaterial color={'#f8e4a0'} emissive={'#f8cc70'} emissiveIntensity={2.5} />
        </mesh>
        <pointLight color={'#f8cc70'} intensity={0.45} distance={4} decay={2} />
      </group>

      {/* Low ambient so the stairwell isn't pitch black away from the bulbs */}
      <ambientLight intensity={0.04} color={'#201a14'} />
    </group>
  )
}
