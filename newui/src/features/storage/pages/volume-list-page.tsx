import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVolumes } from '@/api/hooks/use-csi'
import { PageLayout } from '@/components/layout/page-layout'
import { DataTable, type Column } from '@/components/ui/data-table'
import { FilterBar, type FilterConfig } from '@/components/ui/filter-bar'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import { formatBytes } from '@/lib/utils'
import type { CSIVolume } from '@/api/types/csi'

const columns: Column<CSIVolume>[] = [
  { key: 'Name', header: 'Name', sortable: true },
  { key: 'Namespace', header: 'Namespace', sortable: true },
  { key: 'Provider', header: 'Plugin', sortable: true },
  {
    key: 'Capacity',
    header: 'Capacity',
    sortable: true,
    render: (row) => row.Capacity ? formatBytes(row.Capacity) : '—',
  },
  { key: 'AccessMode', header: 'Access Mode', sortable: true },
  {
    key: 'ReadAllocs',
    header: 'Read Allocs',
    render: (row) => Object.keys(row.ReadAllocs || {}).length,
  },
  {
    key: 'WriteAllocs',
    header: 'Write Allocs',
    render: (row) => Object.keys(row.WriteAllocs || {}).length,
  },
  {
    key: 'Status',
    header: 'Status',
    sortable: true,
    render: (row) => {
      const variant = row.Status === 'healthy' ? 'success' : row.Status === 'unhealthy' ? 'danger' : 'neutral'
      return <Badge variant={variant} size="sm">{row.Status || 'unknown'}</Badge>
    },
  },
]

export function VolumeListPage() {
  const navigate = useNavigate()
  const [namespace, setNamespace] = useState('')
  const [type, setType] = useState('')

  const { data, isLoading } = useVolumes({
    namespace: namespace || undefined,
  })

  const volumes = (data?.data ?? []) as CSIVolume[]
  const filtered = type
    ? volumes.filter((v) => type === 'csi' ? v.ControllerRequired : !v.ControllerRequired)
    : volumes

  const filters: FilterConfig[] = [
    {
      key: 'namespace',
      label: 'Namespace',
      type: 'search',
      value: namespace,
      onChange: (v) => setNamespace(v as string),
    },
    {
      key: 'type',
      label: 'Type',
      type: 'select',
      value: type,
      onChange: (v) => setType(v as string),
      options: [
        { value: 'csi', label: 'CSI' },
        { value: 'host', label: 'Host' },
      ],
    },
  ]

  return (
    <PageLayout
      title="Volumes"
      subtitle="CSI volumes and host volumes"
      actions={
        <Button onClick={() => navigate('/storage/volumes/new')}>
          Create Volume
        </Button>
      }
    >
      <FilterBar filters={filters} className="mb-4" />
      {filtered.length === 0 && !isLoading ? (
        <EmptyState
          title="No volumes found"
          description="No CSI or host volumes match your filters."
          action={{ label: 'Create Volume', onClick: () => navigate('/storage/volumes/new') }}
        />
      ) : (
        <DataTable
          data={filtered}
          columns={columns}
          onRowClick={(row) => navigate(`/storage/volumes/${row.ID}`)}
          loading={isLoading}
          rowIdKey="ID"
        />
      )}
    </PageLayout>
  )
}
