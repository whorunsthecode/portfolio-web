/**
 * TapHint — touch-only "Tap to …" chip billboarded above an interactive 3D
 * element.
 *
 * Motivation: the glowing ring + cursor-pointer affordance reads as decoration
 * on a phone — users don't know the object is tappable. This renders a small
 * cream pill (matching the welcome-card palette) that pulses until the user
 * dismisses it.
 *
 * Behavior:
 *   - Only shown on coarse-pointer / touch devices (desktop keeps the hover
 *     cursor + glow).
 *   - Shown once per browser, keyed by `storageKey`. Subsequent visits skip it.
 *   - Dismisses on: window pointerdown, the auto-dismiss timer (8s), or an
 *     optional `dismissWhen` prop flipping true (e.g. the modal this hint
 *     points at has opened).
 *   - Renders via drei's <Html sprite> so it always faces the camera; it is
 *     `pointerEvents: 'none'` so clicks pass through to the 3D mesh below.
 *
 * Usage:
 *   <TapHint label="Tap the snow globe" storageKey="xmas-snowglobe"
 *            offset={[0, 2.2, 0]} />
 */

import { useEffect, useState } from 'react'
import { Html } from '@react-three/drei'

const MOBILE_MQ = '(hover: none), (pointer: coarse)'
const AUTO_DISMISS_MS = 8000
const SHOW_DELAY_MS = 700

export function TapHint({
  label,
  storageKey,
  offset = [0, 1, 0],
  dismissWhen = false,
}: {
  label: string
  storageKey: string
  offset?: [number, number, number]
  /** Flip true to dismiss the hint imperatively (e.g. when the target modal opens). */
  dismissWhen?: boolean
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.matchMedia(MOBILE_MQ).matches) return
    try {
      if (window.localStorage.getItem(`tram_tap_${storageKey}`) === '1') return
    } catch {
      // localStorage blocked — still show
    }
    const t = window.setTimeout(() => setVisible(true), SHOW_DELAY_MS)
    return () => window.clearTimeout(t)
  }, [storageKey])

  useEffect(() => {
    if (!visible) return
    const dismiss = () => setVisible(false)
    const timer = window.setTimeout(dismiss, AUTO_DISMISS_MS)
    window.addEventListener('pointerdown', dismiss, { once: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('pointerdown', dismiss)
    }
  }, [visible])

  useEffect(() => {
    if (dismissWhen) setVisible(false)
  }, [dismissWhen])

  useEffect(() => {
    if (visible) return
    try {
      window.localStorage.setItem(`tram_tap_${storageKey}`, '1')
    } catch {
      // no-op
    }
  }, [visible, storageKey])

  if (!visible) return null

  return (
    <Html position={offset} center sprite style={{ pointerEvents: 'none' }}>
      <style>{`
        @keyframes tramTapBob {
          0%, 100% { transform: translateY(0);   opacity: 0.95; }
          50%      { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes tramTapFade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 3,
          animation: 'tramTapFade 280ms ease-out both',
        }}
      >
        <div
          style={{
            padding: '6px 12px',
            background: 'linear-gradient(180deg, #f5ead0 0%, #ead9b2 100%)',
            color: '#1a1410',
            borderRadius: 14,
            border: '1px solid #8a6f3a',
            fontFamily: 'Georgia, "Noto Serif TC", serif',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 10px rgba(0,0,0,0.4), 0 0 0 2px rgba(245,234,208,0.25)',
            animation: 'tramTapBob 1.6s ease-in-out infinite',
          }}
        >
          {label}
        </div>
        {/* Little downward tick so the chip clearly points at the object below */}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '5px solid transparent',
            borderRight: '5px solid transparent',
            borderTop: '6px solid #ead9b2',
            filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.35))',
          }}
        />
      </div>
    </Html>
  )
}
