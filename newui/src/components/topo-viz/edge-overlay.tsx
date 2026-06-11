import { useEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { line, curveBasis } from 'd3-shape'

interface EdgeOverlayProps {
  paths: string[]
  containerRef: RefObject<HTMLDivElement | null>
}

export function EdgeOverlay({ paths, containerRef }: EdgeOverlayProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [containerRef])

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return

    const containerRect = containerRef.current.getBoundingClientRect()
    const nodeElements = containerRef.current.querySelectorAll('[data-node-id]')
    const nodeRects = new Map<string, DOMRect>()

    for (const el of nodeElements) {
      const id = el.getAttribute('data-node-id')
      if (id && paths.includes(id)) {
        nodeRects.set(id, el.getBoundingClientRect())
      }
    }

    const lineGen = line<{ x: number; y: number }>()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(curveBasis)

    const pathElements = svgRef.current.querySelectorAll<SVGPathElement>('path.edge-path')
    let pathIndex = 0

    const centers: { x: number; y: number }[] = []
    for (const [, rect] of nodeRects) {
      centers.push({
        x: rect.left + rect.width / 2 - containerRect.left,
        y: rect.top + rect.height / 2 - containerRect.top,
      })
    }

    for (let i = 0; i < centers.length; i++) {
      for (let j = i + 1; j < centers.length; j++) {
        const ci = centers[i]
        const cj = centers[j]
        if (!ci || !cj) continue

        const midX = (ci.x + cj.x) / 2
        const midY = (ci.y + cj.y) / 2 - 30

        const pathData = lineGen([
          ci,
          { x: midX, y: midY },
          cj,
        ])

        const pathEl = pathElements[pathIndex]
        if (pathEl && pathData) {
          pathEl.setAttribute('d', pathData)
        }
        pathIndex++
      }
    }
  }, [paths, size, containerRef])

  const edgeCount = paths.length > 1 ? (paths.length * (paths.length - 1)) / 2 : 0

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0"
      width={size.width}
      height={size.height}
      style={{ zIndex: 10 }}
    >
      {Array.from({ length: edgeCount }, (_, i) => (
        <path
          key={i}
          className="edge-path"
          fill="none"
          stroke="#3b82f6"
          strokeWidth={2}
          strokeDasharray="6 3"
          opacity={0.5}
        />
      ))}
    </svg>
  )
}
