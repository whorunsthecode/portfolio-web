import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/**
 * Refined aquarium fish — each species now has a proper graceful
 * silhouette: tapered fusiform body, translucent fins, gradient
 * coloring via CanvasTexture, animated tail + pectoral fin motion.
 *
 * Species:
 *   - Koi (Nishikigoi) — red/white/black calico body patterns
 *   - Angelfish — tall flat body with long trailing fins
 *   - Jellyfish — translucent bell with undulating tentacles
 *   - Turtle — dome carapace with subtle hex pattern, flipper-paddle
 */

// Shared cursor world position — updated by a raycaster each frame
const cursorWorld = new THREE.Vector3(0, 999, 0)
const raycaster = new THREE.Raycaster()
const pointer = new THREE.Vector2(999, 999)

export function CursorTracker() {
  const planeRef = useRef<THREE.Mesh>(null)
  const { camera } = useThree()

  useFrame(({ pointer: p }) => {
    pointer.set(p.x, p.y)
    raycaster.setFromCamera(pointer, camera)
    if (planeRef.current) {
      const hits = raycaster.intersectObject(planeRef.current)
      if (hits.length > 0) {
        cursorWorld.copy(hits[0].point)
      }
    }
  })

  return (
    <mesh ref={planeRef} position={[0, 0, 0]} visible={false}>
      <planeGeometry args={[20, 20]} />
      <meshBasicMaterial />
    </mesh>
  )
}

const FLEE_RADIUS = 2.0
const FLEE_STRENGTH = 1.5

/* ═══════════════════════════════════════════════════════════════════
   Koi texture — calico scale pattern with soft color patches
   ═══════════════════════════════════════════════════════════════════ */
function useKoiTexture(variant: 'orange' | 'white' | 'mixed') {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 128
    const ctx = canvas.getContext('2d')!

    const base =
      variant === 'orange'
        ? '#f4ece0'
        : variant === 'white'
        ? '#fafaf2'
        : '#fbf4e8'
    ctx.fillStyle = base
    ctx.fillRect(0, 0, 256, 128)

    // Warm belly shadow gradient (underside)
    const belly = ctx.createLinearGradient(0, 64, 0, 128)
    belly.addColorStop(0, 'rgba(220, 180, 140, 0)')
    belly.addColorStop(1, 'rgba(220, 180, 140, 0.55)')
    ctx.fillStyle = belly
    ctx.fillRect(0, 64, 256, 64)

    // Dorsal light gradient (topside)
    const dorsal = ctx.createLinearGradient(0, 0, 0, 48)
    dorsal.addColorStop(0, 'rgba(255, 255, 240, 0.6)')
    dorsal.addColorStop(1, 'rgba(255, 255, 240, 0)')
    ctx.fillStyle = dorsal
    ctx.fillRect(0, 0, 256, 48)

    // Calico color patches — large soft red/orange blobs
    const patches =
      variant === 'orange'
        ? ['#f06428', '#d84810', '#f87040']
        : variant === 'white'
        ? ['#f06428', '#c83818', '#1a1410']
        : ['#f06428', '#1a1410', '#c83818', '#c83818']

    for (let i = 0; i < 8; i++) {
      const px = 30 + Math.random() * 200
      const py = 25 + Math.random() * 75
      const pr = 18 + Math.random() * 24
      const color = patches[i % patches.length]
      const grad = ctx.createRadialGradient(px, py, 2, px, py, pr)
      grad.addColorStop(0, color)
      grad.addColorStop(0.65, color + 'cc')
      grad.addColorStop(1, color + '00')
      ctx.fillStyle = grad
      ctx.beginPath()
      ctx.arc(px, py, pr, 0, Math.PI * 2)
      ctx.fill()
    }

    // Scale pattern — tiny crescents arranged in staggered rows
    ctx.globalAlpha = 0.16
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 22; col++) {
        const sx = col * 12 + (row % 2 === 0 ? 6 : 0)
        const sy = 14 + row * 10
        ctx.beginPath()
        ctx.arc(sx, sy, 5, 0, Math.PI)
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1

    // Darker scale shadows
    ctx.globalAlpha = 0.08
    ctx.strokeStyle = '#1a0a04'
    for (let row = 0; row < 10; row++) {
      for (let col = 0; col < 22; col++) {
        const sx = col * 12 + (row % 2 === 0 ? 6 : 0)
        const sy = 14 + row * 10
        ctx.beginPath()
        ctx.arc(sx, sy + 0.5, 5, 0, Math.PI)
        ctx.stroke()
      }
    }
    ctx.globalAlpha = 1

    const tex = new THREE.CanvasTexture(canvas)
    tex.needsUpdate = true
    return tex
  }, [variant])
}

