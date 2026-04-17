/**
 * Museum paintings — refinement pass.
 *
 * Each artwork is a single meshStandardMaterial plane textured with a
 * procedurally-drawn CanvasTexture. Canvas2D lets us use real radial +
 * linear gradients, sfumato blurs, layered brush strokes, and alpha
 * blending — none of which are practical with stacked primitives.
 *
 * The frame around each painting is now a 4-piece mitered gilt moulding
 * with a carved inner rim + fluted corner blocks + dark inner fillet.
 * Reads as a proper period frame rather than a chunky box.
 *
 * A spotlight cone shines down from a ceiling track light onto each
 * painting, and a small polished brass plaque hangs below with engraved
 * title / artist / year / medium.
 */

import { useMemo } from 'react'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

const CANVAS_RES = 512

/* ═══════════════════════════════════════════════════════════════════
   Shared Canvas2D helpers — keep the painting code concise
   ═══════════════════════════════════════════════════════════════════ */

function makeCanvas(w = CANVAS_RES, h = CANVAS_RES) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  return { canvas: c, ctx }
}

function toTexture(canvas: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(canvas)
  tex.anisotropy = 4
  return tex
}

/* ═══════════════════════════════════════════════════════════════════
   "The Starry Night" — Van Gogh, 1889
   Full canvas painted procedurally: graded blue sky, swirling brush-
   stroke bands, haloed stars, moon, cypress, village rooftops.
   ═══════════════════════════════════════════════════════════════════ */
