import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from '@/hooks/use-local-storage'

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('reads initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('default')
  })

  it('reads existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'))
    const { result } = renderHook(() => useLocalStorage('test-key', 'default'))
    expect(result.current[0]).toBe('stored-value')
  })

  it('setValue updates state and localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'))

    act(() => {
      result.current[1]('updated')
    })

    expect(result.current[0]).toBe('updated')
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('updated')
  })

  it('handles JSON serialization for objects', () => {
    const { result } = renderHook(() => useLocalStorage('obj-key', { count: 0 }))

    act(() => {
      result.current[1]({ count: 5 })
    })

    expect(result.current[0]).toEqual({ count: 5 })
    expect(JSON.parse(localStorage.getItem('obj-key')!)).toEqual({ count: 5 })
  })

  it('handles functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('fn-key', 10))

    act(() => {
      result.current[1]((prev) => prev + 5)
    })

    expect(result.current[0]).toBe(15)
  })
})
