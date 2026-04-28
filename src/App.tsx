import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './Scene'
import { HUD } from './HUD'
import { useThree } from '@react-three/fiber'
import { CameraRig } from './scene/CameraRig'
import { TramExterior } from './scene/TramExterior'
import { FilmGrade } from './FilmGrade'
import { OrbitControls } from '@react-three/drei'
import { TOUCH } from 'three'
import { useStore } from './store'

// Mobile viewports get a wider FOV + farther max-dolly so the spatial layout
// of the cabin/street reads even when the screen is narrow.
const MOBILE_MQ = '(max-width: 768px)'
function isMobileViewport() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches
}

export default function App() {
  const [boardingDone, setBoardingDone] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [mobile, setMobile] = useState(() => isMobileViewport())

  const [prefersReduced] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const onChange = () => setMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (prefersReduced) setBoardingDone(true)
  }, [prefersReduced])

  useEffect(() => {
    if (boardingDone) return
    const start = performance.now()
    let raf: number
    const tick = () => {
      setElapsed((performance.now() - start) / 1000)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [boardingDone])

  return (
    <>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{
          position: boardingDone || prefersReduced ? [0, 1.7, -9.0] : [5.5, 0.8, -2.0],
          fov: boardingDone || prefersReduced ? (mobile ? 88 : 72) : (mobile ? 78 : 65),
          near: 0.1,
          far: 250,
        }}
        style={{ width: '100vw', height: '100vh' }}
      >
        {!boardingDone && !prefersReduced && (
          <CameraRig onComplete={() => setBoardingDone(true)} />
        )}

        <TramExterior visible={!boardingDone && elapsed < 3.5} />

        {boardingDone && <SeatedOrbit mobile={mobile} />}
        <Scene />
        <FilmGrade />
      </Canvas>

      {!boardingDone && (
        <button
          onClick={() => {
            ;(window as any).__skipBoarding?.()
            setBoardingDone(true)
          }}
          style={{
            position: 'fixed',
            top: 20,
            left: 16,
            zIndex: 200,
            background: 'rgba(0,0,0,0.4)',
            border: 'none',
            borderRadius: 8,
            padding: '8px 16px',
            color: '#f0e6d3',
            fontSize: 14,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
          }}
        >
          Skip ▸
        </button>
      )}

      <HUD />
    </>
  )
}

function SeatedOrbit({ mobile }: { mobile: boolean }) {
  const { camera } = useThree()
  const activeRoom = useStore((s) => s.activeRoom)
  const initialized = useRef(false)

  if (!initialized.current && !activeRoom) {
    camera.position.set(0, 1.7, -9.0)
    camera.lookAt(0, 1.6, -15)
    camera.fov = mobile ? 88 : 72
    camera.updateProjectionMatrix()
    initialized.current = true
  }

  // Inside a world, WorldCamera flies the camera; don't let OrbitControls
  // fight it. WorldOrbit inside each world takes over once parked.
  if (activeRoom) return null

  return (
    <OrbitControls
      target={[0, 1.65, -10.5]}
      minDistance={0.5}
      maxDistance={mobile ? 32 : 28}
      enablePan={false}
      enableZoom={true}
      zoomSpeed={1.0}
      enableRotate={true}
      maxPolarAngle={Math.PI * 0.75}
      minPolarAngle={Math.PI * 0.2}
      dampingFactor={0.12}
      enableDamping
      rotateSpeed={0.35}
      touches={{ ONE: TOUCH.ROTATE, TWO: TOUCH.DOLLY_ROTATE }}
    />
  )
}
