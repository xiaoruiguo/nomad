import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVisibility } from '@/hooks/use-visibility'

describe('useVisibility', () => {
  beforeEach(() => {
    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      writable: true,
      configurable: true,
    })
  })

  it('returns true when visible', () => {
    Object.defineProperty(document, 'visibilityState', { value: 'visible', writable: true, configurable: true })
    const { result } = renderHook(() => useVisibility())
    expect(result.current).toBe(true)
  })

  it('returns false when hidden', () => {
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true, configurable: true })
    const { result } = renderHook(() => useVisibility())
    expect(result.current).toBe(false)
  })

  it('updates on visibilitychange event', () => {
    const { result } = renderHook(() => useVisibility())
    expect(result.current).toBe(true)

    act(() => {
      Object.defineProperty(document, 'visibilityState', { value: 'hidden', writable: true, configurable: true })
      document.dispatchEvent(new Event('visibilitychange'))
    })

    expect(result.current).toBe(false)
  })
})
