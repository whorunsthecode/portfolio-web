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
import { TOUCH, PerspectiveCamera } from 'three'
import { useStore } from './store'
import { OnboardingOverlay } from './onboarding/OnboardingOverlay'
import { DriverContactCard } from './onboarding/DriverContactCard'
import { GreetingCard } from './ui/GreetingCard'
import { MobileNavHint } from './onboarding/MobileNavHint'

// Mobile viewports get a wider FOV + farther max-dolly so the spatial layout
// of the cabin/street reads even when the screen is narrow. 88° mirrors a
// typical phone-camera ultrawide; desktop keeps the cinematic 72°.
const MOBILE_MQ = '(max-width: 768px)'
function isMobileViewport() {
  return typeof window !== 'undefined' && window.matchMedia(MOBILE_MQ).matches
}

export default function App() {
  const [boardingDone, setBoardingDone] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [mobile, setMobile] = useState(() => isMobileViewport())

  // Reduced motion — auto-skip
  const [prefersReduced] = useState(() =>
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )

  // Keep mobile flag in sync with orientation/resize
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const onChange = () => setMobile(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

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
        // Mobile retina panels were rendering at dpr 2, doubling the
        // pixel count for no visible gain on 3D at phone distance —
        // cap at 1.5 there to claw back frame budget.
        dpr={mobile ? [1, 1.5] : [1, 2]}
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

        {/* Tram exterior — visible during sidewalk beat */}
        <TramExterior visible={!boardingDone && elapsed < 3.5} />

        {boardingDone && <SeatedOrbit mobile={mobile} />}
        <Scene />
        <FilmGrade />
      </Canvas>

      {/* Boarding-time title card — big cinematic "welcome to ___"
          moment played over the boarding intro. Card itself is
          pointer-transparent so the 3D scene still takes drag; the
          LinkedIn link re-enables pointer events on its own span. */}
      {!boardingDone && (
        <>
          <style>{`
            @keyframes boardingTitleIn {
              from { opacity: 0; transform: translate(-50%, -16px) scale(0.96); letter-spacing: 0.3em; }
              to   { opacity: 1; transform: translate(-50%, 0) scale(1);       letter-spacing: inherit; }
            }
            @keyframes boardingEyebrowIn {
              from { opacity: 0; transform: translateY(-4px); }
              to   { opacity: 0.78; transform: translateY(0); }
            }
            @keyframes boardingRuleIn {
              from { opacity: 0; width: 0; }
              to   { opacity: 0.9; width: 72px; }
            }
          `}</style>
          <div
            style={{
              position: 'fixed',
              top: 'min(18vh, 120px)',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 150,
              pointerEvents: 'none',
              textAlign: 'center',
              color: '#f5ead0',
              padding: '28px 36px',
              borderRadius: 18,
              background: 'linear-gradient(180deg, rgba(20,16,12,0.78) 0%, rgba(10,8,6,0.78) 100%)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              border: '1px solid rgba(200,164,104,0.45)',
              boxShadow: '0 14px 48px rgba(0,0,0,0.55)',
              maxWidth: 'min(92vw, 640px)',
              animation: 'boardingTitleIn 900ms cubic-bezier(0.22, 0.9, 0.28, 1) both',
            }}
          >
            {/* Eyebrow label — the "WELCOME ABOARD" stamp over a film title */}
            <div
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: 11,
                letterSpacing: '0.32em',
                textTransform: 'uppercase',
                color: '#d4b07a',
                marginBottom: 10,
                animation: 'boardingEyebrowIn 700ms ease-out 250ms both',
              }}
            >
              ⸻&nbsp; Welcome aboard &nbsp;⸻
            </div>

            {/* Main title — big serif, film-opening scale */}
            <div
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                fontStyle: 'italic',
                fontWeight: 700,
                fontSize: 'clamp(34px, 6vw, 54px)',
                letterSpacing: '-0.01em',
                lineHeight: 1.05,
              }}
            >
              <a
                href="https://www.linkedin.com/in/karmenyipnm"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  pointerEvents: 'auto',
                  color: 'inherit',
                  textDecoration: 'none',
                  borderBottom: '1px dashed rgba(245,234,208,0.55)',
                  paddingBottom: 2,
                  transition: 'color 160ms ease, border-color 160ms ease',
                }}
                onMouseEnter={(e) => {
                  const a = e.currentTarget
                  a.style.color = '#ffe6b0'
                  a.style.borderBottomColor = 'rgba(255,230,176,0.9)'
                }}
                onMouseLeave={(e) => {
                  const a = e.currentTarget
                  a.style.color = 'inherit'
                  a.style.borderBottomColor = 'rgba(245,234,208,0.55)'
                }}
                title="Open Karmen's LinkedIn in a new tab"
              >
                Karmen Yip
              </a>
              <span style={{ opacity: 0.9 }}> · Portfolio</span>
            </div>

            {/* Gold rule divider */}
            <div
              style={{
                height: 1.5,
                background: 'linear-gradient(90deg, transparent, #c8a048, transparent)',
                margin: '16px auto 12px',
                animation: 'boardingRuleIn 900ms ease-out 400ms both',
              }}
            />

            {/* Subtitle — tagline, uppercased + spaced */}
            <div
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: 'clamp(11px, 1.4vw, 13px)',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                opacity: 0.82,
                animation: 'boardingEyebrowIn 800ms ease-out 500ms both',
              }}
            >
              Ride a 1982 Hong Kong tram
            </div>
          </div>
        </>
      )}

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
      <OnboardingOverlay />
      <DriverContactCard />
      <GreetingCard />
      {boardingDone && mobile && <MobileNavHint />}
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
function SeatedOrbit({ mobile }: { mobile: boolean }) {
  const activeRoom = useStore((s) => s.activeRoom)
  const { camera } = useThree()
  const initialized = useRef(false)

  if (!initialized.current && !activeRoom) {
    camera.position.set(0, 1.7, -9.0)
    camera.lookAt(0, 1.6, -15)
    if (camera instanceof PerspectiveCamera) {
      camera.fov = mobile ? 88 : 72
      camera.updateProjectionMatrix()
    }
    initialized.current = true
  }

  if (activeRoom) return null // WorldCamera handles it

  // Driver POV — stable orbit. Mobile gets a higher max-dolly so users can
  // pull back far enough to orient themselves relative to the tram/street.
  return (
    <OrbitControls
      target={[0, 1.65, -10.5]}
      minDistance={1.5}
      maxDistance={mobile ? 22 : 15}
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
