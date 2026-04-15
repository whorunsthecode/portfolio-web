import { useState } from 'react'
import { Text } from '@react-three/drei'

const CARD_CREAM = '#f4ead4'
const POST_RED = '#c82820'
const STAMP_GREEN = '#2a6a3c'

function generatePostcard() {
  const glCanvas = document.querySelector('canvas')
  if (!glCanvas) return

  // Mobile-optimized portrait dimensions (Instagram story size)
  const W = 1080
  const H = 1920
  const offscreen = document.createElement('canvas')
  offscreen.width = W
  offscreen.height = H
  const ctx = offscreen.getContext('2d')!

  // Cream background
  ctx.fillStyle = CARD_CREAM
  ctx.fillRect(0, 0, W, H)

  // Red decorative border
  ctx.strokeStyle = POST_RED
  ctx.lineWidth = 8
  ctx.strokeRect(30, 30, W - 60, H - 60)

  // Gold inner border
  ctx.strokeStyle = '#c8a048'
  ctx.lineWidth = 2
  ctx.strokeRect(45, 45, W - 90, H - 90)

  // Draw the 3D scene in the upper portion
  const sceneH = 700
  ctx.drawImage(glCanvas, 60, 120, W - 120, sceneH)

  // Decorative line under the scene
  ctx.strokeStyle = POST_RED
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(80, 120 + sceneH + 30)
  ctx.lineTo(W - 80, 120 + sceneH + 30)
  ctx.stroke()

  // Snowflake decorations
  ctx.fillStyle = '#d8c898'
  ctx.font = '40px serif'
  ctx.textAlign = 'center'
  ctx.fillText('❄', 120, 100)
  ctx.fillText('❄', W - 120, 100)
  ctx.fillText('❄', 120, H - 60)
  ctx.fillText('❄', W - 120, H - 60)

  // Main greeting text
  ctx.font = 'italic 52px Georgia, serif'
  ctx.fillStyle = '#2a1a10'
  ctx.textAlign = 'center'
  ctx.fillText("Season's Greetings", W / 2, 120 + sceneH + 100)

  ctx.font = '36px Georgia, serif'
  ctx.fillStyle = '#5a3a20'
  ctx.fillText('from the Xmas Village', W / 2, 120 + sceneH + 155)

  // Decorative divider
  ctx.fillStyle = '#c8a048'
  ctx.fillRect(W / 2 - 60, 120 + sceneH + 180, 120, 2)

  // Date + time
  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  ctx.font = '28px Georgia, serif'
  ctx.fillStyle = '#8a6a4a'
  ctx.fillText(`${dateStr}`, W / 2, 120 + sceneH + 230)
  ctx.fillText(`${timeStr}`, W / 2, 120 + sceneH + 270)

  // Stamp in top-right corner
  ctx.fillStyle = STAMP_GREEN
  ctx.fillRect(W - 180, 55, 120, 90)
  ctx.strokeStyle = CARD_CREAM
  ctx.lineWidth = 2
  ctx.strokeRect(W - 175, 60, 110, 80)
  ctx.font = '16px Georgia, serif'
  ctx.fillStyle = CARD_CREAM
  ctx.fillText('HK POST', W - 120, 95)
  ctx.fillText('聖誕快樂', W - 120, 118)
  ctx.font = '11px Georgia, serif'
  ctx.fillText('$3.70', W - 120, 133)

  // Credit line
  ctx.font = '20px Georgia, serif'
  ctx.fillStyle = '#a89070'
  ctx.fillText('Karmen Yip · karmenyip.com', W / 2, H - 80)

  // Download
  const link = document.createElement('a')
  link.download = `xmas-postcard-${now.getTime()}.png`
  link.href = offscreen.toDataURL('image/png')
  link.click()
}

export function PostcardStation() {
  const [hovered, setHovered] = useState(false)

  return (
    <group
      position={[-1.2, 1.05, -1.3]}
      onClick={(e) => {
        e.stopPropagation()
        generatePostcard()
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
          tap to save your postcard ↓
        </Text>
      </group>
    </group>
  )
}
