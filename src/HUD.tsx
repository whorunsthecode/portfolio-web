import { useEffect, useRef, useState } from 'react'
import { useStore, STOPS, ROUTE_DISTRICTS } from './store'

const GO_HINT_KEY = 'tram.seenGoHint.v1'

/**
 * District → project hint shown by <DistrictCaption /> as the tram
 * scrolls through each zone. Reuses the same 1982 HK geography as
 * ROUTE_DISTRICTS but adds a project tagline so first-time riders
 * realise each district has an explorable world attached to it.
 */
const DISTRICT_PROJECT_HINTS: Record<string, { project: string; tagline: string }> = {
  '中環 CENTRAL':        { project: 'Gesture Gallery',    tagline: 'A private museum you walk through by hand' },
  '上環 SHEUNG WAN':     { project: 'The Christmas Sims', tagline: 'A daily Advent mini-world you can click into' },
  '西營盤 SAI YING PUN': { project: 'DreamDump',          tagline: 'An AI cloud named Drift reads your dreams' },
  '石塘咀 SHEK TONG TSUI':{ project: 'PomoReef',          tagline: 'A focus timer that grows a koi pond' },
  '堅尼地城 KENNEDY TOWN': { project: 'stiff',             tagline: 'Your apps lock until you stretch' },
}

