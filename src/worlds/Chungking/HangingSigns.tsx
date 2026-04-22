import { Text } from '@react-three/drei'

// Signboards hanging from the ceiling across the arcade — a layer of
// chaos/depth above the stall signs. Rotated around Y to read from either
// direction down the corridor.

interface HangDef {
  z: number
  main: string
  accent: string
  color: string
}

const HANGS: HangDef[] = [
  { z: -2.6, main: '24H 外匯',   accent: 'FOREX',     color: '#ffd84a' },
  { z: 0.0,  main: 'CURRY HOUSE', accent: '清真 咖喱', color: '#ff6a2c' },
  { z: 2.5,  main: 'GUEST HOUSE', accent: '賓館',      color: '#ff70b8' },
]

function HangingSign({ def }: { def: HangDef }) {
  return (
    <group position={[0, 2.72, def.z]}>
      {/* Chain/wire suspension — two thin bars */}
      <mesh position={[-0.4, 0.18, 0]}>
        <boxGeometry args={[0.015, 0.36, 0.015]} />
        <meshStandardMaterial color={'#2a2418'} metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[0.4, 0.18, 0]}>
        <boxGeometry args={[0.015, 0.36, 0.015]} />
        <meshStandardMaterial color={'#2a2418'} metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Double-sided signboard (visible when orbiting the arcade) */}
      <mesh>
        <boxGeometry args={[1.3, 0.42, 0.05]} />
        <meshStandardMaterial color={'#120a04'} roughness={0.9} />
      </mesh>

      {/* Front face text */}
      <Text
        position={[0, 0.065, 0.031]}
        fontSize={0.14}
        color={def.color}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.05}
        outlineWidth={0.005}
        outlineColor={def.color}
      >
        {def.main}
      </Text>
      <Text
        position={[0, -0.10, 0.031]}
        fontSize={0.075}
        color={'#f5e0a8'}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
      >
        {def.accent}
      </Text>

      {/* Back face — mirrored so passers look up from the other direction */}
      <Text
        position={[0, 0.065, -0.031]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.14}
        color={def.color}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.05}
        outlineWidth={0.005}
        outlineColor={def.color}
      >
        {def.main}
      </Text>
      <Text
        position={[0, -0.10, -0.031]}
        rotation={[0, Math.PI, 0]}
        fontSize={0.075}
        color={'#f5e0a8'}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.1}
      >
        {def.accent}
      </Text>

      {/* Accent glow behind the sign */}
      <pointLight position={[0, 0, 0.4]} color={def.color} intensity={0.5} distance={2} decay={2} />
    </group>
  )
}

export function HangingSigns() {
  return (
    <>
      {HANGS.map((def, i) => (
        <HangingSign key={i} def={def} />
      ))}
    </>
  )
}
