import * as THREE from 'three'

// Ground-level dressing: puddles, stacked crates, a leaned bicycle, a
// garbage pail. Kept light — the main story is pipes + walls; clutter is
// ground texture.

function Puddle({ x, z, r }: { x: number; z: number; r: number }) {
  return (
    <mesh position={[x, 0.002, z]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[r, 20]} />
      <meshStandardMaterial
        color={'#0a0c10'}
        roughness={0.12}
        metalness={0.3}
        envMapIntensity={0.8}
      />
    </mesh>
  )
}

function Crate({ pos, size, rot = 0 }: { pos: [number, number, number]; size: [number, number, number]; rot?: number }) {
  return (
    <group position={pos} rotation={[0, rot, 0]}>
      <mesh position={[0, size[1] / 2, 0]} castShadow>
        <boxGeometry args={size} />
        <meshStandardMaterial color={'#5a3a20'} roughness={0.85} />
      </mesh>
      {/* Slat lines across the top face */}
      {Array.from({ length: 4 }, (_, i) => (
        <mesh key={i} position={[0, size[1] + 0.001, -size[2] / 2 + (i + 0.5) * (size[2] / 4)]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[size[0] * 0.95, 0.02]} />
          <meshStandardMaterial color={'#2a1a0c'} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

function Bicycle({ x, z, rot }: { x: number; z: number; rot: number }) {
  // Silhouette bike leaning against the wall — two wheels + frame.
  return (
    <group position={[x, 0, z]} rotation={[0, rot, 0]}>
      {/* Rear wheel */}
      <mesh position={[-0.3, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.27, 0.025, 8, 20]} />
        <meshStandardMaterial color={'#1a1410'} roughness={0.8} />
      </mesh>
      {/* Front wheel */}
      <mesh position={[0.38, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.27, 0.025, 8, 20]} />
        <meshStandardMaterial color={'#1a1410'} roughness={0.8} />
      </mesh>
      {/* Frame bar */}
      <mesh position={[0, 0.5, 0]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.7, 0.025, 0.025]} />
        <meshStandardMaterial color={'#3a2a1e'} metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Seat post */}
      <mesh position={[-0.2, 0.6, 0]}>
        <boxGeometry args={[0.025, 0.3, 0.025]} />
        <meshStandardMaterial color={'#3a2a1e'} metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Seat */}
      <mesh position={[-0.24, 0.75, 0]}>
        <boxGeometry args={[0.12, 0.03, 0.06]} />
        <meshStandardMaterial color={'#1a1008'} roughness={0.85} />
      </mesh>
      {/* Handlebars */}
      <mesh position={[0.4, 0.78, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <boxGeometry args={[0.025, 0.3, 0.025]} />
        <meshStandardMaterial color={'#3a2a1e'} metalness={0.3} roughness={0.6} />
      </mesh>
    </group>
  )
}

function TrashPail({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 0.28, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.56, 14]} />
        <meshStandardMaterial color={'#4a4438'} metalness={0.3} roughness={0.75} />
      </mesh>
      {/* Garbage bag lump on top */}
      <mesh position={[0, 0.65, 0]}>
        <sphereGeometry args={[0.2, 12, 10]} />
        <meshStandardMaterial color={'#1a1610'} roughness={0.9} />
      </mesh>
    </group>
  )
}

export function Clutter() {
  return (
    <>
      {/* Puddles */}
      <Puddle x={-0.2} z={-1.2} r={0.35} />
      <Puddle x={0.3} z={1.5} r={0.22} />
      <Puddle x={-0.4} z={3.0} r={0.18} />
      <Puddle x={0.1} z={-3.6} r={0.28} />

      {/* Crates */}
      <Crate pos={[0.6, 0, -4.1]} size={[0.44, 0.42, 0.38]} rot={0.2} />
      <Crate pos={[0.6, 0.42, -4.1]} size={[0.4, 0.3, 0.34]} rot={-0.1} />
      <Crate pos={[-0.55, 0, 3.8]} size={[0.4, 0.36, 0.32]} rot={0.35} />

      {/* Bicycle leaned against right wall */}
      <Bicycle x={0.55} z={0.8} rot={Math.PI / 2 + 0.1} />

      {/* Trash pails */}
      <TrashPail x={-0.55} z={-4.0} />
      <TrashPail x={0.6} z={2.6} />

      {/* Stray newspapers (flat dark rectangles on the floor) */}
      {[
        { pos: [0.05, 0.004, 0.2] as [number, number, number], rot: 0.4 },
        { pos: [-0.3, 0.004, -2.1] as [number, number, number], rot: -0.6 },
        { pos: [0.2, 0.004, -0.8] as [number, number, number], rot: 0.15 },
      ].map((n, i) => (
        <mesh key={i} position={n.pos} rotation={[-Math.PI / 2, 0, n.rot]}>
          <planeGeometry args={[0.22, 0.3]} />
          <meshStandardMaterial color={'#8a8068'} roughness={0.95} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  )
}
