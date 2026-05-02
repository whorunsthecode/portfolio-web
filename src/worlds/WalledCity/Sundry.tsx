import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

// 士多 (sundry shop) — left side of entrance segment, z=-5 to -8.
// Look-only: the player peeks through the half-pulled iron gate but
// doesn't enter. Floor-to-ceiling shelves of period goods, a counter
// with abacus + black rotary phone + ice-box fridge, and 2 wooden chairs
// on the alley out front for the sit-and-chat moment.

const SHOP_Z_NEAR = -5
const SHOP_Z_FAR = -8
const SHOP_Z_MID = (SHOP_Z_NEAR + SHOP_Z_FAR) / 2
const SHOP_LENGTH = Math.abs(SHOP_Z_FAR - SHOP_Z_NEAR)
const SHOP_X_DOORWAY = -0.9   // alley left wall plane (matches AlleyShell)
const SHOP_X_BACK = -2.4      // 1.5m deep interior
const SHOP_X_MID = (SHOP_X_DOORWAY + SHOP_X_BACK) / 2
const SHOP_DEPTH = Math.abs(SHOP_X_BACK - SHOP_X_DOORWAY)
const SHOP_CEILING = 2.8

export function Sundry() {
  return (
    <group>
      <SundryShell />
      <SundryGate />
      <SundryHangingBulb />
      <SundryLaceFringe />
      <SundryShelves />
      <SundryCounter />
      <SundryOutdoorSeating />
      <SundrySignage />
    </group>
  )
}

// ── Signage / branding so the shop reads as a 1985-HK 士多 ─────────────
// Without these, the interior is just shelves of geometric primitives and
// looks like a generic candle shop. The signage gives it identity:
//   1. Big red 士多 SUNDRY board on the alley wall above the gate
//   2. Coca-Cola red decal on the fridge glass
//   3. 1985 月曆 wall calendar on the back wall
//   4. 煙仔 / CIGARETTES tobacco header strip above the cigarette shelf

