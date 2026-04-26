import { create } from 'zustand'

export type StopId = 'walled_city'

export const STOPS: { id: StopId; label: string; subtitle: string }[] = [
  { id: 'walled_city', label: 'THE WALLED CITY',    subtitle: '九龍城 KOWLOON CITY' },
]

// Route zones — maps tram route position to district. Used by ambient HUD
// readout; the tram loops through these continuously.
export const ROUTE_DISTRICTS = [
  { from: 0, to: 140, label: '中環 CENTRAL' },
]

interface State {
  mode: 'day' | 'night'
  routePos: number
  muted: boolean
  showDetails: boolean
  activeRoom: null | StopId
  blindIndex: number
  setMode: (m: 'day' | 'night') => void
  advanceRoute: (delta: number) => void
  toggleMute: () => void
  toggleDetails: () => void
  setRoom: (r: State['activeRoom']) => void
  cycleBind: (dir: 1 | -1) => void
}

export const useStore = create<State>((set) => ({
  mode: 'day',
  routePos: 0,
  muted: false,
  showDetails: false,
  activeRoom: null,
  blindIndex: 0,
  setMode: (mode) => set({ mode }),
  advanceRoute: (delta) => set((s) => ({
    routePos: (s.routePos + delta) % 140,
  })),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  toggleDetails: () => set((s) => ({ showDetails: !s.showDetails })),
  setRoom: (activeRoom) => set({ activeRoom }),
  cycleBind: (dir) => set((s) => ({
    blindIndex: (s.blindIndex + dir + STOPS.length) % STOPS.length,
  })),
}))
