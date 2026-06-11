import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { FilterBar, type FilterConfig } from '@/components/ui/filter-bar'
import type { AllocListStub } from '@/api/types/allocation'
import type { NodeListStub } from '@/api/types/node'
import { truncateMiddle, formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_VARIANT_MAP: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  running: 'success',
  complete: 'info',
  pending: 'warning',
  failed: 'danger',
  lost: 'danger',
  unknown: 'neutral',
}

const HEALTH_VARIANT_MAP: Record<string, 'success' | 'warning' | 'danger' | 'neutral'> = {
  healthy: 'success',
  unhealthy: 'danger',
  repair: 'warning',
}

interface JobAllocationTableProps {
  allocations: AllocListStub[]
  nodes: NodeListStub[]
  className?: string
}

export function JobAllocationTable({ allocations, nodes, className }: JobAllocationTableProps) {
  const navigate = useNavigate()
  const [statusFilter, setStatusFilter] = useState('')
  const [taskGroupFilter, setTaskGroupFilter] = useState('')

  const nodeNameMap = useMemo(() => {
    const map = new Map<string, string>()
    for (const node of nodes) {
      map.set(node.ID, node.Name)
    }
    return map
  }, [nodes])

  const taskGroups = useMemo(() => {
    const groups = new Set<string>()
    for (const alloc of allocations) {
      if (alloc.TaskGroup) groups.add(alloc.TaskGroup)
    }
    return Array.from(groups).sort()
  }, [allocations])

  const filteredAllocations = useMemo(() => {
    let result = allocations
    if (statusFilter) {
      result = result.filter((a) => a.ClientStatus?.toLowerCase() === statusFilter)
    }
    if (taskGroupFilter) {
      result = result.filter((a) => a.TaskGroup === taskGroupFilter)
    }
    return result
  }, [allocations, statusFilter, taskGroupFilter])

  const columns: Column<AllocListStub>[] = [
    {
      key: 'ID',
      header: 'ID',
      sortable: true,
      width: '140px',
      render: (alloc) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/allocations/${alloc.ID}`)
          }}
          className="font-mono text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          {truncateMiddle(alloc.ID, 12)}
        </button>
      ),
    },
    {
      key: 'TaskGroup',
      header: 'Task Group',
      sortable: true,
      width: '140px',
      render: (alloc) => (
        <span className="text-sm text-neutral-700 dark:text-neutral-300">{alloc.TaskGroup}</span>
      ),
    },
    {
      key: 'NodeID',
      header: 'Node',
      sortable: true,
      width: '160px',
      render: (alloc) => {
        const name = alloc.NodeName || nodeNameMap.get(alloc.NodeID) || truncateMiddle(alloc.NodeID, 10)
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              navigate(`/nodes/${alloc.NodeID}`)
            }}
            className="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {name}
          </button>
        )
      },
    },
    {
      key: 'ClientStatus',
      header: 'Status',
      sortable: true,
      width: '110px',
      render: (alloc) => (
        <Badge variant={STATUS_VARIANT_MAP[alloc.ClientStatus?.toLowerCase()] ?? 'neutral'} size="sm">
          {alloc.ClientStatus}
        </Badge>
      ),
    },
    {
      key: 'DeploymentStatus',
      header: 'Health',
      width: '100px',
      render: (alloc) => {
        if (!alloc.DeploymentStatus) return <span className="text-sm text-neutral-400">-</span>
        const healthy = alloc.DeploymentStatus.Healthy
        const variant = healthy === 'true' ? 'success' : healthy === 'false' ? 'danger' : 'neutral'
        const label = healthy === 'true' ? 'Healthy' : healthy === 'false' ? 'Unhealthy' : '-'
        return <Badge variant={HEALTH_VARIANT_MAP[label.toLowerCase()] ?? variant} size="sm">{label}</Badge>
      },
    },
    {
      key: 'JobVersion',
      header: 'Version',
      sortable: true,
      width: '90px',
      render: (alloc) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{alloc.JobVersion}</span>
      ),
    },
    {
      key: 'CreateTime',
      header: 'Created',
      sortable: true,
      width: '120px',
      render: (alloc) => (
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {alloc.CreateTime ? formatTime(new Date(alloc.CreateTime / 1000000).toISOString()) : '-'}
        </span>
      ),
    },
    {
      key: 'ModifyTime',
      header: 'Modified',
      sortable: true,
      width: '120px',
      render: (alloc) => (
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {alloc.ModifyTime ? formatTime(new Date(alloc.ModifyTime / 1000000).toISOString()) : '-'}
        </span>
      ),
    },
  ]

  const filters: FilterConfig[] = [
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      value: statusFilter,
      onChange: (v) => setStatusFilter(v as string),
      options: [
        { value: 'running', label: 'Running' },
        { value: 'complete', label: 'Complete' },
        { value: 'pending', label: 'Pending' },
        { value: 'failed', label: 'Failed' },
        { value: 'lost', label: 'Lost' },
      ],
    },
    {
      key: 'taskGroup',
      label: 'Task Group',
      type: 'select',
      value: taskGroupFilter,
      onChange: (v) => setTaskGroupFilter(v as string),
      options: taskGroups.map((tg) => ({ value: tg, label: tg })),
    },
  ]

  return (
    <div className={cn('space-y-3', className)}>
      <FilterBar filters={filters} />
      <DataTable<AllocListStub & Record<string, unknown>>
        data={filteredAllocations as (AllocListStub & Record<string, unknown>)[]}
        columns={columns as Column<AllocListStub & Record<string, unknown>>[]}
        onRowClick={(row) => navigate(`/allocations/${(row as AllocListStub).ID}`)}
        emptyMessage="No allocations found"
        rowIdKey="ID"
      />
    </div>
  )
}