function SundrySignage() {
  const signboardTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 128
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#a01818'
    ctx.fillRect(0, 0, 512, 128)
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 128
      const r = 10 + Math.random() * 40
      const grad = ctx.createRadialGradient(x, y, 0, x, y, r)
      grad.addColorStop(0, 'rgba(0,0,0,0.18)')
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#f0d860'
    ctx.font = 'bold 80px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('士  多', 256, 50)
    ctx.font = 'bold 28px sans-serif'
    ctx.fillText('SUNDRY', 256, 100)
    return new THREE.CanvasTexture(c)
  }, [])

  const cokeTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256; c.height = 256
    const ctx = c.getContext('2d')!
    ctx.clearRect(0, 0, 256, 256)
    ctx.fillStyle = '#c81818'
    ctx.beginPath()
    ctx.ellipse(128, 128, 110, 90, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = '#f8f0e8'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.moveTo(40, 110)
    ctx.bezierCurveTo(80, 90, 180, 130, 220, 110)
    ctx.stroke()
    ctx.fillStyle = '#f8f0e8'
    ctx.font = 'italic bold 38px serif'
    ctx.textAlign = 'center'
    ctx.fillText('Coca-Cola', 128, 145)
    ctx.font = 'bold 18px serif'
    ctx.fillText('可口可樂', 128, 175)
    return new THREE.CanvasTexture(c)
  }, [])

  const calendarTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256; c.height = 384
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#f0e4c8'
    ctx.fillRect(0, 0, 256, 384)
    ctx.fillStyle = '#c81818'
    ctx.fillRect(0, 0, 256, 60)
    ctx.fillStyle = '#f8f0e8'
    ctx.font = 'bold 36px serif'
    ctx.textAlign = 'center'
    ctx.fillText('1985 月曆', 128, 42)
    ctx.fillStyle = '#3a2a20'
    ctx.beginPath()
    ctx.ellipse(128, 160, 60, 70, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.ellipse(128, 240, 50, 50, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = '#1a1410'
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 7; col++) {
        ctx.fillRect(20 + col * 32, 320 + row * 12, 24, 8)
      }
    }
    ctx.fillStyle = '#a01818'
    ctx.fillRect(20, 320, 24, 8)
    return new THREE.CanvasTexture(c)
  }, [])

  const tobaccoTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 64
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#fff0c0'
    ctx.fillRect(0, 0, 512, 64)
    ctx.fillStyle = '#a01818'
    ctx.font = 'bold 42px serif'
    ctx.textAlign = 'center'
    ctx.fillText('煙  仔  •  CIGARETTES  •  萬寶路', 256, 46)
    return new THREE.CanvasTexture(c)
  }, [])

  return (
    <group>
      {/* 士多 signboard above the gate, on the alley wall, facing into the alley (+X) */}
      <mesh
        position={[SHOP_X_DOORWAY + 0.005, SHOP_CEILING + 0.25, SHOP_Z_MID]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[SHOP_LENGTH - 0.15, 0.65]} />
        <meshStandardMaterial color={'#1a1006'} side={THREE.DoubleSide} />
      </mesh>
      <mesh
        position={[SHOP_X_DOORWAY + 0.02, SHOP_CEILING + 0.25, SHOP_Z_MID]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[SHOP_LENGTH - 0.2, 0.6]} />
        <meshStandardMaterial map={signboardTex} side={THREE.DoubleSide} />
      </mesh>

      {/* Coca-Cola decal on fridge glass.
          Fridge centre = (counterCenterX + 0.45, 0.45, counterZ)
            counterCenterX = (-0.9 + -2.4)/2 = -1.65 → fridge x = -1.2
            counterZ      = SHOP_Z_FAR + 0.2 = -7.8
            glass face    = counterZ + 0.21 = -7.59 (faces +Z toward doorway)
          We sit just in front of the glass (z = -7.58). */}
      <mesh position={[-1.2, 0.55, -7.58]}>
        <planeGeometry args={[0.28, 0.28]} />
        <meshStandardMaterial map={cokeTex} transparent alphaTest={0.05}
          roughness={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* 1985 月曆 calendar on back wall */}
      <mesh
        position={[SHOP_X_BACK + 0.005, 1.6, SHOP_Z_NEAR + 0.5]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[0.28, 0.42]} />
        <meshStandardMaterial map={calendarTex} side={THREE.DoubleSide} roughness={0.85} />
      </mesh>

      {/* 煙仔 / CIGARETTES tobacco strip just above the cigarette shelf */}
      <mesh
        position={[SHOP_X_BACK + 0.29, 1.5 + 0.14, SHOP_Z_MID]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <planeGeometry args={[SHOP_LENGTH - 0.2, 0.08]} />
        <meshStandardMaterial map={tobaccoTex} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function SundryShell() {
  return (
    <group>
      {/* Floor — small green mosaic tile per spec */}
      <mesh position={[SHOP_X_MID, 0.005, SHOP_Z_MID]}
        rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[SHOP_DEPTH, SHOP_LENGTH]} />
        <meshStandardMaterial color={'#3a5848'} roughness={0.85} />
      </mesh>
      {/* Back wall (interior far side) */}
      <mesh position={[SHOP_X_BACK, SHOP_CEILING / 2, SHOP_Z_MID]}
        rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[SHOP_LENGTH, SHOP_CEILING]} />
        <meshStandardMaterial color={'#3a3530'} roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      {/* Two side walls perpendicular to alley */}
      {[SHOP_Z_NEAR, SHOP_Z_FAR].map((z, i) => (
        <mesh key={i} position={[SHOP_X_MID, SHOP_CEILING / 2, z]}>
          <planeGeometry args={[SHOP_DEPTH, SHOP_CEILING]} />
          <meshStandardMaterial color={'#3a3530'} roughness={0.92} side={THREE.DoubleSide} />
        </mesh>
      ))}
      {/* Ceiling */}
      <mesh position={[SHOP_X_MID, SHOP_CEILING, SHOP_Z_MID]}
        rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[SHOP_DEPTH, SHOP_LENGTH]} />
        <meshStandardMaterial color={'#2a2520'} roughness={0.95} />
      </mesh>
    </group>
  )
}

function SundryGate() {
  // Iron rolling gate, half-pulled. Upper roll under the eave + lower
  // curtain hanging down to ~y=1.0.
  return (
    <group>
      {/* Upper roll cylinder */}
      <mesh position={[SHOP_X_DOORWAY + 0.05, SHOP_CEILING - 0.15, SHOP_Z_MID]}
        rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, SHOP_LENGTH - 0.2, 12]} />
        <meshStandardMaterial color={'#4a3a2a'} metalness={0.5} roughness={0.6} />
      </mesh>
      {/* Lower curtain still down — corrugated metal slab */}
      <mesh position={[SHOP_X_DOORWAY + 0.02, 0.5, SHOP_Z_MID]}>
        <boxGeometry args={[0.04, 1.0, SHOP_LENGTH - 0.2]} />
        <meshStandardMaterial color={'#3a2c20'} metalness={0.4} roughness={0.7} />
      </mesh>
    </group>
  )
}

