/**
 * Vintage greeting-card overlay — opens when the user taps the postcard
 * prop inside the Xmas Village world. Renders an illustrated travel-
 * poster backdrop with a personalised date/time stamp on top, then lets
 * the user download the result as a PNG.
 *
 * Replaces the earlier canvas-drawing flow in PostcardStation, which
 * generated and instantly downloaded a postcard without any preview.
 *
 * Backdrop asset lives at /public/assets/card-poster.png (cream sky at
 * the top leaves room for the overlay text; cobblestone at the bottom
 * sits under the footer credit).
 */

import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { useStore } from '../store'

export function GreetingCard() {
  const open = useStore((s) => s.showGreetingCard)
  const setOpen = useStore((s) => s.setShowGreetingCard)
  const cardRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  if (!open) return null

  const now = new Date()
  const dateStr = now.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const timeStr = now.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  })

  const handleDownload = async () => {
    if (!cardRef.current) return
    setBusy(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      })
      const link = document.createElement('a')
      link.download = `xmas-village-${now.getTime()}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setBusy(false)
    }
  }

  const onClose = () => setOpen(false)

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}
    >
      {/* Card — click-through guarded so tapping the card doesn't dismiss */}
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 360,
          height: 640,
          backgroundImage: 'url(/assets/card-poster.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          boxShadow: '0 24px 60px rgba(0,0,0,0.55)',
        }}
      >
        {/* Text overlay — sits in the cream sky area at the top */}
        <div
          style={{
            position: 'absolute',
            top: 30,
            left: 0,
            right: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 24px',
            zIndex: 5,
          }}
        >
          <span
            style={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontStyle: 'italic',
              fontWeight: 700,
              fontSize: 28,
              color: '#3a1a10',
              lineHeight: 1.2,
              letterSpacing: -0.5,
              marginBottom: 4,
            }}
          >
            Season's Greetings
          </span>

          <span
            style={{
              fontFamily: "'Crimson Pro', Georgia, serif",
              fontSize: 13,
              color: '#6a4a2a',
              letterSpacing: 1,
              marginBottom: 10,
            }}
          >
            from the Xmas Village
          </span>

          <div
            style={{
              width: 30,
              height: 1,
              background: '#c8a048',
              marginBottom: 8,
            }}
          />

          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 9,
              color: '#8a6a4a',
              letterSpacing: 2,
            }}
          >
            {dateStr}
          </span>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 8,
              color: '#a88a6a',
              letterSpacing: 1,
              marginTop: 2,
            }}
          >
            {timeStr} · Hong Kong
          </span>
        </div>

        {/* Merry Post stamp — top right */}
        <div
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 52,
            height: 64,
            background: '#1a5838',
            border: '2px solid rgba(240,230,200,0.5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1,
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 6,
              color: '#f0e6c8',
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}
          >
            Merry Post
          </span>
          <span style={{ fontSize: 8, color: '#c8a048', letterSpacing: 2 }}>
            聖誕快樂
          </span>
          <span
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 5,
              color: '#c8a048',
            }}
          >
            $3.70
          </span>
        </div>

        {/* Footer — sits on the cobblestone street */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: 30,
            background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
            zIndex: 9,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: 12,
            left: 0,
            right: 0,
            textAlign: 'center',
            zIndex: 10,
          }}
        >
          <a
            href="https://karmenyip.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontFamily: "'DM Mono', monospace",
              fontSize: 7,
              color: '#f0e6c8',
              textDecoration: 'none',
              letterSpacing: 1.5,
            }}
          >
            Karmen Yip · karmenyip.vercel.app
          </a>
        </div>
      </div>

      {/* Buttons */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ display: 'flex', gap: 12, marginTop: 16 }}
      >
        <button
          onClick={handleDownload}
          disabled={busy}
          style={{
            background: '#e8394a',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '12px 28px',
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            letterSpacing: 1,
            cursor: busy ? 'progress' : 'pointer',
            fontWeight: 600,
            opacity: busy ? 0.7 : 1,
          }}
        >
          {busy ? 'Rendering…' : 'Download Card ↓'}
        </button>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            color: '#ccc',
            border: '1px solid #444',
            borderRadius: 8,
            padding: '12px 20px',
            fontFamily: "'DM Mono', monospace",
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      </div>
    </div>
  )
}
