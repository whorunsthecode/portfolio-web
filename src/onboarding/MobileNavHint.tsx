/**
 * MobileNavHint — in-scene nudge shown on touch devices after the first-load
 * onboarding overlay has been dismissed.
 *
 * The welcome card tells people *that* they can drag, but users still hit the
 * scene and don't know *where* to drag or where the world-picker is. This
 * overlay keeps a translucent finger-drag animation over the canvas plus a
 * short label pointing at the destination pill, then fades on first touch.
 *
 * Dismiss: any touchstart/pointerdown, the × button, or a 9s timeout.
 * Shown once per browser (localStorage `tram_mobile_hint_v1`).
 */

import { useEffect, useState } from 'react'

const HINT_KEY = 'tram_mobile_hint_v1'
const AUTO_DISMISS_MS = 9000

export function MobileNavHint() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (window.localStorage.getItem(HINT_KEY) === '1') return
    } catch {
      // localStorage blocked — still show the hint, just don't persist
    }
    // Delay so the hint appears after the onboarding overlay is actually gone
    const t = window.setTimeout(() => setVisible(true), 400)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!visible) return
    const dismiss = () => setVisible(false)
    const timer = window.setTimeout(dismiss, AUTO_DISMISS_MS)
    window.addEventListener('pointerdown', dismiss, { once: true })
    window.addEventListener('touchstart', dismiss, { once: true })
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('touchstart', dismiss)
    }
  }, [visible])

  useEffect(() => {
    if (visible) return
    try {
      window.localStorage.setItem(HINT_KEY, '1')
    } catch {
      // no-op
    }
  }, [visible])

  if (!visible) return null

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
      }}
    >
      <style>{`
        @keyframes tramDragFinger {
          0%   { transform: translate(-80px, 0) scale(1);   opacity: 0; }
          12%  { opacity: 1; }
          50%  { transform: translate(80px, -10px) scale(0.96); opacity: 1; }
          88%  { opacity: 1; }
          100% { transform: translate(-80px, 0) scale(1);   opacity: 0; }
        }
        @keyframes tramDragTrail {
          0%, 100% { opacity: 0; transform: scaleX(0); }
          40%      { opacity: 0.8; transform: scaleX(1); }
          70%      { opacity: 0.8; transform: scaleX(1); }
        }
        @keyframes tramHintFade {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes tramArrowBob {
          0%, 100% { transform: translateY(0); opacity: 0.55; }
          50%      { transform: translateY(6px); opacity: 1; }
        }
      `}</style>

      {/* Center drag indicator — animated finger sliding across a trail */}
      <div
        style={{
          position: 'absolute',
          top: '42%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 200,
          height: 80,
          animation: 'tramHintFade 400ms ease-out both',
        }}
      >
        {/* Horizontal trail line */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '10%',
            width: '80%',
            height: 2,
            background:
              'linear-gradient(90deg, transparent 0%, rgba(245,234,208,0.85) 50%, transparent 100%)',
            transformOrigin: 'center',
            animation: 'tramDragTrail 2.4s ease-in-out infinite',
          }}
        />
        {/* Finger / touch disc */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            marginLeft: -18,
            marginTop: -18,
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'rgba(245,234,208,0.95)',
            boxShadow:
              '0 0 0 6px rgba(245,234,208,0.18), 0 2px 12px rgba(0,0,0,0.45)',
            animation: 'tramDragFinger 2.4s ease-in-out infinite',
          }}
        />
      </div>

      {/* Primary label — under the drag animation */}
      <div
        style={{
          position: 'absolute',
          top: 'calc(42% + 60px)',
          left: '50%',
          transform: 'translateX(-50%)',
          padding: '8px 16px',
          background: 'rgba(20,16,12,0.72)',
          color: '#f5ead0',
          borderRadius: 20,
          fontFamily: 'Georgia, "Noto Serif TC", serif',
          fontSize: 13,
          letterSpacing: '0.08em',
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: 'tramHintFade 500ms 120ms ease-out both',
        }}
      >
        Drag to look around · 拖曳環視
      </div>

      {/* Bottom-pointing arrow + label pointing at the destination pill */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: 92,
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          animation: 'tramHintFade 500ms 240ms ease-out both',
        }}
      >
        <div
          style={{
            padding: '6px 14px',
            background: 'rgba(20,16,12,0.72)',
            color: '#f5ead0',
            borderRadius: 16,
            fontFamily: 'Georgia, "Noto Serif TC", serif',
            fontSize: 12,
            letterSpacing: '0.06em',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
          }}
        >
          Pick a stop, then tap GO
        </div>
        <div
          style={{
            color: '#f5ead0',
            fontSize: 16,
            lineHeight: 1,
            animation: 'tramArrowBob 1.6s ease-in-out infinite',
          }}
        >
          ▼
        </div>
      </div>

      {/* Tap-anywhere hint — fine print, top center */}
      <div
        style={{
          position: 'absolute',
          top: 'max(12px, env(safe-area-inset-top))',
          left: '50%',
          transform: 'translateX(-50%)',
          fontFamily: '"Playfair Display", Georgia, serif',
          fontStyle: 'italic',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'rgba(245,234,208,0.7)',
          textShadow: '0 1px 4px rgba(0,0,0,0.55)',
          animation: 'tramHintFade 500ms 360ms ease-out both',
        }}
      >
        Tap anywhere to dismiss
      </div>
    </div>
  )
}
