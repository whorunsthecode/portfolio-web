import { OrbitControls } from '@react-three/drei'
import { TOUCH } from 'three'
import { useStore } from '../../store'

interface WorldOrbitProps {
  /** Where the camera looks — must be in WORLD coordinates */
  target: [number, number, number]
  minDistance?: number
  maxDistance?: number
  /** Allow vertical rotation? false = horizontal-only */
  enablePolar?: boolean
}

export function WorldOrbit({
  target,
  minDistance = 2,
  maxDistance = 12,
  enablePolar = true,
}: WorldOrbitProps) {
  const activeRoom = useStore((s) => s.activeRoom)

  // Only enable orbit when inside a world (not tram / transitioning out)
  if (!activeRoom) return null

  return (
    <OrbitControls
      target={target}
      minDistance={minDistance}
      maxDistance={maxDistance}
      enablePan={false}
      enableZoom={true}
      enableRotate={true}
      maxPolarAngle={enablePolar ? Math.PI * 0.85 : Math.PI / 2}
      minPolarAngle={enablePolar ? Math.PI * 0.15 : Math.PI / 2}
      dampingFactor={0.08}
      enableDamping
      rotateSpeed={0.5}
      zoomSpeed={0.7}
      /* Mobile: one-finger rotate, two-finger pinch zoom */
      touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_ROTATE }}
    />
  )
}
