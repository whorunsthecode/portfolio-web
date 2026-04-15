const ASPHALT = '#3a2a20'
const CONCRETE = '#a89878'
const LINE_PAINT = '#e8d888'

export function TerminusGround() {
  return (
    <group>
      {/* Road */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color={ASPHALT} roughness={0.9} />
      </mesh>

      {/* Safety island */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[4, 0.2, 6]} />
        <meshStandardMaterial color={CONCRETE} roughness={0.85} />
      </mesh>

      {/* Yellow hazard stripes */}
      <mesh position={[-1.9, 0.21, 0]}>
        <boxGeometry args={[0.2, 0.02, 6]} />
        <meshStandardMaterial color={LINE_PAINT} roughness={0.8} />
      </mesh>
      <mesh position={[1.9, 0.21, 0]}>
        <boxGeometry args={[0.2, 0.02, 6]} />
        <meshStandardMaterial color={LINE_PAINT} roughness={0.8} />
      </mesh>

      {/* Tram tracks */}
      {[-2.5, 2.5].map((xSide) => (
        <group key={xSide}>
          {[-0.6, 0.6].map((offset) => (
            <mesh
              key={offset}
              position={[xSide + offset * 0.1, 0.02, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.08, 20]} />
              <meshStandardMaterial color="#4a4440" roughness={0.7} metalness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Road lane markings */}
      {Array.from({ length: 8 }).map((_, i) => (
        <mesh
          key={i}
          position={[-5.5, 0.01, -6 + i * 1.5]}
          rotation={[-Math.PI / 2, 0, 0]}
        >
          <planeGeometry args={[0.1, 0.6]} />
          <meshStandardMaterial color="#e8e8e0" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}
