export function GymLighting() {
  return (
    <>
      {/* Cool fluorescent fill with slight green tint */}
      <ambientLight color="#d0e0a8" intensity={0.35} />

      {/* Subtle warm fill from the floor */}
      <pointLight
        position={[0, 0.5, 0]}
        color="#e8d8a8"
        intensity={0.3}
        distance={8}
        decay={2}
      />

      {/* HERO amber spotlight on the caged phone */}
      <spotLight
        position={[0, 3.5, -1.5]}
        target-position={[0, 0.2, -2]}
        color="#ffc468"
        intensity={12}
        angle={0.35}
        penumbra={0.2}
        distance={6}
        castShadow
      />

      {/* Back-wall rim so the lime wall has some warmth */}
      <pointLight
        position={[0, 2, -4.5]}
        color="#d8e8a0"
        intensity={0.5}
        distance={6}
        decay={2}
      />
    </>
  )
}
