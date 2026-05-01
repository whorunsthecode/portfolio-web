import { Auntie, OfficeMale, Schoolgirl } from '../../cabin/TramPassengers'
import { BING_SUTT } from './BingSutt'

// 3 static figures placed in the shops, reusing TramPassengers character
// meshes so the visual style matches the rest of the world. All meshes
// were designed seated (SeatedLegs), so they're placed at chair/stool
// height.
//
// Sundry — 1 shopkeeper "auntie" sat on a stool just inside the counter,
// facing the gate so she reads as the proprietor.
// BingSutt — 2 customers: one in the booth (OfficeMale taking lunch),
// one at the octagonal table (Schoolgirl sipping iced tea).

export function ShopFigures() {
  return (
    <group>
      {/* === Sundry shopkeeper (Auntie behind counter) === */}
      {/* Counter front faces z ≈ -7.6 (alley side of counter at z=-7.8 + 0.18).
          Place the auntie inside the counter face, facing the gate at z=-5
          to imply she's the shop owner watching the alley. */}
      <group position={[-1.65, 0.42, -7.45]} rotation={[0, 0, 0]}>
        <Auntie />
      </group>

      {/* === BingSutt customer 1 — seated in the booth === */}
      {/* Booth seat is at x = BING_SUTT.doorwayX + 0.4 = -0.7, seat top y=0.42,
          spans z along boothZ ± 0.6. Place customer at the front half facing
          the booth table (toward +X). */}
      <group
        position={[BING_SUTT.doorwayX + 0.4, 0.42, (BING_SUTT.zNear + BING_SUTT.zFar) / 2 - 0.3]}
        rotation={[0, Math.PI / 2, 0]}
      >
        <OfficeMale />
      </group>

      {/* === BingSutt customer 2 — seated at the octagonal table === */}
      {/* North stool at z = tableZ - 0.6 = (zMid + 0.6) - 0.6 = zMid.
          Place facing south toward the table center. */}
      <group
        position={[BING_SUTT.midX + 0.1, 0.42, (BING_SUTT.zNear + BING_SUTT.zFar) / 2]}
        rotation={[0, Math.PI, 0]}
      >
        <Schoolgirl />
      </group>
    </group>
  )
}
