import { useEffect, useRef } from 'react'

export interface MouseLookState {
  yaw: number
  pitch: number
  locked: boolean   // kept for API compat; always false in drag mode
}

// Click-and-drag to look. No pointer lock — the cursor stays visible the
// whole time, which means the player can always click Return-to-tram
// without needing to press Esc twice to dismiss the browser's pointer-
// lock banner. The `locked` flag is kept on the return signature for
// API compatibility but just mirrors whether the user is actively
// dragging.
export function useMouseLook(canvasEl: HTMLCanvasElement | null) {
  const yaw = useRef(0)
  const pitch = useRef(0)
  const locked = useRef(false)        // true while left button is held
  const sens = useRef(0.004)           // drag sens is higher than lock sens

  useEffect(() => {
    if (!canvasEl) return

    // Affordance: canvas cursor reflects whether you're hovering vs
    // actively dragging-to-look.
    canvasEl.style.cursor = 'grab'

    const onDown = (e: MouseEvent) => {
      if (e.button !== 0) return
      locked.current = true
      canvasEl.style.cursor = 'grabbing'
      e.preventDefault()
    }
    const onUp = () => {
      if (!locked.current) return
      locked.current = false
      canvasEl.style.cursor = 'grab'
    }
    const onMove = (e: MouseEvent) => {
      if (!locked.current) return
      yaw.current -= e.movementX * sens.current
      pitch.current -= e.movementY * sens.current
      const limit = Math.PI / 2 - 0.05
      pitch.current = Math.max(-limit, Math.min(limit, pitch.current))
    }
    // If the mouse leaves the window while held, treat it as a release —
    // otherwise coming back in with the button already up leaves us
    // "stuck looking" with no way to recover.
    const onBlur = () => { locked.current = false; canvasEl.style.cursor = 'grab' }

    canvasEl.addEventListener('mousedown', onDown)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('mousemove', onMove)
    window.addEventListener('blur', onBlur)

    return () => {
      canvasEl.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('blur', onBlur)
      canvasEl.style.cursor = ''
    }
  }, [canvasEl])

  return { yaw, pitch, locked }
}
