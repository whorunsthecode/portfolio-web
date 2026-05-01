import { useMemo } from 'react'
import * as THREE from 'three'

// 2m transition shell that bends the alley axis from x=0 (entrance segment)
// to x=−2 (deep segment) over z=−14 to z=−16. Custom BufferGeometry quads
// because the floor/ceiling/walls are angled — not orthogonal like the
// rectangular Segments in AlleyShell.

const Z_NEAR = -14    // boundary with entrance segment (axis x=0)
const Z_FAR = -16     // boundary with deep segment (axis x=−2)
const X_NEAR = 0
const X_FAR = -2
const HALF_W = 0.9    // matches AlleyShell W=1.8
const CEILING = 3.8

function makeQuad(verts: number[], indices: number[]): THREE.BufferGeometry {
  const geom = new THREE.BufferGeometry()
  geom.setAttribute('position', new THREE.BufferAttribute(new Float32Array(verts), 3))
  geom.setIndex(new THREE.BufferAttribute(new Uint16Array(indices), 1))
  geom.computeVertexNormals()
  return geom
}

export function AlleyDogleg() {
  const { floorGeom, ceilGeom, leftWallGeom, rightWallGeom } = useMemo(() => {
    // Floor: quad at y=0. Vertex order CCW from above so normal points up.
    const floorGeom = makeQuad(
      [
        X_NEAR - HALF_W, 0, Z_NEAR,
        X_NEAR + HALF_W, 0, Z_NEAR,
        X_FAR + HALF_W, 0, Z_FAR,
        X_FAR - HALF_W, 0, Z_FAR,
      ],
      [0, 3, 2, 0, 2, 1] // CCW viewed from above (y+) → normal points up
    )

    // Ceiling: same shape at y=CEILING with reversed winding so normal points down.
    const ceilGeom = makeQuad(
      [
        X_NEAR - HALF_W, CEILING, Z_NEAR,
        X_NEAR + HALF_W, CEILING, Z_NEAR,
        X_FAR + HALF_W, CEILING, Z_FAR,
        X_FAR - HALF_W, CEILING, Z_FAR,
      ],
      [0, 1, 2, 0, 2, 3]
    )

    // Left wall: vertical quad on the −x side from (X_NEAR-HALF_W, *, Z_NEAR)
    // to (X_FAR-HALF_W, *, Z_FAR). DoubleSide so we don't worry about winding.
    const leftWallGeom = makeQuad(
      [
        X_NEAR - HALF_W, 0, Z_NEAR,
        X_NEAR - HALF_W, CEILING, Z_NEAR,
        X_FAR - HALF_W, CEILING, Z_FAR,
        X_FAR - HALF_W, 0, Z_FAR,
      ],
      [0, 1, 2, 0, 2, 3]
    )

    // Right wall: analogous on the +x side.
    const rightWallGeom = makeQuad(
      [
        X_NEAR + HALF_W, 0, Z_NEAR,
        X_FAR + HALF_W, 0, Z_FAR,
        X_FAR + HALF_W, CEILING, Z_FAR,
        X_NEAR + HALF_W, CEILING, Z_NEAR,
      ],
      [0, 1, 2, 0, 2, 3]
    )

    return { floorGeom, ceilGeom, leftWallGeom, rightWallGeom }
  }, [])

  return (
    <group>
      <mesh geometry={floorGeom} receiveShadow>
        <meshStandardMaterial color={'#1e1a14'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={ceilGeom}>
        <meshStandardMaterial color={'#1a1610'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={leftWallGeom}>
        <meshStandardMaterial color={'#2e2820'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <mesh geometry={rightWallGeom}>
        <meshStandardMaterial color={'#2e2820'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
