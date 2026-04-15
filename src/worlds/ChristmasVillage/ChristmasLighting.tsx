export function ChristmasLighting() {
  return (
    <>
      {/* Warm cozy ambient */}
      <ambientLight color="#f4e0c0" intensity={0.5} />

      {/* Warm fill from above */}
      <directionalLight
        position={[2, 4, 3]}
        color="#ffe8c0"
        intensity={0.8}
      />

      {/* Spotlight on snow globe */}
      <spotLight
        position={[0, 3.5, 0]}
        target-position={[0, 1.5, -1.5]}
        color="#fff4d0"
        intensity={4}
        angle={0.4}
        penumbra={0.4}
        distance={5}
      />

      {/* Red accent from the post boxes */}
      <pointLight
        position={[-4.5, 1, -2]}
        color="#ff8080"
        intensity={0.3}
        distance={4}
        decay={2}
      />

      {/* Window cool light */}
      <pointLight
        position={[4.5, 2, -1]}
        color="#c8d8e8"
        intensity={0.5}
        distance={4}
        decay={2}
      />
    </>
  )
}
