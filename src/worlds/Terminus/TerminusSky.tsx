export function TerminusSky() {
  return (
    <>
      {/* Sky gradient — large plane far back */}
      <mesh position={[0, 10, -25]}>
        <planeGeometry args={[80, 30]} />
        <meshBasicMaterial color="#5a4874" />
      </mesh>

      {/* Horizon warm glow */}
      <mesh position={[0, 2, -23]}>
        <planeGeometry args={[80, 6]} />
        <meshBasicMaterial color="#ff9060" />
      </mesh>

      {/* Distant city silhouettes behind the parked tram */}
      {[
        { x: -15, h: 6, w: 3 },
        { x: -8, h: 8, w: 3 },
        { x: 0, h: 5, w: 4 },
        { x: 8, h: 7, w: 3 },
        { x: 14, h: 9, w: 2.5 },
      ].map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, -20]}>
          <boxGeometry args={[b.w, b.h, 0.1]} />
          <meshBasicMaterial color="#3a2a48" />
        </mesh>
      ))}
    </>
  )
}
