/**
 * InfoTag — Sims-style floating caption for a 3D reference in the scene.
 *
 * Non-interactive sibling of <TapHint>. Visible only when the user flips the
 * "Details" toggle in the HUD (store.showDetails). Intended for surfacing
 * cultural/historical easter eggs that a non-HK audience would otherwise
 * walk past — e.g. "Anita Mui · HK's Madonna" floating over the cabin
 * passenger, or "Jardine House · 1,748 portholes" next to the tower.
 *
 * Keep labels ≤ 6 words. The chip follows the target mesh via drei's
 * <Html sprite>, so it always reads face-on regardless of camera angle.
 */

import { Html } from '@react-three/drei'
import { useStore } from '../../store'

export function InfoTag({
  label,
  offset = [0, 1, 0],
}: {
  label: string
  offset?: [number, number, number]
}) {
  const showDetails = useStore((s) => s.showDetails)
  if (!showDetails) return null

  return (
    <Html position={offset} center sprite style={{ pointerEvents: 'none' }}>
      <style>{`
        @keyframes tramInfoFade {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2,
          animation: 'tramInfoFade 260ms ease-out both',
        }}
      >
        <div
          style={{
            padding: '4px 10px',
            background: 'rgba(20,16,12,0.82)',
            color: '#f5ead0',
            borderRadius: 10,
            border: '1px solid rgba(138,111,58,0.6)',
            fontFamily: '"Playfair Display", Georgia, "Noto Serif TC", serif',
            fontStyle: 'italic',
            fontSize: 11,
            letterSpacing: '0.04em',
            whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(0,0,0,0.45)',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        >
          {label}
        </div>
        {/* Downward tick */}
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: '4px solid transparent',
            borderRight: '4px solid transparent',
            borderTop: '5px solid rgba(20,16,12,0.82)',
          }}
        />
      </div>
    </Html>
  )
}
