/**
 * Tram exterior shell — ALL GREEN like real HK ding-ding.
 *
 * The CabinShell already handles the upper deck (y=0.5-2.5) with
 * transparent glass windows and green posts. This exterior adds:
 * - Lower deck body (y=-1.7 to 0.5) — green with windows
 * - Roof trim above upper deck
 * - Front/rear faces with CLEAR windshields
 * - Undercarriage + wheels
 * - Trolley pole
 * - Fleet numbers, destination board
 *
 * NO solid panels at upper deck level — CabinShell handles that.
 */
import { Text } from '@react-three/drei'
import { FrontSide, DoubleSide } from 'three'

const GREEN = '#0d6b3a' // HK Tram Pantone green — signature livery color
const CREAM = '#f0e6c8'
const FRAME = '#1a1a18'

const W = 2.5
const HW = W / 2
const Z_CENTER = -3
const Z_LEN = 14.0
const Z_FRONT = Z_CENTER - Z_LEN / 2   // -10
const Z_REAR = Z_CENTER + Z_LEN / 2    // 4

const LOWER_BOT = -1.7
const LOWER_TOP = 0.5
const UPPER_TOP = 2.55
const ROOF_Y = 2.65

/**
 * Shift the entire exterior shell up by 1.8m so the lower deck sits
 * ABOVE the road (y=0.05) instead of 1.7m underground. This is the fix
 * that makes the tram read as a double-decker: previously only the upper
 * deck (y=0.5–2.55) was above ground, the lower deck was buried.
 *
 * After shift:
 *   lower deck: y=0.1 -> 2.3  (2.2m tall, sits on road)
 *   cream waistline stripe: y=2.15 -> 2.3
 *   upper deck: y=2.3 -> 4.35
 *   roof: y=4.45
 */
const Y_OFFSET = 1.8

export function TramExteriorShell() {
  return (
    <group position={[0, Y_OFFSET, 0]}>
      <LowerDeckExterior />
      <UpperDeckExterior />
      <RoofExterior />
      <FrontFace />
      <RearFace />
      <SideDestinationBoards />
      <Undercarriage />
      <TrolleyPole />
    </group>
  )
}

/**
 * Side destination boards — the illuminated waistline panel that says
 * "屈地街 WHITTY ST" on both flanks. In reference #88/#110 this wraps
 * around the tram at the deck divider. A signature HK tram detail.
 */
function SideDestinationBoards() {
  const boardY = LOWER_TOP - 0.08  // sits ON the cream waistline
  const boardH = 0.22
  const boardLen = 4.2
  const boardZ = Z_FRONT + 3.2  // positioned toward the front, as on reference

  return (
    <group>
      {[-1, 1].map((side) => {
        const x = side * (HW + 0.015)  // slight outward extrusion beyond body
        return (
          <group key={`destboard-${side}`}>
            {/* Cream panel background */}
            <mesh position={[x, boardY, boardZ]}>
              <boxGeometry args={[0.03, boardH, boardLen]} />
              <meshStandardMaterial color={CREAM} roughness={0.65} emissive="#7a6c48" emissiveIntensity={0.12} />
            </mesh>
            {/* Thin dark frame top + bottom */}
            <mesh position={[x + side * 0.002, boardY + boardH / 2, boardZ]}>
              <boxGeometry args={[0.035, 0.02, boardLen + 0.02]} />
              <meshStandardMaterial color={FRAME} roughness={0.7} />
            </mesh>
            <mesh position={[x + side * 0.002, boardY - boardH / 2, boardZ]}>
              <boxGeometry args={[0.035, 0.02, boardLen + 0.02]} />
              <meshStandardMaterial color={FRAME} roughness={0.7} />
            </mesh>
            {/* Chinese destination — 屈地街 */}
            <Text
              position={[x + side * 0.02, boardY + 0.04, boardZ]}
              rotation={[0, side === 1 ? 0 : Math.PI, 0]}
              fontSize={0.085}
              color="#0d3a1e"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
              letterSpacing={0.08}
            >
              屈地街
            </Text>
            {/* English destination — WHITTY ST */}
            <Text
              position={[x + side * 0.02, boardY - 0.06, boardZ]}
              rotation={[0, side === 1 ? 0 : Math.PI, 0]}
              fontSize={0.065}
              color="#0d3a1e"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
              letterSpacing={0.15}
            >
              WHITTY STREET
            </Text>
            {/* Small route number box at the LEFT end of the board */}
            <mesh position={[x + side * 0.003, boardY, boardZ - boardLen / 2 + 0.25]}>
              <boxGeometry args={[0.035, boardH - 0.04, 0.4]} />
              <meshStandardMaterial color="#1a1a18" roughness={0.6} />
            </mesh>
            <mesh position={[x + side * 0.005, boardY, boardZ - boardLen / 2 + 0.25]}>
              <boxGeometry args={[0.02, boardH - 0.07, 0.36]} />
              <meshBasicMaterial color="#f8e8b8" />
            </mesh>
            <Text
              position={[x + side * 0.022, boardY, boardZ - boardLen / 2 + 0.25]}
              rotation={[0, side === 1 ? 0 : Math.PI, 0]}
              fontSize={0.13}
              color="#c82020"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
            >
              88
            </Text>
          </group>
        )
      })}
    </group>
  )
}

