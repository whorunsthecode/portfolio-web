export function AquariumLighting() {
  return (
    <>
      {/* Cool blue ambient — underwater feeling */}
      <ambientLight color="#88a8c8" intensity={0.5} />

      {/* Top-down "sunlight from surface" */}
      <directionalLight
        position={[2, 5, 1]}
        color="#c8e0f0"
        intensity={1.2}
      />

      {/* Warm amber spot on the egg */}
      <pointLight
        position={[0, 0.8, -2]}
        color="#ffc468"
        intensity={2}
        distance={4}
        decay={2}
      />
    </>
  )
}
