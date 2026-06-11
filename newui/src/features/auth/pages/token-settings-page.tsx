import { useNavigate } from 'react-router-dom'
import { useSelfToken } from '@/api/hooks'
import { useAuthStore } from '@/stores/auth-store'
import { PageLayout } from '@/components/layout/page-layout'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/ui/copy-button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Alert } from '@/components/ui/alert'
import type { ACLToken } from '@/api/types/acl'

export function TokenSettingsPage() {
  const navigate = useNavigate()
  const { data, isLoading, error } = useSelfToken()
  const clearToken = useAuthStore((s: { clearToken: () => void }) => s.clearToken)

  const token = data?.data as ACLToken | undefined

  const handleLogout = () => {
    clearToken()
    navigate('/login')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !token) {
    return (
      <PageLayout title="Token Settings">
        <Alert variant="danger">
          Unable to load token information. Your token may be invalid or expired.
        </Alert>
        <div className="mt-4">
          <Button variant="danger" onClick={handleLogout}>Log Out</Button>
        </div>
      </PageLayout>
    )
  }

  const isExpired = token.ExpirationTime
    ? new Date(token.ExpirationTime).getTime() < Date.now()
    : false

  return (
    <PageLayout
      title="Token Settings"
      subtitle="Current authentication token details"
      actions={
        <Button variant="danger" onClick={handleLogout}>Log Out</Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
          <h3 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Token Information</h3>
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">Accessor ID</dt>
              <dd className="inline-flex items-center gap-1.5">
                <span className="font-mono text-xs">{token.AccessorID}</span>
                <CopyButton text={token.AccessorID} label="" />
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Name</dt>
              <dd className="font-medium">{token.Name || '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Type</dt>
              <dd>
                <Badge variant={token.Type === 'management' ? 'info' : 'neutral'} size="sm">
                  {token.Type}
                </Badge>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Created</dt>
              <dd>{token.CreateTime ? new Date(token.CreateTime / 1_000_000).toLocaleString() : '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">Expiration</dt>
              <dd>
                {token.ExpirationTime ? (
                  <span className="inline-flex items-center gap-1.5">
                    {new Date(token.ExpirationTime).toLocaleString()}
                    {isExpired && <Badge variant="danger" size="sm">Expired</Badge>}
                  </span>
                ) : (
                  <Badge variant="success" size="sm">Never expires</Badge>
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Policies</h3>
            {token.Policies && token.Policies.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {token.Policies.map((p) => (
                  <Badge key={p} variant="neutral" size="md">{p}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">No policies attached</p>
            )}
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Roles</h3>
            {token.Roles && token.Roles.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {token.Roles.map((r) => (
                  <Badge key={r.Name} variant="neutral" size="md">{r.Name}</Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-neutral-400">No roles attached</p>
            )}
          </div>

          <div className="rounded-lg border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
            <h3 className="mb-4 text-sm font-semibold text-neutral-900 dark:text-neutral-100">Secret ID</h3>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-neutral-500">••••••••••••••••</span>
              {token.SecretID && (
                <CopyButton text={token.SecretID} label="Copy Secret ID" />
              )}
            </div>
            <p className="mt-2 text-xs text-neutral-400">The secret ID is hidden for security. Use the copy button to copy it.</p>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
