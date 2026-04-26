import * as THREE from 'three'
import { MisterSoftee } from './MisterSoftee'

// A static Mister Softee parked on the sidewalk-side of the road.
// Reads as a snapshot of a 1980s HK street-corner ice cream beat as the
// tram glides past.

export function MisterSofteeStop() {
  return (
    <group position={[5.4, 0.05, -14]}>
      {/* Truck — rotation puts cab facing -Z (same as tram's forward),
          service window facing +X (toward sidewalk). */}
      <group rotation={[0, Math.PI / 2, 0]} scale={0.6}>
        <MisterSoftee />
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