function SundryHangingBulb() {
  // Bare bulb under the eave, swaying barely-perceptibly. Provides the
  // shop's primary light source and reads as the diegetic shop "presence."
  const bulbRef = useRef<THREE.Group>(null)
  useFrame(() => {
    if (!bulbRef.current) return
    bulbRef.current.rotation.z = Math.sin(performance.now() * 0.0008) * 0.04
  })
  return (
    <group ref={bulbRef} position={[SHOP_X_DOORWAY - 0.3, SHOP_CEILING - 0.05, SHOP_Z_MID]}>
      <mesh position={[0, -0.25, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.5, 4]} />
        <meshStandardMaterial color={'#1a1410'} />
      </mesh>
      <mesh position={[0, -0.55, 0]}>
        <sphereGeometry args={[0.05, 12, 8]} />
        <meshStandardMaterial color={'#fff0c0'} emissive={'#ffe080'} emissiveIntensity={2.5} />
      </mesh>
      <pointLight position={[0, -0.55, 0]} color={'#ffd890'} intensity={1.4} distance={3.5} decay={2} />
    </group>
  )
}

function SundryLaceFringe() {
  // White lace-fringe trim along the counter front (period detail per ref).
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 512; c.height = 32
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#fff8e8'
    ctx.fillRect(0, 0, 512, 32)
    ctx.fillStyle = '#3a3530'
    for (let i = 0; i < 16; i++) {
      ctx.beginPath()
      ctx.arc(i * 32 + 16, 32, 14, 0, Math.PI)
      ctx.fill()
    }
    return new THREE.CanvasTexture(c)
  }, [])
  return (
    <mesh position={[SHOP_X_DOORWAY - 0.3, 0.95, SHOP_Z_MID]}
      rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[SHOP_LENGTH - 0.3, 0.06]} />
      <meshStandardMaterial map={tex} transparent alphaTest={0.4} side={THREE.DoubleSide} />
    </mesh>
  )
}

function SundryShelves() {
  // 4 shelves on the BACK WALL stacked floor-to-ceiling per references.
  // Bottom: glass jars of bulk goods. Lower-middle: cans (午餐肉 style).
  // Upper-middle: cigarette boxes. Top: round red biscuit tins.
  const shelfHeights = [0.4, 0.95, 1.5, 2.05]
  const shelfDepth = 0.25
  const shelfFrontX = SHOP_X_BACK + shelfDepth + 0.02

  return (
    <group>
      {/* Shelf planks */}
      {shelfHeights.map((y, i) => (
        <mesh key={i} position={[SHOP_X_BACK + shelfDepth / 2 + 0.02, y, SHOP_Z_MID]}>
          <boxGeometry args={[shelfDepth, 0.025, SHOP_LENGTH - 0.1]} />
          <meshStandardMaterial color={'#3a2820'} roughness={0.85} />
        </mesh>
      ))}

      {/* Bottom shelf — 4 glass jars of bulk candy/dried fruit */}
      <instancedMesh
        args={[undefined, undefined, 4]}
        ref={(ref) => {
          if (!ref) return
          const m = new THREE.Matrix4()
          for (let i = 0; i < 4; i++) {
            const z = SHOP_Z_FAR + 0.4 + (i / 3) * (SHOP_LENGTH - 0.8)
            m.makeTranslation(shelfFrontX - 0.07, shelfHeights[0] + 0.12, z)
            ref.setMatrixAt(i, m)
          }
          ref.instanceMatrix.needsUpdate = true
        }}
      >
        <cylinderGeometry args={[0.07, 0.07, 0.18, 12]} />
        <meshStandardMaterial color={'#d8c890'} transparent opacity={0.6} roughness={0.2} />
      </instancedMesh>

      {/* Lower-middle shelf — 12 cans across two rows */}
      <instancedMesh
        args={[undefined, undefined, 12]}
        ref={(ref) => {
          if (!ref) return
          const m = new THREE.Matrix4()
          for (let i = 0; i < 12; i++) {
            const z = SHOP_Z_FAR + 0.15 + (i / 11) * (SHOP_LENGTH - 0.3)
            const x = shelfFrontX - 0.05 - (i % 2) * 0.06
            m.makeTranslation(x, shelfHeights[1] + 0.07, z)
            ref.setMatrixAt(i, m)
          }
          ref.instanceMatrix.needsUpdate = true
        }}
      >
        <cylinderGeometry args={[0.03, 0.03, 0.09, 10]} />
        <meshStandardMaterial color={'#9a3020'} roughness={0.6} metalness={0.3} />
      </instancedMesh>

      {/* Upper-middle shelf — 18 cigarette boxes in 3 staggered rows */}
      <instancedMesh
        args={[undefined, undefined, 18]}
        ref={(ref) => {
          if (!ref) return
          const m = new THREE.Matrix4()
          for (let i = 0; i < 18; i++) {
            const z = SHOP_Z_FAR + 0.18 + (i / 17) * (SHOP_LENGTH - 0.36)
            const x = shelfFrontX - 0.04 - (i % 3) * 0.04
            m.makeTranslation(x, shelfHeights[2] + 0.05, z)
            ref.setMatrixAt(i, m)
          }
          ref.instanceMatrix.needsUpdate = true
        }}
      >
        <boxGeometry args={[0.04, 0.07, 0.025]} />
        <meshStandardMaterial color={'#f0eee8'} roughness={0.7} />
      </instancedMesh>

      {/* Top shelf — 4 tall round red biscuit tins as visual repetition */}
      <instancedMesh
        args={[undefined, undefined, 4]}
        ref={(ref) => {
          if (!ref) return
          const m = new THREE.Matrix4()
          for (let i = 0; i < 4; i++) {
            const z = SHOP_Z_FAR + 0.5 + (i / 3) * (SHOP_LENGTH - 1.0)
            m.makeTranslation(shelfFrontX - 0.1, shelfHeights[3] + 0.18, z)
            ref.setMatrixAt(i, m)
          }
          ref.instanceMatrix.needsUpdate = true
        }}
      >
        <cylinderGeometry args={[0.08, 0.08, 0.32, 14]} />
        <meshStandardMaterial color={'#a01818'} roughness={0.5} metalness={0.4} />
      </instancedMesh>
    </group>
  )
}

