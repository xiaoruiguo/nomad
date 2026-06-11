import { useNavigate } from 'react-router-dom'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import type { Evaluation } from '@/api/types/evaluation'
import { truncateMiddle, formatTime } from '@/lib/utils'
import { cn } from '@/lib/utils'

const STATUS_VARIANT_MAP: Record<string, 'success' | 'warning' | 'danger' | 'neutral' | 'info'> = {
  complete: 'success',
  failed: 'danger',
  canceled: 'neutral',
  pending: 'warning',
  blocked: 'info',
  running: 'info',
}

const TRIGGER_LABELS: Record<string, string> = {
  'job-register': 'Job Register',
  'job-deregister': 'Job Deregister',
  'periodic-job': 'Periodic Job',
  'node-drain': 'Node Drain',
  'node-update': 'Node Update',
  'alloc-failure': 'Alloc Failure',
  'reconnect': 'Reconnect',
  'rolling-update': 'Rolling Update',
  'scaling': 'Scaling',
  'deployment-watcher': 'Deployment Watcher',
  'failed-follow-up': 'Failed Follow-up',
  'max-plan-timeout': 'Max Plan Timeout',
}

interface JobEvaluationTableProps {
  evaluations: Evaluation[]
  className?: string
}

export function JobEvaluationTable({ evaluations, className }: JobEvaluationTableProps) {
  const navigate = useNavigate()

  const columns: Column<Evaluation>[] = [
    {
      key: 'ID',
      header: 'ID',
      sortable: true,
      width: '140px',
      render: (eval_) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/evaluations/${eval_.ID}`)
          }}
          className="font-mono text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          {truncateMiddle(eval_.ID, 12)}
        </button>
      ),
    },
    {
      key: 'Type',
      header: 'Type',
      sortable: true,
      width: '100px',
      render: (eval_) => (
        <span className="text-sm text-neutral-700 dark:text-neutral-300">{eval_.Type}</span>
      ),
    },
    {
      key: 'TriggeredBy',
      header: 'Triggered By',
      sortable: true,
      width: '180px',
      render: (eval_) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">
          {TRIGGER_LABELS[eval_.TriggeredBy] ?? eval_.TriggeredBy}
        </span>
      ),
    },
    {
      key: 'Status',
      header: 'Status',
      sortable: true,
      width: '110px',
      render: (eval_) => (
        <Badge variant={STATUS_VARIANT_MAP[eval_.Status?.toLowerCase()] ?? 'neutral'} size="sm">
          {eval_.Status}
        </Badge>
      ),
    },
    {
      key: 'Priority',
      header: 'Priority',
      sortable: true,
      width: '90px',
      render: (eval_) => (
        <span className="text-sm text-neutral-600 dark:text-neutral-400">{eval_.Priority}</span>
      ),
    },
    {
      key: 'CreateTime',
      header: 'Time',
      sortable: true,
      width: '130px',
      render: (eval_) => (
        <span className="text-sm text-neutral-500 dark:text-neutral-400">
          {eval_.CreateTime ? formatTime(new Date(eval_.CreateTime / 1000000).toISOString()) : '-'}
        </span>
      ),
    },
  ]

  return (
    <div className={cn(className)}>
      <DataTable<Evaluation & Record<string, unknown>>
        data={evaluations as (Evaluation & Record<string, unknown>)[]}
        columns={columns as Column<Evaluation & Record<string, unknown>>[]}
        onRowClick={(row) => navigate(`/evaluations/${(row as Evaluation).ID}`)}
        emptyMessage="No evaluations found"
        rowIdKey="ID"
      />
    </div>
  )
}
