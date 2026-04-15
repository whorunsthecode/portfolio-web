import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useStore, type StopId } from '../store'
import { Museum } from './Museum/index'
import { ChristmasVillage } from './ChristmasVillage/index'
import { Terminus } from './Terminus/index'

/**
 * Manages world mounting and camera transitions.
 * When activeRoom is set, camera flies to the world's position.
 * When cleared (back button), camera returns to seated tram view.
 */

const WORLD_CAMERAS: Record<StopId, { pos: [number, number, number]; look: [number, number, number] }> = {
  museum:    { pos: [-100, 1.7, 3.5], look: [-100, 2.0, -3.5] },
  christmas: { pos: [100, 2.5, 5],    look: [99, 1.8, -3] },
  fantasy:   { pos: [0, 62, 4],       look: [0, 62, -4] },
  aquarium:  { pos: [0, -28, 4],      look: [0, -28, -4] },
  gym:       { pos: [100, 2.0, 104],  look: [100, 2.0, 96] },
  // Arrival sits on the safety island, looking directly at the info panel
  // on the shelter back wall (local z = -2.22, world z = 100 + -2.22).
  terminus:  { pos: [0, 1.5, 100.5],  look: [0, 1.1, 97.78] },
}

const SEATED_POS = new Vector3(0, 1.5, -7.6)
const SEATED_LOOK = new Vector3(0, 1.8, -11)

const FLY_SPEED = 2.5 // transition duration in seconds

export function WorldCamera() {
  const { camera } = useThree()
  const activeRoom = useStore((s) => s.activeRoom)

  const transitioning = useRef(false)
  const transStart = useRef(0)
  const fromPos = useRef(new Vector3())
  const fromLook = useRef(new Vector3())
  const toPos = useRef(new Vector3())
  const toLook = useRef(new Vector3())
  const prevRoom = useRef<StopId | null>(null)

  useFrame(() => {
    // Detect room change
    if (activeRoom !== prevRoom.current) {
      transitioning.current = true
      transStart.current = performance.now()
      fromPos.current.copy(camera.position)

      // Compute current lookAt from camera direction
      const dir = new Vector3()
      camera.getWorldDirection(dir)
      fromLook.current.copy(camera.position).add(dir.multiplyScalar(10))

      if (activeRoom) {
        const wc = WORLD_CAMERAS[activeRoom]
        toPos.current.set(...wc.pos)
        toLook.current.set(...wc.look)
      } else {
        toPos.current.copy(SEATED_POS)
        toLook.current.copy(SEATED_LOOK)
      }

      prevRoom.current = activeRoom
    }

    if (!transitioning.current) return

    const elapsed = (performance.now() - transStart.current) / 1000
    const t = Math.min(elapsed / FLY_SPEED, 1)
    const s = t * t * (3 - 2 * t) // smoothstep

    camera.position.lerpVectors(fromPos.current, toPos.current, s)

    const currentLook = new Vector3().lerpVectors(fromLook.current, toLook.current, s)
    camera.lookAt(currentLook)

    if (t >= 1) {
      transitioning.current = false
    }
  })

  return null
}

export function Worlds() {
  const activeRoom = useStore((s) => s.activeRoom)

  return (
    <>
      <WorldCamera />
      {/* Lazy-mount: only render the world that's active */}
      {activeRoom === 'museum' && <Museum />}
      {activeRoom === 'christmas' && <ChristmasVillage />}
      {activeRoom === 'terminus' && <Terminus />}
    </>
  )
}
