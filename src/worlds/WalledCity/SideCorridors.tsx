import { useMemo } from 'react'
import * as THREE from 'three'

// Short dead-end side corridors carved out of the alley walls. They're
// 1m wide × 2m deep, with a 2.2m ceiling, and each ends in a single
// atmospheric beat: a glowing window or a jumbled knot of hung laundry.
// Zero gameplay payoff — they're here to sell the "city keeps going
// around the corner" feeling.

export interface CorridorDef {
  side: 'left' | 'right'
  z: number           // centre z along the alley
  halfWidth: number   // half of the opening width (z axis)
  depth: number       // how far the corridor extends perpendicular from the alley
  ceiling: number     // y height of corridor ceiling
  kind: 'window' | 'laundry' | 'salon' | 'false-path' | 'sign-alcove'
}

export const CORRIDORS: CorridorDef[] = [
  { side: 'left',  z: -2.5, halfWidth: 0.5, depth: 2.2, ceiling: 2.3, kind: 'laundry' },
  { side: 'right', z:  1.5, halfWidth: 0.5, depth: 2.2, ceiling: 2.3, kind: 'window' },
  // Salon doorway — Salon.tsx provides its own interior; this entry exists
  // only so AlleyShell cuts a gap in the alley right wall and the player
  // can walk through. SideCorridors skips rendering for kind:'salon'.
  { side: 'right', z: -0.4, halfWidth: 0.4, depth: 0.3, ceiling: 2.1, kind: 'salon' },
  // False-path bending out of sight at z=-12 (entrance segment, axis x=0).
  // Player sees darkness curving; if they walk in they hit a back wall.
  { side: 'right', z: -12, halfWidth: 0.5, depth: 2.0, ceiling: 2.3, kind: 'false-path' },
  // Sign-alcove at z=-25 (deep segment, axis x=-2). Hangs the iconic
  // "九龍城寨業主聯誼會" vertical wood sign. Shallow — just a side-pocket.
  { side: 'left',  z: -25, halfWidth: 0.4, depth: 1.0, ceiling: 2.3, kind: 'sign-alcove' },
]

function makeGrimyConcrete(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#322c24'
  ctx.fillRect(0, 0, size, size)
  for (let i = 0; i < 1400; i++) {
    const shade = 28 + Math.random() * 30
    ctx.fillStyle = `rgb(${shade}, ${shade - 3}, ${shade - 8})`
    ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 3, 1 + Math.random() * 3)
  }
  // Greasy streaks from the ceiling
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * size
    const top = Math.random() * size * 0.3
    const h = 200 + Math.random() * 280
    const grad = ctx.createLinearGradient(x, top, x, top + h)
    grad.addColorStop(0, 'rgba(10,8,5,0.55)')
    grad.addColorStop(1, 'rgba(10,8,5,0)')
    ctx.fillStyle = grad
    ctx.fillRect(x - 3, top, 6, h)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  return tex
}

