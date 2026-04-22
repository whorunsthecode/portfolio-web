import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useStore, type StopId } from '../store'
import { Chungking } from './Chungking'
import { WalledCity } from './WalledCity'

// World group offsets — keeps each world far from the tram so the frustum
// never overlaps the street. Camera flies here when GO is pressed.
const WORLD_CAMERAS: Record<StopId, { pos: [number, number, number]; look: [number, number, number] }> = {
  // Chungking: mid-arcade, looking down the corridor toward the cage lift.
  chungking:   { pos: [-100, 1.65, 3.5], look: [-100, 1.55, -4.5] },
  // Walled City: alley mouth, looking toward the sliver of sky above.
  walled_city: { pos: [100, 1.65, 3.5],  look: [100, 2.8, -4.5] },
}

const SEATED_POS = new Vector3(0, 1.7, -9.0)
const SEATED_LOOK = new Vector3(0, 1.6, -15)

const FLY_SPEED = 2.2

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
    if (activeRoom !== prevRoom.current) {
      transitioning.current = true
      transStart.current = performance.now()
      fromPos.current.copy(camera.position)

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
    const s = t * t * (3 - 2 * t)

    camera.position.lerpVectors(fromPos.current, toPos.current, s)

    const currentLook = new Vector3().lerpVectors(fromLook.current, toLook.current, s)
    camera.lookAt(currentLook)

    if (t >= 1) transitioning.current = false
  })

  return null
}

export function Worlds() {
  const activeRoom = useStore((s) => s.activeRoom)
  return (
    <>
      <WorldCamera />
      {activeRoom === 'chungking' && <Chungking />}
      {activeRoom === 'walled_city' && <WalledCity />}
    </>
  )
}