function SundryCounter() {
  // Counter sits along the FAR side wall (z=SHOP_Z_FAR), facing toward the
  // doorway. Length runs along X (interior depth direction). Holds the
  // red abacus, black rotary phone, fridge with bottle opener + sodas.
  const counterY = 0.85
  const counterZ = SHOP_Z_FAR + 0.2  // 0.2m off the far wall
  const counterLength = SHOP_DEPTH - 0.1
  const counterCenterX = (SHOP_X_DOORWAY + SHOP_X_BACK) / 2

  return (
    <group>
      {/* Counter slab */}
      <mesh position={[counterCenterX, counterY, counterZ]}>
        <boxGeometry args={[counterLength, 0.04, 0.4]} />
        <meshStandardMaterial color={'#3a2820'} roughness={0.7} />
      </mesh>
      {/* Counter front panel facing into shop */}
      <mesh position={[counterCenterX, counterY / 2, counterZ + 0.18]}>
        <boxGeometry args={[counterLength, counterY, 0.04]} />
        <meshStandardMaterial color={'#3a3028'} roughness={0.85} />
      </mesh>

      {/* Red abacus — frame + bead grid (instanced beads) */}
      <group position={[counterCenterX - 0.4, counterY + 0.04, counterZ]}>
        <mesh>
          <boxGeometry args={[0.3, 0.16, 0.04]} />
          <meshStandardMaterial color={'#5a1818'} roughness={0.6} />
        </mesh>
        <instancedMesh
          args={[undefined, undefined, 30]}
          ref={(ref) => {
            if (!ref) return
            const m = new THREE.Matrix4()
            for (let row = 0; row < 5; row++) {
              for (let col = 0; col < 6; col++) {
                m.makeTranslation(-0.13 + col * 0.05, -0.06 + row * 0.03, 0.025)
                ref.setMatrixAt(row * 6 + col, m)
              }
            }
            ref.instanceMatrix.needsUpdate = true
          }}
        >
          <sphereGeometry args={[0.012, 6, 4]} />
          <meshStandardMaterial color={'#1a0a08'} roughness={0.5} />
        </instancedMesh>
      </group>

      {/* Black rotary phone */}
      <group position={[counterCenterX + 0.05, counterY + 0.04, counterZ]}>
        <mesh>
          <boxGeometry args={[0.18, 0.07, 0.12]} />
          <meshStandardMaterial color={'#1a1410'} roughness={0.4} />
        </mesh>
        {/* Handset cradle bumps */}
        <mesh position={[0, 0.05, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.018, 0.018, 0.16, 8]} />
          <meshStandardMaterial color={'#1a1410'} roughness={0.4} />
        </mesh>
      </group>

      {/* Fridge with sodas + bottle opener on string */}
      <group position={[counterCenterX + 0.45, 0.45, counterZ]}>
        {/* Fridge body */}
        <mesh>
          <boxGeometry args={[0.4, 0.9, 0.4]} />
          <meshStandardMaterial color={'#d8d0c0'} roughness={0.5} metalness={0.2} />
        </mesh>
        {/* Glass door (slightly translucent) */}
        <mesh position={[0, 0, 0.21]}>
          <planeGeometry args={[0.36, 0.86]} />
          <meshStandardMaterial color={'#a8c8d8'} transparent opacity={0.55} roughness={0.1} />
        </mesh>
        {/* 6 soda bottles inside, instanced */}
        <instancedMesh
          args={[undefined, undefined, 6]}
          ref={(ref) => {
            if (!ref) return
            const m = new THREE.Matrix4()
            for (let i = 0; i < 6; i++) {
              const row = Math.floor(i / 3)
              const col = i % 3
              m.makeTranslation(-0.1 + col * 0.1, -0.2 + row * 0.25, 0)
              ref.setMatrixAt(i, m)
            }
            ref.instanceMatrix.needsUpdate = true
          }}
        >
          <cylinderGeometry args={[0.025, 0.025, 0.18, 8]} />
          <meshStandardMaterial color={'#3a6048'} roughness={0.3} transparent opacity={0.85} />
        </instancedMesh>
        {/* Cool emissive glow inside so bottles read through glass */}
        <pointLight position={[0, 0, 0]} color={'#d8e8f0'} intensity={0.6} distance={0.6} decay={2} />
        {/* Bottle opener — small metal rectangle on string */}
        <mesh position={[0.21, 0.3, 0.21]}>
          <boxGeometry args={[0.04, 0.08, 0.005]} />
          <meshStandardMaterial color={'#888078'} metalness={0.7} roughness={0.4} />
        </mesh>
        <mesh position={[0.21, 0.4, 0.21]}>
          <cylinderGeometry args={[0.001, 0.001, 0.2, 4]} />
          <meshStandardMaterial color={'#d8c890'} />
        </mesh>
      </group>
    </group>
  )
}

