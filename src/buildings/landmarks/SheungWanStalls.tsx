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
  // Toward-road direction: inward for left (+x), inward for right (-x)
  const inward = x > 0 ? -1 : 1

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

  // Low 2-storey market building — height reduced from 9 to 5.4 so a
  // close pass doesn't fill the tram windows with a uniform tan wall.
  const H = 5.4
  const W_BLD = 4
  const D_BLD = 4
  const halfW = W_BLD / 2
  // Road-facing face sits at inward * halfW in local x
  const faceX = inward * halfW

  return (
    <group position={[x, 0, z]}>
      {/* Ground floor — darker base */}
      <mesh position={[0, 1.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[W_BLD, 2.2, D_BLD]} />
        <meshStandardMaterial color="#8a6a48" roughness={0.9} />
      </mesh>

      {/* Upper floor — painted plaster */}
      <mesh position={[0, 3.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[W_BLD, 2.4, D_BLD]} />
        <meshStandardMaterial color="#d4c8b0" roughness={0.9} />
      </mesh>

      {/* Flat roof slab — thin, sits on top */}
      <mesh position={[0, H + 0.05, 0]}>
        <boxGeometry args={[W_BLD + 0.2, 0.1, D_BLD + 0.2]} />
        <meshStandardMaterial color="#5a4a38" roughness={0.85} />
      </mesh>

      {/* Floor-divider moulding between ground and upper */}
      <mesh position={[0, 2.25, 0]}>
        <boxGeometry args={[W_BLD + 0.05, 0.14, D_BLD + 0.05]} />
        <meshStandardMaterial color="#3a2a1a" roughness={0.85} />
      </mesh>

      {/* Upper-floor windows on the road-facing face — breaks up the
          flat wall so it doesn't read as one giant blank board. */}
      {[-1, 1].map((dz) => (
        <mesh key={`win-upper-${dz}`} position={[faceX + inward * 0.005, 3.5, dz * 1.0]} rotation={[0, inward === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <planeGeometry args={[0.9, 1.3]} />
          <meshStandardMaterial color="#1a2028" roughness={0.6} />
        </mesh>
      ))}

      {/* Ground-floor shopfront opening — dark recess on road-facing side */}
      <mesh position={[faceX + inward * 0.005, 1.15, 0]} rotation={[0, inward === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}>
        <planeGeometry args={[2.4, 1.6]} />
        <meshStandardMaterial color="#2a1a10" roughness={0.95} />
      </mesh>

      {/* Canvas awning — HORIZONTAL canopy over the shopfront, projects
          outward 0.8m from the facade so it sits over the sidewalk, not
          across the road. Previously a 2.5×5 vertical plane at x=±4.5
          crossed into the road and read as a giant coloured board. */}
      <mesh
        position={[faceX + inward * 0.4, 2.35, 0]}
        rotation={[-Math.PI / 2, 0, inward * 0.08]}
      >
        <planeGeometry args={[D_BLD - 0.2, 0.8]} />
        <meshStandardMaterial color={awningColor} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* Awning front pipe-trim — thin rod along the outer edge */}
      <mesh position={[faceX + inward * 0.78, 2.3, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.025, 0.025, D_BLD - 0.2, 8]} />
        <meshStandardMaterial color="#1a1a18" roughness={0.7} />
      </mesh>

      {/* Vertical shop sign on the facade */}
      <mesh position={[faceX + inward * 0.01, 4.2, 0]} rotation={[0, inward === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}>
        <planeGeometry args={[0.7, 1.1]} />
        <meshStandardMaterial map={signTex} roughness={0.8} />
      </mesh>

      {/* Wooden crates stacked at the shopfront */}
      {[-0.8, 0, 0.8].map((dz, i) => (
        <mesh key={i} position={[faceX + inward * 0.35, 0.3, dz]}>
          <boxGeometry args={[0.5, 0.6, 0.4]} />
          <meshStandardMaterial color="#8a7050" roughness={0.9} />
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
