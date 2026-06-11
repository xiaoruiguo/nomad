import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useVariable, useCreateVariable, useUpdateVariable, useDeleteVariable } from '@/api/hooks/use-variables'
import { PageLayout } from '@/components/layout/page-layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input, Select } from '@/components/ui/form'
import { Alert } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { VariableForm, type KVPair } from '@/features/variables/components/variable-form'
import { useQuery } from '@tanstack/react-query'
import { getNamespaces, type Namespace } from '@/api/resources/namespaces'

export function VariableEditorPage() {
  const { path: urlPath } = useParams<{ path: string }>()
  const navigate = useNavigate()
  const isNew = urlPath === 'new' || !urlPath

  const [path, setPath] = useState(isNew ? '' : decodeURIComponent(urlPath || ''))
  const [namespace, setNamespace] = useState('default')
  const [items, setItems] = useState<KVPair[]>([{ key: '', value: '', encrypted: false }])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data: existingData, isLoading: isLoadingExisting } = useVariable(isNew ? '' : decodeURIComponent(urlPath || ''))
  const createMutation = useCreateVariable()
  const updateMutation = useUpdateVariable()
  const deleteMutation = useDeleteVariable()

  const { data: nsData } = useQuery({
    queryKey: ['namespaces'],
    queryFn: () => getNamespaces(),
  })

  const namespaces = (nsData?.data ?? []) as Namespace[]

  useEffect(() => {
    if (!isNew && existingData?.data) {
      const variable = existingData.data
      setPath(variable.Path)
      setNamespace(variable.Namespace)
      const kvPairs = Object.entries(variable.Items || {}).map(([, item]) => ({
        key: item.Key,
        value: item.Value,
        encrypted: false,
      }))
      if (kvPairs.length > 0) {
        setItems(kvPairs)
      }
    }
  }, [isNew, existingData])

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}
    if (!path.trim()) {
      newErrors.path = 'Path is required'
    }
    items.forEach((item, index) => {
      if (!item.key.trim()) {
        newErrors[`${index}.key`] = 'Key is required'
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return

    const variableData = {
      Namespace: namespace,
      Path: path,
      Items: items.reduce<Record<string, { Key: string; Value: string; Path: string }>>((acc, item) => {
        if (item.key.trim()) {
          acc[item.key] = { Key: item.key, Value: item.value, Path: path }
        }
        return acc
      }, {}),
    }

    try {
      if (isNew) {
        await createMutation.mutateAsync({ path, variable: variableData })
      } else {
        await updateMutation.mutateAsync({ path, variable: variableData })
      }
      navigate('/variables')
    } catch {
      // error handled by mutation state
    }
  }

  const handleDelete = async () => {
    if (!isNew && path) {
      await deleteMutation.mutateAsync(path)
      navigate('/variables')
    }
  }

  if (!isNew && isLoadingExisting) {
    return (
      <div className="flex items-center justify-center py-20">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const mutationError = createMutation.error || updateMutation.error || deleteMutation.error

  return (
    <PageLayout
      title={isNew ? 'Create Variable' : `Edit Variable`}
      subtitle={isNew ? 'Create a new Nomad variable' : path}
      actions={
        <div className="flex gap-2">
          {!isNew && (
            <Button variant="danger" onClick={handleDelete} loading={deleteMutation.isPending}>
              Delete
            </Button>
          )}
          <Button onClick={handleSave} loading={createMutation.isPending || updateMutation.isPending}>
            {isNew ? 'Create' : 'Save'}
          </Button>
        </div>
      }
    >
      {mutationError && (
        <Alert variant="danger" title="Error" className="mb-4" onDismiss={() => {}}>
          {(mutationError as Error).message}
        </Alert>
      )}

      <Card title="Variable Details" className="mb-6">
        <div className="space-y-4">
          <Input
            label="Path"
            value={path}
            onChange={(e) => setPath(e.target.value)}
            placeholder="e.g. myapp/config"
            error={errors.path}
            disabled={!isNew}
          />
          <Select
            label="Namespace"
            value={namespace}
            onChange={(e) => setNamespace(e.target.value)}
            options={namespaces.map((ns) => ({ value: ns.Name, label: ns.Name }))}
          />
        </div>
      </Card>

      <Card title="Key-Value Items">
        <VariableForm items={items} onChange={setItems} errors={errors} />
      </Card>
    </PageLayout>
  )
}
