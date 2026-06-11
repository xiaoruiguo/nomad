import { useSystemStore } from '@/stores/system-store'
import { Breadcrumbs } from './breadcrumbs'

interface HeaderProps {
  sidebarCollapsed: boolean
  onToggleSidebar: () => void
}

export function Header({ sidebarCollapsed: _sidebarCollapsed, onToggleSidebar }: HeaderProps) {
  const { regions, activeRegion, setActiveRegion, namespaces, activeNamespace, setActiveNamespace } = useSystemStore()

  return (
    <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300 lg:hidden"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-3">
        {regions.length > 1 && (
          <select
            value={activeRegion ?? ''}
            onChange={(e) => setActiveRegion(e.target.value || null)}
            className="h-8 rounded-md border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        )}
        {namespaces.length > 1 && (
          <select
            value={activeNamespace ?? ''}
            onChange={(e) => setActiveNamespace(e.target.value || null)}
            className="h-8 rounded-md border border-neutral-200 bg-white px-2 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
          >
            <option value="">default</option>
            {namespaces.map((ns) => (
              <option key={ns.Name} value={ns.Name}>
                {ns.Name}
              </option>
            ))}
          </select>
        )}

        <button
          type="button"
          className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          title="Search (⌘K)"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>

        <button
          type="button"
          className="relative rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-300"
          title="Notifications"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        <div className="h-6 w-px bg-neutral-200 dark:bg-neutral-700" />

        <button
          type="button"
          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400"
          title="User menu"
        >
          U
        </button>
      </div>
    </header>
  )
}
