/**
 * Single source of truth for the portfolio owner's contact channels.
 * Referenced from both:
 *   - src/worlds/Terminus/InfoPanel.tsx (the in-world bus-stop pole)
 *   - src/onboarding/DriverContactCard.tsx (the retro-ticket overlay
 *     that opens when the rider clicks the driver)
 *
 * Update your handles here and both surfaces follow.
 */

export interface ContactChannel {
  id: 'linkedin' | 'email' | 'github' | 'resume'
  label: string
  /** Short display label under the main one — e.g. "@karmenyipnm". */
  subtitle: string
  /** Destination. null means the channel is display-only (not yet live). */
  url: string | null
  /** Accent color for the channel card in both surfaces. */
  accentColor: string
}

export const CONTACT_CHANNELS: ContactChannel[] = [
  {
    id: 'linkedin',
    label: 'LinkedIn',
    subtitle: '@karmenyipnm',
    url: 'https://www.linkedin.com/in/karmenyipnm',
    accentColor: '#2a4868',
  },
  {
    id: 'email',
    label: 'Email',
    subtitle: 'kynm2603',
    url: 'mailto:kynm2603@gmail.com',
    accentColor: '#a82828',
  },
  {
    id: 'github',
    label: 'GitHub',
    subtitle: '@whorunsthecode',
    url: 'https://github.com/whorunsthecode',
    accentColor: '#3a3a38',
  },
  {
    id: 'resume',
    label: 'Résumé',
    subtitle: 'coming soon',
    url: null,
    accentColor: '#8a6a42',
  },
]
