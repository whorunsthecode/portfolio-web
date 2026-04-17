import { create } from 'zustand'

export type StopId = 'museum' | 'christmas' | 'fantasy' | 'aquarium' | 'gym' | 'terminus'

export const STOPS: { id: StopId; label: string; subtitle: string }[] = [
  { id: 'museum',    label: 'THE MUSEUM',          subtitle: '中環 CENTRAL' },
  { id: 'christmas', label: 'THE XMAS VILLAGE',      subtitle: '上環 SHEUNG WAN' },
  { id: 'fantasy',   label: 'THE DREAMERY',         subtitle: '西營盤 SAI YING PUN' },
  { id: 'aquarium',  label: 'THE AQUARIUM',         subtitle: '石塘咀 SHEK TONG TSUI' },
  { id: 'gym',       label: 'THE STUDIO',            subtitle: '堅尼地城 KENNEDY TOWN' },
  { id: 'terminus',  label: 'THE TERMINUS',          subtitle: '屈地街 WHITTY STREET' },
]

// Route zones — maps tram route position to district
export const ROUTE_DISTRICTS = [
  { from: 0,   to: 45,  label: '中環 CENTRAL' },
  { from: 45,  to: 70,  label: '上環 SHEUNG WAN' },
  { from: 70,  to: 100, label: '西營盤 SAI YING PUN' },
  { from: 100, to: 120, label: '石塘咀 SHEK TONG TSUI' },
  { from: 120, to: 140, label: '堅尼地城 KENNEDY TOWN' },
]

interface State {
  mode: 'day' | 'night'
  activeRoom: null | StopId
  modal: null | StopId          // separate from activeRoom — only opens on exhibit click
  blindIndex: number
  routePos: number  // 0–140, advances with tram scroll speed
  muted: boolean
  /** When true, the Driver contact-card overlay is shown. Toggled by clicking
   *  the driver figure in DriverCab, dismissed by backdrop/Esc/close button. */
  showDriverCard: boolean
  setMode: (m: 'day' | 'night') => void
  setRoom: (r: State['activeRoom']) => void
  setModal: (m: State['modal']) => void
  setBlindIndex: (i: number) => void
  cycleBind: (dir: 1 | -1) => void
  advanceRoute: (delta: number) => void
  toggleMute: () => void
  setShowDriverCard: (v: boolean) => void
}

export const useStore = create<State>((set) => ({
  mode: 'day',
  activeRoom: null,
  modal: null,
  blindIndex: 0,
  routePos: 0,
  muted: false,
  showDriverCard: false,
  setMode: (mode) => set({ mode }),
  setRoom: (activeRoom) => set({ activeRoom, modal: null }),
  setModal: (modal) => set({ modal }),
  setBlindIndex: (blindIndex) => set({ blindIndex }),
  cycleBind: (dir) => set((s) => ({
    blindIndex: (s.blindIndex + dir + STOPS.length) % STOPS.length,
  })),
  advanceRoute: (delta) => set((s) => ({
    routePos: (s.routePos + delta) % 140,
  })),
  toggleMute: () => set((s) => ({ muted: !s.muted })),
  setShowDriverCard: (v) => set({ showDriverCard: v }),
}))
