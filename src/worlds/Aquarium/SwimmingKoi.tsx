import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface KoiProps {
  position: [number, number, number]
  scale: number
  variant: 'orange' | 'white' | 'mixed'
  pathRadius: number
  pathOffsetZ: number
  speed: number
  phaseOffset: number
}

function Koi({
  position,
  scale,
  variant,
  pathRadius,
  pathOffsetZ,
  speed,
  phaseOffset,
}: KoiProps) {
  const groupRef = useRef<THREE.Group>(null)
  const tailRef = useRef<THREE.Mesh>(null)

  const colors = useMemo(() => {
    if (variant === 'orange') return { body: '#f87028', spot: '#f4ece0', fin: '#c85020' }
    if (variant === 'white') return { body: '#f4ece0', spot: '#f87028', fin: '#d8cbb8' }
    return { body: '#f87028', spot: '#1a1414', fin: '#c85020' }
  }, [variant])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime * speed + phaseOffset

    // Lazy oval loop underwater
    const x = Math.cos(t) * pathRadius + position[0]
    const z = Math.sin(t) * 0.3 + pathOffsetZ
    const y = position[1] + Math.sin(t * 1.3) * 0.1

    groupRef.current.position.set(x, y, z)

    // Face direction of travel (velocity has x-component from d/dt[cos(t)*R] = -sin(t)*R)
    const dx = -Math.sin(t) * pathRadius
    groupRef.current.rotation.y = Math.atan2(dx, 0) + Math.PI / 2

    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 3) * 0.4
    }
  })

  return (
    <group ref={groupRef} scale={scale}>
      {/* Main body */}
      <mesh>
        <boxGeometry args={[0.35, 0.12, 0.15]} />
        <meshBasicMaterial color={colors.body} />
      </mesh>
      {/* Head taper */}
      <mesh position={[0.2, 0, 0]}>
        <boxGeometry args={[0.15, 0.1, 0.12]} />
        <meshBasicMaterial color={colors.body} />
      </mesh>
      {/* Rear taper */}
      <mesh position={[-0.2, 0, 0]}>
        <boxGeometry args={[0.12, 0.08, 0.1]} />
        <meshBasicMaterial color={colors.body} />
      </mesh>
      {/* Back spot */}
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.18, 0.02, 0.1]} />
        <meshBasicMaterial color={colors.spot} />
      </mesh>
      {/* Smaller head spot */}
      <mesh position={[0.14, 0.05, 0]}>
        <boxGeometry args={[0.08, 0.02, 0.08]} />
        <meshBasicMaterial color={colors.spot} />
      </mesh>
      {/* Tail fin */}
      <mesh ref={tailRef} position={[-0.3, 0, 0]}>
        <boxGeometry args={[0.1, 0.14, 0.02]} />
        <meshBasicMaterial color={colors.fin} />
      </mesh>
      {/* Side fin */}
      <mesh position={[0.05, -0.05, 0.08]}>
        <boxGeometry args={[0.08, 0.04, 0.06]} />
        <meshBasicMaterial color={colors.fin} />
      </mesh>
      {/* Eye */}
      <mesh position={[0.25, 0.02, 0.065]}>
        <boxGeometry args={[0.02, 0.02, 0.02]} />
        <meshBasicMaterial color="#1a1414" />
      </mesh>
    </group>
  )
}

export function SwimmingKoi() {
  const kois = useMemo<KoiProps[]>(
    () => [
      {
        position: [-1.5, -0.8, 0],
        scale: 1.0,
        variant: 'orange',
        pathRadius: 1.2,
        pathOffsetZ: -1.0,
        speed: 0.4,
        phaseOffset: 0,
      },
      {
        position: [1.5, -1.2, 0],
        scale: 0.8,
        variant: 'white',
        pathRadius: 1.5,
        pathOffsetZ: -1.2,
        speed: 0.5,
        phaseOffset: 1.5,
      },
      {
        position: [0, -1.5, 0],
        scale: 1.2,
        variant: 'mixed',
        pathRadius: 2.0,
        pathOffsetZ: -0.8,
        speed: 0.3,
        phaseOffset: 3,
      },
      {
        position: [-1.0, -1.0, 0],
        scale: 0.7,
        variant: 'orange',
        pathRadius: 1.0,
        pathOffsetZ: -1.5,
        speed: 0.6,
        phaseOffset: 4.5,
      },
      {
        position: [2.0, -0.5, 0],
        scale: 0.9,
        variant: 'white',
        pathRadius: 1.3,
        pathOffsetZ: -1.0,
        speed: 0.45,
        phaseOffset: 2.2,
      },
      {
        position: [-2.0, -1.3, 0],
        scale: 1.1,
        variant: 'orange',
        pathRadius: 1.4,
        pathOffsetZ: -1.3,
        speed: 0.35,
        phaseOffset: 5.5,
      },
    ],
    [],
  )

  return (
    <>
      {kois.map((koi, i) => (
        <Koi key={i} {...koi} />
      ))}
    </>
  )
}
