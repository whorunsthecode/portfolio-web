import { Text } from '@react-three/drei'

// Apartment-entry set dressing — rusted mail slots, number plates, and
// one propped-open door glimpse down the left wall. The wall dimension
// references in AlleyShell: x = -0.9 for left inside face, z from -5 to 5.

interface Door {
  z: number
  number: string
  familyChinese: string
  open?: boolean
}

const LEFT_DOORS: Door[] = [
  { z: -3.4, number: '14B', familyChinese: '陳' },
  { z: -1.6, number: '15A', familyChinese: '黃', open: true },
  { z: 0.2,  number: '15C', familyChinese: '李' },
  { z: 2.0,  number: '16B', familyChinese: '王' },
  { z: 3.7,  number: '16D', familyChinese: '何' },
]

const RIGHT_DOORS: Door[] = [
  { z: -2.6, number: '14A', familyChinese: '張' },
  { z: -0.8, number: '14C', familyChinese: '趙' },
  { z: 1.0,  number: '15B', familyChinese: '林' },
  { z: 2.8,  number: '16A', familyChinese: '吳' },
]

function DoorAssembly({ door, side }: { door: Door; side: 'left' | 'right' }) {
  const wallX = side === 'left' ? -0.88 : 0.88
  const faceY = side === 'left' ? Math.PI / 2 : -Math.PI / 2
  const signal = side === 'left' ? -1 : 1

  return (
    <group position={[wallX, 0, door.z]} rotation={[0, faceY, 0]}>
      {/* Door frame — narrow metal-wrapped opening */}
      <mesh position={[0, 1.05, 0.02]}>
        <boxGeometry args={[0.72, 2.1, 0.02]} />
        <meshStandardMaterial color={door.open ? '#0a0806' : '#2a201a'} roughness={0.85} />
      </mesh>
      {/* Frame outline */}
      {(
        [
          { pos: [0, 2.12, 0.04], size: [0.78, 0.06, 0.04] },
          { pos: [0, 0, 0.04], size: [0.78, 0.04, 0.04] },
          { pos: [-0.36, 1.05, 0.04], size: [0.06, 2.1, 0.04] },
          { pos: [0.36, 1.05, 0.04], size: [0.06, 2.1, 0.04] },
        ] as { pos: [number, number, number]; size: [number, number, number] }[]
      ).map((f, i) => (
        <mesh key={i} position={f.pos}>
          <boxGeometry args={f.size} />
          <meshStandardMaterial color={'#5a4a38'} metalness={0.35} roughness={0.7} />
        </mesh>
      ))}

      {/* Open-door lightspill — gives one apartment a warm interior glow */}
      {door.open && (
        <>
          <pointLight
            position={[0, 1.2, 0.5]}
            color={'#ffc880'}
            intensity={0.55}
            distance={1.6}
            decay={2}
          />
          {/* Faint warm panel inside the opening to imply a lit interior */}
          <mesh position={[0, 1.05, -0.02]}>
            <planeGeometry args={[0.66, 2.02]} />
            <meshStandardMaterial
              color={'#5a3a1a'}
              emissive={'#ff9848'}
              emissiveIntensity={0.45}
              roughness={1}
            />
          </mesh>
        </>
      )}

      {/* Door number plate — riveted brass rectangle */}
      <mesh position={[0.25, 1.6, 0.045]}>
        <boxGeometry args={[0.18, 0.11, 0.015]} />
        <meshStandardMaterial color={'#8a6a3a'} metalness={0.55} roughness={0.55} />
      </mesh>
      <Text
        position={[0.25, 1.6, 0.053]}
        fontSize={0.07}
        color={'#1a1008'}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
      >
        {door.number}
      </Text>

      {/* Family name placard (carved name slot) */}
      <mesh position={[-0.18, 1.6, 0.045]}>
        <boxGeometry args={[0.14, 0.11, 0.015]} />
        <meshStandardMaterial color={'#2a1a10'} roughness={0.8} />
      </mesh>
      <Text
        position={[-0.18, 1.6, 0.053]}
        fontSize={0.075}
        color={'#d8c290'}
        anchorX="center"
        anchorY="middle"
      >
        {door.familyChinese}
      </Text>

      {/* Mail slot — thin horizontal gap with brass lip */}
      <mesh position={[0, 0.85, 0.045]}>
        <boxGeometry args={[0.3, 0.04, 0.015]} />
        <meshStandardMaterial color={'#6a5030'} metalness={0.5} roughness={0.55} />
      </mesh>

      {/* Doorknob (small knob on the non-hinge side) */}
      <mesh position={[signal * 0.25, 1.0, 0.08]}>
        <sphereGeometry args={[0.04, 12, 10]} />
        <meshStandardMaterial color={'#b89868'} metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  )
}

export function MailSlots() {
  return (
    <group>
      {LEFT_DOORS.map((d, i) => (
        <DoorAssembly key={`l-${i}`} door={d} side="left" />
      ))}
      {RIGHT_DOORS.map((d, i) => (
        <DoorAssembly key={`r-${i}`} door={d} side="right" />
      ))}
    </group>
  )
}
