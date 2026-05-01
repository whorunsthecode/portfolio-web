// Module-level mutable bus for intra-world animation coupling. Avoids
// routing per-frame values through React state. PlaneFlyover writes
// `flyoverK` (0 idle → 1 peak darkness); lighting + shell read it in
// their useFrame loops to dim the sky slit in sync.
export const walledCityBus = {
  flyoverK: 0,
  shakeX: 0,
  shakeY: 0,
}
