import { useMemo } from 'react'
import * as THREE from 'three'
import { Text } from '@react-three/drei'

// Mister Softee (富豪雪糕) ice cream truck — a HK street-corner icon.
// Red cab + white service box with a red droplet pattern + blue roof
// signboard. Oriented with local +X as the front of the truck and
// local +Z as its service-window side, so a rotation of -π/2 around Y
// in the parent places the truck facing down the road with its service
// window toward the sidewalk.

function makeDropPatternTexture(): THREE.CanvasTexture {
  const W = 1024
  const H = 384
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Cream-white base
  ctx.fillStyle = '#f0ece0'
  ctx.fillRect(0, 0, W, H)

  // Draw a scattered field of red droplet/comma shapes
  const drawDrop = (cx: number, cy: number, r: number, rot: number, color: string) => {
    ctx.save()
    ctx.translate(cx, cy)
    ctx.rotate(rot)
    ctx.fillStyle = color
    ctx.beginPath()
    // Teardrop: point at top, belly at bottom
    ctx.moveTo(0, -r)
    ctx.bezierCurveTo(r * 0.9, -r * 0.3,  r * 0.8,  r * 0.9, 0, r)
    ctx.bezierCurveTo(-r * 0.8, r * 0.9, -r * 0.9, -r * 0.3, 0, -r)
    ctx.fill()
    ctx.restore()
  }

  // Deterministic-ish distribution
  let seed = 0.5
  const rng = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }

  const rows = 6
  const cols = 14
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const offX = (r % 2) * 36
      const x = c * 72 + offX + 20
      const y = r * 64 + 20
      const radius = 20 + rng() * 10
      const rot = rng() * Math.PI * 2
      const useBlue = rng() < 0.18
      drawDrop(x, y, radius, rot, useBlue ? '#2a5ea2' : '#c42828')
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  return tex
}

function Wheels() {
  const positions: [number, number, number][] = [
    [ 1.4, 0.32,  0.85],
    [ 1.4, 0.32, -0.85],
    [-1.6, 0.32,  0.85],
    [-1.6, 0.32, -0.85],
  ]
  return (
    <>
      {positions.map((p, i) => (
        <group key={i} position={p}>
          {/* Tyre — cylinder axis along Z (perpendicular to travel) */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.22, 16]} />
            <meshStandardMaterial color={'#141210'} roughness={0.85} />
          </mesh>
          {/* Hub */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.14, 0.14, 0.24, 12]} />
            <meshStandardMaterial color={'#8a8480'} metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function Cab() {
  // The cab sits at the +X end. Red-and-white split body, dark
  // windshield, small grille + headlights.
  return (
    <group position={[1.55, 1.05, 0]}>
      {/* Lower cab body — red */}
      <mesh position={[0, -0.35, 0]}>
        <boxGeometry args={[1.5, 0.9, 1.75]} />
        <meshStandardMaterial color={'#c42828'} roughness={0.55} />
      </mesh>
      {/* Upper cab — slightly inset white greenhouse with windows */}
      <mesh position={[-0.08, 0.35, 0]}>
        <boxGeometry args={[1.2, 0.7, 1.7]} />
        <meshStandardMaterial color={'#f0ece0'} roughness={0.6} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0.46, 0.3, 0]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.08, 0.58, 1.5]} />
        <meshStandardMaterial
          color={'#1a2028'} metalness={0.6} roughness={0.25}
          emissive={'#14181e'} emissiveIntensity={0.2}
        />
      </mesh>
      {/* Side windows (driver + passenger) */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[-0.1, 0.35, s * 0.86]}>
          <boxGeometry args={[1.05, 0.5, 0.04]} />
          <meshStandardMaterial color={'#1a2028'} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      {/* Grille */}
      <mesh position={[0.76, -0.5, 0]}>
        <boxGeometry args={[0.06, 0.22, 1.3]} />
        <meshStandardMaterial color={'#1a1410'} roughness={0.7} />
      </mesh>
      {/* Headlights */}
      {[0.7, -0.7].map((z, i) => (
        <mesh key={i} position={[0.78, -0.24, z]}>
          <sphereGeometry args={[0.09, 10, 8]} />
          <meshStandardMaterial color={'#f8e8a8'} emissive={'#f8d868'} emissiveIntensity={0.6} />
        </mesh>
      ))}
      {/* Circular Mister Softee logo on the door */}
      <mesh position={[-0.1, -0.15, 0.88]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.13, 20]} />
        <meshStandardMaterial color={'#f0ece0'} roughness={0.6} />
      </mesh>
      <Text
        position={[-0.1, -0.15, 0.89]}
        rotation={[0, Math.PI / 2, 0]}
        fontSize={0.06}
        color={'#c42828'}
        anchorX="center" anchorY="middle"
      >
        富豪
      </Text>
    </group>
  )
}

