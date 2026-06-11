import { useState } from 'react'
import { getNamespaces, deleteNamespace, type Namespace } from '@/api/resources/namespaces'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageLayout } from '@/components/layout/page-layout'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { NamespaceForm } from '../components/namespace-form'

const columns: Column<Namespace>[] = [
  {
    key: 'Name',
    header: 'Name',
    sortable: true,
    render: (row) => <span className="font-medium">{row.Name}</span>,
  },
  {
    key: 'Description',
    header: 'Description',
    render: (row) => row.Description || '—',
  },
  {
    key: 'Quotas',
    header: 'Quota',
    render: (row) => {
      const quotas = row.Quotas ?? []
      if (quotas.length === 0) return <span className="text-neutral-400">—</span>
      return (
        <div className="flex flex-wrap gap-1">
          {quotas.map((q) => (
            <Badge key={q} variant="neutral" size="sm">{q}</Badge>
          ))}
        </div>
      )
    },
  },
  {
    key: 'Capabilities',
    header: 'Capabilities',
    render: (row) => {
      const caps = row.Capabilities ?? []
      if (caps.length === 0) return <span className="text-neutral-400">—</span>
      return (
        <div className="flex flex-wrap gap-1">
          {caps.map((c) => (
            <Badge key={c} variant="info" size="sm">{c}</Badge>
          ))}
        </div>
      )
    },
  },
]

export function NamespacesPage() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [editNs, setEditNs] = useState<Namespace | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<Namespace | null>(null)

  const { data, isLoading, error } = useQuery({
    queryKey: ['namespaces'],
    queryFn: () => getNamespaces(),
  })

  const deleteMutation = useMutation({
    mutationFn: (name: string) => deleteNamespace(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['namespaces'] })
      setDeleteTarget(null)
    },
  })

  const namespaces = (data?.data ?? []) as Namespace[]

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.Name)
  }

  if (error) {
    return (
      <PageLayout title="Namespaces">
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-400">
          Failed to load namespaces: {error.message}
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Namespaces"
      subtitle="Manage Nomad namespaces"
      actions={
        <Button onClick={() => { setEditNs(undefined); setShowForm(true) }}>
          Create Namespace
        </Button>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : namespaces.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          }
          title="No namespaces found"
          description="Create a namespace to organize your workloads."
          action={{ label: 'Create Namespace', onClick: () => { setEditNs(undefined); setShowForm(true) } }}
        />
      ) : (
        <DataTable
          data={namespaces}
          columns={columns}
          loading={isLoading}
          rowIdKey="Name"
          onRowClick={(row) => {
            const ns = row
            setDeleteTarget(ns)
          }}
        />
      )}

      <NamespaceForm
        namespace={editNs}
        open={showForm}
        onOpenChange={setShowForm}
      />

      <Modal
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete Namespace"
        description={`Are you sure you want to delete namespace "${deleteTarget?.Name}"? This action cannot be undone.`}
        size="sm"
      >
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button variant="danger" onClick={handleDelete} loading={deleteMutation.isPending}>Delete</Button>
        </div>
      </Modal>
    </PageLayout>
  )
}
