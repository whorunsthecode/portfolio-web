import { useMemo } from 'react'
import * as THREE from 'three'

// The signature Walled City visual: a matted tangle of plumbing, electrical
// conduit, and bare-copper wiring running overhead and along the walls.
// Drawn with a mix of straight pipe segments + loose cable sag.

interface PipeSeg {
  start: [number, number, number]
  end: [number, number, number]
  radius: number
  color: string
  metalness: number
  roughness: number
}

function pipesDef(): PipeSeg[] {
  // Long axial runs along the alley ceiling + walls, plus short cross-pieces
  // at apartment-entry points. The tangle isn't accurate plumbing; it's
  // visual density.
  const defs: PipeSeg[] = []

  // Overhead main runs — 4 parallel pipes at varying heights just below
  // the ceiling, offset across the width
  const overheadRuns = [
    { x: -0.6, y: 3.5, radius: 0.04, color: '#5a4830', m: 0.4, r: 0.7 },
    { x: -0.3, y: 3.58, radius: 0.055, color: '#3a342a', m: 0.2, r: 0.85 },
    { x: 0.2, y: 3.48, radius: 0.05, color: '#4a3a28', m: 0.3, r: 0.75 },
    { x: 0.55, y: 3.55, radius: 0.035, color: '#6a5440', m: 0.3, r: 0.7 },
  ]
  overheadRuns.forEach((r) => {
    defs.push({
      start: [r.x, r.y, -4.8],
      end: [r.x, r.y, 4.8],
      radius: r.radius,
      color: r.color,
      metalness: r.m,
      roughness: r.r,
    })
  })

  // Cross-alley water pipes — galvanised-steel mains spanning wall-to-wall,
  // a few at slightly different heights and z positions so they read as
  // an actual plumbing run rather than a row.
  const crossPipes = [
    { z: -3.4, y: 3.25, radius: 0.07, color: '#8a8a86' },
    { z: -1.2, y: 3.15, radius: 0.06, color: '#7a7a76' },
    { z:  0.6, y: 3.30, radius: 0.075, color: '#909088' },
    { z:  2.4, y: 3.20, radius: 0.06, color: '#7e7e78' },
    { z:  3.8, y: 3.28, radius: 0.05, color: '#8c8c84' },
  ]
  crossPipes.forEach((p) => {
    defs.push({
      start: [-0.88, p.y, p.z],
      end:   [ 0.88, p.y, p.z],
      radius: p.radius,
      color: p.color,
      metalness: 0.55,
      roughness: 0.55,
    })
  })

  // Cross-drops every ~1.5m — vertical elbow to apartment doors
  for (let z = -4; z <= 4; z += 1.6) {
    const side = z % 3 < 1.5 ? -1 : 1
    const wallX = side * 0.88
    defs.push({
      start: [wallX * 0.7, 3.45, z],
      end: [wallX * 0.95, 3.45, z],
      radius: 0.03,
      color: '#4a3a28',
      metalness: 0.3,
      roughness: 0.75,
    })
    defs.push({
      start: [wallX * 0.95, 3.45, z],
      end: [wallX * 0.95, 1.8 + Math.random() * 0.8, z],
      radius: 0.03,
      color: '#3a2f22',
      metalness: 0.2,
      roughness: 0.8,
    })
  }

  // Vertical electrical conduits on the walls — 6 random positions
  for (let i = 0; i < 6; i++) {
    const side = i % 2 === 0 ? -1 : 1
    const z = -4 + i * 1.4 + Math.random() * 0.5
    defs.push({
      start: [side * 0.88, 0.2, z],
      end: [side * 0.88, 3.4, z],
      radius: 0.02,
      color: '#1a1410',
      metalness: 0.1,
      roughness: 0.9,
    })
  }

  return defs
}

function Pipe({ seg }: { seg: PipeSeg }) {
  const { pos, rot, len } = useMemo(() => {
    const s = new THREE.Vector3(...seg.start)
    const e = new THREE.Vector3(...seg.end)
    const mid = s.clone().add(e).multiplyScalar(0.5)
    const dir = e.clone().sub(s)
    const length = dir.length()
    const quat = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    )
    const euler = new THREE.Euler().setFromQuaternion(quat)
    return { pos: mid.toArray() as [number, number, number], rot: [euler.x, euler.y, euler.z] as [number, number, number], len: length }
  }, [seg])

  return (
    <mesh position={pos} rotation={rot}>
      <cylinderGeometry args={[seg.radius, seg.radius, len, 10]} />
      <meshStandardMaterial color={seg.color} metalness={seg.metalness} roughness={seg.roughness} />
    </mesh>
  )
}

// A single cable rendered as a catenary tube. Cables are thicker and
// more varied than the old thin-black-line pass: insulation colour,
// diameter, sag, and extra dip all vary per cable.
interface CableSpec {
  from: [number, number, number]
  to: [number, number, number]
  sag: number
  radius: number
  color: string
  // extraLoop: if >0, the midpoint dips further and then loops back up,
  // making a U-shape of extra slack.
  extraLoop: number
}

function Cable({ spec }: { spec: CableSpec }) {
  const geom = useMemo(() => {
    const a = new THREE.Vector3(...spec.from)
    const b = new THREE.Vector3(...spec.to)
    const steps = 14
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const p = a.clone().lerp(b, t)
      // Primary catenary
      p.y -= spec.sag * Math.sin(Math.PI * t)
      // Extra looped slack — a big dip centred at t=0.5
      if (spec.extraLoop > 0) {
        const loop = Math.exp(-Math.pow((t - 0.5) * 6, 2))
        p.y -= spec.extraLoop * loop
      }
      pts.push(p)
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    return new THREE.TubeGeometry(curve, 22, spec.radius, 6, false)
  }, [spec])

  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color={spec.color} roughness={0.85} />
    </mesh>
  )
}

