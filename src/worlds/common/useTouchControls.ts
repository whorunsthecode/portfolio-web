import { useEffect, useRef } from 'react'

export interface TouchMove {
  x: number // -1..1 strafe (right positive)
  y: number // -1..1 forward (up-on-screen → negative = forward)
}

export interface TouchLook {
  dx: number
  dy: number
}

// Two-thumb mobile controls. The left half of the screen is the virtual
// joystick for movement; the right half is drag-to-look. Multi-touch is
// fine — each thumb is tracked independently by touch identifier.
// Listeners always attach while the hook is mounted; consumer decides
// when to act on the accumulated deltas.
export function useTouchControls() {
  const move = useRef<TouchMove>({ x: 0, y: 0 })
  const look = useRef<TouchLook>({ dx: 0, dy: 0 })
  const moveId = useRef<number | null>(null)
  const lookId = useRef<number | null>(null)
  const moveOrigin = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  const lookLast = useRef<{ x: number; y: number }>({ x: 0, y: 0 })
  // Raw joystick position in pixel space, for the visual joystick overlay
  const joystickDelta = useRef<{ dx: number; dy: number; active: boolean }>({ dx: 0, dy: 0, active: false })

  useEffect(() => {
    const half = () => window.innerWidth / 2
    const JOY_RADIUS = 60 // pixels

    const onStart = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.clientX < half() && moveId.current === null) {
          moveId.current = t.identifier
          moveOrigin.current = { x: t.clientX, y: t.clientY }
          joystickDelta.current = { dx: 0, dy: 0, active: true }
        } else if (t.clientX >= half() && lookId.current === null) {
          lookId.current = t.identifier
          lookLast.current = { x: t.clientX, y: t.clientY }
        }
      }
    }
    const onMove = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === moveId.current) {
          const dx = t.clientX - moveOrigin.current.x
          const dy = t.clientY - moveOrigin.current.y
          const clampedDx = Math.max(-JOY_RADIUS, Math.min(JOY_RADIUS, dx))
          const clampedDy = Math.max(-JOY_RADIUS, Math.min(JOY_RADIUS, dy))
          joystickDelta.current = { dx: clampedDx, dy: clampedDy, active: true }
          move.current = { x: clampedDx / JOY_RADIUS, y: clampedDy / JOY_RADIUS }
        } else if (t.identifier === lookId.current) {
          look.current.dx += t.clientX - lookLast.current.x
          look.current.dy += t.clientY - lookLast.current.y
          lookLast.current = { x: t.clientX, y: t.clientY }
        }
      }
      // Preventing default stops page from scrolling while navigating
      e.preventDefault()
    }
    const onEnd = (e: TouchEvent) => {
      for (const t of Array.from(e.changedTouches)) {
        if (t.identifier === moveId.current) {
          moveId.current = null
          move.current = { x: 0, y: 0 }
          joystickDelta.current = { dx: 0, dy: 0, active: false }
        } else if (t.identifier === lookId.current) {
          lookId.current = null
        }
      }
    }

    window.addEventListener('touchstart', onStart, { passive: false })
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd)
    window.addEventListener('touchcancel', onEnd)
    return () => {
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('touchcancel', onEnd)
    }
  }, [])

  return { move, look, joystickDelta }
}
