// src/worlds/Chungking/CorridorPipes.tsx
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface PipePlacement {
  midZ: number
  len: number
  x: number
  y: number
}

function buildPlacements(): PipePlacement[] {
  const rng = mulberry32(1994)
  const placements: PipePlacement[] = []

  // 3 long runs spanning most of the corridor at varying x/y
  const runs = [
    { x: -0.55, y: 2.38 },
    { x:  0.3,  y: 2.44 },
    { x:  0.0,  y: 2.35 },
  ]
  runs.forEach(({ x, y }) => {
    placements.push({ midZ: -19, len: 20, x, y })
  })

  // Short cross-members every ~2.5m
  for (let z = -10; z >= -28; z -= 2.5) {
    placements.push({
      midZ: z,
      len: 0.9 + rng() * 0.6,
      x: (rng() - 0.5) * 1.2,
      y: 2.3 + rng() * 0.12,
    })
  }

  return placements
}

export function CorridorPipes() {
  const placements = useMemo(() => buildPlacements(), [])
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const dummy   = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    placements.forEach(({ midZ, len, x, y }, i) => {
      dummy.position.set(x, y, midZ)
      dummy.rotation.set(Math.PI / 2, 0, 0)   // cylinder along Z axis
      dummy.scale.set(1, len, 1)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [placements, dummy])

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, placements.length]}>
      <cylinderGeometry args={[0.04, 0.04, 1, 8]} />
      <meshStandardMaterial color="#3a2f22" metalness={0.35} roughness={0.75} />
    </instancedMesh>
  )
}
