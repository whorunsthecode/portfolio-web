import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './Scene'
import { HUD } from './HUD'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3 } from 'three'
import { CameraRig } from './scene/CameraRig'
import { TramExterior } from './scene/TramExterior'
import { ProjectModal } from './ui/ProjectModal'
import { useStore } from './store'

export default function App() {
  const [boardingDone, setBoardingDone] = useState(false)
  const [elapsed, setElapsed] = useState(0)

  // Reduced motion — auto-skip
  const [prefersReduced] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  useEffect(() => {
    if (prefersReduced) setBoardingDone(true)
  }, [prefersReduced])

  // Track elapsed for TramExterior visibility
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
          position: boardingDone || prefersReduced ? [0, 1.5, -7.6] : [5.5, 0.8, -2.0],
          fov: boardingDone || prefersReduced ? 74 : 65,
          near: 0.1,
          far: 250,
        }}
        style={{ width: '100vw', height: '100vh' }}
      >
        {!boardingDone && !prefersReduced && (
          <CameraRig onComplete={() => setBoardingDone(true)} />
        )}

        {/* Tram exterior — visible during sidewalk beat */}
        <TramExterior visible={!boardingDone && elapsed < 2.0} />

        {boardingDone && <SeatedCameraWrapper />}
        <Scene />
      </Canvas>

      {/* Skip button during boarding */}
      {!boardingDone && (
        <button
          onClick={() => {
            ;(window as any).__skipBoarding?.()
            setBoardingDone(true)
          }}
          style={{
            position: 'fixed',
            top: 20,
            right: 20,
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
      <ProjectModal />
    </>
  )
}

/* ── Lock camera at seated position — disabled when in a world ── */
function SeatedCameraWrapper() {
  const activeRoom = useStore((s) => s.activeRoom)
  if (activeRoom) return null // WorldCamera handles it
  return <SeatedCamera />
}

function SeatedCamera() {
  const { camera } = useThree()
  const target = new Vector3(0, 1.8, -11)
  const initialized = useRef(false)
  useFrame(() => {
    camera.position.set(0, 1.5, -7.6)
    camera.lookAt(target)
    if (!initialized.current) {
      camera.fov = 74
      camera.updateProjectionMatrix()
      initialized.current = true
    }
  })
  return null
}
