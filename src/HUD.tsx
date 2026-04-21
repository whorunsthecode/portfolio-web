import { useStore, ROUTE_DISTRICTS } from './store'

export function HUD() {
  const routePos = useStore((s) => s.routePos)
  const mode = useStore((s) => s.mode)
  const setMode = useStore((s) => s.setMode)
  const showDetails = useStore((s) => s.showDetails)
  const toggleDetails = useStore((s) => s.toggleDetails)

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
      {/* Day/Night toggle */}
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

      {/* Details toggle — reveals InfoTag captions on 1982 HK references */}
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

      {/* District readout — bottom center. Pure atmosphere; loops as the
          tram advances through Central → Kennedy Town. */}
      <div style={{
        position: 'absolute',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
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

      {/* Social handles — bottom-right corner. Only pair kept on the reel
          variant. Brass/ink chip style matches the HK-1982 world. */}
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
