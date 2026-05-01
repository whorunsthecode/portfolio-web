import { useMemo } from 'react'
import * as THREE from 'three'
import { useCityFacadeMaterial, CityFacadeMaterial } from '../CityFacade'
import { useStore } from '../../store'
import { InfoTag } from '../../scene/components/InfoTag'

/**
 * Bank of China Tower — I.M. Pei, 1990. Faithfully captures the
 * signature form: a square cube base, four triangular shafts rising to
 * different heights, and a single tallest shaft terminating in a sharp
 * pyramid point. Prominent external X bracing on the cube base is the
 * building's most recognisable facade detail.
 *
 * Structure:
 *   y=0..24    cube base (the real tower's 52m base cube)
 *   y=24..42   three shorter triangular shafts terminate (SW then NW
 *              then NE, stepped in height)
 *   y=24..64   tallest (SE) shaft continues upward
 *   y=64..78   SE shaft tapers to a point (pyramid)
 *   y=78..94   antenna mast
 */

// Triangular prism with flat top. Base triangle at y=0, top triangle at
// y=height. Used for the four shafts and the base quadrants.
function useTriPrismGeometry(
  vA: [number, number],
  vB: [number, number],
  vC: [number, number],
  height: number,
) {
  return useMemo(() => {
    const v = [
      [vA[0], 0, vA[1]],
      [vB[0], 0, vB[1]],
      [vC[0], 0, vC[1]],
      [vA[0], height, vA[1]],
      [vB[0], height, vB[1]],
      [vC[0], height, vC[1]],
    ] as [number, number, number][]

    // Ensure CCW base ordering
    const ax = vB[0] - vA[0], az = vB[1] - vA[1]
    const bx = vC[0] - vA[0], bz = vC[1] - vA[1]
    const crossY = ax * bz - az * bx
    const I = crossY < 0 ? [0, 2, 1, 3, 5, 4] : [0, 1, 2, 3, 4, 5]

    const positions: number[] = []
    const normals: number[] = []
    const uvs: number[] = []

    const addTri = (i0: number, i1: number, i2: number) => {
      const p0 = v[i0], p1 = v[i1], p2 = v[i2]
      const a = new THREE.Vector3(...p0)
      const b = new THREE.Vector3(...p1)
      const c = new THREE.Vector3(...p2)
      const n = new THREE.Vector3().crossVectors(
        b.clone().sub(a), c.clone().sub(a),
      ).normalize()
      const pts = [p0, p1, p2]
      for (let j = 0; j < 3; j++) {
        positions.push(pts[j][0], pts[j][1], pts[j][2])
        normals.push(n.x, n.y, n.z)
        uvs.push(j === 0 ? 0 : 1, pts[j][1] / Math.max(height, 1))
      }
    }

    // base triangle (viewed from below)
    addTri(I[0], I[2], I[1])
    // top triangle
    addTri(I[3], I[4], I[5])
    // three sides
    addTri(I[0], I[1], I[4]); addTri(I[0], I[4], I[3])
    addTri(I[1], I[2], I[5]); addTri(I[1], I[5], I[4])
    addTri(I[2], I[0], I[3]); addTri(I[2], I[3], I[5])

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
    return geo
  }, [vA, vB, vC, height])
}

