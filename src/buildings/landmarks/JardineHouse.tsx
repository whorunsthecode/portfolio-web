import { useMemo } from 'react'
import * as THREE from 'three'
import { useStore } from '../../store'

/**
 * Jardine House (1973) — Central's first skyscraper, locally known as the
 * "House of 1,000 Orifices" for its 1,748 circular porthole windows. A
 * white/aluminium slab with rounded-rectangle plan. Period-correct for 1982
 * and visually unmistakable next to any skyline.
 *
 * Portholes are baked into a canvas texture and tiled across the box, so
 * there's no custom shader and we only upload one texture per day/night.
 */

function makePortholeTexture(
  cols: number,
  rows: number,
  wallColor: string,
  litColor: string,
  litFrac: number,
  seed: number,
): THREE.CanvasTexture {
  const cell = 64
  const canvas = document.createElement('canvas')
  canvas.width = cols * cell
  canvas.height = rows * cell
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = wallColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Faint panel seams between columns — mimics aluminium curtain-wall joins
  ctx.strokeStyle = 'rgba(0,0,0,0.08)'
  ctx.lineWidth = 1
  for (let c = 0; c <= cols; c++) {
    ctx.beginPath()
    ctx.moveTo(c * cell, 0)
    ctx.lineTo(c * cell, canvas.height)
    ctx.stroke()
  }

  const r = cell * 0.36
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cx = col * cell + cell / 2
      const cy = row * cell + cell / 2

      // Recessed frame ring
      ctx.fillStyle = '#b8b8b0'
      ctx.beginPath()
      ctx.arc(cx, cy, r + 2, 0, Math.PI * 2)
      ctx.fill()

      // Glass — deterministic per-window lit/dark so day & night maps align
      const h = Math.sin((col * 374.1 + row * 91.7 + seed) * 43.1) * 0.5 + 0.5
      const lit = h < litFrac
      ctx.fillStyle = lit ? litColor : '#2a3240'
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, Math.PI * 2)
      ctx.fill()

      // Specular highlight
      ctx.fillStyle = 'rgba(255,255,255,0.25)'
      ctx.beginPath()
      ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.25, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 4
  return tex
}

export function JardineHouse() {
  const mode = useStore((s) => s.mode)

  const width = 14
  const depth = 14
  const height = 55

  const dayTex = useMemo(
    () => makePortholeTexture(12, 46, '#e8e6dc', '#4a5866', 0.1, 502),
    [],
  )
  const nightTex = useMemo(
    () => makePortholeTexture(12, 46, '#3a3a38', '#f4d480', 0.5, 502),
    [],
  )

  const tex = mode === 'night' ? nightTex : dayTex

  return (
    <group>
      {/* Ground-level granite plinth */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[width + 1.2, 3, depth + 1.2]} />
        <meshStandardMaterial color="#6a6660" roughness={0.85} />
      </mesh>

      {/* Main slab — portholes baked into the texture */}
      <mesh position={[0, height / 2 + 3, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial
          map={tex}
          emissive="#f4d480"
          emissiveMap={mode === 'night' ? nightTex : null}
          emissiveIntensity={mode === 'night' ? 0.6 : 0}
          roughness={0.55}
          metalness={0.25}
        />
      </mesh>

      {/* Rooftop mechanical penthouse */}
      <mesh position={[0, height + 3 + 1.2, 0]}>
        <boxGeometry args={[width * 0.7, 2.4, depth * 0.7]} />
        <meshStandardMaterial color="#8a8a82" roughness={0.7} />
      </mesh>

    </group>
  )
}
