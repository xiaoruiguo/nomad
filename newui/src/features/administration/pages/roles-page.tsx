import { useState } from 'react'
import { useRoles, useCreateRole } from '@/api/hooks/use-acl'
import { usePolicies } from '@/api/hooks/use-acl'
import { PageLayout } from '@/components/layout/page-layout'
import { DataTable, type Column } from '@/components/ui/data-table'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/form'
import { EmptyState } from '@/components/ui/empty-state'
import { Badge } from '@/components/ui/badge'
import type { ACLRole } from '@/api/types/acl'

const columns: Column<ACLRole>[] = [
  { key: 'ID', header: 'ID', render: (row) => row.ID.slice(0, 8) },
  { key: 'Name', header: 'Name', sortable: true },
  {
    key: 'Description',
    header: 'Description',
    render: (row) => row.Description || '—',
  },
  {
    key: 'Policies',
    header: 'Policies Count',
    render: (row) => <Badge variant="neutral" size="sm">{row.Policies?.length ?? 0}</Badge>,
  },
]

export function RolesPage() {
  const { data, isLoading } = useRoles()
  const { data: policiesData } = usePolicies()
  const createMutation = useCreateRole()

  const [showModal, setShowModal] = useState(false)
  const [formName, setFormName] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPolicyNames, setFormPolicyNames] = useState<string[]>([])

  const roles = (data?.data ?? []) as ACLRole[]
  const policies = (policiesData?.data ?? []) as { Name: string }[]

  const handleCreate = async () => {
    if (!formName.trim()) return
    await createMutation.mutateAsync({
      Name: formName,
      Description: formDescription,
      Policies: formPolicyNames.map((name) => ({ Name: name })),
    })
    setShowModal(false)
    setFormName('')
    setFormDescription('')
    setFormPolicyNames([])
  }

  const togglePolicy = (name: string) => {
    setFormPolicyNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    )
  }

  return (
    <PageLayout
      title="ACL Roles"
      subtitle="Manage access control roles"
      actions={
        <Button onClick={() => setShowModal(true)}>
          Create Role
        </Button>
      }
    >
      {roles.length === 0 && !isLoading ? (
        <EmptyState
          title="No roles found"
          description="No ACL roles have been created yet."
          action={{ label: 'Create Role', onClick: () => setShowModal(true) }}
        />
      ) : (
        <DataTable
          data={roles}
          columns={columns}
          onRowClick={(row) => {
            setFormName(row.Name)
            setFormDescription(row.Description)
            setFormPolicyNames(row.Policies?.map((p) => p.Name) ?? [])
            setShowModal(true)
          }}
          loading={isLoading}
          rowIdKey="ID"
        />
      )}

      <Modal
        open={showModal}
        onOpenChange={setShowModal}
        title={formName && roles.some((r) => r.Name === formName) ? `Edit Role: ${formName}` : 'Create Role'}
        size="lg"
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            placeholder="Role name"
            disabled={roles.some((r) => r.Name === formName)}
          />
          <Input
            label="Description"
            value={formDescription}
            onChange={(e) => setFormDescription(e.target.value)}
            placeholder="Role description"
          />
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">Policies</p>
            {policies.length === 0 ? (
              <p className="text-sm text-neutral-500">No policies available. Create a policy first.</p>
            ) : (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-neutral-200 p-2 dark:border-neutral-800">
                {policies.map((policy) => (
                  <label key={policy.Name} className="flex items-center gap-2 py-1">
                    <input
                      type="checkbox"
                      checked={formPolicyNames.includes(policy.Name)}
                      onChange={() => togglePolicy(policy.Name)}
                      className="h-4 w-4 rounded border-neutral-300 text-primary-500 focus:ring-primary-500"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{policy.Name}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} loading={createMutation.isPending}>
              {roles.some((r) => r.Name === formName) ? 'Update' : 'Create'}
            </Button>
          </div>
        </div>
      </Modal>
    </PageLayout>
  )
}
