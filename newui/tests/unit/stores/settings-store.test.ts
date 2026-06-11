import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from '@/stores/settings-store'

describe('settings-store', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      pageSize: 25,
      logMode: 'streaming',
      liveUpdateJobsIndex: true,
      keyboardNavEnabled: false,
      customKeyBindings: {},
    })
  })

  it('has correct initial state', () => {
    const state = useSettingsStore.getState()

    expect(state.pageSize).toBe(25)
    expect(state.logMode).toBe('streaming')
    expect(state.liveUpdateJobsIndex).toBe(true)
    expect(state.keyboardNavEnabled).toBe(false)
    expect(state.customKeyBindings).toEqual({})
  })

  it('setPageSize updates pageSize', () => {
    useSettingsStore.getState().setPageSize(50)
    expect(useSettingsStore.getState().pageSize).toBe(50)
  })

  it('setLogMode updates logMode', () => {
    useSettingsStore.getState().setLogMode('head')
    expect(useSettingsStore.getState().logMode).toBe('head')
  })

  it('setLiveUpdateJobsIndex updates liveUpdateJobsIndex', () => {
    useSettingsStore.getState().setLiveUpdateJobsIndex(false)
    expect(useSettingsStore.getState().liveUpdateJobsIndex).toBe(false)
  })

  it('setKeyboardNavEnabled updates keyboardNavEnabled', () => {
    useSettingsStore.getState().setKeyboardNavEnabled(true)
    expect(useSettingsStore.getState().keyboardNavEnabled).toBe(true)
  })

  it('setCustomKeyBinding adds key binding', () => {
    useSettingsStore.getState().setCustomKeyBinding('navigate', 'j')
    expect(useSettingsStore.getState().customKeyBindings.navigate).toBe('j')
  })

  it('persists to localStorage', () => {
    useSettingsStore.getState().setPageSize(100)
    const stored = localStorage.getItem('nomad-settings')
    expect(stored).not.toBeNull()
    const parsed = JSON.parse(stored!)
    expect(parsed.state.pageSize).toBe(100)
  })
})
