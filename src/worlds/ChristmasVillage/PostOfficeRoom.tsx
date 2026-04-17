import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

const WALL_CREAM = '#f4ead4'
const WALL_LOWER = '#5a3a20'
const WOOD_FLOOR = '#b89060'
const WOOD_COUNTER = '#8a5a30'
const WOOD_DARK = '#5a3a20'
const POST_RED = '#c82820'
const BRASS = '#c8a048'
const HOLLY_GREEN = '#2a5a28'

function makeWoodFloorTex(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = WOOD_FLOOR
  ctx.fillRect(0, 0, size, size)
  const plankW = size / 6
  for (let i = 0; i < 6; i++) {
    const x = i * plankW
    ctx.fillStyle = `rgb(${184 + Math.sin(i * 2) * 10}, ${144 + Math.sin(i * 2) * 8}, ${96 + Math.sin(i * 2) * 6})`
    ctx.fillRect(x, 0, plankW, size)
    ctx.fillStyle = '#7a4a28'
    ctx.fillRect(x, 0, 1, size)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 2)
  return tex
}

/** Canvas-textured rug with snowflake pattern */
function makeRugTex(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  // Dark green base
  ctx.fillStyle = '#1a4a28'
  ctx.fillRect(0, 0, size, size)

  // Red border
  ctx.strokeStyle = '#a82020'
  ctx.lineWidth = 20
  ctx.strokeRect(15, 15, size - 30, size - 30)

  // Gold inner border
  ctx.strokeStyle = '#c8a048'
  ctx.lineWidth = 4
  ctx.strokeRect(35, 35, size - 70, size - 70)

  // Snowflake pattern in the center
  const cx = size / 2
  const cy = size / 2
  ctx.strokeStyle = '#d8c898'
  ctx.lineWidth = 3

  // Draw 6-pointed snowflake
  for (let j = 0; j < 3; j++) {
    // Main arms
    for (let a = 0; a < 6; a++) {
      const angle = (a / 6) * Math.PI * 2
      const len = 80 + j * 30
      const ex = cx + Math.cos(angle) * len
      const ey = cy + Math.sin(angle) * len
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(ex, ey)
      ctx.stroke()

      // Branches on each arm
      if (j === 0) {
        for (let b = 1; b <= 2; b++) {
          const bx = cx + Math.cos(angle) * len * b * 0.4
          const by = cy + Math.sin(angle) * len * b * 0.4
          const bLen = 20
          ctx.beginPath()
          ctx.moveTo(bx, by)
          ctx.lineTo(bx + Math.cos(angle + 0.5) * bLen, by + Math.sin(angle + 0.5) * bLen)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(bx, by)
          ctx.lineTo(bx + Math.cos(angle - 0.5) * bLen, by + Math.sin(angle - 0.5) * bLen)
          ctx.stroke()
        }
      }
    }
  }

  // Center circle
  ctx.fillStyle = '#c8a048'
  ctx.beginPath()
  ctx.arc(cx, cy, 12, 0, Math.PI * 2)
  ctx.fill()

  // Corner diamonds
  const corners = [[50, 50], [size - 50, 50], [50, size - 50], [size - 50, size - 50]]
  ctx.fillStyle = '#a82020'
  corners.forEach(([x, y]) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(Math.PI / 4)
    ctx.fillRect(-10, -10, 20, 20)
    ctx.restore()
  })

  const tex = new THREE.CanvasTexture(canvas)
  return tex
}

