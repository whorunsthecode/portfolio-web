import { useRef, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { useStore } from '../../store'
import { InteractiveGlow } from '../../scene/components/InteractiveGlow'

const GLOBE_RADIUS = 0.9
const SNOW_COUNT = 80

export function SnowGlobe() {
  const globeRef = useRef<THREE.Group>(null)
  const snowRefs = useRef<THREE.Mesh[]>([])
  const setModal = useStore((s) => s.setModal)

  const villageTex = useTexture('/assets/xmas-village.png')

  useEffect(() => {
    if (villageTex) {
      villageTex.minFilter = THREE.LinearMipmapLinearFilter
      villageTex.magFilter = THREE.LinearFilter
      villageTex.anisotropy = 16
      villageTex.needsUpdate = true
    }
  }, [villageTex])

  const snowPositions = useRef<THREE.Vector3[]>(
    Array.from({ length: SNOW_COUNT }).map(() => {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const r = Math.random() * GLOBE_RADIUS * 0.8
      return new THREE.Vector3(
        r * Math.sin(phi) * Math.cos(theta),
        r * Math.cos(phi) * 0.5 + GLOBE_RADIUS * 0.5,
        r * Math.sin(phi) * Math.sin(theta),
      )
    })
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (globeRef.current) {
      globeRef.current.rotation.y = Math.sin(t * 0.15) * 0.1
    }

    snowRefs.current.forEach((mesh, i) => {
      if (!mesh) return
      const pos = snowPositions.current[i]
      pos.y -= 0.002 + Math.sin(i * 1.7) * 0.001
      pos.x += Math.sin(t * 0.5 + i) * 0.0008

      if (pos.y < 0.15) {
        pos.y = GLOBE_RADIUS * 1.5
        pos.x = (Math.random() - 0.5) * GLOBE_RADIUS * 1.2
        pos.z = (Math.random() - 0.5) * GLOBE_RADIUS * 1.2
      }
      mesh.position.copy(pos)
    })
  })

  return (
    <group
      position={[0, 1.05, -1.5]}
      onClick={(e) => {
        e.stopPropagation()
        setModal('christmas')
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      <group ref={globeRef}>
        {/* Glass sphere */}
        <mesh position={[0, GLOBE_RADIUS, 0]}>
          <sphereGeometry args={[GLOBE_RADIUS, 32, 24]} />
          <meshPhysicalMaterial
            color="#e8f0f4"
            transparent
            opacity={0.12}
            roughness={0.05}
            transmission={0.92}
            side={2}
          />
        </mesh>

        {/* Xmas Village image — curved billboard inside the globe */}
        <mesh position={[0, GLOBE_RADIUS * 0.7, 0]}>
          <planeGeometry args={[1.3, 0.85]} />
          <meshBasicMaterial
            map={villageTex}
            side={2}
          />
        </mesh>

        {/* Snow ground inside globe */}
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[GLOBE_RADIUS * 0.75, 24]} />
          <meshStandardMaterial color="#f0ece8" roughness={0.95} />
        </mesh>

        {/* Tiny trees inside globe flanking the image */}
        {[-0.5, 0.5].map((x, i) => (
          <group key={i} position={[x, 0.12, 0.2]}>
            <mesh position={[0, 0.08, 0]}>
              <coneGeometry args={[0.06, 0.15, 6]} />
              <meshStandardMaterial color="#1a5a28" />
            </mesh>
          </group>
        ))}

        {/* Snowflakes */}
        {Array.from({ length: SNOW_COUNT }).map((_, i) => (
          <mesh
            key={i}
            ref={(el) => { if (el) snowRefs.current[i] = el }}
            position={[0, GLOBE_RADIUS, 0]}
          >
            <sphereGeometry args={[0.01, 4, 4]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}

        {/* Santa easter egg moved OUT of the globe — he now flies past
            the post-office window outside, per user request. See
            <SantaSleigh /> usage in ChristmasVillage/index.tsx. */}
      </group>

      {/* Wooden base */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[1.0, 1.05, 0.12, 24]} />
        <meshStandardMaterial color="#5a3a20" roughness={0.8} />
      </mesh>
      {/* Base detail ring */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[1.06, 1.08, 0.02, 24]} />
        <meshStandardMaterial color="#4a2a18" roughness={0.8} />
      </mesh>
      {/* Brass rim */}
      <mesh position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.92, 0.92, 0.04, 24]} />
        <meshStandardMaterial color="#c8a048" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Inner glow */}
      <pointLight position={[0, GLOBE_RADIUS, 0]} color="#ffd880" intensity={1.2} distance={2.5} decay={2} />

      <InteractiveGlow radius={1.0} color="#ffd040" y={-0.02} />
    </group>
  )
}
