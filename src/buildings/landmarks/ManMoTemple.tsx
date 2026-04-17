import { useMemo } from 'react'
import * as THREE from 'three'
import { useStore } from '../../store'

/**
 * Man Mo Temple (1847, Hollywood Road, Sheung Wan) — a small Qing-dynasty
 * temple dedicated to the gods of literature and war. Instantly recognisable
 * by its green-glazed pitched roof with upturned flying eaves, red walls,
 * and stone-block facade. A deliberate low-rise counterpoint to the Central
 * office towers further up the route.
 */

const RED_WALL = '#8a2218'
const GREEN_TILE = '#2e5a36'
const GREEN_TILE_DARK = '#1f4228'
const STONE = '#b8ad90'
const TRIM_GOLD = '#c8a468'

/** Extruded ridge shape — an upward-curving "boat-prow" eave that sits on
 *  either end of the pitched roof, the signature Lingnan temple detail. */
function useFlyingEave() {
  return useMemo(() => {
    const shape = new THREE.Shape()
    shape.moveTo(0, 0)
    shape.quadraticCurveTo(0.9, -0.15, 1.6, 0.55)
    shape.lineTo(1.6, 0.75)
    shape.quadraticCurveTo(0.9, 0.1, 0, 0.2)
    shape.lineTo(0, 0)
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.35,
      bevelEnabled: false,
    })
    geo.translate(0, 0, -0.175)
    return geo
  }, [])
}

export function ManMoTemple() {
  const mode = useStore((s) => s.mode)
  const eaveGeo = useFlyingEave()

  const width = 6
  const depth = 5
  const wallHeight = 3.5
  const roofRise = 1.8
  const overhang = 0.7

  // Pitched-roof geometry built as two sloped boxes meeting at the ridge.
  // Using boxGeometry rotated is simpler than a custom mesh for this
  // silhouette at tram-viewing distance.
  const roofSlopeLen = Math.sqrt(
    (depth / 2 + overhang) ** 2 + roofRise ** 2,
  )
  const roofAngle = Math.atan2(roofRise, depth / 2 + overhang)

  return (
    <group>
      {/* Stone plinth — the temple sits on a low platform */}
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[width + 1.6, 0.6, depth + 1.2]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>

      {/* Front steps */}
      <mesh position={[0, 0.15, depth / 2 + 0.9]}>
        <boxGeometry args={[width * 0.45, 0.3, 0.8]} />
        <meshStandardMaterial color={STONE} roughness={0.9} />
      </mesh>

      {/* Main red walls */}
      <mesh position={[0, 0.6 + wallHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, wallHeight, depth]} />
        <meshStandardMaterial color={RED_WALL} roughness={0.85} />
      </mesh>

      {/* Gold trim band along the wall top */}
      <mesh position={[0, 0.6 + wallHeight + 0.08, 0]}>
        <boxGeometry args={[width + 0.1, 0.16, depth + 0.1]} />
        <meshStandardMaterial color={TRIM_GOLD} roughness={0.55} metalness={0.3} />
      </mesh>

      {/* Entrance — darker recessed door */}
      <mesh position={[0, 0.6 + 1.2, depth / 2 + 0.01]}>
        <planeGeometry args={[1.4, 2.2]} />
        <meshStandardMaterial color="#1a0e08" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Door lintel plaque — gold-on-black */}
      <mesh position={[0, 0.6 + 2.6, depth / 2 + 0.02]}>
        <planeGeometry args={[1.8, 0.5]} />
        <meshStandardMaterial color="#1a1410" roughness={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* Front red columns flanking the entrance */}
      {[-1.2, 1.2].map((cx) => (
        <mesh key={cx} position={[cx, 0.6 + wallHeight / 2, depth / 2 + 0.15]}>
          <cylinderGeometry args={[0.18, 0.2, wallHeight, 12]} />
          <meshStandardMaterial color="#6a1a12" roughness={0.8} />
        </mesh>
      ))}

      {/* ── Green-tile pitched roof ─────────────────────────────────── */}
      {/* Front slope */}
      <mesh
        position={[0, 0.6 + wallHeight + roofRise / 2, (overhang) / 2]}
        rotation={[-(Math.PI / 2 - roofAngle), 0, 0]}
      >
        <boxGeometry args={[width + 1.4, roofSlopeLen * 2, 0.2]} />
        <meshStandardMaterial color={GREEN_TILE} roughness={0.6} />
      </mesh>

      {/* Roof ridge beam */}
      <mesh position={[0, 0.6 + wallHeight + roofRise + 0.1, 0]}>
        <boxGeometry args={[width + 1.6, 0.3, 0.5]} />
        <meshStandardMaterial color={GREEN_TILE_DARK} roughness={0.5} />
      </mesh>

      {/* Two gable ends — dark triangular infill beneath the slopes */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[s * (width / 2 + 0.05), 0.6 + wallHeight + roofRise / 2, 0]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <boxGeometry args={[depth + 1.4, roofRise, 0.1]} />
          <meshStandardMaterial color="#3a1a12" roughness={0.85} />
        </mesh>
      ))}

      {/* Flying eaves at the two front corners of the ridge */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          geometry={eaveGeo}
          position={[
            s * (width / 2 + 0.2),
            0.6 + wallHeight + roofRise + 0.2,
            -0.2,
          ]}
          rotation={[0, 0, s > 0 ? 0 : Math.PI]}
          scale={[s > 0 ? 1 : 1, 1, 1]}
        >
          <meshStandardMaterial color={GREEN_TILE_DARK} roughness={0.55} />
        </mesh>
      ))}

      {/* Lantern pair flanking the entrance — glows at night */}
      {[-1, 1].map((s) => (
        <mesh
          key={`lantern-${s}`}
          position={[s * 1.2, 0.6 + 2.0, depth / 2 + 0.6]}
        >
          <sphereGeometry args={[0.22, 12, 10]} />
          <meshStandardMaterial
            color="#c82020"
            emissive="#ff8050"
            emissiveIntensity={mode === 'night' ? 0.9 : 0.15}
            roughness={0.5}
          />
        </mesh>
      ))}
    </group>
  )
}
