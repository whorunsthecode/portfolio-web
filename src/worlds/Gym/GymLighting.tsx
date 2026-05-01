export function GymLighting() {
  return (
    <>
      {/* Warm cream ambient */}
      <ambientLight color="#f4eccc" intensity={0.55} />

      {/* Natural daylight from the arched window */}
      <directionalLight
        position={[-8, 3, 0]}
        color="#f4eedc"
        intensity={1.2}
      />

      {/* Recessed ceiling — warm wash */}
      <pointLight
        position={[0, 3.5, -2]}
        color="#fff4e0"
        intensity={2}
        distance={8}
        decay={1.5}
      />
      <pointLight
        position={[0, 3.5, 2]}
        color="#fff4e0"
        intensity={1.5}
        distance={8}
        decay={1.5}
      />

      {/* Spotlight on the phone display */}
      <spotLight
        position={[0.5, 3.5, -1]}
        target-position={[0.5, 1.85, -2]}
        color="#ffddaa"
        intensity={6}
        angle={0.3}
        penumbra={0.3}
        distance={5}
      />

      {/* Spotlight on the framed shrimp art */}
      <spotLight
        position={[-0.5, 3.5, -3]}
        target-position={[-0.5, 2.1, -5.9]}
        color="#ffe4a8"
        intensity={4}
        angle={0.4}
        penumbra={0.3}
        distance={4}
      />
    </>
  )
}
