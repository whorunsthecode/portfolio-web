import { useState } from 'react'
import { Text } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { CONTACT_CHANNELS, type ContactChannel } from '../../config/contact'

const TRAM_GREEN_VINTAGE = '#2a5238'
const TRAM_GREEN_WEATHERED = '#3a6248'
const CREAM_AGED = '#e8d8b8'
const HAND_PAINT_RED = '#a82828'
const WOOD_FRAME = '#5a3a20'
const BOARD_WOOD = '#5a3a20'
const TICKET_BG = '#f0e0c0'

// Alias so existing local references to Stop / STOPS keep working
type Stop = ContactChannel
const STOPS: Stop[] = CONTACT_CHANNELS

function Nameplate() {
  return (
    <group position={[0, 2.2, -2.22]}>
      {/* Wood frame */}
      <mesh position={[0, 0, -0.04]}>
        <boxGeometry args={[2.2, 0.7, 0.06]} />
        <meshStandardMaterial color={WOOD_FRAME} roughness={0.85} />
      </mesh>

      {/* Main green plate */}
      <mesh>
        <boxGeometry args={[2.0, 0.55, 0.05]} />
        <meshStandardMaterial color={TRAM_GREEN_VINTAGE} roughness={0.8} />
      </mesh>

      {/* Inner darker green */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[1.92, 0.47]} />
        <meshStandardMaterial color={TRAM_GREEN_WEATHERED} roughness={0.8} />
      </mesh>

      {/* Weathering patches */}
      {[
        [-0.6, 0.1],
        [0.5, -0.15],
        [-0.3, -0.18],
        [0.7, 0.18],
      ].map((p, i) => (
        <mesh key={i} position={[p[0], p[1], 0.035]}>
          <circleGeometry args={[0.08, 8]} />
          <meshBasicMaterial color="#1a3a28" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* Tiny tram silhouette */}
      <group position={[0, 0.13, 0.04]}>
        <mesh position={[0, -0.01, 0]}>
          <boxGeometry args={[0.34, 0.04, 0.01]} />
          <meshStandardMaterial color={CREAM_AGED} />
        </mesh>
        <mesh position={[0, 0.04, 0]}>
          <boxGeometry args={[0.32, 0.04, 0.01]} />
          <meshStandardMaterial color={CREAM_AGED} />
        </mesh>
        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[0.008, 0.06, 0.01]} />
          <meshStandardMaterial color={CREAM_AGED} />
        </mesh>
      </group>

      {/* KARMEN YIP */}
      <Text
        position={[0, -0.05, 0.04]}
        fontSize={0.17}
        color={CREAM_AGED}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
        outlineWidth={0.003}
        outlineColor="#1a2818"
      >
        KARMEN YIP
      </Text>

      {/* TERMINUS · END OF LINE */}
      <Text
        position={[0, -0.18, 0.04]}
        fontSize={0.06}
        color={CREAM_AGED}
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
    <group position={[-1.0, 2.65, -2.22]}>
      <mesh position={[0, 0, -0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.01, 24]} />
        <meshStandardMaterial color={TRAM_GREEN_VINTAGE} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.04, 24]} />
        <meshStandardMaterial color={CREAM_AGED} roughness={0.7} />
      </mesh>
      <Text
        position={[0, 0, 0.025]}
        fontSize={0.12}
        color={TRAM_GREEN_VINTAGE}
        anchorX="center"
        anchorY="middle"
      >
        88
      </Text>
    </group>
  )
}

function ContactTicket({ stop, position, isCurrent }: {
  stop: Stop; position: [number, number, number]; isCurrent: boolean
}) {
  const [hovered, setHovered] = useState(false)

  const handleTap = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    if (stop.url) window.open(stop.url, '_blank')
    else (window as unknown as { __showToast?: (msg: string) => void }).__showToast?.('Résumé coming soon')
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
      {/* Ticket body — cream card, pushed well forward */}
      <mesh position={[0, 0, 0.03]}>
        <planeGeometry args={[0.65, 0.6]} />
        <meshStandardMaterial color={TICKET_BG} roughness={0.9} />
      </mesh>

      {/* Colored top stripe */}
      <mesh position={[0, 0.22, 0.032]}>
        <planeGeometry args={[0.65, 0.12]} />
        <meshStandardMaterial color={stop.accentColor} roughness={0.85} />
      </mesh>

      {/* Label — white on the stripe */}
      <Text
        position={[0, 0.05, 0.04]}
        fontSize={0.09}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        letterSpacing={0.05}
      >
        {stop.label}
      </Text>

      {/* Subtitle */}
      <Text
        position={[0, -0.07, 0.04]}
        fontSize={0.05}
        color="#3a2818"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.08}
      >
        {stop.subtitle}
      </Text>

      {/* "VALID" stamp on current stop */}
      {isCurrent && (
        <group position={[0, -0.2, 0.042]} rotation={[0, 0, -0.15]}>
          <mesh>
            <planeGeometry args={[0.28, 0.09]} />
            <meshStandardMaterial color="#a82828" />
          </mesh>
          <Text fontSize={0.04} color="#f0e0c0" anchorX="center" anchorY="middle" position={[0, 0, 0.005]}>
            VALID · 已用
          </Text>
        </group>
      )}

      {/* Brass pin */}
      <mesh position={[0, 0.28, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.01, 8]} />
        <meshStandardMaterial color="#c8a048" metalness={0.7} />
      </mesh>
    </group>
  )
}

function RouteStrip() {
  return (
    <group position={[0, 1.35, -2.22]}>
      {/* Cork-board backing — bigger */}
      <mesh position={[0, 0, -0.005]}>
        <boxGeometry args={[3.2, 1.1, 0.04]} />
        <meshStandardMaterial color={BOARD_WOOD} roughness={0.9} />
      </mesh>

      {/* Wood grain hint */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 0.3 - i * 0.18, 0.001]}>
          <planeGeometry args={[3.15, 0.005]} />
          <meshBasicMaterial color="#3a2010" transparent opacity={0.3} />
        </mesh>
      ))}

      {/* "ROUTE · 路線" label */}
      <Text
        position={[-1.4, 0.35, 0.025]}
        fontSize={0.07}
        color="#e8d8b8"
        anchorX="left"
        anchorY="middle"
        letterSpacing={0.15}
      >
        ROUTE · 路線
      </Text>

      {/* Tickets — bigger spacing */}
      {STOPS.map((stop, i) => (
        <ContactTicket
          key={stop.id}
          stop={stop}
          position={[-1.1 + i * 0.75, -0.05, 0]}
          isCurrent={i === STOPS.length - 1}
        />
      ))}
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
