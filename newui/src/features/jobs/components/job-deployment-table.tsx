import { useNavigate } from 'react-router-dom'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useFailDeployment, usePauseDeployment, usePromoteDeployment } from '@/api/hooks'
import type { Deployment } from '@/api/types/deployment'
import { formatTime, truncateMiddle } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_VARIANT_MAP: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  running: 'info',
  successful: 'success',
  failed: 'danger',
  cancelled: 'neutral',
  paused: 'warning',
}

interface JobDeploymentTableProps {
  deployments: Deployment[]
  className?: string
}

export function JobDeploymentTable({ deployments, className }: JobDeploymentTableProps) {
  const navigate = useNavigate()
  const failDeployment = useFailDeployment()
  const pauseDeployment = usePauseDeployment()
  const promoteDeployment = usePromoteDeployment()

  const columns: Column<Deployment>[] = [
    {
      key: 'ID',
      header: 'ID',
      sortable: true,
      width: '140px',
      render: (dep) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/deployments/${dep.ID}`)
          }}
          className="font-mono text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          {truncateMiddle(dep.ID, 12)}
        </button>
      ),
    },
    {
      key: 'JobVersion',
      header: 'Version',
      sortable: true,
      width: '90px',
      render: (dep) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{dep.JobVersion}</span>
      ),
    },
    {
      key: 'Status',
      header: 'Status',
      sortable: true,
      width: '120px',
      render: (dep) => (
        <Badge variant={STATUS_VARIANT_MAP[dep.Status?.toLowerCase()] ?? 'neutral'} size="sm">
          {dep.Status}
        </Badge>
      ),
    },
    {
      key: 'StatusDescription',
      header: 'Description',
      render: (dep) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {dep.StatusDescription || '-'}
        </span>
      ),
    },
    {
      key: 'ModifyTime',
      header: 'Time',
      sortable: true,
      width: '130px',
      render: (dep) => (
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {dep.ModifyTime ? formatTime(new Date(dep.ModifyTime / 1000000).toISOString()) : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '200px',
      render: (dep) => {
        const isRunning = dep.Status?.toLowerCase() === 'running'
        const isPaused = dep.Status?.toLowerCase() === 'paused'
        const requiresPromotion = dep.RequiresExplicitPromotion
        return (
          <div className="flex items-center gap-1">
            {isRunning && requiresPromotion && (
              <Button
                variant="primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  promoteDeployment.mutate({ id: dep.ID, request: { DeployID: dep.ID, Groups: [] } })
                }}
                loading={promoteDeployment.isPending}
              >
                Promote
              </Button>
            )}
            {isRunning && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  pauseDeployment.mutate({ id: dep.ID, request: { DeployID: dep.ID, Pause: true } })
                }}
                loading={pauseDeployment.isPending}
              >
                Pause
              </Button>
            )}
            {isPaused && (
              <Button
                variant="secondary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  pauseDeployment.mutate({ id: dep.ID, request: { DeployID: dep.ID, Pause: false } })
                }}
                loading={pauseDeployment.isPending}
              >
                Resume
              </Button>
            )}
            {(isRunning || isPaused) && (
              <Button
                variant="danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  failDeployment.mutate(dep.ID)
                }}
                loading={failDeployment.isPending}
              >
                Fail
              </Button>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className={cn(className)}>
      <DataTable<Deployment & Record<string, unknown>>
        data={deployments as (Deployment & Record<string, unknown>)[]}
        columns={columns as Column<Deployment & Record<string, unknown>>[]}
        onRowClick={(row) => navigate(`/deployments/${(row as Deployment).ID}`)}
        emptyMessage="No deployments found"
        rowIdKey="ID"
      />
    </div>
  )
}
