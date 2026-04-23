// src/worlds/Chungking/Corridor.tsx
import { useMemo } from 'react'
import * as THREE from 'three'

const W = 1.8   // corridor width
const H = 2.6   // corridor height
const FRONT_START = -9
const FRONT_END   = -20
const REAR_START  = -20
const REAR_END    = -29

function makeGreenTileTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#326446'
  ctx.fillRect(0, 0, size, size)

  // Grout grid — 10×10 tiles
  const tile = size / 10
  ctx.strokeStyle = '#1e3a2a'
  ctx.lineWidth = 3
  for (let i = 0; i <= 10; i++) {
    ctx.beginPath(); ctx.moveTo(i * tile, 0); ctx.lineTo(i * tile, size); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i * tile); ctx.lineTo(size, i * tile); ctx.stroke()
  }

  // Grime splotches
  for (let i = 0; i < 180; i++) {
    ctx.fillStyle = `rgba(10,28,14,${0.05 + Math.random() * 0.18})`
    ctx.beginPath()
    ctx.arc(Math.random() * size, Math.random() * size, 2 + Math.random() * 5, 0, Math.PI * 2)
    ctx.fill()
  }

  // Wear streak down the centre (foot traffic)
  ctx.fillStyle = 'rgba(8,22,12,0.22)'
  ctx.fillRect(size * 0.35, 0, size * 0.3, size)

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 7)
  return tex
}

function makeBlueWallTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#0f1e3c'
  ctx.fillRect(0, 0, size, size)

  // Damp streaks — vertical
  for (let i = 0; i < 6; i++) {
    const x = Math.random() * size
    const grad = ctx.createLinearGradient(x, 0, x, size)
    grad.addColorStop(0, 'rgba(20,50,100,0.35)')
    grad.addColorStop(1, 'rgba(20,50,100,0)')
    ctx.fillStyle = grad
    ctx.fillRect(x - 10, 0, 22, size)
  }

  // Peeling patches
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = 'rgba(30,55,100,0.2)'
    ctx.fillRect(Math.random() * size, Math.random() * size, 30 + Math.random() * 40, 50 + Math.random() * 60)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 3)
  return tex
}

function makeFloorTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#1e2e22'
  ctx.fillRect(0, 0, size, size)

  const tile = size / 8
  ctx.strokeStyle = '#111a14'
  ctx.lineWidth = 2
  for (let i = 0; i <= 8; i++) {
    ctx.beginPath(); ctx.moveTo(i * tile, 0); ctx.lineTo(i * tile, size); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i * tile); ctx.lineTo(size, i * tile); ctx.stroke()
  }

  // Puddle patches
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = `rgba(5,12,8,${0.3 + Math.random() * 0.3})`
    ctx.beginPath()
    ctx.ellipse(Math.random() * size, Math.random() * size, 20 + Math.random() * 30, 10 + Math.random() * 18, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 10)
  return tex
}

function makeCeilingTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#d8d0b8'
  ctx.fillRect(0, 0, size, size)
  // Stain patches
  for (let i = 0; i < 40; i++) {
    ctx.fillStyle = `rgba(80,60,30,${0.04 + Math.random() * 0.1})`
    ctx.beginPath()
    ctx.ellipse(Math.random() * size, Math.random() * size, 5 + Math.random() * 20, 3 + Math.random() * 10, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(1, 8)
  return tex
}

export function Corridor() {
  const greenTile = useMemo(() => makeGreenTileTexture(), [])
  const blueWall  = useMemo(() => makeBlueWallTexture(), [])
  const floor     = useMemo(() => makeFloorTexture(), [])
  const ceiling   = useMemo(() => makeCeilingTexture(), [])

  // Front zone dimensions
  const frontLen = Math.abs(FRONT_END - FRONT_START)   // 11m
  const frontMid = (FRONT_START + FRONT_END) / 2       // −14.5
  // Rear zone dimensions
  const rearLen  = Math.abs(REAR_END - REAR_START)     // 9m
  const rearMid  = (REAR_START + REAR_END) / 2         // −24.5

  return (
    <group>
      {/* ── Floor (full 20m) ── */}
      <mesh position={[0, 0, (FRONT_START + REAR_END) / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, Math.abs(REAR_END - FRONT_START)]} />
        <meshStandardMaterial map={floor} roughness={0.55} metalness={0.18} />
      </mesh>

      {/* Reflective floor overlay — wet tile shimmer */}
      <mesh position={[0, 0.001, (FRONT_START + REAR_END) / 2]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, Math.abs(REAR_END - FRONT_START)]} />
        <meshStandardMaterial color="#0a0c0a" roughness={0.05} metalness={0.4} transparent opacity={0.55} />
      </mesh>

      {/* ── Ceiling (full 20m) ── */}
      <mesh position={[0, H, (FRONT_START + REAR_END) / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, Math.abs(REAR_END - FRONT_START)]} />
        <meshStandardMaterial map={ceiling} roughness={0.9} />
      </mesh>

      {/* ── Front zone walls — green tile (z: −9 → −20) ── */}
      <mesh position={[-W / 2, H / 2, frontMid]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[frontLen, H]} />
        <meshStandardMaterial map={greenTile} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[W / 2, H / 2, frontMid]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[frontLen, H]} />
        <meshStandardMaterial map={greenTile} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Rear zone walls — Fallen Angels blue (z: −20 → −29) ── */}
      <mesh position={[-W / 2, H / 2, rearMid]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[rearLen, H]} />
        <meshStandardMaterial map={blueWall} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[W / 2, H / 2, rearMid]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[rearLen, H]} />
        <meshStandardMaterial map={blueWall} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Dead-end back wall ── */}
      <mesh position={[0, H / 2, REAR_END]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#0a1428" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Dead-end emissive floor strip (warm light under locked door) ── */}
      <mesh position={[0, 0.002, REAR_END + 0.12]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.7, 0.08]} />
        <meshStandardMaterial color="#ffb038" emissive="#ffb038" emissiveIntensity={1.2} />
      </mesh>
    </group>
  )
}
