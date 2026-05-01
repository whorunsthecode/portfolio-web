import { useMemo } from 'react'
import * as THREE from 'three'
import { MeshReflectorMaterial } from '@react-three/drei'

const WALLS_OAT = '#e8dcc8'
const WALLS_CREAM = '#f0e8d4'
const FLOOR_OAK = '#c4a878'
const WARM_WOOD = '#8a6848'
const LINEN_SHEER = '#f4ecd8'

function makeOakFloorTex(size = 512): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')!

  ctx.fillStyle = FLOOR_OAK
  ctx.fillRect(0, 0, size, size)

  const plankW = size / 4
  for (let i = 0; i < 4; i++) {
    const x = i * plankW
    const varR = 196 + Math.sin(i * 3) * 12
    const varG = 168 + Math.sin(i * 3) * 10
    const varB = 120 + Math.sin(i * 3) * 8
    ctx.fillStyle = `rgb(${varR}, ${varG}, ${varB})`
    ctx.fillRect(x, 0, plankW, size)

    ctx.fillStyle = '#7a5838'
    ctx.fillRect(x, 0, 1, size)

    for (let j = 0; j < 60; j++) {
      const y = Math.random() * size
      const len = 30 + Math.random() * 80
      ctx.strokeStyle = `rgba(110, 80, 50, ${0.06 + Math.random() * 0.1})`
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(x + Math.random() * plankW, y)
      ctx.lineTo(x + Math.random() * plankW, y + len)
      ctx.stroke()
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(2, 2)
  return tex
}

export function GymRoom() {
  const floorTex = useMemo(() => makeOakFloorTex(), [])

  return (
    <group>
      {/* === FLOOR — wide-plank white oak === */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 12]} />
        <meshStandardMaterial map={floorTex} roughness={0.7} />
      </mesh>

      {/* === CEILING === */}
      <mesh position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 12]} />
        <meshStandardMaterial color={WALLS_CREAM} roughness={0.9} />
      </mesh>

      {/* === BACK WALL — oat === */}
      <mesh position={[0, 2, -6]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={WALLS_OAT} roughness={0.9} side={2} />
      </mesh>

      {/* === FRONT WALL === */}
      <mesh position={[0, 2, 6]}>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color={WALLS_OAT} roughness={0.9} side={2} />
      </mesh>

      {/* === LEFT WALL === */}
      <mesh position={[-4, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[12, 4]} />
        <meshStandardMaterial color={WALLS_CREAM} roughness={0.9} side={2} />
      </mesh>

      {/* === RIGHT WALL = SEGMENTED MIRROR PANELS (real reflections) === */}
      {/* Wall behind the mirrors */}
      <mesh position={[4, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[12, 4]} />
        <meshStandardMaterial color={WALLS_OAT} roughness={0.9} side={2} />
      </mesh>

      {/* Individual mirror panels with real planar reflections */}
      {[-4.5, -3, -1.5, 0, 1.5, 3, 4.5].map((z, i) => (
        <group key={`mirror-${i}`}>
          <mesh position={[3.98, 2, z]} rotation={[0, -Math.PI / 2, 0]}>
            <planeGeometry args={[1.35, 3.5]} />
            <MeshReflectorMaterial
              mirror={0.85}
              resolution={256}
              blur={[80, 80]}
              mixBlur={0.6}
              mixStrength={0.8}
              depthScale={0.2}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.2}
              color="#f0f2f4"
              metalness={0.3}
              roughness={0.1}
            />
          </mesh>
          {/* Thin black frame around each panel */}
          <mesh position={[3.97, 3.75, z]}>
            <boxGeometry args={[0.01, 0.02, 1.37]} />
            <meshStandardMaterial color="#1a1614" />
          </mesh>
          <mesh position={[3.97, 0.25, z]}>
            <boxGeometry args={[0.01, 0.02, 1.37]} />
            <meshStandardMaterial color="#1a1614" />
          </mesh>
          <mesh position={[3.97, 2, z - 0.685]}>
            <boxGeometry args={[0.01, 3.52, 0.02]} />
            <meshStandardMaterial color="#1a1614" />
          </mesh>
          <mesh position={[3.97, 2, z + 0.685]}>
            <boxGeometry args={[0.01, 3.52, 0.02]} />
            <meshStandardMaterial color="#1a1614" />
          </mesh>
        </group>
      ))}

      {/* === TALL WINDOWS on the left wall === */}
      {[-3, 0, 3].map((z, i) => (
        <group key={`window-${i}`} position={[-3.96, 2.2, z]}>
          {/* Glass — flush with wall, soft daylight */}
          <mesh rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[1.1, 2.3]} />
            <meshBasicMaterial color="#f4eedc" />
          </mesh>
          {/* Thin frame edges — just border lines, not a solid slab */}
          {/* Top */}
          <mesh position={[0, 1.15, 0]}>
            <boxGeometry args={[0.02, 0.04, 1.14]} />
            <meshStandardMaterial color={WALLS_CREAM} roughness={0.7} />
          </mesh>
          {/* Bottom */}
          <mesh position={[0, -1.15, 0]}>
            <boxGeometry args={[0.02, 0.04, 1.14]} />
            <meshStandardMaterial color={WALLS_CREAM} roughness={0.7} />
          </mesh>
          {/* Left */}
          <mesh position={[0, 0, -0.57]}>
            <boxGeometry args={[0.02, 2.3, 0.04]} />
            <meshStandardMaterial color={WALLS_CREAM} roughness={0.7} />
          </mesh>
          {/* Right */}
          <mesh position={[0, 0, 0.57]}>
            <boxGeometry args={[0.02, 2.3, 0.04]} />
            <meshStandardMaterial color={WALLS_CREAM} roughness={0.7} />
          </mesh>
          {/* Cross mullions — thin */}
          <mesh position={[0.01, 0, 0]}>
            <boxGeometry args={[0.01, 2.3, 0.02]} />
            <meshStandardMaterial color={WALLS_CREAM} />
          </mesh>
          <mesh position={[0.01, 0, 0]}>
            <boxGeometry args={[0.01, 0.02, 1.1]} />
            <meshStandardMaterial color={WALLS_CREAM} />
          </mesh>
        </group>
      ))}

      {/* === SHEER LINEN CURTAINS — one on each side of each window === */}
      {[-3, 0, 3].map((z, i) => (
        <group key={`curtains-${i}`}>
          {/* Left curtain panel */}
          <mesh position={[-3.92, 2.2, z - 0.45]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.35, 2.6]} />
            <meshStandardMaterial color={LINEN_SHEER} transparent opacity={0.5} roughness={0.95} side={2} />
          </mesh>
          {/* Right curtain panel */}
          <mesh position={[-3.92, 2.2, z + 0.45]} rotation={[0, Math.PI / 2, 0]}>
            <planeGeometry args={[0.35, 2.6]} />
            <meshStandardMaterial color={LINEN_SHEER} transparent opacity={0.5} roughness={0.95} side={2} />
          </mesh>
          {/* Brass rod */}
          <mesh position={[-3.93, 3.55, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.01, 0.01, 1.4, 8]} />
            <meshStandardMaterial color="#c8a468" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* === FLOOR TRIM === */}
      {[
        { pos: [0, 0.04, -5.97] as const, size: [8, 0.08, 0.03] as const },
        { pos: [0, 0.04, 5.97] as const, size: [8, 0.08, 0.03] as const },
        { pos: [-3.97, 0.04, 0] as const, size: [0.03, 0.08, 12] as const },
      ].map((t, i) => (
        <mesh key={`trim-${i}`} position={[t.pos[0], t.pos[1], t.pos[2]]}>
          <boxGeometry args={[t.size[0], t.size[1], t.size[2]]} />
          <meshStandardMaterial color={WARM_WOOD} roughness={0.7} />
        </mesh>
      ))}

      {/* === RATTAN PENDANT LAMPS === */}
      {[
        [-1.5, 3.2, -2.5],
        [1.5, 3.3, -2.5],
        [-1.5, 3.15, 2],
        [1.5, 3.25, 2],
      ].map((p, i) => (
        <group key={`pendant-${i}`} position={p as [number, number, number]}>
          {/* Cord */}
          <mesh position={[0, (4 - p[1]) / 2, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 4 - p[1], 4]} />
            <meshStandardMaterial color="#2a2420" />
          </mesh>
          {/* Rattan dome shade */}
          <mesh>
            <sphereGeometry args={[0.25, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial color="#c8a468" roughness={0.9} side={2} transparent opacity={0.85} />
          </mesh>
          {/* Inner glow bulb */}
          <mesh position={[0, -0.05, 0]}>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshBasicMaterial color="#fff0d0" />
          </mesh>
          {/* Warm light */}
          <pointLight position={[0, -0.1, 0]} color="#ffe8c0" intensity={1.8} distance={5} decay={2} />
          {/* Woven texture lines */}
          {[0, Math.PI / 4, Math.PI / 2, Math.PI * 0.75].map((angle, j) => (
            <mesh key={j} position={[0, -0.02, 0]} rotation={[0, angle, 0]}>
              <torusGeometry args={[0.22, 0.004, 4, 16, Math.PI * 0.55]} />
              <meshStandardMaterial color="#a88848" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
