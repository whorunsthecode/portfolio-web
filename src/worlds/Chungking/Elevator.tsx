// src/worlds/Chungking/Elevator.tsx
import { useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// WORLD_X must match the parent group's x offset in index.tsx.
const WORLD_X  = -100
const ELEV_Z   = -8.8
const DOOR_W   = 0.48   // each panel
const DOOR_H   = 2.2
const OPEN_X   = 0.62   // how far each panel slides
const TRIGGER  = 1.8    // metres XZ distance to open
const CLOSE_DELAY = 3.0 // seconds before doors close

function makeButtonPanelTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = 64
  canvas.height = 256
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#2a2018'
  ctx.fillRect(0, 0, 64, 256)

  // Floors 1–17 + G
  const labels = ['G', ...Array.from({ length: 17 }, (_, i) => String(i + 1))]
  labels.forEach((label, i) => {
    const y = 240 - i * 13
    ctx.beginPath()
    ctx.arc(32, y, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#c8a060'
    ctx.fill()
    ctx.fillStyle = '#3a2810'
    ctx.font = '7px monospace'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText(label, 32, y)
  })

  return new THREE.CanvasTexture(canvas)
}

export function Elevator() {
  const { camera } = useThree()
  const leftRef  = useRef<THREE.Mesh>(null)
  const rightRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.RectAreaLight>(null)

  const openT      = useRef(0)
  const closeTimer = useRef(0)

  const panelTex = useMemo(() => makeButtonPanelTexture(), [])

  useFrame((_, delta) => {
    // XZ-plane distance only — avoids false readings when camera crouches
    const dx = camera.position.x - WORLD_X
    const dz = camera.position.z - ELEV_Z
    const dist = Math.sqrt(dx * dx + dz * dz)

    if (dist < TRIGGER) {
      closeTimer.current = CLOSE_DELAY
    } else {
      closeTimer.current -= delta
    }

    const shouldOpen = closeTimer.current > 0
    const speed = 1.2

    openT.current = THREE.MathUtils.clamp(
      openT.current + (shouldOpen ? delta * speed : -delta * speed),
      0,
      1
    )

    const t = openT.current
    if (leftRef.current)  leftRef.current.position.x  = -OPEN_X * t
    if (rightRef.current) rightRef.current.position.x =  OPEN_X * t
    if (lightRef.current) lightRef.current.intensity  = t > 0.5 ? 4.5 * t : 0
  })

  return (
    // Positioned in local group space (parent is at world x=−100)
    <group position={[0, 0, ELEV_Z]}>
      {/* Frame surround */}
      <mesh position={[0, DOOR_H / 2 + 0.1, 0]}>
        <boxGeometry args={[DOOR_W * 2 + 0.3, 0.2, 0.12]} />
        <meshStandardMaterial color="#5a5248" metalness={0.6} roughness={0.5} />
      </mesh>
      {[-0.54, 0.54].map((x, i) => (
        <mesh key={i} position={[x, DOOR_H / 2, 0]}>
          <boxGeometry args={[0.08, DOOR_H, 0.12]} />
          <meshStandardMaterial color="#5a5248" metalness={0.6} roughness={0.5} />
        </mesh>
      ))}

      {/* Left door panel */}
      <mesh ref={leftRef} position={[-DOOR_W / 2, DOOR_H / 2, 0.02]}>
        <boxGeometry args={[DOOR_W, DOOR_H, 0.04]} />
        <meshStandardMaterial color="#b4bec8" metalness={0.88} roughness={0.12} />
      </mesh>

      {/* Right door panel */}
      <mesh ref={rightRef} position={[DOOR_W / 2, DOOR_H / 2, 0.02]}>
        <boxGeometry args={[DOOR_W, DOOR_H, 0.04]} />
        <meshStandardMaterial color="#b4bec8" metalness={0.88} roughness={0.12} />
      </mesh>

      {/* Elevator shaft interior (visible when door open) */}
      <mesh position={[0, DOOR_H / 2, -0.5]}>
        <boxGeometry args={[DOOR_W * 2 + 0.05, DOOR_H, 1.0]} />
        <meshStandardMaterial color="#1e1e1e" roughness={0.95} side={THREE.BackSide} />
      </mesh>

      {/* Shaft light — only bright when door open */}
      <rectAreaLight
        ref={lightRef}
        position={[0, DOOR_H - 0.1, -0.3]}
        width={0.8}
        height={0.2}
        intensity={0}
        color="#f0f8ff"
        rotation={[-Math.PI / 2, 0, 0]}
      />

      {/* Button panel — right side of frame */}
      <mesh position={[0.65, 1.1, 0.1]} rotation={[0, -0.2, 0]}>
        <boxGeometry args={[0.08, 0.24, 0.04]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
      </mesh>
      <mesh position={[0.66, 1.1, 0.125]} rotation={[0, -0.2, 0]}>
        <planeGeometry args={[0.06, 0.22]} />
        <meshStandardMaterial map={panelTex} roughness={0.8} />
      </mesh>
    </group>
  )
}
