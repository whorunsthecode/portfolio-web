export function TerminusSky() {
  return (
    <>
      {/* Warm dusk sky — peachy/orange */}
      <mesh position={[0, 10, -25]}>
        <planeGeometry args={[80, 30]} />
        <meshBasicMaterial color="#d8886a" />
      </mesh>

      {/* Lower sky — warmer toward horizon */}
      <mesh position={[0, 3, -24]}>
        <planeGeometry args={[80, 8]} />
        <meshBasicMaterial color="#f4a878" />
      </mesh>

      {/* Horizon haze */}
      <mesh position={[0, 0.5, -23]}>
        <planeGeometry args={[80, 4]} />
        <meshBasicMaterial color="#d8c898" />
      </mesh>

      {/* Old HK building silhouettes */}
      {[
        { x: -16, h: 7, w: 3.5, color: '#3a2818' },
        { x: -10, h: 9, w: 3, color: '#4a3828' },
        { x: -4, h: 6, w: 4, color: '#3a2818' },
        { x: 4, h: 8, w: 3.5, color: '#4a3828' },
        { x: 11, h: 10, w: 3, color: '#3a2818' },
        { x: 17, h: 7, w: 3.5, color: '#4a3828' },
      ].map((b, i) => (
        <group key={i} position={[b.x, 0, -20]}>
          <mesh position={[0, b.h / 2, 0]}>
            <boxGeometry args={[b.w, b.h, 0.2]} />
            <meshStandardMaterial color={b.color} roughness={0.9} />
          </mesh>
          {/* Window lights */}
          {Array.from({ length: 8 }).map((_, j) => {
            const wx = (Math.sin(j * 3.7 + i) * 0.5) * (b.w - 0.5)
            const wy = 1 + Math.sin(j * 2.3 + i) * 0.5 * (b.h - 2) + (b.h - 2) * 0.5
            const lit = Math.sin(j * 1.7 + i * 2) > -0.2
            return (
              <mesh key={j} position={[wx, wy, 0.11]}>
                <planeGeometry args={[0.15, 0.15]} />
                <meshBasicMaterial color={lit ? '#ffb868' : '#3a2818'} />
              </mesh>
            )
          })}
          {/* Vertical neon sign on every other building */}
          {i % 2 === 0 && (
            <mesh position={[(b.w / 2) - 0.15, b.h * 0.6, 0.15]}>
              <planeGeometry args={[0.15, 1.5]} />
              <meshBasicMaterial color={i % 4 === 0 ? '#ff5050' : '#50b8ff'} />
            </mesh>
          )}
        </group>
      ))}

      {/* Power lines */}
      <mesh position={[0, 8, -18]}>
        <planeGeometry args={[40, 0.02]} />
        <meshBasicMaterial color="#1a1a18" />
      </mesh>
      <mesh position={[0, 7.7, -18]}>
        <planeGeometry args={[40, 0.02]} />
        <meshBasicMaterial color="#1a1a18" />
      </mesh>
    </>
  )
}
