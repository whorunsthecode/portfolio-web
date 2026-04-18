import { Text } from '@react-three/drei'

const FRAME_WOOD = '#5a3820'
const FRAME_WOOD_DARK = '#3a2010'
const MAP_CREAM = '#f4ead4'
const TRAM_GREEN = '#2a4838'
const LINE_BLACK = '#2a2418'
const CURRENT_STOP = '#c82820'

const STOPS = [
  { label: 'MUSEUM', cn: '博物館', color: '#c8a048' },
  { label: 'CHRISTMAS', cn: '聖誕', color: '#a82828' },
  { label: 'DREAMERY', cn: '夢境', color: '#a78bca' },
  { label: 'AQUARIUM', cn: '水族館', color: '#4898d8' },
  { label: 'GYM', cn: '健身室', color: '#f8a890' },
  { label: 'TERMINUS', cn: '終點站', color: '#2a4838' },
]

/**
 * Framed route map board — hangs on the shelter's cream back wall showing
 * all 6 stops on a stylized horizontal tram line, with "YOU ARE HERE"
 * marker on the current stop (Terminus).
 */
export function RouteMap() {
  return (
    <group position={[0, 1.5, -2.46]}>
      {/* === OUTER WOODEN FRAME === */}
      <mesh>
        <boxGeometry args={[1.5, 1.0, 0.04]} />
        <meshStandardMaterial color={FRAME_WOOD} roughness={0.8} />
      </mesh>
      {/* Inner frame edge — darker */}
      <mesh position={[0, 0, 0.015]}>
        <boxGeometry args={[1.4, 0.9, 0.02]} />
        <meshStandardMaterial color={FRAME_WOOD_DARK} roughness={0.8} />
      </mesh>

      {/* === CREAM MAP BACKGROUND === */}
      <mesh position={[0, 0, 0.028]}>
        <planeGeometry args={[1.35, 0.85]} />
        <meshStandardMaterial color={MAP_CREAM} roughness={0.8} />
      </mesh>

      {/* === TITLE HEADER === */}
      <Text
        position={[0, 0.35, 0.031]}
        fontSize={0.07}
        color={TRAM_GREEN}
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.15}
      >
        TRAM ROUTE 88
      </Text>
      <Text
        position={[0, 0.28, 0.031]}
        fontSize={0.035}
        color="#5a3018"
        anchorX="center"
        anchorY="middle"
        letterSpacing={0.2}
      >
        {'叮叮電車 · 88 號線'}
      </Text>

      {/* === ROUTE LINE === */}
      <mesh position={[0, 0.02, 0.032]}>
        <boxGeometry args={[1.15, 0.008, 0.002]} />
        <meshStandardMaterial color={LINE_BLACK} />
      </mesh>

      {/* === STOP DOTS + LABELS === */}
      {STOPS.map((stop, i) => {
        const x = -0.55 + i * 0.22
        const isCurrent = i === STOPS.length - 1
        const above = i % 2 === 0

        return (
          <group key={i} position={[x, 0.02, 0.034]}>
            {/* Outer ring */}
            <mesh>
              <circleGeometry args={[0.04, 12]} />
              <meshStandardMaterial color={LINE_BLACK} />
            </mesh>
            {/* Inner dot */}
            <mesh position={[0, 0, 0.002]}>
              <circleGeometry args={[0.028, 12]} />
              <meshStandardMaterial color={isCurrent ? CURRENT_STOP : stop.color} />
            </mesh>

            {/* Label — alternating above/below the line */}
            <Text
              position={[0, above ? 0.12 : -0.085, 0]}
              fontSize={0.028}
              color="#2a1a10"
              anchorX="center"
              anchorY="middle"
            >
              {stop.label}
            </Text>
            <Text
              position={[0, above ? 0.085 : -0.12, 0]}
              fontSize={0.022}
              color="#5a3018"
              anchorX="center"
              anchorY="middle"
            >
              {stop.cn}
            </Text>

            {/* "YOU ARE HERE" marker for Terminus */}
            {isCurrent && (
              <group position={[0, -0.2, 0]}>
                <Text
                  fontSize={0.025}
                  color={CURRENT_STOP}
                  anchorX="center"
                  anchorY="middle"
                  letterSpacing={0.1}
                >
                  YOU ARE HERE
                </Text>
                <mesh position={[0, 0.025, 0]}>
                  <coneGeometry args={[0.01, 0.03, 3]} />
                  <meshBasicMaterial color={CURRENT_STOP} />
                </mesh>
              </group>
            )}
          </group>
        )
      })}

      {/* === LEGEND === */}
      <Text
        position={[0.55, -0.35, 0.031]}
        fontSize={0.02}
        color="#8a6a4a"
        anchorX="right"
        anchorY="middle"
      >
        {'Westbound · 往西行'}
      </Text>

      {/* === DDT LOGO STAMP === */}
      <group position={[-0.55, -0.35, 0.031]}>
        <mesh>
          <circleGeometry args={[0.04, 12]} />
          <meshStandardMaterial color={TRAM_GREEN} roughness={0.6} />
        </mesh>
        <Text
          fontSize={0.02}
          color={MAP_CREAM}
          anchorX="center"
          anchorY="middle"
          position={[0, 0, 0.001]}
        >
          DDT
        </Text>
      </group>

      {/* Brass hanging hooks */}
      {[-0.68, 0.68].map((x, i) => (
        <mesh key={i} position={[x, 0.45, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.03, 8]} />
          <meshStandardMaterial color="#c8a048" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}
    </group>
  )
}
