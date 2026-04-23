// src/worlds/Chungking/ElevatorLobby.tsx
import { useMemo } from 'react'
import * as THREE from 'three'

const W = 4.0   // lobby width
const D = 4.0   // lobby depth (z: −5 → −9)
const H = 2.8   // lobby height
const Z_START = -5
const Z_END   = -9

function makeWhiteTileTexture(): THREE.CanvasTexture {
  const size = 512
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = '#dcdcdc'
  ctx.fillRect(0, 0, size, size)

  // 8×8 grout grid
  const tile = size / 8
  ctx.strokeStyle = '#b0a898'
  ctx.lineWidth = 3
  for (let i = 0; i <= 8; i++) {
    ctx.beginPath(); ctx.moveTo(i * tile, 0); ctx.lineTo(i * tile, size); ctx.stroke()
    ctx.beginPath(); ctx.moveTo(0, i * tile); ctx.lineTo(size, i * tile); ctx.stroke()
  }

  // Rust stains
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * size
    const top = Math.random() * size * 0.4
    const grad = ctx.createLinearGradient(x, top, x, top + 60 + Math.random() * 80)
    grad.addColorStop(0, 'rgba(120,60,20,0.25)')
    grad.addColorStop(1, 'rgba(120,60,20,0)')
    ctx.fillStyle = grad
    ctx.fillRect(x - 8, top, 16, 140)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 1)
  return tex
}

function makeReflectionTexture(): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#1a1e1a'
  ctx.fillRect(0, 0, size, size)
  const grad = ctx.createRadialGradient(size / 2, size * 0.2, 10, size / 2, size * 0.2, size * 0.6)
  grad.addColorStop(0, 'rgba(220,240,255,0.35)')
  grad.addColorStop(1, 'rgba(220,240,255,0)')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  return tex
}

export function ElevatorLobby() {
  const wallTex = useMemo(() => makeWhiteTileTexture(), [])
  const reflTex = useMemo(() => makeReflectionTexture(), [])

  const midZ = (Z_START + Z_END) / 2   // −7
  const midY = H / 2                    // 1.4

  return (
    <group>
      {/* Overhead rectAreaLight — dying fluorescent ballast */}
      <rectAreaLight
        position={[0, H - 0.05, midZ]}
        width={1.2}
        height={0.3}
        intensity={5.0}
        color="#d8ecff"
        rotation={[-Math.PI / 2, 0, 0]}
      />
      {/* Fixture housing */}
      <mesh position={[0, H - 0.04, midZ]}>
        <boxGeometry args={[0.32, 0.06, 1.3]} />
        <meshStandardMaterial color="#d8d0be" roughness={0.65} />
      </mesh>
      {/* Tube emissive */}
      <mesh position={[0, H - 0.07, midZ]}>
        <boxGeometry args={[0.24, 0.02, 1.22]} />
        <meshStandardMaterial color="#f0f8ff" emissive="#c8deff" emissiveIntensity={1.6} />
      </mesh>

      {/* Floor */}
      <mesh position={[0, 0, midZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial map={wallTex} roughness={0.7} />
      </mesh>
      {/* Reflective floor overlay */}
      <mesh position={[0, 0.001, midZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#0a0e0a" roughness={0.05} metalness={0.45} transparent opacity={0.6} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, H, midZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[W, D]} />
        <meshStandardMaterial color="#e0dace" roughness={0.9} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-W / 2, midY, midZ]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial map={wallTex} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* Right wall */}
      <mesh position={[W / 2, midY, midZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[D, H]} />
        <meshStandardMaterial map={wallTex} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Back wall (toward corridor) */}
      <mesh position={[0, midY, Z_END]}>
        <planeGeometry args={[W, H]} />
        <meshStandardMaterial color="#c8c0b0" roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* Mirror plane on right wall — baked reflection texture */}
      <mesh position={[W / 2 - 0.01, 1.2, midZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.4, 1.8]} />
        <meshStandardMaterial
          map={reflTex}
          roughness={0.06}
          metalness={0.92}
          color="#c8d0c8"
        />
      </mesh>
      {/* Mirror frame (rust-edged) */}
      <mesh position={[W / 2 - 0.012, 1.2, midZ]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.5, 1.9]} />
        <meshStandardMaterial color="#5a4030" roughness={0.8} />
      </mesh>
    </group>
  )
}
