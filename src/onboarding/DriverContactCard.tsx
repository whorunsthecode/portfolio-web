/**
 * Driver contact card — retro HK tram-ticket overlay.
 *
 * Triggered when the user clicks the driver figure in the cabin. Visual
 * language matches OnboardingOverlay.tsx (cream paper card, Playfair +
 * Noto Serif TC, Pantone tram green accent, ornamental rule). Reads as
 * a physical ticket stub the driver hands the rider.
 *
 * Contact channels come from src/config/contact.ts — single source of
 * truth shared with the Terminus InfoPanel in-world pole.
 *
 * Open/close state is controlled via the global store (useStore.showDriverCard).
 * The clickable driver hitbox lives inside DriverCab; on pointer-down
 * it calls setShowDriverCard(true).
 */

import { useEffect } from 'react'
import { CONTACT_CHANNELS } from '../config/contact'
import { useStore } from '../store'

export function DriverContactCard() {
  const open = useStore((s) => s.showDriverCard)
  const setOpen = useStore((s) => s.setShowDriverCard)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        setOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      onClick={() => setOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="driver-card-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        display: 'grid',
        placeItems: 'center',
        background:
          'radial-gradient(ellipse at center, rgba(20,16,12,0.65) 0%, rgba(6,4,3,0.9) 100%)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        padding: '24px',
        boxSizing: 'border-box',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 520,
          width: '100%',
          background:
            'linear-gradient(180deg, #f5ead0 0%, #ead9b2 100%)',
          color: '#1a1410',
          borderRadius: 12,
          padding: 'clamp(24px, 4vw, 40px) clamp(22px, 4vw, 40px)',
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.6) inset, 0 0 0 1px #8a6f3a, 0 24px 60px rgba(0,0,0,0.55)',
          textAlign: 'center',
          backgroundImage:
            'linear-gradient(180deg, rgba(255,255,255,0.18) 0%, transparent 22%, transparent 78%, rgba(0,0,0,0.06) 100%), linear-gradient(180deg, #f5ead0 0%, #ead9b2 100%)',
          position: 'relative',
        }}
      >
        {/* Close button — small X top-right */}
        <button
          onClick={() => setOpen(false)}
          aria-label="Close"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            background: 'transparent',
            border: 'none',
            fontSize: 20,
            color: '#8a6f3a',
            cursor: 'pointer',
            width: 32,
            height: 32,
            borderRadius: '50%',
            lineHeight: 1,
          }}
        >
          ×
        </button>

        {/* Driver stub label */}
        <div
          style={{
            display: 'inline-block',
            background: '#0d6b3a',
            color: '#f5ead0',
            padding: '5px 18px',
            borderRadius: 3,
            fontFamily: '"Playfair Display", Georgia, serif',
            fontWeight: 700,
            fontSize: 'clamp(11px, 1.6vw, 13px)',
            letterSpacing: '0.32em',
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          司機 · Driver
        </div>

        {/* Chinese sub-title */}
        <div
          style={{
            fontFamily: '"Noto Serif TC", "Playfair Display", serif',
            fontSize: 'clamp(16px, 2.8vw, 20px)',
            letterSpacing: '0.14em',
            fontWeight: 600,
            color: '#2a1a10',
            marginBottom: 4,
          }}
        >
          與司機聯絡
        </div>

        {/* English title */}
        <h2
          id="driver-card-title"
          style={{
            fontFamily: '"Playfair Display", Georgia, serif',
            fontSize: 'clamp(22px, 4vw, 32px)',
            fontWeight: 700,
            fontStyle: 'italic',
            letterSpacing: '0.02em',
            margin: 0,
            color: '#1a1410',
          }}
        >
          Talk to the driver
        </h2>

        {/* Ornamental separator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            margin: '16px 0 18px',
            color: '#8a6f3a',
            opacity: 0.85,
          }}
          aria-hidden
        >
          <span style={{ width: 32, height: 1, background: '#8a6f3a' }} />
          <span style={{ fontSize: 10, letterSpacing: '0.3em' }}>◆</span>
          <span style={{ width: 32, height: 1, background: '#8a6f3a' }} />
        </div>

        {/* Tram-style route list of channels — each row styled like a stop on the line */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            textAlign: 'left',
            margin: '0 0 18px',
          }}
        >
          {CONTACT_CHANNELS.map((ch) => {
            const isDisabled = !ch.url
            const isEmail = ch.id === 'email'
            const emailAddress = isEmail
              ? ch.url?.replace('mailto:', '') ?? ''
              : ''

            const row = (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: isDisabled ? '#a89a6e' : ch.accentColor,
                    boxShadow: isDisabled
                      ? 'none'
                      : `0 0 0 2px ${ch.accentColor}20`,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: '"Playfair Display", Georgia, serif',
                    fontWeight: 700,
                    fontSize: 'clamp(14px, 2vw, 16px)',
                    color: '#1a1410',
                    minWidth: 84,
                  }}
                >
                  {ch.label}
                </span>
                <span
                  style={{
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                    fontSize: 'clamp(12px, 1.8vw, 14px)',
                    color: isDisabled ? '#8a7a58' : '#3a2818',
                    opacity: isDisabled ? 0.7 : 1,
                    fontStyle: isDisabled ? 'italic' : 'normal',
                    wordBreak: 'break-all',
                  }}
                >
                  {isEmail ? emailAddress : ch.subtitle}
                </span>
                {!isDisabled && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontFamily: '"Playfair Display", serif',
                      fontSize: 11,
                      letterSpacing: '0.18em',
                      color: ch.accentColor,
                      textTransform: 'uppercase',
                      opacity: 0.85,
                    }}
                  >
                    Open →
                  </span>
                )}
              </>
            )

            const rowStyle: React.CSSProperties = {
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 14px',
              borderRadius: 6,
              background: 'rgba(26,20,16,0.04)',
              border: '1px solid rgba(138,111,58,0.3)',
              textDecoration: 'none',
              color: 'inherit',
              cursor: isDisabled ? 'default' : 'pointer',
              opacity: isDisabled ? 0.65 : 1,
              transition: 'transform 120ms ease, background 120ms ease',
            }

            return isDisabled ? (
              <div key={ch.id} style={rowStyle}>
                {row}
              </div>
            ) : (
              <a
                key={ch.id}
                href={ch.url ?? undefined}
                target={ch.id === 'email' ? undefined : '_blank'}
                rel={ch.id === 'email' ? undefined : 'noopener noreferrer'}
                style={rowStyle}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background =
                    'rgba(13,107,58,0.08)'
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.background =
                    'rgba(26,20,16,0.04)'
                }}
              >
                {row}
              </a>
            )
          })}
        </div>

        {/* Footnote */}
        <div
          style={{
            fontSize: 11,
            letterSpacing: '0.1em',
            color: '#6a4f28',
            fontFamily: '"Playfair Display", serif',
            fontStyle: 'italic',
          }}
        >
          Press&nbsp;
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
            Esc
          </kbd>
          &nbsp;to return to the cabin.
        </div>
      </div>
    </div>
  )
}
