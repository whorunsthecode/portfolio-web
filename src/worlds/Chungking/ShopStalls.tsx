import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface StallDef {
  label: string
  sub?: string
  color: string
  shutterOpen: boolean
}

// Names drawn from the real Chungking Mansions directory — currency
// exchange, phone cards, samosas, VCD piracy.
const LEFT_STALLS: StallDef[] = [
  { label: '外匯 EXCHANGE',  sub: 'USD · INR · PKR', color: '#ff5a8a', shutterOpen: true },
  { label: 'PHONE CARDS',    sub: '長途電話',         color: '#48d3ff', shutterOpen: true },
  { label: 'SAMOSA',         sub: '咖喱角',           color: '#ffb038', shutterOpen: true },
  { label: 'SIM CARDS',      sub: 'INTL ROAMING',     color: '#ff77d8', shutterOpen: false },
]

const RIGHT_STALLS: StallDef[] = [
  { label: 'VCD · DVD',      sub: '港產片 HK MOVIES', color: '#ff4747', shutterOpen: true },
  { label: 'GUEST HOUSE',    sub: '旅館 · ROOM $180', color: '#ffd84a', shutterOpen: true },
  { label: 'CURRY 咖喱',     sub: 'HALAL · SPICY',    color: '#ff8038', shutterOpen: true },
  { label: 'WATCHES 錶',     sub: 'ROLEX COPY',       color: '#78ffb0', shutterOpen: false },
]

const STALL_WIDTH = 1.6
const STALL_GAP = 0.16
const ARCADE_WIDTH = 6
const ARCADE_DEPTH = 10

// Stall geometry is authored facing +Z (outward into the arcade). The wrapper
// group rotates it onto the correct wall; inner coords stay simple.
function Stall({ def, side, index }: { def: StallDef; side: 'left' | 'right'; index: number }) {
  const zCenter = -ARCADE_DEPTH / 2 + 0.8 + index * (STALL_WIDTH + STALL_GAP) + STALL_WIDTH / 2
  const x = side === 'left' ? -ARCADE_WIDTH / 2 + 0.04 : ARCADE_WIDTH / 2 - 0.04
  const rotY = side === 'left' ? Math.PI / 2 : -Math.PI / 2

  return (
    <group position={[x, 0, zCenter]} rotation={[0, rotY, 0]}>
      {/* Dark interior recess */}
      <mesh position={[0, 1.1, 0]}>
        <planeGeometry args={[STALL_WIDTH - 0.05, 2.1]} />
        <meshStandardMaterial color={'#1a1408'} roughness={1} side={THREE.DoubleSide} />
      </mesh>

      {/* Counter front + ledge */}
      <mesh position={[0, 0.42, 0.09]}>
        <boxGeometry args={[STALL_WIDTH, 0.84, 0.14]} />
        <meshStandardMaterial color={'#c8a878'} roughness={0.75} />
      </mesh>
      <mesh position={[0, 0.87, 0.12]}>
        <boxGeometry args={[STALL_WIDTH + 0.04, 0.05, 0.2]} />
        <meshStandardMaterial color={'#3a2a18'} roughness={0.8} />
      </mesh>

      {def.shutterOpen ? (
        // Rolled-up shutter drum above the opening
        <mesh position={[0, 2.18, 0.1]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, STALL_WIDTH, 16]} />
          <meshStandardMaterial color={'#9a9a9a'} metalness={0.6} roughness={0.55} />
        </mesh>
      ) : (
        <group position={[0, 1.15, 0.11]}>
          <mesh>
            <planeGeometry args={[STALL_WIDTH - 0.02, 2.05]} />
            <meshStandardMaterial color={'#7a7a7a'} metalness={0.5} roughness={0.6} />
          </mesh>
          {Array.from({ length: 14 }, (_, i) => (
            <mesh key={i} position={[0, -1.0 + (i * 2.0) / 13, 0.008]}>
              <boxGeometry args={[STALL_WIDTH - 0.02, 0.025, 0.008]} />
              <meshStandardMaterial color={'#5a5a5a'} metalness={0.4} roughness={0.7} />
            </mesh>
          ))}
        </group>
      )}

      {/* Signboard + neon glow */}
      <mesh position={[0, 2.42, 0.02]}>
        <boxGeometry args={[STALL_WIDTH - 0.08, 0.44, 0.04]} />
        <meshStandardMaterial color={'#0a0a0a'} roughness={0.95} />
      </mesh>

      <Text
        position={[0, 2.50, 0.05]}
        fontSize={0.13}
        color={def.color}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.04}
        outlineWidth={0.005}
        outlineColor={def.color}
      >
        {def.label}
      </Text>
      {def.sub && (
        <Text
          position={[0, 2.34, 0.05]}
          fontSize={0.075}
          color={'#f8e8c8'}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
        >
          {def.sub}
        </Text>
      )}
    </group>
  )
}

export function ShopStalls() {
  return (
    <group>
      {LEFT_STALLS.map((def, i) => (
        <Stall key={`l-${i}`} def={def} side="left" index={i} />
      ))}
      {RIGHT_STALLS.map((def, i) => (
        <Stall key={`r-${i}`} def={def} side="right" index={i} />
      ))}
    </group>
  )
}
