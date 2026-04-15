import { create } from 'zustand'

export type StopId = 'museum' | 'christmas' | 'fantasy' | 'aquarium' | 'gym' | 'terminus'

/** WorldId — the current audio context. 'tram' is the default when no
 *  activeRoom is set; otherwise it mirrors StopId. */
export type WorldId = 'tram' | StopId

export const STOPS: { id: StopId; label: string; subtitle: string }[] = [
  { id: 'museum',    label: 'THE MUSEUM',          subtitle: '中環 CENTRAL' },
  { id: 'christmas', label: 'CHRISTMAS VILLAGE',    subtitle: '上環 SHEUNG WAN' },
  { id: 'fantasy',   label: 'THE DREAMERY',         subtitle: '西營盤 SAI YING PUN' },
  { id: 'aquarium',  label: 'THE AQUARIUM',         subtitle: '石塘咀 SHEK TONG TSUI' },
  { id: 'gym',       label: 'THE GYM',              subtitle: '堅尼地城 KENNEDY TOWN' },
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
  audioEnabled: boolean         // Phase 7 — default OFF, user-activated
  setMode: (m: 'day' | 'night') => void
  setRoom: (r: State['activeRoom']) => void
  setModal: (m: State['modal']) => void
  setBlindIndex: (i: number) => void
  cycleBind: (dir: 1 | -1) => void
  advanceRoute: (delta: number) => void
  setAudioEnabled: (enabled: boolean) => void
}

export const useStore = create<State>((set) => ({
  mode: 'day',
  activeRoom: null,
  modal: null,
  blindIndex: 0,
  routePos: 0,
  audioEnabled: false, // Phase 7 — respect autoplay policies, wait for user gesture
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
  setAudioEnabled: (audioEnabled) => set({ audioEnabled }),
}))