/* ═══════════════════════════════════════════════════════════════════
   Koi — graceful fusiform body, waving tail + pectoral fins
   ═══════════════════════════════════════════════════════════════════ */
interface KoiProps {
  position: [number, number, number]
  scale: number
  variant: 'orange' | 'white' | 'mixed'
  pathRadius: number
  pathOffsetZ: number
  speed: number
  phaseOffset: number
}

function Koi({ position, scale, variant, pathRadius, pathOffsetZ, speed, phaseOffset }: KoiProps) {
  const groupRef = useRef<THREE.Group>(null)
  const bodyWaveRef = useRef<THREE.Group>(null)
  const tailRef = useRef<THREE.Group>(null)
  const leftFinRef = useRef<THREE.Group>(null)
  const rightFinRef = useRef<THREE.Group>(null)
  const fleeOffset = useRef(new THREE.Vector3())

  const tex = useKoiTexture(variant)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime * speed + phaseOffset

    let x = Math.cos(t) * pathRadius + position[0]
    let z = Math.sin(t) * 0.3 + pathOffsetZ
    let y = position[1] + Math.sin(t * 1.3) * 0.1

    const dx = x - cursorWorld.x
    const dy = y - cursorWorld.y
    const dz = z - cursorWorld.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)

    let agitated = false
    if (dist < FLEE_RADIUS && dist > 0.01) {
      const force = (1 - dist / FLEE_RADIUS) * FLEE_STRENGTH
      const target = new THREE.Vector3(
        (dx / dist) * force,
        (dy / dist) * force,
        (dz / dist) * force,
      )
      fleeOffset.current.lerp(target, 0.1)
      agitated = true
    } else {
      fleeOffset.current.lerp(new THREE.Vector3(0, 0, 0), 0.05)
    }

    x += fleeOffset.current.x
    y += fleeOffset.current.y
    z += fleeOffset.current.z

    groupRef.current.position.set(x, y, z)

    const velX = -Math.sin(t) * pathRadius + fleeOffset.current.x * 5
    groupRef.current.rotation.y = Math.atan2(velX, 0) + Math.PI / 2

    const waveFreq = agitated ? 7 : 3
    // Body undulation — subtle yaw wave so the fish "swims"
    if (bodyWaveRef.current) {
      bodyWaveRef.current.rotation.y = Math.sin(t * waveFreq) * 0.15
    }
    // Tail sweeps opposite to body wave
    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * waveFreq + Math.PI) * 0.55
    }
    // Pectoral fins flutter
    if (leftFinRef.current) {
      leftFinRef.current.rotation.z = 0.3 + Math.sin(t * 4) * 0.2
    }
    if (rightFinRef.current) {
      rightFinRef.current.rotation.z = -0.3 - Math.sin(t * 4) * 0.2
    }
  })

  return (
    <group ref={groupRef} scale={scale}>
      <group ref={bodyWaveRef}>
        {/* ─── BODY — fusiform spindle shape via stretched sphere ─── */}
        <mesh scale={[1.8, 0.58, 0.65]}>
          <sphereGeometry args={[0.18, 16, 12]} />
          <meshStandardMaterial map={tex} roughness={0.5} />
        </mesh>
        {/* Head — slightly smaller front sphere for snout shape */}
        <mesh position={[0.22, -0.01, 0]} scale={[1.0, 0.5, 0.55]}>
          <sphereGeometry args={[0.1, 12, 10]} />
          <meshStandardMaterial map={tex} roughness={0.5} />
        </mesh>
        {/* Eyes — two tiny spheres on the head */}
        {[-1, 1].map((side) => (
          <group key={`eye-${side}`} position={[0.27, 0.005, side * 0.045]}>
            <mesh>
              <sphereGeometry args={[0.018, 8, 8]} />
              <meshStandardMaterial color="#fafafa" roughness={0.3} />
            </mesh>
            <mesh position={[0.008, 0, 0]}>
              <sphereGeometry args={[0.01, 8, 8]} />
              <meshBasicMaterial color="#0a0604" />
            </mesh>
          </group>
        ))}
        {/* Dorsal fin — thin triangle on top */}
        <mesh position={[0.02, 0.08, 0]} rotation={[0, 0, 0]}>
          <coneGeometry args={[0.06, 0.14, 3]} />
          <meshStandardMaterial
            map={tex}
            transparent
            opacity={0.78}
            roughness={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Pectoral fins — translucent wings on each side */}
        <group ref={leftFinRef} position={[0.1, -0.03, 0.1]}>
          <mesh rotation={[0, 0.3, 0.3]}>
            <planeGeometry args={[0.18, 0.1]} />
            <meshStandardMaterial
              color="#f4d4b4"
              transparent
              opacity={0.55}
              side={THREE.DoubleSide}
              roughness={0.4}
            />
          </mesh>
        </group>
        <group ref={rightFinRef} position={[0.1, -0.03, -0.1]}>
          <mesh rotation={[0, -0.3, -0.3]}>
            <planeGeometry args={[0.18, 0.1]} />
            <meshStandardMaterial
              color="#f4d4b4"
              transparent
              opacity={0.55}
              side={THREE.DoubleSide}
              roughness={0.4}
            />
          </mesh>
        </group>
        {/* Anal fin — small bottom fin */}
        <mesh position={[-0.12, -0.07, 0]}>
          <coneGeometry args={[0.04, 0.08, 3]} />
          <meshStandardMaterial
            color="#f4d4b4"
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
            roughness={0.5}
          />
        </mesh>
      </group>
      {/* Tail — flowing twin-lobed fin via two triangles */}
      <group ref={tailRef} position={[-0.32, 0, 0]}>
        <mesh position={[-0.08, 0.05, 0]} rotation={[0, 0, 0.3]}>
          <planeGeometry args={[0.22, 0.18]} />
          <meshStandardMaterial
            map={tex}
            transparent
            opacity={0.82}
            side={THREE.DoubleSide}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[-0.08, -0.05, 0]} rotation={[0, 0, -0.3]}>
          <planeGeometry args={[0.22, 0.18]} />
          <meshStandardMaterial
            map={tex}
            transparent
            opacity={0.82}
            side={THREE.DoubleSide}
            roughness={0.4}
          />
        </mesh>
      </group>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Angelfish texture — vertical black-on-silver stripes
   ═══════════════════════════════════════════════════════════════════ */
function useAngelfishTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')!

    // Silver gradient base
    const g = ctx.createLinearGradient(0, 0, 0, 256)
    g.addColorStop(0, '#f8f4d8')
    g.addColorStop(0.5, '#fff0b0')
    g.addColorStop(1, '#d0a858')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)

    // Signature vertical black stripes (angelfish have 3)
    ctx.fillStyle = '#1a1010'
    const stripes = [
      { x: 60, w: 20 },
      { x: 120, w: 26 },
      { x: 190, w: 18 },
    ]
    for (const s of stripes) {
      const sg = ctx.createLinearGradient(s.x, 0, s.x + s.w, 0)
      sg.addColorStop(0, 'rgba(26,16,16,0)')
      sg.addColorStop(0.5, 'rgba(26,16,16,0.95)')
      sg.addColorStop(1, 'rgba(26,16,16,0)')
      ctx.fillStyle = sg
      ctx.fillRect(s.x, 0, s.w, 256)
    }

    // Iridescent sheen overlay
    ctx.globalAlpha = 0.1
    const sheen = ctx.createLinearGradient(0, 0, 256, 256)
    sheen.addColorStop(0, '#a8d4ff')
    sheen.addColorStop(0.5, '#ffedc8')
    sheen.addColorStop(1, '#d8c8f8')
    ctx.fillStyle = sheen
    ctx.fillRect(0, 0, 256, 256)
    ctx.globalAlpha = 1

    const tex = new THREE.CanvasTexture(canvas)
    return tex
  }, [])
}

