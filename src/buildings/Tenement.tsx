import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import CustomShaderMaterial from 'three-custom-shader-material'
import { facadeVertexShader, facadeFragmentShader } from './facadeShader'
import { useStore } from '../store'
import { makeTextTexture } from '../cabin/TextTexture'

/* ── Style presets ──────────────────────────────────────── */
export interface TenementStyle {
  wallColor: [number, number, number]
  floors: number
  windowsPerFloor: number
}

export const TENEMENT_STYLES: TenementStyle[] = [
  { wallColor: [0.78, 0.72, 0.62], floors: 5, windowsPerFloor: 6 },  // warm beige
  { wallColor: [0.68, 0.74, 0.72], floors: 6, windowsPerFloor: 5 },  // grey-green
  { wallColor: [0.82, 0.76, 0.65], floors: 4, windowsPerFloor: 7 },  // sandy
  { wallColor: [0.72, 0.65, 0.60], floors: 7, windowsPerFloor: 5 },  // brown-grey
  { wallColor: [0.75, 0.70, 0.68], floors: 5, windowsPerFloor: 6 },  // concrete
  { wallColor: [0.80, 0.72, 0.58], floors: 6, windowsPerFloor: 4 },  // ochre
  { wallColor: [0.65, 0.68, 0.72], floors: 5, windowsPerFloor: 5 },  // blue-grey
]

const SHOP_NAMES = ['茶餐廳', '藥房', '雜貨', '涼茶', '麵家', '粥店', '餅店', '洗衣', '士多', '五金']

/* ── Seeded random helper ──────────────────────────────── */
function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

/* ── AC units on roof ──────────────────────────────────── */
function RoofACUnits({ width, depth, roofY, seed }: {
  width: number; depth: number; roofY: number; seed: number
}) {
  const units = useMemo(() => {
    const r = seededRandom(seed + 333)
    const count = 3 + Math.floor(r() * 3)
    return Array.from({ length: count }, () => ({
      x: (r() - 0.5) * (width - 1),
      z: (r() - 0.5) * (depth - 1),
    }))
  }, [seed, width, depth])

  return (
    <group position={[0, roofY + 0.2, 0]}>
      {units.map((u, i) => (
        <mesh key={i} position={[u.x, 0, u.z]} castShadow>
          <boxGeometry args={[0.6, 0.4, 0.3]} />
          <meshStandardMaterial color="#8a8a8a" roughness={0.7} metalness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

/* ── Wall-mounted AC units ─────────────────────────────── */
function WallACUnits({ width, height, floors, seed, side }: {
  width: number; height: number; floors: number; seed: number; side: 'left' | 'right'
}) {
  const facadeX = side === 'left' ? -width / 2 : width / 2
  const outDir = side === 'left' ? -1 : 1

  const units = useMemo(() => {
    const r = seededRandom(seed + 555)
    const count = 2 + Math.floor(r() * 3)
    return Array.from({ length: count }, () => {
      const floor = 1 + Math.floor(r() * (floors - 1))
      const y = (floor / floors) * height - 0.3
      const z = (r() - 0.5) * width * 0.5
      return { y, z }
    })
  }, [seed, floors, height, width])

  return (
    <group>
      {units.map((u, i) => (
        <mesh key={i} position={[facadeX + outDir * 0.2, u.y, u.z]} castShadow>
          <boxGeometry args={[0.3, 0.4, 0.6]} />
          <meshStandardMaterial color="#9a9a9a" roughness={0.7} metalness={0.15} />
        </mesh>
      ))}
    </group>
  )
}

/* ── Shop sign ─────────────────────────────────────────── */
function ShopSign({ width, seed, facadeZ, side }: {
  width: number; seed: number; facadeZ: number; side: 'left' | 'right'
}) {
  const r = useMemo(() => seededRandom(seed + 111), [seed])

  const tex = useMemo(() => {
    const rr = seededRandom(seed + 111)
    const name = SHOP_NAMES[Math.floor(rr() * SHOP_NAMES.length)]
    return makeTextTexture({
      text: name,
      fontSize: 64,
      color: '#ffd78c',
      width: 256,
      height: 96,
      background: '#1a1210',
    })
  }, [seed])

  const signX = side === 'left' ? width / 2 + 0.01 : -width / 2 - 0.01
  const rotY = side === 'left' ? -Math.PI / 2 : Math.PI / 2

  return (
    <group position={[0, 1.2, 0]}>
      {/* Vertical hanging sign */}
      <mesh position={[signX, 0, 0]} rotation={[0, rotY, 0]}>
        <planeGeometry args={[0.9, 0.5]} />
        <meshStandardMaterial map={tex} roughness={0.8} />
      </mesh>
    </group>
  )
}

/* ── Tenement building ─────────────────────────────────── */
interface TenementProps {
  position: [number, number, number]
  width?: number
  depth?: number
  side: 'left' | 'right'
  style: TenementStyle
  seed: number
}

export function Tenement({ position, width = 9, depth = 7, side, style, seed }: TenementProps) {
  const matRef = useRef<any>(null)
  const mode = useStore((s) => s.mode)
  const targetLit = mode === 'night' ? 0.65 : 0
  const currentLit = useRef(mode === 'night' ? 0.65 : 0)

  const height = style.floors * 3 + 3

  useFrame((_, delta) => {
    if (!matRef.current) return
    const diff = targetLit - currentLit.current
    if (Math.abs(diff) > 0.001) {
      currentLit.current += diff * Math.min(4 * delta * 3, 1)
      matRef.current.uniforms.uLitFraction.value = currentLit.current
    }
  })

  const uniforms = useMemo(() => ({
    uFloors: { value: style.floors },
    uWindowsPerFloor: { value: style.windowsPerFloor },
    uWallColor: { value: new THREE.Vector3(...style.wallColor) },
    uLitFraction: { value: mode === 'night' ? 0.65 : 0 },
    uSeed: { value: seed * 0.1 },
  }), []) // intentionally stable — updated via ref in useFrame

  // Facade faces the road
  const rotY = side === 'left' ? Math.PI / 2 : -Math.PI / 2

  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Main building box */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <CustomShaderMaterial
          ref={matRef}
          baseMaterial={THREE.MeshStandardMaterial}
          vertexShader={facadeVertexShader}
          fragmentShader={facadeFragmentShader}
          uniforms={uniforms}
          roughness={0.85}
        />
      </mesh>

      {/* Roof — grey slab */}
      <mesh position={[0, height + 0.05, 0]}>
        <boxGeometry args={[width + 0.2, 0.1, depth + 0.2]} />
        <meshStandardMaterial color="#6a6a6a" roughness={0.9} />
      </mesh>

      <RoofACUnits width={width} depth={depth} roofY={height} seed={seed} />
      <WallACUnits width={width} height={height} floors={style.floors} seed={seed} side={side} />
      {/* Laundry removed — the per-building bamboo poles with cloth
          strips were reading as small red "flags" jutting off every
          facade, competing with the neon signs. */}
      <ShopSign width={width} seed={seed} facadeZ={0} side={side} />
    </group>
  )
}
