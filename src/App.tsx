import { useState, useEffect, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { Scene } from './Scene'
import { HUD } from './HUD'
import { useThree } from '@react-three/fiber'
import { CameraRig } from './scene/CameraRig'
import { TramExterior } from './scene/TramExterior'
import { ProjectModal } from './ui/ProjectModal'
import { FilmGrade } from './FilmGrade'
import { OrbitControls } from '@react-three/drei'
import { TOUCH } from 'three'
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
          position: boardingDone || prefersReduced ? [0, 1.7, -9.0] : [5.5, 0.8, -2.0],
          fov: boardingDone || prefersReduced ? 72 : 65,
          near: 0.1,
          far: 250,
        }}
        style={{ width: '100vw', height: '100vh' }}
      >
        {!boardingDone && !prefersReduced && (
          <CameraRig onComplete={() => setBoardingDone(true)} />
        )}

        {/* Tram exterior — visible during sidewalk beat */}
        <TramExterior visible={!boardingDone && elapsed < 3.5} />

        {boardingDone && <SeatedOrbit />}
        <Scene />
        <FilmGrade />
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
      <Toast />
    </>
  )
}

/* ── Global toast — triggered via window.__showToast(msg) ── */
function Toast() {
  const [msg, setMsg] = useState<string | null>(null)

  useEffect(() => {
    const w = window as unknown as { __showToast?: (msg: string) => void }
    let timer: number | undefined
    w.__showToast = (m: string) => {
      setMsg(m)
      if (timer) window.clearTimeout(timer)
      timer = window.setTimeout(() => setMsg(null), 2500)
    }
    return () => {
      delete w.__showToast
      if (timer) window.clearTimeout(timer)
    }
  }, [])

  if (!msg) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 80,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(20,20,20,0.9)',
        color: '#f0e6d0',
        padding: '12px 24px',
        borderRadius: 24,
        fontFamily: 'Georgia, serif',
        fontSize: 14,
        letterSpacing: 1.5,
        zIndex: 200,
        backdropFilter: 'blur(8px)',
        pointerEvents: 'none',
      }}
    >
      {msg}
    </div>
  )
}

/* ── Seated orbit — look around from the tram seat, disabled in worlds ── */
function SeatedOrbit() {
  const activeRoom = useStore((s) => s.activeRoom)
  const { camera } = useThree()
  const initialized = useRef(false)

  if (!initialized.current && !activeRoom) {
    camera.position.set(0, 1.7, -9.0)
    camera.lookAt(0, 1.6, -15)
    camera.fov = 72
    camera.updateProjectionMatrix()
    initialized.current = true
  }

  if (activeRoom) return null // WorldCamera handles it

  // Driver POV — stable orbit, zoom out to see exterior
  return (
    <OrbitControls
      target={[0, 1.65, -10.5]}
      minDistance={1.5}
      maxDistance={15}
      enablePan={false}
      enableZoom={true}
      zoomSpeed={0.6}
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
