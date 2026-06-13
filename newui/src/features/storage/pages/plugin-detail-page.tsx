import { useMemo } from 'react'
import { useParams, NavLink } from 'react-router-dom'
import { usePlugin } from '@/api/hooks/use-csi'
import { PageLayout } from '@/components/layout/page-layout'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/ui/data-table'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils'
import type { CSIPlugin, AllocListStub } from '@/api/types/csi'

function healthPercent(healthy: number, expected: number): number {
  if (expected === 0) return 0
  return Math.round((healthy / expected) * 100)
}

function GaugeChart({ label, healthy, expected }: { label: string; healthy: number; expected: number }) {
  const pct = healthPercent(healthy, expected)
  const isHealthy = healthy >= expected && expected > 0
  const circumference = 2 * Math.PI * 40
  const offset = circumference - (pct / 100) * circumference

  return (
    <Card className="flex flex-col items-center py-6">
      <p className="mb-4 text-sm font-medium text-neutral-600 dark:text-neutral-400">{label}</p>
      <div className="relative h-24 w-24">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-neutral-200 dark:text-neutral-700"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-500',
              isHealthy ? 'text-green-500' : 'text-red-500'
            )}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn('text-lg font-bold', isHealthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
            {pct}%
          </span>
        </div>
      </div>
      <p className="mt-3 text-xs text-neutral-500 dark:text-neutral-400">
        {healthy} / {expected} available
      </p>
    </Card>
  )
}

const allocColumns: Column<AllocListStub>[] = [
  {
    key: 'ID',
    header: 'ID',
    render: (row) => (
      <NavLink
        to={`/allocations/${row.ID}`}
        className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        onClick={(e) => e.stopPropagation()}
      >
        {row.ID.slice(0, 8)}
      </NavLink>
    ),
  },
  {
    key: 'NodeID',
    header: 'Node',
    render: (row) => (
      <NavLink
        to={`/clients/${row.NodeID}`}
        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        onClick={(e) => e.stopPropagation()}
      >
        {row.NodeName || row.NodeID.slice(0, 8)}
      </NavLink>
    ),
  },
  { key: 'JobID', header: 'Job' },
  {
    key: 'ClientStatus',
    header: 'Status',
    render: (row) => {
      const s = row.ClientStatus || ''
      const variant =
        s === 'running' ? 'success' :
        s === 'pending' ? 'warning' :
        s === 'failed' || s === 'lost' ? 'danger' : 'neutral'
      return (
        <span className={cn(
          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
          variant === 'success' && 'bg-success-50 text-success-700 dark:bg-success-900/30 dark:text-success-400',
          variant === 'warning' && 'bg-warning-50 text-warning-700 dark:bg-warning-900/30 dark:text-warning-400',
          variant === 'danger' && 'bg-danger-50 text-danger-700 dark:bg-danger-900/30 dark:text-danger-400',
          variant === 'neutral' && 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300',
        )}>
          {s}
        </span>
      )
    },
  },
]

const MAX_ALLOC_ROWS = 10

export function PluginDetailPage() {
  const { pluginId } = useParams<{ pluginId: string }>()
  const { data, isLoading } = usePlugin(pluginId!)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const plugin = data?.data as CSIPlugin | undefined
  if (!plugin) {
    return (
      <PageLayout title="Plugin Not Found">
        <p className="text-sm text-neutral-500 dark:text-neutral-400">Plugin {pluginId} could not be found.</p>
      </PageLayout>
    )
  }

  const controllerAllocs = useMemo(() => {
    if (!plugin.Allocations?.length) return []
    const controllerNodeIds = Object.keys(plugin.Controllers || {})
    return plugin.Allocations.filter((a) => controllerNodeIds.includes(a.NodeID))
  }, [plugin])

  const nodeAllocs = useMemo(() => {
    if (!plugin.Allocations?.length) return []
    const nodeIds = Object.keys(plugin.Nodes || {})
    return plugin.Allocations.filter((a) => nodeIds.includes(a.NodeID))
  }, [plugin])

  const hasControllerData = plugin.ControllerRequired || plugin.ControllersExpected > 0

  return (
    <PageLayout title={plugin.ID}>
      <div className="space-y-6">
        <nav className="flex gap-6 border-b border-neutral-200 pb-2 dark:border-neutral-800">
          <span className="border-b-2 border-primary-500 pb-2 text-sm font-medium text-primary-600 dark:text-primary-400">
            Overview
          </span>
          <NavLink
            to={`/storage/plugins/${plugin.ID}#allocations`}
            className="pb-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            Allocations
          </NavLink>
        </nav>

        <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Controller Health</dt>
              <dd className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
                {hasControllerData ? (
                  <>
                    {healthPercent(plugin.ControllersHealthy, plugin.ControllersExpected)}%{' '}
                    <span className="text-neutral-500">({plugin.ControllersHealthy}/{plugin.ControllersExpected})</span>
                  </>
                ) : (
                  <span className="italic text-neutral-400">N/A</span>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Node Health</dt>
              <dd className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">
                {healthPercent(plugin.NodesHealthy, plugin.NodesExpected)}%{' '}
                <span className="text-neutral-500">({plugin.NodesHealthy}/{plugin.NodesExpected})</span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Provider</dt>
              <dd className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">{plugin.Provider || '—'}</dd>
            </div>
          </dl>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {hasControllerData && (
            <GaugeChart
              label="Controller Health"
              healthy={plugin.ControllersHealthy}
              expected={plugin.ControllersExpected}
            />
          )}
          <GaugeChart
            label="Node Health"
            healthy={plugin.NodesHealthy}
            expected={plugin.NodesExpected}
          />
        </div>

        {controllerAllocs.length > 0 && (
          <Card title={`Controller Allocations (${controllerAllocs.length} total)`}>
            <DataTable
              data={controllerAllocs.slice(0, MAX_ALLOC_ROWS)}
              columns={allocColumns}
              rowIdKey="ID"
            />
            {controllerAllocs.length > MAX_ALLOC_ROWS && (
              <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
                <NavLink
                  to={`/storage/plugins/${plugin.ID}#allocations`}
                  className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400"
                >
                  View all {controllerAllocs.length} controller allocations →
                </NavLink>
              </div>
            )}
          </Card>
        )}

        {nodeAllocs.length > 0 && (
          <Card title={`Node Allocations (${nodeAllocs.length} total)`}>
            <DataTable
              data={nodeAllocs.slice(0, MAX_ALLOC_ROWS)}
              columns={allocColumns}
              rowIdKey="ID"
            />
            {nodeAllocs.length > MAX_ALLOC_ROWS && (
              <div className="mt-3 border-t border-neutral-200 pt-3 dark:border-neutral-800">
                <NavLink
                  to={`/storage/plugins/${plugin.ID}#allocations`}
                  className="text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400"
                >
                  View all {nodeAllocs.length} node allocations →
                </NavLink>
              </div>
            )}
          </Card>
        )}

        {!controllerAllocs.length && !nodeAllocs.length && (
          <Card>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              No allocations are using this plugin.
            </p>
          </Card>
        )}
      </div>
    </PageLayout>
  )
}
