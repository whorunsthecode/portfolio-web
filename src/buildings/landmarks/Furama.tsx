import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store'
import { InfoTag } from '../../scene/components/InfoTag'

/**
 * Furama Hotel (1973–2001) — cylindrical Central hotel tower famous for La
 * Ronda, its rooftop revolving restaurant. Demolished in 2001, which is
 * exactly why it belongs in a 1982 scene: a nostalgic beat visitors of the
 * era would recognise instantly.
 *
 * Form: tall creamy cylinder with vertical window bands, crowned by a wider
 * disc-shaped rooftop level that slowly rotates to suggest La Ronda.
 */

function makeFacadeTexture(): THREE.CanvasTexture {
  const w = 512
  const h = 1024
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  // Cream wall base
  ctx.fillStyle = '#efe6d2'
  ctx.fillRect(0, 0, w, h)

  // Vertical window bands — thin dark strips repeated around the cylinder.
  // The cylinder wraps this texture once, so cols define the whole ring.
  const cols = 24
  const colW = w / cols
  for (let c = 0; c < cols; c++) {
    // Per-band: a single tall dark window flanked by cream mullions
    const x = c * colW + colW * 0.3
    ctx.fillStyle = '#3a3a38'
    ctx.fillRect(x, h * 0.08, colW * 0.4, h * 0.84)

    // Horizontal floor dividers over the window band
    ctx.strokeStyle = '#efe6d2'
    ctx.lineWidth = 2
    const floors = 28
    for (let f = 1; f < floors; f++) {
      const y = h * 0.08 + (f / floors) * (h * 0.84)
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + colW * 0.4, y)
      ctx.stroke()
    }
  }

  // Base plinth band — darker
  ctx.fillStyle = '#8a7a5a'
  ctx.fillRect(0, h * 0.93, w, h * 0.07)

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.ClampToEdgeWrapping
  tex.anisotropy = 4
  return tex
}

export function Furama() {
  const mode = useStore((s) => s.mode)
  const rondaRef = useRef<THREE.Group>(null)

  const radius = 5
  const height = 38
  const rondaHeight = 3.2
  const rondaRadius = radius * 1.25

  const facadeTex = useMemo(() => makeFacadeTexture(), [])

  // Slow revolve on La Ronda — one revolution per ~60s, enough to catch
  // the eye without feeling like a spinning top.
  useFrame((_, delta) => {
    if (rondaRef.current) rondaRef.current.rotation.y += delta * 0.1
  })

  return (
    <group>
      {/* Ground plinth */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[radius + 0.6, radius + 0.8, 1.2, 40]} />
        <meshStandardMaterial color="#6a5a42" roughness={0.85} />
      </mesh>

      {/* Main cylindrical tower */}
      <mesh position={[0, height / 2 + 1.2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, height, 40, 1, true]} />
        <meshStandardMaterial
          map={facadeTex}
          roughness={0.65}
          metalness={0.1}
          side={THREE.DoubleSide}
          emissive="#f4d480"
          emissiveIntensity={mode === 'night' ? 0.35 : 0}
        />
      </mesh>

      {/* Thin slab between tower and La Ronda */}
      <mesh position={[0, height + 1.2 + 0.2, 0]}>
        <cylinderGeometry args={[radius + 0.2, radius + 0.2, 0.4, 40]} />
        <meshStandardMaterial color="#cfc4a8" roughness={0.7} />
      </mesh>

      {/* La Ronda — revolving rooftop restaurant (wider disc) */}
      <group ref={rondaRef} position={[0, height + 1.6 + rondaHeight / 2, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[rondaRadius, rondaRadius, rondaHeight, 48]} />
          <meshStandardMaterial
            color={mode === 'night' ? '#2a2018' : '#f4ead0'}
            emissive="#ffe08a"
            emissiveIntensity={mode === 'night' ? 0.9 : 0.05}
            roughness={0.4}
            metalness={0.15}
          />
        </mesh>
        {/* Thin crown rim */}
        <mesh position={[0, rondaHeight / 2 + 0.12, 0]}>
          <cylinderGeometry args={[rondaRadius + 0.1, rondaRadius + 0.1, 0.24, 48]} />
          <meshStandardMaterial color="#8a7a5a" roughness={0.6} />
        </mesh>
      </group>

      {/* Short antenna on top */}
      <mesh position={[0, height + 1.6 + rondaHeight + 2, 0]}>
        <cylinderGeometry args={[0.08, 0.12, 4, 8]} />
        <meshStandardMaterial color="#8a8a82" metalness={0.6} roughness={0.3} />
      </mesh>

      <InfoTag label="Furama · rooftop revolved till 2001" offset={[0, height + rondaHeight + 8, 0]} />
    </group>
  )
}