function Chassis() {
  // Dark frame connecting the wheels to the body — without this the
  // body reads as "floating" above the ground since the wheels end at
  // y=0.64 but the body only starts at y=0.9.
  return (
    <group>
      {/* Main chassis rail under the whole length */}
      <mesh position={[-0.5, 0.48, 0]}>
        <boxGeometry args={[3.6, 0.24, 1.6]} />
        <meshStandardMaterial color={'#1a1410'} roughness={0.85} />
      </mesh>
      {/* Side skirts — narrower dark strips between wheels */}
      {[1, -1].map((s) => (
        <mesh key={s} position={[-0.5, 0.65, s * 0.82]}>
          <boxGeometry args={[3.4, 0.1, 0.04]} />
          <meshStandardMaterial color={'#2a1a14'} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function Body({ sideTex }: { sideTex: THREE.CanvasTexture }) {
  // The service box occupies -X of the cab. White walls with red-drop
  // pattern on the sides; serving window cut out on +Z side.
  const L = 3.0  // along X
  const W = 1.8  // along Z
  const H = 2.0  // along Y
  const cxX = -0.7   // centre of body in X
  return (
    <group position={[cxX, 1.0 + H / 2 - 0.1, 0]}>
      {/* Front wall (facing the cab) — white, no pattern */}
      <mesh position={[L / 2, 0, 0]}>
        <boxGeometry args={[0.04, H, W]} />
        <meshStandardMaterial color={'#f0ece0'} roughness={0.6} />
      </mesh>
      {/* Back wall */}
      <mesh position={[-L / 2, 0, 0]}>
        <boxGeometry args={[0.04, H, W]} />
        <meshStandardMaterial color={'#f0ece0'} roughness={0.6} />
      </mesh>
      {/* Side at -Z (road side) — patterned. DoubleSide so the panel
          is visible from either direction (otherwise the truck looked
          hollow when viewed from the road). */}
      <mesh position={[0, 0, -W / 2]} rotation={[0, 0, 0]}>
        <planeGeometry args={[L, H]} />
        <meshStandardMaterial map={sideTex} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      {/* Side at +Z (service side) — patterned below, service window
          carved out in the middle. We split the side wall into four
          strips around a 1.4m × 0.6m opening. */}
      {(() => {
        const winW = 1.4
        const winH = 0.6
        const winYTop = 0.3
        const winYBot = winYTop - winH
        const segs = [
          // Left strip
          { x: (-L / 2 + (-winW / 2)) / 2, w: L / 2 - winW / 2, y: 0, h: H },
          // Right strip
          { x: (winW / 2 + L / 2) / 2, w: L / 2 - winW / 2, y: 0, h: H },
          // Above window
          { x: 0, w: winW, y: (winYTop + H / 2) / 2, h: H / 2 - winYTop },
          // Below window
          { x: 0, w: winW, y: (-H / 2 + winYBot) / 2, h: winYBot + H / 2 },
        ]
        return segs.map((s, i) => (
          <mesh key={i} position={[s.x, s.y, W / 2]}>
            <planeGeometry args={[s.w, s.h]} />
            <meshStandardMaterial map={sideTex} roughness={0.6} side={THREE.DoubleSide} />
          </mesh>
        ))
      })()}
      {/* Window frame around the opening */}
      <mesh position={[0, -0.02, W / 2 + 0.005]}>
        <planeGeometry args={[1.44, 0.64]} />
        <meshStandardMaterial color={'#1a1410'} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      {/* Inside of window — dark with a warm counter light */}
      <mesh position={[0, -0.02, W / 2 - 0.02]}>
        <planeGeometry args={[1.4, 0.6]} />
        <meshStandardMaterial
          color={'#3a2820'}
          emissive={'#f0c068'}
          emissiveIntensity={0.35}
          roughness={0.8}
        />
      </mesh>
      {/* Counter ledge */}
      <mesh position={[0, -0.35, W / 2 + 0.12]}>
        <boxGeometry args={[1.44, 0.05, 0.28]} />
        <meshStandardMaterial color={'#e8e0d2'} roughness={0.7} />
      </mesh>
      {/* A soft-serve cone perched on the counter */}
      <group position={[0.3, -0.18, W / 2 + 0.15]}>
        <mesh>
          <coneGeometry args={[0.07, 0.22, 12]} />
          <meshStandardMaterial color={'#d0a060'} roughness={0.7} />
        </mesh>
        {/* Swirled ice cream top */}
        <mesh position={[0, 0.22, 0]}>
          <sphereGeometry args={[0.1, 12, 10]} />
          <meshStandardMaterial color={'#f4e4c8'} roughness={0.6} />
        </mesh>
      </group>
      {/* Roof */}
      <mesh position={[0, H / 2, 0]}>
        <boxGeometry args={[L, 0.04, W]} />
        <meshStandardMaterial color={'#e4dccc'} roughness={0.7} />
      </mesh>
      {/* Top-of-body red stripe under the roof sign */}
      <mesh position={[0, H / 2 - 0.12, W / 2 + 0.001]}>
        <planeGeometry args={[L - 0.1, 0.2]} />
        <meshStandardMaterial color={'#c42828'} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, H / 2 - 0.12, -W / 2 - 0.001]}>
        <planeGeometry args={[L - 0.1, 0.2]} />
        <meshStandardMaterial color={'#c42828'} roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function RoofSign() {
  // Signature blue signboard on top of the truck, taller and wider than
  // the body so it reads from across the street. "富豪雪糕" in white.
  const L = 2.6
  const W = 1.5
  const signH = 0.55
  const yTop = 3.15
  return (
    <group position={[-0.6, yTop, 0]}>
      <mesh>
        <boxGeometry args={[L, signH, W]} />
        <meshStandardMaterial color={'#1e4c8a'} roughness={0.6} />
      </mesh>
      {/* Red band on top edge */}
      <mesh position={[0, signH / 2 + 0.005, 0]}>
        <boxGeometry args={[L + 0.04, 0.06, W + 0.04]} />
        <meshStandardMaterial color={'#c42828'} roughness={0.6} />
      </mesh>
      {/* Chinese text on both long sides */}
      {[1, -1].map((s) => (
        <Text
          key={s}
          position={[0, 0, s * (W / 2 + 0.003)]}
          rotation={[0, s === 1 ? 0 : Math.PI, 0]}
          fontSize={0.34}
          color={'#f4ecd0'}
          anchorX="center" anchorY="middle"
          letterSpacing={0.04}
        >
          富豪雪糕
        </Text>
      ))}
      {/* English on the short ends */}
      {[1, -1].map((s) => (
        <Text
          key={s}
          position={[s * (L / 2 + 0.003), 0, 0]}
          rotation={[0, s === 1 ? Math.PI / 2 : -Math.PI / 2, 0]}
          fontSize={0.18}
          color={'#f4ecd0'}
          anchorX="center" anchorY="middle"
        >
          Mister Softee
        </Text>
      ))}
    </group>
  )
}

function Bumpers() {
  return (
    <>
      {/* Front bumper */}
      <mesh position={[2.35, 0.35, 0]}>
        <boxGeometry args={[0.12, 0.18, 1.9]} />
        <meshStandardMaterial color={'#1a1410'} roughness={0.7} />
      </mesh>
      {/* Rear bumper */}
      <mesh position={[-2.3, 0.35, 0]}>
        <boxGeometry args={[0.1, 0.18, 1.9]} />
        <meshStandardMaterial color={'#1a1410'} roughness={0.7} />
      </mesh>
    </>
  )
}

export function MisterSoftee() {
  const sideTex = useMemo(() => makeDropPatternTexture(), [])
  return (
    <group>
      <Wheels />
      <Chassis />
      <Cab />
      <Body sideTex={sideTex} />
      <RoofSign />
      <Bumpers />
    </group>
  )
}
