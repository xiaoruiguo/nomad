import { useAgentMembers, useAgentHealth, useAgentSelf } from '@/api/hooks/use-agent'
import { DataTable } from '@/components/ui/data-table'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Alert } from '@/components/ui/alert'
import type { AgentMember } from '@/api/types/agent'

export function ServerListPage() {
  const { data: membersResp, isLoading: membersLoading, error: membersError, refetch: refetchMembers } = useAgentMembers()
  const { data: healthResp, isLoading: healthLoading } = useAgentHealth()
  const { data: selfResp, isLoading: selfLoading } = useAgentSelf()

  const members = membersResp?.data?.Members ?? []
  const serverMembers = members.filter((m: AgentMember) => m.Tags.Role === 'nomad')
  const leaderAddr = selfResp?.data?.Member?.Addr ?? ''
  const health = healthResp?.data
  const isLoading = membersLoading || healthLoading || selfLoading

  const columns = [
    {
      key: 'Name',
      header: 'Name',
      sortable: true,
      render: (row: AgentMember) => (
        <div className="flex items-center gap-2">
          {row.Addr === leaderAddr && (
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-primary-100 text-[10px] font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              L
            </span>
          )}
          <span className="font-medium">{row.Name}</span>
        </div>
      ),
    },
    {
      key: 'Address',
      header: 'Address',
      render: (row: AgentMember) => (
        <span className="font-mono text-xs">{row.Addr}:{row.Port}</span>
      ),
    },
    {
      key: 'Status',
      header: 'Status',
      width: '120px',
      sortable: true,
      render: (row: AgentMember) => (
        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
          row.Status === 'alive'
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : row.Status === 'failed'
            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
        }`}>
          {row.Status}
        </span>
      ),
    },
    {
      key: 'Leader',
      header: 'Leader',
      width: '80px',
      render: (row: AgentMember) => (
        <span className={row.Addr === leaderAddr ? 'text-green-600' : 'text-neutral-400'}>
          {row.Addr === leaderAddr ? 'Yes' : '-'}
        </span>
      ),
    },
    {
      key: 'Region',
      header: 'Region',
      width: '90px',
      sortable: true,
      render: (row: AgentMember) => row.Tags.Region,
    },
    {
      key: 'Datacenter',
      header: 'DC',
      width: '70px',
      sortable: true,
      render: (row: AgentMember) => row.Tags.Datacenter,
    },
    {
      key: 'Version',
      header: 'Version',
      width: '90px',
      sortable: true,
      render: (row: AgentMember) => (
        <span className="font-mono text-xs">{row.Tags.Build}</span>
      ),
    },
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Servers</h1>
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (membersError) {
    return (
      <div className="space-y-6">
        <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">Servers</h1>
        <Alert variant="danger">
          Failed to load server data: {(membersError as Error).message}
          <button
            type="button"
            onClick={() => refetchMembers()}
            className="ml-2 underline"
          >
            Retry
          </button>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
        Servers
      </h1>

      {health && (
        <div className="grid grid-cols-3 gap-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Server</p>
            <p className={`mt-1 text-sm font-medium ${health.Server?.ok ? 'text-green-600' : 'text-red-600'}`}>
              {health.Server?.ok ? 'Healthy' : health.Server?.message || 'Unhealthy'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Serf</p>
            <p className={`mt-1 text-sm font-medium ${health.Serf?.ok ? 'text-green-600' : 'text-neutral-400'}`}>
              {health.Serf?.message || health.Serf?.ok === false ? 'Failed' : '-'}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Raft</p>
            <p className={`mt-1 text-sm font-medium ${health.Raft?.ok ? 'text-green-600' : 'text-neutral-400'}`}>
              {health.Raft?.message || health.Raft?.ok === false ? 'Failed' : '-'}
            </p>
          </div>
        </div>
      )}

      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Monitor Nomad server nodes and Raft status.
      </p>

      <DataTable<AgentMember>
        data={serverMembers}
        columns={columns}
        emptyMessage="No servers found"
        loading={membersLoading}
      />

      {members.length > serverMembers.length && (
        <div className="space-y-3">
          <h2 className="text-base font-semibold">Other Cluster Members ({members.length - serverMembers.length})</h2>
          <div className="overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Address</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {members.filter(m => m.Tags.Role !== 'nomad').map((m) => (
                  <tr key={m.Name} className="border-b border-neutral-100 last:border-0 dark:border-neutral-800">
                    <td className="px-4 py-3 text-sm font-medium">{m.Name}</td>
                    <td className="px-4 py-3 text-sm font-mono text-xs">{m.Addr}:{m.Port}</td>
                    <td className="px-4 py-3 text-sm">{m.Tags.Role}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        m.Status === 'alive'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {m.Status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
