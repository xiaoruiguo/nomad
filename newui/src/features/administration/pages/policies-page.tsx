import { useState } from 'react'
import { usePolicies, useCreatePolicy } from '@/api/hooks/use-acl'
import { PageLayout } from '@/components/layout/page-layout'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input, Textarea } from '@/components/ui/form'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import type { ACLPolicy } from '@/api/types/acl'

const columns: Column<ACLPolicy>[] = [
  { key: 'Name', header: 'Name', sortable: true },
  {
    key: 'Description',
    header: 'Description',
    render: (row) => row.Description || '—',
  },
  {
    key: 'CreateIndex',
    header: 'Create Index',
    sortable: true,
    render: (row) => <Badge variant="neutral" size="sm">{row.CreateIndex}</Badge>,
  },
]

export function PoliciesPage() {
  const { data, isLoading } = usePolicies()
  const createMutation = useCreatePolicy()

  const [showModal, setShowModal] = useState(false)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formRules, setFormRules] = useState('')

  const policies = (data?.data ?? []) as ACLPolicy[]

  const handleCreate = async () => {
    if (!formName.trim()) return
    await createMutation.mutateAsync({
      name: formName,
      policy: {
        Name: formName,
        Description: formDescription,
        Rules: formRules,
        CreateIndex: 0,
        ModifyIndex: 0,
        Hash: '',
      },
    })
    setShowModal(false)
    setFormName('')
    setFormDescription('')
    setFormRules('')
  }

  return (
    <PageLayout
      title="ACL Policies"
      subtitle="Manage access control policies"
      actions={
        <Button onClick={() => setShowModal(true)}>
          Create Policy
        </Button>
      }
    >
      {policies.length === 0 && !isLoading ? (
        <EmptyState
          title="No policies found"
          description="No ACL policies have been created yet."
          action={{ label: 'Create Policy', onClick: () => setShowModal(true) }}
        />
      ) : (
        <DataTable
          data={policies}
          columns={columns}
          onRowClick={(row) => {
            setFormName(row.Name)
            setFormDescription(row.Description)
            setFormRules(row.Rules)
            setShowModal(true)
          }}
          loading={isLoading}
          rowIdKey="Name"
        />
      )}

      <Modal
        open={showModal}
        onOpenChange={setShowModal}
        title={formName && policies.some((p) => p.Name === formName) ? `Edit Policy: ${formName}` : 'Create Policy'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Policy name"
            disabled={policies.some((p) => p.Name === formName)}
          />
          <Input
            label="Description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Policy description"
          />
          <Textarea
            label="Rules (HCL)"
            value={formRules}
            onChange={(e) => setFormRules(e.target.value)}
            placeholder='namespace "default" { capabilities = ["read-job"] }'
            rows={10}
            className="font-mono text-sm"
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={createMutation.isPending}>
              {policies.some((p) => p.Name === formName) ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  )
}
