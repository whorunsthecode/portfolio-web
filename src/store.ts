import { create } from 'zustand'

export type StopId = 'chungking' | 'walled_city'

export const STOPS: { id: StopId; label: string; subtitle: string }[] = [
  { id: 'chungking',   label: 'CHUNGKING MANSIONS', subtitle: '尖沙咀 TSIM SHA TSUI' },
  { id: 'walled_city', label: 'THE WALLED CITY',    subtitle: '九龍城 KOWLOON CITY' },
]

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
