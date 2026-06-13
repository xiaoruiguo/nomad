import { useState, useMemo } from 'react'
import { NavLink, useNavigate, useSearchParams } from 'react-router-dom'
import { useVolumes, useDynamicHostVolumes, usePlugins } from '@/api/hooks/use-csi'
import { useSystemStore } from '@/stores/system-store'
import { PageLayout } from '@/components/layout/page-layout'
import { Card } from '@/components/ui/card'
import { DataTable, type Column } from '@/components/ui/data-table'
import { SearchInput } from '@/components/ui/search-input'
import { Pagination } from '@/components/ui/pagination'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { cn } from '@/lib/utils'
import type { CSIVolume, DynamicHostVolume, CSIPlugin } from '@/api/types/csi'

const PAGE_SIZE_OPTIONS = [10, 25, 50]
type TabKey = 'volumes' | 'plugins'

function csiColumns(shouldShowNamespaces: boolean): Column<CSIVolume>[] {
  const cols: Column<CSIVolume>[] = [
    {
      key: 'plainId',
      header: 'ID',
      sortable: true,
      render: (row) => (
        <NavLink to={`/storage/volumes/${row.ID}`} className="font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          {row.plainId || row.ID}
        </NavLink>
      ),
    },
  ]
  if (shouldShowNamespaces) {
    cols.push({ key: 'Namespace', header: 'Namespace' })
  }
  cols.push(
    {
      key: 'Schedulable',
      header: 'Volume Health',
      sortable: true,
      render: (row) =>
        row.Schedulable ? (
          <Badge variant="success" size="sm">Schedulable</Badge>
        ) : (
          <Badge variant="danger" size="sm">Unschedulable</Badge>
        ),
    },
    {
      key: 'controllersHealthyProportion',
      header: 'Controller Health',
      render: (row) => {
        const { ControllersExpected, ControllersHealthy, ControllerRequired } = row
        if (!ControllerRequired) return <span className="italic text-neutral-400">Node Only</span>
        if (ControllersExpected > 0) {
          const healthy = ControllersHealthy >= ControllersExpected
          return (
            <span className={cn(healthy ? 'text-green-600' : 'text-red-600')}>
              {healthy ? 'Healthy' : 'Unhealthy'} ({ControllersHealthy}/{ControllersExpected})
            </span>
          )
        }
        return <span>—</span>
      },
    },
    {
      key: 'nodesHealthyProportion',
      header: 'Node Health',
      render: (row) => {
        const { nodesExpected, nodesHealthy } = row
        if (nodesExpected > 0) {
          const healthy = nodesHealthy >= nodesExpected
          return (
            <span className={cn(healthy ? 'text-green-600' : 'text-red-600')}>
              {healthy ? 'Healthy' : 'Unhealthy'} ({nodesHealthy}/{nodesExpected})
            </span>
          )
        }
        return <span>—</span>
      },
    },
    {
      key: 'pluginID',
      header: 'Plugin',
      render: (row) => (
        <NavLink to={`/storage/plugins/${row.PluginID}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          {row.PluginID}
        </NavLink>
      ),
    },
    {
      key: 'allocationCount',
      header: '# Allocs',
      sortable: true,
      render: (row) => String((row.CurrentReaders || 0) + (row.CurrentWriters || 0)),
    }
  )
  return cols
}

function dhvColumns(): Column<DynamicHostVolume>[] {
  return [
    {
      key: 'plainId',
      header: 'ID',
      sortable: true,
      render: (row) => <span className="font-medium">{row.plainId || row.ID}</span>,
    },
    { key: 'Name', header: 'Name', sortable: true },
    {
      key: 'node.Name',
      header: 'Node',
      render: (row) => (
        <NavLink to={`/clients/${row.node.ID}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          {row.node.Name}
        </NavLink>
      ),
    },
    {
      key: 'state',
      header: 'State',
      sortable: true,
      render: (row) => (
        <Badge variant={row.state === 'created' ? 'success' : row.state === 'pending' ? 'warning' : 'neutral'} size="sm">
          {row.state}
        </Badge>
      ),
    },
    {
      key: 'pluginID',
      header: 'Plugin',
      render: (row) => (
        <NavLink to={`/storage/plugins/${row.pluginID}`} className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
          {row.pluginID}
        </NavLink>
      ),
    },
  ]
}

function pluginColumns(): Column<CSIPlugin>[] {
  function getPlainId(id: string) { return id.replace(/^csi\//, '') }

  return [
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
      render: (plugin) => {
        const { ControllerRequired, ControllersHealthy, ControllersExpected } = plugin
        if (!ControllerRequired) return <span className="italic text-neutral-400 dark:text-neutral-500">Node Only</span>
        if (ControllersExpected > 0) {
          const healthy = ControllersHealthy >= ControllersExpected
          return (
            <span className={cn(healthy ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400')}>
              {healthy ? 'Healthy' : 'Unhealthy'} ({ControllersHealthy}/{ControllersExpected})
            </span>
          )
        }
        return <span>—</span>
      },
    },
    {
      key: 'NodeHealth',
      header: 'Node Health',
      render: (plugin) => {
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
      },
    },
    {
      key: 'Provider',
      header: 'Provider',
      sortable: true,
    },
  ]
}

interface VolumeCardProps<T> {
  title: string
  description: string
  readMoreLink?: { label: string; href: string }
  data: T[]
  columns: Column<T>[]
  searchPlaceholder: string
  isLoading: boolean
  defaultPageSize?: number
}

function VolumeCard<T>({
  title,
  description,
  readMoreLink,
  data,
  columns,
  searchPlaceholder,
  isLoading,
  defaultPageSize = 10,
}: VolumeCardProps<T>) {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(defaultPageSize)

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter((item) => {
      const record = item as Record<string, unknown>
      const id = String(record.plainId || record.ID || '').toLowerCase()
      const name = String(record.Name || '').toLowerCase()
      return id.includes(q) || name.includes(q)
    })
  }, [data, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const safePage = Math.min(currentPage, totalPages)
  const pagedData = filtered.slice((safePage - 1) * pageSize, safePage * pageSize)

  return (
    <Card padding="none">
      <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
            <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">{description}</p>
            {readMoreLink && (
              <NavLink to={readMoreLink.href} className="mt-1 inline-block text-xs text-primary-500 hover:text-primary-600 dark:text-primary-400">
                {readMoreLink.label} &rarr;
              </NavLink>
            )}
          </div>
        </div>
        <div className="mt-3 max-w-sm">
          <SearchInput
            value={search}
            onChange={(v) => { setSearch(v); setCurrentPage(1) }}
            placeholder={searchPlaceholder}
            onClear={() => { setSearch(''); setCurrentPage(1) }}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : pagedData.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {search.trim() ? `No ${title.toLowerCase()} match your search for '${search}'` : `No ${title.toLowerCase()} found`}
          </p>
          {search.trim() && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setCurrentPage(1) }} className="mt-3">
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <>
          <DataTable data={pagedData} columns={columns} loading={false} rowIdKey="ID" />
          {filtered.length > Math.min(...PAGE_SIZE_OPTIONS) && (
            <div className="border-t border-neutral-200 dark:border-neutral-800">
              <Pagination
                currentPage={safePage} totalPages={totalPages}
                onPageChange={setCurrentPage}
                pageSize={pageSize}
                onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
                totalItems={filtered.length} pageSizeOptions={PAGE_SIZE_OPTIONS}
              />
            </div>
          )}
        </>
      )}
    </Card>
  )
}

export function VolumeListPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as TabKey | null
  const activeTab: TabKey = tabParam === 'plugins' ? 'plugins' : 'volumes'

  const namespaces = useSystemStore((s) => s.namespaces)
  const activeNamespace = useSystemStore((s) => s.activeNamespace)
  const setActiveNamespace = useSystemStore((s) => s.setActiveNamespace)

  const shouldShowNamespaces = namespaces.length > 1

  const { data: csiData, isLoading: csiLoading } = useVolumes({ namespace: activeNamespace || undefined })
  const { data: dhvData, isLoading: dhvLoading } = useDynamicHostVolumes({ namespace: activeNamespace || undefined })
  const { data: pluginsData, isLoading: pluginsLoading } = usePlugins()

  const csiVolumes = (csiData?.data ?? []) as CSIVolume[]
  const dhvVolumes = (dhvData?.data ?? []) as DynamicHostVolume[]
  const plugins = (pluginsData?.data ?? []) as CSIPlugin[]

  const csiCols = useMemo(() => csiColumns(shouldShowNamespaces), [shouldShowNamespaces])
  const dhvCols = useMemo(() => dhvColumns(), [])
  const plugCols = useMemo(() => pluginColumns(), [])

  const switchTab = (t: TabKey) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', t)
    setSearchParams(next)
  }

  return (
    <PageLayout title="Storage">
      <div className="space-y-6">

        <nav className="flex gap-6 border-b border-neutral-200 pb-0 dark:border-neutral-800">
          <button
            onClick={() => switchTab('volumes')}
            className={cn(
              'border-b-2 pb-3 text-sm font-medium transition-colors',
              activeTab === 'volumes'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            )}
          >
            Volumes
          </button>
          <button
            onClick={() => switchTab('plugins')}
            className={cn(
              'border-b-2 pb-3 text-sm font-medium transition-colors',
              activeTab === 'plugins'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200'
            )}
          >
            Plugins
          </button>
        </nav>

        {(shouldShowNamespaces || activeNamespace) && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Namespace:</label>
            <select
              value={activeNamespace || ''}
              onChange={(e) => setActiveNamespace(e.target.value || null)}
              className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            >
              <option value="">All Namespaces</option>
              {namespaces.map((ns) => (
                <option key={ns.Name} value={ns.Name}>{ns.Name}</option>
              ))}
            </select>
          </div>
        )}

        {activeTab === 'volumes' && (
          <div className="space-y-4">
            <VolumeCard
              title="CSI Volumes"
              description="CSI volumes provisioned by storage plugins."
              readMoreLink={{ label: 'Learn more about CSI', href: 'https://www.nomad.io/docs/concepts/volume' }}
              data={csiVolumes}
              columns={csiCols}
              searchPlaceholder="Search CSI Volumes"
              isLoading={csiLoading}
            />
            <VolumeCard
              title="Dynamic Host Volumes"
              description="Dynamically created host volumes."
              data={dhvVolumes}
              columns={dhvCols}
              searchPlaceholder="Search Dynamic Host Volumes"
              isLoading={dhvLoading}
            />
            <Card padding="none">
              <div className="px-4 py-3">
                <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Other Storage Types</h3>
              </div>
              <div className="space-y-3 px-4 pb-4">
                <Alert variant="info" title="Static Host Volumes">
                  <p className="text-sm">
                    Static host volumes are configured in the client configuration and are not managed via the API.
                    They are defined using the{' '}
                    <code className="rounded bg-neutral-100 px-1.5 py-0.5 text-xs dark:bg-neutral-800">host_volume</code>{' '}
                    stanza.
                  </p>
                </Alert>
                <Alert variant="info" title="Ephemeral Disks">
                  <p className="text-sm">
                    Ephemeral disks are task-local storage that exists for the lifetime of an allocation.
                    They do not persist across allocations and are defined per task in job specifications.
                  </p>
                </Alert>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'plugins' && <PluginsPanel plugins={plugins} isLoading={pluginsLoading} cols={plugCols} onRowClick={(row) => navigate(`/storage/plugins/${row.ID}`)} />}

      </div>
    </PageLayout>
  )
}

