import * as THREE from 'three'
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BING_SUTT } from './index'

export function Decor() {
  return (
    <group>
      {/* Shell first so other items sit on top */}
      <Floor />
      <BackWall />
      <SideWalls />
      <Ceiling />
      {/* Atmospherics + decoration */}
      <CeilingFan />
      <PendantLights />
      <Radio />
      <Painting />
      <ScreenPartition />
      <KitchenCurtain />
      <SteamPuffs />
      <PausedClock />
    </group>
  )
}

function Floor() {
  // Mosaic tile floor — small busy pattern of cyan/cream/blue per refs.
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 256; c.height = 256
    const ctx = c.getContext('2d')!
    const palette = ['#508080', '#88a8a8', '#d0c8b0', '#3870a0', '#a8b0a0']
    for (let y = 0; y < 32; y++) {
      for (let x = 0; x < 32; x++) {
        ctx.fillStyle = palette[Math.floor(Math.random() * palette.length)]
        ctx.fillRect(x * 8, y * 8, 7, 7)
      }
    }
    const t = new THREE.CanvasTexture(c)
    t.wrapS = t.wrapT = THREE.RepeatWrapping
    t.repeat.set(2, 2)
    return t
  }, [])
  return (
    <mesh position={[BING_SUTT.midX, 0.001, BING_SUTT.zMid]}
      rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[BING_SUTT.width, BING_SUTT.depth]} />
      <meshStandardMaterial map={tex} roughness={0.6} />
    </mesh>
  )
}

function BackWall() {
  return (
    <mesh position={[BING_SUTT.backWallX, BING_SUTT.ceiling / 2, BING_SUTT.zMid]}
      rotation={[0, -Math.PI / 2, 0]}>
      <planeGeometry args={[BING_SUTT.depth, BING_SUTT.ceiling]} />
      <meshStandardMaterial color={'#b8a890'} roughness={0.85} />
    </mesh>
  )
}

function SideWalls() {
  return (
    <group>
      {[BING_SUTT.zNear, BING_SUTT.zFar].map((z, i) => (
        <mesh key={i} position={[BING_SUTT.midX, BING_SUTT.ceiling / 2, z]}>
          <planeGeometry args={[BING_SUTT.width, BING_SUTT.ceiling]} />
          <meshStandardMaterial color={'#b8a890'} roughness={0.85} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  )
}

function Ceiling() {
  return (
    <mesh position={[BING_SUTT.midX, BING_SUTT.ceiling, BING_SUTT.zMid]}
      rotation={[Math.PI / 2, 0, 0]}>
      <planeGeometry args={[BING_SUTT.width, BING_SUTT.depth]} />
      <meshStandardMaterial color={'#d0c0a8'} roughness={0.85} />
    </mesh>
  )
}

function CeilingFan() {
  // 2-blade fan rotating slowly per spec (compressed shop space → 2 blades, not 3)
  const fanRef = useRef<THREE.Group>(null)
  useFrame((_, dt) => {
    if (fanRef.current) fanRef.current.rotation.y += dt * 0.8
  })
  return (
    <group position={[BING_SUTT.midX, BING_SUTT.ceiling - 0.15, BING_SUTT.zMid + 0.4]}>
      <mesh>
        <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
        <meshStandardMaterial color={'#3a3530'} />
      </mesh>
      <group ref={fanRef} position={[0, -0.05, 0]}>
        {[0, Math.PI].map((rot, i) => (
          <mesh key={i} rotation={[0, rot, 0]} position={[0.4, 0, 0]}>
            <boxGeometry args={[0.7, 0.02, 0.12]} />
            <meshStandardMaterial color={'#5a4838'} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

function PendantLights() {
  // 2 warm pendant bulbs — over the booth and over the octagonal table
  const positions: [number, number][] = [
    [BING_SUTT.doorwayX + 0.85, (BING_SUTT.zNear + BING_SUTT.zFar) / 2 - 0.3],  // over booth table
    [BING_SUTT.midX + 0.1, (BING_SUTT.zNear + BING_SUTT.zFar) / 2 + 0.6],        // over octagonal
  ]
  return (
    <group>
      {positions.map(([x, z], i) => (
        <group key={i} position={[x, BING_SUTT.ceiling - 0.3, z]}>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.3, 4]} />
            <meshStandardMaterial color={'#1a1410'} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.06, 12, 8]} />
            <meshStandardMaterial color={'#fff0c0'} emissive={'#ffd880'} emissiveIntensity={2} />
          </mesh>
          <pointLight color={'#ffd890'} intensity={1.2} distance={3.5} decay={2} />
        </group>
      ))}
    </group>
  )
}

function Radio() {
  // Wall-mounted vintage radio (replaces the spec's CRT TV — too tight)
  return (
    <mesh position={[BING_SUTT.midX + 0.5, 1.6, BING_SUTT.zNear + 0.05]}>
      <boxGeometry args={[0.3, 0.18, 0.12]} />
      <meshStandardMaterial color={'#5a4030'} roughness={0.6} />
    </mesh>
  )
}

function Painting() {
  // Framed Chinese ink-landscape painting on the side wall (zNear wall)
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = 128; c.height = 96
    const ctx = c.getContext('2d')!
    ctx.fillStyle = '#e8d8b8'
    ctx.fillRect(0, 0, 128, 96)
    // Suggested mountain shapes (gray ink)
    ctx.fillStyle = '#3a3a3a'
    ctx.beginPath()
    ctx.moveTo(20, 70); ctx.lineTo(50, 30); ctx.lineTo(75, 60); ctx.lineTo(110, 25); ctx.lineTo(120, 80)
    ctx.closePath()
    ctx.fill()
    return new THREE.CanvasTexture(c)
  }, [])
  return (
    <group position={[BING_SUTT.midX - 0.3, 1.7, BING_SUTT.zNear + 0.03]}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[0.5, 0.4, 0.02]} />
        <meshStandardMaterial color={'#3a2818'} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[0.46, 0.36]} />
        <meshStandardMaterial map={tex} roughness={0.85} />
      </mesh>
    </group>
  )
}

