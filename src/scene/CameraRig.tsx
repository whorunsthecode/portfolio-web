import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'

/**
 * Boarding camera animation — flies from sidewalk view into the tram seat.
 * Calls onComplete when the animation finishes.
 */

const START_POS = new Vector3(5.5, 0.8, -2.0)
const END_POS = new Vector3(0, 1.5, -7.6)
const END_LOOK = new Vector3(0, 1.8, -11)
const DURATION = 3.0 // seconds

export function CameraRig({ onComplete }: { onComplete: () => void }) {
  const { camera } = useThree()
  const startTime = useRef<number | null>(null)
  const done = useRef(false)

  useFrame(() => {
    if (done.current) return

    if (startTime.current === null) {
      startTime.current = performance.now()
      camera.position.copy(START_POS)
    }

    const elapsed = (performance.now() - startTime.current) / 1000
    const t = Math.min(elapsed / DURATION, 1)
    const s = t * t * (3 - 2 * t) // smoothstep

    camera.position.lerpVectors(START_POS, END_POS, s)
    camera.lookAt(END_LOOK)

    if (t >= 1) {
      done.current = true
      onComplete()
    }
  })

  return null
}