/* ═══════════════════════════════════════════════════════════════════
   Angelfish — tall flat body, long trailing top/bottom fins
   ═══════════════════════════════════════════════════════════════════ */
function Angelfish({
  position,
  scale,
  phaseOffset,
  speed,
}: {
  position: [number, number, number]
  scale: number
  phaseOffset: number
  speed: number
}) {
  const ref = useRef<THREE.Group>(null)
  const tailRef = useRef<THREE.Group>(null)
  const fleeOffset = useRef(new THREE.Vector3())
  const tex = useAngelfishTexture()

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime * speed + phaseOffset
    let x = position[0] + Math.cos(t) * 1.5
    let y = position[1] + Math.sin(t * 1.5) * 0.3
    let z = position[2] + Math.sin(t) * 0.5

    const dx = x - cursorWorld.x
    const dy = y - cursorWorld.y
    const dz = z - cursorWorld.z
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
    if (dist < FLEE_RADIUS && dist > 0.01) {
      const force = (1 - dist / FLEE_RADIUS) * FLEE_STRENGTH
      fleeOffset.current.lerp(
        new THREE.Vector3((dx / dist) * force, (dy / dist) * force, (dz / dist) * force),
        0.1,
      )
    } else {
      fleeOffset.current.lerp(new THREE.Vector3(0, 0, 0), 0.05)
    }

    ref.current.position.set(
      x + fleeOffset.current.x,
      y + fleeOffset.current.y,
      z + fleeOffset.current.z,
    )
    ref.current.rotation.y = Math.atan2(-Math.sin(t) * 1.5, 0) + Math.PI / 2

    if (tailRef.current) {
      tailRef.current.rotation.y = Math.sin(t * 5) * 0.35
    }
  })

  return (
    <group ref={ref} scale={[scale, scale, scale]}>
      {/* Main body — diamond/discus shape via flattened sphere */}
      <mesh scale={[0.7, 1.3, 0.15]}>
        <sphereGeometry args={[0.18, 16, 12]} />
        <meshStandardMaterial map={tex} roughness={0.4} />
      </mesh>
      {/* Head point forward */}
      <mesh position={[0.12, -0.05, 0]} scale={[0.6, 0.7, 0.13]}>
        <sphereGeometry args={[0.09, 12, 10]} />
        <meshStandardMaterial map={tex} roughness={0.4} />
      </mesh>
      {/* Eyes */}
      {[-1, 1].map((side) => (
        <group key={`eye-${side}`} position={[0.12, 0.0, side * 0.022]}>
          <mesh>
            <sphereGeometry args={[0.015, 8, 8]} />
            <meshStandardMaterial color="#fafafa" />
          </mesh>
          <mesh position={[0.007, 0, 0]}>
            <sphereGeometry args={[0.008, 8, 8]} />
            <meshBasicMaterial color="#1a1010" />
          </mesh>
        </group>
      ))}
      {/* Long trailing DORSAL fin (top) */}
      <mesh position={[0.02, 0.26, 0]} rotation={[0, 0, -0.15]}>
        <planeGeometry args={[0.22, 0.34]} />
        <meshStandardMaterial
          map={tex}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          roughness={0.4}
        />
      </mesh>
      {/* Long trailing ANAL fin (bottom) */}
      <mesh position={[0.02, -0.26, 0]} rotation={[0, 0, 0.15]}>
        <planeGeometry args={[0.22, 0.34]} />
        <meshStandardMaterial
          map={tex}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
          roughness={0.4}
        />
      </mesh>
      {/* Thin filament VENTRAL fins (characteristic of angelfish) */}
      {[-1, 1].map((side) => (
        <mesh key={`vent-${side}`} position={[-0.04, -0.08, side * 0.01]} rotation={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.003, 0.003, 0.32, 4]} />
          <meshStandardMaterial color="#1a1a1a" transparent opacity={0.7} />
        </mesh>
      ))}
      {/* Tail fin */}
      <group ref={tailRef} position={[-0.14, 0, 0]}>
        <mesh rotation={[0, 0, 0]}>
          <planeGeometry args={[0.2, 0.25]} />
          <meshStandardMaterial
            map={tex}
            transparent
            opacity={0.72}
            side={THREE.DoubleSide}
            roughness={0.4}
          />
        </mesh>
      </group>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Jellyfish — translucent bell, undulating tentacles
   ═══════════════════════════════════════════════════════════════════ */
