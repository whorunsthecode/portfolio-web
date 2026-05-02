import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useStore } from '../../store'

// Spec §5 — proximity-based affordance for the 4 interactable shops.
// Two-part design:
//   1. Diegetic warm glow at each interactable's doorway (point light fades
//      in within 3.5m, fades out beyond) — rendered HERE in R3F
//   2. Tooltip overlay showing shop name + Eng + kind hint when within
//      range — rendered OUTSIDE the Canvas in HUD.tsx, which reads the
//      store key `wcInteractable` we write to from the proximity check.
//
// Earlier this component used react-dom createPortal to render a <div>
// from inside the R3F tree, which throws "Div is not part of THREE
// namespace" and tears down the WebGL context (entire walled city goes
// black). The store hop avoids that.

const WORLD_X = 100  // matches WalledCity index.tsx

type InteractableKind = 'walk-in' | 'look-only'

export interface Interactable {
  id: string
  nameZh: string
  nameEn: string
  kind: InteractableKind
  centerLocal: [number, number, number]  // x, y, z in WalledCity-local space
}

export const INTERACTABLES: Interactable[] = [
  { id: 'salon',       nameZh: '理髮室',  nameEn: 'Salon',          kind: 'walk-in',  centerLocal: [1.9, 1.4, -0.4] },
  { id: 'bing-sutt',   nameZh: '強記冰室', nameEn: 'Keung Kee Café', kind: 'walk-in',  centerLocal: [-1.0, 1.4, -20] },
  { id: 'sundry',      nameZh: '士多',    nameEn: 'Sundry Shop',    kind: 'look-only', centerLocal: [-0.9, 1.4, -6.5] },
  { id: 'fruit-stall', nameZh: '生果檔',  nameEn: 'Fruit Stall',    kind: 'look-only', centerLocal: [-2, 1.0, -29] },
]

const RANGE = 3.5
const FADE_TIME = 0.25  // seconds for glow fade

export function InteractableHUD() {
  return (
    <>
      {INTERACTABLES.map((it) => (
        <ProximityGlow key={it.id} interactable={it} />
      ))}
    </>
  )
}

function ProximityGlow({ interactable }: { interactable: Interactable }) {
  const lightRef = useRef<THREE.PointLight>(null)
  const intensityRef = useRef(0)
  const wasActiveRef = useRef(false)
  const { camera } = useThree()
  const setWcInteractable = useStore((s) => s.setWcInteractable)

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
      // Last writer wins per frame. With 4 interactables and small RANGE,
      // simultaneous-active situations are rare and visually harmless —
      // the closest one effectively dominates.
      if (isActive) setWcInteractable(interactable.id)
      else if (useStore.getState().wcInteractable === interactable.id) {
        setWcInteractable(null)
      }
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
