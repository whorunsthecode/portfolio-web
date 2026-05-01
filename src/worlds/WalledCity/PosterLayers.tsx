import { useMemo } from 'react'
import * as THREE from 'three'

// Torn, layered, fading wheat-pasted posters. The content isn't legible —
// it's silhouette and texture — so we render each poster as a canvas with
// blocky headline shapes, colour washes, and ripped edges, then scatter
// them on the walls at varied angles.

type PosterKind = 'film' | 'rental' | 'medicine' | 'notice' | 'lotto'

interface Poster {
  side: 'left' | 'right'
  z: number
  y: number
  w: number
  h: number
  rot: number       // z-axis rotation (tilt on the wall)
  kind: PosterKind
  torn: number      // 0..1 how ripped
}

const POSTERS: Poster[] = [
  // LEFT wall
  { side: 'left',  z: -4.7, y: 1.2, w: 0.42, h: 0.58, rot: -0.12, kind: 'film',     torn: 0.3 },
  { side: 'left',  z: -4.5, y: 1.7, w: 0.36, h: 0.5,  rot:  0.08, kind: 'rental',   torn: 0.4 },
  { side: 'left',  z: -2.7, y: 1.05, w: 0.38, h: 0.52, rot: -0.05, kind: 'medicine', torn: 0.25 },
  { side: 'left',  z: -2.5, y: 1.6, w: 0.32, h: 0.44, rot:  0.15, kind: 'lotto',    torn: 0.5 },
  { side: 'left',  z: -0.6, y: 1.25, w: 0.4,  h: 0.54, rot: -0.08, kind: 'notice',   torn: 0.35 },
  { side: 'left',  z:  1.2, y: 1.4, w: 0.36, h: 0.5,  rot:  0.1,  kind: 'film',     torn: 0.3 },
  { side: 'left',  z:  1.35, y: 1.9, w: 0.3,  h: 0.42, rot: -0.1,  kind: 'rental',   torn: 0.45 },
  { side: 'left',  z:  3.2, y: 1.15, w: 0.38, h: 0.52, rot:  0.06, kind: 'medicine', torn: 0.3 },
  { side: 'left',  z:  4.6, y: 1.4, w: 0.34, h: 0.46, rot: -0.14, kind: 'notice',   torn: 0.4 },

  // RIGHT wall
  { side: 'right', z: -4.6, y: 1.3, w: 0.4,  h: 0.54, rot:  0.1,  kind: 'medicine', torn: 0.35 },
  { side: 'right', z: -4.4, y: 1.8, w: 0.32, h: 0.44, rot: -0.08, kind: 'film',     torn: 0.3 },
  { side: 'right', z: -1.9, y: 1.25, w: 0.38, h: 0.52, rot:  0.05, kind: 'notice',   torn: 0.4 },
  { side: 'right', z: -1.75, y: 1.85, w: 0.3,  h: 0.42, rot: -0.12, kind: 'lotto',    torn: 0.5 },
  { side: 'right', z:  0.5, y: 1.1,  w: 0.42, h: 0.58, rot: -0.06, kind: 'rental',   torn: 0.3 },
  { side: 'right', z:  2.4, y: 1.3,  w: 0.36, h: 0.5,  rot:  0.12, kind: 'film',     torn: 0.35 },
  { side: 'right', z:  2.2, y: 1.85, w: 0.3,  h: 0.42, rot: -0.08, kind: 'medicine', torn: 0.45 },
  { side: 'right', z:  4.3, y: 1.35, w: 0.38, h: 0.52, rot:  0.09, kind: 'notice',   torn: 0.4 },
]

// Simple palette per poster kind — faded, sun-bleached.
const PALETTE: Record<PosterKind, { base: string; accent: string; ink: string }> = {
  film:     { base: '#8a3a30', accent: '#d4b070', ink: '#18120c' },
  rental:   { base: '#d0c4a0', accent: '#a82020', ink: '#2a1a10' },
  medicine: { base: '#b8a878', accent: '#6a2a1a', ink: '#2a2018' },
  notice:   { base: '#c8c0a0', accent: '#384a6a', ink: '#18120c' },
  lotto:    { base: '#a04040', accent: '#e4cc60', ink: '#18120c' },
}

