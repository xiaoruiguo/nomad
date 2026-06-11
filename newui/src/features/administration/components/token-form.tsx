import { useState } from 'react'
import { useCreateToken, useUpdateToken, usePolicies } from '@/api/hooks'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import type { ACLToken } from '@/api/types/acl'

interface TokenFormProps {
  token?: ACLToken
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TokenForm({ token, open, onOpenChange }: TokenFormProps) {
  const createMutation = useCreateToken()
  const updateMutation = useUpdateToken()
  const { data: policiesData } = usePolicies()

  const policies = (policiesData?.data ?? []) as { Name: string }[]

  const isEditing = !!token

  const [name, setName] = useState(token?.Name ?? '')
  const [type, setType] = useState(token?.Type ?? 'client')
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>(
    token?.Policies ?? []
  )
  const [expiration, setExpiration] = useState(token?.ExpirationTime ?? '')

  const policyOptions = policies.map((p) => ({ value: p.Name, label: p.Name }))

  const handleSubmit = async () => {
    const tokenData: Partial<ACLToken> = {
      Name: name,
      Type: type,
      Policies: selectedPolicies,
    }

    if (expiration) {
      tokenData.ExpirationTime = expiration
    }

    if (isEditing && token) {
      await updateMutation.mutateAsync({ id: token.AccessorID, token: tokenData })
    } else {
      await createMutation.mutateAsync(tokenData)
    }
    onOpenChange(false)
  }

  const togglePolicy = (policyName: string) => {
    setSelectedPolicies((prev) =>
      prev.includes(policyName)
        ? prev.filter((p) => p !== policyName)
        : [...prev, policyName]
    )
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit Token' : 'Create Token'}
      size="md"
    >
      <div className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Token name"
        />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Type</label>
          <div className="flex items-center rounded-lg border border-neutral-200 p-0.5 dark:border-neutral-700">
            <button
              type="button"
              onClick={() => setType('management')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                type === 'management'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
              }`}
            >
              Management
            </button>
            <button
              type="button"
              onClick={() => setType('client')}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                type === 'client'
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                  : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400'
              }`}
            >
              Client
            </button>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">Policies</label>
          {policyOptions.length === 0 ? (
            <p className="text-xs text-neutral-400">No policies available</p>
          ) : (
            <div className="max-h-40 space-y-1 overflow-auto rounded-md border border-neutral-200 p-2 dark:border-neutral-700">
              {policyOptions.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedPolicies.includes(opt.value)}
                    onChange={() => togglePolicy(opt.value)}
                    className="rounded border-neutral-300"
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          )}
        </div>

        <Input
          label="Expiration Time"
          type="datetime-local"
          value={expiration ? expiration.slice(0, 16) : ''}
          onChange={(e) => setExpiration(e.target.value ? new Date(e.target.value).toISOString() : '')}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            loading={createMutation.isPending || updateMutation.isPending}
          >
            {isEditing ? 'Update' : 'Create'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