// A small metal junction box that many cables meet at. Rendered as a
// dark box with a couple of exposed wires poking out.
function JunctionBox({ pos }: { pos: [number, number, number] }) {
  return (
    <group position={pos}>
      <mesh>
        <boxGeometry args={[0.16, 0.22, 0.08]} />
        <meshStandardMaterial color={'#1a1410'} metalness={0.4} roughness={0.7} />
      </mesh>
      {/* Rust lid */}
      <mesh position={[0, 0, 0.041]}>
        <boxGeometry args={[0.14, 0.2, 0.002]} />
        <meshStandardMaterial color={'#2a1a10'} roughness={0.9} />
      </mesh>
      {/* Knockout nipples around the edges */}
      {[[-0.08, 0, 0], [0.08, 0, 0], [0, -0.11, 0]].map((p, i) => (
        <mesh key={i} position={p as [number, number, number]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.03, 6]} />
          <meshStandardMaterial color={'#4a4036'} metalness={0.5} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

// Insulation colour palette — real HK alley wiring is a rainbow of
// aging insulation. Weighted so black/grey dominate.
const INSULATION: Array<{ c: string; w: number }> = [
  { c: '#151110', w: 7 },   // black rubber
  { c: '#2a2520', w: 5 },   // aged black
  { c: '#0a0806', w: 2 },   // deep black (replaces green)
  { c: '#e8dcc0', w: 3 },   // yellowed white
  { c: '#c8a048', w: 2 },   // yellow
  { c: '#b03028', w: 2 },   // red
  { c: '#2a5ea8', w: 2 },   // blue
  { c: '#5a4a38', w: 3 },   // brown/tan
]
function pickColor(rng: () => number): string {
  const total = INSULATION.reduce((s, x) => s + x.w, 0)
  let r = rng() * total
  for (const o of INSULATION) {
    r -= o.w
    if (r <= 0) return o.c
  }
  return INSULATION[0].c
}

// Tiny deterministic PRNG so the cable mess is stable between renders.
function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function PipeWeb() {
  const pipes = useMemo(() => pipesDef(), [])

  // Junction boxes + sagging cables. Boxes are anchor points that many
  // cables radiate from — real HK wiring photos always show these as the
  // centres of the tangle.
  const { junctions, cables } = useMemo(() => {
    const rng = mulberry32(1982)
    const junctions: [number, number, number][] = [
      [-0.84, 2.6, -3.2],
      [ 0.84, 2.5, -1.5],
      [-0.84, 2.7,  0.8],
      [ 0.84, 2.55, 2.4],
      [-0.84, 2.45, 3.6],
    ]
    const cables: CableSpec[] = []

    // From each junction, fan 5–8 cables to random points on the opposite
    // wall or along the ceiling, often bundled with adjacent ones.
    junctions.forEach((j) => {
      const n = 5 + Math.floor(rng() * 4)
      for (let i = 0; i < n; i++) {
        const toWall = rng() < 0.6
        const toX = toWall ? (j[0] > 0 ? -0.84 : 0.84) : (rng() - 0.5) * 1.5
        const toY = 2.3 + rng() * 1.1
        const toZ = j[2] + (rng() - 0.5) * 4
        cables.push({
          from: j,
          to: [toX, toY, toZ],
          sag: 0.08 + rng() * 0.25,
          radius: 0.004 + rng() * 0.003,
          color: pickColor(rng),
          extraLoop: rng() < 0.25 ? 0.25 + rng() * 0.4 : 0,
        })
      }
    })

    // Junction-to-junction backbones: a thick, dark bundle runs between
    // adjacent junctions, visible as 2–4 parallel lines.
    for (let k = 0; k < junctions.length - 1; k++) {
      const a = junctions[k]
      const b = junctions[k + 1]
      const bundleCount = 3 + Math.floor(rng() * 2)
      for (let b2 = 0; b2 < bundleCount; b2++) {
        const offY = (b2 - bundleCount / 2) * 0.025
        const offX = (rng() - 0.5) * 0.05
        cables.push({
          from: [a[0] + offX, a[1] + offY, a[2]],
          to:   [b[0] + offX, b[1] + offY, b[2]],
          sag: 0.3 + rng() * 0.2,
          radius: 0.005 + rng() * 0.003,
          color: pickColor(rng),
          extraLoop: rng() < 0.35 ? 0.2 + rng() * 0.3 : 0,
        })
      }
    }

    // Extra free-floating cables strung across the alley at various heights
    for (let i = 0; i < 22; i++) {
      const z1 = -4.5 + rng() * 9
      const z2 = z1 + (rng() - 0.3) * 2.5
      const y1 = 2.4 + rng() * 1.1
      const y2 = 2.4 + rng() * 1.1
      const x1 = (rng() - 0.5) * 1.5
      const x2 = (rng() - 0.5) * 1.5
      cables.push({
        from: [x1, y1, z1],
        to:   [x2, y2, z2],
        sag: 0.1 + rng() * 0.3,
        radius: 0.003 + rng() * 0.004,
        color: pickColor(rng),
        extraLoop: rng() < 0.18 ? 0.2 + rng() * 0.3 : 0,
      })
    }

    return { junctions, cables }
  }, [])

  return (
    <group>
      {pipes.map((seg, i) => (
        <Pipe key={`p-${i}`} seg={seg} />
      ))}
      {junctions.map((j, i) => (
        <JunctionBox key={`j-${i}`} pos={j} />
      ))}
      {cables.map((c, i) => (
        <Cable key={`c-${i}`} spec={c} />
      ))}
    </group>
  )
}