/* Upper deck exterior — SOLID green walls with window cutouts (like real HK tram). */
function UpperDeckExterior() {
  const uw = W - 0.04
  const uhw = uw / 2
  const uLen = Z_LEN - 0.5

  // Solid green takes up top + bottom; windows are a shorter band in between
  const botBandH = 0.55  // solid green belt above the cream waistline
  const topBandH = 0.45  // solid green roof band
  const botBandY = LOWER_TOP + botBandH / 2
  const topBandY = UPPER_TOP - topBandH / 2
  const winBottom = LOWER_TOP + botBandH
  const winTop = UPPER_TOP - topBandH
  const winH = winTop - winBottom
  const winCY = (winBottom + winTop) / 2

  // 10 narrow windows matching reference #88 — evenly spaced along tram length
  const N_WINDOWS = 10
  const winStripStart = Z_FRONT + 0.6
  const winStripEnd = Z_REAR - 0.6
  const winStripLen = winStripEnd - winStripStart
  const postSpacing = winStripLen / N_WINDOWS
  const postZs = Array.from({ length: N_WINDOWS + 1 }, (_, i) => winStripStart + i * postSpacing)

  // Horizontal sliding-window mullion splits each pane into upper (fixed) and lower (sliding) halves
  const mullionY = winCY + winH * 0.12   // slightly above center, matching real HK trams

  return (
    <group>
      {[-1, 1].map((side) => {
        const x = side * uhw
        return (
          <group key={`upper-${side}`}>
            {/* Bottom solid green belt — thick, above cream waistline */}
            <mesh position={[x, botBandY, Z_CENTER]}>
              <boxGeometry args={[0.1, botBandH, uLen]} />
              <meshStandardMaterial color={GREEN} roughness={0.55} />
            </mesh>
            {/* Subtle sill shadow under windows — adds depth */}
            <mesh position={[x + side * 0.01, winBottom + 0.02, Z_CENTER]}>
              <boxGeometry args={[0.02, 0.04, uLen]} />
              <meshStandardMaterial color="#083820" roughness={0.8} />
            </mesh>

            {/* Top solid green band — roof header */}
            <mesh position={[x, topBandY, Z_CENTER]}>
              <boxGeometry args={[0.1, topBandH, uLen]} />
              <meshStandardMaterial color={GREEN} roughness={0.55} />
            </mesh>
            {/* Cream trim strip along top edge of upper deck (classic HK tram accent) */}
            <mesh position={[x + side * 0.005, UPPER_TOP - 0.05, Z_CENTER]}>
              <boxGeometry args={[0.03, 0.06, uLen]} />
              <meshStandardMaterial color={CREAM} roughness={0.75} />
            </mesh>

            {/* Thick green posts between windows — chunky with slight inset */}
            {postZs.map((pz) => (
              <group key={`up-${pz}`}>
                <mesh position={[x, winCY, pz]}>
                  <boxGeometry args={[0.1, winH, 0.16]} />
                  <meshStandardMaterial color={GREEN} roughness={0.55} />
                </mesh>
                {/* Subtle dark inset shadow on inner side of post */}
                <mesh position={[x + side * -0.02, winCY, pz]}>
                  <boxGeometry args={[0.02, winH - 0.05, 0.12]} />
                  <meshStandardMaterial color="#062a18" roughness={0.7} />
                </mesh>
              </group>
            ))}

            {/* TRANSLUCENT TINTED glass panes — you can see silhouettes inside (like lower deck) */}
            {postZs.slice(0, -1).map((pz, i) => {
              const nz = postZs[i + 1]
              const mid = (pz + nz) / 2
              const span = Math.abs(pz - nz) - 0.18
              return (
                <group key={`ug-${i}`}>
                  {/* Glass pane — translucent, see-through */}
                  <mesh position={[x + side * 0.002, winCY, mid]} rotation={[0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}>
                    <planeGeometry args={[span, winH - 0.08]} />
                    <meshPhysicalMaterial
                      color="#c8dce0"
                      transparent
                      opacity={0.22}
                      transmission={0.65}
                      roughness={0.08}
                      metalness={0.05}
                      thickness={0.03}
                      side={DoubleSide}
                    />
                  </mesh>
                  {/* Horizontal sliding-window mullion — the ICONIC HK tram detail */}
                  <mesh position={[x + side * 0.008, mullionY, mid]}>
                    <boxGeometry args={[0.025, 0.03, span + 0.04]} />
                    <meshStandardMaterial color={FRAME} roughness={0.6} metalness={0.2} />
                  </mesh>
                  {/* Thin bottom sill rail inside the frame */}
                  <mesh position={[x + side * 0.008, winBottom + 0.05, mid]}>
                    <boxGeometry args={[0.025, 0.02, span + 0.04]} />
                    <meshStandardMaterial color={GREEN} roughness={0.5} />
                  </mesh>
                </group>
              )
            })}
          </group>
        )
      })}

      {/* ── Front upper face ── */}
      <mesh position={[0, topBandY, Z_FRONT]}>
        <boxGeometry args={[uw, topBandH, 0.07]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      <mesh position={[0, botBandY, Z_FRONT]}>
        <boxGeometry args={[uw, botBandH, 0.07]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      {/* 4 front corner/mullion posts creating 3 upper-front windows (reference #88) */}
      {[-uhw + 0.1, -uw / 6, uw / 6, uhw - 0.1].map((px, i) => (
        <mesh key={`fup-${i}`} position={[px, winCY, Z_FRONT]}>
          <boxGeometry args={[i === 0 || i === 3 ? 0.2 : 0.12, winH, 0.07]} />
          <meshStandardMaterial color={GREEN} roughness={0.55} />
        </mesh>
      ))}
      {/* 3 translucent tinted upper-front windows (not opaque anymore) */}
      {[-uw / 3, 0, uw / 3].map((px, i) => (
        <group key={`fug-${i}`}>
          <mesh position={[px, winCY, Z_FRONT - 0.02]} rotation={[0, Math.PI, 0]}>
            <planeGeometry args={[uw / 3 - 0.16, winH - 0.06]} />
            <meshPhysicalMaterial
              color="#c8dce0"
              transparent
              opacity={0.22}
              transmission={0.65}
              roughness={0.08}
              thickness={0.03}
              side={DoubleSide}
            />
          </mesh>
          {/* Horizontal sliding mullion */}
          <mesh position={[px, mullionY, Z_FRONT - 0.025]}>
            <boxGeometry args={[uw / 3 - 0.12, 0.03, 0.025]} />
            <meshStandardMaterial color={FRAME} roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Cream trim strip at upper-front top edge */}
      <mesh position={[0, UPPER_TOP - 0.05, Z_FRONT - 0.005]}>
        <boxGeometry args={[uw, 0.06, 0.03]} />
        <meshStandardMaterial color={CREAM} roughness={0.75} />
      </mesh>

      {/* ── Rear upper face ── */}
      <mesh position={[0, topBandY, Z_REAR]}>
        <boxGeometry args={[uw, topBandH, 0.07]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      <mesh position={[0, botBandY, Z_REAR]}>
        <boxGeometry args={[uw, botBandH, 0.07]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      {[-uhw + 0.1, -uw / 6, uw / 6, uhw - 0.1].map((px, i) => (
        <mesh key={`rup-${i}`} position={[px, winCY, Z_REAR]}>
          <boxGeometry args={[i === 0 || i === 3 ? 0.2 : 0.12, winH, 0.07]} />
          <meshStandardMaterial color={GREEN} roughness={0.55} />
        </mesh>
      ))}
      {/* 3 translucent tinted rear-upper windows */}
      {[-uw / 3, 0, uw / 3].map((px, i) => (
        <group key={`rug-${i}`}>
          <mesh position={[px, winCY, Z_REAR + 0.02]}>
            <planeGeometry args={[uw / 3 - 0.16, winH - 0.06]} />
            <meshPhysicalMaterial
              color="#c8dce0"
              transparent
              opacity={0.22}
              transmission={0.65}
              roughness={0.08}
              thickness={0.03}
              side={DoubleSide}
            />
          </mesh>
          <mesh position={[px, mullionY, Z_REAR + 0.025]}>
            <boxGeometry args={[uw / 3 - 0.12, 0.03, 0.025]} />
            <meshStandardMaterial color={FRAME} roughness={0.6} />
          </mesh>
        </group>
      ))}
      {/* Cream trim at rear-upper top edge */}
      <mesh position={[0, UPPER_TOP - 0.05, Z_REAR + 0.005]}>
        <boxGeometry args={[uw, 0.06, 0.03]} />
        <meshStandardMaterial color={CREAM} roughness={0.75} />
      </mesh>

      <mesh position={[0, ROOF_Y + 0.15, Z_FRONT + 0.5]}>
        <boxGeometry args={[0.35, 0.25, 0.04]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.7} />
      </mesh>
    </group>
  )
}

/* Lower deck body — solid green with window cutouts. Below camera so doesn't block view */
function LowerDeckExterior() {
  const h = LOWER_TOP - LOWER_BOT  // 2.2
  const cy = (LOWER_BOT + LOWER_TOP) / 2

  // Mostly GREEN body (signature HK tram look). Thin cream stripe at deck divider only.
  const bottomStripH = 0.5   // GREEN skirt below windows
  const topStripH = 0.15     // thin CREAM waistline stripe at deck boundary
  const windowH = h - bottomStripH - topStripH
  const windowCY = LOWER_BOT + bottomStripH + windowH / 2

  return (
    <group>
      {[-1, 1].map((side) => {
        const x = side * HW
        const rot: [number, number, number] = [0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]
        return (
          <group key={`lower-${side}`}>
            {/* Bottom solid strip — GREEN skirt below windows (signature tram color) */}
            <mesh position={[x, LOWER_BOT + bottomStripH / 2, Z_CENTER]}>
              <boxGeometry args={[0.07, bottomStripH, Z_LEN]} />
              <meshStandardMaterial color={GREEN} roughness={0.55} metalness={0.15} />
            </mesh>

            {/* Top thin strip — CREAM waistline at deck divider */}
            <mesh position={[x, LOWER_TOP - topStripH / 2, Z_CENTER]}>
              <boxGeometry args={[0.07, topStripH, Z_LEN]} />
              <meshStandardMaterial color={CREAM} roughness={0.75} />
            </mesh>

            {/* Vertical posts between windows */}
            {Array.from({ length: 8 }, (_, i) => {
              const z = Z_FRONT + 1.0 + i * 1.65
              return (
                <mesh key={`lp-${i}`} position={[x + side * 0.001, windowCY, z]} rotation={rot}>
                  <planeGeometry args={[0.06, windowH]} />
                  <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
                </mesh>
              )
            })}

            {/* Tinted glass filling window spaces */}
            {Array.from({ length: 7 }, (_, i) => {
              const z = Z_FRONT + 1.0 + i * 1.65 + 0.825
              return (
                <mesh key={`lg-${i}`} position={[x, windowCY, z]} rotation={rot}>
                  <planeGeometry args={[1.5, windowH - 0.05]} />
                  <meshPhysicalMaterial color="#a0c0c8" transparent opacity={0.25} transmission={0.5} roughness={0.1} side={DoubleSide} />
                </mesh>
              )
            })}
          </group>
        )
      })}
    </group>
  )
}

/* Roof — just the top cap and edge trim */
function RoofExterior() {
  return (
    <group>
      {/* Flat roof panel */}
      <mesh position={[0, ROOF_Y, Z_CENTER]}>
        <boxGeometry args={[W - 0.1, 0.08, Z_LEN - 0.5]} />
        <meshStandardMaterial color="#c8bda8" roughness={0.75} side={FrontSide} />
      </mesh>
      {/* Green trim along roof edges */}
      {[-(W - 0.1) / 2, (W - 0.1) / 2].map((x, i) => (
        <mesh key={`rt-${i}`} position={[x, ROOF_Y - 0.02, Z_CENTER]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, Z_LEN - 0.5, 8]} />
          <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
        </mesh>
      ))}
    </group>
  )
}

/* Trolley pole — connects to overhead catenary */
function TrolleyPole() {
  return (
    <group position={[0, ROOF_Y + 0.04, Z_CENTER + 1]}>
      <mesh>
        <boxGeometry args={[0.2, 0.1, 0.2]} />
        <meshStandardMaterial color={FRAME} />
      </mesh>
      <mesh position={[0, 1.0, -0.7]} rotation={[Math.PI / 5, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 2.2, 8]} />
        <meshStandardMaterial color="#2a2a28" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.85, -1.4]} rotation={[Math.PI / 5, 0, 0]}>
        <boxGeometry args={[0.1, 0.025, 0.2]} />
        <meshStandardMaterial color="#c8a048" metalness={0.7} roughness={0.3} />
      </mesh>
    </group>
  )
}

/* Front face — green frame with CLEAR windshield openings */
function FrontFace() {
  const z = Z_FRONT - 0.01
  const lh = LOWER_TOP - LOWER_BOT
  const lcy = (LOWER_BOT + LOWER_TOP) / 2

  return (
    <group>
      {/* Lower front — green frame pieces around windshield */}
      {/* Bottom strip */}
      <mesh position={[0, LOWER_BOT + 0.2, Z_FRONT]}>
        <boxGeometry args={[W, 0.4, 0.06]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      {/* Top strip */}
      <mesh position={[0, LOWER_TOP - 0.06, Z_FRONT]}>
        <boxGeometry args={[W, 0.12, 0.06]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      {/* Left pillar */}
      <mesh position={[-HW + 0.12, lcy, Z_FRONT]}>
        <boxGeometry args={[0.24, lh, 0.06]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      {/* Right pillar */}
      <mesh position={[HW - 0.12, lcy, Z_FRONT]}>
        <boxGeometry args={[0.24, lh, 0.06]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      {/* Center pillar */}
      <mesh position={[0, lcy + 0.15, Z_FRONT]}>
        <boxGeometry args={[0.06, lh * 0.7, 0.06]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>

      {/* Lower windshield glass — CLEAR */}
      <mesh position={[0, lcy + 0.15, Z_FRONT]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W - 0.5, lh * 0.65]} />
        <meshPhysicalMaterial color="#e8f0f4" transparent opacity={0.1} transmission={0.9} roughness={0.03} side={DoubleSide} />
      </mesh>

      {/* Upper front — green frame */}
      <mesh position={[-HW + 0.1, (UPPER_TOP + LOWER_TOP) / 2, z]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.2, UPPER_TOP - LOWER_TOP]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      <mesh position={[HW - 0.1, (UPPER_TOP + LOWER_TOP) / 2, z]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.2, UPPER_TOP - LOWER_TOP]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      <mesh position={[0, UPPER_TOP - 0.06, z]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W, 0.12]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>

      {/* Upper windshield — clear */}
      <mesh position={[0, (UPPER_TOP + LOWER_TOP) / 2, z + 0.001]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[W - 0.4, UPPER_TOP - LOWER_TOP - 0.2]} />
        <meshPhysicalMaterial color="#e8f0f4" transparent opacity={0.1} transmission={0.9} roughness={0.03} side={DoubleSide} />
      </mesh>

      {/* Destination board */}
      <mesh position={[0, LOWER_TOP - 0.14, z - 0.005]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.4, 0.18]} />
        <meshStandardMaterial color="#d8e8f0" roughness={0.7} side={FrontSide} />
      </mesh>
      <Text position={[0, LOWER_TOP - 0.14, z - 0.01]} rotation={[0, Math.PI, 0]}
        fontSize={0.065} color="#1a2818" anchorX="center" anchorY="middle" fontWeight="bold">
        屈地街 WHITTY ST
      </Text>

      {/* Front route plate — chunky yellow box with black border + red "88" numerals */}
      <group position={[-0.72, LOWER_TOP - 0.14, z - 0.012]} rotation={[0, Math.PI, 0]}>
        {/* Black frame */}
        <mesh>
          <boxGeometry args={[0.32, 0.26, 0.015]} />
          <meshStandardMaterial color="#1a1a18" roughness={0.6} />
        </mesh>
        {/* Yellow illuminated face */}
        <mesh position={[0, 0, -0.008]}>
          <boxGeometry args={[0.28, 0.22, 0.01]} />
          <meshBasicMaterial color="#f8dd66" />
        </mesh>
        {/* Red "88" numerals */}
        <Text position={[0, 0, -0.016]} fontSize={0.16} color="#c81a1a" anchorX="center" anchorY="middle" fontWeight="bold">
          88
        </Text>
      </group>

      {/* Fleet number "088" — bigger, on upper corners of front face (reference #110 style) */}
      {[-0.88, 0.88].map((x, i) => (
        <Text key={`ffl-${i}`} position={[x, UPPER_TOP - 0.14, z - 0.012]} rotation={[0, Math.PI, 0]}
          fontSize={0.12} color={CREAM} anchorX="center" anchorY="middle" fontWeight="bold">
          088
        </Text>
      ))}

      {/* Headlights */}
      {[-0.45, 0.45].map((x, i) => (
        <mesh key={`hl-${i}`} position={[x, LOWER_BOT + 0.2, z - 0.005]} rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.07, 12]} />
          <meshBasicMaterial color="#ffecb8" />
        </mesh>
      ))}

      {/* Bottom fleet number */}
      <Text position={[0, LOWER_BOT + 0.12, z - 0.008]} rotation={[0, Math.PI, 0]}
        fontSize={0.09} color={CREAM} anchorX="center" anchorY="middle" fontWeight="bold">
        088
      </Text>

      {/* Bumper */}
      <mesh position={[0, LOWER_BOT + 0.03, Z_FRONT]}>
        <boxGeometry args={[W, 0.1, 0.05]} />
        <meshStandardMaterial color={FRAME} roughness={0.6} metalness={0.3} side={FrontSide} />
      </mesh>
    </group>
  )
}

/* Rear face — similar frame construction */
function RearFace() {
  const z = Z_REAR + 0.01
  const lh = LOWER_TOP - LOWER_BOT
  const lcy = (LOWER_BOT + LOWER_TOP) / 2

  return (
    <group>
      {/* Lower rear frame */}
      <mesh position={[0, LOWER_BOT + 0.2, z]}>
        <planeGeometry args={[W, 0.4]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      <mesh position={[0, LOWER_TOP - 0.06, z]}>
        <planeGeometry args={[W, 0.12]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      <mesh position={[-HW + 0.12, lcy, z]}>
        <planeGeometry args={[0.24, lh]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      <mesh position={[HW - 0.12, lcy, z]}>
        <planeGeometry args={[0.24, lh]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>

      {/* Rear glass */}
      <mesh position={[0, lcy + 0.15, z - 0.001]}>
        <planeGeometry args={[W - 0.5, lh * 0.65]} />
        <meshPhysicalMaterial color="#a0c0c8" transparent opacity={0.2} transmission={0.6} roughness={0.1} side={DoubleSide} />
      </mesh>

      {/* Upper rear frame */}
      <mesh position={[-HW + 0.1, (UPPER_TOP + LOWER_TOP) / 2, z]}>
        <planeGeometry args={[0.2, UPPER_TOP - LOWER_TOP]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      <mesh position={[HW - 0.1, (UPPER_TOP + LOWER_TOP) / 2, z]}>
        <planeGeometry args={[0.2, UPPER_TOP - LOWER_TOP]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      <mesh position={[0, UPPER_TOP - 0.06, z]}>
        <planeGeometry args={[W, 0.12]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>

      {/* Upper rear glass */}
      <mesh position={[0, (UPPER_TOP + LOWER_TOP) / 2, z - 0.001]}>
        <planeGeometry args={[W - 0.4, UPPER_TOP - LOWER_TOP - 0.2]} />
        <meshPhysicalMaterial color="#a0c0c8" transparent opacity={0.2} transmission={0.6} roughness={0.1} side={DoubleSide} />
      </mesh>

      {/* Tail lights */}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={`tl-${i}`} position={[x, LOWER_BOT + 0.25, z + 0.005]}>
          <circleGeometry args={[0.055, 10]} />
          <meshBasicMaterial color="#c82020" />
        </mesh>
      ))}

      {/* Rear route plate — matches front (HK trams have route number on both ends) */}
      <group position={[-0.72, LOWER_TOP - 0.14, z + 0.012]}>
        <mesh>
          <boxGeometry args={[0.32, 0.26, 0.015]} />
          <meshStandardMaterial color="#1a1a18" roughness={0.6} />
        </mesh>
        <mesh position={[0, 0, 0.008]}>
          <boxGeometry args={[0.28, 0.22, 0.01]} />
          <meshBasicMaterial color="#f8dd66" />
        </mesh>
        <Text position={[0, 0, 0.016]} fontSize={0.16} color="#c81a1a" anchorX="center" anchorY="middle" fontWeight="bold">
          88
        </Text>
      </group>

      {/* Rear fleet number "088" on upper corners */}
      {[-0.88, 0.88].map((x, i) => (
        <Text key={`rfl-${i}`} position={[x, UPPER_TOP - 0.14, z + 0.012]}
          fontSize={0.12} color={CREAM} anchorX="center" anchorY="middle" fontWeight="bold">
          088
        </Text>
      ))}

      {/* Rear fleet number (bottom) */}
      <Text position={[0, LOWER_BOT + 0.12, z + 0.008]}
        fontSize={0.09} color={CREAM} anchorX="center" anchorY="middle" fontWeight="bold">
        088
      </Text>

      {/* Bumper */}
      <mesh position={[0, LOWER_BOT + 0.03, Z_REAR]}>
        <boxGeometry args={[W, 0.1, 0.05]} />
        <meshStandardMaterial color={FRAME} roughness={0.6} metalness={0.3} side={FrontSide} />
      </mesh>
    </group>
  )
}

/* Wheels and undercarriage */
function Undercarriage() {
  return (
    <group>
      {[-1, 1].map((side) => (
        <mesh key={`sk-${side}`}
          position={[side * HW, LOWER_BOT - 0.15, Z_CENTER]}
          rotation={[0, side === -1 ? Math.PI / 2 : -Math.PI / 2, 0]}>
          <planeGeometry args={[Z_LEN - 0.4, 0.3]} />
          <meshStandardMaterial color="#1a2a20" roughness={0.7} side={FrontSide} />
        </mesh>
      ))}
      {[Z_FRONT + 2, Z_REAR - 2].map((bz, i) => (
        <group key={`bg-${i}`} position={[0, LOWER_BOT - 0.3, bz]}>
          <mesh>
            <boxGeometry args={[W - 0.3, 0.15, 1.2]} />
            <meshStandardMaterial color="#0a0a08" roughness={0.6} metalness={0.3} />
          </mesh>
          {[[-0.55, -0.45], [0.55, -0.45], [-0.55, 0.45], [0.55, 0.45]].map(([wx, wz], j) => (
            <mesh key={j} position={[wx, -0.04, wz]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.16, 0.16, 0.09, 12]} />
              <meshStandardMaterial color="#1a1a18" roughness={0.5} metalness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  )
}
