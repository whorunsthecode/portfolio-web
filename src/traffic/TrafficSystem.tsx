import { useRef, useState, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { RedTaxi } from './RedTaxi'

interface Vehicle {
  id: number
  type: 'taxi'
  lane: number       // x position
  z: number           // current z position
  speed: number       // z units per second (negative = toward camera)
  direction: 1 | -1   // 1 = same direction as tram, -1 = oncoming
}

const LANES = {
  oncomingCar: -5.5,
  sameDirCar: 3.5,
}

const RECYCLE_MIN = -40
const RECYCLE_MAX = 10

const TRAM_SPEED = 4

let nextId = 0

export function TrafficSystem() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const spawnTimer = useRef(0)
  const vehiclesRef = useRef<Vehicle[]>([])
  const initialized = useRef(false)

  const spawnVehicle = useCallback((forceZ?: number) => {
    const laneOptions = [
      { lane: LANES.oncomingCar, direction: -1 as const, speed: TRAM_SPEED * 1.5 },
      { lane: LANES.sameDirCar, direction: 1 as const, speed: TRAM_SPEED * 0.7 },
      { lane: LANES.oncomingCar, direction: -1 as const, speed: TRAM_SPEED * 1.2 },
    ]
    const pick = laneOptions[Math.floor(Math.random() * laneOptions.length)]

    // Oncoming starts far ahead (negative z), same-dir starts behind (positive z)
    const startZ = forceZ ?? (pick.direction === -1 ? -35 : 5)

    const minGap = 6
    const tooClose = vehiclesRef.current.some(
      (v) => v.lane === pick.lane && Math.abs(v.z - startZ) < minGap
    )
    if (tooClose) return

    const newVehicle: Vehicle = {
      id: nextId++,
      type: 'taxi',
      lane: pick.lane,
      z: startZ,
      speed: pick.speed * (pick.direction === -1 ? -1 : 1),
      direction: pick.direction,
    }

    vehiclesRef.current.push(newVehicle)
    setVehicles([...vehiclesRef.current])
  }, [])

  useFrame((_, delta) => {
    // Seed initial vehicles on first frame
    if (!initialized.current) {
      initialized.current = true
      // Spawn a few at scattered positions so traffic is visible immediately
      for (let i = 0; i < 4; i++) {
        spawnVehicle(-10 - i * 8)
      }
    }

    // Update positions
    let changed = false
    vehiclesRef.current.forEach((v) => {
      v.z += v.speed * delta
    })

    // Recycle vehicles that exit the range
    const before = vehiclesRef.current.length
    vehiclesRef.current = vehiclesRef.current.filter(
      (v) => v.z > RECYCLE_MIN && v.z < RECYCLE_MAX
    )
    if (vehiclesRef.current.length !== before) changed = true

    // Spawn timer
    spawnTimer.current += delta
    const spawnInterval = 3 + Math.random() * 4 // 3-7 seconds
    if (spawnTimer.current > spawnInterval && vehiclesRef.current.length < 12) {
      spawnTimer.current = 0
      spawnVehicle()
      changed = true
    }

    if (changed) setVehicles([...vehiclesRef.current])
  })

  return (
    <>
      {vehicles.map((v) => (
        <group
          key={v.id}
          position={[v.lane, 0, v.z]}
          rotation={[0, v.direction === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}
          scale={[0.55, 0.55, 0.55]}
        >
          <RedTaxi />
        </group>
      ))}
    </>
  )
}
