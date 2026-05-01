import { useMemo } from 'react'
import * as THREE from 'three'

// Hand-painted tin plates for unlicensed dentists — the most iconic sign
// type in the Walled City. Red or yellow backgrounds, white block-painted
// Chinese, English underneath, a crude red cross, phone numbers. Rusted
// edges. Some flat-mounted, some hanging perpendicular from a bracket.

type SignShape = 'flat' | 'hanging'

interface Sign {
  side: 'left' | 'right'
  z: number
  y: number
  w: number        // world units
  h: number
  shape: SignShape
  bg: string       // canvas fill
  ink: string      // text colour
  chinese: string
  english: string
  phone?: string
  cross?: boolean
  segmentCenterX?: number  // 0 entrance segment, -2 deep segment
}

const SIGNS: Sign[] = [
  // Entrance segment — original signs
  { side: 'left',  z: -4.3, y: 2.3, w: 0.55, h: 0.78, shape: 'flat',    bg: '#b02020', ink: '#f4ecd0', chinese: '牙科', english: 'DENTIST',   phone: '2690 3752', cross: true },
  { side: 'right', z: -3.4, y: 1.95, w: 0.48, h: 0.64, shape: 'hanging', bg: '#a02020', ink: '#f8f0d8', chinese: '無痛脫牙', english: 'PAINLESS' },
  { side: 'right', z:  0.05, y: 2.2, w: 0.5,  h: 0.7,  shape: 'flat',    bg: '#d8b030', ink: '#601818', chinese: '專科牙醫', english: 'SPECIALIST', phone: '9230 1459' },
  { side: 'left',  z:  3.1, y: 2.0, w: 0.4,  h: 0.55, shape: 'hanging', bg: '#981818', ink: '#f0e4c4', chinese: '拔牙', english: 'EXTRACT', cross: true },
  // Entrance extension — between Sundry and the dogleg
  { side: 'right', z: -10.5, y: 2.1, w: 0.5, h: 0.68, shape: 'hanging', bg: '#b81818', ink: '#f4e8c0', chinese: '陳牙科', english: 'CHAN DENTIST', phone: '2374 9120', cross: true },
  // Deep segment (axis x=-2)
  { side: 'left',  z: -19, y: 2.2, w: 0.55, h: 0.75, shape: 'flat',    bg: '#c83020', ink: '#f8f0e0', chinese: '吳齒科', english: 'NG DENTAL',  phone: '2841 6630', segmentCenterX: -2 },
  { side: 'right', z: -26, y: 2.0, w: 0.46, h: 0.62, shape: 'hanging', bg: '#609080', ink: '#f4ecc8', chinese: '黃牙醫', english: 'WONG TEETH', cross: true, segmentCenterX: -2 },
]