// Triangular pyramid (tapered tip). Base triangle at y=0, single apex
// vertex at y=height directly above the triangle's centroid. Used for
// the sharp knife tip of the SE shaft.
function useTriPyramidGeometry(
  vA: [number, number],
  vB: [number, number],
  vC: [number, number],
  height: number,
) {
  return useMemo(() => {
    const cx = (vA[0] + vB[0] + vC[0]) / 3
    const cz = (vA[1] + vB[1] + vC[1]) / 3
    const v = [
      [vA[0], 0, vA[1]],
      [vB[0], 0, vB[1]],
      [vC[0], 0, vC[1]],
      [cx, height, cz],
    ] as [number, number, number][]

    const positions: number[] = []
    const normals: number[] = []
    const uvs: number[] = []
    const addTri = (i0: number, i1: number, i2: number) => {
      const p0 = v[i0], p1 = v[i1], p2 = v[i2]
      const a = new THREE.Vector3(...p0)
      const b = new THREE.Vector3(...p1)
      const c = new THREE.Vector3(...p2)
      const n = new THREE.Vector3().crossVectors(
        b.clone().sub(a), c.clone().sub(a),
      ).normalize()
      const pts = [p0, p1, p2]
      for (let j = 0; j < 3; j++) {
        positions.push(pts[j][0], pts[j][1], pts[j][2])
        normals.push(n.x, n.y, n.z)
        uvs.push(j === 0 ? 0 : 1, pts[j][1] / Math.max(height, 1))
      }
    }
    // base CCW viewed from below
    addTri(0, 2, 1)
    // three slanted faces up to apex
    addTri(0, 1, 3)
    addTri(1, 2, 3)
    addTri(2, 0, 3)

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3))
    geo.setAttribute('normal', new THREE.BufferAttribute(new Float32Array(normals), 3))
    geo.setAttribute('uv', new THREE.BufferAttribute(new Float32Array(uvs), 2))
    return geo
  }, [vA, vB, vC, height])
}

// External X bracing on one face of the base cube. Rendered as two
// crossed diagonal bars protruding slightly from the glass so they
// catch light the way the real structural bracing does.
function CubeBracing({ side, cubeH, cubeW }: {
  side: 'N' | 'S' | 'E' | 'W'
  cubeH: number
  cubeW: number
}) {
  const mode = useStore((s) => s.mode)
  const offset = cubeW / 2 + 0.05
  const position: [number, number, number] =
    side === 'N' ? [0, cubeH / 2, -offset] :
    side === 'S' ? [0, cubeH / 2,  offset] :
    side === 'E' ? [ offset, cubeH / 2, 0] :
                   [-offset, cubeH / 2, 0]
  const rotY =
    side === 'N' ? 0 :
    side === 'S' ? Math.PI :
    side === 'E' ? -Math.PI / 2 :
                   Math.PI / 2
  const diagLen = Math.sqrt(cubeW * cubeW + cubeH * cubeH)
  const diagAngle = Math.atan2(cubeH, cubeW)
  const thickness = 0.35
  const color = '#a8b4bc'
  const nightColor = '#6a8a98'
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      {/* Two diagonals */}
      <mesh rotation={[0, 0, diagAngle]}>
        <boxGeometry args={[diagLen, thickness, 0.25]} />
        <meshStandardMaterial color={mode === 'night' ? nightColor : color} roughness={0.4} metalness={0.55} />
      </mesh>
      <mesh rotation={[0, 0, -diagAngle]}>
        <boxGeometry args={[diagLen, thickness, 0.25]} />
        <meshStandardMaterial color={mode === 'night' ? nightColor : color} roughness={0.4} metalness={0.55} />
      </mesh>
      {/* Horizontal waist bar at mid-height */}
      <mesh position={[0, 0, 0.05]}>
        <boxGeometry args={[cubeW, thickness * 0.9, 0.22]} />
        <meshStandardMaterial color={mode === 'night' ? nightColor : color} roughness={0.4} metalness={0.55} />
      </mesh>
    </group>
  )
}

