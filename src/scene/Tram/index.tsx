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
      <RoofVentBox />
      <FrontFace />
      <RearFace />
      <RearPlatformDoor />
      <SideDestinationBoards />
      {/* SideBrandingPanels removed — "HK Tram Green / PANTONE" was a
          real-world promo sticker that only reads at a specific angle;
          at oblique views it showed up as fragmented floating letters. */}
      <Undercarriage />
      <TrolleyPole />
    </group>
  )
}

/**
 * Roof ventilation/monitor box — the raised rectangular structure on the
 * roof of reference HK trams (houses ventilation + clerestory windows).
 * Distinctive silhouette detail that makes the tram unmistakable.
 */
function RoofVentBox() {
  const ventY = ROOF_Y + 0.12
  const ventH = 0.22
  const ventW = W - 0.5
  const ventLen = Z_LEN - 2.0

  return (
    <group>
      {/* Main vent housing — cream/tan matching the roof */}
      <mesh position={[0, ventY + ventH / 2, Z_CENTER]}>
        <boxGeometry args={[ventW, ventH, ventLen]} />
        <meshStandardMaterial color="#c8bda8" roughness={0.75} />
      </mesh>
      {/* Green trim rail along the top edge */}
      <mesh position={[0, ventY + ventH + 0.02, Z_CENTER]}>
        <boxGeometry args={[ventW + 0.04, 0.04, ventLen + 0.04]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      {/* Darker trim strip along the bottom of the box (base shadow) */}
      <mesh position={[0, ventY + 0.02, Z_CENTER]}>
        <boxGeometry args={[ventW + 0.02, 0.02, ventLen + 0.02]} />
        <meshStandardMaterial color="#8a7f6a" roughness={0.8} />
      </mesh>
      {/* Clerestory slat vents on both sides of the box (tiny horizontal strips) */}
      {[-1, 1].map((side) => (
        <group key={`vent-${side}`}>
          {Array.from({ length: 12 }, (_, i) => {
            const z = -ventLen / 2 + 0.6 + i * (ventLen - 1.2) / 11
            return (
              <mesh
                key={`slat-${side}-${i}`}
                position={[side * ventW / 2 + side * 0.005, ventY + ventH * 0.45, z]}
              >
                <boxGeometry args={[0.012, 0.05, 0.18]} />
                <meshStandardMaterial color={FRAME} roughness={0.65} />
              </mesh>
            )
          })}
        </group>
      ))}
      {/* Roof-mounted fan housings (two raised domes) */}
      {[-ventLen / 3, ventLen / 3].map((fz, i) => (
        <group key={`fan-${i}`} position={[0, ventY + ventH + 0.05, fz]}>
          <mesh>
            <cylinderGeometry args={[0.16, 0.18, 0.06, 16]} />
            <meshStandardMaterial color="#8a7f6a" roughness={0.75} metalness={0.15} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.12, 0.14, 0.02, 16]} />
            <meshStandardMaterial color="#4a4238" roughness={0.6} metalness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * Rear platform door frame — open boarding platform at the rear of the
 * tram (where passengers enter). Grab handles + step visible.
 * Matches reference: tram #88 has an open platform opposite the driver end.
 */
function RearPlatformDoor() {
  // 1982-era rear boarding — structural layout mirrors the modern tram
  // reference photo (two central validator posts with wooden chair-rail
  // trim flanking them, side sliding doors, "NO STANDING" step text),
  // but all materials are period-correct: varnished teak wood posts,
  // brass rails, painted steel, paper farebox. Zero stainless steel,
  // zero Octopus readers.

  const doorCY = (LOWER_TOP + LOWER_BOT) / 2
  const doorZ = Z_REAR - 0.02
  const stepY = LOWER_BOT + 0.05
  const stepEdgeZ = doorZ + 0.18  // projects onto the step plate

  // Reusable materials (colors inline keep the component self-contained)
  const WOOD_TEAK = '#6a3a20'       // varnished teak — warm red-brown
  const WOOD_TEAK_DARK = '#4a2818'  // shadow line / grain
  const PAINTED_STEEL = '#dcd6c0'   // cream painted steel (period)
  const BRASS = '#c8a048'

  return (
    <group>
      {/* ─── LEFT side sliding door panel (hinged open) ─────── */}
      <SideSlidingDoor x={-HW + 0.15} doorCY={doorCY} doorZ={doorZ} openAngle={-Math.PI / 2.2} />

      {/* ─── RIGHT side sliding door panel (hinged open) ────── */}
      <SideSlidingDoor x={HW - 0.15} doorCY={doorCY} doorZ={doorZ} openAngle={Math.PI / 2.2} />

      {/* ─── Central dual turnstile posts ───────────────────── */}
      {[-0.22, 0.22].map((px, i) => (
        <group key={`post-${i}`} position={[px, 0, doorZ + 0.35]}>
          {/* Teak wood post — main vertical */}
          <mesh position={[0, doorCY, 0]}>
            <boxGeometry args={[0.08, LOWER_TOP - LOWER_BOT - 0.1, 0.08]} />
            <meshStandardMaterial color={WOOD_TEAK} roughness={0.5} />
          </mesh>
          {/* Brass top cap */}
          <mesh position={[0, LOWER_TOP - 0.08, 0]}>
            <boxGeometry args={[0.1, 0.06, 0.1]} />
            <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
          </mesh>
          {/* Brass base cap — anchors to floor */}
          <mesh position={[0, LOWER_BOT + 0.06, 0]}>
            <boxGeometry args={[0.12, 0.08, 0.12]} />
            <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
          </mesh>
          {/* Thin grain shadow line — adds wood-grain feel */}
          <mesh position={[0, doorCY, 0.041]}>
            <boxGeometry args={[0.02, LOWER_TOP - LOWER_BOT - 0.2, 0.002]} />
            <meshStandardMaterial color={WOOD_TEAK_DARK} roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* ─── Horizontal teak chair-rail panels flanking posts ── */}
      {[-1, 1].map((side) => (
        <group key={`rail-${side}`}>
          {/* Chair rail panel at waist height — teak */}
          <mesh position={[side * 0.55, doorCY - 0.05, doorZ + 0.35]}>
            <boxGeometry args={[0.45, 0.32, 0.06]} />
            <meshStandardMaterial color={WOOD_TEAK} roughness={0.5} />
          </mesh>
          {/* Darker trim line at top + bottom of panel */}
          <mesh position={[side * 0.55, doorCY + 0.11, doorZ + 0.381]}>
            <boxGeometry args={[0.46, 0.02, 0.002]} />
            <meshStandardMaterial color={WOOD_TEAK_DARK} roughness={0.8} />
          </mesh>
          <mesh position={[side * 0.55, doorCY - 0.21, doorZ + 0.381]}>
            <boxGeometry args={[0.46, 0.02, 0.002]} />
            <meshStandardMaterial color={WOOD_TEAK_DARK} roughness={0.8} />
          </mesh>

          {/* Brass grab handrail running along the exterior of each door opening */}
          <mesh position={[side * (HW - 0.04), doorCY, doorZ + 0.06]}>
            <cylinderGeometry args={[0.018, 0.018, LOWER_TOP - LOWER_BOT - 0.3, 10]} />
            <meshStandardMaterial color={BRASS} metalness={0.75} roughness={0.3} />
          </mesh>
          {/* Little yellow painted "IN ONLY" warning plate beside each opening */}
          <group position={[side * (HW + 0.008), doorCY + 0.35, doorZ - 0.2]} rotation={[0, side === 1 ? -Math.PI / 2 : Math.PI / 2, 0]}>
            <mesh>
              <planeGeometry args={[0.14, 0.22]} />
              <meshStandardMaterial color="#f8dd66" roughness={0.8} side={DoubleSide} />
            </mesh>
            <Text position={[0, 0.04, 0.002]} fontSize={0.032} color="#1a1a14" anchorX="center" anchorY="middle" fontWeight="bold">
              入
            </Text>
            <Text position={[0, -0.02, 0.002]} fontSize={0.022} color="#1a1a14" anchorX="center" anchorY="middle">
              IN
            </Text>
            <Text position={[0, -0.06, 0.002]} fontSize={0.022} color="#1a1a14" anchorX="center" anchorY="middle">
              ONLY
            </Text>
          </group>
        </group>
      ))}

      {/* ─── Painted steel boarding step + yellow edge ─────── */}
      <mesh position={[0, stepY, doorZ + 0.14]}>
        <boxGeometry args={[W - 0.1, 0.04, 0.32]} />
        <meshStandardMaterial color={PAINTED_STEEL} metalness={0.15} roughness={0.7} />
      </mesh>
      {/* Safety yellow front edge strip */}
      <mesh position={[0, stepY + 0.021, stepEdgeZ]}>
        <boxGeometry args={[W - 0.1, 0.005, 0.04]} />
        <meshStandardMaterial color="#e8c048" roughness={0.7} />
      </mesh>

      {/* ─── "不准站立 NO STANDING" painted on step ─────────── */}
      <Text
        position={[0, stepY + 0.024, doorZ + 0.14]}
        rotation={[-Math.PI / 2, 0, Math.PI]}
        fontSize={0.055}
        color="#c89028"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
      >
        不准站立  NO STANDING
      </Text>

      {/* ─── Paper farebox (cash) on left post — 1982 style ──── */}
      <group position={[-0.22, LOWER_BOT + 0.9, doorZ + 0.45]}>
        <mesh>
          <boxGeometry args={[0.14, 0.22, 0.12]} />
          <meshStandardMaterial color="#2a5a3a" roughness={0.8} />
        </mesh>
        {/* Coin slot */}
        <mesh position={[0, 0.04, 0.061]}>
          <boxGeometry args={[0.08, 0.012, 0.003]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
        </mesh>
        {/* Small "收費 FARE" label */}
        <Text position={[0, -0.04, 0.062]} fontSize={0.018} color={CREAM} anchorX="center" anchorY="middle" fontWeight="bold">
          收費 FARE
        </Text>
        <Text position={[0, -0.07, 0.062]} fontSize={0.022} color="#f8dd66" anchorX="center" anchorY="middle" fontWeight="bold">
          $1.20
        </Text>
      </group>

      {/* ─── Interior dark shadow inside the boarding bay ─── */}
      <mesh position={[0, doorCY, doorZ + 0.55]}>
        <boxGeometry args={[W - 0.5, LOWER_TOP - LOWER_BOT - 0.15, 0.02]} />
        <meshStandardMaterial color="#1a1410" roughness={0.95} />
      </mesh>
    </group>
  )
}

/**
 * A single side sliding-door panel on the rear boarding bay.
 * Rotates open around the door-jamb hinge (positive or negative Y),
 * exposing the validator posts inside. Glass panel on the upper half,
 * painted green lower half, brass handle.
 */
function SideSlidingDoor({
  x,
  doorCY,
  doorZ,
  openAngle,
}: {
  x: number
  doorCY: number
  doorZ: number
  openAngle: number
}) {
  const doorH = LOWER_TOP - LOWER_BOT - 0.1
  const doorW = 0.7
  return (
    <group position={[x, doorCY, doorZ + 0.02]} rotation={[0, openAngle, 0]}>
      {/* Door frame — green painted steel */}
      <mesh position={[doorW / 2, 0, 0]}>
        <boxGeometry args={[doorW, doorH, 0.04]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} />
      </mesh>
      {/* Upper glass panel */}
      <mesh position={[doorW / 2, doorH * 0.15, 0.022]}>
        <planeGeometry args={[doorW - 0.1, doorH * 0.55]} />
        <meshPhysicalMaterial
          color="#c8dce0"
          transparent
          opacity={0.25}
          transmission={0.6}
          roughness={0.08}
          side={DoubleSide}
        />
      </mesh>
      {/* Brass vertical handle */}
      <mesh position={[doorW - 0.08, 0, 0.03]}>
        <cylinderGeometry args={[0.012, 0.012, 0.6, 8]} />
        <meshStandardMaterial color="#c8a048" metalness={0.75} roughness={0.3} />
      </mesh>
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
            {/* Chinese destination — 屈地街, offset RIGHT of the route box */}
            <Text
              position={[x + side * 0.02, boardY + 0.035, boardZ + 0.6]}
              rotation={[0, side === 1 ? Math.PI / 2 : -Math.PI / 2, 0]}
              fontSize={0.075}
              color="#0d3a1e"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
              letterSpacing={0.06}
            >
              屈地街
            </Text>
            {/* English destination — WHITTY STREET, fits within board length */}
            <Text
              position={[x + side * 0.02, boardY - 0.055, boardZ + 0.6]}
              rotation={[0, side === 1 ? Math.PI / 2 : -Math.PI / 2, 0]}
              fontSize={0.045}
              color="#0d3a1e"
              anchorX="center"
              anchorY="middle"
              fontWeight="bold"
              letterSpacing={0.04}
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
              rotation={[0, side === 1 ? Math.PI / 2 : -Math.PI / 2, 0]}
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

      {/*
       * Destination board & route plate need to sit CLEAR of the green
       * front-top-strip mesh, which lives at z=Z_FRONT with depth 0.06
       * (spans z=-10.03 to -9.97). Previously z-=0.005 put them INSIDE
       * that box — invisible. Pushing them out by 0.10 puts them clearly
       * in front of the tram.
       */}
      {/* Destination board — cream illuminated plate */}
      <mesh position={[0, LOWER_TOP - 0.14, Z_FRONT - 0.1]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[1.1, 0.2]} />
        <meshStandardMaterial color="#f0e6c8" roughness={0.6} emissive="#7a6c48" emissiveIntensity={0.18} side={FrontSide} />
      </mesh>
      <Text position={[0, LOWER_TOP - 0.14, Z_FRONT - 0.101]} rotation={[0, Math.PI, 0]}
        fontSize={0.07} color="#0d3a1e" anchorX="center" anchorY="middle" fontWeight="bold">
        屈地街 WHITTY ST
      </Text>

      {/* Front route plate — chunky yellow box with black border + red "88" numerals */}
      <group position={[-0.72, LOWER_TOP - 0.14, Z_FRONT - 0.1]} rotation={[0, Math.PI, 0]}>
        {/* Black frame */}
        <mesh>
          <boxGeometry args={[0.32, 0.26, 0.02]} />
          <meshStandardMaterial color="#1a1a18" roughness={0.6} />
        </mesh>
        {/* Yellow illuminated face */}
        <mesh position={[0, 0, -0.011]}>
          <boxGeometry args={[0.28, 0.22, 0.01]} />
          <meshBasicMaterial color="#f8dd66" />
        </mesh>
        {/* Red "88" numerals */}
        <Text position={[0, 0, -0.02]} fontSize={0.17} color="#c81a1a" anchorX="center" anchorY="middle" fontWeight="bold">
          88
        </Text>
      </group>

      {/* Fleet number "088" — single centred panel on the upper
          front frame, matches the rear treatment. The earlier pair
          of numerals at each upper corner read as floating text. */}
      <Text position={[0, UPPER_TOP - 0.14, Z_FRONT - 0.05]} rotation={[0, Math.PI, 0]}
        fontSize={0.11} color={CREAM} anchorX="center" anchorY="middle" fontWeight="bold" letterSpacing={0.05}>
        088
      </Text>

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

/* Rear face — open boarding platform, not a solid wall. Real HK Ding
 * Dings have an OPEN rear: two sliding-door panels either side and the
 * platform showing through the middle. Previously a full-width solid
 * green plane sat across the lower rear and read as a big black block
 * at any light level, hiding the platform (RearPlatformDoor) entirely.
 * Only frame elements remain here — pillars, skirt, top strip holding
 * the destination blind — the middle is intentionally open. */
function RearFace() {
  const z = Z_REAR + 0.01
  const lh = LOWER_TOP - LOWER_BOT
  const lcy = (LOWER_BOT + LOWER_TOP) / 2
  const uh = UPPER_TOP - LOWER_TOP

  return (
    <group>
      {/* Bottom skirt strip — green, under the doors */}
      <mesh position={[0, LOWER_BOT + 0.2, z]}>
        <planeGeometry args={[W, 0.4]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      {/* Top strip — green, holds the destination blind */}
      <mesh position={[0, LOWER_TOP - 0.2, z]}>
        <planeGeometry args={[W, 0.38]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      {/* Left lower-deck pillar */}
      <mesh position={[-HW + 0.12, lcy, z]}>
        <planeGeometry args={[0.24, lh]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      {/* Right lower-deck pillar */}
      <mesh position={[HW - 0.12, lcy, z]}>
        <planeGeometry args={[0.24, lh]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      {/* Cream waistline stripe — matches the flanks */}
      <mesh position={[0, LOWER_TOP - 0.06, z + 0.001]}>
        <planeGeometry args={[W, 0.12]} />
        <meshStandardMaterial color={CREAM} roughness={0.6} side={FrontSide} />
      </mesh>
      {/* Small rear destination blind on the upper green strip —
          cream plate framed in dark, route "88" + 屈地街 shorthand */}
      <group position={[0, LOWER_TOP - 0.2, z + 0.002]}>
        <mesh>
          <planeGeometry args={[1.5, 0.22]} />
          <meshStandardMaterial color={FRAME} roughness={0.6} side={FrontSide} />
        </mesh>
        <mesh position={[0, 0, 0.001]}>
          <planeGeometry args={[1.42, 0.16]} />
          <meshStandardMaterial color={CREAM} roughness={0.6} side={FrontSide} />
        </mesh>
        <Text position={[-0.58, 0, 0.002]} fontSize={0.12} color="#c81a1a" anchorX="center" anchorY="middle" fontWeight="bold">
          88
        </Text>
        <Text position={[0.12, 0, 0.002]} fontSize={0.08} color="#1a1a18" anchorX="center" anchorY="middle" letterSpacing={0.04}>
          屈地街 WHITTY
        </Text>
      </group>

      {/* Upper rear frame — pillars + top strip */}
      <mesh position={[-HW + 0.1, (UPPER_TOP + LOWER_TOP) / 2, z]}>
        <planeGeometry args={[0.2, uh]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      <mesh position={[HW - 0.1, (UPPER_TOP + LOWER_TOP) / 2, z]}>
        <planeGeometry args={[0.2, uh]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      <mesh position={[0, UPPER_TOP - 0.06, z]}>
        <planeGeometry args={[W, 0.12]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>
      <mesh position={[0, LOWER_TOP + 0.06, z]}>
        <planeGeometry args={[W, 0.12]} />
        <meshStandardMaterial color={GREEN} roughness={0.55} side={FrontSide} />
      </mesh>

      {/* Upper rear window — single panel, slightly brighter cyan
          glass so it reads as a window not a void even in shadow */}
      <mesh position={[0, (UPPER_TOP + LOWER_TOP) / 2, z - 0.001]}>
        <planeGeometry args={[W - 0.4, uh - 0.24]} />
        <meshPhysicalMaterial color="#bcd8dc" transparent opacity={0.55} transmission={0.4} roughness={0.2} side={DoubleSide} />
      </mesh>

      {/* Tail lights */}
      {[-0.55, 0.55].map((x, i) => (
        <mesh key={`tl-${i}`} position={[x, LOWER_BOT + 0.25, z + 0.005]}>
          <circleGeometry args={[0.055, 10]} />
          <meshBasicMaterial color="#c82020" />
        </mesh>
      ))}

      {/* Rear fleet number "088" — single centred panel on the upper
          frame, not duplicated on every corner (the old two "088 088"
          pairs read as floating labels rather than painted numerals). */}
      <Text position={[0, UPPER_TOP - 0.14, z + 0.005]}
        fontSize={0.11} color={CREAM} anchorX="center" anchorY="middle" fontWeight="bold" letterSpacing={0.05}>
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
