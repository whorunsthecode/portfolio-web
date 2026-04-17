import { UpperDeckFloor } from './UpperDeckFloor'
import { UpperDeckSeats } from './UpperDeckSeats'
import { UpperDeckPassengers } from './UpperDeckPassengers'

/**
 * Upper deck interior — floor, forward-facing bench seats, seated passengers.
 * Visible through the translucent upper-deck windows added in PR #8.
 */
export function UpperDeck() {
  return (
    <group>
      <UpperDeckFloor />
      <UpperDeckSeats />
      <UpperDeckPassengers />
    </group>
  )
}
