export function DreameryLighting() {
  return (
    <>
      {/* Brighter purple ambient */}
      <ambientLight color="#A78BCA" intensity={0.6} />

      {/* Warm key from the lamp */}
      <pointLight
        position={[0.6, 1.15, -1.4]}
        color="#FFE0A8"
        intensity={2.5}
        distance={6}
        decay={2}
      />

      {/* Cool purple from window */}
      <pointLight
        position={[1.5, 2.3, -2.5]}
        color="#A78BCA"
        intensity={1.2}
        distance={5}
        decay={2}
      />

      {/* Pink underglow on Drift */}
      <pointLight
        position={[-1.2, 1.8, -0.3]}
        color="#F498B0"
        intensity={0.9}
        distance={3}
        decay={2}
      />

      {/* Top-down soft fill */}
      <directionalLight
        position={[0, 5, 2]}
        color="#E8DEFF"
        intensity={0.5}
      />
    </>
  )
}
