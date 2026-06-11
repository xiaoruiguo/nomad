import { useLocation, Link } from 'react-router-dom'

const routeLabelMap: Record<string, string> = {
  jobs: 'Jobs',
  clients: 'Clients',
  servers: 'Servers',
  topology: 'Topology',
  storage: 'Storage',
  variables: 'Variables',
  evaluations: 'Evaluations',
  administration: 'Administration',
  optimize: 'Optimize',
  allocations: 'Allocations',
  deployment: 'Deployment',
  tasks: 'Tasks',
  logs: 'Logs',
  exec: 'Exec',
}

export function Breadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)

  if (segments.length === 0) {
    return null
  }

  const crumbs = segments.map((segment, index) => {
    const path = '/' + segments.slice(0, index + 1).join('/')
    const label = routeLabelMap[segment] ?? decodeURIComponent(segment)
    const isLast = index === segments.length - 1
    return { path, label, isLast }
  })

  return (
    <nav className="flex items-center gap-1 text-sm">
      <Link
        to="/"
        className="text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300"
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </Link>
      {crumbs.map((crumb) => (
        <span key={crumb.path} className="flex items-center gap-1">
          <svg
            className="h-3 w-3 text-neutral-300 dark:text-neutral-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {crumb.isLast ? (
            <span className="font-medium text-neutral-900 dark:text-neutral-100">
              {crumb.label}
            </span>
          ) : (
            <Link
              to={crumb.path}
              className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
            >
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  )
}
