import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'

// 生果檔 (fruit stall) — blocks the dead end of the deep alley segment.
// Player walks up to z=-28 and physically can't continue. The fruit stall
// is the punctuation. Street-only — no walk-in.
//
// Deep segment axis is x=-2; the stall spans the alley width fully.
const FS = {
  zNear: -28,
  zFar: -30,
  zMid: -29,
  xCenter: -2,
}

export function FruitStall() {
  return (
    <group>
      <FruitSignBoard />
      <CrateStacks />
      <BambooBaskets />
      <CardboardBoxes />
      <SpilledFruitOnRoad />
      <OwnerStool />
      <HandScale />
      <PlasticBag />
      <FruitFlies />
    </group>
  )
}

function FruitSignBoard() {
  // Hand-painted "生果" sign hanging from a rusted bar tied with hemp rope.
  // 果 character is half-faded per spec.
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128; c.height = 64
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#d8c098'
    ctx.fillRect(0, 0, 128, 64)
    ctx.fillStyle = '#a01818'
    ctx.font = 'bold 48px serif'
    ctx.textAlign = 'center'
    ctx.fillText('生', 35, 50)
    ctx.globalAlpha = 0.5
    ctx.fillText('果', 90, 50)
    return new THREE.CanvasTexture(c)
  }, [])
  return (
    <group position={[FS.xCenter, 2.4, FS.zNear - 0.3]}>
      {/* Rusted hanging bar */}
      <mesh position={[0, 0.2, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.015, 0.015, 1.4, 8]} />
        <meshStandardMaterial color={'#5a3a20'} roughness={0.8} metalness={0.4} />
      </mesh>
      {/* Hemp rope hangers (2 sides) */}
      {[-0.3, 0.3].map((xOff, i) => (
        <mesh key={i} position={[xOff, 0.05, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.3, 4]} />
          <meshStandardMaterial color={'#a08858'} />
        </mesh>
      ))}
      {/* Sign board */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.8, 0.4, 0.04]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
    </group>
  )
}

function CrateStacks() {
  // 8 wooden crates stacked 2 cols × 4 rows + apples on top.
  return (
    <group>
      <instancedMesh
        args={[undefined, undefined, 8]}
        ref={(ref) => {
          if (!ref) return
          const m = new THREE.Matrix4()
          let idx = 0
          for (let col = 0; col < 2; col++) {
            for (let row = 0; row < 4; row++) {
              m.makeTranslation(
                FS.xCenter - 0.4 + col * 0.45,
                0.15 + row * 0.3,
                FS.zNear - 0.7
              )
              ref.setMatrixAt(idx++, m)
            }
          }
          ref.instanceMatrix.needsUpdate = true
        }}
      >
        <boxGeometry args={[0.4, 0.28, 0.4]} />
        <meshStandardMaterial color={'#8a5828'} roughness={0.9} />
      </instancedMesh>

      {/* Apples on the topmost crates — 24 instanced spheres */}
      <instancedMesh
        args={[undefined, undefined, 24]}
        ref={(ref) => {
          if (!ref) return
          const m = new THREE.Matrix4()
          for (let col = 0; col < 2; col++) {
            for (let i = 0; i < 12; i++) {
              const angle = (i / 12) * Math.PI * 2
              m.makeTranslation(
                FS.xCenter - 0.4 + col * 0.45 + Math.cos(angle) * 0.12,
                1.35,
                FS.zNear - 0.7 + Math.sin(angle) * 0.12
              )
              ref.setMatrixAt(col * 12 + i, m)
            }
          }
          ref.instanceMatrix.needsUpdate = true
        }}
      >
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshStandardMaterial color={'#d04030'} roughness={0.5} />
      </instancedMesh>
    </group>
  )
}

function BambooBaskets() {
  // 6 baskets at lower level — bananas, papaya, watermelon halves.
  return (
    <group>
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={i} position={[
          FS.xCenter - 0.6 + (i % 3) * 0.4,
          0.05,
          FS.zNear - 0.3 + Math.floor(i / 3) * 0.25,
        ]}>
          {/* Basket — open cylinder */}
          <mesh>
            <cylinderGeometry args={[0.18, 0.16, 0.1, 12]} />
            <meshStandardMaterial color={'#8a6840'} roughness={0.9} />
          </mesh>
          {/* Fruit varies by basket */}
          {i % 3 === 0 && (
            // Bananas (yellow rectangle bunch)
            <mesh position={[0, 0.06, 0]}>
              <boxGeometry args={[0.25, 0.04, 0.08]} />
              <meshStandardMaterial color={'#d8b830'} roughness={0.7} />
            </mesh>
          )}
          {i % 3 === 1 && (
            // Papaya (orange ellipsoid)
            <mesh position={[0, 0.05, 0]} scale={[1.6, 0.7, 1]}>
              <sphereGeometry args={[0.1, 12, 8]} />
              <meshStandardMaterial color={'#e88838'} roughness={0.6} />
            </mesh>
          )}
          {i % 3 === 2 && (
            // Watermelon half — green outside + red flat top
            <group>
              <mesh position={[0, 0.06, 0]}>
                <sphereGeometry args={[0.15, 14, 10]} />
                <meshStandardMaterial color={'#2a5a28'} roughness={0.6} />
              </mesh>
              <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.13, 14]} />
                <meshStandardMaterial color={'#d04848'} roughness={0.5} />
              </mesh>
            </group>
          )}
        </group>
      ))}
    </group>
  )
}