export function BoC() {
  const mode = useStore((s) => s.mode)

  // Footprint
  const HW = 10   // half width
  const HD = 10   // half depth
  const CUBE_H = 24

  // Shaft heights (above cube top)
  const H_SW = 16
  const H_NW = 24
  const H_NE = 32
  const H_SE_SHAFT = 40     // SE straight shaft portion
  const H_SE_PYRAMID = 14   // SE tapered tip above shaft

  // Base-cube quadrants + four shafts
  const SE: [number, number] = [ HW,  HD]
  const NE: [number, number] = [ HW, -HD]
  const NW: [number, number] = [-HW, -HD]
  const SW: [number, number] = [-HW,  HD]
  const C:  [number, number] = [  0,   0]

  // Base cube quadrants (each covers 1/4 of the base, all at cube height)
  const geoBaseSW = useTriPrismGeometry(C, SW, NW, CUBE_H)
  const geoBaseNW = useTriPrismGeometry(C, NW, NE, CUBE_H)
  const geoBaseNE = useTriPrismGeometry(C, NE, SE, CUBE_H)
  const geoBaseSE = useTriPrismGeometry(C, SE, SW, CUBE_H)

  // Upper shafts (sit on top of cube, hence group offset y=CUBE_H)
  const geoSW = useTriPrismGeometry(C, SW, NW, H_SW)
  const geoNW = useTriPrismGeometry(C, NW, NE, H_NW)
  const geoNE = useTriPrismGeometry(C, NE, SE, H_NE)
  const geoSE = useTriPrismGeometry(C, SE, SW, H_SE_SHAFT)

  // SE tip pyramid — apex above the SE triangle's centroid
  const geoSEtip = useTriPyramidGeometry(C, SE, SW, H_SE_PYRAMID)

  const facade = useCityFacadeMaterial({
    baseColor: [0.52, 0.6, 0.7],
    windowDensityX: 8,
    windowDensityY: 14,
    bracingType: 1,
    bracingColor: [0.72, 0.82, 0.9],
    bracingWidth: 0.03,
    tiers: 1,
    windowTint: [0.42, 0.52, 0.66],
    panelAlternate: true,
    seed: 401,
    nightLitFraction: 0.55,
    roughness: 0.22,
    metalness: 0.6,
  })

  const antennaTop = CUBE_H + H_SE_SHAFT + H_SE_PYRAMID
  const antennaH = 16

  return (
    <group>
      {/* ── Base cube (four quadrant prisms) ── */}
      <mesh geometry={geoBaseSW} castShadow receiveShadow>
        <CityFacadeMaterial matProps={facade} />
      </mesh>
      <mesh geometry={geoBaseNW} castShadow receiveShadow>
        <CityFacadeMaterial matProps={facade} />
      </mesh>
      <mesh geometry={geoBaseNE} castShadow receiveShadow>
        <CityFacadeMaterial matProps={facade} />
      </mesh>
      <mesh geometry={geoBaseSE} castShadow receiveShadow>
        <CityFacadeMaterial matProps={facade} />
      </mesh>

      {/* External X bracing on each face of the base cube */}
      <CubeBracing side="N" cubeH={CUBE_H} cubeW={HW * 2} />
      <CubeBracing side="S" cubeH={CUBE_H} cubeW={HW * 2} />
      <CubeBracing side="E" cubeH={CUBE_H} cubeW={HD * 2} />
      <CubeBracing side="W" cubeH={CUBE_H} cubeW={HD * 2} />

      {/* ── Upper shafts — rise from cube top to varying heights ── */}
      <group position={[0, CUBE_H, 0]}>
        <mesh geometry={geoSW} castShadow receiveShadow>
          <CityFacadeMaterial matProps={facade} />
        </mesh>
        <mesh geometry={geoNW} castShadow receiveShadow>
          <CityFacadeMaterial matProps={facade} />
        </mesh>
        <mesh geometry={geoNE} castShadow receiveShadow>
          <CityFacadeMaterial matProps={facade} />
        </mesh>
        <mesh geometry={geoSE} castShadow receiveShadow>
          <CityFacadeMaterial matProps={facade} />
        </mesh>
      </group>

      {/* ── Pyramid tip on top of the SE shaft ── */}
      <group position={[0, CUBE_H + H_SE_SHAFT, 0]}>
        <mesh geometry={geoSEtip} castShadow>
          <CityFacadeMaterial matProps={facade} />
        </mesh>
      </group>

      {/* ── Single antenna mast rising from the tip ── */}
      <group position={[0, antennaTop, 0]}>
        <mesh position={[0, antennaH / 2, 0]}>
          <cylinderGeometry args={[0.08, 0.14, antennaH, 6]} />
          <meshStandardMaterial color="#8a9098" metalness={0.6} roughness={0.3} />
        </mesh>
        {/* Red aviation light */}
        <mesh position={[0, antennaH + 0.15, 0]}>
          <sphereGeometry args={[0.22, 8, 8]} />
          <meshBasicMaterial color={mode === 'night' ? '#ff2828' : '#b82020'} />
        </mesh>
      </group>

      <InfoTag
        label="Bank of China Tower · I.M. Pei"
        offset={[HW + 4, (CUBE_H + H_SE_SHAFT) * 0.6, 0]}
        side="right"
      />
    </group>
  )
}
