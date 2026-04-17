import * as THREE from 'three'
import { useStore } from '../../store'

/**
 * Central Market (1938) — Bauhaus-era streamline moderne market hall on
 * Queen's Road Central. Low-rise, cream walls, long horizontal ribbon
 * windows, rounded corners. Still standing in 1982 and a civic fixture —
 * a good low-profile counterpoint to the nearby office towers.
 */

const WALL = '#efe6d2'
const WALL_SHADOW = '#d8cdb0'
const WINDOW_STRIP = '#2e3a48'
const TRIM = '#c8bf9a'

/** Thin horizontal ribbon window wrapped around the front face. Rendered
 *  as a single dark plane rather than per-pane glass since at tram distance
 *  the streamline "band" reads as a continuous strip. */
function RibbonWindow({
  width,
  depth,
  y,
  height,
}: {
  width: number
  depth: number
  y: number
  height: number
}) {
  return (
    <>
      {/* Front */}
      <mesh position={[0, y, depth / 2 + 0.01]}>
        <planeGeometry args={[width - 0.4, height]} />
        <meshStandardMaterial
          color={WINDOW_STRIP}
          emissive="#f4d480"
          emissiveIntensity={0}
          roughness={0.35}
          metalness={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      {/* Sides */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[s * (width / 2 + 0.01), y, 0]}
          rotation={[0, s * Math.PI / 2, 0]}
        >
          <planeGeometry args={[depth - 0.4, height]} />
          <meshStandardMaterial
            color={WINDOW_STRIP}
            roughness={0.35}
            metalness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}

export function CentralMarket() {
  const mode = useStore((s) => s.mode)
  const isNight = mode === 'night'

  const width = 14
  const depth = 10
  const height = 9  // 3 storeys, short

  // Colors shift subtly at night — the building is externally floodlit
  // rather than glowing itself
  const wallColor = isNight ? '#8a7f68' : WALL

  return (
    <group>
      {/* Main block — 3 storeys */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>

      {/* Rounded corner volume on the street-facing right corner — the
          signature streamline moderne move. A quarter-cylinder whose
          vertical axis sits at the corner of the main box. */}
      <mesh position={[width / 2, height / 2, depth / 2]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[1.4, 1.4, height, 24, 1, false, 0, Math.PI / 2]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>
      {/* Fill the gap between the cylinder and the box edges */}
      <mesh position={[width / 2 - 0.7, height / 2, depth / 2 + 0.7]}>
        <boxGeometry args={[1.4, height, 1.4]} />
        <meshStandardMaterial color={wallColor} roughness={0.8} />
      </mesh>

      {/* Two ribbon windows — the long horizontals that define the style */}
      <RibbonWindow width={width} depth={depth} y={height * 0.40} height={1.2} />
      <RibbonWindow width={width} depth={depth} y={height * 0.72} height={1.1} />

      {/* Ground-floor darker band (shop fronts / entry doors) */}
      <mesh position={[0, 1.2, 0]}>
        <boxGeometry args={[width + 0.02, 0.4, depth + 0.02]} />
        <meshStandardMaterial color={WALL_SHADOW} roughness={0.85} />
      </mesh>

      {/* Cornice / parapet — thin cream band around the top */}
      <mesh position={[0, height + 0.22, 0]}>
        <boxGeometry args={[width + 0.4, 0.44, depth + 0.4]} />
        <meshStandardMaterial color={TRIM} roughness={0.7} />
      </mesh>

      {/* Rooftop vertical signboard (period-appropriate: markets had
          painted signage up top). Reads from the street side. */}
      <mesh position={[width / 4, height + 1.9, depth / 2 - 0.1]}>
        <boxGeometry args={[4.2, 2.4, 0.2]} />
        <meshStandardMaterial
          color={isNight ? '#2a1a10' : '#efe6d2'}
          emissive="#f4d480"
          emissiveIntensity={isNight ? 0.7 : 0}
          roughness={0.7}
        />
      </mesh>
      {/* Sign support posts */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[width / 4 + s * 1.9, height + 0.9, depth / 2 - 0.1]}
        >
          <boxGeometry args={[0.12, 1.4, 0.12]} />
          <meshStandardMaterial color="#4a4038" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}
