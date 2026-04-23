import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { walledCityBus } from './bus'
import { CORRIDORS } from './SideCorridors'

// Concrete with black mold bloom, water streaks, torn posters. The key
// visual cue of the Walled City interior is how every surface records
// decades of wet, windowless life.

function makeConcreteTexture(size = 1024, opts: { mold?: boolean; streak?: boolean } = {}): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Base concrete — uneven mottled grey
  ctx.fillStyle = '#4a443a'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 1 + Math.random() * 3
    const shade = 40 + Math.random() * 35
    ctx.fillStyle = `rgb(${shade}, ${shade - 4}, ${shade - 10})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Form-seam lines — vertical concrete-pour stripes every ~1/3 of height
  ctx.strokeStyle = 'rgba(25, 20, 15, 0.5)'
  ctx.lineWidth = 2
  for (let i = 1; i < 4; i++) {
    ctx.beginPath()
    ctx.moveTo((i * size) / 4, 0)
    ctx.lineTo((i * size) / 4, size)
    ctx.stroke()
  }

  if (opts.mold) {
    // Black mold blooms in the corners/edges
    for (let i = 0; i < 40; i++) {
      const edge = Math.random() < 0.5 ? 0 : size
      const x = Math.random() < 0.5 ? edge + (Math.random() - 0.5) * 120 : Math.random() * size
      const y = Math.random() * size
      const r = 15 + Math.random() * 50
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, 'rgba(12, 16, 10, 0.6)')
      grad.addColorStop(1, 'rgba(12, 16, 10, 0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  if (opts.streak) {
    // Rust/water streaks running down
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * size
      const top = Math.random() * size * 0.5
      const h = size * (0.35 + Math.random() * 0.6)
      const grad = ctx.createLinearGradient(x, top, x, top + h)
      const rusty = Math.random() < 0.5
      const [r0, g0, b0] = rusty ? [90, 50, 22] : [30, 25, 18]
      grad.addColorStop(0, `rgba(${r0},${g0},${b0},0.55)`)
      grad.addColorStop(1, `rgba(${r0},${g0},${b0},0)`)
      ctx.fillStyle = grad
      ctx.fillRect(x - 3 - Math.random() * 3, top, 6 + Math.random() * 8, h)
    }
  }

  // Torn poster remnants
  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = `rgba(${180 + Math.random() * 40}, ${170 + Math.random() * 30}, ${140 + Math.random() * 30}, 0.35)`
    const x = Math.random() * size
    const y = Math.random() * size
    ctx.fillRect(x, y, 50 + Math.random() * 80, 70 + Math.random() * 70)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

/**
 * Alley shell — 1.8 wide × 10 deep × 3.8 tall. The ceiling has a long slit
 * down the middle (cut from the mesh geometry) so a thin strip of sky
 * bleeds in — that's the iconic Walled City "daylight" moment.
 */
export function AlleyShell() {
  const wallTex = useMemo(() => makeConcreteTexture(1024, { mold: true, streak: true }), [])
  const floorTex = useMemo(() => makeConcreteTexture(1024, { mold: true }), [])
  const ceilingTex = useMemo(() => makeConcreteTexture(512, { mold: true }), [])

  const W = 1.8
  const D = 10
  const H = 3.8

  const slitRef = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(() => {
    if (slitRef.current) {
      slitRef.current.emissiveIntensity = 1.2 * (1 - 0.8 * walledCityBus.flyoverK)
    }
  })

  return (
    <group>
      {/* Floor — wet concrete with dark pool patches */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial
          map={floorTex}
          roughness={0.45} // wet = lower roughness
          metalness={0.1}
          color={'#1e1a14'}
        />
      </mesh>

      {/* Ceiling — two panels with a gap in the middle for the sky slit */}
      <mesh position={[-W / 2 + 0.3, H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, D]} />
        <meshStandardMaterial map={ceilingTex} roughness={0.95} color={'#2a261e'} />
      </mesh>
      <mesh position={[W / 2 - 0.3, H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, D]} />
        <meshStandardMaterial map={ceilingTex} roughness={0.95} color={'#2a261e'} />
      </mesh>

      {/* Sky slit — bright emissive strip between the ceiling panels.
          Material ref lets PlaneFlyover dim it as a plane passes over. */}
      <mesh position={[0, H + 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, D]} />
        <meshStandardMaterial
          ref={slitRef}
          color={'#e8d890'}
          emissive={'#f8e4a0'}
          emissiveIntensity={1.2}
          roughness={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Left + right walls — rendered as segments around any corridor
          openings so the corridor behind the wall is visible through
          the gap. Each opening leaves a top lintel from y = corridor
          ceiling up to the alley ceiling. */}
      {(['left', 'right'] as const).map((side) => {
        const sign = side === 'left' ? -1 : 1
        const rotY = sign * Math.PI / 2
        // Collect openings for this side, sorted by z
        const openings = CORRIDORS
          .filter((c) => c.side === side)
          .map((c) => ({ zMin: c.z - c.halfWidth, zMax: c.z + c.halfWidth, ceiling: c.ceiling }))
          .sort((a, b) => a.zMin - b.zMin)
        // Derive wall segments — between each pair of openings + before
        // the first and after the last
        const segs: { zMin: number; zMax: number }[] = []
        let cursor = -D / 2
        for (const o of openings) {
          if (o.zMin > cursor) segs.push({ zMin: cursor, zMax: o.zMin })
          cursor = o.zMax
        }
        if (cursor < D / 2) segs.push({ zMin: cursor, zMax: D / 2 })

        return (
          <group key={side}>
            {segs.map((s, i) => {
              const w = s.zMax - s.zMin
              const cz = (s.zMin + s.zMax) / 2
              return (
                <mesh key={i} position={[sign * W / 2, H / 2, cz]} rotation={[0, rotY, 0]}>
                  <planeGeometry args={[w, H]} />
                  <meshStandardMaterial map={wallTex} roughness={0.9} color={'#3a342a'} side={THREE.DoubleSide} />
                </mesh>
              )
            })}
            {/* Top lintel over each opening */}
            {openings.map((o, i) => {
              const w = o.zMax - o.zMin
              const cz = (o.zMin + o.zMax) / 2
              const lintelH = H - o.ceiling
              return (
                <mesh
                  key={`lintel-${i}`}
                  position={[sign * W / 2, (o.ceiling + H) / 2, cz]}
                  rotation={[0, rotY, 0]}
                >
                  <planeGeometry args={[w, lintelH]} />
                  <meshStandardMaterial map={wallTex} roughness={0.9} color={'#3a342a'} side={THREE.DoubleSide} />
                </mesh>
              )
            })}
          </group>
        )
      })}

      {/* Back wall (z = -D/2) — split into three segments around a 1m-wide,
          2.1m-tall doorway leading into the stairwell behind. */}
      {/* Left jamb */}
      <mesh position={[(-W / 2 + -0.5) / 2, H / 2, -D / 2]}>
        <planeGeometry args={[-0.5 - (-W / 2), H]} />
        <meshStandardMaterial color={'#18140e'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Right jamb */}
      <mesh position={[(W / 2 + 0.5) / 2, H / 2, -D / 2]}>
        <planeGeometry args={[W / 2 - 0.5, H]} />
        <meshStandardMaterial color={'#18140e'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Top lintel above the doorway */}
      <mesh position={[0, (2.1 + H) / 2, -D / 2]}>
        <planeGeometry args={[1.0, H - 2.1]} />
        <meshStandardMaterial color={'#18140e'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* Front wall (behind camera) */}
      <mesh position={[0, H / 2, D / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={'#1a1610'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