function PluginsPanel({
  plugins,
  isLoading,
  cols,
  onRowClick,
}: {
  plugins: CSIPlugin[]
  isLoading: boolean
  cols: Column<CSIPlugin>[]
  onRowClick: (row: CSIPlugin) => void
}) {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)

  function getPlainId(id: string) { return id.replace(/^csi\//, '') }

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

  return (
    <div className="space-y-4">
      <div className="max-w-sm">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setCurrentPage(1) }}
          placeholder="Search plugins..."
          onClear={() => { setSearch(''); setCurrentPage(1) }}
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><LoadingSpinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-lg border border-neutral-200 bg-white py-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {search.trim() ? `No plugins match your search for '${search}'` : 'No CSI plugins found'}
          </p>
          {search.trim() && (
            <button onClick={() => { setSearch(''); setCurrentPage(1) }} className="mt-3 text-sm text-primary-500 hover:text-primary-600 dark:text-primary-400">
              Clear search
            </button>
          )}
        </div>
      ) : (
        <>
          <DataTable data={pagedData} columns={cols} onRowClick={onRowClick} rowIdKey="ID" />
          {filtered.length > Math.min(...PAGE_SIZE_OPTIONS) && (
            <Pagination
              currentPage={safePage} totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1) }}
              totalItems={filtered.length} pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          )}
        </>
      )}
    </div>
  )
}