function Jellyfish({
  position,
  scale,
  phaseOffset,
  color = '#f4c0dc',
}: {
  position: [number, number, number]
  scale: number
  phaseOffset: number
  color?: string
}) {
  const ref = useRef<THREE.Group>(null)
  const bellRef = useRef<THREE.Group>(null)
  const tentacleRefs = useRef<THREE.Group[]>([])

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime + phaseOffset
    ref.current.position.y = position[1] + Math.sin(t * 0.6) * 0.4
    ref.current.position.x = position[0] + Math.sin(t * 0.3) * 0.2
    ref.current.position.z = position[2]

    // Bell pulsing — squash / stretch
    if (bellRef.current) {
      const pulse = 1 + Math.sin(t * 1.8) * 0.12
      bellRef.current.scale.set(pulse, 1 / pulse, pulse)
    }
    // Tentacles undulate with phase offset per tentacle
    tentacleRefs.current.forEach((tRef, i) => {
      if (tRef) {
        tRef.rotation.x = Math.sin(t * 1.5 + i * 0.6) * 0.25
      }
    })
  })

  // 12 tentacles of varied length, arranged around the bell rim
  const tentacles = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2
        const r = 0.12
        return {
          x: Math.cos(angle) * r,
          z: Math.sin(angle) * r,
          len: 0.32 + ((i * 7) % 5) * 0.04,
        }
      }),
    [],
  )

  return (
    <group ref={ref} position={position} scale={[scale, scale, scale]}>
      <group ref={bellRef}>
        {/* Bell — hemisphere with soft rim highlight */}
        <mesh>
          <sphereGeometry args={[0.18, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshPhysicalMaterial
            color={color}
            transparent
            opacity={0.45}
            roughness={0.1}
            transmission={0.6}
            thickness={0.05}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Inner glow bell — brighter core */}
        <mesh scale={[0.85, 0.85, 0.85]}>
          <sphereGeometry args={[0.18, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshBasicMaterial color={color} transparent opacity={0.22} side={THREE.BackSide} />
        </mesh>
        {/* Bell rim ring — darker outline */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.175, 0.008, 6, 20]} />
          <meshBasicMaterial color={color} transparent opacity={0.65} />
        </mesh>
        {/* Central cross stomach — subtle internal structure */}
        {[0, Math.PI / 2].map((rot, i) => (
          <mesh key={i} position={[0, -0.02, 0]} rotation={[0, rot, 0]}>
            <planeGeometry args={[0.18, 0.04]} />
            <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        ))}
      </group>
      {/* Tentacles */}
      {tentacles.map((t, i) => (
        <group
          key={i}
          position={[t.x, -0.02, t.z]}
          ref={(el) => {
            if (el) tentacleRefs.current[i] = el
          }}
        >
          <mesh position={[0, -t.len / 2, 0]}>
            <cylinderGeometry args={[0.004, 0.001, t.len, 4]} />
            <meshBasicMaterial color={color} transparent opacity={0.55} />
          </mesh>
        </group>
      ))}
      {/* 4 thicker "oral arm" tentacles near the center */}
      {[0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2].map((angle, i) => (
        <mesh
          key={`arm-${i}`}
          position={[Math.cos(angle) * 0.04, -0.12, Math.sin(angle) * 0.04]}
        >
          <cylinderGeometry args={[0.008, 0.004, 0.2, 5]} />
          <meshBasicMaterial color={color} transparent opacity={0.55} />
        </mesh>
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Turtle — dome carapace with hex pattern, animated flippers
   ═══════════════════════════════════════════════════════════════════ */
function useTurtleTexture() {
  return useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 128
    const ctx = canvas.getContext('2d')!

    // Base shell color
    ctx.fillStyle = '#3a5830'
    ctx.fillRect(0, 0, 256, 128)

    // Green gradient
    const g = ctx.createRadialGradient(128, 64, 10, 128, 64, 140)
    g.addColorStop(0, '#5a7848')
    g.addColorStop(0.6, '#3a5830')
    g.addColorStop(1, '#1a3020')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 128)

    // Hexagonal scute pattern
    ctx.strokeStyle = '#1a2818'
    ctx.lineWidth = 2
    const hexR = 18
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 12; col++) {
        const cx = col * hexR * 1.5 + (row % 2 === 0 ? hexR * 0.75 : 0)
        const cy = row * hexR * 0.87
        ctx.beginPath()
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2
          const hx = cx + Math.cos(a) * hexR * 0.55
          const hy = cy + Math.sin(a) * hexR * 0.55
          if (k === 0) ctx.moveTo(hx, hy)
          else ctx.lineTo(hx, hy)
        }
        ctx.closePath()
        ctx.stroke()
        // Inner hex fill gradient
        const hg = ctx.createRadialGradient(cx, cy, 2, cx, cy, hexR * 0.6)
        hg.addColorStop(0, 'rgba(120, 150, 90, 0.3)')
        hg.addColorStop(1, 'rgba(120, 150, 90, 0)')
        ctx.fillStyle = hg
        ctx.fill()
      }
    }

    const tex = new THREE.CanvasTexture(canvas)
    return tex
  }, [])
}

