import { useMemo } from 'react'
import * as THREE from 'three'

const GLASS_TINT = '#88c0d0'
const TANK_FRAME = '#1a1818'
const SAND_BOTTOM = '#e4c898'

/**
 * Vertical ocean-water gradient texture painted to a CanvasTexture.
 * Gives the tank walls a proper deep-ocean feel: sunlit teal at the top
 * fading to deep sapphire at the bottom, with subtle noise to avoid
 * banding. Used on all four wall planes.
 */
function useOceanGradientTexture() {
  return useMemo(() => {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    // Multi-stop vertical gradient — from surface-light teal to abyssal indigo
    const g = ctx.createLinearGradient(0, 0, 0, size)
    g.addColorStop(0.0, '#9ee4e8')   // sunlit surface
    g.addColorStop(0.15, '#5aaac8')  // shallow turquoise
    g.addColorStop(0.4, '#2a6a9a')   // mid-ocean blue
    g.addColorStop(0.7, '#183a68')   // deep sapphire
    g.addColorStop(1.0, '#0a1a40')   // abyssal indigo
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 64, size)

    // Very subtle vertical noise streaks to break banding
    ctx.globalAlpha = 0.06
    for (let i = 0; i < 500; i++) {
      const y = Math.random() * size
      const w = 1 + Math.random() * 2
      const hue = Math.floor(180 + Math.random() * 40)
      ctx.strokeStyle = `rgb(${hue}, ${hue + 20}, ${hue + 40})`
      ctx.lineWidth = w
      ctx.beginPath()
      ctx.moveTo(Math.random() * 64, y)
      ctx.lineTo(Math.random() * 64, y + 20)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // Light god-ray streaks near the top
    ctx.globalAlpha = 0.22
    for (let i = 0; i < 8; i++) {
      const x = Math.random() * 64
      const rayGrad = ctx.createLinearGradient(x, 0, x + (Math.random() - 0.5) * 30, 150)
      rayGrad.addColorStop(0, 'rgba(220, 240, 255, 0.65)')
      rayGrad.addColorStop(1, 'rgba(220, 240, 255, 0)')
      ctx.fillStyle = rayGrad
      ctx.beginPath()
      ctx.moveTo(x - 1, 0)
      ctx.lineTo(x + 1, 0)
      ctx.lineTo(x + 8 + (Math.random() - 0.5) * 10, 150)
      ctx.lineTo(x + 4, 150)
      ctx.closePath()
      ctx.fill()
    }
    ctx.globalAlpha = 1

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.ClampToEdgeWrapping
    tex.needsUpdate = true
    return tex
  }, [])
}

/**
 * Caustic-pattern texture for the tank floor — rippling light patches
 * from above. Procedurally generated with overlapping soft circles.
 */
function useSandCausticTexture() {
  return useMemo(() => {
    const size = 512
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    // Base sand
    ctx.fillStyle = SAND_BOTTOM
    ctx.fillRect(0, 0, size, size)

    // Sand grain noise
    ctx.globalAlpha = 0.4
    for (let i = 0; i < 5000; i++) {
      const g = Math.floor(180 + Math.random() * 60)
      ctx.fillStyle = `rgb(${g + 20}, ${g + 10}, ${g - 20})`
      ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2)
    }
    ctx.globalAlpha = 1

    // Caustic light patches — soft radial gradients
    for (let i = 0; i < 60; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      const r = 20 + Math.random() * 60
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, 'rgba(255, 245, 200, 0.45)')
      grad.addColorStop(0.6, 'rgba(255, 230, 180, 0.12)')
      grad.addColorStop(1, 'rgba(255, 230, 180, 0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    // Darker shadow patches for depth
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * size
      const y = Math.random() * size
      const r = 30 + Math.random() * 80
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, 'rgba(80, 60, 40, 0.2)')
      grad.addColorStop(1, 'rgba(80, 60, 40, 0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }

    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(2, 2)
    return tex
  }, [])
}

