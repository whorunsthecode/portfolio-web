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

// A bundle of loose cables sagging between two anchor points — rendered as
// a catenary curve via a thin tube geometry.
function SaggingCable({ from, to, sag = 0.12, color = '#1a1410' }: {
  from: [number, number, number]
  to: [number, number, number]
  sag?: number
  color?: string
}) {
  const geom = useMemo(() => {
    const a = new THREE.Vector3(...from)
    const b = new THREE.Vector3(...to)
    const steps = 10
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      const p = a.clone().lerp(b, t)
      p.y -= sag * Math.sin(Math.PI * t)
      pts.push(p)
    }
    const curve = new THREE.CatmullRomCurve3(pts)
    return new THREE.TubeGeometry(curve, 16, 0.012, 6, false)
  }, [from, to, sag])

  return (
    <mesh geometry={geom}>
      <meshStandardMaterial color={color} roughness={0.9} />
    </mesh>
  )
}

export function PipeWeb() {
  const pipes = useMemo(() => pipesDef(), [])

  // Sagging cables between fixed anchor points — scattered across the span
  const cables = useMemo(() => {
    const arr: { from: [number, number, number]; to: [number, number, number]; sag: number }[] = []
    for (let i = 0; i < 14; i++) {
      const z1 = -4.5 + Math.random() * 9
      const z2 = z1 + 0.8 + Math.random() * 1.5
      const y1 = 3.2 + Math.random() * 0.3
      const y2 = 3.2 + Math.random() * 0.3
      const x1 = (Math.random() - 0.5) * 1.4
      const x2 = (Math.random() - 0.5) * 1.4
      arr.push({ from: [x1, y1, z1], to: [x2, y2, z2], sag: 0.1 + Math.random() * 0.18 })
    }
    return arr
  }, [])

  return (
    <group>
      {pipes.map((seg, i) => (
        <Pipe key={`p-${i}`} seg={seg} />
      ))}
      {cables.map((c, i) => (
        <SaggingCable key={`c-${i}`} from={c.from} to={c.to} sag={c.sag} />
      ))}
    </group>
  )
}
