import { useStore } from '../store'

/**
 * Phase 7 — visible sound toggle in the top-right corner.
 * Positioned to the LEFT of the existing Day/Night theme toggle so
 * they sit side-by-side without overlapping.
 */
export function SoundToggle() {
  const audioEnabled = useStore((s) => s.audioEnabled)
  const setAudioEnabled = useStore((s) => s.setAudioEnabled)

  return (
    <button
      onClick={() => setAudioEnabled(!audioEnabled)}
      style={{
        position: 'fixed',
        top: 16,
        right: 92, // sits left of the Day/Night button (which is at right: 16)
        zIndex: 11,
        background: 'rgba(20, 20, 20, 0.75)',
        color: '#f0e6d0',
        border: 'none',
        borderRadius: 20,
        padding: '8px 14px',
        fontFamily: 'Georgia, serif',
        fontSize: 13,
        letterSpacing: '0.05em',
        backdropFilter: 'blur(8px)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        userSelect: 'none',
        pointerEvents: 'auto',
      }}
      aria-label={audioEnabled ? 'Mute sound' : 'Enable sound'}
      aria-pressed={audioEnabled}
    >
      <span style={{ fontSize: 14 }} aria-hidden>
        {audioEnabled ? '\u{1F50A}' : '\u{1F507}'}
      </span>
      <span>{audioEnabled ? 'Sound on' : 'Sound off'}</span>
    </button>
  )
}
