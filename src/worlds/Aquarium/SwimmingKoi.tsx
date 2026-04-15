import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Shared cursor world position — updated by a raycaster each frame
const cursorWorld = new THREE.Vector3(0, 999, 0)
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2(999, 999)

/** Invisible plane that tracks where the cursor is in 3D space */
export function CursorTracker() {
  const planeRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  useFrame(({ pointer: p }) => {
    pointer.set(p.x, p.y)
    raycaster.setFromCamera(pointer, camera)
    if (planeRef.current) {
      const hits = raycaster.intersectObject(planeRef.current)
      if (hits.length > 0) {
        cursorWorld.copy(hits[0].point)
      }
    }
  })

  return (
    <mesh ref={planeRef} position={[0, 0, 0]} visible={false}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial />
    </mesh>
  )
}

const FLEE_RADIUS = 2.0
const FLEE_STRENGTH = 1.5

interface KoiProps {
  position: [number, number, number]
  scale: number
  variant: 'orange' | 'white' | 'mixed'
  pathRadius: number
  pathOffsetZ: number
  speed: number
  phaseOffset: number
}

function Koi({ position, scale, variant, pathRadius, pathOffsetZ, speed, phaseOffset }: KoiProps) {
  const groupRef = useRef<THREE.Group>(null)
  const tailRef = useRef<THREE.Mesh>(null)
  const fleeOffset = useRef(new THREE.Vector3())

  const colors = useMemo(() => {
    if (variant === 'orange') return { body: '#f87028', spot: '#f4ece0', fin: '#c85020' }
    if (variant === 'white') return { body: '#f4ece0', spot: '#f87028', fin: '#d8cbb8' }
    return { body: '#f87028', spot: '#1a1414', fin: '#c85020' }
  }, [variant])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime * speed + phaseOffset

    // Base path position
    let x = Math.cos(t) * pathRadius + position[0]
    let z = Math.sin(t) * 0.3 + pathOffsetZ
    let y = position[1] + Math.sin(t * 1.3) * 0.1

    // Flee from cursor
    const dx = x - cursorWorld.x
    const dy = y - cursorWorld.y
    const dz = z - cursorWorld.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    if (dist < FLEE_RADIUS && dist > 0.01) {
      const force = (1 - dist / FLEE_RADIUS) * FLEE_STRENGTH
      const target = new THREE.Vector3(dx / dist * force, dy / dist * force, dz / dist * force)
      fleeOffset.current.lerp(target, 0.1)
    } else {
      fleeOffset.current.lerp(new THREE.Vector3(0, 0, 0), 0.05)
    }

    x += fleeOffset.current.x
    y += fleeOffset.current.y
    z += fleeOffset.current.z

    groupRef.current.position.set(x, y, z)

    const velX = -Math.sin(t) * pathRadius + fleeOffset.current.x * 5
    groupRef.current.rotation.y = Math.atan2(velX, 0) + Math.PI / 2

    if (tailRef.current) {
      const tailSpeed = dist < FLEE_RADIUS ? 8 : 3
      tailRef.current.rotation.y = Math.sin(t * tailSpeed) * 0.4
    }
  })

  return (
    <group ref={groupRef} scale={scale}>
      <mesh>
        <boxGeometry args={[0.35, 0.12, 0.15]} />
        <meshBasicMaterial color={colors.body} />
      </mesh>
      <mesh position={[0.2, 0, 0]}>
        <boxGeometry args={[0.15, 0.1, 0.12]} />
        <meshBasicMaterial color={colors.body} />
      </mesh>
      <mesh position={[-0.2, 0, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.1]} />
        <meshBasicMaterial color={colors.body} />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.18, 0.02, 0.1]} />
        <meshBasicMaterial color={colors.spot} />
      </mesh>
      <mesh position={[0.14, 0.05, 0]}>
        <boxGeometry args={[0.08, 0.02, 0.08]} />
        <meshBasicMaterial color={colors.spot} />
      </mesh>
      <mesh ref={tailRef} position={[-0.3, 0, 0]}>
        <boxGeometry args={[0.1, 0.14, 0.02]} />
        <meshBasicMaterial color={colors.fin} />
      </mesh>
      <mesh position={[0.05, -0.05, 0.08]}>
        <boxGeometry args={[0.08, 0.04, 0.06]} />
        <meshBasicMaterial color={colors.fin} />
      </mesh>
      <mesh position={[0.25, 0.02, 0.065]}>
        <boxGeometry args={[0.02, 0.02, 0.02]} />
        <meshBasicMaterial color="#1a1414" />
      </mesh>
    </group>
  )
}

