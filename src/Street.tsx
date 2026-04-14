import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from './store'

/* ── Road ─────────────────────────────────────────────── */
export function Road() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, -75]} receiveShadow>
      <planeGeometry args={[20, 300]} />
      <meshStandardMaterial color="#4a463e" roughness={0.9} />
    </mesh>
  )
}

/* ── Tram tracks ──────────────────────────────────────── */
function Rail({ x }: { x: number }) {
  return (
    <mesh position={[x, 0.07, -75]}>
      <boxGeometry args={[0.07, 0.04, 300]} />
      <meshStandardMaterial color="#8a8578" metalness={0.6} roughness={0.3} />
    </mesh>
  )
}

export function TramTracks() {
  // Inner pair (tram 1) and outer pair (tram 2)
  return (
    <>
      <Rail x={-0.4} />
      <Rail x={0.4} />
      <Rail x={-3.2} />
      <Rail x={-2.6} />
    </>
  )
}

/* ── Lane markings (animated) ─────────────────────────── */
const MARKING_COUNT = 60
const MARKING_SPREAD = 180 // total z-distance covered
const RESET_Z = 5 // when marking passes camera

export function LaneMarkings() {
  const meshRef = useRef<THREE.InstancedMesh>(null)

  const offsets = useMemo(() => {
    const arr = new Float32Array(MARKING_COUNT)
    for (let i = 0; i < MARKING_COUNT; i++) {
      arr[i] = -i * (MARKING_SPREAD / MARKING_COUNT)
    }
    return arr
  }, [])

  // Initialize instance matrices
  useMemo(() => {
    // Will be set in useFrame
  }, [])

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame((_, delta) => {
    if (!meshRef.current) return
    const speed = 6 // units per second

    for (let i = 0; i < MARKING_COUNT; i++) {
      offsets[i] += speed * delta
      if (offsets[i] > RESET_Z) {
        offsets[i] -= MARKING_SPREAD
      }
      // x=1.8 puts markings on the right lane divider
      dummy.position.set(1.8, 0.09, offsets[i])
      dummy.rotation.set(-Math.PI / 2, 0, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(i, dummy.matrix)
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, MARKING_COUNT]} receiveShadow>
      <planeGeometry args={[0.12, 1.5]} />
      <meshStandardMaterial color="#d4cfc5" roughness={0.8} />
    </instancedMesh>
  )
}

/* ── Catenary poles ───────────────────────────────────── */
const POLE_SPACING = 7
const POLE_COUNT = 42 // covers ~300 units
const POLE_HEIGHT = 6
const POLE_X = 2.85

export function CatenaryPoles() {
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const meshRef = useRef<THREE.InstancedMesh>(null)

  useMemo(() => {
    // set up on mount via ref callback won't work with useMemo
    // we'll do it in a useFrame guard
  }, [])

  const initialized = useRef(false)

  useFrame(() => {
    if (!meshRef.current || initialized.current) return
    initialized.current = true

    let idx = 0
    for (let i = 0; i < POLE_COUNT; i++) {
      const z = -i * POLE_SPACING
      const side = i % 2 === 0 ? POLE_X : -POLE_X
      dummy.position.set(side, POLE_HEIGHT / 2, z)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      meshRef.current.setMatrixAt(idx, dummy.matrix)
      idx++
    }
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, POLE_COUNT]} castShadow>
      <boxGeometry args={[0.12, POLE_HEIGHT, 0.12]} />
      <meshStandardMaterial color="#3d2b1f" roughness={0.85} />
    </instancedMesh>
  )
}
