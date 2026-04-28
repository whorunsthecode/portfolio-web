import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshReflectorMaterial } from '@react-three/drei'
import * as THREE from 'three'

// Walled City barber shop — modelled after the Greg Girard photo (City of
// Darkness, 1993). Tiny single-room unit carved out of the corridor,
// 2 chairs squeezed in side-by-side, low ceiling, single warm bulb on a
// cord, mirror with a counter underneath strewn with spray bottles and
// mugs, layered posters / hairstyle clippings on the side wall, hanging
// towels, wall-mounted AC, and a plastic-strip curtain doorway.
//
// Tonal target: warm refuge inside the cool/green KWC corridor, lived-in
// and humble — NOT cyberpunk-wet or horror-empty. The mundane reality.
//
// Local coordinates (parent group is the WalledCity world at world x=100):
//   x ∈ [0.9, 2.9]   2m deep INTO the room from alley wall
//   z ∈ [-2.5, 0.0]  2.5m wide along the alley
//   y ∈ [0, 2.2]     ceiling (LOW — KWC interiors were under 2.4m)
//   Door at x=0.9, z=-0.4, 0.8m wide (z=-0.8 to 0) — at the Z_MAX corner

const X_NEAR = 0.9
const X_FAR  = 2.9
const Z_MIN  = -2.5
const Z_MAX  = 0.0
const Y_TOP  = 2.2
const DOOR_Z_CENTRE = -0.4
const DOOR_HALFW = 0.4

// 2 barber chairs side-by-side, packed close together. Cramped feel.
const CHAIR_X = 2.0
const CHAIR_ZS = [-1.4, -2.1]

// ── Material palette ──────────────────────────────────────
const TILE_GREEN = '#5e8068'
const TILE_GROUT = '#3a4a3e'
const HAIR = '#1a1410'
const CHROME = '#c0c0bc'
const CHROME_DARK = '#6a6a66'
const RED_LEATHER = '#a82828'
const RED_LEATHER_DARK = '#6a1818'
const WHITE_CERAMIC = '#e8e0d0'
const SINK_STAIN = '#a89060'
const RUST = '#7a4a2a'
const BULB_GLOW = '#ffd8a0'
const WOOD_DARK = '#3a2418'
const WOOD = '#6a4a30'
const POSTER_PAPER = '#e8d8b8'
const WALL_CREAM = '#a89368'

// ── Floor texture: green vinyl tiles 10×10cm with hair scatter ──
function makeSalonFloorTex(): THREE.CanvasTexture {
  const W = 1024
  const H = 1024
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Tile grid — the room is 2m × 2.5m so ~20 × 25 tiles
  const tilesX = 20
  const tilesZ = 25
  const tileW = W / tilesX
  const tileH = H / tilesZ
  for (let i = 0; i < tilesX; i++) {
    for (let j = 0; j < tilesZ; j++) {
      const variance = (Math.random() - 0.5) * 14
      ctx.fillStyle = `rgb(${94 + variance}, ${128 + variance * 0.7}, ${104 + variance})`
      ctx.fillRect(i * tileW, j * tileH, tileW, tileH)
    }
  }
  ctx.strokeStyle = TILE_GROUT
  ctx.lineWidth = 1.5
  for (let i = 0; i <= tilesX; i++) {
    ctx.beginPath(); ctx.moveTo(i * tileW, 0); ctx.lineTo(i * tileW, H); ctx.stroke()
  }
  for (let j = 0; j <= tilesZ; j++) {
    ctx.beginPath(); ctx.moveTo(0, j * tileH); ctx.lineTo(W, j * tileH); ctx.stroke()
  }
  // Walked path — darker stripe along the route from door (top-left in
  // texture space, mapping to z=Z_MAX, x=X_NEAR) toward the chair row
  // (centre-bottom). Compressed dirt builds up in foot-traffic lines.
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(W * 0.10, H * 0.10)
  ctx.lineTo(W * 0.45, H * 0.40)
  ctx.lineTo(W * 0.55, H * 0.55)
  ctx.strokeStyle = 'rgba(45,55,48,0.35)'
  ctx.lineWidth = 90
  ctx.lineCap = 'round'
  ctx.stroke()
  ctx.restore()

  // Chipped/missing tiles — randomly pick ~12 tiles and inset a
  // small lighter rectangle showing the substrate beneath
  for (let n = 0; n < 12; n++) {
    const tx = Math.floor(Math.random() * tilesX) * tileW
    const ty = Math.floor(Math.random() * tilesZ) * tileH
    const inset = 6 + Math.random() * 10
    ctx.fillStyle = `rgb(${82 + Math.random() * 12}, ${72 + Math.random() * 10}, ${64 + Math.random() * 10})`
    ctx.fillRect(
      tx + inset,
      ty + inset,
      tileW - inset * 2,
      tileH - inset * 2,
    )
  }

  // Darker grout — paint over the existing grout lines with a deeper
  // mossy tone where dirt has built up
  ctx.strokeStyle = 'rgba(28,36,30,0.55)'
  ctx.lineWidth = 1.8
  for (let i = 0; i <= tilesX; i++) {
    ctx.beginPath(); ctx.moveTo(i * tileW, 0); ctx.lineTo(i * tileW, H); ctx.stroke()
  }
  for (let j = 0; j <= tilesZ; j++) {
    ctx.beginPath(); ctx.moveTo(0, j * tileH); ctx.lineTo(W, j * tileH); ctx.stroke()
  }

  // Hair scatter — densest around chair centres
  const chairSpots = [{ x: W * 0.55, y: H * 0.4 }, { x: W * 0.55, y: H * 0.7 }]
  for (let i = 0; i < 2200; i++) {
    const spot = chairSpots[Math.floor(Math.random() * chairSpots.length)]
    const dist = Math.pow(Math.random(), 1.4) * 240
    const angle = Math.random() * Math.PI * 2
    const x = spot.x + Math.cos(angle) * dist
    const y = spot.y + Math.sin(angle) * dist
    if (x < 0 || x > W || y < 0 || y > H) continue
    ctx.strokeStyle = Math.random() < 0.85
      ? `rgba(${20 + Math.random() * 14}, ${16 + Math.random() * 12}, ${14 + Math.random() * 10}, ${0.7 + Math.random() * 0.3})`
      : `rgba(${180 + Math.random() * 40}, ${175 + Math.random() * 40}, ${165 + Math.random() * 40}, 0.55)`
    ctx.lineWidth = 0.6 + Math.random() * 1.2
    const ang = Math.random() * Math.PI
    const len = 4 + Math.random() * 16
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len)
    ctx.stroke()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping
  return tex
}

