import React, { useEffect, useState } from 'react'
import { useStore, STOPS } from './store'

const IS_TOUCH = typeof window !== 'undefined' && (
  'ontouchstart' in window || (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints! > 0
)

// Worlds where FPS nav is active. Used to show pointer-lock / touch hints.
const FPS_STOPS = new Set(['walled_city'])

const kbdStyle: React.CSSProperties = {
  display: 'inline-block',
  padding: '1px 6px',
  borderRadius: 4,
  border: '1px solid rgba(240, 230, 208, 0.35)',
  background: 'rgba(240, 230, 208, 0.08)',
  fontFamily: 'monospace',
  fontSize: 10,
  marginRight: 4,
}

export function HUD() {
  const mode = useStore((s) => s.mode)
  const setMode = useStore((s) => s.setMode)
  const showDetails = useStore((s) => s.showDetails)
  const toggleDetails = useStore((s) => s.toggleDetails)
  const activeRoom = useStore((s) => s.activeRoom)
  const setRoom = useStore((s) => s.setRoom)
  const blindIndex = useStore((s) => s.blindIndex)
  const cycleBind = useStore((s) => s.cycleBind)

  const currentStop = STOPS[blindIndex]

  const inFPSWorld = activeRoom !== null && FPS_STOPS.has(activeRoom)
  const [hintSeen, setHintSeen] = useState(false)

  // Dismiss the intro hint on the first input — keyboard, mouse, or touch.
  // Touch matters on mobile where the hint doubles as a zone diagram.
  useEffect(() => {
    if (!inFPSWorld || hintSeen) return
    const on = () => setHintSeen(true)
    window.addEventListener('keydown', on, { once: true })
    window.addEventListener('mousedown', on, { once: true })
    window.addEventListener('touchstart', on, { once: true })
    return () => {
      window.removeEventListener('keydown', on)
      window.removeEventListener('mousedown', on)
      window.removeEventListener('touchstart', on)
    }
  }, [inFPSWorld, hintSeen])

  // Reset intro hint each time you enter a world.
  useEffect(() => { if (!inFPSWorld) setHintSeen(false) }, [inFPSWorld])

  // B key is a keyboard shortcut back to the tram for muscle memory.
  useEffect(() => {
    if (!inFPSWorld) return
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'KeyB') setRoom(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [inFPSWorld, setRoom])

  const pillBg = 'rgba(20,20,20,0.75)'
  const textColor = '#f0e6d0'
  const isNight = mode === 'night'

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 10,
      color: textColor,
    }}>
      {/* Intro hint — shown once on entry, dismisses on first keypress
          or click. Cursor stays visible the whole time because we use
          drag-to-look instead of pointer lock. */}
      {inFPSWorld && !IS_TOUCH && !hintSeen && (
        <div style={{
          position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
          pointerEvents: 'none',
          background: 'rgba(20, 16, 10, 0.72)',
          color: '#f0e6d0', padding: '8px 18px', borderRadius: 20,
          fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase',
          backdropFilter: 'blur(6px)', fontFamily: 'Georgia, serif',
          display: 'flex', gap: 14, alignItems: 'center',
          transition: 'opacity 240ms ease',
        }}>
          <span><kbd style={kbdStyle}>WASD</kbd> move</span>
          <span style={{ opacity: 0.3 }}>·</span>
          <span>drag to look</span>
          <span style={{ opacity: 0.3 }}>·</span>
          <span><kbd style={kbdStyle}>B</kbd> back to tram</span>
        </div>
      )}
      {inFPSWorld && IS_TOUCH && !hintSeen && (
        <>
          {/* Centre vertical divider showing the two thumb zones */}
          <div style={{
            position: 'absolute', top: '20%', bottom: '20%',
            left: '50%', width: 1,
            background: 'rgba(240,230,208,0.20)',
            pointerEvents: 'none',
          }} />
          {/* Left zone label — drag to move */}
          <div style={{
            position: 'absolute', bottom: '38%', left: 0, width: '50%',
            pointerEvents: 'none',
            color: '#f0e6d0',
            fontSize: 12, letterSpacing: '0.22em',
            textTransform: 'uppercase',
            textAlign: 'center',
            fontFamily: 'Georgia, serif',
            opacity: 0.72,
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
          }}>
            drag here<br/><span style={{ opacity: 0.7, fontSize: 10 }}>to move</span>
          </div>
          {/* Right zone label — drag to look */}
          <div style={{
            position: 'absolute', bottom: '38%', right: 0, width: '50%',
            pointerEvents: 'none',
            color: '#f0e6d0',
            fontSize: 12, letterSpacing: '0.22em',
            textTransform: 'uppercase',
            textAlign: 'center',
            fontFamily: 'Georgia, serif',
            opacity: 0.72,
            textShadow: '0 1px 4px rgba(0,0,0,0.6)',
          }}>
            drag here<br/><span style={{ opacity: 0.7, fontSize: 10 }}>to look</span>
          </div>
        </>
      )}

      {/* Back button — only visible inside a world */}
      {activeRoom && (
        <button
          onClick={() => setRoom(null)}
          style={{
            position: 'absolute', top: 16, left: 16,
            pointerEvents: 'auto',
            background: pillBg, border: 'none', borderRadius: 20,
            padding: '8px 16px', color: textColor, fontSize: 13,
            cursor: 'pointer', backdropFilter: 'blur(8px)',
          }}
        >
          ← Return to tram
        </button>
      )}

      {/* Day/Night toggle — hidden inside worlds (worlds have their own fixed mood) */}
      {!activeRoom && (
        <button
          onClick={() => setMode(isNight ? 'day' : 'night')}
          aria-label={isNight ? 'Switch to day' : 'Switch to night'}
          title={isNight ? 'Switch to day' : 'Switch to night'}
          style={{
            position: 'absolute',
            top: 20,
            right: 16,
            pointerEvents: 'auto',
            background: pillBg,
            border: 'none',
            borderRadius: 24,
            padding: '8px 14px',
            color: textColor,
            fontSize: 16,
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            lineHeight: 1,
            transition: 'transform 120ms ease, background 120ms ease',
          }}
        >
          <span style={{ fontSize: 18 }}>{isNight ? '☀' : '🌙'}</span>
          <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            {isNight ? 'Day' : 'Night'}
          </span>
        </button>
      )}

      {/* Details toggle — hidden inside worlds */}
      {!activeRoom && (
        <button
          onClick={toggleDetails}
          aria-label={showDetails ? 'Hide details' : 'Show details'}
          title={showDetails ? 'Hide details' : 'Show details'}
          style={{
            position: 'absolute',
            top: 68,
            right: 16,
            pointerEvents: 'auto',
            background: showDetails
              ? 'linear-gradient(180deg, #f5ead0 0%, #ead9b2 100%)'
              : pillBg,
            color: showDetails ? '#1a1410' : textColor,
            border: showDetails ? '1px solid #8a6f3a' : 'none',
            borderRadius: 24,
            padding: '8px 14px',
            cursor: 'pointer',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            lineHeight: 1,
            transition: 'background 160ms ease, color 160ms ease',
          }}
        >
          <span style={{ fontSize: 14, fontStyle: 'italic', fontFamily: '"Playfair Display", Georgia, serif' }}>
            ℹ
          </span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
            Details
          </span>
        </button>
      )}

      {/* Destination pill + GO — bottom center, only visible on the tram. */}
      {!activeRoom && (
        <div style={{
          position: 'absolute',
          bottom: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          alignItems: 'center',
          gap: 0,
          pointerEvents: 'auto',
          background: pillBg,
          padding: '8px 6px',
          borderRadius: 32,
          backdropFilter: 'blur(8px)',
        }}>
          <button
            onClick={() => cycleBind(-1)}
            style={{
              background: 'none', border: 'none', color: textColor,
              fontSize: 16, padding: '4px 10px', cursor: 'pointer', lineHeight: 1,
            }}
            aria-label="Previous destination"
          >
            ◀
          </button>

          <div style={{ textAlign: 'center', padding: '0 8px', minWidth: 180 }}>
            <div style={{
              fontSize: 14, fontFamily: 'Georgia, serif',
              letterSpacing: '0.1em', whiteSpace: 'nowrap',
            }}>
              {currentStop.label}
            </div>
            <div style={{ fontSize: 10, opacity: 0.55, marginTop: 2 }}>
              {currentStop.subtitle}
            </div>
          </div>

          <button
            onClick={() => cycleBind(1)}
            style={{
              background: 'none', border: 'none', color: textColor,
              fontSize: 16, padding: '4px 10px', cursor: 'pointer', lineHeight: 1,
            }}
            aria-label="Next destination"
          >
            ▶
          </button>

          <button
            onClick={() => setRoom(currentStop.id)}
            style={{
              background: '#c82820', border: 'none', borderRadius: 16,
              color: '#fff', fontSize: 12, fontWeight: 700,
              padding: '6px 14px', cursor: 'pointer',
              letterSpacing: '0.05em', marginLeft: 4,
            }}
          >
            GO →
          </button>
        </div>
      )}

{/* Social handles — only on the tram. In FPS worlds the chip sits in the
          right-half drag-to-look zone and steals touches that should rotate the
          camera, so we hide it while exploring and bring it back on the tram.
          On touch viewports the destination pill spans nearly full width, so
          stack the chip above it. */}
      {!inFPSWorld && (
        <div style={{
          position: 'absolute',
          bottom: IS_TOUCH && !activeRoom ? 84 : 24,
          right: 16,
          pointerEvents: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'flex-end',
        }}>
          <SocialChip label="@karmenbuilds" platform="Instagram" url="https://instagram.com/karmenbuilds" />
        </div>
      )}
    </div>
  )
}

function SocialChip({ label, platform, url }: { label: string; platform: string; url: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        background: 'linear-gradient(180deg, #d4b478 0%, #9a7a44 100%)',
        border: '1px solid #8a6f3a',
        borderRadius: 24,
        padding: '7px 14px',
        color: '#1a1410',
        textDecoration: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        lineHeight: 1,
        fontFamily: '"Playfair Display", Georgia, serif',
        boxShadow: '0 2px 10px rgba(200,164,104,0.35), inset 0 1px 0 rgba(255,255,255,0.35)',
      }}
    >
      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', opacity: 0.7 }}>
        {platform}
      </span>
      <span style={{ fontSize: 13, fontWeight: 700 }}>
        {label}
      </span>
    </a>
  )
}
