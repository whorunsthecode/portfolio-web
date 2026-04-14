import { useMemo } from 'react'
import * as THREE from 'three'

const WOOD = '#5c3a1e'

/**
 * Procedural diagonal-weave caned rattan texture.
 * Generates a canvas-based texture with interlocking diagonal strips.
 */
function makeCanedTex(size = 128): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Base rattan color
  ctx.fillStyle = '#c4a66a'
  ctx.fillRect(0, 0, size, size)

  const strip = size / 8
  const colors = ['#b8965a', '#d4b478', '#a88848', '#c0a060']

  // Diagonal weave pattern
  for (let pass = 0; pass < 2; pass++) {
    const angle = pass === 0 ? Math.PI / 4 : -Math.PI / 4
    ctx.save()
    ctx.translate(size / 2, size / 2)
    ctx.rotate(angle)
    ctx.translate(-size, -size)

    for (let i = -16; i < 32; i++) {
      ctx.fillStyle = colors[((i % colors.length) + colors.length) % colors.length]
      ctx.globalAlpha = pass === 0 ? 0.5 : 0.35
      ctx.fillRect(i * strip, -size, strip * 0.7, size * 4)
    }
    ctx.restore()
  }

  // Subtle noise for realism
  ctx.globalAlpha = 0.08
  for (let y = 0; y < size; y += 2) {
    for (let x = 0; x < size; x += 2) {
      const v = Math.random() * 255
      ctx.fillStyle = `rgb(${v},${v},${v})`
      ctx.fillRect(x, y, 2, 2)
    }
  }

  ctx.globalAlpha = 1

  // Weave intersection dots
  ctx.fillStyle = '#8a7040'
  ctx.globalAlpha = 0.3
  for (let y = 0; y < size; y += strip) {
    for (let x = 0; x < size; x += strip) {
      ctx.beginPath()
      ctx.arc(x + strip / 2, y + strip / 2, strip * 0.15, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 3)
  return tex
}

/* ── Single seat ───────────────────────────────────────── */
function Seat({ position, rattanMap }: { position: [number, number, number]; rattanMap: THREE.Texture }) {
  return (
    <group position={position}>
      {/* Wooden slat backrest */}
      <mesh position={[0, 0.42, -0.18]} castShadow>
        <boxGeometry args={[0.4, 0.5, 0.03]} />
        <meshStandardMaterial color={WOOD} roughness={0.85} />
      </mesh>
      {/* Backrest slat detail lines */}
      {[-0.12, 0, 0.12].map((xOff) => (
        <mesh key={xOff} position={[xOff, 0.42, -0.165]}>
          <boxGeometry args={[0.02, 0.44, 0.005]} />
          <meshStandardMaterial color="#4a2a10" roughness={0.9} />
        </mesh>
      ))}

      {/* Rattan cushion */}
      <mesh position={[0, 0.14, 0]} castShadow>
        <boxGeometry args={[0.4, 0.06, 0.38]} />
        <meshStandardMaterial map={rattanMap} roughness={0.75} />
      </mesh>

      {/* Seat frame (under cushion) */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[0.42, 0.04, 0.4]} />
        <meshStandardMaterial color={WOOD} roughness={0.85} />
      </mesh>

      {/* Legs */}
      {[
        [-0.16, 0, 0.14],
        [0.16, 0, 0.14],
        [-0.16, 0, -0.14],
        [0.16, 0, -0.14],
      ].map(([x, _, z], i) => (
        <mesh key={i} position={[x, -0.16, z]}>
          <boxGeometry args={[0.04, 0.44, 0.04]} />
          <meshStandardMaterial color={WOOD} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

/* ── All seats: 5 rows × 2 sides ──────────────────────── */
export function Seats() {
  const rattanMap = useMemo(() => makeCanedTex(), [])

  const rows = 4
  const rowSpacing = 1.5
  const startZ = -7.0  // front row just behind camera at z=-7.6
  const seatX = 0.7

  return (
    <group>
      {Array.from({ length: rows }, (_, row) => {
        const z = startZ + row * rowSpacing
        return (
          <group key={row}>
            <Seat position={[seatX, 0.56, z]} rattanMap={rattanMap} />
            <Seat position={[-seatX, 0.56, z]} rattanMap={rattanMap} />
          </group>
        )
      })}
    </group>
  )
}
