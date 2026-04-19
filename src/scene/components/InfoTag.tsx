/**
 * InfoTag — Sims-style "i" bubble floating next to a 3D reference.
 *
 * Visible only when the user flips the "Details" toggle in the HUD
 * (store.showDetails). Renders as a small translucent blue-white orb with a
 * serif "i" inside, gently pulsing. Tapping the orb reveals a caption chip
 * with the ≤6-word label (e.g. "Anita Mui · Madonna of Asia"). Tapping
 * again hides it.
 *
 * Unlike always-visible caption chips, the orb is small enough that even
 * when scenes scroll past (vehicles, neon, scaffolding) it doesn't
 * overwhelm the view. The caption only appears on demand.
 *
 * Usage:
 *   // above a person's head
 *   <InfoTag label="Anita Mui · Madonna of Asia" offset={[0, 0.95, 0]} />
 *   // to the side of a building
 *   <InfoTag label="Jardine House · 1,748 portholes" offset={[10, 30, 0]} side="right" />
 */

import { useState } from 'react'
import { Html } from '@react-three/drei'
import { useStore } from '../../store'

export function InfoTag({
  label,
  offset = [0, 1, 0],
  side = 'bottom',
}: {
  label: string
  offset?: [number, number, number]
  /** Where the caption chip expands relative to the orb. */
  side?: 'bottom' | 'right' | 'left' | 'top'
}) {
  const showDetails = useStore((s) => s.showDetails)
  const [open, setOpen] = useState(false)

  if (!showDetails) return null

  const captionPosition: React.CSSProperties =
    side === 'right'
      ? { left: 36, top: '50%', transform: 'translateY(-50%)' }
      : side === 'left'
        ? { right: 36, top: '50%', transform: 'translateY(-50%)' }
        : side === 'top'
          ? { bottom: 36, left: '50%', transform: 'translateX(-50%)' }
          : { top: 36, left: '50%', transform: 'translateX(-50%)' }

  return (
    <Html position={offset} center sprite>
      <style>{`
        @keyframes tramInfoOrb {
          0%, 100% { box-shadow: 0 0 14px rgba(180,220,255,0.55), inset 0 1px 0 rgba(255,255,255,0.6); }
          50%      { box-shadow: 0 0 22px rgba(200,230,255,0.85), inset 0 1px 0 rgba(255,255,255,0.6); }
        }
        @keyframes tramInfoCaption {
          from { opacity: 0; transform: translate(var(--tx, -50%), calc(var(--ty, 0) + 4px)); }
          to   { opacity: 1; transform: translate(var(--tx, -50%), var(--ty, 0)); }
        }
      `}</style>
      <div style={{ position: 'relative', width: 32, height: 32 }}>
        <button
          onClick={(e) => {
            e.stopPropagation()
            setOpen((v) => !v)
          }}
          aria-label={`Show detail: ${label}`}
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.7)',
            background:
              'radial-gradient(circle at 35% 30%, rgba(245,250,255,0.75) 0%, rgba(180,215,245,0.45) 55%, rgba(130,180,230,0.35) 100%)',
            color: '#1a2a40',
            fontFamily: '"Playfair Display", Georgia, serif',
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 18,
            lineHeight: '30px',
            textAlign: 'center',
            cursor: 'pointer',
            padding: 0,
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            animation: 'tramInfoOrb 2.4s ease-in-out infinite',
            textShadow: '0 1px 1px rgba(255,255,255,0.6)',
          }}
        >
          i
        </button>

        {open && (
          <div
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
            style={{
              position: 'absolute',
              ...captionPosition,
              padding: '5px 11px',
              background: 'rgba(20,16,12,0.85)',
              color: '#f5ead0',
              borderRadius: 10,
              border: '1px solid rgba(138,111,58,0.6)',
              fontFamily: '"Playfair Display", Georgia, "Noto Serif TC", serif',
              fontStyle: 'italic',
              fontSize: 11,
              letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
              boxShadow: '0 2px 10px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              cursor: 'pointer',
              animation: 'tramInfoCaption 220ms ease-out both',
            }}
          >
            {label}
          </div>
        )}
      </div>
    </Html>
  )
}
