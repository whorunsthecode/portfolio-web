export type PrivateCarVariant = 'mini' | 'w123' | 'cedric'

const DARK = '#1a1614'
const HEADLIGHT = '#f4ead4'
const CHROME = '#b8b8b8'
const TAIL_RED = '#ff2020'

// Primary color palettes drawn from period street photography
const MINI_COLORS = ['#1a5a3c', '#d62828', '#f4e4c8', '#f4c430', '#1a3a5a']
const W123_COLORS = ['#e8dcb8', '#d4c4a0', '#2d4a3e', '#f0ede4']
const CEDRIC_COLORS = ['#3a2418', '#1a1614', '#e8dcb8']

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length]
}

/**
 * Period private cars circa 1980s HK. Three variants:
 *  - Austin Mini (ubiquitous civil servant / student car)
 *  - Mercedes W123 (businessman's sedan, boxy 3-box)
 *  - Nissan Cedric Y31 in civilian livery (not the taxi version)
 */
export function PrivateCar({
  variant,
  variantSeed = 0,
}: {
  variant: PrivateCarVariant
  variantSeed?: number
}) {
  if (variant === 'mini') return <AustinMini seed={variantSeed} />
  if (variant === 'w123') return <MercedesW123 seed={variantSeed} />
  return <NissanCedricCivilian seed={variantSeed} />
}