function useStarryNightTex() {
  return useMemo(() => {
    const { canvas, ctx } = makeCanvas(512, 384)

    // Deep-to-mid blue gradient sky
    const sky = ctx.createLinearGradient(0, 0, 0, 280)
    sky.addColorStop(0, '#0d1a42')
    sky.addColorStop(0.4, '#1a2c68')
    sky.addColorStop(0.75, '#2d4f8e')
    sky.addColorStop(1, '#3a5a9a')
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, 512, 280)

    // Swirling cloud brush strokes — overlapping arcs in various blues
    const swirlColors = ['#4a6db0', '#3a5a8f', '#5a80c0', '#2a436d', '#688dc0']
    for (let i = 0; i < 80; i++) {
      const x = Math.sin(i * 2.7) * 260 + 256
      const y = 40 + ((i * 13) % 200)
      const r = 18 + (i % 5) * 6
      const rot = i * 0.4
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rot)
      ctx.strokeStyle = swirlColors[i % swirlColors.length]
      ctx.lineWidth = 5 + (i % 3)
      ctx.globalAlpha = 0.7
      ctx.beginPath()
      ctx.arc(0, 0, r, 0, Math.PI * 1.4)
      ctx.stroke()
      ctx.restore()
    }
    ctx.globalAlpha = 1

    // Moon — warm yellow with multi-ring halo
    const moonX = 400
    const moonY = 90
    for (let ring = 3; ring >= 0; ring--) {
      const gh = ctx.createRadialGradient(moonX, moonY, 18 + ring * 10, moonX, moonY, 35 + ring * 18)
      gh.addColorStop(0, `rgba(248, 216, 120, ${0.25 - ring * 0.06})`)
      gh.addColorStop(1, 'rgba(248, 216, 120, 0)')
      ctx.fillStyle = gh
      ctx.fillRect(moonX - 80, moonY - 80, 160, 160)
    }
    const moonCore = ctx.createRadialGradient(moonX, moonY, 0, moonX, moonY, 26)
    moonCore.addColorStop(0, '#fff4b8')
    moonCore.addColorStop(1, '#f4c858')
    ctx.fillStyle = moonCore
    ctx.beginPath()
    ctx.arc(moonX, moonY, 26, 0, Math.PI * 2)
    ctx.fill()

    // 8 haloed stars scattered across the sky
    const stars = [
      [80, 70, 12],
      [150, 110, 9],
      [220, 60, 10],
      [300, 150, 7],
      [70, 180, 8],
      [180, 220, 11],
      [350, 200, 9],
      [460, 180, 8],
    ] as const
    for (const [sx, sy, sr] of stars) {
      const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr * 3)
      g.addColorStop(0, '#fff6c8')
      g.addColorStop(0.35, 'rgba(248, 220, 120, 0.55)')
      g.addColorStop(1, 'rgba(248, 220, 120, 0)')
      ctx.fillStyle = g
      ctx.fillRect(sx - sr * 3, sy - sr * 3, sr * 6, sr * 6)
      ctx.fillStyle = '#fff8d8'
      ctx.beginPath()
      ctx.arc(sx, sy, sr * 0.5, 0, Math.PI * 2)
      ctx.fill()
    }

    // Ground — dark village silhouette
    const ground = ctx.createLinearGradient(0, 280, 0, 384)
    ground.addColorStop(0, '#2a2238')
    ground.addColorStop(1, '#100818')
    ctx.fillStyle = ground
    ctx.fillRect(0, 280, 512, 104)

    // Rolling hill silhouette
    ctx.fillStyle = '#181028'
    ctx.beginPath()
    ctx.moveTo(0, 330)
    for (let i = 0; i <= 10; i++) {
      const x = i * 51
      const y = 330 + Math.sin(i * 1.3) * 18
      ctx.lineTo(x, y)
    }
    ctx.lineTo(512, 384)
    ctx.lineTo(0, 384)
    ctx.closePath()
    ctx.fill()

    // Cypress tree — tall dark flame on the left
    ctx.fillStyle = '#050810'
    ctx.beginPath()
    ctx.moveTo(70, 380)
    ctx.quadraticCurveTo(40, 260, 80, 140)
    ctx.quadraticCurveTo(110, 200, 100, 330)
    ctx.quadraticCurveTo(95, 370, 120, 380)
    ctx.closePath()
    ctx.fill()

    // Village rooftops (dark with lit windows)
    const rooftops = [
      [150, 320, 40, 20],
      [210, 315, 34, 24],
      [260, 325, 28, 16],
      [310, 320, 36, 22],
      [360, 330, 30, 14],
      [410, 325, 30, 18],
    ] as const
    for (const [rx, ry, rw, rh] of rooftops) {
      // Roof
      ctx.fillStyle = '#1a1220'
      ctx.beginPath()
      ctx.moveTo(rx - rw / 2, ry + rh / 2)
      ctx.lineTo(rx, ry - rh / 2)
      ctx.lineTo(rx + rw / 2, ry + rh / 2)
      ctx.closePath()
      ctx.fill()
      // Wall
      ctx.fillStyle = '#0a0614'
      ctx.fillRect(rx - rw / 2, ry + rh / 2, rw, 16)
      // Lit window
      if ((rx / 10) % 2 < 1) {
        ctx.fillStyle = '#f4c858'
        ctx.fillRect(rx - 3, ry + rh / 2 + 4, 6, 5)
      }
    }

    // Church steeple — tall thin spire
    ctx.fillStyle = '#0a0614'
    ctx.beginPath()
    ctx.moveTo(258, 250)
    ctx.lineTo(266, 250)
    ctx.lineTo(262, 200)
    ctx.closePath()
    ctx.fill()
    ctx.fillRect(258, 250, 8, 80)

    return toTexture(canvas)
  }, [])
}

/* ═══════════════════════════════════════════════════════════════════
   "Mona Lisa" — Da Vinci, c.1503
   Warm sfumato brown background, soft-gradient face, arched brows,
   characteristic half-smile, crossed hands band.
   ═══════════════════════════════════════════════════════════════════ */
