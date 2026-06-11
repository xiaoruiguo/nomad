import { create } from 'zustand'

interface KeyboardState {
  activeShortcuts: Map<string, string>
  isListening: boolean
}

interface KeyboardActions {
  registerShortcut: (action: string, key: string, handler: (e: KeyboardEvent) => void) => void
  unregisterShortcut: (action: string) => void
  enableListening: () => void
  disableListening: () => void
}

type KeyboardStore = KeyboardState & KeyboardActions

const handlerMap = new Map<string, (e: KeyboardEvent) => void>()

function parseKeyCombo(combo: string): { key: string; ctrl: boolean; meta: boolean; shift: boolean; alt: boolean } {
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

function matchesCombo(e: KeyboardEvent, combo: string): boolean {
  const parsed = parseKeyCombo(combo)
  const keyMatch = e.key.toLowerCase() === parsed.key
  return keyMatch && e.ctrlKey === parsed.ctrl && e.metaKey === parsed.meta && e.shiftKey === parsed.shift && e.altKey === parsed.alt
}

function handleKeyDown(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
    return
  }

  for (const [action, combo] of useKeyboardStore.getState().activeShortcuts) {
    if (matchesCombo(e, combo)) {
      const handler = handlerMap.get(action)
      if (handler) {
        e.preventDefault()
        handler(e)
        return
      }
    }
  }
}

let listenerAttached = false

function ensureListener() {
  if (!listenerAttached) {
    document.addEventListener('keydown', handleKeyDown)
    listenerAttached = true
  }
}

function removeListener() {
  if (listenerAttached && useKeyboardStore.getState().activeShortcuts.size === 0) {
    document.removeEventListener('keydown', handleKeyDown)
    listenerAttached = false
  }
}

export const useKeyboardStore = create<KeyboardStore>()((set, get) => ({
  activeShortcuts: new Map<string, string>(),
  isListening: false,

  registerShortcut: (action, key, handler) => {
    handlerMap.set(action, handler)
    set((state) => {
      const next = new Map(state.activeShortcuts)
      next.set(action, key)
      return { activeShortcuts: next }
    })
    if (get().isListening) {
      ensureListener()
    }
  },

  unregisterShortcut: (action) => {
    handlerMap.delete(action)
    set((state) => {
      const next = new Map(state.activeShortcuts)
      next.delete(action)
      return { activeShortcuts: next }
    })
    removeListener()
  },

  enableListening: () => {
    set({ isListening: true })
    ensureListener()
  },

  disableListening: () => {
    set({ isListening: false })
    if (listenerAttached) {
      document.removeEventListener('keydown', handleKeyDown)
      listenerAttached = false
    }
  },
}))

export type { KeyboardState, KeyboardActions }
