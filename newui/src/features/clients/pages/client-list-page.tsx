import { Link } from 'react-router-dom'
import { useNodes } from '@/api/hooks/use-nodes'
import { DataTable } from '@/components/ui/data-table'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Alert } from '@/components/ui/alert'
import { formatBytes, statusColor } from '@/lib/utils'
import type { NodeListStub } from '@/api/types/node'

export function ClientListPage() {
  const { data: nodes, isLoading, error, refetch } = useNodes()
  const nodeList: NodeListStub[] = (nodes as NodeListStub[] | undefined) ?? []

  const columns = [
    {
      key: 'Name',
      header: 'Node',
      sortable: true,
      render: (row: NodeListStub) => (
        <Link
          to={`/clients/${row.ID}`}
          className="font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
        >
          {row.Name}
        </Link>
      ),
    },
    {
      key: 'Status',
      header: 'Status',
      width: '120px',
      sortable: true,
      render: (row: NodeListStub) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          row.Status === 'ready'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : row.Status === 'initializing'
            ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {row.Status}
        </span>
      ),
    },
    {
      key: 'Address',
      header: 'Address',
      render: (row: NodeListStub) => (
        <span className="font-mono text-xs">{row.Address}</span>
      ),
    },
    {
      key: 'Datacenter',
      header: 'DC',
      width: '80px',
      sortable: true,
    },
    {
      key: 'Version',
      header: 'Version',
      width: '90px',
      sortable: true,
      render: (row: NodeListStub) => (
        <span className="font-mono text-xs">{row.Version}</span>
      ),
    },
    {
      key: 'SchedulingEligibility',
      header: 'Eligible',
      width: '80px',
      sortable: true,
      render: (row: NodeListStub) => (
        <span className={statusColor(row.SchedulingEligibility)}>
          {row.SchedulingEligibility === 'eligible' ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
      key: 'Drain',
      header: 'Drain',
      width: '70px',
      render: (row: NodeListStub) => (
        <span className={row.Drain ? 'text-orange-600' : 'text-neutral-400'}>
          {row.Drain ? 'Yes' : '-'}
        </span>
      ),
    },
    {
      key: 'NodeResources',
      header: 'Resources',
      render: (row: NodeListStub) => {
        const cpu = row.NodeResources?.Cpu?.CpuShares ?? 0
        const mem = row.NodeResources?.Memory?.MemoryMB ?? 0
        return (
          <div className="text-xs">
            <div>{cpu > 0 ? `${cpu} MHz` : '-'}</div>
            <div className="text-neutral-500">{mem > 0 ? `${formatBytes(mem * 1024 * 1024)}` : '-'}</div>
          </div>
        )
      },
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Clients</h1>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-xl font-semibold">Clients</h1>
        <Alert variant="danger">
          Failed to load client nodes: {(error as Error).message}
          <button
            type="button"
            onClick={() => refetch()}
            className="ml-2 underline"
          >
            Retry
          </button>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        Clients
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Manage and monitor Nomad client nodes.
      </p>
      <DataTable<NodeListStub>
        data={nodeList}
        columns={columns}
        emptyMessage="No client nodes found"
        loading={isLoading}
      />
    </div>
  )
}
