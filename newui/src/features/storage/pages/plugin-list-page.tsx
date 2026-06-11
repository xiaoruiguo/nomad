import { useNavigate } from 'react-router-dom'
import { usePlugins } from '@/api/hooks/use-csi'
import { PageLayout } from '@/components/layout/page-layout'
import { DataTable, type Column } from '@/components/ui/data-table'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import type { CSIPlugin } from '@/api/types/csi'

const columns: Column<CSIPlugin>[] = [
  { key: 'ID', header: 'ID', sortable: true },
  { key: 'Provider', header: 'Provider', sortable: true },
  { key: 'ProviderVersion', header: 'Version', sortable: true },
  {
    key: 'ControllersHealthy',
    header: 'Controllers Healthy',
    render: (row) => {
      const healthy = row.ControllerInfo ? 1 : 0
      return <Badge variant={healthy > 0 ? 'success' : 'danger'} size="sm">{healthy}</Badge>
    },
  },
  {
    key: 'NodesHealthy',
    header: 'Nodes Healthy',
    render: (row) => {
      const count = row.NodeInfo?.length ?? 0
      return <Badge variant={count > 0 ? 'success' : 'danger'} size="sm">{count}</Badge>
    },
  },
]

export function PluginListPage() {
  const navigate = useNavigate()
  const { data, isLoading } = usePlugins()

  const plugins = (data?.data ?? []) as CSIPlugin[]

  return (
    <PageLayout title="CSI Plugins" subtitle="Container Storage Interface plugins">
      {plugins.length === 0 && !isLoading ? (
        <EmptyState title="No CSI plugins found" description="No CSI plugins are registered in the cluster." />
      ) : (
        <DataTable
          data={plugins}
          columns={columns}
          onRowClick={(row) => navigate(`/storage/plugins/${row.ID}`)}
          loading={isLoading}
          rowIdKey="ID"
        />
      )}
    </PageLayout>
  )
}
