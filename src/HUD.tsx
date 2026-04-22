import { useStore, STOPS, ROUTE_DISTRICTS } from './store'

export function HUD() {
  const routePos = useStore((s) => s.routePos)
  const mode = useStore((s) => s.mode)
  const setMode = useStore((s) => s.setMode)
  const showDetails = useStore((s) => s.showDetails)
  const toggleDetails = useStore((s) => s.toggleDetails)
  const activeRoom = useStore((s) => s.activeRoom)
  const setRoom = useStore((s) => s.setRoom)
  const blindIndex = useStore((s) => s.blindIndex)
  const cycleBind = useStore((s) => s.cycleBind)

  const district = ROUTE_DISTRICTS.find((d) => routePos >= d.from && routePos < d.to)?.label ?? ROUTE_DISTRICTS[0].label
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

      {/* District readout — ambient tram-only. Moved up-left inside worlds
          would be confusing, so just hide it there. */}
      {!activeRoom && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: 16,
          pointerEvents: 'none',
          background: pillBg,
          padding: '8px 18px',
          borderRadius: 24,
          backdropFilter: 'blur(8px)',
          textAlign: 'center',
          fontFamily: '"Noto Serif TC", Georgia, serif',
          fontSize: 12,
          letterSpacing: '0.18em',
          opacity: 0.85,
        }}>
          {district}
        </div>
      )}

      {/* Social handles — persistent across tram + worlds. Brass/ink chip
          style matches the HK-1982 world. */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        right: 16,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'flex-end',
      }}>
        <SocialChip label="@karmenbuilds" platform="Instagram" url="https://instagram.com/karmenbuilds" />
        <SocialChip label="@karships" platform="X" url="https://x.com/karships" />
      </div>
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