export function PostOfficeRoom() {
  const floorTex = useMemo(() => makeWoodFloorTex(), [])
  const rugTex = useMemo(() => makeRugTex(), [])

  return (
    <group>
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial map={floorTex} roughness={0.8} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 10]} />
        <meshStandardMaterial color="#f0e4d0" roughness={0.9} />
      </mesh>

      {/* === WALLS — upper cream, lower wainscoting === */}
      {/* Back wall */}
      <mesh position={[0, 2, -5]}>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color={WALL_CREAM} roughness={0.85} side={2} />
      </mesh>
      {/* Back wall wainscoting */}
      <mesh position={[0, 0.6, -4.97]}>
        <boxGeometry args={[10, 1.2, 0.04]} />
        <meshStandardMaterial color={WALL_LOWER} roughness={0.8} />
      </mesh>
      {/* Wainscoting rail */}
      <mesh position={[0, 1.22, -4.96]}>
        <boxGeometry args={[10, 0.04, 0.06]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
      </mesh>

      {/* Left wall */}
      <mesh position={[-5, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color={WALL_CREAM} roughness={0.85} side={2} />
      </mesh>
      <mesh position={[-4.97, 0.6, 0]}>
        <boxGeometry args={[0.04, 1.2, 10]} />
        <meshStandardMaterial color={WALL_LOWER} roughness={0.8} />
      </mesh>
      <mesh position={[-4.96, 1.22, 0]}>
        <boxGeometry args={[0.06, 0.04, 10]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
      </mesh>

      {/* Right wall */}
      <mesh position={[5, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color={WALL_CREAM} roughness={0.85} side={2} />
      </mesh>
      <mesh position={[4.97, 0.6, 0]}>
        <boxGeometry args={[0.04, 1.2, 10]} />
        <meshStandardMaterial color={WALL_LOWER} roughness={0.8} />
      </mesh>
      <mesh position={[4.96, 1.22, 0]}>
        <boxGeometry args={[0.06, 0.04, 10]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
      </mesh>

      {/* Front wall */}
      <mesh position={[0, 2, 5]}>
        <planeGeometry args={[10, 4]} />
        <meshStandardMaterial color={WALL_CREAM} roughness={0.85} side={2} />
      </mesh>

      {/* === COUNTER === */}
      <mesh position={[0, 0.5, -1.5]}>
        <boxGeometry args={[4, 1.0, 1.2]} />
        <meshStandardMaterial color={WOOD_COUNTER} roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.02, -1.5]}>
        <boxGeometry args={[4.1, 0.04, 1.3]} />
        <meshStandardMaterial color="#a87040" roughness={0.7} />
      </mesh>
      {/* Counter front panel detail */}
      {[-1.2, 0, 1.2].map((x, i) => (
        <mesh key={i} position={[x, 0.5, -0.88]}>
          <boxGeometry args={[0.8, 0.7, 0.02]} />
          <meshStandardMaterial color="#7a4a28" roughness={0.8} />
        </mesh>
      ))}

      {/* === "MERRY POST" SIGN with wreath above === */}
      <group position={[0, 3.2, -4.93]}>
        <mesh>
          <boxGeometry args={[3.5, 0.6, 0.04]} />
          <meshStandardMaterial color={POST_RED} roughness={0.7} />
        </mesh>
        {/* Gold border on sign */}
        <mesh position={[0, 0, 0.025]}>
          <planeGeometry args={[3.4, 0.5]} />
          <meshStandardMaterial color="#b82020" roughness={0.7} />
        </mesh>
        <Text
          position={[0, 0, 0.03]}
          fontSize={0.22}
          color="#f4ead4"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.12}
        >
          MERRY POST · 聖誕郵局
        </Text>
      </group>

      {/* Wreath above the sign */}
      <group position={[0, 3.7, -4.92]}>
        <mesh>
          <torusGeometry args={[0.22, 0.06, 8, 24]} />
          <meshStandardMaterial color={HOLLY_GREEN} roughness={0.85} />
        </mesh>
        {/* Red bow on wreath */}
        <mesh position={[0, -0.22, 0.05]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshStandardMaterial color={POST_RED} roughness={0.7} />
        </mesh>
        {/* Holly berries */}
        {[[-0.1, 0.2], [0.1, 0.2], [0, 0.24]].map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.05]}>
            <sphereGeometry args={[0.025, 6, 6]} />
            <meshStandardMaterial color={POST_RED} />
          </mesh>
        ))}
      </group>

      {/* === HK POST BOXES with text === */}
      {[-3, -1.5].map((z, i) => (
        <group key={i} position={[-4.5, 0, z]}>
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 1.4, 16]} />
            <meshStandardMaterial color={POST_RED} roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.45, 0]}>
            <sphereGeometry args={[0.3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color={POST_RED} roughness={0.6} />
          </mesh>
          <mesh position={[0.31, 0.9, 0]}>
            <boxGeometry args={[0.02, 0.04, 0.2]} />
            <meshStandardMaterial color="#1a1010" />
          </mesh>
          {/* Label band */}
          <mesh position={[0, 0.5, 0]}>
            <cylinderGeometry args={[0.31, 0.31, 0.08, 16]} />
            <meshStandardMaterial color="#a82020" roughness={0.6} />
          </mesh>
          {/* "HONG KONG POST" text */}
          <Text
            position={[0.32, 0.7, 0]}
            rotation={[0, Math.PI / 2, 0]}
            fontSize={0.04}
            color="#f4ead4"
            anchorX="center"
            anchorY="middle"
          >
            HONG KONG POST
          </Text>
          <Text
            position={[0.32, 0.6, 0]}
            rotation={[0, Math.PI / 2, 0]}
            fontSize={0.035}
            color="#f4ead4"
            anchorX="center"
            anchorY="middle"
          >
            香港郵政
          </Text>
        </group>
      ))}

      {/* === WINDOW — now transparent so you can see the snow (+Santa)
             flying past outside. No more solid black stroke / opaque
             white pane per user feedback. === */}
      <group position={[4.95, 2.2, -1]}>
        {/* Wood window frame — outer sill only, no opaque center panel */}
        {/* Top rail */}
        <mesh position={[0, 1.0, 0]}>
          <boxGeometry args={[0.06, 0.1, 2.1]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
        </mesh>
        {/* Bottom sill */}
        <mesh position={[0, -1.0, 0]}>
          <boxGeometry args={[0.08, 0.12, 2.1]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
        </mesh>
        {/* Left post */}
        <mesh position={[0, 0, -1.0]}>
          <boxGeometry args={[0.06, 2.0, 0.08]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
        </mesh>
        {/* Right post */}
        <mesh position={[0, 0, 1.0]}>
          <boxGeometry args={[0.06, 2.0, 0.08]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
        </mesh>
        {/* Center mullion (thin cross) — horizontal */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.04, 0.04, 1.9]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
        </mesh>
        {/* Center mullion — vertical */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.04, 1.9, 0.04]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
        </mesh>
        {/* The glass — physical-material transparent pane.
             No black stroke, no opaque fill — you see through to the
             world beyond (snow + Santa sleigh). */}
        <mesh rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.9, 1.9]} />
          <meshPhysicalMaterial
            color="#e8f0f8"
            transparent
            opacity={0.12}
            transmission={0.9}
            roughness={0.04}
            thickness={0.02}
            side={2}
          />
        </mesh>
        {/* Curtains — narrower so they don't block the view */}
        <mesh position={[-0.05, 0, -0.95]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.22, 2]} />
          <meshStandardMaterial color={POST_RED} transparent opacity={0.6} roughness={0.9} side={2} />
        </mesh>
        <mesh position={[-0.05, 0, 0.95]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.22, 2]} />
          <meshStandardMaterial color={POST_RED} transparent opacity={0.6} roughness={0.9} side={2} />
        </mesh>
        {/* Curtain rod */}
        <mesh position={[-0.05, 1.05, 0]}>
          <boxGeometry args={[0.01, 0.02, 2.1]} />
          <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* === MAIL SORTING CUBBY behind counter === */}
      <group position={[3, 0, -4.5]}>
        <mesh position={[0, 1.5, 0]}>
          <boxGeometry args={[1.6, 2.5, 0.4]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
        </mesh>
        {/* Cubby slots — 4x3 grid */}
        {Array.from({ length: 12 }).map((_, i) => {
          const col = i % 4
          const row = Math.floor(i / 4)
          return (
            <group key={i}>
              <mesh position={[-0.5 + col * 0.35, 0.6 + row * 0.7, 0.15]}>
                <boxGeometry args={[0.3, 0.55, 0.12]} />
                <meshStandardMaterial color="#4a2a18" roughness={0.8} />
              </mesh>
              {/* Random envelopes in some slots */}
              {Math.sin(i * 3.7) > 0 && (
                <mesh position={[-0.5 + col * 0.35, 0.6 + row * 0.7, 0.22]}>
                  <boxGeometry args={[0.25, 0.15 + Math.sin(i) * 0.05, 0.01]} />
                  <meshStandardMaterial color={i % 3 === 0 ? '#f0e4d0' : '#e8d8c0'} roughness={0.9} />
                </mesh>
              )}
            </group>
          )
        })}
      </group>

      {/* === PARCEL SHELVES with detailed parcels === */}
      {[-1.5, -0.5, 0.5].map((y, i) => (
        <group key={i}>
          <mesh position={[-3, 1.5 + y, -4.9]}>
            <boxGeometry args={[1.8, 0.04, 0.4]} />
            <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
          </mesh>
          {/* Shelf brackets */}
          {[-0.8, 0.8].map((x, j) => (
            <mesh key={j} position={[-3 + x, 1.45 + y, -4.8]}>
              <boxGeometry args={[0.04, 0.12, 0.3]} />
              <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
            </mesh>
          ))}
          {[-0.5, 0, 0.4].map((x, j) => (
            <group key={j} position={[-3 + x, 1.6 + y, -4.8]}>
              {/* Parcel */}
              <mesh>
                <boxGeometry args={[0.28 + Math.sin(j + i) * 0.08, 0.18 + Math.sin(j * 2 + i) * 0.06, 0.22]} />
                <meshStandardMaterial color={j % 2 === 0 ? '#c8a878' : '#a88858'} roughness={0.9} />
              </mesh>
              {/* String cross on parcel */}
              <mesh position={[0, 0.1 + Math.sin(j * 2 + i) * 0.03, 0.12]}>
                <boxGeometry args={[0.25, 0.005, 0.005]} />
                <meshStandardMaterial color="#5a4030" />
              </mesh>
              <mesh position={[0, 0.1 + Math.sin(j * 2 + i) * 0.03, 0.12]}>
                <boxGeometry args={[0.005, 0.005, 0.2]} />
                <meshStandardMaterial color="#5a4030" />
              </mesh>
              {/* Address label */}
              <mesh position={[0, 0.1 + Math.sin(j * 2 + i) * 0.03, 0.125]}>
                <planeGeometry args={[0.08, 0.05]} />
                <meshStandardMaterial color="#f0e4d0" />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* === STAMPS DISPLAY === */}
      <group position={[-4.93, 2.5, 1]}>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.2, 0.9, 0.04]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.7} />
        </mesh>
        {Array.from({ length: 12 }).map((_, i) => {
          const col = i % 4
          const row = Math.floor(i / 4)
          const colors = ['#c82820', '#2a6a3c', '#2a4868', '#c8a048', '#8a4878', '#d88030',
            '#3a8848', '#a82828', '#4a6898', '#d8a850', '#6a3858', '#e88840']
          return (
            <mesh key={i} position={[0.03, 0.25 - row * 0.25, -0.35 + col * 0.22]} rotation={[0, Math.PI / 2, 0]}>
              <planeGeometry args={[0.18, 0.2]} />
              <meshStandardMaterial color={colors[i]} roughness={0.8} />
            </mesh>
          )
        })}
        {/* Frame label */}
        <Text
          position={[0.04, -0.38, 0]}
          rotation={[0, Math.PI / 2, 0]}
          fontSize={0.04}
          color="#5a3a20"
          anchorX="center"
          anchorY="middle"
        >
          STAMPS · 郵票
        </Text>
      </group>

      {/* === SNOWFLAKE RUG === */}
      <mesh position={[0, 0.005, 0.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3, 2.5]} />
        <meshStandardMaterial map={rugTex} roughness={0.95} />
      </mesh>

      {/* === COUNTER CLUTTER === */}
      {/* Brass bell */}
      <group position={[1.2, 1.06, -1.3]}>
        <mesh>
          <sphereGeometry args={[0.06, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.06, 0]}>
          <sphereGeometry args={[0.015, 8, 8]} />
          <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      {/* Ink well */}
      <mesh position={[1.6, 1.06, -1.6]}>
        <cylinderGeometry args={[0.04, 0.05, 0.06, 12]} />
        <meshStandardMaterial color="#1a1a18" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* Quill pen */}
      <mesh position={[1.7, 1.08, -1.5]} rotation={[0, 0.5, 0.3]}>
        <cylinderGeometry args={[0.004, 0.004, 0.25, 4]} />
        <meshStandardMaterial color="#f0e4d0" roughness={0.8} />
      </mesh>

      {/* Stack of envelopes */}
      {[0, 0.01, 0.02, 0.03].map((y, i) => (
        <mesh key={i} position={[1.5, 1.06 + y, -1.2]} rotation={[0, 0.08 * i, 0]}>
          <boxGeometry args={[0.32, 0.008, 0.2]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#f0e4d0' : '#e8d8c0'} roughness={0.9} />
        </mesh>
      ))}

      {/* Stamp pad */}
      <mesh position={[-1.5, 1.06, -1.6]}>
        <boxGeometry args={[0.2, 0.04, 0.15]} />
        <meshStandardMaterial color="#1a1a18" roughness={0.7} />
      </mesh>
      {/* Wax seal stamp */}
      <mesh position={[-1.3, 1.06, -1.7]}>
        <cylinderGeometry args={[0.025, 0.025, 0.08, 8]} />
        <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-1.3, 1.1, -1.7]}>
        <sphereGeometry args={[0.03, 8, 8]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.8} />
      </mesh>

      {/* Red ribbon spool */}
      <mesh position={[-1.6, 1.08, -1.2]} rotation={[Math.PI / 2, 0, 0.3]}>
        <torusGeometry args={[0.08, 0.03, 8, 16]} />
        <meshStandardMaterial color={POST_RED} roughness={0.8} />
      </mesh>

      {/* Small desk lamp */}
      <group position={[-1.8, 1.05, -1.8]}>
        <mesh position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.06, 0.07, 0.03, 12]} />
          <meshStandardMaterial color={BRASS} metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.22, 6]} />
          <meshStandardMaterial color={BRASS} metalness={0.5} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.28, 0]}>
          <coneGeometry args={[0.1, 0.12, 12, 1, true]} />
          <meshStandardMaterial color="#2a5a28" roughness={0.7} side={2} />
        </mesh>
        <pointLight position={[0, 0.25, 0]} color="#ffe8c0" intensity={0.8} distance={2} decay={2} />
      </group>

      {/* === STRING LIGHTS along top of walls === */}
      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2
        const r = 4.7
        const x = Math.cos(angle) * r
        const z = Math.sin(angle) * r
        const bulbColors = ['#ff4040', '#40ff40', '#ffdd40', '#4080ff', '#ff40ff']
        return (
          <mesh key={i} position={[x, 3.6, z]}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshBasicMaterial color={bulbColors[i % 5]} />
          </mesh>
        )
      })}

      {/* === BUNTING FLAGS === */}
      {[-1.5, 1.5].map((x, gi) => (
        <group key={gi}>
          {/* String */}
          <mesh position={[x, 3.3, 0]}>
            <boxGeometry args={[0.003, 0.003, 8]} />
            <meshStandardMaterial color="#5a4030" />
          </mesh>
          {Array.from({ length: 10 }).map((_, j) => {
            const z = -3.5 + j * 0.8
            const flagColors = ['#c82820', '#2a6a3c', '#c8a048', '#f4ead4']
            return (
              <mesh key={j} position={[x, 3.15 + Math.sin(j * 0.7) * 0.05, z]} rotation={[0.1, 0, 0]}>
                <coneGeometry args={[0.08, 0.15, 3]} />
                <meshStandardMaterial color={flagColors[j % 4]} roughness={0.9} side={2} />
              </mesh>
            )
          })}
        </group>
      ))}

      {/* === SMALL CHRISTMAS TREE === */}
      <group position={[3.8, 0, 3.5]}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.08, 0.12, 0.3, 8]} />
          <meshStandardMaterial color="#5a3a20" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0.6, 0]}>
          <coneGeometry args={[0.5, 0.8, 8]} />
          <meshStandardMaterial color="#1a5a28" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.1, 0]}>
          <coneGeometry args={[0.35, 0.6, 8]} />
          <meshStandardMaterial color="#1a6a2c" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.5, 0]}>
          <coneGeometry args={[0.2, 0.4, 8]} />
          <meshStandardMaterial color="#1a7a30" roughness={0.8} />
        </mesh>
        {/* Star */}
        <mesh position={[0, 1.75, 0]}>
          <sphereGeometry args={[0.06, 8, 8]} />
          <meshBasicMaterial color="#ffd040" />
        </mesh>
        <pointLight position={[0, 1.75, 0]} color="#ffd040" intensity={0.5} distance={2} decay={2} />
        {/* Baubles on tree */}
        {[
          [0.3, 0.7, 0.2, '#c82820'],
          [-0.25, 0.8, -0.15, '#c8a048'],
          [0.15, 1.1, 0.2, '#2a6a3c'],
          [-0.15, 1.3, -0.1, '#c82820'],
          [0.1, 1.0, -0.25, '#4080ff'],
        ].map(([x, y, z, c], i) => (
          <mesh key={i} position={[x as number, y as number, z as number]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshStandardMaterial color={c as string} metalness={0.5} roughness={0.3} />
          </mesh>
        ))}
      </group>

      {/* === WELCOME MAT at entrance === */}
      <group position={[0, 0.006, 4.5]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.5, 0.8]} />
          <meshStandardMaterial color="#3a2818" roughness={0.95} />
        </mesh>
        <Text
          position={[0, 0.005, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.1}
          color="#c8a048"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.15}
        >
          WELCOME · 歡迎
        </Text>
      </group>

      {/* === CLOCK showing Dec 25 === */}
      <group position={[4.93, 3, 2]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.3, 0.04, 24]} />
          <meshStandardMaterial color="#fafaf4" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <ringGeometry args={[0.28, 0.3, 24]} />
          <meshStandardMaterial color={WOOD_DARK} />
        </mesh>
        {[0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((angle, i) => (
          <mesh key={i} position={[Math.cos(angle) * 0.22, Math.sin(angle) * 0.22, 0.03]}>
            <boxGeometry args={[0.02, 0.02, 0.005]} />
            <meshStandardMaterial color="#2a1a10" />
          </mesh>
        ))}
        {/* Hour hand pointing to 12 */}
        <mesh position={[0, 0.06, 0.035]}>
          <boxGeometry args={[0.015, 0.12, 0.003]} />
          <meshStandardMaterial color="#2a1a10" />
        </mesh>
        {/* Minute hand pointing to 5 (25 min) */}
        <mesh position={[0.07, -0.05, 0.04]} rotation={[0, 0, -Math.PI / 3]}>
          <boxGeometry args={[0.012, 0.18, 0.003]} />
          <meshStandardMaterial color="#2a1a10" />
        </mesh>
      </group>

      {/* === PENDANT LIGHTS === */}
      {[-1.5, 1.5].map((x, i) => (
        <group key={i} position={[x, 3.2, -1]}>
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.8, 4]} />
            <meshStandardMaterial color="#2a2420" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial color="#c8a468" roughness={0.9} side={2} transparent opacity={0.85} />
          </mesh>
          <mesh position={[0, -0.05, 0]}>
            <sphereGeometry args={[0.04, 8, 8]} />
            <meshBasicMaterial color="#fff0d0" />
          </mesh>
          <pointLight position={[0, -0.1, 0]} color="#ffe8c0" intensity={2} distance={5} decay={2} />
        </group>
      ))}

      {/* === HOLLY SPRIGS on shelves === */}
      {[-3.6, -2.4].map((x, i) => (
        <group key={i} position={[x, 2.55, -4.85]}>
          {/* Leaves */}
          <mesh position={[-0.04, 0, 0]} rotation={[0, 0, 0.3]}>
            <coneGeometry args={[0.02, 0.08, 3]} />
            <meshStandardMaterial color={HOLLY_GREEN} />
          </mesh>
          <mesh position={[0.04, 0, 0]} rotation={[0, 0, -0.3]}>
            <coneGeometry args={[0.02, 0.08, 3]} />
            <meshStandardMaterial color={HOLLY_GREEN} />
          </mesh>
          {/* Berries */}
          <mesh position={[0, 0.01, 0.02]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshStandardMaterial color={POST_RED} />
          </mesh>
          <mesh position={[0.02, -0.01, 0.02]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshStandardMaterial color={POST_RED} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
