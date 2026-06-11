import { useParams } from 'react-router-dom'
import { usePlugin } from '@/api/hooks/use-csi'
import { PageLayout } from '@/components/layout/page-layout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DataTable, type Column } from '@/components/ui/data-table'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useNavigate } from 'react-router-dom'
import type { CSIPlugin, CSINodeInfo } from '@/api/types/csi'

export function PluginDetailPage() {
  const { pluginId } = useParams<{ pluginId: string }>()
  const navigate = useNavigate()
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
        <p className="text-sm text-neutral-500">Plugin {pluginId} could not be found.</p>
      </PageLayout>
    )
  }

  const nodeColumns: Column<CSINodeInfo>[] = [
    { key: 'NodeID', header: 'Node ID', render: (row) => (row.NodeID as string).slice(0, 8) },
    { key: 'MaxVolumes', header: 'Max Volumes' },
    {
      key: 'AccessibleTopology',
      header: 'Topology',
      render: (row) => {
        const segments = row.AccessibleTopology?.Segments
        if (!segments) return '—'
        return Object.entries(segments).map(([k, v]) => `${k}=${v}`).join(', ')
      },
    },
  ]

  return (
    <PageLayout title={plugin.ID} subtitle="CSI Plugin">
      <Card title="Plugin Information" className="mb-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-neutral-500">ID</p>
            <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">{plugin.ID}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">Provider</p>
            <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">{plugin.Provider}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">Version</p>
            <p className="mt-1 text-sm">
              <Badge variant="info" size="sm">{plugin.ProviderVersion || '—'}</Badge>
            </p>
          </div>
        </div>
      </Card>

      <Card title="Controller Capabilities" className="mb-6">
        {plugin.ControllerInfo ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <CapabilityItem label="Attach" supported={plugin.ControllerInfo.SupportsAttach} />
            <CapabilityItem label="ReadOnly Attach" supported={plugin.ControllerInfo.SupportsReadOnlyAttach} />
            <CapabilityItem label="Detach" supported={plugin.ControllerInfo.SupportsDetach} />
            <CapabilityItem label="Multi Node" supported={plugin.ControllerInfo.SupportsMultiNode} />
            <CapabilityItem label="Expand" supported={plugin.ControllerInfo.SupportsExpand} />
            <CapabilityItem label="External Attach" supported={plugin.ControllerInfo.RequiresExternalAttach} />
          </div>
        ) : (
          <p className="text-sm text-neutral-500">No controller info available.</p>
        )}
      </Card>

      <Card title="Nodes" subtitle={`${plugin.NodeInfo?.length ?? 0} nodes`}>
        {(!plugin.NodeInfo || plugin.NodeInfo.length === 0) ? (
          <p className="text-sm text-neutral-500">No nodes running this plugin.</p>
        ) : (
          <DataTable
            data={plugin.NodeInfo}
            columns={nodeColumns}
            onRowClick={(row) => navigate(`/clients/${row.NodeID}`)}
            rowIdKey="NodeID"
          />
        )}
      </Card>
    </PageLayout>
  )
}

function CapabilityItem({ label, supported }: { label: string; supported: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 rounded-full ${supported ? 'bg-success-500' : 'bg-neutral-300 dark:bg-neutral-600'}`}
      />
      <span className="text-sm text-neutral-700 dark:text-neutral-300">{label}</span>
    </div>
  )
}
