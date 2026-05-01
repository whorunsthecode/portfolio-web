import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { walledCityBus } from './bus'
import { CORRIDORS } from './SideCorridors'

// Concrete with black mold bloom, water streaks, torn posters. The key
// visual cue of the Walled City interior is how every surface records
// decades of wet, windowless life.

function makeConcreteTexture(size = 1024, opts: { mold?: boolean; streak?: boolean } = {}): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Base concrete — uneven mottled grey
  ctx.fillStyle = '#4a443a'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 1800; i++) {
    const x = Math.random() * size
    const y = Math.random() * size
    const r = 1 + Math.random() * 3
    const shade = 40 + Math.random() * 35
    ctx.fillStyle = `rgb(${shade}, ${shade - 4}, ${shade - 10})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Form-seam lines — vertical concrete-pour stripes every ~1/3 of height
  ctx.strokeStyle = 'rgba(25, 20, 15, 0.5)'
  ctx.lineWidth = 2
  for (let i = 1; i < 4; i++) {
    ctx.beginPath()
    ctx.moveTo((i * size) / 4, 0)
    ctx.lineTo((i * size) / 4, size)
    ctx.stroke()
  }

  if (opts.mold) {
    for (let i = 0; i < 40; i++) {
      const edge = Math.random() < 0.5 ? 0 : size
      const x = Math.random() < 0.5 ? edge + (Math.random() - 0.5) * 120 : Math.random() * size
      const y = Math.random() * size
      const r = 15 + Math.random() * 50
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, 'rgba(12, 16, 10, 0.6)')
      grad.addColorStop(1, 'rgba(12, 16, 10, 0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  if (opts.streak) {
    for (let i = 0; i < 12; i++) {
      const x = Math.random() * size
      const top = Math.random() * size * 0.5
      const h = size * (0.35 + Math.random() * 0.6)
      const grad = ctx.createLinearGradient(x, top, x, top + h)
      const rusty = Math.random() < 0.5
      const [r0, g0, b0] = rusty ? [90, 50, 22] : [30, 25, 18]
      grad.addColorStop(0, `rgba(${r0},${g0},${b0},0.55)`)
      grad.addColorStop(1, `rgba(${r0},${g0},${b0},0)`)
      ctx.fillStyle = grad
      ctx.fillRect(x - 3 - Math.random() * 3, top, 6 + Math.random() * 8, h)
    }
  }

  for (let i = 0; i < 8; i++) {
    ctx.fillStyle = `rgba(${180 + Math.random() * 40}, ${170 + Math.random() * 30}, ${140 + Math.random() * 30}, 0.35)`
    const x = Math.random() * size
    const y = Math.random() * size
    ctx.fillRect(x, y, 50 + Math.random() * 80, 70 + Math.random() * 70)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

const W = 1.8
const H = 3.8

// Explicit wall openings (for shop frontages — Sundry in entrance segment, BingSutt in deep).
// Corridors come from the CORRIDORS array imported above and apply automatically per-segment.
type SegmentOpening = { side: 'left' | 'right'; zMin: number; zMax: number; ceiling: number }

function Segment({
  centerX, zMin, zMax, hasFrontWall, hasBackWall, hasSkySlit,
  extraOpenings = [], wallTex, floorTex, ceilingTex, slitRef,
}: {
  centerX: number
  zMin: number
  zMax: number
  hasFrontWall: boolean
  hasBackWall: boolean
  hasSkySlit: boolean
  extraOpenings?: SegmentOpening[]
  wallTex: THREE.CanvasTexture
  floorTex: THREE.CanvasTexture
  ceilingTex: THREE.CanvasTexture
  slitRef?: React.RefObject<THREE.MeshStandardMaterial | null>
}) {
  const length = zMax - zMin
  const midZ = (zMin + zMax) / 2

  return (
    <group>
      {/* Floor */}
      <mesh position={[centerX, 0, midZ]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[W, length]} />
        <meshStandardMaterial map={floorTex} roughness={0.45} metalness={0.1} color={'#1e1a14'} />
      </mesh>

      {/* Ceiling — two panels with a gap in the middle for sky slit */}
      <mesh position={[centerX - W / 2 + 0.3, H, midZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, length]} />
        <meshStandardMaterial map={ceilingTex} roughness={0.95} color={'#2a261e'} />
      </mesh>
      <mesh position={[centerX + W / 2 - 0.3, H, midZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, length]} />
        <meshStandardMaterial map={ceilingTex} roughness={0.95} color={'#2a261e'} />
      </mesh>

      {/* Sky slit — only on segments where the rooftop is overhead (entrance segment) */}
      {hasSkySlit && (
        <mesh position={[centerX, H + 0.01, midZ]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.3, length]} />
          <meshStandardMaterial
            ref={slitRef}
            color={'#e8d890'}
            emissive={'#f8e4a0'}
            emissiveIntensity={1.2}
            roughness={1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Side walls — segments around openings (corridors + extra). */}
      {(['left', 'right'] as const).map((side) => {
        const sign = side === 'left' ? -1 : 1
        const rotY = sign * Math.PI / 2
        const wallX = centerX + sign * W / 2
        // Combine corridor openings (within this segment's z range, on this side)
        // with explicit extra openings.
        const corridorOpenings = CORRIDORS
          .filter((c) => c.side === side && c.z >= zMin && c.z <= zMax)
          .map((c) => ({ zMin: c.z - c.halfWidth, zMax: c.z + c.halfWidth, ceiling: c.ceiling }))
        const extras = extraOpenings
          .filter((o) => o.side === side)
          .map((o) => ({ zMin: o.zMin, zMax: o.zMax, ceiling: o.ceiling }))
        const openings = [...corridorOpenings, ...extras].sort((a, b) => a.zMin - b.zMin)

        const segs: { zMin: number; zMax: number }[] = []
        let cursor = zMin
        for (const o of openings) {
          if (o.zMin > cursor) segs.push({ zMin: cursor, zMax: o.zMin })
          cursor = o.zMax
        }
        if (cursor < zMax) segs.push({ zMin: cursor, zMax: zMax })

        return (
          <group key={side}>
            {segs.map((s, i) => {
              const w = s.zMax - s.zMin
              const cz = (s.zMin + s.zMax) / 2
              return (
                <mesh key={i} position={[wallX, H / 2, cz]} rotation={[0, rotY, 0]}>
                  <planeGeometry args={[w, H]} />
                  <meshStandardMaterial map={wallTex} roughness={0.9} color={'#3a342a'} side={THREE.DoubleSide} />
                </mesh>
              )
            })}
            {/* Top lintel over each opening */}
            {openings.map((o, i) => {
              const w = o.zMax - o.zMin
              const cz = (o.zMin + o.zMax) / 2
              const lintelH = H - o.ceiling
              return (
                <mesh
                  key={`lintel-${i}`}
                  position={[wallX, (o.ceiling + H) / 2, cz]}
                  rotation={[0, rotY, 0]}
                >
                  <planeGeometry args={[w, lintelH]} />
                  <meshStandardMaterial map={wallTex} roughness={0.9} color={'#3a342a'} side={THREE.DoubleSide} />
                </mesh>
              )
            })}
          </group>
        )
      })}

      {/* Back wall (z = zMin) */}
      {hasBackWall && (
        <mesh position={[centerX, H / 2, zMin]}>
          <planeGeometry args={[W, H]} />
          <meshStandardMaterial color={'#18140e'} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Front wall (z = zMax) — for the entrance closure behind player start */}
      {hasFrontWall && (
        <mesh position={[centerX, H / 2, zMax]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[W, H]} />
          <meshStandardMaterial color={'#1a1610'} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  )
}

/**
 * Alley shell — now built as 2 segments to support the dogleg geometry.
 * Entrance: z=+4.8 to z=−14, axis x=0 (with sky slit overhead).
 * Deep:     z=−30 to z=−16, axis x=−2 (no sky slit — gloomier per spec).
 * The dogleg between is rendered by AlleyDogleg.tsx.
 *
 * Shop frontages are punched as extraOpenings on the appropriate segment:
 *   Sundry  — entrance segment, left wall, z=−8 to −5
 *   BingSutt — deep segment, right wall, z=−22 to −18
 */
export function AlleyShell() {
  const wallTex = useMemo(() => makeConcreteTexture(1024, { mold: true, streak: true }), [])
  const floorTex = useMemo(() => makeConcreteTexture(1024, { mold: true }), [])
  const ceilingTex = useMemo(() => makeConcreteTexture(512, { mold: true }), [])

  const slitRef = useRef<THREE.MeshStandardMaterial>(null)
  useFrame(() => {
    if (slitRef.current) {
      slitRef.current.emissiveIntensity = 1.2 * (1 - 0.8 * walledCityBus.flyoverK)
    }
  })

  return (
    <group>
      {/* Entrance segment — z=+4.8 (front wall, behind player start) to z=−14 (open to dogleg) */}
      <Segment
        centerX={0}
        zMin={-14}
        zMax={4.8}
        hasFrontWall={true}
        hasBackWall={false}
        hasSkySlit={true}
        extraOpenings={[
          // Sundry shop frontage — left wall at z=−8 to −5
          { side: 'left', zMin: -8, zMax: -5, ceiling: 2.8 },
        ]}
        wallTex={wallTex}
        floorTex={floorTex}
        ceilingTex={ceilingTex}
        slitRef={slitRef}
      />
      {/* Deep segment — z=−30 (dead end, blocked by FruitStall) to z=−16 (open to dogleg) */}
      <Segment
        centerX={-2}
        zMin={-30}
        zMax={-16}
        hasFrontWall={false}
        hasBackWall={false}
        hasSkySlit={false}
        extraOpenings={[
          // BingSutt walk-in entrance — right wall at z=−22 to −18
          { side: 'right', zMin: -22, zMax: -18, ceiling: 2.8 },
        ]}
        wallTex={wallTex}
        floorTex={floorTex}
        ceilingTex={ceilingTex}
      />
    </group>
  )
}
