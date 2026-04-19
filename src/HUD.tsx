import { useEffect, useState } from 'react'
import { useStore, STOPS, ROUTE_DISTRICTS } from './store'

export function HUD() {
  const activeRoom = useStore((s) => s.activeRoom)
  const setRoom = useStore((s) => s.setRoom)
  const blindIndex = useStore((s) => s.blindIndex)
  const cycleBind = useStore((s) => s.cycleBind)
  const routePos = useStore((s) => s.routePos)
  const mode = useStore((s) => s.mode)
  const setMode = useStore((s) => s.setMode)
  const setShowDriverCard = useStore((s) => s.setShowDriverCard)
  const showDetails = useStore((s) => s.showDetails)
  const toggleDetails = useStore((s) => s.toggleDetails)

  const currentStop = STOPS[blindIndex]
  const district = ROUTE_DISTRICTS.find((d) => routePos >= d.from && routePos < d.to)?.label ?? ROUTE_DISTRICTS[0].label

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
      {/* Keyframes for the Contact chip pulse — scoped to the HUD so the
          animation is visible on mobile without relying on hover state. */}
      <style>{`
        @keyframes contactPulse {
          0%, 100% { box-shadow: 0 2px 10px rgba(200,164,104,0.35), inset 0 1px 0 rgba(255,255,255,0.35); }
          50%      { box-shadow: 0 2px 18px rgba(200,164,104,0.85), inset 0 1px 0 rgba(255,255,255,0.35); }
        }
      `}</style>
      {/* Back button */}
      {activeRoom && (
        <button onClick={() => setRoom(null)} style={{
          position: 'absolute', top: 16, left: 16,
          pointerEvents: 'auto',
          background: pillBg, border: 'none', borderRadius: 20,
          padding: '8px 16px', color: textColor, fontSize: 13,
          cursor: 'pointer', backdropFilter: 'blur(8px)',
        }}>
          ← Return to tram
        </button>
      )}

      {/* Terminus context banner — a tram terminus is abstract; spell out that
          this is the contact room. Other worlds stand on their own visually. */}
      {activeRoom === 'terminus' && <TerminusContextBanner />}

      {/* ── Day/Night toggle — top right. Briefly overlaps with the
              Skip button during the ~5s boarding intro (App.tsx);
              after boarding Skip disappears and this pill sits alone. */}
      <button
        onClick={() => setMode(isNight ? 'day' : 'night')}
        aria-label={isNight ? 'Switch to day' : 'Switch to night'}
        title={isNight ? 'Switch to day' : 'Switch to night'}
        style={{
          position: 'absolute',
          top: 68,
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
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background =
            'rgba(40,40,40,0.85)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = pillBg
        }}
      >
        <span style={{ fontSize: 18 }}>{isNight ? '☀' : '🌙'}</span>
        <span style={{ fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          {isNight ? 'Day' : 'Night'}
        </span>
      </button>

      {/* ── Contact chip — persistent CTA below the Day/Night toggle.
              Hover-glow on the 3D badge is invisible on touch devices, so
              this HUD affordance guarantees the contact entry point is
              always discoverable. Brass gradient matches the in-cabin
              badge; the keyframe pulse draws the eye without being loud. */}
      {/* Details toggle — reveals Sims-style captions on cultural references
          (Anita Mui, Leslie Cheung, Jardine House, KMB bus, etc.) so non-HK
          visitors can see what we snuck in. Off by default; the pill state
          mirrors the store flag. */}
      {!activeRoom && (
        <button
          onClick={toggleDetails}
          aria-label={showDetails ? 'Hide details' : 'Show details'}
          title={showDetails ? 'Hide details' : 'Show details'}
          style={{
            position: 'absolute',
            top: 164,
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

      <button
        onClick={() => setShowDriverCard(true)}
        aria-label="Contact the driver"
        title="Contact the driver"
        style={{
          position: 'absolute',
          top: 116,
          right: 16,
          pointerEvents: 'auto',
          background: 'linear-gradient(180deg, #d4b478 0%, #9a7a44 100%)',
          border: '1px solid #8a6f3a',
          borderRadius: 24,
          padding: '8px 14px',
          color: '#1a1410',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          lineHeight: 1,
          animation: 'contactPulse 2.4s ease-in-out infinite',
        }}
      >
        <span style={{ fontSize: 16 }}>✉</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          Contact
        </span>
      </button>

      {/* ── Destination navigation pill — bottom center ──── */}
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
          {/* Left arrow */}
          <button
            onClick={() => cycleBind(-1)}
            style={{
              background: 'none', border: 'none', color: textColor,
              fontSize: 16, padding: '4px 10px', cursor: 'pointer', lineHeight: 1,
            }}
          >
            ◀
          </button>

          {/* Destination name + subtitle */}
          <div style={{ textAlign: 'center', padding: '0 8px', minWidth: 160 }}>
            <div style={{
              fontSize: 14, fontFamily: 'Georgia, serif',
              letterSpacing: '0.1em', whiteSpace: 'nowrap',
            }}>
              {currentStop.label}
            </div>
            <div style={{ fontSize: 10, opacity: 0.5, marginTop: 2 }}>
              {currentStop.subtitle}
            </div>
          </div>

          {/* Right arrow */}
          <button
            onClick={() => cycleBind(1)}
            style={{
              background: 'none', border: 'none', color: textColor,
              fontSize: 16, padding: '4px 10px', cursor: 'pointer', lineHeight: 1,
            }}
          >
            ▶
          </button>

          {/* GO button */}
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
    </div>
  )
}

/* ── Terminus context banner — fades in when entering, auto-hides after 6s ── */
function TerminusContextBanner() {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(false), 6000)
    return () => window.clearTimeout(t)
  }, [])

  return (
    <div
      onClick={() => setVisible(false)}
      style={{
        position: 'absolute',
        top: 72,
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'auto',
        background: 'linear-gradient(180deg, rgba(26,20,16,0.88) 0%, rgba(10,8,6,0.88) 100%)',
        color: '#f5ead0',
        padding: '10px 18px',
        borderRadius: 20,
        border: '1px solid rgba(138,111,58,0.55)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        maxWidth: 'min(92vw, 440px)',
        textAlign: 'center',
        boxShadow: '0 6px 24px rgba(0,0,0,0.45)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 600ms ease',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontStyle: 'italic',
          fontSize: 13,
          lineHeight: 1.45,
        }}
      >
        Whitty Street terminus — every ticket on the board is a way to reach me.
      </div>
      <div
        style={{
          fontFamily: '"Noto Serif TC", serif',
          fontSize: 11,
          letterSpacing: '0.12em',
          opacity: 0.75,
          marginTop: 4,
        }}
      >
        屈地街總站 · 每張車票都是聯絡方式
      </div>
    </div>
  )
}
