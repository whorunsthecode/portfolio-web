import { create } from 'zustand'

// Route zones — maps tram route position to district. Used by ambient HUD
// readout; the tram loops through these continuously.
export const ROUTE_DISTRICTS = [
  { from: 0,   to: 45,  label: '中環 CENTRAL' },
  { from: 45,  to: 70,  label: '上環 SHEUNG WAN' },
  { from: 70,  to: 100, label: '西營盤 SAI YING PUN' },
  { from: 100, to: 120, label: '石塘咀 SHEK TONG TSUI' },
  { from: 120, to: 140, label: '堅尼地城 KENNEDY TOWN' },
]

interface State {
  mode: 'day' | 'night'
  routePos: number
  muted: boolean
  showDetails: boolean
  setMode: (m: 'day' | 'night') => void
  advanceRoute: (delta: number) => void
  toggleMute: () => void
  toggleDetails: () => void
}

export const useStore = create<State>((set) => ({
  mode: 'day',
  routePos: 0,
  muted: false,
  showDetails: false,
  setMode: (mode) => set({ mode }),
  advanceRoute: (delta) => set((s) => ({
    routePos: (s.routePos + delta) % 140,
  })),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  toggleDetails: () => set((s) => ({ showDetails: !s.showDetails })),
}))
