export function DreameryLighting() {
  return (
    <>
      {/* Cool purple ambient base */}
      <ambientLight color="#6a4884" intensity={0.4} />

      {/* Soft lavender "moonlight" from above */}
      <directionalLight position={[0, 10, 5]} color="#c8b0d8" intensity={0.6} />

      {/* Pink warm accent from below to illuminate Drift's underside */}
      <pointLight
        position={[0, -3, -4]}
        color="#f8b8c8"
        intensity={0.8}
        distance={10}
        decay={1.8}
      />

      {/* Soft key light on Drift specifically */}
      <pointLight
        position={[2, 2, -2]}
        color="#fff0d4"
        intensity={1.2}
        distance={8}
        decay={2}
      />
    </>
  )
}
