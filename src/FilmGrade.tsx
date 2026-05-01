import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  HueSaturation,
  BrightnessContrast,
  Vignette,
  Noise,
} from '@react-three/postprocessing'
import { Vector2 } from 'three'
import { useStore } from './store'

// Post-processing is the single biggest mobile FPS sink in the tram view
// after shadows — six stacked full-screen passes (Bloom alone does
// threshold + blur + composite internally). Read once at module load;
// the viewport rarely changes class mid-session and the alternative is
// a window listener that forces every passing frame to re-check.
const IS_MOBILE_VIEWPORT =
  typeof window !== 'undefined' &&
  window.matchMedia('(max-width: 768px)').matches

/** Subtle camera gate-weave — 16mm projector feel */
function GateWeave() {
  const { camera } = useThree()
  const baseX = useRef(0)
  const baseY = useRef(0)
  const initialized = useRef(false)

  useFrame(() => {
    if (!initialized.current) {
      baseX.current = camera.position.x
      baseY.current = camera.position.y
      initialized.current = true
    }
    // Extremely subtle jitter
    camera.position.x += (Math.random() - 0.5) * 0.0008
    camera.position.y += (Math.random() - 0.5) * 0.0008
  })

  return null
}

export function FilmGrade() {
  const mode = useStore((s) => s.mode)

  // Mobile: skip the composer entirely. The tram view still gets the
  // subtle gate-weave camera jitter (cheap), but the six fullscreen
  // passes are gone. Low-end phones were losing 5–10 fps here.
  if (IS_MOBILE_VIEWPORT) {
    return <GateWeave />
  }

  // Mobile: skip the composer entirely. The tram view still gets the
  // subtle gate-weave camera jitter (cheap), but the six fullscreen
  // passes are gone. Low-end phones were losing 5–10 fps here.
  if (IS_MOBILE_VIEWPORT) {
    return <GateWeave />
  }

  return (
    <>
      <GateWeave />
      <EffectComposer>
        <Bloom
          intensity={mode === 'night' ? 0.7 : 0.25}
          luminanceThreshold={0.5}
          luminanceSmoothing={0.9}
        />
        <ChromaticAberration
          offset={new Vector2(0.0002, 0.0002)}
        />
        <HueSaturation
          saturation={-0.06}
        />
        <BrightnessContrast
          contrast={0.04}
          brightness={0.03}
        />
        <Vignette
          offset={0.3}
          darkness={0.35}
        />
        <Noise
          opacity={0.04}
          premultiply
        />
      </EffectComposer>
    </>
  )
}