export function TankInterior() {
  const waterTex = useOceanGradientTexture()
  const sandTex = useSandCausticTexture()

  return (
    <group>
      {/* ═══ BACKDROP WATER COLUMN — gradient texture on a big
             enclosing dome instead of flat blue. Gives depth feel. ═══ */}
      <mesh position={[0, 2, 0]}>
        <sphereGeometry args={[18, 32, 24, 0, Math.PI * 2, 0, Math.PI / 1.2]} />
        <meshBasicMaterial map={waterTex} side={THREE.BackSide} />
      </mesh>

      {/* ═══ GLASS WALLS ═══ */}
      {[
        { pos: [0, 1.5, 6] as const, rot: [0, 0, 0] as const, size: [10, 6] as const },
        { pos: [0, 1.5, -6] as const, rot: [0, Math.PI, 0] as const, size: [10, 6] as const },
        { pos: [-5, 1.5, 0] as const, rot: [0, Math.PI / 2, 0] as const, size: [12, 6] as const },
        { pos: [5, 1.5, 0] as const, rot: [0, -Math.PI / 2, 0] as const, size: [12, 6] as const },
      ].map((w, i) => (
        <mesh key={i} position={w.pos} rotation={w.rot}>
          <planeGeometry args={w.size} />
          <meshPhysicalMaterial
            color={GLASS_TINT}
            transparent
            opacity={0.08}
            roughness={0.02}
            transmission={0.95}
            thickness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* ═══ BLACK TANK FRAME ═══ */}
      {[
        { pos: [0, 4.5, 6] as const, size: [10, 0.12, 0.12] as const },
        { pos: [0, 4.5, -6] as const, size: [10, 0.12, 0.12] as const },
        { pos: [-5, 4.5, 0] as const, size: [0.12, 0.12, 12] as const },
        { pos: [5, 4.5, 0] as const, size: [0.12, 0.12, 12] as const },
        { pos: [0, -1.5, 6] as const, size: [10, 0.12, 0.12] as const },
        { pos: [0, -1.5, -6] as const, size: [10, 0.12, 0.12] as const },
        { pos: [-5, -1.5, 0] as const, size: [0.12, 0.12, 12] as const },
        { pos: [5, -1.5, 0] as const, size: [0.12, 0.12, 12] as const },
        { pos: [-5, 1.5, 6] as const, size: [0.12, 6, 0.12] as const },
        { pos: [5, 1.5, 6] as const, size: [0.12, 6, 0.12] as const },
        { pos: [-5, 1.5, -6] as const, size: [0.12, 6, 0.12] as const },
        { pos: [5, 1.5, -6] as const, size: [0.12, 6, 0.12] as const },
      ].map((edge, i) => (
        <mesh key={i} position={[edge.pos[0], edge.pos[1], edge.pos[2]]}>
          <boxGeometry args={[edge.size[0], edge.size[1], edge.size[2]]} />
          <meshStandardMaterial color={TANK_FRAME} roughness={0.55} metalness={0.45} />
        </mesh>
      ))}

      {/* ═══ SAND BOTTOM with caustic light patches ═══ */}
      <mesh position={[0, -1.4, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 12]} />
        <meshStandardMaterial map={sandTex} roughness={0.85} />
      </mesh>

      {/* ═══ SEAGRASS clusters ═══ */}
      {[
        { x: -3, z: 2, h: 2.0, count: 5 },
        { x: -2, z: -1, h: 1.5, count: 4 },
        { x: 3, z: 3, h: 1.8, count: 5 },
        { x: 2.5, z: -2, h: 2.2, count: 6 },
        { x: -3.5, z: -3, h: 1.6, count: 4 },
        { x: 0, z: -4, h: 2.0, count: 5 },
      ].map((g, i) => (
        <group key={i} position={[g.x, -1.4, g.z]}>
          {Array.from({ length: g.count }).map((_, j) => {
            const offset = (j - g.count / 2) * 0.06
            const bend = Math.sin(i * 12 + j * 7) * 0.15
            return (
              <mesh
                key={j}
                position={[offset, g.h / 2, j % 2 === 0 ? 0.04 : -0.02]}
                rotation={[0, 0, bend]}
              >
                <boxGeometry args={[0.025, g.h, 0.025]} />
                <meshStandardMaterial
                  color={j % 2 === 0 ? '#2a7840' : '#3a9a50'}
                  roughness={0.85}
                />
              </mesh>
            )
          })}
        </group>
      ))}

      {/* ═══ GOD-RAY light cones — wider and more subtle than before ═══ */}
      {[
        { x: -2.5, z: 1, w: 1.2, h: 7 },
        { x: 1.5, z: -1, w: 1.0, h: 7 },
        { x: 0.5, z: 2.5, w: 0.9, h: 7 },
        { x: -1, z: -3, w: 1.1, h: 7 },
      ].map((b, i) => (
        <mesh key={i} position={[b.x, 1.5, b.z]}>
          <coneGeometry args={[b.w, b.h, 16, 1, true]} />
          <meshBasicMaterial
            color="#c4e8f4"
            transparent
            opacity={0.05}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* ═══ WATER SURFACE with subtle ripple detail ═══ */}
      <mesh position={[0, 4.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 12]} />
        <meshBasicMaterial color="#88c4d8" transparent opacity={0.28} />
      </mesh>
      {/* Bright undersurface shimmer */}
      <mesh position={[0, 4.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 12]} />
        <meshBasicMaterial color="#dff4ff" transparent opacity={0.12} />
      </mesh>

      {/* ═══ Scattered rocks ═══ */}
      {[
        { x: -1.5, z: 1, s: 0.13 },
        { x: 2, z: -2, s: 0.1 },
        { x: -2, z: -1, s: 0.15 },
        { x: 1, z: 1.5, s: 0.11 },
        { x: -0.5, z: -3, s: 0.14 },
        { x: 3.5, z: 0, s: 0.09 },
      ].map((r, i) => (
        <mesh key={i} position={[r.x, -1.35 + r.s * 0.5, r.z]}>
          <sphereGeometry args={[r.s, 10, 10]} />
          <meshStandardMaterial color="#a89068" roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}
