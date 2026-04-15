import { Howl } from 'howler'
import { useStore } from '../store'

/**
 * The one allowed UI sound: a two-ring tram bell on GO tap.
 *
 * Lazy-initialized so the Howl instance isn't created until the user
 * actually taps GO — avoids prefetching an asset most first-load
 * visitors (with audio off) will never need.
 *
 * Split out of AudioManager.tsx so that file can remain a
 * components-only module (required by react-refresh).
 */
let dingHowl: Howl | null = null

export function playDingDing() {
  const audioEnabled = useStore.getState().audioEnabled
  if (!audioEnabled) return
  if (!dingHowl) {
    dingHowl = new Howl({
      src: ['/audio/tram_ding.mp3'],
      volume: 0.4, // slightly louder than ambient — it's punctuation
      html5: true,
    })
  }
  dingHowl.stop() // restart on repeated taps
  dingHowl.play()
}