export function HUD() {
  const activeRoom = useStore((s) => s.activeRoom)
  const setRoom = useStore((s) => s.setRoom)
  const blindIndex = useStore((s) => s.blindIndex)
  const cycleBind = useStore((s) => s.cycleBind)
  const mode = useStore((s) => s.mode)
  const setMode = useStore((s) => s.setMode)
  const setShowDriverCard = useStore((s) => s.setShowDriverCard)
  const showDetails = useStore((s) => s.showDetails)
  const toggleDetails = useStore((s) => s.toggleDetails)

  // First-visit hint over the GO / destination pill. Stored in
  // localStorage so returning visitors don't see it again.
  const [showGoHint, setShowGoHint] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return window.localStorage.getItem(GO_HINT_KEY) !== '1'
    } catch {
      return false
    }
  })
  useEffect(() => {
    if (!showGoHint) return
    const t = window.setTimeout(() => {
      setShowGoHint(false)
      try {
        window.localStorage.setItem(GO_HINT_KEY, '1')
      } catch {
        // ignore private-mode storage failures
      }
    }, 9000)
    return () => window.clearTimeout(t)
  }, [showGoHint])
  const dismissGoHint = () => {
    setShowGoHint(false)
    try {
      window.localStorage.setItem(GO_HINT_KEY, '1')
    } catch {
      // ignore
    }
  }

  // Stronger contact pulse in the first 10 seconds of the session
  // so first-time visitors notice the CTA before it settles into the
  // gentle background pulse.
  const [contactBoost, setContactBoost] = useState(true)
  useEffect(() => {
    const t = window.setTimeout(() => setContactBoost(false), 10000)
    return () => window.clearTimeout(t)
  }, [])

  const currentStop = STOPS[blindIndex]

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
      {/* Keyframes for the HUD animations — scoped here so they work
          on mobile without relying on hover state. */}
      <style>{`
        @keyframes contactPulse {
          0%, 100% { box-shadow: 0 2px 10px rgba(200,164,104,0.35), inset 0 1px 0 rgba(255,255,255,0.35); }
          50%      { box-shadow: 0 2px 18px rgba(200,164,104,0.85), inset 0 1px 0 rgba(255,255,255,0.35); }
        }
        @keyframes contactPulseStrong {
          0%, 100% { box-shadow: 0 2px 14px rgba(232,196,136,0.55), inset 0 1px 0 rgba(255,255,255,0.45); transform: scale(1); }
          50%      { box-shadow: 0 2px 28px rgba(255,220,150,1), 0 0 0 6px rgba(255,220,150,0.15), inset 0 1px 0 rgba(255,255,255,0.45); transform: scale(1.04); }
        }
        @keyframes goHintBounce {
          0%, 100% { transform: translate(-50%, 0); }
          50%      { transform: translate(-50%, -4px); }
        }
        @keyframes goHintFadeIn {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
      {/* District caption — auto-appears as the tram crosses into each
          new zone, hinting which project is attached to this stop. */}
      {!activeRoom && <DistrictCaption />}

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
          animation: contactBoost
            ? 'contactPulseStrong 1.2s ease-in-out infinite'
            : 'contactPulse 2.4s ease-in-out infinite',
        }}
      >
        <span style={{ fontSize: 16 }}>✉</span>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase' }}>
          Contact
        </span>
      </button>

      {/* ── First-visit hint above the GO pill — auto-hides after 9s
              or on tap. Explains what the mystery bottom bar is for. */}
      {!activeRoom && showGoHint && (
        <div
          onClick={dismissGoHint}
          style={{
            position: 'absolute',
            bottom: 96,
            left: '50%',
            pointerEvents: 'auto',
            background: 'linear-gradient(180deg, rgba(26,20,16,0.92) 0%, rgba(10,8,6,0.92) 100%)',
            color: '#f5ead0',
            padding: '8px 14px',
            borderRadius: 18,
            border: '1px solid rgba(200,164,104,0.5)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
            cursor: 'pointer',
            fontFamily: '"Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 13,
            whiteSpace: 'nowrap',
            animation:
              'goHintFadeIn 400ms ease-out 200ms both, goHintBounce 1.6s ease-in-out 600ms infinite',
          }}
        >
          ↓ Tap a stop, then GO — each is a world to explore
        </div>
      )}

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
            onClick={() => {
              dismissGoHint()
              setRoom(currentStop.id)
            }}
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

/* ── District caption — slides in on district change, auto-hides after 6s
       so first-timers learn that each zone hides a playable world. ── */
function DistrictCaption() {
  const routePos = useStore((s) => s.routePos)
  const district =
    ROUTE_DISTRICTS.find((d) => routePos >= d.from && routePos < d.to)?.label ??
    ROUTE_DISTRICTS[0].label

  // Track district transitions + hold the currently-shown label so the
  // banner stays visible for its full 6s window even if the tram has
  // already crossed into the next zone.
  const [visibleDistrict, setVisibleDistrict] = useState<string | null>(null)
  const prevRef = useRef<string | null>(null)
  const timerRef = useRef<number | undefined>(undefined)

  useEffect(() => {
    // First render: show the opening district after a short settle delay.
    if (prevRef.current === null) {
      prevRef.current = district
      const settle = window.setTimeout(() => {
        setVisibleDistrict(district)
        timerRef.current = window.setTimeout(() => setVisibleDistrict(null), 6000)
      }, 1800)
      return () => {
        window.clearTimeout(settle)
        if (timerRef.current) window.clearTimeout(timerRef.current)
      }
    }

    if (prevRef.current !== district) {
      prevRef.current = district
      if (timerRef.current) window.clearTimeout(timerRef.current)
      setVisibleDistrict(district)
      timerRef.current = window.setTimeout(() => setVisibleDistrict(null), 6000)
    }
  }, [district])

  useEffect(() => () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
  }, [])

  if (!visibleDistrict) return null
  const hint = DISTRICT_PROJECT_HINTS[visibleDistrict]
  if (!hint) return null

  const [zh, ...enParts] = visibleDistrict.split(' ')
  const en = enParts.join(' ')

  return (
    <div
      style={{
        position: 'absolute',
        top: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        zIndex: 11,
        animation: 'districtCaptionIn 500ms ease-out both',
      }}
    >
      <style>{`
        @keyframes districtCaptionIn {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to   { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(20,16,12,0.82) 0%, rgba(10,8,6,0.82) 100%)',
          color: '#f5ead0',
          padding: '10px 18px',
          borderRadius: 18,
          border: '1px solid rgba(200,164,104,0.4)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          boxShadow: '0 6px 22px rgba(0,0,0,0.45)',
          maxWidth: 'min(92vw, 440px)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontFamily: '"Noto Serif TC", Georgia, serif',
            fontSize: 13,
            letterSpacing: '0.14em',
            opacity: 0.88,
          }}
        >
          <span style={{ fontWeight: 700 }}>{zh}</span>
          <span style={{ opacity: 0.55, marginLeft: 8, fontSize: 11 }}>{en}</span>
        </div>
        <div
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            fontSize: 15,
            fontWeight: 700,
            marginTop: 4,
            color: '#ffe6b0',
          }}
        >
          {hint.project}
        </div>
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.05em',
            opacity: 0.7,
            marginTop: 2,
          }}
        >
          {hint.tagline}
        </div>
      </div>
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
