import { useMemo } from 'react'
import { Text } from '@react-three/drei'

/* ═══════════════════════════════════════════════════════
   Stylized painting: Van Gogh's "The Starry Night" (1889)
   ═══════════════════════════════════════════════════════ */
function StarryNight({ width = 1.2, height = 0.9 }) {
  return (
    <group>
      {/* Canvas base — deep swirling blue */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#1a2858" roughness={0.9} />
      </mesh>

      {/* Upper sky lighter swaths */}
      <mesh position={[0, 0.2, 0.003]}>
        <planeGeometry args={[width, 0.15]} />
        <meshStandardMaterial color="#2a4878" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.35, 0.003]}>
        <planeGeometry args={[width, 0.12]} />
        <meshStandardMaterial color="#3a5888" roughness={0.85} />
      </mesh>

      {/* Yellow moon/halo — upper right */}
      <mesh position={[0.38, 0.3, 0.005]}>
        <circleGeometry args={[0.08, 16]} />
        <meshStandardMaterial color="#f8d868" roughness={0.7} />
      </mesh>
      <mesh position={[0.38, 0.3, 0.004]}>
        <ringGeometry args={[0.08, 0.14, 16]} />
        <meshStandardMaterial color="#e8a848" roughness={0.7} transparent opacity={0.5} />
      </mesh>

      {/* Stars with halos */}
      {[
        { x: -0.35, y: 0.32, r: 0.03 },
        { x: -0.15, y: 0.38, r: 0.025 },
        { x: 0.05, y: 0.28, r: 0.028 },
        { x: 0.2, y: 0.42, r: 0.02 },
        { x: -0.45, y: 0.15, r: 0.022 },
      ].map((star, i) => (
        <group key={i} position={[star.x, star.y, 0.005]}>
          <mesh>
            <circleGeometry args={[star.r, 10]} />
            <meshStandardMaterial color="#f8e880" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, -0.001]}>
            <ringGeometry args={[star.r, star.r * 2, 10]} />
            <meshStandardMaterial color="#d8a848" transparent opacity={0.4} />
          </mesh>
        </group>
      ))}

      {/* Swirling cloud brushstroke bands */}
      {[
        { y: 0.18, w: width * 0.9, color: '#4a6898' },
        { y: 0.05, w: width * 0.85, color: '#3a5888' },
        { y: -0.08, w: width * 0.8, color: '#2a4878' },
      ].map((band, i) => (
        <mesh key={i} position={[0, band.y, 0.004]}>
          <planeGeometry args={[band.w, 0.04]} />
          <meshStandardMaterial color={band.color} roughness={0.85} />
        </mesh>
      ))}

      {/* Cypress tree — tall dark silhouette on left */}
      <mesh position={[-0.42, -0.08, 0.006]}>
        <coneGeometry args={[0.1, 0.5, 3]} />
        <meshStandardMaterial color="#0a1828" roughness={0.9} />
      </mesh>
      <mesh position={[-0.44, -0.25, 0.006]}>
        <boxGeometry args={[0.04, 0.2, 0.01]} />
        <meshStandardMaterial color="#0a1828" />
      </mesh>

      {/* Village rooftops */}
      {[-0.25, -0.1, 0.05, 0.18, 0.3].map((x, i) => (
        <group key={i} position={[x, -0.35, 0.005]}>
          <mesh>
            <boxGeometry args={[0.08, 0.05, 0.01]} />
            <meshStandardMaterial color="#2a1a28" />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <coneGeometry args={[0.05, 0.04, 3]} />
            <meshStandardMaterial color="#3a2a38" />
          </mesh>
          {i % 2 === 0 && (
            <mesh position={[0, -0.005, 0.005]}>
              <planeGeometry args={[0.02, 0.02]} />
              <meshBasicMaterial color="#f8d868" />
            </mesh>
          )}
        </group>
      ))}

      {/* Church steeple */}
      <mesh position={[0.1, -0.28, 0.007]}>
        <coneGeometry args={[0.03, 0.18, 4]} />
        <meshStandardMaterial color="#1a1028" />
      </mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   Stylized painting: Da Vinci's "Mona Lisa" (c. 1503)
   Dark background + woman silhouette + characteristic smile + sfumato gold
   ═══════════════════════════════════════════════════════ */
