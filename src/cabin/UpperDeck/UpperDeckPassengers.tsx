/**
 * Upper deck passengers — now reuses the detailed 1980s HK fashion
 * variants from TramPassengers (OfficeMale, OfficeFemale, Schoolboy,
 * Schoolgirl, Auntie, Tourist) instead of the blank generic silhouettes
 * the previous version shipped with.
 *
 * Upper deck layout is different from lower deck:
 *   - Seats are FORWARD-FACING bench pairs (two rows of two, center
 *     aisle), so passengers face -Z (toward the driver end) rather
 *     than facing each other across the aisle.
 *   - Floor is at y = 2.55, seat surface y = 3.0.
 *
 * Per-passenger seating matches UpperDeckSeats.ROW_ZS to position
 * passengers directly on the seat cushions.
 */

import { AnimatedPassenger } from '../TramPassengers'

// Bench cushion top is at y=3.04 (floor 2.55 + SEAT_Y offset 0.45 + half-
// cushion 0.04). Raise hip origin so thighs rest ABOVE the bench cushion
// (same fix as lower-deck SEAT_Y rebase).
const SEAT_Y = 3.13

// Upper-deck seat X positions (outer + inner per side, from UpperDeckSeats)
const SIDE_X_OUTER = 0.85
const SIDE_X_INNER = 0.38

// Forward-facing passengers use rotation Y = 0 so the figure's local +Z
// (where features like glasses, ties, handbags live) points in world +Z.
// But passengers should face the DRIVER (world -Z), so rotation = π.
const FACE_FORWARD = Math.PI

interface UpperSeat {
  variant: number          // index into TramPassengers variant pool (0..5)
  x: number
  z: number
  seed: number
}

// 6 passengers spread across the upper deck — fills 3 rows with pairs,
// leaves the rearmost rows emptier so the staircase sightline stays open.
const UPPER_PASSENGERS: UpperSeat[] = [
  // Front row (closest to driver) — office commuters, business-focused
  { variant: 0, x: -SIDE_X_OUTER, z: -7.5, seed: 11 },   // OfficeMale
  { variant: 1, x:  SIDE_X_OUTER, z: -7.5, seed: 12 },   // OfficeFemale

  // Second row — mix of student + office
  { variant: 3, x: -SIDE_X_OUTER, z: -6.0, seed: 13 },   // Schoolgirl
  { variant: 2, x:  SIDE_X_OUTER, z: -6.0, seed: 14 },   // Schoolboy

  // Third row — auntie + tourist (outer aisle pair, visible from windows)
  { variant: 4, x: -SIDE_X_INNER, z: -4.5, seed: 15 },   // Auntie
  { variant: 5, x:  SIDE_X_INNER, z: -4.5, seed: 16 },   // Tourist
]

export function UpperDeckPassengers() {
  return (
    <group>
      {UPPER_PASSENGERS.map((p, i) => (
        <AnimatedPassenger
          key={i}
          variant={p.variant}
          position={[p.x, SEAT_Y, p.z]}
          personalOffset={i * 2.3}
          seed={p.seed}
          facingAngle={FACE_FORWARD}
        />
      ))}
    </group>
  )
}
