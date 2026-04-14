import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'
import { makeTextTexture } from './TextTexture'

const BRASS = '#b8943e'
const LEATHER = '#5a3520'
const WOOD = '#5c3a1e'
const CREAM = '#f5edd8'

interface StripProps {
  label: string
  room: 'museum' | 'christmas' | 'terminus'
  accent: string
  yOffset: number
}

function FabricStrip({ label, room, accent, yOffset }: StripProps) {
  const setRoom = useStore((s) => s.setRoom)
  const meshRef = useRef<THREE.Group>(null)

  const tex = useMemo(() => makeTextTexture({
    text: label,
    fontSize: 32,
    color: '#1a1a1a',
    width: 256,
    height: 48,
  }), [label])

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const t = clock.getElapsedTime()
    const offset = yOffset * 10
    meshRef.current.rotation.y = Math.sin(t * 1.2 + offset) * 0.02
  })

  return (
    <group ref={meshRef} position={[0, yOffset, 0]}>
      {/* Accent border top */}
      <mesh position={[0, 0.05, 0.001]}>
        <planeGeometry args={[0.65, 0.015]} />
        <meshStandardMaterial color={accent} />
      </mesh>

      {/* Cream fabric body — clickable */}
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          console.log(`[ding-ding] Tapped: ${room}`)
          setRoom(room)
        }}
        onPointerOver={(e) => {
          document.body.style.cursor = 'pointer'
          e.stopPropagation()
        }}
        onPointerOut={() => { document.body.style.cursor = 'default' }}
      >
        <planeGeometry args={[0.65, 0.11]} />
        <meshStandardMaterial color={CREAM} roughness={0.85} />
      </mesh>

      {/* Text */}
      <mesh position={[0, 0, 0.005]}>
        <planeGeometry args={[0.6, 0.08]} />
        <meshStandardMaterial map={tex} transparent roughness={0.85} />
      </mesh>

      {/* Accent border bottom */}
      <mesh position={[0, -0.05, 0.001]}>
        <planeGeometry args={[0.65, 0.015]} />
        <meshStandardMaterial color={accent} />
      </mesh>
    </group>
  )
}

export function DestinationSign() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.getElapsedTime()
    groupRef.current.rotation.z = Math.sin(t * 0.8) * 0.01
  })

  // Upper-right of windshield — visible but not blocking the street view
  return (
    <group ref={groupRef} position={[0.55, 2.05, -9.2]}>
      {/* Wooden rod */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 0.75, 10]} />
        <meshStandardMaterial color={WOOD} roughness={0.8} />
      </mesh>

      {/* Brass end caps */}
      {[-0.39, 0.39].map((x) => (
        <mesh key={x} position={[x, 0, 0]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.25} />
        </mesh>
      ))}

      {/* Leather straps to ceiling */}
      {[-0.25, 0.25].map((x) => (
        <mesh key={x} position={[x, 0.08, 0]}>
          <boxGeometry args={[0.02, 0.15, 0.005]} />
          <meshStandardMaterial color={LEATHER} roughness={0.9} />
        </mesh>
      ))}

      {/* Compact fabric strips */}
      <FabricStrip label="Museum of Art" room="museum" accent="#2a8a7a" yOffset={-0.08} />
      <FabricStrip label="Christmas Market" room="christmas" accent="#c0392b" yOffset={-0.21} />
      <FabricStrip label="Terminus" room="terminus" accent="#d4a017" yOffset={-0.34} />
    </group>
  )
}
