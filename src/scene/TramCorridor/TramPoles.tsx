/**
 * Enhanced HK tram catenary poles — dark green with concrete bases,
 * horizontal bracket arms reaching over the tracks, diagonal struts,
 * white porcelain insulators, and pole caps.
 *
 * Poles alternate left/right at x = ±2.85 (matching existing layout).
 * Bracket arms extend inward toward the track center (x ≈ 0).
 */

const POLE_GREEN = '#2a4838'
const POLE_BASE_COLOR = '#4a4440'
const POLE_CAP = '#1a1a18'
const BRACKET = '#3a3a38'
const INSULATOR = '#f0ece0'

const POLE_HEIGHT = 6.5
const POLE_RADIUS = 0.08
const POLE_X = 2.85            // matches existing Street.tsx
const POLE_SPACING = 7         // matches existing spacing
const POLE_COUNT = 20          // 20 per side visible forward, covers ~140 units

export function TramPoles() {
  return (
    <group>
      {Array.from({ length: POLE_COUNT }, (_, i) => {
        const z = -i * POLE_SPACING
        // Alternate sides like existing CatenaryPoles
        const xSide = i % 2 === 0 ? POLE_X : -POLE_X
        const inward = xSide > 0 ? -1 : 1 // direction toward road center

        return (
          <group key={`pole-${i}`} position={[xSide, 0, z]}>
            {/* Concrete base block */}
            <mesh position={[0, 0.15, 0]}>
              <boxGeometry args={[0.16, 0.3, 0.16]} />
              <meshStandardMaterial color={POLE_BASE_COLOR} roughness={0.9} />
            </mesh>

            {/* Main pole — green cylinder, slightly tapered */}
            <mesh position={[0, POLE_HEIGHT / 2 + 0.3, 0]}>
              <cylinderGeometry args={[POLE_RADIUS, POLE_RADIUS + 0.015, POLE_HEIGHT, 10]} />
              <meshStandardMaterial color={POLE_GREEN} roughness={0.7} metalness={0.2} />
            </mesh>

            {/* Horizontal bracket arm — reaches inward over the tracks */}
            <mesh
              position={[inward * 1.4, POLE_HEIGHT, 0]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.025, 0.025, 2.8, 8]} />
              <meshStandardMaterial color={BRACKET} roughness={0.6} metalness={0.5} />
            </mesh>

            {/* Diagonal strut — structural support for bracket */}
            <mesh
              position={[inward * 0.9, POLE_HEIGHT - 0.6, 0]}
              rotation={[0, 0, inward > 0 ? Math.PI / 4 : -Math.PI / 4]}
            >
              <cylinderGeometry args={[0.018, 0.018, 1.6, 6]} />
              <meshStandardMaterial color={BRACKET} roughness={0.6} metalness={0.5} />
            </mesh>

            {/* White porcelain insulator at end of bracket */}
            <mesh position={[inward * 2.7, POLE_HEIGHT, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.12, 8]} />
              <meshStandardMaterial color={INSULATOR} roughness={0.5} />
            </mesh>

            {/* Pole cap / finial */}
            <mesh position={[0, POLE_HEIGHT + 0.35, 0]}>
              <sphereGeometry args={[POLE_RADIUS + 0.01, 8, 8]} />
              <meshStandardMaterial color={POLE_CAP} roughness={0.6} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