/* ─────────────────────────── Austin Mini ─────────────────────────── */
function AustinMini({ seed }: { seed: number }) {
  const body = pick(MINI_COLORS, seed)
  const hasWhiteRoof = seed % 3 === 0

  return (
    <group>
      {/* Lower body — tiny proportions */}
      <mesh position={[0, 0.45, 0]}>
        <boxGeometry args={[3.0, 1.2, 1.4]} />
        <meshStandardMaterial color={body} roughness={0.55} />
      </mesh>
      {/* Cabin — short glasshouse */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[1.8, 0.55, 1.3]} />
        <meshStandardMaterial color={hasWhiteRoof ? '#f0ede4' : body} roughness={0.55} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0.91, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.1, 0.45]} />
        <meshStandardMaterial color="#2a3848" transparent opacity={0.7} />
      </mesh>
      {/* Rear window */}
      <mesh position={[-0.91, 1.2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.1, 0.45]} />
        <meshStandardMaterial color="#2a3848" transparent opacity={0.7} />
      </mesh>
      {/* Side windows */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 1.2, s * 0.66]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.7, 0.4]} />
          <meshStandardMaterial color="#2a3848" transparent opacity={0.6} side={2} />
        </mesh>
      ))}
      {/* Round headlights — iconic Mini */}
      {[-1, 1].map((s) => (
        <mesh
          key={`h-${s}`}
          position={[1.51, 0.55, s * 0.45]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <cylinderGeometry args={[0.13, 0.13, 0.04, 12]} />
          <meshBasicMaterial color={HEADLIGHT} />
        </mesh>
      ))}
      {/* Mini grille — horizontal slats */}
      <mesh position={[1.51, 0.4, 0]}>
        <boxGeometry args={[0.03, 0.15, 0.6]} />
        <meshStandardMaterial color={DARK} roughness={0.7} />
      </mesh>
      {/* Tail lights */}
      {[-1, 1].map((s) => (
        <mesh key={`t-${s}`} position={[-1.51, 0.6, s * 0.55]}>
          <boxGeometry args={[0.03, 0.2, 0.15]} />
          <meshBasicMaterial color={TAIL_RED} />
        </mesh>
      ))}
      {/* Chrome bumpers */}
      <mesh position={[1.51, 0.2, 0]}>
        <boxGeometry args={[0.05, 0.1, 1.3]} />
        <meshStandardMaterial color={CHROME} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-1.51, 0.2, 0]}>
        <boxGeometry args={[0.05, 0.1, 1.3]} />
        <meshStandardMaterial color={CHROME} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* 4 small wheels */}
      {[
        [0.95, 0.12, 0.72],
        [0.95, 0.12, -0.72],
        [-0.95, 0.12, 0.72],
        [-0.95, 0.12, -0.72],
      ].map((p, i) => (
        <mesh
          key={i}
          position={p as [number, number, number]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.22, 0.22, 0.14, 12]} />
          <meshStandardMaterial color={DARK} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

/* ─────────────────────────── Mercedes W123 ─────────────────────────── */
function MercedesW123({ seed }: { seed: number }) {
  const body = pick(W123_COLORS, seed)

  return (
    <group>
      {/* Lower body — long, low, 3-box */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[4.7, 0.9, 1.8]} />
        <meshStandardMaterial color={body} roughness={0.5} />
      </mesh>
      {/* Cabin */}
      <mesh position={[-0.1, 1.15, 0]}>
        <boxGeometry args={[2.5, 0.8, 1.7]} />
        <meshStandardMaterial color={body} roughness={0.5} />
      </mesh>
      {/* Windshield (raked) */}
      <mesh position={[1.2, 1.1, 0]} rotation={[0, Math.PI / 2, -0.15]}>
        <planeGeometry args={[1.5, 0.6]} />
        <meshStandardMaterial color="#2a3848" transparent opacity={0.7} />
      </mesh>
      {/* Rear window */}
      <mesh position={[-1.4, 1.1, 0]} rotation={[0, -Math.PI / 2, -0.15]}>
        <planeGeometry args={[1.5, 0.6]} />
        <meshStandardMaterial color="#2a3848" transparent opacity={0.7} />
      </mesh>
      {/* Side windows */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[-0.1, 1.2, s * 0.86]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.3, 0.55]} />
          <meshStandardMaterial color="#2a3848" transparent opacity={0.6} side={2} />
        </mesh>
      ))}
      {/* Rectangular headlights with chrome surrounds (Euro-spec) */}
      {[-1, 1].map((s) => (
        <group key={`h-${s}`}>
          <mesh position={[2.36, 0.55, s * 0.62]}>
            <boxGeometry args={[0.04, 0.22, 0.45]} />
            <meshBasicMaterial color={HEADLIGHT} />
          </mesh>
          <mesh position={[2.37, 0.55, s * 0.62]}>
            <boxGeometry args={[0.02, 0.24, 0.48]} />
            <meshStandardMaterial color={CHROME} metalness={0.7} roughness={0.25} />
          </mesh>
        </group>
      ))}
      {/* Grille (vertical slats, Mercedes) */}
      <mesh position={[2.36, 0.65, 0]}>
        <boxGeometry args={[0.04, 0.4, 0.5]} />
        <meshStandardMaterial color={DARK} roughness={0.7} />
      </mesh>
      {/* Three-pointed star on grille */}
      <mesh position={[2.39, 0.85, 0]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color={CHROME} metalness={0.8} roughness={0.2} emissive={CHROME} emissiveIntensity={0.15} />
      </mesh>
      {/* Wider ribbed tail lights */}
      {[-1, 1].map((s) => (
        <mesh key={`t-${s}`} position={[-2.36, 0.55, s * 0.62]}>
          <boxGeometry args={[0.04, 0.22, 0.45]} />
          <meshBasicMaterial color={TAIL_RED} />
        </mesh>
      ))}
      {/* Chrome bumpers */}
      <mesh position={[2.36, 0.25, 0]}>
        <boxGeometry args={[0.06, 0.12, 1.75]} />
        <meshStandardMaterial color={CHROME} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-2.36, 0.25, 0]}>
        <boxGeometry args={[0.06, 0.12, 1.75]} />
        <meshStandardMaterial color={CHROME} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* 4 wheels */}
      {[
        [1.5, 0.18, 0.92],
        [1.5, 0.18, -0.92],
        [-1.5, 0.18, 0.92],
        [-1.5, 0.18, -0.92],
      ].map((p, i) => (
        <mesh
          key={i}
          position={p as [number, number, number]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.32, 0.32, 0.2, 12]} />
          <meshStandardMaterial color={DARK} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

/* ────────────────── Nissan Cedric Y31 (civilian livery) ────────────────── */
function NissanCedricCivilian({ seed }: { seed: number }) {
  const body = pick(CEDRIC_COLORS, seed)

  return (
    <group>
      {/* Lower body — boxy 3-box (same shape as taxi version) */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4.5, 0.8, 1.7]} />
        <meshStandardMaterial color={body} roughness={0.55} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 1.15, 0]}>
        <boxGeometry args={[2.8, 0.65, 1.65]} />
        <meshStandardMaterial color={body} roughness={0.55} />
      </mesh>
      {/* Windshield */}
      <mesh position={[1.35, 1.15, 0]} rotation={[0, Math.PI / 2, -0.12]}>
        <planeGeometry args={[1.55, 0.55]} />
        <meshStandardMaterial color="#2a3848" transparent opacity={0.7} />
      </mesh>
      {/* Rear window */}
      <mesh position={[-1.35, 1.15, 0]} rotation={[0, -Math.PI / 2, -0.12]}>
        <planeGeometry args={[1.55, 0.55]} />
        <meshStandardMaterial color="#2a3848" transparent opacity={0.7} />
      </mesh>
      {/* Side windows */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, 1.2, s * 0.83]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[2.6, 0.5]} />
          <meshStandardMaterial color="#2a3848" transparent opacity={0.6} side={2} />
        </mesh>
      ))}
      {/* Rectangular headlights */}
      {[-1, 1].map((s) => (
        <mesh key={`h-${s}`} position={[2.26, 0.55, s * 0.55]}>
          <boxGeometry args={[0.05, 0.18, 0.38]} />
          <meshBasicMaterial color={HEADLIGHT} />
        </mesh>
      ))}
      {/* Grille */}
      <mesh position={[2.26, 0.6, 0]}>
        <boxGeometry args={[0.04, 0.3, 0.9]} />
        <meshStandardMaterial color={DARK} roughness={0.7} />
      </mesh>
      {/* Tail lights */}
      {[-1, 1].map((s) => (
        <mesh key={`t-${s}`} position={[-2.26, 0.55, s * 0.55]}>
          <boxGeometry args={[0.05, 0.18, 0.38]} />
          <meshBasicMaterial color={TAIL_RED} />
        </mesh>
      ))}
      {/* Bumpers */}
      <mesh position={[2.3, 0.22, 0]}>
        <boxGeometry args={[0.08, 0.1, 1.6]} />
        <meshStandardMaterial color={CHROME} metalness={0.6} roughness={0.3} />
      </mesh>
      <mesh position={[-2.3, 0.22, 0]}>
        <boxGeometry args={[0.08, 0.1, 1.6]} />
        <meshStandardMaterial color={CHROME} metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Wheels */}
      {[
        [1.4, 0.18, 0.85],
        [1.4, 0.18, -0.85],
        [-1.4, 0.18, 0.85],
        [-1.4, 0.18, -0.85],
      ].map((p, i) => (
        <mesh
          key={i}
          position={p as [number, number, number]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.3, 0.3, 0.18, 12]} />
          <meshStandardMaterial color={DARK} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}