function makePosterTexture(poster: Poster, pxPerM = 512): THREE.CanvasTexture {
  const W = Math.round(poster.w * pxPerM)
  const H = Math.round(poster.h * pxPerM)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  const pal = PALETTE[poster.kind]

  // Paper base
  ctx.fillStyle = pal.base
  ctx.fillRect(0, 0, W, H)

  // Sun fade — vertical gradient overlay
  const fade = ctx.createLinearGradient(0, 0, 0, H)
  fade.addColorStop(0, 'rgba(220, 210, 180, 0.45)')
  fade.addColorStop(1, 'rgba(120, 100, 80, 0.2)')
  ctx.fillStyle = fade
  ctx.fillRect(0, 0, W, H)

  // Headline block — thick accent bar near top
  ctx.fillStyle = pal.accent
  ctx.fillRect(W * 0.08, H * 0.08, W * 0.84, H * 0.18)

  // Headline "text" — blocky shapes that read as characters
  ctx.fillStyle = pal.ink
  const chCount = 3 + Math.floor(Math.random() * 4)
  const chW = (W * 0.76) / chCount
  for (let i = 0; i < chCount; i++) {
    const x = W * 0.1 + i * chW + chW * 0.12
    const y = H * 0.1
    ctx.fillRect(x, y, chW * 0.76, H * 0.14)
  }

  // Body — 3–5 horizontal text lines
  ctx.fillStyle = pal.ink
  const lines = 3 + Math.floor(Math.random() * 3)
  for (let i = 0; i < lines; i++) {
    const y = H * (0.35 + i * 0.12)
    const w = W * (0.55 + Math.random() * 0.3)
    ctx.globalAlpha = 0.7 + Math.random() * 0.25
    ctx.fillRect(W * 0.1, y, w, H * 0.04)
  }
  ctx.globalAlpha = 1

  // Bottom accent — phone/price strip
  ctx.fillStyle = pal.accent
  ctx.fillRect(W * 0.1, H * 0.82, W * 0.8, H * 0.08)

  // Water stains + mould flecks
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const r = 10 + Math.random() * 40
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
    grad.addColorStop(0, 'rgba(40, 30, 20, 0.3)')
    grad.addColorStop(1, 'rgba(40, 30, 20, 0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Rips — erase jagged shapes from edges proportional to `torn`
  const ripCount = Math.floor(4 + poster.torn * 10)
  ctx.globalCompositeOperation = 'destination-out'
  for (let i = 0; i < ripCount; i++) {
    const edge = Math.floor(Math.random() * 4) // 0=top,1=right,2=bottom,3=left
    let cx = 0
    let cy = 0
    if (edge === 0) { cx = Math.random() * W; cy = 0 }
    else if (edge === 1) { cx = W; cy = Math.random() * H }
    else if (edge === 2) { cx = Math.random() * W; cy = H }
    else { cx = 0; cy = Math.random() * H }
    const r = 15 + Math.random() * 35 * poster.torn
    ctx.beginPath()
    // Jagged polygon rather than clean circle
    const sides = 6 + Math.floor(Math.random() * 4)
    for (let s = 0; s < sides; s++) {
      const ang = (s / sides) * Math.PI * 2
      const rr = r * (0.6 + Math.random() * 0.5)
      const px = cx + Math.cos(ang) * rr
      const py = cy + Math.sin(ang) * rr
      if (s === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.closePath()
    ctx.fill()
  }
  ctx.globalCompositeOperation = 'source-over'

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 2
  return tex
}

function PosterMesh({ poster }: { poster: Poster }) {
  const tex = useMemo(() => makePosterTexture(poster), [poster])
  const wallX = poster.side === 'left' ? -0.87 : 0.87
  const faceY = poster.side === 'left' ? Math.PI / 2 : -Math.PI / 2
  // Tiny z-offset per poster to avoid fighting with the wall + adjacent
  // posters. Deterministic from position so ordering is stable.
  const layerOffset = 0.004 + ((poster.z * 31 + poster.y * 17) % 1) * 0.008
  const outward = poster.side === 'left' ? 1 : -1
  return (
    <mesh
      position={[wallX + outward * layerOffset, poster.y, poster.z]}
      rotation={[0, faceY, poster.rot]}
    >
      <planeGeometry args={[poster.w, poster.h]} />
      <meshStandardMaterial
        map={tex}
        roughness={0.95}
        transparent
        alphaTest={0.02}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}

export function PosterLayers() {
  return (
    <>
      {POSTERS.map((p, i) => (
        <PosterMesh key={i} poster={p} />
      ))}
    </>
  )
}