function MonaLisa({ width = 1.2, height = 0.9 }) {
  return (
    <group>
      {/* Canvas base — warm dark sfumato brown */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#3a2818" roughness={0.9} />
      </mesh>

      {/* Background landscape — muted blue-green misty hills upper portion */}
      <mesh position={[0, 0.25, 0.002]}>
        <planeGeometry args={[width, 0.4]} />
        <meshStandardMaterial color="#5a6048" roughness={0.85} />
      </mesh>
      {/* Distant mountains */}
      <mesh position={[-0.25, 0.18, 0.003]}>
        <coneGeometry args={[0.12, 0.1, 3]} />
        <meshStandardMaterial color="#3a4838" roughness={0.85} />
      </mesh>
      <mesh position={[0.25, 0.2, 0.003]}>
        <coneGeometry args={[0.14, 0.12, 3]} />
        <meshStandardMaterial color="#3a4838" roughness={0.85} />
      </mesh>

      {/* Sky band at top — pale gold */}
      <mesh position={[0, 0.42, 0.002]}>
        <planeGeometry args={[width, 0.06]} />
        <meshStandardMaterial color="#a89878" roughness={0.85} />
      </mesh>

      {/* === THE FIGURE === */}

      {/* Body/dress — large dark brown trapezoid */}
      <mesh position={[0, -0.25, 0.004]}>
        <planeGeometry args={[0.55, 0.45]} />
        <meshStandardMaterial color="#1a1008" roughness={0.9} />
      </mesh>
      {/* Body shoulders taper — slightly narrower top */}
      <mesh position={[0, -0.05, 0.005]}>
        <planeGeometry args={[0.4, 0.18]} />
        <meshStandardMaterial color="#1a1008" roughness={0.9} />
      </mesh>

      {/* Crossed arms hint — horizontal tan band across the dress */}
      <mesh position={[0, -0.18, 0.006]}>
        <planeGeometry args={[0.35, 0.04]} />
        <meshStandardMaterial color="#8a6a48" roughness={0.85} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.04, 0.005]}>
        <planeGeometry args={[0.08, 0.08]} />
        <meshStandardMaterial color="#c8a888" roughness={0.85} />
      </mesh>

      {/* Face — oval (use circleGeometry slightly squished) */}
      <mesh position={[0, 0.15, 0.006]} scale={[1, 1.2, 1]}>
        <circleGeometry args={[0.11, 16]} />
        <meshStandardMaterial color="#d8b898" roughness={0.85} />
      </mesh>

      {/* Hair on each side of face — dark sweeps */}
      <mesh position={[-0.13, 0.16, 0.005]} scale={[0.6, 1.4, 1]}>
        <circleGeometry args={[0.08, 12]} />
        <meshStandardMaterial color="#1a1008" roughness={0.9} />
      </mesh>
      <mesh position={[0.13, 0.16, 0.005]} scale={[0.6, 1.4, 1]}>
        <circleGeometry args={[0.08, 12]} />
        <meshStandardMaterial color="#1a1008" roughness={0.9} />
      </mesh>

      {/* Hair top — small dark cap above the head */}
      <mesh position={[0, 0.27, 0.005]} scale={[1.1, 0.5, 1]}>
        <circleGeometry args={[0.1, 12]} />
        <meshStandardMaterial color="#1a1008" roughness={0.9} />
      </mesh>

      {/* Eyes — two small dark dots */}
      <mesh position={[-0.04, 0.18, 0.007]}>
        <circleGeometry args={[0.012, 8]} />
        <meshBasicMaterial color="#2a1808" />
      </mesh>
      <mesh position={[0.04, 0.18, 0.007]}>
        <circleGeometry args={[0.012, 8]} />
        <meshBasicMaterial color="#2a1808" />
      </mesh>

      {/* Eyebrow hints — thin dark slashes */}
      <mesh position={[-0.04, 0.21, 0.007]}>
        <planeGeometry args={[0.025, 0.005]} />
        <meshBasicMaterial color="#5a4028" transparent opacity={0.4} />
      </mesh>
      <mesh position={[0.04, 0.21, 0.007]}>
        <planeGeometry args={[0.025, 0.005]} />
        <meshBasicMaterial color="#5a4028" transparent opacity={0.4} />
      </mesh>

      {/* The smile — a small subtle curve */}
      <mesh position={[0, 0.115, 0.007]} rotation={[0, 0, Math.PI]}>
        <torusGeometry args={[0.022, 0.004, 6, 12, Math.PI]} />
        <meshBasicMaterial color="#5a3018" />
      </mesh>

      {/* Nose suggestion — tiny shadow line */}
      <mesh position={[0, 0.15, 0.007]}>
        <planeGeometry args={[0.008, 0.04]} />
        <meshBasicMaterial color="#a8886a" transparent opacity={0.5} />
      </mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   Stylized painting: Monet's "Water Lilies" (c. 1906)
   ═══════════════════════════════════════════════════════ */
function WaterLilies({ width = 1.2, height = 0.9 }) {
  // Deterministic brush stroke positions (seeded pseudo-random)
  const strokes = useMemo(() => {
    const colors = ['#6898a8', '#5a8090', '#7aa0b0', '#486878', '#88b0c0']
    return Array.from({ length: 15 }).map((_, i) => {
      const rand1 = (Math.sin(i * 91.732) * 0.5 + 0.5) - 0.5
      const rand2 = Math.sin(i * 37.415) * 0.5 + 0.5
      return {
        x: rand1 * width * 0.7,
        y: -0.4 + i * 0.055,
        w: 0.1 + rand2 * 0.15,
        color: colors[i % colors.length],
      }
    })
  }, [width])

  return (
    <group>
      {/* Canvas base — pond blue */}
      <mesh position={[0, 0, 0.001]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#4a7098" roughness={0.9} />
      </mesh>

      {/* Horizontal water bands */}
      {[
        { y: 0.3, color: '#5a88a8', h: 0.15 },
        { y: 0.15, color: '#689aa8', h: 0.12 },
        { y: -0.05, color: '#4a8078', h: 0.14 },
        { y: -0.22, color: '#5a8898', h: 0.16 },
      ].map((band, i) => (
        <mesh key={i} position={[0, band.y, 0.002]}>
          <planeGeometry args={[width, band.h]} />
          <meshStandardMaterial color={band.color} roughness={0.85} />
        </mesh>
      ))}

      {/* Horizontal brush strokes */}
      {strokes.map((s, i) => (
        <mesh key={i} position={[s.x, s.y, 0.003]}>
          <planeGeometry args={[s.w, 0.015]} />
          <meshStandardMaterial color={s.color} roughness={0.85} />
        </mesh>
      ))}

      {/* Lily pads + pink flowers */}
      {[
        { x: -0.28, y: 0.05, s: 0.6 },
        { x: 0.18, y: -0.08, s: 0.8 },
        { x: -0.1, y: -0.2, s: 0.5 },
        { x: 0.32, y: 0.18, s: 0.55 },
        { x: -0.35, y: -0.25, s: 0.7 },
      ].map((lily, i) => (
        <group key={i}>
          <mesh position={[lily.x, lily.y, 0.005]} scale={[lily.s * 0.14, lily.s * 0.08, 1]}>
            <circleGeometry args={[1, 12]} />
            <meshStandardMaterial color="#2a5838" roughness={0.85} />
          </mesh>
          {i % 2 === 0 && (
            <mesh position={[lily.x + 0.01, lily.y + 0.01, 0.007]}>
              <circleGeometry args={[lily.s * 0.04, 8]} />
              <meshStandardMaterial color="#f4a8b8" roughness={0.8} />
            </mesh>
          )}
        </group>
      ))}

      {/* Reflected willow branches — faint vertical streaks at the top */}
      {[-0.3, -0.1, 0.15, 0.3].map((x, i) => (
        <mesh key={i} position={[x, 0.32, 0.003]}>
          <planeGeometry args={[0.03, 0.15]} />
          <meshStandardMaterial color="#4a6048" roughness={0.9} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   Ornate gold frame with beveled edges
   ═══════════════════════════════════════════════════════ */
function GoldFrame({ width = 1.2, height = 0.9 }) {
  const frameThickness = 0.1
  const outerW = width + frameThickness * 2
  const outerH = height + frameThickness * 2

  const corners: [number, number][] = [
    [-outerW / 2 + 0.05, outerH / 2 - 0.05],
    [outerW / 2 - 0.05, outerH / 2 - 0.05],
    [-outerW / 2 + 0.05, -outerH / 2 + 0.05],
    [outerW / 2 - 0.05, -outerH / 2 + 0.05],
  ]

  return (
    <group>
      {/* Outer frame — ornate gold */}
      <mesh position={[0, 0, -0.03]}>
        <boxGeometry args={[outerW, outerH, 0.06]} />
        <meshStandardMaterial color="#c8a048" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Inner bevel */}
      <mesh position={[0, 0, -0.01]}>
        <boxGeometry args={[width + 0.04, height + 0.04, 0.02]} />
        <meshStandardMaterial color="#8a6828" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Top highlight edge */}
      <mesh position={[0, outerH / 2 - 0.015, 0.005]}>
        <boxGeometry args={[outerW, 0.015, 0.005]} />
        <meshStandardMaterial color="#f0c878" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Ornamental corner rosettes */}
      {corners.map(([x, y], i) => (
        <mesh key={i} position={[x, y, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.015, 8]} />
          <meshStandardMaterial color="#f0c878" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   Wall plaque with artist info
   ═══════════════════════════════════════════════════════ */
function Plaque({
  title,
  artist,
  year,
  medium,
}: {
  title: string
  artist: string
  year: string
  medium: string
}) {
  return (
    <group>
      <mesh>
        <boxGeometry args={[0.35, 0.14, 0.015]} />
        <meshStandardMaterial color="#f4ebd4" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0, 0.008]}>
        <planeGeometry args={[0.32, 0.12]} />
        <meshStandardMaterial color="#ffffff" roughness={0.8} />
      </mesh>
      <Text
        position={[0, 0.035, 0.01]}
        fontSize={0.022}
        color="#2a2418"
        anchorX="center"
        anchorY="middle"
        maxWidth={0.3}
      >
        {title}
      </Text>
      <Text
        position={[0, 0.005, 0.01]}
        fontSize={0.018}
        color="#5a4030"
        anchorX="center"
        anchorY="middle"
      >
        {artist}, {year}
      </Text>
      <Text
        position={[0, -0.025, 0.01]}
        fontSize={0.014}
        color="#8a6a4a"
        anchorX="center"
        anchorY="middle"
      >
        {medium}
      </Text>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════
   Full painting with frame + plaque
   ═══════════════════════════════════════════════════════ */
type PaintingKey = 'starry' | 'mona' | 'lilies'

interface PaintingProps {
  position: [number, number, number]
  rotation: [number, number, number]
  painting: PaintingKey
}

const PLAQUE_INFO: Record<
  PaintingKey,
  { title: string; artist: string; year: string; medium: string }
> = {
  starry: {
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    year: '1889',
    medium: 'Oil on canvas · Museum of Modern Art',
  },
  mona: {
    title: 'Mona Lisa',
    artist: 'Leonardo da Vinci',
    year: 'c. 1503',
    medium: 'Oil on poplar panel · Louvre',
  },
  lilies: {
    title: 'Water Lilies',
    artist: 'Claude Monet',
    year: 'c. 1906',
    medium: "Oil on canvas · Musée d'Orsay",
  },
}

function FramedPainting({ position, rotation, painting }: PaintingProps) {
  const info = PLAQUE_INFO[painting]

  return (
    <group position={position} rotation={rotation}>
      {painting === 'starry' && <StarryNight />}
      {painting === 'mona' && <MonaLisa />}
      {painting === 'lilies' && <WaterLilies />}

      <GoldFrame />

      {/* Plaque positioned to the right of the frame */}
      <group position={[0.85, -0.1, 0]}>
        <Plaque
          title={info.title}
          artist={info.artist}
          year={info.year}
          medium={info.medium}
        />
      </group>
    </group>
  )
}

export function Paintings() {
  return (
    <>
      <FramedPainting
        painting="starry"
        position={[-2.95, 2.5, -2]}
        rotation={[0, Math.PI / 2, 0]}
      />
      <FramedPainting
        painting="mona"
        position={[2.95, 2.5, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      />
      <FramedPainting
        painting="lilies"
        position={[0, 2.5, -4.95]}
        rotation={[0, 0, 0]}
      />
    </>
  )
}
