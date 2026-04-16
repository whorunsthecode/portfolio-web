import { useMemo } from 'react'
import { makeTextTexture } from '../cabin/TextTexture'

const WHITE = '#f2ede1'
const CAB_WHITE = '#ebe4d2'
const DARK = '#1a1614'
const CHROME = '#a8a8a8'
const HEADLIGHT = '#f4ead4'

// Period 80s HK shop names commonly hand-painted on delivery trucks.
// Phone numbers are 6-7 digits (HK switched to 8-digit in 1995).
const SHOPS = [
  { zh: '好運海鮮', en: 'LUCKY SEAFOOD', phone: '5-234567' },
  { zh: '金都茶餐廳', en: 'GOLDEN CITY CAFE', phone: '3-881234' },
  { zh: '永興辦館', en: 'WING HING', phone: '5-445566' },
  { zh: '美心餅店', en: "MAXIM'S BAKERY", phone: '5-777888' },
  { zh: '益力多', en: 'YAKULT', phone: '3-112233' },
  { zh: '公仔麵', en: 'DOLL NOODLES', phone: '5-667788' },
  { zh: '李錦記', en: 'LEE KUM KEE', phone: '3-998877' },
]

/**
 * 1980s HK small box truck — Isuzu Elf style, 2-tonne.
 * White/cream body with hand-painted Chinese shop name on the cargo box,
 * plus a 6-digit period phone number. The hand-painted signage is the
 * defining detail of 80s HK commercial streetscapes.
 */
export function DeliveryVan({ variantSeed = 0 }: { variantSeed?: number }) {
  const shop = SHOPS[variantSeed % SHOPS.length]

  const signTex = useMemo(
    () =>
      makeTextTexture({
        text: shop.zh,
        fontSize: 72,
        color: '#1a1a1a',
        fontFamily: 'Georgia, "SimSun", serif',
        width: 512,
        height: 160,
        background: WHITE,
      }),
    [shop.zh],
  )

  const phoneTex = useMemo(
    () =>
      makeTextTexture({
        text: `電話 TEL: ${shop.phone}`,
        fontSize: 32,
        color: '#c62828',
        width: 512,
        height: 64,
        background: WHITE,
      }),
    [shop.phone],
  )

  return (
    <group>
      {/* === CAB — small flat-front === */}
      <mesh position={[1.35, 0.95, 0]}>
        <boxGeometry args={[1.8, 1.6, 1.8]} />
        <meshStandardMaterial color={CAB_WHITE} roughness={0.6} />
      </mesh>
      {/* Square windshield */}
      <mesh position={[2.26, 1.2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[1.1, 0.7]} />
        <meshStandardMaterial color="#2a3848" transparent opacity={0.7} />
      </mesh>
      {/* Cab side windows */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[1.35, 1.2, s * 0.91]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[1.5, 0.55]} />
          <meshStandardMaterial color="#2a3848" transparent opacity={0.6} side={2} />
        </mesh>
      ))}
      {/* Headlights */}
      {[-1, 1].map((s) => (
        <mesh key={`h-${s}`} position={[2.26, 0.55, s * 0.6]}>
          <boxGeometry args={[0.05, 0.2, 0.3]} />
          <meshBasicMaterial color={HEADLIGHT} />
        </mesh>
      ))}
      {/* Grille */}
      <mesh position={[2.26, 0.85, 0]}>
        <boxGeometry args={[0.04, 0.3, 1.1]} />
        <meshStandardMaterial color={DARK} roughness={0.7} />
      </mesh>
      {/* Front bumper */}
      <mesh position={[2.3, 0.25, 0]}>
        <boxGeometry args={[0.07, 0.14, 1.7]} />
        <meshStandardMaterial color={CHROME} metalness={0.55} roughness={0.35} />
      </mesh>

      {/* === CARGO BOX === */}
      <mesh position={[-0.8, 1.15, 0]}>
        <boxGeometry args={[2.5, 2.0, 1.8]} />
        <meshStandardMaterial color={WHITE} roughness={0.7} />
      </mesh>
      {/* Dark seam between cab and box */}
      <mesh position={[0.45, 1.15, 0]}>
        <boxGeometry args={[0.05, 1.95, 1.82]} />
        <meshStandardMaterial color={DARK} roughness={0.8} />
      </mesh>

      {/* === HAND-PAINTED SHOP NAME — on both sides of cargo box === */}
      {[1, -1].map((sideZ) => (
        <group key={`sign-${sideZ}`}>
          {/* Shop name panel (main) */}
          <mesh
            position={[-0.8, 1.35, sideZ * 0.905]}
            rotation={[0, sideZ > 0 ? 0 : Math.PI, 0]}
          >
            <planeGeometry args={[2.3, 1.0]} />
            <meshStandardMaterial map={signTex} roughness={0.75} />
          </mesh>
          {/* Phone number strip below */}
          <mesh
            position={[-0.8, 0.55, sideZ * 0.906]}
            rotation={[0, sideZ > 0 ? 0 : Math.PI, 0]}
          >
            <planeGeometry args={[2.3, 0.35]} />
            <meshStandardMaterial map={phoneTex} roughness={0.75} />
          </mesh>
        </group>
      ))}

      {/* === TAIL LIGHTS === */}
      {[-1, 1].map((s) => (
        <mesh key={`t-${s}`} position={[-2.06, 0.7, s * 0.85]}>
          <boxGeometry args={[0.05, 0.2, 0.2]} />
          <meshBasicMaterial color="#ff2020" />
        </mesh>
      ))}

      {/* === WHEELS === */}
      {[
        [1.35, 0.28, 0.95],
        [1.35, 0.28, -0.95],
        [-1.35, 0.28, 0.95],
        [-1.35, 0.28, -0.95],
      ].map((p, i) => (
        <mesh
          key={i}
          position={p as [number, number, number]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <cylinderGeometry args={[0.32, 0.32, 0.22, 12]} />
          <meshStandardMaterial color={DARK} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}
