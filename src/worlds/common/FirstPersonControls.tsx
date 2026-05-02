import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { useKeyboard } from './useKeyboard'
import { useMouseLook } from './useMouseLook'
import { useTouchControls } from './useTouchControls'
import { navState } from './nav'

// A walkable zone: an axis-aligned box. If `floorFn` is set, the floor
// height inside the zone varies with (x, z) — useful for ramps/stairs.
// If `containsFn` is set, the rectangular check is gated by it — useful
// for non-rectangular passages (e.g. the WalledCity dogleg's diagonal
// parallelogram, where a plain rectangle would let the player slip
// behind the alley walls into void space).
export interface Zone {
  min: [number, number, number]
  max: [number, number, number]
  floorFn?: (x: number, z: number) => number
  containsFn?: (x: number, z: number) => boolean
}

interface Props {
  bounds: Zone[]
  start: [number, number, number]   // floor position; eye height added on top
  startYaw?: number                  // radians; 0 = looking down -Z
  height?: number
  speed?: number
  bob?: number
  // Max vertical change between adjacent floor samples a single move can
  // accept. Catches the case where two bounds with different floors share
  // a boundary in xz — without this, walking across the boundary teleports
  // the player up or down by metres (e.g. on the walled-city stair shaft
  // where a rooftop zone at y=5 overlaps the ramping stair zone). 0.4m
  // accommodates the steepest legitimate step (stair tread rise ~0.23m).
  maxStep?: number
}

const HALF_PI_MINUS = Math.PI / 2 - 0.05
const DEFAULT_MAX_STEP = 0.4

function floorAt(zone: Zone, x: number, z: number): number {
  return zone.floorFn ? zone.floorFn(x, z) : zone.min[1]
}

function inZone(zone: Zone, x: number, z: number): boolean {
  if (x < zone.min[0] || x > zone.max[0] || z < zone.min[2] || z > zone.max[2]) {
    return false
  }
  return zone.containsFn ? zone.containsFn(x, z) : true
}

function findZone(x: number, z: number, zones: Zone[]): Zone | null {
  for (const zone of zones) {
    if (inZone(zone, x, z)) return zone
  }
  return null
}

// Clamp (x, z) to the nearest walkable zone edge if the point is outside
// every zone. Returns the zone the clamped point sits inside. For zones
// with a containsFn the rectangular clamp is followed by a containment
// re-test; if it fails, the zone is skipped (the player is treated as if
// that zone didn't exist for the purposes of clamping).
function clampToZones(x: number, z: number, zones: Zone[]): { x: number; z: number; zone: Zone } {
  const inside = findZone(x, z, zones)
  if (inside) return { x, z, zone: inside }

  let best = zones[0]
  let bestDist = Infinity
  let bestX = x
  let bestZ = z
  for (const zone of zones) {
    const cx = Math.max(zone.min[0], Math.min(zone.max[0], x))
    const cz = Math.max(zone.min[2], Math.min(zone.max[2], z))
    if (zone.containsFn && !zone.containsFn(cx, cz)) continue
    const d = (cx - x) ** 2 + (cz - z) ** 2
    if (d < bestDist) {
      bestDist = d
      best = zone
      bestX = cx
      bestZ = cz
    }
  }
  return { x: bestX, z: bestZ, zone: best }
}

