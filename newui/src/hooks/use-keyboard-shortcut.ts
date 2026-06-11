import { useEffect, useState, useCallback, useRef } from 'react'

interface UseKeyboardShortcutOptions {
  enabled?: boolean
  preventDefault?: boolean
}

function parseCombo(combo: string): { key: string; ctrl: boolean; meta: boolean; shift: boolean; alt: boolean } {
  const parts = combo.toLowerCase().split('+')
  let key = ''
  let ctrl = false
  let meta = false
  let shift = false
  let alt = false

  for (const part of parts) {
    switch (part) {
      case 'ctrl':
      case 'control':
        ctrl = true
        break
      case 'meta':
      case 'cmd':
      case 'command':
        meta = true
        break
      case 'shift':
        shift = true
        break
      case 'alt':
      case 'option':
        alt = true
        break
      default:
        key = part
    }
  }

  return { key, ctrl, meta, shift, alt }
}

export function useKeyboardShortcut(
  combo: string,
  callback: (e: KeyboardEvent) => void,
  options: UseKeyboardShortcutOptions = {}
) {
  const { enabled = true, preventDefault = true } = options
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  const [isActive, setIsActive] = useState(enabled)

  const handler = useCallback(
    (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
        return
      }

      const parsed = parseCombo(combo)
      const keyMatch = e.key.toLowerCase() === parsed.key
      const matches = keyMatch && e.ctrlKey === parsed.ctrl && e.metaKey === parsed.meta && e.shiftKey === parsed.shift && e.altKey === parsed.alt

      if (matches) {
        if (preventDefault) {
          e.preventDefault()
        }
        callbackRef.current(e)
      }
    },
    [combo, preventDefault]
  )

  useEffect(() => {
    setIsActive(enabled)
  }, [enabled])

  useEffect(() => {
    if (!isActive) return
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isActive, handler])

  return { enabled: isActive, setEnabled: setIsActive }
}
