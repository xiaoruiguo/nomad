import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/auth-store'
import { useAuthMethods } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/form'
import { Alert } from '@/components/ui/alert'
import type { ACLAuthMethod } from '@/api/types/acl'

export function LoginPage() {
  const navigate = useNavigate()
  const { setToken, loginWithOIDC, isLoading, error } = useAuthStore()
  const { data: authMethodsData } = useAuthMethods()

  const [token, setTokenValue] = useState('')

  const authMethods = (authMethodsData?.data ?? []) as ACLAuthMethod[]
  const oidcMethods = authMethods.filter((m) => m.Type === 'OIDC')

  const handleTokenLogin = () => {
    if (!token.trim()) return
    setToken(token.trim())
    navigate('/')
  }

  const handleOIDCLogin = (method: ACLAuthMethod) => {
    const redirectUri = `${window.location.origin}/auth/oidc/callback`
    loginWithOIDC(method, redirectUri)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleTokenLogin()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-950">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary-500">
              <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Nomad</h1>
            <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">Sign in to your cluster</p>
          </div>

          {error && (
            <Alert variant="danger" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="space-y-4">
            <Input
              label="Token"
              type="password"
              value={token}
              onChange={(e) => setTokenValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter your ACL token"
              autoFocus
            />

            <Button
              className="w-full"
              onClick={handleTokenLogin}
              disabled={!token.trim()}
              loading={isLoading}
            >
              Sign In
            </Button>

            {oidcMethods.length > 0 && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-neutral-200 dark:border-neutral-800" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white px-2 text-neutral-500 dark:bg-neutral-900 dark:text-neutral-400">or continue with</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {oidcMethods.map((method) => (
                    <Button
                      key={method.Name}
                      variant="secondary"
                      className="w-full"
                      onClick={() => handleOIDCLogin(method)}
                      loading={isLoading}
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01" />
                      </svg>
                      Sign in with {method.Name}
                    </Button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-neutral-400 dark:text-neutral-600">
          HashiCorp Nomad Cluster Management
        </p>
      </div>
    </div>
  )
}
