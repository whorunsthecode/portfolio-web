import { ChungkingArcade } from './ChungkingArcade'
import { ShopStalls } from './ShopStalls'
import { CageLift } from './CageLift'
import { ArcadeLighting } from './ArcadeLighting'
import { HangingSigns } from './HangingSigns'
import { WorldOrbit } from '../../scene/components/WorldOrbit'

export function Chungking() {
  return (
    <group position={[-100, 0, 0]}>
      <ArcadeLighting />
      <ChungkingArcade />
      <ShopStalls />
      <HangingSigns />
      <CageLift />
      {/* Camera orbits around the mid-arcade point. Max distance kept under
          the arcade depth so you can't orbit outside the shell. */}
      <WorldOrbit target={[-100, 1.55, -1]} minDistance={1.5} maxDistance={4.5} />
    </group>
  )
}
