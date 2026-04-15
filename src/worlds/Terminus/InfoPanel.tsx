import { useState } from 'react'
import { Text } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'

const TRAM_GREEN = '#1a4a2c'
const TRAM_GREEN_LIGHT = '#2a6a3c'
const CREAM = '#f4e8c8'
const CURRENT_STOP = '#c82820'

interface Stop {
  id: string
  label: string
  subtitle: string
  url: string | null
  color: string
}

const STOPS: Stop[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    subtitle: '@karmenyipnm',
    url: 'https://www.linkedin.com/in/karmenyipnm',
    color: '#0a66c2',
  },
  {
    id: 'email',
    label: 'Email',
    subtitle: 'kynm2603',
    url: 'mailto:kynm2603@gmail.com',
    color: '#c82820',
  },
  {
    id: 'github',
    label: 'GitHub',
    subtitle: '@whorunsthecode',
    url: 'https://github.com/whorunsthecode',
    color: '#2a2a2a',
  },
  {
    id: 'resume',
    label: 'Résumé',
    subtitle: 'coming soon',
    url: null,
    color: '#6a5a40',
  },
]

function Nameplate() {
  return (
    <group position={[0, 1.4, -2.22]}>
      {/* Main green plate */}
      <mesh>
        <boxGeometry args={[2.0, 0.55, 0.05]} />
        <meshStandardMaterial color={TRAM_GREEN} roughness={0.6} />
      </mesh>

      {/* Inner lighter-green border panel */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[1.92, 0.47]} />
        <meshStandardMaterial color={TRAM_GREEN_LIGHT} roughness={0.6} />
      </mesh>

      {/* Tiny tram silhouette at top */}
      <group position={[0, 0.13, 0.04]}>
        <mesh position={[0, -0.01, 0]}>
          <boxGeometry args={[0.34, 0.04, 0.01]} />
          <meshStandardMaterial color={CREAM} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.32, 0.04, 0.01]} />
          <meshStandardMaterial color={CREAM} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.008, 0.06, 0.01]} />
          <meshStandardMaterial color={CREAM} />
        </mesh>
      </group>

      {/* Station name */}
      <Text
        position={[0, -0.05, 0.04]}
        fontSize={0.17}
        color={CREAM}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        KARMEN YIP
      </Text>

      {/* Subtitle */}
      <Text
        position={[0, -0.18, 0.04]}
        fontSize={0.06}
        color={CREAM}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.15}
      >
        TERMINUS · END OF LINE
      </Text>
    </group>
  )
}

function RouteNumberSign() {
  return (
    <group position={[-1.0, 1.85, -2.22]}>
      {/* Outer ring (slightly larger, set back) */}
      <mesh position={[0, 0, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.01, 24]} />
        <meshStandardMaterial color={TRAM_GREEN} />
      </mesh>
      {/* Circular cream sign face */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
        <meshStandardMaterial color={CREAM} roughness={0.7} />
      </mesh>
      <Text
        position={[0, 0, 0.025]}
        fontSize={0.12}
        color={TRAM_GREEN}
        anchorX="center"
        anchorY="middle"
      >
        88
      </Text>
    </group>
  )
}

interface StopProps {
  stop: Stop
  position: [number, number, number]
  isCurrent: boolean
}

function ContactStop({ stop, position, isCurrent }: StopProps) {
  const [hovered, setHovered] = useState(false)

  const handleTap = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (stop.url) {
      window.open(stop.url, '_blank')
    } else {
      ;(window as unknown as { __showToast?: (msg: string) => void }).__showToast?.(
        'Résumé coming soon',
      )
    }
  }

  return (
    <group
      position={position}
      onClick={handleTap}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      {/* Dot on the route line */}
      <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.03, 16]} />
        <meshStandardMaterial
          color={isCurrent ? CURRENT_STOP : stop.color}
          emissive={isCurrent ? CURRENT_STOP : hovered ? stop.color : '#000000'}
          emissiveIntensity={isCurrent ? 0.4 : hovered ? 0.3 : 0}
          roughness={0.5}
        />
      </mesh>

      {/* Ring around dot on hover */}
      {hovered && (
        <mesh position={[0, 0, 0.025]}>
          <torusGeometry args={[0.11, 0.01, 8, 24]} />
          <meshStandardMaterial color={stop.color} emissive={stop.color} emissiveIntensity={0.5} />
        </mesh>
      )}

      {/* Label above dot */}
      <Text
        position={[0, 0.22, 0.02]}
        fontSize={0.08}
        color="#2a2418"
        anchorX="center"
        anchorY="middle"
      >
        {stop.label}
      </Text>

      {/* Subtitle below dot */}
      <Text
        position={[0, -0.2, 0.02]}
        fontSize={0.05}
        color="#6a5a40"
        anchorX="center"
        anchorY="middle"
      >
        {stop.subtitle}
      </Text>
    </group>
  )
}

function RouteStrip() {
  const stopCount = STOPS.length
  const stripWidth = 2.6
  const stopSpacing = stripWidth / (stopCount - 1)
  const startX = -stripWidth / 2
  const currentIndex = stopCount - 1

  return (
    <group position={[0, 0.85, -2.22]}>
      {/* Cream background strip */}
      <mesh>
        <boxGeometry args={[3.0, 0.7, 0.03]} />
        <meshStandardMaterial color={CREAM} roughness={0.8} />
      </mesh>

      {/* Connecting route line (grey) */}
      <mesh position={[0, 0, 0.02]}>
        <boxGeometry args={[2.6, 0.02, 0.005]} />
        <meshStandardMaterial color="#9a9590" />
      </mesh>

      {/* "ROUTE" label at top */}
      <Text
        position={[-1.32, 0.28, 0.02]}
        fontSize={0.05}
        color="#6a5a40"
        anchorX="left"
        anchorY="middle"
        letterSpacing={0.15}
      >
        ROUTE · 路線
      </Text>

      {/* Individual stops */}
      {STOPS.map((stop, i) => (
        <ContactStop
          key={stop.id}
          stop={stop}
          position={[startX + i * stopSpacing, 0, 0]}
          isCurrent={i === currentIndex}
        />
      ))}

      {/* "YOU ARE HERE" indicator pointing to the current (last) stop */}
      <group position={[startX + currentIndex * stopSpacing, -0.3, 0.02]}>
        <Text
          fontSize={0.045}
          color={CURRENT_STOP}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
        >
          ← YOU ARE HERE
        </Text>
      </group>
    </group>
  )
}

export function InfoPanel() {
  return (
    <group>
      <RouteNumberSign />
      <Nameplate />
      <RouteStrip />
    </group>
  )
}