function useMonaLisaTex() {
  return useMemo(() => {
    const { canvas, ctx } = makeCanvas(400, 512)

    // Previous version tried too hard to be a literal Mona Lisa and hit
    // uncanny-valley hard. New direction: a stylised renaissance portrait
    // inspired by the Mona Lisa but abstracted — no attempt to paint a
    // recognisable face. Focus on mood (sfumato tones, composition,
    // soft gradients) rather than features.

    // Deep warm chiaroscuro background — radial spotlight behind the figure
    const bg = ctx.createRadialGradient(200, 290, 20, 200, 290, 320)
    bg.addColorStop(0, '#4a3420')
    bg.addColorStop(0.35, '#2a1c10')
    bg.addColorStop(0.75, '#14090a')
    bg.addColorStop(1, '#060304')
    ctx.fillStyle = bg
    ctx.fillRect(0, 0, 400, 512)

    // Soft vertical brushwork in the background — diagonal strokes for
    // painterly texture (imitates old-master canvas feel)
    ctx.globalAlpha = 0.08
    for (let i = 0; i < 200; i++) {
      const x = Math.random() * 400
      const y = Math.random() * 512
      const l = 30 + Math.random() * 60
      const hue = 20 + Math.random() * 20
      ctx.strokeStyle = `rgb(${60 + hue}, ${40 + hue * 0.6}, ${24 + hue * 0.4})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + 2, y + l)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // Distant misty landscape upper-right — the Mona-Lisa-style vista
    // visible over the subject's shoulder. Kept abstract: soft color
    // blocks suggesting aerial perspective.
    const mist = ctx.createLinearGradient(0, 50, 0, 200)
    mist.addColorStop(0, '#7a6844')
    mist.addColorStop(0.6, '#52604a')
    mist.addColorStop(1, '#2a3430')
    ctx.fillStyle = mist
    // Only fill the upper thirds of the image, leaving figure area dark
    ctx.fillRect(0, 40, 400, 140)

    // Soft mountain silhouette
    ctx.fillStyle = 'rgba(20, 30, 28, 0.55)'
    ctx.beginPath()
    ctx.moveTo(0, 160)
    ctx.bezierCurveTo(60, 130, 140, 150, 220, 125)
    ctx.bezierCurveTo(290, 105, 350, 140, 400, 128)
    ctx.lineTo(400, 180)
    ctx.lineTo(0, 180)
    ctx.closePath()
    ctx.fill()

    // Atmospheric haze on top of the landscape
    const haze = ctx.createLinearGradient(0, 80, 0, 220)
    haze.addColorStop(0, 'rgba(180, 160, 120, 0)')
    haze.addColorStop(0.5, 'rgba(140, 100, 70, 0.3)')
    haze.addColorStop(1, 'rgba(30, 20, 14, 0.85)')
    ctx.fillStyle = haze
    ctx.fillRect(0, 80, 400, 140)

    // === FIGURE — abstracted silhouette, no literal face ===
    // Dress / torso — soft pyramid shape blended into the dark background
    const dressGrad = ctx.createLinearGradient(0, 260, 0, 512)
    dressGrad.addColorStop(0, '#1a0c06')
    dressGrad.addColorStop(0.4, '#120804')
    dressGrad.addColorStop(1, '#060302')
    ctx.fillStyle = dressGrad

    // Broad pyramidal body silhouette
    ctx.beginPath()
    ctx.moveTo(60, 512)
    ctx.quadraticCurveTo(80, 380, 140, 310)
    ctx.quadraticCurveTo(200, 280, 260, 310)
    ctx.quadraticCurveTo(320, 380, 340, 512)
    ctx.closePath()
    ctx.fill()

    // Subtle dress-fold strokes
    ctx.strokeStyle = 'rgba(70, 50, 30, 0.18)'
    ctx.lineWidth = 1.5
    for (let i = 0; i < 7; i++) {
      const sx = 110 + i * 30
      ctx.beginPath()
      ctx.moveTo(sx, 320)
      ctx.quadraticCurveTo(sx - 5, 420, sx - 10, 510)
      ctx.stroke()
    }

    // Warm sleeve / upper-arm gradient (visible on each side)
    const sleeveGrad = ctx.createRadialGradient(100, 380, 10, 100, 380, 90)
    sleeveGrad.addColorStop(0, '#8a5a30')
    sleeveGrad.addColorStop(0.6, '#4a2a18')
    sleeveGrad.addColorStop(1, 'rgba(26,12,6,0)')
    ctx.fillStyle = sleeveGrad
    ctx.beginPath()
    ctx.ellipse(100, 380, 48, 80, -0.15, 0, Math.PI * 2)
    ctx.fill()

    const sleeveGrad2 = ctx.createRadialGradient(300, 380, 10, 300, 380, 90)
    sleeveGrad2.addColorStop(0, '#8a5a30')
    sleeveGrad2.addColorStop(0.6, '#4a2a18')
    sleeveGrad2.addColorStop(1, 'rgba(26,12,6,0)')
    ctx.fillStyle = sleeveGrad2
    ctx.beginPath()
    ctx.ellipse(300, 380, 48, 80, 0.15, 0, Math.PI * 2)
    ctx.fill()

    // Neckline — warm V in sfumato tones, NO actual face features
    const neckGrad = ctx.createRadialGradient(200, 290, 10, 200, 290, 80)
    neckGrad.addColorStop(0, '#a08068')
    neckGrad.addColorStop(0.5, '#6a4a30')
    neckGrad.addColorStop(1, 'rgba(20, 10, 6, 0)')
    ctx.fillStyle = neckGrad
    ctx.beginPath()
    ctx.ellipse(200, 300, 55, 48, 0, 0, Math.PI * 2)
    ctx.fill()

    // Head as a soft warm ellipse — sfumato blur, NO eyes/nose/mouth
    // This is the critical change: readable as "there's a figure there"
    // without triggering uncanny-valley pattern recognition.
    const headGrad = ctx.createRadialGradient(200, 220, 10, 200, 230, 85)
    headGrad.addColorStop(0, '#d4b494')
    headGrad.addColorStop(0.35, '#b89270')
    headGrad.addColorStop(0.65, '#6a4830')
    headGrad.addColorStop(1, 'rgba(20, 10, 6, 0)')
    ctx.fillStyle = headGrad
    ctx.beginPath()
    ctx.ellipse(200, 230, 65, 82, 0, 0, Math.PI * 2)
    ctx.fill()

    // Dark hair silhouette — soft-edged around the face
    const hairGrad = ctx.createRadialGradient(200, 200, 30, 200, 230, 100)
    hairGrad.addColorStop(0, 'rgba(10, 6, 4, 0)')
    hairGrad.addColorStop(0.45, 'rgba(8, 4, 2, 0)')
    hairGrad.addColorStop(0.7, 'rgba(8, 4, 2, 0.85)')
    hairGrad.addColorStop(1, '#060302')
    ctx.fillStyle = hairGrad
    ctx.beginPath()
    ctx.ellipse(200, 230, 96, 105, 0, 0, Math.PI * 2)
    ctx.fill()

    // Warm rim light — catches the left side of the face softly
    const rimGrad = ctx.createRadialGradient(155, 215, 5, 150, 225, 55)
    rimGrad.addColorStop(0, 'rgba(255, 220, 170, 0.25)')
    rimGrad.addColorStop(1, 'rgba(255, 220, 170, 0)')
    ctx.fillStyle = rimGrad
    ctx.fillRect(100, 160, 120, 140)

    // Thin translucent veil (signature Mona-Lisa-style cloth over hair)
    ctx.globalAlpha = 0.2
    ctx.strokeStyle = '#6a5038'
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
      ctx.beginPath()
      ctx.moveTo(140 + i * 30, 165)
      ctx.quadraticCurveTo(200, 150, 260 - i * 30, 165)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    // Subtle light-bloom halo around the figure
    const bloom = ctx.createRadialGradient(200, 260, 40, 200, 260, 220)
    bloom.addColorStop(0, 'rgba(200, 150, 90, 0.06)')
    bloom.addColorStop(1, 'rgba(200, 150, 90, 0)')
    ctx.fillStyle = bloom
    ctx.fillRect(0, 0, 400, 512)

    // Aged varnish tint — warm amber overall cast
    ctx.globalAlpha = 0.12
    ctx.fillStyle = '#6a3410'
    ctx.fillRect(0, 0, 400, 512)
    ctx.globalAlpha = 1

    // Craquelure hint — tiny random cracks
    ctx.globalAlpha = 0.08
    ctx.strokeStyle = '#1a0804'
    ctx.lineWidth = 0.5
    for (let i = 0; i < 50; i++) {
      const cx = Math.random() * 400
      const cy = Math.random() * 512
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + (Math.random() - 0.5) * 12, cy + (Math.random() - 0.5) * 12)
      ctx.stroke()
    }
    ctx.globalAlpha = 1

    return toTexture(canvas)
  }, [])
}

/* ═══════════════════════════════════════════════════════════════════
   "Water Lilies" — Monet, c.1906
   Impressionist pond: layered blue-green water bands + floating lilies
   + pink blossoms + reflected willow streaks.
   ═══════════════════════════════════════════════════════════════════ */
function useWaterLiliesTex() {
  return useMemo(() => {
    const { canvas, ctx } = makeCanvas(512, 384)

    // Base vertical water gradient
    const water = ctx.createLinearGradient(0, 0, 0, 384)
    water.addColorStop(0, '#4a7098')
    water.addColorStop(0.3, '#5a8ba8')
    water.addColorStop(0.6, '#4a7878')
    water.addColorStop(1, '#385868')
    ctx.fillStyle = water
    ctx.fillRect(0, 0, 512, 384)

    // Horizontal impressionist strokes — dozens of short parallel dashes
    const strokeColors = [
      'rgba(110, 160, 184, 0.8)',
      'rgba(88, 140, 168, 0.8)',
      'rgba(70, 110, 130, 0.8)',
      'rgba(130, 180, 190, 0.7)',
      'rgba(58, 94, 108, 0.8)',
      'rgba(160, 200, 210, 0.5)',
    ]
    for (let i = 0; i < 600; i++) {
      const y = (i * 7) % 384
      const x = ((i * 131) % 480) + ((y * 3) % 32)
      const w = 20 + (i % 30)
      ctx.fillStyle = strokeColors[i % strokeColors.length]
      ctx.fillRect(x, y, w, 2.5)
    }

    // Reflected willow — faint vertical green smudges in upper portion
    const willowColors = [
      'rgba(70, 96, 80, 0.5)',
      'rgba(90, 120, 100, 0.45)',
      'rgba(50, 80, 60, 0.5)',
    ]
    for (let i = 0; i < 14; i++) {
      const x = 25 + i * 36
      const h = 70 + (i % 3) * 30
      ctx.fillStyle = willowColors[i % willowColors.length]
      ctx.fillRect(x, 0, 6, h)
    }

    // Lily pads — green/ochre ellipses with subtle highlights
    const lilies: Array<{
      x: number
      y: number
      rx: number
      ry: number
      flower?: string
    }> = [
      { x: 80, y: 140, rx: 44, ry: 18 },
      { x: 200, y: 200, rx: 52, ry: 22, flower: '#f4a8b8' },
      { x: 150, y: 280, rx: 38, ry: 16 },
      { x: 320, y: 180, rx: 46, ry: 19, flower: '#f8c8d0' },
      { x: 400, y: 260, rx: 42, ry: 18 },
      { x: 60, y: 320, rx: 36, ry: 15, flower: '#f4a0b4' },
      { x: 450, y: 100, rx: 32, ry: 14 },
    ]
    for (const lily of lilies) {
      // Shadow under pad
      ctx.fillStyle = 'rgba(20, 40, 30, 0.3)'
      ctx.beginPath()
      ctx.ellipse(lily.x + 4, lily.y + 6, lily.rx, lily.ry, 0, 0, Math.PI * 2)
      ctx.fill()
      // Pad body with gradient
      const padGrad = ctx.createRadialGradient(lily.x - 6, lily.y - 4, 4, lily.x, lily.y, lily.rx)
      padGrad.addColorStop(0, '#6a9058')
      padGrad.addColorStop(0.7, '#3a5838')
      padGrad.addColorStop(1, '#1a3020')
      ctx.fillStyle = padGrad
      ctx.beginPath()
      ctx.ellipse(lily.x, lily.y, lily.rx, lily.ry, 0, 0, Math.PI * 2)
      ctx.fill()
      // Radial notch
      ctx.strokeStyle = 'rgba(20, 40, 30, 0.5)'
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(lily.x, lily.y)
      ctx.lineTo(lily.x - lily.rx * 0.9, lily.y)
      ctx.stroke()
      // Flower on top
      if (lily.flower) {
        const fx = lily.x + lily.rx * 0.2
        const fy = lily.y - 3
        const flowerGrad = ctx.createRadialGradient(fx, fy, 0, fx, fy, 14)
        flowerGrad.addColorStop(0, '#fff0f4')
        flowerGrad.addColorStop(0.4, lily.flower)
        flowerGrad.addColorStop(1, '#a85878')
        ctx.fillStyle = flowerGrad
        ctx.beginPath()
        ctx.ellipse(fx, fy, 14, 10, 0, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    return toTexture(canvas)
  }, [])
}

/* ═══════════════════════════════════════════════════════════════════
   Painting plane — single textured plane behind the frame
   ═══════════════════════════════════════════════════════════════════ */

function PaintingCanvas({
  tex,
  width,
  height,
}: {
  tex: THREE.Texture
  width: number
  height: number
}) {
  return (
    <mesh position={[0, 0, 0.001]}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial map={tex} roughness={0.85} />
    </mesh>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Gilt frame — mitered 4-piece with carved inner fillet + rosettes
   Thinner, more delicate than the previous chunky box frame
   ═══════════════════════════════════════════════════════════════════ */
function GiltFrame({ width = 1.2, height = 0.9 }) {
  const frameW = 0.06           // thinner profile (was 0.10)
  const frameD = 0.04           // depth from wall
  const filletW = 0.012         // dark inner fillet

  const outerW = width + frameW * 2
  const outerH = height + frameW * 2

  const GILT = '#d4a85c'
  const GILT_HIGH = '#f4d890'
  const GILT_DEEP = '#8a6828'
  const FILLET = '#1a1208'

  return (
    <group>
      {/* Back panel (hides anything behind the canvas) */}
      <mesh position={[0, 0, -0.021]}>
        <planeGeometry args={[width + 0.02, height + 0.02]} />
        <meshStandardMaterial color="#1a1410" roughness={0.9} />
      </mesh>

      {/* 4 mitered frame rails — each is a thin box with chamfered ends
          approximated by a shorter box so the four pieces meet at the
          geometric midline to look like a proper picture frame */}
      {/* Top rail */}
      <mesh position={[0, height / 2 + frameW / 2, 0]}>
        <boxGeometry args={[outerW, frameW, frameD]} />
        <meshStandardMaterial color={GILT} metalness={0.55} roughness={0.35} />
      </mesh>
      {/* Bottom rail */}
      <mesh position={[0, -height / 2 - frameW / 2, 0]}>
        <boxGeometry args={[outerW, frameW, frameD]} />
        <meshStandardMaterial color={GILT} metalness={0.55} roughness={0.35} />
      </mesh>
      {/* Left rail */}
      <mesh position={[-width / 2 - frameW / 2, 0, 0]}>
        <boxGeometry args={[frameW, height, frameD]} />
        <meshStandardMaterial color={GILT} metalness={0.55} roughness={0.35} />
      </mesh>
      {/* Right rail */}
      <mesh position={[width / 2 + frameW / 2, 0, 0]}>
        <boxGeometry args={[frameW, height, frameD]} />
        <meshStandardMaterial color={GILT} metalness={0.55} roughness={0.35} />
      </mesh>

      {/* Top highlight strip — brighter gilt catching light */}
      <mesh position={[0, height / 2 + frameW - 0.008, frameD / 2 + 0.001]}>
        <boxGeometry args={[outerW - 0.006, 0.008, 0.002]} />
        <meshStandardMaterial color={GILT_HIGH} metalness={0.7} roughness={0.25} />
      </mesh>
      {/* Bottom shadow strip — recessed gilt */}
      <mesh position={[0, -height / 2 - frameW + 0.008, frameD / 2 + 0.001]}>
        <boxGeometry args={[outerW - 0.006, 0.008, 0.002]} />
        <meshStandardMaterial color={GILT_DEEP} metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Carved inner rim (smaller moulding inside the main profile) */}
      {/* Top inner */}
      <mesh position={[0, height / 2 + 0.005, frameD / 2 + 0.001]}>
        <boxGeometry args={[width + 0.02, 0.01, 0.008]} />
        <meshStandardMaterial color={GILT_HIGH} metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[0, -height / 2 - 0.005, frameD / 2 + 0.001]}>
        <boxGeometry args={[width + 0.02, 0.01, 0.008]} />
        <meshStandardMaterial color={GILT_HIGH} metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[-width / 2 - 0.005, 0, frameD / 2 + 0.001]}>
        <boxGeometry args={[0.01, height + 0.02, 0.008]} />
        <meshStandardMaterial color={GILT_HIGH} metalness={0.65} roughness={0.3} />
      </mesh>
      <mesh position={[width / 2 + 0.005, 0, frameD / 2 + 0.001]}>
        <boxGeometry args={[0.01, height + 0.02, 0.008]} />
        <meshStandardMaterial color={GILT_HIGH} metalness={0.65} roughness={0.3} />
      </mesh>

      {/* Dark inner fillet — thin black line framing the canvas */}
      {/* Top fillet */}
      <mesh position={[0, height / 2 + filletW / 2 - 0.001, frameD / 2 + 0.002]}>
        <boxGeometry args={[width + filletW, filletW, 0.003]} />
        <meshStandardMaterial color={FILLET} roughness={0.85} />
      </mesh>
      <mesh position={[0, -height / 2 - filletW / 2 + 0.001, frameD / 2 + 0.002]}>
        <boxGeometry args={[width + filletW, filletW, 0.003]} />
        <meshStandardMaterial color={FILLET} roughness={0.85} />
      </mesh>
      <mesh position={[-width / 2 - filletW / 2 + 0.001, 0, frameD / 2 + 0.002]}>
        <boxGeometry args={[filletW, height, 0.003]} />
        <meshStandardMaterial color={FILLET} roughness={0.85} />
      </mesh>
      <mesh position={[width / 2 + filletW / 2 - 0.001, 0, frameD / 2 + 0.002]}>
        <boxGeometry args={[filletW, height, 0.003]} />
        <meshStandardMaterial color={FILLET} roughness={0.85} />
      </mesh>

      {/* Ornamental fluted corner blocks — slightly larger than the
          rails where they meet. Cylinder rosettes tipped on side */}
      {(
        [
          [-outerW / 2 + frameW / 2, outerH / 2 - frameW / 2],
          [outerW / 2 - frameW / 2, outerH / 2 - frameW / 2],
          [-outerW / 2 + frameW / 2, -outerH / 2 + frameW / 2],
          [outerW / 2 - frameW / 2, -outerH / 2 + frameW / 2],
        ] as const
      ).map(([x, y], i) => (
        <group key={i} position={[x, y, frameD / 2 + 0.002]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.022, 0.022, 0.012, 12]} />
            <meshStandardMaterial color={GILT_HIGH} metalness={0.75} roughness={0.22} />
          </mesh>
          {/* Center stud */}
          <mesh position={[0, 0, 0.008]}>
            <sphereGeometry args={[0.007, 10, 10]} />
            <meshStandardMaterial color={GILT_DEEP} metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Brass plaque hanging below the painting, with engraved text
   ═══════════════════════════════════════════════════════════════════ */
function BrassPlaque({
  title,
  artist,
  year,
  medium,
}: {
  title: string
  artist: string
  year: string
  medium: string
}) {
  const BRASS = '#c8a448'
  const BRASS_DEEP = '#8a6828'
  return (
    <group>
      {/* Backing plate */}
      <mesh position={[0, 0, -0.002]}>
        <boxGeometry args={[0.4, 0.12, 0.008]} />
        <meshStandardMaterial color={BRASS} metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Recessed inner field — slightly darker */}
      <mesh position={[0, 0, 0.0015]}>
        <planeGeometry args={[0.37, 0.095]} />
        <meshStandardMaterial color={BRASS_DEEP} metalness={0.55} roughness={0.4} />
      </mesh>
      {/* Top + bottom highlight lines */}
      <mesh position={[0, 0.055, 0.003]}>
        <planeGeometry args={[0.39, 0.003]} />
        <meshStandardMaterial color="#f4d880" metalness={0.75} roughness={0.2} />
      </mesh>
      <mesh position={[0, -0.055, 0.003]}>
        <planeGeometry args={[0.39, 0.003]} />
        <meshStandardMaterial color="#6a4818" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Engraved text */}
      <Text
        position={[0, 0.028, 0.005]}
        fontSize={0.022}
        color="#1a1004"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        maxWidth={0.34}
      >
        {title}
      </Text>
      <Text
        position={[0, 0.0, 0.005]}
        fontSize={0.014}
        color="#2a1808"
        anchorX="center"
        anchorY="middle"
        fontStyle="italic"
      >
        {artist} · {year}
      </Text>
      <Text
        position={[0, -0.028, 0.005]}
        fontSize={0.01}
        color="#3a2810"
        anchorX="center"
        anchorY="middle"
      >
        {medium}
      </Text>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Museum bench — two leather cushions on a brass frame, center of room
   ═══════════════════════════════════════════════════════════════════ */
export function MuseumBench() {
  const LEATHER = '#3a2820'
  const LEATHER_LIGHT = '#5a3c2a'
  const BRASS = '#c8a448'

  // Positioned between the center exhibit and the front-left of the room
  // so it doesn't clash with the existing VelvetRope / GestureGalleryExhibit.
  return (
    <group position={[0, 0, 2.5]}>
      {/* Leather cushion — two side-by-side panels */}
      {[-0.42, 0.42].map((x, i) => (
        <group key={i} position={[x, 0.45, 0]}>
          <mesh>
            <boxGeometry args={[0.8, 0.12, 0.6]} />
            <meshStandardMaterial color={LEATHER} roughness={0.7} />
          </mesh>
          {/* Button tufting — 6 small indents per cushion */}
          {[-0.25, 0, 0.25].map((cx) =>
            [-0.18, 0.18].map((cz) => (
              <mesh key={`${cx}-${cz}`} position={[cx, 0.055, cz]}>
                <sphereGeometry args={[0.015, 8, 6]} />
                <meshStandardMaterial color={LEATHER_LIGHT} roughness={0.7} />
              </mesh>
            )),
          )}
        </group>
      ))}
      {/* Brass frame rails under the cushions */}
      {[[-0.42, -0.27], [-0.42, 0.27], [0.42, -0.27], [0.42, 0.27]].map(
        ([x, z], i) => (
          <mesh key={i} position={[x, 0.2, z]}>
            <cylinderGeometry args={[0.018, 0.018, 0.4, 10]} />
            <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
          </mesh>
        ),
      )}
      {/* Horizontal brass cross-bars */}
      <mesh position={[0, 0.38, -0.27]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 1.65, 10]} />
        <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.38, 0.27]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.014, 0.014, 1.65, 10]} />
        <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
      </mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Framed painting composite — canvas + frame + spotlight + plaque
   ═══════════════════════════════════════════════════════════════════ */
type PaintingKey = 'starry' | 'mona' | 'lilies'

interface PaintingProps {
  position: [number, number, number]
  rotation: [number, number, number]
  painting: PaintingKey
}

const PLAQUE_INFO: Record<
  PaintingKey,
  { title: string; artist: string; year: string; medium: string }
> = {
  starry: {
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    year: '1889',
    medium: "Oil on canvas · Museum of Modern Art",
  },
  mona: {
    title: 'Mona Lisa',
    artist: 'Leonardo da Vinci',
    year: 'c. 1503',
    medium: "Oil on poplar panel · Louvre",
  },
  lilies: {
    title: 'Water Lilies',
    artist: 'Claude Monet',
    year: 'c. 1906',
    medium: "Oil on canvas · Musée d'Orsay",
  },
}

function FramedPainting({ position, rotation, painting }: PaintingProps) {
  const info = PLAQUE_INFO[painting]
  const starryTex = useStarryNightTex()
  const monaTex = useMonaLisaTex()
  const liliesTex = useWaterLiliesTex()

  // Mona is tall portrait, others are landscape
  const isPortrait = painting === 'mona'
  const w = isPortrait ? 0.85 : 1.2
  const h = isPortrait ? 1.1 : 0.9

  const tex =
    painting === 'starry' ? starryTex : painting === 'mona' ? monaTex : liliesTex

  return (
    <group position={position} rotation={rotation}>
      <PaintingCanvas tex={tex} width={w} height={h} />
      <GiltFrame width={w} height={h} />

      {/* Plaque hanging below the frame */}
      <group position={[0, -h / 2 - 0.17, 0.01]}>
        <BrassPlaque
          title={info.title}
          artist={info.artist}
          year={info.year}
          medium={info.medium}
        />
      </group>
    </group>
  )
}

export function Paintings() {
  return (
    <>
      <FramedPainting
        painting="starry"
        position={[-2.95, 2.5, -2]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <FramedPainting
        painting="mona"
        position={[2.95, 2.4, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      <FramedPainting
        painting="lilies"
        position={[0, 2.5, -4.95]}
        rotation={[0, 0, 0]}
      />
    </>
  )
}
