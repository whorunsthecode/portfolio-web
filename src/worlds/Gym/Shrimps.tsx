import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { ThreeEvent } from '@react-three/fiber'
import * as THREE from 'three'
import { Text } from '@react-three/drei'
import { useStore } from '../../store'

/* Palette — matches the reference sketches
   (bold red-orange "C" body with big googly eyes). */
const SHRIMP_RED = '#e84828'
const SHRIMP_OUTLINE = '#6a1810'
const EYE_WHITE = '#faf4ec'
const EYE_BLACK = '#151210'

interface ShrimpProps {
  position: [number, number, number]
  scale: number
  lookAt: [number, number, number]
  phaseOffset: number
  isHero?: boolean
  onHeroClick?: () => void
}

/**
 * A single shrimp, built as a flat "C"-shape torus body in the shrimp's
 * local XY plane with eyes, mouth, stick arms, and a tail blob. The whole
 * group yaws around Y to face the given lookAt point so the face points
 * toward the camera.
 */
function Shrimp({
  position,
  scale,
  lookAt,
  phaseOffset,
  isHero = false,
  onHeroClick,
}: ShrimpProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bodyRef = useRef<THREE.Group>(null)
  const eyeLRef = useRef<THREE.Group>(null)
  const eyeRRef = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime + phaseOffset

    // Subtle idle sway + hover
    groupRef.current.position.y = position[1] + 0.02 + Math.sin(t * 0.5) * 0.015
    if (bodyRef.current) {
      bodyRef.current.rotation.z = Math.sin(t * 0.7) * 0.05
    }

    // Slow blink every ~5s, lasting ~0.15s
    const blinkWindow = (t + phaseOffset * 2.3) % 5
    const isBlinking = blinkWindow > 0 && blinkWindow < 0.15
    const eyeY = isBlinking ? 0.1 : 1
    if (eyeLRef.current) eyeLRef.current.scale.y = eyeY
    if (eyeRRef.current) eyeRRef.current.scale.y = eyeY
  })

  // Yaw so the shrimp's local +Z (where the face is) points at lookAt
  const dx = lookAt[0] - position[0]
  const dz = lookAt[2] - position[2]
  const yRot = Math.atan2(dx, dz)

  // Body dimensions
  const R = 0.14 // torus radius (main curve of the C)
  const TUBE = 0.07 // torus tube (body thickness)

  // Hero shrimp is physically larger via the scale prop; also gives
  // it a slightly different mouth + clipboard.
  const handleClick = isHero
    ? (e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation()
        onHeroClick?.()
      }
    : undefined

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, yRot, 0]}
      scale={scale}
      onClick={handleClick}
      onPointerOver={
        isHero
          ? (e) => {
              e.stopPropagation()
              document.body.style.cursor = 'pointer'
            }
          : undefined
      }
      onPointerOut={
        isHero
          ? () => {
              document.body.style.cursor = 'auto'
            }
          : undefined
      }
    >
      {/* Body wrapper — subtle idle sway is applied here */}
      <group ref={bodyRef} position={[0, 0.22, 0]}>
        {/* C-shaped body: 1.5π torus arc sitting in XY plane, opening to
            the right. thetaStart=π/4 so the upper-right end sits where
            the "head" naturally goes. */}
        <mesh>
          <torusGeometry args={[R, TUBE, 14, 24, Math.PI * 1.5]} />
          <meshStandardMaterial color={SHRIMP_RED} roughness={0.6} />
        </mesh>
        {/* Thin darker outline ring, slightly offset in +z for a 2D-ish rim */}
        <mesh position={[0, 0, TUBE + 0.001]}>
          <torusGeometry args={[R, TUBE * 0.12, 6, 24, Math.PI * 1.5]} />
          <meshBasicMaterial color={SHRIMP_OUTLINE} />
        </mesh>

        {/* Tail blob — small sphere at the lower-right tip of the C.
            The torus arc ends at angle ~(π/4 + 1.5π) = 7π/4, so the tip
            sits near (cos(-π/4)·R, sin(-π/4)·R) ≈ (0.099, -0.099). */}
        <mesh position={[R * 0.78, -R * 0.78, 0]}>
          <sphereGeometry args={[TUBE * 1.2, 12, 12]} />
          <meshStandardMaterial color={SHRIMP_RED} roughness={0.6} />
        </mesh>

        {/* A second tiny tail bump for the "claw curl" look */}
        <mesh position={[R * 1.0, -R * 0.55, 0]}>
          <sphereGeometry args={[TUBE * 0.75, 10, 10]} />
          <meshStandardMaterial color={SHRIMP_RED} roughness={0.6} />
        </mesh>

        {/* Head of the C — where the eyes go. Upper-right end of the arc
            sits near (cos(π/4)·R, sin(π/4)·R) ≈ (0.099, 0.099). */}
        <group position={[R * 0.55, R * 0.85, TUBE * 0.5]}>
          {/* Left eye */}
          <group ref={eyeLRef} position={[-0.045, 0, 0.02]}>
            <mesh>
              <sphereGeometry args={[0.042, 12, 12]} />
              <meshStandardMaterial color={EYE_WHITE} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0, 0.035]}>
              <sphereGeometry args={[0.022, 10, 10]} />
              <meshStandardMaterial color={EYE_BLACK} />
            </mesh>
          </group>
          {/* Right eye */}
          <group ref={eyeRRef} position={[0.045, 0, 0.02]}>
            <mesh>
              <sphereGeometry args={[0.042, 12, 12]} />
              <meshStandardMaterial color={EYE_WHITE} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0, 0.035]}>
              <sphereGeometry args={[0.022, 10, 10]} />
              <meshStandardMaterial color={EYE_BLACK} />
            </mesh>
          </group>

          {/* Tiny mouth — a small dark arc below the eyes. The hero
              shrimp gets a small smile; regular shrimps a neutral line. */}
          {isHero ? (
            <mesh position={[0.01, -0.05, 0.05]} rotation={[0, 0, Math.PI]}>
              <torusGeometry args={[0.02, 0.005, 6, 10, Math.PI]} />
              <meshBasicMaterial color={EYE_BLACK} />
            </mesh>
          ) : (
            <mesh position={[0.01, -0.05, 0.05]}>
              <planeGeometry args={[0.04, 0.008]} />
              <meshBasicMaterial color={EYE_BLACK} />
            </mesh>
          )}
        </group>

        {/* Two thin stick arms dangling from the inside of the C curve */}
        <mesh position={[R * 0.35, 0.02, TUBE * 0.4]} rotation={[0, 0, -0.15]}>
          <cylinderGeometry args={[0.008, 0.008, 0.14, 4]} />
          <meshStandardMaterial color={SHRIMP_RED} roughness={0.6} />
        </mesh>
        <mesh position={[R * 0.5, -0.03, TUBE * 0.4]} rotation={[0, 0, 0.25]}>
          <cylinderGeometry args={[0.008, 0.008, 0.14, 4]} />
          <meshStandardMaterial color={SHRIMP_RED} roughness={0.6} />
        </mesh>
        {/* Tiny hands — little spheres at the tips of the arms */}
        <mesh position={[R * 0.35 - 0.02, -0.05, TUBE * 0.4]}>
          <sphereGeometry args={[0.016, 8, 8]} />
          <meshStandardMaterial color={SHRIMP_RED} roughness={0.6} />
        </mesh>
        <mesh position={[R * 0.5 + 0.035, -0.1, TUBE * 0.4]}>
          <sphereGeometry args={[0.016, 8, 8]} />
          <meshStandardMaterial color={SHRIMP_RED} roughness={0.6} />
        </mesh>
      </group>

      {/* Hero extras: clipboard hovering near the front hand + label */}
      {isHero && (
        <>
          <group position={[R * 0.8, 0.13, TUBE + 0.05]} rotation={[0, 0, -0.15]}>
            {/* Clipboard backing */}
            <mesh>
              <boxGeometry args={[0.13, 0.16, 0.012]} />
              <meshStandardMaterial color="#8a6a42" roughness={0.8} />
            </mesh>
            {/* Paper on clipboard */}
            <mesh position={[0, 0, 0.008]}>
              <planeGeometry args={[0.11, 0.14]} />
              <meshStandardMaterial color="#f4ebd4" />
            </mesh>
            {/* Checklist lines */}
            {[0.045, 0.015, -0.015, -0.045].map((y, i) => (
              <mesh key={i} position={[0, y, 0.01]}>
                <planeGeometry args={[0.075, 0.004]} />
                <meshBasicMaterial color="#8a6a4a" />
              </mesh>
            ))}
          </group>

          {/* Floating COACH label above */}
          <Text
            position={[0, 0.58, 0]}
            fontSize={0.07}
            color="#1a1a18"
            anchorX="center"
            anchorY="middle"
            outlineWidth={0.005}
            outlineColor="#ffffff"
            letterSpacing={0.15}
          >
            COACH
          </Text>
        </>
      )}
    </group>
  )
}

