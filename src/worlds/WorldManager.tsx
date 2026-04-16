import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useStore, type StopId } from '../store'
import { Museum } from './Museum/index'
import { ChristmasVillage } from './ChristmasVillage/index'
import { Terminus } from './Terminus/index'
import { Dreamery } from './Dreamery/index'
import { Gym } from './Gym/index'
import { Aquarium } from './Aquarium/index'

/**
 * Manages world mounting and camera transitions.
 * When activeRoom is set, camera flies to the world's position.
 * When cleared (back button), camera returns to seated tram view.
 */

const WORLD_CAMERAS: Record<StopId, { pos: [number, number, number]; look: [number, number, number] }> = {
  // Pulled forward from z=3.5/-3.5 to frame the centerpiece at its new z=-2.0
  museum:    { pos: [-100, 1.7, 2.5], look: [-100, 2.0, -2.5] },
  christmas: { pos: [100, 1.6, 3],     look: [100, 1.3, -1.5] },
  // Dreamery: doorway of the bedroom looking diagonally across
  fantasy:   { pos: [2.5, 63.6, 1.5], look: [-0.5, 63.0, -0.8] },
  // Aquarium: inside the tank, looking at the egg
  aquarium:  { pos: [0, -27, 4],      look: [0, -27.5, -2] },
  // Gym: eye-level at the mouth of the room looking slightly down at the
  // caged phone on the yoga mat (local (0, 1.6, 0.5) / (0, 0.4, -2) at
  // parent offset (100, 0, 100))
  gym:       { pos: [100, 1.55, 102.5], look: [100.3, 1.6, 97] },
  // 3/4 pedestrian view showing refuge island, shelter scalloped roof,
  // pole sign, and the info panel from the right side of the street.
  terminus:  { pos: [3.2, 1.9, 104.5], look: [0, 1.0, 100] },
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
      {activeRoom === 'fantasy' && <Dreamery />}
      {activeRoom === 'aquarium' && <Aquarium />}
      {activeRoom === 'gym' && <Gym />}
      {activeRoom === 'terminus' && <Terminus />}
    </>
  )
}
