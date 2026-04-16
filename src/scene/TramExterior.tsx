import { useMemo } from 'react'
import { makeTextTexture } from '../cabin/TextTexture'

const TRAM_GREEN = '#007549'
const TRAM_CREAM = '#f4e4c8'

/**
 * Full exterior of the HK ding-ding tram.
 * Visible during boarding keyframe 0.0–1.0s.
 * Built from BoxGeometry primitives — no external models.
 */
export function TramExterior({ visible }: { visible: boolean }) {
  const adTex = useMemo(() => makeTextTexture({
    text: '香港電車 HONG KONG TRAMWAYS',
    fontSize: 36,
    color: '#007549',
    width: 768,
    height: 128,
    background: '#f4e4c8',
  }), [])

  const tramwaysTex = useMemo(() => makeTextTexture({
    text: 'HONG KONG TRAMWAYS · 香港電車',
    fontSize: 28,
    color: '#c82820',
    width: 768,
    height: 64,
  }), [])

  const routeTex = useMemo(() => makeTextTexture({
    text: '88',
    fontSize: 64,
    color: TRAM_GREEN,
    width: 96,
    height: 96,
  }), [])

  if (!visible) return null

  return (
    <group position={[0, 0, -3]} rotation={[0, Math.PI / 2, 0]}>
      {/* ── Lower deck (green) — center at y=-0.5 ──── */}
      <mesh position={[0, -0.5, 0]}>
        <boxGeometry args={[10, 2.0, 2.3]} />
        <meshStandardMaterial color={TRAM_GREEN} roughness={0.6} />
      </mesh>

      {/* Lower deck windows */}
      {[-1, 1].map((sideZ) => (
        Array.from({ length: 8 }, (_, i) => (
          <mesh key={`lw-${sideZ}-${i}`} position={[-3.5 + i * 1.0, -0.4, sideZ * 1.16]}>
            <planeGeometry args={[0.7, 1.0]} />
            <meshStandardMaterial color="#1a2028" />
          </mesh>
        ))
      ))}

      {/* ── Upper deck (green — same as lower) ──── */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[10, 2.0, 2.3]} />
        <meshStandardMaterial color={TRAM_GREEN} roughness={0.6} />
      </mesh>

      {/* Upper deck windows */}
      {[-1, 1].map((sideZ) => (
        Array.from({ length: 8 }, (_, i) => (
          <mesh key={`uw-${sideZ}-${i}`} position={[-3.5 + i * 1.0, 1.6, sideZ * 1.16]}>
            <planeGeometry args={[0.7, 1.0]} />
            <meshStandardMaterial color="#2a3038" />
          </mesh>
        ))
      ))}

      {/* ── Green window trim strips on upper deck ──── */}
      {[-1, 1].map((sideZ) => (
        <mesh key={`trim-${sideZ}`} position={[0, 1.1, sideZ * 1.16]}>
          <boxGeometry args={[10, 0.08, 0.02]} />
          <meshStandardMaterial color={TRAM_GREEN} roughness={0.5} />
        </mesh>
      ))}

      {/* ── Side branding panel ────────────────────── */}
      <mesh position={[0, -0.5, 1.165]}>
        <planeGeometry args={[8, 1.4]} />
        <meshStandardMaterial map={adTex} roughness={0.7} />
      </mesh>

      {/* ── "HONG KONG TRAMWAYS · 香港電車" on upper deck ── */}
      <mesh position={[0, 1.9, 1.165]}>
        <planeGeometry args={[6, 0.4]} />
        <meshStandardMaterial map={tramwaysTex} transparent roughness={0.7} />
      </mesh>

      {/* ── Route plate "88" on front ──────────────── */}
      <mesh position={[-5.05, 1.5, 0]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial color={TRAM_CREAM} roughness={0.7} />
      </mesh>
      <mesh position={[-5.06, 1.5, 0]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshStandardMaterial map={routeTex} transparent />
      </mesh>

      {/* ── Trolley pole on roof ───────────────────── */}
      <mesh position={[0, 2.8, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.03, 0.03, 2.5, 8]} />
        <meshStandardMaterial color="#2a1a10" roughness={0.8} />
      </mesh>
      {/* Trolley shoe at top */}
      <mesh position={[1.0, 3.8, 0]}>
        <boxGeometry args={[0.3, 0.04, 0.15]} />
        <meshStandardMaterial color="#4a4040" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* ── Overhead wire ──────────────────────────── */}
      <mesh position={[0, 4.0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 20, 6]} />
        <meshStandardMaterial color="#2a2a2a" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* ── Rear door opening (dark) ───────────────── */}
      <mesh position={[4.95, -0.8, 0]}>
        <planeGeometry args={[0.1, 1.8]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      {/* ── Ding-ding bell on front ────────────────── */}
      <mesh position={[-5.05, 0.7, 0]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshStandardMaterial color="#d4b880" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[-5.05, 0.55, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.2, 6]} />
        <meshStandardMaterial color="#d4b880" metalness={0.7} roughness={0.25} />
      </mesh>

      {/* ── Wheels ─────────────────────────────────── */}
      {[-3, -1, 1, 3].map((xPos) => (
        [-1, 1].map((sideZ) => (
          <mesh key={`wh-${xPos}-${sideZ}`} position={[xPos, -1.65, sideZ * 1.0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.25, 0.25, 0.15, 12]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
          </mesh>
        ))
      ))}

      {/* ── Tram stop infrastructure ───────────────── */}
      <mesh position={[3, -1.8, -3]}>
        <boxGeometry args={[1.5, 0.2, 8]} />
        <meshStandardMaterial color="#9a9590" roughness={0.9} />
      </mesh>
      <mesh position={[3.5, -0.4, -2]}>
        <cylinderGeometry args={[0.04, 0.04, 3, 8]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.7} />
      </mesh>
      <mesh position={[3.5, 0.9, -3]}>
        <boxGeometry args={[2.5, 0.06, 3]} />
        <meshStandardMaterial color={TRAM_CREAM} roughness={0.8} />
      </mesh>
      <mesh position={[3.5, -0.1, -4.4]}>
        <boxGeometry args={[2.5, 2.0, 0.06]} />
        <meshStandardMaterial color={TRAM_CREAM} roughness={0.8} />
      </mesh>
    </group>
  )
}
