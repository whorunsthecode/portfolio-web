import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

/**
 * Boarding camera animation — 3 phases:
 * 1. Sidewalk pause (0-1.5s): standing on the street looking at the tram
 * 2. Approach (1.5-3.5s): walking toward the tram entrance
 * 3. Board (3.5-5s): stepping up into the seat
 */

// Phase 1: Sidewalk — looking at the tram from the side
const SIDEWALK_POS = new Vector3(5.5, 0.8, -2.0)
const SIDEWALK_LOOK = new Vector3(0, 1.5, -5)

// Phase 2: Approach — walking to the tram entrance
const APPROACH_POS = new Vector3(2.5, 0.9, -3.5)
const APPROACH_LOOK = new Vector3(0, 1.5, -7)

// Phase 3: Board — stepping into the driver position
const SEATED_POS = new Vector3(0, 1.7, -9.0)
const SEATED_LOOK = new Vector3(0, 1.6, -15)

const PHASE1_END = 1.5
const PHASE2_END = 3.5
const PHASE3_END = 5.0

function smoothstep(t: number) {
  return t * t * (3 - 2 * t)
}

export function CameraRig({ onComplete }: { onComplete: () => void }) {
  const { camera } = useThree()
  const startTime = useRef<number | null>(null)
  const done = useRef(false)

  // Expose skip function on window
  if (typeof window !== 'undefined') {
    (window as any).__skipBoarding = () => {
      done.current = true
      camera.position.copy(SEATED_POS)
      camera.lookAt(SEATED_LOOK)
      onComplete()
    }
  }

  useFrame(() => {
    if (done.current) return

    if (startTime.current === null) {
      startTime.current = performance.now()
      camera.position.copy(SIDEWALK_POS)
      camera.lookAt(SIDEWALK_LOOK)
    }

    const elapsed = (performance.now() - startTime.current) / 1000

    if (elapsed < PHASE1_END) {
      // Phase 1: Sidewalk pause — slight drift to feel alive
      const t = elapsed / PHASE1_END
      camera.position.set(
        SIDEWALK_POS.x - t * 0.3,
        SIDEWALK_POS.y,
        SIDEWALK_POS.z,
      )
      camera.lookAt(SIDEWALK_LOOK)
    } else if (elapsed < PHASE2_END) {
      // Phase 2: Approach the tram
      const t = smoothstep((elapsed - PHASE1_END) / (PHASE2_END - PHASE1_END))
      const pos = new Vector3().lerpVectors(SIDEWALK_POS, APPROACH_POS, t)
      const look = new Vector3().lerpVectors(SIDEWALK_LOOK, APPROACH_LOOK, t)
      camera.position.copy(pos)
      camera.lookAt(look)
    } else if (elapsed < PHASE3_END) {
      // Phase 3: Board — step up into the seat
      const t = smoothstep((elapsed - PHASE2_END) / (PHASE3_END - PHASE2_END))
      const pos = new Vector3().lerpVectors(APPROACH_POS, SEATED_POS, t)
      const look = new Vector3().lerpVectors(APPROACH_LOOK, SEATED_LOOK, t)
      camera.position.copy(pos)
      camera.lookAt(look)
    } else {
      // Done
      camera.position.copy(SEATED_POS)
      camera.lookAt(SEATED_LOOK)
      done.current = true
      onComplete()
    }
  })

  return null
}
