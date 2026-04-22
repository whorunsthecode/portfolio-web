import { AlleyShell } from './AlleyShell'
import { PipeWeb } from './PipeWeb'
import { MailSlots } from './MailSlots'
import { Clutter } from './Clutter'
import { WalledCityLighting } from './WalledCityLighting'
import { WorldOrbit } from '../../scene/components/WorldOrbit'

export function WalledCity() {
  return (
    <group position={[100, 0, 0]}>
      <WalledCityLighting />
      <AlleyShell />
      <PipeWeb />
      <MailSlots />
      <Clutter />
      {/* Orbit target slightly raised toward the sky slit so the camera
          frames the "light above" as you rotate. Tight radius because the
          alley is narrow. */}
      <WorldOrbit target={[100, 2.2, -0.5]} minDistance={1.3} maxDistance={3.8} />
    </group>
  )
}
