import { Frontage } from './Frontage'
import { Counter } from './Counter'
import { Booths } from './Booths'
import { Decor } from './Decor'

// 強記冰室 (Keung Kee Bing Sutt) — right side of deep alley segment.
// Walk-in interior. Cinematic centerpiece of the new shop run.
//
// Deep segment axis is x=-2, so its right wall sits at x=-1.1. Interior
// extends EAST into the wall opening, with the back wall at x=+0.9
// (2m wide × 4m deep × 2.8m ceiling).
export const BING_SUTT = {
  zNear: -18,
  zFar: -22,
  zMid: -20,
  doorwayX: -1.1,
  backWallX: 0.9,
  midX: -0.1,
  width: 2.0,    // x extent
  depth: 4.0,    // z extent
  ceiling: 2.8,
}

export function BingSutt() {
  return (
    <group>
      <Frontage />
      <Decor />     {/* Floor + walls + ceiling first so other items sit on top */}
      <Counter />
      <Booths />
    </group>
  )
}
