import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVariables } from '@/api/hooks/use-variables'
import { PageLayout } from '@/components/layout/page-layout'
import { DataTable, type Column } from '@/components/ui/data-table'
import { FilterBar, type FilterConfig } from '@/components/ui/filter-bar'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/ui/empty-state'
import { formatTime } from '@/lib/utils'
import type { VariableListStub } from '@/api/types/variable'

const columns: Column<VariableListStub>[] = [
  { key: 'Path', header: 'Path', sortable: true },
  { key: 'Namespace', header: 'Namespace', sortable: true },
  {
    key: 'ModifyTime',
    header: 'Modified',
    sortable: true,
    render: (row) => row.ModifyTime ? formatTime(new Date(row.ModifyTime * 1000).toISOString()) : '—',
  },
]

export function VariableListPage() {
  const navigate = useNavigate()
  const [namespace, setNamespace] = useState('')
  const [prefix, setPrefix] = useState('')

  const { data, isLoading } = useVariables({
    namespace: namespace || undefined,
    prefix: prefix || undefined,
  })

  const variables = (data ?? []) as VariableListStub[]

  const filters: FilterConfig[] = [
    {
      key: 'namespace',
      label: 'Namespace',
      type: 'search',
      value: namespace,
      onChange: (v) => setNamespace(v as string),
    },
    {
      key: 'prefix',
      label: 'Path prefix',
      type: 'search',
      value: prefix,
      onChange: (v) => setPrefix(v as string),
    },
  ]

  return (
    <PageLayout
      title="Variables"
      subtitle="Nomad variables store"
      actions={
        <Button onClick={() => navigate('/variables/new')}>
          Create Variable
        </Button>
      }
    >
      <FilterBar filters={filters} className="mb-4" />
      {variables.length === 0 && !isLoading ? (
        <EmptyState
          title="No variables found"
          description="No variables match your filters."
          action={{ label: 'Create Variable', onClick: () => navigate('/variables/new') }}
        />
      ) : (
        <DataTable
          data={variables}
          columns={columns}
          onRowClick={(row) => navigate(`/variables/${row.Path}`)}
          loading={isLoading}
          rowIdKey="Path"
        />
      )}
    </PageLayout>
  )
}
