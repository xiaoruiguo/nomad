import { useState, useMemo } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { usePlugins } from '@/api/hooks/use-csi'
import { PageLayout } from '@/components/layout/page-layout'
import { DataTable, type Column } from '@/components/ui/data-table'
import { SearchInput } from '@/components/ui/search-input'
import { Pagination } from '@/components/ui/pagination'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils'
import type { CSIPlugin } from '@/api/types/csi'

const PAGE_SIZE_OPTIONS = [10, 25, 50]

function getPlainId(id: string): string {
  return id.replace(/^csi-/, '')
}

function controllerHealthCell(plugin: CSIPlugin) {
  const { ControllerRequired, ControllersHealthy, ControllersExpected } = plugin
  if (!ControllerRequired) {
    return <span className="italic text-neutral-400 dark:text-neutral-500">Node Only</span>
  }
  if (ControllersExpected > 0) {
    const healthy = ControllersHealthy >= ControllersExpected
    return (
      <span className={cn(healthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
        {healthy ? 'Healthy' : 'Unhealthy'} ({ControllersHealthy}/{ControllersExpected})
      </span>
    )
  }
  return <span>—</span>
}

function nodeHealthCell(plugin: CSIPlugin) {
  const { NodesHealthy, NodesExpected } = plugin
  if (NodesExpected > 0) {
    const healthy = NodesHealthy >= NodesExpected
    return (
      <span className={cn(healthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
        {healthy ? 'Healthy' : 'Unhealthy'} ({NodesHealthy}/{NodesExpected})
      </span>
    )
  }
  return <span>—</span>
}

const columns: Column<CSIPlugin>[] = [
  {
    key: 'ID',
    header: 'ID',
    sortable: true,
    render: (row) => (
      <NavLink
        to={`/storage/plugins/${row.ID}`}
        className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        onClick={(e) => e.stopPropagation()}
      >
        {getPlainId(row.ID)}
      </NavLink>
    ),
  },
  {
    key: 'ControllerHealth',
    header: 'Controller Health',
    render: controllerHealthCell,
  },
  {
    key: 'NodeHealth',
    header: 'Node Health',
    render: nodeHealthCell,
  },
  {
    key: 'Provider',
    header: 'Provider',
    sortable: true,
  },
]

export function PluginListPage() {
  const navigate = useNavigate()
  const { data, isLoading } = usePlugins()

  const plugins = (data?.data ?? []) as CSIPlugin[]

  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  const filtered = useMemo(() => {
    if (!search.trim()) return plugins
    const q = search.toLowerCase()
    return plugins.filter((p) => {
      const id = getPlainId(p.ID).toLowerCase()
      const provider = (p.Provider || '').toLowerCase()
      return id.includes(q) || provider.includes(q)
    })
  }, [plugins, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const pagedData = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearch('')
    setCurrentPage(1)
  }

  return (
    <PageLayout title="Storage">
      <div className="space-y-6">
        <nav className="flex gap-6 border-b border-neutral-200 pb-2 dark:border-neutral-800">
          <NavLink
            to="/storage/volumes"
            className="pb-2 text-sm font-medium text-neutral-500 transition-colors hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            Overview
          </NavLink>
          <span className="border-b-2 border-primary-500 pb-2 text-sm font-medium text-primary-600 dark:text-primary-400">
            CSI Plugins
          </span>
        </nav>

        <div className="max-w-sm">
          <SearchInput
            value={search}
            onChange={handleSearchChange}
            placeholder="Search plugins..."
            onClear={handleClearSearch}
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-white py-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              {search.trim()
                ? `No plugins match your search for '${search}'`
                : 'No CSI plugins found'}
            </p>
            {search.trim() && (
              <button
                onClick={handleClearSearch}
                className="mt-3 text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400"
              >
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <DataTable
              data={pagedData}
              columns={columns}
              onRowClick={(row) => navigate(`/storage/plugins/${row.ID}`)}
              rowIdKey="ID"
            />
            {filtered.length > Math.min(...PAGE_SIZE_OPTIONS) && (
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={(size) => {
                  setPageSize(size)
                  setCurrentPage(1)
                }}
                totalItems={filtered.length}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
              />
            )}
          </>
        )}
      </div>
    </PageLayout>
  )
}
