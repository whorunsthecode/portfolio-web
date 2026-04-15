import { useMemo } from 'react'
import * as THREE from 'three'

const LIME = '#b8d848'
const LIME_DARK = '#98b838'
const MIRROR = '#c8d4d8'

// Deterministic pseudo-random so the wear pattern is stable across renders
function seededRand(i: number) {
  return (Math.sin(i * 12.9898) * 43758.5453) % 1
}

function makeRubberFloorTex(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Base rubber
  ctx.fillStyle = '#2a2824'
  ctx.fillRect(0, 0, size, size)

  // Grid tile lines
  const tileSize = size / 16
  ctx.strokeStyle = '#1a1814'
  ctx.lineWidth = 1.5
  for (let i = 0; i <= 16; i++) {
    ctx.beginPath()
    ctx.moveTo(i * tileSize, 0)
    ctx.lineTo(i * tileSize, size)
    ctx.moveTo(0, i * tileSize)
    ctx.lineTo(size, i * tileSize)
    ctx.stroke()
  }

  // Scattered wear marks (deterministic)
  for (let i = 0; i < 200; i++) {
    const rx = Math.abs(seededRand(i * 2 + 1))
    const ry = Math.abs(seededRand(i * 2 + 2))
    const rr = Math.abs(seededRand(i * 3 + 5))
    const x = rx * size
    const y = ry * size
    const r = rr * 3
    ctx.fillStyle = `rgba(30, 24, 18, 0.4)`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 4)
  return tex
}

export function GymRoom() {
  const floorTex = useMemo(() => makeRubberFloorTex(), [])

  const frameBits: { pos: [number, number, number]; size: [number, number, number] }[] = [
    { pos: [3.48, 3.9, 0], size: [0.04, 0.1, 10] },
    { pos: [3.48, 0.1, 0], size: [0.04, 0.1, 10] },
    { pos: [3.48, 2, -4.95], size: [0.04, 4, 0.1] },
    { pos: [3.48, 2, 4.95], size: [0.04, 4, 0.1] },
  ]

  const wainscoting: { pos: [number, number, number]; size: [number, number, number] }[] = [
    { pos: [-3.48, 0.4, 0], size: [0.04, 0.8, 10] },
    { pos: [0, 0.4, -4.97], size: [7, 0.8, 0.04] },
  ]

  return (
    <group>
      {/* Rubber floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[7, 10]} />
        <meshStandardMaterial map={floorTex} roughness={0.9} />
      </mesh>

      {/* Lime ceiling */}
      <mesh position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[7, 10]} />
        <meshStandardMaterial color={LIME} roughness={0.7} />
      </mesh>

      {/* Left wall — lime painted */}
      <mesh position={[-3.5, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color={LIME} roughness={0.8} side={2} />
      </mesh>

      {/* Right wall — the mirror */}
      <mesh position={[3.5, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial
          color={MIRROR}
          roughness={0.1}
          metalness={0.6}
          envMapIntensity={1.5}
          side={2}
        />
      </mesh>

      {/* Mirror frame */}
      {frameBits.map((f, i) => (
        <mesh key={i} position={f.pos}>
          <boxGeometry args={f.size} />
          <meshStandardMaterial color="#1a1a18" />
        </mesh>
      ))}

      {/* Back wall — behind the yoga mat */}
      <mesh position={[0, 2, -5]}>
        <planeGeometry args={[7, 4]} />
        <meshStandardMaterial color={LIME} roughness={0.8} side={2} />
      </mesh>

      {/* Front wall (behind camera) */}
      <mesh position={[0, 2, 5]}>
        <planeGeometry args={[7, 4]} />
        <meshStandardMaterial color={LIME_DARK} roughness={0.8} side={2} />
      </mesh>

      {/* Darker lime wainscoting */}
      {wainscoting.map((w, i) => (
        <mesh key={i} position={w.pos}>
          <boxGeometry args={w.size} />
          <meshStandardMaterial color={LIME_DARK} roughness={0.85} />
        </mesh>
      ))}

      {/* Fluorescent tube fixtures — visible housings + emissive strip
          Lighting is handled by GymLighting with point/spot lights to
          avoid rectAreaLight's uniform-init requirement. */}
      {[-3, -1, 1, 3].map((z, i) => (
        <group key={i} position={[0, 3.9, z]}>
          {/* Housing */}
          <mesh>
            <boxGeometry args={[2, 0.1, 0.3]} />
            <meshStandardMaterial color="#d8d8d0" />
          </mesh>
          {/* Emissive light surface */}
          <mesh position={[0, -0.06, 0]}>
            <boxGeometry args={[1.9, 0.04, 0.26]} />
            <meshBasicMaterial color="#f0f8d8" />
          </mesh>
          {/* A subtle downward fill so the strip feels lit */}
          <pointLight
            position={[0, -0.1, 0]}
            color="#e8f0d0"
            intensity={0.6}
            distance={5}
            decay={2}
          />
        </group>
      ))}
    </group>
  )
}
