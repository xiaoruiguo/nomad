import { useState } from 'react'
import { createNamespace, updateNamespace, type Namespace } from '@/api/resources/namespaces'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

interface NamespaceFormProps {
  namespace?: Namespace
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NamespaceForm({ namespace, open, onOpenChange }: NamespaceFormProps) {
  const queryClient = useQueryClient()
  const isEditing = !!namespace

  const [name, setName] = useState(namespace?.Name ?? '')
  const [description, setDescription] = useState(namespace?.Description ?? '')
  const [quota, setQuota] = useState((namespace?.Quotas ?? []).join(', '))
  const [capabilities, setCapabilities] = useState((namespace?.Capabilities ?? []).join(', '))

  const createMutation = useMutation({
    mutationFn: (ns: Partial<Namespace>) => createNamespace(ns),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['namespaces'] })
      onOpenChange(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ n, ns }: { n: string; ns: Partial<Namespace> }) => updateNamespace(n, ns),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['namespaces'] })
      onOpenChange(false)
    },
  })

  const handleSubmit = async () => {
    const data: Partial<Namespace> = {
      Name: name,
      Description: description,
      Quotas: quota.split(',').map((s) => s.trim()).filter(Boolean),
      Capabilities: capabilities.split(',').map((s) => s.trim()).filter(Boolean),
    }

    if (isEditing && namespace) {
      await updateMutation.mutateAsync({ n: namespace.Name, ns: data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditing ? 'Edit Namespace' : 'Create Namespace'}
      size="md"
    >
      <div className="space-y-4">
        <Input
          label="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Namespace name"
          disabled={isEditing}
        />

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Namespace description"
        />

        <Input
          label="Quota (comma-separated)"
          value={quota}
          onChange={(e) => setQuota(e.target.value)}
          placeholder="quota-name"
        />

        <Input
          label="Capabilities (comma-separated)"
          value={capabilities}
          onChange={(e) => setCapabilities(e.target.value)}
          placeholder="read-job, submit-job"
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
