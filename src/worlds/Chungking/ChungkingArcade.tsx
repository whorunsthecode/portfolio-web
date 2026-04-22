import { useMemo } from 'react'
import * as THREE from 'three'

const FLOOR_BASE = '#d5c9a8'
const FLOOR_GROUT = '#7a6a48'
const WALL_COLOR = '#bfae8a'
const WALL_STAIN = 'rgba(60, 40, 20, 0.35)'
const CEILING_COLOR = '#e8dec2'

function makeTileFloor(size = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = FLOOR_BASE
  ctx.fillRect(0, 0, size, size)

  const tile = size / 12
  ctx.strokeStyle = FLOOR_GROUT
  ctx.lineWidth = 3
  for (let i = 0; i <= 12; i++) {
    ctx.beginPath()
    ctx.moveTo(i * tile, 0)
    ctx.lineTo(i * tile, size)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i * tile)
    ctx.lineTo(size, i * tile)
    ctx.stroke()
  }

  // Per-tile grime — random dark smudges and scuffs
  for (let i = 0; i < 400; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 2 + Math.random() * 8
    ctx.fillStyle = `rgba(40, 25, 15, ${0.08 + Math.random() * 0.18})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  // Foot-traffic paths — darker stripe down the centre
  ctx.fillStyle = 'rgba(50, 35, 22, 0.18)'
  ctx.fillRect(size * 0.38, 0, size * 0.24, size)

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 5)
  return tex
}

function makeWallTexture(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = WALL_COLOR
  ctx.fillRect(0, 0, size, size)

  // Water stains — vertical drips
  for (let i = 0; i < 6; i++) {
    const x = Math.random() * size
    const top = Math.random() * size * 0.3
    const height = size * (0.4 + Math.random() * 0.5)
    const grad = ctx.createLinearGradient(x, top, x, top + height)
    grad.addColorStop(0, 'rgba(60, 45, 28, 0.4)')
    grad.addColorStop(1, 'rgba(60, 45, 28, 0)')
    ctx.fillStyle = grad
    ctx.fillRect(x - 12 - Math.random() * 8, top, 20 + Math.random() * 16, height)
  }

  // Scuffs and grime splotches
  for (let i = 0; i < 80; i++) {
    ctx.fillStyle = WALL_STAIN
    const x = Math.random() * size
    const y = Math.random() * size
    ctx.beginPath()
    ctx.ellipse(x, y, 2 + Math.random() * 6, 1 + Math.random() * 3, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }

  // Posters torn off — leaving rectangular lighter patches
  for (let i = 0; i < 5; i++) {
    ctx.fillStyle = 'rgba(230, 215, 185, 0.4)'
    const x = Math.random() * size
    const y = Math.random() * size
    ctx.fillRect(x, y, 40 + Math.random() * 50, 60 + Math.random() * 60)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 1)
  return tex
}

/**
 * Ground-floor arcade shell — 6 wide × 10 deep × 3.2 tall.
 * Low ceiling and tight walls sell the Chungking Mansions claustrophobia.
 */
export function ChungkingArcade() {
  const floorTex = useMemo(() => makeTileFloor(), [])
  const wallTex = useMemo(() => makeWallTexture(), [])

  const W = 6
  const D = 10
  const H = 3.2

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial map={floorTex} roughness={0.75} />
      </mesh>

      {/* Ceiling — false-ceiling panels with a slightly warmer tint */}
      <mesh position={[0, H, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color={CEILING_COLOR} roughness={0.95} />
      </mesh>

      {/* Left / right walls */}
      <mesh position={[-W / 2, H / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial map={wallTex} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[W / 2, H / 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial map={wallTex} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Back wall (lift bank sits in front of this) */}
      <mesh position={[0, H / 2, -D / 2]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={'#a89472'} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Front wall behind camera — keeps the camera from seeing nothing
          when the user orbits backward through the opening */}
      <mesh position={[0, H / 2, D / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color={'#9a8668'} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Baseboard strip — hides the floor/wall seam */}
      {([-W / 2, W / 2] as const).map((x, i) => (
        <mesh key={i} position={[x, 0.06, 0]}>
          <boxGeometry args={[0.03, 0.12, D]} />
          <meshStandardMaterial color={'#4a3a28'} roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}
