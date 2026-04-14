import { makeTextTexture } from '../../cabin/TextTexture'
import { useMemo } from 'react'

/**
 * Sai Ying Pun tram terminus shelter — visible ahead as the route ends.
 * Simple wooden shelter with slanted roof, bench, station sign.
 * Tracks end at a bumper stop behind.
 */
export function SaiYingPunShelter() {
  const signTex = useMemo(() => makeTextTexture({
    text: '西營盤 SAI YING PUN',
    fontSize: 32,
    color: '#1a2a18',
    fontFamily: 'Georgia, serif',
    width: 512,
    height: 64,
  }), [])

  return (
    <group>
      {/* Shelter posts */}
      {[[-2, 0, -1.5], [2, 0, -1.5], [-2, 0, 1.5], [2, 0, 1.5]].map(([x, _, z], i) => (
        <mesh key={i} position={[x, 1.8, z]} castShadow>
          <boxGeometry args={[0.12, 3.6, 0.12]} />
          <meshStandardMaterial color="#5c3a1e" roughness={0.85} />
        </mesh>
      ))}

      {/* Slanted roof */}
      <mesh position={[0, 3.8, 0]} rotation={[0.08, 0, 0]} castShadow>
        <boxGeometry args={[5, 0.08, 4]} />
        <meshStandardMaterial color="#7a6a52" roughness={0.8} />
      </mesh>

      {/* Back wall */}
      <mesh position={[0, 1.8, -1.6]}>
        <boxGeometry args={[4.2, 3.6, 0.06]} />
        <meshStandardMaterial color="#e8dcc8" roughness={0.8} />
      </mesh>

      {/* Station sign on back wall */}
      <mesh position={[0, 3, -1.56]}>
        <planeGeometry args={[2.5, 0.4]} />
        <meshStandardMaterial color="#f4edd8" roughness={0.75} />
      </mesh>
      <mesh position={[0, 3, -1.55]}>
        <planeGeometry args={[2.3, 0.3]} />
        <meshStandardMaterial map={signTex} transparent roughness={0.75} />
      </mesh>

      {/* Wooden bench */}
      <mesh position={[0, 0.5, -1.2]}>
        <boxGeometry args={[3, 0.06, 0.5]} />
        <meshStandardMaterial color="#8b6b3d" roughness={0.85} />
      </mesh>
      {/* Bench legs */}
      {[-1.2, 0, 1.2].map((x) => (
        <mesh key={x} position={[x, 0.25, -1.2]}>
          <boxGeometry args={[0.06, 0.5, 0.4]} />
          <meshStandardMaterial color="#5c3a1e" roughness={0.85} />
        </mesh>
      ))}

      {/* Track bumper stop */}
      <mesh position={[0, 0.3, -4]}>
        <boxGeometry args={[2, 0.6, 0.3]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.8} />
      </mesh>
      {/* Bumper striping */}
      <mesh position={[0, 0.3, -3.84]}>
        <planeGeometry args={[1.8, 0.4]} />
        <meshStandardMaterial color="#d4a020" roughness={0.7} />
      </mesh>
    </group>
  )
}
