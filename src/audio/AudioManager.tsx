import { useEffect, useRef } from 'react'
import { Howl } from 'howler'
import { useStore, type StopId } from '../store'

/**
 * Phase 7 — AudioManager
 *
 * One <Howl> per ambient loop (6 worlds + the seated tram). Crossfades
 * on world change and respects the global audioEnabled toggle
 * (default OFF per the spec — browsers won't let us autoplay anyway).
 *
 * The "current world" is derived from the existing `activeRoom` state
 * (null → tram, otherwise StopId). No parallel state variable.
 *
 * StopId 'fantasy' is mapped to '/audio/dreamery.mp3' so the asset
 * naming matches the user-facing world name ("THE DREAMERY"), while
 * the internal stop id stays 'fantasy' to avoid touching every modal
 * / camera reference that already uses it.
 */

type WorldKey = 'tram' | StopId
type AudioMap = Partial<Record<WorldKey, Howl>>

const AUDIO_FILES: Record<WorldKey, string> = {
  tram: '/audio/tram_seated.mp3',
  museum: '/audio/museum.mp3',
  christmas: '/audio/christmas_village.mp3',
  fantasy: '/audio/dreamery.mp3',
  aquarium: '/audio/aquarium.mp3',
  gym: '/audio/gym.mp3',
  terminus: '/audio/terminus.mp3',
}

const VOLUME = 0.25
const FADE_MS = 800

export function AudioManager() {
  const audioEnabled = useStore((s) => s.audioEnabled)
  const activeRoom = useStore((s) => s.activeRoom)
  const targetWorld: WorldKey = activeRoom ?? 'tram'

  const audioRefs = useRef<AudioMap>({})
  const currentlyPlayingRef = useRef<WorldKey | null>(null)

  // Build Howl instances once. html5: true streams on demand on iOS
  // Safari rather than preloading all 7 files at boot.
  useEffect(() => {
    ;(Object.entries(AUDIO_FILES) as [WorldKey, string][]).forEach(([key, src]) => {
      audioRefs.current[key] = new Howl({
        src: [src],
        loop: true,
        volume: 0,
        html5: true,
      })
    })

    const refs = audioRefs.current
    return () => {
      Object.values(refs).forEach((howl) => howl?.unload())
    }
  }, [])

  // React to audioEnabled or world changes
  useEffect(() => {
    // Audio OFF — fade everything currently playing
    if (!audioEnabled) {
      Object.values(audioRefs.current).forEach((howl) => {
        if (howl?.playing()) howl.fade(howl.volume(), 0, FADE_MS)
      })
      currentlyPlayingRef.current = null
      return
    }

    // Already on the target track
    if (currentlyPlayingRef.current === targetWorld) return

    // Fade out the previous track
    if (currentlyPlayingRef.current) {
      const prev = audioRefs.current[currentlyPlayingRef.current]
      if (prev) prev.fade(prev.volume(), 0, FADE_MS)
    }

    // Fade in the new one
    const next = audioRefs.current[targetWorld]
    if (next) {
      if (!next.playing()) next.play()
      next.fade(0, VOLUME, FADE_MS)
    }

    currentlyPlayingRef.current = targetWorld
  }, [audioEnabled, targetWorld])

  return null
}

// Ding chime is exported from ./playDingDing.ts (split out so this
// file can stay components-only for react-refresh).
