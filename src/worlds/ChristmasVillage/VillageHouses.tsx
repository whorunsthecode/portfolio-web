import { useMemo } from 'react'
import { useStore } from '../../store'

const WALL_COLORS = ['#f4e8c8', '#d89878', '#b8c4d4', '#a8b098', '#e8c498', '#c4a888']
const ROOF_COLORS = ['#4a2818', '#3a1e14', '#5a3224']

function seededRand(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

// Tree is at [-1.5, 0, -2] — keep houses clear of it
const TREE_X = -1.5
const TREE_Z = -2
const TREE_CLEAR = 1.8

function generateHousePositions(count: number) {
  const positions = []
  let i = 0
  let attempts = 0
  while (positions.length < count && attempts < 100) {
    const angle = i * 0.7
    const radius = 2 + i * 0.35
    const jitterX = (seededRand(i * 2) - 0.5) * 1.5
    const jitterZ = (seededRand(i * 3) - 0.5) * 1.5
    const x = Math.cos(angle) * radius + jitterX
    const z = Math.sin(angle) * radius + jitterZ - 4
    i++
    attempts++
    // Skip if too close to the tree
    const dx = x - TREE_X
    const dz = z - TREE_Z
    if (Math.sqrt(dx * dx + dz * dz) < TREE_CLEAR) continue
    positions.push({
      x, z,
      rotY: (seededRand((i - 1) * 5) - 0.5) * 0.6,
      wallColor: WALL_COLORS[positions.length % WALL_COLORS.length],
      roofColor: ROOF_COLORS[positions.length % ROOF_COLORS.length],
      scale: 0.8 + seededRand((i - 1) * 7) * 0.4,
    })
  }
  return positions
}

interface HousePosition {
  x: number; z: number; rotY: number
  wallColor: string; roofColor: string; scale: number
}

function House({ position: p, isToday }: { position: HousePosition; isToday: boolean }) {
  const setModal = useStore((s) => s.setModal)
  const houseScale = isToday ? p.scale * 1.6 : p.scale

  return (
    <group
      position={[p.x, 0, p.z]}
      rotation={[0, p.rotY, 0]}
      scale={[houseScale, houseScale, houseScale]}
      onClick={(e) => {
        e.stopPropagation()
        setModal('christmas')
      }}
      onPointerOver={() => { document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { document.body.style.cursor = 'auto' }}
    >
      {/* Walls */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[0.8, 0.8, 0.7]} />
        <meshStandardMaterial color={p.wallColor} roughness={0.85} />
      </mesh>

      {/* Roof */}
      <mesh position={[0, 0.95, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[0.6, 0.4, 4]} />
        <meshStandardMaterial color={p.roofColor} roughness={0.9} />
      </mesh>

      {/* Snow on roof */}
      <mesh position={[0, 1.02, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[0.58, 0.08, 4]} />
        <meshBasicMaterial color="#e8ecf4" />
      </mesh>

      {/* Window — glowing */}
      <mesh position={[0, 0.45, 0.36]}>
        <planeGeometry args={[0.25, 0.3]} />
        <meshBasicMaterial color={isToday ? '#ffc850' : '#ffb868'} />
      </mesh>

      {/* Door */}
      <mesh position={[0, 0.15, 0.36]}>
        <planeGeometry args={[0.18, 0.25]} />
        <meshStandardMaterial color="#3a2010" roughness={0.9} />
      </mesh>

      {/* Window light */}
      <pointLight
        position={[0, 0.5, 0.3]}
        color={isToday ? '#ffc850' : '#ffb868'}
        intensity={isToday ? 1.8 : 0.6}
        distance={isToday ? 4 : 2}
        decay={2}
      />

      {/* Sparkle ring above today's house */}
      {isToday && (
        <mesh position={[0, 1.4, 0]}>
          <torusGeometry args={[0.4, 0.02, 6, 20]} />
          <meshBasicMaterial color="#ffc850" />
        </mesh>
      )}
    </group>
  )
}

export function VillageHouses() {
  const positions = useMemo(() => generateHousePositions(25), [])

  const today = new Date()
  const month = today.getMonth()
  const date = today.getDate()
  const todayIndex = month === 11 && date >= 1 && date <= 25 ? date - 1 : 0

  return (
    <>
      {positions.map((p, i) => (
        <House key={i} position={p} isToday={i === todayIndex} />
      ))}
    </>
  )
}