function CardboardBoxes() {
  // 4 cardboard boxes on the ground — durian + mangosteen.
  return (
    <group>
      {Array.from({ length: 4 }).map((_, i) => (
        <mesh key={i} position={[
          FS.xCenter + 0.2 + (i % 2) * 0.3,
          0.08,
          FS.zNear - 0.3 + Math.floor(i / 2) * 0.3,
        ]}>
          <boxGeometry args={[0.28, 0.16, 0.28]} />
          <meshStandardMaterial color={'#a87a48'} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function SpilledFruitOnRoad() {
  // Wet floor patch + 12 instanced lychees scattered on the road.
  return (
    <group>
      {/* Wet glistening floor patch — darker overlay */}
      <mesh position={[FS.xCenter, 0.001, FS.zNear + 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.4, 1.0]} />
        <meshStandardMaterial color={'#1a1610'} roughness={0.4} />
      </mesh>
      {/* Lychees instanced — small red spheres */}
      <instancedMesh
        args={[undefined, undefined, 12]}
        ref={(ref) => {
          if (!ref) return
          const m = new THREE.Matrix4()
          // Deterministic positions based on index so it doesn't shift on re-render
          for (let i = 0; i < 12; i++) {
            const seedX = ((i * 2347) % 1000) / 1000 - 0.5
            const seedZ = ((i * 9173) % 1000) / 1000
            m.makeTranslation(
              FS.xCenter + seedX * 1.2,
              0.025,
              FS.zNear + 0.3 + seedZ * 0.6
            )
            ref.setMatrixAt(i, m)
          }
          ref.instanceMatrix.needsUpdate = true
        }}
      >
        <sphereGeometry args={[0.02, 6, 4]} />
        <meshStandardMaterial color={'#a83030'} roughness={0.6} />
      </instancedMesh>
    </group>
  )
}

function OwnerStool() {
  // Red plastic stool, knocked slightly askew (the still-warm cue).
  return (
    <group position={[FS.xCenter + 0.6, 0, FS.zNear - 0.5]} rotation={[0, 0.3, 0]}>
      <mesh position={[0, 0.18, 0]}>
        <boxGeometry args={[0.22, 0.04, 0.22]} />
        <meshStandardMaterial color={'#c01818'} roughness={0.6} />
      </mesh>
      {[[-0.08, -0.08], [0.08, -0.08], [-0.08, 0.08], [0.08, 0.08]].map((p, i) => (
        <mesh key={i} position={[p[0], 0.09, p[1]]}>
          <cylinderGeometry args={[0.012, 0.012, 0.18, 6]} />
          <meshStandardMaterial color={'#a01010'} roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function HandScale() {
  // Old hand-scale: wood bar + rope + metal pan
  return (
    <group position={[FS.xCenter - 0.6, 1.2, FS.zNear - 0.4]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.008, 0.008, 0.4, 6]} />
        <meshStandardMaterial color={'#5a3820'} />
      </mesh>
      <mesh position={[0, -0.15, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 0.3, 4]} />
        <meshStandardMaterial color={'#a08858'} />
      </mesh>
      <mesh position={[0, -0.32, 0]} rotation={[Math.PI, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.06, 0.04, 12]} />
        <meshStandardMaterial color={'#a89888'} metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  )
}

function PlasticBag() {
  // Red-white-blue striped 紅白藍 bag hanging on a hook
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 64; c.height = 64
    const ctx = c.getContext('2d')!
    const colors = ['#c01818', '#f0f0f0', '#1850a0']
    for (let i = 0; i < 16; i++) {
      ctx.fillStyle = colors[i % 3]
      ctx.fillRect(0, i * 4, 64, 4)
    }
    return new THREE.CanvasTexture(c)
  }, [])
  return (
    <mesh position={[FS.xCenter + 0.7, 1.3, FS.zNear - 0.3]}>
      <planeGeometry args={[0.25, 0.4]} />
      <meshStandardMaterial map={tex} side={THREE.DoubleSide} roughness={0.8} />
    </mesh>
  )
}

function FruitFlies() {
  // 20 tiny dark specks orbiting the rotting fruit.
  const refs = useRef<(THREE.Mesh | null)[]>([])
  useFrame(() => {
    refs.current.forEach((m, i) => {
      if (!m) return
      const t = performance.now() * 0.001 + i * 0.5
      m.position.x = FS.xCenter + Math.sin(t * (1 + i * 0.1)) * 0.3
      m.position.y = 0.5 + Math.cos(t * 1.3) * 0.2
      m.position.z = FS.zNear - 0.3 + Math.cos(t * (0.8 + i * 0.05)) * 0.3
    })
  })
  return (
    <group>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh key={i} ref={(r) => { refs.current[i] = r }}>
          <sphereGeometry args={[0.005, 4, 3]} />
          <meshStandardMaterial color={'#1a1410'} />
        </mesh>
      ))}
    </group>
  )
}
