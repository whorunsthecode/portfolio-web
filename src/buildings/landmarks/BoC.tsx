import { useMemo } from 'react'
import * as THREE from 'three'
import { useCityFacadeMaterial, CityFacadeMaterial } from '../CityFacade'
import { useStore } from '../../store'

/**
 * Bank of China Tower — THE hero landmark.
 * Rectangular base + asymmetric tapered peak (two slopes, 12:8 height ratio).
 * Full-height X-bracing is the defining feature.
 * Twin antenna spires with red aviation lights.
 * Night: X-bracing glows cyan-blue, self-emissive lines for bloom.
 */

/** Build the asymmetric peak geometry.
 *  Base is a rectangle (w x d). Peak has two slopes meeting off-center.
 *  Higher slope reaches peakH on one side, lower slope reaches peakH * 0.67.
 */
function usePeakGeometry(w: number, d: number, peakH: number) {
  return useMemo(() => {
    const hw = w / 2
    const hd = d / 2
    const highY = peakH       // taller side (front-left)
    const lowY = peakH * 0.67 // shorter side (front-right)

    // 8 vertices for the tapered peak box
    // Bottom face (at y=0, connects to top of base box)
    const v = [
      // bottom
      [-hw, 0, -hd],   // 0: back-left
      [ hw, 0, -hd],   // 1: back-right
      [ hw, 0,  hd],   // 2: front-right
      [-hw, 0,  hd],   // 3: front-left
      // top (asymmetric)
      [-hw, highY, -hd],  // 4: back-left (tall)
      [ hw, lowY,  -hd],  // 5: back-right (short)
      [ hw, lowY,   hd],  // 6: front-right (short)
      [-hw, highY,  hd],  // 7: front-left (tall)
    ]

    // 12 triangles (6 faces x 2 tris)
    const indices = [
      // Front face (z = +hd)
      3, 2, 6, 3, 6, 7,
      // Back face (z = -hd)
      1, 0, 4, 1, 4, 5,
      // Left face (x = -hw) — tall side
      0, 3, 7, 0, 7, 4,
      // Right face (x = +hw) — short side
      2, 1, 5, 2, 5, 6,
      // Top face (sloped)
      7, 6, 5, 7, 5, 4,
      // Bottom face
      0, 1, 2, 0, 2, 3,
    ]

    const positions = new Float32Array(indices.length * 3)
    const uvs = new Float32Array(indices.length * 2)
    const normals = new Float32Array(indices.length * 3)

    // Compute per-face
    for (let face = 0; face < 6; face++) {
      const i0 = face * 6
      const faceVerts = []
      for (let j = 0; j < 6; j++) {
        const vi = indices[i0 + j]
        faceVerts.push(v[vi])
      }

      // Compute face normal from first triangle
      const a = new THREE.Vector3(...faceVerts[0] as [number, number, number])
      const b = new THREE.Vector3(...faceVerts[1] as [number, number, number])
      const c = new THREE.Vector3(...faceVerts[2] as [number, number, number])
      const normal = new THREE.Vector3().crossVectors(
        b.clone().sub(a),
        c.clone().sub(a)
      ).normalize()

      for (let j = 0; j < 6; j++) {
        const idx = i0 + j
        positions[idx * 3] = faceVerts[j][0]
        positions[idx * 3 + 1] = faceVerts[j][1]
        positions[idx * 3 + 2] = faceVerts[j][2]
        normals[idx * 3] = normal.x
        normals[idx * 3 + 1] = normal.y
        normals[idx * 3 + 2] = normal.z
      }

      // UVs: project based on face orientation
      // Front/back: x → u, y → v
      // Left/right: z → u, y → v
      // Top/bottom: x → u, z → v
      for (let j = 0; j < 6; j++) {
        const idx = i0 + j
        const p = faceVerts[j]
        if (face <= 1) {
          // Front/Back
          uvs[idx * 2] = (p[0] + hw) / w
          uvs[idx * 2 + 1] = p[1] / peakH
        } else if (face <= 3) {
          // Left/Right
          uvs[idx * 2] = (p[2] + hd) / d
          uvs[idx * 2 + 1] = p[1] / peakH
        } else {
          // Top/Bottom
          uvs[idx * 2] = (p[0] + hw) / w
          uvs[idx * 2 + 1] = (p[2] + hd) / d
        }
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(uvs, 2))
    geo.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
    return geo
  }, [w, d, peakH])
}

/** X-bracing lines visible day AND night. Self-emissive at night for bloom. */
function BracingLines({ w, h, d, color }: { w: number; h: number; d: number; color: string }) {
  const mode = useStore((s) => s.mode)

  const hw = w / 2 + 0.1
  const hd = d / 2 + 0.1

  // Create X lines on front and back faces
  return (
    <group>
      {/* Front face bracing */}
      {[hd, -hd].map((z, fi) => (
        <group key={fi} position={[0, h / 2, z]}>
          {/* Diagonal 1 */}
          <mesh rotation={[0, 0, Math.atan2(h, w)]}>
            <planeGeometry args={[Math.sqrt(w * w + h * h), 0.25]} />
            <meshBasicMaterial color={mode === 'night' ? color : '#8aabb8'} transparent opacity={mode === 'night' ? 0.7 : 0.5} side={THREE.DoubleSide} />
          </mesh>
          {/* Diagonal 2 */}
          <mesh rotation={[0, 0, -Math.atan2(h, w)]}>
            <planeGeometry args={[Math.sqrt(w * w + h * h), 0.4]} />
            <meshBasicMaterial color={mode === 'night' ? color : '#8aabb8'} transparent opacity={mode === 'night' ? 0.7 : 0.5} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
      {/* Side face bracing */}
      {[-hw, hw].map((x, si) => (
        <group key={si} position={[x, h / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <mesh rotation={[0, 0, Math.atan2(h, d)]}>
            <planeGeometry args={[Math.sqrt(d * d + h * h), 0.2]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
          <mesh rotation={[0, 0, -Math.atan2(h, d)]}>
            <planeGeometry args={[Math.sqrt(d * d + h * h), 0.2]} />
            <meshBasicMaterial color={color} transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export function BoC() {
  const mode = useStore((s) => s.mode)

  const baseW = 18, baseD = 14, baseH = 38
  const peakH = 22

  const baseFacade = useCityFacadeMaterial({
    baseColor: [0.45, 0.52, 0.58],  // blue-grey glass
    windowDensityX: 8,
    windowDensityY: 10,
    bracingType: 2,       // full-height X
    bracingColor: [0.6, 0.75, 0.85],
    bracingWidth: 0.045,
    tiers: 4,
    windowTint: [0.35, 0.45, 0.6],
    panelAlternate: true,
    seed: 401,
    nightLitFraction: 0.6,
    roughness: 0.35,
    metalness: 0.4,
  })

  const peakFacade = useCityFacadeMaterial({
    baseColor: [0.48, 0.55, 0.62],
    windowDensityX: 6,
    windowDensityY: 6,
    bracingType: 2,
    bracingColor: [0.6, 0.75, 0.85],
    bracingWidth: 0.06,
    tiers: 2,
    windowTint: [0.35, 0.45, 0.6],
    panelAlternate: true,
    seed: 402,
    nightLitFraction: 0.5,
    roughness: 0.35,
    metalness: 0.4,
  })

  const peakGeo = usePeakGeometry(baseW, baseD, peakH)

  return (
    <group>
      {/* Base box */}
      <mesh position={[0, baseH / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[baseW, baseH, baseD]} />
        <CityFacadeMaterial matProps={baseFacade} />
      </mesh>

      {/* Asymmetric tapered peak */}
      <mesh geometry={peakGeo} position={[0, baseH, 0]} castShadow>
        <CityFacadeMaterial matProps={peakFacade} />
      </mesh>

      {/* Emissive bracing lines for bloom at night */}
      <BracingLines
        w={baseW}
        h={baseH + peakH * 0.85}
        d={baseD}
        color="#40a0c8"
      />

      {/* Twin antenna spires */}
      {[
        { x: -2, h: 55, totalH: baseH + peakH },
        { x: 2, h: 70, totalH: baseH + peakH },
      ].map(({ x, h, totalH }, i) => {
        const spireH = h - totalH + 5
        return (
          <group key={i} position={[x, totalH - 2, 0]}>
            {/* Spire */}
            <mesh position={[0, spireH / 2, 0]}>
              <cylinderGeometry args={[0.08, 0.15, spireH, 6]} />
              <meshStandardMaterial color="#8a9098" metalness={0.6} roughness={0.3} />
            </mesh>
            {/* Red aviation light at tip */}
            <mesh position={[0, spireH, 0]}>
              <sphereGeometry args={[0.2, 8, 8]} />
              <meshBasicMaterial color={mode === 'night' ? '#ff3030' : '#aa2020'} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}
