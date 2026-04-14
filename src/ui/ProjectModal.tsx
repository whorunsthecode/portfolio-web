import { useStore } from '../store'

export interface ProjectData {
  name: string
  tagline: string
  description: string
  tech: string
  origin?: string
  status: 'live' | 'coming-soon'
  ctaLabel: string
  ctaUrl?: string
}

const PROJECTS: Record<string, ProjectData> = {
  museum: {
    name: 'Gesture Gallery',
    tagline: 'Walk through a private art museum using only your hands.',
    description: 'A contactless 3D art gallery navigated by hand gestures. Zoom into paintings down to canvas texture, hear AI-generated insights and audio guides, explore color palettes from each work.',
    tech: 'MediaPipe · Three.js · React · Tailwind · Gemini 3',
    origin: 'Built after missing Musée d\'Orsay, Rijksmuseum, and Belvedere Palace post-exchange — with 2 prompts in Gemini 3.',
    status: 'live',
    ctaLabel: 'Enter the gallery',
    ctaUrl: 'https://www.linkedin.com/posts/karmenyipnm_what-if-you-could-walk-through-your-own-private-activity-7403961595057664002-capj',
  },
  christmas: {
    name: 'The Christmas Sims',
    tagline: 'The Sims meets an Advent calendar — open a new tiny world every day in December.',
    description: 'A 25-day interactive Advent calendar where each door opens into a small Sims-style holiday scene you can click around in. Won Most Popular at MentorMates x BubbleLabs hackathon.',
    tech: 'Lovable · React · Three.js',
    status: 'live',
    ctaLabel: "Open today's door",
    ctaUrl: 'https://dream-village-render.lovable.app',
  },
  fantasy: {
    name: 'DreamDump',
    tagline: 'An AI dream journal with a cloud named Drift who actually wants to hear about it.',
    description: 'Log dreams and get AI-generated interpretations plus weekly pattern summaries that surface recurring themes. Drift the cloud mascot turns journaling into a cozy bedtime ritual.',
    tech: 'React (Vite) · Capacitor iOS · Gemini AI · Vercel · PostHog',
    status: 'coming-soon',
    ctaLabel: 'Coming soon',
  },
  aquarium: {
    name: 'PomoReef',
    tagline: 'Keep your cursor in the window. Earn a koi. Grow your pond.',
    description: 'A browser-based pixel-art pomodoro timer themed as a koi pond. Complete focus sessions to earn permanent koi fish. 2nd place at Builder Night: Open Source AI by Lonely Octopus.',
    tech: 'Browser-native · Page Visibility API · Pixel art · Claude Opus 4.6',
    status: 'live',
    ctaLabel: 'Start a focus dive',
    ctaUrl: 'https://pomoreef.pages.dev',
  },
  gym: {
    name: 'stiff',
    tagline: 'Your apps get blocked until you stretch. The shrimp is watching.',
    description: 'Set a daily limit on apps wrecking your spine; once you hit it they\'re locked until you complete a 2-minute stretch routine verified by your camera. A judgmental shrimp tracks streaks and drops collectible cards.',
    tech: 'Swift · SwiftUI · FamilyControls · AVFoundation · Vision · HealthKit',
    status: 'coming-soon',
    ctaLabel: 'Coming soon',
  },
  terminus: {
    name: 'Contacts',
    tagline: 'End of the line. Thanks for riding.',
    description: '',
    tech: '',
    status: 'live',
    ctaLabel: '',
  },
}

export function ProjectModal() {
  const modal = useStore((s) => s.modal)
  const setModal = useStore((s) => s.setModal)

  if (!modal || modal === 'terminus') return null

  const project = PROJECTS[modal]
  if (!project) return null

  const isLive = project.status === 'live'

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(10px)',
    }} onClick={() => setModal(null)}>
      <div
        style={{
          background: '#1a1816',
          borderRadius: 16,
          padding: '28px 24px',
          maxWidth: 380,
          width: '90%',
          color: '#f0e6d3',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          position: 'relative',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            {!isLive && (
              <span style={{
                display: 'inline-block',
                background: '#d4a017',
                color: '#1a1816',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
                marginBottom: 8,
                letterSpacing: '0.05em',
              }}>
                COMING SOON
              </span>
            )}
            <h2 style={{ margin: 0, fontSize: 22, fontFamily: 'Georgia, serif', color: '#fff' }}>
              {project.name}
            </h2>
          </div>
          <button
            onClick={() => setModal(null)}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              fontSize: 22,
              cursor: 'pointer',
              padding: '0 4px',
              lineHeight: 1,
            }}
          >
            x
          </button>
        </div>

        {/* Tagline */}
        <p style={{ margin: '0 0 16px', fontSize: 14, opacity: 0.7, fontStyle: 'italic' }}>
          {project.tagline}
        </p>

        {/* Description */}
        <p style={{ margin: '0 0 16px', fontSize: 13, lineHeight: 1.6, opacity: 0.85 }}>
          {project.description}
        </p>

        {/* Tech */}
        {project.tech && (
          <p style={{ margin: '0 0 12px', fontSize: 12, opacity: 0.5 }}>
            {project.tech}
          </p>
        )}

        {/* Origin */}
        {project.origin && (
          <p style={{ margin: '0 0 16px', fontSize: 12, opacity: 0.5, fontStyle: 'italic' }}>
            {project.origin}
          </p>
        )}

        {/* CTA */}
        {isLive && project.ctaUrl ? (
          <a
            href={project.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'block',
              textAlign: 'center',
              background: '#007549',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              letterSpacing: '0.03em',
            }}
          >
            {project.ctaLabel} →
          </a>
        ) : !isLive ? (
          <div style={{
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 8,
            padding: 16,
            textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 8px', fontSize: 12, opacity: 0.5 }}>
              In App Store review
            </p>
            <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>
              Notify me when it's live
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <input
                type="email"
                placeholder="your@email.com"
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.15)',
                  background: 'rgba(255,255,255,0.05)',
                  color: '#f0e6d3',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <button style={{
                padding: '8px 14px',
                borderRadius: 6,
                border: 'none',
                background: '#d4a017',
                color: '#1a1816',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
              }}>
                NOTIFY
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