function SundryOutdoorSeating() {
  // 2 worn wooden chairs on the alley floor outside the gate, with empty
  // teacups on a small wooden crate between them. The "sit-and-chat" beat
  // (per ref img 3 of the user's first batch).
  const chairY = 0.22
  return (
    <group>
      {[-0.5, 0.5].map((zOff, i) => (
        <group key={i} position={[SHOP_X_DOORWAY + 0.4, 0, SHOP_Z_MID + zOff]}>
          {/* Seat */}
          <mesh position={[0, chairY, 0]}>
            <boxGeometry args={[0.3, 0.04, 0.3]} />
            <meshStandardMaterial color={'#5a3a20'} roughness={0.85} />
          </mesh>
          {/* 4 legs */}
          {[[-0.13, -0.13], [0.13, -0.13], [-0.13, 0.13], [0.13, 0.13]].map((p, j) => (
            <mesh key={j} position={[p[0], chairY / 2, p[1]]}>
              <cylinderGeometry args={[0.015, 0.018, chairY, 6]} />
              <meshStandardMaterial color={'#3a2810'} roughness={0.9} />
            </mesh>
          ))}
          {/* Backrest */}
          <mesh position={[0, chairY + 0.18, -0.13]}>
            <boxGeometry args={[0.3, 0.36, 0.02]} />
            <meshStandardMaterial color={'#5a3a20'} roughness={0.85} />
          </mesh>
        </group>
      ))}
      {/* Crate between the chairs */}
      <mesh position={[SHOP_X_DOORWAY + 0.4, 0.15, SHOP_Z_MID]}>
        <boxGeometry args={[0.3, 0.3, 0.3]} />
        <meshStandardMaterial color={'#6a4828'} roughness={0.9} />
      </mesh>
      {/* 2 teacups on the crate */}
      {[-0.08, 0.08].map((zOff, i) => (
        <mesh key={i} position={[SHOP_X_DOORWAY + 0.4, 0.32, SHOP_Z_MID + zOff]}>
          <cylinderGeometry args={[0.025, 0.022, 0.04, 8]} />
          <meshStandardMaterial color={'#f0e8d8'} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}
