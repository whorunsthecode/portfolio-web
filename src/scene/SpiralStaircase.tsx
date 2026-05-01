import { useMemo } from 'react'
import * as THREE from 'three'

const BRASS = '#d4b880'
const WOOD = '#6a4428'
const STEEL = '#9c9488'

// Connects lower deck floor (y=-1.5) to upper deck floor top (y=0.54)
const BOTTOM_Y = -1.5
const TOP_Y = 0.75
const TOTAL_RISE = TOP_Y - BOTTOM_Y // ~2.04m
const CENTER_Z = -2.5

export function SpiralStaircase() {
  const steps = 10
  const radius = 0.6
  const stepHeight = TOTAL_RISE / steps

  const railPoints = useMemo(() => {
    return Array.from({ length: steps + 1 }, (_, i) => {
      const angle = (i / steps) * Math.PI * 1.5 // 1.5 turns
      const outerR = radius + 0.2
      return {
        x: Math.cos(angle) * outerR,
        y: BOTTOM_Y + i * stepHeight + 0.5,
        z: Math.sin(angle) * outerR,
      }
    })
  }, [])

  return (
    <group position={[0, 0, CENTER_Z]}>
      {/* Central pole — full height between decks */}
      <mesh position={[0, BOTTOM_Y + TOTAL_RISE / 2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, TOTAL_RISE + 0.5, 12]} />
        <meshStandardMaterial color={STEEL} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Steps — wedge-shaped (rotated boxes) */}
      {Array.from({ length: steps }, (_, i) => {
        const angle = (i / steps) * Math.PI * 1.5
        const y = BOTTOM_Y + i * stepHeight
        const x = Math.cos(angle) * (radius * 0.5)
        const z = Math.sin(angle) * (radius * 0.5)
        return (
          <mesh
            key={i}
            position={[x, y, z]}
            rotation={[0, -angle, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.55, 0.05, 0.35]} />
            <meshStandardMaterial color={WOOD} roughness={0.8} />
          </mesh>
        )
      })}

      {/* Brass handrail — short cylinders connecting step corners */}
      {railPoints.slice(0, -1).map((p0, i) => {
        const p1 = railPoints[i + 1]
        const mx = (p0.x + p1.x) / 2
        const my = (p0.y + p1.y) / 2
        const mz = (p0.z + p1.z) / 2
        const dx = p1.x - p0.x
        const dy = p1.y - p0.y
        const dz = p1.z - p0.z
        const len = Math.sqrt(dx * dx + dy * dy + dz * dz)

        const dir = new THREE.Vector3(dx, dy, dz).normalize()
        const up = new THREE.Vector3(0, 1, 0)
        const quat = new THREE.Quaternion().setFromUnitVectors(up, dir)
        const euler = new THREE.Euler().setFromQuaternion(quat)

        return (
          <mesh
            key={`rail-${i}`}
            position={[mx, my, mz]}
            rotation={[euler.x, euler.y, euler.z]}
          >
            <cylinderGeometry args={[0.02, 0.02, len, 8]} />
            <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.25} />
          </mesh>
        )
      })}

      {/* Top handrail post */}
      <mesh position={[railPoints[steps].x, railPoints[steps].y + 0.3, railPoints[steps].z]}>
        <cylinderGeometry args={[0.02, 0.02, 0.6, 8]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.25} />
      </mesh>
    </group>
  )
}