function Turtle({
  position,
  phaseOffset,
}: {
  position: [number, number, number]
  phaseOffset: number
}) {
  const ref = useRef<THREE.Group>(null)
  const frontFlippersRef = useRef<THREE.Group>(null)
  const rearFlippersRef = useRef<THREE.Group>(null)
  const tex = useTurtleTexture()

  useFrame(({ clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime * 0.2 + phaseOffset
    ref.current.position.set(
      position[0] + Math.cos(t) * 3,
      position[1] + Math.sin(t * 0.5) * 0.2,
      position[2] + Math.sin(t) * 0.4,
    )
    ref.current.rotation.y = Math.atan2(-Math.sin(t) * 3, 0) + Math.PI / 2
    // Paddle flippers in opposition
    if (frontFlippersRef.current) {
      frontFlippersRef.current.rotation.z = Math.sin(t * 4) * 0.5
    }
    if (rearFlippersRef.current) {
      rearFlippersRef.current.rotation.z = Math.sin(t * 4 + Math.PI) * 0.3
    }
  })

  return (
    <group ref={ref}>
      {/* Carapace — dome */}
      <mesh scale={[1.1, 0.65, 1.0]}>
        <sphereGeometry args={[0.22, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial map={tex} roughness={0.7} />
      </mesh>
      {/* Plastron (underside) */}
      <mesh position={[0, -0.005, 0]} rotation={[Math.PI, 0, 0]} scale={[1.05, 0.1, 0.95]}>
        <sphereGeometry args={[0.22, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#d0c090" roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0.24, 0.01, 0]}>
        <sphereGeometry args={[0.065, 10, 10]} />
        <meshStandardMaterial color="#6a8058" roughness={0.75} />
      </mesh>
      {/* Beak */}
      <mesh position={[0.29, -0.005, 0]} scale={[0.8, 0.6, 0.9]}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshStandardMaterial color="#4a5838" roughness={0.8} />
      </mesh>
      {/* Eyes */}
      {[-1, 1].map((side) => (
        <group key={`eye-${side}`} position={[0.26, 0.03, side * 0.035]}>
          <mesh>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshStandardMaterial color="#fafafa" />
          </mesh>
          <mesh position={[0.006, 0, 0]}>
            <sphereGeometry args={[0.007, 6, 6]} />
            <meshBasicMaterial color="#0a0604" />
          </mesh>
        </group>
      ))}
      {/* Tail */}
      <mesh position={[-0.24, 0, 0]} rotation={[0, 0, -0.1]} scale={[1.8, 0.4, 0.5]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color="#5a7048" roughness={0.8} />
      </mesh>
      {/* Front flippers — larger, animated */}
      <group ref={frontFlippersRef}>
        {[-1, 1].map((side) => (
          <mesh
            key={`front-${side}`}
            position={[0.08, -0.03, side * 0.2]}
            rotation={[0, 0, -0.2]}
            scale={[1.6, 0.3, 0.8]}
          >
            <sphereGeometry args={[0.1, 10, 8]} />
            <meshStandardMaterial color="#5a7048" roughness={0.8} />
          </mesh>
        ))}
      </group>
      {/* Rear flippers — smaller */}
      <group ref={rearFlippersRef}>
        {[-1, 1].map((side) => (
          <mesh
            key={`rear-${side}`}
            position={[-0.1, -0.03, side * 0.18]}
            rotation={[0, 0, 0.1]}
            scale={[1.2, 0.3, 0.7]}
          >
            <sphereGeometry args={[0.075, 10, 8]} />
            <meshStandardMaterial color="#5a7048" roughness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Exported composite
   ═══════════════════════════════════════════════════════════════════ */
export function SwimmingKoi() {
  const kois = useMemo<KoiProps[]>(
    () => [
      { position: [-2, 0.5, -1], scale: 1.0, variant: 'orange', pathRadius: 2.5, pathOffsetZ: -1, speed: 0.4, phaseOffset: 0 },
      { position: [2, 1.0, 1], scale: 0.8, variant: 'white', pathRadius: 3.0, pathOffsetZ: 0, speed: 0.5, phaseOffset: 1.5 },
      { position: [0, -0.5, -2], scale: 1.2, variant: 'mixed', pathRadius: 3.5, pathOffsetZ: -1, speed: 0.3, phaseOffset: 3 },
      { position: [-1, 1.5, 2], scale: 0.7, variant: 'orange', pathRadius: 2.0, pathOffsetZ: 1, speed: 0.6, phaseOffset: 4.5 },
      { position: [3, 0, -2], scale: 0.9, variant: 'white', pathRadius: 2.8, pathOffsetZ: -1.5, speed: 0.45, phaseOffset: 2.2 },
      { position: [-3, 0.5, 1], scale: 1.1, variant: 'orange', pathRadius: 3.2, pathOffsetZ: 0.5, speed: 0.35, phaseOffset: 5.5 },
    ],
    [],
  )

  return (
    <>
      <CursorTracker />
      {kois.map((koi, i) => (
        <Koi key={i} {...koi} />
      ))}
      <Angelfish position={[2, 1, -1]} scale={1.2} speed={0.5} phaseOffset={0} />
      <Angelfish position={[-2, 0.5, -1]} scale={1.0} speed={0.4} phaseOffset={2} />
      <Jellyfish position={[1.5, 1.5, -3]} scale={1.0} phaseOffset={0} color="#f4b0d0" />
      <Jellyfish position={[-2.5, 2, -2.5]} scale={0.8} phaseOffset={1.5} color="#c8c8ff" />
      <Jellyfish position={[0, 2.5, 2]} scale={0.7} phaseOffset={3.2} color="#b0f0e0" />
      <Turtle position={[0, -0.5, -3]} phaseOffset={0} />
    </>
  )
}
