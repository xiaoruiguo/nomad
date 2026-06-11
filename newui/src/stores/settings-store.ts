import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type LogMode = 'streaming' | 'head' | 'tail'

interface SettingsState {
  pageSize: number
  logMode: LogMode
  liveUpdateJobsIndex: boolean
  keyboardNavEnabled: boolean
  customKeyBindings: Record<string, string>
}

interface SettingsActions {
  setPageSize: (n: number) => void
  setLogMode: (mode: LogMode) => void
  setLiveUpdateJobsIndex: (enabled: boolean) => void
  setKeyboardNavEnabled: (enabled: boolean) => void
  setCustomKeyBinding: (action: string, key: string) => void
}

type SettingsStore = SettingsState & SettingsActions

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      pageSize: 25,
      logMode: 'streaming' as LogMode,
      liveUpdateJobsIndex: true,
      keyboardNavEnabled: false,
      customKeyBindings: {},

      setPageSize: (pageSize) => set({ pageSize }),

      setLogMode: (logMode) => set({ logMode }),

      setLiveUpdateJobsIndex: (liveUpdateJobsIndex) => set({ liveUpdateJobsIndex }),

      setKeyboardNavEnabled: (keyboardNavEnabled) => set({ keyboardNavEnabled }),

      setCustomKeyBinding: (action, key) =>
        set((state) => ({
          customKeyBindings: { ...state.customKeyBindings, [action]: key },
        })),
    }),
    {
      name: 'nomad-settings',
    }
  )
)

export type { LogMode, SettingsState, SettingsActions }
