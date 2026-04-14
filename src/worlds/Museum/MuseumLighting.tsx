export function MuseumLighting() {
  return (
    <>
      {/* Warm ambient fill */}
      <ambientLight color="#f8e8c8" intensity={0.3} />

      {/* Main overhead tungsten light */}
      <pointLight
        position={[0, 4.5, 0]}
        color="#ffe8c8"
        intensity={2.5}
        distance={15}
        decay={1.8}
      />

      {/* Spotlight on hero exhibit */}
      <spotLight
        position={[0, 4.5, -3.5]}
        target-position={[0, 2, -3.5]}
        color="#fff0d4"
        intensity={8}
        angle={0.4}
        penumbra={0.3}
        distance={10}
        castShadow
      />

      {/* Wall-wash spots on each painting */}
      {[
        { pos: [-2.5, 4.5, -2] as const, target: [-2.95, 2.5, -2] as const },
        { pos: [2.5, 4.5, 0] as const, target: [2.95, 2.5, 0] as const },
        { pos: [0, 4.5, -4.3] as const, target: [0, 2.5, -4.95] as const },
      ].map((s, i) => (
        <spotLight
          key={i}
          position={s.pos}
          target-position={s.target}
          color="#ffddaa"
          intensity={3}
          angle={0.5}
          penumbra={0.4}
          distance={6}
        />
      ))}
    </>
  )
}
