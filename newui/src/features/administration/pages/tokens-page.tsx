import { useState } from 'react'
import { useTokens, useSelfToken, useDeleteToken, useBootstrapACL } from '@/api/hooks'
import { PageLayout } from '@/components/layout/page-layout'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { TokenForm } from '../components/token-form'
import type { ACLTokenListStub, ACLToken } from '@/api/types/acl'

const columns: Column<ACLTokenListStub>[] = [
  {
    key: 'AccessorID',
    header: 'Accessor ID',
    render: (row) => <span className="font-mono text-xs">{row.AccessorID.slice(0, 16)}</span>,
  },
  {
    key: 'Name',
    header: 'Name',
    sortable: true,
    render: (row) => row.Name || '—',
  },
  {
    key: 'Type',
    header: 'Type',
    render: (row) => (
      <Badge variant={row.Type === 'management' ? 'info' : 'neutral'} size="sm">
        {row.Type}
      </Badge>
    ),
  },
  {
    key: 'CreateTime',
    header: 'Created',
    sortable: true,
    render: (row) => row.CreateTime ? new Date(row.CreateTime / 1_000_000).toLocaleDateString() : '—',
  },
  {
    key: 'Policies',
    header: 'Policies',
    render: (row) => {
      const policies = row.Policies ?? []
      if (policies.length === 0) return <span className="text-neutral-400">—</span>
      return (
        <div className="flex flex-wrap gap-1">
          {policies.slice(0, 3).map((p) => (
            <Badge key={p} variant="neutral" size="sm">{p}</Badge>
          ))}
          {policies.length > 3 && <Badge variant="neutral" size="sm">+{policies.length - 3}</Badge>}
        </div>
      )
    },
  },
  {
    key: 'Roles',
    header: 'Roles',
    render: (row) => {
      const roles = row.Roles ?? []
      if (roles.length === 0) return <span className="text-neutral-400">—</span>
      return (
        <div className="flex flex-wrap gap-1">
          {roles.slice(0, 3).map((r) => (
            <Badge key={r.Name} variant="neutral" size="sm">{r.Name}</Badge>
          ))}
        </div>
      )
    },
  },
]

export function TokensPage() {
  const { data, isLoading, error } = useTokens()
  const { data: selfData } = useSelfToken()
  const deleteMutation = useDeleteToken()
  const bootstrapMutation = useBootstrapACL()

  const [showForm, setShowForm] = useState(false)
  const [editToken, setEditToken] = useState<ACLToken | undefined>()
  const [deleteTarget, setDeleteTarget] = useState<ACLTokenListStub | null>(null)

  const tokens = (data?.data ?? []) as ACLTokenListStub[]
  const selfToken = selfData?.data as ACLToken | undefined

  const handleDelete = async () => {
    if (!deleteTarget) return
    await deleteMutation.mutateAsync(deleteTarget.AccessorID)
    setDeleteTarget(null)
  }

  const handleBootstrap = async () => {
    await bootstrapMutation.mutateAsync()
  }

  if (error) {
    return (
      <PageLayout title="Tokens">
        <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 text-sm text-danger-700 dark:border-danger-800 dark:bg-danger-900/20 dark:text-danger-400">
          Failed to load tokens: {error.message}
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout
      title="Tokens"
      subtitle="Manage ACL tokens"
      actions={
        <div className="flex items-center gap-2">
          {tokens.length === 0 && !selfToken && (
            <Button variant="secondary" onClick={handleBootstrap} loading={bootstrapMutation.isPending}>
              Bootstrap ACL
            </Button>
          )}
          <Button onClick={() => { setEditToken(undefined); setShowForm(true) }}>
            Create Token
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : tokens.length === 0 ? (
        <EmptyState
          icon={
            <svg className="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          }
          title="No tokens found"
          description="No ACL tokens have been created. Bootstrap ACL to get started."
          action={{ label: 'Bootstrap ACL', onClick: handleBootstrap }}
        />
      ) : (
        <DataTable
          data={tokens}
          columns={columns}
          loading={isLoading}
          rowIdKey="AccessorID"
          onRowClick={(row) => {
            const token = row
            setDeleteTarget(token)
          }}
        />
      )}

      <TokenForm
        token={editToken}
        open={showForm}
        onOpenChange={setShowForm}
      />

      <Modal
        open={!!deleteTarget}
        onOpenChange={(open) => { if (!open) setDeleteTarget(null) }}
        title="Delete Token"
        description={`Are you sure you want to delete token "${deleteTarget?.Name || deleteTarget?.AccessorID?.slice(0, 8)}"? This action cannot be undone.`}
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
