import * as THREE from 'three'
import { MisterSoftee } from './MisterSoftee'

// A static Mister Softee parked on the sidewalk-side of the road with a
// short queue of customers at the service window. The queue isn't
// animated — it reads as a snapshot of a 1980s HK street-corner ice
// cream beat as the tram glides past.

interface Customer {
  dx: number              // world offset from queue head, along -X (back of queue)
  height: number
  shirt: string
  pants: string
  skin: string
  hair: string
  bag?: string            // optional shoulder bag colour
}

const QUEUE: Customer[] = [
  // Queue head — closest to the service window
  { dx: 0.0,  height: 1.65, shirt: '#d8b048', pants: '#3a3428', skin: '#d4a878', hair: '#1a1210' },
  // Small kid behind them
  { dx: 0.7,  height: 1.1,  shirt: '#b83838', pants: '#2a3a58', skin: '#d8b088', hair: '#1a1210' },
  // Auntie with a red-white-blue bag
  { dx: 1.5,  height: 1.55, shirt: '#e8dcc4', pants: '#454038', skin: '#c89870', hair: '#2a1a10', bag: '#b02828' },
]

function QueuePerson({ c }: { c: Customer }) {
  return (
    <group position={[0, 0, 0]}>
      {/* Legs (pants) */}
      <mesh position={[0, c.height * 0.25, 0]}>
        <cylinderGeometry args={[0.11, 0.1, c.height * 0.5, 10]} />
        <meshStandardMaterial color={c.pants} roughness={0.9} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, c.height * 0.62, 0]}>
        <cylinderGeometry args={[0.15, 0.13, c.height * 0.28, 10]} />
        <meshStandardMaterial color={c.shirt} roughness={0.85} />
      </mesh>
      {/* Shoulders cap */}
      <mesh position={[0, c.height * 0.77, 0]}>
        <sphereGeometry args={[0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={c.shirt} roughness={0.85} />
      </mesh>
      {/* Head */}
      <mesh position={[0, c.height * 0.9, 0]}>
        <sphereGeometry args={[0.11, 14, 12]} />
        <meshStandardMaterial color={c.skin} roughness={0.85} />
      </mesh>
      {/* Hair cap */}
      <mesh position={[0, c.height * 0.94, -0.01]}>
        <sphereGeometry args={[0.115, 14, 10, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={c.hair} roughness={0.85} />
      </mesh>
      {/* Arms hanging at sides */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[s * 0.18, c.height * 0.55, 0]}>
          <cylinderGeometry args={[0.04, 0.035, c.height * 0.32, 8]} />
          <meshStandardMaterial color={c.skin} roughness={0.85} />
        </mesh>
      ))}
      {/* Optional shoulder bag */}
      {c.bag && (
        <mesh position={[0.22, c.height * 0.5, 0]}>
          <boxGeometry args={[0.18, 0.22, 0.1]} />
          <meshStandardMaterial color={c.bag} roughness={0.85} />
        </mesh>
      )}
    </group>
  )
}

// Wraps the truck + queue in one group. The truck's service window is
// on its +Z local face; with the wrapper rotated so local +X points
// down the street (rotation +π/2 around Y in the parent), the service
// window ends up facing +X world — i.e. toward the sidewalk.
export function MisterSofteeStop() {
  return (
    <group position={[5.4, 0.05, -14]}>
      {/* Truck — rotation puts cab facing -Z (same as tram's forward),
          service window facing +X (toward sidewalk). */}
      <group rotation={[0, Math.PI / 2, 0]} scale={0.6}>
        <MisterSoftee />
      </group>

      {/* Customer queue — lined up on the sidewalk side of the truck
          (at +X), facing the service window (-X). The queue extends
          toward +Z (behind the truck in its driving direction) so
          people don't block the truck's front. */}
      <group position={[1.3, -0.05, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {QUEUE.map((c, i) => (
          <group key={i} position={[c.dx, 0, 0]}>
            <QueuePerson c={c} />
          </group>
        ))}
      </group>

      {/* Small signage board on the sidewalk — "新地雪糕 / Ice Cream"
          stand-alone A-frame sign. Plain wood + canvas feel. */}
      <mesh position={[1.0, 0.5, 1.3]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.04, 0.7, 0.5]} />
        <meshStandardMaterial color={'#c8a460'} roughness={0.85} />
      </mesh>
      <mesh position={[1.0, 0.48, 1.31]} rotation={[0, 0.3, 0]}>
        <planeGeometry args={[0.45, 0.6]} />
        <meshStandardMaterial color={'#f4ecd0'} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}
