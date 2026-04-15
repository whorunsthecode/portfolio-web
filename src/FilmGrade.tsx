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
  const activeRoom = useStore((s) => s.activeRoom)

  // Don't apply film grade inside worlds — only in the tram view
  if (activeRoom) return null

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