function ScreenPartition() {
  // Lattice screen partition between booth and table sections
  const xPos = BING_SUTT.doorwayX + 0.7
  const zPos = (BING_SUTT.zNear + BING_SUTT.zFar) / 2 + 0.05
  return (
    <group position={[xPos, 1.0, zPos]}>
      {/* Frame */}
      <mesh>
        <boxGeometry args={[0.04, 1.6, 0.6]} />
        <meshStandardMaterial color={'#3a2818'} roughness={0.85} />
      </mesh>
      {/* 6 lattice verticals (instanced) */}
      <instancedMesh
        args={[undefined, undefined, 6]}
        ref={(ref) => {
          if (!ref) return
          const m = new THREE.Matrix4()
          for (let i = 0; i < 6; i++) {
            m.makeTranslation(0.01, 0, -0.25 + i * 0.1)
            ref.setMatrixAt(i, m)
          }
          ref.instanceMatrix.needsUpdate = true
        }}
      >
        <boxGeometry args={[0.025, 1.4, 0.015]} />
        <meshStandardMaterial color={'#5a3a20'} roughness={0.85} />
      </instancedMesh>
    </group>
  )
}

function KitchenCurtain() {
  // Curtain at the back-wall side hides the kitchen; orange flame light
  // leaks through the gap.
  return (
    <group>
      <mesh position={[BING_SUTT.backWallX - 0.05, 1.0, BING_SUTT.zFar + 0.3]}
        rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[0.7, 2.0]} />
        <meshStandardMaterial color={'#3a2818'} roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[BING_SUTT.backWallX - 0.2, 1.0, BING_SUTT.zFar + 0.5]}
        color={'#ff8030'} intensity={0.8} distance={1.2} decay={2} />
    </group>
  )
}

function SteamPuffs() {
  // 6 white spheres rising through the kitchen-curtain gap, recycling.
  const refs = useRef<(THREE.Mesh | null)[]>([])
  useFrame((_, dt) => {
    refs.current.forEach((m) => {
      if (!m) return
      m.position.y += dt * 0.3
      const baseScale = 1 + (m.position.y - 1.5) * 0.5
      m.scale.setScalar(baseScale)
      ;(m.material as THREE.MeshStandardMaterial).opacity =
        Math.max(0, 0.6 - (m.position.y - 1.5) * 0.6)
      if (m.position.y > 2.8) {
        m.position.y = 1.5
        m.scale.setScalar(1)
      }
    })
  })
  return (
    <group>
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh
          key={i}
          ref={(r) => { refs.current[i] = r }}
          position={[BING_SUTT.backWallX - 0.18, 1.5 + i * 0.2, BING_SUTT.zFar + 0.45]}
        >
          <sphereGeometry args={[0.05, 6, 4]} />
          <meshStandardMaterial color={'#f8f8f8'} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

function PausedClock() {
  // Round wall clock paused at 3:15 per spec
  return (
    <group position={[BING_SUTT.midX + 0.4, 2.2, BING_SUTT.zNear + 0.03]}>
      {/* Face */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.13, 0.13, 0.02, 16]} />
        <meshStandardMaterial color={'#f0e8d0'} roughness={0.5} />
      </mesh>
      {/* Hour hand pointing at 3 (east) */}
      <mesh position={[0.04, 0, 0.012]}>
        <boxGeometry args={[0.07, 0.008, 0.005]} />
        <meshStandardMaterial color={'#1a1410'} />
      </mesh>
      {/* Minute hand pointing at 15 (also east since 3:15 = 90°) */}
      <mesh position={[0.05, 0, 0.013]}>
        <boxGeometry args={[0.1, 0.005, 0.005]} />
        <meshStandardMaterial color={'#1a1410'} />
      </mesh>
    </group>
  )
}
