import { useMemo } from 'react'
import * as THREE from 'three'

const WALL_COLOR = '#f0e8d8'
const CEILING_COLOR = '#f8f2e4'
const MOLDING_COLOR = '#ffffff'

function makeParquetTexture(size = 1024): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Base warm wood
  ctx.fillStyle = '#8a6a42'
  ctx.fillRect(0, 0, size, size)

  // Herringbone pattern — alternating planks rotated ±45°
  const plankW = size / 20
  const plankH = plankW * 3

  const woodTones = ['#9a7a52', '#7a5a32', '#886242', '#a88862', '#6a4a28']

  for (let row = -2; row < 25; row++) {
    for (let col = -2; col < 25; col++) {
      const x = col * plankW * 1.5
      const y = row * plankW * 1.5

      ctx.save()
      ctx.translate(x + plankW / 2, y + plankW / 2)
      ctx.rotate((col + row) % 2 === 0 ? Math.PI / 4 : -Math.PI / 4)
      ctx.fillStyle = woodTones[(col + row * 3 + 25) % woodTones.length]
      ctx.fillRect(-plankH / 2, -plankW / 2, plankH, plankW)

      // Grain lines
      ctx.strokeStyle = 'rgba(40, 20, 10, 0.25)'
      ctx.lineWidth = 0.6
      for (let g = 0; g < 3; g++) {
        ctx.beginPath()
        const gy = -plankW / 2 + (g + 1) * (plankW / 4)
        ctx.moveTo(-plankH / 2, gy)
        ctx.lineTo(plankH / 2, gy + (Math.sin((col + row + g) * 1.73) * 1.5))
        ctx.stroke()
      }

      // Edge shadow
      ctx.strokeStyle = 'rgba(30, 15, 5, 0.4)'
      ctx.lineWidth = 1
      ctx.strokeRect(-plankH / 2, -plankW / 2, plankH, plankW)
      ctx.restore()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 3)
  return tex
}

export function MuseumRoom() {
  const parquetTex = useMemo(() => makeParquetTexture(), [])

  return (
    <group>
      {/* Herringbone parquet floor */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[6, 10]} />
        <meshStandardMaterial map={parquetTex} roughness={0.5} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 10]} />
        <meshStandardMaterial color={CEILING_COLOR} roughness={0.9} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-3, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} side={2} />
      </mesh>

      {/* Right wall */}
      <mesh position={[3, 2.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 5]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} side={2} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 2.5, -5]}>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} side={2} />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, 2.5, 5]}>
        <planeGeometry args={[6, 5]} />
        <meshStandardMaterial color={WALL_COLOR} roughness={0.85} side={2} />
      </mesh>

      {/* Crown molding */}
      {(
        [
          { pos: [0, 4.9, -5], args: [6, 0.15, 0.08] },
          { pos: [0, 4.9, 5], args: [6, 0.15, 0.08] },
          { pos: [-3, 4.9, 0], args: [0.08, 0.15, 10] },
          { pos: [3, 4.9, 0], args: [0.08, 0.15, 10] },
        ] as { pos: [number, number, number]; args: [number, number, number] }[]
      ).map((m, i) => (
        <mesh key={i} position={m.pos}>
          <boxGeometry args={m.args} />
          <meshStandardMaterial color={MOLDING_COLOR} roughness={0.6} />
        </mesh>
      ))}

      {/* Baseboard */}
      {(
        [
          { pos: [0, 0.08, -5], args: [6, 0.16, 0.04] },
          { pos: [0, 0.08, 5], args: [6, 0.16, 0.04] },
          { pos: [-3, 0.08, 0], args: [0.04, 0.16, 10] },
          { pos: [3, 0.08, 0], args: [0.04, 0.16, 10] },
        ] as { pos: [number, number, number]; args: [number, number, number] }[]
      ).map((m, i) => (
        <mesh key={i} position={m.pos}>
          <boxGeometry args={m.args} />
          <meshStandardMaterial color="#f0eae0" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}