export function FirstPersonControls({
  bounds,
  start,
  startYaw = 0,
  height = 1.65,
  speed = 2.6,
  bob = 0.015,
  maxStep = DEFAULT_MAX_STEP,
}: Props) {
  const { camera, gl } = useThree()

  const kbd = useKeyboard()
  const mouse = useMouseLook(gl.domElement as HTMLCanvasElement)
  const touch = useTouchControls()

  const pos = useRef(new THREE.Vector3(start[0], floorAt(bounds[0], start[0], start[2]) + height, start[2]))
  const yaw = useRef(startYaw)
  const pitch = useRef(0)
  const bobPhase = useRef(0)
  const initialised = useRef(false)

  // Seed yaw on first activation so the player starts facing the right way.
  useEffect(() => {
    mouse.yaw.current = startYaw
    mouse.pitch.current = 0
    yaw.current = startYaw
    pitch.current = 0
  }, [startYaw, mouse.yaw, mouse.pitch])

  const forward = useMemo(() => new THREE.Vector3(), [])
  const right = useMemo(() => new THREE.Vector3(), [])
  const euler = useMemo(() => new THREE.Euler(0, 0, 0, 'YXZ'), [])

  useFrame((_, dt) => {
    if (!navState.ready) return

    if (!initialised.current) {
      const zone = findZone(start[0], start[2], bounds) ?? bounds[0]
      pos.current.set(start[0], floorAt(zone, start[0], start[2]) + height, start[2])
      camera.position.copy(pos.current)
      initialised.current = true
    }

    // Sync touch look deltas into yaw/pitch, then consume them
    if (touch.look.current.dx || touch.look.current.dy) {
      mouse.yaw.current -= touch.look.current.dx * 0.003
      mouse.pitch.current -= touch.look.current.dy * 0.003
      mouse.pitch.current = Math.max(-HALF_PI_MINUS, Math.min(HALF_PI_MINUS, mouse.pitch.current))
      touch.look.current.dx = 0
      touch.look.current.dy = 0
    }
    yaw.current = mouse.yaw.current
    pitch.current = mouse.pitch.current

    // Input to movement vector (local space)
    let fwd = 0
    let strafe = 0
    if (kbd.current.forward) fwd += 1
    if (kbd.current.back)    fwd -= 1
    if (kbd.current.left)    strafe -= 1
    if (kbd.current.right)   strafe += 1
    // Touch joystick — upward drag (negative y) = forward
    fwd    -= touch.move.current.y
    strafe += touch.move.current.x

    const mag = Math.hypot(fwd, strafe)
    if (mag > 1) { fwd /= mag; strafe /= mag }

    const spd = speed * (kbd.current.sprint ? 1.5 : 1) * dt
    forward.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current))
    right.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current))

    const nx = pos.current.x + forward.x * fwd * spd + right.x * strafe * spd
    const nz = pos.current.z + forward.z * fwd * spd + right.z * strafe * spd

    const clamped = clampToZones(nx, nz, bounds)
    const floorY = floorAt(clamped.zone, clamped.x, clamped.z)

    // Step-height guard. If the destination floor differs from the current
    // floor by more than maxStep, treat the boundary as a wall and reject
    // the xz move. This is what stops the rooftop's y=5 bound from yanking
    // the player up off the mid-stair ramp (and equivalent vice-versa
    // drops) when walking across overlapping bounds.
    const currentFloorY = pos.current.y - height
    if (Math.abs(floorY - currentFloorY) > maxStep) {
      // Reject move — keep xz at previous frame, recompute floor at the
      // unchanged xz so the resting height stays consistent.
      const stay = clampToZones(pos.current.x, pos.current.z, bounds)
      const stayFloorY = floorAt(stay.zone, stay.x, stay.z)
      pos.current.x = stay.x
      pos.current.z = stay.z
      const moving = 0
      bobPhase.current += dt * 8 * moving
      const bobY = Math.sin(bobPhase.current) * bob * moving
      pos.current.y = stayFloorY + height + bobY
      euler.set(pitch.current, yaw.current, 0, 'YXZ')
      camera.quaternion.setFromEuler(euler)
      camera.position.copy(pos.current)
      return
    }

    pos.current.x = clamped.x
    pos.current.z = clamped.z

    // Head-bob: phase advances with movement magnitude
    const moving = mag > 0.01 ? 1 : 0
    bobPhase.current += dt * 8 * moving
    const bobY = Math.sin(bobPhase.current) * bob * moving

    pos.current.y = floorY + height + bobY

    euler.set(pitch.current, yaw.current, 0, 'YXZ')
    camera.quaternion.setFromEuler(euler)
    camera.position.copy(pos.current)
  })

  return null
}