function Angelfish({ position, scale, phaseOffset, speed }: {
  position: [number, number, number]; scale: number; phaseOffset: number; speed: number
}) {
  const ref = useRef<THREE.Group>(null)
  const fleeOffset = useRef(new THREE.Vector3())

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime * speed + phaseOffset
    let x = position[0] + Math.cos(t) * 1.5
    let y = position[1] + Math.sin(t * 1.5) * 0.3
    let z = position[2] + Math.sin(t) * 0.5

    const dx = x - cursorWorld.x
    const dy = y - cursorWorld.y
    const dz = z - cursorWorld.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
    if (dist < FLEE_RADIUS && dist > 0.01) {
      const force = (1 - dist / FLEE_RADIUS) * FLEE_STRENGTH
      fleeOffset.current.lerp(new THREE.Vector3(dx / dist * force, dy / dist * force, dz / dist * force), 0.1)
    } else {
      fleeOffset.current.lerp(new THREE.Vector3(0, 0, 0), 0.05)
    }

    ref.current.position.set(x + fleeOffset.current.x, y + fleeOffset.current.y, z + fleeOffset.current.z)
    ref.current.rotation.y = Math.atan2(-Math.sin(t) * 1.5, 0) + Math.PI / 2
  })

  return (
    <group ref={ref} scale={[scale, scale, scale]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.12, 0.25, 3]} />
        <meshBasicMaterial color="#f8e060" />
      </mesh>
      <mesh position={[0.05, 0, 0.06]}>
        <boxGeometry args={[0.02, 0.18, 0.005]} />
        <meshBasicMaterial color="#1a1a18" />
      </mesh>
      <mesh position={[-0.05, 0, 0.06]}>
        <boxGeometry args={[0.02, 0.18, 0.005]} />
        <meshBasicMaterial color="#1a1a18" />
      </mesh>
      <mesh position={[0.08, 0.05, 0.06]}>
        <circleGeometry args={[0.015, 6]} />
        <meshBasicMaterial color="#1a1a18" />
      </mesh>
    </group>
  )
}

function Jellyfish({ position, scale, phaseOffset }: {
  position: [number, number, number]; scale: number; phaseOffset: number
}) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime + phaseOffset
    ref.current.position.y = position[1] + Math.sin(t * 0.6) * 0.4
    ref.current.scale.y = scale * (1 + Math.sin(t * 1.5) * 0.15)
  })
  return (
    <group ref={ref} position={position} scale={[scale, scale, scale]}>
      <mesh>
        <sphereGeometry args={[0.15, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshBasicMaterial color="#f8b8d8" transparent opacity={0.7} />
      </mesh>
      {[-0.08, -0.04, 0, 0.04, 0.08].map((x, i) => (
        <mesh key={i} position={[x, -0.18, 0]}>
          <cylinderGeometry args={[0.005, 0.002, 0.3, 4]} />
          <meshBasicMaterial color="#f8b8d8" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function Turtle({ position, phaseOffset }: {
  position: [number, number, number]; phaseOffset: number
}) {
  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime * 0.2 + phaseOffset
    ref.current.position.set(
      position[0] + Math.cos(t) * 3,
      position[1] + Math.sin(t * 0.5) * 0.2,
      position[2] + Math.sin(t) * 0.4,
    )
    ref.current.rotation.y = Math.atan2(-Math.sin(t) * 3, 0) + Math.PI / 2
  })
  return (
    <group ref={ref}>
      <mesh>
        <sphereGeometry args={[0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#5a7048" roughness={0.8} />
      </mesh>
      <mesh position={[0.18, 0, 0]}>
        <sphereGeometry args={[0.06, 8, 8]} />
        <meshStandardMaterial color="#6a8058" />
      </mesh>
      <mesh position={[0.05, -0.05, 0.12]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.12, 0.02, 0.06]} />
        <meshStandardMaterial color="#5a7048" />
      </mesh>
      <mesh position={[0.05, -0.05, -0.12]} rotation={[0, 0, -0.3]}>
        <boxGeometry args={[0.12, 0.02, 0.06]} />
        <meshStandardMaterial color="#5a7048" />
      </mesh>
    </group>
  )
}

export function SwimmingKoi() {
  const kois = useMemo<KoiProps[]>(
    () => [
      { position: [-2, 0.5, -1], scale: 1.0, variant: 'orange', pathRadius: 2.5, pathOffsetZ: -1, speed: 0.4, phaseOffset: 0 },
      { position: [2, 1.0, 1], scale: 0.8, variant: 'white', pathRadius: 3.0, pathOffsetZ: 0, speed: 0.5, phaseOffset: 1.5 },
      { position: [0, -0.5, -2], scale: 1.2, variant: 'mixed', pathRadius: 3.5, pathOffsetZ: -1, speed: 0.3, phaseOffset: 3 },
      { position: [-1, 1.5, 2], scale: 0.7, variant: 'orange', pathRadius: 2.0, pathOffsetZ: 1, speed: 0.6, phaseOffset: 4.5 },
      { position: [3, 0, -2], scale: 0.9, variant: 'white', pathRadius: 2.8, pathOffsetZ: -1.5, speed: 0.45, phaseOffset: 2.2 },
      { position: [-3, 0.5, 1], scale: 1.1, variant: 'orange', pathRadius: 3.2, pathOffsetZ: 0.5, speed: 0.35, phaseOffset: 5.5 },
    ],
    [],
  )

  return (
    <>
      <CursorTracker />
      {kois.map((koi, i) => (
        <Koi key={i} {...koi} />
      ))}
      <Angelfish position={[2, 1, -1]} scale={1.2} speed={0.5} phaseOffset={0} />
      <Angelfish position={[-2, 0.5, -1]} scale={1.0} speed={0.4} phaseOffset={2} />
      <Jellyfish position={[1.5, 1.5, -3]} scale={1.0} phaseOffset={0} />
      <Jellyfish position={[-2.5, 2, -2.5]} scale={0.8} phaseOffset={1.5} />
      <Turtle position={[0, -0.5, -3]} phaseOffset={0} />
    </>
  )
}
