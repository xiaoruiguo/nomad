import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, Outlet, type RouteObject } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAuthStore } from '@/stores/auth-store'

const LoginPage = lazy(() => import('@/features/auth/pages/login-page').then((m) => ({ default: m.LoginPage })))
const JobListPage = lazy(() => import('@/features/jobs/pages/job-list-page').then((m) => ({ default: m.JobListPage })))
const JobRunPage = lazy(() => import('@/features/jobs/pages/job-run-page').then((m) => ({ default: m.JobRunPage })))
const JobDetailPage = lazy(() => import('@/features/jobs/pages/job-detail-page').then((m) => ({ default: m.JobDetailPage })))
const JobDefinitionPage = lazy(() => import('@/features/jobs/pages/job-definition-page').then((m) => ({ default: m.JobDefinitionPage })))
const ClientListPage = lazy(() => import('@/features/clients/pages/client-list-page').then((m) => ({ default: m.ClientListPage })))
const ClientDetailPage = lazy(() => import('@/features/clients/pages/client-detail-page').then((m) => ({ default: m.ClientDetailPage })))
const ServerListPage = lazy(() => import('@/features/servers/pages/server-list-page').then((m) => ({ default: m.ServerListPage })))
const ServerDetailPage = lazy(() => import('@/features/servers/pages/server-detail-page').then((m) => ({ default: m.ServerDetailPage })))
const TopologyPage = lazy(() => import('@/features/topology/pages/topology-page').then((m) => ({ default: m.TopologyPage })))
const VolumeListPage = lazy(() => import('@/features/storage/pages/volume-list-page').then((m) => ({ default: m.VolumeListPage })))
const VolumeDetailPage = lazy(() => import('@/features/storage/pages/volume-detail-page').then((m) => ({ default: m.VolumeDetailPage })))
const PluginListPage = lazy(() => import('@/features/storage/pages/plugin-list-page').then((m) => ({ default: m.PluginListPage })))
const PluginDetailPage = lazy(() => import('@/features/storage/pages/plugin-detail-page').then((m) => ({ default: m.PluginDetailPage })))
const AllocationDetailPage = lazy(() => import('@/features/allocations/pages/allocation-detail-page').then((m) => ({ default: m.AllocationDetailPage })))
const EvaluationListPage = lazy(() => import('@/features/evaluations/pages/evaluation-list-page').then((m) => ({ default: m.EvaluationListPage })))
const VariableListPage = lazy(() => import('@/features/variables/pages/variable-list-page').then((m) => ({ default: m.VariableListPage })))
const VariableEditorPage = lazy(() => import('@/features/variables/pages/variable-editor-page').then((m) => ({ default: m.VariableEditorPage })))
const PoliciesPage = lazy(() => import('@/features/administration/pages/policies-page').then((m) => ({ default: m.PoliciesPage })))
const RolesPage = lazy(() => import('@/features/administration/pages/roles-page').then((m) => ({ default: m.RolesPage })))
const TokensPage = lazy(() => import('@/features/administration/pages/tokens-page').then((m) => ({ default: m.TokensPage })))
const NamespacesPage = lazy(() => import('@/features/administration/pages/namespaces-page').then((m) => ({ default: m.NamespacesPage })))
const OptimizePage = lazy(() => import('@/features/optimize/pages/optimize-page').then((m) => ({ default: m.OptimizePage })))
const ExecPage = lazy(() => import('@/features/exec/pages/exec-page').then((m) => ({ default: m.ExecPage })))
const TokenSettingsPage = lazy(() => import('@/features/settings/pages/token-settings-page').then((m) => ({ default: m.TokenSettingsPage })))

function LazyPage({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      }
    >
      {children}
    </Suspense>
  )
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token)
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function withLazy(Component: React.LazyExoticComponent<React.ComponentType>) {
  return (
    <LazyPage>
      <Component />
    </LazyPage>
  )
}

function withErrorBoundary(route: RouteObject): RouteObject {
  const result: RouteObject = { ...route }
  if (result.element) {
    result.element = <ErrorBoundary>{result.element}</ErrorBoundary>
  }
  if (result.children) {
    result.children = result.children.map(withErrorBoundary)
  }
  return result
}

const protectedRoutes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/jobs" replace /> },
      { path: 'jobs', element: withLazy(JobListPage) },
      { path: 'jobs/run', element: withLazy(JobRunPage) },
      { path: 'jobs/:jobId', element: withLazy(JobDetailPage) },
      { path: 'jobs/:jobId/definition', element: withLazy(JobDefinitionPage) },
      { path: 'clients', element: withLazy(ClientListPage) },
      { path: 'clients/:clientId', element: withLazy(ClientDetailPage) },
      { path: 'servers', element: withLazy(ServerListPage) },
      { path: 'servers/:serverId', element: withLazy(ServerDetailPage) },
      { path: 'topology', element: withLazy(TopologyPage) },
      { path: 'storage/volumes', element: withLazy(VolumeListPage) },
      { path: 'storage/volumes/:volumeId', element: withLazy(VolumeDetailPage) },
      { path: 'storage/plugins', element: withLazy(PluginListPage) },
      { path: 'storage/plugins/:pluginId', element: withLazy(PluginDetailPage) },
      { path: 'allocations/:allocId', element: withLazy(AllocationDetailPage) },
      { path: 'evaluations', element: withLazy(EvaluationListPage) },
      { path: 'variables', element: withLazy(VariableListPage) },
      { path: 'variables/:path', element: withLazy(VariableEditorPage) },
      { path: 'variables/new', element: withLazy(VariableEditorPage) },
      { path: 'administration/policies', element: withLazy(PoliciesPage) },
      { path: 'administration/roles', element: withLazy(RolesPage) },
      { path: 'administration/tokens', element: withLazy(TokensPage) },
      { path: 'administration/namespaces', element: withLazy(NamespacesPage) },
      { path: 'optimize', element: withLazy(OptimizePage) },
      { path: 'exec/:jobId', element: withLazy(ExecPage) },
      { path: 'settings/tokens', element: withLazy(TokenSettingsPage) },
    ].map(withErrorBoundary),
  },
]

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <LazyPage>
        <LoginPage />
      </LazyPage>
    ),
  },
  {
    path: '/',
    element: <AuthGuard><Outlet /></AuthGuard>,
    children: protectedRoutes,
  },
], {
  basename: '/ui',
})
