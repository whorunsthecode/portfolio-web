import { useMemo } from 'react'
import * as THREE from 'three'
import { makeTextTexture } from '../../cabin/TextTexture'

/**
 * Sheung Wan wet market stalls — low colonial-era market buildings
 * with canvas awnings, crates, and signage.
 */

function seededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

const STALL_NAMES = ['海味', '乾貨', '參茸', '燕窩', '鮑魚', '花膠', '藥材', '香料']
const AWNING_COLORS = ['#c0392b', '#2e7d32', '#1565c0', '#e65100', '#6a1b9a']

function Stall({ x, z, seed }: { x: number; z: number; seed: number }) {
  const awningColor = useMemo(() => {
    const rr = seededRandom(seed)
    return AWNING_COLORS[Math.floor(rr() * AWNING_COLORS.length)]
  }, [seed])

  const signTex = useMemo(() => {
    const rr = seededRandom(seed + 100)
    const name = STALL_NAMES[Math.floor(rr() * STALL_NAMES.length)]
    return makeTextTexture({
      text: name,
      fontSize: 56,
      color: '#ffd78c',
      width: 128,
      height: 96,
      background: '#2a1a10',
    })
  }, [seed])

  return (
    <group position={[x, 0, z]}>
      {/* Main building — low, 2 floors */}
      <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[5, 9, 6]} />
        <meshStandardMaterial color="#d4c8b0" roughness={0.9} />
      </mesh>

      {/* Canvas awning extending over sidewalk */}
      <mesh position={[x > 0 ? -3.5 : 3.5, 3.2, 0]} rotation={[0.15 * (x > 0 ? 1 : -1), 0, 0]}>
        <planeGeometry args={[2.5, 5]} />
        <meshStandardMaterial color={awningColor} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      {/* Vertical sign */}
      <mesh position={[x > 0 ? -2.6 : 2.6, 5, 0]} rotation={[0, x > 0 ? Math.PI / 2 : -Math.PI / 2, 0]}>
        <planeGeometry args={[0.8, 1.5]} />
        <meshStandardMaterial map={signTex} roughness={0.8} />
      </mesh>

      {/* Wooden crates at ground level */}
      {[0, 1.2, -1.5].map((dz, i) => (
        <mesh key={i} position={[x > 0 ? -2.8 : 2.8, 0.3, dz]}>
          <boxGeometry args={[0.6, 0.6, 0.5]} />
          <meshStandardMaterial color="#8a7050" roughness={0.9} />
        </mesh>
      ))}

      {/* Windows — simple dark rectangles */}
      {[-1.2, 1.2].map((dz) => (
        <mesh key={dz} position={[x > 0 ? -2.51 : 2.51, 6.5, dz]}>
          <planeGeometry args={[1, 1.3]} />
          <meshStandardMaterial color="#1a2028" />
        </mesh>
      ))}
    </group>
  )
}

export function SheungWanStalls() {
  return (
    <group>
      <Stall x={-8} z={0} seed={701} />
      <Stall x={-8} z={-7} seed={702} />
      <Stall x={8} z={-3} seed={703} />
      <Stall x={8} z={-10} seed={704} />
    </group>
  )
}