export function Shrimps() {
  const setModal = useStore((s) => s.setModal)

  // All shrimps stare at the camera arrival point, not the phone —
  // the joke is that they're watching YOU, not the phone itself.
  const USER_POS: [number, number, number] = [0, 1.6, 0.5]

  const shrimps: ShrimpProps[] = [
    // Hero coach — bigger, off to the right, tappable
    {
      position: [1.3, 0, -2.2],
      scale: 1.6,
      lookAt: USER_POS,
      phaseOffset: 0,
      isHero: true,
      onHeroClick: () => setModal('gym'),
    },
    // Regular shrimps around the mat in a rough arc
    { position: [-1.4, 0, -1.8], scale: 1, lookAt: USER_POS, phaseOffset: 1.2 },
    { position: [-0.7, 0, -1.2], scale: 1, lookAt: USER_POS, phaseOffset: 2.4 },
    { position: [0.85, 0, -1.1], scale: 1, lookAt: USER_POS, phaseOffset: 3.6 },
    { position: [-1.6, 0, -2.6], scale: 1, lookAt: USER_POS, phaseOffset: 4.8 },
    { position: [0.3, 0, -2.8], scale: 1, lookAt: USER_POS, phaseOffset: 6.0 },
  ]

  return (
    <>
      {shrimps.map((props, i) => (
        <Shrimp key={i} {...props} />
      ))}
    </>
  )
}
