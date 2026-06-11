import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/stores/auth-store'
import { setAuthToken, getAuthToken } from '@/api/client'

describe('auth-store', () => {
  beforeEach(() => {
    useAuthStore.setState({
      token: null,
      tokenExpiry: null,
      selfToken: null,
      policies: [],
      oidcAuthMethod: null,
      isLoading: false,
      error: null,
    })
    setAuthToken(null)
  })

  it('has correct initial state', () => {
    const state = useAuthStore.getState()

    expect(state.token).toBeNull()
    expect(state.tokenExpiry).toBeNull()
    expect(state.selfToken).toBeNull()
    expect(state.policies).toEqual([])
    expect(state.oidcAuthMethod).toBeNull()
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it('setToken updates state and calls setAuthToken', () => {
    const testToken = 'test-token-123'
    useAuthStore.getState().setToken(testToken)

    const state = useAuthStore.getState()
    expect(state.token).toBe(testToken)
    expect(state.error).toBeNull()
    expect(getAuthToken()).toBe(testToken)
  })

  it('clearToken resets state', () => {
    useAuthStore.getState().setToken('some-token')
    useAuthStore.getState().clearToken()

    const state = useAuthStore.getState()
    expect(state.token).toBeNull()
    expect(state.tokenExpiry).toBeNull()
    expect(state.selfToken).toBeNull()
    expect(state.policies).toEqual([])
    expect(state.oidcAuthMethod).toBeNull()
    expect(state.error).toBeNull()
    expect(getAuthToken()).toBeNull()
  })

  it('persist only stores token', () => {
    const stored = localStorage.getItem('nomad-auth')
    if (stored) {
      const parsed = JSON.parse(stored)
      expect(Object.keys(parsed.state)).toEqual(['token'])
    }
    useAuthStore.getState().setToken('my-token')
    const afterSet = localStorage.getItem('nomad-auth')
    const parsedAfter = JSON.parse(afterSet!)
    expect(Object.keys(parsedAfter.state)).toEqual(['token'])
    expect(parsedAfter.state.token).toBe('my-token')
  })
})
