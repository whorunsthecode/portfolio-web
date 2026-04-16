import { useMemo } from 'react'
import { makeTextTexture } from '../cabin/TextTexture'

const TRAM_GREEN = '#007549'
const TRAM_CREAM = '#f4e4c8'

// Period-accurate 80s HK tram ads — pick a different one from the player tram (which is Tramways branding).
const AD_POOL = [
  { text: 'LIPTON TEA · 立頓茶', bg: '#f7c200', color: '#c8102e' },
  { text: 'HSBC · 滙豐銀行', bg: '#ffffff', color: '#db0011' },
  { text: "MAXIM'S CAKES · 美心餅店", bg: '#f4e4c8', color: '#8a2432' },
  { text: 'CATHAY PACIFIC · 國泰航空', bg: '#0e3a62', color: '#f4c430' },
  { text: "WATSON'S · 屈臣氏", bg: '#ffffff', color: '#1a7a3c' },
]

const ROUTE_POOL = ['120', '2', '43', '7']

/**
 * Oncoming HK ding-ding tram passing on the parallel track at x=-2.9.
 * Same silhouette as the player's TramExterior but simpler (no tram stop
 * infrastructure) and with a different period ad + route number.
 *
 * Two trams passing each other is the single most iconic HK street image.
 */
export function OncomingTram({ variantSeed = 0 }: { variantSeed?: number }) {
  const ad = AD_POOL[variantSeed % AD_POOL.length]
  const route = ROUTE_POOL[variantSeed % ROUTE_POOL.length]

  const adTex = useMemo(
    () =>
      makeTextTexture({
        text: ad.text,
        fontSize: 42,
        color: ad.color,
        width: 768,
        height: 128,
        background: ad.bg,
      }),
    [ad.text, ad.color, ad.bg],
  )

  const routeTex = useMemo(
    () =>
      makeTextTexture({
        text: route,
        fontSize: 64,
        color: TRAM_GREEN,
        width: 96,
        height: 96,
      }),
    [route],
  )

  return (
    <group>
      {/* ── Lower deck (green) ─── */}
      <mesh position={[0, 1.5, 0]}>
        <boxGeometry args={[10, 2.0, 2.3]} />
        <meshStandardMaterial color={TRAM_GREEN} roughness={0.6} />
      </mesh>

      {/* Lower deck windows */}
      {[-1, 1].map((sideZ) =>
        Array.from({ length: 8 }, (_, i) => (
          <mesh
            key={`lw-${sideZ}-${i}`}
            position={[-3.5 + i * 1.0, 1.6, sideZ * 1.16]}
          >
            <planeGeometry args={[0.7, 1.0]} />
            <meshStandardMaterial color="#1a2028" />
          </mesh>
        )),
      )}

      {/* ── Upper deck (cream) ─── */}
      <mesh position={[0, 3.5, 0]}>
        <boxGeometry args={[10, 2.0, 2.3]} />
        <meshStandardMaterial color={TRAM_CREAM} roughness={0.7} />
      </mesh>

      {/* Upper deck windows */}
      {[-1, 1].map((sideZ) =>
        Array.from({ length: 8 }, (_, i) => (
          <mesh
            key={`uw-${sideZ}-${i}`}
            position={[-3.5 + i * 1.0, 3.6, sideZ * 1.16]}
          >
            <planeGeometry args={[0.7, 1.0]} />
            <meshStandardMaterial color="#2a3038" />
          </mesh>
        )),
      )}

      {/* ── Green window trim strips on upper deck ─── */}
      {[-1, 1].map((sideZ) => (
        <mesh key={`trim-${sideZ}`} position={[0, 3.1, sideZ * 1.16]}>
          <boxGeometry args={[10, 0.08, 0.02]} />
          <meshStandardMaterial color={TRAM_GREEN} roughness={0.5} />
        </mesh>
      ))}

      {/* ── Full-side period advertisement panel (both sides) ─── */}
      {[1, -1].map((sideZ) => (
        <mesh key={`ad-${sideZ}`} position={[0, 1.5, sideZ * 1.165]} rotation={[0, sideZ > 0 ? 0 : Math.PI, 0]}>
          <planeGeometry args={[8, 1.4]} />
          <meshStandardMaterial map={adTex} roughness={0.7} />
        </mesh>
      ))}

      {/* ── Route plate on front ─── */}
      <mesh position={[-5.05, 3.5, 0]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial color={TRAM_CREAM} roughness={0.7} />
      </mesh>
      <mesh position={[-5.06, 3.5, 0]}>
        <planeGeometry args={[0.4, 0.4]} />
        <meshStandardMaterial map={routeTex} transparent />
      </mesh>

      {/* ── Trolley pole on roof ─── */}
      <mesh position={[0, 4.8, 0]} rotation={[0, 0, Math.PI / 6]}>
        <cylinderGeometry args={[0.03, 0.03, 2.5, 8]} />
        <meshStandardMaterial color="#2a1a10" roughness={0.8} />
      </mesh>
      <mesh position={[1.0, 5.8, 0]}>
        <boxGeometry args={[0.3, 0.04, 0.15]} />
        <meshStandardMaterial color="#4a4040" metalness={0.5} roughness={0.4} />
      </mesh>

      {/* ── Front headlight (single round-ish white) ─── */}
      <mesh position={[-5.05, 1.2, 0]}>
        <boxGeometry args={[0.05, 0.25, 0.25]} />
        <meshBasicMaterial color="#f4ead4" />
      </mesh>

      {/* ── Wheels (tram bogies) ─── */}
      {[-3, -1, 1, 3].map((xPos) =>
        [-1, 1].map((sideZ) => (
          <mesh
            key={`wh-${xPos}-${sideZ}`}
            position={[xPos, 0.35, sideZ * 1.0]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.25, 0.25, 0.15, 12]} />
            <meshStandardMaterial color="#2a2a2a" roughness={0.8} />
          </mesh>
        )),
      )}
    </group>
  )
}
