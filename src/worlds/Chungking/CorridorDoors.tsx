// src/worlds/Chungking/CorridorDoors.tsx
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

const DOOR_W = 0.85
const DOOR_H = 2.05
const DOOR_D = 0.06

interface DoorPlacement {
  z: number
  side: 'left' | 'right'
  number: string
}

const PLACEMENTS: DoorPlacement[] = [
  { z: -10.5, side: 'left',  number: 'A-1204' },
  { z: -12.5, side: 'right', number: 'A-1205' },
  { z: -14.0, side: 'left',  number: 'A-1206' },
  { z: -16.0, side: 'right', number: 'A-1207' },
  { z: -17.5, side: 'left',  number: 'A-1208' },
  { z: -20.5, side: 'right', number: 'A-1209' },
  { z: -22.0, side: 'left',  number: 'A-1210' },
  { z: -23.5, side: 'right', number: 'A-1211' },
  { z: -25.5, side: 'left',  number: 'A-1212' },
  { z: -27.5, side: 'right', number: 'A-1213' },
]

const HALF_W = 1.8 / 2  // corridor half-width

function makeDoorNumberTexture(number: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#2a1a0c'
  ctx.fillRect(0, 0, 128, 64)
  ctx.fillStyle = '#c8a060'
  ctx.font = 'bold 18px monospace'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(number, 64, 32)
  return new THREE.CanvasTexture(canvas)
}

export function CorridorDoors() {
  const panelRef = useRef<THREE.InstancedMesh>(null)
  const stripRef = useRef<THREE.InstancedMesh>(null)

  const dummy = useMemo(() => new THREE.Object3D(), [])

  useEffect(() => {
    const panel = panelRef.current
    const strip = stripRef.current
    if (!panel || !strip) return

    PLACEMENTS.forEach(({ z, side }, i) => {
      const x = side === 'left' ? -HALF_W + DOOR_D / 2 : HALF_W - DOOR_D / 2
      const rotY = side === 'left' ? -Math.PI / 2 : Math.PI / 2

      // Door panel
      dummy.position.set(x, DOOR_H / 2, z)
      dummy.rotation.set(0, rotY, 0)
      dummy.updateMatrix()
      panel.setMatrixAt(i, dummy.matrix)

      // Emissive floor strip (warm glow under door gap)
      dummy.position.set(x, 0.002, z)
      dummy.rotation.set(-Math.PI / 2, 0, rotY)
      dummy.updateMatrix()
      strip.setMatrixAt(i, dummy.matrix)
    })

    panel.instanceMatrix.needsUpdate = true
    strip.instanceMatrix.needsUpdate = true
  }, [dummy])

  // Number plates are individual meshes (10 total, not worth instancing)
  const plates = PLACEMENTS.map(({ z, side, number }) => {
    const tex = makeDoorNumberTexture(number)
    const x = side === 'left'
      ? -HALF_W + DOOR_D + 0.001
      : HALF_W - DOOR_D - 0.001
    const rotY = side === 'left' ? -Math.PI / 2 : Math.PI / 2
    return { x, z, rotY, tex, key: number }
  })

  return (
    <group>
      {/* All door panels — 1 draw call */}
      <instancedMesh ref={panelRef} args={[undefined, undefined, PLACEMENTS.length]}>
        <boxGeometry args={[DOOR_W, DOOR_H, DOOR_D]} />
        <meshStandardMaterial color="#503218" roughness={0.88} />
      </instancedMesh>

      {/* All floor strips — 1 draw call */}
      <instancedMesh ref={stripRef} args={[undefined, undefined, PLACEMENTS.length]}>
        <planeGeometry args={[0.6, 0.05]} />
        <meshStandardMaterial
          color="#ffb038"
          emissive="#ffb038"
          emissiveIntensity={1.1}
        />
      </instancedMesh>

      {/* Number plates (10 individual meshes, acceptable) */}
      {plates.map(({ x, z, rotY, tex, key }) => (
        <mesh key={key} position={[x, 1.85, z]} rotation={[0, rotY, 0]}>
          <planeGeometry args={[0.18, 0.09]} />
          <meshStandardMaterial map={tex} roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}