function Corridor({ def }: { def: CorridorDef }) {
  const wallTex = useMemo(() => makeGrimyConcrete(512), [])

  // Side convention: the corridor extends AWAY from the alley in the ±X
  // direction depending on which alley wall it opens from.
  const outward = def.side === 'left' ? -1 : 1
  // Alley axis depends on which segment this corridor sits in: entrance
  // segment is centered at x=0; deep segment (z<-16) is centered at x=-2.
  const segmentCenterX = def.z < -16 ? -2 : 0
  // x at the alley wall (opening plane)
  const alleyWallX = segmentCenterX + (def.side === 'left' ? -0.9 : 0.9)
  // x at the corridor's far end wall
  const farWallX = alleyWallX + outward * def.depth
  const midX = (alleyWallX + farWallX) / 2
  const w = def.halfWidth * 2        // opening width along z
  const centreZ = def.z
  const ceiling = def.ceiling

  return (
    <group>
      {/* Floor */}
      <mesh position={[midX, 0, centreZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[def.depth, w]} />
        <meshStandardMaterial color={'#1e1a14'} roughness={0.95} />
      </mesh>
      {/* Ceiling */}
      <mesh position={[midX, ceiling, centreZ]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[def.depth, w]} />
        <meshStandardMaterial color={'#1a1610'} roughness={0.95} />
      </mesh>
      {/* Far end wall — the dead end, facing back into the corridor */}
      <mesh position={[farWallX, ceiling / 2, centreZ]} rotation={[0, -outward * Math.PI / 2, 0]}>
        <planeGeometry args={[w, ceiling]} />
        <meshStandardMaterial map={wallTex} color={'#2e2820'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {/* Two side walls (perpendicular to alley) — one at z=centreZ-halfW,
          one at centreZ+halfW. They span from alleyWallX to farWallX. */}
      {[-1, 1].map((s) => (
        <mesh
          key={s}
          position={[midX, ceiling / 2, centreZ + s * def.halfWidth]}
          rotation={[0, 0, 0]}
        >
          <planeGeometry args={[def.depth, ceiling]} />
          <meshStandardMaterial map={wallTex} color={'#2e2820'} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* Atmospheric fill at the dead end */}
      {def.kind === 'window' && (
        <LitWindowDecor farWallX={farWallX} centreZ={centreZ} outward={outward} />
      )}
      {def.kind === 'laundry' && (
        <LaundryKnotDecor midX={midX} farWallX={farWallX} centreZ={centreZ}
          outward={outward} ceiling={ceiling} />
      )}
      {def.kind === 'false-path' && (
        <FalsePathDecor farWallX={farWallX} centreZ={centreZ} outward={outward} ceiling={ceiling} />
      )}
      {def.kind === 'sign-alcove' && (
        <SignAlcoveDecor farWallX={farWallX} centreZ={centreZ} outward={outward} ceiling={ceiling} />
      )}

      {/* Weak ambient bulb near the corridor entrance so the opening
          reads as a dim passage rather than a black rectangle. The
          false-path corridor skips this — it's intentionally pitch-black
          so the player doesn't realize it's a dead end until they walk in. */}
      {def.kind !== 'false-path' && (
        <pointLight
          position={[alleyWallX + outward * 0.5, ceiling - 0.25, centreZ]}
          color={'#d8a060'}
          intensity={0.35}
          distance={2.5}
          decay={2}
        />
      )}
    </group>
  )
}

function LitWindowDecor({ farWallX, centreZ, outward }: {
  farWallX: number
  centreZ: number
  outward: number
}) {
  // A small amber-lit window set into the dead-end wall.
  const windowW = 0.6
  const windowH = 0.7
  return (
    <group position={[farWallX - outward * 0.01, 1.25, centreZ]}>
      {/* Window frame */}
      <mesh rotation={[0, -outward * Math.PI / 2, 0]}>
        <boxGeometry args={[windowW + 0.08, windowH + 0.08, 0.02]} />
        <meshStandardMaterial color={'#3a2a1c'} roughness={0.8} />
      </mesh>
      {/* Glowing glass */}
      <mesh rotation={[0, -outward * Math.PI / 2, 0]} position={[-outward * 0.011, 0, 0]}>
        <planeGeometry args={[windowW, windowH]} />
        <meshStandardMaterial
          color={'#d8a048'}
          emissive={'#e09040'}
          emissiveIntensity={1.3}
          roughness={0.6}
        />
      </mesh>
      {/* Grille — thin vertical bars */}
      {[-0.2, 0, 0.2].map((zOff, i) => (
        <mesh key={i} position={[-outward * 0.016, 0, zOff]} rotation={[0, -outward * Math.PI / 2, 0]}>
          <boxGeometry args={[0.012, windowH, 0.012]} />
          <meshStandardMaterial color={'#1a1410'} roughness={0.85} />
        </mesh>
      ))}
      {/* Point light in front of the glass — warm glow spilling into the
          corridor. */}
      <pointLight
        position={[-outward * 0.4, 0, 0]}
        color={'#ffa858'}
        intensity={1.4}
        distance={3.5}
        decay={2}
      />
    </group>
  )
}

function LaundryKnotDecor({ midX, farWallX, centreZ, outward, ceiling }: {
  midX: number
  farWallX: number
  centreZ: number
  outward: number
  ceiling: number
}) {
  // A tangle of half-dry laundry hanging across the corridor from two
  // strung lines. Five garments bunched together at various sag depths.
  const line1y = ceiling - 0.25
  const line2y = ceiling - 0.45
  const attachA = farWallX - outward * 0.2
  const attachB = midX - outward * 0.1
  const garmentColors = ['#d4cebc', '#5a6a88', '#b84030', '#d0a070', '#2a2a2a']
  const garments = useMemo(() => {
    return garmentColors.map((color, i) => ({
      color,
      tOnLine: 0.15 + i * 0.17,
      width: 0.28 + (i % 3) * 0.05,
      height: 0.42 + (i % 2) * 0.1,
      line: i % 2, // alternate lines
    }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const lerp = (a: number, b: number, t: number) => a + (b - a) * t

  return (
    <group>
      {/* Line 1 */}
      <mesh
        position={[(attachA + attachB) / 2, line1y, centreZ]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.005, 0.005, Math.abs(attachB - attachA), 4]} />
        <meshStandardMaterial color={'#1a1410'} />
      </mesh>
      {/* Line 2 — offset in z to form an X */}
      <mesh
        position={[(attachA + attachB) / 2, line2y, centreZ + 0.2]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <cylinderGeometry args={[0.005, 0.005, Math.abs(attachB - attachA), 4]} />
        <meshStandardMaterial color={'#1a1410'} />
      </mesh>
      {/* Garments — each draped two-sided across a line */}
      {garments.map((g, i) => {
        const y = g.line === 0 ? line1y : line2y
        const z = centreZ + (g.line === 0 ? 0 : 0.2)
        const x = lerp(attachA, attachB, g.tOnLine)
        return (
          <group key={i} position={[x, y, z]}>
            {/* Crease strip */}
            <mesh>
              <boxGeometry args={[g.width * 0.9, 0.01, 0.05]} />
              <meshStandardMaterial color={g.color} roughness={0.9} />
            </mesh>
            {/* Front drape */}
            <mesh position={[0, -g.height / 2 * 0.97, g.width * 0.22]} rotation={[0.22, 0, 0]}>
              <planeGeometry args={[g.width, g.height]} />
              <meshStandardMaterial color={g.color} roughness={0.9} side={THREE.DoubleSide} />
            </mesh>
            {/* Back drape */}
            <mesh position={[0, -g.height / 2 * 0.97, -g.width * 0.22]} rotation={[-0.22, 0, 0]}>
              <planeGeometry args={[g.width, g.height]} />
              <meshStandardMaterial color={g.color} roughness={0.9} side={THREE.DoubleSide} />
            </mesh>
          </group>
        )
      })}
      {/* Dim bare bulb at the far end so the silhouettes rim-light */}
      <mesh position={[farWallX - outward * 0.25, ceiling - 0.15, centreZ]}>
        <sphereGeometry args={[0.035, 8, 6]} />
        <meshStandardMaterial color={'#f8e4a0'} emissive={'#f8cc70'} emissiveIntensity={2.5} />
      </mesh>
      <pointLight
        position={[farWallX - outward * 0.25, ceiling - 0.2, centreZ]}
        color={'#f8cc70'}
        intensity={0.9}
        distance={3}
        decay={2}
      />
    </group>
  )
}

function FalsePathDecor({ farWallX, centreZ, outward, ceiling }: {
  farWallX: number
  centreZ: number
  outward: number
  ceiling: number
}) {
  // The illusion: dark passage that LOOKS like it bends/continues. Achieved
  // with a darker far-wall + a single VERY dim point light deep in, biased
  // toward the floor so the wall reads as "more darkness beyond" rather
  // than a flat dead end.
  return (
    <group>
      {/* Repaint the far wall darker than the corridor's default to enhance
          the depth illusion — slightly inset from the standard far wall. */}
      <mesh
        position={[farWallX - outward * 0.005, ceiling / 2, centreZ]}
        rotation={[0, -outward * Math.PI / 2, 0]}
      >
        <planeGeometry args={[0.9, ceiling]} />
        <meshStandardMaterial color={'#0a0806'} roughness={0.98} />
      </mesh>
      {/* Very dim deep light, biased toward the floor */}
      <pointLight
        position={[farWallX - outward * 0.15, 0.4, centreZ]}
        color={'#503020'}
        intensity={0.25}
        distance={1.8}
        decay={2}
      />
    </group>
  )
}

function SignAlcoveDecor({ farWallX, centreZ, outward, ceiling }: {
  farWallX: number
  centreZ: number
  outward: number
  ceiling: number
}) {
  // Vertical "九龍城寨業主聯誼會" wood sign hanging from the alcove ceiling.
  const signTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 64; c.height = 256
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#f4e8c8'
    ctx.fillRect(0, 0, 64, 256)
    // Wood grain streaks
    ctx.strokeStyle = 'rgba(120, 80, 40, 0.3)'
    ctx.lineWidth = 1
    for (let i = 0; i < 8; i++) {
      ctx.beginPath()
      ctx.moveTo(0, i * 32 + Math.random() * 6)
      ctx.lineTo(64, i * 32 + Math.random() * 6)
      ctx.stroke()
    }
    ctx.fillStyle = '#8a1a18'
    ctx.font = 'bold 32px serif'
    ctx.textAlign = 'center'
    const chars = ['九', '龍', '城', '寨', '業', '主', '聯', '誼', '會']
    chars.forEach((ch, i) => ctx.fillText(ch, 32, 30 + i * 25))
    return new THREE.CanvasTexture(c)
  }, [])

  return (
    <group>
      {/* Sign plank, hanging from the alcove ceiling */}
      <mesh position={[farWallX - outward * 0.25, ceiling - 0.9, centreZ]}>
        <boxGeometry args={[0.04, 1.4, 0.18]} />
        <meshStandardMaterial map={signTex} color={'#f0e0c0'} roughness={0.85} />
      </mesh>
      {/* Two hanging wires */}
      {[-0.06, 0.06].map((zOff, i) => (
        <mesh key={i}
          position={[farWallX - outward * 0.25, ceiling - 0.18, centreZ + zOff]}>
          <cylinderGeometry args={[0.003, 0.003, 0.4, 4]} />
          <meshStandardMaterial color={'#1a1410'} />
        </mesh>
      ))}
      {/* Warm ambient bulb to rim-light the sign */}
      <pointLight
        position={[farWallX - outward * 0.05, ceiling - 0.15, centreZ]}
        color={'#ffb878'}
        intensity={0.7}
        distance={1.8}
        decay={2}
      />
    </group>
  )
}

export function SideCorridors() {
  return (
    <>
      {/* Skip 'salon' kind — Salon.tsx provides its own interior. The
          CORRIDORS entry only exists so AlleyShell cuts a wall gap. */}
      {CORRIDORS.filter((c) => c.kind !== 'salon').map((c, i) => (
        <Corridor key={i} def={c} />
      ))}
    </>
  )
}