function makeSignTexture(sign: Sign, pxPerM = 512): THREE.CanvasTexture {
  const W = Math.round(sign.w * pxPerM)
  const H = Math.round(sign.h * pxPerM)
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Base paint — slightly non-uniform
  ctx.fillStyle = sign.bg
  ctx.fillRect(0, 0, W, H)
  // Paint unevenness — darker patches
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * W
    const y = Math.random() * H
    const r = 10 + Math.random() * 60
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
    grad.addColorStop(0, 'rgba(0,0,0,0.18)')
    grad.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Red cross icon — top-left, hand-painted feel
  if (sign.cross) {
    ctx.fillStyle = sign.ink
    const cx = W * 0.15
    const cy = H * 0.18
    const arm = Math.min(W, H) * 0.08
    ctx.fillRect(cx - arm, cy - arm * 0.25, arm * 2, arm * 0.5)
    ctx.fillRect(cx - arm * 0.25, cy - arm, arm * 0.5, arm * 2)
  }

  // Chinese characters — big, bold, centred. macOS has Heiti/Noto CJK.
  ctx.fillStyle = sign.ink
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const chSize = H * 0.32
  ctx.font = `900 ${chSize}px "PingFang TC", "Heiti TC", "Noto Sans CJK TC", sans-serif`
  ctx.fillText(sign.chinese, W / 2, H * 0.42)

  // English underneath — smaller, stencil-ish
  const enSize = H * 0.13
  ctx.font = `700 ${enSize}px "Arial Narrow", "Helvetica", sans-serif`
  ctx.fillText(sign.english, W / 2, H * 0.68)

  // Phone number — bottom
  if (sign.phone) {
    const phSize = H * 0.1
    ctx.font = `700 ${phSize}px "Arial Narrow", sans-serif`
    ctx.fillText(sign.phone, W / 2, H * 0.86)
  }

  // Rust + grime edges
  for (let i = 0; i < 25; i++) {
    const edge = Math.random() < 0.5 ? 0 : 1
    const along = Math.random()
    const x = Math.random() < 0.5 ? edge * W : along * W
    const y = Math.random() < 0.5 ? along * H : edge * H
    const r = 8 + Math.random() * 30
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
    grad.addColorStop(0, 'rgba(90, 40, 20, 0.55)')
    grad.addColorStop(1, 'rgba(90, 40, 20, 0)')
    ctx.fillStyle = grad
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // Paint flakes — bright nicks showing metal underneath
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = 'rgba(140, 130, 110, 0.5)'
    ctx.fillRect(Math.random() * W, Math.random() * H, 2 + Math.random() * 4, 2 + Math.random() * 3)
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  return tex
}

// Sign construction uses a plane for the painted face and a box behind it
// for depth + edges. Never rely on a box's six-face texture since some
// faces flip the UV and read as 科牙 instead of 牙科.

function FlatSign({ sign }: { sign: Sign }) {
  const tex = useMemo(() => makeSignTexture(sign), [sign])
  const segCenter = sign.segmentCenterX ?? 0
  const wallX = segCenter + (sign.side === 'left' ? -0.87 : 0.87)
  const faceY = sign.side === 'left' ? Math.PI / 2 : -Math.PI / 2
  return (
    <group position={[wallX, sign.y, sign.z]} rotation={[0, faceY, 0]}>
      {/* Painted face — single plane on the outward +Z side */}
      <mesh position={[0, 0, 0.009]}>
        <planeGeometry args={[sign.w, sign.h]} />
        <meshStandardMaterial map={tex} roughness={0.82} />
      </mesh>
      {/* Structural plate — dark metal box, no sign texture */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[sign.w, sign.h, 0.015]} />
        <meshStandardMaterial color={'#2a1810'} roughness={0.9} />
      </mesh>
      {/* Back bevel — slightly oversized shadow plate behind */}
      <mesh position={[0, 0, -0.011]}>
        <boxGeometry args={[sign.w + 0.01, sign.h + 0.01, 0.003]} />
        <meshStandardMaterial color={'#1a0c08'} roughness={0.95} />
      </mesh>
      {/* Mounting bolts — corners of the painted face */}
      {[
        [-sign.w / 2 + 0.02,  sign.h / 2 - 0.02],
        [ sign.w / 2 - 0.02,  sign.h / 2 - 0.02],
        [-sign.w / 2 + 0.02, -sign.h / 2 + 0.02],
        [ sign.w / 2 - 0.02, -sign.h / 2 + 0.02],
      ].map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.012]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.012, 0.012, 0.004, 8]} />
          <meshStandardMaterial color={'#4a3a28'} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

function HangingSign({ sign }: { sign: Sign }) {
  const tex = useMemo(() => makeSignTexture(sign), [sign])
  const segCenter = sign.segmentCenterX ?? 0
  const wallX = segCenter + (sign.side === 'left' ? -0.87 : 0.87)
  const outward = sign.side === 'left' ? 1 : -1
  // The sign protrudes ~0.25m from the wall on a bracket, and its broad
  // face points DOWN the alley (±Z) so walkers approaching read it
  // normally. Group origin sits at the wall; the sign itself is offset
  // outward by the bracket length so the whole plate is in open air.
  const armLen = 0.25
  const signCenterX = outward * (armLen + sign.w / 2)
  return (
    <group position={[wallX, sign.y, sign.z]}>
      {/* Bracket arm — wall to sign */}
      <mesh position={[outward * armLen / 2, sign.h / 2 + 0.03, 0]}>
        <boxGeometry args={[armLen, 0.02, 0.02]} />
        <meshStandardMaterial color={'#3a2a1a'} metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Two short rods connecting bracket to sign top corners */}
      <mesh position={[signCenterX - outward * sign.w / 2 + outward * 0.04, sign.h / 2 + 0.015, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.04, 4]} />
        <meshStandardMaterial color={'#1a1410'} />
      </mesh>
      <mesh position={[signCenterX + outward * sign.w / 2 - outward * 0.04, sign.h / 2 + 0.015, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.04, 4]} />
        <meshStandardMaterial color={'#1a1410'} />
      </mesh>
      {/* Sign subgroup — centered out at the end of the bracket. Inside
          this subgroup the sign spans X (width), Y (height), Z (thin),
          with face normals along ±Z — i.e. pointing down the alley. */}
      <group position={[signCenterX, 0, 0]}>
        {/* Structural plate — dark metal, no sign texture */}
        <mesh>
          <boxGeometry args={[sign.w, sign.h, 0.008]} />
          <meshStandardMaterial color={'#2a1810'} roughness={0.9} />
        </mesh>
        {/* +Z face — plane with canvas texture, no rotation needed */}
        <mesh position={[0, 0, 0.005]}>
          <planeGeometry args={[sign.w, sign.h]} />
          <meshStandardMaterial map={tex} roughness={0.82} />
        </mesh>
        {/* -Z face — rotated 180° around Y so the texture reads
            left-to-right from the other side instead of mirroring */}
        <mesh position={[0, 0, -0.005]} rotation={[0, Math.PI, 0]}>
          <planeGeometry args={[sign.w, sign.h]} />
          <meshStandardMaterial map={tex} roughness={0.82} />
        </mesh>
      </group>
    </group>
  )
}

export function DentistSigns() {
  return (
    <>
      {SIGNS.map((s, i) =>
        s.shape === 'flat' ? <FlatSign key={i} sign={s} /> : <HangingSign key={i} sign={s} />
      )}
    </>
  )
}
