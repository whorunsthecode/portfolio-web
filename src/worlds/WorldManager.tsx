import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { useStore, type StopId } from '../store'
import { Chungking } from './Chungking'
import { WalledCity } from './WalledCity'
import { navState } from './common/nav'

// Fly-in endpoints. For FPS worlds (Walled City) the endpoint must match
// the FirstPersonControls' `start` so the handoff doesn't snap.
const WORLD_CAMERAS: Record<StopId, { pos: [number, number, number]; look: [number, number, number]; fps: boolean }> = {
  chungking:   { pos: [-100, 1.65, 4.0], look: [-100, 1.55, -1.0], fps: true  },
  walled_city: { pos: [100, 1.65, 4.5],  look: [100, 1.65, -5],    fps: true  },
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
  const isFPSDestination = useRef(false)

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
        isFPSDestination.current = wc.fps
      } else {
        toPos.current.copy(SEATED_POS)
        toLook.current.copy(SEATED_LOOK)
        isFPSDestination.current = false
      }

      // Leaving a world disables FPS immediately so the flight animation
      // has full camera control.
      navState.ready = false

      prevRoom.current = activeRoom
    }

    if (!transitioning.current) return

    const elapsed = (performance.now() - transStart.current) / 1000
    const t = Math.min(elapsed / FLY_SPEED, 1)
    const s = t * t * (3 - 2 * t)

    camera.position.lerpVectors(fromPos.current, toPos.current, s)

    const currentLook = new Vector3().lerpVectors(fromLook.current, toLook.current, s)
    camera.lookAt(currentLook)

    if (t >= 1) {
      transitioning.current = false
      // Hand off control to FirstPersonControls if this world supports it.
      if (isFPSDestination.current && activeRoom) {
        navState.ready = true
      }
    }
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
