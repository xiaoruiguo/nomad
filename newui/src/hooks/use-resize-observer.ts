import { useState, useEffect, useRef } from 'react'
import type { RefObject } from 'react'

interface Size {
  width: number
  height: number
}

export function useResizeObserver(ref: RefObject<HTMLElement | null>): Size {
  const [size, setSize] = useState<Size>({ width: 0, height: 0 })
  const observerRef = useRef<ResizeObserver | null>(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    observerRef.current = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setSize({ width: Math.floor(width), height: Math.floor(height) })
      }
    })

    observerRef.current.observe(element)

    return () => {
      observerRef.current?.disconnect()
      observerRef.current = null
    }
  }, [ref])

  return size
}
