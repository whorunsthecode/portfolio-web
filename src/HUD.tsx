import { useStore, STOPS, ROUTE_DISTRICTS } from './store'
import { playDingDing } from './audio/playDingDing'

export function HUD() {
  const mode = useStore((s) => s.mode)
  const setMode = useStore((s) => s.setMode)
  const activeRoom = useStore((s) => s.activeRoom)
  const setRoom = useStore((s) => s.setRoom)
  const blindIndex = useStore((s) => s.blindIndex)
  const cycleBind = useStore((s) => s.cycleBind)
  const routePos = useStore((s) => s.routePos)

  const isDark = mode === 'night'
  const currentStop = STOPS[blindIndex]
  const district = ROUTE_DISTRICTS.find((d) => routePos >= d.from && routePos < d.to)?.label ?? ROUTE_DISTRICTS[0].label

  const pillBg = 'rgba(20,20,20,0.75)'
  const textColor = '#f0e6d0'

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 10,
      color: textColor,
    }}>
      {/* Back button */}
      {activeRoom && (
        <button onClick={() => setRoom(null)} style={{
          position: 'absolute', top: 16, left: 16,
          pointerEvents: 'auto',
          background: pillBg, border: 'none', borderRadius: 20,
          padding: '8px 16px', color: textColor, fontSize: 13,
          cursor: 'pointer', backdropFilter: 'blur(8px)',
        }}>
          ← Back
        </button>
      )}

      {/* Theme toggle */}
      <button
        onClick={() => setMode(isDark ? 'day' : 'night')}
        style={{
          position: 'absolute', top: 16, right: 16,
          pointerEvents: 'auto',
          background: pillBg, border: 'none', borderRadius: 20,
          padding: '8px 16px', color: textColor, fontSize: 13,
          cursor: 'pointer', backdropFilter: 'blur(8px)',
        }}
      >
        {isDark ? 'Day' : 'Night'}
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
            onClick={() => {
              playDingDing()
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
