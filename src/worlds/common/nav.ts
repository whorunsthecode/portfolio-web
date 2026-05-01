// Hand-off flag between WorldCamera (flight animation) and
// FirstPersonControls (interactive nav). WorldCamera sets `ready` true
// when its fly-in animation finishes and clears it when the player
// returns to the tram. FirstPersonControls reads this and skips all
// camera writes until `ready` is true, so the two loops never fight.
export const navState = {
  ready: false,
}
