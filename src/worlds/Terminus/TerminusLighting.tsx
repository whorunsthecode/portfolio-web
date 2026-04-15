import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { PointLight } from 'three'

export function TerminusLighting() {
  const lampRef = useRef<PointLight>(null)

  useFrame(({ clock }) => {
    if (lampRef.current) {
      lampRef.current.intensity = 1.2 + Math.sin(clock.elapsedTime * 12) * 0.08
    }
  })

  return (
    <>
      {/* Cool dusk ambient */}
      <ambientLight color="#8a7898" intensity={0.35} />

      {/* Warm sunset directional from a low angle */}
      <directionalLight
        position={[15, 4, -5]}
        color="#ff9060"
        intensity={1.2}
        castShadow
      />

      {/* Cool fill from the opposite direction */}
      <directionalLight position={[-10, 5, 3]} color="#6858a0" intensity={0.5} />

      {/* Warm spotlight on the info panel — hero light */}
      <spotLight
        position={[0, 3.5, 0]}
        target-position={[0, 1.2, -2.2]}
        color="#ffddaa"
        intensity={3}
        angle={0.6}
        penumbra={0.4}
        distance={6}
      />

      {/* Station lamp just above the shelter — subtly flickers */}
      <pointLight
        ref={lampRef}
        position={[0, 2.5, -2]}
        color="#ffddaa"
        intensity={1.2}
        distance={4}
        decay={1.8}
      />
    </>
  )
}
