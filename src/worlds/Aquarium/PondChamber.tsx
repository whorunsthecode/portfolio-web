import { useMemo } from 'react'
import * as THREE from 'three'

function makePixelRockTex(size = 256): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  const pixelSize = 8
  const palette = ['#3a3830', '#4a4638', '#5a5248', '#6a6050', '#2a2820']

  for (let y = 0; y < size; y += pixelSize) {
    for (let x = 0; x < size; x += pixelSize) {
      // Deterministic pseudo-random
      const seed = Math.sin(x * 0.3 + y * 0.17) * 12345
      const colorIdx = Math.floor(Math.abs(seed) % palette.length)
      ctx.fillStyle = palette[colorIdx]
      ctx.fillRect(x, y, pixelSize, pixelSize)
    }
  }

  // Deterministic moss patches
  for (let i = 0; i < 20; i++) {
    const sx = (Math.sin(i * 12.9898) * 0.5 + 0.5) * size
    const sy = (Math.sin(i * 78.233) * 0.5 + 0.5) * size
    const x = Math.floor(sx / pixelSize) * pixelSize
    const y = Math.floor(sy / pixelSize) * pixelSize
    ctx.fillStyle = i % 2 === 0 ? '#3a7040' : '#2a5030'
    ctx.fillRect(x, y, pixelSize, pixelSize)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.magFilter = THREE.NearestFilter
  tex.minFilter = THREE.NearestFilter
  tex.repeat.set(2, 1)
  return tex
}

export function PondChamber() {
  const rockTex = useMemo(() => makePixelRockTex(), [])

  const mountains: { x: number; w: number; h: number }[] = [
    { x: -3, w: 2.5, h: 0.5 },
    { x: -1, w: 2, h: 0.35 },
    { x: 0.8, w: 1.8, h: 0.4 },
    { x: 3.2, w: 2.2, h: 0.45 },
  ]

  // Deterministic foam speck jitter
  const foam = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => ({
        x: -4 + i * 0.42,
        yJitter: (Math.sin(i * 37.19) * 0.5) * 0.02,
      })),
    [],
  )

  return (
    <group>
      {/* Below-water backdrop — deep blue */}
      <mesh position={[0, -1, -1.5]}>
        <planeGeometry args={[10, 2.2]} />
        <meshBasicMaterial color="#2a4868" />
      </mesh>

      {/* Below-water gradient — lighter band near the surface */}
      <mesh position={[0, -0.3, -1.4]}>
        <planeGeometry args={[10, 1.0]} />
        <meshBasicMaterial color="#3a6888" transparent opacity={0.7} />
      </mesh>

      {/* Pond floor — pixelated rock */}
      <mesh position={[0, -2, -1]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[9, 3]} />
        <meshBasicMaterial map={rockTex} />
      </mesh>

      {/* Left side wall */}
      <mesh position={[-4.5, -1, -1]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[3, 2]} />
        <meshBasicMaterial map={rockTex} />
      </mesh>

      {/* Right side wall */}
      <mesh position={[4.5, -1, -1]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[3, 2]} />
        <meshBasicMaterial map={rockTex} />
      </mesh>

      {/* Water surface line */}
      <mesh position={[0, 0.02, -1.3]}>
        <planeGeometry args={[10, 0.04]} />
        <meshBasicMaterial color="#a8d4e8" />
      </mesh>

      {/* White foam specks along the surface */}
      {foam.map((f, i) => (
        <mesh key={i} position={[f.x, 0.02 + f.yJitter, -1.25]}>
          <boxGeometry args={[0.08, 0.04, 0.02]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Sunset sky bands */}
      <mesh position={[0, 1.5, -2]}>
        <planeGeometry args={[12, 0.6]} />
        <meshBasicMaterial color="#f8b06a" />
      </mesh>
      <mesh position={[0, 0.9, -2]}>
        <planeGeometry args={[12, 0.6]} />
        <meshBasicMaterial color="#f47858" />
      </mesh>
      <mesh position={[0, 0.3, -2]}>
        <planeGeometry args={[12, 0.6]} />
        <meshBasicMaterial color="#fcc880" />
      </mesh>

      {/* Pixelated sun — two layered discs */}
      <mesh position={[2.5, 0.4, -1.95]}>
        <circleGeometry args={[0.35, 12]} />
        <meshBasicMaterial color="#ffe4a0" />
      </mesh>
      <mesh position={[2.5, 0.4, -1.94]}>
        <circleGeometry args={[0.22, 10]} />
        <meshBasicMaterial color="#fff4d4" />
      </mesh>

      {/* Distant mountain silhouettes */}
      {mountains.map((m, i) => (
        <mesh key={i} position={[m.x, 0.05 + m.h / 2, -1.98]}>
          <boxGeometry args={[m.w, m.h, 0.02]} />
          <meshBasicMaterial color="#9a5a58" />
        </mesh>
      ))}
    </group>
  )
}
