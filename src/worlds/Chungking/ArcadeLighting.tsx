// Three steady fluorescent strips running down the ceiling — bright,
// authentic 1980s arcade lighting. No flicker.

function FluorescentTube({ z }: { z: number }) {
  return (
    <group position={[0, 3.14, z]}>
      {/* Tube fixture housing */}
      <mesh>
        <boxGeometry args={[0.35, 0.08, 1.4]} />
        <meshStandardMaterial color={'#e8e2d0'} roughness={0.6} />
      </mesh>
      {/* Tube itself — bright emissive strip */}
      <mesh position={[0, -0.05, 0]}>
        <boxGeometry args={[0.26, 0.02, 1.32]} />
        <meshStandardMaterial
          color={'#f8fcff'}
          emissive={'#eaf2ff'}
          emissiveIntensity={1.8}
        />
      </mesh>
      <rectAreaLight
        position={[0, -0.08, 0]}
        width={1.3}
        height={0.24}
        intensity={9}
        color={'#eaf2ff'}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  )
}

export function ArcadeLighting() {
  return (
    <>
      {/* Bright fluorescent-lit arcade — real Chungking ground floor reads
          as overexposed by daylight standards; tubes everywhere, neon
          bouncing off white tile. No horror dimness. */}
      <ambientLight intensity={0.95} color={'#d8d0bc'} />

      {/* Three ceiling tubes at even spacing down the arcade depth — all
          steady, no flicker. */}
      <FluorescentTube z={-3.2} />
      <FluorescentTube z={-0.4} />
      <FluorescentTube z={2.4} />

      {/* Warm spill from the back — lift-lobby bulb glow */}
      <pointLight position={[0, 1.8, -4.5]} color={'#ffd49a'} intensity={0.6} distance={5} decay={2} />

      {/* Cool spill from the arcade mouth — daylight leaking in */}
      <pointLight position={[0, 2.2, 4.6]} color={'#cfe4ff'} intensity={0.7} distance={6} decay={2} />
    </>
  )
}
