import * as THREE from 'three'
import { useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { createPortal } from 'react-dom'

// Spec §5 — proximity-based affordance for the 4 interactable shops.
// Two-part design:
//   1. Diegetic warm glow at each interactable's doorway (point light fades
//      in within 3.5m, fades out beyond)
//   2. Spatial tooltip overlay (DOM portal) shows shop name + Eng + kind
//      hint when within range

const WORLD_X = 100  // matches WalledCity index.tsx

type InteractableKind = 'walk-in' | 'look-only'

interface Interactable {
  id: string
  nameZh: string
  nameEn: string
  kind: InteractableKind
  centerLocal: [number, number, number]  // x, y, z in WalledCity-local space
}

const INTERACTABLES: Interactable[] = [
  { id: 'salon',       nameZh: '理髮室',  nameEn: 'Salon',          kind: 'walk-in',  centerLocal: [1.9, 1.4, -0.4] },
  { id: 'bing-sutt',   nameZh: '強記冰室', nameEn: 'Keung Kee Café', kind: 'walk-in',  centerLocal: [-1.0, 1.4, -20] },
  { id: 'sundry',      nameZh: '士多',    nameEn: 'Sundry Shop',    kind: 'look-only', centerLocal: [-0.9, 1.4, -6.5] },
  { id: 'fruit-stall', nameZh: '生果檔',  nameEn: 'Fruit Stall',    kind: 'look-only', centerLocal: [-2, 1.0, -29] },
]

const RANGE = 3.5
const FADE_TIME = 0.25  // seconds for glow fade

export function InteractableHUD() {
  const [activeId, setActiveId] = useState<string | null>(null)
  return (
    <>
      {INTERACTABLES.map((it) => (
        <ProximityGlow
          key={it.id}
          interactable={it}
          onActiveChange={(active) => {
            // Last writer wins per frame. With 4 interactables and small
            // RANGE, simultaneous-active situations are rare and visually
            // harmless — the closest one effectively dominates.
            if (active) setActiveId(it.id)
            else setActiveId((prev) => (prev === it.id ? null : prev))
          }}
        />
      ))}
      <TooltipOverlay activeId={activeId} />
    </>
  )
}

function ProximityGlow({
  interactable,
  onActiveChange,
}: {
  interactable: Interactable
  onActiveChange: (active: boolean) => void
}) {
  const lightRef = useRef<THREE.PointLight>(null)
  const intensityRef = useRef(0)
  const wasActiveRef = useRef(false)
  const { camera } = useThree()

  useFrame((_, dt) => {
    if (!lightRef.current) return
    const worldX = WORLD_X + interactable.centerLocal[0]
    const dx = camera.position.x - worldX
    const dy = camera.position.y - interactable.centerLocal[1]
    const dz = camera.position.z - interactable.centerLocal[2]
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
    const isActive = dist < RANGE
    if (isActive !== wasActiveRef.current) {
      wasActiveRef.current = isActive
      onActiveChange(isActive)
    }
    const target = isActive ? 1.2 : 0
    const step = (dt / FADE_TIME) * 1.2
    if (intensityRef.current < target) {
      intensityRef.current = Math.min(target, intensityRef.current + step)
    } else {
      intensityRef.current = Math.max(target, intensityRef.current - step)
    }
    lightRef.current.intensity = intensityRef.current
  })

  return (
    <pointLight
      ref={lightRef}
      position={[
        WORLD_X + interactable.centerLocal[0],
        interactable.centerLocal[1],
        interactable.centerLocal[2],
      ]}
      color={'#ffb060'}
      intensity={0}
      distance={3}
      decay={2}
    />
  )
}

function TooltipOverlay({ activeId }: { activeId: string | null }) {
  if (typeof document === 'undefined') return null
  const interactable = activeId ? INTERACTABLES.find((it) => it.id === activeId) : null
  return createPortal(
    <div
      style={{
        position: 'fixed',
        left: '50%',
        bottom: '64px',
        transform: 'translateX(-50%)',
        zIndex: 100,
        background: 'rgba(20, 16, 12, 0.78)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        color: '#f0e6d3',
        padding: '10px 22px',
        borderRadius: '999px',
        fontFamily: 'serif',
        textAlign: 'center',
        opacity: interactable ? 1 : 0,
        transition: 'opacity 200ms ease-out',
        pointerEvents: 'none',
      }}
    >
      {interactable ? (
        <>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>{interactable.nameZh}</div>
          <div style={{ fontSize: '12px', opacity: 0.7, marginTop: '2px' }}>
            {interactable.nameEn}
            <span style={{ marginLeft: '8px', opacity: 0.6 }}>
              {interactable.kind === 'walk-in' ? 'Enter ▸' : 'View ▸'}
            </span>
          </div>
        </>
      ) : null}
    </div>,
    document.body,
  )
}
