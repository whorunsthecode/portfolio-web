import { useRef, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { RedTaxi } from './RedTaxi'
import { KmbBus } from './KmbBus'
import { OncomingTram } from './OncomingTram'
import { PrivateCar, type PrivateCarVariant } from './PrivateCar'
import { DeliveryVan } from './DeliveryVan'

/**
 * 1980s Hong Kong traffic scene.
 *
 * Seated camera sits at z=-7.6 looking forward toward z=-11 (i.e. -Z is
 * "ahead"). Vehicles therefore spawn far ahead at strongly negative z and
 * travel toward the camera (positive z velocity in world frame), being
 * recycled once they've passed the camera to positive z.
 *
 *   Same-direction traffic: slower than the tram → slowly drifts toward
 *   camera (0.7× tramSpeed relative).
 *   Oncoming traffic: moving opposite the tram → fast apparent motion
 *   (1.5× tramSpeed relative), including the parallel-track HK tram.
 */

type VehicleType = 'taxi' | 'bus' | 'tram' | 'car' | 'van'

interface Vehicle {
  id: number
  type: VehicleType
  /** Visual variant (e.g. Mini vs W123) and seed for per-instance detail. */
  variant: number
  /** Concrete private-car sub-type, only meaningful when type === 'car'. */
  carVariant?: PrivateCarVariant
  lane: number
  z: number
  /** z units per second; positive = toward camera. */
  speed: number
  /** 1 = same direction as tram (faces -Z); -1 = oncoming (faces +Z). */
  direction: 1 | -1
  /** Uniform scale applied to the group wrapper. */
  scale: number
  /** Lift so wheels sit on the road. */
  yOffset: number
  /** Minimum spawn gap from other vehicles in the same lane. */
  minGap: number
}

const LANES = {
  oncomingTram: -2.9,
  oncomingCar: -4.5,
  sameDirCar: 2.0,
} as const

const TRAM_SPEED = 4
const SAME_DIR_SPEED = TRAM_SPEED * 0.7
const ONCOMING_SPEED = TRAM_SPEED * 1.5
const ONCOMING_TRAM_SPEED = TRAM_SPEED * 1.2

// Vehicles are seeded ahead of the camera (seated at z=-7.6, look=-11)
// and recycled after passing.
const SPAWN_Z = -55
const RECYCLE_MIN = -70
const RECYCLE_MAX = 12

// Per-type spawn cadence (in seconds). Each type has its own timer.
const CADENCE: Record<VehicleType, [number, number]> = {
  taxi: [8, 12],
  bus: [12, 18],
  tram: [20, 30],
  car: [5, 10],
  van: [15, 25],
}

// Weighted selection of PrivateCar variants per spec: 40/35/25.
function pickCarVariant(rand: number): PrivateCarVariant {
  if (rand < 0.4) return 'mini'
  if (rand < 0.75) return 'w123'
  return 'cedric'
}

function rand(min: number, max: number) {
  return min + Math.random() * (max - min)
}

let nextId = 0

export function TrafficSystem() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const vehiclesRef = useRef<Vehicle[]>([])
  const initialized = useRef(false)

  // Per-type spawn timers and per-type next-fire intervals.
  const spawnTimers = useRef<Record<VehicleType, number>>({
    taxi: 0,
    bus: 0,
    tram: 0,
    car: 0,
    van: 0,
  })
  const nextFire = useRef<Record<VehicleType, number>>({
    taxi: rand(...CADENCE.taxi),
    bus: rand(...CADENCE.bus),
    tram: rand(...CADENCE.tram),
    car: rand(...CADENCE.car),
    van: rand(...CADENCE.van),
  })

  /**
   * Build a Vehicle record for the requested type, picking a lane and
   * enforcing a minimum spawn gap. Returns null if the target lane is
   * currently too congested (caller should just skip this tick).
   */
  const buildVehicle = useCallback(
    (type: VehicleType, forceZ?: number): Vehicle | null => {
      let lane: number
      let direction: 1 | -1
      let speed: number
      let scale: number
      let yOffset: number
      let minGap: number
      let variant = Math.floor(Math.random() * 1000)
      let carVariant: PrivateCarVariant | undefined

      switch (type) {
        case 'tram': {
          lane = LANES.oncomingTram
          direction = -1
          speed = ONCOMING_TRAM_SPEED
          scale = 1.0
          // Tram wheels (r=0.25) at local y=0.35 → bottom at 0.10, sits on rails (top ≈ 0.09)
          yOffset = 0
          minGap = 18
          break
        }
        case 'bus': {
          const oncoming = variant % 2 === 0
          lane = oncoming ? LANES.oncomingCar : LANES.sameDirCar
          direction = oncoming ? -1 : 1
          speed = oncoming ? ONCOMING_SPEED : SAME_DIR_SPEED
          // Scale 0.6 (not 0.7) so bus width 1.5 clears catenary poles at x=2.85
          scale = 0.6
          // Wheels (r=0.5) at local y=0.5 → bottom at 0*0.6=0, need +0.05 for road
          yOffset = 0.05
          minGap = 14
          break
        }
        case 'taxi': {
          const oncoming = Math.random() < 0.55
          lane = oncoming ? LANES.oncomingCar : LANES.sameDirCar
          direction = oncoming ? -1 : 1
          speed = oncoming ? ONCOMING_SPEED : SAME_DIR_SPEED
          scale = 0.55
          // Wheels (r=0.3) at local y=0.15 → bottom at -0.0825, need +0.13
          yOffset = 0.13
          minGap = 6
          break
        }
        case 'car': {
          const oncoming = Math.random() < 0.55
          lane = oncoming ? LANES.oncomingCar : LANES.sameDirCar
          direction = oncoming ? -1 : 1
          speed = oncoming ? ONCOMING_SPEED : SAME_DIR_SPEED
          scale = 0.55
          // W123 worst case: wheels (r=0.32) at y=0.18 → bottom -0.077, need +0.13
          yOffset = 0.13
          minGap = 5
          carVariant = pickCarVariant(Math.random())
          break
        }
        case 'van': {
          const oncoming = Math.random() < 0.5
          lane = oncoming ? LANES.oncomingCar : LANES.sameDirCar
          direction = oncoming ? -1 : 1
          speed = oncoming ? ONCOMING_SPEED : SAME_DIR_SPEED
          scale = 0.6
          // Wheels (r=0.32) at local y=0.28 → bottom -0.024, need +0.07
          yOffset = 0.07
          minGap = 8
          break
        }
      }

      const z = forceZ ?? SPAWN_Z - Math.random() * 10
      const tooClose = vehiclesRef.current.some(
        (v) => v.lane === lane && Math.abs(v.z - z) < Math.max(minGap, v.minGap),
      )
      if (tooClose) return null

      return {
        id: nextId++,
        type,
        variant,
        carVariant,
        lane,
        z,
        // Speed is positive (toward camera) in world frame.
        speed,
        direction,
        scale,
        yOffset,
        minGap,
      }
    },
    [],
  )

  const trySpawn = useCallback(
    (type: VehicleType, forceZ?: number) => {
      const v = buildVehicle(type, forceZ)
      if (!v) return false
      vehiclesRef.current.push(v)
      return true
    },
    [buildVehicle],
  )

  useFrame((_, delta) => {
    // ── Seed some starting traffic on first frame so the scene isn't empty.
    if (!initialized.current) {
      initialized.current = true
      // Scatter a mix across z so traffic is visible immediately.
      trySpawn('tram', -45)
      trySpawn('bus', -30)
      trySpawn('taxi', -50)
      trySpawn('taxi', -25)
      trySpawn('car', -40)
      trySpawn('car', -18)
      trySpawn('car', -55)
      trySpawn('van', -35)
      setVehicles([...vehiclesRef.current])
    }

    // ── Integrate positions.
    for (const v of vehiclesRef.current) {
      v.z += v.speed * delta
    }

    // ── Recycle anything off-stage.
    const before = vehiclesRef.current.length
    vehiclesRef.current = vehiclesRef.current.filter(
      (v) => v.z > RECYCLE_MIN && v.z < RECYCLE_MAX,
    )
    let changed = vehiclesRef.current.length !== before

    // ── Advance per-type spawn timers.
    const types: VehicleType[] = ['taxi', 'bus', 'tram', 'car', 'van']
    for (const t of types) {
      spawnTimers.current[t] += delta
      if (spawnTimers.current[t] >= nextFire.current[t]) {
        // Cap total vehicles for perf.
        if (vehiclesRef.current.length < 14) {
          if (trySpawn(t)) changed = true
        }
        spawnTimers.current[t] = 0
        nextFire.current[t] = rand(...CADENCE[t])
      }
    }

    // Always push updates so motion is reflected (positions mutate in place,
    // but we need to re-render so React commits the new props).
    if (changed || vehiclesRef.current.length > 0) {
      setVehicles([...vehiclesRef.current])
    }
  })

  return (
    <>
      {vehicles.map((v) => (
        <group
          key={v.id}
          position={[v.lane, v.yOffset, v.z]}
          // Rotate so local +X aligns with world direction of travel.
          // direction  1 (same-dir, faces -Z): rotation -π/2
          // direction -1 (oncoming,  faces +Z): rotation +π/2
          rotation={[0, v.direction === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}
          scale={[v.scale, v.scale, v.scale]}
        >
          {renderVehicle(v)}
        </group>
      ))}
    </>
  )
}

function renderVehicle(v: Vehicle) {
  switch (v.type) {
    case 'taxi':
      return <RedTaxi />
    case 'bus':
      return <KmbBus variantSeed={v.variant} />
    case 'tram':
      return <OncomingTram variantSeed={v.variant} />
    case 'car':
      return <PrivateCar variant={v.carVariant ?? 'mini'} variantSeed={v.variant} />
    case 'van':
      return <DeliveryVan variantSeed={v.variant} />
  }
}
