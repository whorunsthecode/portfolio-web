import { BING_SUTT } from './index'

export function Booths() {
  // Booth runs along the doorway-side wall (x near BING_SUTT.doorwayX),
  // facing into the shop. Octagonal table sits in the center of the
  // remaining space.
  const boothZ = (BING_SUTT.zNear + BING_SUTT.zFar) / 2 - 0.3
  const tableX = BING_SUTT.midX + 0.1
  const tableZ = (BING_SUTT.zNear + BING_SUTT.zFar) / 2 + 0.6

  return (
    <group>
      {/* === Booth seat (along the doorway-side wall) === */}
      <group position={[BING_SUTT.doorwayX + 0.4, 0, boothZ]}>
        {/* Wood frame base */}
        <mesh position={[0, 0.2, 0]}>
          <boxGeometry args={[0.5, 0.4, 1.2]} />
          <meshStandardMaterial color={'#3a2818'} roughness={0.85} />
        </mesh>
        {/* Green vinyl seat cushion */}
        <mesh position={[0, 0.42, 0]}>
          <boxGeometry args={[0.48, 0.06, 1.18]} />
          <meshStandardMaterial color={'#3a6048'} roughness={0.65} />
        </mesh>
        {/* Vinyl back cushion (against the wall) */}
        <mesh position={[-0.21, 0.75, 0]}>
          <boxGeometry args={[0.06, 0.6, 1.18]} />
          <meshStandardMaterial color={'#3a6048'} roughness={0.65} />
        </mesh>
        {/* Wood high-back trim */}
        <mesh position={[-0.245, 1.1, 0]}>
          <boxGeometry args={[0.04, 0.1, 1.18]} />
          <meshStandardMaterial color={'#3a2818'} roughness={0.9} />
        </mesh>
        {/* Brown tape patch on the cushion (per spec — "膠布修補") */}
        <mesh position={[0.241, 0.42, 0.3]}>
          <planeGeometry args={[0.15, 0.04]} />
          <meshStandardMaterial color={'#6a4a28'} roughness={0.6} />
        </mesh>
      </group>

      {/* Booth table (rectangle, marble-top) */}
      <group position={[BING_SUTT.doorwayX + 0.85, 0, boothZ]}>
        <mesh position={[0, 0.7, 0]}>
          <boxGeometry args={[0.6, 0.04, 1.0]} />
          <meshStandardMaterial color={'#e8e0d0'} roughness={0.4} />
        </mesh>
        {/* Single center pedestal */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.03, 0.04, 0.7, 8]} />
          <meshStandardMaterial color={'#1a1410'} metalness={0.4} roughness={0.5} />
        </mesh>
        {/* Stacked menus */}
        <mesh position={[0.2, 0.74, 0.3]}>
          <boxGeometry args={[0.1, 0.015, 0.18]} />
          <meshStandardMaterial color={'#f0e8d0'} roughness={0.85} />
        </mesh>
        {/* 3 sauce bottles */}
        {[-0.18, -0.1, -0.02].map((zOff, i) => (
          <mesh key={i} position={[-0.2, 0.78, zOff + 0.3]}>
            <cylinderGeometry args={[0.018, 0.02, 0.12, 8]} />
            <meshStandardMaterial
              color={i === 0 ? '#3a1a0a' : i === 1 ? '#a01818' : '#d0a040'}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* === Octagonal center table === */}
      <group position={[tableX, 0, tableZ]}>
        <mesh position={[0, 0.7, 0]} rotation={[0, Math.PI / 8, 0]}>
          <cylinderGeometry args={[0.4, 0.4, 0.04, 8]} />
          <meshStandardMaterial color={'#5a3a20'} roughness={0.7} />
        </mesh>
        {/* Center pedestal */}
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.7, 8]} />
          <meshStandardMaterial color={'#1a1410'} metalness={0.4} roughness={0.5} />
        </mesh>

        {/* Recent-evidence cue: half-eaten siu yuk over rice + iced tea */}
        {/* Rice bowl with siu yuk on top */}
        <mesh position={[-0.1, 0.74, -0.05]}>
          <cylinderGeometry args={[0.07, 0.06, 0.05, 12]} />
          <meshStandardMaterial color={'#f4f0e8'} roughness={0.3} />
        </mesh>
        <mesh position={[-0.1, 0.78, -0.05]}>
          <boxGeometry args={[0.06, 0.025, 0.04]} />
          <meshStandardMaterial color={'#5a2818'} roughness={0.6} />
        </mesh>
        {/* Iced tea glass with straw */}
        <mesh position={[0.12, 0.78, 0.08]}>
          <cylinderGeometry args={[0.03, 0.025, 0.13, 10]} />
          <meshStandardMaterial color={'#5a2810'} transparent opacity={0.75} roughness={0.1} />
        </mesh>
        <mesh position={[0.12, 0.85, 0.08]} rotation={[0, 0, 0.3]}>
          <cylinderGeometry args={[0.003, 0.003, 0.1, 4]} />
          <meshStandardMaterial color={'#f0e8d0'} />
        </mesh>
        {/* Chopsticks across the bowl */}
        <mesh position={[-0.08, 0.79, -0.05]} rotation={[0, 0, Math.PI / 2 + 0.4]}>
          <cylinderGeometry args={[0.003, 0.003, 0.18, 4]} />
          <meshStandardMaterial color={'#d0b888'} />
        </mesh>
      </group>

      {/* 4 red metal-frame stools around the octagonal table */}
      {[
        [tableX, tableZ - 0.6],
        [tableX, tableZ + 0.6],
        [tableX + 0.6, tableZ],
        [tableX - 0.6, tableZ],
      ].map(([sx, sz], i) => (
        <group key={i} position={[sx, 0, sz]}>
          {/* Wood seat */}
          <mesh position={[0, 0.42, 0]}>
            <cylinderGeometry args={[0.16, 0.16, 0.04, 12]} />
            <meshStandardMaterial color={'#5a3a20'} roughness={0.8} />
          </mesh>
          {/* 4 red metal legs */}
          {[[-0.1, -0.1], [0.1, -0.1], [-0.1, 0.1], [0.1, 0.1]].map((p, j) => (
            <mesh key={j} position={[p[0], 0.21, p[1]]}>
              <cylinderGeometry args={[0.012, 0.012, 0.42, 6]} />
              <meshStandardMaterial color={'#a02020'} metalness={0.5} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
