/**
 * Onboarding overlay — first-load welcome card.
 *
 * Full-screen takeover that sets the scene:
 *   - You are the driver of Tram No. 88
 *   - It's Central, Hong Kong, 1982
 *   - Here's how to look around / navigate
 *   - Contact info is on the driver (you) — more to come in a later PR
 *
 * Dismiss: "Board the tram 登車" button, anywhere-click on backdrop,
 * or Escape key. Dismissal persists via localStorage so repeat visitors
 * aren't blocked on every reload. Manual reset: localStorage.removeItem('tram_onboarded').
 *
 * Typography: Playfair Display (Latin) + Noto Serif TC (Chinese), loaded
 * via index.html <link> — see that file.
 */

import { useEffect, useState } from 'react'
import { useStore } from '../store'

const ONBOARD_KEY = 'tram_onboarded_v1'

export function OnboardingOverlay() {
  // Start true on the server/first render to avoid flash; real state hydrates in effect
  const [open, setOpen] = useState(true)
  const showOnboarding = useStore((s) => s.showOnboarding)
  const setShowOnboarding = useStore((s) => s.setShowOnboarding)

  useEffect(() => {
    try {
      const dismissed = window.localStorage.getItem(ONBOARD_KEY)
      if (dismissed === '1') setOpen(false)
    } catch {
      // localStorage can be blocked in private mode — just keep showing the overlay
    }
  }, [])

  // Re-open when the HUD help button flips the store flag, so repeat
  // visitors can review the "how to ride" card at any time.
  useEffect(() => {
    if (showOnboarding) setOpen(true)
  }, [showOnboarding])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault()
        dismiss()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  function dismiss() {
    try {
      window.localStorage.setItem(ONBOARD_KEY, '1')
    } catch {
      // no-op
    }
    setOpen(false)
    setShowOnboarding(false)
  }

  if (!open) return null

  return (
    <div
      onClick={dismiss}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboard-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        // Warm film-grade overlay — matches scene's 80s tone
        background:
          'radial-gradient(ellipse at center, rgba(20,16,12,0.7) 0%, rgba(6,4,3,0.92) 100%)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        padding:
          'max(24px, env(safe-area-inset-top)) 24px max(24px, env(safe-area-inset-bottom))',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 560,
          width: '100%',
          margin: 'auto',
          background:
            'linear-gradient(180deg, #f5ead0 0%, #ead9b2 100%)',
          color: '#1a1410',
          borderRadius: 12,
          padding: 'clamp(28px, 5vw, 44px) clamp(24px, 5vw, 48px)',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.6) inset, 0 0 0 1px #8a6f3a, 0 24px 60px rgba(0,0,0,0.55)',
          textAlign: 'center',
          // Subtle paper texture via layered gradients — no image asset needed
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.06) 100%), linear-gradient(180deg, #f5ead0 0%, #ead9b2 100%)',
        }}
      >
        {/* Little route plate — yellow box with red "88" */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 56,
            height: 56,
            background: '#f8dd66',
            border: '3px solid #1a1a18',
            borderRadius: 4,
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 900,
            fontSize: 30,
            color: '#c81a1a',
            letterSpacing: '-0.02em',
            marginBottom: 18,
            boxShadow: '0 2px 0 rgba(0,0,0,0.2)',
          }}
        >
          88
        </div>

        {/* Chinese title */}
        <div
          style={{
            fontFamily: '"Noto Serif TC", "Playfair Display", serif',
            fontSize: 'clamp(20px, 3.4vw, 26px)',
            letterSpacing: '0.14em',
            fontWeight: 600,
            color: '#2a1a10',
            marginBottom: 8,
          }}
        >
          歡迎登上 88 號電車
        </div>

        {/* English title */}
        <h1
          id="onboard-title"
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 'clamp(26px, 4.6vw, 40px)',
            fontWeight: 700,
            fontStyle: 'italic',
            letterSpacing: '0.02em',
            margin: 0,
            color: '#1a1410',
          }}
        >
          Welcome aboard Tram No. 88
        </h1>

        {/* Ornamental separator — period dot between two short rules */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            margin: '18px 0 14px',
            color: '#8a6f3a',
            opacity: 0.85,
          }}
          aria-hidden
        >
          <span style={{ width: 36, height: 1, background: '#8a6f3a' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.3em' }}>◆</span>
          <span style={{ width: 36, height: 1, background: '#8a6f3a' }} />
        </div>

        {/* Dateline */}
        <p
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 'clamp(14px, 2vw, 16px)',
            fontStyle: 'italic',
            color: '#3a2818',
            margin: '0 0 22px',
            lineHeight: 1.5,
          }}
        >
          You are the driver.
          <br />
          It is Central, Hong Kong, 1982.
          <br />
          <span
            style={{
              fontFamily: '"Noto Serif TC", serif',
              fontStyle: 'normal',
              fontSize: '0.95em',
              letterSpacing: '0.1em',
              opacity: 0.85,
            }}
          >
            一九八二年 · 中環
          </span>
        </p>

        {/* Navigation instructions — one tone, one font family, two type sizes */}
        <div
          style={{
            textAlign: 'left',
            background: 'rgba(26,20,16,0.06)',
            borderTop: '1px solid rgba(138,111,58,0.35)',
            borderBottom: '1px solid rgba(138,111,58,0.35)',
            padding: '16px 20px',
            margin: '0 0 22px',
            fontFamily: 'Georgia, "Noto Serif TC", serif',
            fontSize: 'clamp(14px, 1.9vw, 15px)',
            lineHeight: 1.55,
            color: '#2a1a10',
          }}
        >
          <div
            style={{
              fontSize: 11,
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color: '#8a6f3a',
              fontFamily: '"Playfair Display", serif',
              marginBottom: 10,
            }}
          >
            How to ride &nbsp;·&nbsp; 乘車指南
          </div>
          <ControlRow
            desktop="Click + drag"
            mobile="One-finger drag"
            label="Look around the tram"
          />
          <ControlRow
            desktop="Scroll wheel"
            mobile="Pinch"
            label="Zoom in and out"
          />
          <ControlRow
            desktop="◀ / ▶ at the bottom"
            mobile="◀ / ▶ at the bottom"
            label="Cycle destinations"
          />
          <ControlRow
            desktop="GO →"
            mobile="GO →"
            label="Enter a destination world"
          />
        </div>

        {/* Driver hint — the promise for the contact-reveal PR */}
        <p
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 'clamp(13px, 1.9vw, 15px)',
            color: '#3a2818',
            margin: '0 0 26px',
            lineHeight: 1.5,
          }}
        >
          Want to talk to the driver?
          <br />
          Click the driver in the cabin to reach them.
          <span
            style={{
              display: 'block',
              fontFamily: '"Noto Serif TC", serif',
              fontStyle: 'normal',
              fontSize: '0.9em',
              opacity: 0.75,
              marginTop: 4,
              letterSpacing: '0.08em',
            }}
          >
            想聯絡司機？點擊車廂內的司機。
          </span>
        </p>

        {/* Primary CTA */}
        <button
          onClick={dismiss}
          autoFocus
          style={{
            background: '#0d6b3a',
            color: '#f5ead0',
            border: 'none',
            borderRadius: 4,
            padding: '14px 36px',
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 'clamp(15px, 2.2vw, 17px)',
            fontWeight: 700,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            boxShadow:
              '0 2px 0 rgba(0,0,0,0.25), 0 4px 16px rgba(13,107,58,0.35)',
            transition: 'transform 120ms ease, box-shadow 120ms ease',
          }}
          onMouseDown={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(1px)'
          }}
          onMouseUp={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)'
          }}
        >
          Board the tram 登車 →
        </button>

        {/* Tiny footnote */}
        <div
          style={{
            marginTop: 18,
            fontSize: 11,
            letterSpacing: '0.1em',
            color: '#6a4f28',
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
          }}
        >
          Press&nbsp;<KeyCap>Enter</KeyCap>&nbsp;or&nbsp;<KeyCap>Esc</KeyCap>&nbsp;anytime to skip.
        </div>
      </div>
    </div>
  )
}

function ControlRow({
  desktop,
  mobile,
  label,
}: {
  desktop: string
  mobile: string
  label: string
}) {
  // Action label on top, controls beneath in a single muted line.
  // Collapse duplicate desktop/touch strings so nothing is repeated.
  const control =
    desktop === mobile ? desktop : `${desktop} · ${mobile}`
  return (
    <div style={{ padding: '6px 0' }}>
      <div style={{ fontWeight: 600, color: '#2a1a10' }}>{label}</div>
      <div style={{ color: '#6a4f28', fontSize: '0.9em', marginTop: 1 }}>
        {control}
      </div>
    </div>
  )
}

function KeyCap({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      style={{
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
        fontSize: '0.85em',
        fontStyle: 'normal',
        padding: '1px 6px',
        border: '1px solid rgba(106,79,40,0.5)',
        borderRadius: 3,
        background: 'rgba(245,234,208,0.6)',
        letterSpacing: '0.05em',
      }}
    >
      {children}
    </kbd>
  )
}
