import { useMemo } from 'react'
import * as THREE from 'three'

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

      {/* Sky slit — bright emissive strip between the ceiling panels */}
      <mesh position={[0, H + 0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.3, D]} />
        <meshStandardMaterial
          color={'#e8d890'}
          emissive={'#f8e4a0'}
          emissiveIntensity={1.2}
          roughness={1}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Left / right walls */}
      <mesh position={[-W / 2, H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial map={wallTex} roughness={0.9} color={'#3a342a'} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[W / 2, H / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial map={wallTex} roughness={0.9} color={'#3a342a'} side={THREE.DoubleSide} />
      </mesh>

      {/* Back wall — pure dark with a hint of light leak around edges */}
      <mesh position={[0, H / 2, -D / 2]}>
        <planeGeometry args={[W, H]} />
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
