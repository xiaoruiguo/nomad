import { useParams, useNavigate } from 'react-router-dom'
import { useVolume, useDeleteVolume } from '@/api/hooks/use-csi'
import { PageLayout } from '@/components/layout/page-layout'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DataTable, type Column } from '@/components/ui/data-table'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatBytes } from '@/lib/utils'
import type { CSIVolume } from '@/api/types/csi'

export function VolumeDetailPage() {
  const { volumeId } = useParams<{ volumeId: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useVolume(volumeId!)
  const deleteMutation = useDeleteVolume()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const volume = data?.data as CSIVolume | undefined
  if (!volume) {
    return (
      <PageLayout title="Volume Not Found">
        <p className="text-sm text-neutral-500">Volume {volumeId} could not be found.</p>
      </PageLayout>
    )
  }

  const readAllocIds = Object.keys(volume.ReadAllocs || {})
  const writeAllocIds = Object.keys(volume.WriteAllocs || {})

  const handleDelete = async () => {
    await deleteMutation.mutateAsync(volume.ID)
    navigate('/storage/volumes')
  }

  const allocColumns: Column<Record<string, unknown>>[] = [
    { key: 'ID', header: 'Allocation ID', render: (row) => (row.ID as string).slice(0, 8) },
    { key: 'Mode', header: 'Mode' },
  ]

  const readAllocRows = readAllocIds.map((id) => ({ ID: id, Mode: 'read' }))
  const writeAllocRows = writeAllocIds.map((id) => ({ ID: id, Mode: 'write' }))
  const allAllocRows = [...readAllocRows, ...writeAllocRows]

  return (
    <PageLayout
      title={volume.Name}
      subtitle={`Volume ${volume.ID}`}
      actions={
        <div className="flex gap-2">
          <Button variant="danger" onClick={handleDelete} loading={deleteMutation.isPending}>
            Delete
          </Button>
        </div>
      }
    >
      <Card title="Volume Information" className="mb-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <div>
            <p className="text-xs font-medium text-neutral-500">ID</p>
            <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">{volume.ID}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">Name</p>
            <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">{volume.Name}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">Namespace</p>
            <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">{volume.Namespace}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">Plugin</p>
            <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">{volume.Provider || volume.PluginID}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">Capacity</p>
            <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">{volume.Capacity ? formatBytes(volume.Capacity) : '—'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">Access Mode</p>
            <p className="mt-1 text-sm">
              <Badge variant="info" size="sm">{volume.AccessMode || '—'}</Badge>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">Attachment Mode</p>
            <p className="mt-1 text-sm">
              <Badge variant="neutral" size="sm">{volume.AttachmentMode || '—'}</Badge>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">Status</p>
            <p className="mt-1 text-sm">
              <Badge variant={volume.Status === 'healthy' ? 'success' : volume.Status === 'unhealthy' ? 'danger' : 'neutral'} size="sm">
                {volume.Status || 'unknown'}
              </Badge>
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-neutral-500">Controller Required</p>
            <p className="mt-1 text-sm text-neutral-900 dark:text-neutral-100">{volume.ControllerRequired ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </Card>

      {volume.Topology && volume.Topology.length > 0 && (
        <Card title="Topology" className="mb-6">
          <div className="space-y-3">
            {volume.Topology.map((topo, i) => (
              <div key={i} className="rounded-md border border-neutral-200 p-3 dark:border-neutral-800">
                <div className="flex flex-wrap gap-2">
                  {Object.entries(topo.Segments || {}).map(([key, val]) => (
                    <span key={key} className="text-xs">
                      <span className="font-medium text-neutral-500">{key}:</span>{' '}
                      <span className="text-neutral-900 dark:text-neutral-100">{val}</span>
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Allocations" subtitle={`${allAllocRows.length} allocations using this volume`}>
        {allAllocRows.length === 0 ? (
          <p className="text-sm text-neutral-500">No allocations using this volume.</p>
        ) : (
          <DataTable
            data={allAllocRows}
            columns={allocColumns}
            onRowClick={(row) => navigate(`/allocations/${row.ID as string}`)}
            rowIdKey="ID"
          />
        )}
      </Card>
    </PageLayout>
  )
}
