import { useRef, useEffect, useState, useCallback } from 'react'
import type { Allocation } from '@/api/types'
import type { NodeListStub } from '@/api/types/node'
import { scaleLinear } from 'd3-scale'
import { TopoDatacenter } from './datacenter'
import { EdgeOverlay } from './edge-overlay'

interface TopoVizProps {
  nodes: NodeListStub[]
  allocations: Allocation[]
}

function groupByDatacenter(nodes: NodeListStub[]): Map<string, NodeListStub[]> {
  const groups = new Map<string, NodeListStub[]>()
  for (const node of nodes) {
    const dc = node.Datacenter || 'dc1'
    const existing = groups.get(dc) ?? []
    existing.push(node)
    groups.set(dc, existing)
  }
  return groups
}

function coefficientOfVariation(values: number[]): number {
  if (values.length === 0) return 0
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  if (mean === 0) return 0
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance) / mean
}

export function TopoViz({ nodes, allocations }: TopoVizProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedAllocId, setSelectedAllocId] = useState<string | undefined>()
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null)

  const dcGroups = groupByDatacenter(nodes)

  const nodeCounts = Array.from(dcGroups.values()).map((ns) => ns.length)
  const cv = coefficientOfVariation(nodeCounts)
  const useDoubleColumn = cv > 0.5 && dcGroups.size > 1

  const maxNodeCount = Math.max(...nodeCounts, 1)
  const heightScale = scaleLinear().domain([0, maxNodeCount]).range([100, 400])

  const allocsByNode = new Map<string, Allocation[]>()
  for (const alloc of allocations) {
    const existing = allocsByNode.get(alloc.NodeID) ?? []
    existing.push(alloc)
    allocsByNode.set(alloc.NodeID, existing)
  }

  const selectedAlloc = allocations.find((a) => a.ID === selectedAllocId)
  const relatedPaths: string[] = []
  if (selectedAlloc) {
    relatedPaths.push(selectedAlloc.NodeID)
    const sameJob = allocations.filter(
      (a) => a.JobID === selectedAlloc.JobID && a.ID !== selectedAlloc.ID
    )
    for (const a of sameJob) {
      if (!relatedPaths.includes(a.NodeID)) {
        relatedPaths.push(a.NodeID)
      }
    }
  }

  const updateRect = useCallback(() => {
    if (containerRef.current) {
      setContainerRect(containerRef.current.getBoundingClientRect())
    }
  }, [])

  useEffect(() => {
    updateRect()
    const observer = new ResizeObserver(updateRect)
    if (containerRef.current) {
      observer.observe(containerRef.current)
    }
    return () => observer.disconnect()
  }, [updateRect])

  const dcs = Array.from(dcGroups.entries())
  const midpoint = Math.ceil(dcs.length / 2)
  const leftColumn = useDoubleColumn ? dcs.slice(0, midpoint) : dcs
  const rightColumn = useDoubleColumn ? dcs.slice(midpoint) : []

  return (
    <div ref={containerRef} className="relative w-full">
      <div className={cn('grid gap-4', useDoubleColumn ? 'grid-cols-2' : 'grid-cols-1')}>
        <div className="space-y-4">
          {leftColumn.map(([dcName, dcNodes]) => (
            <TopoDatacenter
              key={dcName}
              name={dcName}
              nodes={dcNodes}
              allocations={allocations}
              allocsByNode={allocsByNode}
              heightScale={heightScale}
              selectedAllocId={selectedAllocId}
              onSelectAllocation={(alloc) =>
                setSelectedAllocId((prev) => (prev === alloc.ID ? undefined : alloc.ID))
              }
            />
          ))}
        </div>
        {useDoubleColumn && (
          <div className="space-y-4">
            {rightColumn.map(([dcName, dcNodes]) => (
              <TopoDatacenter
                key={dcName}
                name={dcName}
                nodes={dcNodes}
                allocations={allocations}
                allocsByNode={allocsByNode}
                heightScale={heightScale}
                selectedAllocId={selectedAllocId}
                onSelectAllocation={(alloc) =>
                  setSelectedAllocId((prev) => (prev === alloc.ID ? undefined : alloc.ID))
                }
              />
            ))}
          </div>
        )}
      </div>
      {selectedAlloc && containerRect && (
        <EdgeOverlay
          paths={relatedPaths}
          containerRef={containerRef}
        />
      )}
    </div>
  )
}

function cn(...args: (string | boolean | undefined)[]) {
  return args.filter(Boolean).join(' ')
}
