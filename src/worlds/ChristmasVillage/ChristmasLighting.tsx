export function ChristmasLighting() {
  return (
    <>
      {/* Cool moonlight ambient */}
      <ambientLight color="#8898b8" intensity={0.35} />

      {/* Moon directional — cool, from above */}
      <directionalLight
        position={[10, 20, -5]}
        color="#c8d4e8"
        intensity={0.4}
      />

      {/* Warm fill from the village windows */}
      <pointLight
        position={[0, 3, -2]}
        color="#ffb868"
        intensity={0.6}
        distance={20}
        decay={1.5}
      />
    </>
  )
}
