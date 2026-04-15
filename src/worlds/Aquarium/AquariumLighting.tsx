export function AquariumLighting() {
  return (
    <>
      {/* Sunset warm ambient */}
      <ambientLight color="#f4b090" intensity={0.5} />

      {/* Low warm directional (sun) from the side where the sun sprite sits */}
      <directionalLight position={[4, 2, 1]} color="#ff9060" intensity={0.8} />

      {/* Cool water fill from below */}
      <pointLight
        position={[0, -1.5, 0]}
        color="#4a88a8"
        intensity={0.6}
        distance={6}
        decay={1.5}
      />

      {/* Hero amber spotlight on the egg */}
      <pointLight
        position={[0, -0.4, 0.5]}
        color="#ffc468"
        intensity={2}
        distance={3}
        decay={2}
      />
    </>
  )
}
