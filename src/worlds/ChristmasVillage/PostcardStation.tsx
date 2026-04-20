/**
 * PostcardStation — 3D prop inside the Xmas Village world. Tapping it used
 * to draw a canvas postcard and download it immediately; now it just opens
 * the HTML <GreetingCard> overlay so the user can preview the card before
 * saving. All the rendering lives in src/ui/GreetingCard.tsx.
 */

import { useState } from 'react'
import { Html, Text } from '@react-three/drei'
import { useStore } from '../../store'
import { TapHint } from '../../scene/components/TapHint'

const CARD_CREAM = '#f4ead4'
const POST_RED = '#c82820'
const STAMP_GREEN = '#2a6a3c'

export function PostcardStation() {
  const [hovered, setHovered] = useState(false)
  const setShowGreetingCard = useStore((s) => s.setShowGreetingCard)
  const showGreetingCard = useStore((s) => s.showGreetingCard)

  return (
    <group
      position={[-1.2, 1.05, -1.3]}
      onClick={(e) => {
        e.stopPropagation()
        setShowGreetingCard(true)
      }}
      onPointerOver={() => {
        setHovered(true)
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => {
        setHovered(false)
        document.body.style.cursor = 'auto'
      }}
    >
      <group rotation={[-0.3, 0.15, 0]} scale={hovered ? [1.05, 1.05, 1.05] : [1, 1, 1]}>
        {/* Card body */}
        <mesh>
          <boxGeometry args={[0.6, 0.4, 0.01]} />
          <meshStandardMaterial color={CARD_CREAM} roughness={0.85} />
        </mesh>
        {/* Red border */}
        <mesh position={[0, 0, -0.002]}>
          <boxGeometry args={[0.64, 0.44, 0.005]} />
          <meshStandardMaterial color={POST_RED} roughness={0.8} />
        </mesh>
        {/* Festive illustration area */}
        <mesh position={[0, 0.05, 0.006]}>
          <planeGeometry args={[0.52, 0.25]} />
          <meshStandardMaterial color="#2a5a38" roughness={0.8} />
        </mesh>
        {/* Snowflake decorations on the card */}
        <Text position={[-0.2, 0.05, 0.008]} fontSize={0.06} color="#d8c898" anchorX="center" anchorY="middle">
          ❄
        </Text>
        <Text position={[0.2, 0.05, 0.008]} fontSize={0.06} color="#d8c898" anchorX="center" anchorY="middle">
          ❄
        </Text>
        <Text
          position={[0, 0.05, 0.008]}
          fontSize={0.035}
          color={CARD_CREAM}
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.1}
        >
          SEASON'S GREETINGS
        </Text>
        {/* Stamp corner */}
        <mesh position={[0.22, 0.14, 0.006]}>
          <planeGeometry args={[0.1, 0.08]} />
          <meshStandardMaterial color={STAMP_GREEN} />
        </mesh>
        <Text position={[0.22, 0.14, 0.008]} fontSize={0.015} color={CARD_CREAM} anchorX="center" anchorY="middle">
          HK
        </Text>
        {/* Call to action */}
        <Text
          position={[0, -0.14, 0.006]}
          fontSize={0.025}
          color="#5a3a20"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.05}
        >
          tap to open your postcard ↓
        </Text>
      </group>

      {/* Persistent attention chip — unlike the touch-only TapHint
          (which dismisses after first pointerdown), this one is always
          visible on both desktop and mobile until the user actually
          taps the card and opens the greeting overlay. The TapHint
          below still plays for the first-visit touch emphasis. */}
      {!showGreetingCard && (
        <Html position={[0, 0.42, 0]} center sprite style={{ pointerEvents: 'none' }}>
          <style>{`
            @keyframes postcardPromptBob {
              0%, 100% { transform: translateY(0);   box-shadow: 0 6px 18px rgba(200,40,32,0.35), 0 0 0 2px rgba(255,230,176,0.4); }
              50%      { transform: translateY(-4px); box-shadow: 0 10px 24px rgba(200,40,32,0.55), 0 0 0 4px rgba(255,230,176,0.55); }
            }
          `}</style>
          <div
            style={{
              padding: '8px 14px',
              background: 'linear-gradient(180deg, #e8394a 0%, #b81818 100%)',
              color: '#fff8e8',
              borderRadius: 16,
              fontFamily: '"Playfair Display", Georgia, serif',
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.03em',
              whiteSpace: 'nowrap',
              animation: 'postcardPromptBob 1.6s ease-in-out infinite',
              textShadow: '0 1px 2px rgba(0,0,0,0.35)',
              border: '1px solid rgba(255,230,176,0.6)',
            }}
          >
            ✉ Tap to download your postcard
          </div>
        </Html>
      )}

      <TapHint
        label="Tap the card to download · 下載賀卡"
        storageKey="xmas-postcard"
        offset={[0, 0.55, 0]}
        dismissWhen={showGreetingCard}
      />
    </group>
  )
}