// ── Wall texture: painted plaster, faded cream — no more particle-board
//    speckle. A few large concentrated stains rather than uniform noise. ──
function makeSalonWallTex(): THREE.CanvasTexture {
  const W = 512
  const H = 512
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!

  // Flat painted-plaster base
  ctx.fillStyle = WALL_CREAM
  ctx.fillRect(0, 0, W, H)

  // Smoke darkening near the top — tobacco / cooking residue
  const smoke = ctx.createLinearGradient(0, 0, 0, H * 0.5)
  smoke.addColorStop(0, 'rgba(50,38,22,0.45)')
  smoke.addColorStop(1, 'rgba(50,38,22,0)')
  ctx.fillStyle = smoke
  ctx.fillRect(0, 0, W, H * 0.5)

  // Damp ground-up creep — yellow-grey along the bottom 12% (water wicking)
  const damp = ctx.createLinearGradient(0, H * 0.88, 0, H)
  damp.addColorStop(0, 'rgba(80,72,58,0)')
  damp.addColorStop(1, 'rgba(80,72,58,0.35)')
  ctx.fillStyle = damp
  ctx.fillRect(0, H * 0.88, W, H * 0.12)

  // ~5 large concentrated water stains — soft radial blobs, not speckle
  for (let i = 0; i < 5; i++) {
    const cx = Math.random() * W
    const cy = H * (0.1 + Math.random() * 0.6)
    const r = 60 + Math.random() * 90
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r)
    g.addColorStop(0, 'rgba(70,52,34,0.35)')
    g.addColorStop(0.6, 'rgba(70,52,34,0.15)')
    g.addColorStop(1, 'rgba(70,52,34,0)')
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(cx, cy, r, 0, Math.PI * 2)
    ctx.fill()
  }

  // 4 vertical drip streaks below stains — narrow concentrated lines
  for (let i = 0; i < 4; i++) {
    const x = Math.random() * W
    const top = H * (0.2 + Math.random() * 0.3)
    const drip = ctx.createLinearGradient(x, top, x, H * 0.95)
    drip.addColorStop(0, 'rgba(60,40,22,0.65)')
    drip.addColorStop(1, 'rgba(60,40,22,0)')
    ctx.fillStyle = drip
    ctx.fillRect(x - 2, top, 4, H * 0.95 - top)
  }

  // A handful of chipped-paint patches — small irregular shapes showing
  // a darker primer/concrete layer beneath
  for (let i = 0; i < 18; i++) {
    const cx = Math.random() * W
    const cy = Math.random() * H
    const w = 4 + Math.random() * 14
    const h = 3 + Math.random() * 10
    ctx.fillStyle = `rgba(${50 + Math.random() * 18}, ${42 + Math.random() * 14}, ${30 + Math.random() * 10}, 0.6)`
    ctx.beginPath()
    ctx.ellipse(cx, cy, w, h, Math.random() * Math.PI, 0, Math.PI * 2)
    ctx.fill()
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

// ── Mirror desilver overlay — TRANSPARENT centre, with black-bloom
//    desilver patches concentrated only at the edges (where moisture
//    actually corrodes the silvering on real aged mirrors). The clear
//    centre lets the underlying real reflection show through. ──
function makeMirrorTex(): THREE.CanvasTexture {
  const W = 512
  const H = 384
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  // Fully transparent base — centre stays clear
  ctx.clearRect(0, 0, W, H)

  // Edge-concentrated desilver blooms. Bias positions toward the four
  // edges and corners (top edge, bottom edge, left edge, right edge).
  const drawBloom = (x: number, y: number, r: number, opacity: number) => {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(12,10,8,${opacity})`)
    g.addColorStop(0.6, `rgba(12,10,8,${opacity * 0.4})`)
    g.addColorStop(1, 'rgba(12,10,8,0)')
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill()
  }
  // Top edge
  for (let i = 0; i < 6; i++) {
    drawBloom(Math.random() * W, Math.random() * H * 0.12, 14 + Math.random() * 26, 0.7 + Math.random() * 0.25)
  }
  // Bottom edge
  for (let i = 0; i < 6; i++) {
    drawBloom(Math.random() * W, H - Math.random() * H * 0.12, 14 + Math.random() * 26, 0.7 + Math.random() * 0.25)
  }
  // Left edge
  for (let i = 0; i < 5; i++) {
    drawBloom(Math.random() * W * 0.10, Math.random() * H, 12 + Math.random() * 22, 0.65 + Math.random() * 0.25)
  }
  // Right edge
  for (let i = 0; i < 5; i++) {
    drawBloom(W - Math.random() * W * 0.10, Math.random() * H, 12 + Math.random() * 22, 0.65 + Math.random() * 0.25)
  }
  // 2-3 isolated interior spots — small, subtle, NOT in the centre
  for (let i = 0; i < 3; i++) {
    const sideEdge = Math.random() < 0.5 ? Math.random() * 0.25 : 0.75 + Math.random() * 0.25
    drawBloom(sideEdge * W, Math.random() * H, 6 + Math.random() * 10, 0.5)
  }

  const tex = new THREE.CanvasTexture(canvas)
  return tex
}

// ── Hairstyle clipping: small portrait of an 80s celebrity hairstyle.
//    Layered messily on the side wall above the mirror. Reference: the
//    Girard photo's grid of small pinned-up clippings. ──
function makeClippingTex(seed: number): THREE.CanvasTexture {
  const W = 96
  const H = 128
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = POSTER_PAPER
  ctx.fillRect(0, 0, W, H)
  // Background tone (magazine page)
  const bg = ['#dac8a4', '#e0d2b4', '#cfbe98', '#d4c2a0'][seed % 4]
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)
  // Skin oval
  ctx.fillStyle = '#d8b888'
  ctx.beginPath()
  ctx.ellipse(W / 2, H * 0.55, W * 0.28, H * 0.30, 0, 0, Math.PI * 2)
  ctx.fill()
  // Hair shape varies with seed
  ctx.fillStyle = '#1a1410'
  if (seed % 5 === 0) {
    // Pompadour/coiff
    ctx.beginPath()
    ctx.ellipse(W / 2, H * 0.36, W * 0.4, H * 0.22, 0, 0, Math.PI, true)
    ctx.fill()
  } else if (seed % 5 === 1) {
    // Mullet
    ctx.fillRect(W * 0.18, H * 0.4, W * 0.64, H * 0.35)
  } else if (seed % 5 === 2) {
    // Long perm
    ctx.beginPath()
    ctx.ellipse(W / 2, H * 0.5, W * 0.4, H * 0.45, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = bg
    ctx.beginPath()
    ctx.ellipse(W / 2, H * 0.6, W * 0.22, H * 0.2, 0, 0, Math.PI * 2)
    ctx.fill()
  } else if (seed % 5 === 3) {
    // Curls (ladies)
    ctx.beginPath()
    ctx.arc(W / 2, H * 0.4, W * 0.35, 0, Math.PI, true)
    ctx.fill()
  } else {
    // Bowl cut
    ctx.fillRect(W * 0.22, H * 0.3, W * 0.56, H * 0.28)
  }
  // Magazine number + faded color tint
  const ageGrad = ctx.createLinearGradient(0, 0, 0, H)
  ageGrad.addColorStop(0, 'rgba(180,90,45,0.18)')
  ageGrad.addColorStop(1, 'rgba(180,90,45,0.04)')
  ctx.fillStyle = ageGrad
  ctx.fillRect(0, 0, W, H)
  // Foxing spots
  for (let i = 0; i < 6; i++) {
    ctx.fillStyle = `rgba(${130 + Math.random() * 40}, ${88 + Math.random() * 30}, ${56 + Math.random() * 20}, ${0.22 + Math.random() * 0.3})`
    ctx.beginPath()
    ctx.arc(Math.random() * W, Math.random() * H, 2 + Math.random() * 5, 0, Math.PI * 2)
    ctx.fill()
  }
  return new THREE.CanvasTexture(canvas)
}

// ── Barber chair (parameterised) — same as before, slimmed slightly to
//    match the cramped scale. Customer faces +X (toward mirror). ──
function BarberChair({
  pos, seatRot = 0, hairPile = 0.18,
}: {
  pos: [number, number, number]
  seatRot?: number
  hairPile?: number
}) {
  return (
    // +π/2 around Y so chair-local +Z (footrest / customer's facing
    // direction) maps to world +X — customer looks AT the mirror.
    <group position={pos} rotation={[0, Math.PI / 2 + seatRot, 0]}>
      <mesh position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.28, 0.30, 0.15, 18]} />
        <meshStandardMaterial color={CHROME_DARK} metalness={0.7} roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.018, 0]}>
        <cylinderGeometry args={[0.30, 0.32, 0.03, 18]} />
        <meshStandardMaterial color={RUST} metalness={0.4} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.06, 0.07, 0.34, 12]} />
        <meshStandardMaterial color={CHROME} metalness={0.8} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.46, 0.12, 0.46]} />
        <meshStandardMaterial color={RED_LEATHER} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.61, 0]}>
        <boxGeometry args={[0.48, 0.02, 0.48]} />
        <meshStandardMaterial color={RED_LEATHER_DARK} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.9, -0.20]}>
        <boxGeometry args={[0.46, 0.6, 0.12]} />
        <meshStandardMaterial color={RED_LEATHER} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.9, -0.26]}>
        <boxGeometry args={[0.48, 0.62, 0.02]} />
        <meshStandardMaterial color={RED_LEATHER_DARK} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.27, -0.20]}>
        <boxGeometry args={[0.26, 0.1, 0.16]} />
        <meshStandardMaterial color={RED_LEATHER_DARK} roughness={0.6} />
      </mesh>
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.25, 0.7, 0]}>
            <boxGeometry args={[0.04, 0.04, 0.4]} />
            <meshStandardMaterial color={CHROME} metalness={0.75} roughness={0.35} />
          </mesh>
          <mesh position={[side * 0.25, 0.74, 0]}>
            <boxGeometry args={[0.06, 0.025, 0.34]} />
            <meshStandardMaterial color={RED_LEATHER_DARK} roughness={0.55} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.32, 0.30]}>
        <boxGeometry args={[0.42, 0.025, 0.04]} />
        <meshStandardMaterial color={CHROME} metalness={0.75} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.005, 0.34]}>
        <coneGeometry args={[hairPile, 0.012, 14]} />
        <meshStandardMaterial color={HAIR} roughness={0.95} />
      </mesh>
    </group>
  )
}

function BarberChairs() {
  const variations = [
    { rot:  0.05, pile: 0.18 },
    { rot: -0.04, pile: 0.14 },
  ]
  return (
    <group>
      {CHAIR_ZS.map((z, i) => (
        <BarberChair
          key={i}
          pos={[CHAIR_X, 0, z]}
          seatRot={variations[i].rot}
          hairPile={variations[i].pile}
        />
      ))}
    </group>
  )
}

// ── Real reflective mirror via drei's MeshReflectorMaterial — renders an
//    actual planar reflection of the scene each frame. Aged via the
//    blur/mixBlur params + a separate edge-only desilver overlay (the
//    canvas texture is now used ONLY at the corners, not over the whole
//    surface, so the centre stays clear like a real aged mirror). ──
function Mirror() {
  const desilverTex = useMemo(() => makeMirrorTex(), [])
  const x = X_FAR - 0.005
  const cz = (CHAIR_ZS[0] + CHAIR_ZS[CHAIR_ZS.length - 1]) / 2
  const cy = 1.4
  const mirrorW = 1.6
  const mirrorH = 0.8
  return (
    <group rotation={[0, -Math.PI / 2, 0]} position={[x, 0, 0]}>
      {/* Thin dark wooden frame */}
      <mesh position={[cz, cy, 0]}>
        <boxGeometry args={[mirrorW + 0.06, mirrorH + 0.06, 0.025]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.85} />
      </mesh>
      {/* Mirror glass — real reflection */}
      <mesh position={[cz, cy, 0.014]}>
        <planeGeometry args={[mirrorW, mirrorH]} />
        <MeshReflectorMaterial
          color={'#bcb8b0'}
          resolution={512}
          blur={[120, 60]}
          mixBlur={1.4}
          mixStrength={1.0}
          mirror={0.85}
          roughness={0.25}
          metalness={0.2}
          depthScale={0.6}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
        />
      </mesh>
      {/* Edge-only desilver overlay — transparent except at corners, where
          the canvas painting concentrates the black blooms. The centre
          80% of the mirror stays clear. */}
      <mesh position={[cz, cy, 0.0145]}>
        <planeGeometry args={[mirrorW, mirrorH]} />
        <meshBasicMaterial
          map={desilverTex}
          transparent
          opacity={0.55}
          depthWrite={false}
        />
      </mesh>
      {/* Black gaffer-tape patches along the bottom corners */}
      <mesh position={[cz - mirrorW / 2 + 0.06, cy - mirrorH / 2 + 0.04, 0.018]}>
        <planeGeometry args={[0.1, 0.06]} />
        <meshStandardMaterial color={'#1a1410'} roughness={0.9} />
      </mesh>
      <mesh position={[cz + mirrorW / 2 - 0.08, cy - mirrorH / 2 + 0.04, 0.018]}>
        <planeGeometry args={[0.13, 0.05]} />
        <meshStandardMaterial color={'#1a1410'} roughness={0.9} />
      </mesh>
    </group>
  )
}

// ── Vanity counter beneath mirror — wood top, open shelf, props on top ──
function VanityCounter() {
  const cx = X_FAR - 0.18
  const cz = (CHAIR_ZS[0] + CHAIR_ZS[CHAIR_ZS.length - 1]) / 2
  const counterY = 0.9
  const counterW = 1.7
  return (
    <group position={[cx, 0, cz]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Counter top — runs along world z (chair row) at world x=cx */}
      <mesh position={[0, counterY, 0]}>
        <boxGeometry args={[counterW, 0.05, 0.32]} />
        <meshStandardMaterial color={WOOD} roughness={0.85} />
      </mesh>
      {/* Open shelf below — supported by two short stub legs at the back
          (against the wall) so the counter no longer reads as a freestanding
          piece of furniture flanked by tall vertical wood strips. */}
      <mesh position={[0, counterY - 0.22, -0.02]}>
        <boxGeometry args={[counterW - 0.04, 0.03, 0.28]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
      </mesh>
      {/* Two short stub legs — only at the front-of-counter corners,
          floor to shelf level. Reads as a wall-mounted shelf-counter
          rather than a freestanding piece. */}
      {[-counterW / 2 + 0.06, counterW / 2 - 0.06].map((dx, i) => (
        <mesh key={i} position={[dx, (counterY - 0.22) / 2, 0.13]}>
          <boxGeometry args={[0.025, counterY - 0.22, 0.025]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
        </mesh>
      ))}
      {/* Folded towels stacked on shelf. Three stacks of 2-3 towels each,
          slightly tilted and varied in colour/size. Each towel has a
          darker hem-stripe so it reads as a folded textile rather than a
          plain coloured block. Muted KWC palette — pale blue, cream,
          faded yellow. */}
      {[
        // Stack 1 (left) — three towels stacked, slight lean
        { x: -0.6, dy: 0,    w: 0.22, h: 0.045, d: 0.20, rot:  0.04, c: '#c8d4d8', stripe: '#7a909a' },
        { x: -0.6, dy: 0.045, w: 0.21, h: 0.04, d: 0.19, rot: -0.02, c: '#e0d4b4', stripe: '#9a8a64' },
        { x: -0.6, dy: 0.08, w: 0.20, h: 0.035, d: 0.18, rot:  0.06, c: '#bdb8a4', stripe: '#7a7460' },
        // Stack 2 (centre) — two towels
        { x: -0.18, dy: 0,    w: 0.21, h: 0.05, d: 0.20, rot: -0.05, c: '#d4c0a0', stripe: '#a08868' },
        { x: -0.18, dy: 0.05, w: 0.20, h: 0.04, d: 0.19, rot:  0.03, c: '#b8c4c0', stripe: '#5a7068' },
        // Stack 3 (right) — three towels
        { x: 0.28, dy: 0,    w: 0.22, h: 0.04, d: 0.20, rot:  0.02, c: '#dcd0b4', stripe: '#9a8c64' },
        { x: 0.28, dy: 0.04, w: 0.21, h: 0.045, d: 0.19, rot: -0.07, c: '#bcb8a4', stripe: '#6a6450' },
        { x: 0.28, dy: 0.085, w: 0.20, h: 0.035, d: 0.18, rot:  0.04, c: '#c4cdc4', stripe: '#6a7868' },
      ].map((t, i) => (
        <group key={i} position={[t.x, counterY - 0.22 + t.h / 2 + t.dy, -0.02]} rotation={[0, t.rot, 0]}>
          {/* Towel body */}
          <mesh>
            <boxGeometry args={[t.w, t.h, t.d]} />
            <meshStandardMaterial color={t.c} roughness={0.95} />
          </mesh>
          {/* Hem stripe — narrow band along the front face, suggesting
              the folded edge of the towel */}
          <mesh position={[0, 0, t.d / 2 + 0.001]}>
            <planeGeometry args={[t.w * 0.96, 0.012]} />
            <meshStandardMaterial color={t.stripe} roughness={0.95} />
          </mesh>
        </group>
      ))}
      {/* Spray bottles on counter — green plastic */}
      {[-0.65, -0.4].map((dx, i) => (
        <group key={i} position={[dx, counterY + 0.13, 0]}>
          <mesh>
            <cylinderGeometry args={[0.04, 0.05, 0.18, 12]} />
            <meshStandardMaterial color={'#5a8a4a'} roughness={0.5} />
          </mesh>
          {/* Trigger sprayer head */}
          <mesh position={[0, 0.13, 0.03]}>
            <boxGeometry args={[0.06, 0.05, 0.08]} />
            <meshStandardMaterial color={'#1a2418'} roughness={0.7} />
          </mesh>
        </group>
      ))}
      {/* Yellow ceramic mug holding combs */}
      <group position={[-0.12, counterY + 0.07, -0.02]}>
        <mesh>
          <cylinderGeometry args={[0.045, 0.05, 0.1, 14]} />
          <meshStandardMaterial color={'#e0c044'} roughness={0.6} />
        </mesh>
        <mesh position={[0.018, 0.075, 0]}>
          <boxGeometry args={[0.005, 0.08, 0.012]} />
          <meshStandardMaterial color={'#1a1410'} />
        </mesh>
        <mesh position={[-0.018, 0.075, 0.005]}>
          <boxGeometry args={[0.005, 0.07, 0.012]} />
          <meshStandardMaterial color={'#1a1410'} />
        </mesh>
      </group>
      {/* Aerosol can — blue spray */}
      <mesh position={[0.15, counterY + 0.10, 0]}>
        <cylinderGeometry args={[0.028, 0.028, 0.18, 14]} />
        <meshStandardMaterial color={'#3a78b8'} roughness={0.55} metalness={0.25} />
      </mesh>
      {/* Round brush — barrel brush lying flat */}
      <mesh position={[0.4, counterY + 0.025, -0.04]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.16, 10]} />
        <meshStandardMaterial color={'#c8a878'} roughness={0.85} />
      </mesh>
      {/* Stack of papers/magazines */}
      <mesh position={[0.7, counterY + 0.02, -0.04]}>
        <boxGeometry args={[0.16, 0.025, 0.22]} />
        <meshStandardMaterial color={'#dcd0a8'} roughness={0.9} />
      </mesh>
    </group>
  )
}

// ── Layered hairstyle clippings on the side wall (Z_MIN), pinned high
//    above the mirror counter. ~16 small portrait cutouts, slightly
//    overlapping, each rotated a few degrees. ──
function PosterCollage() {
  const COUNT = 16
  const clippings = useMemo(() => Array.from({ length: COUNT }, (_, i) => ({
    tex: makeClippingTex(i),
    // Layout: 4 wide × 4 tall grid above the mirror, with jitter
    col: i % 4,
    row: Math.floor(i / 4),
    rot: (Math.random() - 0.5) * 0.2,
    jx: (Math.random() - 0.5) * 0.04,
    jy: (Math.random() - 0.5) * 0.03,
    scale: 0.95 + Math.random() * 0.1,
  })), [])

  return (
    <group position={[0, 0, Z_MIN + 0.005]}>
      {clippings.map((c, i) => {
        const startX = X_NEAR + 0.4
        const cellW = 0.22
        const cellH = 0.20
        const startY = 1.6
        const x = startX + c.col * cellW + c.jx
        const y = startY + c.row * cellH + c.jy
        return (
          <group key={i} position={[x, y, 0.005]}>
            {/* Paper backing — slightly off-axis so layers show */}
            <mesh rotation={[0, 0, c.rot]}>
              <planeGeometry args={[0.18 * c.scale, 0.22 * c.scale]} />
              <meshStandardMaterial color={POSTER_PAPER} roughness={0.95} />
            </mesh>
            {/* Image */}
            <mesh position={[0, 0, 0.001]} rotation={[0, 0, c.rot]}>
              <planeGeometry args={[0.16 * c.scale, 0.20 * c.scale]} />
              <meshStandardMaterial map={c.tex} roughness={0.9} />
            </mesh>
            {/* Pin head — red */}
            <mesh position={[0, 0.09 * c.scale, 0.003]}>
              <sphereGeometry args={[0.006, 6, 5]} />
              <meshStandardMaterial color={'#c82020'} roughness={0.5} />
            </mesh>
          </group>
        )
      })}

      {/* Small calendar — rectangle of paper top-left */}
      <group position={[X_NEAR + 0.18, 1.7, 0.005]} rotation={[0, 0, -0.04]}>
        <mesh>
          <planeGeometry args={[0.2, 0.28]} />
          <meshStandardMaterial color={'#f0e4c0'} roughness={0.95} />
        </mesh>
        {/* Red banner top */}
        <mesh position={[0, 0.10, 0.001]}>
          <planeGeometry args={[0.2, 0.06]} />
          <meshStandardMaterial color={'#c82820'} roughness={0.85} />
        </mesh>
        {/* Faux text rows (black bands) */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0, 0.04 - i * 0.035, 0.001]}>
            <planeGeometry args={[0.16, 0.008]} />
            <meshStandardMaterial color={'#1a1410'} roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Small shrine on the floor in the corner — red plastic frame
          with gold offering paper and two oranges */}
      <group position={[X_NEAR + 0.25, 0.05, 0.05]}>
        {/* Red plastic base */}
        <mesh position={[0, 0.025, 0]}>
          <boxGeometry args={[0.32, 0.05, 0.18]} />
          <meshStandardMaterial color={'#a82828'} roughness={0.55} />
        </mesh>
        {/* Gold backing paper */}
        <mesh position={[0, 0.13, -0.04]}>
          <planeGeometry args={[0.28, 0.16]} />
          <meshStandardMaterial color={'#c8a048'} roughness={0.7} metalness={0.3} />
        </mesh>
        {/* Tiny incense holder */}
        <mesh position={[0, 0.06, 0.04]}>
          <cylinderGeometry args={[0.02, 0.025, 0.015, 12]} />
          <meshStandardMaterial color={'#3a2820'} roughness={0.85} />
        </mesh>
        {/* Two oranges */}
        {[-0.06, 0.06].map((dx, i) => (
          <mesh key={i} position={[dx, 0.085, 0.05]}>
            <sphereGeometry args={[0.028, 10, 8]} />
            <meshStandardMaterial color={'#dc8030'} roughness={0.85} />
          </mesh>
        ))}
        {/* Tiny lit red bulb (electric god lamp) */}
        <mesh position={[-0.12, 0.10, -0.03]}>
          <sphereGeometry args={[0.012, 8, 6]} />
          <meshStandardMaterial color={'#ff4040'} emissive={'#ff4040'} emissiveIntensity={1.4} />
        </mesh>
      </group>
    </group>
  )
}

// ── Ceiling infrastructure: pipes + cable conduit running across the low
//    ceiling, exposed and stapled to the wall, with a junction box knot. ──
function CeilingInfra() {
  return (
    <group>
      {/* Galvanised pipe along the long axis — runs across z */}
      <mesh position={[X_NEAR + 0.5, Y_TOP - 0.06, (Z_MIN + Z_MAX) / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.04, 0.04, Z_MAX - Z_MIN - 0.1, 10]} />
        <meshStandardMaterial color={'#7a4a2a'} metalness={0.4} roughness={0.85} />
      </mesh>
      {/* Cloth-tape patch where it leaks — beige wrap around the pipe */}
      <mesh position={[X_NEAR + 0.5, Y_TOP - 0.06, -1.1]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.052, 0.052, 0.08, 10]} />
        <meshStandardMaterial color={'#c8b48a'} roughness={0.95} />
      </mesh>
      {/* PVC drain pipe — runs along x */}
      <mesh position={[(X_NEAR + X_FAR) / 2, Y_TOP - 0.08, Z_MIN + 0.5]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, X_FAR - X_NEAR - 0.2, 10]} />
        <meshStandardMaterial color={'#cdc6b4'} roughness={0.9} />
      </mesh>

      {/* Dark electrical conduit — short run with junction box */}
      <group position={[X_NEAR + 0.3, Y_TOP - 0.04, Z_MAX - 0.6]}>
        {/* Conduit run going to junction */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.6, 8]} />
          <meshStandardMaterial color={'#2a2520'} roughness={0.85} />
        </mesh>
        {/* Junction box */}
        <mesh position={[0.32, 0, 0]}>
          <boxGeometry args={[0.1, 0.12, 0.06]} />
          <meshStandardMaterial color={'#1a1410'} metalness={0.3} roughness={0.85} />
        </mesh>
        {/* Cable bundles drooping out of junction */}
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0.32 + 0.04, -0.08 - i * 0.03, 0.04]}>
            <cylinderGeometry args={[0.005, 0.005, 0.4 + i * 0.1, 5]} />
            <meshStandardMaterial color={['#1a1410', '#6a3030', '#3a2820'][i]} roughness={0.9} />
          </mesh>
        ))}
      </group>

      {/* Bucket on the floor catching a drip from the cloth-taped pipe */}
      <group position={[X_NEAR + 0.5, 0, -1.1]}>
        <mesh position={[0, 0.09, 0]}>
          <cylinderGeometry args={[0.11, 0.09, 0.18, 14]} />
          <meshStandardMaterial color={'#6a4030'} metalness={0.2} roughness={0.85} />
        </mesh>
        {/* Water inside */}
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.105, 0.105, 0.005, 14]} />
          <meshStandardMaterial color={'#5a7878'} roughness={0.2} metalness={0.1} />
        </mesh>
        {/* Handle arc */}
        <mesh position={[0, 0.20, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.1, 0.005, 6, 16, Math.PI]} />
          <meshStandardMaterial color={'#3a2820'} metalness={0.45} roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

// ── Single bare bulb on a twisted-pair cord — the only ceiling fixture.
//    Warm 2700K, drives a soft point light. ──
function BareBulb() {
  const cx = X_FAR - 0.6
  const cz = (CHAIR_ZS[0] + CHAIR_ZS[CHAIR_ZS.length - 1]) / 2
  const dropY = 1.78
  return (
    <group position={[cx, dropY, cz]}>
      {/* Twisted-pair flex from ceiling */}
      <mesh position={[0, (Y_TOP - dropY) / 2, 0]}>
        <cylinderGeometry args={[0.004, 0.004, Y_TOP - dropY, 6]} />
        <meshStandardMaterial color={'#3a2a1c'} roughness={0.9} />
      </mesh>
      {/* Porcelain rose */}
      <mesh position={[0, (Y_TOP - dropY) - 0.02, 0]}>
        <cylinderGeometry args={[0.04, 0.05, 0.04, 12]} />
        <meshStandardMaterial color={'#e8e0d0'} roughness={0.7} />
      </mesh>
      {/* Bulb */}
      <mesh>
        <sphereGeometry args={[0.05, 14, 12]} />
        <meshStandardMaterial color={BULB_GLOW} emissive={BULB_GLOW} emissiveIntensity={1.6} />
      </mesh>
      {/* Brass collar */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.018, 0.022, 0.025, 10]} />
        <meshStandardMaterial color={'#a8884a'} metalness={0.7} roughness={0.4} />
      </mesh>
      <pointLight color={BULB_GLOW} intensity={1.4} distance={5} decay={1.7} />
    </group>
  )
}

// ── Hood hair-dryer mounted ABOVE chair 1 (z=-1.4). A horizontal arm
//    extends from the back wall (X_FAR) over the seat, with the dome
//    dropping at the right height to envelop a seated customer's head.
//    Reads as functional because there's a chair directly beneath. ──
function HairDryerHood() {
  // Hood positioned over the rear barber chair seat
  const armRootX = X_FAR - 0.06
  const targetX = CHAIR_X
  const targetZ = CHAIR_ZS[0]  // chair 1
  const armReach = armRootX - targetX
  return (
    <group>
      {/* Wall mount plate — small bolt-on at the back wall */}
      <mesh position={[armRootX, 1.85, targetZ]}>
        <boxGeometry args={[0.04, 0.16, 0.16]} />
        <meshStandardMaterial color={CHROME_DARK} metalness={0.7} roughness={0.45} />
      </mesh>
      {/* Horizontal arm — extends from wall plate over the chair */}
      <mesh position={[armRootX - armReach / 2, 1.85, targetZ]}>
        <boxGeometry args={[armReach, 0.04, 0.04]} />
        <meshStandardMaterial color={CHROME_DARK} metalness={0.7} roughness={0.45} />
      </mesh>
      {/* Vertical drop arm directly above chair seat */}
      <mesh position={[targetX, 1.65, targetZ]}>
        <cylinderGeometry args={[0.025, 0.025, 0.4, 10]} />
        <meshStandardMaterial color={CHROME_DARK} metalness={0.7} roughness={0.45} />
      </mesh>
      {/* Hood body — hemisphere opening downward, head-height for seated customer */}
      <mesh position={[targetX, 1.42, targetZ]}>
        <sphereGeometry args={[0.22, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={CHROME} metalness={0.75} roughness={0.32} />
      </mesh>
      {/* Hood opening rim */}
      <mesh position={[targetX, 1.42, targetZ]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.012, 6, 22]} />
        <meshStandardMaterial color={CHROME_DARK} metalness={0.7} roughness={0.45} />
      </mesh>
      {/* Top motor housing */}
      <mesh position={[targetX, 1.58, targetZ]}>
        <boxGeometry args={[0.10, 0.08, 0.10]} />
        <meshStandardMaterial color={'#3a3530'} roughness={0.85} />
      </mesh>
      {/* Small grille slots on the motor housing */}
      {[-0.02, 0, 0.02].map((dz, i) => (
        <mesh key={i} position={[targetX + 0.051, 1.58, targetZ + dz]}>
          <boxGeometry args={[0.001, 0.05, 0.008]} />
          <meshStandardMaterial color={'#1a1410'} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

// ── Hanging towels on a clothesline above the counter ──
function HangingTowels() {
  const cz = (CHAIR_ZS[0] + CHAIR_ZS[CHAIR_ZS.length - 1]) / 2
  const lineX = X_FAR - 0.55
  const lineY = 1.85
  const palette = ['#b8d0d8', '#e0c870', '#a8b8c0', '#d8a890', '#dcdcd0']
  return (
    <group>
      {/* The line itself */}
      <mesh position={[lineX, lineY, cz]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 1.8, 6]} />
        <meshStandardMaterial color={'#3a2820'} roughness={0.95} />
      </mesh>
      {/* Towels draped over — each a vertical plane with a fold crease */}
      {[-0.7, -0.3, 0.0, 0.3, 0.7].map((dz, i) => (
        <group key={i} position={[lineX + 0.005, lineY - 0.02, cz + dz]}>
          {/* Front face */}
          <mesh position={[0.012, -0.16, 0]} rotation={[0, 0, 0.04]}>
            <planeGeometry args={[0.25, 0.32]} />
            <meshStandardMaterial color={palette[i]} roughness={0.95} side={THREE.DoubleSide} />
          </mesh>
          {/* Back face */}
          <mesh position={[-0.012, -0.16, 0]} rotation={[0, 0, -0.04]}>
            <planeGeometry args={[0.25, 0.32]} />
            <meshStandardMaterial color={palette[i]} roughness={0.95} side={THREE.DoubleSide} />
          </mesh>
          {/* Subtle stripe */}
          <mesh position={[0.013, -0.05, 0]}>
            <planeGeometry args={[0.25, 0.025]} />
            <meshStandardMaterial color={'#5a7080'} roughness={0.95} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ── Z_MAX wall props — fills the dead zone between door and hair dryer
//    with KWC standards: a big red 1987 calendar, a framed business
//    license, a wall clock. ──
function ZMaxWallProps() {
  // Group sits 2cm in front of the Z_MAX wall plane so frame backings
  // (negative local z, flipped to positive after the group's 180° Y
  // rotation) stay in front of the wall instead of z-fighting with it.
  const wallZ = Z_MAX - 0.02
  const cy = 1.55

  // Build calendar texture — red banner with "1987" big numerals + a
  // few rows of black bars for date grid
  const calTex = useMemo(() => {
    const W = 256
    const H = 320
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#f4ead0'
    ctx.fillRect(0, 0, W, H)
    // Red banner
    ctx.fillStyle = '#c81818'
    ctx.fillRect(0, 0, W, 110)
    // Big "1987" in white
    ctx.fillStyle = '#fff8e0'
    ctx.font = 'bold 78px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('1985', W / 2, 78)
    ctx.font = 'bold 22px Georgia, serif'
    ctx.fillText('乙丑年', W / 2, 100)
    // Date grid faux text
    ctx.fillStyle = '#1a1410'
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 7; c++) {
        ctx.fillRect(20 + c * 32, 138 + r * 36, 22, 4)
      }
    }
    // Foxing / age stains
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = `rgba(${130 + Math.random() * 30}, ${88 + Math.random() * 24}, ${56 + Math.random() * 16}, ${0.22 + Math.random() * 0.3})`
      ctx.beginPath()
      ctx.arc(Math.random() * W, Math.random() * H, 3 + Math.random() * 7, 0, Math.PI * 2)
      ctx.fill()
    }
    return new THREE.CanvasTexture(canvas)
  }, [])

  // Framed business-license texture — yellowed paper with red seal + 公
  const licTex = useMemo(() => {
    const W = 240
    const H = 180
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')!
    ctx.fillStyle = '#e8dcb8'
    ctx.fillRect(0, 0, W, H)
    // Header bar
    ctx.fillStyle = '#3a2820'
    ctx.fillRect(20, 18, W - 40, 4)
    ctx.font = 'bold 16px Georgia, serif'
    ctx.fillStyle = '#1a1410'
    ctx.textAlign = 'center'
    ctx.fillText('營業執照', W / 2, 44)
    ctx.font = '12px Georgia, serif'
    ctx.fillText('BUSINESS  LICENCE', W / 2, 60)
    // Faux text rows
    ctx.fillStyle = '#3a2820'
    for (let r = 0; r < 5; r++) {
      ctx.fillRect(28, 80 + r * 14, W - 80, 3)
    }
    // Big red seal — circular
    ctx.strokeStyle = '#a82020'
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(W - 56, H - 50, 28, 0, Math.PI * 2)
    ctx.stroke()
    ctx.fillStyle = '#a82020'
    ctx.font = 'bold 22px Georgia, serif'
    ctx.fillText('印', W - 56, H - 42)
    // Foxing stains
    for (let i = 0; i < 8; i++) {
      ctx.fillStyle = `rgba(${130 + Math.random() * 30}, ${88 + Math.random() * 24}, ${56 + Math.random() * 16}, ${0.22 + Math.random() * 0.3})`
      ctx.beginPath()
      ctx.arc(Math.random() * W, Math.random() * H, 2 + Math.random() * 6, 0, Math.PI * 2)
      ctx.fill()
    }
    return new THREE.CanvasTexture(canvas)
  }, [])

  // Build clock face texture — round dial with black numerals and hands
  const clockTex = useMemo(() => {
    const S = 256
    const canvas = document.createElement('canvas')
    canvas.width = S
    canvas.height = S
    const ctx = canvas.getContext('2d')!
    // Cream face
    ctx.fillStyle = '#f0e6c8'
    ctx.beginPath()
    ctx.arc(S / 2, S / 2, S / 2 - 4, 0, Math.PI * 2)
    ctx.fill()
    // Tick marks
    ctx.strokeStyle = '#1a1410'
    ctx.lineWidth = 3
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 - Math.PI / 2
      const r1 = S / 2 - 14
      const r2 = S / 2 - 28
      ctx.beginPath()
      ctx.moveTo(S / 2 + Math.cos(a) * r1, S / 2 + Math.sin(a) * r1)
      ctx.lineTo(S / 2 + Math.cos(a) * r2, S / 2 + Math.sin(a) * r2)
      ctx.stroke()
    }
    // 12, 3, 6, 9 numerals
    ctx.fillStyle = '#1a1410'
    ctx.font = 'bold 24px Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('12', S / 2, 38)
    ctx.fillText('6', S / 2, S - 18)
    ctx.fillText('3', S - 18, S / 2 + 8)
    ctx.fillText('9', 18, S / 2 + 8)
    // Hands stuck at 3:42 (a frozen-time KWC vibe)
    const drawHand = (angle: number, length: number, width: number) => {
      ctx.save()
      ctx.translate(S / 2, S / 2)
      ctx.rotate(angle)
      ctx.fillStyle = '#1a1410'
      ctx.fillRect(-width / 2, -length, width, length)
      ctx.restore()
    }
    drawHand(Math.PI * 2 * (3.7 / 12), 60, 6)   // hour hand (3:42)
    drawHand(Math.PI * 2 * (42 / 60), 90, 4)    // minute hand
    // Centre boss
    ctx.fillStyle = '#1a1410'
    ctx.beginPath()
    ctx.arc(S / 2, S / 2, 6, 0, Math.PI * 2)
    ctx.fill()
    return new THREE.CanvasTexture(canvas)
  }, [])

  return (
    <group rotation={[0, Math.PI, 0]} position={[0, 0, wallZ]}>
      {/* Calendar — 0.32m × 0.4m, red banner with big "1987" */}
      <group position={[-(X_NEAR + 0.5), cy + 0.05, 0]} rotation={[0, 0, -0.03]}>
        <mesh position={[0, 0, -0.005]}>
          <planeGeometry args={[0.34, 0.42]} />
          <meshStandardMaterial color={'#3a2418'} roughness={0.85} />
        </mesh>
        <mesh>
          <planeGeometry args={[0.32, 0.4]} />
          <meshStandardMaterial map={calTex} roughness={0.92} />
        </mesh>
        {/* Pin */}
        <mesh position={[0, 0.18, 0.003]}>
          <sphereGeometry args={[0.008, 6, 5]} />
          <meshStandardMaterial color={'#c82020'} roughness={0.5} />
        </mesh>
      </group>

      {/* Framed business license — 0.3m × 0.22m, lower right */}
      <group position={[-(X_NEAR + 1.0), cy - 0.18, 0]} rotation={[0, 0, 0.02]}>
        {/* Wood frame */}
        <mesh position={[0, 0, -0.008]}>
          <boxGeometry args={[0.32, 0.24, 0.018]} />
          <meshStandardMaterial color={WOOD_DARK} roughness={0.85} />
        </mesh>
        {/* Glass-fronted paper */}
        <mesh>
          <planeGeometry args={[0.28, 0.20]} />
          <meshStandardMaterial map={licTex} roughness={0.5} metalness={0.05} />
        </mesh>
      </group>

      {/* Round wall clock — 0.3m diameter, hung above the calendar */}
      <group position={[-(X_NEAR + 0.5), cy + 0.45, 0]}>
        {/* Outer black rim */}
        <mesh position={[0, 0, -0.005]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.16, 0.16, 0.018, 28]} />
          <meshStandardMaterial color={'#1a1410'} roughness={0.7} />
        </mesh>
        {/* Clock face */}
        <mesh>
          <circleGeometry args={[0.14, 28]} />
          <meshStandardMaterial map={clockTex} roughness={0.4} metalness={0.1} />
        </mesh>
      </group>
    </group>
  )
}

// ── Wall-mounted AC unit — Hitachi-style white box bolted high on the
//    door-side wall (X_NEAR), above the door height. Reference: Girard
//    photo. ──
function WallAC() {
  return (
    <group position={[X_NEAR + 0.05, Y_TOP - 0.32, Z_MAX - 0.55]} rotation={[0, Math.PI / 2, 0]}>
      {/* Body */}
      <mesh>
        <boxGeometry args={[0.6, 0.36, 0.24]} />
        <meshStandardMaterial color={'#dcd6c8'} roughness={0.65} />
      </mesh>
      {/* Front grille — louvre */}
      <mesh position={[0, -0.04, 0.122]}>
        <planeGeometry args={[0.5, 0.16]} />
        <meshStandardMaterial color={'#3a3530'} roughness={0.85} />
      </mesh>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[0, -0.10 + i * 0.022, 0.124]}>
          <boxGeometry args={[0.5, 0.008, 0.004]} />
          <meshStandardMaterial color={'#a8a098'} roughness={0.7} />
        </mesh>
      ))}
      {/* Brand strip */}
      <mesh position={[0, 0.10, 0.122]}>
        <planeGeometry args={[0.5, 0.05]} />
        <meshStandardMaterial color={'#3a3530'} roughness={0.85} />
      </mesh>
      {/* Drip stain on wall below */}
      <mesh position={[0, -0.34, 0.001]}>
        <planeGeometry args={[0.04, 0.5]} />
        <meshStandardMaterial color={'#5a4030'} roughness={0.95} transparent opacity={0.55} />
      </mesh>
    </group>
  )
}

// ── Sink (compact) in the corner near the door ──
function Sink() {
  const x = X_FAR - 0.22
  const z = Z_MIN + 0.22
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.32, 0]}>
        <boxGeometry args={[0.14, 0.64, 0.14]} />
        <meshStandardMaterial color={WHITE_CERAMIC} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.72, 0]}>
        <boxGeometry args={[0.42, 0.16, 0.32]} />
        <meshStandardMaterial color={WHITE_CERAMIC} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.79, 0]}>
        <boxGeometry args={[0.36, 0.04, 0.26]} />
        <meshStandardMaterial color={SINK_STAIN} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.88, -0.13]}>
        <cylinderGeometry args={[0.01, 0.01, 0.16, 8]} />
        <meshStandardMaterial color={CHROME_DARK} metalness={0.7} roughness={0.4} />
      </mesh>
      {/* Water heater above */}
      <group position={[0, 1.4, 0]}>
        <mesh>
          <boxGeometry args={[0.26, 0.42, 0.18]} />
          <meshStandardMaterial color={'#a89378'} roughness={0.85} metalness={0.2} />
        </mesh>
        <mesh position={[-0.131, 0.04, 0]}>
          <boxGeometry args={[0.005, 0.18, 0.08]} />
          <meshStandardMaterial color={RUST} roughness={0.95} />
        </mesh>
        <mesh position={[0.07, -0.15, 0.091]}>
          <sphereGeometry args={[0.01, 8, 6]} />
          <meshStandardMaterial color={'#ff3030'} emissive={'#ff3030'} emissiveIntensity={1.0} />
        </mesh>
        <mesh position={[0, 0.34, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 0.4, 10]} />
          <meshStandardMaterial color={'#8a6850'} roughness={0.85} metalness={0.3} />
        </mesh>
      </group>
    </group>
  )
}

// ── Slow ceiling fan — single, in front of mirror ──
function CeilingFan() {
  const ref = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 1.4
  })
  const cx = X_NEAR + 0.9
  const cz = (CHAIR_ZS[0] + CHAIR_ZS[CHAIR_ZS.length - 1]) / 2
  return (
    <group position={[cx, Y_TOP - 0.04, cz]}>
      <mesh position={[0, -0.06, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.12, 8]} />
        <meshStandardMaterial color={'#3a3530'} roughness={0.85} />
      </mesh>
      <mesh position={[0, -0.12, 0]}>
        <cylinderGeometry args={[0.05, 0.06, 0.05, 14]} />
        <meshStandardMaterial color={'#1a1410'} roughness={0.7} metalness={0.3} />
      </mesh>
      <group ref={ref} position={[0, -0.13, 0]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0.16, -0.005, 0]} rotation={[0, (i * Math.PI * 2) / 3, 0]}>
            <boxGeometry args={[0.32, 0.008, 0.07]} />
            <meshStandardMaterial color={'#2a2520'} roughness={0.85} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

// ── Plastic strip curtain at the doorway — vertical translucent strips,
//    yellowed with age. Replaces the previous cloth curtain. ──
function StripCurtain() {
  const slatW = 0.13
  const slatH = 1.85
  const strips = [-0.32, -0.18, -0.06, 0.06, 0.18, 0.32]
  return (
    <group position={[X_NEAR + 0.005, 1.92, DOOR_Z_CENTRE]} rotation={[0, -Math.PI / 2, 0]}>
      {/* Top rail */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.012, 0.012, 0.9, 8]} />
        <meshStandardMaterial color={WOOD_DARK} roughness={0.9} />
      </mesh>
      {/* Translucent yellowed PVC strips */}
      {strips.map((dx, i) => (
        <mesh key={i} position={[dx, -slatH / 2 - 0.05, 0]}>
          <planeGeometry args={[slatW, slatH]} />
          <meshStandardMaterial
            color={'#e8d8a8'}
            transparent
            opacity={0.55}
            roughness={0.4}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  )
}

// ── Barber-pole spiral texture: red / white / blue diagonal stripes
//    sliced as a wrap-around cylinder map. Static (no animation) — the
//    light + colour alone signal "barber" from across the alley. ──
function makeBarberPoleTex(): THREE.CanvasTexture {
  const W = 64
  const H = 256
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#f4ede0'
  ctx.fillRect(0, 0, W, H)
  const stripeH = 32
  const skew = 18
  ctx.fillStyle = '#c61b1b'
  for (let y = -H; y < H * 2; y += stripeH * 2) {
    ctx.beginPath()
    ctx.moveTo(0, y); ctx.lineTo(W, y - skew)
    ctx.lineTo(W, y - skew + stripeH); ctx.lineTo(0, y + stripeH)
    ctx.closePath(); ctx.fill()
  }
  ctx.fillStyle = '#1d4690'
  for (let y = -H + stripeH; y < H * 2; y += stripeH * 2) {
    ctx.beginPath()
    ctx.moveTo(0, y + stripeH * 0.42); ctx.lineTo(W, y - skew + stripeH * 0.42)
    ctx.lineTo(W, y - skew + stripeH * 0.62); ctx.lineTo(0, y + stripeH * 0.62)
    ctx.closePath(); ctx.fill()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  return tex
}

// ── Backlit shop sign: bilingual "理髮 / BARBER" on a warm cream
//    fluorescent face. Aged with light staining so it reads period-correct
//    rather than freshly printed. ──
function makeSalonSignTex(): THREE.CanvasTexture {
  const W = 512
  const H = 144
  const canvas = document.createElement('canvas')
  canvas.width = W; canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#fff2c8'
  ctx.fillRect(0, 0, W, H)
  ctx.strokeStyle = '#a04018'
  ctx.lineWidth = 6
  ctx.strokeRect(5, 5, W - 10, H - 10)
  ctx.fillStyle = '#c61b1b'
  ctx.font = 'bold 92px "Noto Serif TC", "Microsoft JhengHei", serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('理髮', W * 0.30, H * 0.52)
  ctx.fillStyle = '#a04018'
  ctx.font = 'bold 44px "Playfair Display", Georgia, serif'
  ctx.fillText('BARBER', W * 0.70, H * 0.52)
  // Aging stains
  for (let i = 0; i < 9; i++) {
    ctx.fillStyle = `rgba(120, 60, 24, ${0.05 + Math.random() * 0.08})`
    ctx.beginPath()
    ctx.arc(Math.random() * W, Math.random() * H, 8 + Math.random() * 22, 0, Math.PI * 2)
    ctx.fill()
  }
  return new THREE.CanvasTexture(canvas)
}

// ── Exterior signage: barber pole + backlit shop sign mounted on the
//    alley side of the salon door. Player approaches from +z, so the pole
//    sits on the +z side of the doorway to register before they reach it. ──
function SalonSignage() {
  const poleTex = useMemo(() => {
    const t = makeBarberPoleTex()
    t.repeat.set(1, 2)
    return t
  }, [])
  const signTex = useMemo(() => makeSalonSignTex(), [])

  return (
    <group>
      {/* Barber pole — short cylinder protruding from the wall on a bracket */}
      <group position={[X_NEAR - 0.12, 1.55, 0.18]}>
        {/* Wall bracket */}
        <mesh position={[0.09, 0, 0]}>
          <boxGeometry args={[0.06, 0.06, 0.06]} />
          <meshStandardMaterial color={CHROME_DARK} metalness={0.7} roughness={0.5} />
        </mesh>
        {/* End caps */}
        <mesh position={[0, 0.30, 0]}>
          <cylinderGeometry args={[0.078, 0.078, 0.05, 14]} />
          <meshStandardMaterial color={CHROME} metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.30, 0]}>
          <cylinderGeometry args={[0.078, 0.078, 0.05, 14]} />
          <meshStandardMaterial color={CHROME} metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Glass cylinder — emissive so it glows in the dim alley */}
        <mesh>
          <cylinderGeometry args={[0.06, 0.06, 0.55, 18]} />
          <meshStandardMaterial
            map={poleTex}
            emissive={'#ffe0b0'}
            emissiveMap={poleTex}
            emissiveIntensity={0.6}
            roughness={0.35}
            metalness={0.1}
          />
        </mesh>
      </group>

      {/* Backlit sign mounted on the wall above the doorway */}
      <group position={[X_NEAR - 0.04, 1.97, DOOR_Z_CENTRE]}>
        <mesh>
          <boxGeometry args={[0.05, 0.20, 0.74]} />
          <meshStandardMaterial color={'#3a2818'} roughness={0.85} />
        </mesh>
        <mesh position={[-0.026, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[0.7, 0.16]} />
          <meshStandardMaterial
            map={signTex}
            emissive={'#ffaa44'}
            emissiveMap={signTex}
            emissiveIntensity={1.6}
            color={'#fff2c8'}
            roughness={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* Warm spill light from the doorway into the alley */}
      <pointLight
        position={[X_NEAR - 0.15, 1.5, DOOR_Z_CENTRE]}
        color={'#ffaa55'}
        intensity={0.9}
        distance={2.4}
        decay={2}
      />
    </group>
  )
}

export function Salon() {
  const floorTex = useMemo(() => makeSalonFloorTex(), [])
  const wallTex = useMemo(() => makeSalonWallTex(), [])
  wallTex.repeat.set(1, 1)

  const xMid = (X_NEAR + X_FAR) / 2
  const zMid = (Z_MIN + Z_MAX) / 2
  const xLen = X_FAR - X_NEAR
  const zLen = Z_MAX - Z_MIN

  return (
    <group>
      {/* Floor */}
      <mesh position={[xMid, 0.005, zMid]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[xLen, zLen]} />
        <meshStandardMaterial map={floorTex} roughness={0.85} />
      </mesh>
      {/* Ceiling — low and stained */}
      <mesh position={[xMid, Y_TOP, zMid]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[xLen, zLen]} />
        <meshStandardMaterial color={'#3a352e'} roughness={0.95} />
      </mesh>
      {/* Back wall (mirror wall) */}
      <mesh position={[X_FAR, Y_TOP / 2, zMid]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[zLen, Y_TOP]} />
        <meshStandardMaterial map={wallTex} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Z_MIN side wall (poster wall) */}
      <mesh position={[xMid, Y_TOP / 2, Z_MIN]}>
        <planeGeometry args={[xLen, Y_TOP]} />
        <meshStandardMaterial map={wallTex} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Z_MAX side wall (door wall extension) */}
      <mesh position={[xMid, Y_TOP / 2, Z_MAX]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[xLen, Y_TOP]} />
        <meshStandardMaterial map={wallTex} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Near wall with doorway gap */}
      {[
        { z1: Z_MIN, z2: DOOR_Z_CENTRE - DOOR_HALFW },
        { z1: DOOR_Z_CENTRE + DOOR_HALFW, z2: Z_MAX },
      ].map((seg, i) => {
        const segLen = seg.z2 - seg.z1
        if (segLen <= 0) return null
        const segMid = (seg.z1 + seg.z2) / 2
        return (
          <mesh key={i} position={[X_NEAR, Y_TOP / 2, segMid]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[segLen, Y_TOP]} />
            <meshStandardMaterial map={wallTex} roughness={0.9} side={THREE.DoubleSide} />
          </mesh>
        )
      })}
      {/* Lintel above doorway */}
      <mesh position={[X_NEAR, Y_TOP - 0.18, DOOR_Z_CENTRE]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[DOOR_HALFW * 2, 0.36]} />
        <meshStandardMaterial map={wallTex} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      <Mirror />
      <VanityCounter />
      <BarberChairs />
      <PosterCollage />
      <ZMaxWallProps />
      <CeilingInfra />
      <BareBulb />
      <HairDryerHood />
      <HangingTowels />
      <WallAC />
      <Sink />
      <CeilingFan />
      <StripCurtain />
      <SalonSignage />
    </group>
  )
}
