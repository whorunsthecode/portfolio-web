import { useEffect, useRef } from 'react'

export interface KeyState {
  forward: boolean
  back: boolean
  left: boolean
  right: boolean
  sprint: boolean
}

const freshState = (): KeyState => ({
  forward: false, back: false, left: false, right: false, sprint: false,
})

export function useKeyboard() {
  const state = useRef<KeyState>(freshState())

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.repeat) return
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    state.current.forward = true; break
        case 'KeyS': case 'ArrowDown':  state.current.back    = true; break
        case 'KeyA': case 'ArrowLeft':  state.current.left    = true; break
        case 'KeyD': case 'ArrowRight': state.current.right   = true; break
        case 'ShiftLeft': case 'ShiftRight': state.current.sprint = true; break
      }
    }
    const up = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW': case 'ArrowUp':    state.current.forward = false; break
        case 'KeyS': case 'ArrowDown':  state.current.back    = false; break
        case 'KeyA': case 'ArrowLeft':  state.current.left    = false; break
        case 'KeyD': case 'ArrowRight': state.current.right   = false; break
        case 'ShiftLeft': case 'ShiftRight': state.current.sprint = false; break
      }
    }
    // Blur releases all keys so you don't get stuck moving after switching tabs.
    const onBlur = () => { state.current = freshState() }

    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    window.addEventListener('blur', onBlur)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
      window.removeEventListener('blur', onBlur)
    }
  }, [])

  return state
}
