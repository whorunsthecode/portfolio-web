import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Vector3 } from 'three'

/**
 * 4-beat boarding sequence:
 * - 0.0s – 1.5s: exterior wide shot (identity moment)
 * - 1.5s – 2.0s: fade to black (hides the cut)
 * - 2.0s – 3.5s: aisle reveal — fade in at top of stairs, see seats + cabin
 * - 3.5s – 4.5s: glide forward to seated position
 *
 * Total: 4.5s. Recruiter sees tram exterior, then the cabin interior with seats.
 */

const T_EXTERIOR_END = 1.5
const T_FADE_START = 1.5
const T_AISLE_START = 2.0
const T_AISLE_FADE_IN_END = 2.5
const T_GLIDE_START = 3.5
const T_DONE = 4.5

const EXTERIOR_POS: [number, number, number] = [5.5, 0.8, -2.0]
const EXTERIOR_LOOK: [number, number, number] = [0, 0.5, -3.0]
const EXTERIOR_FOV = 65

const AISLE_POS: [number, number, number] = [0, 1.9, 0.5]
const AISLE_LOOK: [number, number, number] = [0, 1.7, -8.0]
const AISLE_FOV = 74

const SEATED_POS: [number, number, number] = [0, 1.5, -7.6]
const SEATED_LOOK: [number, number, number] = [0, 1.8, -11.0]
const SEATED_FOV = 74

interface Props {
  onComplete: () => void
}

export function CameraRig({ onComplete }: Props) {
  const { camera } = useThree()
  const startTime = useRef(-1)
  const done = useRef(false)
  const completedRef = useRef(false)
  const [fadeOpacity, setFadeOpacity] = useState(0)
  const [hudText, setHudText] = useState('WAN CHAI · 灣仔')

  useFrame(() => {
    if (done.current) return

    if (startTime.current < 0) {
      startTime.current = performance.now()
      camera.position.set(...EXTERIOR_POS)
      camera.lookAt(new Vector3(...EXTERIOR_LOOK))
      camera.fov = EXTERIOR_FOV
      camera.updateProjectionMatrix()
    }

    const elapsed = (performance.now() - startTime.current) / 1000

    // Beat 1: exterior hold (0.0s – 1.5s)
    if (elapsed < T_EXTERIOR_END) {
      camera.position.set(...EXTERIOR_POS)
      camera.lookAt(new Vector3(...EXTERIOR_LOOK))
      camera.fov = EXTERIOR_FOV
      camera.updateProjectionMatrix()
      if (fadeOpacity !== 0) setFadeOpacity(0)
      return
    }

    // Beat 2: fade to black (1.5s – 2.0s)
    if (elapsed < T_AISLE_START) {
      const t = (elapsed - T_FADE_START) / (T_AISLE_START - T_FADE_START)
      setFadeOpacity(t)
      if (t < 0.8) {
        camera.position.set(...EXTERIOR_POS)
        camera.lookAt(new Vector3(...EXTERIOR_LOOK))
      } else {
        // Snap to aisle while fully black
        camera.position.set(...AISLE_POS)
        camera.lookAt(new Vector3(...AISLE_LOOK))
        camera.fov = AISLE_FOV
        camera.updateProjectionMatrix()
        setHudText('FINDING A SEAT')
      }
      return
    }

    // Beat 3: aisle reveal — fade in + hold (2.0s – 3.5s)
    if (elapsed < T_GLIDE_START) {
      camera.position.set(...AISLE_POS)
      camera.lookAt(new Vector3(...AISLE_LOOK))
      camera.fov = AISLE_FOV
      camera.updateProjectionMatrix()
      // Fade in over first 0.5s of this beat
      if (elapsed < T_AISLE_FADE_IN_END) {
        const t = (elapsed - T_AISLE_START) / (T_AISLE_FADE_IN_END - T_AISLE_START)
        setFadeOpacity(1 - t)
      } else {
        if (fadeOpacity !== 0) setFadeOpacity(0)
      }
      return
    }

    // Beat 4: glide from aisle to seated (3.5s – 4.5s)
    if (elapsed < T_DONE) {
      const t = (elapsed - T_GLIDE_START) / (T_DONE - T_GLIDE_START)
      const s = t * t * (3 - 2 * t) // smoothstep
      // Interpolate position
      camera.position.set(
        AISLE_POS[0] + (SEATED_POS[0] - AISLE_POS[0]) * s,
        AISLE_POS[1] + (SEATED_POS[1] - AISLE_POS[1]) * s,
        AISLE_POS[2] + (SEATED_POS[2] - AISLE_POS[2]) * s,
      )
      // Interpolate lookAt
      camera.lookAt(new Vector3(
        AISLE_LOOK[0] + (SEATED_LOOK[0] - AISLE_LOOK[0]) * s,
        AISLE_LOOK[1] + (SEATED_LOOK[1] - AISLE_LOOK[1]) * s,
        AISLE_LOOK[2] + (SEATED_LOOK[2] - AISLE_LOOK[2]) * s,
      ))
      camera.fov = SEATED_FOV
      camera.updateProjectionMatrix()
      if (hudText !== '') setHudText('')
      return
    }

    // Done
    camera.position.set(...SEATED_POS)
    camera.lookAt(new Vector3(...SEATED_LOOK))
    camera.fov = SEATED_FOV
    camera.updateProjectionMatrix()
    setFadeOpacity(0)
    done.current = true
    if (!completedRef.current) {
      completedRef.current = true
      onComplete()
    }
  })

  // Expose skip on window for HUD button
  useEffect(() => {
    const skip = () => {
      done.current = true
      setFadeOpacity(0)
      setHudText('')
      camera.position.set(...SEATED_POS)
      camera.lookAt(new Vector3(...SEATED_LOOK))
      camera.fov = SEATED_FOV
      camera.updateProjectionMatrix()
      if (!completedRef.current) {
        completedRef.current = true
        onComplete()
      }
    }
    ;(window as any).__skipBoarding = skip
    return () => { delete (window as any).__skipBoarding }
  }, [camera, onComplete])

  // Respect prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (mq.matches) {
      ;(window as any).__skipBoarding?.()
    }
  }, [])

  return (
    <>
      <FadeOverlay opacity={fadeOpacity} />
      <HudText text={hudText} />
    </>
  )
}

function FadeOverlay({ opacity }: { opacity: number }) {
  if (opacity === 0) return null
  return (
    <Html fullscreen>
      <div style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        opacity,
        pointerEvents: 'none',
        zIndex: 100,
      }} />
    </Html>
  )
}

function HudText({ text }: { text: string }) {
  if (!text) return null
  return (
    <Html fullscreen>
      <div style={{
        position: 'fixed',
        bottom: '15%',
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#f0e6d0',
        fontFamily: 'Georgia, serif',
        fontSize: 18,
        letterSpacing: 2,
        textShadow: '0 2px 8px rgba(0,0,0,0.8)',
        pointerEvents: 'none',
        zIndex: 101,
      }}>
        {text}
      </div>
    </Html>
  )
}
