import { TramRails } from './TramRails'
import { TramPoles } from './TramPoles'
import { CatenaryWires } from './CatenaryWires'

export function TramCorridor() {
  return (
    <>
      <TramRails />
      <TramPoles />
      <CatenaryWires />
    </>
  )
}
