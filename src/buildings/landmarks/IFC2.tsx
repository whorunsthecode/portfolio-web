import { useMemo } from 'react'
import * as THREE from 'three'
import { useCityFacadeMaterial, CityFacadeMaterial } from '../CityFacade'
import { useStore } from '../../store'

/**
 * IFC 2 — tallest landmark. Tapered glass tower with crown of vertical fins.
 * Base 16 wide, tapering 12% at top. Dense horizontal band lines.
 * 22 vertical architectural fins ringing the crown. Central tall antenna.
 */

/** Tapered box geometry — wider at base, narrower at top */
function useTaperedGeometry(baseW: number, topW: number, baseD: number, topD: number, h: number) {
  return useMemo(() => {
    const hbw = baseW / 2, htw = topW / 2
    const hbd = baseD / 2, htd = topD / 2

    // 8 vertices
    const v: [number, number, number][] = [
      [-hbw, 0, -hbd], [hbw, 0, -hbd], [hbw, 0, hbd], [-hbw, 0, hbd],     // bottom
      [-htw, h, -htd], [htw, h, -htd], [htw, h, htd], [-htw, h, htd],       // top
    ]

    const faces = [
      [3, 2, 6, 7], // front
      [1, 0, 4, 5], // back
      [0, 3, 7, 4], // left
      [2, 1, 5, 6], // right
      [7, 6, 5, 4], // top
      [0, 1, 2, 3], // bottom
    ]

    const positions: number[] = []
    const uvs: number[] = []
    const normals: number[] = []

    faces.forEach((face, fi) => {
      const [a, b, c, d] = face.map((i) => new THREE.Vector3(...v[i]))

      // Two triangles: a-b-c, a-c-d
      const n = new THREE.Vector3().crossVectors(
        b.clone().sub(a), c.clone().sub(a)
      ).normalize()

      const quad = [a, b, c, a, c, d]
      const quadUvs = [
        [0, 0], [1, 0], [1, 1], [0, 0], [1, 1], [0, 1]
      ]

      // Better UVs for side faces
      quad.forEach((p, j) => {
        positions.push(p.x, p.y, p.z)
        normals.push(n.x, n.y, n.z)
        if (fi < 4) {
          // Side faces: x or z → u, y → v
          const u = fi < 2 ? (p.x + hbw) / baseW : (p.z + hbd) / baseD
          uvs.push(u, p.y / h)
        } else {
          uvs.push(quadUvs[j][0], quadUvs[j][1])
        }
      })
    })

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3))
    return geo
  }, [baseW, topW, baseD, topD, h])
}

export function IFC2() {
  const mode = useStore((s) => s.mode)

  const baseW = 16
  const topW = baseW * 0.88  // 12% taper
  const baseD = 14
  const topD = baseD * 0.88
  const height = 65

  const facadeProps = useCityFacadeMaterial({
    baseColor: [0.50, 0.56, 0.64],  // blue-grey glass
    windowDensityX: 10,
    windowDensityY: 25,
    bandSpacing: 0.03,
    seed: 501,
    nightLitFraction: 0.6,
    windowTint: [0.38, 0.45, 0.58],
    roughness: 0.3,
    metalness: 0.35,
  })

  const taperedGeo = useTaperedGeometry(baseW, topW, baseD, topD, height)

  // Crown fins: 22 vertical fins in a ring at the top
  const FIN_COUNT = 22
  const finRadius = topW / 2 + 0.3
  const finHeight = 4
  const fins = useMemo(() => {
    return Array.from({ length: FIN_COUNT }, (_, i) => {
      const angle = (i / FIN_COUNT) * Math.PI * 2
      return {
        x: Math.cos(angle) * finRadius,
        z: Math.sin(angle) * finRadius,
        ry: -angle,
      }
    })
  }, [])

  return (
    <group>
      {/* Main tapered tower */}
      <mesh geometry={taperedGeo} castShadow receiveShadow>
        <CityFacadeMaterial matProps={facadeProps} />
      </mesh>

      {/* Crown of vertical fins */}
      {fins.map((fin, i) => (
        <mesh
          key={i}
          position={[fin.x, height + finHeight / 2, fin.z]}
          rotation={[0, fin.ry, 0]}
        >
          <boxGeometry args={[0.15, finHeight, 1.5]} />
          <meshStandardMaterial
            color="#8a9098"
            metalness={0.5}
            roughness={0.3}
          />
        </mesh>
      ))}

      {/* Central antenna */}
      <mesh position={[0, height + finHeight, 0]}>
        <cylinderGeometry args={[0.12, 0.2, 12, 8]} />
        <meshStandardMaterial color="#8a9098" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Red aviation tip */}
      <mesh position={[0, height + finHeight + 6.5, 0]}>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshBasicMaterial color={mode === 'night' ? '#ff3030' : '#aa2020'} />
      </mesh>
    </group>
  )
}
